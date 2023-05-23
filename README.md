<img src="static/icon.png" width="200" />

# TimeRewinder
Unfortunately, it happens that the creation date is overwritten during editing or conversion or that some photo programmes (e.g. Synology Photo) sort the videos according to the modification date. Time Rewinder helps to reset the timestamps (creation and modification date) to the origin based on the file name. The core is the tool FFMPEG, which must be installed on the machine. TimeRewinder just generates the commands, which then have to be pasted into the console.

------------
## Required tools
 - Last Version of [TimeRewinder](https://github.com/earlmckay/timestamp-rewinder/releases)
 - [FFMPEG](https://ffmpeg.org/download.html) must be installed
 - The programme assumes a fixed file naming: `YYYYMMDD-HHMMSS ...`

------------

## Recommended workflow
1. First rename all pictures and videos (before editing!) according to the pattern `YYYYMMDD-HHMMSS ...`. For batch renaming you can use [Adobe Bridge](https://www.adobe.com/en/products/bridge.html), [Advanced Renamer](https://www.advancedrenamer.com) for Windows or 
[NameChanger](https://mrrsoftware.com/namechanger/) on Mac. 
This way `DMC2047375.jpg` becomes `20230513-141827 - Holiday on Mallorca.jpg`
2. Now the images can be developed and the videos edited and converted.
3. When the editing is finished and the files are ready for archiving, TimeRewinder comes into action.
4. The images and videos can be dragged into the programme. The commands for FFMPEG are automatically copied to the clipboard. These can then simply be pasted into the console / terminal and FFMPEG will start the correction.

# Tips
On external drives, the modification date will not be corrected. In this case, you can save the data locally and correct it.

## For development
 - [Node.js](https://nodejs.org/en)

|         |                   |
| ------- | ----------------- |
| Install | · `npm install`   |
| Develop | · `npm run dev`   |
| Build   | · `npm run build` |

In order to eliminate vulnerabilities caused by electron itself, please run `npm update` and `npm audit fix`. This will apply overrides.

### Change Build Targets

In the scripts section of `package.json` you can update the `build:electron` command and change the flags to set the targets, by default it uses `-mwl` which is Mac, Windows, and Linux



------------
Thanks [Robert Nickel](https://github.com/Robert-Nickel) for his support, from which I used the basic structure.
