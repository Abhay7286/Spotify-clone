console.log("hola amigo");
let currentSong = new Audio();
let songs;
let currFolder;
let previous = document.getElementById("previous");
let play = document.getElementById("play");
let next = document.getElementById("next");

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/songs/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/").slice(-1)[0]);
    }
  }
  
  //show all the songs in the playlist
  let songUL = document
  .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
    songUL.innerHTML +
    `<li> 
    <img src="favicons/music.svg" alt="music" class="invert musicimg">
    <div class="info">
    <div>${song.replaceAll("%20", " ")}</div>
    <div>${currFolder}</div>
    </div>
    
    <div class="playnow">
    <span>Play Now</span>
    <img src="favicons/playbutton.svg" alt="playbutton" class="playimg ">
    </div>
    </li>`;
  }
  
  //Attach an each listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  
  return songs;
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/songs/${currFolder}/${track}`;
  ;
  if (!pause) {
    currentSong.play();
    play.src = "favicons/pause.png";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "0:00/0:00";
};

async function displayAblums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];

      // get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);

      cardContainer.innerHTML += `<div class="card rounded m-1" data-folder="${folder}"> 
      <div class="play">
      <img src="favicons/playbutton.svg" alt="playbutton">
      </div>
      <img src="/songs/${folder}/cover.jpg" alt="${folder}">
      <h3 class="m-1">${response.title}</h3>
      <p>${response.description}</p>
      </div>
      `;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item,"item")
      songs = await getsongs(item.currentTarget.dataset.folder);
      playMusic(songs[0]);
    });
    
  });
}

async function main() {
  await getsongs("JustinBieber");
  playMusic(songs[0], true);

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "favicons/pause.png";
      console.log("changed")
    } 
    else {
      currentSong.pause();
      play.src = "favicons/playbutton.svg";
      console.log("changing");
    }
  });

  displayAblums();

  //listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/ ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.width =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Adding eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.width = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Adding eventlistener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Adding eventlistener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });


  previous.addEventListener("click", ()=> {
    console.log(songs);
    if (songs && songs.length > 0) {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      console.log("Current index:", index);
      
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
      } else {
        playMusic(songs[songs.length - 1]); // Play the last song if at the beginning
      }
    } else {
      console.log("No songs available.");
    }
  });
  
  next.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      console.log("Current index:", index);
      
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      } else {
        playMusic(songs[0]); // Play the first song if at the end
      }
    } else {
      console.log("No songs available.");
    }
  });
  

  document.querySelector(".range").getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
  });
}

main();
