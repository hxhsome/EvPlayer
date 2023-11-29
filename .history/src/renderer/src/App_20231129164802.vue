<script setup lang="ts">
import { ref, nextTick } from 'vue'
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

const displayPlayBack = ref()
const playButton = ref<string>('')
const position = ref<string>('00:00')
const recording = ref()
const percent = ref<number>(0)
const max = ref<number>(0)
const duration = ref<string>('')

const zeroPad = (num, minLength): string => {
  // Convert provided number to string
  let str = num.toString()
  // Add leading zeroes until string is long enough
  while (str.length < minLength) {
    str = `0${str}`
  }
  return str
}
const formatTime = (millis): string => {
  // Calculate total number of whole seconds
  const totalSeconds = Math.floor(millis / 1000)

  // Split into seconds and minutes
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)

  // Format seconds and minutes as MM:SS
  return `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`
}

const playGuacd = (video: VideoInfo): void => {
  playType.value = 'guacamole'
  console.log('playGuacd', video)
  nextTick(() => {
    //   const RECORDING_URL = 'http://192.168.186.92:8008/webterminal/read/1738043334845264453-1657527289243-ssh.guac';
    const RECORDING_URL = `file://${video.path}`
    console.log('RECORDING_URL:', RECORDING_URL)
    const tunnel = new Guacamole.StaticHTTPTunnel(RECORDING_URL)
    const recording = new Guacamole.SessionRecording(tunnel)
    const recordingDisplay = recording.getDisplay()
    // displayPlayBack.value = this.$refs.displayPlayBack
    console.log('displayPlayBack:', displayPlayBack)
    displayPlayBack.value.appendChild(recordingDisplay.getElement())
    // Begin downloading the recording
    recording.connect()
    // If playing, the play/pause button should read "Pause"
    recording.onplay = (): void => {
      // 暂停
      console.log('暂停')
      playButton.value = '暂停'
    }
    // If paused, the play/pause button should read "Play"
    recording.onpause = (): void => {
      // 播放
      console.log('播放')
      playButton.value = '播放'
    }
    // Toggle play/pause when display or button are clicked
    displayPlayBack.value.onclick = (): void => {
      console.log('handlePlayPause')
      if (!recording.value.isPlaying()) {
        console.log('play')
        recording.value.play()
      } else {
        console.log('pause')
        recording.value.pause()
      }
    }
    // Fit display within containing div
    recordingDisplay.onresize = (width): void => {
      console.log('recordingDisplay-onresize')
      // Do not scale if display has no width
      if (!width) {
        return
      }
      // Scale display to fit width of container
      //   recordingDisplay.scale(display.offsetHeight / height);
      recordingDisplay.scale(displayPlayBack.value.offsetWidth / width)
    }
    position.value = '00:00'
    percent.value = 0
    recording.onseek = (millis): void => {
      // console.log('onseek-millis:', millis);
      percent.value = millis
      position.value = formatTime(millis)
    }
    recording.onprogress = (millis): void => {
      // console.log('onprogress-millis:', millis);
      max.value = millis
      duration.value = formatTime(millis)
    }
    recording.value = recording
  })
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
        <!-- <div className="notification-container">
          <div className="seek-notification"></div>
        </div> -->
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

.displaybackground {
  height: 530px;
  background-color: #000000;
  background-size: 45px;
}
</style>
