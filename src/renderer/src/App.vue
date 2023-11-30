<script setup lang="ts">
import { ref, nextTick } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Player from './components/Player.vue'
import GuacamolePlayer from './components/GuacamolePlayer.vue'
import Playlist from './components/Playlist.vue'
import useIpcRendererOn from './hook/useIpcRendererOn'
import { getVideoInfoList } from './utils/video'

import { VideoFile, VideoInfo } from '../../common/types'
import { IpcEvents } from '../../common/ipcEvents'

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
  nextTick(() => {
    player.value?.play(video)
  })
}

const playWebdb = (video: VideoInfo): void => {
  playType.value = 'webdb'
  videoName.value = video.name
  console.log('playWebdb', video)
}

const guacPlayer = ref<InstanceType<typeof GuacamolePlayer> | null>(null)
const playGuacd = (video: VideoInfo): void => {
  playType.value = 'guacamole'
  videoName.value = video.name
  console.log('playGuacd', video)
  nextTick(() => {
    guacPlayer.value?.play(video)
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
    <guacamole-player v-else-if="playType === 'guacamole'" ref="guacPlayer"></guacamole-player>
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

#displayPlayBack {
  width: 800px;
  height: 600px;
}

#player {
  width: 100%;
  height: 100%;
  margin-top: 100px;
}
</style>
