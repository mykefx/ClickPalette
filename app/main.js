const fs                = require('fs');
const path              = require('path');
const electron          = require('electron');
const {app}             = electron;
const {BrowserWindow}   = electron;
const {ipcMain}         = electron;
const Menu              = electron.Menu;

let sysconf = {};
let mainWindow;

var version = app.getVersion();

function createWindow(){
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

    let sysconf = readFile('sys.json');
    console.log(sysconf);

    if (sysconf == undefined){
        writeFile('sys.json');
        sysconf = {}
    }

    if (sysconf.bounds != undefined){
        var bounds = sysconf.bounds;
    } else {
        var bounds = {'x':'', 'y':'', 'width':'400', 'height':'125'}
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
        writeFile('sys.json', sysconf);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.setMenu(null);

};


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


//IPC
ipcMain.on('asynchronous-message', (event, data) => {
    if ( data['focus'] != undefined ){
        mainWindow.focus();
    }
});


//Function
function readFile(file){
    file = app.getPath('userData') + '/' + file;
    fs.readFile(file, 'utf8', function(error, data){
        if (!error){
            if (data.length > 0){
                data = JSON.parse(data);
            }
            return data
        }
    });
}

function writeFile(file, obj = ''){
    file = app.getPath('userData') + '/' + file;
    console.log(file);
    obj = JSON.stringify(obj);
    fs.writeFile(file, obj, 'utf8', function(error){
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
