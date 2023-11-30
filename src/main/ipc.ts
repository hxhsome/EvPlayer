import { ipcMain, BrowserWindow, dialog } from 'electron'
import { store } from './store'
import { saveBase64Image, readFile } from './fs'
import { setWindowJumpList, setMacOSRecentDocuments } from './history'
import { getVideoFromPath, getVideoExtensions } from './utils'
import { VideoFile, VideoInfo } from '../common/types'
import { IpcEvents } from '../common/ipcEvents'

const register = (): void => {
  ipcMain.on(IpcEvents.EV_SHOW_OPEN_DIALOG, async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    win!.focus()
    dialog
      .showOpenDialog(win!, {
        title: 'Select Videos',
        properties: ['openFile', 'multiSelections'],
        filters: [{ extensions: getVideoExtensions(false), name: 'Video' }]
      })
      .then((re) => {
        console.log('ipc-re', re)
        if (!re.canceled) {
          const videoFiles: VideoFile[] = []
          re.filePaths.forEach((p) => {
            const file = getVideoFromPath(p)
            console.log('ipc-file', file)
            const readFileRes = readFile(file)
            console.log('readFileRes', readFileRes.substring(0, 100))
            if (file) videoFiles.push(file)
          })
          e.sender.send(IpcEvents.EV_PLAY, videoFiles)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  })

  ipcMain.on(IpcEvents.EV_ADD_VIDEOS, (e, videos: VideoInfo[]) => {
    const paths = videos.map((v) => v.path)
    console.log('ipc-paths', paths)
    let list = store.get('playlist')
    console.log('ipc-playlist', list)
    list = list.filter((v) => !paths.includes(v.path))
    console.log('ipc-videos', list)
    console.log('ipc-list', list)
    list = videos.concat(list)

    videos.forEach((v) => {
      const savePath = saveBase64Image(v.poster)
      v.poster = savePath
    })

    if (list.length > 10) list = list.slice(0, 10)
    store.set('playlist', list)

    setWindowJumpList(list)
    setMacOSRecentDocuments(list)
    console.log('ipc-EV_ADD_VIDEOS', list)

    e.reply(IpcEvents.EV_ADD_VIDEOS, list)
  })

  ipcMain.handle(IpcEvents.EV_GET_PLAYLIST, () => {
    return store.get('playlist')
  })
}

export default { register }
