class Task {
  constructor (name) {
    this.name = name;
    this.description = '';
    this.dueDate = new Date();
    this.priority = 0;
  }
}

class List {
  constructor (name) {
    this.name = name;
    this.tasks = [];
  }
}

export class ListController {
  static #lists = [];

  static #addNewList(msg, name) {
    ListController.#lists.push(new List(name));
    PubSub.publish('LISTS_DRAW', ListController.#lists);
    PubSub.publish('LISTS_SAVE', ListController.#lists);
  }

  static #listAddNewToken = 
    PubSub.subscribe('LIST_ADD_NEW', ListController.#addNewList);

  static #loadLists(msg, loadedLists) {
    ListController.#lists = loadedLists;
    PubSub.publish('LISTS_DRAW', ListController.#lists);
  }

  static #listsLoadToken =
    PubSub.subscribe('LISTS_LOAD', ListController.#loadLists);
}