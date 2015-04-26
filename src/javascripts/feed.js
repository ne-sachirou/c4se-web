/* jshint browser:true, strict:false */

function h(elmName, attrs, childs) {
  var elm = document.createElement(elmName);
  for (let attrName of Object.keys(attrs)) {
    elm.setAttribute(attrName, attrs[attrName]);
  }
  for (let child of childs) {
    if (typeof child === 'string' || child instanceof String) {
      child = document.createTextNode(child);
    }
    elm.appendChild(child);
  }
  return elm;
}

function showFeed(target) {
  var count = parseInt(target.dataset.feedCount),
      req   = new XMLHttpRequest();
  req.open('GET', `/api/feed?url=${encodeURIComponent(target.dataset.feedUrl)}&count=${count}`);
  req.send();
  req.onload = () => {
    var i        = 1,
        feed     = JSON.parse(req.responseText),
        fragment = document.createDocumentFragment();
    for (let entry of feed.entries) {
      var entryNode = h('section', {'class' : 'feed_entry'}, [
          h('h1', {}, [
            h('a', {href : entry.link}, [entry.title]),
          ]),
          h('p', {}, [entry.summary]),
          h('div', {'class' : 'feed_entry_updated'}, [entry.updated || entry.published]),
      ]);
      fragment.appendChild(entryNode);
      ++i;
      if (i > count) {
        break;
      }
    }
    target.appendChild(fragment);
  };
  req.onerror = () => console.error(req);
}

window.addEventListener('DOMContentLoaded', () => {
  for (let node of Array.from(document.querySelectorAll('.feed'))) {
    showFeed(node);
  }
});
