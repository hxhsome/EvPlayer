<script setup lang="ts">
import { ref, nextTick } from 'vue'
import rrwebPlayer from 'rrweb-player'
import { VideoInfo } from '../../../common/types'
import fs from 'fs'
const current_evevnts = ref([]) // rrweb播放视频的event数组
const videoFootAge = (video: VideoInfo): void => {
  console.log(video)
}
const play = (video: VideoInfo): void => {
  nextTick(() => {
    console.log(video)
    videoFootAge(video)
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
