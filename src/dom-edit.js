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