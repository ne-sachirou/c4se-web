var $___95_baselib_46_js__=function(){"use strict";function t(t,e){return Math.floor(Math.random()*(e-t))+t}function e(t,n){return this instanceof e?(this.min=t,this.max=n,this):new e(t,n)}function n(t,e){var n=!0,r=!1,i=void 0;try{for(var o=void 0,a=Object.keys(e)[$traceurRuntime.toProperty(Symbol.iterator)]();!(n=(o=a.next()).done);n=!0){var s=o.value;if("-"===s[0]){s=s.slice(1);var u=s[0].toUpperCase()+s.slice(1);t.style["Moz"+u]=e["-"+s],t.style["ms"+u]=e["-"+s],t.style["webkit"+u]=e["-"+s]}t.style[s]=e[s]}}catch(l){r=!0,i=l}finally{try{n||null==a["return"]||a["return"]()}finally{if(r)throw i}}}Array.prototype.sample=function(){return this[t(0,this.length)]},e.prototype[Symbol.iterator]=function(){var t=this,e=this.min-1;return{next:function(){return++e,{value:e,done:e>t.max}}}},e.prototype.sample=function(){return t(this.min,this.max)};var r={listeners:{},emit:function(t,e,n){e=e||[],n=n||null,this.listeners[t].forEach(function(t){t.apply(n,e)})},on:function(t,e){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push(e)}};return{get rand(){return t},get Range(){return e},get EventRouter(){return r},get setStyle(){return n}}}(),$__vertical_95_latin_46_js__=function(){"use strict";return window.addEventListener("DOMContentLoaded",function(){var t=new Taketori;t.set({}).element("div.vertical-content").toVertical()}),{}}();
//# sourceMappingURL=vertical_latin.js.map