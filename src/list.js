export const listController = (function () {
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

  let lists = [];

  const addNewList = (msg, name) => {
    const newList = new List(name);
    newList.tasks.push(new Task('My first task'));
    lists.push(newList);
    PubSub.publish('LISTS_DRAW', lists);
    PubSub.publish('LISTS_SAVE', lists);
  };

  const listAddNewToken = 
    PubSub.subscribe('LIST_ADD_NEW', addNewList);

  const loadLists = (msg, loadedLists) => {
    lists = loadedLists;
    PubSub.publish('LISTS_DRAW', lists);
  };

  const listsLoadToken =
    PubSub.subscribe('LISTS_LOAD', loadLists);
})();