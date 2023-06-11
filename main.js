const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { ExifTool } = require('exiftool-vendored')
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

function createWindow() {
  let win = new BrowserWindow({
    width: 900,
    minWidth: 600,
    height: 500,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
  //win.webContents.openDevTools()

  win.on('close', () => {
    app.quit()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  exiftool.end().then(() => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})

ipcMain.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {
      event.reply('selected-directory', result.filePaths)
    }
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.on('rewrite-metadata', (event, { filePath, dateTimeStr, rowId }) => {
  const [date, time] = dateTimeStr.split(' ')
  const exifDateTimeStr = `${date}T${time}`

  exiftool
    .write(filePath, {
      AllDates: exifDateTimeStr,
      FileCreateDate: exifDateTimeStr,
      'IPTC:DateCreated': date,
      'IPTC:TimeCreated': time,
      FileModifyDate: exifDateTimeStr
    }, ['-overwrite_original'])
    .then(() => {
      event.reply('metadata-rewritten', { rowId, status: 'success' })
    })
    .catch((err) => {
      console.error('An error occurred:', err)
      event.reply('metadata-rewritten', { rowId, status: 'error' })
    })
})
