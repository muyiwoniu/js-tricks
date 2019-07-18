# 视频播放相关

下面的 v 为video的dom对象：

- v.volume，读取或设置视频音量
- v.duration，读取视频总时长，单位秒
- v.currentTime，读取或设置视频的当前播放时间，单位秒
- v.playbackRate，读取或设置视频的播放速率，1为1倍速度播放
- v.play，函数，播放
- v.pause，函数，暂停
- v.ontimeupdate，事件，当视频的当前播放时间发生变化时触发
- v.ondurationchange，事件，当视频总时长发生变化时触发

# 全屏相关

- document.fullscreen，返回当前是否是全屏状态
- dom.onfullscreenchange，事件，当dom对象的全屏状态改变时触发
- dom.exitFullscreen，函数，退出全屏
- dom.requestFullscreen，函数，全屏现实dom对象