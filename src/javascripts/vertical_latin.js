/* jshint browser:true, strict:false */
/* global Taketori */

window.addEventListener('DOMContentLoaded', () => {
  var taketori = new Taketori();
  taketori.set({}).element('div.vertical-content').toVertical();
});
