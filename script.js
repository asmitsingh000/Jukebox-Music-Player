const DEFAULT_SONGS = [
    { name: "Ben 10 Theme (Hindi)", src: "songs/Ben_10_(2005)_-_theme_song_(Hindi).mp3" }
];

const library = {
    default: [...DEFAULT_SONGS],
    new: []
};

let currentTab = "default";
let currentSong = null;
let isShuffle = false;
let repeatMode = "off";
let isMuted = "off";
let shufflePlayed = [];

const repeatLabels = { off: "OFF", all: "ALL", one: "ONE" };
const audio = document.getElementById("audio");
const musicName = document.getElementById("musicName");
const disc = document.getElementById("disc");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const addFileBtn = document.getElementById("addFileBtn");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const tabs = document.querySelectorAll(".tab");
const modeBtn = document.getElementById("modeBtn");
const modeMenu = document.getElementById("modeMenu");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");


function renderList() {
    songList.innerHTML = "";
    const songs = library[currentTab];

    if (songs.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = currentTab === "new"
            ? "add new file +Add File "
            : "There is no default song";
        songList.appendChild(li);
        return;
    }

    songs.forEach((song) => {
        const li = document.createElement("li");
        li.textContent = song.name;
        if (song === currentSong) li.classList.add("active");
        li.addEventListener("click", () => playSong(song));
        songList.appendChild(li);
    });
}
function playSong(song) {
    currentSong = song;
    audio.src = song.src;
    musicName.textContent = song.name;
    audio.play().catch((err) => console.log("Play error:", err));
    renderList();
}

function togglePlay() {
    if (!currentSong) {
        const songs = library[currentTab];
        if (songs.length > 0) playSong(songs[0]);
        return;
    }

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}
function nextSong(fromEnded = false) {
    const songs = library[currentTab];
    if (songs.length === 0) return;

    if (fromEnded && repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    let nextSongObj;

    if (isShuffle) {
        let remaining = songs.filter((s) => !shufflePlayed.includes(s));

        if (remaining.length === 0) {
            if (fromEnded && repeatMode === "off") {
                audio.pause();
                return;
            }
            shufflePlayed = [];
            remaining = songs.filter((s) => s !== currentSong);
            if (remaining.length === 0) remaining = songs;
        }

        nextSongObj = remaining[Math.floor(Math.random() * remaining.length)];
        shufflePlayed.push(nextSongObj);
    } else {
        let nextIndex = songs.indexOf(currentSong) + 1;

        if (nextIndex >= songs.length) {
            if (fromEnded && repeatMode === "off") {
                audio.pause();
                return;
            }
            nextIndex = 0;
        }
        nextSongObj = songs[nextIndex];
    }

    playSong(nextSongObj);
}

function prevSong() {
    const songs = library[currentTab];
    if (songs.length === 0) return;
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    const index = songs.indexOf(currentSong);
    const prevIndex = (index - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
}

function updatePlayUI(isPlaying) {
    playIcon.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
    disc.classList.toggle("spin", isPlaying);
}

function updateModeUI() {
    shuffleBtn.textContent = `Shuffle: ${isShuffle ? "ON" : "OFF"}`;
    shuffleBtn.classList.toggle("on", isShuffle);

    repeatBtn.textContent = `Repeat: ${repeatLabels[repeatMode]}`;
    repeatBtn.classList.toggle("on", repeatMode !== "off");

    muteBtn.textContent = `Mute: ${isMuted ? "ON" : "OFF"}`;
    muteBtn.classList.toggle("on", isMuted);


    modeBtn.classList.toggle("active", isShuffle || repeatMode !== "off"||isMuted);
}

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", () => nextSong(false));
prevBtn.addEventListener("click", prevSong);

modeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    modeMenu.hidden = !modeMenu.hidden;
});
muteBtn.addEventListener("click",()=>{
    isMuted = !isMuted;
    audio.muted = isMuted;
    updateModeUI();
})
document.addEventListener("click", (e) => {
    if (!modeMenu.contains(e.target) && e.target !== modeBtn) {
        modeMenu.hidden = true;
    }
});

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shufflePlayed = currentSong ? [currentSong] : [];
    updateModeUI();
});
repeatBtn.addEventListener("click", () => {
    if (repeatMode === "off") repeatMode = "all";
    else if (repeatMode === "all") repeatMode = "one";
    else repeatMode = "off";
    updateModeUI();
});
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        currentTab = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        renderList();
    });
});
addFileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
        const name = file.name.replace(/\.[^/.]+$/, "");
        library.new.push({
            name: name,
            src: URL.createObjectURL(file)
        });
    });

    currentTab = "new";
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === "new"));

    renderList();
    fileInput.value = "";
});

audio.addEventListener("play", () => updatePlayUI(true));
audio.addEventListener("pause", () => updatePlayUI(false));
audio.addEventListener("ended", () => nextSong(true));

renderList();
updateModeUI();