import PubSub from 'pubsub-js';
import './style.css';
import { ListController } from './list';
import { StorageController } from './storage';

class DisplayController {
  static #listsEl = document.getElementById('lists');
  static #addListBtn = document.getElementById('add-list-btn');

  static #initializeNavButtons(msg) {
    DisplayController.#addListBtn.addEventListener('click', () => {
      let newName;
      while (!newName) {
        newName = prompt('Add a list name');
      }
      PubSub.publish('LIST_ADD_NEW', newName);
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
      const listNameEl = document.createElement('div');
      listNameEl.textContent = list.name;
      DisplayController.#listsEl.appendChild(listNameEl);
    });
  }

  static #updateListsNav(msg, lists) {
    DisplayController.#clearContents(DisplayController.#listsEl);
    DisplayController.#printListsNav(lists);
  }

  static #listsDrawToken = 
    PubSub.subscribe('LISTS_DRAW', DisplayController.#updateListsNav);
}

PubSub.publish('PAGE_INITIALIZE');