const video = document.querySelector("video");
const playBtn = document.querySelector("#play");
const muteBtn = document.querySelector("#mute");
const volumeRange = document.querySelector("#volume");
const currentTime = document.querySelector("#currentTime");
const totalTime = document.querySelector("#totalTime");
const timeline = document.querySelector("#timeline");
const fullScreenBtn = document.querySelector("#fullScreen");
const videoContainer = document.querySelector("#videoContainer");
const videoControls = document.querySelector("#videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;


const handlePlayClick = () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtn.textContent = video.paused ? "Play" : "Pause";
};
const handleMuteClick = () => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtn.textContent = video.muted ? "Unmute" : "Mute";
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
const formatTime = ms => new Date(ms * 1000).toISOString().substr(11, 8);
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
const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenBtn.textContent = "Enter FullScreen";
        //esc버튼으로 나가면 텍스트가 안변하는 버그 존재
    } else {
        videoContainer.requestFullscreen();
        fullScreenBtn.textContent = "Exit Fullscreen";
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

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handlePlay);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);