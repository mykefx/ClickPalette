/*******************************************************************************
*   ClickPalette
*   ------------
*   This is the main js for init the app and its enviroment in electron
*   Developed by James Newman (Jam3sn)
*******************************************************************************/



/*******************************************************************************
*   Setup
*******************************************************************************/

const fs                = require('fs');
const path              = require('path');
const electron          = require('electron');
const {app}             = electron;
const {BrowserWindow}   = electron;
const {ipcMain}         = electron;
const Menu              = electron.Menu;

let sysconf = {bounds: {'x':'', 'y':'', 'width':'400', 'height':'130'}};
let mainWindow;
let configTimeout = 0;
let version = app.getVersion();

//Check sys.json exists, if not cretes the file.
if (!checkFile('sys.json')){
    writeFile('sys.json', sysconf);
}

//Lanch the app once sysconf is ready
readFile('sys.json', sysconf =>{
    app.on('ready', createWindow);
});


/*******************************************************************************
*   Main App
*******************************************************************************/

function createWindow(){

    //Create the browser window.
    mainWindow = new BrowserWindow({
        x: sysconf.bounds.x,
        y: sysconf.bounds.y,
        width: 400,
        height: 130,
        //'titleBarStyle': 'hidden',
        title: 'ClickPalette',
        backgroundColor: '#ffffff',     //Background color while the app loads
        titleBarStyle: 'hidden',        //Hide title and default window buttons
        frame: false,                   //Hide title and default window buttons
        fullscreenable: false,          //Prevent macOS fullscreen
        fullscreen: false,              //Prevent macOS fullscreen
        resizable: false,               //Prevent user window resizing
        alwaysOnTop: true,              //So window will always be on top of all windows


    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.webContents.openDevTools();

    //Save the window bounds on close.
    mainWindow.on('close', function(e) {
        sysconf.bounds = mainWindow.getBounds();
        console.log(sysconf.bounds);
        writeFile('sys.json', sysconf);
    });

    //Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    //Remove default toolbar (File, Edit etc.)
    mainWindow.setMenu(null);
}



/*******************************************************************************
*   App Events
*******************************************************************************/

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//Show window
app.on('activate', function (e) {
    if (mainWindow === null) {
        createWindow();
    }
});



/*******************************************************************************
*   IPC
*******************************************************************************/

//Handle IPC from app
ipcMain.on('asynchronous-message', (event, data) => {

    //Focus
    if ( data.focus === true ){
        mainWindow.focus();
    }

    //Close
    else if ( data.closeApp === true ){
        mainWindow.close();
    }
});



/*******************************************************************************
*   Functions
*******************************************************************************/

function readFile(file, _callback){
    file = app.getPath('userData') + '/' + file;

    try{
        let data = fs.readFileSync(file, 'utf8');
        if (data.length > 0){
            data = JSON.parse(data);
            _callback(data);
        } else{
            _callback(false);
        }
    } catch(e){
        _callback(false);
    }
}


function writeFile(file, obj = ''){
    file = app.getPath('userData') + '/' + file;
    obj = JSON.stringify(obj);

    fs.writeFile(file, obj, 'utf8', (error) => {
        if (!error){
            return error;
        }

        return true;
    });
}


function checkFile(file){
    file = app.getPath('userData') + '/' + file;
    if (fs.existsSync(file)){
        return true;
    }
}
