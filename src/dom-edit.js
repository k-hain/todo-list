export const drawDomElement = (elType, container, cssClasses, text) => {
  const domEl = document.createElement(elType);
  container.appendChild(domEl);
  if (cssClasses !== undefined && cssClasses.length) {
    addCssClasses(domEl, cssClasses);
  }
  if (text) {
    domEl.textContent = text;
  }
  return domEl;
};

export const drawImgElement = (imgSrc, container, cssClasses) => {
  const domEl = document.createElement('img');
  container.appendChild(domEl);
  domEl.src = imgSrc;
  if (cssClasses !== undefined && cssClasses.length) {
    addCssClasses(domEl, cssClasses);
  }
  return domEl;
};

const addCssClasses = (el, cssClasses) => {
  cssClasses.forEach((cssClass) => {
    el.classList.add(cssClass);
  });
};

export const clearContents = (domEl) => {
  while(domEl.firstChild){
    domEl.removeChild(domEl.firstChild);
  }
};

export const preventNewLineOnEnter = (el) => {
  el.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      if (el === document.activeElement) {
        el.blur();
      }
    }
  });
};

export const addHeaderBlurEvent = (el, publishFunc, listIndex, taskIndex) => {
  el.addEventListener('blur', (evt) => {
    if (evt.target.value.length) {
      if (taskIndex === undefined) {
        publishFunc(listIndex, evt.target.value);
      } else {
        publishFunc(listIndex, taskIndex, evt.target.value);
      }
    } else if (!evt.target.value.length) {
      alert("Name can't be empty!");
      setTimeout(() => {
        el.focus();
      }, 1);
    }
  });
};