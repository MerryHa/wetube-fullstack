const video = document.querySelector("video");
const playBtn = document.querySelector("#play");
const playBtnIcon = document.querySelector("#play i");
const muteBtn = document.querySelector("#mute");
const muteBtnIcon = document.querySelector("#mute i");
const volumeRange = document.querySelector("#volume");
const currentTime = document.querySelector("#currentTime");
const totalTime = document.querySelector("#totalTime");
const timeline = document.querySelector("#timeline");
const fullScreenBtn = document.querySelector("#fullScreen");
const fullScreenBtnIcon = document.querySelector("#fullScreen i");
const videoContainer = document.querySelector("#videoContainer");
const videoControls = document.querySelector("#videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;


const playOrStopByPaused = () => {
    if (video.paused) {
        video.play();
        playBtnIcon.classList = "fas fa-pause";
    } else {
        video.pause();
        playBtnIcon.classList = "fas fa-play";
    }
}

const handleKeydown = (event) => {
    const { code } = event;
    if (code !== "Enter" && code !== "Space") {
        return;
    }
    playOrStopByPaused();
}

const handleMuteClick = () => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = event => {
    const { value } = event.target;
    video.volume = value;
    if (video.muted) {
        video.muted = false;
        muteBtn.textContent = "Mute";
    }
    volumeValue = value;
    video.volume = value;
}

const formatTime = ms => new Date(ms * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
    const duration = Math.floor(video.duration);
    totalTime.textContent = formatTime(duration);
    timeline.max = duration;
}

const handlePlay = () => {
    const current = Math.floor(video.currentTime);
    currentTime.textContent = formatTime(current);
    timeline.value = current;
}

const handleTimelineChange = () => {
    video.currentTime = timeline.value;
}

const handleFullscreenClick = () => {
    const fullscreen = document.fullscreenElement;
    fullscreen ? document.exitFullscreen() : videoContainer.requestFullscreen();
}
const handleFullscreenChange = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        fullScreenBtnIcon.classList = "fas fa-compress";
    } else {
        fullScreenBtnIcon.classList = "fas fa-expand";
    }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000);
}

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
}

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    })
}

playBtn.addEventListener("click", playOrStopByPaused);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreenClick);
document.addEventListener("keydown", handleKeydown);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("play", handleLoadedMetadata);
video.addEventListener("timeupdate", handlePlay);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", playOrStopByPaused);
video.addEventListener("ended", handleEnded);
document.addEventListener("fullscreenchange", handleFullscreenChange);