<script setup lang="ts">
import { ref } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Player from './components/Player.vue'
import Playlist from './components/Playlist.vue'
import useIpcRendererOn from './hook/useIpcRendererOn'
import { getVideoInfoList } from './utils/video'

import { VideoFile, VideoInfo } from '../../common/types'
import { IpcEvents } from '../../common/ipcEvents'
import Guacamole from 'guacamole-common-js'

const player = ref<InstanceType<typeof Player> | null>(null)
const playlist = ref<InstanceType<typeof Playlist> | null>(null)
const videoName = ref<string>('')
const playType = ref('video')
const togglePlaylist = (): void => {
  playlist.value?.toggle()
}

const playVideo = (video: VideoInfo): void => {
  playType.value = 'video'
  videoName.value = video.name
  player.value?.play(video)
}

const playWebdb = (video: VideoInfo): void => {
  playType.value = 'webdb'
  console.log('playWebdb', video)
}

const playGuacd = (video: VideoInfo): void => {
  playType.value = 'guacamole'
  console.log('playGuacd', video)
  //   const RECORDING_URL = 'http://192.168.186.92:8008/webterminal/read/1738043334845264453-1657527289243-ssh.guac';
  const RECORDING_URL = `file:///${video.path}`
  console.log('RECORDING_URL:', RECORDING_URL)
  const tunnel = new Guacamole.StaticHTTPTunnel(RECORDING_URL)
  const recording = new Guacamole.SessionRecording(tunnel)
  const recordingDisplay = recording.getDisplay()
  const displayPlayBack = this.$refs.displayPlayBack
  console.log('displayPlayBack:', displayPlayBack)
  displayPlayBack.appendChild(recordingDisplay.getElement())
  // Begin downloading the recording
  recording.connect()
  // If playing, the play/pause button should read "Pause"
  recording.onplay = () => {
    // 暂停
    console.log('暂停')
    this.playButton = '暂停'
  }
  // If paused, the play/pause button should read "Play"
  recording.onpause = () => {
    // 播放
    console.log('播放')
    this.playButton = '播放'
  }
  // Toggle play/pause when display or button are clicked
  displayPlayBack.onclick = this.handlePlayPause
  // Fit display within containing div
  recordingDisplay.onresize = function displayResized(width) {
    console.log('recordingDisplay-onresize')
    // Do not scale if display has no width
    if (!width) {
      return
    }
    // Scale display to fit width of container
    //   recordingDisplay.scale(display.offsetHeight / height);
    recordingDisplay.scale(displayPlayBack.offsetWidth / width)
  }
  this.position = '00:00'
  this.percent = 0
  recording.onseek = (millis) => {
    // console.log('onseek-millis:', millis);
    this.percent = millis
    this.position = this.formatTime(millis)
  }
  recording.onprogress = (millis) => {
    // console.log('onprogress-millis:', millis);
    this.max = millis
    this.duration = this.formatTime(millis)
  }
  this.recording = recording
}

useIpcRendererOn(IpcEvents.EV_PLAY, async (_, videos: VideoFile[]) => {
  console.log('appVue-EV_PLAY', videos)
  // 以下 getVideoInfoList 是对历史展示的时候，显示的图片的处理，暂时没有用，注释掉
  // const videoInfoList = await getVideoInfoList(videos)
  // console.log('appVue-EV_PLAY-videoInfoList', videoInfoList)
  // window.electron.ipcRenderer.send(IpcEvents.EV_ADD_VIDEOS, videoInfoList)
  window.electron.ipcRenderer.send(IpcEvents.EV_ADD_VIDEOS, videos)
})

useIpcRendererOn(IpcEvents.EV_PAUSE, () => {
  player.value?.pause()
})
</script>

<template>
  <TitleBar :title="videoName" @toggle-playlist="togglePlaylist"></TitleBar>
  <div class="main">
    <p v-if="playType === 'webdb'">webdb</p>
    <!-- <p v-else-if="playType === 'guacamole'">guacamole</p> -->
    <div v-else-if="playType === 'guacamole'" id="player">
      <div id="displayPlayBack" ref="displayPlayBack" class="displaybackground">
        <div className="notification-container">
          <div className="seek-notification"></div>
        </div>
      </div>
    </div>
    <Player v-else ref="player"></Player>
    <Playlist ref="playlist" @click="playVideo" @playWebdb="playWebdb" @playGuacd="playGuacd">
    </Playlist>
  </div>
</template>

<style lang="less">
@import './assets/css/styles.less';
@import './assets/font/codicon.less';

.main {
  flex: 1;
  display: flex;
}
</style>
