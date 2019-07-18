var container = document.querySelector(".container");
var v = document.querySelector(".video-elm");
var divModal = document.querySelector(".video-modal");
var playBig = document.querySelector(".icon-bofang1");
var playSmall = document.querySelector(".icon-bofang");
var spanTotal = document.querySelector("#total");
var spanCur = document.querySelector("#curtime");
var total = 0; //总时长：秒
var bar = document.querySelector(".vol input");
var videobar = document.querySelector(".video-bar");
var speeddivs = document.querySelectorAll("[data-speed]")
var slider = document.querySelector(".slider");
var rangeBg = document.querySelector(".range-bg");
var range = document.querySelector(".range");
var full = document.querySelector(".full");
v.volume = bar.value / 100;
videobar.addEventListener("click", function (e) {
    e.stopPropagation();
})
var canHideBarOnFull = false;

divModal.onmousemove = function (e) {
    if (document.fullscreen) {
        divModal.style.cursor = "pointer";
        videobar.style.display = "flex";
        hideBar();
    }
}
container.onfullscreenchange = function () {
    if (document.fullscreen) {
        hideBar();
    }
    else {
        divModal.style.cursor = "pointer";
        videobar.style.display = "";
        clearTimeout(timer);
    }
}
var timer = null;
function hideBar() {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        divModal.style.cursor = "none";
        videobar.style.display = "none";
    }, 2000);
}

full.onclick = function () {
    if (document.fullscreen) {
        document.exitFullscreen();
        full.classList.add("icon-quanping");
        full.classList.remove("icon-compress");
    }
    else {
        container.requestFullscreen();
        full.classList.remove("icon-quanping");
        full.classList.add("icon-compress");
    }
}

divModal.onclick = playSmall.onclick = function (e) {
    if (v.paused) {
        play();
    }
    else {
        pause();
    }
}

setSpeed(1);

for (const div of speeddivs) {
    div.onclick = function () {
        var sp = parseFloat(div.dataset.speed);
        setSpeed(sp);
    }
}

bar.onchange = function () {
    v.volume = bar.value / 100;
}
bar.onmousedown = function (e) {
    if (e.button !== 0) {
        return;
    }
    v.volume = bar.value / 100;
    bar.onmousemove = function () {
        v.volume = bar.value / 100;
    }

    bar.onmouseleave = bar.onmouseup = function () {
        bar.onmousemove = undefined;
    }
}

v.ondurationchange = function () {
    total = v.duration;
    spanTotal.innerHTML = readableTime(total);
    setCur();
}

v.ontimeupdate = function () {
    setCur();
}

function resetRange(e) {
    var rect = range.getBoundingClientRect();
    var offX = e.pageX - rect.left;
    var sec = offX / rect.width * total;
    v.currentTime = sec;
    setCur();
}

range.onmousedown = function (e) {
    if (e.button !== 0) {
        return;
    }
   
    resetRange(e);
    divModal.onmousemove = function (e) {
        resetRange(e);
    }
    divModal.onmouseup = divModal.onmouseleave = function () {
        divModal.onmousemove = undefined;
    }
}

function setCur() {
    spanCur.innerHTML = readableTime(v.currentTime);
    var percent = v.currentTime / total * 100;
    rangeBg.style.width = percent + "%";
    slider.style.left = percent + "%";
}

function readableTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var sec = Math.floor(seconds - minutes * 60);
    return `${minutes < 10 ? "0" + minutes : minutes}:${sec < 10 ? "0" + sec : sec}`;
}

function play() {
    v.play();
    divModal.classList.add("video-hidden");
    playBig.classList.add("video-hidden");
    playSmall.classList.remove("icon-bofang");
    playSmall.classList.add("icon-zanting");
}
function pause() {
    v.pause();
    divModal.classList.remove("video-hidden");
    playBig.classList.remove("video-hidden");
    playSmall.classList.remove("icon-zanting");
    playSmall.classList.add("icon-bofang");
}

function setSpeed(speed) {
    v.playbackRate = speed;
    for (const div of speeddivs) {
        div.className = "";
        var sp = parseFloat(div.dataset.speed);
        if (sp === speed) {
            div.className = "active";
        }
    }
}