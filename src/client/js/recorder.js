const startBtn = document.querySelector("#startBtn");
const video = document.querySelector("#preview");
let stream;
let recorder;
let videoFile;

const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "MyRecording.mp4";
    document.body.appendChild(a);
    a.click();
};
const handleStop = () => {
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);

    startBtn.textContent = "Download Recording"
    recorder.stop();
}
const handleStart = () => {
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);

    startBtn.textContent = "Stop Recording";
    recorder = new MediaRecorder(stream, { MimeType: "video/mp4" });
    recorder.ondataavailable = (e) => {
        videoFile = URL.createObjectURL(e.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });
    video.srcObject = stream;
    video.play();
}
init();

startBtn.addEventListener("click", handleStart);