import PubSub from 'pubsub-js';
import './style.css';

class DisplayController {
  static #listsEl = document.querySelector('#lists');

  static #clearContents(domElement) {
    while(domElement.firstChild){
      domElement.removeChild(domElement.firstChild);
    }
  }

  static #printListsNav(listNames) {
    listNames.forEach((listName) => {
      const listNameEl = document.createElement('div');
      listNameEl.textContent = listName;
      DisplayController.#listsEl.appendChild(listNameEl);
    });
  }

  static #updateListsNav(msg, lists) {
    DisplayController.#clearContents(DisplayController.#listsEl);
    DisplayController.#printListsNav(lists);
  }

  static #listsUpdateDisplayToken = 
    PubSub.subscribe('LISTS_UPDATE_DISPLAY', DisplayController.#updateListsNav);
}

PubSub.publish('LISTS_UPDATE_DISPLAY', ['List 1', 'List 2', 'List 3']);