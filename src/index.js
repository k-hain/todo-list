import PubSub from 'pubsub-js';
import './style.css';
import { ListController } from './list';

class DisplayController {
  static #listsEl = document.querySelector('#lists');

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

  static #listsUpdateToken = 
    PubSub.subscribe('LISTS_UPDATE', DisplayController.#updateListsNav);
}

PubSub.publish('LIST_ADD_NEW', 'Personal');
PubSub.publish('LIST_ADD_NEW', 'Work');