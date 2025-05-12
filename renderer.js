const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

document.getElementById('select-folder-btn').addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('selected-directory', (event, paths) => {
  paths.forEach(p => {
    handlePath(p)
  })
})

function handlePath(filePath) {
  try {
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      const entries = fs.readdirSync(filePath)
      entries.forEach(entry => {
        handlePath(path.join(filePath, entry))
      })
    } else if (stats.isFile() && isMediaFile(filePath)) {
      let filename = path.basename(filePath)
      let dateAndTime = parseDateAndTimeFromFilename(filename)
      let color = "#39455a"
      if (dateAndTime == null || !isValidDateTime(dateAndTime)) {
        color = "#e53935"
      }
      const index = document.querySelectorAll('#file-table tbody tr').length + 1
      let row = `<tr id="row-${index}" style="color:${color};"><td>${dateAndTime.date}</td><td>${dateAndTime.time}</td><td>${filePath}</td><td><button class="btn_del" data-row-id="row-${index}"><img src="src/images/remove.svg" alt="✕" width="100%"/></button></td></tr>`
      document.getElementById('file-table').getElementsByTagName('tbody')[0].insertAdjacentHTML('beforeend', row)
      addDeleteButtonClickListeners()
    }
  } catch (err) {
    alert('Fehler beim Verarbeiten: ' + err.message)
  }
}

function isValidDateTime(dateAndTime) {
  const { year, month, day, hours, minutes, seconds } = dateAndTime;
  const numberPattern = /^\d+$/;
  if (year.length !== 4 || !numberPattern.test(year)) return false;
  if (month.length !== 2 || !numberPattern.test(month) || month < 1 || month > 12) return false;
  if (day.length !== 2 || !numberPattern.test(day) || day < 1 || day > 31) return false;
  if (hours.length !== 2 || !numberPattern.test(hours) || hours < 0 || hours > 24) return false;
  if (minutes.length !== 2 || !numberPattern.test(minutes) || minutes < 0 || minutes > 59) return false;
  if (seconds.length !== 2 || !numberPattern.test(seconds) || seconds < 0 || seconds > 59) return false;
  return true;
}

document.getElementById('rewind-btn').addEventListener('click', () => {
  const rows = document.getElementById('file-table').querySelectorAll('tr')
  rows.forEach((row, index) => {
    if (index === 0) return
    const cells = row.querySelectorAll('td')
    const date = cells[0].innerText
    const time = cells[1].innerText
    const filePath = cells[2].innerText
    const dateTimeStr = `${date} ${time}`
    const creator = document.getElementById('creator-input').value.trim()
    const headline = document.getElementById('headline-input').value.trim()
    const description = document.getElementById('description-input').value.trim()
    const keywordsInput = document.getElementById('keywords-input').value.trim();
    const keywords = keywordsInput !== "" ? keywordsInput.split(/[\;,]/).map(keyword => keyword.trim()) : [];
    
    const city = document.getElementById('city-input').value.trim()
    const country = document.getElementById('country-input').value.trim()
    const copyright = document.getElementById('creator-input').value.trim()

    const metadata = {
      AllDates: dateTimeStr,
      FileCreateDate: dateTimeStr,
      'IPTC:DateCreated': date,
      'IPTC:TimeCreated': time,
      FileModifyDate: dateTimeStr,
    }

    if (creator) metadata['XMP:Creator'] = creator
    if (creator) metadata['IPTC:By-line'] = creator

    if (headline) metadata['XMP:Headline'] = headline
    if (headline) metadata['IPTC:Headline'] = headline

    if (description) metadata['XMP:Description'] = description
    if (description) metadata['IPTC:Caption-Abstract'] = description
    if (description) metadata['XMP:ImageDescription'] = description

    if (keywords.length > 0) {
      metadata['XMP:Subject'] = keywords
      metadata['XMP:Keywords'] = keywords
      metadata['IPTC:Keywords'] = keywords
    }

    if (city) metadata['XMP:Location'] = city
    if (city) metadata['IPTC:City'] = city

    if (country) metadata['XMP:Country'] = country
    if (country) metadata['IPTC:Country-PrimaryLocationName'] = country

    if (copyright) metadata['XMP:Rights'] = copyright
    if (copyright) metadata['XMP:Copyright'] = copyright
    if (copyright) metadata['IPTC:CopyrightNotice'] = copyright

    ipcRenderer.send('rewrite-metadata', { filePath, metadata, rowId: `row-${index}` })
  })
})

ipcRenderer.on('metadata-rewritten', (event, { rowId, status }) => {
  const color = status === 'success' ? 'green' : 'red'
  const row = document.getElementById(rowId)
  if (row) {
    row.style.color = color
  }
})

function isMediaFile(filePath) {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.heic', '.bmp', '.gif', '.webp', '.mp4', '.mp3', '.wav', '.flac', '.avi', '.mkv', '.mov', '.3gp']
  let ext = path.extname(filePath).toLowerCase()
  return allowedExtensions.includes(ext)
}

function parseDateAndTimeFromFilename(filename) {
  let year = filename.substring(0, 4)
  let month = filename.substring(4, 6)
  let day = filename.substring(6, 8)
  let hours = filename.substring(9, 11)
  let minutes = filename.substring(11, 13)
  let seconds = filename.substring(13, 15)

  let date = `${year}:${month}:${day}`
  let time = `${hours}:${minutes}:${seconds}`

  return { date, time, year, month, day, hours, minutes, seconds }
}

function clearList() {
  document.getElementById('file-table').getElementsByTagName('tbody')[0].innerHTML = ""
  addDeleteButtonClickListeners()
}

function clearFields() {
  document.getElementById('creator-input').value = ""
  document.getElementById('headline-input').value = ""
  document.getElementById('description-input').value = ""
  document.getElementById('keywords-input').value = ""
  document.getElementById('city-input').value = ""
  document.getElementById('country-input').value = ""
}

document.getElementById('clear-all-btn').addEventListener('click', () => {
  clearFields() // <- nur Felder, NICHT die Liste
})

document.getElementById('clear-list-btn').addEventListener('click', () => {
  clearList()
})

function addDeleteButtonClickListeners() {
  const deleteButtons = document.querySelectorAll('.btn_del')
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const rowId = button.getAttribute('data-row-id')
      const row = document.getElementById(rowId)
      row.remove()
      updateRowIds()
    })
  })
}

function updateRowIds() {
  const rows = document.getElementById('file-table').querySelectorAll('tr')
  rows.forEach((row, index) => {
    if (index === 0) return
    const newRowId = `row-${index}`
    row.id = newRowId
    const deleteButton = row.querySelector('.btn_del')
    deleteButton.setAttribute('data-row-id', newRowId)
  })
}