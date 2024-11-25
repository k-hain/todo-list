export const storageController = (function () {
  const saveLists = (msg, lists) => {
    localStorage.lists = JSON.stringify(lists);
  };

  const listsSaveToken = 
    PubSub.subscribe('LISTS_SAVE', saveLists);

  const getStoredLists = (msg) => {
    const localLists = localStorage.getItem('lists');
    if (!localLists) {
      PubSub.publish('LIST_ADD_NEW', 'Personal');
    } else {
      PubSub.publish('LISTS_LOAD', JSON.parse(localLists));
    }
  };

  const pageInitializeToken = 
    PubSub.subscribe('PAGE_INITIALIZE', getStoredLists);
})();