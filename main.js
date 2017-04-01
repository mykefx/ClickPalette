const electron          = require('electron');
const {app}             = electron;
const {BrowserWindow}   = electron;
const {ipcMain}         = require('electron');

const Configstore = require('configstore');
const pkg = require(__dirname + '/init.json');
const sysconf = new Configstore(pkg.name);

const Menu = require('electron').Menu;
let mainWindow;

var version = '1.0.0';

function createWindow(){
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

    if (sysconf.get('bounds')){
        var bounds = sysconf.get('bounds');
    } else {
        var bounds = {'x':'', 'y':'', 'width':'400', 'height':'129'}
    }

    if ( process.platform == 'darwin' ){
        bounds.height = 110;
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: 400,
        height: bounds.height,
        //'titleBarStyle': 'hidden',
        title: 'ClickPalette',
        backgroundColor: '#fff'
    });

    mainWindow.setResizable(false);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    //mainWindow.webContents.openDevTools();

    mainWindow.on('close', function(e) {
        var bounds = mainWindow.getBounds();
        sysconf.set({'bounds' : bounds});
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
