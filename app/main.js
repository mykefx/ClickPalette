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



/*******************************************************************************
*   Main App
*******************************************************************************/

function createWindow(){

    let sysconf = readFile('sys.json');
    console.log('CONF: ', sysconf);

    if (sysconf === undefined){
        //writeFile('sys.json');
        sysconf = {};
    }

    var bounds;
    if (sysconf.bounds !== undefined){
        bounds = sysconf.bounds;
    } else {
        bounds = {'x':'', 'y':'', 'width':'400', 'height':'125'};
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: 400,
        height: 129,
        //'titleBarStyle': 'hidden',
        title: 'ClickPalette',
        backgroundColor: '#fff'
    });

    mainWindow.setResizable(false);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    //mainWindow.webContents.openDevTools();

    mainWindow.on('close', function(e) {
        sysconf.bounds = mainWindow.getBounds();
        console.log(sysconf.bounds);
        writeFile('sys.json', sysconf);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

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
    console.log(file);
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
