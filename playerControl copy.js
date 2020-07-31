const btnBackward = document.querySelector('.btn-backward');
// const btnExpand = document.querySelector('.btn-expand');
const btnMute = document.querySelector('.btn-mute');
const btnPlay = document.querySelector('.btn-play');
const btnForward = document.querySelector('.btn-forward');
const btnReset = document.querySelector('.btn-reset');
const btnStop = document.querySelector('.btn-stop');
const progressBar = document.querySelector('.progress-bar');
const videoElement = document.querySelector('.video-element');
// var videoElement = document.querySelector('.video-element');

// // Toggle full-screen mode
// const expandVideo = () => {
//   if (videoElement.requestFullscreen) {
//     videoElement.requestFullscreen();
//   } else if (videoElement.mozRequestFullScreen) {
//     // Version for Firefox
//     videoElement.mozRequestFullScreen();
//   } else if (videoElement.webkitRequestFullscreen) {
//     // Version for Chrome and Safari
//     videoElement.webkitRequestFullscreen();
//   }
// }

// Move the video backward for 5 seconds
const moveBackward = () => {
  videoElement.currentTime -= 5;
  Log("vid:moveBackward")
}

// Move the video forward for 5 seconds
const moveForward = () => {
  videoElement.currentTime += 5;
  Log("vid:moveForward")
}

// Mute the video
const muteVideo = () => {
  if (videoElement.muted) {
    videoElement.muted = false;

    btnMute.children[0].classList.remove('fa-volume-up');
    btnMute.children[0].classList.add('fa-volume-off');
  } else {
    videoElement.muted = true;

    btnMute.children[0].classList.remove('fa-volume-off');
    btnMute.children[0].classList.add('fa-volume-up');
  }
}

// Play / Pause the video
const playPauseVideo = () => {
  if (videoElement.paused) {
    videoElement.play();

    btnPlay.children[0].classList.remove('fa-play');
    btnPlay.children[0].classList.add('fa-pause');
    Log("vid:play")
  } else {
    videoElement.pause();

    btnPlay.children[0].classList.remove('fa-pause');
    btnPlay.children[0].classList.add('fa-play');
    Log("vid:pause")
  }
}
const pauseVideo = () => {
  if (videoElement.play) {
    videoElement.pause();

    btnPlay.children[0].classList.remove('fa-pause');
    btnPlay.children[0].classList.add('fa-play');
    Log("vid:pause")
  }
}
const playVideo = () => {
  if (videoElement.paused) {
    videoElement.play();

    btnPlay.children[0].classList.remove('fa-play');
    btnPlay.children[0].classList.add('fa-pause');
    Log("vid:play")
  }
}
// Restart the video
const restartVideo = () => {
  videoElement.currentTime = 0;

  btnPlay.removeAttribute('hidden');
  btnReset.setAttribute('hidden', 'true');
}

// Stop the video
const stopVideo = () => {
  videoElement.pause();
  videoElement.currentTime = 0;
  btnPlay.children[0].classList.remove('fa-pause');
  btnPlay.children[0].classList.add('fa-play');
}

// Update progress bar as the video plays
const updateProgress = () => {
  // Calculate current progress
  let value = (100 / videoElement.duration) * videoElement.currentTime;

  // Update the slider value
  // progressBar.attributes["aria-valuenow"] = value;
  progressBar.style.width = value + '%';
}
$('.progress').click(function () {
  var percent = event.offsetX / this.offsetWidth;
  Log("vid:progress" + (percent * videoElement.duration))
  videoElement.currentTime = percent * videoElement.duration;
  progressBar.style.width = percent * 100 + '%';

})
// Event listeners
btnBackward.addEventListener('click', moveBackward, false);
// btnExpand.addEventListener('click', expandVideo, false);
btnMute.addEventListener('click', muteVideo, false);
btnPlay.addEventListener('click', playPauseVideo, false);
btnForward.addEventListener('click', moveForward, false);
btnReset.addEventListener('click', restartVideo, false);
btnStop.addEventListener('click', stopVideo, false);
// progressBar.addEventListener('click', seek);
videoElement.addEventListener('ended', () => {
  btnPlay.setAttribute('hidden', 'true');
  btnReset.removeAttribute('hidden');
}, false);
videoElement.addEventListener('timeupdate', updateProgress, false);
videoElement.addEventListener('mousedown', playPauseVideo, false);