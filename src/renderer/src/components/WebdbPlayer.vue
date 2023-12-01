<script setup lang="ts">
import { ref, nextTick } from 'vue'
import rrwebPlayer from 'rrweb-player'
import { VideoInfo } from '../../../common/types'
// import { readFile } from '../../../main/fs'
const current_evevnts = ref([]) // rrweb播放视频的event数组
const play = (video: VideoInfo): void => {
  nextTick(() => {
    console.log('webdb-play-video', video)
    // const data = readFile(video.path)
    // console.log('webdb-play-data',3 data.substring(0, 100))
    videoFootAge(video)
  })
}
const videoFootAge = (video: VideoInfo): void => {
  const events = video.data
  const lines = events.split('\n')
  lines.forEach((line) => {
    try {
      current_evevnts.value.push(JSON.parse(line))
    } catch (e) {
      console.log(e)
    }
  })
  startPlayer()
}
const player = ref<rrwebPlayer>()
// 创建视频对象并播放
const startPlayer = (): void => {
  // eslint-disable-next-line new-cap
  player.value = new rrwebPlayer({
    target: document.getElementById('historyVideo'),
    props: {
      events: current_evevnts.value,
      // liveMode: true,
      autoPlay: true,
      // mouseTail: false,
      height: 460,
      width: 630
      // showController: false // 是否显示播放器控制 UI
    }
  })
}
defineExpose({
  play
})
</script>

<template>
  <div id="historyVideo" style="padding: 10px" class="detailedVideo" @contextmenu.prevent></div>
</template>

<style lang="less"></style>
