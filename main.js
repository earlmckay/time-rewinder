const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { ExifTool } = require('exiftool-vendored')
const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })

function createWindow() {
  let win = new BrowserWindow({
    width: 900,
    minWidth: 600,
    height: 700,
    minHeight: 700,
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
    title: 'Wähle Dateien und/oder Ordner aus',
    properties: ['openFile', 'openDirectory', 'multiSelections']
  }).then(result => {
    if (!result.canceled) {
      event.reply('selected-directory', result.filePaths)
    }
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.on('rewrite-metadata', (event, { filePath, metadata, rowId }) => {
  const exifMetadata = {
    AllDates: metadata.AllDates,
    FileCreateDate: metadata.FileCreateDate,
    'IPTC:DateCreated': metadata['IPTC:DateCreated'],
    'IPTC:TimeCreated': metadata['IPTC:TimeCreated'],
    FileModifyDate: metadata.FileModifyDate
  }

  if (metadata['XMP:Creator']) exifMetadata['XMP:Creator'] = metadata['XMP:Creator']
  if (metadata['IPTC:By-line']) exifMetadata['IPTC:By-line'] = metadata['IPTC:By-line']

  if (metadata['XMP:Headline']) exifMetadata['XMP:Headline'] = metadata['XMP:Headline']
  if (metadata['IPTC:Headline']) exifMetadata['IPTC:Headline'] = metadata['IPTC:Headline']

  if (metadata['XMP:Description']) exifMetadata['XMP:Description'] = metadata['XMP:Description']
  if (metadata['IPTC:Caption-Abstract']) exifMetadata['IPTC:Caption-Abstract'] = metadata['IPTC:Caption-Abstract']
  exifMetadata['XMP:ImageDescription'] = exifMetadata['XMP:ImageDescription'] || '';
  if (metadata['XMP:ImageDescription']) exifMetadata['XMP:ImageDescription'] = metadata['XMP:ImageDescription']

  if (metadata['XMP:Keywords'] && metadata['XMP:Keywords'].length > 0) {
    exifMetadata['XMP:Keywords'] = metadata['XMP:Keywords']
    exifMetadata['IPTC:Keywords'] = metadata['IPTC:Keywords']
    exifMetadata['XMP:Subject'] = metadata['XMP:Keywords'];
  }

  if (metadata['XMP:Location']) exifMetadata['XMP:Location'] = metadata['XMP:Location']
  if (metadata['IPTC:City']) exifMetadata['IPTC:City'] = metadata['IPTC:City']

  if (metadata['XMP:Country']) exifMetadata['XMP:Country'] = metadata['XMP:Country']
  if (metadata['IPTC:Country-PrimaryLocationName']) exifMetadata['IPTC:Country-PrimaryLocationName'] = metadata['IPTC:Country-PrimaryLocationName']

  if (metadata['XMP:Copyright']) exifMetadata['XMP:Copyright'] = metadata['XMP:Copyright']
  if (metadata['XMP:Rights']) exifMetadata['XMP:Rights'] = metadata['XMP:Rights']
  if (metadata['IPTC:CopyrightNotice']) exifMetadata['IPTC:CopyrightNotice'] = metadata['IPTC:CopyrightNotice']

  exiftool
    .write(filePath, exifMetadata, ['-overwrite_original'])
    .then(() => {
      event.reply('metadata-rewritten', { rowId, status: 'success' })
    })
    .catch((err) => {
      console.error('An error occurred:', err)
      event.reply('metadata-rewritten', { rowId, status: 'error' })
    })
})