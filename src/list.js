import { addDays, setMilliseconds, setSeconds, setMinutes, setHours } from "date-fns";

export const listController = (function () {
  class Task {
    constructor (name) {
      this.name = name;
      this.description = '';
      this.dueDate = addDays(
        setHours(
          setMinutes(
            setSeconds(
              setMilliseconds(new Date(), 0), 0
            ), 0
          ), 0
        ), 1
      );
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

  const addList = (name) => {
      lists.push(new List(name));
      PubSub.publish('SAVE_DATA', lists);
  };

  const updateListNames = () => {
    const listNames = lists.map((el) => el.name);
    PubSub.publish('UPDATE_LIST_NAMES', listNames);
  };

  const reviveListData = (msg, storedData) => {
    if (storedData) {
      lists = [];
      storedData.forEach((elList) => {
        const newList = new List(elList.name);
        elList.tasks.forEach((elTask) => {
          newList.addTask(elTask.name);
        });
        lists.push(newList);
      });
    } else {
      addList('Personal');
    }
    updateListNames();
    PubSub.publish('SEND_LIST_TO_DRAW', 0);
  };
  const reviveListDataToken = PubSub.subscribe('REVIVE_DATA', reviveListData);

  const requestNewList = (msg, name) => {
    addList(name);
    updateListNames();
  };
  const requestNewListToken = PubSub.subscribe('NEW_LIST', requestNewList);

  const sendListToDraw = (msg, listIndex) => {
    PubSub.publish('DRAW_LIST_PAGE', [
      lists[listIndex].name,
      lists[listIndex].tasks,
      listIndex
    ]);
  }
  const sendListToDrawToken =
    PubSub.subscribe('SEND_LIST_TO_DRAW', sendListToDraw);
  
  const requestAddTask = (msg, [taskName, listIndex]) => {
    lists[listIndex].addTask(taskName);
    PubSub.publish('SAVE_DATA', lists);
    PubSub.publish('SEND_LIST_TO_DRAW', listIndex);
  };
  const requestAddTaskToken = PubSub.subscribe('NEW_TASK', requestAddTask);
})();