const form = document.querySelector("#upload-form");
const titleInput = document.querySelector("#title-input");
const fileInput = document.querySelector("#file-input");
const urlInput = document.querySelector("#url-input");
const fileButton = document.querySelector("#file-button");
const fileName = document.querySelector("#file-name");
const list = document.querySelector("#video-list");
const count = document.querySelector("#video-count");
const error = document.querySelector("#form-error");

const videos = [];
let hasUploaded = false;
const votedIds = new Set();

const updateCount = () => {
  count.textContent = String(videos.length);
};

const clearError = () => {
  error.textContent = "";
};

const showError = (message) => {
  error.textContent = message;
};

fileButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  fileName.textContent = fileInput.files[0]?.name ?? "No file selected";
});

const lockUploadForm = () => {
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Already uploaded";
  submitBtn.style.opacity = "0.5";
  submitBtn.style.cursor = "not-allowed";
  titleInput.disabled = true;
  fileButton.disabled = true;
  fileButton.style.opacity = "0.5";
  fileButton.style.cursor = "not-allowed";
  urlInput.disabled = true;
  showError("You have already submitted a video.");
};

const createVideoCard = (video) => {
  const wrapper = document.createElement("article");
  wrapper.className = "video-card";
  wrapper.dataset.videoId = video.id;

  const title = document.createElement("h3");
  title.textContent = video.title;

  const meta = document.createElement("div");
  meta.className = "video-meta";
  meta.textContent = video.sourceLabel;

  const player = document.createElement("video");
  player.controls = true;
  player.src = video.src;
  player.preload = "metadata";

  const voteRow = document.createElement("div");
  voteRow.className = "vote-row";

  const voteButton = document.createElement("button");
  voteButton.className = "vote-button";
  voteButton.type = "button";

  const alreadyVoted = votedIds.has(video.id);
  voteButton.textContent = alreadyVoted ? "Voted" : "Vote";
  if (alreadyVoted) {
    voteButton.disabled = true;
    voteButton.style.opacity = "0.5";
    voteButton.style.cursor = "not-allowed";
  }

  const voteCount = document.createElement("span");
  voteCount.className = "vote-count";
  voteCount.textContent = `${video.votes} votes`;

  voteButton.addEventListener("click", () => {
    if (votedIds.has(video.id)) return;
    votedIds.add(video.id);
    video.votes += 1;
    renderVideos(video.id);
  });

  voteRow.append(voteButton, voteCount);
  wrapper.append(title, meta, player, voteRow);
  return wrapper;
};

const renderVideos = (highlightId = "") => {
  list.innerHTML = "";
  [...videos]
    .sort((a, b) => b.votes - a.votes)
    .forEach((video) => {
      list.append(createVideoCard(video));
    });
  updateCount();

  if (highlightId) {
    const highlighted = list.querySelector(
      `[data-video-id="${highlightId}"] .vote-button`
    );
    if (highlighted) {
      highlighted.classList.add("vote-animate");
      highlighted.addEventListener(
        "animationend",
        () => {
          highlighted.classList.remove("vote-animate");
        },
        { once: true }
      );
    }
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  if (hasUploaded) {
    showError("You have already submitted a video.");
    return;
  }

  const title = titleInput.value.trim();
  const file = fileInput.files[0];
  const url = urlInput.value.trim();

  if (!title) {
    showError("Please add a title.");
    return;
  }

  if (!file && !url) {
    showError("Please upload a video file or add a video URL.");
    return;
  }

  if (file && url) {
    showError("Please choose either a file or a URL, not both.");
    return;
  }

  const video = {
    id: crypto.randomUUID(),
    title,
    votes: 0,
    src: "",
    sourceLabel: "",
  };

  if (file) {
    video.src = URL.createObjectURL(file);
    video.sourceLabel = `Uploaded file · ${file.name}`;
  } else {
    video.src = url;
    video.sourceLabel = "Linked video";
  }

  videos.unshift(video);
  hasUploaded = true;
  renderVideos();
  lockUploadForm();

  form.reset();
  fileName.textContent = "No file selected";
});

renderVideos();
