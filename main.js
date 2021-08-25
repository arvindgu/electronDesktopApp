const { app, BrowserWindow, ipcMain, Notification } = require("electron");

const path = require("path");

const storage = require("electron-json-storage");
const defaultDataPath = storage.getDefaultDataPath();
console.log("defaultDataPath: ", defaultDataPath)
// A reference to the offLineSupportAppData array, full of JS/JSON objects. All mutations to the array are performed in the main.js app, 
// but each mutation will trigger a rewrite to the user's storage for data persistence
let offLineSupportAppData =[];
//let splash;

app.setAppUserModelId("Online-Offline Desktop Demo App");


  //With Splash
  app.on('ready', () => {    
    // create a new `splash`-Window 
    //let splash = new BrowserWindow({width: 810, height: 610, transparent: true, frame: false, alwaysOnTop: true});
    let splash = new BrowserWindow({width: 400, height: 400, transparent: true, frame: false, alwaysOnTop: false});
    splash.loadURL(`file://${__dirname}/images/demo.gif`);

    function myFunction() {
        const mainWindow = new BrowserWindow({
          width : 1200,
          height: 800,
          webPreferences: {
              nodeIntegration: true,
              contextIsolation: false,
              enableRemoteModule: true
          }
      });
      mainWindow.loadFile(path.join(__dirname, "table.html"));
      mainWindow.once('ready-to-show', () => {
        splash.destroy();
        mainWindow.show();
      });
    }
    setTimeout(myFunction, 7000);    
});


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });


  /*
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});
*/

ipcMain.handle('show-notification', (event, ...args) => {
    const notification = {
        title: 'New Task',
        body: `Added: ${args[0]}`
    }
    new Notification(notification).show()
});



//Save-data-local-storage
ipcMain.handle('save-data-local-storage', (event, ...args) => {   
    console.log("save-data-local-storage ---  data: ", `${args[0]}`);
    //console.log("Data to save: ", `${args[1]}`);
    empId = `${args[0]}`;
    offLineSupportAppData = `${args[1]}`;
    //offLineSupportAppData.push(`${args[1]}`);
    //storage.set('offLineSupportAppData', offLineSupportAppData, (error) => {
      storage.set(empId, offLineSupportAppData, (error) => {
        if (error) {
            console.log("Error while saving: ", error);         
        } else {            
            console.log("Data Saved successfully!");
            const notification = {              
              title: 'Offline Mode',
              body: 'Row saved in Local storage.'
            }
            //icon: 'images/offline.png',
            new Notification(notification).show();        
        }
      })
});


//get-data-local-storage
/*
ipcMain.handle('get-data-local-storage', (event, ...args) => {
  console.log("Inside get-data-local-storage...");
  storage.getAll(function(error, data) {
    if (error) throw error;
    console.log(data);
    event.returnValue =  data;
  });     
});
*/

//get-data-local-storage
ipcMain.on('get-data-local-storage', (event, arg) => {
  console.log("Inside get-data-local-storage...");

  const notification = {
    icon: 'images/offline.png',
    title: 'Offline Mode',
    body: 'Connected to Local storage.'
  }
  new Notification(notification).show();

  storage.getAll(function(error, data) {
    if (error) {
      //throw error;
      console.log(error);
    }
    console.log("get-data-local-storage --- data: " + data);
    //offLineSupportAppData.push(data);
    event.reply('get-data-local-storage-reply', data)
  });  
})


//Delete Data from local storage
ipcMain.handle('remove-data-local-storage', (event, ...args) => {
  console.log("Inside delete-data-local-storage......");
  empId = `${args[0]}`;  
  storage.remove(empId, function(error) {
    if (error) {
      console.log("Error while deleting: ", error);
    } else {          
        console.log("Data deleted successfully!");
        const notification = {              
          title: 'Offline Mode',
          body: 'Row deleted from Local storage.'
        }
        //icon: 'images/offline.png',
        new Notification(notification).show();  
    }
  });

});


//Remote Connection Notification
ipcMain.on('remote-connection-notification', (event, arg) => {
  const notification = {    
    title: 'Online Mode',
    icon: 'images/online.png',
    body: 'Connected to Remote storage.'
  }
  new Notification(notification).show(); 
  //event.reply('remote-connection-notification-reply', '');
});



//Push data to Remote storage Notification
ipcMain.on('push-to-remote-storage-notification', (event, arg) => {
  const notification = {
    icon: 'images/pushData.png',
    title: 'Record pushed to remote Storage',
    body: 'Record updated successfully for employee id:' + empId
  }
  new Notification(notification).show();
}); 