const { ipcRenderer } = require('electron');
const $tableID = $('#table'); 
var remotelyConnected = false;
const newTr = `
        <tr class="table-striped">
            <td class="pt-3-half" contenteditable="true"></td>
            <td class="pt-3-half" contenteditable="true"></td>
            <td class="pt-3-half" contenteditable="true"></td>
            <td class="pt-3-half" contenteditable="true"></td>
            <td>
                <span class="table-save">                    
                    <button type="button" class="btn btn-success btn-rounded btn-sm my-0">
                        Save
                    </button>
                </span>
            </td>
            <td>
                <span class="table-remove">
                    <button type="button" class="btn btn-danger btn-rounded btn-sm my-0">
                        Remove
                    </button>
                </span>
            </td>
        </tr>`; 
    

    const tbheader =`
                <thead>
                    <tr>
                        <th class="text-center">Employee ID</th>
                        <th class="text-center">First Name</th>
                        <th class="text-center">Last Name</th>
                        <th class="text-center">Email</th>              
                        <th class="text-center"></th>
                        <th class="text-center"></th>
                    </tr>
                </thead>
                <tbody id="empTableBody">            
                </tbody>`;



//Remove Data
$tableID.on('click', '.table-remove', function () { 
    console.log("In tableID.on click table-remove"); 
    const $row = $(this).parents('tr'); 
    console.log("In tableID.on click table-remove $row.index: " + $row.index()); 
    if($row.index() < 0) { 
        return; 
    }    

    if(remotelyConnected == true){        
        removeFromRemoteStorage($row.find("td:eq(0)").text(), $row);
    }else{        
        removeFromLocalStorage($row.find("td:eq(0)").text(),  $row);
    }    
});


//Save Data
$tableID.on('click', '.table-save', function () { 
    console.log("In tableID.on click table-save");
    const $row = $(this).parents('tr'); 
    if($row.index() === 0) { 
        return; 
    }
    var emp = {
        "employee_id": $row.find("td:eq(0)").text(),
        "firstName": $row.find("td:eq(1)").text(),
        "lastName": $row.find("td:eq(2)").text(),
        "email": $row.find("td:eq(3)").text()
    };    
    
    if(remotelyConnected == true){
        console.log("Swith is ON, save in Remote storage");
        var empJSON = JSON.stringify(emp);
        console.log("empJSON: " + empJSON);
        saveInRemoteStorage(empJSON);
    }else{
        console.log("Swith is OFF, save in local storage");
        var offLineData = {
            "url": "http://localhost:8080/api/v1/employees",
            "type": "POST",
            "payload" : emp
        }
        saveInLocalStorage($row.find("td:eq(0)").text(), JSON.stringify(offLineData));
    }    
}); 


//Add a Row
document.getElementById("addRow").addEventListener('click', () => {    
    console.log("Adding a new row in table");    
    //Enter a new Row in table
    $tableID.find('table').append(newTr);     
});


//Switch Control
$("#connectSwitch").change(function(){
    if($(this).prop("checked") == true){
        remotelyConnected = true;
        $("#pushToRemoteBtn").prop("disabled", true );
        loadFromRemoteStorage();
        ipcRenderer.send('remote-connection-notification');
        //ipcRenderer.once('remote-connection-notification-reply', (event, arg) => {});
    }else{
        remotelyConnected = false;
        $("#pushToRemoteBtn").prop("disabled", false );
        loadFromLocalStorage();
    }
});

//Load from LOCAL storage
function loadFromLocalStorage(){
    //First Clear the table
    $tableID.find('table').empty();
    $tableID.find('table').append(tbheader);

    // Send load data request 
    ipcRenderer.send('get-data-local-storage');
    ipcRenderer.once('get-data-local-storage-reply', (event, arg) => {  
        //ipcRenderer.removeListener('get-data-local-storage',  (event, arg) => { });
        if(arg != null){
            var jsonParsedArray = JSON.parse(JSON.stringify(arg));
            for (key in jsonParsedArray) {
                let obj = JSON.parse(jsonParsedArray[key]);                
                renderUIFromLocalStorageData(obj);
            }
        }
    })        
}

//Render local storage data
function renderUIFromLocalStorageData(data){
    let addRow = `
        <tr>
            <td class="pt-3-half" contenteditable="true">` + data.payload.employee_id + `</td>
            <td class="pt-3-half" contenteditable="true">` + data.payload.firstName + `</td>
            <td class="pt-3-half" contenteditable="true">` + data.payload.lastName + `</td>
            <td class="pt-3-half" contenteditable="true">` + data.payload.email + `</td>
            <td>
                <span class="table-save">                    
                    <button type="button" class="btn btn-success btn-rounded btn-sm my-0">
                        Save
                    </button>
                </span>
            </td>
            <td>
                <span class="table-remove">
                    <button type="button" class="btn btn-danger btn-rounded btn-sm my-0">
                        Remove
                    </button>
                </span>
            </td>`;
    $tableID.find('table > tbody').append(addRow);
}

