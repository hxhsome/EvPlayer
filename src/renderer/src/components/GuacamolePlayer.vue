<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Guacamole from 'guacamole-common-js'
import { VideoInfo } from '../../../common/types'

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

const handlePlayPause = (): void => {
  console.log('handlePlayPause', recording)
  if (!recording.value.isPlaying()) {
    console.log('play')
    recording.value.play()
  } else {
    console.log('pause')
    recording.value.pause()
  }
}

const handleProgressChange = (value): void => {
  console.log('handleProgressChange:', value)
  const _recording = recording.value
  if (_recording) {
    // Request seek
    _recording.seek(value, () => {
      console.log('complete')
    })
  }
}

const play = (video: VideoInfo): void => {
  nextTick(() => {
    //   const RECORDING_URL = 'http://192.168.186.92:8008/webterminal/read/1738043334845264453-1657527289243-ssh.guac';
    const RECORDING_URL = `file:///${video.path}`
    console.log('RECORDING_URL:', RECORDING_URL)
    const tunnel = new Guacamole.StaticHTTPTunnel(RECORDING_URL)
    const _recording = new Guacamole.SessionRecording(tunnel)
    const recordingDisplay = _recording.getDisplay()
    // displayPlayBack.value = this.$refs.displayPlayBack
    console.log('displayPlayBack:', displayPlayBack, recordingDisplay)
    const children = displayPlayBack.value.children
    if (children.length > 1) {
      displayPlayBack.value.removeChild(children[1])
    }
    displayPlayBack.value.appendChild(recordingDisplay.getElement())
    // Begin downloading the recording
    _recording.connect()
    // If playing, the play/pause button should read "Pause"
    _recording.onplay = (): void => {
      // 暂停
      console.log('暂停')
      playButton.value = '暂停'
    }
    // If paused, the play/pause button should read "Play"
    _recording.onpause = (): void => {
      // 播放
      console.log('播放')
      playButton.value = '播放'
    }
    // Toggle play/pause when display or button are clicked
    displayPlayBack.value.onclick = handlePlayPause
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
    _recording.onseek = (millis): void => {
      // console.log('onseek-millis:', millis);
      percent.value = millis
      position.value = formatTime(millis)
    }
    _recording.onprogress = (millis): void => {
      // console.log('onprogress-millis:', millis);
      max.value = millis
      duration.value = formatTime(millis)
    }
    recording.value = _recording
  })
}
defineExpose({
  play
})
</script>

<template>
  <div id="player">
    <div id="displayPlayBack" ref="displayPlayBack" class="displaybackground">
      <div className="notification-container">
        <div className="seek-notification"></div>
      </div>
    </div>
    <div style="height: 40px; line-height: 35px; width: 99%">
      <el-row style="background-color: rgba(0, 0, 0, 0.8); display: flex;">
        <el-col style="width: 5%"
          ><div>
            <el-tooltip :content="playButton" placement="top"
              ><i :class="playButton === '播放' ? 'play' : 'pause'" @click="handlePlayPause"></i
            ></el-tooltip></div
        ></el-col>
        <el-col style="width: 82%"
          ><div>
            <el-slider
              v-model="percent"
              :max="max"
              :show-tooltip="false"
              @change="handleProgressChange"
            ></el-slider></div
        ></el-col>
        <el-col style="width: 12%; padding-left: 14px"
          ><div>{{ position }}/{{ duration }}</div></el-col
        >
      </el-row>
    </div>
  </div>
</template>

<style lang="less">
// #displayPlayBack {
//   width: 100%;
//   height: 90%;
// }

// #player {
//   width: 100%;
//   height: 100%;
//   margin-top: 100px;
// }

.displaybackground {
  height: 530px;
  background: url('../assets/icons/backgroud-play.png') no-repeat center center;
  background-color: #000000;
  background-size: 45px;
}

#player .notification-container {
  /*position: absolute;*/
  /*z-index: 1;*/
  /*top: 0;*/
  /*right: 0;*/
  /*left: 0;*/
  /*bottom: 0;*/
}

#player .seek-notification {
  color: white;
  background: rgba(0, 0, 0, 0.75);
  display: none; /* Initially hidden */
  width: 100%;
  height: 100%;
}

.play {
  width: 26px;
  height: 26px;
  display: block;
  float: left;
  margin-top: 5px;
  cursor: pointer;
  background: url('../assets/icons/play.png') no-repeat center center;
  background-size: contain;
}
.pause {
  width: 26px;
  height: 26px;
  display: block;
  float: left;
  margin-top: 5px;
  cursor: pointer;
  background: url('../assets/icons/pause.png') no-repeat center center;
  background-size: contain;
}
</style>
