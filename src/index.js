import PubSub from 'pubsub-js';
import './style.css';
import { listController } from './list';
import { storageController } from './storage';

import addIcon from './svg/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';

const displayController = (function () {
  const contentEl = document.getElementById('content');
  const listsEl = document.getElementById('lists');
  const addListBtn = document.getElementById('add-list-btn');

  const initializeNavButtons = (msg) => {
    addListBtn.addEventListener('click', () => {
      let newName;
      let keepGoing = true;
      while (keepGoing) {
        newName = prompt('Add a list name');
        if (newName) {
          PubSub.publish('LIST_ADD_NEW', newName);
          keepGoing = false;
        } else if (newName === null) {
          keepGoing = false;
        }
      }
    });
  };

  const pageInitializeToken = 
    PubSub.subscribe('PAGE_INITIALIZE', initializeNavButtons);

  const clearContents = (domElement) => {
    while(domElement.firstChild){
      domElement.removeChild(domElement.firstChild);
    }
  };

  const printListsNav = (lists) => {
    lists.forEach((list) => {
      const listNameEl = document.createElement('button');
      listNameEl.textContent = list.name;
      listNameEl.addEventListener('click', () => {
        PubSub.publish('LIST_PAGE_DRAW', [list, lists.indexOf(list)]);
      });
      listsEl.appendChild(listNameEl);
    });
  };

  const updateListsNav = (msg, lists) => {
    clearContents(listsEl);
    printListsNav(lists);
  };

  const listsDrawToken = 
    PubSub.subscribe('LISTS_DRAW', updateListsNav);

  const printTask = (task, container) => {
    const taskEl = document.createElement('div');
    taskEl.textContent = task.name;
    taskEl.classList.add('task-card');
    container.appendChild(taskEl);
  };

  const drawListPage = (msg, [list, listIndex]) => {
    clearContents(contentEl);

    const listNameEl = document.createElement('h1');
    listNameEl.textContent = list.name;
    content.appendChild(listNameEl);

    const taskContainerEl = document.createElement('div');
    taskContainerEl.classList.add('task-container');
    list.tasks.forEach((task) => {
      printTask(task, taskContainerEl);
    });
    content.appendChild(taskContainerEl);

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
    contentEl.appendChild(addTaskFormEl);

    addTaskFormEl.addEventListener('submit', (event) => {
      event.preventDefault();
      PubSub.publish('TASK_ADD_NEW', [addTaskInputEl.value, listIndex]);
    });
  };

  const listPageDrawToken =
    PubSub.subscribe('LIST_PAGE_DRAW', drawListPage);
})();

PubSub.publish('PAGE_INITIALIZE');