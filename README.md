<img src="Readme_files/icon.png" width="200" />

# TimeRewinder
Unfortunately, it happens that the creation date is overwritten during editing or conversion or that some photo programmes (e.g. Synology Photo) sort the videos according to the modification date. Time Rewinder helps to reset the timestamps (creation and modification date) to the origin based on the file name.

<img src="Readme_files/time-rewinder_v2_screenshot.png" width="100%" />

------------
## Requirements
 - A correct time structure in the file names: `YYYYMMDD-HHMMSS ...`

------------

## Recommended workflow
1. First rename all pictures and videos (before editing!) according to the pattern `YYYYMMDD-HHMMSS ...`. For batch renaming you can use [Adobe Bridge](https://www.adobe.com/en/products/bridge.html), [Advanced Renamer](https://www.advancedrenamer.com) for Windows or 
[NameChanger](https://mrrsoftware.com/namechanger/) on Mac. 
This way `DMC2047375.jpg` becomes `20230513-141827 - Ninas birthsday.jpg`
2. Now the images can be developed or the videos edited and converted.
3. When the editing is finished and the files are ready for archiving, TimeRewinder comes into action.
4. A folder can now be selected using the Import button. If necessary, some basic EXIF data can be added (existing metadata will not be overwritten if the field is left empty). The table can be used to check if the program has read out the time and date correctly. The program also checks if the values are logical. If a time (e.g. 11:89:02 (89 minutes do not exist)) is out of range, the line is highlighted in red. You can remove a file from the list by clicking 'X' if you do not want it to be processed. 
5. Press the button "Rewind" to start changing the data.

# Tips
On external drives, the modification date will not be corrected. In this case, you have to work locally.

## For development
 - [Node.js](https://nodejs.org/en)

|         |                   |
| ------- | ----------------- |
| Install | · `npm install`   |
| Update with NCU | · `ncu -u`   |
| Develop | · `npm start`   |
| Build Mac  | · `electron-builder -m` |
| Build  Win | · `npx electron-builder` |

In order to eliminate vulnerabilities caused by electron itself, please run `npm update` and `npm audit fix`. This will apply overrides.
