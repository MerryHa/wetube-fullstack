const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector("#commentForm");
const textarea = document.querySelector("#commentForm textarea");
const btn = document.querySelector("#commentForm button");

const handleSubmit = async (e) => {
    e.preventDefault();
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if (text === "") {
        return;
    }
    await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    textarea.value = "";
    window.location.reload(); //async await으로 실시간"처럼" 보이게 해줌
};

form.addEventListener("submit", handleSubmit);
