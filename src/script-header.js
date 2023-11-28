// ==UserScript==
// @name         Sanbai Sprinkles
// @namespace    https://vyhd.dev
// @version      3.0.0
// @description  An unaffiliated collection of UserScripts that enhance the experience of using Sanbai Ice Cream (https://3icecream.com)
// @license      CC0-1.0; https://creativecommons.org/publicdomain/zero/1.0/
// @author       vyhd@vyhd.dev
// @match        https://3icecream.com/difficulty_list/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/vyhd/sanbai-sprinkles/release/script.js
// @updateURL    https://raw.githubusercontent.com/vyhd/sanbai-sprinkles/release/script.js
// @supportURL   https://github.com/vyhd/sanbai-sprinkles
// ==/UserScript==

/*
 * Module: describes a single "logical" UserScript that gets loaded in when the page starts.
 */
class Module {
  /* Provide a way for subclassed modules to register themselves for easy lookup later. */
  static AVAILABLE_MODULES = new Map();
  static register(name, cls) {
    Module.AVAILABLE_MODULES.set(name, cls);
  }

  constructor($, window) {
    return;
  }

  /* Contains CSS that should be injected into the document */
  css() {
    return undefined;
  }

  /* The logic that configures this script to be used on the page. */
  run($, window) {
    return;
  }
}

