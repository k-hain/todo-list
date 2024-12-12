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
import deleteIcon from './svg/delete_forever_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';

const displayController = (function () {
  const contentEl = document.getElementById('content');
  const sidebarEl = document.getElementById('sidebar');
  const detailsEl = document.getElementById('details');
  const listsEl = document.createElement('div');

  let displayedListIndex;
  let displayedTaskIndex = 0;

  const drawDomElement = (elType, container, cssClasses, text) => {
    const domEl = document.createElement(elType);
    container.appendChild(domEl);
    if (cssClasses !== undefined && cssClasses.length) {
      addCssClasses(domEl, cssClasses);
    }
    if (text) {
      domEl.textContent = text;
    }
    return domEl;
  };

  const drawImgElement = (imgSrc, container, cssClasses) => {
    const domEl = document.createElement('img');
    container.appendChild(domEl);
    domEl.src = imgSrc;
    if (cssClasses !== undefined && cssClasses.length) {
      addCssClasses(domEl, cssClasses);
    }
    return domEl;
  };

  const addCssClasses = (el, cssClasses) => {
    cssClasses.forEach((cssClass) => {
      el.classList.add(cssClass);
    });
  };

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
    const listsHeaderEl = drawDomElement('div', container, ['lists-header']);
    drawDomElement('h3', listsHeaderEl, [], 'My lists');
    const addListBtnEl = drawDomElement('button', listsHeaderEl, ['add-list-btn']);
    drawImgElement(addIcon, addListBtnEl);

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
  };

  const drawSidebarButtons = (msg, listNames) => {
    clearContents(listsEl);
    listNames.forEach((listName) => {
      const listNameEl = drawDomElement('button', listsEl, [], listName);
      listNameEl.addEventListener('click', () => {
        displayedTaskIndex = 0;
        PubSub.publish('SEND_LIST_TO_DRAW', listNames.indexOf(listName));
      });
    });
  };
  const drawSidebarButtonsToken =
    PubSub.subscribe('UPDATE_LIST_NAMES', drawSidebarButtons);

  const drawListPage = (msg, [listName, tasksArr, listIndex]) => {
    displayedListIndex = listIndex;
    clearContents(contentEl);
    clearContents(detailsEl);
    drawDomElement('h1', contentEl, ['page-header'], listName);
    drawTaskContainer(tasksArr, contentEl, listIndex);
    drawNewTaskForm(listIndex, contentEl);
  };
  const drawListToken = PubSub.subscribe('DRAW_LIST_PAGE', drawListPage);

  const drawTaskContainer = (tasksArr, container, listIndex) => {
    const taskContainerEl = drawDomElement('div', container, ['task-container']);
    if (tasksArr.length) {
      tasksArr.forEach((task) => {
        drawTask(task, taskContainerEl, tasksArr.indexOf(task), listIndex);
      });
      Sortable.create(taskContainerEl, taskContainerOptions);
      PubSub.publish('DRAW_TASK_DETAILS', [tasksArr[displayedTaskIndex], displayedTaskIndex, listIndex])
    }
  };

  const taskContainerOptions = {
    animation: 100,
    ghostClass: 'task-container-ghost',
    onEnd: (evt) => {
      if (evt.oldIndex !== evt.newIndex) {
        if (evt.oldIndex === displayedTaskIndex) {
          displayedTaskIndex = evt.newIndex;
        } else if (
          evt.oldIndex > displayedTaskIndex &&
          evt.newIndex < displayedTaskIndex
        ) {
          displayedTaskIndex -= 1;
        } else if (
          evt.oldIndex < displayedTaskIndex &&
          evt.newIndex > displayedTaskIndex
        ) {
          displayedTaskIndex += 1;
        }
        PubSub.publish(
          'DRAG_TASK',
          [displayedListIndex, evt.oldIndex, evt.newIndex]
        );
      }
    }
  };

  const drawTask = (task, container, taskIndex, listIndex) => {
    const taskEl = drawDomElement('div', container, ['task-card']);
    if (task.isFinished) {
      taskEl.classList.add('task-finished');
    }
    drawTaskDoneButton(taskEl, task, taskIndex, listIndex);
    drawTaskBody(taskEl, task, taskIndex, listIndex);

    taskEl.addEventListener('click', () => {
      displayedTaskIndex = taskIndex;
      PubSub.publish('SEND_TASK_TO_DRAW', [listIndex, taskIndex]);
    });
  };

  const drawTaskDoneButton = (container, task, taskIndex, listIndex) => {
    const taskButtonContainerEl = drawDomElement(
      'div', container, ['task-button-container']
    );
    const taskButtonDoneEl = drawDomElement(
      'button', taskButtonContainerEl, ['task-done-button']
    );

    taskButtonDoneEl.addEventListener('click', () => {
      PubSub.publish('CHANGE_TASK_ISFINISHED', [listIndex, taskIndex]);
    });

    const taskIconEl = drawImgElement(
      taskIconEmpty, taskButtonDoneEl, ['task-icon']
    );
    const taskIconHoverEl = drawImgElement(
      taskIconChecked, taskButtonContainerEl, ['task-icon-hover']
    );
    if (task.isFinished) {
      taskIconHoverEl.src = taskIconEmpty;
      taskIconEl.src = taskIconChecked;
    }

    addPriorityStyling(taskIconEl, task);
    addPriorityStyling(taskIconHoverEl, task);

  };

  const drawTaskBody = (container, task, taskIndex, listIndex) => {
    const taskHeaderEl = drawDomElement('div', container, ['task-header']);
    drawDomElement('h4', taskHeaderEl, [], task.name);
    const taskDueEl = drawDomElement('div', taskHeaderEl, ['due-date-container']);

    const taskDuePickerEl = document.createElement('input');
    taskDuePickerEl.type = 'date';
    taskDuePickerEl.id = 'date-picker';
    taskDuePickerEl.value = formatISO(task.dueDate, { representation: 'date' });
    taskDueEl.appendChild(taskDuePickerEl);

    const taskDueButtonEl = drawDomElement('button', taskDueEl, ['due-date']);
    drawImgElement(dueIcon, taskDueButtonEl);
    drawDomElement('span', taskDueButtonEl, [], formatDueDate(task.dueDate));

    taskDueButtonEl.addEventListener('click', (evt) => {
      evt.stopPropagation();
      taskDuePickerEl.showPicker();
    });

    taskDuePickerEl.addEventListener('input', (evt) => {
      if (!taskDuePickerEl.value) {
        taskDuePickerEl.value = formatISO(new Date(), { representation: 'date' });
      }
      PubSub.publish('CHANGE_TASK_DATE', [
        listIndex, taskIndex, taskDuePickerEl.value
      ])
    });
  };

  const addPriorityStyling = (element, task) => {
    if (task.priority === 0) {
      element.classList.add('priority-0');
    } else if (task.priority === 1) {
      element.classList.add('priority-1');
    } else if (task.priority === 2) {
      element.classList.add('priority-2');
    }
  };

  const drawNewTaskForm = (indexVal, container) => {
    const addTaskFormEl = drawDomElement('form', container, ['add-task']);

    const addTaskInputEl = document.createElement('input');
    addTaskInputEl.type = 'text';
    addTaskInputEl.placeholder = 'Add new task';
    addTaskFormEl.appendChild(addTaskInputEl);

    const addTaskBtnEl = drawDomElement('button', addTaskFormEl);
    drawImgElement(addIcon, addTaskBtnEl);
  
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

  const getPriorityName = (priority) => {
    if (priority === 0) {
      return 'High priority';
    } else if (priority === 1) {
      return 'Medium priority';
    } else if (priority === 2) {
      return 'Low priority';
    }
  };

  const drawTaskDetails = (msg, [task, taskIndex, listIndex]) => {
    clearContents(detailsEl);
    const detailsContainerEl = drawDomElement('div', detailsEl, ['details-container']);
    const detailsHeaderContainerEl = drawDomElement('div', detailsContainerEl, ['details-header-container']);
    drawDomElement('h1', detailsHeaderContainerEl, [], task.name);
    const deleteTaskButtonEl = drawDomElement('button', detailsHeaderContainerEl, ['button-wide']);
    deleteTaskButtonEl.addEventListener('click', () => {
      if(confirm(`Delete ${task.name}?`)) {
        PubSub.publish('DELETE_TASK', [listIndex, taskIndex]);
      }
    });
    drawImgElement(deleteIcon, deleteTaskButtonEl);
    drawDomElement('span', deleteTaskButtonEl, [], 'Delete task');
    drawDomElement('div', detailsContainerEl, [], formatDueDate(task.dueDate));
    drawDomElement('div', detailsContainerEl, [], getPriorityName(task.priority));
    drawDomElement('div', detailsContainerEl, [], task.description);
  };
  const drawTaskDetailsToken =
    PubSub.subscribe('DRAW_TASK_DETAILS', drawTaskDetails);
})();

PubSub.publish('INITIALIZE_PAGE');