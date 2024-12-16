import { addDays, setMilliseconds, setSeconds, setMinutes, setHours } from "date-fns";

export const listController = (function () {
  class Task {
    constructor (name, priority, dueDate, description, isFinished) {
      this.name = name;
      this.description = description;
      this.dueDate = dueDate;
      this.priority = priority;
      this.isFinished = isFinished;
    }
  }

  class List {
    constructor (name) {
      this.name = name;
      this.tasks = [];
    }

    addTask(
      taskName, taskPriority, taskDueDate, taskDescription, taskIsFinished
    ) {
      this.tasks.push(new Task(
        taskName,
        taskPriority,
        taskDueDate,
        taskDescription,
        taskIsFinished
      ));
    }

    deleteTask(taskIndex) {
      this.tasks.splice(taskIndex, 1);
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
          newList.addTask(
            elTask.name,
            elTask.priority,
            elTask.dueDate,
            elTask.description,
            elTask.isFinished
          );
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

  const zeroedDate = (date) => {
    return setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), 0);
  };

  const saveAndPrintList = (listIndex) => {
    PubSub.publish('SAVE_DATA', lists);
    PubSub.publish('SEND_LIST_TO_DRAW', listIndex);
  };

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
  };
  const sendListToDrawToken =
    PubSub.subscribe('SEND_LIST_TO_DRAW', sendListToDraw);
  
  const requestAddTask = (msg, [taskName, listIndex]) => {
    lists[listIndex]
    .addTask(taskName, 1, addDays(zeroedDate(new Date()), 1), '', 0);
    saveAndPrintList(listIndex);
  };
  const requestAddTaskToken = PubSub.subscribe('NEW_TASK', requestAddTask);

  const requestDeleteTask = (msg, [listIndex, taskIndex]) => {
    lists[listIndex].deleteTask(taskIndex);
    saveAndPrintList(listIndex);
  };
  const requestDeleteTaskToken =
    PubSub.subscribe('DELETE_TASK', requestDeleteTask);

  const sendTaskToDraw = (msg, [listIndex, taskIndex]) => {
    PubSub.publish('DRAW_TASK_DETAILS', [
      lists[listIndex].tasks[taskIndex],
      taskIndex,
      listIndex
    ]);   
  };
  const sendTaskToDrawToken =
    PubSub.subscribe('SEND_TASK_TO_DRAW', sendTaskToDraw);

  const requestDragTask = (msg, [listIndex, oldIndex, newIndex]) => {
    let start = oldIndex;
    let end = newIndex;
    let arr = lists[listIndex].tasks;

    if (start < end) {
      for (let i = start; i < end; i++) {
        arr.splice(i + 2, 0, arr[i]);
        arr.splice(i, 1);
      }
    } else if (start > end) {
      for (let i = start; i > end; i--) {
        arr.splice(i - 1, 0, arr[i]);
        arr.splice(i + 1, 1);
      }
    }

    saveAndPrintList(listIndex);
  };
  const requestDragTaskToken =
    PubSub.subscribe('DRAG_TASK', requestDragTask);

  const requestChangeListName = (
    msg, [listIndex, newName]
  ) => {
    lists[listIndex].name = newName;
    updateListNames();
    saveAndPrintList(listIndex);
  };
  const requestChangeListNameToken =
    PubSub.subscribe('CHANGE_LIST_NAME', requestChangeListName);

  const requestChangeTaskDate = (msg, [listIndex, taskIndex, inputDate]) => {
    lists[listIndex].tasks[taskIndex].dueDate = zeroedDate(new Date(inputDate));
    saveAndPrintList(listIndex);
  };
  const requestChangeTaskDateToken =
    PubSub.subscribe('CHANGE_TASK_DATE', requestChangeTaskDate);

  const requestChangeTaskPriority = (
    msg, [listIndex, taskIndex, newPriority]
  ) => {
    lists[listIndex].tasks[taskIndex].priority = newPriority;
    saveAndPrintList(listIndex);
  };
  const requiestChangeTaskPriorityToken =
    PubSub.subscribe('CHANGE_TASK_PRIORITY', requestChangeTaskPriority);

  const requestChangeTaskName = (
    msg, [listIndex, taskIndex, newName]
  ) => {
    lists[listIndex].tasks[taskIndex].name = newName;
    saveAndPrintList(listIndex);
  };
  const requestChangeTaskNameToken =
    PubSub.subscribe('CHANGE_TASK_NAME', requestChangeTaskName);

  const requestChangeTaskDescription = (
    msg, [listIndex, taskIndex, newDescription]
  ) => {
    lists[listIndex].tasks[taskIndex].description = newDescription;
    saveAndPrintList(listIndex);
  };
  const requestChangeTaskDescriptionToken =
    PubSub.subscribe('CHANGE_TASK_DESCRIPTION', requestChangeTaskDescription);

  const requestChangeTaskIsFinished = (msg, [listIndex, taskIndex]) => {
    if (!lists[listIndex].tasks[taskIndex].isFinished) {
      lists[listIndex].tasks[taskIndex].isFinished = 1;
    } else if (lists[listIndex].tasks[taskIndex].isFinished) {
      lists[listIndex].tasks[taskIndex].isFinished = 0;
    }
    saveAndPrintList(listIndex);
  };
  const requestChangeTaskIsFinishedToken =
    PubSub.subscribe('CHANGE_TASK_ISFINISHED', requestChangeTaskIsFinished);
})();