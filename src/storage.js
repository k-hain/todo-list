export class StorageController {

  static #saveLists(msg, lists) {
    localStorage.lists = JSON.stringify(lists);
  }

  static #listsSaveToken = 
    PubSub.subscribe('LISTS_SAVE', StorageController.#saveLists);

  static #getStoredLists(msg) {
    if (!localStorage.getItem('lists')) {
      PubSub.publish('LIST_ADD_NEW', 'Personal');
    } else {
      PubSub.publish('LISTS_LOAD', JSON.parse(localStorage.getItem('lists')));
    }
  }

  static #pageInitializeToken = 
    PubSub.subscribe('PAGE_INITIALIZE', StorageController.#getStoredLists);
}