const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;

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
        var bounds = {'x':'', 'y':'', 'width':'400', 'height':'125'}
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: 400,
        height: 90,
        //'titleBarStyle': 'hidden',
        title: 'ClickPalette',
        backgroundColor: '#fff',
        frame: false
    });

    mainWindow.setResizable(false);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.setMenu(null);

    //mainWindow.webContents.openDevTools();

    mainWindow.on('close', function(e) {
        var bounds = mainWindow.getBounds();
        sysconf.set({'bounds' : bounds});
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() { require('electron').shell.openExternal('http://jam3sn.xyz/clickpalette'); }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                      if (focusedWindow)
                        focusedWindow.webContents.toggleDevTools();
                    }
                 },
            ]
        },
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'ClickPalette',
            submenu: [
                {
                    role: 'hide'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                },
            ]
        });
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

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
