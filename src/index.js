import PubSub from 'pubsub-js';
import './style.css';
import { listController } from './list';
import { storageController } from './storage';

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
        clearContents(contentEl);
        showListPage(list);
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

  const showListPage = (list) => {
    const listNameEl = document.createElement('h1');
    listNameEl.textContent = list.name;
    content.appendChild(listNameEl);
    list.tasks.forEach((task) => {
      const taskEl = document.createElement('div');
      taskEl.textContent = task.name;
      content.appendChild(taskEl);
    });
  };
})();

PubSub.publish('PAGE_INITIALIZE');