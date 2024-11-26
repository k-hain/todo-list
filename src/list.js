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

    addTask(taskName) {
      this.tasks.push(new Task(taskName));
    }

    deleteTask(taskIndex) {
      this.tasks.splice(taskIndex, 0);
    }
  }

  let lists = [];

  const addNewList = (msg, name) => {
    lists.push(new List(name));
    PubSub.publish('LISTS_DRAW', lists);
    PubSub.publish('LISTS_SAVE', lists);
  };

  const listAddNewToken = 
    PubSub.subscribe('LIST_ADD_NEW', addNewList);

  const loadLists = (msg, loadedLists) => {
    lists = [];
    loadedLists.forEach((listElement) => {
      const newList = new List(listElement.name);
      listElement.tasks.forEach((task) => {
        newList.addTask(task.name);
      })
      lists.push(newList);
    })
    PubSub.publish('LISTS_DRAW', lists);
  };

  const listsLoadToken =
    PubSub.subscribe('LISTS_LOAD', loadLists);

  const addTaskToList = (msg, [taskName, listIndex]) => {
    lists[listIndex].addTask(taskName);
    PubSub.publish('LISTS_SAVE', lists);
    PubSub.publish('LIST_PAGE_DRAW', [lists[listIndex], listIndex]);
  };

  const taskAddNewToken = PubSub.subscribe('TASK_ADD_NEW', addTaskToList);
})();