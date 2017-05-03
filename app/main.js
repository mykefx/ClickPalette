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

let sysconf = {};
let mainWindow;
let version = app.getVersion();

//Check sys.json exists, if not cretes the file.
if (checkFile('sys.json')){
    sysconf = readFile('sys.json');
} else {
    writeFile('sys.json');
    sysconf = {};
}

//Checks if bounds are set, if not creates them.
if (sysconf.bounds === 'undefined'){
    console.log('no bounds', sysconf);
    sysconf.bounds = {'x':'', 'y':'', 'width':'400', 'height':'130'};
}


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
        backgroundColor: '#fff'
    });

    //Further config
    mainWindow.setResizable(false);
    mainWindow.setAlwaysOnTop(true);
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

// Load mainWindow
app.on('ready', createWindow);

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
    if ( data.focus !== undefined ){
        mainWindow.focus();
    }
});



/*******************************************************************************
*   Functions
*******************************************************************************/

function readFile(file){
    file = app.getPath('userData') + '/' + file;

    let data = fs.readFileSync(file, 'utf8');
    if (data.length > 0){
        data = JSON.parse(data);
    } else {
        return false;
    }

    return data;
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
