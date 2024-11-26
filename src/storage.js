export const storageController = (function () {
  const saveLists = (msg, lists) => {
    localStorage.lists = JSON.stringify(lists);
  };
  const listsSaveToken = 
    PubSub.subscribe('SAVE_DATA', saveLists);

  const loadLists = (msg) => {
    PubSub.publish('REVIVE_DATA', JSON.parse(localStorage.getItem('lists')));
  };
  const pageInitializeToken = 
    PubSub.subscribe('LOAD_DATA', loadLists);
})();