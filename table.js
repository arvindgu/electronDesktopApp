const { ipcRenderer } = require('electron');

let list = document.getElementById("list");
let newTask = document.getElementById("newTask");
let addTask = document.getElementById("addTask");


document.getElementById("addTask").addEventListener('click', () => {
    console.log("Hello");
    list.insertAdjacentHTML('beforeend', `<li class="list-group-item">${newTask.value}</li>`);
    ipcRenderer.invoke('show-notification', newTask.value);
    newTask.value = '';
});
