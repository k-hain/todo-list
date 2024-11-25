import PubSub from 'pubsub-js';
import './style.css';
import { ListController } from './list';
import { StorageController } from './storage';

class DisplayController {
  static #contentEl = document.getElementById('content');
  static #listsEl = document.getElementById('lists');
  static #addListBtn = document.getElementById('add-list-btn');

  static #initializeNavButtons(msg) {
    DisplayController.#addListBtn.addEventListener('click', () => {
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
  }

  static #pageInitializeToken = 
    PubSub.subscribe('PAGE_INITIALIZE', DisplayController.#initializeNavButtons);

  static #clearContents(domElement) {
    while(domElement.firstChild){
      domElement.removeChild(domElement.firstChild);
    }
  }

  static #printListsNav(lists) {
    lists.forEach((list) => {
      const listNameEl = document.createElement('button');
      listNameEl.textContent = list.name;
      listNameEl.addEventListener('click', () => {
        DisplayController.#clearContents(DisplayController.#contentEl);
        DisplayController.#showListPage(list);
      });
      DisplayController.#listsEl.appendChild(listNameEl);
    });
  }

  static #updateListsNav(msg, lists) {
    DisplayController.#clearContents(DisplayController.#listsEl);
    DisplayController.#printListsNav(lists);
  }

  static #listsDrawToken = 
    PubSub.subscribe('LISTS_DRAW', DisplayController.#updateListsNav);

  static #showListPage(list) {
    const listNameEl = document.createElement('h1');
    listNameEl.textContent = list.name;
    content.appendChild(listNameEl);
    list.tasks.forEach((task) => {
      const taskEl = document.createElement('div');
      taskEl.textContent = task.name;
      content.appendChild(taskEl);
    });
  }
}

PubSub.publish('PAGE_INITIALIZE');