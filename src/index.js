import PubSub from 'pubsub-js';
import './style.css';
import { listController } from './list';
import { storageController } from './storage';
import {
  isToday,
  isTomorrow,
  isYesterday,
  formatDistanceToNow,
  isBefore,
} from 'date-fns';
import Sortable from 'sortablejs';

import addIcon from './svg/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';

const displayController = (function () {
  const contentEl = document.getElementById('content');
  const sidebarEl = document.getElementById('sidebar');
  const detailsEl = document.getElementById('details');
  const listsEl = document.createElement('div');

  let displayedListIndex;

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
    displayedListIndex = listIndex;
    clearContents(contentEl);
    clearContents(detailsEl);
    drawHeader(listName, contentEl);
    drawTaskContainer(tasksArr, contentEl, listIndex);
    drawNewTaskForm(listIndex, contentEl);
  };
  const drawListToken = PubSub.subscribe('DRAW_LIST_PAGE', drawListPage);

  const drawHeader = (text, container) => {
    const headerEl = document.createElement('h1');
    headerEl.textContent = text;
    headerEl.classList.add('page-header');
    container.appendChild(headerEl);
  };

  const drawTaskContainer = (tasksArr, container, listIndex) => {
    const taskContainerEl = document.createElement('div');
    taskContainerEl.classList.add('task-container');
    tasksArr.forEach((task) => {
      drawTask(task, taskContainerEl, tasksArr.indexOf(task), listIndex);
    });
    Sortable.create(taskContainerEl, taskContainerOptions);
    container.appendChild(taskContainerEl);
  };

  const taskContainerOptions = {
    animation: 100,
    ghostClass: 'task-container-ghost',
    onEnd: (evt) => {
      if (evt.oldIndex !== evt.newIndex) {
        PubSub.publish(
          'DRAG_TASK',
          [displayedListIndex, evt.oldIndex, evt.newIndex]
        );
      }
    }
  };

  const drawTask = (task, container, taskIndex, listIndex) => {
    const taskEl = document.createElement('div');

    const taskNameEl = document.createElement('div');
    taskNameEl.textContent = task.name;
    taskEl.appendChild(taskNameEl);
    
    const taskDueEl = document.createElement('div');
    taskDueEl.classList.add('due-date');
    taskDueEl.textContent = formatDueDate(task.dueDate);
    taskEl.appendChild(taskDueEl);

    taskEl.addEventListener('click', () => {
      PubSub.publish('SEND_TASK_TO_DRAW', [listIndex, taskIndex]);
    })

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

  const drawTaskDetails = (msg, [task, listIndex]) => {
    clearContents(detailsEl);
    drawHeader(task.name, detailsEl);

    const taskDueDateEl = document.createElement('div');
    taskDueDateEl.textContent = formatDueDate(task.dueDate);
    detailsEl.appendChild(taskDueDateEl);

    const priorityEl = document.createElement('div');
    if (task.priority === 0) {
      priorityEl.textContent = 'High priority';
    } else if (task.priority === 1) {
      priorityEl.textContent = 'Medium priority';
    } else if (task.priority === 2) {
      priorityEl.textContent = 'Low priority';
    }
    detailsEl.appendChild(priorityEl);

    const descriptionEl = document.createElement('div');
    descriptionEl.textContent = task.description;
    detailsEl.appendChild(descriptionEl);
  };
  const drawTaskDetailsToken =
    PubSub.subscribe('DRAW_TASK_DETAILS', drawTaskDetails);
})();

PubSub.publish('INITIALIZE_PAGE');