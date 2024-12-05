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
  formatISO,
} from 'date-fns';
import Sortable from 'sortablejs';

import addIcon from './svg/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import taskIconEmpty from './svg/circle_16dp_000000_FILL0_wght400_GRAD0_opsz20.svg';
import taskIconChecked from './svg/task_alt_16dp_000000_FILL0_wght400_GRAD0_opsz20.svg';
import dueIcon from './svg/calendar_month_16dp_000000_FILL0_wght400_GRAD0_opsz20.svg';

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
    drawTaskDoneButton(taskEl, task, taskIndex, listIndex);
    drawTaskBody(taskEl, task, taskIndex, listIndex);
    container.appendChild(taskEl);
  };

  const drawTaskDoneButton = (container, task, taskIndex, listIndex) => {
    const taskButtonContainerEl = document.createElement('div');
    taskButtonContainerEl.classList.add('task-button-container');

    const taskButtonDoneEl = document.createElement('button');
    taskButtonDoneEl.classList.add('task-done-button');

    taskButtonDoneEl.addEventListener('click', () => {
      PubSub.publish('CHANGE_TASK_ISFINISHED', [listIndex, taskIndex]);
    });

    const taskIconEl = document.createElement('img');
    taskIconEl.classList.add('task-icon');
    if (task.priority === 0) {
      taskIconEl.classList.add('priority-0');
    } else if (task.priority === 1) {
      taskIconEl.classList.add('priority-1');
    } else if (task.priority === 2) {
      taskIconEl.classList.add('priority-2');
    }    
    taskButtonDoneEl.appendChild(taskIconEl);
    
    const taskIconHoverEl = document.createElement('img');
    if (task.priority === 0) {
      taskIconHoverEl.classList.add('priority-0');
    } else if (task.priority === 1) {
      taskIconHoverEl.classList.add('priority-1');
    } else if (task.priority === 2) {
      taskIconHoverEl.classList.add('priority-2');
    }
    taskIconHoverEl.classList.add('task-icon-hover');

    if (task.isFinished) {
      taskIconHoverEl.src = taskIconEmpty;
      taskIconEl.src = taskIconChecked;
    } else if (!task.isFinished) {
      taskIconHoverEl.src = taskIconChecked;
      taskIconEl.src = taskIconEmpty;
    }

    taskButtonContainerEl.appendChild(taskButtonDoneEl);
    taskButtonContainerEl.appendChild(taskIconHoverEl);
    container.appendChild(taskButtonContainerEl);
  };

  const drawTaskBody = (container, task, taskIndex, listIndex) => {
    const taskHeaderEl = document.createElement('div');
    taskHeaderEl.classList.add('task-header');
    
    const taskNameEl = document.createElement('h4');
    taskNameEl.textContent = task.name;
    taskHeaderEl.appendChild(taskNameEl);

    const taskDueEl = document.createElement('div');
    taskDueEl.classList.add('due-date-container');
    taskHeaderEl.appendChild(taskDueEl);

    const taskDuePickerEl = document.createElement('input');
    taskDuePickerEl.type = 'date';
    taskDuePickerEl.id = 'date-picker';
    taskDuePickerEl.value = formatISO(task.dueDate, { representation: 'date' });
    taskDueEl.appendChild(taskDuePickerEl);

    const taskDueButtonEl = document.createElement('button');
    taskDueButtonEl.classList.add('due-date');

    const taskDueIconEl = document.createElement('img');
    taskDueIconEl.src = dueIcon;
    taskDueButtonEl.appendChild(taskDueIconEl);

    const taskDueLabelEl = document.createElement('span');
    taskDueLabelEl.textContent = formatDueDate(task.dueDate);
    taskDueButtonEl.appendChild(taskDueLabelEl);

    taskDueEl.appendChild(taskDueButtonEl);

    taskDueButtonEl.addEventListener('click', (evt) => {
      evt.stopPropagation();
      taskDuePickerEl.showPicker();
    });

    taskDuePickerEl.addEventListener('input', (evt) => {
      console.log(taskDuePickerEl.value);
      PubSub.publish('CHANGE_TASK_DATE', [listIndex, taskIndex, taskDuePickerEl.value])
    });

    container.appendChild(taskHeaderEl);

    container.addEventListener('click', () => {
      PubSub.publish('SEND_TASK_TO_DRAW', [listIndex, taskIndex]);
    });

    container.classList.add('task-card');
    if (task.isFinished) {
      container.classList.add('task-finished');
    }
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