const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector("#commentForm");
const btn = document.querySelector("#commentForm button");
const removeBtn = document.querySelector("#removeBtn");
const videoComments = document.querySelector(".video__comments ul");

const addComment = (text, id) => {
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id = id;
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.textContent = `  ${text}`;
    const span2 = document.createElement("span");
    span2.className = "remove";
    span2.textContent = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
}
const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = document.querySelector("#commentForm textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if (text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    if (response.status === 201) {
        textarea.value = "";
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
    }
};
const handleRemove = async (event) => {
    if (event.target.className !== "remove") {
        return;
    }
    const videoId = videoContainer.dataset.id;
    const li = event.target.parentNode;
    const commentId = li.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: "DELETE",
        body: videoId,
    });
    if (response.status === 200) {
        videoComments.removeChild(li);
    }
};

form.addEventListener("submit", handleSubmit);
videoComments.addEventListener("click", handleRemove);
