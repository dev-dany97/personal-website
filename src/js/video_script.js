/*!
* Start Bootstrap - Website v7.0.4 (https://d-mohles.de/)
* Copyright 2013-2023 Daniel Mohles
* Licensed under MIT (https://github.com/StartBootstrap/my-website/blob/master/LICENSE)
*/
//
// Scripts
// 

document.getElementById('video-container').addEventListener('mouseenter', function() {
    var video = document.getElementById('my-video');
    if (video.paused) {
        video.play();
    }
});

document.getElementById('video-container').addEventListener('mouseleave', function() {
    var video = document.getElementById('my-video');
    video.pause();
});
