import { VideoInfo } from '../../common/types';
import Guacamole from 'guacamole-common-js';
import { playType, displayPlayBack, playButton, position } from './App.vue';

export const playGuacd = (video: VideoInfo): void => {
playType.value = 'guacamole';
console.log('playGuacd', video);
//   const RECORDING_URL = 'http://192.168.186.92:8008/webterminal/read/1738043334845264453-1657527289243-ssh.guac';
const RECORDING_URL = `file:///${video.path}`;
console.log('RECORDING_URL:', RECORDING_URL);
const tunnel = new Guacamole.StaticHTTPTunnel(RECORDING_URL);
const recording = new Guacamole.SessionRecording(tunnel);
const recordingDisplay = recording.getDisplay();
// displayPlayBack.value = this.$refs.displayPlayBack
console.log('displayPlayBack:', displayPlayBack);
displayPlayBack.value.appendChild(recordingDisplay.getElement());
// Begin downloading the recording
recording.connect();
// If playing, the play/pause button should read "Pause"
recording.onplay = () => {
// 暂停
console.log('暂停');
playButton.value = '暂停';
};
// If paused, the play/pause button should read "Play"
recording.onpause = () => {
// 播放
console.log('播放');
playButton.value = '播放';
};
// Toggle play/pause when display or button are clicked
displayPlayBack.value.onclick = () => {
console.log('handlePlayPause');
if (!recording.isPlaying()) {
console.log('play');
recording.play();
} else {
console.log('pause');
recording.pause();
}
};
// Fit display within containing div
recordingDisplay.onresize = (width) => {
console.log('recordingDisplay-onresize');
// Do not scale if display has no width
if (!width) {
return;
}
// Scale display to fit width of container
//   recordingDisplay.scale(display.offsetHeight / height);
recordingDisplay.scale(displayPlayBack.value.offsetWidth / width);
};
position.value = '00:00';
this.percent = 0;
recording.onseek = (millis) => {
// console.log('onseek-millis:', millis);
this.percent = millis;
position.value = this.formatTime(millis);
};
recording.onprogress = (millis) => {
// console.log('onprogress-millis:', millis);
this.max = millis;
this.duration = this.formatTime(millis);
};
this.recording = recording;
};