//Load data from REMOTE storage
function loadFromRemoteStorage() {
    //First Clear the table
    $tableID.find('table').empty();
    $tableID.find('table').append(tbheader);
    //Load data into Table
    $.getJSON("http://localhost:8080/api/v1/employees").
            then(function (employees) {
            $.each(employees, function () {                
                newRow = `
                    <tr>
                        <td class="pt-3-half" contenteditable="true">` + this.employee_id + `</td>
                        <td class="pt-3-half" contenteditable="true">` + this.firstName + `</td>
                        <td class="pt-3-half" contenteditable="true">` + this.lastName + `</td>
                        <td class="pt-3-half" contenteditable="true">` + this.email + `</td>
                        <td>
                            <span class="table-save">                    
                                <button type="button" class="btn btn-success btn-rounded btn-sm my-0">
                                    Save
                                </button>
                            </span>
                        </td>
                        <td>
                            <span class="table-remove">
                                <button type="button" class="btn btn-danger btn-rounded btn-sm my-0">
                                    Remove
                                </button>
                            </span>
                        </td>`;
                $tableID.find('table > tbody').append(newRow);
            });
        });
}


//Save in REMOTE Storage
function saveInRemoteStorage(empJSON){
    console.log("In saveInRemoteStorage....")
    $.ajax({
        url: "http://localhost:8080/api/v1/employees",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function (data) {
            console.log("Row Saved successfully in remote storage");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error while saving row in local storage: ", errorThrown);            
        },
        data: empJSON
    });
}

//Save in LOCAL STORAGE
function saveInLocalStorage(empId, offLineData){   
    ipcRenderer.invoke('save-data-local-storage', empId, offLineData);
    //ipcRenderer.invoke('save-data-local-storage', offLineData);
}

// By default load data from local storage on app startup
loadFromLocalStorage();

//=================================================

//Remove from REMOTE storage
function removeFromRemoteStorage(employee_id, $row){             
    let deleteURL = "http://localhost:8080/api/v1/employees" + "/" + employee_id;
    $.ajax({
        url: deleteURL,
        type: "DELETE",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function (data) {                   
            $row.detach(); 
        },
        error: function (errorThrown) {
            console.log(errorThrown);
        }
    });        
}

//Remove from LOCAL storage
function removeFromLocalStorage(empId, $row){
    console.log("In removeFromLocalStorage()....");
    ipcRenderer.invoke('remove-data-local-storage', empId);
    //ipcRenderer.once('remove-data-local-storagereply', (event, arg) => { });
    $row.detach(); 
}


function delete_row(given_value) {
    //var td = $("#" + id + " td");
    $.each("td", function(i) {
      if ($(td[i]).text() === given_value) {
        //$(td[i]).parent().remove();
        $(td[i]).parent().detach();
      } 
    });
}

//Synch
document.getElementById("pushToRemoteBtn").addEventListener('click', () => {    
    console.log("Push Data to Remote Storage....");    
    // Send load data request 
    ipcRenderer.send('get-data-local-storage');
    ipcRenderer.once('get-data-local-storage-reply', (event, arg) => {  
        //ipcRenderer.removeListener('get-data-local-storage',  (event, arg) => { });
        if(arg != null){
            var jsonParsedArray = JSON.parse(JSON.stringify(arg));
            for (key in jsonParsedArray) {
                let obj = JSON.parse(jsonParsedArray[key]);
                let url = obj.url;
                let type = obj.type;
                let employee_id = obj.payload.employee_id;
                let firstName = obj.payload.firstName;
                let lastName = obj.payload.lastName;
                let email = obj.payload.email;

                $.ajax({
                    url: obj.url,
                    type: obj.type,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    crossDomain: true,
                    success: function (data) {                   
                        ipcRenderer.invoke('remove-data-local-storage', obj.payload.employee_id);
                        //ipcMain.on('push-to-remote-storage'
                        ipcRenderer.send('push-to-remote-storage-notification');
                        ipcRenderer.once('push-to-remote-storage-notification-reply', (event, arg) => {
                            //delete the row from the table
                            delete_row('empTable', obj.payload.employee_id);
                        });
                    },
                    error: function (errorThrown) {
                        console.log(errorThrown);
                    },
                    data: JSON.stringify(obj.payload)
                });    
                
            }
        }
    })     
});