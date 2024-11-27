import PubSub from 'pubsub-js';
import './style.css';
import { listController } from './list';
import { storageController } from './storage';
import { isToday, isTomorrow, isYesterday, formatDistanceToNow, isBefore } from 'date-fns';

import addIcon from './svg/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';

const displayController = (function () {
  const contentEl = document.getElementById('content');
  const sidebarEl = document.getElementById('sidebar');
  const listsEl = document.createElement('div');

  const clearContents = (domEl) => {
    while(domEl.firstChild){
      domEl.removeChild(domEl.firstChild);
    }
  };

  const initializePage = (msg) => {
    drawSidebar();
    PubSub.publish('LOAD_DATA');
  };
  const initializePageToken = 
    PubSub.subscribe('INITIALIZE_PAGE', initializePage);

  const drawSidebar = () => {
    drawSidebarHeader(sidebarEl);
    listsEl.classList.add('lists');
    sidebarEl.appendChild(listsEl);
  };

  const drawSidebarHeader = (container) => {
    const listsHeaderEl = document.createElement('div');
    listsHeaderEl.classList.add('lists-header');
    container.appendChild(listsHeaderEl);

    const myListsEl = document.createElement('h3');
    myListsEl.textContent = 'My Lists';
    listsHeaderEl.appendChild(myListsEl);

    const addListBtnEl = document.createElement('button');
    addListBtnEl.classList.add('add-list-btn');
    const addListBtnIconEl = document.createElement('img');
    addListBtnIconEl.src = addIcon;
    addListBtnEl.appendChild(addListBtnIconEl);
    addListBtnEl.addEventListener('click', () => {
      let newName;
      let keepGoing = true;
      while (keepGoing) {
        newName = prompt('Add a list name');
        if (newName) {
          PubSub.publish('NEW_LIST', newName);
          keepGoing = false;
        } else if (newName === null) {
          keepGoing = false;
        }
      }
    });
    listsHeaderEl.appendChild(addListBtnEl);
  };

  const drawSidebarButtons = (msg, listNames) => {
    clearContents(listsEl);

    listNames.forEach((listName) => {
      const listNameEl = document.createElement('button');
      listNameEl.textContent = listName;
      listNameEl.addEventListener('click', () => {
        PubSub.publish('SEND_LIST_TO_DRAW', listNames.indexOf(listName));
      });
      listsEl.appendChild(listNameEl);
    });
  };
  const drawSidebarButtonsToken =
    PubSub.subscribe('UPDATE_LIST_NAMES', drawSidebarButtons);

  const drawListPage = (msg, [listName, tasksArr, listIndex]) => {
    clearContents(contentEl);
    drawHeader(listName, contentEl);
    drawTaskContainer(tasksArr, contentEl);
    drawNewTaskForm(listIndex, contentEl);
  };
  const drawListToken = PubSub.subscribe('DRAW_LIST_PAGE', drawListPage);

  const drawHeader = (text, container) => {
    const headerEl = document.createElement('h1');
    headerEl.textContent = text;
    headerEl.classList.add('page-header');
    container.appendChild(headerEl);
  };

  const drawTaskContainer = (tasksArr, container) => {
    const taskContainerEl = document.createElement('div');
    taskContainerEl.classList.add('task-container');
    tasksArr.forEach((task) => {
      drawTask(task, taskContainerEl);
    });
    container.appendChild(taskContainerEl);
  };

  const drawTask = (task, container) => {
    const taskEl = document.createElement('div');

    const taskNameEl = document.createElement('div');
    taskNameEl.textContent = task.name;
    taskEl.appendChild(taskNameEl);
    
    const taskDueEl = document.createElement('div');
    taskDueEl.classList.add('due-date');
    taskDueEl.textContent = formatDueDate(task.dueDate);
    taskEl.appendChild(taskDueEl);
    
    taskEl.classList.add('task-card');
    container.appendChild(taskEl);
  };

  const drawNewTaskForm = (indexVal, container) => {
    const addTaskFormEl = document.createElement('form');
    addTaskFormEl.classList.add('add-task');
    const addTaskInputEl = document.createElement('input');
    addTaskInputEl.type = 'text';
    addTaskInputEl.placeholder = 'Add new task';
    const addTaskBtnEl = document.createElement('button');
    const addTaskBtnIconEl = document.createElement('img');
    addTaskBtnIconEl.src = addIcon;
  
    addTaskBtnEl.appendChild(addTaskBtnIconEl);
    addTaskFormEl.appendChild(addTaskInputEl);
    addTaskFormEl.appendChild(addTaskBtnEl);
    container.appendChild(addTaskFormEl);
  
    addTaskFormEl.addEventListener('submit', (event) => {
      event.preventDefault();
      if (addTaskInputEl.value) {
        PubSub.publish('NEW_TASK', [addTaskInputEl.value, indexVal]);
      }
    });
  };

  const formatDueDate = (dueDate) => {
    if (isYesterday(dueDate)) {
      return 'Yesterday';
    } else if (isToday(dueDate)) {
      return 'Today';
    } else if (isTomorrow(dueDate)) {
      return 'Tomorrow';
    } else if (isBefore(dueDate, new Date())) {
      return `${formatDistanceToNow(dueDate)} ago`;
    } else {
      return formatDistanceToNow(dueDate);
    }
  };
})();

PubSub.publish('INITIALIZE_PAGE');