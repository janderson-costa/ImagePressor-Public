"use strict";
(() => {
  // src/services/jsx/factory.ts
  function createElement(tag, props, ...children) {
    const element = typeof tag === "function" ? tag(props) : document.createElement(tag);
    for (const [name, value] of Object.entries(props || {})) {
      if (name.startsWith("on") && typeof value === "function") {
        element.addEventListener(name.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(name, value);
      }
    }
    children.forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach((nestedChild) => element.append(nestedChild));
      } else {
        element.append(child instanceof Node ? child : document.createTextNode(child));
      }
    });
    return element;
  }
  function render(component, container) {
    container.innerHTML = "";
    container.appendChild(component);
  }

  // src/lib/dom/dom.js
  var dom2 = (() => {
    const util = Util();
    setStyle();
    return Dom;
    function Dom(selectorOrHtmlOrElement) {
      if (selectorOrHtmlOrElement) {
        if (util.isString(selectorOrHtmlOrElement)) {
          if (util.isHTML(selectorOrHtmlOrElement))
            return create(selectorOrHtmlOrElement);
          else
            return get(selectorOrHtmlOrElement);
        } else if (util.isHTMLElement(selectorOrHtmlOrElement)) {
          return _interface(selectorOrHtmlOrElement);
        } else {
          return selectorOrHtmlOrElement;
        }
      } else {
        return _interface(document);
      }
      function _interface(nodes, __baseNode) {
        nodes = util.toList(nodes);
        return {
          baseNode: __baseNode || nodes,
          nodes,
          length: nodes.length,
          // criadores
          insert: (tagOrHtmlOrElement, top) => insert(tagOrHtmlOrElement, top, nodes),
          clone: () => clone(nodes),
          // destrutores
          remove: () => remove(nodes),
          // seletores
          at: (index) => at(index, nodes),
          get: (selector) => get(selector, nodes),
          getById: (id) => getByAttr("id", id, nodes),
          // id: number/string/[number/string]
          getByName: (name) => getByAttr("name", name, nodes),
          // name: string/[string]
          getByAttr: (attribute, value) => getByAttr(attribute, value, nodes),
          // value: string/[string]
          getByClass: (className) => getByAttr("class", className, nodes),
          // class: string/[string]
          findUp: (selector) => findUp(selector, nodes),
          parent: () => parent(nodes),
          first: () => first(nodes),
          last: () => last(nodes),
          next: () => nextOrPrevious(true, nodes),
          previous: () => nextOrPrevious(false, nodes),
          forEach: (callback) => nodes.forEach((x, index) => callback(_interface(x), index)),
          map: (callback) => nodes.map((x, index) => callback(_interface(x), index)),
          some: (callback) => nodes.some((x, index) => callback(_interface(x), index)),
          find: (callback) => nodes.find((x, index) => callback(_interface(x), index)),
          filter: (callback) => nodes.filter((x, index) => callback(_interface(x), index)),
          focus: (focused) => focus(focused, nodes),
          // modificadores
          value: (value) => attr("value", value, nodes),
          text: (text) => attr("innerText", text, nodes),
          html: (html) => attr("innerHTML", html, nodes),
          attr: (prop, value) => attr(prop, value, nodes),
          style: (prop, value) => attr(prop, value, nodes, "style"),
          width: (value) => value ? attr("width", value, nodes, "style") : getAttr("offsetWidth", nodes),
          height: (value) => value ? attr("height", value, nodes, "style") : getAttr("offsetHeight", nodes),
          addClass: (className, add) => addClass(className, add, nodes),
          removeClass: (className, add) => removeClass(className, add, nodes),
          show: (_show, display) => show(_show, display, nodes),
          hide: (_hide) => hide(_hide, nodes),
          resize: (options) => resize(options, nodes),
          disable: (_disable, options) => disable(_disable, options, nodes),
          // manipuladores de evento
          on: (eventName, _function, useCapture) => on(eventName, _function, useCapture, nodes),
          bindData: (args) => bindData(args, nodes, __baseNode)
        };
      }
      function create(tagOrHtml = "") {
        const parentOf = {
          option: "select",
          thead: "table",
          tbody: "table",
          tr: "table",
          th: "tr",
          td: "tr"
        };
        let node;
        tagOrHtml = util.parseHTML(tagOrHtml);
        if (tagOrHtml.startsWith("<")) {
          const tagName = tagOrHtml.match(/[a-z]+/i)[0].toLowerCase();
          const parentTagName = parentOf[tagName] || "div";
          node = document.createElement(parentTagName);
          node.innerHTML = tagOrHtml;
          node = node.querySelector(tagName);
        } else if (tagOrHtml) {
          node = document.createElement(tagOrHtml);
        }
        return _interface(node);
      }
      function insert(tagOrHtmlOrElement, top = false, __nodes) {
        const nodes = [];
        if (tagOrHtmlOrElement) {
          tagOrHtmlOrElement = util.toList(tagOrHtmlOrElement);
          __nodes.forEach(
            (__node) => tagOrHtmlOrElement.forEach((x) => {
              if (util.isString(x))
                _insert(__node, create(x).nodes[0]);
              else if (util.isHTMLElement(x))
                _insert(__node, x);
              else
                x.nodes.forEach((x2) => _insert(__node, x2));
            })
          );
        }
        return _interface(nodes, __nodes);
        function _insert(__node, node) {
          nodes.push(node);
          if (top)
            __node.insertBefore(node, __node.firstChild);
          else
            __node.appendChild(node);
        }
      }
      function clone(__nodes) {
        return _interface(__nodes[0].cloneNode(true), __nodes);
      }
      function remove(__nodes) {
        __nodes.forEach((__node) => __node.remove());
      }
      function get(selector = "", __node = document) {
        if (selector) {
          let nodes = [];
          if (util.isList(__node)) {
            __node.forEach(
              (x) => nodes.push(...x.querySelectorAll(selector))
            );
          } else {
            nodes = [...__node.querySelectorAll(selector)];
          }
          return _interface(nodes, __node);
        }
      }
      function getByAttr(attr2, value, __nodes) {
        const nodes = [];
        value = util.toList(value);
        __nodes.forEach((__node) => {
          value.forEach((value2) => {
            let resources;
            if (attr2 == "id")
              resources = get("#" + value2, __node);
            else if (attr2 == "class")
              resources = get("." + value2, __node);
            else
              resources = get(`[${attr2}${value2 != void 0 ? '="' + value2 + '"' : ""}]`, __node);
            resources.nodes.forEach((node) => {
              if (!nodes.some((x) => x == node))
                nodes.push(node);
            });
          });
        });
        return _interface(nodes, __nodes);
      }
      function at(index, __nodes) {
        return _interface(__nodes[index] || [], __nodes);
      }
      function first(__nodes) {
        return at(0, __nodes);
      }
      function last(__nodes) {
        const node = __nodes.pop();
        return _interface(node || [], __nodes);
      }
      function nextOrPrevious(next = true, __nodes) {
        const nodes = [];
        __nodes.forEach((__node) => {
          const node = next ? __node.nextSibling : __node.previousSibling;
          if (node)
            nodes.push(node);
        });
        return _interface(nodes, __nodes);
      }
      function findUp(selector, __nodes) {
        const nodes = [];
        __nodes.forEach((__node) => {
          const node = __node.closest(selector);
          if (node && !nodes.some((x) => x === node))
            nodes.push(node);
        });
        return _interface(nodes, __nodes);
      }
      function parent(__nodes) {
        const nodes = [];
        __nodes.forEach(
          (__node) => nodes.push(__node.parentElement)
        );
        return _interface(nodes, __nodes);
      }
      function attr(attribute, value, __nodes, object) {
        if (util.isString(attribute)) {
          let key = attribute;
          if (util.isUndefined(value))
            return getAttr(key, __nodes, object);
          else
            return setAttr({ [key]: value }, __nodes, object);
        } else {
          return setAttr(attribute, __nodes, object);
        }
      }
      function getAttr(attribute = "", __nodes, object = "") {
        const values = [];
        __nodes.forEach((__node) => {
          const node = object ? __node[object] : __node;
          const value = util.isUndefined(node[attribute]) ? node.getAttribute(attribute) : node[attribute];
          if (!util.isUndefined(value))
            values.push(value);
        });
        return values.length > 1 ? values : values[0];
      }
      function setAttr(attributes = {}, __nodes, objectName = "") {
        if (!util.isNullOrUndefined(attributes)) {
          __nodes.forEach((__node) => {
            for (const key in attributes) {
              let node = objectName ? __node[objectName] : __node;
              let value = attributes[key];
              if (objectName == "style") {
                let important = "";
                if (!key.match(/index|line|grid|order|tab|orphans|widows|columns|counter|opacity/i))
                  value = typeof value == "number" ? value + "px" : value;
                if (value.match(/important/i)) {
                  value = value.substring(0, value.indexOf("!") - 1).trim();
                  important = "important";
                }
                if (important)
                  node.setProperty(key, value, important);
                else
                  node[key] = value;
              } else {
                typeof node[key] == "undefined" ? node.setAttribute(key, value) : node[key] = value;
              }
            }
          });
        }
        return _interface(__nodes);
      }
      function show(show2 = true, display = "", __nodes) {
        return attr("display", show2 ? display : "none", __nodes, "style");
      }
      function hide(hide2 = true, __nodes) {
        return show(!hide2, "", __nodes);
      }
      function addClass(className, add = true, __nodes) {
        className = util.toList(className);
        __nodes.forEach(
          (__node) => __node.classList[add ? "add" : "remove"](...className)
        );
        return _interface(__nodes);
      }
      function removeClass(className, remove2 = true, __nodes) {
        return addClass(className, !remove2, __nodes);
      }
      function focus(focused = true, __nodes) {
        if (focused)
          __nodes[0].focus();
        else
          __nodes[0].blur();
        return _interface(__nodes);
      }
      function disable(disable2 = true, options = {}, __nodes) {
        if (options.opacity) {
          __nodes.forEach(
            (__node) => __node.style.opacity = disable2 ? options.opacity : ""
          );
        }
        return addClass("dom-disabled", disable2, __nodes);
      }
      function resize(options, __nodes) {
        options = options || {};
        options.offset = options.offset != void 0 ? options.offset : 0;
        __nodes.forEach((__node) => {
          if (util.getTagName(__node) == "textarea") {
            __node.style.boxSizing = "border-box";
            __node.style.overflow = "hidden";
            __node.style.height = "";
            let diff = __node.offsetHeight - __node.scrollHeight;
            let height = __node.scrollHeight + (diff > 0 ? diff : 0) + options.offset;
            __node.style.height = typeof height == "number" && height > 0 ? height + "px" : height || "auto";
          }
        });
        return __nodes;
      }
      function bindData(args = {}, __fields, __baseNode) {
        args.dispatchEvent = args.dispatchEvent != void 0 ? args.dispatchEvent : true;
        let _fields = {};
        let _onChange;
        __fields.forEach((__field) => {
          const key = args.key || __field.name;
          if (key) {
            _fields[key] = _fields[key] ? util.isArray(_fields[key]) ? _fields[key].push(_interface(__field)) : [_fields[key], _interface(__field)] : _interface(__field);
            if (!util.isUndefined(args.value) || args.object.hasOwnProperty(key)) {
              const value = !util.isUndefined(args.value) ? args.value : args.object[key];
              if (__field.type == "radio") {
                __field.checked = __field.value == value;
              } else if (__field.type == "checkbox") {
                __field.checked = util.isBoolean(value) ? value : util.isArray(value) ? value.some((value2) => __field.value == value2) : __field.value == value;
              } else if (__field.type == "date" && typeof value == "number") {
                __field.value = new Date(value).toISOString().split("T")[0];
              } else if (__field.type == "datetime-local" && typeof value == "number") {
                __field.value = new Date(value).toISOString().slice(0, 16);
              } else {
                __field.value = value;
              }
              const f = (event) => change(event, key);
              __field.removeEventListener("input", __field.__dom_bindData_change);
              __field.addEventListener("input", f);
              __field.__dom_bindData_change = f;
            }
          }
        });
        return {
          onChange: (callback) => {
            _onChange = callback;
            if (args.dispatchEvent) {
              for (const key in _fields)
                change(null, key);
            }
          }
        };
        function change(event, key) {
          let field = _fields[key];
          let value;
          if (util.isArray(field)) {
            let type = field[0].nodes[0].type;
            if (type == "radio") {
              let x = field.find((x2) => x2.nodes[0].checked);
              value = x ? x.nodes[0].value : "";
            } else if (type == "checkbox") {
              value = field.filter((x) => x.nodes[0].checked).map((x) => x.nodes[0].value);
            }
          } else if (field.nodes[0].type == "checkbox") {
            let objValue = !util.isUndefined(args.value) ? args.value : args.object[key];
            let isChecked = field.nodes[0].checked;
            if (util.isBoolean(objValue)) {
              value = isChecked;
            } else if (util.isArray(objValue)) {
              if (isChecked) {
                if (!objValue.some((x) => x == value))
                  objValue.push(value);
              } else {
                objValue = objValue.filter((x) => x != value);
              }
              value = objValue.sort();
            }
          } else {
            value = field.nodes[0].value;
          }
          if (!util.isUndefined(args.value))
            args.value = value;
          else
            args.object[key] = value;
          if (_onChange) {
            _onChange({
              baseNode: _interface(__baseNode),
              args,
              object: args.object,
              key,
              value,
              field,
              fields: _fields,
              event
            });
          }
        }
      }
      function on(eventName, _function, useCapture = false, __nodes) {
        __nodes.forEach(
          (__node) => __node.addEventListener(
            eventName,
            (event) => _function({ element: _interface(__node), event }),
            useCapture
          )
        );
        return _interface(__nodes);
      }
    }
    function Util() {
      return {
        getTagName,
        toList,
        parseHTML,
        isNull,
        isUndefined,
        isEmpty,
        isNullOrUndefined,
        isNullOrUndefinedOrEmpty,
        isObject,
        isString,
        isBoolean,
        isHTML,
        isHTMLElement,
        isNodeList,
        isArray,
        isList
      };
      function getTagName(node) {
        return node instanceof HTMLElement ? node.tagName.toLowerCase() : "";
      }
      function toList(element) {
        return isNodeList(element) ? [...element] : isArray(element) ? element : [element];
      }
      function parseHTML(html) {
        return html.replace(/\n|\t/g, "").replace(/  /g, " ").trim();
      }
      function isNull(value) {
        return value == null;
      }
      function isUndefined(value) {
        return typeof value == "undefined";
      }
      function isEmpty(value) {
        return value == "";
      }
      function isNullOrUndefined(value) {
        return isNull(value) || isUndefined(value);
      }
      function isNullOrUndefinedOrEmpty(value) {
        return isNull(value) || isUndefined(value) || isEmpty(value);
      }
      function isObject(value) {
        return value && value.constructor == Object;
      }
      function isString(value) {
        return typeof value == "string";
      }
      function isBoolean(value) {
        return typeof value == "boolean";
      }
      function isHTML(value) {
        value = parseHTML(value);
        return isString(value) && value.startsWith("<") && value.endsWith(">");
      }
      function isHTMLElement(obj) {
        return obj instanceof HTMLElement;
      }
      function isNodeList(obj) {
        return obj instanceof NodeList;
      }
      function isArray(obj) {
        return obj instanceof Array;
      }
      function isList(element) {
        return isNodeList(element) || isArray(element);
      }
    }
    function setStyle() {
      if (document.querySelector("style#dom-style"))
        return;
      const style = util.parseHTML(
        /*html*/
        `
			<style id="dom-style">
				.dom-disabled {
					opacity: .6;
					-webkit-user-select: none;
					-moz-user-select: none;
					user-select: none;
					pointer-events: none;
				}
			</style>
		`
      );
      document.querySelector("head").insertAdjacentHTML("beforeend", style);
    }
  })();

  // src/shared.js
  var shared = {
    temp: null,
    constants: null,
    // páginas
    currentPage: null,
    // componentes
    navigation: null,
    appBar: null,
    footer: null,
    // funções
    setContentSize: null
  };
  var shared_default = shared;

  // src/services/RouterService.js
  var router = new RouterService();
  function RouterService() {
    const _this = this;
    let _routes;
    this.routes = routes;
    this.route = route;
    this.next = null;
    this.current = getLocation();
    this.previous = getLocation(localStorage.getItem("previousUrl"));
    window.removeEventListener("hashchange", onHashChange);
    window.addEventListener("hashchange", onHashChange);
    function onHashChange(event) {
      if (event)
        localStorage.setItem("previousUrl", event.oldURL);
      _this.previous = getLocation(localStorage.getItem("previousUrl"));
    }
    function routes(routes2) {
      if (routes2)
        _routes = routes2;
      else
        return _routes;
    }
    function route() {
      const _location = getLocation();
      for (const route2 in _routes) {
        const routeParts = route2.split("/");
        let page = _routes[route2];
        let count = 0;
        _location.hashParts.forEach((hashPart, index) => {
          let routePart = routeParts[index];
          if (_location.hashParts.length == routeParts.length && (hashPart == routePart || routePart == "?")) count++;
        });
        if (_location.hashParts.length == count) {
          _this.current = _location;
          return page;
        }
      }
    }
    function getLocation(url) {
      url = url || location.href;
      if (!url.match(/#/)) return;
      let fullHash = url.split("#")[1];
      let hash = fullHash.split("&")[0];
      let params = fullHash.split("&")[1];
      let hashParts = hash.split("/");
      return {
        url,
        fullHash,
        hash,
        hashParts,
        target: hash.substring(hash.lastIndexOf("/") + 1),
        params: parseParams(params)
      };
    }
    function parseParams(hashParams) {
      if (!hashParams) return;
      const params = {};
      hashParams.split("&").forEach((param) => {
        let keyValue = param.split("=");
        params[keyValue[0]] = keyValue[1];
      });
      return params;
    }
  }
  var RouterService_default = router;

  // src/lib/Toast/Toast.js
  function Toast(options = {}) {
    options.position = options.position ? options.position : "bottom center";
    options.time = options.time ? options.time : 5;
    const toasts = document.querySelector(".toasts");
    create();
    function create() {
      const toast = document.createElement("div");
      toast.classList.add("toast");
      toast.innerHTML = /*html*/
      `
			${options.icon ? (
        /*html*/
        `<div class="toast-icon"></div>`
      ) : `<span></span>`}
			<div class="toast-body" style="${options.icon ? "padding-left: 0" : ""}">
				<div class="toast-content">
					${options.message}
				</div>
			</div>
			<div class="toast-button" onclick="this.parentElement.remove()">
				<button type="button" class="toast-button-icon">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
				</button>
			</div>
		`;
      if (options.icon) {
        const icon = toast.querySelector(".toast-icon");
        if (options.icon instanceof HTMLElement)
          icon.appendChild(options.icon);
        else
          icon.innerHTML = options.icon;
        toast.prepend(icon);
      }
      if (options.position.match("left")) {
        toasts.classList.add("left");
      } else if (options.position.match("right")) {
        toasts.classList.add("right");
      } else {
        toasts.classList.add("center");
      }
      if (options.position.match("top")) {
        toasts.classList.add("top");
        toasts.prepend(toast);
        toast.classList.add("show", "top");
      } else {
        toasts.classList.add("bottom");
        toasts.appendChild(toast);
        toast.classList.add("show", "bottom");
      }
      setTimeout(() => {
        toast.className = toast.className.replace("show", "hide");
        setTimeout(() => toast.remove(), 500);
      }, options.time * 1e3);
    }
  }
  (() => {
    let toasts = document.querySelector(".toasts");
    if (!toasts) {
      toasts = document.createElement("div");
      toasts.className = "toasts";
      document.body.appendChild(toasts);
    }
  })();

  // src/components/Icon.jsx
  var Icon = (name) => {
    const icons = {
      ellipsisVertical: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "ellipsis-vertical", style: "scale: 1.1;" }),
      bell: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "bell", style: "scale: 1.1;" }),
      logIn: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "log-in" }),
      logOut: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "log-out" }),
      user: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "circle-user-round", style: "scale: 1.2;" }),
      add: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "plus", style: "stroke-width: 1.8; scale: 1.2;" }),
      edit: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "pencil" }),
      search: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "search" }),
      start: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "play" }),
      stop: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "square" }),
      refresh: /* @__PURE__ */ createElement("i", { class: "icon refresh", "data-lucide": "refresh-cw" }),
      tasks: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "list-todo", style: "scale: 1.3;" }),
      history: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "history", style: "scale: 1.3;" }),
      info: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "info", style: "scale: 1.1;" }),
      alert: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "circle-alert", style: "scale: 1.1;" }),
      copy: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "copy" }),
      paste: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "clipboard-paste" }),
      duplicate: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "copy-check" }),
      trash: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "trash-2" }),
      folder: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "folder" }),
      folderSearch: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "folder-search" }),
      open: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "external-link" }),
      checked: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "check", style: "scale: 1.1;" }),
      up: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "chevron-up", style: "scale: 1.1;" }),
      down: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "chevron-down", style: "scale: 1.1;" }),
      left: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "chevron-left", style: "scale: 1.15;" }),
      right: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "chevron-right", style: "scale: 1.15;" }),
      arrowLeft: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "arrow-left", style: "stroke-width: 1.8; scale: 1.15;" }),
      import: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "file-down" }),
      export: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "file-up" }),
      sheet: /* @__PURE__ */ createElement("i", { class: "icon", "data-lucide": "sheet" })
    };
    return icons[name];
  };
  var Icon_default = Icon;

  // src/services/WebAPIService.js
  var webAPI = new WebAPIService();
  var WebAPIService_default = webAPI;
  function WebAPIService() {
    this.getConstants = () => _requestAPI({ method: "GetConstants" });
    this.copyClip = (text) => _requestAPI({ method: "CopyClip", text: text.replace(/\n/g, "%0A").replace(/\t/g, "%09") });
    this.pathIsAvailable = (path) => _pathIsAvailable({ method: "PathIsAvailable", path });
    this.viewInFileExplorer = (fileOrFolderPath) => _viewInFileExplorer({ method: "ViewInFileExplorer", fileOrFolderPath });
    this.folderPicker = (title) => _requestAPI({ method: "FolderPicker", title });
    this.filePicker = (title, fileTypes) => _requestAPI({ method: "FilePicker", title, fileTypes });
    this.saveFilePicker = (title, fileName, fileTypes) => _requestAPI({ method: "SaveFilePicker", title, fileName, fileTypes });
    this.downloadFile = (url, path) => _requestAPI({ method: "DownloadFile", url, path });
    this.openFile = (path) => _openFile({ method: "OpenFile", path });
    this.newTask = () => _requestAPI({ method: "NewTask" });
    this.newTaskFileFilterItem = () => _requestAPI({ method: "NewTaskFileFilterItem" });
    this.getTasks = () => _requestAPI({ method: "GetTasks" });
    this.getTaskById = (id) => _requestAPI({ method: "GetTaskById", id });
    this.insertTask = (item) => _requestAPI({ method: "InsertTask", item });
    this.importTasks = (path) => _requestAPI({ method: "ImportTasks", path });
    this.updateTask = (item) => _requestAPI({ method: "UpdateTask", item });
    this.deleteTask = (id) => _requestAPI({ method: "DeleteTask", id, deleteHistory: true });
    this.getHistoryPaged = (pageIndex, limit) => _requestAPI({ method: "GetHistoryPaged", pageIndex, limit });
    this.deleteHistoryEvents = (ids) => _requestAPI({ method: "DeleteHistoryEvents", ids });
    this.getItemsFromHistoryFilePaged = (fileName, pageIndex, limit) => _requestAPI({ method: "GetItemsFromHistoryFilePaged", fileName, pageIndex, limit });
    this.exportHistory = (sheetName, path) => _requestAPI({ method: "ExportHistory", sheetName, path });
    this.exportHistoryFiles = (fileName, sheetName, path) => _requestAPI({ method: "ExportHistoryFiles", fileName, sheetName, path });
    this.searchTaskFilesPaged = (item, enableExceptions, pageIndex, limit) => _requestAPI({ method: "SearchTaskFilesPaged", item, enableExceptions, pageIndex, limit });
    this.isTaskRunning = (id) => _requestAPI({ method: "IsTaskRunning", id });
    this.startTask = (id) => _requestAPI({ method: "StartTask", id });
    this.stopTask = (id) => _requestAPI({ method: "StopTask", id });
    function _requestAPI(params = {}) {
      return fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      }).then((response) => response.json());
    }
    async function _pathIsAvailable(params) {
      const { result: isAvailable } = await _requestAPI(params);
      if (!isAvailable) {
        Toast({
          icon: Icon_default("info"),
          message: "The specified directory is invalid or access is denied.",
          position: "bottom center",
          time: 4
        });
        lucide.createIcons();
      }
      return isAvailable;
    }
    async function _openFile(params) {
      const { error } = await _requestAPI(params);
      if (error) {
        Toast({
          icon: Icon_default("info"),
          message: "Unable to open the file. Please navigate to the directory and verify its contents.",
          position: "bottom center",
          time: 6
        });
        lucide.createIcons();
      }
    }
    async function _viewInFileExplorer(params) {
      if (params.fileOrFolderPath.length <= 260) {
        const { error } = await _requestAPI(params);
        if (error) {
          Toast({
            icon: Icon_default("info"),
            message: error,
            position: "bottom center",
            time: 4
          });
        }
      } else {
        Toast({
          icon: Icon_default("info"),
          message: "Cannot open folder: path exceeds 260 characters.",
          position: "bottom center",
          time: 4
        });
      }
      lucide.createIcons();
    }
  }

  // src/components/PageLayout.jsx
  var PageLayout = ({ navigation: navigation2, appBar: appBar2, footer: footer2 }) => {
    const root = /* @__PURE__ */ createElement("div", { class: "layout" }, /* @__PURE__ */ createElement("div", { class: "navigation" }, navigation2 ? navigation2.element.nodes[0] : ""), /* @__PURE__ */ createElement("div", { class: "main" }, /* @__PURE__ */ createElement("div", { class: "appbar bb" }, appBar2 ? appBar2.element.nodes[0] : ""), /* @__PURE__ */ createElement("div", { class: "page" }, /* @__PURE__ */ createElement("div", { class: "header" }), /* @__PURE__ */ createElement("div", { class: "actionbar bb" }), /* @__PURE__ */ createElement("div", { class: "content" })), /* @__PURE__ */ createElement("div", { class: "footer bt" }, footer2 ? footer2.element.nodes[0] : "")));
    const $root = dom(root);
    const context = {
      element: $root,
      elements: {
        navigation: $root.get(".navigation"),
        appBar: $root.get(".main .appbar"),
        page: $root.get(".page"),
        header: $root.get(".page .header"),
        actionBar: $root.get(".page .actionbar"),
        content: $root.get(".page .content"),
        footer: $root.get(".main .footer")
      }
    };
    return context;
  };
  var PageLayout_default = PageLayout;

  // src/lib/Menu/Menu.js
  var defaultOptions = {
    trigger: null,
    // HTMLElement (ex.: button | a | div)
    items: [],
    // [{ icon: HTMLElement, name: string, description: string, onClick: function }]
    align: "left",
    // left | right
    top: 0,
    // Ajuste de posiçãoo vertical quando necessário
    onShow: null,
    onHide: null
  };
  function Menu(options) {
    options = {
      ...defaultOptions,
      ...options
    };
    let $menu;
    let _classVisible = "";
    let _classInvisible = "";
    if (options.trigger) {
      options.trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        show();
      });
    }
    const _context = {
      options,
      element: null,
      item: _item,
      show,
      hide
    };
    return _context;
    function create() {
      const $menu2 = document.createElement("div");
      $menu2.className = "ctx-menu";
      $menu2.innerHTML = /*html*/
      `${options.items.map((item) => {
        if (item.divider) {
          return (
            /*html*/
            `
					<div class="ctx-divider"></div>
				`
          );
        } else {
          return (
            /*html*/
            `
					<div class="ctx-item">
						<div class="ctx-icon"></div>
						<div class="ctx-text">
							<div class="ctx-name">${item.name}</div>
							<div class="ctx-description">${item.description || ""}</div>
						</div>
					</div>
				`
          );
        }
      }).join("")}`;
      $menu2.querySelectorAll(":scope > div").forEach(($item, index) => {
        const item = options.items[index];
        const icon = item.icon;
        $item.data = item;
        item.element = $item;
        if (icon) {
          const $icon = $item.querySelector(".ctx-icon");
          if (typeof icon == "string")
            $icon.innerHTML = icon;
          else if (icon instanceof HTMLElement)
            $icon.appendChild(icon);
        }
        if (item.divider == void 0) {
          $item.addEventListener("click", (event) => {
            hide();
            if (item.onClick)
              item.onClick(event);
          });
        }
      });
      _context.element = $menu2;
      document.body.appendChild($menu2);
      return $menu2;
    }
    function _item(name) {
      return {
        get,
        icon
      };
      function get() {
        return options.items.find((x) => x.name == name);
      }
      function icon(element) {
        const $item = get().element;
        const $iconPlace = $item.querySelector(".ctx-icon");
        if (element) {
          $iconPlace.innerHTML = "";
          $iconPlace.appendChild(element);
        } else if (element == "") {
          $iconPlace.innerHTML = "";
        } else {
          return $iconPlace;
        }
      }
    }
    function show(event = {}) {
      let x;
      let y;
      destroy();
      document.body.click();
      $menu = create();
      _classVisible = "ctx-menu-visible-left";
      _classInvisible = "ctx-menu-invisible-left";
      if (event.type == "contextmenu") {
        event.preventDefault();
        x = event.x;
        y = event.y;
      }
      setTimeout(() => {
        if (options.trigger) {
          const trigger = options.trigger;
          x = trigger.offsetLeft;
          y = trigger.offsetTop + trigger.offsetHeight + 1;
          if (options.align == "right") {
            x = x - $menu.offsetWidth + trigger.offsetWidth - 1;
          }
        }
        if (x + $menu.offsetWidth > window.innerWidth) {
          x = x - $menu.offsetWidth;
          _classVisible = "ctx-menu-visible-right";
          _classInvisible = "ctx-menu-invisible-right";
        }
        if (y + $menu.offsetHeight - window.innerHeight > 0)
          y = window.innerHeight - $menu.offsetHeight;
        $menu.className = "ctx-menu";
        $menu.classList.add(_classVisible);
        $menu.style.left = x + "px";
        $menu.style.top = options.top + y + "px";
        if (options.onShow)
          options.onShow(_context);
      });
      window.addEventListener("click", hide);
      window.addEventListener("keyup", hide);
    }
    function hide(event) {
      if (!$menu) return;
      if (event) {
        if (!(!event.target.closest(".ctx-menu") || event.key == "Escape"))
          return;
      }
      $menu.classList.remove(_classVisible);
      $menu.classList.add(_classInvisible);
      if (options.onHide)
        options.onHide(_context);
      setTimeout(destroy, 200);
      window.removeEventListener("click", hide);
      window.removeEventListener("keyup", hide);
    }
    function destroy() {
      if (!$menu) return;
      $menu.remove();
      $menu = null;
    }
  }

  // src/components/AppBar.jsx
  var AppBar = () => {
    const root = /* @__PURE__ */ createElement("div", { class: "AppBar flex justify-between w-full" }, /* @__PURE__ */ createElement("div", null), /* @__PURE__ */ createElement("div", { class: "flex gap-2" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10 notification" }, Icon_default("bell")), /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10 user" }, Icon_default("user"))));
    const $root = dom(root);
    set();
    return {
      element: $root
    };
    function set() {
      Menu({
        trigger: $root.get("button.user").nodes[0],
        align: "right",
        top: 1,
        items: [
          { name: "User name", icon: Icon_default("user"), description: "Manage your app account.", onClick: null },
          { divider: true },
          { name: "Log out", icon: Icon_default("logOut"), onClick: null },
          { name: "About", onClick: null }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
    }
  };
  var AppBar_default = AppBar;

  // src/components/Navigation.jsx
  var Navigation = (items = []) => {
    const root = /* @__PURE__ */ createElement("div", { class: "Navigation" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "header" }, /* @__PURE__ */ createElement("div", { class: "logo" }, /* @__PURE__ */ createElement("img", { src: "logo.svg" })), /* @__PURE__ */ createElement("label", { class: "title" }, /* @__PURE__ */ createElement("span", { class: "opacity-50 tracking-[1px]" }, "IMAGE"), /* @__PURE__ */ createElement("span", { class: "ml-[0.5px] opacity-90" }, "PRESSOR"))), /* @__PURE__ */ createElement("div", { class: "items" }, items.map(
      (item) => /* @__PURE__ */ createElement("a", { href: item.href, class: "item", "data-keyword": item.name }, item.icon, /* @__PURE__ */ createElement("label", null, item.title))
    ))), /* @__PURE__ */ createElement("div", { class: "footer" }, "Version 1.0.1"));
    const $root = dom(root);
    return {
      element: $root,
      setActive
    };
    function setActive() {
      $root.get(".item").removeClass("active").forEach((item) => {
        const keyword = item.attr("data-keyword");
        if (location.hash.match(keyword))
          item.addClass("active");
      });
    }
  };
  var Navigation_default = Navigation;

  // src/components/PageFooter.jsx
  var PageFooter = () => {
    const root = /* @__PURE__ */ createElement("div", { class: "PageFooter flex w-full" }, /* @__PURE__ */ createElement("div", { class: "info flex items-center" }));
    const $root = dom(root);
    return {
      element: $root,
      info
    };
    function info(textOrHtmlOrElement) {
      const $info = $root.get(".info");
      textOrHtmlOrElement instanceof HTMLElement ? $info.insert(textOrHtmlOrElement) : $info.html(textOrHtmlOrElement || "");
    }
  };
  var PageFooter_default = PageFooter;

  // src/pages/LoginPage.jsx
  var LoginPage = () => {
    const root = /* @__PURE__ */ createElement("form", { class: "LoginPage" }, /* @__PURE__ */ createElement("div", { class: "title" }, "Sign in to your account"), /* @__PURE__ */ createElement("div", { class: "fields" }, /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Your email"), /* @__PURE__ */ createElement("input", { type: "text", name: "email", required: true, spellcheck: "false", placeholder: "...@...", style: "width: 100%;" })), /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Password"), /* @__PURE__ */ createElement("input", { type: "password", name: "password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", style: "width: 100%;" }))), /* @__PURE__ */ createElement("a", { href: "javascript:", class: "link blue link-forgot" }, "Forgot password?"), /* @__PURE__ */ createElement("button", { type: "button", class: "button-signin" }, "Sign in"));
    const $root = dom(root);
    const context = {
      element: $root,
      onShow
    };
    return context;
    function onShow() {
      document.body.classList.add("login-theme");
    }
  };
  var LoginPage_default = LoginPage;

  // src/components/PageHeader.jsx
  var PageHeader = ({ pageMap = [], description = "", onClickBackButton }) => {
    const root = /* @__PURE__ */ createElement("div", { class: "PageHeader" }, /* @__PURE__ */ createElement("div", { class: "breadcrumb" }), /* @__PURE__ */ createElement("div", { class: "description" }, description));
    const $root = dom(root);
    const context = {
      element: $root,
      setPageMap
    };
    setPageMap(pageMap);
    return context;
    function setPageMap(pageMap2) {
      const $breadcrumb = $root.get(".breadcrumb").html("");
      pageMap2.forEach(($item, index) => {
        $item = dom($item instanceof HTMLElement ? $item : /* @__PURE__ */ createElement("span", null, $item)).addClass("item");
        let tag = $item.attr("tagName");
        if (tag == "A" || tag == "BUTTON")
          $item.addClass("button", "w-10", "h-10");
        if (pageMap2.length == 1)
          $item.style("padding", "0px");
        if (index == pageMap2.length - 1)
          $item.addClass("last");
        $breadcrumb.insert($item);
        if (index < pageMap2.length - 1)
          $breadcrumb.insert(Icon_default("right"));
      });
      if (onClickBackButton) {
        $breadcrumb.insert(
          /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10 backbutton", onClick: onClickBackButton }, Icon_default("arrowLeft")),
          true
        );
      }
    }
  };
  var PageHeader_default = PageHeader;

  // src/components/ActionBar.jsx
  var ActionBar = ({ buttons = [] }) => {
    const root = /* @__PURE__ */ createElement("div", { class: "ActionBar flex flex-wrap items-center gap-[0.4em]" }, buttons.map((button2) => {
      if (button2.divider) {
        return /* @__PURE__ */ createElement("span", { class: "divider h-5" });
      } else {
        const $button = /* @__PURE__ */ createElement("button", { type: "button", class: "button button w-10 h-10", name: button2.name || "", title: button2.tooltip || "", style: button2.style || "", onClick: button2.onClick }, button2.icon || "", button2.displayName ? /* @__PURE__ */ createElement("span", { class: "name" }, button2.displayName) : "");
        $button.classList.toggle("disabled", !!button2.disabled);
        return $button;
      }
    }));
    const $root = dom(root);
    return {
      element: $root,
      button
    };
    function button(name) {
      let $button = $root.getByName(name);
      return {
        disable
      };
      function disable(disable2 = true) {
        $button.addClass("disabled", disable2);
      }
    }
  };
  var ActionBar_default = ActionBar;

  // src/components/RowProgressBar.jsx
  var RowProgressBar = () => {
    const root = /* @__PURE__ */ createElement("div", { class: "RowProgressBar" }, /* @__PURE__ */ createElement("div", { class: "bar" }, /* @__PURE__ */ createElement("div", { class: "progress" })), /* @__PURE__ */ createElement("div", { class: "value" }));
    const $root = dom(root);
    const context = {
      element: root,
      update,
      show
    };
    return context;
    function update(percent = 0, value = "") {
      $root.get(".progress").style("width", `${percent}%`);
      $root.get(".value").html(value);
    }
    function show(show2 = true) {
      $root.style({ visibility: show2 ? "visible" : "hidden" });
    }
  };
  var RowProgressBar_default = RowProgressBar;

  // src/lib/DataTable/src/utils.js
  var utils = new Utils();
  function Utils() {
    this.generateGuid = generateGuid;
    this.mergeProps = mergeProps;
    this.getElementIndex = getElementIndex;
    this.createRangeArray = createRangeArray;
    this.isArrayOfHTMLElement = isArrayOfHTMLElement;
    this.parseDimension = parseDimension;
    this.setElementAttr = setElementAttr;
    this.setElementStyle = setElementStyle;
    function generateGuid() {
      const guid = ("1000000-1000-4000-8000" + -1e11).replace(
        /[018]/g,
        (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      return "a" + guid;
    }
    function mergeProps(target, source) {
      const merged = { ...target };
      for (const key in source) {
        if (source[key] instanceof Object && !(source[key] instanceof Array) && !(source[key] instanceof Function) && !(source[key] instanceof HTMLElement)) {
          merged[key] = mergeProps(target[key] || {}, source[key]);
        } else {
          merged[key] = source[key];
        }
      }
      return merged;
    }
    function getElementIndex($element) {
      const children = Array.from($element.parentElement.children);
      return children.indexOf($element);
    }
    function createRangeArray(startNumber, endNumber) {
      const isAscending = startNumber <= endNumber;
      return Array.from(
        { length: Math.abs(endNumber - startNumber) + 1 },
        (_, index) => isAscending ? startNumber + index : startNumber - index
      );
    }
    function isArrayOfHTMLElement(obj) {
      if (Array.isArray(obj))
        return obj.every((item) => item instanceof HTMLElement);
      return false;
    }
    function parseDimension(value) {
      return typeof value == "number" ? `${value}px` : value || "";
    }
    function setElementStyle(elements, attributes = {}) {
      setElementAttr(elements, attributes, "style");
    }
    function setElementAttr(elements, attributes = {}, objectName = "") {
      elements = elements instanceof Array ? elements : [elements];
      elements.forEach((x) => {
        for (const key in attributes) {
          let node = objectName ? x[objectName] : x;
          let value = attributes[key];
          if (objectName == "style") {
            let important = "";
            if (!key.match(/index|line|grid|order|tab|orphans|widows|columns|counter|opacity/i))
              value = typeof value == "number" ? value + "px" : value;
            if (value.match(/important/i)) {
              value = value.substring(0, value.indexOf("!") - 1).trim();
              important = "important";
            }
            if (important)
              node.setProperty(key, value, important);
            else
              node[key] = value;
          } else {
            typeof node[key] == "undefined" ? node.setAttribute(key, value) : node[key] = value;
          }
        }
      });
    }
  }

  // src/lib/DataTable/src/constants.js
  var TableOptions = class {
    data = [];
    /* [
    	{ fieldName1: value, fieldName2: value },
    	{ fieldName2: value, fieldName2: value },
    	..
    ] */
    place = null;
    // HTMLElement
    header = {
      hidden: false,
      // boolean
      disabled: false
      // boolean
    };
    columns = null;
    /* {
    	fieldName1: ColumnOptions,
    	fieldName2: ColumnOptions,
    	..
    } */
    rows = {
      selectOnClick: false,
      // boolean
      allowMultipleSelection: true
      // boolean
    };
    cells = null;
    /* {
    	fieldName1: {
    		display: ({ item, value }) => { return.. },
    		style: object,
    	},
    	fieldName2: {
    		display: ({ item, value }) => { return.. },
    		style: object,
    	}
    	..
    } */
    borders = {
      table: {
        top: false,
        // boolean
        bottom: false,
        // boolean
        all: false,
        // boolean
        radius: null
        // px
      },
      rows: true,
      // boolean
      cells: false
      // boolean
    };
    footer = {
      hidden: true,
      // boolean
      disabled: false,
      // boolean
      content: null
      // HTMLElement | string
    };
    width = null;
    // number
    height = null;
    // number
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
    checkbox = false;
    // boolean
    sort = false;
    // boolean
    resize = false;
    // boolean
    disabled = false;
    // boolean
    onAddRow = null;
    // function
    onSelectRows = null;
    // function
    onUnselectRows = null;
    // function
    onUpdateRow = null;
    // function
    onRemoveRows = null;
    // function
    onDoubleClickRow = null;
    // function
    onResizeColumn = null;
    // function
    onClickOut = null;
    // function
    onCopyClip = null;
    // function
  };
  var ColumnOptions = class {
    // private
    checkbox = false;
    // boolean
    // public
    name = null;
    // string
    displayName = null;
    // string
    width = null;
    // number | string
    minWidth = null;
    // number | string
    resize = false;
    // boolean
    hidden = false;
    // boolean
    disabled = false;
    // boolean
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
  };
  var CellOptions = class {
    // private
    row = null;
    // Row
    checkbox = false;
    // boolean
    data = null;
    // object
    value = null;
    // any
    // public
    name = null;
    // string
    hidden = false;
    // boolean
    disabled = false;
    // boolean
    display = null;
    // function
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
  };

  // src/lib/DataTable/src/components/Column.js
  function Column(table, options) {
    const $cell = create();
    const _cell = {
      element: $cell,
      isHidden: options.hidden,
      isDisabled: options.disabled,
      options,
      show,
      checked,
      disable
    };
    show(!options.hidden);
    disable(options.disabled);
    return _cell;
    function create() {
      const $cell2 = document.createElement("div");
      $cell2.classList.add("dt-header-cell");
      if (options.checkbox) {
        $cell2.classList.add("checkbox");
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="dt-row-checkbox">
					<input type="checkbox" />
				</label>
			`
        );
        const $checkbox = $cell2.querySelector("label");
        $checkbox.addEventListener("change", (event) => {
          event.target.checked ? table.selectRows() : table.unselectRows(event);
        });
      } else {
        $cell2.dataset.name = options.name;
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="name">${options.displayName}</label>
				<span class="controls">
					<i class="sort asc" title="Sort"></i>
					<div class="resizer"></div>
				</span>
			`
        );
        const $iconSort = $cell2.querySelector(".sort");
        if (table.options.sort && options.sort != false) {
          $cell2.classList.add("sortable");
          $cell2.addEventListener("click", () => {
            if (table.header.isDisabled || _cell.isDisabled)
              return;
            table.header.cells.forEach(
              (cell) => cell.element.classList.remove("sorted")
            );
            let ascendent = !($iconSort.getAttribute("ascendent") == "true");
            $cell2.classList.add("sorted");
            $iconSort.classList.toggle("asc", ascendent);
            $iconSort.classList.toggle("desc", !ascendent);
            $iconSort.setAttribute("ascendent", ascendent);
            table.sort(options.name, ascendent);
          });
        }
        if (table.options.resize || options.resize)
          $cell2.classList.add("resizable");
        if (options.style)
          utils.setElementStyle($cell2, options.style);
      }
      if (table.options.borders.cells)
        $cell2.classList.add("cell-border-right");
      return $cell2;
    }
    function checked(checked2 = true) {
      const $checkbox = $cell.querySelector(".dt-row-checkbox input");
      if ($checkbox)
        $checkbox.checked = checked2;
    }
    function show(show2 = true) {
      _cell.isHidden = !show2;
      options.hidden = _cell.isHidden;
      $cell.classList.toggle("visible", show2);
      $cell.classList.toggle("hidden", !show2);
      table._setBorders();
    }
    function disable(disabled = true) {
      _cell.isDisabled = disabled;
      $cell.dataset.disabled = disabled;
      Array.from($cell.children).forEach(
        ($child) => $child.classList.toggle("disabled", disabled)
      );
    }
  }

  // src/lib/DataTable/src/components/Header.js
  function Header(table) {
    const _header = {
      element: null,
      cells: [],
      isHidden: false,
      isDisabled: false,
      cell,
      show,
      disable
    };
    const $header = create();
    return _header;
    function create() {
      const $header2 = document.createElement("div");
      $header2.classList.add("dt-header");
      if (table.options.checkbox) {
        const options = new ColumnOptions();
        options.checkbox = true;
        options.resize = false;
        const cell2 = Column(table, options);
        _header.cells.push(cell2);
        $header2.appendChild(cell2.element);
      }
      for (const name in table.options.columns) {
        const column = table.options.columns[name];
        const options = utils.mergeProps(new ColumnOptions(), column);
        options.name = name;
        const cell2 = Column(table, options);
        _header.cells.push(cell2);
        $header2.appendChild(cell2.element);
      }
      _header.element = $header2;
      return $header2;
    }
    function cell(nameOrIndex) {
      const cell2 = typeof nameOrIndex == "number" ? _header.cells[nameOrIndex] : _header.cells.find((cell3) => cell3.options.name == nameOrIndex);
      return cell2;
    }
    function show(show2 = true) {
      _header.isHidden = !show2;
      $header.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _header.isDisabled = disabled;
      Array.from($header.children).forEach(($child) => {
        $child.classList.toggle("disabled", disabled);
      });
    }
  }

  // src/lib/DataTable/src/components/Cell.js
  function Cell(table, options) {
    const $cell = create();
    const _cell = {
      element: $cell,
      isHidden: options.hidden,
      isDisabled: options.disabled,
      options,
      value,
      display,
      checked,
      show,
      showContent,
      disable
    };
    show(!options.hidden);
    showContent(!options.hidden);
    display(value());
    return _cell;
    function create() {
      const $cell2 = document.createElement("div");
      $cell2.classList.add("dt-body-row-cell");
      if (options.checkbox) {
        $cell2.classList.add("checkbox");
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="dt-row-checkbox">
					<input type="checkbox"/>
				</label>
			`
        );
        const $checkbox = $cell2.querySelector("label");
        $checkbox.addEventListener("click", (event) => event.stopPropagation());
        $checkbox.addEventListener("change", (event) => {
          table.header.cells[0].checked(false);
          options.row.select(event.target.checked, event);
        });
      } else {
        const value2 = options.value != void 0 ? options.value : "";
        const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
        $cell2.dataset.name = options.name;
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<div class="value-hidden">${value2}</div>
				<div class="value-display">${value2}</div>
			`
        );
        if (cell.style)
          utils.setElementStyle($cell2, cell.style);
      }
      if (table.options.borders.cells)
        $cell2.classList.add("cell-border-right");
      if (table.options.borders.rows)
        $cell2.classList.add("cell-border-bottom");
      return $cell2;
    }
    function value(value2) {
      const $value = $cell.querySelector(".value-hidden");
      if (!$value)
        return;
      if (value2 != void 0) {
        options.data[options.name] = value2;
        $value.value = value2;
      } else {
        value2 = options.value != void 0 ? options.value : $value.value;
        return value2;
      }
    }
    function display(value2) {
      const $display = $cell.querySelector(".value-display");
      const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
      if (cell.display) {
        value2 = cell.display({ item: options.data, value: value2 });
        $display.innerHTML = "";
        if (value2 instanceof HTMLElement) {
          $display.appendChild(value2);
        } else if (utils.isArrayOfHTMLElement(value2)) {
          value2.forEach((x) => $display.appendChild(x));
        } else {
          $display.innerHTML = value2;
        }
      }
    }
    function show(show2 = true) {
      _cell.isHidden = !show2;
      $cell.classList.toggle("visible", show2);
      $cell.classList.toggle("hidden", !show2);
    }
    function showContent(show2 = true) {
      _cell.isHidden = !show2;
      Array.from($cell.children).forEach(($child) => {
        $child.classList.toggle("hidden", !show2);
      });
    }
    function checked(checked2 = true) {
      const $checkbox = $cell.querySelector(".dt-row-checkbox input");
      if ($checkbox)
        $checkbox.checked = checked2;
    }
    function disable(disabled = true) {
      _cell.isDisabled = disabled;
      Array.from($cell.children).forEach(($child) => {
        $child.classList.toggle("disabled", disabled);
      });
    }
  }

  // src/lib/DataTable/src/components/Row.js
  function Row(table, options) {
    const _row = {
      element: null,
      id: utils.generateGuid(),
      cells: [],
      isSelected: false,
      isHidden: false,
      isDisabled: false,
      _data: options.data || {},
      // interno
      data,
      cell,
      index,
      show,
      disable,
      select,
      text,
      remove
    };
    const $row = create();
    _loadCells();
    return _row;
    function create() {
      const $row2 = document.createElement("div");
      $row2.id = _row.id;
      $row2.classList.add("dt-body-row");
      $row2.addEventListener("click", (event) => {
        if (!table.options.checkbox && table.options.rows.selectOnClick)
          select(true, event);
      });
      $row2.addEventListener("dblclick", (event) => {
        if (!table.options.rows.selectOnClick)
          return;
        if (window.getSelection)
          window.getSelection().removeAllRanges();
        if (table.options.onDoubleClickRow)
          table.options.onDoubleClickRow({ row: _row, event });
      });
      $row2.classList.toggle("selectable", table.options.rows.selectOnClick);
      _row.element = $row2;
      return $row2;
    }
    function _loadCells() {
      if (table.options.checkbox) {
        const options2 = new CellOptions();
        options2.row = _row;
        options2.checkbox = true;
        options2.resize = false;
        const cell2 = Cell(table, options2);
        _row.cells.push(cell2);
        $row.appendChild(cell2.element);
      }
      for (const name in table.options.columns) {
        const column = table.options.columns[name];
        const options2 = utils.mergeProps(new CellOptions(), column);
        options2.name = name;
        options2.data = _row._data;
        options2.value = _row._data[name];
        const cell2 = Cell(table, options2);
        _row.cells.push(cell2);
        $row.appendChild(cell2.element);
      }
    }
    function cell(nameOrIndex) {
      const cell2 = typeof nameOrIndex == "number" ? _row.cells[nameOrIndex] : _row.cells.find((cell3) => cell3.options.name == nameOrIndex);
      return cell2;
    }
    function index() {
      return utils.getElementIndex($row);
    }
    function show(show2 = true) {
      _row.isHidden = !show2;
      $row.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _row.isDisabled = disabled;
      $row.classList.toggle("disabled", disabled);
    }
    function select(selected = true, event) {
      if (event && event.shiftKey && window.getSelection)
        window.getSelection().removeAllRanges();
      if (table.options.checkbox) {
        _row.isSelected = selected;
        if (table.options.onSelectRows)
          table.options.onSelectRows({ rows: table.selectedRows() });
      } else {
        if (!table.options.rows.allowMultipleSelection || !event || !event.ctrlKey && !event.shiftKey) {
          table.unselectRows(event, false);
          table._lastRowSelected = null;
        }
        if (event && event.ctrlKey) {
          selected = !_row.isSelected;
        }
        if (event && event.shiftKey && table._lastRowSelected) {
          let indexes = utils.createRangeArray(utils.getElementIndex(table._lastRowSelected), utils.getElementIndex($row));
          table.selectRows(indexes);
        }
        _row.isSelected = selected;
        if (!event || !event.shiftKey)
          table._lastRowSelected = $row;
        $row.classList.toggle("selected", selected);
        if (table.options.onSelectRows)
          table.options.onSelectRows({ rows: table.selectedRows() });
      }
    }
    function data(fields, meta = false) {
      if (fields) {
        for (const name in fields) {
          let value = fields[name];
          let cell2 = _row.cell(name);
          cell2.value(value);
          cell2.display(value);
        }
        if (table.options.onUpdateRow)
          table.options.onUpdateRow({ row: _row, fields });
      } else {
        if (!meta)
          return (({ meta: meta2, ...data2 }) => data2)(_row._data);
        return _row._data;
      }
    }
    function text(fieldNames) {
      let cells = fieldNames ? _row.cells.filter((x) => !!fieldNames.find((name) => name == x.options.name)) : _row.cells;
      let text2 = [];
      cells.forEach(
        (cell2) => text2.push(cell2.element.querySelector(".value-display").innerText.trim())
      );
      return text2;
    }
    function remove() {
      table.removeRows(_row);
    }
  }

  // src/lib/DataTable/src/components/Footer.js
  function Footer(table) {
    const $footer = create();
    const _footer = {
      element: $footer,
      isHidden: table.options.footer.hidden,
      isDisabled: table.options.footer.disabled,
      show,
      disable,
      content
    };
    content(table.options.footer.content);
    show(!_footer.isHidden);
    return _footer;
    function create() {
      const $footer2 = document.createElement("div");
      $footer2.classList.add("dt-footer");
      return $footer2;
    }
    function content(content2) {
      if (content2)
        $footer.innerHTML = content2;
    }
    function show(show2 = true) {
      _footer.isHidden = !show2;
      $footer.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _footer.isDisabled = disabled;
      $footer.classList.toggle("disabled", disabled);
    }
  }

  // src/lib/DataTable/src/components/Table.js
  function Table(options) {
    const _table = {
      options,
      id: options.id ? "dt-" + options.id : utils.generateGuid(),
      element: null,
      elements: {
        scrollable: null
      },
      header: null,
      body: {
        element: null
      },
      _columnWidths: null,
      rows: [],
      _lastRowSelected: null,
      footer: null,
      isDisabled: false,
      _data: options.data || [],
      data,
      load,
      reload,
      width,
      height,
      column,
      addRow,
      selectedRows,
      selectRows,
      unselectRows,
      rowsByFieldValue,
      moveSelectedRows,
      removeRows,
      removeSelectedRows,
      sort,
      disable,
      clear,
      export: _export,
      _setBorders
    };
    const $table = create();
    const key_storedWidths = `${_table.id}-widths`;
    createHeader();
    createBody();
    createFooter();
    width(options.width);
    height(options.height);
    disable(options.disabled);
    load(options.data);
    return _table;
    function create() {
      const $table2 = document.createElement("div");
      $table2.id = _table.id;
      $table2.classList.add("dt");
      const $scrollable = document.createElement("div");
      $scrollable.classList.add("scrollable");
      $table2.appendChild($scrollable);
      if (options.borders.table.all) {
        $table2.classList.add("table-border-all");
        if (options.borders.table.radius != null) {
          let radius = options.borders.table.radius;
          $table2.style.borderRadius = utils.parseDimension(radius);
          $scrollable.style.borderRadius = utils.parseDimension(radius);
        }
      } else {
        if (options.borders.table.top)
          $table2.classList.add("table-border-top");
        if (options.borders.table.bottom)
          $table2.classList.add("table-border-bottom");
      }
      if (options.style)
        utils.setElementStyle($table2, options.style);
      _table.element = $table2;
      _table.elements.scrollable = $scrollable;
      return $table2;
    }
    function createHeader() {
      const header = Header(_table);
      _table.header = header;
      $table.querySelector(".scrollable").appendChild(header.element);
      header.show(!options.header.hidden);
      header.disable(options.header.disabled);
    }
    function createBody() {
      const $body = document.createElement("div");
      $body.classList.add("dt-body");
      _table.body.element = $body;
      $table.querySelector(".scrollable").appendChild($body);
    }
    function createFooter() {
      if (options.footer) {
        const footer2 = Footer(_table);
        _table.footer = footer2;
        $table.appendChild(footer2.element);
      }
    }
    function column(nameOrIndex) {
      return {
        show,
        disable: disable2
      };
      function show(show2 = true) {
        _table.header.cell(nameOrIndex).show(show2);
        _table.rows.forEach((row) => row.cell(nameOrIndex).show(show2));
        _setColumnWidths();
      }
      function disable2(disabled = true) {
        _table.header.cell(nameOrIndex).disable(disabled);
        _table.rows.forEach((row) => row.cell(nameOrIndex).disable(disabled));
      }
    }
    function width(width2) {
      if (width2 == void 0)
        return $table.clientWidth;
      $table.style.width = utils.parseDimension(width2) || "auto";
    }
    function height(height2) {
      if (height2 == void 0)
        return $table.clientHeight;
      $table.style.height = utils.parseDimension(height2) || "auto";
    }
    function data(data2, meta = false) {
      _table._data = data2 || _table._data;
      if (!meta)
        return _table._data.map(({ meta: meta2, ...item }) => item);
      return _table._data;
    }
    function load(_data) {
      clear(!!_data);
      data(_data, true).forEach(
        (item) => addRow(item, false, false)
      );
      _setColumnWidths();
      _setColumnResizable();
      _setBorders();
    }
    function reload() {
      load();
    }
    function clear(clearData = true) {
      if (clearData)
        data([]);
      _table.rows = [];
      _table.body.element.innerHTML = "";
      _table.header.cells[0].checked(false);
    }
    function addRow(data2, insert = true, setBorders = true) {
      const row = Row(_table, { data: data2 });
      _table.rows.push(row);
      _table.body.element.appendChild(row.element);
      data2.meta = {
        row: {
          id: row.id
        }
      };
      if (insert)
        _table._data.push(data2);
      if (setBorders)
        _setBorders();
      if (options.onAddRow)
        options.onAddRow({ row });
      return row;
    }
    function selectedRows() {
      return _table.rows.filter((x) => x.isSelected);
    }
    function rowsByFieldValue(fieldName, value) {
      if (fieldName == void 0 || value == void 0)
        return;
      return _table.rows.filter(
        (row) => row._data[fieldName] == value
      );
    }
    function selectRows(indexes) {
      if (indexes)
        indexes = indexes instanceof Array ? indexes : [indexes];
      _table.rows.forEach((row) => {
        let selected = false;
        if (indexes) {
          for (let i = 0; i < indexes.length; i++) {
            if (utils.getElementIndex(row.element) == indexes[i]) {
              selected = true;
              break;
            }
          }
        } else {
          selected = true;
        }
        row.isSelected = selected;
        if (options.checkbox) {
          row.cells[0].checked(selected);
        } else {
          row.element.classList.toggle("selected", selected);
        }
      });
      if (options.checkbox)
        _table.header.cells[0].checked();
      if (options.onSelectRows)
        options.onSelectRows({ rows: selectedRows() });
    }
    function unselectRows(event, callback = true) {
      _table.header.cells[0].checked(false);
      selectedRows().forEach((row) => {
        row.isSelected = false;
        row.element.classList.remove("selected");
        row.cells[0].checked(false);
      });
      if (options.onUnselectRows && callback)
        options.onUnselectRows({ event });
    }
    function moveSelectedRows(down = true) {
      if (options.sort) return;
      if (down) {
        for (let i = _table.rows.length - 1; i >= 0; i--) {
          let fromIndex = i;
          let toIndex = i + 1;
          if (_table.rows[i].isSelected) {
            if (toIndex < _table.rows.length)
              changePosition(fromIndex, toIndex);
            else
              break;
          }
        }
      } else {
        for (let i = 0; i < _table.rows.length; i++) {
          let fromIndex = i;
          let toIndex = i - 1;
          if (_table.rows[i].isSelected) {
            if (toIndex >= 0)
              changePosition(fromIndex, toIndex);
            else
              break;
          }
        }
      }
      _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
      function changePosition(fromIndex, toIndex) {
        const row = _table.rows.splice(fromIndex, 1)[0];
        const item = _table._data.splice(fromIndex, 1)[0];
        _table.rows.splice(toIndex, 0, row);
        _table._data.splice(toIndex, 0, item);
      }
    }
    function removeRows(rows) {
      rows = rows instanceof Array ? rows : [rows];
      if (!rows.length)
        return;
      rows.forEach((row) => {
        _table.rows.forEach((_row, index) => {
          if (_row.id == row.id)
            _table.rows.splice(index, 1);
        });
        _table._data.forEach((item, index) => {
          if (item.meta.row.id == row.id)
            _table._data.splice(index, 1);
        });
        row.element.remove();
      });
      if (options.onRemoveRows)
        options.onRemoveRows();
    }
    function removeSelectedRows() {
      removeRows(selectedRows());
      _table.header.cells[0].checked(false);
    }
    function sort(fieldName, ascending = true) {
      _table.rows.sort((a, b) => {
        let va = a.cell(fieldName).value();
        let vb = b.cell(fieldName).value();
        if (typeof va == "string") {
          va = String(va).toLowerCase();
          vb = String(vb).toLowerCase();
        }
        if (va < vb)
          return ascending ? -1 : 1;
        if (va > vb)
          return ascending ? 1 : -1;
        return 0;
      });
      _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
    }
    function disable(disabled = true) {
      _table.isDisabled = disabled;
      $table.classList.toggle("disabled", disabled);
    }
    function _export(rows, options2 = { separator: "	" }) {
      let text = (rows || _table.selectedRows()).map((row) => {
        let fieldNames = row.cells.filter((x) => !x.checkbox && !x.isHidden).map((x) => x.options.name);
        return row.text(fieldNames).join(options2.separator);
      }).join("\n");
      return text;
    }
    function _setColumnWidths() {
      let widths = _storedWidths() || _table._columnWidths;
      if (!widths) {
        widths = [];
        if (options.checkbox)
          widths.push("34px");
        for (let name in options.columns) {
          let column2 = options.columns[name];
          if (column2.hidden)
            continue;
          let width2 = column2.width;
          let minWidth = column2.minWidth;
          let minMaxWidth;
          if (!width2 && !minWidth) {
            minMaxWidth = "1fr";
          } else if (width2 == minWidth) {
            minMaxWidth = width2 + "px";
          } else {
            width2 = width2 ? width2 + "px" : "1fr";
            minWidth = minWidth ? minWidth + "px" : width2;
            minMaxWidth = `minmax(${minWidth}, ${width2})`;
          }
          widths.push(minMaxWidth);
        }
      }
      _table._columnWidths = widths;
      _table.header.element.style.gridTemplateColumns = widths.join(" ");
      _table.body.element.style.gridTemplateColumns = widths.join(" ");
    }
    function _setColumnResizable() {
      const $header = _table.header.element;
      const $headerCells = $header.querySelectorAll(".dt-header-cell:not(.hidden)");
      const $body = _table.body.element;
      let currentColumn = null;
      let currentColumnIndex;
      let columnWidths;
      let startX;
      let startWidth;
      let diff;
      let isResizing = false;
      if ($header.hasResizeHandler)
        return;
      $headerCells.forEach(($cell, index) => {
        const $resizer = $cell.querySelector(".resizer");
        if ($resizer) {
          $resizer.addEventListener("mousedown", (event) => startResize(event, index, $cell));
          $resizer.addEventListener("click", (event) => event.stopPropagation());
        }
      });
      $header.hasResizeHandler = true;
      function startResize(event, index, $column) {
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
        currentColumn = _table.header.cell($column.dataset.name);
        if (!options.resize && !currentColumn.options.resize)
          return;
        $header.classList.add("resizing");
        isResizing = true;
        currentColumnIndex = index;
        startX = event.pageX;
        columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
        startWidth = parseFloat(columnWidths[currentColumnIndex]);
        document.body.style.cursor = "e-resize";
        document.body.style.userSelect = "none";
      }
      function resize(e) {
        if (!isResizing) return;
        diff = e.pageX - startX;
        let minWidth = currentColumn.options.minWidth || 50;
        let width2 = Math.max(minWidth, startWidth + diff);
        setColumnWidth(currentColumnIndex, width2);
      }
      function setColumnWidth(columnIndex, width2) {
        width2 = typeof width2 == "number" ? width2 + "px" : width2;
        columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
        columnWidths[columnIndex] = width2;
        $header.style.gridTemplateColumns = columnWidths.join(" ");
        $body.style.gridTemplateColumns = columnWidths.join(" ");
        _table._columnWidths = columnWidths;
      }
      function stopResize() {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
        if (!isResizing)
          return;
        isResizing = false;
        $header.classList.remove("resizing");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        _storedWidths(_table._columnWidths);
        if (diff && options.onResizeColumn) {
          options.onResizeColumn({ column: currentColumn, widths: _table._columnWidths });
          diff = 0;
        }
      }
    }
    function _storedWidths(widths) {
      if (widths) {
        widths[widths.length - 1] = `minmax(${widths[widths.length - 1]}, 1fr)`;
        localStorage.setItem(key_storedWidths, JSON.stringify(widths));
      } else {
        widths = localStorage.getItem(key_storedWidths);
        if (widths)
          _table._columnWidths = JSON.parse(widths);
        return _table._columnWidths;
      }
    }
    function _setBorders() {
      if (!(data().length && _table.header && _table.body)) return;
      _table.header.element.querySelector(".visible:last-child").classList.remove("cell-border-right");
      _table.body.element.childNodes.forEach(($row, index) => {
        $row.querySelector(".visible:last-child").classList.remove("cell-border-right");
      });
      let radius = options.footer.hidden ? "inherit" : "0px";
      _table.elements.scrollable.style.borderBottomLeftRadius = radius;
      _table.elements.scrollable.style.borderbottomRightRadius = radius;
    }
  }

  // src/lib/DataTable/src/index.js
  var DataTable = (options) => {
    options = utils.mergeProps(new TableOptions(), options);
    const _table = Table(options);
    if (options.place)
      options.place.appendChild(_table.element);
    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onKeyDown);
    _table.destroy = destroy;
    return _table;
    function onWindowClick(event) {
      if (_table.isDisabled)
        return;
      if (!event.target.closest(".dt-header") && !event.target.closest(".dt-body")) {
        if (options.onClickOut)
          options.onClickOut({ event });
        if (!options.checkbox && !event.cancelUnselectRows)
          _table.unselectRows(event);
      }
    }
    function onKeyDown(event) {
      if (event.ctrlKey && event.key == "a" && (options.rows.selectOnClick && options.rows.allowMultipleSelection || options.checkbox)) {
        event.preventDefault();
        _table.selectRows();
      }
      if (options.onCopyClip && event.ctrlKey && event.key == "c" && (options.rows.selectOnClick || options.checkbox)) {
        options.onCopyClip({ text: _table.export() });
      }
      if (event.key == "Escape")
        _table.unselectRows(event);
    }
    function destroy() {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onKeyDown);
      _table.element.remove();
    }
  };
  var src_default = DataTable;

  // src/lib/Modal/Modal.js
  var defaultOptions2 = {
    title: "",
    // string,
    content: "",
    // string/HTMLElement,
    buttons: null,
    /* [
    	{
    		name: 'OK',
    		primary: true,
    		onClick: function
    	}, 
    	{
    		name: 'Cancelar',
    		primary: false,
    		onClick: function
    	}
    ]*/
    width: 360
    // number
  };
  function Modal(options) {
    options = { ...defaultOptions2, ...options };
    let _blocked = false;
    let $overlay;
    let $buttons;
    return {
      show,
      hide,
      block,
      showSpin
    };
    function create() {
      const $overlay2 = document.createElement("div");
      $overlay2.className = "modal-overlay";
      $overlay2.innerHTML = /*html*/
      `
			<div class="modal">
				<div class="modal-title">
					<span>${options.title}</span>
					<span class="modal-spin"></span>
				</div>
				<div class="modal-content"></div>
				<div class="modal-buttons"></div>
			</div>
		`;
      const $modal = $overlay2.querySelector(".modal");
      const $content = $overlay2.querySelector(".modal-content");
      $overlay2.addEventListener("click", hide);
      $modal.addEventListener("click", (event) => event.stopPropagation());
      if (options.width)
        $modal.style.width = options.width + "px";
      if (options.content instanceof HTMLElement)
        $content.appendChild(options.content);
      else
        $content.innerHTML = options.content;
      $buttons = $overlay2.querySelector(".modal-buttons");
      (options.buttons || []).forEach((button) => {
        const $button = document.createElement("button");
        $button.type = "button";
        $button.innerHTML = button.name;
        $button.classList.toggle("primary", !!button.primary);
        if (button.onClick)
          $button.addEventListener("click", button.onClick);
        if (button.name.match(/Cancel|No/))
          $button.addEventListener("click", hide);
        $buttons.appendChild($button);
      });
      return $overlay2;
    }
    function show() {
      $overlay = create();
      document.body.appendChild($overlay);
      $overlay.classList.remove("modal-invisible");
      $overlay.classList.add("modal-visible");
      if (options.buttons)
        $buttons.querySelector("button").focus();
      window.addEventListener("keydown", onKeyDown);
    }
    function hide() {
      destroy();
    }
    function block(block2 = true) {
      if (!options.buttons) return;
      _blocked = block2;
      $buttons.querySelectorAll("button").forEach(($button) => {
        $button.blur();
        $button.classList.toggle("disabled", block2);
      });
    }
    function showSpin(show2 = true) {
      $overlay.querySelector(".modal-spin").classList.toggle("visible", show2);
    }
    function destroy() {
      if (_blocked) return;
      $overlay.classList.remove("modal-visible");
      $overlay.classList.add("modal-invisible");
      setTimeout(() => {
        $overlay.remove();
        window.removeEventListener("keydown", onKeyDown);
      }, 200);
    }
    function onKeyDown(event) {
      if (event.key == "Tab") {
        if (_blocked)
          event.preventDefault();
      }
      if (event.key == "Escape") {
        destroy();
      }
    }
  }

  // src/pages/TasksPage.jsx
  var TasksPage = () => {
    const header = PageHeader_default({
      pageMap: ["Tasks"],
      description: "Create and manage automated tasks to efficiently optimize your images."
    });
    const actionBar = ActionBar_default({
      buttons: [
        { name: "tasksMenu", tooltip: "", icon: Icon_default("ellipsisVertical") },
        { name: "add", tooltip: "New task", icon: Icon_default("add"), onClick: newItem },
        { name: "edit", tooltip: "Edit", icon: Icon_default("edit"), onClick: editItem },
        { divider: true },
        { name: "search", tooltip: "View files", icon: Icon_default("search"), onClick: viewFiles },
        { name: "start", tooltip: "Start task", icon: Icon_default("start"), onClick: startTask },
        { name: "stop", tooltip: "Stop", icon: Icon_default("stop"), onClick: stopTask }
      ]
    });
    const context = {
      elements: {
        header: header.element,
        actionBar: actionBar.element,
        content: null
      },
      onShow,
      onHide,
      updateRunningTasks
    };
    let _dataTable;
    let _selectedRow;
    let _tasksContextMenu;
    let _pause;
    showActionBarButtons(false);
    setDataTable();
    return context;
    async function onShow() {
      await load();
      const id = localStorage.getItem("lastOpenedItem");
      if (id) {
        const rows = _dataTable.rowsByFieldValue("id", id);
        if (rows.length) {
          rows[0].select();
        }
      }
      localStorage.setItem("lastOpenedItem", "");
      Menu({
        trigger: document.querySelector("[name=tasksMenu]"),
        items: [
          { name: "Import tasks", icon: Icon_default("import"), onClick: importTasks },
          { name: "Export tasks", icon: Icon_default("export"), onClick: exportTasks }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
      _tasksContextMenu = Menu({
        items: [
          { name: "Disabled", icon: "", onClick: () => disableTask() },
          { divider: true },
          { name: "Edit", icon: Icon_default("edit"), onClick: editItem },
          { name: "Duplicate", icon: Icon_default("duplicate"), onClick: duplicateItem },
          { name: "Copy", icon: Icon_default("copy"), onClick: copyClipItems },
          { name: "View in file explorer", icon: Icon_default("folderSearch"), onClick: viewInFileExplorer },
          { divider: true },
          { name: "View files", icon: Icon_default("search"), onClick: viewFiles },
          { name: "Start task", icon: Icon_default("start"), onClick: startTask },
          { name: "Stop", icon: Icon_default("stop"), onClick: stopTask },
          { divider: true },
          { name: "Delete", icon: Icon_default("trash"), onClick: deleteItem }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
    }
    function onHide() {
      _dataTable.destroy();
    }
    async function load() {
      const { result: data } = await WebAPIService_default.getTasks();
      if (data)
        _dataTable.load(data.items);
    }
    function setDataTable() {
      _dataTable = src_default({
        id: "tasks",
        height: "100%",
        sort: true,
        resize: true,
        columns: {
          id: { displayName: "Id", hidden: true },
          name: { displayName: "Name", width: 200 },
          path: { displayName: "Path", width: 300 },
          content: { displayName: "Content", width: 100 },
          status: { displayName: "Status", width: 100 },
          progress: { displayName: "Progress", minWidth: 200, sort: false },
          elapsedTime: { displayName: "Elapsed Time", width: 120, sort: false },
          lastRun: { displayName: "Last Run", width: 120 },
          nextRun: { displayName: "Next Scheduled Run", sort: false }
        },
        rows: {
          selectOnClick: true,
          allowMultipleSelection: false
        },
        cells: {
          path: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("div", { class: "flex items-center justify-between" }, /* @__PURE__ */ createElement("div", { class: "cell", style: "padding: 7px 8px 9px 8px; overflow-wrap: anywhere;" }, value), /* @__PURE__ */ createElement("a", { href: "javascript:", onClick: viewInFileExplorer, class: "button w-10 h-10", title: "View in file explorer" }, Icon_default("folderSearch"))),
            style: { padding: "0 !important" }
          },
          content: {
            display: ({ item, value }) => value == "root" ? "Root files" : "All directory"
          },
          status: {
            display: ({ item, value }) => {
              return shared_default.constants.status.find((x) => x.name == value)?.displayName || "";
            }
          },
          progress: {
            display: ({ item, value }) => {
              if (value) {
                const progress = RowProgressBar_default();
                let percent = value.split("%")[0];
                progress.show();
                progress.update(percent, value);
                return progress.element;
              }
              return null;
            }
          },
          elapsedTime: {
            display: ({ item, value }) => value || ""
          },
          lastRun: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          },
          nextRun: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          }
        },
        onAddRow: ({ row }) => {
          disableRow(row);
          setFooter();
          dom(row.element).on("contextmenu", ({ event }) => {
            if (!row.isSelected)
              row.select();
            _tasksContextMenu.show(event);
            _tasksContextMenu.item("Disabled").icon(
              row.data().status == "disabled" ? Icon_default("checked") : ""
            );
          });
        },
        onSelectRows: ({ rows }) => {
          _selectedRow = rows[0];
          showActionBarButtons();
        },
        onUnselectRows: () => {
          showActionBarButtons(false);
        },
        onDoubleClickRow: ({ row, event }) => {
          editItem();
        },
        onRemoveRows: () => {
          setFooter();
        },
        onCopyClip: ({ text }) => {
          copyClipItems();
        },
        onClickOut: ({ event }) => {
          event.cancelUnselectRows = !!event.target.closest(".actionbar");
        }
      });
      context.elements.content = _dataTable.element;
    }
    function newItem() {
      location.hash = "task/new";
    }
    function editItem() {
      let id = _selectedRow.data().id;
      localStorage.setItem("lastOpenedItem", id);
      location.hash = "task/" + id;
    }
    async function viewFiles() {
      let id = _selectedRow.data().id;
      let isAvailable = await WebAPIService_default.pathIsAvailable(_selectedRow.data().path);
      if (isAvailable) {
        localStorage.setItem("lastOpenedItem", id);
        location.hash = `task/${id}/files`;
      }
    }
    async function isTaskRunning(row) {
      let task = (row || _selectedRow).data();
      let { result: isRunning } = await WebAPIService_default.isTaskRunning(task.id);
      if (isRunning)
        toastInfo("Task in progress.");
      return isRunning;
    }
    async function startTask() {
      let task = _selectedRow.data();
      if (await isTaskRunning())
        return;
      if (task.status == "disabled") {
        toastInfo("Task is disabled.");
        return;
      }
      let isAvailable = await WebAPIService_default.pathIsAvailable(task.path);
      if (!isAvailable)
        return;
      const modal = Modal({
        title: "Start task",
        content: "The optimization process will begin, and the files will be permanently compressed.<br><br>Do you wish to continue?",
        buttons: [
          {
            name: "OK",
            primary: true,
            onClick: () => {
              WebAPIService_default.startTask(task.id).then(
                (response) => toastInfo(response.result)
              );
              modal.hide();
            }
          },
          { name: "Cancel" }
        ]
      });
      modal.show();
    }
    function updateRunningTasks(runningTasks) {
      if (!runningTasks || _pause) return;
      runningTasks = JSON.parse(runningTasks);
      if (runningTasks) {
        runningTasks.forEach((runningTask) => {
          const row = _dataTable.rowsByFieldValue("id", runningTask.id)[0];
          if (row) {
            row.data({
              status: runningTask.disabled ? "disabled" : runningTask.status,
              elapsedTime: runningTask.elapsedTime,
              nextRun: runningTask.nextRun,
              lastRun: runningTask.lastRun
            });
            updateProgress(row, runningTask);
            disableRow(row, runningTask.disabled);
          }
        });
      }
    }
    function updateProgress(row, runningTask) {
      let index = runningTask.index;
      let total = runningTask.total;
      let percent = Math.round(index / total * 100);
      let value = index ? `${percent}% ${index}/${total}` : "";
      row.data({ progress: value });
    }
    function stopTask() {
      WebAPIService_default.stopTask(_selectedRow.data().id);
    }
    async function duplicateItem() {
      let clone = structuredClone(_selectedRow.data());
      const { result: task } = await WebAPIService_default.insertTask(clone);
      _dataTable.addRow(task).select();
    }
    function copyClipItems() {
      WebAPIService_default.copyClip(_dataTable.export());
    }
    function viewInFileExplorer(event) {
      if (event.pointerId && event.pointerId != 1) return;
      setTimeout(() => WebAPIService_default.viewInFileExplorer(_selectedRow.data().path), 200);
    }
    async function disableTask(row) {
      if (await isTaskRunning())
        return;
      let task = (row || _selectedRow).data();
      task.status = task.status == "disabled" ? "" : "disabled";
      _selectedRow.data({ status: task.status });
      WebAPIService_default.updateTask(task);
      _pause = true;
      setTimeout(() => _pause = false, 1e3);
    }
    function disableRow(row, disable) {
      row = row || _selectedRow;
      disable = disable != void 0 ? disable : row.data().status == "disabled";
      row.cells.forEach(
        (cell) => cell.element.style.opacity = disable ? 0.75 : ""
      );
    }
    async function deleteItem() {
      if (await isTaskRunning())
        return;
      const modal = Modal({
        title: "Delete task",
        content: "The selected item will be permanently deleted.<br><br>Do you wish to continue?",
        buttons: [
          {
            name: "OK",
            primary: true,
            onClick: () => {
              let id = _selectedRow.data().id;
              WebAPIService_default.deleteTask(id);
              _selectedRow.remove();
              modal.hide();
              showActionBarButtons(false);
            }
          },
          { name: "Cancel" }
        ]
      });
      modal.show();
    }
    function showActionBarButtons(show = true) {
      let selector = ".divider, [name=edit], [name=search], [name=start], [name=stop]";
      actionBar.element.get(selector).show(show);
    }
    async function importTasks() {
      const { result: path } = await WebAPIService_default.filePicker("Import tasks", "json");
      if (path) {
        const { error } = await WebAPIService_default.importTasks(path);
        if (!error)
          load();
      }
    }
    async function exportTasks() {
      const fileName = "Tasks.json";
      const { result: path } = await WebAPIService_default.saveFilePicker("Export tasks", fileName, "json");
      if (path)
        await WebAPIService_default.downloadFile(`http://localhost:1010/data/${fileName}`, path);
    }
    function setFooter() {
      let items = _dataTable.data().length;
      shared_default.footer.info(`${items || "No"} tasks`);
    }
    function toastInfo(message) {
      if (!message) return;
      Toast({
        icon: Icon_default("info"),
        message,
        position: "bottom center",
        time: 4
      });
      lucide.createIcons();
    }
  };
  var TasksPage_default = TasksPage;

  // src/lib/Utils.js
  var utils2 = new Utils2();
  var Utils_default = utils2;
  function Utils2() {
    this.generateGuid = generateGuid;
    this.convert = convert;
    this.isBoolean = isBoolean;
    this.isEmpty = isEmpty;
    this.isNullOrEmpty = isNullOrEmpty;
    this.isUndefinedOrNull = isUndefinedOrNull;
    this.isUndefinedOrNullOrEmpty = isUndefinedOrNullOrEmpty;
    this.isNumber = isNumber;
    this.isInteger = isInteger;
    this.isDateTime = isDateTime;
    this.isIframe = isIframe;
    this.compressTemplateString = compressTemplateString;
    this.truncateText = truncateText;
    function generateGuid() {
      const guid = ("1000000-1000-4000-8000" + -1e11).replace(
        /[018]/g,
        (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      return "a" + guid;
    }
    function convert() {
      function toNumber(value, options) {
        if (isUndefinedOrNullOrEmpty(value)) return null;
        const _options = {
          digits: 2
        };
        if (options) {
          if (options.digits !== "auto")
            options.digits = isNumber(options.digits) && options.digits >= 0 ? options.digits : _options.digits;
        } else {
          options = _options;
        }
        let number = value;
        if (typeof value === "string") {
          let isNegative = value.startsWith("-");
          let numbers = value.match(/\d+/g);
          number = "";
          if (numbers) {
            for (let i = 0; i < numbers.length; i++) {
              number += numbers[i];
              if (i === numbers.length - 2) number += ".";
            }
          }
          number = Number(isNegative ? "-" + number : number);
        }
        return options.digits === "auto" ? number : Number(number.toFixed(options.digits));
      }
      function toBoolean(value) {
        if (typeof value === "boolean") {
          return value;
        } else if (Utils2().isUndefinedOrNullOrEmpty(value)) {
          return false;
        } else if (typeof value === "number") {
          return value === 1;
        } else if (typeof value === "string") {
          value = value.toLowerCase().trim();
          if (value.match(/^true$|^yes$|^sim$|^1$/)) return true;
          else if (value.match(/^false$|^no$|^não$|^0$/)) return false;
        }
        return false;
      }
      function numberToPx(value) {
        value = parseFloat(value);
        return value ? `${value}px` : "";
      }
      return {
        toNumber,
        toBoolean,
        numberToPx
      };
    }
    function isBoolean(value) {
      return typeof value === "boolean";
    }
    function isEmpty(value) {
      return value === "" || Array.isArray(value) && !value.length;
    }
    function isNullOrEmpty(value) {
      return value === null || isEmpty(value);
    }
    function isUndefinedOrNull(value) {
      return value === void 0 || value === null;
    }
    function isUndefinedOrNullOrEmpty(value) {
      return isUndefinedOrNull(value) || isNullOrEmpty(value);
    }
    function isNumber(value) {
      if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;
      return !isNaN(Number(value));
    }
    function isInteger(value) {
      if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;
      return Number.isInteger(Number(value));
    }
    function isDateTime(value, format) {
      if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;
      if (value instanceof Date) return true;
      if (format === "dd/mm/yyyy")
        return value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) !== null;
      if (format === "dd/mm/yyyy hh:mm")
        return value.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/) !== null;
      if (format === "dd/mm/yyyy hh:mm:ss")
        return value.match(
          /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
        ) !== null;
      if (format === "yyyy-mm-dd")
        return value.match(/^(\d{4})-(\d{2})-(\d{2})$/) !== null;
      if (format === "yyyy-mm-ddThh:mm")
        return value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/) !== null;
      if (format === "yyyy-mm-dd hh:mm")
        return value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/) !== null;
      if (format === "yyyy-mm-ddThh:mm:ss")
        return value.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
        ) !== null;
      if (format === "yyyy-mm-dd hh:mm:ss")
        return value.match(
          /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
        ) !== null;
      if (format === "yyyy-mm-ddThh:mm:ssZ")
        return value.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/
        ) !== null;
      if (format === "yyyy-mm-dd hh:mm:ssZ")
        return value.match(
          /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})Z$/
        ) !== null;
      if (format === "yyyy-mm-ddZ")
        return value.match(/^(\d{4})-(\d{2})-(\d{2})Z$/) !== null;
    }
    function isIframe() {
      return window.location !== window.parent.location;
    }
    function compressTemplateString(text) {
      return text.replace(/\n|\t/g, "").trim();
    }
    function truncateText(text, maxLength) {
      if (text.length > maxLength)
        return text.substring(0, maxLength - 3) + "...";
      return text;
    }
  }

  // src/components/Tabs.jsx
  var Tabs = ({ names = [], contents = [], vertical = false, style = null, onChange = null }) => {
    const root = /* @__PURE__ */ createElement("div", { class: "Tabs" }, names.map((name, index) => /* @__PURE__ */ createElement("a", { type: "button", class: "tab button h-10 px-3", onClick: (e) => onClickTab(index, e) }, /* @__PURE__ */ createElement("span", null, name))));
    const $root = dom(root);
    const context = {
      element: $root,
      contents,
      selectTab
    };
    const $tabs = $root.get(".tab");
    set();
    return context;
    function set() {
      $root.addClass("vertical", vertical);
      $root.get(".tab").addClass("vertical", vertical);
      $root.get(".tab").addClass("horizontal", !vertical);
      $tabs.forEach(($tab) => {
        if (style)
          $tab.style(style);
      });
      contents.forEach(($content, index) => {
        if (index > 0)
          $content.hide();
      });
    }
    function selectTab(index) {
      $tabs.forEach(($tab, _index) => {
        $tab.addClass("active", index == _index);
        const $content = contents[_index];
        if ($content)
          $content.show(index == _index);
      });
      if (onChange) onChange(index);
    }
    function onClickTab(index, event) {
      selectTab(index, event);
    }
  };
  var Tabs_default = Tabs;

  // src/pages/TaskPageGeneral.jsx
  var TaskPageGeneral = ({ task, storeItem }) => {
    const root = /* @__PURE__ */ createElement("form", { class: "flex flex-col gap-10 !py-10 w-[600px]" }, /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label required" }, "Name"), /* @__PURE__ */ createElement("input", { type: "text", name: "name", class: "w-full", required: true, spellcheck: "false" })), /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Description"), /* @__PURE__ */ createElement("textarea", { name: "description", class: "w-full !min-h-23", spellcheck: "false", onInput: (e) => dom(e.target).resize() })), /* @__PURE__ */ createElement("div", { class: "field path flex flex-col" }, /* @__PURE__ */ createElement("div", { class: "field-label required" }, "Directory path"), /* @__PURE__ */ createElement("div", { class: "grid grid-cols-[fit-content(100%)_1fr] gap-x-1 gap-y-1" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", onClick: selectPath, title: "Select folder" }, Icon_default("folder")), /* @__PURE__ */ createElement("input", { type: "text", name: "path", required: true, class: "w-full", spellcheck: "false" }), /* @__PURE__ */ createElement("span", null), /* @__PURE__ */ createElement("div", { class: "field-description" }, "Directory path containing the files to be optimized."))), /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Content"), /* @__PURE__ */ createElement("div", { class: "flex flex-col gap-4" }, /* @__PURE__ */ createElement("label", { class: "radio" }, /* @__PURE__ */ createElement("input", { type: "radio", name: "content", value: "root" }), /* @__PURE__ */ createElement("div", { class: "radio-name" }, shared_default.constants.content.find((x) => x.name == "root")?.displayName), /* @__PURE__ */ createElement("div", { class: "radio-description" }, "Optimizes only the files in the root directory.")), /* @__PURE__ */ createElement("label", { class: "radio" }, /* @__PURE__ */ createElement("input", { type: "radio", name: "content", value: "all" }), /* @__PURE__ */ createElement("div", { class: "radio-name" }, shared_default.constants.content.find((x) => x.name == "all")?.displayName), /* @__PURE__ */ createElement("div", { class: "radio-description" }, "Optimizes all files within the directory, including folders and subfolders.")))));
    const $root = dom(root);
    const context = {
      element: $root,
      onShow
    };
    return context;
    function onShow() {
      $root.get("input, textarea").bindData({ object: task }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        if (key == "path") {
          task.path = value.replace(/\\+$/, "");
        }
        storeItem(task);
      });
    }
    async function selectPath() {
      const { result: path } = await WebAPIService_default.folderPicker("Select folder");
      if (path) {
        task.path = path;
        $root.getByName("path").value(path);
        storeItem(task);
      }
    }
  };
  var TaskPageGeneral_default = TaskPageGeneral;

  // src/pages/TaskPageFileSettingsFilter.jsx
  var TaskPageFileSettingsFilter = ({ task, fileTypeControls, storeItem }) => {
    const actionBar = ActionBar_default({
      buttons: [
        { name: "add", tooltip: "Add item", icon: Icon_default("add"), onClick: addItem },
        { name: "moveUp", tooltip: "Move up", icon: Icon_default("up"), disabled: true, onClick: () => moveItem("up") },
        { name: "moveDown", tooltip: "Move down", icon: Icon_default("down"), disabled: true, onClick: () => moveItem("down") },
        { name: "copy", tooltip: "Copy", icon: Icon_default("copy"), disabled: true, onClick: copyItems },
        { name: "paste", tooltip: "Paste", icon: Icon_default("paste"), disabled: true, onClick: pasteItems },
        { name: "delete", tooltip: "Delete", icon: Icon_default("trash"), disabled: true, onClick: removeItem }
      ]
    });
    const root = /* @__PURE__ */ createElement("div", { class: "TaskPageFileSettingsFilter w-min" }, /* @__PURE__ */ createElement("div", { class: "action-bar flex items-center justify-between pb-1.5" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Filter"))), actionBar.element.nodes[0]), /* @__PURE__ */ createElement("div", { class: "dt-place" }), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-2" }, "Enable the search filter to create rule sets using multiple properties, values, and conditions. When the task starts, only the filtered files will be optimized. To test and validate the filter, click the ", /* @__PURE__ */ createElement("span", { class: "font-semibold" }, "View files"), " button."));
    const leftBracketOptions = shared_default.constants.fileFilter.leftBracketOptions;
    const rightBracketOptions = shared_default.constants.fileFilter.rightBracketOptions;
    const propertyOptions = shared_default.constants.fileFilter.propertyOptions;
    const conditionOptions = shared_default.constants.fileFilter.conditionOptions;
    const operatorOptions = shared_default.constants.fileFilter.operatorOptions;
    const numberConditions = shared_default.constants.fileFilter.numberConditions;
    const stringConditions = shared_default.constants.fileFilter.stringConditions;
    const $root = dom(root);
    const context = {
      element: $root,
      actionBar,
      load
    };
    let _fileType;
    let _dataTable;
    setDataTable();
    return context;
    function setDataTable() {
      _dataTable = src_default({
        place: $root.get(".dt-place").nodes[0],
        checkbox: true,
        sort: false,
        resize: false,
        borders: {
          table: {
            all: true
          },
          rows: true,
          cells: true,
          style: {
            "border-color": "#ccc"
          }
        },
        columns: {
          leftParentheses: { displayName: "(", width: 40, style: { color: "#666", paddingLeft: 11 } },
          property: { displayName: "Property", width: 140, style: { paddingLeft: 11 } },
          condition: { displayName: "Condition", width: 140, style: { paddingLeft: 11 } },
          value: { displayName: "Value", width: 200, style: { paddingLeft: 11 } },
          rightParentheses: { displayName: ")", width: 40, style: { color: "#666", paddingLeft: 12 } },
          operator: { displayName: "Operator", width: 90, style: { paddingLeft: 11 } }
        },
        rows: {
          selectOnClick: false
        },
        cells: {
          leftParentheses: {
            display: ({ item, value }) => {
              const field = /* @__PURE__ */ createElement("select", { name: "leftParentheses", class: "no-icon b-transparent" }, leftBracketOptions.map(
                (prop) => /* @__PURE__ */ createElement("option", { value: prop.name }, prop.displayName)
              ));
              field.value = value;
              return field;
            }
          },
          property: {
            display: ({ item, value }) => {
              const field = /* @__PURE__ */ createElement("select", { name: "property", class: "no-icon b-transparent" }, propertyOptions.map(
                (prop) => /* @__PURE__ */ createElement("option", { value: prop.name, "data-type": prop.dataType }, prop.displayName)
              ));
              field.value = value;
              return field;
            }
          },
          condition: {
            display: ({ item, value }) => {
              const field = /* @__PURE__ */ createElement("select", { name: "condition", class: "no-icon b-transparent" }, conditionOptions.map(
                (prop) => /* @__PURE__ */ createElement("option", { value: prop.name }, prop.displayName)
              ));
              field.value = value;
              return field;
            }
          },
          value: {
            display: ({ item, value }) => {
              const inputHidden = /* @__PURE__ */ createElement("input", { type: "hidden", name: "value" });
              const inputNumber = /* @__PURE__ */ createElement("input", { type: "number", min: "0", class: "b-transparent" });
              const inputDate = /* @__PURE__ */ createElement("input", { type: "date", class: "b-transparent" });
              const textarea = /* @__PURE__ */ createElement("textarea", { "data-type": "string", rows: "1", spellcheck: "false", class: "b-transparent" });
              inputHidden.value = value;
              dom(inputNumber).value(value).hide().on("input", ({ element }) => updateInputHidden(element.value()));
              dom(inputDate).value(value).hide().on("input", ({ element }) => updateInputHidden(element.value()));
              dom(textarea).value(value).on("input", ({ element }) => {
                updateInputHidden(element.value());
                element.resize();
              });
              return /* @__PURE__ */ createElement("div", { class: "fields" }, inputHidden, inputNumber, inputDate, textarea);
              function updateInputHidden(value2) {
                inputHidden.value = value2;
                inputHidden.dispatchEvent(new Event("input"));
              }
            }
          },
          rightParentheses: {
            display: ({ item, value }) => {
              const field = /* @__PURE__ */ createElement("select", { name: "rightParentheses", class: "no-icon b-transparent" }, rightBracketOptions.map(
                (prop) => /* @__PURE__ */ createElement("option", { value: prop.name }, prop.displayName)
              ));
              field.value = value;
              return field;
            }
          },
          operator: {
            display: ({ item, value }) => {
              const field = /* @__PURE__ */ createElement("select", { name: "operator", class: "no-icon b-transparent" }, operatorOptions.map(
                (prop) => /* @__PURE__ */ createElement("option", { value: prop.name }, prop.displayName)
              ));
              field.value = value;
              return field;
            }
          }
        },
        onAddRow: ({ row }) => {
          if (!row.data().operator)
            row.data({ operator: "and" });
        },
        onSelectRows: ({ rows }) => {
          enableActionBarButtons(rows.length);
        },
        onUpdateRow: ({ row, fields }) => {
          storeItem(task);
        },
        onRemoveRows: () => {
          storeItem(task);
          enableActionBarButtons(_dataTable.selectedRows().length);
        }
      });
    }
    function load(fileType) {
      const filter = task.fileTypes.find((x) => x.type == fileType).filter;
      _fileType = fileType;
      $root.getByName("enabled").first().bindData({
        object: filter
      }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        _dataTable.disable(!value);
        dom(actionBar.element).disable(!value);
        storeItem(task);
      });
      loadFilter();
    }
    async function loadFilter() {
      const items = task.fileTypes.find((x) => x.type == _fileType).filter.items;
      _dataTable.load(items);
      items.forEach((item, index) => bindData(item, index));
      enableActionBarButtons(false);
    }
    function enableActionBarButtons(enable = true) {
      actionBar.button("moveUp").disable(!enable);
      actionBar.button("moveDown").disable(!enable);
      actionBar.button("copy").disable(!enable);
      actionBar.button("paste").disable(!enable);
      actionBar.button("delete").disable(!enable);
      enablePasteButtonForAllFilters();
    }
    function enablePasteButtonForAllFilters(enable) {
      enable = enable || shared_default.temp && shared_default.temp.selectedFilterItems.length;
      for (let fileType in fileTypeControls) {
        let datatableFilter = fileTypeControls[fileType].filter;
        datatableFilter.actionBar.button("paste").disable(!enable);
      }
    }
    async function addItem() {
      const { result: filterItem } = await WebAPIService_default.newTaskFileFilterItem();
      _dataTable.addRow(filterItem);
      bindData(filterItem, _dataTable.rows.length - 1);
    }
    function moveItem(direction) {
      _dataTable.moveSelectedRows(direction == "down");
    }
    function copyItems() {
      let clone = structuredClone(_dataTable.selectedRows().map((row) => row.data()));
      shared_default.temp = {
        selectedFilterItems: clone
      };
      enablePasteButtonForAllFilters();
    }
    function pasteItems() {
      if (shared_default.temp && shared_default.temp.selectedFilterItems.length) {
        task.fileTypes.find((x) => x.type == _fileType).filter.items.push(...shared_default.temp.selectedFilterItems);
        loadFilter();
        shared_default.temp = null;
      }
      enablePasteButtonForAllFilters(false);
    }
    function removeItem() {
      _dataTable.removeSelectedRows();
      if (!_dataTable.rows.length)
        addItem();
    }
    function bindData(filterItem, rowIndex) {
      let $row = dom(_dataTable.rows[rowIndex].element);
      $row.get("input, textarea, select").bindData({
        object: filterItem
      }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        if (key == "property") {
          setFields({ key, field, fields, event });
        }
        storeItem(task);
      });
    }
    function setFields({ key, field, fields, event }) {
      if (key == "property") {
        const selectedOptions = field.nodes[0].selectedOptions;
        if (selectedOptions.length) {
          const propertyDataType = selectedOptions[0].dataset.type;
          fields.condition.get("option").forEach((option) => {
            const conditions = propertyDataType == "number" || propertyDataType == "date" ? numberConditions : stringConditions;
            let show = conditions.some((x) => x == option.value());
            option.show(show);
            if (!show && option.value() == fields.condition.value())
              fields.condition.value("");
          });
          fields.value.parent().get("*").hide().forEach((field2) => {
            if (field2.attr("type") == propertyDataType || field2.attr("data-type") == propertyDataType) {
              if (event) {
                fields.value.value("");
                field2.value("");
              }
              field2.show();
            }
          });
        }
      }
    }
  };
  var TaskPageFileSettingsFilter_default = TaskPageFileSettingsFilter;

  // src/pages/TaskPageFileSettings.jsx
  var TaskPageFileSettings = ({ task, tabIndex = 0, storeItem }) => {
    const _fileTypeControls = {};
    const tabs = Tabs_default({
      names: shared_default.constants.fileTypes.map(
        (type) => /* @__PURE__ */ createElement("div", { class: "flex items-center" }, /* @__PURE__ */ createElement("label", { class: "checkbox", onClick: (e) => e.preventDefault() }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "fileType", value: type.name, onClick: (e) => e.stopPropagation() })), /* @__PURE__ */ createElement("b", null, type.displayName))
      ),
      style: {
        "padding-left": 8
      },
      onChange: (index) => localStorage.setItem("tabTypeIndex", index)
    });
    const root = /* @__PURE__ */ createElement("form", { class: "flex flex-col gap-10 !py-10" }, /* @__PURE__ */ createElement("div", { class: "flex flex-col" }, /* @__PURE__ */ createElement("b", null, "Types"), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "Select the file types to be optimized."), /* @__PURE__ */ createElement("div", { class: "py-3 border-b-1 border-gray-300" }, tabs.element.nodes[0])), shared_default.constants.fileTypes.map((type) => {
      let filter = TaskPageFileSettingsFilter_default({ task, fileTypeControls: _fileTypeControls, storeItem });
      let element = /* @__PURE__ */ createElement("div", { class: "flex flex-col gap-10" }, /* @__PURE__ */ createElement("div", { class: "text-lg font-bold" }, type.displayName), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "flex items-center gap-5 w-80" }, /* @__PURE__ */ createElement("b", null, "Quality"), /* @__PURE__ */ createElement("input", { type: "range", min: "0", max: "100", step: "5", name: "quality", class: "range" }), /* @__PURE__ */ createElement("span", { class: "quality-value" })), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "The lower the quality, the smaller the file size. Find the right balance.")), /* @__PURE__ */ createElement("div", { class: "flex flex-col maxWidth" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name flex gap-8 items-baseline" }, /* @__PURE__ */ createElement("b", null, "Max. width (px)"), /* @__PURE__ */ createElement("input", { type: "number", min: "0", name: "value", class: "min-w-[6em]" }))), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "Limits the width of images that exceed the specified width. Note: Does not affect images smaller than the specified width.")), /* @__PURE__ */ createElement("div", { class: "flex flex-col convert" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name flex gap-8 items-baseline" }, /* @__PURE__ */ createElement("b", null, "Convert to"), /* @__PURE__ */ createElement("select", { name: "type", class: "min-w-[6em]" }, /* @__PURE__ */ createElement("option", null), shared_default.constants.fileTypes.map((_type) => {
        if (_type.name != type.name)
          return /* @__PURE__ */ createElement("option", { value: _type.name }, _type.name.toUpperCase());
      })))), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "Converts the original image to the specified type. Note: This will not create a new image.")), filter.element.nodes[0]);
      element = dom(element);
      _fileTypeControls[type.name] = {
        element,
        filter
      };
      tabs.contents.push(element);
      return element.nodes[0];
    }));
    const $root = dom(root);
    const context = {
      element: $root,
      onShow
    };
    return context;
    function onShow() {
      tabs.selectTab(tabIndex);
      tabs.element.getByName("fileType").forEach(($fileType) => {
        const type = $fileType.value();
        const element = _fileTypeControls[type].element;
        const fileType = task.fileTypes.find((x) => x.type == type);
        $fileType.bindData({
          key: "enabled",
          object: fileType
        }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
          dom(element).disable(!value);
          storeItem(task);
        });
      });
      for (const type in _fileTypeControls) {
        const element = _fileTypeControls[type].element;
        const fileType = task.fileTypes.find((x) => x.type == type);
        element.getByName(["quality"]).bindData({
          object: fileType
        }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
          field.parent().get(".quality-value").text(value + "%");
          fileType.quality = Number(value);
          storeItem(task);
        });
        element.get(".maxWidth input").bindData({
          object: fileType.maxWidth
        }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
          if (key == "enabled") {
            fields.value.disable(!value);
          }
          if (key == "value") {
            fileType.maxWidth.value = Number(value);
          }
          storeItem(task);
        });
        element.get(".convert").get("input, select").bindData({
          object: fileType.convert
        }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
          if (key == "enabled") {
            fields.type.disable(!value);
          }
          storeItem(task);
        });
        _fileTypeControls[type].filter.load(type);
      }
    }
  };
  var TaskPageFileSettings_default = TaskPageFileSettings;

  // src/pages/TaskPageSchedule.jsx
  var TaskPageSchedule = ({ task, storeItem }) => {
    const root = /* @__PURE__ */ createElement("form", { class: "TaskPageSchedule flex flex-col gap-10 !py-10" }, /* @__PURE__ */ createElement("label", { class: "checkbox enabled" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Enabled")), /* @__PURE__ */ createElement("div", { class: "checkbox-description" }, "Select the days of the week, and specify the start times and recurrence for the task execution.")), /* @__PURE__ */ createElement("table", null, /* @__PURE__ */ createElement("thead", null, /* @__PURE__ */ createElement("tr", null, /* @__PURE__ */ createElement("th", null, "Always run"), /* @__PURE__ */ createElement("th", null, "Start on time"), /* @__PURE__ */ createElement("th", { colspan: "3" }, "Repeat every"))), /* @__PURE__ */ createElement("tbody", null, shared_default.constants.weekdays.map(
      (day) => /* @__PURE__ */ createElement("tr", null, /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("label", { class: "checkbox", title: "Enable/Disable" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, day.displayName))), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("input", { type: "time", name: "startTime" })), /* @__PURE__ */ createElement("td", { class: "repeat" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "repeat" }))), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("input", { type: "text", name: "repeatTimeValue", min: "1", step: "1", pattern: "\\d*", onInput: onInputRepeatValue, onChange: onChangeRepeatValue })), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("select", { name: "repeatTimeUnit" }, shared_default.constants.repeatTimeUnit.map(
        (unit) => /* @__PURE__ */ createElement("option", { value: unit.name }, unit.displayName)
      ))))
    ))));
    const $root = dom(root);
    const context = {
      element: $root,
      onShow
    };
    return context;
    function onShow() {
      $root.get(".enabled").getByName([
        "enabled"
      ]).bindData({
        object: task.schedule
      }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        if (key == "enabled") {
          $root.get("table").disable(!value);
        }
        storeItem(task);
      });
      $root.get("tbody tr").forEach(($row, index) => {
        const weekday = task.schedule.weekdays[index];
        $row.getByName([
          "enabled",
          "startTime",
          "repeat",
          "repeatTimeValue",
          "repeatTimeUnit"
        ]).bindData({
          object: weekday
        }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
          if (key == "enabled") {
            let checked1 = value;
            let checked2 = checked1 && fields.repeat.attr("checked");
            fields.repeat.parent().disable(!checked1);
            fields.startTime.disable(!checked1);
            fields.repeatTimeValue.disable(!checked2);
            fields.repeatTimeUnit.disable(!checked2);
          }
          if (key == "repeat" && event) {
            let checked2 = value;
            fields.repeatTimeValue.disable(!checked2);
            fields.repeatTimeUnit.disable(!checked2);
          }
          if (key == "repeatTimeValue") {
            weekday.repeatTimeValue = Number(value);
          }
          storeItem(task);
        });
      });
    }
    function onInputRepeatValue(event) {
      event.target.value = event.target.value.replace(/\D/g, "");
    }
    function onChangeRepeatValue(event) {
      let defaultValue = 1;
      event.target.value = Number(event.target.value) || defaultValue;
    }
  };
  var TaskPageSchedule_default = TaskPageSchedule;

  // src/pages/TaskPageExceptions.jsx
  var TaskPageExceptions = ({ task, storeItem }) => {
    const root = /* @__PURE__ */ createElement("form", { class: "TaskPageExceptions flex flex-col gap-10 !py-10" }, /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Enabled")), /* @__PURE__ */ createElement("div", { class: "checkbox-description" }, "Specify the directory paths to be excluded from the optimization service.", /* @__PURE__ */ createElement("br", null), "For each specified path, select the protection type."))), /* @__PURE__ */ createElement("div", { class: "table" }, /* @__PURE__ */ createElement("table", null, /* @__PURE__ */ createElement("thead", null, /* @__PURE__ */ createElement("tr", null, /* @__PURE__ */ createElement("th", { colspan: "2" }, /* @__PURE__ */ createElement("div", { class: "column" }, "Path")), /* @__PURE__ */ createElement("th", null, /* @__PURE__ */ createElement("div", { class: "column" }, "Protect")), /* @__PURE__ */ createElement("th", null, /* @__PURE__ */ createElement("div", { class: "column" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", onClick: addItem, title: "Add" }, Icon_default("add")))))), /* @__PURE__ */ createElement("tbody", null, task.exceptions.items.map(
      (exception, index) => /* @__PURE__ */ createElement("tr", null, /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("label", { class: "checkbox", title: "Enable/Disable" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }))), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("div", { class: "flex items-center gap-2" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", name: "buttonPath", onClick: () => selectPath(exception, index), title: "Select folder" }, Icon_default("folder")), /* @__PURE__ */ createElement("input", { type: "text", name: "path", class: "w-[550px]", spellcheck: "false" }))), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("select", { name: "content" }, /* @__PURE__ */ createElement("option", { value: "root", selected: true }, "Root files"), /* @__PURE__ */ createElement("option", { value: "all" }, "All directory"))), /* @__PURE__ */ createElement("td", null, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", name: "buttonDelete", onClick: (e) => deleteItem(exception, e), title: "Delete" }, Icon_default("trash"))))
    )))));
    const $root = dom(root);
    const context = {
      element: $root,
      onShow
    };
    return context;
    function onShow() {
      $root.get("[name=enabled]").first().bindData({ object: task.exceptions }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        $root.get(".table").disable(!value);
        storeItem(task);
      });
      const $tr = $root.get("tbody tr");
      task.exceptions.items.forEach((exception, index) => {
        bindItem($tr.at(index), exception);
      });
    }
    function addItem() {
      const $tbody = $root.get("tbody");
      const $tr = $tbody.get("tr").first().clone();
      const exception = {
        enabled: true,
        path: "",
        content: "root"
      };
      $tbody.insert($tr);
      bindItem($tr, exception);
      task.exceptions.items.push(exception);
      storeItem(task);
      $tr.get("[name=buttonPath]").on(
        "click",
        () => selectPath(exception, $tr.attr("rowIndex") - 1)
      );
      $tr.get("[name=buttonDelete]").on(
        "click",
        ({ event }) => deleteItem(exception, event)
      );
    }
    async function selectPath(exception, index) {
      const { result: path } = await WebAPIService_default.folderPicker("Select folder");
      if (path) {
        let $path = $root.get("[name=path]").at(index);
        $path.value(path);
        exception.path = path;
        storeItem(task);
      }
    }
    function deleteItem(exception, e) {
      let $tr = dom(e.target.closest("tr"));
      if ($root.get("tbody tr").length > 1) {
        task.exceptions.items = task.exceptions.items.filter((x, i) => i != $tr.attr("rowIndex") - 1);
        $tr.remove();
      } else {
        exception.enabled = true;
        exception.path = "";
        exception.content = "root";
        $tr.get("[name=enabled]").attr("checked", exception.enabled);
        $tr.get("[name=path]").value(exception.path);
        $tr.get("[name=content]").value(exception.content);
      }
      storeItem(task);
    }
    function bindItem($tr, obj) {
      $tr.get("input, select, button").bindData({ object: obj }).onChange(({ args, baseNode, field, fields, object, key, value, event }) => {
        if (key == "path") {
          obj.path = value.replace(/\\+$/, "");
        }
        if (key == "enabled") {
          $tr.get("[name=buttonPath]").disable(!value);
          $tr.get("[name=buttonDelete]").disable(!value);
          fields.path.disable(!value);
          fields.content.disable(!value);
        }
        storeItem(task);
      });
    }
  };
  var TaskPageExceptions_default = TaskPageExceptions;

  // src/pages/TaskPage.jsx
  var TaskPage = async () => {
    let _storedTask;
    let _tabIndex;
    let _tabTypeIndex;
    setStorage();
    const _id = RouterService_default.current.target;
    const _task = await getTask();
    const header = PageHeader_default({ onClickBackButton: back });
    const general = TaskPageGeneral_default({ task: _task, storeItem });
    const fileSettings = TaskPageFileSettings_default({ task: _task, tabIndex: _tabTypeIndex || 0, storeItem });
    const schedule = TaskPageSchedule_default({ task: _task, storeItem });
    const exceptions = TaskPageExceptions_default({ task: _task, storeItem });
    const tabs = Tabs_default({
      names: ["General", "File settings", "Scheduling", "Exceptions"],
      contents: [
        general.element,
        fileSettings.element,
        schedule.element,
        exceptions.element
      ],
      onChange: (index) => {
        localStorage.setItem("tabIndex", index);
        if (index == 1) {
          $root.get("textarea[data-type=string]").resize();
        }
      }
    });
    const actionBar = /* @__PURE__ */ createElement("div", { class: "action-bar" }, tabs.element.nodes[0], /* @__PURE__ */ createElement("span", { class: "divider h-5" }), /* @__PURE__ */ createElement("button", { type: "button", class: "button h-10 px-3 viewfiles", onClick: viewFiles }, Icon_default("search"), /* @__PURE__ */ createElement("span", null, "View files")));
    const root = /* @__PURE__ */ createElement("div", { class: "TaskPage" }, /* @__PURE__ */ createElement("div", { class: "tab-contents" }, general.element.nodes[0], fileSettings.element.nodes[0], schedule.element.nodes[0], exceptions.element.nodes[0]), /* @__PURE__ */ createElement("div", { class: "flex gap-5 py-7 bt" }, /* @__PURE__ */ createElement("button", { type: "button", name: "save", class: "button primary h-10 w-[90px] px-3", onClick: save }, /* @__PURE__ */ createElement("span", null, "Save")), /* @__PURE__ */ createElement("button", { type: "button", name: "cancel", class: "button border h-10 w-[90px] px-3", onClick: back }, /* @__PURE__ */ createElement("span", null, "Cancel"))));
    const $root = dom(root);
    const context = {
      elements: {
        header: header.element,
        actionBar,
        content: root
      },
      onShow,
      onHide
    };
    return context;
    function setStorage() {
      _storedTask = localStorage.getItem("task");
      _tabIndex = localStorage.getItem("tabIndex");
      _tabTypeIndex = localStorage.getItem("tabTypeIndex");
    }
    async function getTask() {
      return _id == "new" ? (await WebAPIService_default.newTask()).result : JSON.parse(_storedTask || null) || (await WebAPIService_default.getTaskById(_id)).result;
    }
    function onShow() {
      localStorage.setItem("task", JSON.stringify(_task));
      header.setPageMap([
        /* @__PURE__ */ createElement("button", { type: "button", class: "button h-10 px-3", onClick: back }, "Tasks"),
        /* @__PURE__ */ createElement("span", { title: _task.name }, Utils_default.truncateText(_task.name, 60) || "New task")
      ]);
      tabs.selectTab(_tabIndex || 0);
      general.onShow();
      fileSettings.onShow();
      schedule.onShow();
      exceptions.onShow();
      $root.get("textarea").resize();
    }
    function onHide() {
      if (RouterService_default.current.target.match(/tasks|history/i)) {
        localStorage.setItem("task", "");
        localStorage.setItem("tabIndex", 0);
        localStorage.setItem("tabTypeIndex", 0);
      }
      shared_default.temp = null;
    }
    function storeItem(task) {
      localStorage.setItem("task", JSON.stringify(task));
    }
    async function viewFiles() {
      let isAvailable = await WebAPIService_default.pathIsAvailable(_task.path);
      if (isAvailable)
        location.hash = `task/${_task.id}/files`;
    }
    async function isTaskRunning() {
      if (!_id || _id == "new")
        return false;
      let { result: isRunning } = await WebAPIService_default.isTaskRunning(_task.id);
      if (isRunning)
        toastInfo("Task in progress.");
      return isRunning;
    }
    async function save() {
      if (await isTaskRunning())
        return;
      if (validate()) {
        if (!_id || _id == "new")
          await WebAPIService_default.insertTask(_task);
        else
          await WebAPIService_default.updateTask(_task);
        back();
      }
    }
    function back() {
      location.hash = "tasks";
    }
    function validate() {
      let isValid = true;
      const $formGeneral = $root.get("form").at(0);
      let $invalidField;
      [...$formGeneral.attr("elements")].forEach((field) => {
        if (!field.checkValidity() && isValid) {
          $invalidField = field;
          field.focus();
          isValid = false;
        }
      });
      if (!isValid) {
        Toast({
          icon: Icon_default("info"),
          message: "Fill in the required fields.",
          position: "bottom center",
          time: 4
        });
        tabs.selectTab(0);
        $invalidField.focus();
        lucide.createIcons();
      }
      return isValid;
    }
    function toastInfo(message) {
      if (!message) return;
      Toast({
        icon: Icon_default("info"),
        message,
        position: "bottom center",
        time: 4
      });
      lucide.createIcons();
    }
  };
  var TaskPage_default = TaskPage;

  // src/components/Pager.jsx
  var Pager = ({ pageIndex = 0, limit = 0, total = 0, onPrev, onNext }) => {
    const root = /* @__PURE__ */ createElement("div", { class: "Pager" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", onClick: prev }, Icon_default("left")), /* @__PURE__ */ createElement("div", { class: "page-total" }, /* @__PURE__ */ createElement("span", { class: "page" }, limit), /* @__PURE__ */ createElement("span", { class: "separator" }, "/"), /* @__PURE__ */ createElement("span", { class: "total" }, total)), /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", onClick: next }, Icon_default("right")));
    const $root = dom(root).hide();
    const $page = $root.get(".page");
    const $total = $root.get(".total");
    const $buttonPrev = $root.get(".button w-10 h-10").at(0).disable();
    const $buttonNext = $root.get(".button w-10 h-10").at(1);
    return {
      element: $root,
      limit,
      setPage,
      setTotal
    };
    function setPage(_pageIndex, itemsLength) {
      pageIndex = _pageIndex;
      itemsLength += _pageIndex;
      $buttonPrev.disable(pageIndex <= 0);
      if (pageIndex > 0 && itemsLength >= total) {
        $buttonNext.disable();
      } else {
        $buttonNext.disable(false);
      }
      $page.text(itemsLength);
    }
    function setTotal(_total) {
      total = _total;
      if ($page.text() > total)
        $page.text(total);
      $total.text(total);
      $root.show(total > limit);
    }
    function prev() {
      pageIndex -= limit;
      if (onPrev)
        onPrev(pageIndex);
    }
    function next() {
      pageIndex += limit;
      if (onNext)
        onNext(pageIndex);
    }
  };
  var Pager_default = Pager;

  // src/pages/TaskFilesPage.jsx
  var TaskFilesPage = () => {
    const header = PageHeader_default({ onClickBackButton: back });
    const actionBar = ActionBar_default({
      buttons: [
        {
          name: "refresh",
          tooltip: "Refresh",
          icon: Icon_default("refresh"),
          style: "margin-left: 0.8em;",
          onClick: refresh
        }
      ]
    });
    const pager = Pager_default({
      limit: 100,
      onPrev: (pageIndex) => search(pageIndex),
      onNext: (pageIndex) => search(pageIndex)
    });
    const checkboxEnableExceptions = /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enableExceptions", onClick: refresh }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Enable exceptions")));
    const context = {
      elements: {
        header: header.element,
        actionBar: [
          checkboxEnableExceptions,
          actionBar.element,
          pager.element
        ],
        content: null
      },
      onShow,
      onHide
    };
    let _task;
    let _selectedRow;
    let _dataTable;
    let _filesContextMenu;
    setDataTable();
    return context;
    async function onShow() {
      const taskId = RouterService_default.current.hashParts[1];
      _task = JSON.parse(localStorage.getItem("task") || null) || (await WebAPIService_default.getTaskById(taskId)).result;
      if (!_task) return;
      header.setPageMap([
        /* @__PURE__ */ createElement("button", { type: "button", onClick: () => location.hash = "tasks" }, "Tasks"),
        // volta para página tasks e seleciona o item na lista
        /* @__PURE__ */ createElement("button", { type: "button", onClick: () => location.hash = "task/" + _task.id, title: _task.name }, Utils_default.truncateText(_task.name, 60) || "New task"),
        // volta para página task e seleciona as últimas tabs
        /* @__PURE__ */ createElement("span", null, "Files")
      ]);
      _filesContextMenu = Menu({
        items: [
          { name: "Refresh", icon: Icon_default("refresh"), onClick: search },
          { name: "Open file", icon: Icon_default("open"), onClick: openFile },
          { name: "View in file explorer", icon: Icon_default("folderSearch"), onClick: viewInFileExplorer },
          { name: "Copy", icon: Icon_default("copy"), onClick: copyClipItems }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
      search();
    }
    function onHide() {
      _dataTable.destroy();
    }
    function setDataTable() {
      _dataTable = src_default({
        id: "taskfiles",
        height: "100%",
        sort: true,
        resize: true,
        columns: {
          path: { displayName: "Path", width: 300 },
          type: { displayName: "Type", width: 90 },
          width: { displayName: "Width (px)", width: 110 },
          height: { displayName: "Height (px)", width: 110 },
          widthHeightRatio: { displayName: "W/H Ratio", width: 100 },
          size: { displayName: "Size (MB)", width: 100 },
          created: { displayName: "Created", width: 130 },
          modified: { displayName: "Modified" }
        },
        rows: {
          selectOnClick: true,
          allowMultipleSelection: true
        },
        cells: {
          path: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("a", { href: "javascript:", onClick: openFile, class: "link", style: "overflow-wrap: anywhere;" }, value)
          },
          type: {
            display: ({ item, value }) => value.toUpperCase().substring(1)
          },
          size: {
            display: ({ item, value }) => (value / 1024 / 1024).toFixed(4)
            // MB
          },
          created: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          },
          modified: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          }
        },
        onAddRow: ({ row }) => {
          dom(row.element).on("contextmenu", ({ event }) => {
            if (!row.isSelected)
              row.select();
            _filesContextMenu.show(event);
          });
        },
        onDoubleClickRow: ({ row, event }) => {
          openFile(event);
        },
        onSelectRows: ({ rows }) => {
          _selectedRow = rows[0];
          showActionBarButtons();
        },
        onUnselectRows: () => {
          showActionBarButtons(false);
        },
        onCopyClip: ({ text }) => {
          copyClipItems();
        },
        onClickOut: ({ event }) => {
          event.cancelUnselectRows = !!event.target.closest(".actionbar");
        }
      });
      context.elements.content = _dataTable.element;
    }
    async function search(pageIndex = 0) {
      dom(".icon.refresh").addClass("spin");
      _dataTable.clear();
      setFooter();
      let enableExceptions = dom(checkboxEnableExceptions).get("input").attr("checked");
      const { result } = await WebAPIService_default.searchTaskFilesPaged(_task, enableExceptions, pageIndex, pager.limit);
      if (result.items) {
        pager.setPage(pageIndex, result.items.length);
        pager.setTotal(result.total);
        setFooter(result.total);
        _dataTable.load(result.items);
      }
      dom(".icon.refresh").removeClass("spin");
    }
    async function refresh() {
      search();
    }
    function openFile(event) {
      if (event.pointerId && event.pointerId != 1) return;
      setTimeout(() => WebAPIService_default.openFile(_selectedRow.data().path), 200);
    }
    function viewInFileExplorer() {
      setTimeout(() => WebAPIService_default.viewInFileExplorer(_selectedRow.data().path), 200);
    }
    function copyClipItems() {
      WebAPIService_default.copyClip(_dataTable.export());
    }
    function setFooter(total) {
      shared_default.footer.info(`${total || "No"} files found`);
    }
    function back() {
      history.back();
    }
    function showActionBarButtons(show = true) {
    }
  };
  var TaskFilesPage_default = TaskFilesPage;

  // src/pages/HistoryPage.jsx
  var HistoryPage = () => {
    const header = PageHeader_default({
      pageMap: ["History"],
      description: "Monitor task execution history and browse optimized files."
    });
    const actionBar = ActionBar_default({
      buttons: [
        { name: "historyMenu", tooltip: "", icon: Icon_default("ellipsisVertical") },
        { tooltip: "Refresh", icon: Icon_default("refresh"), onClick: refresh },
        { name: "viewFiles", tooltip: "View files", icon: Icon_default("search"), onClick: viewFiles }
      ]
    });
    const pager = Pager_default({
      limit: 100,
      onPrev: (pageIndex) => load(pageIndex),
      onNext: (pageIndex) => load(pageIndex)
    });
    const context = {
      elements: {
        header: header.element,
        actionBar: [
          actionBar.element,
          pager.element
        ],
        content: null
      },
      dataTable: null,
      onShow,
      onHide
    };
    let _dataTable;
    let _selectedRow;
    let _historyContextMenu;
    showActionBarButtons(false);
    setDataTable();
    return context;
    async function onShow() {
      await load();
      const id = localStorage.getItem("lastOpenedItem");
      if (id) {
        const row = _dataTable.rowsByFieldValue("historyFileName", id)[0];
        if (row) {
          row.select();
        }
      }
      localStorage.setItem("lastOpenedItem", "");
      Menu({
        trigger: document.querySelector("[name=historyMenu]"),
        items: [
          { name: "Export history", icon: Icon_default("sheet"), onClick: exportHistory }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
      _historyContextMenu = Menu({
        items: [
          { name: "Refresh", icon: Icon_default("refresh"), onClick: refresh },
          { name: "View files", icon: Icon_default("search"), onClick: viewFiles },
          { name: "View in file explorer", icon: Icon_default("folderSearch"), onClick: viewInFileExplorer },
          { name: "Copy", icon: Icon_default("copy"), onClick: copyClipItems },
          { divider: true },
          { name: "Delete", icon: Icon_default("trash"), onClick: deleteItem }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
    }
    function onHide() {
      _dataTable.destroy();
    }
    function setDataTable() {
      _dataTable = src_default({
        id: "history",
        height: "100%",
        sort: true,
        resize: true,
        columns: {
          id: { displayName: "Id", hidden: true },
          taskId: { displayName: "Task Id", hidden: true },
          historyFileName: { displayName: "HistoryFileName", hidden: true },
          dateTime: { displayName: "Date/Time", width: 130 },
          name: { displayName: "Task", width: 170 },
          action: { displayName: "Action", width: 120 },
          status: { displayName: "Status", width: 90 },
          description: { displayName: "Description", width: 300 },
          path: { displayName: "Path" }
        },
        rows: {
          selectOnClick: true,
          allowMultipleSelection: true
        },
        cells: {
          dateTime: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          },
          status: {
            display: ({ item, value }) => {
              return value ? /* @__PURE__ */ createElement("div", { class: "chips" }, /* @__PURE__ */ createElement("div", { class: "chip" }, shared_default.constants.status.find((x) => x.name == value)?.displayName)) : "";
            },
            style: { padding: "5px 8px !important" }
          },
          path: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("a", { href: "javascript:", onClick: viewInFileExplorer, class: "link", style: "overflow-wrap: anywhere;" }, value)
          }
        },
        onAddRow: ({ row }) => {
          dom(row.element).on("contextmenu", ({ event }) => {
            if (!row.isSelected)
              row.select();
            _historyContextMenu.show(event);
          });
        },
        onSelectRows: ({ rows }) => {
          _selectedRow = rows[0];
          showActionBarButtons();
        },
        onUnselectRows: () => {
          showActionBarButtons(false);
        },
        onDoubleClickRow: ({ row }) => {
          viewFiles();
        },
        onCopyClip: ({ text }) => {
          copyClipItems();
        },
        onClickOut: ({ event }) => {
          event.cancelUnselectRows = !!event.target.closest(".actionbar");
        }
      });
      context.elements.content = _dataTable.element;
    }
    async function load(pageIndex = 0) {
      dom(".icon.refresh").addClass("spin");
      setFooter();
      const { result } = await WebAPIService_default.getHistoryPaged(pageIndex, pager.limit);
      if (result) {
        pager.setPage(pageIndex, result.items.length);
        pager.setTotal(result.total);
        _dataTable.load(result.items);
        setFooter(result.total);
      }
      dom(".icon.refresh").removeClass("spin");
    }
    async function refresh() {
      load();
    }
    function viewInFileExplorer(event) {
      if (event.pointerId && event.pointerId != 1) return;
      setTimeout(() => WebAPIService_default.viewInFileExplorer(_selectedRow.data().path), 200);
    }
    function copyClipItems() {
      WebAPIService_default.copyClip(_dataTable.export());
    }
    function viewFiles() {
      localStorage.setItem("lastOpenedItem", _selectedRow.data().historyFileName);
      location.hash = "historyfiles/" + _selectedRow.data().historyFileName;
    }
    async function deleteItem() {
      const modal = Modal({
        title: "Delete registry",
        content: "The selected item(s) will be permanently deleted.<br><br>Do you wish to continue?",
        buttons: [
          {
            name: "OK",
            primary: true,
            onClick: async () => {
              modal.block();
              modal.showSpin();
              await _delete();
              modal.block(false);
              modal.hide();
            }
          },
          { name: "Cancel" }
        ]
      });
      modal.show();
      async function _delete() {
        let rows = _dataTable.selectedRows();
        let ids = rows.map((x) => x.data().id).join(",");
        const { result: total, error } = await WebAPIService_default.deleteHistoryEvents(ids);
        if (!error) {
          pager.setTotal(total);
          setFooter(total);
          _dataTable.removeSelectedRows();
        }
      }
    }
    async function exportHistory() {
      const fileName = "History.xlsx";
      const { result: path } = await WebAPIService_default.saveFilePicker("Export history", fileName, "xlsx");
      if (path)
        WebAPIService_default.exportHistory("History", path);
    }
    function setFooter(total) {
      shared_default.footer.info(`${total || "No"} executions`);
    }
    function showActionBarButtons(show = true) {
      actionBar.element.get("[name=viewFiles]").show(show);
    }
  };
  var HistoryPage_default = HistoryPage;

  // src/pages/HistoryFilesPage.jsx
  var HistoryFilesPage = () => {
    const header = PageHeader_default({
      onClickBackButton: back,
      description: "Processed files and optimization details."
    });
    const actionBar = ActionBar_default({
      buttons: [
        { name: "pageMenu", tooltip: "", icon: Icon_default("ellipsisVertical") },
        { tooltip: "Refresh", icon: Icon_default("refresh"), onClick: refresh }
      ]
    });
    const pager = Pager_default({
      limit: 100,
      onPrev: (pageIndex) => load(pageIndex),
      onNext: (pageIndex) => load(pageIndex)
    });
    const context = {
      elements: {
        header: header.element,
        actionBar: [
          actionBar.element,
          pager.element
        ],
        content: null
      },
      onShow
    };
    const _historyFileName = location.hash.split("/")[1];
    let _dataTable;
    let _selectedRow;
    let _filesContextMenu;
    showActionBarButtons(false);
    setDataTable();
    return context;
    async function onShow() {
      const _taskId = _historyFileName.split("_")[0];
      const { result: task } = await WebAPIService_default.getTaskById(_taskId);
      header.setPageMap([
        /* @__PURE__ */ createElement("button", { type: "button", onClick: back }, "History"),
        /* @__PURE__ */ createElement("span", { title: task.name }, Utils_default.truncateText(task.name, 60)),
        /* @__PURE__ */ createElement("span", null, "Files")
      ]);
      Menu({
        trigger: document.querySelector("[name=pageMenu]"),
        items: [
          { name: "Export files", icon: Icon_default("sheet"), onClick: exportHistory }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
      _filesContextMenu = Menu({
        items: [
          { name: "Refresh", icon: Icon_default("refresh"), onClick: refresh },
          { name: "Open file", icon: Icon_default("open"), onClick: openFile },
          { name: "View in file explorer", icon: Icon_default("folderSearch"), onClick: viewInFileExplorer },
          { name: "Copy", icon: Icon_default("copy"), onClick: copyClipItems }
        ],
        onShow: () => {
          lucide.createIcons();
        }
      });
      await load();
    }
    function setDataTable() {
      _dataTable = src_default({
        id: "historyfiles",
        height: "100%",
        resize: true,
        sort: true,
        columns: {
          dateTime: { displayName: "Date/Time", width: 140 },
          path: { displayName: "Path", width: 300 },
          action: { displayName: "Action", width: 140 },
          status: { displayName: "Status", width: 120 },
          description: { displayName: "Description", width: 300 },
          sizePx: { displayName: "Size (px)", width: 120 },
          newSizePx: { displayName: "New Size (px)", width: 120 },
          sizeBytes: { displayName: "Size (MB)", width: 120 },
          newSizeBytes: { displayName: "New Size (MB)", width: 120 },
          compression: { displayName: "Compression", width: 120 },
          type: { displayName: "Type", width: 120 },
          newType: { displayName: "New Type" }
        },
        rows: {
          selectOnClick: true,
          allowMultipleSelection: true
        },
        cells: {
          dateTime: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("span", null, value ? new Intl.DateTimeFormat("en-us", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(new Date(value)) : "")
          },
          path: {
            display: ({ item, value }) => /* @__PURE__ */ createElement("a", { href: "javascript:", onClick: openFile, class: "link", style: "overflow-wrap: anywhere;" }, value)
          },
          status: {
            display: ({ item, value }) => {
              return value ? /* @__PURE__ */ createElement("div", { class: "chips" }, /* @__PURE__ */ createElement("div", { class: "chip" }, shared_default.constants.status.find((x) => x.name == value)?.displayName)) : "";
            },
            style: { padding: "5px 8px !important" }
          },
          sizeBytes: {
            display: ({ item, value }) => (value / 1024 / 1024).toFixed(4)
            // MB
          },
          newSizeBytes: {
            display: ({ item, value }) => (value / 1024 / 1024).toFixed(4)
            // MB
          },
          compression: {
            display: ({ item, value }) => `${Number(value).toFixed(2)}%`
          },
          type: {
            display: ({ item, value }) => value.toUpperCase()
          },
          newType: {
            display: ({ item, value }) => value.toUpperCase()
          }
        },
        onAddRow: ({ row }) => {
          dom(row.element).on("contextmenu", ({ event }) => {
            if (!row.isSelected)
              row.select();
            _filesContextMenu.show(event);
          });
        },
        onSelectRows: ({ rows }) => {
          _selectedRow = rows[0];
          showActionBarButtons();
        },
        onUnselectRows: () => {
          showActionBarButtons(false);
        },
        onDoubleClickRow: ({ row, event }) => {
          openFile(event);
        },
        onCopyClip: ({ text }) => {
          copyClipItems();
        },
        onClickOut: ({ event }) => {
          event.cancelUnselectRows = !!event.target.closest(".actionbar");
        }
      });
      context.elements.content = _dataTable.element;
    }
    async function load(pageIndex = 0) {
      const { result } = await WebAPIService_default.getItemsFromHistoryFilePaged(_historyFileName, pageIndex, pager.limit);
      setFooter();
      if (result) {
        pager.setPage(pageIndex, result.items.length);
        pager.setTotal(result.total);
        _dataTable.load(result.items);
        setFooter(result.total);
      }
    }
    async function refresh() {
      load();
    }
    function openFile(event) {
      if (event.pointerId && event.pointerId != 1) return;
      setTimeout(() => WebAPIService_default.openFile(_selectedRow.data().path), 200);
    }
    function viewInFileExplorer() {
      setTimeout(() => WebAPIService_default.viewInFileExplorer(_selectedRow.data().path), 200);
    }
    function copyClipItems() {
      WebAPIService_default.copyClip(_dataTable.export());
    }
    function setFooter(total) {
      shared_default.footer.info(`${total || "No"} files`);
    }
    function back() {
      history.back();
    }
    async function exportHistory() {
      const fileName = "History files.xlsx";
      const { result: path } = await WebAPIService_default.saveFilePicker("Export files", fileName, "xlsx");
      if (path)
        WebAPIService_default.exportHistoryFiles(_historyFileName, "History files", path);
    }
    function showActionBarButtons(show = true) {
    }
  };
  var HistoryFilesPage_default = HistoryFilesPage;

  // src/App.jsx
  var pageLayout;
  var navigation;
  var appBar;
  var footer;
  RouterService_default.routes({
    "login": LoginPage_default,
    "tasks": TasksPage_default,
    "task/?": TaskPage_default,
    "task/?/files": TaskFilesPage_default,
    "history": HistoryPage_default,
    "historyfiles/?": HistoryFilesPage_default
  });
  window.dom = dom2;
  window.addEventListener("hashchange", () => mountPage());
  (async () => {
    const _isAuthenticated = await isAuthenticated();
    if (!_isAuthenticated) {
      location.hash = "login";
    } else {
      start();
    }
  })();
  async function isAuthenticated() {
    return true;
    return localStorage.getItem("token") != null;
  }
  async function start() {
    const { result: constants } = await WebAPIService_default.getConstants();
    if (constants)
      shared_default.constants = { ...shared_default.constants, ...constants };
    navigation = Navigation_default([
      { title: "Tasks", name: "task", href: "#tasks", icon: Icon_default("tasks") },
      { title: "History", name: "history", href: "#history", icon: Icon_default("history") }
    ]);
    appBar = AppBar_default();
    footer = PageFooter_default();
    pageLayout = PageLayout_default({
      appBar,
      navigation,
      footer
    });
    shared_default.footer = footer;
    render(pageLayout.element.nodes[0], document.body);
    startWebSocket();
    mountPage();
  }
  async function mountPage() {
    location.hash = location.hash || "tasks";
    let page = RouterService_default.route();
    page = await page();
    if (shared_default.currentPage && shared_default.currentPage.onHide)
      shared_default.currentPage.onHide();
    shared_default.currentPage = page;
    if (location.hash == "#login") {
      render(page.element.nodes[0], document.body);
    } else {
      pageLayout.elements.header.html("").insert(page.elements.header);
      pageLayout.elements.actionBar.html("").insert(page.elements.actionBar);
      pageLayout.elements.content.html("").insert(page.elements.content);
      navigation.setActive();
      footer.info("");
      render(pageLayout.element.nodes[0], document.body);
    }
    if (page.onShow)
      await page.onShow();
    lucide.createIcons();
  }
  function startWebSocket() {
    const socket = new WebSocket(`ws://${location.host}/ws`);
    socket.onmessage = function(event) {
      const runningTasks = event.data;
      if (shared_default.currentPage.updateRunningTasks)
        shared_default.currentPage.updateRunningTasks(runningTasks);
    };
    setInterval(() => {
      if (socket.readyState != 1)
        location.reload();
    }, 1e3);
  }
})();
//!window.addEventListener('contextmenu', event => event.preventDefault()); // desabilita o menu de contexto nativo
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9qc3gvZmFjdG9yeS50cyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9kb20vZG9tLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2hhcmVkLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2VydmljZXMvUm91dGVyU2VydmljZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9Ub2FzdC9Ub2FzdC5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvSWNvbi5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlTGF5b3V0LmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9NZW51L01lbnUuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL0FwcEJhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL05hdmlnYXRpb24uanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlRm9vdGVyLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0xvZ2luUGFnZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL1BhZ2VIZWFkZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9BY3Rpb25CYXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9Sb3dQcm9ncmVzc0Jhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy91dGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbnN0YW50cy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvQ29sdW1uLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9IZWFkZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL0NlbGwuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL1Jvdy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvRm9vdGVyLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9UYWJsZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL01vZGFsL01vZGFsLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza3NQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9VdGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvVGFicy5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUdlbmVyYWwuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3MuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VTY2hlZHVsZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUV4Y2VwdGlvbnMuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrRmlsZXNQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlGaWxlc1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvQXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnOiBzdHJpbmcgfCBGdW5jdGlvbiwgcHJvcHM6IGFueSwgLi4uY2hpbGRyZW46IGFueVtdKSB7XHJcblx0Y29uc3QgZWxlbWVudCA9IHR5cGVvZiB0YWcgPT09IFwiZnVuY3Rpb25cIlxyXG5cdFx0PyB0YWcocHJvcHMpIC8vIENoYW1hIGEgZnVuXHUwMEU3XHUwMEUzbyBzZSBmb3IgdW0gY29tcG9uZW50ZVxyXG5cdFx0OiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7IC8vIENyaWEgdW0gZWxlbWVudG8gcGFyYSBvIERPTVxyXG5cclxuXHRmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcHMgfHwge30pKSB7XHJcblx0XHRpZiAobmFtZS5zdGFydHNXaXRoKFwib25cIikgJiYgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUuc2xpY2UoMikudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyAvLyBBZGljaW9uYSBldmVudG9cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTsgLy8gRGVmaW5lIGF0cmlidXRvc1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcclxuXHRcdFx0Y2hpbGQuZm9yRWFjaChuZXN0ZWRDaGlsZCA9PiBlbGVtZW50LmFwcGVuZChuZXN0ZWRDaGlsZCkpOyAvLyBBZGljaW9uYSBmaWxob3MgYW5pbmhhZG9zXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbGVtZW50LmFwcGVuZChjaGlsZCBpbnN0YW5jZW9mIE5vZGUgPyBjaGlsZCA6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoaWxkKSk7IC8vIEFkaWNpb25hIHRleHRvIG91IG5cdTAwRjNzXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBlbGVtZW50OyAvLyBSZXRvcm5hIG8gZWxlbWVudG8gY3JpYWRvXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY29tcG9uZW50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcclxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjsgLy8gTGltcGEgbyBjb250YWluZXJcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoY29tcG9uZW50KTsgLy8gQWRpY2lvbmEgbyBjb21wb25lbnRlIGFvIGNvbnRhaW5lclxyXG59XHJcbiIsICIvKlxyXG5cdGRvbSAtIENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDI4LzEyLzIwMjMuXHJcblxyXG5cdERlc2NyaVx1MDBFN1x1MDBFM286IFVtIGpRdWVyeSBvdGltaXphZG8uXHJcblxyXG5cdFJlY3Vyc29zOlxyXG5cdFx0Lm5vZGVzXHJcblx0XHQubGVuZ3RoXHJcblxyXG5cdFx0Q3JpYWRvcmVzXHJcblx0XHRcdC5pbnNlcnQoKVxyXG5cdFx0XHQuY2xvbmUoKVxyXG5cclxuXHRcdERlc3RydXRvcmVzXHJcblx0XHRcdC5yZW1vdmUoKVxyXG5cclxuXHRcdFNlbGV0b3Jlc1xyXG5cdFx0XHQuZ2V0KClcclxuXHRcdFx0LmF0KClcclxuXHRcdFx0LmdldEJ5QXR0cigpXHJcblx0XHRcdC5nZXRCeUlkKClcclxuXHRcdFx0LmdldEJ5TmFtZSgpXHJcblx0XHRcdC5nZXRCeUNsYXNzKClcclxuXHRcdFx0LnBhcmVudCgpXHJcblx0XHRcdC5maW5kVXAoKVxyXG5cdFx0XHQuZmlyc3QoKVxyXG5cdFx0XHQubGFzdCgpXHJcblx0XHRcdC5uZXh0KClcclxuXHRcdFx0LnByZXZpb3VzKClcclxuXHRcdFx0LmZvckVhY2goKVxyXG5cdFx0XHQubWFwKClcclxuXHRcdFx0LnNvbWUoKVxyXG5cdFx0XHQuZmluZCgpXHJcblx0XHRcdC5maWx0ZXIoKVxyXG5cdFx0XHQuZm9jdXMoKVxyXG5cclxuXHRcdE1vZGlmaWNhZG9yZXNcclxuXHRcdFx0LnZhbHVlKClcclxuXHRcdFx0LnRleHQoKVxyXG5cdFx0XHQuaHRtbCgpXHJcblx0XHRcdC5hdHRyKClcclxuXHRcdFx0LnN0eWxlKClcclxuXHRcdFx0LndpZHRoKClcclxuXHRcdFx0LmhlaWdodCgpXHJcblx0XHRcdC5hZGRDbGFzcygpXHJcblx0XHRcdC5yZW1vdmVDbGFzcygpXHJcblx0XHRcdC5zaG93KClcclxuXHRcdFx0LmhpZGUoKVxyXG5cdFx0XHQucmVzaXplKClcclxuXHRcdFx0LmRpc2FibGUoKVxyXG5cclxuXHRcdE1hbmlwdWxhZG9yZXMgZGUgZXZlbnRvXHJcblx0XHRcdC5vbigpXHJcblx0XHRcdC5iaW5kRGF0YSgpXHJcblxyXG5cdE9ic2VydmFcdTAwRTdcdTAwRjVlczpcclxuXHRcdC0gQXJndW1lbnRvcyBpbnRlcm5vcyBwcmVjZWRpZG9zIHBvciAnX18nOiBVc3VcdTAwRTFyaW8gblx1MDBFM28gcHJlY2lzYSBpbmlmb3JtYXIuXHJcbiovXHJcblxyXG5leHBvcnQgY29uc3QgZG9tID0gKCgpID0+IHtcclxuXHRjb25zdCB1dGlsID0gVXRpbCgpO1xyXG5cclxuXHRzZXRTdHlsZSgpO1xyXG5cclxuXHRyZXR1cm4gRG9tO1xyXG5cclxuXHRmdW5jdGlvbiBEb20oc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpIHtcclxuXHRcdGlmIChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkpIHtcclxuXHRcdFx0XHRpZiAodXRpbC5pc0hUTUwoc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZShzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdH0gZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KSkge1xyXG5cdFx0XHRcdHJldHVybiBfaW50ZXJmYWNlKHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gc2VsZWN0b3JPckh0bWxPckVsZW1lbnQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKGRvY3VtZW50KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gSU5URVJGQUNFXHJcblxyXG5cdFx0ZnVuY3Rpb24gX2ludGVyZmFjZShub2RlcywgX19iYXNlTm9kZSkge1xyXG5cdFx0XHRub2RlcyA9IHV0aWwudG9MaXN0KG5vZGVzKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0YmFzZU5vZGU6IF9fYmFzZU5vZGUgfHwgbm9kZXMsXHJcblx0XHRcdFx0bm9kZXM6IG5vZGVzLFxyXG5cdFx0XHRcdGxlbmd0aDogbm9kZXMubGVuZ3RoLFxyXG5cclxuXHRcdFx0XHQvLyBjcmlhZG9yZXNcclxuXHRcdFx0XHRpbnNlcnQ6ICh0YWdPckh0bWxPckVsZW1lbnQsIHRvcCkgPT4gaW5zZXJ0KHRhZ09ySHRtbE9yRWxlbWVudCwgdG9wLCBub2RlcyksXHJcblx0XHRcdFx0Y2xvbmU6ICgpID0+IGNsb25lKG5vZGVzKSxcclxuXHJcblx0XHRcdFx0Ly8gZGVzdHJ1dG9yZXNcclxuXHRcdFx0XHRyZW1vdmU6ICgpID0+IHJlbW92ZShub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIHNlbGV0b3Jlc1xyXG5cdFx0XHRcdGF0OiBpbmRleCA9PiBhdChpbmRleCwgbm9kZXMpLFxyXG5cdFx0XHRcdGdldDogc2VsZWN0b3IgPT4gZ2V0KHNlbGVjdG9yLCBub2RlcyksXHJcblx0XHRcdFx0Z2V0QnlJZDogaWQgPT4gZ2V0QnlBdHRyKCdpZCcsIGlkLCBub2RlcyksIC8vIGlkOiBudW1iZXIvc3RyaW5nL1tudW1iZXIvc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5TmFtZTogbmFtZSA9PiBnZXRCeUF0dHIoJ25hbWUnLCBuYW1lLCBub2RlcyksIC8vIG5hbWU6IHN0cmluZy9bc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5QXR0cjogKGF0dHJpYnV0ZSwgdmFsdWUpID0+IGdldEJ5QXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBub2RlcyksIC8vIHZhbHVlOiBzdHJpbmcvW3N0cmluZ11cclxuXHRcdFx0XHRnZXRCeUNsYXNzOiBjbGFzc05hbWUgPT4gZ2V0QnlBdHRyKCdjbGFzcycsIGNsYXNzTmFtZSwgbm9kZXMpLCAvLyBjbGFzczogc3RyaW5nL1tzdHJpbmddXHJcblx0XHRcdFx0ZmluZFVwOiBzZWxlY3RvciA9PiBmaW5kVXAoc2VsZWN0b3IsIG5vZGVzKSxcclxuXHRcdFx0XHRwYXJlbnQ6ICgpID0+IHBhcmVudChub2RlcyksXHJcblx0XHRcdFx0Zmlyc3Q6ICgpID0+IGZpcnN0KG5vZGVzKSxcclxuXHRcdFx0XHRsYXN0OiAoKSA9PiBsYXN0KG5vZGVzKSxcclxuXHRcdFx0XHRuZXh0OiAoKSA9PiBuZXh0T3JQcmV2aW91cyh0cnVlLCBub2RlcyksXHJcblx0XHRcdFx0cHJldmlvdXM6ICgpID0+IG5leHRPclByZXZpb3VzKGZhbHNlLCBub2RlcyksXHJcblx0XHRcdFx0Zm9yRWFjaDogY2FsbGJhY2sgPT4gbm9kZXMuZm9yRWFjaCgoeCwgaW5kZXgpID0+IGNhbGxiYWNrKF9pbnRlcmZhY2UoeCksIGluZGV4KSksXHJcblx0XHRcdFx0bWFwOiBjYWxsYmFjayA9PiBub2Rlcy5tYXAoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdHNvbWU6IGNhbGxiYWNrID0+IG5vZGVzLnNvbWUoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbmQ6IGNhbGxiYWNrID0+IG5vZGVzLmZpbmQoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbHRlcjogY2FsbGJhY2sgPT4gbm9kZXMuZmlsdGVyKCh4LCBpbmRleCkgPT4gY2FsbGJhY2soX2ludGVyZmFjZSh4KSwgaW5kZXgpKSxcclxuXHRcdFx0XHRmb2N1czogZm9jdXNlZCA9PiBmb2N1cyhmb2N1c2VkLCBub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIG1vZGlmaWNhZG9yZXNcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUgPT4gYXR0cigndmFsdWUnLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHRleHQ6IHRleHQgPT4gYXR0cignaW5uZXJUZXh0JywgdGV4dCwgbm9kZXMpLFxyXG5cdFx0XHRcdGh0bWw6IGh0bWwgPT4gYXR0cignaW5uZXJIVE1MJywgaHRtbCwgbm9kZXMpLFxyXG5cdFx0XHRcdGF0dHI6IChwcm9wLCB2YWx1ZSkgPT4gYXR0cihwcm9wLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHN0eWxlOiAocHJvcCwgdmFsdWUpID0+IGF0dHIocHJvcCwgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSxcclxuXHRcdFx0XHR3aWR0aDogdmFsdWUgPT4gdmFsdWUgPyBhdHRyKCd3aWR0aCcsIHZhbHVlLCBub2RlcywgJ3N0eWxlJykgOiBnZXRBdHRyKCdvZmZzZXRXaWR0aCcsIG5vZGVzKSxcclxuXHRcdFx0XHRoZWlnaHQ6IHZhbHVlID0+IHZhbHVlID8gYXR0cignaGVpZ2h0JywgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSA6IGdldEF0dHIoJ29mZnNldEhlaWdodCcsIG5vZGVzKSxcclxuXHRcdFx0XHRhZGRDbGFzczogKGNsYXNzTmFtZSwgYWRkKSA9PiBhZGRDbGFzcyhjbGFzc05hbWUsIGFkZCwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzOiAoY2xhc3NOYW1lLCBhZGQpID0+IHJlbW92ZUNsYXNzKGNsYXNzTmFtZSwgYWRkLCBub2RlcyksXHJcblx0XHRcdFx0c2hvdzogKF9zaG93LCBkaXNwbGF5KSA9PiBzaG93KF9zaG93LCBkaXNwbGF5LCBub2RlcyksXHJcblx0XHRcdFx0aGlkZTogX2hpZGUgPT4gaGlkZShfaGlkZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlc2l6ZTogb3B0aW9ucyA9PiByZXNpemUob3B0aW9ucywgbm9kZXMpLFxyXG5cdFx0XHRcdGRpc2FibGU6IChfZGlzYWJsZSwgb3B0aW9ucykgPT4gZGlzYWJsZShfZGlzYWJsZSwgb3B0aW9ucywgbm9kZXMpLFxyXG5cclxuXHRcdFx0XHQvLyBtYW5pcHVsYWRvcmVzIGRlIGV2ZW50b1xyXG5cdFx0XHRcdG9uOiAoZXZlbnROYW1lLCBfZnVuY3Rpb24sIHVzZUNhcHR1cmUpID0+IG9uKGV2ZW50TmFtZSwgX2Z1bmN0aW9uLCB1c2VDYXB0dXJlLCBub2RlcyksXHJcblx0XHRcdFx0YmluZERhdGE6IGFyZ3MgPT4gYmluZERhdGEoYXJncywgbm9kZXMsIF9fYmFzZU5vZGUpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBGVU5cdTAwQzdcdTAwRDVFU1xyXG5cclxuXHRcdGZ1bmN0aW9uIGNyZWF0ZSh0YWdPckh0bWwgPSAnJykge1xyXG5cdFx0XHRjb25zdCBwYXJlbnRPZiA9IHtcclxuXHRcdFx0XHRvcHRpb246ICdzZWxlY3QnLFxyXG5cdFx0XHRcdHRoZWFkOiAndGFibGUnLFxyXG5cdFx0XHRcdHRib2R5OiAndGFibGUnLFxyXG5cdFx0XHRcdHRyOiAndGFibGUnLFxyXG5cdFx0XHRcdHRoOiAndHInLFxyXG5cdFx0XHRcdHRkOiAndHInLFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRsZXQgbm9kZTtcclxuXHJcblx0XHRcdHRhZ09ySHRtbCA9IHV0aWwucGFyc2VIVE1MKHRhZ09ySHRtbCk7XHJcblxyXG5cdFx0XHRpZiAodGFnT3JIdG1sLnN0YXJ0c1dpdGgoJzwnKSkge1xyXG5cdFx0XHRcdGNvbnN0IHRhZ05hbWUgPSB0YWdPckh0bWwubWF0Y2goL1thLXpdKy9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdGNvbnN0IHBhcmVudFRhZ05hbWUgPSBwYXJlbnRPZlt0YWdOYW1lXSB8fCAnZGl2JztcclxuXHJcblx0XHRcdFx0bm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50VGFnTmFtZSk7XHJcblx0XHRcdFx0bm9kZS5pbm5lckhUTUwgPSB0YWdPckh0bWw7XHJcblx0XHRcdFx0bm9kZSA9IG5vZGUucXVlcnlTZWxlY3Rvcih0YWdOYW1lKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0YWdPckh0bWwpIHtcclxuXHRcdFx0XHRub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdPckh0bWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpbnNlcnQodGFnT3JIdG1sT3JFbGVtZW50LCB0b3AgPSBmYWxzZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0aWYgKHRhZ09ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudCA9IHV0aWwudG9MaXN0KHRhZ09ySHRtbE9yRWxlbWVudCk7XHJcblxyXG5cdFx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudC5mb3JFYWNoKHggPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAodXRpbC5pc1N0cmluZyh4KSlcclxuXHRcdFx0XHRcdFx0XHRfaW5zZXJ0KF9fbm9kZSwgY3JlYXRlKHgpLm5vZGVzWzBdKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHgpKVxyXG5cdFx0XHRcdFx0XHRcdF9pbnNlcnQoX19ub2RlLCB4KTtcclxuXHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdHgubm9kZXMuZm9yRWFjaCh4ID0+IF9pbnNlcnQoX19ub2RlLCB4KSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIF9pbnNlcnQoX19ub2RlLCBub2RlKSB7XHJcblx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHJcblx0XHRcdFx0aWYgKHRvcClcclxuXHRcdFx0XHRcdF9fbm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgX19ub2RlLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdF9fbm9kZS5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGNsb25lKF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2UoX19ub2Rlc1swXS5jbG9uZU5vZGUodHJ1ZSksIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlbW92ZShfX25vZGVzKSB7XHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4gX19ub2RlLnJlbW92ZSgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBnZXQoc2VsZWN0b3IgPSAnJywgX19ub2RlID0gZG9jdW1lbnQpIHtcclxuXHRcdFx0aWYgKHNlbGVjdG9yKSB7XHJcblx0XHRcdFx0bGV0IG5vZGVzID0gW107XHJcblxyXG5cdFx0XHRcdGlmICh1dGlsLmlzTGlzdChfX25vZGUpKSB7XHJcblx0XHRcdFx0XHRfX25vZGUuZm9yRWFjaCh4ID0+XHJcblx0XHRcdFx0XHRcdG5vZGVzLnB1c2goLi4ueC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSlcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gWy4uLl9fbm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGdldEJ5QXR0cihhdHRyLCB2YWx1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0dmFsdWUgPSB1dGlsLnRvTGlzdCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+IHtcclxuXHRcdFx0XHR2YWx1ZS5mb3JFYWNoKHZhbHVlID0+IHtcclxuXHRcdFx0XHRcdGxldCByZXNvdXJjZXM7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGF0dHIgPT0gJ2lkJylcclxuXHRcdFx0XHRcdFx0cmVzb3VyY2VzID0gZ2V0KCcjJyArIHZhbHVlLCBfX25vZGUpO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ciA9PSAnY2xhc3MnKVxyXG5cdFx0XHRcdFx0XHRyZXNvdXJjZXMgPSBnZXQoJy4nICsgdmFsdWUsIF9fbm9kZSk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHJlc291cmNlcyA9IGdldChgWyR7YXR0cn0ke3ZhbHVlICE9IHVuZGVmaW5lZCA/ICc9XCInICsgdmFsdWUgKyAnXCInIDogJyd9XWAsIF9fbm9kZSk7XHJcblxyXG5cdFx0XHRcdFx0cmVzb3VyY2VzLm5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghbm9kZXMuc29tZSh4ID0+IHggPT0gbm9kZSkpXHJcblx0XHRcdFx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhdChpbmRleCwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzW2luZGV4XSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyc3QoX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gYXQoMCwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGFzdChfX25vZGVzKSB7XHJcblx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGVzLnBvcCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2Uobm9kZSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbmV4dE9yUHJldmlvdXMobmV4dCA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBuZXh0ID8gX19ub2RlLm5leHRTaWJsaW5nIDogX19ub2RlLnByZXZpb3VzU2libGluZztcclxuXHJcblx0XHRcdFx0aWYgKG5vZGUpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaW5kVXAoc2VsZWN0b3IsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGUuY2xvc2VzdChzZWxlY3Rvcik7XHJcblxyXG5cdFx0XHRcdGlmIChub2RlICYmICFub2Rlcy5zb21lKHggPT4geCA9PT0gbm9kZSkpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBwYXJlbnQoX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PlxyXG5cdFx0XHRcdG5vZGVzLnB1c2goX19ub2RlLnBhcmVudEVsZW1lbnQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBfX25vZGVzLCBvYmplY3QpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmcvb2JqZWN0XHJcblxyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhhdHRyaWJ1dGUpKSB7XHJcblx0XHRcdFx0bGV0IGtleSA9IGF0dHJpYnV0ZTtcclxuXHJcblx0XHRcdFx0aWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldEF0dHIoa2V5LCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHJldHVybiBzZXRBdHRyKHsgW2tleV06IHZhbHVlIH0sIF9fbm9kZXMsIG9iamVjdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHNldEF0dHIoYXR0cmlidXRlLCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0QXR0cihhdHRyaWJ1dGUgPSAnJywgX19ub2Rlcywgb2JqZWN0ID0gJycpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmdcclxuXHRcdFx0Ly8gb2JqZWN0OiBzdHJpbmcgLSBleC46IHN0eWxlXHJcblxyXG5cdFx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBvYmplY3QgPyBfX25vZGVbb2JqZWN0XSA6IF9fbm9kZTtcclxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHV0aWwuaXNVbmRlZmluZWQobm9kZVthdHRyaWJ1dGVdKSA/XHJcblx0XHRcdFx0XHRub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpIDpcclxuXHRcdFx0XHRcdG5vZGVbYXR0cmlidXRlXTtcclxuXHJcblx0XHRcdFx0aWYgKCF1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSlcclxuXHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXMgOiB2YWx1ZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2V0QXR0cihhdHRyaWJ1dGVzID0ge30sIF9fbm9kZXMsIG9iamVjdE5hbWUgPSAnJykge1xyXG5cdFx0XHQvLyBhdHRyaWJ1dGVzOiBvYmplY3RcclxuXHRcdFx0Ly8gb2JqZWN0TmFtZTogc3RyaW5nIC0gZXguOiBzdHlsZVxyXG5cclxuXHRcdFx0aWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGF0dHJpYnV0ZXMpKSB7XHJcblx0XHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PiB7XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBub2RlID0gb2JqZWN0TmFtZSA/IF9fbm9kZVtvYmplY3ROYW1lXSA6IF9fbm9kZTtcclxuXHRcdFx0XHRcdFx0bGV0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gdmFsb3JlcyBpbnRlaXJvcyBjb20gdW5pZGFkZSBweFxyXG5cdFx0XHRcdFx0XHRpZiAob2JqZWN0TmFtZSA9PSAnc3R5bGUnKSB7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGltcG9ydGFudCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWtleS5tYXRjaCgvaW5kZXh8bGluZXxncmlkfG9yZGVyfHRhYnxvcnBoYW5zfHdpZG93c3xjb2x1bW5zfGNvdW50ZXJ8b3BhY2l0eS9pKSlcclxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlID0gdHlwZW9mIHZhbHVlID09ICdudW1iZXInID8gdmFsdWUgKyAncHgnIDogdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh2YWx1ZS5tYXRjaCgvaW1wb3J0YW50L2kpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5pbmRleE9mKCchJykgLSAxKS50cmltKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpbXBvcnRhbnQgPSAnaW1wb3J0YW50JztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChpbXBvcnRhbnQpXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCk7XHJcblx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dHlwZW9mIG5vZGVba2V5XSA9PSAndW5kZWZpbmVkJyA/XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKSA6XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlW2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlLCBkaXNwbGF5ID0gJycsIF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIGF0dHIoJ2Rpc3BsYXknLCBzaG93ID8gZGlzcGxheSA6ICdub25lJywgX19ub2RlcywgJ3N0eWxlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaGlkZShoaWRlID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gc2hvdyghaGlkZSwgJycsIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGFkZENsYXNzKGNsYXNzTmFtZSwgYWRkID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHQvLyBjbGFzc05hbWU6IHN0cmluZy9bc3RyaW5nXVxyXG5cclxuXHRcdFx0Y2xhc3NOYW1lID0gdXRpbC50b0xpc3QoY2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRfX25vZGUuY2xhc3NMaXN0W2FkZCA/ICdhZGQnIDogJ3JlbW92ZSddKC4uLmNsYXNzTmFtZSlcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGNsYXNzTmFtZSwgcmVtb3ZlID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gYWRkQ2xhc3MoY2xhc3NOYW1lLCAhcmVtb3ZlLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmb2N1cyhmb2N1c2VkID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRpZiAoZm9jdXNlZClcclxuXHRcdFx0XHRfX25vZGVzWzBdLmZvY3VzKCk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRfX25vZGVzWzBdLmJsdXIoKTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZSA9IHRydWUsIG9wdGlvbnMgPSB7fSwgX19ub2Rlcykge1xyXG5cdFx0XHRpZiAob3B0aW9ucy5vcGFjaXR5KSB7XHJcblx0XHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PlxyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLm9wYWNpdHkgPSBkaXNhYmxlID8gb3B0aW9ucy5vcGFjaXR5IDogJydcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYWRkQ2xhc3MoJ2RvbS1kaXNhYmxlZCcsIGRpc2FibGUsIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlc2l6ZShvcHRpb25zLCBfX25vZGVzKSB7XHJcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cdFx0XHRvcHRpb25zLm9mZnNldCA9IG9wdGlvbnMub2Zmc2V0ICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMub2Zmc2V0IDogMDtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdC8vIE9icy46IFBhcmEgdGV4dGFyZWEgYSBmdW5cdTAwRTdcdTAwRTNvIHJlc2l6ZSBkZXZlIHNlciBjaGFtYWRhIG5vIGV2ZW50byBvbmlucHV0LlxyXG5cdFx0XHRcdGlmICh1dGlsLmdldFRhZ05hbWUoX19ub2RlKSA9PSAndGV4dGFyZWEnKSB7XHJcblx0XHRcdFx0XHRfX25vZGUuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcblx0XHRcdFx0XHRfX25vZGUuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGRpZmYgPSBfX25vZGUub2Zmc2V0SGVpZ2h0IC0gX19ub2RlLnNjcm9sbEhlaWdodDtcclxuXHRcdFx0XHRcdGxldCBoZWlnaHQgPSBfX25vZGUuc2Nyb2xsSGVpZ2h0ICsgKGRpZmYgPiAwID8gZGlmZiA6IDApICsgb3B0aW9ucy5vZmZzZXQ7XHJcblxyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLmhlaWdodCA9IHR5cGVvZiBoZWlnaHQgPT0gJ251bWJlcicgJiYgaGVpZ2h0ID4gMCA/IGhlaWdodCArICdweCcgOiBoZWlnaHQgfHwgJ2F1dG8nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX19ub2RlcztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBiaW5kRGF0YShhcmdzID0ge30sIF9fZmllbGRzLCBfX2Jhc2VOb2RlKSB7XHJcblx0XHRcdC8qXHJcblx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0a2V5OiBzdHJpbmcsXHJcblx0XHRcdFx0XHRvYmplY3Q6IG9iamVjdCxcclxuXHRcdFx0XHRcdHZhbHVlOiBhbnksXHJcblx0XHRcdFx0XHRkaXNwYXRjaEV2ZW50OiBib29sZWFuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHQqL1xyXG5cclxuXHRcdFx0YXJncy5kaXNwYXRjaEV2ZW50ID0gYXJncy5kaXNwYXRjaEV2ZW50ICE9IHVuZGVmaW5lZCA/IGFyZ3MuZGlzcGF0Y2hFdmVudCA6IHRydWU7XHJcblxyXG5cdFx0XHRsZXQgX2ZpZWxkcyA9IHt9O1xyXG5cdFx0XHRsZXQgX29uQ2hhbmdlO1xyXG5cclxuXHRcdFx0X19maWVsZHMuZm9yRWFjaChfX2ZpZWxkID0+IHtcclxuXHRcdFx0XHRjb25zdCBrZXkgPSBhcmdzLmtleSB8fCBfX2ZpZWxkLm5hbWU7XHJcblxyXG5cdFx0XHRcdGlmIChrZXkpIHtcclxuXHRcdFx0XHRcdF9maWVsZHNba2V5XSA9IF9maWVsZHNba2V5XSA/IHV0aWwuaXNBcnJheShfZmllbGRzW2tleV0pID8gX2ZpZWxkc1trZXldLnB1c2goX2ludGVyZmFjZShfX2ZpZWxkKSkgOiBbX2ZpZWxkc1trZXldLCBfaW50ZXJmYWNlKF9fZmllbGQpXSA6IF9pbnRlcmZhY2UoX19maWVsZCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCF1dGlsLmlzVW5kZWZpbmVkKGFyZ3MudmFsdWUpIHx8IGFyZ3Mub2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0XHRcdFx0Ly8gYXR1YWxpemEgbyBjYW1wb1xyXG5cdFx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9ICF1dGlsLmlzVW5kZWZpbmVkKGFyZ3MudmFsdWUpID8gYXJncy52YWx1ZSA6IGFyZ3Mub2JqZWN0W2tleV07XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoX19maWVsZC50eXBlID09ICdyYWRpbycpIHtcclxuXHRcdFx0XHRcdFx0XHRfX2ZpZWxkLmNoZWNrZWQgPSBfX2ZpZWxkLnZhbHVlID09IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKF9fZmllbGQudHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC5jaGVja2VkID0gdXRpbC5pc0Jvb2xlYW4odmFsdWUpID8gdmFsdWUgOiB1dGlsLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc29tZSh2YWx1ZSA9PiBfX2ZpZWxkLnZhbHVlID09IHZhbHVlKSA6IF9fZmllbGQudmFsdWUgPT0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoX19maWVsZC50eXBlID09ICdkYXRlJyAmJiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHsgLy8gdGltZXN0YW1wXHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC52YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoX19maWVsZC50eXBlID09ICdkYXRldGltZS1sb2NhbCcgJiYgdHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7IC8vIHRpbWVzdGFtcFxyXG5cdFx0XHRcdFx0XHRcdF9fZmllbGQudmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxNik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBhdHVhbGl6YSBvIG9iamV0byBvdSB2YWxvclxyXG5cdFx0XHRcdFx0XHRjb25zdCBmID0gZXZlbnQgPT4gY2hhbmdlKGV2ZW50LCBrZXkpO1xyXG5cclxuXHRcdFx0XHRcdFx0X19maWVsZC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIF9fZmllbGQuX19kb21fYmluZERhdGFfY2hhbmdlKTtcclxuXHRcdFx0XHRcdFx0X19maWVsZC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGYpO1xyXG5cdFx0XHRcdFx0XHRfX2ZpZWxkLl9fZG9tX2JpbmREYXRhX2NoYW5nZSA9IGY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0b25DaGFuZ2U6IGNhbGxiYWNrID0+IHtcclxuXHRcdFx0XHRcdF9vbkNoYW5nZSA9IGNhbGxiYWNrO1xyXG5cclxuXHRcdFx0XHRcdC8vIGFjaW9uYSBvbkNoYW5nZVxyXG5cdFx0XHRcdFx0aWYgKGFyZ3MuZGlzcGF0Y2hFdmVudCkge1xyXG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBfZmllbGRzKVxyXG5cdFx0XHRcdFx0XHRcdGNoYW5nZShudWxsLCBrZXkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjaGFuZ2UoZXZlbnQsIGtleSkge1xyXG5cdFx0XHRcdGxldCBmaWVsZCA9IF9maWVsZHNba2V5XTtcclxuXHRcdFx0XHRsZXQgdmFsdWU7XHJcblxyXG5cdFx0XHRcdGlmICh1dGlsLmlzQXJyYXkoZmllbGQpKSB7XHJcblx0XHRcdFx0XHRsZXQgdHlwZSA9IGZpZWxkWzBdLm5vZGVzWzBdLnR5cGU7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gJ3JhZGlvJykge1xyXG5cdFx0XHRcdFx0XHRsZXQgeCA9IGZpZWxkLmZpbmQoeCA9PiB4Lm5vZGVzWzBdLmNoZWNrZWQpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFsdWUgPSB4ID8geC5ub2Rlc1swXS52YWx1ZSA6ICcnO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlID09ICdjaGVja2JveCcpIHtcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBmaWVsZC5maWx0ZXIoeCA9PiB4Lm5vZGVzWzBdLmNoZWNrZWQpLm1hcCh4ID0+IHgubm9kZXNbMF0udmFsdWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZmllbGQubm9kZXNbMF0udHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0XHRsZXQgb2JqVmFsdWUgPSAhdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSA/IGFyZ3MudmFsdWUgOiBhcmdzLm9iamVjdFtrZXldO1xyXG5cdFx0XHRcdFx0bGV0IGlzQ2hlY2tlZCA9IGZpZWxkLm5vZGVzWzBdLmNoZWNrZWQ7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHV0aWwuaXNCb29sZWFuKG9ialZhbHVlKSkge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGlzQ2hlY2tlZDtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodXRpbC5pc0FycmF5KG9ialZhbHVlKSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoaXNDaGVja2VkKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFvYmpWYWx1ZS5zb21lKHggPT4geCA9PSB2YWx1ZSkpXHJcblx0XHRcdFx0XHRcdFx0XHRvYmpWYWx1ZS5wdXNoKHZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRvYmpWYWx1ZSA9IG9ialZhbHVlLmZpbHRlcih4ID0+IHggIT0gdmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IG9ialZhbHVlLnNvcnQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFsdWUgPSBmaWVsZC5ub2Rlc1swXS52YWx1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICghdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSlcclxuXHRcdFx0XHRcdGFyZ3MudmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRhcmdzLm9iamVjdFtrZXldID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdC8vIGNhbGxiYWNrXHJcblx0XHRcdFx0aWYgKF9vbkNoYW5nZSkge1xyXG5cdFx0XHRcdFx0X29uQ2hhbmdlKHtcclxuXHRcdFx0XHRcdFx0YmFzZU5vZGU6IF9pbnRlcmZhY2UoX19iYXNlTm9kZSksXHJcblx0XHRcdFx0XHRcdGFyZ3MsXHJcblx0XHRcdFx0XHRcdG9iamVjdDogYXJncy5vYmplY3QsXHJcblx0XHRcdFx0XHRcdGtleSxcclxuXHRcdFx0XHRcdFx0dmFsdWUsXHJcblx0XHRcdFx0XHRcdGZpZWxkLFxyXG5cdFx0XHRcdFx0XHRmaWVsZHM6IF9maWVsZHMsXHJcblx0XHRcdFx0XHRcdGV2ZW50LFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gb24oZXZlbnROYW1lLCBfZnVuY3Rpb24sIHVzZUNhcHR1cmUgPSBmYWxzZSwgX19ub2Rlcykge1xyXG5cdFx0XHQvLyB1c2VDYXB0dXJlOiBib29sZWFuIChvcGNpb25hbClcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRfX25vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50ID0+XHJcblx0XHRcdFx0XHRfZnVuY3Rpb24oeyBlbGVtZW50OiBfaW50ZXJmYWNlKF9fbm9kZSksIGV2ZW50OiBldmVudCB9KSwgdXNlQ2FwdHVyZVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gVXRpbCgpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGdldFRhZ05hbWUsXHJcblx0XHRcdHRvTGlzdCxcclxuXHRcdFx0cGFyc2VIVE1MLFxyXG5cdFx0XHRpc051bGwsXHJcblx0XHRcdGlzVW5kZWZpbmVkLFxyXG5cdFx0XHRpc0VtcHR5LFxyXG5cdFx0XHRpc051bGxPclVuZGVmaW5lZCxcclxuXHRcdFx0aXNOdWxsT3JVbmRlZmluZWRPckVtcHR5LFxyXG5cdFx0XHRpc09iamVjdCxcclxuXHRcdFx0aXNTdHJpbmcsXHJcblx0XHRcdGlzQm9vbGVhbixcclxuXHRcdFx0aXNIVE1MLFxyXG5cdFx0XHRpc0hUTUxFbGVtZW50LFxyXG5cdFx0XHRpc05vZGVMaXN0LFxyXG5cdFx0XHRpc0FycmF5LFxyXG5cdFx0XHRpc0xpc3QsXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldFRhZ05hbWUobm9kZSkge1xyXG5cdFx0XHRyZXR1cm4gbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgOiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0b0xpc3QoZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gaXNOb2RlTGlzdChlbGVtZW50KSA/IFsuLi5lbGVtZW50XSA6IGlzQXJyYXkoZWxlbWVudCkgPyBlbGVtZW50IDogW2VsZW1lbnRdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHBhcnNlSFRNTChodG1sKSB7XHJcblx0XHRcdC8vIFJlbW92ZSBxdWVicmFzIGRlIGxpbmhhLCB0YWJ1bGFcdTAwRTdcdTAwRjVlcyBlIHNwYVx1MDBFN29zIGR1cGxpY2Fkb3MuXHJcblxyXG5cdFx0XHRyZXR1cm4gaHRtbC5yZXBsYWNlKC9cXG58XFx0L2csICcnKS5yZXBsYWNlKC8gIC9nLCAnICcpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc051bGwodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlID09IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZSA9PSAnJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZCh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gaXNOdWxsKHZhbHVlKSB8fCBpc1VuZGVmaW5lZCh2YWx1ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWRPckVtcHR5KHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiBpc051bGwodmFsdWUpIHx8IGlzVW5kZWZpbmVkKHZhbHVlKSB8fCBpc0VtcHR5KHZhbHVlKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZyc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Jvb2xlYW4nO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzSFRNTCh2YWx1ZSkge1xyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlSFRNTCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gaXNTdHJpbmcodmFsdWUpICYmIHZhbHVlLnN0YXJ0c1dpdGgoJzwnKSAmJiB2YWx1ZS5lbmRzV2l0aCgnPicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzSFRNTEVsZW1lbnQob2JqKSB7XHJcblx0XHRcdHJldHVybiBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc05vZGVMaXN0KG9iaikge1xyXG5cdFx0XHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgTm9kZUxpc3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNBcnJheShvYmopIHtcclxuXHRcdFx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIEFycmF5O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzTGlzdChlbGVtZW50KSB7XHJcblx0XHRcdHJldHVybiBpc05vZGVMaXN0KGVsZW1lbnQpIHx8IGlzQXJyYXkoZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTdHlsZSgpIHtcclxuXHRcdGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdHlsZSNkb20tc3R5bGUnKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGNvbnN0IHN0eWxlID0gdXRpbC5wYXJzZUhUTUwoLypodG1sKi9gXHJcblx0XHRcdDxzdHlsZSBpZD1cImRvbS1zdHlsZVwiPlxyXG5cdFx0XHRcdC5kb20tZGlzYWJsZWQge1xyXG5cdFx0XHRcdFx0b3BhY2l0eTogLjY7XHJcblx0XHRcdFx0XHQtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG5cdFx0XHRcdFx0LW1vei11c2VyLXNlbGVjdDogbm9uZTtcclxuXHRcdFx0XHRcdHVzZXItc2VsZWN0OiBub25lO1xyXG5cdFx0XHRcdFx0cG9pbnRlci1ldmVudHM6IG5vbmU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQ8L3N0eWxlPlxyXG5cdFx0YCk7XHJcblxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgc3R5bGUpO1xyXG5cdH1cclxufSkoKTtcclxuIiwgImNvbnN0IHNoYXJlZCA9IHtcclxuXHR0ZW1wOiBudWxsLFxyXG5cdGNvbnN0YW50czogbnVsbCxcclxuXHJcblx0Ly8gcFx1MDBFMWdpbmFzXHJcblx0Y3VycmVudFBhZ2U6IG51bGwsXHJcblxyXG5cdC8vIGNvbXBvbmVudGVzXHJcblx0bmF2aWdhdGlvbjogbnVsbCxcclxuXHRhcHBCYXI6IG51bGwsXHJcblx0Zm9vdGVyOiBudWxsLFxyXG5cclxuXHQvLyBmdW5cdTAwRTdcdTAwRjVlc1xyXG5cdHNldENvbnRlbnRTaXplOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2hhcmVkO1xyXG4iLCAiY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlclNlcnZpY2UoKTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlclNlcnZpY2UoKSB7XHJcblx0Y29uc3QgX3RoaXMgPSB0aGlzO1xyXG5cdGxldCBfcm91dGVzO1xyXG5cclxuXHR0aGlzLnJvdXRlcyA9IHJvdXRlcztcclxuXHR0aGlzLnJvdXRlID0gcm91dGU7XHJcblx0dGhpcy5uZXh0ID0gbnVsbDtcclxuXHR0aGlzLmN1cnJlbnQgPSBnZXRMb2NhdGlvbigpO1xyXG5cdHRoaXMucHJldmlvdXMgPSBnZXRMb2NhdGlvbihsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncHJldmlvdXNVcmwnKSk7XHJcblxyXG5cdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgb25IYXNoQ2hhbmdlKTtcclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIG9uSGFzaENoYW5nZSk7XHJcblxyXG5cdGZ1bmN0aW9uIG9uSGFzaENoYW5nZShldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50KVxyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncHJldmlvdXNVcmwnLCBldmVudC5vbGRVUkwpO1xyXG5cclxuXHRcdF90aGlzLnByZXZpb3VzID0gZ2V0TG9jYXRpb24obG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3ByZXZpb3VzVXJsJykpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcm91dGVzKHJvdXRlcykge1xyXG5cdFx0LypcclxuXHRcdFx0cm91dGVzOiBFeC46IHtcclxuXHRcdFx0XHQndGFza3MnOiBUYXNrc1BhZ2UsXHJcblx0XHRcdFx0J3Rhc2svPyc6IFRhc2tQYWdlLFxyXG5cdFx0XHRcdCd0YXNrLz8vZmlsZXMnOiBUYXNrRmlsZXNQYWdlLFxyXG5cdFx0XHRcdCdleGNlcHRpb25zJzogRXhjZXB0aW9uc1BhZ2UsXHJcblx0XHRcdFx0J2V4Y2VwdGlvbi8/JzogRXhjZXB0aW9uUGFnZSxcclxuXHRcdFx0XHQnaGlzdG9yeSc6IEhpc3RvcnlQYWdlLFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQ/OiBWYXJpXHUwMEUxdmVsIC0gRXguOiBpZCwgbmFtZSwgdmFsdWUsIG91dHJvcy4uXHJcblx0XHQqL1xyXG5cclxuXHRcdGlmIChyb3V0ZXMpXHJcblx0XHRcdF9yb3V0ZXMgPSByb3V0ZXM7XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBfcm91dGVzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcm91dGUoKSB7XHJcblx0XHRjb25zdCBfbG9jYXRpb24gPSBnZXRMb2NhdGlvbigpO1xyXG5cclxuXHRcdGZvciAoY29uc3Qgcm91dGUgaW4gX3JvdXRlcykge1xyXG5cdFx0XHRjb25zdCByb3V0ZVBhcnRzID0gcm91dGUuc3BsaXQoJy8nKTtcclxuXHRcdFx0bGV0IHBhZ2UgPSBfcm91dGVzW3JvdXRlXTtcclxuXHRcdFx0bGV0IGNvdW50ID0gMDtcclxuXHJcblx0XHRcdF9sb2NhdGlvbi5oYXNoUGFydHMuZm9yRWFjaCgoaGFzaFBhcnQsIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0bGV0IHJvdXRlUGFydCA9IHJvdXRlUGFydHNbaW5kZXhdO1xyXG5cclxuXHRcdFx0XHRpZiAoX2xvY2F0aW9uLmhhc2hQYXJ0cy5sZW5ndGggPT0gcm91dGVQYXJ0cy5sZW5ndGggJiYgKFxyXG5cdFx0XHRcdFx0aGFzaFBhcnQgPT0gcm91dGVQYXJ0IHx8XHJcblx0XHRcdFx0XHRyb3V0ZVBhcnQgPT0gJz8nXHJcblx0XHRcdFx0KSkgY291bnQrKztcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZiAoX2xvY2F0aW9uLmhhc2hQYXJ0cy5sZW5ndGggPT0gY291bnQpIHtcclxuXHRcdFx0XHRfdGhpcy5jdXJyZW50ID0gX2xvY2F0aW9uO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gcGFnZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0TG9jYXRpb24odXJsKSB7XHJcblx0XHR1cmwgPSB1cmwgfHwgbG9jYXRpb24uaHJlZjtcclxuXHJcblx0XHRpZiAoIXVybC5tYXRjaCgvIy8pKSByZXR1cm47XHJcblxyXG5cdFx0bGV0IGZ1bGxIYXNoID0gdXJsLnNwbGl0KCcjJylbMV07XHJcblx0XHRsZXQgaGFzaCA9IGZ1bGxIYXNoLnNwbGl0KCcmJylbMF07XHJcblx0XHRsZXQgcGFyYW1zID0gZnVsbEhhc2guc3BsaXQoJyYnKVsxXTtcclxuXHRcdGxldCBoYXNoUGFydHMgPSBoYXNoLnNwbGl0KCcvJyk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dXJsLFxyXG5cdFx0XHRmdWxsSGFzaCxcclxuXHRcdFx0aGFzaCxcclxuXHRcdFx0aGFzaFBhcnRzLFxyXG5cdFx0XHR0YXJnZXQ6IGhhc2guc3Vic3RyaW5nKGhhc2gubGFzdEluZGV4T2YoJy8nKSArIDEpLFxyXG5cdFx0XHRwYXJhbXM6IHBhcnNlUGFyYW1zKHBhcmFtcyksXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGFyc2VQYXJhbXMoaGFzaFBhcmFtcykge1xyXG5cdFx0aWYgKCFoYXNoUGFyYW1zKSByZXR1cm47XHJcblxyXG5cdFx0Y29uc3QgcGFyYW1zID0ge307XHJcblxyXG5cdFx0aGFzaFBhcmFtcy5zcGxpdCgnJicpLmZvckVhY2gocGFyYW0gPT4ge1xyXG5cdFx0XHRsZXQga2V5VmFsdWUgPSBwYXJhbS5zcGxpdCgnPScpO1xyXG5cclxuXHRcdFx0cGFyYW1zW2tleVZhbHVlWzBdXSA9IGtleVZhbHVlWzFdO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gMTcvMDMvMjAyNC5cclxuKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRvYXN0KG9wdGlvbnMgPSB7fSkge1xyXG5cdC8qXHJcblx0XHRvcHRpb25zOiB7XHJcblx0XHRcdGljb246IHN0cmluZyAodGV4dC9odG1sKSxcclxuXHRcdFx0bWVzc2FnZTogc3RyaW5nICh0ZXh0L2h0bWwpLFxyXG5cdFx0XHRwb3NpdGlvbjogc3RyaW5nICgndG9wIGxlZnQnLCAndG9wIGNlbnRlcicsICd0b3AgcmlnaHQnLCAnYm90dG9tIGxlZnQnLCAnYm90dG9tIGNlbnRlcicsICdib3R0b20gcmlnaHQnKSxcclxuXHRcdFx0dGltZTogaW50IChzZWNvbmRzKSxcclxuXHRcdH1cclxuXHQqL1xyXG5cclxuXHRvcHRpb25zLnBvc2l0aW9uID0gb3B0aW9ucy5wb3NpdGlvbiA/IG9wdGlvbnMucG9zaXRpb24gOiAnYm90dG9tIGNlbnRlcic7XHJcblx0b3B0aW9ucy50aW1lID0gb3B0aW9ucy50aW1lID8gb3B0aW9ucy50aW1lIDogNTtcclxuXHJcblx0Y29uc3QgdG9hc3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvYXN0cycpO1xyXG5cclxuXHRjcmVhdGUoKTtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCd0b2FzdCcpO1xyXG5cdFx0dG9hc3QuaW5uZXJIVE1MID0gLypodG1sKi9gXHJcblx0XHRcdCR7b3B0aW9ucy5pY29uID8gLypodG1sKi9gPGRpdiBjbGFzcz1cInRvYXN0LWljb25cIj48L2Rpdj5gIDogYDxzcGFuPjwvc3Bhbj5gfVxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidG9hc3QtYm9keVwiIHN0eWxlPVwiJHtvcHRpb25zLmljb24gPyAncGFkZGluZy1sZWZ0OiAwJyA6ICcnfVwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1jb250ZW50XCI+XHJcblx0XHRcdFx0XHQke29wdGlvbnMubWVzc2FnZX1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1idXR0b25cIiBvbmNsaWNrPVwidGhpcy5wYXJlbnRFbGVtZW50LnJlbW92ZSgpXCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0b2FzdC1idXR0b24taWNvblwiPlxyXG5cdFx0XHRcdFx0PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMi41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0xOCA2IDYgMThcIj48L3BhdGg+PHBhdGggZD1cIm02IDYgMTIgMTJcIj48L3BhdGg+PC9zdmc+XHJcblx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YDtcclxuXHJcblx0XHQvLyBcdTAwRURjb25lXHJcblx0XHRpZiAob3B0aW9ucy5pY29uKSB7XHJcblx0XHRcdGNvbnN0IGljb24gPSB0b2FzdC5xdWVyeVNlbGVjdG9yKCcudG9hc3QtaWNvbicpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuaWNvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHRcdGljb24uYXBwZW5kQ2hpbGQob3B0aW9ucy5pY29uKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGljb24uaW5uZXJIVE1MID0gb3B0aW9ucy5pY29uO1xyXG5cclxuXHRcdFx0dG9hc3QucHJlcGVuZChpY29uKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwb3NpXHUwMEU3XHUwMEUzbyBob3Jpem9udGFsXHJcblx0XHRpZiAob3B0aW9ucy5wb3NpdGlvbi5tYXRjaCgnbGVmdCcpKSB7XHJcblx0XHRcdHRvYXN0cy5jbGFzc0xpc3QuYWRkKCdsZWZ0Jyk7XHJcblx0XHR9IGVsc2UgaWYgKG9wdGlvbnMucG9zaXRpb24ubWF0Y2goJ3JpZ2h0JykpIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ3JpZ2h0Jyk7XHJcblx0XHR9IGVsc2UgIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ2NlbnRlcicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHBvc2lcdTAwRTdcdTAwRTNvIHZlcnRpY2FsXHJcblx0XHRpZiAob3B0aW9ucy5wb3NpdGlvbi5tYXRjaCgndG9wJykpIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ3RvcCcpO1xyXG5cclxuXHRcdFx0Ly8gYWRpY2lvbmEgZW0gY2ltYSBkbyBhbnRlcmlvclxyXG5cdFx0XHR0b2FzdHMucHJlcGVuZCh0b2FzdCk7XHJcblx0XHRcdHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3Nob3cnLCAndG9wJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0b2FzdHMuY2xhc3NMaXN0LmFkZCgnYm90dG9tJyk7XHJcblxyXG5cdFx0XHQvLyBhZGljaW9uYSBlbSBiYWl4byBkbyBhbnRlcmlvclxyXG5cdFx0XHR0b2FzdHMuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cdFx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JywgJ2JvdHRvbScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJlbW92ZSBhbyB0XHUwMEU5cm1pbm8gZG8gdGVtcG8gZGUgZXhpYmlcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0Ly8gb2N1bHRhXHJcblx0XHRcdHRvYXN0LmNsYXNzTmFtZSA9IHRvYXN0LmNsYXNzTmFtZS5yZXBsYWNlKCdzaG93JywgJ2hpZGUnKTtcclxuXHJcblx0XHRcdC8vIHJlbW92ZVxyXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCA1MDApO1xyXG5cdFx0fSwgb3B0aW9ucy50aW1lICogMTAwMCk7XHJcblx0fVxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG5cdC8vIHN0eWxlXHJcblx0Ly8gbGV0IGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rI3RvYXN0Jyk7XHJcblxyXG5cdC8vIGlmIChsaW5rKSByZXR1cm47XHJcblxyXG5cdC8vIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0Ly8gbGluay5pZCA9ICd0b2FzdCc7XHJcblx0Ly8gbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0Ly8gbGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHQvLyBsaW5rLmhyZWYgPSAnLi9zdHlsZS5jc3M/dj0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblx0Ly8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmFwcGVuZENoaWxkKGxpbmspO1xyXG5cclxuXHQvLyBjb250YWluZXJcclxuXHRsZXQgdG9hc3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvYXN0cycpO1xyXG5cclxuXHRpZiAoIXRvYXN0cykge1xyXG5cdFx0dG9hc3RzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHR0b2FzdHMuY2xhc3NOYW1lID0gJ3RvYXN0cyc7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0cyk7XHJcblx0fVxyXG59KSgpO1xyXG4iLCAiLy8gUmVmLjogaHR0cHM6Ly9sdWNpZGUuZGV2XHJcblxyXG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgSWNvbiA9IG5hbWUgPT4ge1xyXG5cdGNvbnN0IGljb25zID0ge1xyXG5cdFx0ZWxsaXBzaXNWZXJ0aWNhbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJlbGxpcHNpcy12ZXJ0aWNhbFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YmVsbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJiZWxsXCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRsb2dJbjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJsb2ctaW5cIj48L2k+LFxyXG5cdFx0bG9nT3V0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImxvZy1vdXRcIj48L2k+LFxyXG5cdFx0dXNlcjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaXJjbGUtdXNlci1yb3VuZFwiIHN0eWxlPVwic2NhbGU6IDEuMjtcIj48L2k+LFxyXG5cdFx0YWRkOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsdXNcIiBzdHlsZT1cInN0cm9rZS13aWR0aDogMS44OyBzY2FsZTogMS4yO1wiPjwvaT4sXHJcblx0XHRlZGl0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBlbmNpbFwiPjwvaT4sXHJcblx0XHRzZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2VhcmNoXCI+PC9pPixcclxuXHRcdHN0YXJ0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsYXlcIj48L2k+LFxyXG5cdFx0c3RvcDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJzcXVhcmVcIj48L2k+LFxyXG5cdFx0cmVmcmVzaDogPGkgY2xhc3M9XCJpY29uIHJlZnJlc2hcIiBkYXRhLWx1Y2lkZT1cInJlZnJlc2gtY3dcIj48L2k+LFxyXG5cdFx0dGFza3M6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwibGlzdC10b2RvXCIgc3R5bGU9XCJzY2FsZTogMS4zO1wiPjwvaT4sXHJcblx0XHRoaXN0b3J5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImhpc3RvcnlcIiBzdHlsZT1cInNjYWxlOiAxLjM7XCI+PC9pPixcclxuXHRcdGluZm86IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiaW5mb1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YWxlcnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2lyY2xlLWFsZXJ0XCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRjb3B5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImNvcHlcIj48L2k+LFxyXG5cdFx0cGFzdGU6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2xpcGJvYXJkLXBhc3RlXCI+PC9pPixcclxuXHRcdGR1cGxpY2F0ZTogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjb3B5LWNoZWNrXCI+PC9pPixcclxuXHRcdHRyYXNoOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInRyYXNoLTJcIj48L2k+LFxyXG5cdFx0Zm9sZGVyOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZvbGRlclwiPjwvaT4sXHJcblx0XHRmb2xkZXJTZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiZm9sZGVyLXNlYXJjaFwiPjwvaT4sXHJcblx0XHRvcGVuOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImV4dGVybmFsLWxpbmtcIj48L2k+LFxyXG5cdFx0Y2hlY2tlZDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGVja1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0dXA6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi11cFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0ZG93bjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGV2cm9uLWRvd25cIiBzdHlsZT1cInNjYWxlOiAxLjE7XCI+PC9pPixcclxuXHRcdGxlZnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1sZWZ0XCIgc3R5bGU9XCJzY2FsZTogMS4xNTtcIj48L2k+LFxyXG5cdFx0cmlnaHQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1yaWdodFwiIHN0eWxlPVwic2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGFycm93TGVmdDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJhcnJvdy1sZWZ0XCIgc3R5bGU9XCJzdHJva2Utd2lkdGg6IDEuODsgc2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGltcG9ydDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJmaWxlLWRvd25cIj48L2k+LFxyXG5cdFx0ZXhwb3J0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZpbGUtdXBcIj48L2k+LFxyXG5cdFx0c2hlZXQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2hlZXRcIj48L2k+LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBpY29uc1tuYW1lXTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEljb247XHJcbiIsICJpbXBvcnQgVG9hc3QgZnJvbSAnLi4vbGliL1RvYXN0L1RvYXN0JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IHdlYkFQSSA9IG5ldyBXZWJBUElTZXJ2aWNlKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB3ZWJBUEk7XHJcblxyXG5mdW5jdGlvbiBXZWJBUElTZXJ2aWNlKCkge1xyXG5cdC8qXHJcblx0XHRSZXRvcm5vIHBhZHJcdTAwRTNvIGRhcyBmdW5cdTAwRTdcdTAwRjVlcyAtPiB7IHJlc3VsdCwgZXJyb3IgfVxyXG5cdCovXHJcblxyXG5cdHRoaXMuZ2V0Q29uc3RhbnRzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRDb25zdGFudHMnIH0pO1xyXG5cclxuXHQvLyB1dGlsc1xyXG5cdHRoaXMuY29weUNsaXAgPSB0ZXh0ID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnQ29weUNsaXAnLCB0ZXh0OiB0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnJTBBJykucmVwbGFjZSgvXFx0L2csICclMDknKSB9KTtcclxuXHJcblx0Ly8gZm9sZGVyL2ZpbGVcclxuXHR0aGlzLnBhdGhJc0F2YWlsYWJsZSA9IHBhdGggPT4gX3BhdGhJc0F2YWlsYWJsZSh7IG1ldGhvZDogJ1BhdGhJc0F2YWlsYWJsZScsIHBhdGggfSk7XHJcblx0dGhpcy52aWV3SW5GaWxlRXhwbG9yZXIgPSBmaWxlT3JGb2xkZXJQYXRoID0+IF92aWV3SW5GaWxlRXhwbG9yZXIoeyBtZXRob2Q6ICdWaWV3SW5GaWxlRXhwbG9yZXInLCBmaWxlT3JGb2xkZXJQYXRoIH0pO1xyXG5cclxuXHQvLyBmb2xkZXJcclxuXHR0aGlzLmZvbGRlclBpY2tlciA9IHRpdGxlID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRm9sZGVyUGlja2VyJywgdGl0bGUgfSk7XHJcblxyXG5cdC8vIGZpbGVcclxuXHR0aGlzLmZpbGVQaWNrZXIgPSAodGl0bGUsIGZpbGVUeXBlcykgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVUeXBlcyB9KTtcclxuXHR0aGlzLnNhdmVGaWxlUGlja2VyID0gKHRpdGxlLCBmaWxlTmFtZSwgZmlsZVR5cGVzKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NhdmVGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVOYW1lLCBmaWxlVHlwZXMgfSk7XHJcblx0dGhpcy5kb3dubG9hZEZpbGUgPSAodXJsLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0Rvd25sb2FkRmlsZScsIHVybCwgcGF0aCB9KTtcclxuXHR0aGlzLm9wZW5GaWxlID0gcGF0aCA9PiBfb3BlbkZpbGUoeyBtZXRob2Q6ICdPcGVuRmlsZScsIHBhdGggfSk7XHJcblxyXG5cdC8vIGRhdGE6IHRhc2tzXHJcblx0dGhpcy5uZXdUYXNrID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdOZXdUYXNrJyB9KTtcclxuXHR0aGlzLm5ld1Rhc2tGaWxlRmlsdGVySXRlbSA9ICgpID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnTmV3VGFza0ZpbGVGaWx0ZXJJdGVtJyB9KTtcclxuXHR0aGlzLmdldFRhc2tzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRUYXNrcycgfSk7XHJcblx0dGhpcy5nZXRUYXNrQnlJZCA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnR2V0VGFza0J5SWQnLCBpZCB9KTtcclxuXHR0aGlzLmluc2VydFRhc2sgPSBpdGVtID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnSW5zZXJ0VGFzaycsIGl0ZW0gfSk7XHJcblx0dGhpcy5pbXBvcnRUYXNrcyA9IHBhdGggPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdJbXBvcnRUYXNrcycsIHBhdGggfSk7XHJcblx0dGhpcy51cGRhdGVUYXNrID0gaXRlbSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1VwZGF0ZVRhc2snLCBpdGVtIH0pO1xyXG5cdHRoaXMuZGVsZXRlVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRGVsZXRlVGFzaycsIGlkLCBkZWxldGVIaXN0b3J5OiB0cnVlIH0pO1xyXG5cclxuXHQvLyBkYXRhOiBoaXN0b3J5XHJcblx0dGhpcy5nZXRIaXN0b3J5UGFnZWQgPSAocGFnZUluZGV4LCBsaW1pdCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRIaXN0b3J5UGFnZWQnLCBwYWdlSW5kZXgsIGxpbWl0IH0pO1xyXG5cdHRoaXMuZGVsZXRlSGlzdG9yeUV2ZW50cyA9IGlkcyA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0RlbGV0ZUhpc3RvcnlFdmVudHMnLCBpZHMgfSk7XHJcblx0dGhpcy5nZXRJdGVtc0Zyb21IaXN0b3J5RmlsZVBhZ2VkID0gKGZpbGVOYW1lLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0dldEl0ZW1zRnJvbUhpc3RvcnlGaWxlUGFnZWQnLCBmaWxlTmFtZSwgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmV4cG9ydEhpc3RvcnkgPSAoc2hlZXROYW1lLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0V4cG9ydEhpc3RvcnknLCBzaGVldE5hbWUsIHBhdGggfSk7XHJcblx0dGhpcy5leHBvcnRIaXN0b3J5RmlsZXMgPSAoZmlsZU5hbWUsIHNoZWV0TmFtZSwgcGF0aCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdFeHBvcnRIaXN0b3J5RmlsZXMnLCBmaWxlTmFtZSwgc2hlZXROYW1lLCBwYXRoIH0pO1xyXG5cclxuXHQvLyB0YXNrXHJcblx0dGhpcy5zZWFyY2hUYXNrRmlsZXNQYWdlZCA9IChpdGVtLCBlbmFibGVFeGNlcHRpb25zLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NlYXJjaFRhc2tGaWxlc1BhZ2VkJywgaXRlbSwgZW5hYmxlRXhjZXB0aW9ucywgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmlzVGFza1J1bm5pbmcgPSBpZCA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0lzVGFza1J1bm5pbmcnLCBpZCB9KTtcclxuXHR0aGlzLnN0YXJ0VGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RhcnRUYXNrJywgaWQgfSk7XHJcblx0dGhpcy5zdG9wVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RvcFRhc2snLCBpZCB9KTtcclxuXHJcblxyXG5cdC8vIEZVTlx1MDBDN1x1MDBENUVTXHJcblxyXG5cdGZ1bmN0aW9uIF9yZXF1ZXN0QVBJKHBhcmFtcyA9IHt9KSB7XHJcblx0XHRyZXR1cm4gZmV0Y2goJy9hcGknLCB7XHJcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShwYXJhbXMpXHJcblx0XHR9KS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfcGF0aElzQXZhaWxhYmxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IGlzQXZhaWxhYmxlIH0gPSBhd2FpdCBfcmVxdWVzdEFQSShwYXJhbXMpO1xyXG5cclxuXHRcdGlmICghaXNBdmFpbGFibGUpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgaW52YWxpZCBvciBhY2Nlc3MgaXMgZGVuaWVkLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGlzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gX29wZW5GaWxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVW5hYmxlIHRvIG9wZW4gdGhlIGZpbGUuIFBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUgZGlyZWN0b3J5IGFuZCB2ZXJpZnkgaXRzIGNvbnRlbnRzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA2XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfdmlld0luRmlsZUV4cGxvcmVyKHBhcmFtcykge1xyXG5cdFx0aWYgKHBhcmFtcy5maWxlT3JGb2xkZXJQYXRoLmxlbmd0aCA8PSAyNjApIHtcclxuXHRcdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRcdG1lc3NhZ2U6IGVycm9yLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHRcdHRpbWU6IDQsXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRpY29uOiBJY29uKCdpbmZvJyksXHJcblx0XHRcdFx0bWVzc2FnZTogJ0Nhbm5vdCBvcGVuIGZvbGRlcjogcGF0aCBleGNlZWRzIDI2MCBjaGFyYWN0ZXJzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0LFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBQYWdlTGF5b3V0ID0gKHsgbmF2aWdhdGlvbiwgYXBwQmFyLCBmb290ZXIgfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwibGF5b3V0XCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJuYXZpZ2F0aW9uXCI+XHJcblx0XHRcdFx0e25hdmlnYXRpb24gPyBuYXZpZ2F0aW9uLmVsZW1lbnQubm9kZXNbMF0gOiAnJ31cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJtYWluXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImFwcGJhciBiYlwiPlxyXG5cdFx0XHRcdFx0e2FwcEJhciA/IGFwcEJhci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInBhZ2VcIj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJhY3Rpb25iYXIgYmJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb250ZW50XCI+PC9kaXY+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlciBidFwiPlxyXG5cdFx0XHRcdFx0e2Zvb3RlciA/IGZvb3Rlci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRuYXZpZ2F0aW9uOiAkcm9vdC5nZXQoJy5uYXZpZ2F0aW9uJyksXHJcblx0XHRcdGFwcEJhcjogJHJvb3QuZ2V0KCcubWFpbiAuYXBwYmFyJyksXHJcblx0XHRcdHBhZ2U6ICRyb290LmdldCgnLnBhZ2UnKSxcclxuXHRcdFx0aGVhZGVyOiAkcm9vdC5nZXQoJy5wYWdlIC5oZWFkZXInKSxcclxuXHRcdFx0YWN0aW9uQmFyOiAkcm9vdC5nZXQoJy5wYWdlIC5hY3Rpb25iYXInKSxcclxuXHRcdFx0Y29udGVudDogJHJvb3QuZ2V0KCcucGFnZSAuY29udGVudCcpLFxyXG5cdFx0XHRmb290ZXI6ICRyb290LmdldCgnLm1haW4gLmZvb3RlcicpLFxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZUxheW91dDtcclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gIDA3LzAxLzIwMjQuXHJcblx0RGVzY3JpXHUwMEU3XHUwMEUzbzogTWVudSBkZSBjb250ZXh0byBzaW1wbGVzLlxyXG4qL1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0dHJpZ2dlcjogbnVsbCwgLy8gSFRNTEVsZW1lbnQgKGV4LjogYnV0dG9uIHwgYSB8IGRpdilcclxuXHRpdGVtczogW10sIC8vIFt7IGljb246IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcsIG9uQ2xpY2s6IGZ1bmN0aW9uIH1dXHJcblx0YWxpZ246ICdsZWZ0JywgLy8gbGVmdCB8IHJpZ2h0XHJcblx0dG9wOiAwLCAvLyBBanVzdGUgZGUgcG9zaVx1MDBFN1x1MDBFM29vIHZlcnRpY2FsIHF1YW5kbyBuZWNlc3NcdTAwRTFyaW9cclxuXHRvblNob3c6IG51bGwsXHJcblx0b25IaWRlOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWVudShvcHRpb25zKSB7XHJcblx0b3B0aW9ucyA9IHtcclxuXHRcdC4uLmRlZmF1bHRPcHRpb25zLFxyXG5cdFx0Li4ub3B0aW9ucyxcclxuXHR9O1xyXG5cclxuXHRsZXQgJG1lbnU7XHJcblx0bGV0IF9jbGFzc1Zpc2libGUgPSAnJztcclxuXHRsZXQgX2NsYXNzSW52aXNpYmxlID0gJyc7XHJcblxyXG5cdGlmIChvcHRpb25zLnRyaWdnZXIpIHtcclxuXHRcdG9wdGlvbnMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdHNob3coKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgX2NvbnRleHQgPSB7XHJcblx0XHRvcHRpb25zLFxyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGl0ZW06IF9pdGVtLFxyXG5cdFx0c2hvdyxcclxuXHRcdGhpZGUsXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIF9jb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRtZW51LmNsYXNzTmFtZSA9ICdjdHgtbWVudSc7XHJcblx0XHQkbWVudS5pbm5lckhUTUwgPSAvKmh0bWwqL2Ake29wdGlvbnMuaXRlbXMubWFwKGl0ZW0gPT4ge1xyXG5cdFx0XHRpZiAoaXRlbS5kaXZpZGVyKSB7XHJcblx0XHRcdFx0cmV0dXJuICgvKmh0bWwqL2BcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGl2aWRlclwiPjwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAoLypodG1sKi9gXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY3R4LWl0ZW1cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImN0eC1pY29uXCI+PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtdGV4dFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtbmFtZVwiPiR7aXRlbS5uYW1lfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGVzY3JpcHRpb25cIj4ke2l0ZW0uZGVzY3JpcHRpb24gfHwgJyd9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0YCk7XHJcblx0XHRcdH1cclxuXHRcdH0pLmpvaW4oJycpfWA7XHJcblxyXG5cdFx0Ly8gSXRlbnNcclxuXHRcdCRtZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IGRpdicpLmZvckVhY2goKCRpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRjb25zdCBpdGVtID0gb3B0aW9ucy5pdGVtc1tpbmRleF07XHJcblx0XHRcdGNvbnN0IGljb24gPSBpdGVtLmljb247XHJcblxyXG5cdFx0XHQkaXRlbS5kYXRhID0gaXRlbTtcclxuXHRcdFx0aXRlbS5lbGVtZW50ID0gJGl0ZW07XHJcblxyXG5cdFx0XHQvLyBcdTAwQ0Rjb25lXHJcblx0XHRcdGlmIChpY29uKSB7XHJcblx0XHRcdFx0Y29uc3QgJGljb24gPSAkaXRlbS5xdWVyeVNlbGVjdG9yKCcuY3R4LWljb24nKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBpY29uID09ICdzdHJpbmcnKVxyXG5cdFx0XHRcdFx0JGljb24uaW5uZXJIVE1MID0gaWNvbjtcclxuXHRcdFx0XHRlbHNlIGlmIChpY29uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdFx0XHQkaWNvbi5hcHBlbmRDaGlsZChpY29uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRXZlbnRvXHJcblx0XHRcdGlmIChpdGVtLmRpdmlkZXIgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0JGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XHJcblx0XHRcdFx0XHRoaWRlKCk7XHJcblx0XHJcblx0XHRcdFx0XHRpZiAoaXRlbS5vbkNsaWNrKVxyXG5cdFx0XHRcdFx0XHRpdGVtLm9uQ2xpY2soZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRfY29udGV4dC5lbGVtZW50ID0gJG1lbnU7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRtZW51KTtcclxuXHJcblx0XHRyZXR1cm4gJG1lbnU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfaXRlbShuYW1lKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRnZXQsXHJcblx0XHRcdGljb24sXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0cmV0dXJuIG9wdGlvbnMuaXRlbXMuZmluZCh4ID0+IHgubmFtZSA9PSBuYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpY29uKGVsZW1lbnQpIHtcclxuXHRcdFx0Y29uc3QgJGl0ZW0gPSBnZXQoKS5lbGVtZW50O1xyXG5cdFx0XHRjb25zdCAkaWNvblBsYWNlID0gJGl0ZW0ucXVlcnlTZWxlY3RvcignLmN0eC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZiAoZWxlbWVudCkge1xyXG5cdFx0XHRcdCRpY29uUGxhY2UuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRcdFx0JGljb25QbGFjZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIGlmIChlbGVtZW50ID09ICcnKSB7XHJcblx0XHRcdFx0JGljb25QbGFjZS5pbm5lckhUTUwgPSAnJztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gJGljb25QbGFjZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhldmVudCA9IHt9KSB7XHJcblx0XHRsZXQgeDtcclxuXHRcdGxldCB5O1xyXG5cclxuXHRcdGRlc3Ryb3koKTtcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xpY2soKTsgLy8gRGVzdHJvaSBvdXRyb3MgbWVudXNcclxuXHRcdCRtZW51ID0gY3JlYXRlKCk7XHJcblx0XHRfY2xhc3NWaXNpYmxlID0gJ2N0eC1tZW51LXZpc2libGUtbGVmdCc7XHJcblx0XHRfY2xhc3NJbnZpc2libGUgPSAnY3R4LW1lbnUtaW52aXNpYmxlLWxlZnQnO1xyXG5cclxuXHRcdC8vIEJvdFx1MDBFM28gZGlyZWl0byBkbyBtb3VzZVxyXG5cdFx0aWYgKGV2ZW50LnR5cGUgPT0gJ2NvbnRleHRtZW51Jykge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBJbXBlZGUgcXVlIG8gbWVudSBkZSBjb250ZXh0byBuYXRpdm8gZG8gbmF2ZWdhZG9yIHNlamEgYWJlcnRvXHJcblxyXG5cdFx0XHQvLyBDb29yZGVuYWRhcyBkbyBjdXJzb3JcclxuXHRcdFx0eCA9IGV2ZW50Lng7XHJcblx0XHRcdHkgPSBldmVudC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBvc2lcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgLy8gUGFyYSBxdWUgd2luZG93IGNsaWNrIG5cdTAwRTNvIGZlY2hlIG8gbWVudVxyXG5cdFx0XHRpZiAob3B0aW9ucy50cmlnZ2VyKSB7XHJcblx0XHRcdFx0Y29uc3QgdHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlcjtcclxuXHJcblx0XHRcdFx0Ly8gQ2FudG8gaW5mZXJpb3IgZXNxdWVyZG8gZG8gdHJpZ2dlclxyXG5cdFx0XHRcdHggPSB0cmlnZ2VyLm9mZnNldExlZnQ7XHJcblx0XHRcdFx0eSA9IHRyaWdnZXIub2Zmc2V0VG9wICsgdHJpZ2dlci5vZmZzZXRIZWlnaHQgKyAxO1xyXG5cclxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGlnbiA9PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQvLyBDYW50byBpbmZlcmlvciBkaXJlaXRvIGRvIHRyaWdnZXJcclxuXHRcdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGggKyB0cmlnZ2VyLm9mZnNldFdpZHRoIC0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh4ICsgJG1lbnUub2Zmc2V0V2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG5cdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGg7XHJcblxyXG5cdFx0XHRcdF9jbGFzc1Zpc2libGUgPSAnY3R4LW1lbnUtdmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdFx0X2NsYXNzSW52aXNpYmxlID0gJ2N0eC1tZW51LWludmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh5ICsgJG1lbnUub2Zmc2V0SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0ID4gMClcclxuXHRcdFx0XHR5ID0gd2luZG93LmlubmVySGVpZ2h0IC0gJG1lbnUub2Zmc2V0SGVpZ2h0O1xyXG5cclxuXHRcdFx0JG1lbnUuY2xhc3NOYW1lID0gJ2N0eC1tZW51JztcclxuXHRcdFx0JG1lbnUuY2xhc3NMaXN0LmFkZChfY2xhc3NWaXNpYmxlKTtcclxuXHRcdFx0JG1lbnUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG5cdFx0XHQkbWVudS5zdHlsZS50b3AgPSBvcHRpb25zLnRvcCArIHkgKyAncHgnO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMub25TaG93KVxyXG5cdFx0XHRcdG9wdGlvbnMub25TaG93KF9jb250ZXh0KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGUpO1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGlkZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoaWRlKGV2ZW50KSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0aWYgKGV2ZW50KSB7XHJcblx0XHRcdGlmICghKCFldmVudC50YXJnZXQuY2xvc2VzdCgnLmN0eC1tZW51JykgfHwgZXZlbnQua2V5ID09ICdFc2NhcGUnKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JG1lbnUuY2xhc3NMaXN0LnJlbW92ZShfY2xhc3NWaXNpYmxlKTtcclxuXHRcdCRtZW51LmNsYXNzTGlzdC5hZGQoX2NsYXNzSW52aXNpYmxlKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkhpZGUpXHJcblx0XHRcdG9wdGlvbnMub25IaWRlKF9jb250ZXh0KTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KGRlc3Ryb3ksIDIwMCk7XHJcblxyXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoaWRlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0JG1lbnUucmVtb3ZlKCk7XHJcblx0XHQkbWVudSA9IG51bGw7XHJcblx0fVxyXG59O1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vSWNvbic7XHJcblxyXG5jb25zdCBBcHBCYXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJBcHBCYXIgZmxleCBqdXN0aWZ5LWJldHdlZW4gdy1mdWxsXCI+XHJcblx0XHRcdDxkaXY+PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yXCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwIG5vdGlmaWNhdGlvblwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ2JlbGwnKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTAgdXNlclwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ3VzZXInKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRzZXQoKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHNldCgpIHtcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiAkcm9vdC5nZXQoJ2J1dHRvbi51c2VyJykubm9kZXNbMF0sXHJcblx0XHRcdGFsaWduOiAncmlnaHQnLFxyXG5cdFx0XHR0b3A6IDEsXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnVXNlciBuYW1lJywgaWNvbjogSWNvbigndXNlcicpLCBkZXNjcmlwdGlvbjogJ01hbmFnZSB5b3VyIGFwcCBhY2NvdW50LicsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IGRpdmlkZXI6IHRydWUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdMb2cgb3V0JywgaWNvbjogSWNvbignbG9nT3V0JyksIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdBYm91dCcsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHBCYXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgTmF2aWdhdGlvbiA9IChpdGVtcyA9IFtdKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJOYXZpZ2F0aW9uXCI+XHJcblx0XHRcdDxkaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImhlYWRlclwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImxvZ29cIj5cclxuXHRcdFx0XHRcdFx0PGltZyBzcmM9XCJsb2dvLnN2Z1wiIC8+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cInRpdGxlXCI+XHJcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwib3BhY2l0eS01MCB0cmFja2luZy1bMXB4XVwiPklNQUdFPC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1sLVswLjVweF0gb3BhY2l0eS05MFwiPlBSRVNTT1I8L3NwYW4+XHJcblx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJpdGVtc1wiPntcclxuXHRcdFx0XHRcdGl0ZW1zLm1hcChpdGVtID0+XHJcblx0XHRcdFx0XHRcdDxhIGhyZWY9e2l0ZW0uaHJlZn0gY2xhc3M9XCJpdGVtXCIgZGF0YS1rZXl3b3JkPXtpdGVtLm5hbWV9PlxyXG5cdFx0XHRcdFx0XHRcdHtpdGVtLmljb259XHJcblx0XHRcdFx0XHRcdFx0PGxhYmVsPntpdGVtLnRpdGxlfTwvbGFiZWw+XHJcblx0XHRcdFx0XHRcdDwvYT5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZm9vdGVyXCI+XHJcblx0XHRcdFx0VmVyc2lvbiAxLjAuMVxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdHNldEFjdGl2ZSxcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBzZXRBY3RpdmUoKSB7XHJcblx0XHQkcm9vdC5nZXQoJy5pdGVtJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmZvckVhY2goaXRlbSA9PiB7XHJcblx0XHRcdGNvbnN0IGtleXdvcmQgPSBpdGVtLmF0dHIoJ2RhdGEta2V5d29yZCcpO1xyXG5cclxuXHRcdFx0aWYgKGxvY2F0aW9uLmhhc2gubWF0Y2goa2V5d29yZCkpXHJcblx0XHRcdFx0aXRlbS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOYXZpZ2F0aW9uO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuXHJcbmNvbnN0IFBhZ2VGb290ZXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJQYWdlRm9vdGVyIGZsZXggdy1mdWxsXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmZvIGZsZXggaXRlbXMtY2VudGVyXCI+PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRpbmZvLFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIGluZm8odGV4dE9ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0Y29uc3QgJGluZm8gPSAkcm9vdC5nZXQoJy5pbmZvJyk7XHJcblxyXG5cdFx0dGV4dE9ySHRtbE9yRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gJGluZm8uaW5zZXJ0KHRleHRPckh0bWxPckVsZW1lbnQpIDogJGluZm8uaHRtbCh0ZXh0T3JIdG1sT3JFbGVtZW50IHx8ICcnKTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWdlRm9vdGVyO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgTG9naW5QYWdlID0gKCkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8Zm9ybSBjbGFzcz1cIkxvZ2luUGFnZVwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGl0bGVcIj5TaWduIGluIHRvIHlvdXIgYWNjb3VudDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGRzXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5Zb3VyIGVtYWlsPC9kaXY+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiZW1haWxcIiByZXF1aXJlZCBzcGVsbGNoZWNrPVwiZmFsc2VcIiBwbGFjZWhvbGRlcj1cIi4uLkAuLi5cIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiIC8+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5QYXNzd29yZDwvZGl2PlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5hbWU9XCJwYXNzd29yZFwiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPVwiXHUyMDIyXHUyMDIyXHUyMDIyXHUyMDIyXHUyMDIyXHUyMDIyXHUyMDIyXHUyMDIyXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTtcIiAvPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6XCIgY2xhc3M9XCJsaW5rIGJsdWUgbGluay1mb3Jnb3RcIj5cclxuXHRcdFx0XHRGb3Jnb3QgcGFzc3dvcmQ/XHJcblx0XHRcdDwvYT5cclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24tc2lnbmluXCI+U2lnbiBpbjwvYnV0dG9uPlxyXG5cdFx0PC9mb3JtPlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2xvZ2luLXRoZW1lJyk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9naW5QYWdlO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi9JY29uJztcclxuXHJcbmNvbnN0IFBhZ2VIZWFkZXIgPSAoeyBwYWdlTWFwID0gW10sIGRlc2NyaXB0aW9uID0gJycsIG9uQ2xpY2tCYWNrQnV0dG9uIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlBhZ2VIZWFkZXJcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImJyZWFkY3J1bWJcIj48L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0e2Rlc2NyaXB0aW9ufVxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0c2V0UGFnZU1hcCxcclxuXHR9O1xyXG5cclxuXHRzZXRQYWdlTWFwKHBhZ2VNYXApO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gc2V0UGFnZU1hcChwYWdlTWFwKSB7XHJcblx0XHRjb25zdCAkYnJlYWRjcnVtYiA9ICRyb290LmdldCgnLmJyZWFkY3J1bWInKS5odG1sKCcnKTtcclxuXHJcblx0XHRwYWdlTWFwLmZvckVhY2goKCRpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHQkaXRlbSA9IGRvbSgkaXRlbSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gJGl0ZW0gOiA8c3Bhbj57JGl0ZW19PC9zcGFuPikuYWRkQ2xhc3MoJ2l0ZW0nKTtcclxuXHJcblx0XHRcdGxldCB0YWcgPSAkaXRlbS5hdHRyKCd0YWdOYW1lJyk7XHJcblxyXG5cdFx0XHRpZiAodGFnID09ICdBJyB8fCB0YWcgPT0gJ0JVVFRPTicpXHJcblx0XHRcdFx0JGl0ZW0uYWRkQ2xhc3MoJ2J1dHRvbicsICd3LTEwJywgJ2gtMTAnKTtcclxuXHJcblx0XHRcdGlmIChwYWdlTWFwLmxlbmd0aCA9PSAxKVxyXG5cdFx0XHRcdCRpdGVtLnN0eWxlKCdwYWRkaW5nJywgJzBweCcpO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ID09IHBhZ2VNYXAubGVuZ3RoIC0gMSlcclxuXHRcdFx0XHQkaXRlbS5hZGRDbGFzcygnbGFzdCcpO1xyXG5cclxuXHRcdFx0JGJyZWFkY3J1bWIuaW5zZXJ0KCRpdGVtKTtcclxuXHJcblx0XHRcdGlmIChpbmRleCA8IHBhZ2VNYXAubGVuZ3RoIC0gMSlcclxuXHRcdFx0XHQkYnJlYWRjcnVtYi5pbnNlcnQoSWNvbigncmlnaHQnKSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAob25DbGlja0JhY2tCdXR0b24pIHtcclxuXHRcdFx0JGJyZWFkY3J1bWIuaW5zZXJ0KFxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMCBiYWNrYnV0dG9uXCIgb25DbGljaz17b25DbGlja0JhY2tCdXR0b259PlxyXG5cdFx0XHRcdFx0e0ljb24oJ2Fycm93TGVmdCcpfVxyXG5cdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdCwgdHJ1ZVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2VIZWFkZXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgQWN0aW9uQmFyID0gKHsgYnV0dG9ucyA9IFtdIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIkFjdGlvbkJhciBmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgZ2FwLVswLjRlbV1cIj5cclxuXHRcdFx0e2J1dHRvbnMubWFwKGJ1dHRvbiA9PiB7XHJcblx0XHRcdFx0aWYgKGJ1dHRvbi5kaXZpZGVyKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gPHNwYW4gY2xhc3M9XCJkaXZpZGVyIGgtNVwiPjwvc3Bhbj47XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnN0ICRidXR0b24gPSAoXHJcblx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbiB3LTEwIGgtMTBcIiBuYW1lPXtidXR0b24ubmFtZSB8fCAnJ30gdGl0bGU9e2J1dHRvbi50b29sdGlwIHx8ICcnfSBzdHlsZT17YnV0dG9uLnN0eWxlIHx8ICcnfSBvbkNsaWNrPXtidXR0b24ub25DbGlja30+XHJcblx0XHRcdFx0XHRcdFx0e2J1dHRvbi5pY29uIHx8ICcnfVxyXG5cdFx0XHRcdFx0XHRcdHtidXR0b24uZGlzcGxheU5hbWUgPyA8c3BhbiBjbGFzcz1cIm5hbWVcIj57YnV0dG9uLmRpc3BsYXlOYW1lfTwvc3Bhbj4gOiAnJ31cclxuXHRcdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdCRidXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCAhIWJ1dHRvbi5kaXNhYmxlZCk7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuICRidXR0b247XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KX1cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdGJ1dHRvbixcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBidXR0b24obmFtZSkge1xyXG5cdFx0bGV0ICRidXR0b24gPSAkcm9vdC5nZXRCeU5hbWUobmFtZSk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0ZGlzYWJsZSxcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlID0gdHJ1ZSkge1xyXG5cdFx0XHQkYnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcsIGRpc2FibGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFjdGlvbkJhcjtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBSb3dQcm9ncmVzc0JhciA9ICgpID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlJvd1Byb2dyZXNzQmFyXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJiYXJcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj48L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ2YWx1ZVwiPjwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogcm9vdCxcclxuXHRcdHVwZGF0ZSxcclxuXHRcdHNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZShwZXJjZW50ID0gMCwgdmFsdWUgPSAnJykge1xyXG5cdFx0JHJvb3QuZ2V0KCcucHJvZ3Jlc3MnKS5zdHlsZSgnd2lkdGgnLCBgJHtwZXJjZW50fSVgKTtcclxuXHRcdCRyb290LmdldCgnLnZhbHVlJykuaHRtbCh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHQkcm9vdC5zdHlsZSh7IHZpc2liaWxpdHk6IHNob3cgPyAndmlzaWJsZScgOiAnaGlkZGVuJyB9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3dQcm9ncmVzc0JhcjtcclxuIiwgImNvbnN0IHV0aWxzID0gbmV3IFV0aWxzKCk7XHJcblxyXG5leHBvcnQgeyB1dGlscyB9O1xyXG5cclxuZnVuY3Rpb24gVXRpbHMoKSB7XHJcblx0dGhpcy5nZW5lcmF0ZUd1aWQgPSBnZW5lcmF0ZUd1aWQ7XHJcblx0dGhpcy5tZXJnZVByb3BzID0gbWVyZ2VQcm9wcztcclxuXHR0aGlzLmdldEVsZW1lbnRJbmRleCA9IGdldEVsZW1lbnRJbmRleDtcclxuXHR0aGlzLmNyZWF0ZVJhbmdlQXJyYXkgPSBjcmVhdGVSYW5nZUFycmF5O1xyXG5cdHRoaXMuaXNBcnJheU9mSFRNTEVsZW1lbnQgPSBpc0FycmF5T2ZIVE1MRWxlbWVudDtcclxuXHR0aGlzLnBhcnNlRGltZW5zaW9uID0gcGFyc2VEaW1lbnNpb247XHJcblx0dGhpcy5zZXRFbGVtZW50QXR0ciA9IHNldEVsZW1lbnRBdHRyO1xyXG5cdHRoaXMuc2V0RWxlbWVudFN0eWxlID0gc2V0RWxlbWVudFN0eWxlO1xyXG5cclxuXHRmdW5jdGlvbiBnZW5lcmF0ZUd1aWQoKSB7XHJcblx0XHQvLyBSZXRvcm5hIHJhbmRvbWljYW1lbnRlIHVtIEdVSUQgLSBFeC46IGE5MWUzMmRmLTkzNTItNDUyMC05ZjA5LTE3MTVhOWEwY2U0MVxyXG5cclxuXHRcdGNvbnN0IGd1aWQgPSAoWzFlNl0gKyAtMWUzICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYyA9PlxyXG5cdFx0XHQoYyBeIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdICYgMTUgPj4gYyAvIDQpLnRvU3RyaW5nKDE2KVxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBhZGljaW9uYSB1bWEgbGV0cmEgY29tbyBwcmltZWlybyBjYXJhY3RlcmUgcGFyYSBldml0YXIgZXJybyBuYSBmdW5cdTAwRTdcdTAwRTNvIHF1ZXJ5U2VsZWN0b3JcclxuXHRcdHJldHVybiAnYScgKyBndWlkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2VQcm9wcyh0YXJnZXQsIHNvdXJjZSkge1xyXG5cdFx0Y29uc3QgbWVyZ2VkID0geyAuLi50YXJnZXQgfTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdHNvdXJjZVtrZXldIGluc3RhbmNlb2YgT2JqZWN0ICYmXHJcblx0XHRcdFx0IShzb3VyY2Vba2V5XSBpbnN0YW5jZW9mIEFycmF5KSAmJlxyXG5cdFx0XHRcdCEoc291cmNlW2tleV0gaW5zdGFuY2VvZiBGdW5jdGlvbikgJiZcclxuXHRcdFx0XHQhKHNvdXJjZVtrZXldIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdG1lcmdlZFtrZXldID0gbWVyZ2VQcm9wcyh0YXJnZXRba2V5XSB8fCB7fSwgc291cmNlW2tleV0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1lcmdlZFtrZXldID0gc291cmNlW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbWVyZ2VkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RWxlbWVudEluZGV4KCRlbGVtZW50KSB7XHJcblx0XHRjb25zdCBjaGlsZHJlbiA9IEFycmF5LmZyb20oJGVsZW1lbnQucGFyZW50RWxlbWVudC5jaGlsZHJlbik7XHJcblxyXG5cdFx0cmV0dXJuIGNoaWxkcmVuLmluZGV4T2YoJGVsZW1lbnQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlUmFuZ2VBcnJheShzdGFydE51bWJlciwgZW5kTnVtYmVyKSB7XHJcblx0XHQvLyB2ZXJpZmljYSBhIGRpcmVcdTAwRTdcdTAwRTNvIGRvIGludGVydmFsbyAoY3Jlc2NlbnRlIG91IGRlY3Jlc2NlbnRlKVxyXG5cdFx0Y29uc3QgaXNBc2NlbmRpbmcgPSBzdGFydE51bWJlciA8PSBlbmROdW1iZXI7XHJcblxyXG5cdFx0Ly8gY3JpYSBvIGludGVydmFsb1xyXG5cdFx0cmV0dXJuIEFycmF5LmZyb20oXHJcblx0XHRcdHsgbGVuZ3RoOiBNYXRoLmFicyhlbmROdW1iZXIgLSBzdGFydE51bWJlcikgKyAxIH0sXHJcblx0XHRcdChfLCBpbmRleCkgPT4gaXNBc2NlbmRpbmdcclxuXHRcdFx0XHQ/IHN0YXJ0TnVtYmVyICsgaW5kZXhcclxuXHRcdFx0XHQ6IHN0YXJ0TnVtYmVyIC0gaW5kZXhcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0FycmF5T2ZIVE1MRWxlbWVudChvYmopIHtcclxuXHRcdGlmIChBcnJheS5pc0FycmF5KG9iaikpXHJcblx0XHRcdHJldHVybiBvYmouZXZlcnkoaXRlbSA9PiBpdGVtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpO1xyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHBhcnNlRGltZW5zaW9uKHZhbHVlKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInID8gYCR7dmFsdWV9cHhgIDogdmFsdWUgfHwgJyc7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRFbGVtZW50U3R5bGUoZWxlbWVudHMsIGF0dHJpYnV0ZXMgPSB7fSkge1xyXG5cdFx0c2V0RWxlbWVudEF0dHIoZWxlbWVudHMsIGF0dHJpYnV0ZXMsICdzdHlsZScpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RWxlbWVudEF0dHIoZWxlbWVudHMsIGF0dHJpYnV0ZXMgPSB7fSwgb2JqZWN0TmFtZSA9ICcnKSB7XHJcblx0XHQvLyBhdHRyaWJ1dGVzOiBvYmplY3RcclxuXHRcdC8vIG9iamVjdDogc3RyaW5nIC0gZXguOiBzdHlsZVxyXG5cclxuXHRcdGVsZW1lbnRzID0gZWxlbWVudHMgaW5zdGFuY2VvZiBBcnJheSA/IGVsZW1lbnRzIDogW2VsZW1lbnRzXTtcclxuXHJcblx0XHRlbGVtZW50cy5mb3JFYWNoKHggPT4ge1xyXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XHJcblx0XHRcdFx0bGV0IG5vZGUgPSBvYmplY3ROYW1lID8geFtvYmplY3ROYW1lXSA6IHg7XHJcblx0XHRcdFx0bGV0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xyXG5cclxuXHRcdFx0XHQvLyB2YWxvcmVzIGludGVpcm9zIGNvbSB1bmlkYWRlIHB4XHJcblx0XHRcdFx0aWYgKG9iamVjdE5hbWUgPT0gJ3N0eWxlJykge1xyXG5cdFx0XHRcdFx0bGV0IGltcG9ydGFudCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdGlmICgha2V5Lm1hdGNoKC9pbmRleHxsaW5lfGdyaWR8b3JkZXJ8dGFifG9ycGhhbnN8d2lkb3dzfGNvbHVtbnN8Y291bnRlcnxvcGFjaXR5L2kpKVxyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyA/IHZhbHVlICsgJ3B4JyA6IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdGlmICh2YWx1ZS5tYXRjaCgvaW1wb3J0YW50L2kpKSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHZhbHVlLmluZGV4T2YoJyEnKSAtIDEpLnRyaW0oKTtcclxuXHRcdFx0XHRcdFx0aW1wb3J0YW50ID0gJ2ltcG9ydGFudCc7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKGltcG9ydGFudClcclxuXHRcdFx0XHRcdFx0bm9kZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQpO1xyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRub2RlW2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dHlwZW9mIG5vZGVba2V5XSA9PSAndW5kZWZpbmVkJyA/XHJcblx0XHRcdFx0XHRcdG5vZGUuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpIDpcclxuXHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIiwgImV4cG9ydCBjbGFzcyBUYWJsZU9wdGlvbnMge1xyXG5cdGRhdGEgPSBbXTsgLyogW1xyXG5cdFx0eyBmaWVsZE5hbWUxOiB2YWx1ZSwgZmllbGROYW1lMjogdmFsdWUgfSxcclxuXHRcdHsgZmllbGROYW1lMjogdmFsdWUsIGZpZWxkTmFtZTI6IHZhbHVlIH0sXHJcblx0XHQuLlxyXG5cdF0gKi9cclxuXHRwbGFjZSA9IG51bGw7IC8vIEhUTUxFbGVtZW50XHJcblx0aGVhZGVyID0ge1xyXG5cdFx0aGlkZGVuOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdFx0ZGlzYWJsZWQ6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0fTtcclxuXHRjb2x1bW5zID0gbnVsbDsgLyoge1xyXG5cdFx0ZmllbGROYW1lMTogQ29sdW1uT3B0aW9ucyxcclxuXHRcdGZpZWxkTmFtZTI6IENvbHVtbk9wdGlvbnMsXHJcblx0XHQuLlxyXG5cdH0gKi9cclxuXHRyb3dzID0ge1xyXG5cdFx0c2VsZWN0T25DbGljazogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IHRydWUsIC8vIGJvb2xlYW5cclxuXHR9O1xyXG5cdGNlbGxzID0gbnVsbDsgLyoge1xyXG5cdFx0ZmllbGROYW1lMToge1xyXG5cdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7IHJldHVybi4uIH0sXHJcblx0XHRcdHN0eWxlOiBvYmplY3QsXHJcblx0XHR9LFxyXG5cdFx0ZmllbGROYW1lMjoge1xyXG5cdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7IHJldHVybi4uIH0sXHJcblx0XHRcdHN0eWxlOiBvYmplY3QsXHJcblx0XHR9XHJcblx0XHQuLlxyXG5cdH0gKi9cclxuXHRib3JkZXJzID0ge1xyXG5cdFx0dGFibGU6IHtcclxuXHRcdFx0dG9wOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdFx0XHRib3R0b206IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRcdGFsbDogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdFx0cmFkaXVzOiBudWxsLCAvLyBweFxyXG5cdFx0fSxcclxuXHRcdHJvd3M6IHRydWUsIC8vIGJvb2xlYW5cclxuXHRcdGNlbGxzOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdH07XHJcblx0Zm9vdGVyID0ge1xyXG5cdFx0aGlkZGVuOiB0cnVlLCAvLyBib29sZWFuXHJcblx0XHRkaXNhYmxlZDogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdGNvbnRlbnQ6IG51bGwsIC8vIEhUTUxFbGVtZW50IHwgc3RyaW5nXHJcblx0fTtcclxuXHR3aWR0aCA9IG51bGw7IC8vIG51bWJlclxyXG5cdGhlaWdodCA9IG51bGw7IC8vIG51bWJlclxyXG5cdHN0eWxlID0gbnVsbDsgLy8gb2JqZWN0OiBleC46IHsgY29sb3I6IHJlZCwgJ21pbi13aWR0aCc6IDE1MCB9XHJcblx0Y2hlY2tib3ggPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdHNvcnQgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdHJlc2l6ZSA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGlzYWJsZWQgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdG9uQWRkUm93ID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvblNlbGVjdFJvd3MgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uVW5zZWxlY3RSb3dzID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvblVwZGF0ZVJvdyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25SZW1vdmVSb3dzID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvbkRvdWJsZUNsaWNrUm93ID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvblJlc2l6ZUNvbHVtbiA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25DbGlja091dCA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25Db3B5Q2xpcCA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sdW1uT3B0aW9ucyB7XHJcblx0Ly8gcHJpdmF0ZVxyXG5cdGNoZWNrYm94ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHJcblx0Ly8gcHVibGljXHJcblx0bmFtZSA9IG51bGw7IC8vIHN0cmluZ1xyXG5cdGRpc3BsYXlOYW1lID0gbnVsbDsgLy8gc3RyaW5nXHJcblx0d2lkdGggPSBudWxsOyAvLyBudW1iZXIgfCBzdHJpbmdcclxuXHRtaW5XaWR0aCA9IG51bGw7IC8vIG51bWJlciB8IHN0cmluZ1xyXG5cdHJlc2l6ZSA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0aGlkZGVuID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRkaXNhYmxlZCA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0c3R5bGUgPSBudWxsOyAvLyBvYmplY3Q6IGV4LjogeyBjb2xvcjogcmVkLCAnbWluLXdpZHRoJzogMTUwIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDZWxsT3B0aW9ucyB7XHJcblx0Ly8gcHJpdmF0ZVxyXG5cdHJvdyA9IG51bGw7IC8vIFJvd1xyXG5cdGNoZWNrYm94ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRkYXRhID0gbnVsbDsgLy8gb2JqZWN0XHJcblx0dmFsdWUgPSBudWxsOyAvLyBhbnlcclxuXHJcblx0Ly8gcHVibGljXHJcblx0bmFtZSA9IG51bGw7IC8vIHN0cmluZ1xyXG5cdGhpZGRlbiA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGlzYWJsZWQgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGRpc3BsYXkgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdHN0eWxlID0gbnVsbDsgLy8gb2JqZWN0OiBleC46IHsgY29sb3I6IHJlZCwgJ21pbi13aWR0aCc6IDE1MCB9XHJcbn07XHJcbiIsICJpbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDb2x1bW4odGFibGUsIG9wdGlvbnMpIHtcclxuXHQvLyBvcHRpb25zOiBDb2x1bW5PcHRpb25zXHJcblxyXG5cdGNvbnN0ICRjZWxsID0gY3JlYXRlKCk7XHJcblx0Y29uc3QgX2NlbGwgPSB7XHJcblx0XHRlbGVtZW50OiAkY2VsbCxcclxuXHRcdGlzSGlkZGVuOiBvcHRpb25zLmhpZGRlbixcclxuXHRcdGlzRGlzYWJsZWQ6IG9wdGlvbnMuZGlzYWJsZWQsXHJcblx0XHRvcHRpb25zLFxyXG5cdFx0c2hvdyxcclxuXHRcdGNoZWNrZWQsXHJcblx0XHRkaXNhYmxlLFxyXG5cdH07XHJcblxyXG5cdHNob3coIW9wdGlvbnMuaGlkZGVuKTtcclxuXHRkaXNhYmxlKG9wdGlvbnMuZGlzYWJsZWQpO1xyXG5cclxuXHRyZXR1cm4gX2NlbGw7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnZHQtaGVhZGVyLWNlbGwnKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdjaGVja2JveCcpO1xyXG5cdFx0XHQkY2VsbC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCAvKmh0bWwqL2BcclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJkdC1yb3ctY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAvPlxyXG5cdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdGApO1xyXG5cclxuXHRcdFx0Y29uc3QgJGNoZWNrYm94ID0gJGNlbGwucXVlcnlTZWxlY3RvcignbGFiZWwnKTtcclxuXHJcblx0XHRcdCRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldmVudCA9PiB7XHJcblx0XHRcdFx0ZXZlbnQudGFyZ2V0LmNoZWNrZWQgP1xyXG5cdFx0XHRcdFx0dGFibGUuc2VsZWN0Um93cygpIDpcclxuXHRcdFx0XHRcdHRhYmxlLnVuc2VsZWN0Um93cyhldmVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JGNlbGwuZGF0YXNldC5uYW1lID0gb3B0aW9ucy5uYW1lO1xyXG5cdFx0XHQkY2VsbC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCAvKmh0bWwqL2BcclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJuYW1lXCI+JHtvcHRpb25zLmRpc3BsYXlOYW1lfTwvbGFiZWw+XHJcblx0XHRcdFx0PHNwYW4gY2xhc3M9XCJjb250cm9sc1wiPlxyXG5cdFx0XHRcdFx0PGkgY2xhc3M9XCJzb3J0IGFzY1wiIHRpdGxlPVwiU29ydFwiPjwvaT5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyZXNpemVyXCI+PC9kaXY+XHJcblx0XHRcdFx0PC9zcGFuPlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdGNvbnN0ICRpY29uU29ydCA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy5zb3J0Jyk7XHJcblxyXG5cdFx0XHRpZiAodGFibGUub3B0aW9ucy5zb3J0ICYmIG9wdGlvbnMuc29ydCAhPSBmYWxzZSkge1xyXG5cdFx0XHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ3NvcnRhYmxlJyk7XHJcblxyXG5cdFx0XHRcdCRjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKHRhYmxlLmhlYWRlci5pc0Rpc2FibGVkIHx8IF9jZWxsLmlzRGlzYWJsZWQpXHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdFx0XHR0YWJsZS5oZWFkZXIuY2VsbHMuZm9yRWFjaChjZWxsID0+XHJcblx0XHRcdFx0XHRcdGNlbGwuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzb3J0ZWQnKVxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRsZXQgYXNjZW5kZW50ID0gISgkaWNvblNvcnQuZ2V0QXR0cmlidXRlKCdhc2NlbmRlbnQnKSA9PSAndHJ1ZScpO1xyXG5cclxuXHRcdFx0XHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ3NvcnRlZCcpO1xyXG5cdFx0XHRcdFx0JGljb25Tb3J0LmNsYXNzTGlzdC50b2dnbGUoJ2FzYycsIGFzY2VuZGVudCk7XHJcblx0XHRcdFx0XHQkaWNvblNvcnQuY2xhc3NMaXN0LnRvZ2dsZSgnZGVzYycsICFhc2NlbmRlbnQpO1xyXG5cdFx0XHRcdFx0JGljb25Tb3J0LnNldEF0dHJpYnV0ZSgnYXNjZW5kZW50JywgYXNjZW5kZW50KTtcclxuXHJcblx0XHRcdFx0XHR0YWJsZS5zb3J0KG9wdGlvbnMubmFtZSwgYXNjZW5kZW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMucmVzaXplIHx8IG9wdGlvbnMucmVzaXplKVxyXG5cdFx0XHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ3Jlc2l6YWJsZScpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuc3R5bGUpXHJcblx0XHRcdFx0dXRpbHMuc2V0RWxlbWVudFN0eWxlKCRjZWxsLCBvcHRpb25zLnN0eWxlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5ib3JkZXJzLmNlbGxzKVxyXG5cdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdjZWxsLWJvcmRlci1yaWdodCcpO1xyXG5cclxuXHRcdHJldHVybiAkY2VsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrZWQoY2hlY2tlZCA9IHRydWUpIHtcclxuXHRcdGNvbnN0ICRjaGVja2JveCA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy5kdC1yb3ctY2hlY2tib3ggaW5wdXQnKTtcclxuXHJcblx0XHRpZiAoJGNoZWNrYm94KVxyXG5cdFx0XHQkY2hlY2tib3guY2hlY2tlZCA9IGNoZWNrZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHRfY2VsbC5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0b3B0aW9ucy5oaWRkZW4gPSBfY2VsbC5pc0hpZGRlbjtcclxuXHJcblx0XHQkY2VsbC5jbGFzc0xpc3QudG9nZ2xlKCd2aXNpYmxlJywgc2hvdyk7XHJcblx0XHQkY2VsbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblxyXG5cdFx0dGFibGUuX3NldEJvcmRlcnMoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRfY2VsbC5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblx0XHQkY2VsbC5kYXRhc2V0LmRpc2FibGVkID0gZGlzYWJsZWQ7IC8vIGNvbXBsZW1lbnRhIHN0eWxlLnNjc3NcclxuXHJcblx0XHRBcnJheS5mcm9tKCRjZWxsLmNoaWxkcmVuKS5mb3JFYWNoKCRjaGlsZCA9PlxyXG5cdFx0XHQkY2hpbGQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCBkaXNhYmxlZClcclxuXHRcdCk7XHJcblx0fVxyXG59XHJcbiIsICJpbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgQ29sdW1uT3B0aW9ucyB9IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IENvbHVtbiB9IGZyb20gJy4vQ29sdW1uLmpzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBIZWFkZXIodGFibGUpIHtcclxuXHRjb25zdCBfaGVhZGVyID0ge1xyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGNlbGxzOiBbXSxcclxuXHRcdGlzSGlkZGVuOiBmYWxzZSxcclxuXHRcdGlzRGlzYWJsZWQ6IGZhbHNlLFxyXG5cdFx0Y2VsbCxcclxuXHRcdHNob3csXHJcblx0XHRkaXNhYmxlLFxyXG5cdH07XHJcblx0Y29uc3QgJGhlYWRlciA9IGNyZWF0ZSgpO1xyXG5cclxuXHRyZXR1cm4gX2hlYWRlcjtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRoZWFkZXIuY2xhc3NMaXN0LmFkZCgnZHQtaGVhZGVyJyk7XHJcblxyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0Y29uc3Qgb3B0aW9ucyA9IG5ldyBDb2x1bW5PcHRpb25zKCk7XHJcblxyXG5cdFx0XHRvcHRpb25zLmNoZWNrYm94ID0gdHJ1ZTtcclxuXHRcdFx0b3B0aW9ucy5yZXNpemUgPSBmYWxzZTtcclxuXHJcblx0XHRcdGNvbnN0IGNlbGwgPSBDb2x1bW4odGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X2hlYWRlci5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkaGVhZGVyLmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChjb25zdCBuYW1lIGluIHRhYmxlLm9wdGlvbnMuY29sdW1ucykge1xyXG5cdFx0XHRjb25zdCBjb2x1bW4gPSB0YWJsZS5vcHRpb25zLmNvbHVtbnNbbmFtZV07XHJcblx0XHRcdGNvbnN0IG9wdGlvbnMgPSB1dGlscy5tZXJnZVByb3BzKG5ldyBDb2x1bW5PcHRpb25zKCksIGNvbHVtbik7XHJcblxyXG5cdFx0XHRvcHRpb25zLm5hbWUgPSBuYW1lO1xyXG5cclxuXHRcdFx0Y29uc3QgY2VsbCA9IENvbHVtbih0YWJsZSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRfaGVhZGVyLmNlbGxzLnB1c2goY2VsbCk7XHJcblx0XHRcdCRoZWFkZXIuYXBwZW5kQ2hpbGQoY2VsbC5lbGVtZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRfaGVhZGVyLmVsZW1lbnQgPSAkaGVhZGVyO1xyXG5cclxuXHRcdHJldHVybiAkaGVhZGVyO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2VsbChuYW1lT3JJbmRleCkge1xyXG5cdFx0Y29uc3QgY2VsbCA9IHR5cGVvZiBuYW1lT3JJbmRleCA9PSAnbnVtYmVyJyA/XHJcblx0XHRcdF9oZWFkZXIuY2VsbHNbbmFtZU9ySW5kZXhdIDpcclxuXHRcdFx0X2hlYWRlci5jZWxscy5maW5kKGNlbGwgPT4gY2VsbC5vcHRpb25zLm5hbWUgPT0gbmFtZU9ySW5kZXgpO1xyXG5cclxuXHRcdHJldHVybiBjZWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2hlYWRlci5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0JGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2hlYWRlci5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblxyXG5cdFx0QXJyYXkuZnJvbSgkaGVhZGVyLmNoaWxkcmVuKS5mb3JFYWNoKCRjaGlsZCA9PiB7XHJcblx0XHRcdCRjaGlsZC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGRpc2FibGVkKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ2VsbCh0YWJsZSwgb3B0aW9ucykge1xyXG5cdC8vIG9wdGlvbnM6IENlbGxPcHRpb25zXHJcblxyXG5cdGNvbnN0ICRjZWxsID0gY3JlYXRlKCk7XHJcblx0Y29uc3QgX2NlbGwgPSB7XHJcblx0XHRlbGVtZW50OiAkY2VsbCxcclxuXHRcdGlzSGlkZGVuOiBvcHRpb25zLmhpZGRlbixcclxuXHRcdGlzRGlzYWJsZWQ6IG9wdGlvbnMuZGlzYWJsZWQsXHJcblx0XHRvcHRpb25zLFxyXG5cdFx0dmFsdWUsXHJcblx0XHRkaXNwbGF5LFxyXG5cdFx0Y2hlY2tlZCxcclxuXHRcdHNob3csXHJcblx0XHRzaG93Q29udGVudCxcclxuXHRcdGRpc2FibGUsXHJcblx0fTtcclxuXHJcblx0c2hvdyghb3B0aW9ucy5oaWRkZW4pO1xyXG5cdHNob3dDb250ZW50KCFvcHRpb25zLmhpZGRlbik7XHJcblx0ZGlzcGxheSh2YWx1ZSgpKTtcclxuXHJcblx0cmV0dXJuIF9jZWxsO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ2R0LWJvZHktcm93LWNlbGwnKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdjaGVja2JveCcpO1xyXG5cdFx0XHQkY2VsbC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCAvKmh0bWwqL2BcclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJkdC1yb3ctY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIi8+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0YCk7XHJcblxyXG5cdFx0XHRjb25zdCAkY2hlY2tib3ggPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCdsYWJlbCcpO1xyXG5cclxuXHRcdFx0JGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xyXG5cdFx0XHQkY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4ge1xyXG5cdFx0XHRcdHRhYmxlLmhlYWRlci5jZWxsc1swXS5jaGVja2VkKGZhbHNlKTtcclxuXHRcdFx0XHRvcHRpb25zLnJvdy5zZWxlY3QoZXZlbnQudGFyZ2V0LmNoZWNrZWQsIGV2ZW50KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCB2YWx1ZSA9IG9wdGlvbnMudmFsdWUgIT0gdW5kZWZpbmVkID8gb3B0aW9ucy52YWx1ZSA6ICcnO1xyXG5cdFx0XHRjb25zdCBjZWxsID0gdGFibGUub3B0aW9ucy5jZWxscyA/IHRhYmxlLm9wdGlvbnMuY2VsbHNbb3B0aW9ucy5uYW1lXSB8fCB7fSA6IHt9O1xyXG5cclxuXHRcdFx0JGNlbGwuZGF0YXNldC5uYW1lID0gb3B0aW9ucy5uYW1lO1xyXG5cdFx0XHQkY2VsbC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCAvKmh0bWwqL2BcclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidmFsdWUtaGlkZGVuXCI+JHt2YWx1ZX08L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidmFsdWUtZGlzcGxheVwiPiR7dmFsdWV9PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cclxuXHRcdFx0aWYgKGNlbGwuc3R5bGUpXHJcblx0XHRcdFx0dXRpbHMuc2V0RWxlbWVudFN0eWxlKCRjZWxsLCBjZWxsLnN0eWxlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5ib3JkZXJzLmNlbGxzKVxyXG5cdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdjZWxsLWJvcmRlci1yaWdodCcpO1xyXG5cclxuXHRcdGlmICh0YWJsZS5vcHRpb25zLmJvcmRlcnMucm93cylcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2VsbC1ib3JkZXItYm90dG9tJyk7XHJcblxyXG5cdFx0cmV0dXJuICRjZWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmFsdWUodmFsdWUpIHtcclxuXHRcdGNvbnN0ICR2YWx1ZSA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy52YWx1ZS1oaWRkZW4nKTtcclxuXHJcblx0XHRpZiAoISR2YWx1ZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpIHtcclxuXHRcdFx0b3B0aW9ucy5kYXRhW29wdGlvbnMubmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0JHZhbHVlLnZhbHVlID0gdmFsdWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2YWx1ZSA9IG9wdGlvbnMudmFsdWUgIT0gdW5kZWZpbmVkID8gb3B0aW9ucy52YWx1ZSA6ICR2YWx1ZS52YWx1ZTtcclxuXHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc3BsYXkodmFsdWUpIHtcclxuXHRcdGNvbnN0ICRkaXNwbGF5ID0gJGNlbGwucXVlcnlTZWxlY3RvcignLnZhbHVlLWRpc3BsYXknKTtcclxuXHRcdGNvbnN0IGNlbGwgPSB0YWJsZS5vcHRpb25zLmNlbGxzID8gdGFibGUub3B0aW9ucy5jZWxsc1tvcHRpb25zLm5hbWVdIHx8IHt9IDoge307XHJcblxyXG5cdFx0aWYgKGNlbGwuZGlzcGxheSkge1xyXG5cdFx0XHR2YWx1ZSA9IGNlbGwuZGlzcGxheSh7IGl0ZW06IG9wdGlvbnMuZGF0YSwgdmFsdWUgfSk7XHJcblx0XHRcdCRkaXNwbGF5LmlubmVySFRNTCA9ICcnO1xyXG5cclxuXHRcdFx0aWYgKHZhbHVlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuXHRcdFx0XHQkZGlzcGxheS5hcHBlbmRDaGlsZCh2YWx1ZSk7XHJcblx0XHRcdH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheU9mSFRNTEVsZW1lbnQodmFsdWUpKSB7XHJcblx0XHRcdFx0dmFsdWUuZm9yRWFjaCh4ID0+ICRkaXNwbGF5LmFwcGVuZENoaWxkKHgpKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkZGlzcGxheS5pbm5lckhUTUwgPSB2YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNIaWRkZW4gPSAhc2hvdztcclxuXHJcblx0XHQkY2VsbC5jbGFzc0xpc3QudG9nZ2xlKCd2aXNpYmxlJywgc2hvdyk7XHJcblx0XHQkY2VsbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93Q29udGVudChzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNIaWRkZW4gPSAhc2hvdztcclxuXHJcblx0XHRBcnJheS5mcm9tKCRjZWxsLmNoaWxkcmVuKS5mb3JFYWNoKCRjaGlsZCA9PiB7XHJcblx0XHRcdCRjaGlsZC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrZWQoY2hlY2tlZCA9IHRydWUpIHtcclxuXHRcdGNvbnN0ICRjaGVja2JveCA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy5kdC1yb3ctY2hlY2tib3ggaW5wdXQnKTtcclxuXHJcblx0XHRpZiAoJGNoZWNrYm94KVxyXG5cdFx0XHQkY2hlY2tib3guY2hlY2tlZCA9IGNoZWNrZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cclxuXHRcdEFycmF5LmZyb20oJGNlbGwuY2hpbGRyZW4pLmZvckVhY2goJGNoaWxkID0+IHtcclxuXHRcdFx0JGNoaWxkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbiIsICJpbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgQ2VsbE9wdGlvbnMgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBDZWxsIH0gZnJvbSAnLi9DZWxsLmpzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBSb3codGFibGUsIG9wdGlvbnMpIHtcclxuXHRjb25zdCBfcm93ID0ge1xyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGlkOiB1dGlscy5nZW5lcmF0ZUd1aWQoKSxcclxuXHRcdGNlbGxzOiBbXSxcclxuXHRcdGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG5cdFx0aXNIaWRkZW46IGZhbHNlLFxyXG5cdFx0aXNEaXNhYmxlZDogZmFsc2UsXHJcblx0XHRfZGF0YTogb3B0aW9ucy5kYXRhIHx8IHt9LCAvLyBpbnRlcm5vXHJcblx0XHRkYXRhLFxyXG5cdFx0Y2VsbCxcclxuXHRcdGluZGV4LFxyXG5cdFx0c2hvdyxcclxuXHRcdGRpc2FibGUsXHJcblx0XHRzZWxlY3QsXHJcblx0XHR0ZXh0LFxyXG5cdFx0cmVtb3ZlLFxyXG5cdH07XHJcblx0Y29uc3QgJHJvdyA9IGNyZWF0ZSgpO1xyXG5cclxuXHRfbG9hZENlbGxzKCk7XHJcblxyXG5cdHJldHVybiBfcm93O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0JHJvdy5pZCA9IF9yb3cuaWQ7XHJcblx0XHQkcm93LmNsYXNzTGlzdC5hZGQoJ2R0LWJvZHktcm93Jyk7XHJcblx0XHQkcm93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xyXG5cdFx0XHRpZiAoIXRhYmxlLm9wdGlvbnMuY2hlY2tib3ggJiYgdGFibGUub3B0aW9ucy5yb3dzLnNlbGVjdE9uQ2xpY2spXHJcblx0XHRcdFx0c2VsZWN0KHRydWUsIGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0JHJvdy5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0aWYgKCF0YWJsZS5vcHRpb25zLnJvd3Muc2VsZWN0T25DbGljaylcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHQvLyBpbXBlZGUgcXVlIG8gdGV4dG8gc2VqYSBzZWxlY2lvbmFkb1xyXG5cdFx0XHRpZiAod2luZG93LmdldFNlbGVjdGlvbilcclxuXHRcdFx0XHR3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcblxyXG5cdFx0XHRpZiAodGFibGUub3B0aW9ucy5vbkRvdWJsZUNsaWNrUm93KVxyXG5cdFx0XHRcdHRhYmxlLm9wdGlvbnMub25Eb3VibGVDbGlja1Jvdyh7IHJvdzogX3JvdywgZXZlbnQgfSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkcm93LmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGFibGUnLCB0YWJsZS5vcHRpb25zLnJvd3Muc2VsZWN0T25DbGljayk7XHJcblxyXG5cdFx0X3Jvdy5lbGVtZW50ID0gJHJvdztcclxuXHJcblx0XHRyZXR1cm4gJHJvdztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9sb2FkQ2VsbHMoKSB7XHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHRjb25zdCBvcHRpb25zID0gbmV3IENlbGxPcHRpb25zKCk7XHJcblxyXG5cdFx0XHRvcHRpb25zLnJvdyA9IF9yb3c7XHJcblx0XHRcdG9wdGlvbnMuY2hlY2tib3ggPSB0cnVlO1xyXG5cdFx0XHRvcHRpb25zLnJlc2l6ZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0Y29uc3QgY2VsbCA9IENlbGwodGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X3Jvdy5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkcm93LmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChjb25zdCBuYW1lIGluIHRhYmxlLm9wdGlvbnMuY29sdW1ucykge1xyXG5cdFx0XHRjb25zdCBjb2x1bW4gPSB0YWJsZS5vcHRpb25zLmNvbHVtbnNbbmFtZV07XHJcblx0XHRcdGNvbnN0IG9wdGlvbnMgPSB1dGlscy5tZXJnZVByb3BzKG5ldyBDZWxsT3B0aW9ucygpLCBjb2x1bW4pO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5uYW1lID0gbmFtZTtcclxuXHRcdFx0b3B0aW9ucy5kYXRhID0gX3Jvdy5fZGF0YTtcclxuXHRcdFx0b3B0aW9ucy52YWx1ZSA9IF9yb3cuX2RhdGFbbmFtZV07XHJcblxyXG5cdFx0XHRjb25zdCBjZWxsID0gQ2VsbCh0YWJsZSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRfcm93LmNlbGxzLnB1c2goY2VsbCk7XHJcblx0XHRcdCRyb3cuYXBwZW5kQ2hpbGQoY2VsbC5lbGVtZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNlbGwobmFtZU9ySW5kZXgpIHtcclxuXHRcdC8vIFJldG9ybmEgYSBjXHUwMEU5bHVsYSBwZWxvIG5vbWUgb3UgcGVsbyBcdTAwRURuZGljZS5cclxuXHJcblx0XHRjb25zdCBjZWxsID0gdHlwZW9mIG5hbWVPckluZGV4ID09ICdudW1iZXInID9cclxuXHRcdFx0X3Jvdy5jZWxsc1tuYW1lT3JJbmRleF0gOlxyXG5cdFx0XHRfcm93LmNlbGxzLmZpbmQoY2VsbCA9PiBjZWxsLm9wdGlvbnMubmFtZSA9PSBuYW1lT3JJbmRleCk7XHJcblxyXG5cdFx0cmV0dXJuIGNlbGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpbmRleCgpIHtcclxuXHRcdHJldHVybiB1dGlscy5nZXRFbGVtZW50SW5kZXgoJHJvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHRfcm93LmlzSGlkZGVuID0gIXNob3c7XHJcblx0XHQkcm93LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFzaG93KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRfcm93LmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHRcdCRyb3cuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZWxlY3Qoc2VsZWN0ZWQgPSB0cnVlLCBldmVudCkge1xyXG5cdFx0Ly8gaW1wZWRlIHF1ZSBvIHRleHRvIHNlamEgc2VsZWNpb25hZG8gY29tIHNoaWZ0XHJcblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQuc2hpZnRLZXkgJiYgd2luZG93LmdldFNlbGVjdGlvbilcclxuXHRcdFx0d2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xyXG5cclxuXHRcdGlmICh0YWJsZS5vcHRpb25zLmNoZWNrYm94KSB7XHJcblx0XHRcdF9yb3cuaXNTZWxlY3RlZCA9IHNlbGVjdGVkO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMub25TZWxlY3RSb3dzKVxyXG5cdFx0XHRcdHRhYmxlLm9wdGlvbnMub25TZWxlY3RSb3dzKHsgcm93czogdGFibGUuc2VsZWN0ZWRSb3dzKCkgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0IXRhYmxlLm9wdGlvbnMucm93cy5hbGxvd011bHRpcGxlU2VsZWN0aW9uIHx8XHJcblx0XHRcdFx0IWV2ZW50IHx8XHJcblx0XHRcdFx0KCFldmVudC5jdHJsS2V5ICYmICFldmVudC5zaGlmdEtleSlcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0dGFibGUudW5zZWxlY3RSb3dzKGV2ZW50LCBmYWxzZSk7XHJcblx0XHRcdFx0dGFibGUuX2xhc3RSb3dTZWxlY3RlZCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChldmVudCAmJiBldmVudC5jdHJsS2V5KSB7XHJcblx0XHRcdFx0Ly8gaW52ZXJ0ZSBhIHNlbGVcdTAwRTdcdTAwRTNvIGNvbSBDVFJMIHByZXNzaW9uYWRvXHJcblx0XHRcdFx0c2VsZWN0ZWQgPSAhX3Jvdy5pc1NlbGVjdGVkO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoZXZlbnQgJiYgZXZlbnQuc2hpZnRLZXkgJiYgdGFibGUuX2xhc3RSb3dTZWxlY3RlZCkge1xyXG5cdFx0XHRcdGxldCBpbmRleGVzID0gdXRpbHMuY3JlYXRlUmFuZ2VBcnJheSh1dGlscy5nZXRFbGVtZW50SW5kZXgodGFibGUuX2xhc3RSb3dTZWxlY3RlZCksIHV0aWxzLmdldEVsZW1lbnRJbmRleCgkcm93KSk7XHJcblxyXG5cdFx0XHRcdHRhYmxlLnNlbGVjdFJvd3MoaW5kZXhlcyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9yb3cuaXNTZWxlY3RlZCA9IHNlbGVjdGVkO1xyXG5cclxuXHRcdFx0aWYgKCFldmVudCB8fCAhZXZlbnQuc2hpZnRLZXkpXHJcblx0XHRcdFx0dGFibGUuX2xhc3RSb3dTZWxlY3RlZCA9ICRyb3c7XHJcblxyXG5cdFx0XHQkcm93LmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJywgc2VsZWN0ZWQpO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMub25TZWxlY3RSb3dzKVxyXG5cdFx0XHRcdHRhYmxlLm9wdGlvbnMub25TZWxlY3RSb3dzKHsgcm93czogdGFibGUuc2VsZWN0ZWRSb3dzKCkgfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkYXRhKGZpZWxkcywgbWV0YSA9IGZhbHNlKSB7XHJcblx0XHRpZiAoZmllbGRzKSB7XHJcblx0XHRcdGZvciAoY29uc3QgbmFtZSBpbiBmaWVsZHMpIHtcclxuXHRcdFx0XHRsZXQgdmFsdWUgPSBmaWVsZHNbbmFtZV07XHJcblx0XHRcdFx0bGV0IGNlbGwgPSBfcm93LmNlbGwobmFtZSk7XHJcblxyXG5cdFx0XHRcdGNlbGwudmFsdWUodmFsdWUpO1xyXG5cdFx0XHRcdGNlbGwuZGlzcGxheSh2YWx1ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLm9uVXBkYXRlUm93KVxyXG5cdFx0XHRcdHRhYmxlLm9wdGlvbnMub25VcGRhdGVSb3coeyByb3c6IF9yb3csIGZpZWxkcyB9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHJlbW92ZSBhIHByb3ByaWVkYWRlIG1ldGFcclxuXHRcdFx0aWYgKCFtZXRhKVxyXG5cdFx0XHRcdHJldHVybiAoKHsgbWV0YSwgLi4uZGF0YSB9KSA9PiBkYXRhKShfcm93Ll9kYXRhKTtcclxuXHJcblx0XHRcdHJldHVybiBfcm93Ll9kYXRhO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGV4dChmaWVsZE5hbWVzKSB7XHJcblx0XHRsZXQgY2VsbHMgPSBmaWVsZE5hbWVzID8gX3Jvdy5jZWxscy5maWx0ZXIoeCA9PiAhIWZpZWxkTmFtZXMuZmluZChuYW1lID0+IG5hbWUgPT0geC5vcHRpb25zLm5hbWUpKSA6IF9yb3cuY2VsbHM7XHJcblx0XHRsZXQgdGV4dCA9IFtdO1xyXG5cclxuXHRcdGNlbGxzLmZvckVhY2goY2VsbCA9PlxyXG5cdFx0XHR0ZXh0LnB1c2goY2VsbC5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy52YWx1ZS1kaXNwbGF5JykuaW5uZXJUZXh0LnRyaW0oKSlcclxuXHRcdCk7XHJcblxyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmUoKSB7XHJcblx0XHR0YWJsZS5yZW1vdmVSb3dzKF9yb3cpO1xyXG5cdH1cclxufVxyXG4iLCAiZXhwb3J0IGZ1bmN0aW9uIEZvb3Rlcih0YWJsZSkge1xyXG5cdGNvbnN0ICRmb290ZXIgPSBjcmVhdGUoKTtcclxuXHRjb25zdCBfZm9vdGVyID0ge1xyXG5cdFx0ZWxlbWVudDogJGZvb3RlcixcclxuXHRcdGlzSGlkZGVuOiB0YWJsZS5vcHRpb25zLmZvb3Rlci5oaWRkZW4sXHJcblx0XHRpc0Rpc2FibGVkOiB0YWJsZS5vcHRpb25zLmZvb3Rlci5kaXNhYmxlZCxcclxuXHRcdHNob3csXHJcblx0XHRkaXNhYmxlLFxyXG5cdFx0Y29udGVudCxcclxuXHR9O1xyXG5cclxuXHRjb250ZW50KHRhYmxlLm9wdGlvbnMuZm9vdGVyLmNvbnRlbnQpO1xyXG5cdHNob3coIV9mb290ZXIuaXNIaWRkZW4pO1xyXG5cclxuXHRyZXR1cm4gX2Zvb3RlcjtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJGZvb3RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRmb290ZXIuY2xhc3NMaXN0LmFkZCgnZHQtZm9vdGVyJyk7XHJcblxyXG5cdFx0cmV0dXJuICRmb290ZXI7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb250ZW50KGNvbnRlbnQpIHtcclxuXHRcdGlmIChjb250ZW50KVxyXG5cdFx0XHQkZm9vdGVyLmlubmVySFRNTCA9IGNvbnRlbnQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHRfZm9vdGVyLmlzSGlkZGVuID0gIXNob3c7XHJcblx0XHQkZm9vdGVyLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFzaG93KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRfZm9vdGVyLmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHRcdCRmb290ZXIuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XHJcblx0fVxyXG59XHJcbiIsICJpbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSAnLi9IZWFkZXIuanMnO1xyXG5pbXBvcnQgeyBSb3cgfSBmcm9tICcuL1Jvdy5qcyc7XHJcbmltcG9ydCB7IEZvb3RlciB9IGZyb20gJy4vRm9vdGVyLmpzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBUYWJsZShvcHRpb25zKSB7XHJcblx0Y29uc3QgX3RhYmxlID0ge1xyXG5cdFx0b3B0aW9ucyxcclxuXHRcdGlkOiBvcHRpb25zLmlkID8gJ2R0LScgKyBvcHRpb25zLmlkIDogdXRpbHMuZ2VuZXJhdGVHdWlkKCksXHJcblx0XHRlbGVtZW50OiBudWxsLFxyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0c2Nyb2xsYWJsZTogbnVsbCxcclxuXHRcdH0sXHJcblx0XHRoZWFkZXI6IG51bGwsXHJcblx0XHRib2R5OiB7XHJcblx0XHRcdGVsZW1lbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0X2NvbHVtbldpZHRoczogbnVsbCxcclxuXHRcdHJvd3M6IFtdLFxyXG5cdFx0X2xhc3RSb3dTZWxlY3RlZDogbnVsbCxcclxuXHRcdGZvb3RlcjogbnVsbCxcclxuXHRcdGlzRGlzYWJsZWQ6IGZhbHNlLFxyXG5cdFx0X2RhdGE6IG9wdGlvbnMuZGF0YSB8fCBbXSxcclxuXHRcdGRhdGEsXHJcblx0XHRsb2FkLFxyXG5cdFx0cmVsb2FkLFxyXG5cdFx0d2lkdGgsXHJcblx0XHRoZWlnaHQsXHJcblx0XHRjb2x1bW4sXHJcblx0XHRhZGRSb3csXHJcblx0XHRzZWxlY3RlZFJvd3MsXHJcblx0XHRzZWxlY3RSb3dzLFxyXG5cdFx0dW5zZWxlY3RSb3dzLFxyXG5cdFx0cm93c0J5RmllbGRWYWx1ZSxcclxuXHRcdG1vdmVTZWxlY3RlZFJvd3MsXHJcblx0XHRyZW1vdmVSb3dzLFxyXG5cdFx0cmVtb3ZlU2VsZWN0ZWRSb3dzLFxyXG5cdFx0c29ydCxcclxuXHRcdGRpc2FibGUsXHJcblx0XHRjbGVhcixcclxuXHRcdGV4cG9ydDogX2V4cG9ydCxcclxuXHRcdF9zZXRCb3JkZXJzLFxyXG5cdH07XHJcblx0Y29uc3QgJHRhYmxlID0gY3JlYXRlKCk7XHJcblx0Y29uc3Qga2V5X3N0b3JlZFdpZHRocyA9IGAke190YWJsZS5pZH0td2lkdGhzYDtcclxuXHJcblx0Y3JlYXRlSGVhZGVyKCk7XHJcblx0Y3JlYXRlQm9keSgpO1xyXG5cdGNyZWF0ZUZvb3RlcigpO1xyXG5cdHdpZHRoKG9wdGlvbnMud2lkdGgpO1xyXG5cdGhlaWdodChvcHRpb25zLmhlaWdodCk7XHJcblx0ZGlzYWJsZShvcHRpb25zLmRpc2FibGVkKTtcclxuXHRsb2FkKG9wdGlvbnMuZGF0YSk7XHJcblxyXG5cdHJldHVybiBfdGFibGU7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICR0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCR0YWJsZS5pZCA9IF90YWJsZS5pZDtcclxuXHRcdCR0YWJsZS5jbGFzc0xpc3QuYWRkKCdkdCcpO1xyXG5cclxuXHRcdGNvbnN0ICRzY3JvbGxhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0JHNjcm9sbGFibGUuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsYWJsZScpO1xyXG5cdFx0JHRhYmxlLmFwcGVuZENoaWxkKCRzY3JvbGxhYmxlKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5ib3JkZXJzLnRhYmxlLmFsbCkge1xyXG5cdFx0XHQkdGFibGUuY2xhc3NMaXN0LmFkZCgndGFibGUtYm9yZGVyLWFsbCcpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS5yYWRpdXMgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGxldCByYWRpdXMgPSBvcHRpb25zLmJvcmRlcnMudGFibGUucmFkaXVzO1xyXG5cclxuXHRcdFx0XHQkdGFibGUuc3R5bGUuYm9yZGVyUmFkaXVzID0gdXRpbHMucGFyc2VEaW1lbnNpb24ocmFkaXVzKTtcclxuXHRcdFx0XHQkc2Nyb2xsYWJsZS5zdHlsZS5ib3JkZXJSYWRpdXMgPSB1dGlscy5wYXJzZURpbWVuc2lvbihyYWRpdXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAob3B0aW9ucy5ib3JkZXJzLnRhYmxlLnRvcClcclxuXHRcdFx0XHQkdGFibGUuY2xhc3NMaXN0LmFkZCgndGFibGUtYm9yZGVyLXRvcCcpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS5ib3R0b20pXHJcblx0XHRcdFx0JHRhYmxlLmNsYXNzTGlzdC5hZGQoJ3RhYmxlLWJvcmRlci1ib3R0b20nKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5zdHlsZSlcclxuXHRcdFx0dXRpbHMuc2V0RWxlbWVudFN0eWxlKCR0YWJsZSwgb3B0aW9ucy5zdHlsZSk7XHJcblxyXG5cdFx0X3RhYmxlLmVsZW1lbnQgPSAkdGFibGU7XHJcblx0XHRfdGFibGUuZWxlbWVudHMuc2Nyb2xsYWJsZSA9ICRzY3JvbGxhYmxlO1xyXG5cclxuXHRcdHJldHVybiAkdGFibGU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVIZWFkZXIoKSB7XHJcblx0XHRjb25zdCBoZWFkZXIgPSBIZWFkZXIoX3RhYmxlKTtcclxuXHJcblx0XHRfdGFibGUuaGVhZGVyID0gaGVhZGVyO1xyXG5cclxuXHRcdCR0YWJsZS5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsYWJsZScpLmFwcGVuZENoaWxkKGhlYWRlci5lbGVtZW50KTtcclxuXHRcdGhlYWRlci5zaG93KCFvcHRpb25zLmhlYWRlci5oaWRkZW4pO1xyXG5cdFx0aGVhZGVyLmRpc2FibGUob3B0aW9ucy5oZWFkZXIuZGlzYWJsZWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlQm9keSgpIHtcclxuXHRcdGNvbnN0ICRib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0JGJvZHkuY2xhc3NMaXN0LmFkZCgnZHQtYm9keScpO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudCA9ICRib2R5O1xyXG5cclxuXHRcdCR0YWJsZS5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsYWJsZScpLmFwcGVuZENoaWxkKCRib2R5KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUZvb3RlcigpIHtcclxuXHRcdGlmIChvcHRpb25zLmZvb3Rlcikge1xyXG5cdFx0XHRjb25zdCBmb290ZXIgPSBGb290ZXIoX3RhYmxlKTtcclxuXHJcblx0XHRcdF90YWJsZS5mb290ZXIgPSBmb290ZXI7XHJcblx0XHRcdCR0YWJsZS5hcHBlbmRDaGlsZChmb290ZXIuZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb2x1bW4obmFtZU9ySW5kZXgpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNob3csXHJcblx0XHRcdGRpc2FibGUsXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIHNob3coc2hvdyA9IHRydWUpIHtcclxuXHRcdFx0X3RhYmxlLmhlYWRlci5jZWxsKG5hbWVPckluZGV4KS5zaG93KHNob3cpO1xyXG5cdFx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiByb3cuY2VsbChuYW1lT3JJbmRleCkuc2hvdyhzaG93KSk7XHJcblxyXG5cdFx0XHRfc2V0Q29sdW1uV2lkdGhzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlZCA9IHRydWUpIHtcclxuXHRcdFx0X3RhYmxlLmhlYWRlci5jZWxsKG5hbWVPckluZGV4KS5kaXNhYmxlKGRpc2FibGVkKTtcclxuXHRcdFx0X3RhYmxlLnJvd3MuZm9yRWFjaChyb3cgPT4gcm93LmNlbGwobmFtZU9ySW5kZXgpLmRpc2FibGUoZGlzYWJsZWQpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHdpZHRoKHdpZHRoKSB7XHJcblx0XHRpZiAod2lkdGggPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRyZXR1cm4gJHRhYmxlLmNsaWVudFdpZHRoO1xyXG5cclxuXHRcdCR0YWJsZS5zdHlsZS53aWR0aCA9IHV0aWxzLnBhcnNlRGltZW5zaW9uKHdpZHRoKSB8fCAnYXV0byc7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoZWlnaHQoaGVpZ2h0KSB7XHJcblx0XHRpZiAoaGVpZ2h0ID09IHVuZGVmaW5lZClcclxuXHRcdFx0cmV0dXJuICR0YWJsZS5jbGllbnRIZWlnaHQ7XHJcblxyXG5cdFx0JHRhYmxlLnN0eWxlLmhlaWdodCA9IHV0aWxzLnBhcnNlRGltZW5zaW9uKGhlaWdodCkgfHwgJ2F1dG8nO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGF0YShkYXRhLCBtZXRhID0gZmFsc2UpIHtcclxuXHRcdF90YWJsZS5fZGF0YSA9IGRhdGEgfHwgX3RhYmxlLl9kYXRhO1xyXG5cclxuXHRcdC8vIHJlbW92ZSBhIHByb3ByaWVkYWRlIG1ldGFcclxuXHRcdGlmICghbWV0YSlcclxuXHRcdFx0cmV0dXJuIF90YWJsZS5fZGF0YS5tYXAoKHsgbWV0YSwgLi4uaXRlbSB9KSA9PiBpdGVtKTtcclxuXHJcblx0XHRyZXR1cm4gX3RhYmxlLl9kYXRhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbG9hZChfZGF0YSkge1xyXG5cdFx0Y2xlYXIoISFfZGF0YSk7XHJcblxyXG5cdFx0ZGF0YShfZGF0YSwgdHJ1ZSkuZm9yRWFjaChpdGVtID0+XHJcblx0XHRcdGFkZFJvdyhpdGVtLCBmYWxzZSwgZmFsc2UpXHJcblx0XHQpO1xyXG5cclxuXHRcdF9zZXRDb2x1bW5XaWR0aHMoKTtcclxuXHRcdF9zZXRDb2x1bW5SZXNpemFibGUoKTtcclxuXHRcdF9zZXRCb3JkZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZWxvYWQoKSB7XHJcblx0XHRsb2FkKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjbGVhcihjbGVhckRhdGEgPSB0cnVlKSB7XHJcblx0XHRpZiAoY2xlYXJEYXRhKVxyXG5cdFx0XHRkYXRhKFtdKTtcclxuXHJcblx0XHRfdGFibGUucm93cyA9IFtdO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuXHRcdF90YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRSb3coZGF0YSwgaW5zZXJ0ID0gdHJ1ZSwgc2V0Qm9yZGVycyA9IHRydWUpIHtcclxuXHRcdGNvbnN0IHJvdyA9IFJvdyhfdGFibGUsIHsgZGF0YSB9KTtcclxuXHJcblx0XHRfdGFibGUucm93cy5wdXNoKHJvdyk7XHJcblx0XHRfdGFibGUuYm9keS5lbGVtZW50LmFwcGVuZENoaWxkKHJvdy5lbGVtZW50KTtcclxuXHJcblx0XHRkYXRhLm1ldGEgPSB7XHJcblx0XHRcdHJvdzoge1xyXG5cdFx0XHRcdGlkOiByb3cuaWQsXHJcblx0XHRcdH0sXHJcblx0XHR9O1xyXG5cclxuXHRcdGlmIChpbnNlcnQpXHJcblx0XHRcdF90YWJsZS5fZGF0YS5wdXNoKGRhdGEpO1xyXG5cclxuXHRcdGlmIChzZXRCb3JkZXJzKVxyXG5cdFx0XHRfc2V0Qm9yZGVycygpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLm9uQWRkUm93KVxyXG5cdFx0XHRvcHRpb25zLm9uQWRkUm93KHsgcm93IH0pO1xyXG5cclxuXHRcdHJldHVybiByb3c7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZWxlY3RlZFJvd3MoKSB7XHJcblx0XHRyZXR1cm4gX3RhYmxlLnJvd3MuZmlsdGVyKHggPT4geC5pc1NlbGVjdGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJvd3NCeUZpZWxkVmFsdWUoZmllbGROYW1lLCB2YWx1ZSkge1xyXG5cdFx0aWYgKGZpZWxkTmFtZSA9PSB1bmRlZmluZWQgfHwgdmFsdWUgPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0cmV0dXJuIF90YWJsZS5yb3dzLmZpbHRlcihyb3cgPT5cclxuXHRcdFx0cm93Ll9kYXRhW2ZpZWxkTmFtZV0gPT0gdmFsdWVcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZWxlY3RSb3dzKGluZGV4ZXMpIHtcclxuXHRcdC8vIFNlbGVjaW9uYSB0b2RhcyBhcyBsaW5oYXMgb3UgYXBlbmFzIGFzIGVzcGVjaWZpY2FkYXMuXHJcblxyXG5cdFx0aWYgKGluZGV4ZXMpXHJcblx0XHRcdGluZGV4ZXMgPSBpbmRleGVzIGluc3RhbmNlb2YgQXJyYXkgPyBpbmRleGVzIDogW2luZGV4ZXNdO1xyXG5cclxuXHRcdF90YWJsZS5yb3dzLmZvckVhY2gocm93ID0+IHtcclxuXHRcdFx0bGV0IHNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG5cdFx0XHRpZiAoaW5kZXhlcykge1xyXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZXhlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKHV0aWxzLmdldEVsZW1lbnRJbmRleChyb3cuZWxlbWVudCkgPT0gaW5kZXhlc1tpXSkge1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzZWxlY3RlZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJvdy5pc1NlbGVjdGVkID0gc2VsZWN0ZWQ7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHRcdHJvdy5jZWxsc1swXS5jaGVja2VkKHNlbGVjdGVkKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyb3cuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsIHNlbGVjdGVkKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpXHJcblx0XHRcdF90YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZCgpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLm9uU2VsZWN0Um93cylcclxuXHRcdFx0b3B0aW9ucy5vblNlbGVjdFJvd3MoeyByb3dzOiBzZWxlY3RlZFJvd3MoKSB9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVuc2VsZWN0Um93cyhldmVudCwgY2FsbGJhY2sgPSB0cnVlKSB7XHJcblx0XHQvLyBEZXNzZWxlY2lvbmEgdG9kYXMgYXMgbGluaGFzLlxyXG5cclxuXHRcdF90YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblxyXG5cdFx0c2VsZWN0ZWRSb3dzKCkuZm9yRWFjaChyb3cgPT4ge1xyXG5cdFx0XHRyb3cuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHRyb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRyb3cuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vblVuc2VsZWN0Um93cyAmJiBjYWxsYmFjaylcclxuXHRcdFx0b3B0aW9ucy5vblVuc2VsZWN0Um93cyh7IGV2ZW50IH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbW92ZVNlbGVjdGVkUm93cyhkb3duID0gdHJ1ZSkge1xyXG5cdFx0aWYgKG9wdGlvbnMuc29ydCkgcmV0dXJuO1xyXG5cclxuXHRcdGlmIChkb3duKSB7XHJcblx0XHRcdGZvciAobGV0IGkgPSBfdGFibGUucm93cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRcdGxldCBmcm9tSW5kZXggPSBpO1xyXG5cdFx0XHRcdGxldCB0b0luZGV4ID0gaSArIDE7XHJcblxyXG5cdFx0XHRcdGlmIChfdGFibGUucm93c1tpXS5pc1NlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRpZiAodG9JbmRleCA8IF90YWJsZS5yb3dzLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0Y2hhbmdlUG9zaXRpb24oZnJvbUluZGV4LCB0b0luZGV4KTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IF90YWJsZS5yb3dzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bGV0IGZyb21JbmRleCA9IGk7XHJcblx0XHRcdFx0bGV0IHRvSW5kZXggPSBpIC0gMTtcclxuXHJcblx0XHRcdFx0aWYgKF90YWJsZS5yb3dzW2ldLmlzU2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdGlmICh0b0luZGV4ID49IDApXHJcblx0XHRcdFx0XHRcdGNoYW5nZVBvc2l0aW9uKGZyb21JbmRleCwgdG9JbmRleCk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdF90YWJsZS5yb3dzLmZvckVhY2gocm93ID0+IF90YWJsZS5ib2R5LmVsZW1lbnQuYXBwZW5kQ2hpbGQocm93LmVsZW1lbnQpKTtcclxuXHJcblx0XHRmdW5jdGlvbiBjaGFuZ2VQb3NpdGlvbihmcm9tSW5kZXgsIHRvSW5kZXgpIHtcclxuXHRcdFx0Y29uc3Qgcm93ID0gX3RhYmxlLnJvd3Muc3BsaWNlKGZyb21JbmRleCwgMSlbMF07XHJcblx0XHRcdGNvbnN0IGl0ZW0gPSBfdGFibGUuX2RhdGEuc3BsaWNlKGZyb21JbmRleCwgMSlbMF07XHJcblxyXG5cdFx0XHRfdGFibGUucm93cy5zcGxpY2UodG9JbmRleCwgMCwgcm93KTtcclxuXHRcdFx0X3RhYmxlLl9kYXRhLnNwbGljZSh0b0luZGV4LCAwLCBpdGVtKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZVJvd3Mocm93cykge1xyXG5cdFx0cm93cyA9IHJvd3MgaW5zdGFuY2VvZiBBcnJheSA/IHJvd3MgOiBbcm93c107XHJcblxyXG5cdFx0aWYgKCFyb3dzLmxlbmd0aClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHJvd3MuZm9yRWFjaChyb3cgPT4ge1xyXG5cdFx0XHQvLyByb3dcclxuXHRcdFx0X3RhYmxlLnJvd3MuZm9yRWFjaCgoX3JvdywgaW5kZXgpID0+IHtcclxuXHRcdFx0XHRpZiAoX3Jvdy5pZCA9PSByb3cuaWQpXHJcblx0XHRcdFx0XHRfdGFibGUucm93cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIGRhdGFcclxuXHRcdFx0X3RhYmxlLl9kYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0aWYgKGl0ZW0ubWV0YS5yb3cuaWQgPT0gcm93LmlkKVxyXG5cdFx0XHRcdFx0X3RhYmxlLl9kYXRhLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cm93LmVsZW1lbnQucmVtb3ZlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vblJlbW92ZVJvd3MpXHJcblx0XHRcdG9wdGlvbnMub25SZW1vdmVSb3dzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVTZWxlY3RlZFJvd3MoKSB7XHJcblx0XHRyZW1vdmVSb3dzKHNlbGVjdGVkUm93cygpKTtcclxuXHRcdF90YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzb3J0KGZpZWxkTmFtZSwgYXNjZW5kaW5nID0gdHJ1ZSkge1xyXG5cdFx0X3RhYmxlLnJvd3Muc29ydCgoYSwgYikgPT4ge1xyXG5cdFx0XHQvLyBsZXQgdmEgPSBhLl9kYXRhW2ZpZWxkTmFtZV07XHJcblx0XHRcdC8vIGxldCB2YiA9IGIuX2RhdGFbZmllbGROYW1lXTtcclxuXHRcdFx0bGV0IHZhID0gYS5jZWxsKGZpZWxkTmFtZSkudmFsdWUoKTtcclxuXHRcdFx0bGV0IHZiID0gYi5jZWxsKGZpZWxkTmFtZSkudmFsdWUoKTtcclxuXHJcblx0XHRcdGlmICh0eXBlb2YgdmEgPT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHR2YSA9IFN0cmluZyh2YSkudG9Mb3dlckNhc2UoKTtcclxuXHRcdFx0XHR2YiA9IFN0cmluZyh2YikudG9Mb3dlckNhc2UoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHZhIDwgdmIpXHJcblx0XHRcdFx0cmV0dXJuIGFzY2VuZGluZyA/IC0xIDogMTtcclxuXHJcblx0XHRcdGlmICh2YSA+IHZiKVxyXG5cdFx0XHRcdHJldHVybiBhc2NlbmRpbmcgPyAxIDogLTE7XHJcblxyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdF90YWJsZS5yb3dzLmZvckVhY2gocm93ID0+IF90YWJsZS5ib2R5LmVsZW1lbnQuYXBwZW5kQ2hpbGQocm93LmVsZW1lbnQpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRfdGFibGUuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cdFx0JHRhYmxlLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2V4cG9ydChyb3dzLCBvcHRpb25zID0geyBzZXBhcmF0b3I6ICdcXHQnIH0pIHtcclxuXHRcdC8vIEV4cG9ydGEgYXMgbGluaGFzIGVzcGVjaWZpY2FkYXMgb3Ugc2VsZWNpb25hZGFzIHBhcmEgdW0gZm9ybWF0byBkZSB0ZXh0byBzZXBhcmFkbyBwb3IgdGFidWxhXHUwMEU3XHUwMEUzby5cclxuXHJcblx0XHRsZXQgdGV4dCA9IChyb3dzIHx8IF90YWJsZS5zZWxlY3RlZFJvd3MoKSkubWFwKHJvdyA9PiB7XHJcblx0XHRcdGxldCBmaWVsZE5hbWVzID0gcm93LmNlbGxzLmZpbHRlcih4ID0+ICF4LmNoZWNrYm94ICYmICF4LmlzSGlkZGVuKS5tYXAoeCA9PiB4Lm9wdGlvbnMubmFtZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcm93LnRleHQoZmllbGROYW1lcykuam9pbihvcHRpb25zLnNlcGFyYXRvcik7XHJcblx0XHR9KS5qb2luKCdcXG4nKTtcclxuXHJcblx0XHRyZXR1cm4gdGV4dDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9zZXRDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRsZXQgd2lkdGhzID0gX3N0b3JlZFdpZHRocygpIHx8IF90YWJsZS5fY29sdW1uV2lkdGhzO1xyXG5cclxuXHRcdGlmICghd2lkdGhzKSB7XHJcblx0XHRcdHdpZHRocyA9IFtdO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpXHJcblx0XHRcdFx0d2lkdGhzLnB1c2goJzM0cHgnKTtcclxuXHJcblx0XHRcdGZvciAobGV0IG5hbWUgaW4gb3B0aW9ucy5jb2x1bW5zKSB7XHJcblx0XHRcdFx0bGV0IGNvbHVtbiA9IG9wdGlvbnMuY29sdW1uc1tuYW1lXTtcclxuXHJcblx0XHRcdFx0aWYgKGNvbHVtbi5oaWRkZW4pXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gY29sdW1uLndpZHRoO1xyXG5cdFx0XHRcdGxldCBtaW5XaWR0aCA9IGNvbHVtbi5taW5XaWR0aDtcclxuXHRcdFx0XHRsZXQgbWluTWF4V2lkdGg7XHJcblxyXG5cdFx0XHRcdGlmICghd2lkdGggJiYgIW1pbldpZHRoKSB7XHJcblx0XHRcdFx0XHRtaW5NYXhXaWR0aCA9ICcxZnInO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAod2lkdGggPT0gbWluV2lkdGgpIHtcclxuXHRcdFx0XHRcdG1pbk1heFdpZHRoID0gd2lkdGggKyAncHgnO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR3aWR0aCA9IHdpZHRoID8gd2lkdGggKyAncHgnIDogJzFmcic7XHJcblx0XHRcdFx0XHRtaW5XaWR0aCA9IG1pbldpZHRoID8gbWluV2lkdGggKyAncHgnIDogd2lkdGg7XHJcblx0XHRcdFx0XHRtaW5NYXhXaWR0aCA9IGBtaW5tYXgoJHttaW5XaWR0aH0sICR7d2lkdGh9KWA7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR3aWR0aHMucHVzaChtaW5NYXhXaWR0aCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRfdGFibGUuX2NvbHVtbldpZHRocyA9IHdpZHRocztcclxuXHRcdF90YWJsZS5oZWFkZXIuZWxlbWVudC5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gd2lkdGhzLmpvaW4oJyAnKTtcclxuXHRcdF90YWJsZS5ib2R5LmVsZW1lbnQuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IHdpZHRocy5qb2luKCcgJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2V0Q29sdW1uUmVzaXphYmxlKCkge1xyXG5cdFx0Y29uc3QgJGhlYWRlciA9IF90YWJsZS5oZWFkZXIuZWxlbWVudDtcclxuXHRcdGNvbnN0ICRoZWFkZXJDZWxscyA9ICRoZWFkZXIucXVlcnlTZWxlY3RvckFsbCgnLmR0LWhlYWRlci1jZWxsOm5vdCguaGlkZGVuKScpO1xyXG5cdFx0Y29uc3QgJGJvZHkgPSBfdGFibGUuYm9keS5lbGVtZW50O1xyXG5cdFx0bGV0IGN1cnJlbnRDb2x1bW4gPSBudWxsO1xyXG5cdFx0bGV0IGN1cnJlbnRDb2x1bW5JbmRleDtcclxuXHRcdGxldCBjb2x1bW5XaWR0aHM7XHJcblx0XHRsZXQgc3RhcnRYO1xyXG5cdFx0bGV0IHN0YXJ0V2lkdGg7XHJcblx0XHRsZXQgZGlmZjtcclxuXHRcdGxldCBpc1Jlc2l6aW5nID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKCRoZWFkZXIuaGFzUmVzaXplSGFuZGxlcilcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdCRoZWFkZXJDZWxscy5mb3JFYWNoKCgkY2VsbCwgaW5kZXgpID0+IHtcclxuXHRcdFx0Y29uc3QgJHJlc2l6ZXIgPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcucmVzaXplcicpO1xyXG5cclxuXHRcdFx0aWYgKCRyZXNpemVyKSB7XHJcblx0XHRcdFx0JHJlc2l6ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZlbnQgPT4gc3RhcnRSZXNpemUoZXZlbnQsIGluZGV4LCAkY2VsbCkpO1xyXG5cdFx0XHRcdCRyZXNpemVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQkaGVhZGVyLmhhc1Jlc2l6ZUhhbmRsZXIgPSB0cnVlO1xyXG5cclxuXHRcdGZ1bmN0aW9uIHN0YXJ0UmVzaXplKGV2ZW50LCBpbmRleCwgJGNvbHVtbikge1xyXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpO1xyXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcFJlc2l6ZSk7XHJcblxyXG5cdFx0XHRjdXJyZW50Q29sdW1uID0gX3RhYmxlLmhlYWRlci5jZWxsKCRjb2x1bW4uZGF0YXNldC5uYW1lKTtcclxuXHJcblx0XHRcdGlmICghb3B0aW9ucy5yZXNpemUgJiYgIWN1cnJlbnRDb2x1bW4ub3B0aW9ucy5yZXNpemUpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0JGhlYWRlci5jbGFzc0xpc3QuYWRkKCdyZXNpemluZycpO1xyXG5cdFx0XHRpc1Jlc2l6aW5nID0gdHJ1ZTtcclxuXHRcdFx0Y3VycmVudENvbHVtbkluZGV4ID0gaW5kZXg7XHJcblx0XHRcdHN0YXJ0WCA9IGV2ZW50LnBhZ2VYO1xyXG5cdFx0XHRjb2x1bW5XaWR0aHMgPSBnZXRDb21wdXRlZFN0eWxlKCRoZWFkZXIpLmdyaWRUZW1wbGF0ZUNvbHVtbnMuc3BsaXQoJyAnKTtcclxuXHRcdFx0c3RhcnRXaWR0aCA9IHBhcnNlRmxvYXQoY29sdW1uV2lkdGhzW2N1cnJlbnRDb2x1bW5JbmRleF0pO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdlLXJlc2l6ZSc7XHJcblx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiByZXNpemUoZSkge1xyXG5cdFx0XHRpZiAoIWlzUmVzaXppbmcpIHJldHVybjtcclxuXHJcblx0XHRcdGRpZmYgPSBlLnBhZ2VYIC0gc3RhcnRYO1xyXG5cclxuXHRcdFx0bGV0IG1pbldpZHRoID0gY3VycmVudENvbHVtbi5vcHRpb25zLm1pbldpZHRoIHx8IDUwO1xyXG5cdFx0XHRsZXQgd2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgc3RhcnRXaWR0aCArIGRpZmYpO1xyXG5cclxuXHRcdFx0c2V0Q29sdW1uV2lkdGgoY3VycmVudENvbHVtbkluZGV4LCB3aWR0aCk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2V0Q29sdW1uV2lkdGgoY29sdW1uSW5kZXgsIHdpZHRoKSB7XHJcblx0XHRcdHdpZHRoID0gdHlwZW9mIHdpZHRoID09ICdudW1iZXInID8gd2lkdGggKyAncHgnIDogd2lkdGg7XHJcblxyXG5cdFx0XHRjb2x1bW5XaWR0aHMgPSBnZXRDb21wdXRlZFN0eWxlKCRoZWFkZXIpLmdyaWRUZW1wbGF0ZUNvbHVtbnMuc3BsaXQoJyAnKTtcclxuXHRcdFx0Y29sdW1uV2lkdGhzW2NvbHVtbkluZGV4XSA9IHdpZHRoO1xyXG5cdFx0XHQkaGVhZGVyLnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSBjb2x1bW5XaWR0aHMuam9pbignICcpO1xyXG5cdFx0XHQkYm9keS5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gY29sdW1uV2lkdGhzLmpvaW4oJyAnKTtcclxuXHRcdFx0X3RhYmxlLl9jb2x1bW5XaWR0aHMgPSBjb2x1bW5XaWR0aHM7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc3RvcFJlc2l6ZSgpIHtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKTtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BSZXNpemUpO1xyXG5cclxuXHRcdFx0aWYgKCFpc1Jlc2l6aW5nKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdGlzUmVzaXppbmcgPSBmYWxzZTtcclxuXHRcdFx0JGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdyZXNpemluZycpO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICcnO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnJztcclxuXHRcdFx0X3N0b3JlZFdpZHRocyhfdGFibGUuX2NvbHVtbldpZHRocyk7XHJcblxyXG5cdFx0XHRpZiAoZGlmZiAmJiBvcHRpb25zLm9uUmVzaXplQ29sdW1uKSB7XHJcblx0XHRcdFx0b3B0aW9ucy5vblJlc2l6ZUNvbHVtbih7IGNvbHVtbjogY3VycmVudENvbHVtbiwgd2lkdGhzOiBfdGFibGUuX2NvbHVtbldpZHRocyB9KTtcclxuXHRcdFx0XHRkaWZmID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3N0b3JlZFdpZHRocyh3aWR0aHMpIHtcclxuXHRcdGlmICh3aWR0aHMpIHtcclxuXHRcdFx0d2lkdGhzW3dpZHRocy5sZW5ndGggLSAxXSA9IGBtaW5tYXgoJHt3aWR0aHNbd2lkdGhzLmxlbmd0aCAtIDFdfSwgMWZyKWA7IC8vIFx1MDBGQWx0aW1hIGNvbHVuYSBjb20gbGFyZ3VyYSBtXHUwMEUxeGltYVxyXG5cclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5X3N0b3JlZFdpZHRocywgSlNPTi5zdHJpbmdpZnkod2lkdGhzKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR3aWR0aHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXlfc3RvcmVkV2lkdGhzKTtcclxuXHJcblx0XHRcdGlmICh3aWR0aHMpXHJcblx0XHRcdFx0X3RhYmxlLl9jb2x1bW5XaWR0aHMgPSBKU09OLnBhcnNlKHdpZHRocyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX3RhYmxlLl9jb2x1bW5XaWR0aHM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2V0Qm9yZGVycygpIHtcclxuXHRcdGlmICghKFxyXG5cdFx0XHRkYXRhKCkubGVuZ3RoICYmXHJcblx0XHRcdF90YWJsZS5oZWFkZXIgJiZcclxuXHRcdFx0X3RhYmxlLmJvZHlcclxuXHRcdCkpIHJldHVybjtcclxuXHJcblx0XHQvLyByZW1vdmUgYSBib3JkYSBkYSBcdTAwRkFsdGltYSBjXHUwMEU5bHVsYSBjb20gYSBjbGFzc2UgLnZpc2libGUgKG5cdTAwRTNvIFx1MDBFOSBwb3NzXHUwMEVEdmVsIGZhemVyIGlzc28gdmlhIGNzcykuXHJcblx0XHRfdGFibGUuaGVhZGVyLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLnZpc2libGU6bGFzdC1jaGlsZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2NlbGwtYm9yZGVyLXJpZ2h0Jyk7XHJcblx0XHRfdGFibGUuYm9keS5lbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaCgoJHJvdywgaW5kZXgpID0+IHtcclxuXHRcdFx0JHJvdy5xdWVyeVNlbGVjdG9yKCcudmlzaWJsZTpsYXN0LWNoaWxkJykuY2xhc3NMaXN0LnJlbW92ZSgnY2VsbC1ib3JkZXItcmlnaHQnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGZvb3RlclxyXG5cdFx0bGV0IHJhZGl1cyA9IG9wdGlvbnMuZm9vdGVyLmhpZGRlbiA/ICdpbmhlcml0JyA6ICcwcHgnO1xyXG5cclxuXHRcdF90YWJsZS5lbGVtZW50cy5zY3JvbGxhYmxlLnN0eWxlLmJvcmRlckJvdHRvbUxlZnRSYWRpdXMgPSByYWRpdXM7XHJcblx0XHRfdGFibGUuZWxlbWVudHMuc2Nyb2xsYWJsZS5zdHlsZS5ib3JkZXJib3R0b21SaWdodFJhZGl1cyA9IHJhZGl1cztcclxuXHR9XHJcbn1cclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gMDUvMDEvMjAyNS5cclxuKi9cclxuXHJcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IFRhYmxlT3B0aW9ucyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHsgVGFibGUgfSBmcm9tICcuL2NvbXBvbmVudHMvVGFibGUuanMnO1xyXG5cclxuY29uc3QgRGF0YVRhYmxlID0gb3B0aW9ucyA9PiB7XHJcblx0Ly8gb3B0aW9uczogVGFibGVPcHRpb25zXHJcblxyXG5cdG9wdGlvbnMgPSB1dGlscy5tZXJnZVByb3BzKG5ldyBUYWJsZU9wdGlvbnMoKSwgb3B0aW9ucyk7XHJcblxyXG5cdGNvbnN0IF90YWJsZSA9IFRhYmxlKG9wdGlvbnMpO1xyXG5cclxuXHRpZiAob3B0aW9ucy5wbGFjZSlcclxuXHRcdG9wdGlvbnMucGxhY2UuYXBwZW5kQ2hpbGQoX3RhYmxlLmVsZW1lbnQpO1xyXG5cclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbldpbmRvd0NsaWNrKTtcclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XHJcblxyXG5cdF90YWJsZS5kZXN0cm95ID0gZGVzdHJveTtcclxuXHJcblx0cmV0dXJuIF90YWJsZTtcclxuXHJcblx0ZnVuY3Rpb24gb25XaW5kb3dDbGljayhldmVudCkge1xyXG5cdFx0aWYgKF90YWJsZS5pc0Rpc2FibGVkKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly8gcmVtb3ZlIGEgc2VsZVx1MDBFN1x1MDBFM28gYW8gY2xpY2FyIGZvcmFcclxuXHRcdGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5kdC1oZWFkZXInKSAmJiAhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5kdC1ib2R5JykpIHtcclxuXHRcdFx0aWYgKG9wdGlvbnMub25DbGlja091dClcclxuXHRcdFx0XHRvcHRpb25zLm9uQ2xpY2tPdXQoeyBldmVudCB9KTtcclxuXHJcblx0XHRcdC8vIGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93czogYm9vbGVhbiAtIFByb3ByaWVkYWRlIGN1c3RvbWl6YWRhIGRlZmluaWRhIGVtIG9wdGlvbnMub25DbGlja091dCgpIHBhcmEgY2FuY2VsYXIgYSBkZXNzZWxlXHUwMEU3XHUwMEUzbyBkYXMgbGluaGFzLlxyXG5cdFx0XHRpZiAoIW9wdGlvbnMuY2hlY2tib3ggJiYgIWV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cylcclxuXHRcdFx0XHRfdGFibGUudW5zZWxlY3RSb3dzKGV2ZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xyXG5cdFx0Ly8gY3RybCthXHJcblx0XHRpZiAoXHJcblx0XHRcdGV2ZW50LmN0cmxLZXkgJiZcclxuXHRcdFx0ZXZlbnQua2V5ID09ICdhJyAmJiAoKFxyXG5cdFx0XHRcdG9wdGlvbnMucm93cy5zZWxlY3RPbkNsaWNrICYmXHJcblx0XHRcdFx0b3B0aW9ucy5yb3dzLmFsbG93TXVsdGlwbGVTZWxlY3Rpb25cclxuXHRcdFx0KSB8fFxyXG5cdFx0XHRcdG9wdGlvbnMuY2hlY2tib3hcclxuXHRcdFx0KVxyXG5cdFx0KSB7XHJcblx0XHRcdC8vIHByZXZpbmUgbyBjb21wb3J0YW1lbnRvIHBhZHJcdTAwRTNvIGRlIHNlbGVjaW9uYXIgdHVkb1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0Ly8gc2VsZWNpb25hIHRvZGFzIGFzIGxpbmhhcyBkYSB0YWJlbGFcclxuXHRcdFx0X3RhYmxlLnNlbGVjdFJvd3MoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjdHJsK2NcclxuXHRcdGlmIChcclxuXHRcdFx0b3B0aW9ucy5vbkNvcHlDbGlwICYmXHJcblx0XHRcdGV2ZW50LmN0cmxLZXkgJiZcclxuXHRcdFx0ZXZlbnQua2V5ID09ICdjJyAmJiAoKFxyXG5cdFx0XHRcdG9wdGlvbnMucm93cy5zZWxlY3RPbkNsaWNrXHJcblx0XHRcdCkgfHxcclxuXHRcdFx0XHRvcHRpb25zLmNoZWNrYm94XHJcblx0XHRcdClcclxuXHRcdCkge1xyXG5cdFx0XHRvcHRpb25zLm9uQ29weUNsaXAoeyB0ZXh0OiBfdGFibGUuZXhwb3J0KCkgfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZXNjXHJcblx0XHRpZiAoZXZlbnQua2V5ID09ICdFc2NhcGUnKVxyXG5cdFx0XHRfdGFibGUudW5zZWxlY3RSb3dzKGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbldpbmRvd0NsaWNrKTtcclxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duKTtcclxuXHJcblx0XHRfdGFibGUuZWxlbWVudC5yZW1vdmUoKTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEYXRhVGFibGU7XHJcbiIsICIvKlxyXG5cdENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtICAyNy8wNS8yMDI0LlxyXG5cdERlc2NyaVx1MDBFN1x1MDBFM286IENhaXhhIGRlIGRpXHUwMEUxbG9nbyBkbyB0aXBvIG1vZGFsIHNpbXBsZXMuXHJcbiovXHJcblxyXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcclxuXHR0aXRsZTogJycsIC8vIHN0cmluZyxcclxuXHRjb250ZW50OiAnJywgLy8gc3RyaW5nL0hUTUxFbGVtZW50LFxyXG5cdGJ1dHRvbnM6IG51bGwsIC8qIFtcclxuXHRcdHtcclxuXHRcdFx0bmFtZTogJ09LJyxcclxuXHRcdFx0cHJpbWFyeTogdHJ1ZSxcclxuXHRcdFx0b25DbGljazogZnVuY3Rpb25cclxuXHRcdH0sIFxyXG5cdFx0e1xyXG5cdFx0XHRuYW1lOiAnQ2FuY2VsYXInLFxyXG5cdFx0XHRwcmltYXJ5OiBmYWxzZSxcclxuXHRcdFx0b25DbGljazogZnVuY3Rpb25cclxuXHRcdH1cclxuXHRdKi9cclxuXHR3aWR0aDogMzYwLCAvLyBudW1iZXJcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1vZGFsKG9wdGlvbnMpIHtcclxuXHRvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9ucyB9O1xyXG5cclxuXHRsZXQgX2Jsb2NrZWQgPSBmYWxzZTtcclxuXHRsZXQgJG92ZXJsYXk7XHJcblx0bGV0ICRidXR0b25zO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0c2hvdyxcclxuXHRcdGhpZGUsXHJcblx0XHRibG9jayxcclxuXHRcdHNob3dTcGluLFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHJcblx0XHQkb3ZlcmxheS5jbGFzc05hbWUgPSAnbW9kYWwtb3ZlcmxheSc7XHJcblx0XHQkb3ZlcmxheS5pbm5lckhUTUwgPSAvKmh0bWwqL2BcclxuXHRcdFx0PGRpdiBjbGFzcz1cIm1vZGFsXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+XHJcblx0XHRcdFx0XHQ8c3Bhbj4ke29wdGlvbnMudGl0bGV9PC9zcGFuPlxyXG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtb2RhbC1zcGluXCI+PC9zcGFuPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1vZGFsLWJ1dHRvbnNcIj48L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgO1xyXG5cdFx0Y29uc3QgJG1vZGFsID0gJG92ZXJsYXkucXVlcnlTZWxlY3RvcignLm1vZGFsJyk7XHJcblx0XHRjb25zdCAkY29udGVudCA9ICRvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1jb250ZW50Jyk7XHJcblxyXG5cdFx0Ly8gb3ZlcmxheVxyXG5cdFx0JG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlKTtcclxuXHJcblx0XHQvLyBtb2RhbFxyXG5cdFx0JG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLndpZHRoKVxyXG5cdFx0XHQkbW9kYWwuc3R5bGUud2lkdGggPSBvcHRpb25zLndpZHRoICsgJ3B4JztcclxuXHJcblx0XHRpZiAob3B0aW9ucy5jb250ZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdCRjb250ZW50LmFwcGVuZENoaWxkKG9wdGlvbnMuY29udGVudCk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCRjb250ZW50LmlubmVySFRNTCA9IG9wdGlvbnMuY29udGVudDtcclxuXHJcblx0XHQvLyBib3RcdTAwRjVlc1xyXG5cdFx0JGJ1dHRvbnMgPSAkb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcubW9kYWwtYnV0dG9ucycpO1xyXG5cclxuXHRcdChvcHRpb25zLmJ1dHRvbnMgfHwgW10pLmZvckVhY2goYnV0dG9uID0+IHtcclxuXHRcdFx0Y29uc3QgJGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG5cclxuXHRcdFx0JGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XHJcblx0XHRcdCRidXR0b24uaW5uZXJIVE1MID0gYnV0dG9uLm5hbWU7XHJcblx0XHRcdCRidXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgncHJpbWFyeScsICEhYnV0dG9uLnByaW1hcnkpO1xyXG5cclxuXHRcdFx0aWYgKGJ1dHRvbi5vbkNsaWNrKVxyXG5cdFx0XHRcdCRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBidXR0b24ub25DbGljayk7XHJcblxyXG5cdFx0XHRpZiAoYnV0dG9uLm5hbWUubWF0Y2goL0NhbmNlbHxOby8pKVxyXG5cdFx0XHRcdCRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlKTtcclxuXHJcblx0XHRcdCRidXR0b25zLmFwcGVuZENoaWxkKCRidXR0b24pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuICRvdmVybGF5O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdygpIHtcclxuXHRcdCRvdmVybGF5ID0gY3JlYXRlKCk7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRvdmVybGF5KTtcclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLWludmlzaWJsZScpO1xyXG5cdFx0JG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtdmlzaWJsZScpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmJ1dHRvbnMpXHJcblx0XHRcdCRidXR0b25zLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpLmZvY3VzKCk7XHJcblxyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGlkZSgpIHtcclxuXHRcdGRlc3Ryb3koKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJsb2NrKGJsb2NrID0gdHJ1ZSkge1xyXG5cdFx0aWYgKCFvcHRpb25zLmJ1dHRvbnMpIHJldHVybjtcclxuXHJcblx0XHRfYmxvY2tlZCA9IGJsb2NrO1xyXG5cclxuXHRcdCRidXR0b25zLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpLmZvckVhY2goJGJ1dHRvbiA9PiB7XHJcblx0XHRcdCRidXR0b24uYmx1cigpO1xyXG5cdFx0XHQkYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgYmxvY2spO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93U3BpbihzaG93ID0gdHJ1ZSkge1xyXG5cdFx0JG92ZXJsYXkucXVlcnlTZWxlY3RvcignLm1vZGFsLXNwaW4nKS5jbGFzc0xpc3QudG9nZ2xlKCd2aXNpYmxlJywgc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZXN0cm95KCkge1xyXG5cdFx0aWYgKF9ibG9ja2VkKSByZXR1cm47XHJcblxyXG5cdFx0JG92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtdmlzaWJsZScpO1xyXG5cdFx0JG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtaW52aXNpYmxlJyk7XHJcblxyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XHJcblx0XHRcdCRvdmVybGF5LnJlbW92ZSgpO1xyXG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XHJcblx0XHR9LCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25LZXlEb3duKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQua2V5ID09ICdUYWInKSB7XHJcblx0XHRcdGlmIChfYmxvY2tlZClcclxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChldmVudC5rZXkgPT0gJ0VzY2FwZScpIHtcclxuXHRcdFx0ZGVzdHJveSgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgUGFnZUhlYWRlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXInO1xyXG5pbXBvcnQgQWN0aW9uQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvQWN0aW9uQmFyJztcclxuaW1wb3J0IFJvd1Byb2dyZXNzQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvUm93UHJvZ3Jlc3NCYXInO1xyXG5pbXBvcnQgRGF0YVRhYmxlIGZyb20gJy4uL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4JztcclxuaW1wb3J0IE1vZGFsIGZyb20gJy4uL2xpYi9Nb2RhbC9Nb2RhbCc7XHJcbmltcG9ydCBNZW51IGZyb20gJy4uL2xpYi9NZW51L01lbnUnO1xyXG5pbXBvcnQgVG9hc3QgZnJvbSAnLi4vbGliL1RvYXN0L1RvYXN0JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IFRhc2tzUGFnZSA9ICgpID0+IHtcclxuXHRjb25zdCBoZWFkZXIgPSBQYWdlSGVhZGVyKHtcclxuXHRcdHBhZ2VNYXA6IFsnVGFza3MnXSxcclxuXHRcdGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGFuZCBtYW5hZ2UgYXV0b21hdGVkIHRhc2tzIHRvIGVmZmljaWVudGx5IG9wdGltaXplIHlvdXIgaW1hZ2VzLidcclxuXHR9KTtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSBBY3Rpb25CYXIoe1xyXG5cdFx0YnV0dG9uczogW1xyXG5cdFx0XHR7IG5hbWU6ICd0YXNrc01lbnUnLCB0b29sdGlwOiAnJywgaWNvbjogSWNvbignZWxsaXBzaXNWZXJ0aWNhbCcpIH0sXHJcblx0XHRcdHsgbmFtZTogJ2FkZCcsIHRvb2x0aXA6ICdOZXcgdGFzaycsIGljb246IEljb24oJ2FkZCcpLCBvbkNsaWNrOiBuZXdJdGVtIH0sXHJcblx0XHRcdHsgbmFtZTogJ2VkaXQnLCB0b29sdGlwOiAnRWRpdCcsIGljb246IEljb24oJ2VkaXQnKSwgb25DbGljazogZWRpdEl0ZW0gfSxcclxuXHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdHsgbmFtZTogJ3NlYXJjaCcsIHRvb2x0aXA6ICdWaWV3IGZpbGVzJywgaWNvbjogSWNvbignc2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdGaWxlcyB9LFxyXG5cdFx0XHR7IG5hbWU6ICdzdGFydCcsIHRvb2x0aXA6ICdTdGFydCB0YXNrJywgaWNvbjogSWNvbignc3RhcnQnKSwgb25DbGljazogc3RhcnRUYXNrIH0sXHJcblx0XHRcdHsgbmFtZTogJ3N0b3AnLCB0b29sdGlwOiAnU3RvcCcsIGljb246IEljb24oJ3N0b3AnKSwgb25DbGljazogc3RvcFRhc2sgfSxcclxuXHRcdF1cclxuXHR9KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0aGVhZGVyOiBoZWFkZXIuZWxlbWVudCxcclxuXHRcdFx0YWN0aW9uQmFyOiBhY3Rpb25CYXIuZWxlbWVudCxcclxuXHRcdFx0Y29udGVudDogbnVsbCxcclxuXHRcdH0sXHJcblx0XHRvblNob3csXHJcblx0XHRvbkhpZGUsXHJcblx0XHR1cGRhdGVSdW5uaW5nVGFza3MsXHJcblx0fTtcclxuXHRsZXQgX2RhdGFUYWJsZTtcclxuXHRsZXQgX3NlbGVjdGVkUm93O1xyXG5cdGxldCBfdGFza3NDb250ZXh0TWVudTtcclxuXHRsZXQgX3BhdXNlO1xyXG5cclxuXHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0c2V0RGF0YVRhYmxlKCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRhd2FpdCBsb2FkKCk7XHJcblxyXG5cdFx0Y29uc3QgaWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nKTtcclxuXHJcblx0XHRpZiAoaWQpIHtcclxuXHRcdFx0Y29uc3Qgcm93cyA9IF9kYXRhVGFibGUucm93c0J5RmllbGRWYWx1ZSgnaWQnLCBpZCk7XHJcblxyXG5cdFx0XHQvLyBzZWxlY2lvbmEgbyBpdGVtXHJcblx0XHRcdGlmIChyb3dzLmxlbmd0aCkge1xyXG5cdFx0XHRcdHJvd3NbMF0uc2VsZWN0KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCAnJyk7XHJcblxyXG5cdFx0Ly8gTWVudXNcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT10YXNrc01lbnVdJyksXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnSW1wb3J0IHRhc2tzJywgaWNvbjogSWNvbignaW1wb3J0JyksIG9uQ2xpY2s6IGltcG9ydFRhc2tzIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRXhwb3J0IHRhc2tzJywgaWNvbjogSWNvbignZXhwb3J0JyksIG9uQ2xpY2s6IGV4cG9ydFRhc2tzIH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0X3Rhc2tzQ29udGV4dE1lbnUgPSBNZW51KHtcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdEaXNhYmxlZCcsIGljb246ICcnLCBvbkNsaWNrOiAoKSA9PiBkaXNhYmxlVGFzaygpIH0sXHJcblx0XHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRWRpdCcsIGljb246IEljb24oJ2VkaXQnKSwgb25DbGljazogZWRpdEl0ZW0gfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdEdXBsaWNhdGUnLCBpY29uOiBJY29uKCdkdXBsaWNhdGUnKSwgb25DbGljazogZHVwbGljYXRlSXRlbSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NvcHknLCBpY29uOiBJY29uKCdjb3B5JyksIG9uQ2xpY2s6IGNvcHlDbGlwSXRlbXMgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdWaWV3IGluIGZpbGUgZXhwbG9yZXInLCBpY29uOiBJY29uKCdmb2xkZXJTZWFyY2gnKSwgb25DbGljazogdmlld0luRmlsZUV4cGxvcmVyIH0sXHJcblx0XHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBmaWxlcycsIGljb246IEljb24oJ3NlYXJjaCcpLCBvbkNsaWNrOiB2aWV3RmlsZXMgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdTdGFydCB0YXNrJywgaWNvbjogSWNvbignc3RhcnQnKSwgb25DbGljazogc3RhcnRUYXNrIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnU3RvcCcsIGljb246IEljb24oJ3N0b3AnKSwgb25DbGljazogc3RvcFRhc2sgfSxcclxuXHRcdFx0XHR7IGRpdmlkZXI6IHRydWUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdEZWxldGUnLCBpY29uOiBJY29uKCd0cmFzaCcpLCBvbkNsaWNrOiBkZWxldGVJdGVtIH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkhpZGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlLmRlc3Ryb3koKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWQoKSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogZGF0YSB9ID0gYXdhaXQgd2ViQVBJLmdldFRhc2tzKCk7XHJcblxyXG5cdFx0aWYgKGRhdGEpXHJcblx0XHRcdF9kYXRhVGFibGUubG9hZChkYXRhLml0ZW1zKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldERhdGFUYWJsZSgpIHtcclxuXHRcdF9kYXRhVGFibGUgPSBEYXRhVGFibGUoe1xyXG5cdFx0XHRpZDogJ3Rhc2tzJyxcclxuXHRcdFx0aGVpZ2h0OiAnMTAwJScsXHJcblx0XHRcdHNvcnQ6IHRydWUsXHJcblx0XHRcdHJlc2l6ZTogdHJ1ZSxcclxuXHRcdFx0Y29sdW1uczoge1xyXG5cdFx0XHRcdGlkOiB7IGRpc3BsYXlOYW1lOiAnSWQnLCBoaWRkZW46IHRydWUgfSxcclxuXHRcdFx0XHRuYW1lOiB7IGRpc3BsYXlOYW1lOiAnTmFtZScsIHdpZHRoOiAyMDAgfSxcclxuXHRcdFx0XHRwYXRoOiB7IGRpc3BsYXlOYW1lOiAnUGF0aCcsIHdpZHRoOiAzMDAgfSxcclxuXHRcdFx0XHRjb250ZW50OiB7IGRpc3BsYXlOYW1lOiAnQ29udGVudCcsIHdpZHRoOiAxMDAgfSxcclxuXHRcdFx0XHRzdGF0dXM6IHsgZGlzcGxheU5hbWU6ICdTdGF0dXMnLCB3aWR0aDogMTAwIH0sXHJcblx0XHRcdFx0cHJvZ3Jlc3M6IHsgZGlzcGxheU5hbWU6ICdQcm9ncmVzcycsIG1pbldpZHRoOiAyMDAsIHNvcnQ6IGZhbHNlIH0sXHJcblx0XHRcdFx0ZWxhcHNlZFRpbWU6IHsgZGlzcGxheU5hbWU6ICdFbGFwc2VkIFRpbWUnLCB3aWR0aDogMTIwLCBzb3J0OiBmYWxzZSB9LFxyXG5cdFx0XHRcdGxhc3RSdW46IHsgZGlzcGxheU5hbWU6ICdMYXN0IFJ1bicsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRuZXh0UnVuOiB7IGRpc3BsYXlOYW1lOiAnTmV4dCBTY2hlZHVsZWQgUnVuJywgc29ydDogZmFsc2UgfSxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm93czoge1xyXG5cdFx0XHRcdHNlbGVjdE9uQ2xpY2s6IHRydWUsXHJcblx0XHRcdFx0YWxsb3dNdWx0aXBsZVNlbGVjdGlvbjogZmFsc2UsXHJcblx0XHRcdH0sXHJcblx0XHRcdGNlbGxzOiB7XHJcblx0XHRcdFx0cGF0aDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNlbGxcIiBzdHlsZT1cInBhZGRpbmc6IDdweCA4cHggOXB4IDhweDsgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XCI+e3ZhbHVlfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OlwiIG9uQ2xpY2s9e3ZpZXdJbkZpbGVFeHBsb3Jlcn0gY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgdGl0bGU9XCJWaWV3IGluIGZpbGUgZXhwbG9yZXJcIj5cclxuXHRcdFx0XHRcdFx0XHRcdHtJY29uKCdmb2xkZXJTZWFyY2gnKX1cclxuXHRcdFx0XHRcdFx0XHQ8L2E+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0KSxcclxuXHRcdFx0XHRcdHN0eWxlOiB7IHBhZGRpbmc6ICcwICFpbXBvcnRhbnQnIH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb250ZW50OiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB2YWx1ZSA9PSAncm9vdCcgPyAnUm9vdCBmaWxlcycgOiAnQWxsIGRpcmVjdG9yeSdcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0YXR1czoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc2hhcmVkLmNvbnN0YW50cy5zdGF0dXMuZmluZCh4ID0+IHgubmFtZSA9PSB2YWx1ZSk/LmRpc3BsYXlOYW1lIHx8ICcnO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cHJvZ3Jlc3M6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgcHJvZ3Jlc3MgPSBSb3dQcm9ncmVzc0JhcigpO1xyXG5cdFx0XHRcdFx0XHRcdGxldCBwZXJjZW50ID0gdmFsdWUuc3BsaXQoJyUnKVswXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cHJvZ3Jlc3Muc2hvdygpO1xyXG5cdFx0XHRcdFx0XHRcdHByb2dyZXNzLnVwZGF0ZShwZXJjZW50LCB2YWx1ZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBwcm9ncmVzcy5lbGVtZW50O1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGVsYXBzZWRUaW1lOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB2YWx1ZSB8fCAnJ1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bGFzdFJ1bjoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bmV4dFJ1bjoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQWRkUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdGRpc2FibGVSb3cocm93KTtcclxuXHRcdFx0XHRzZXRGb290ZXIoKTtcclxuXHJcblx0XHRcdFx0ZG9tKHJvdy5lbGVtZW50KS5vbignY29udGV4dG1lbnUnLCAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoIXJvdy5pc1NlbGVjdGVkKVxyXG5cdFx0XHRcdFx0XHRyb3cuc2VsZWN0KCk7XHJcblxyXG5cdFx0XHRcdFx0X3Rhc2tzQ29udGV4dE1lbnUuc2hvdyhldmVudCk7XHJcblx0XHRcdFx0XHRfdGFza3NDb250ZXh0TWVudS5pdGVtKCdEaXNhYmxlZCcpLmljb24oXHJcblx0XHRcdFx0XHRcdHJvdy5kYXRhKCkuc3RhdHVzID09ICdkaXNhYmxlZCcgPyBJY29uKCdjaGVja2VkJykgOiAnJ1xyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRfc2VsZWN0ZWRSb3cgPSByb3dzWzBdO1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uVW5zZWxlY3RSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkRvdWJsZUNsaWNrUm93OiAoeyByb3csIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRlZGl0SXRlbSgpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblJlbW92ZVJvd3M6ICgpID0+IHtcclxuXHRcdFx0XHRzZXRGb290ZXIoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Db3B5Q2xpcDogKHsgdGV4dCB9KSA9PiB7XHJcblx0XHRcdFx0Y29weUNsaXBJdGVtcygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNsaWNrT3V0OiAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZXZlbnQuY2FuY2VsVW5zZWxlY3RSb3dzID0gISFldmVudC50YXJnZXQuY2xvc2VzdCgnLmFjdGlvbmJhcicpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y29udGV4dC5lbGVtZW50cy5jb250ZW50ID0gX2RhdGFUYWJsZS5lbGVtZW50O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbmV3SXRlbSgpIHtcclxuXHRcdGxvY2F0aW9uLmhhc2ggPSAndGFzay9uZXcnO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZWRpdEl0ZW0oKSB7XHJcblx0XHRsZXQgaWQgPSBfc2VsZWN0ZWRSb3cuZGF0YSgpLmlkO1xyXG5cclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXN0T3BlbmVkSXRlbScsIGlkKTtcclxuXHRcdGxvY2F0aW9uLmhhc2ggPSAndGFzay8nICsgaWQ7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiB2aWV3RmlsZXMoKSB7XHJcblx0XHRsZXQgaWQgPSBfc2VsZWN0ZWRSb3cuZGF0YSgpLmlkO1xyXG5cdFx0bGV0IGlzQXZhaWxhYmxlID0gYXdhaXQgd2ViQVBJLnBhdGhJc0F2YWlsYWJsZShfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpO1xyXG5cclxuXHRcdGlmIChpc0F2YWlsYWJsZSkge1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCBpZCk7XHJcblx0XHRcdGxvY2F0aW9uLmhhc2ggPSBgdGFzay8ke2lkfS9maWxlc2A7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBpc1Rhc2tSdW5uaW5nKHJvdykge1xyXG5cdFx0bGV0IHRhc2sgPSAocm93IHx8IF9zZWxlY3RlZFJvdykuZGF0YSgpO1xyXG5cdFx0bGV0IHsgcmVzdWx0OiBpc1J1bm5pbmcgfSA9IGF3YWl0IHdlYkFQSS5pc1Rhc2tSdW5uaW5nKHRhc2suaWQpO1xyXG5cclxuXHRcdGlmIChpc1J1bm5pbmcpXHJcblx0XHRcdHRvYXN0SW5mbygnVGFzayBpbiBwcm9ncmVzcy4nKTtcclxuXHJcblx0XHRyZXR1cm4gaXNSdW5uaW5nO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gc3RhcnRUYXNrKCkge1xyXG5cdFx0bGV0IHRhc2sgPSBfc2VsZWN0ZWRSb3cuZGF0YSgpO1xyXG5cclxuXHRcdGlmIChhd2FpdCBpc1Rhc2tSdW5uaW5nKCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodGFzay5zdGF0dXMgPT0gJ2Rpc2FibGVkJykge1xyXG5cdFx0XHR0b2FzdEluZm8oJ1Rhc2sgaXMgZGlzYWJsZWQuJyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgaXNBdmFpbGFibGUgPSBhd2FpdCB3ZWJBUEkucGF0aElzQXZhaWxhYmxlKHRhc2sucGF0aCk7XHJcblxyXG5cdFx0aWYgKCFpc0F2YWlsYWJsZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGNvbnN0IG1vZGFsID0gTW9kYWwoe1xyXG5cdFx0XHR0aXRsZTogJ1N0YXJ0IHRhc2snLFxyXG5cdFx0XHRjb250ZW50OiAnVGhlIG9wdGltaXphdGlvbiBwcm9jZXNzIHdpbGwgYmVnaW4sIGFuZCB0aGUgZmlsZXMgd2lsbCBiZSBwZXJtYW5lbnRseSBjb21wcmVzc2VkLjxicj48YnI+RG8geW91IHdpc2ggdG8gY29udGludWU/JyxcclxuXHRcdFx0YnV0dG9uczogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5hbWU6ICdPSycsIHByaW1hcnk6IHRydWUsIG9uQ2xpY2s6ICgpID0+IHtcclxuXHRcdFx0XHRcdFx0d2ViQVBJLnN0YXJ0VGFzayh0YXNrLmlkKS50aGVuKHJlc3BvbnNlID0+XHJcblx0XHRcdFx0XHRcdFx0dG9hc3RJbmZvKHJlc3BvbnNlLnJlc3VsdClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0bW9kYWwuaGlkZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ2FuY2VsJyB9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cclxuXHRcdG1vZGFsLnNob3coKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZVJ1bm5pbmdUYXNrcyhydW5uaW5nVGFza3MpIHtcclxuXHRcdC8vIEF0dWFsaXphIGluZm9ybWFcdTAwRTdcdTAwRjVlcyBkYXMgdGFyZWZhcyBlbSBleGVjdVx1MDBFN1x1MDBFM28gbmEgZ3JhZGUuXHJcblxyXG5cdFx0aWYgKCFydW5uaW5nVGFza3MgfHwgX3BhdXNlKSByZXR1cm47XHJcblxyXG5cdFx0cnVubmluZ1Rhc2tzID0gSlNPTi5wYXJzZShydW5uaW5nVGFza3MpO1xyXG5cclxuXHRcdGlmIChydW5uaW5nVGFza3MpIHtcclxuXHRcdFx0cnVubmluZ1Rhc2tzLmZvckVhY2gocnVubmluZ1Rhc2sgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IHJvdyA9IF9kYXRhVGFibGUucm93c0J5RmllbGRWYWx1ZSgnaWQnLCBydW5uaW5nVGFzay5pZClbMF07XHJcblxyXG5cdFx0XHRcdGlmIChyb3cpIHtcclxuXHRcdFx0XHRcdHJvdy5kYXRhKHtcclxuXHRcdFx0XHRcdFx0c3RhdHVzOiBydW5uaW5nVGFzay5kaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiBydW5uaW5nVGFzay5zdGF0dXMsXHJcblx0XHRcdFx0XHRcdGVsYXBzZWRUaW1lOiBydW5uaW5nVGFzay5lbGFwc2VkVGltZSxcclxuXHRcdFx0XHRcdFx0bmV4dFJ1bjogcnVubmluZ1Rhc2submV4dFJ1bixcclxuXHRcdFx0XHRcdFx0bGFzdFJ1bjogcnVubmluZ1Rhc2subGFzdFJ1bixcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdHVwZGF0ZVByb2dyZXNzKHJvdywgcnVubmluZ1Rhc2spO1xyXG5cdFx0XHRcdFx0ZGlzYWJsZVJvdyhyb3csIHJ1bm5pbmdUYXNrLmRpc2FibGVkKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3Mocm93LCBydW5uaW5nVGFzaykge1xyXG5cdFx0bGV0IGluZGV4ID0gcnVubmluZ1Rhc2suaW5kZXg7XHJcblx0XHRsZXQgdG90YWwgPSBydW5uaW5nVGFzay50b3RhbDtcclxuXHRcdGxldCBwZXJjZW50ID0gTWF0aC5yb3VuZChpbmRleCAvIHRvdGFsICogMTAwKTtcclxuXHRcdGxldCB2YWx1ZSA9IGluZGV4ID8gYCR7cGVyY2VudH0lICR7aW5kZXh9LyR7dG90YWx9YCA6ICcnO1xyXG5cclxuXHRcdHJvdy5kYXRhKHsgcHJvZ3Jlc3M6IHZhbHVlIH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc3RvcFRhc2soKSB7XHJcblx0XHR3ZWJBUEkuc3RvcFRhc2soX3NlbGVjdGVkUm93LmRhdGEoKS5pZCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBkdXBsaWNhdGVJdGVtKCkge1xyXG5cdFx0bGV0IGNsb25lID0gc3RydWN0dXJlZENsb25lKF9zZWxlY3RlZFJvdy5kYXRhKCkpO1xyXG5cclxuXHRcdGNvbnN0IHsgcmVzdWx0OiB0YXNrIH0gPSBhd2FpdCB3ZWJBUEkuaW5zZXJ0VGFzayhjbG9uZSk7XHJcblxyXG5cdFx0X2RhdGFUYWJsZS5hZGRSb3codGFzaykuc2VsZWN0KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5Q2xpcEl0ZW1zKCkge1xyXG5cdFx0d2ViQVBJLmNvcHlDbGlwKF9kYXRhVGFibGUuZXhwb3J0KCkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmlld0luRmlsZUV4cGxvcmVyKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQucG9pbnRlcklkICYmIGV2ZW50LnBvaW50ZXJJZCAhPSAxKSByZXR1cm47IC8vIHNvbWVudGUgYm90XHUwMEUzbyBwcmluY2lwYWwgZG8gbW91c2VcclxuXHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLnZpZXdJbkZpbGVFeHBsb3Jlcihfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZGlzYWJsZVRhc2socm93KSB7XHJcblx0XHRpZiAoYXdhaXQgaXNUYXNrUnVubmluZygpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IHRhc2sgPSAocm93IHx8IF9zZWxlY3RlZFJvdykuZGF0YSgpO1xyXG5cclxuXHRcdHRhc2suc3RhdHVzID0gdGFzay5zdGF0dXMgPT0gJ2Rpc2FibGVkJyA/ICcnIDogJ2Rpc2FibGVkJztcclxuXHRcdF9zZWxlY3RlZFJvdy5kYXRhKHsgc3RhdHVzOiB0YXNrLnN0YXR1cyB9KTtcclxuXHRcdHdlYkFQSS51cGRhdGVUYXNrKHRhc2spO1xyXG5cdFx0X3BhdXNlID0gdHJ1ZTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IF9wYXVzZSA9IGZhbHNlLCAxMDAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpc2FibGVSb3cocm93LCBkaXNhYmxlKSB7XHJcblx0XHRyb3cgPSByb3cgfHwgX3NlbGVjdGVkUm93O1xyXG5cdFx0ZGlzYWJsZSA9IGRpc2FibGUgIT0gdW5kZWZpbmVkID8gZGlzYWJsZSA6IHJvdy5kYXRhKCkuc3RhdHVzID09ICdkaXNhYmxlZCc7XHJcblxyXG5cdFx0cm93LmNlbGxzLmZvckVhY2goY2VsbCA9PlxyXG5cdFx0XHRjZWxsLmVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IGRpc2FibGUgPyAwLjc1IDogJydcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBkZWxldGVJdGVtKCkge1xyXG5cdFx0aWYgKGF3YWl0IGlzVGFza1J1bm5pbmcoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGNvbnN0IG1vZGFsID0gTW9kYWwoe1xyXG5cdFx0XHR0aXRsZTogJ0RlbGV0ZSB0YXNrJyxcclxuXHRcdFx0Y29udGVudDogJ1RoZSBzZWxlY3RlZCBpdGVtIHdpbGwgYmUgcGVybWFuZW50bHkgZGVsZXRlZC48YnI+PGJyPkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlPycsXHJcblx0XHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRuYW1lOiAnT0snLCBwcmltYXJ5OiB0cnVlLCBvbkNsaWNrOiAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdGxldCBpZCA9IF9zZWxlY3RlZFJvdy5kYXRhKCkuaWQ7XHJcblxyXG5cdFx0XHRcdFx0XHR3ZWJBUEkuZGVsZXRlVGFzayhpZCk7XHJcblx0XHRcdFx0XHRcdF9zZWxlY3RlZFJvdy5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0bW9kYWwuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDYW5jZWwnIH1cclxuXHRcdFx0XVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bW9kYWwuc2hvdygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0FjdGlvbkJhckJ1dHRvbnMoc2hvdyA9IHRydWUpIHtcclxuXHRcdGxldCBzZWxlY3RvciA9ICcuZGl2aWRlciwgW25hbWU9ZWRpdF0sIFtuYW1lPXNlYXJjaF0sIFtuYW1lPXN0YXJ0XSwgW25hbWU9c3RvcF0nO1xyXG5cclxuXHRcdGFjdGlvbkJhci5lbGVtZW50LmdldChzZWxlY3Rvcikuc2hvdyhzaG93KTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGltcG9ydFRhc2tzKCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHBhdGggfSA9IGF3YWl0IHdlYkFQSS5maWxlUGlja2VyKCdJbXBvcnQgdGFza3MnLCAnanNvbicpO1xyXG5cclxuXHRcdGlmIChwYXRoKSB7XHJcblx0XHRcdGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHdlYkFQSS5pbXBvcnRUYXNrcyhwYXRoKTtcclxuXHJcblx0XHRcdGlmICghZXJyb3IpXHJcblx0XHRcdFx0bG9hZCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZXhwb3J0VGFza3MoKSB7XHJcblx0XHRjb25zdCBmaWxlTmFtZSA9ICdUYXNrcy5qc29uJztcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuc2F2ZUZpbGVQaWNrZXIoJ0V4cG9ydCB0YXNrcycsIGZpbGVOYW1lLCAnanNvbicpO1xyXG5cclxuXHRcdGlmIChwYXRoKVxyXG5cdFx0XHRhd2FpdCB3ZWJBUEkuZG93bmxvYWRGaWxlKGBodHRwOi8vbG9jYWxob3N0OjEwMTAvZGF0YS8ke2ZpbGVOYW1lfWAsIHBhdGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0Rm9vdGVyKCkge1xyXG5cdFx0bGV0IGl0ZW1zID0gX2RhdGFUYWJsZS5kYXRhKCkubGVuZ3RoO1xyXG5cclxuXHRcdHNoYXJlZC5mb290ZXIuaW5mbyhgJHtpdGVtcyB8fCAnTm8nfSB0YXNrc2ApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9hc3RJbmZvKG1lc3NhZ2UpIHtcclxuXHRcdGlmICghbWVzc2FnZSkgcmV0dXJuO1xyXG5cclxuXHRcdFRvYXN0KHtcclxuXHRcdFx0aWNvbjogSWNvbignaW5mbycpLFxyXG5cdFx0XHRtZXNzYWdlOiBtZXNzYWdlLFxyXG5cdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSBjZW50ZXInLFxyXG5cdFx0XHR0aW1lOiA0XHJcblx0XHR9KTtcclxuXHJcblx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrc1BhZ2U7XHJcbiIsICJjb25zdCB1dGlscyA9IG5ldyBVdGlscygpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXRpbHM7XHJcblxyXG5mdW5jdGlvbiBVdGlscygpIHtcclxuXHR0aGlzLmdlbmVyYXRlR3VpZCA9IGdlbmVyYXRlR3VpZDtcclxuXHR0aGlzLmNvbnZlcnQgPSBjb252ZXJ0O1xyXG5cdHRoaXMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xyXG5cdHRoaXMuaXNFbXB0eSA9IGlzRW1wdHk7XHJcblx0dGhpcy5pc051bGxPckVtcHR5ID0gaXNOdWxsT3JFbXB0eTtcclxuXHR0aGlzLmlzVW5kZWZpbmVkT3JOdWxsID0gaXNVbmRlZmluZWRPck51bGw7XHJcblx0dGhpcy5pc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkgPSBpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHk7XHJcblx0dGhpcy5pc051bWJlciA9IGlzTnVtYmVyO1xyXG5cdHRoaXMuaXNJbnRlZ2VyID0gaXNJbnRlZ2VyO1xyXG5cdHRoaXMuaXNEYXRlVGltZSA9IGlzRGF0ZVRpbWU7XHJcblx0dGhpcy5pc0lmcmFtZSA9IGlzSWZyYW1lO1xyXG5cdHRoaXMuY29tcHJlc3NUZW1wbGF0ZVN0cmluZyA9IGNvbXByZXNzVGVtcGxhdGVTdHJpbmc7XHJcblx0dGhpcy50cnVuY2F0ZVRleHQgPSB0cnVuY2F0ZVRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIGdlbmVyYXRlR3VpZCgpIHtcclxuXHRcdC8vIFJldG9ybmEgcmFuZG9taWNhbWVudGUgdW0gR1VJRCBwYWRyXHUwMEUzbyAtIEV4LjogYTkxZTMyZGYtOTM1Mi00NTIwLTlmMDktMTcxNWE5YTBjZTQxXHJcblxyXG5cdFx0Y29uc3QgZ3VpZCA9IChbMWU2XSArIC0xZTMgKyAtNGUzICsgLThlMyArIC0xZTExKS5yZXBsYWNlKC9bMDE4XS9nLCBjID0+XHJcblx0XHRcdChcclxuXHRcdFx0XHRjIF5cclxuXHRcdFx0XHQoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxKSlbMF0gJiAoMTUgPj4gKGMgLyA0KSkpXHJcblx0XHRcdCkudG9TdHJpbmcoMTYpXHJcblx0XHQpO1xyXG5cclxuXHRcdC8vIGFkaWNpb25hIHVtYSBsZXRyYSBjb21vIHByaW1laXJvIGNhcmFjdGVyZSBwYXJhIGV2aXRhciBlcnJvIG5hIGZ1blx1MDBFN1x1MDBFM28gcXVlcnlTZWxlY3RvclxyXG5cdFx0cmV0dXJuICdhJyArIGd1aWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb252ZXJ0KCkge1xyXG5cdFx0ZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0Ly8gQ29udmVydGUgcXVhbHF1ZXIgdmFsb3IgcXVlIGNvbnRlbmhhIG5cdTAwRkFtZXJvcyBwYXJhIHVtIG5cdTAwRkFtZXJvIHB1cm8sIGludGVpcm8gb3UgZGVjaW1hbC5cclxuXHJcblx0XHRcdC8qXHJcblx0XHRcdFx0b3B0aW9uczoge1xyXG5cdFx0XHRcdFx0ZGlnaXRzOiBpbnQvJ2F1dG8nXHJcblx0XHRcdFx0fVxyXG5cdFx0XHQqL1xyXG5cclxuXHRcdFx0aWYgKGlzVW5kZWZpbmVkT3JOdWxsT3JFbXB0eSh2YWx1ZSkpIHJldHVybiBudWxsO1xyXG5cclxuXHRcdFx0Y29uc3QgX29wdGlvbnMgPSB7XHJcblx0XHRcdFx0ZGlnaXRzOiAyLFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMpIHtcclxuXHRcdFx0XHRpZiAob3B0aW9ucy5kaWdpdHMgIT09ICdhdXRvJylcclxuXHRcdFx0XHRcdG9wdGlvbnMuZGlnaXRzID1cclxuXHRcdFx0XHRcdFx0aXNOdW1iZXIob3B0aW9ucy5kaWdpdHMpICYmIG9wdGlvbnMuZGlnaXRzID49IDBcclxuXHRcdFx0XHRcdFx0XHQ/IG9wdGlvbnMuZGlnaXRzXHJcblx0XHRcdFx0XHRcdFx0OiBfb3B0aW9ucy5kaWdpdHM7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0b3B0aW9ucyA9IF9vcHRpb25zO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgbnVtYmVyID0gdmFsdWU7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRcdGxldCBpc05lZ2F0aXZlID0gdmFsdWUuc3RhcnRzV2l0aCgnLScpO1xyXG5cdFx0XHRcdGxldCBudW1iZXJzID0gdmFsdWUubWF0Y2goL1xcZCsvZyk7IC8vIHNvbWVudGUgblx1MDBGQW1lcm9zXHJcblxyXG5cdFx0XHRcdG51bWJlciA9ICcnO1xyXG5cclxuXHRcdFx0XHRpZiAobnVtYmVycykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdG51bWJlciArPSBudW1iZXJzW2ldO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGkgPT09IG51bWJlcnMubGVuZ3RoIC0gMikgbnVtYmVyICs9ICcuJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG51bWJlciA9IE51bWJlcihpc05lZ2F0aXZlID8gJy0nICsgbnVtYmVyIDogbnVtYmVyKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG9wdGlvbnMuZGlnaXRzID09PSAnYXV0bydcclxuXHRcdFx0XHQ/IG51bWJlclxyXG5cdFx0XHRcdDogTnVtYmVyKG51bWJlci50b0ZpeGVkKG9wdGlvbnMuZGlnaXRzKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKSB7XHJcblx0XHRcdC8vIENvbnZlcnRlIHF1YWxxdWVyIHZhbG9yIHF1ZSBzZSBlbnRlbmRhIGNvbW8gdmVyZGFkZWlybyBvdSBmYWxzbyBwYXJhIGJvb2xlYW5vLlxyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0XHR9IGVsc2UgaWYgKFV0aWxzKCkuaXNVbmRlZmluZWRPck51bGxPckVtcHR5KHZhbHVlKSkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSAxO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xyXG5cclxuXHRcdFx0XHRpZiAodmFsdWUubWF0Y2goL150cnVlJHxeeWVzJHxec2ltJHxeMSQvKSkgcmV0dXJuIHRydWU7XHJcblx0XHRcdFx0ZWxzZSBpZiAodmFsdWUubWF0Y2goL15mYWxzZSR8Xm5vJHxeblx1MDBFM28kfF4wJC8pKSByZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBudW1iZXJUb1B4KHZhbHVlKSB7XHJcblx0XHRcdC8vIENvbnZlcnRlIHF1YWxxdWVyIHZhbG9yIHF1ZSBjb250ZW5oYSBuXHUwMEZBbWVyb3MgcGFyYSBweC5cclxuXHJcblx0XHRcdHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWUgPyBgJHt2YWx1ZX1weGAgOiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0b051bWJlcixcclxuXHRcdFx0dG9Cb29sZWFuLFxyXG5cdFx0XHRudW1iZXJUb1B4LFxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGlzQm9vbGVhbih2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHZhbHVlID09PSAnJyB8fCAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgIXZhbHVlLmxlbmd0aCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc051bGxPckVtcHR5KHZhbHVlKSB7XHJcblx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgaXNFbXB0eSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHtcclxuXHRcdHJldHVybiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkgfHwgaXNOdWxsT3JFbXB0eSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xyXG5cdFx0aWYgKGlzVW5kZWZpbmVkT3JOdWxsT3JFbXB0eSh2YWx1ZSkgfHwgaXNCb29sZWFuKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJldHVybiAhaXNOYU4oTnVtYmVyKHZhbHVlKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0ludGVnZXIodmFsdWUpIHtcclxuXHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHx8IGlzQm9vbGVhbih2YWx1ZSkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRyZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihOdW1iZXIodmFsdWUpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGlzRGF0ZVRpbWUodmFsdWUsIGZvcm1hdCkge1xyXG5cdFx0aWYgKGlzVW5kZWZpbmVkT3JOdWxsT3JFbXB0eSh2YWx1ZSkgfHwgaXNCb29sZWFuKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xyXG5cclxuXHRcdGlmIChmb3JtYXQgPT09ICdkZC9tbS95eXl5JylcclxuXHRcdFx0cmV0dXJuIHZhbHVlLm1hdGNoKC9eKFxcZHsyfSlcXC8oXFxkezJ9KVxcLyhcXGR7NH0pJC8pICE9PSBudWxsO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ2RkL21tL3l5eXkgaGg6bW0nKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKC9eKFxcZHsyfSlcXC8oXFxkezJ9KVxcLyhcXGR7NH0pIChcXGR7Mn0pOihcXGR7Mn0pJC8pICE9PVxyXG5cdFx0XHRcdG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICdkZC9tbS95eXl5IGhoOm1tOnNzJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHsyfSlcXC8oXFxkezJ9KVxcLyhcXGR7NH0pIChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0pJC9cclxuXHRcdFx0XHQpICE9PSBudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAneXl5eS1tbS1kZCcpXHJcblx0XHRcdHJldHVybiB2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pJC8pICE9PSBudWxsO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGRUaGg6bW0nKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSkkLykgIT09XHJcblx0XHRcdFx0bnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQgaGg6bW0nKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkgKFxcZHsyfSk6KFxcZHsyfSkkLykgIT09XHJcblx0XHRcdFx0bnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGRUaGg6bW06c3MnKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKFxyXG5cdFx0XHRcdFx0L14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KVQoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KSQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQgaGg6bW06c3MnKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKFxyXG5cdFx0XHRcdFx0L14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KSAoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KSQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGRUaGg6bW06c3NaJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSlaJC9cclxuXHRcdFx0XHQpICE9PSBudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAneXl5eS1tbS1kZCBoaDptbTpzc1onKVxyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdHZhbHVlLm1hdGNoKFxyXG5cdFx0XHRcdFx0L14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KSAoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KVokL1xyXG5cdFx0XHRcdCkgIT09IG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkWicpXHJcblx0XHRcdHJldHVybiB2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pWiQvKSAhPT0gbnVsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGlzSWZyYW1lKCkge1xyXG5cdFx0Ly8gUmV0b3JuYSBzZSBhIHBcdTAwRTFnaW5hIGF0dWFsIGVzdFx1MDBFMSBlbSB1bSBpZnJhbWUuXHJcblxyXG5cdFx0cmV0dXJuIHdpbmRvdy5sb2NhdGlvbiAhPT0gd2luZG93LnBhcmVudC5sb2NhdGlvbjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbXByZXNzVGVtcGxhdGVTdHJpbmcodGV4dCkge1xyXG5cdFx0cmV0dXJuIHRleHQucmVwbGFjZSgvXFxufFxcdC9nLCAnJykudHJpbSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdHJ1bmNhdGVUZXh0KHRleHQsIG1heExlbmd0aCkge1xyXG5cdFx0aWYgKHRleHQubGVuZ3RoID4gbWF4TGVuZ3RoKVxyXG5cdFx0XHRyZXR1cm4gdGV4dC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoIC0gMykgKyAnLi4uJztcclxuXHJcblx0XHRyZXR1cm4gdGV4dDtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBUYWJzID0gKHsgbmFtZXMgPSBbXSwgY29udGVudHMgPSBbXSwgdmVydGljYWwgPSBmYWxzZSwgc3R5bGUgPSBudWxsLCBvbkNoYW5nZSA9IG51bGwgfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiVGFic1wiPlxyXG5cdFx0XHR7bmFtZXMubWFwKChuYW1lLCBpbmRleCkgPT4gKFxyXG5cdFx0XHRcdDxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRhYiBidXR0b24gaC0xMCBweC0zXCIgb25DbGljaz17KGUpID0+IG9uQ2xpY2tUYWIoaW5kZXgsIGUpfT5cclxuXHRcdFx0XHRcdDxzcGFuPntuYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHQ8L2E+XHJcblx0XHRcdCkpfVxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRjb250ZW50cyxcclxuXHRcdHNlbGVjdFRhYixcclxuXHR9O1xyXG5cdGNvbnN0ICR0YWJzID0gJHJvb3QuZ2V0KCcudGFiJyk7XHJcblxyXG5cdHNldCgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gc2V0KCkge1xyXG5cdFx0JHJvb3QuYWRkQ2xhc3MoJ3ZlcnRpY2FsJywgdmVydGljYWwpO1xyXG5cdFx0JHJvb3QuZ2V0KCcudGFiJykuYWRkQ2xhc3MoJ3ZlcnRpY2FsJywgdmVydGljYWwpO1xyXG5cdFx0JHJvb3QuZ2V0KCcudGFiJykuYWRkQ2xhc3MoJ2hvcml6b250YWwnLCAhdmVydGljYWwpO1xyXG5cclxuXHRcdCR0YWJzLmZvckVhY2goJHRhYiA9PiB7XHJcblx0XHRcdGlmIChzdHlsZSlcclxuXHRcdFx0XHQkdGFiLnN0eWxlKHN0eWxlKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGV4aWJlIGEgcHJpbWVpcmEgdGFiIGUgb2N1bHRhIGFzIG91dHJhc1xyXG5cdFx0Y29udGVudHMuZm9yRWFjaCgoJGNvbnRlbnQsIGluZGV4KSA9PiB7XHJcblx0XHRcdGlmIChpbmRleCA+IDApXHJcblx0XHRcdFx0JGNvbnRlbnQuaGlkZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZWxlY3RUYWIoaW5kZXgpIHtcclxuXHRcdCR0YWJzLmZvckVhY2goKCR0YWIsIF9pbmRleCkgPT4ge1xyXG5cdFx0XHQvLyB0YWJcclxuXHRcdFx0JHRhYi5hZGRDbGFzcygnYWN0aXZlJywgaW5kZXggPT0gX2luZGV4KTtcclxuXHJcblx0XHRcdC8vIGNvbnRlbnRcclxuXHRcdFx0Y29uc3QgJGNvbnRlbnQgPSBjb250ZW50c1tfaW5kZXhdO1xyXG5cclxuXHRcdFx0aWYgKCRjb250ZW50KVxyXG5cdFx0XHRcdCRjb250ZW50LnNob3coaW5kZXggPT0gX2luZGV4KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChvbkNoYW5nZSkgb25DaGFuZ2UoaW5kZXgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25DbGlja1RhYihpbmRleCwgZXZlbnQpIHtcclxuXHRcdHNlbGVjdFRhYihpbmRleCwgZXZlbnQpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhYnM7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBUYXNrUGFnZUdlbmVyYWwgPSAoeyB0YXNrLCBzdG9yZUl0ZW0gfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8Zm9ybSBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTEwICFweS0xMCB3LVs2MDBweF1cIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsIHJlcXVpcmVkXCI+TmFtZTwvZGl2PlxyXG5cdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJuYW1lXCIgY2xhc3M9XCJ3LWZ1bGxcIiByZXF1aXJlZCBzcGVsbGNoZWNrPVwiZmFsc2VcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+RGVzY3JpcHRpb248L2Rpdj5cclxuXHRcdFx0XHQ8dGV4dGFyZWEgbmFtZT1cImRlc2NyaXB0aW9uXCIgY2xhc3M9XCJ3LWZ1bGwgIW1pbi1oLTIzXCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgb25JbnB1dD17ZSA9PiBkb20oZS50YXJnZXQpLnJlc2l6ZSgpfT48L3RleHRhcmVhPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkIHBhdGggZmxleCBmbGV4LWNvbFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbCByZXF1aXJlZFwiPkRpcmVjdG9yeSBwYXRoPC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLVtmaXQtY29udGVudCgxMDAlKV8xZnJdIGdhcC14LTEgZ2FwLXktMVwiPlxyXG5cdFx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgb25DbGljaz17c2VsZWN0UGF0aH0gdGl0bGU9XCJTZWxlY3QgZm9sZGVyXCI+XHJcblx0XHRcdFx0XHRcdHtJY29uKCdmb2xkZXInKX1cclxuXHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInBhdGhcIiByZXF1aXJlZCBjbGFzcz1cInctZnVsbFwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIC8+XHJcblx0XHRcdFx0XHQ8c3Bhbj48L3NwYW4+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtZGVzY3JpcHRpb25cIj5EaXJlY3RvcnkgcGF0aCBjb250YWluaW5nIHRoZSBmaWxlcyB0byBiZSBvcHRpbWl6ZWQuPC9kaXY+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGRcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWxcIj5Db250ZW50PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTRcIj5cclxuXHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cInJhZGlvXCI+XHJcblx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiY29udGVudFwiIHZhbHVlPVwicm9vdFwiIC8+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyYWRpby1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdFx0e3NoYXJlZC5jb25zdGFudHMuY29udGVudC5maW5kKHggPT4geC5uYW1lID09ICdyb290Jyk/LmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInJhZGlvLWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRcdFx0T3B0aW1pemVzIG9ubHkgdGhlIGZpbGVzIGluIHRoZSByb290IGRpcmVjdG9yeS5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwicmFkaW9cIj5cclxuXHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJjb250ZW50XCIgdmFsdWU9XCJhbGxcIiAvPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmFkaW8tbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHRcdHtzaGFyZWQuY29uc3RhbnRzLmNvbnRlbnQuZmluZCh4ID0+IHgubmFtZSA9PSAnYWxsJyk/LmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInJhZGlvLWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRcdFx0T3B0aW1pemVzIGFsbCBmaWxlcyB3aXRoaW4gdGhlIGRpcmVjdG9yeSwgaW5jbHVkaW5nIGZvbGRlcnMgYW5kIHN1YmZvbGRlcnMuXHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Zvcm0+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdCRyb290LmdldCgnaW5wdXQsIHRleHRhcmVhJylcclxuXHRcdFx0LmJpbmREYXRhKHsgb2JqZWN0OiB0YXNrIH0pXHJcblx0XHRcdC5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0aWYgKGtleSA9PSAncGF0aCcpIHtcclxuXHRcdFx0XHRcdHRhc2sucGF0aCA9IHZhbHVlLnJlcGxhY2UoL1xcXFwrJC8sICcnKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBzZWxlY3RQYXRoKCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHBhdGggfSA9IGF3YWl0IHdlYkFQSS5mb2xkZXJQaWNrZXIoJ1NlbGVjdCBmb2xkZXInKTtcclxuXHJcblx0XHRpZiAocGF0aCkge1xyXG5cdFx0XHR0YXNrLnBhdGggPSBwYXRoO1xyXG5cdFx0XHQkcm9vdC5nZXRCeU5hbWUoJ3BhdGgnKS52YWx1ZShwYXRoKTtcclxuXHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlR2VuZXJhbDtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBEYXRhVGFibGUgZnJvbSAnLi4vbGliL0RhdGFUYWJsZS9zcmMvaW5kZXgnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5cclxuY29uc3QgVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIgPSAoeyB0YXNrLCBmaWxlVHlwZUNvbnRyb2xzLCBzdG9yZUl0ZW0gfSkgPT4ge1xyXG5cdGNvbnN0IGFjdGlvbkJhciA9IEFjdGlvbkJhcih7XHJcblx0XHRidXR0b25zOiBbXHJcblx0XHRcdHsgbmFtZTogJ2FkZCcsIHRvb2x0aXA6ICdBZGQgaXRlbScsIGljb246IEljb24oJ2FkZCcpLCBvbkNsaWNrOiBhZGRJdGVtIH0sXHJcblx0XHRcdHsgbmFtZTogJ21vdmVVcCcsIHRvb2x0aXA6ICdNb3ZlIHVwJywgaWNvbjogSWNvbigndXAnKSwgZGlzYWJsZWQ6IHRydWUsIG9uQ2xpY2s6ICgpID0+IG1vdmVJdGVtKCd1cCcpIH0sXHJcblx0XHRcdHsgbmFtZTogJ21vdmVEb3duJywgdG9vbHRpcDogJ01vdmUgZG93bicsIGljb246IEljb24oJ2Rvd24nKSwgZGlzYWJsZWQ6IHRydWUsIG9uQ2xpY2s6ICgpID0+IG1vdmVJdGVtKCdkb3duJykgfSxcclxuXHRcdFx0eyBuYW1lOiAnY29weScsIHRvb2x0aXA6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBkaXNhYmxlZDogdHJ1ZSwgb25DbGljazogY29weUl0ZW1zIH0sXHJcblx0XHRcdHsgbmFtZTogJ3Bhc3RlJywgdG9vbHRpcDogJ1Bhc3RlJywgaWNvbjogSWNvbigncGFzdGUnKSwgZGlzYWJsZWQ6IHRydWUsIG9uQ2xpY2s6IHBhc3RlSXRlbXMgfSxcclxuXHRcdFx0eyBuYW1lOiAnZGVsZXRlJywgdG9vbHRpcDogJ0RlbGV0ZScsIGljb246IEljb24oJ3RyYXNoJyksIGRpc2FibGVkOiB0cnVlLCBvbkNsaWNrOiByZW1vdmVJdGVtIH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlciB3LW1pblwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiYWN0aW9uLWJhciBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcGItMS41XCI+XHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHQ8Yj5GaWx0ZXI8L2I+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdHthY3Rpb25CYXIuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJkdC1wbGFjZVwiPjwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1bMC45ZW1dIG9wYWNpdHktNzUgcHQtMlwiPlxyXG5cdFx0XHRcdEVuYWJsZSB0aGUgc2VhcmNoIGZpbHRlciB0byBjcmVhdGUgcnVsZSBzZXRzIHVzaW5nIG11bHRpcGxlIHByb3BlcnRpZXMsIHZhbHVlcywgYW5kIGNvbmRpdGlvbnMuIFdoZW4gdGhlIHRhc2sgc3RhcnRzLCBvbmx5IHRoZSBmaWx0ZXJlZCBmaWxlcyB3aWxsIGJlIG9wdGltaXplZC4gVG8gdGVzdCBhbmQgdmFsaWRhdGUgdGhlIGZpbHRlciwgY2xpY2sgdGhlIDxzcGFuIGNsYXNzPVwiZm9udC1zZW1pYm9sZFwiPlZpZXcgZmlsZXM8L3NwYW4+IGJ1dHRvbi5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0IGxlZnRCcmFja2V0T3B0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5sZWZ0QnJhY2tldE9wdGlvbnM7XHJcblx0Y29uc3QgcmlnaHRCcmFja2V0T3B0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5yaWdodEJyYWNrZXRPcHRpb25zO1xyXG5cdGNvbnN0IHByb3BlcnR5T3B0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5wcm9wZXJ0eU9wdGlvbnM7XHJcblx0Y29uc3QgY29uZGl0aW9uT3B0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5jb25kaXRpb25PcHRpb25zO1xyXG5cdGNvbnN0IG9wZXJhdG9yT3B0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5vcGVyYXRvck9wdGlvbnM7XHJcblx0Y29uc3QgbnVtYmVyQ29uZGl0aW9ucyA9IHNoYXJlZC5jb25zdGFudHMuZmlsZUZpbHRlci5udW1iZXJDb25kaXRpb25zO1xyXG5cdGNvbnN0IHN0cmluZ0NvbmRpdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIuc3RyaW5nQ29uZGl0aW9ucztcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRhY3Rpb25CYXIsXHJcblx0XHRsb2FkLFxyXG5cdH07XHJcblx0bGV0IF9maWxlVHlwZTtcclxuXHRsZXQgX2RhdGFUYWJsZTtcclxuXHJcblx0c2V0RGF0YVRhYmxlKCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0cGxhY2U6ICRyb290LmdldCgnLmR0LXBsYWNlJykubm9kZXNbMF0sXHJcblx0XHRcdGNoZWNrYm94OiB0cnVlLFxyXG5cdFx0XHRzb3J0OiBmYWxzZSxcclxuXHRcdFx0cmVzaXplOiBmYWxzZSxcclxuXHRcdFx0Ym9yZGVyczoge1xyXG5cdFx0XHRcdHRhYmxlOiB7XHJcblx0XHRcdFx0XHRhbGw6IHRydWUsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRyb3dzOiB0cnVlLFxyXG5cdFx0XHRcdGNlbGxzOiB0cnVlLFxyXG5cdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHQnYm9yZGVyLWNvbG9yJzogJyNjY2MnLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRsZWZ0UGFyZW50aGVzZXM6IHsgZGlzcGxheU5hbWU6ICcoJywgd2lkdGg6IDQwLCBzdHlsZTogeyBjb2xvcjogJyM2NjYnLCBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdHByb3BlcnR5OiB7IGRpc3BsYXlOYW1lOiAnUHJvcGVydHknLCB3aWR0aDogMTQwLCBzdHlsZTogeyBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdGNvbmRpdGlvbjogeyBkaXNwbGF5TmFtZTogJ0NvbmRpdGlvbicsIHdpZHRoOiAxNDAsIHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxMSB9IH0sXHJcblx0XHRcdFx0dmFsdWU6IHsgZGlzcGxheU5hbWU6ICdWYWx1ZScsIHdpZHRoOiAyMDAsIHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxMSB9IH0sXHJcblx0XHRcdFx0cmlnaHRQYXJlbnRoZXNlczogeyBkaXNwbGF5TmFtZTogJyknLCB3aWR0aDogNDAsIHN0eWxlOiB7IGNvbG9yOiAnIzY2NicsIHBhZGRpbmdMZWZ0OiAxMiB9IH0sXHJcblx0XHRcdFx0b3BlcmF0b3I6IHsgZGlzcGxheU5hbWU6ICdPcGVyYXRvcicsIHdpZHRoOiA5MCwgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDExIH0gfSxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm93czoge1xyXG5cdFx0XHRcdHNlbGVjdE9uQ2xpY2s6IGZhbHNlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdGxlZnRQYXJlbnRoZXNlczoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJsZWZ0UGFyZW50aGVzZXNcIiBjbGFzcz1cIm5vLWljb24gYi10cmFuc3BhcmVudFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdGxlZnRCcmFja2V0T3B0aW9ucy5tYXAocHJvcCA9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPXtwcm9wLm5hbWV9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtwcm9wLmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR9PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpZWxkO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHByb3BlcnR5OiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGZpZWxkID0gKFxyXG5cdFx0XHRcdFx0XHRcdDxzZWxlY3QgbmFtZT1cInByb3BlcnR5XCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRwcm9wZXJ0eU9wdGlvbnMubWFwKHByb3AgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17cHJvcC5uYW1lfSBkYXRhLXR5cGU9e3Byb3AuZGF0YVR5cGV9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtwcm9wLmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR9PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpZWxkO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbmRpdGlvbjoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJjb25kaXRpb25cIiBjbGFzcz1cIm5vLWljb24gYi10cmFuc3BhcmVudFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmRpdGlvbk9wdGlvbnMubWFwKHByb3AgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17cHJvcC5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbnB1dEhpZGRlbiA9IDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInZhbHVlXCI+PC9pbnB1dD47XHJcblx0XHRcdFx0XHRcdGNvbnN0IGlucHV0TnVtYmVyID0gPGlucHV0IHR5cGU9XCJudW1iZXJcIiBtaW49XCIwXCIgY2xhc3M9XCJiLXRyYW5zcGFyZW50XCIgLz47XHJcblx0XHRcdFx0XHRcdGNvbnN0IGlucHV0RGF0ZSA9IDxpbnB1dCB0eXBlPVwiZGF0ZVwiIGNsYXNzPVwiYi10cmFuc3BhcmVudFwiIC8+O1xyXG5cdFx0XHRcdFx0XHRjb25zdCB0ZXh0YXJlYSA9IDx0ZXh0YXJlYSBkYXRhLXR5cGU9XCJzdHJpbmdcIiByb3dzPVwiMVwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIGNsYXNzPVwiYi10cmFuc3BhcmVudFwiPjwvdGV4dGFyZWE+O1xyXG5cclxuXHRcdFx0XHRcdFx0aW5wdXRIaWRkZW4udmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0ZG9tKGlucHV0TnVtYmVyKS52YWx1ZSh2YWx1ZSkuaGlkZSgpLm9uKCdpbnB1dCcsICh7IGVsZW1lbnQgfSkgPT4gdXBkYXRlSW5wdXRIaWRkZW4oZWxlbWVudC52YWx1ZSgpKSk7XHJcblx0XHRcdFx0XHRcdGRvbShpbnB1dERhdGUpLnZhbHVlKHZhbHVlKS5oaWRlKCkub24oJ2lucHV0JywgKHsgZWxlbWVudCB9KSA9PiB1cGRhdGVJbnB1dEhpZGRlbihlbGVtZW50LnZhbHVlKCkpKTtcclxuXHRcdFx0XHRcdFx0ZG9tKHRleHRhcmVhKS52YWx1ZSh2YWx1ZSkub24oJ2lucHV0JywgKHsgZWxlbWVudCB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0dXBkYXRlSW5wdXRIaWRkZW4oZWxlbWVudC52YWx1ZSgpKTtcclxuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnJlc2l6ZSgpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiAoXHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkc1wiPlxyXG5cdFx0XHRcdFx0XHRcdFx0e2lucHV0SGlkZGVufVxyXG5cdFx0XHRcdFx0XHRcdFx0e2lucHV0TnVtYmVyfVxyXG5cdFx0XHRcdFx0XHRcdFx0e2lucHV0RGF0ZX1cclxuXHRcdFx0XHRcdFx0XHRcdHt0ZXh0YXJlYX1cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uIHVwZGF0ZUlucHV0SGlkZGVuKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXRIaWRkZW4udmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRpbnB1dEhpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRyaWdodFBhcmVudGhlc2VzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGZpZWxkID0gKFxyXG5cdFx0XHRcdFx0XHRcdDxzZWxlY3QgbmFtZT1cInJpZ2h0UGFyZW50aGVzZXNcIiBjbGFzcz1cIm5vLWljb24gYi10cmFuc3BhcmVudFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdHJpZ2h0QnJhY2tldE9wdGlvbnMubWFwKHByb3AgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17cHJvcC5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRvcGVyYXRvcjoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJvcGVyYXRvclwiIGNsYXNzPVwibm8taWNvbiBiLXRyYW5zcGFyZW50XCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0b3BlcmF0b3JPcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3Byb3AuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmllbGQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQWRkUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdGlmICghcm93LmRhdGEoKS5vcGVyYXRvcilcclxuXHRcdFx0XHRcdHJvdy5kYXRhKHsgb3BlcmF0b3I6ICdhbmQnIH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblNlbGVjdFJvd3M6ICh7IHJvd3MgfSkgPT4ge1xyXG5cdFx0XHRcdGVuYWJsZUFjdGlvbkJhckJ1dHRvbnMocm93cy5sZW5ndGgpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVwZGF0ZVJvdzogKHsgcm93LCBmaWVsZHMgfSkgPT4ge1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25SZW1vdmVSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHRcdGVuYWJsZUFjdGlvbkJhckJ1dHRvbnMoX2RhdGFUYWJsZS5zZWxlY3RlZFJvd3MoKS5sZW5ndGgpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBsb2FkKGZpbGVUeXBlKSB7XHJcblx0XHRjb25zdCBmaWx0ZXIgPSB0YXNrLmZpbGVUeXBlcy5maW5kKHggPT4geC50eXBlID09IGZpbGVUeXBlKS5maWx0ZXI7XHJcblxyXG5cdFx0X2ZpbGVUeXBlID0gZmlsZVR5cGU7XHJcblxyXG5cdFx0JHJvb3QuZ2V0QnlOYW1lKCdlbmFibGVkJykuZmlyc3QoKS5iaW5kRGF0YSh7XHJcblx0XHRcdG9iamVjdDogZmlsdGVyLFxyXG5cdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHQvLyBoYWJpbGl0YS9kZXNhYmlsaXRhIG8gZmlsdHJvXHJcblx0XHRcdF9kYXRhVGFibGUuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRkb20oYWN0aW9uQmFyLmVsZW1lbnQpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0bG9hZEZpbHRlcigpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gbG9hZEZpbHRlcigpIHtcclxuXHRcdGNvbnN0IGl0ZW1zID0gdGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSBfZmlsZVR5cGUpLmZpbHRlci5pdGVtcztcclxuXHJcblx0XHRfZGF0YVRhYmxlLmxvYWQoaXRlbXMpO1xyXG5cdFx0aXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IGJpbmREYXRhKGl0ZW0sIGluZGV4KSk7XHJcblx0XHRlbmFibGVBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVuYWJsZUFjdGlvbkJhckJ1dHRvbnMoZW5hYmxlID0gdHJ1ZSkge1xyXG5cdFx0YWN0aW9uQmFyLmJ1dHRvbignbW92ZVVwJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ21vdmVEb3duJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ2NvcHknKS5kaXNhYmxlKCFlbmFibGUpO1xyXG5cdFx0YWN0aW9uQmFyLmJ1dHRvbigncGFzdGUnKS5kaXNhYmxlKCFlbmFibGUpO1xyXG5cdFx0YWN0aW9uQmFyLmJ1dHRvbignZGVsZXRlJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHJcblx0XHRlbmFibGVQYXN0ZUJ1dHRvbkZvckFsbEZpbHRlcnMoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVuYWJsZVBhc3RlQnV0dG9uRm9yQWxsRmlsdGVycyhlbmFibGUpIHtcclxuXHRcdGVuYWJsZSA9IGVuYWJsZSB8fCBzaGFyZWQudGVtcCAmJiBzaGFyZWQudGVtcC5zZWxlY3RlZEZpbHRlckl0ZW1zLmxlbmd0aDtcclxuXHJcblx0XHRmb3IgKGxldCBmaWxlVHlwZSBpbiBmaWxlVHlwZUNvbnRyb2xzKSB7XHJcblx0XHRcdGxldCBkYXRhdGFibGVGaWx0ZXIgPSBmaWxlVHlwZUNvbnRyb2xzW2ZpbGVUeXBlXS5maWx0ZXI7XHJcblxyXG5cdFx0XHRkYXRhdGFibGVGaWx0ZXIuYWN0aW9uQmFyLmJ1dHRvbigncGFzdGUnKS5kaXNhYmxlKCFlbmFibGUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gYWRkSXRlbSgpIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBmaWx0ZXJJdGVtIH0gPSBhd2FpdCB3ZWJBUEkubmV3VGFza0ZpbGVGaWx0ZXJJdGVtKCk7XHJcblxyXG5cdFx0X2RhdGFUYWJsZS5hZGRSb3coZmlsdGVySXRlbSk7XHJcblx0XHRiaW5kRGF0YShmaWx0ZXJJdGVtLCBfZGF0YVRhYmxlLnJvd3MubGVuZ3RoIC0gMSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBtb3ZlSXRlbShkaXJlY3Rpb24pIHtcclxuXHRcdC8vIGRpcmVjdGlvbjogc3RyaW5nICh1cC9kb3duKVxyXG5cclxuXHRcdF9kYXRhVGFibGUubW92ZVNlbGVjdGVkUm93cyhkaXJlY3Rpb24gPT0gJ2Rvd24nKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvcHlJdGVtcygpIHtcclxuXHRcdGxldCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShfZGF0YVRhYmxlLnNlbGVjdGVkUm93cygpLm1hcChyb3cgPT4gcm93LmRhdGEoKSkpO1xyXG5cclxuXHRcdHNoYXJlZC50ZW1wID0ge1xyXG5cdFx0XHRzZWxlY3RlZEZpbHRlckl0ZW1zOiBjbG9uZVxyXG5cdFx0fTtcclxuXHJcblx0XHRlbmFibGVQYXN0ZUJ1dHRvbkZvckFsbEZpbHRlcnMoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHBhc3RlSXRlbXMoKSB7XHJcblx0XHRpZiAoc2hhcmVkLnRlbXAgJiYgc2hhcmVkLnRlbXAuc2VsZWN0ZWRGaWx0ZXJJdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0dGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSBfZmlsZVR5cGUpLmZpbHRlci5pdGVtcy5wdXNoKC4uLnNoYXJlZC50ZW1wLnNlbGVjdGVkRmlsdGVySXRlbXMpO1xyXG5cdFx0XHRsb2FkRmlsdGVyKCk7XHJcblx0XHRcdHNoYXJlZC50ZW1wID0gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRlbmFibGVQYXN0ZUJ1dHRvbkZvckFsbEZpbHRlcnMoZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlSXRlbSgpIHtcclxuXHRcdF9kYXRhVGFibGUucmVtb3ZlU2VsZWN0ZWRSb3dzKCk7XHJcblxyXG5cdFx0Ly8gYWRpY2lvbmEgdW0gaXRlbSB2YXppbyBzZSB0dWRvIGZvciBkZWxldGFkb1xyXG5cdFx0aWYgKCFfZGF0YVRhYmxlLnJvd3MubGVuZ3RoKVxyXG5cdFx0XHRhZGRJdGVtKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiaW5kRGF0YShmaWx0ZXJJdGVtLCByb3dJbmRleCkge1xyXG5cdFx0bGV0ICRyb3cgPSBkb20oX2RhdGFUYWJsZS5yb3dzW3Jvd0luZGV4XS5lbGVtZW50KTtcclxuXHJcblx0XHQkcm93LmdldCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnKS5iaW5kRGF0YSh7XHJcblx0XHRcdG9iamVjdDogZmlsdGVySXRlbSxcclxuXHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0aWYgKGtleSA9PSAncHJvcGVydHknKSB7XHJcblx0XHRcdFx0c2V0RmllbGRzKHsga2V5LCBmaWVsZCwgZmllbGRzLCBldmVudCB9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRGaWVsZHMoeyBrZXksIGZpZWxkLCBmaWVsZHMsIGV2ZW50IH0pIHtcclxuXHRcdGlmIChrZXkgPT0gJ3Byb3BlcnR5Jykge1xyXG5cdFx0XHRjb25zdCBzZWxlY3RlZE9wdGlvbnMgPSBmaWVsZC5ub2Rlc1swXS5zZWxlY3RlZE9wdGlvbnM7XHJcblxyXG5cdFx0XHRpZiAoc2VsZWN0ZWRPcHRpb25zLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5RGF0YVR5cGUgPSBzZWxlY3RlZE9wdGlvbnNbMF0uZGF0YXNldC50eXBlO1xyXG5cclxuXHRcdFx0XHQvLyBDb25kaXRpb24gLSBleGliZS9vY3VsdGEgYXMgb3BcdTAwRTdcdTAwRjVlcyBjb3JyZXRhcyBwZWxhIHByb3ByaWVkYWRlIHNlbGVjaW9uYWRhXHJcblx0XHRcdFx0ZmllbGRzLmNvbmRpdGlvbi5nZXQoJ29wdGlvbicpLmZvckVhY2gob3B0aW9uID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IGNvbmRpdGlvbnMgPSBwcm9wZXJ0eURhdGFUeXBlID09ICdudW1iZXInIHx8IHByb3BlcnR5RGF0YVR5cGUgPT0gJ2RhdGUnID8gbnVtYmVyQ29uZGl0aW9ucyA6IHN0cmluZ0NvbmRpdGlvbnM7XHJcblx0XHRcdFx0XHRsZXQgc2hvdyA9IGNvbmRpdGlvbnMuc29tZSh4ID0+IHggPT0gb3B0aW9uLnZhbHVlKCkpO1xyXG5cclxuXHRcdFx0XHRcdG9wdGlvbi5zaG93KHNob3cpO1xyXG5cclxuXHRcdFx0XHRcdGlmICghc2hvdyAmJiBvcHRpb24udmFsdWUoKSA9PSBmaWVsZHMuY29uZGl0aW9uLnZhbHVlKCkpXHJcblx0XHRcdFx0XHRcdGZpZWxkcy5jb25kaXRpb24udmFsdWUoJycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQvLyBWYWx1ZSAtIGV4aWJlIHVtIGRvcyBjYW1wb3MgKGlucHV0Om51bWJlciwgaW5wdXQ6ZGF0ZSBvdSB0ZXh0YXJlYSkgcGVsbyBvIHRpcG8gZGUgZGFkb1xyXG5cdFx0XHRcdGZpZWxkcy52YWx1ZS5wYXJlbnQoKS5nZXQoJyonKS5oaWRlKCkuZm9yRWFjaChmaWVsZCA9PiB7XHJcblx0XHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRcdGZpZWxkLmF0dHIoJ3R5cGUnKSA9PSBwcm9wZXJ0eURhdGFUeXBlIHx8XHJcblx0XHRcdFx0XHRcdGZpZWxkLmF0dHIoJ2RhdGEtdHlwZScpID09IHByb3BlcnR5RGF0YVR5cGVcclxuXHRcdFx0XHRcdCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0XHRmaWVsZHMudmFsdWUudmFsdWUoJycpO1xyXG5cdFx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlKCcnKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQuc2hvdygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCBUYWJzIGZyb20gJy4uL2NvbXBvbmVudHMvVGFicyc7XHJcbmltcG9ydCBUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlciBmcm9tICcuL1Rhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyJztcclxuXHJcbmNvbnN0IFRhc2tQYWdlRmlsZVNldHRpbmdzID0gKHsgdGFzaywgdGFiSW5kZXggPSAwLCBzdG9yZUl0ZW0gfSkgPT4ge1xyXG5cdGNvbnN0IF9maWxlVHlwZUNvbnRyb2xzID0ge307XHJcblx0Y29uc3QgdGFicyA9IFRhYnMoe1xyXG5cdFx0bmFtZXM6IHNoYXJlZC5jb25zdGFudHMuZmlsZVR5cGVzLm1hcCh0eXBlID0+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlclwiPlxyXG5cdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCIgb25DbGljaz17ZSA9PiBlLnByZXZlbnREZWZhdWx0KCl9PlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJmaWxlVHlwZVwiIHZhbHVlPXt0eXBlLm5hbWV9IG9uQ2xpY2s9e2UgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX0gLz5cclxuXHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdDxiPnt0eXBlLmRpc3BsYXlOYW1lfTwvYj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQpLFxyXG5cdFx0c3R5bGU6IHtcclxuXHRcdFx0J3BhZGRpbmctbGVmdCc6IDgsXHJcblx0XHR9LFxyXG5cdFx0b25DaGFuZ2U6IGluZGV4ID0+IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWJUeXBlSW5kZXgnLCBpbmRleClcclxuXHR9KTtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0xMCAhcHktMTBcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2xcIj5cclxuXHRcdFx0XHQ8Yj5UeXBlczwvYj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1bMC45ZW1dIG9wYWNpdHktNzUgcHQtMVwiPlxyXG5cdFx0XHRcdFx0U2VsZWN0IHRoZSBmaWxlIHR5cGVzIHRvIGJlIG9wdGltaXplZC5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHktMyBib3JkZXItYi0xIGJvcmRlci1ncmF5LTMwMFwiPlxyXG5cdFx0XHRcdFx0e3RhYnMuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdHtzaGFyZWQuY29uc3RhbnRzLmZpbGVUeXBlcy5tYXAodHlwZSA9PiB7XHJcblx0XHRcdFx0bGV0IGZpbHRlciA9IFRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyKHsgdGFzaywgZmlsZVR5cGVDb250cm9sczogX2ZpbGVUeXBlQ29udHJvbHMsIHN0b3JlSXRlbSB9KTtcclxuXHRcdFx0XHRsZXQgZWxlbWVudCA9IChcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0xMFwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1sZyBmb250LWJvbGRcIj57dHlwZS5kaXNwbGF5TmFtZX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTUgdy04MFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGI+UXVhbGl0eTwvYj5cclxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicmFuZ2VcIiBtaW49XCIwXCIgbWF4PVwiMTAwXCIgc3RlcD1cIjVcIiBuYW1lPVwicXVhbGl0eVwiIGNsYXNzPVwicmFuZ2VcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJxdWFsaXR5LXZhbHVlXCI+PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0ZXh0LVswLjllbV0gb3BhY2l0eS03NSBwdC0xXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRUaGUgbG93ZXIgdGhlIHF1YWxpdHksIHRoZSBzbWFsbGVyIHRoZSBmaWxlIHNpemUuIEZpbmQgdGhlIHJpZ2h0IGJhbGFuY2UuXHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBtYXhXaWR0aFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWUgZmxleCBnYXAtOCBpdGVtcy1iYXNlbGluZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8Yj5NYXguIHdpZHRoIChweCk8L2I+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIG5hbWU9XCJ2YWx1ZVwiIGNsYXNzPVwibWluLXctWzZlbV1cIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1bMC45ZW1dIG9wYWNpdHktNzUgcHQtMVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0TGltaXRzIHRoZSB3aWR0aCBvZiBpbWFnZXMgdGhhdCBleGNlZWQgdGhlIHNwZWNpZmllZCB3aWR0aC4gTm90ZTogRG9lcyBub3QgYWZmZWN0IGltYWdlcyBzbWFsbGVyIHRoYW4gdGhlIHNwZWNpZmllZCB3aWR0aC5cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGNvbnZlcnRcIj5cclxuXHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lIGZsZXggZ2FwLTggaXRlbXMtYmFzZWxpbmVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGI+Q29udmVydCB0bzwvYj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwidHlwZVwiIGNsYXNzPVwibWluLXctWzZlbV1cIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uPjwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtzaGFyZWQuY29uc3RhbnRzLmZpbGVUeXBlcy5tYXAoX3R5cGUgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF90eXBlLm5hbWUgIT0gdHlwZS5uYW1lKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gPG9wdGlvbiB2YWx1ZT17X3R5cGUubmFtZX0+e190eXBlLm5hbWUudG9VcHBlckNhc2UoKX08L29wdGlvbj47XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSl9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1bMC45ZW1dIG9wYWNpdHktNzUgcHQtMVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0Q29udmVydHMgdGhlIG9yaWdpbmFsIGltYWdlIHRvIHRoZSBzcGVjaWZpZWQgdHlwZS4gTm90ZTogVGhpcyB3aWxsIG5vdCBjcmVhdGUgYSBuZXcgaW1hZ2UuXHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHR7ZmlsdGVyLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRlbGVtZW50ID0gZG9tKGVsZW1lbnQpO1xyXG5cclxuXHRcdFx0XHRfZmlsZVR5cGVDb250cm9sc1t0eXBlLm5hbWVdID0ge1xyXG5cdFx0XHRcdFx0ZWxlbWVudCxcclxuXHRcdFx0XHRcdGZpbHRlcixcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHRhYnMuY29udGVudHMucHVzaChlbGVtZW50KTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGVsZW1lbnQubm9kZXNbMF07XHJcblx0XHRcdH0pfVxyXG5cdFx0PC9mb3JtPlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHR0YWJzLnNlbGVjdFRhYih0YWJJbmRleCk7XHJcblxyXG5cdFx0dGFicy5lbGVtZW50LmdldEJ5TmFtZSgnZmlsZVR5cGUnKS5mb3JFYWNoKCRmaWxlVHlwZSA9PiB7XHJcblx0XHRcdGNvbnN0IHR5cGUgPSAkZmlsZVR5cGUudmFsdWUoKTtcclxuXHRcdFx0Y29uc3QgZWxlbWVudCA9IF9maWxlVHlwZUNvbnRyb2xzW3R5cGVdLmVsZW1lbnQ7XHJcblx0XHRcdGNvbnN0IGZpbGVUeXBlID0gdGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSB0eXBlKTtcclxuXHJcblx0XHRcdCRmaWxlVHlwZS5iaW5kRGF0YSh7XHJcblx0XHRcdFx0a2V5OiAnZW5hYmxlZCcsXHJcblx0XHRcdFx0b2JqZWN0OiBmaWxlVHlwZSxcclxuXHRcdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGRvbShlbGVtZW50KS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGZvciAoY29uc3QgdHlwZSBpbiBfZmlsZVR5cGVDb250cm9scykge1xyXG5cdFx0XHRjb25zdCBlbGVtZW50ID0gX2ZpbGVUeXBlQ29udHJvbHNbdHlwZV0uZWxlbWVudDtcclxuXHRcdFx0Y29uc3QgZmlsZVR5cGUgPSB0YXNrLmZpbGVUeXBlcy5maW5kKHggPT4geC50eXBlID09IHR5cGUpO1xyXG5cclxuXHRcdFx0Ly8gUXVhbGl0eVxyXG5cdFx0XHRlbGVtZW50LmdldEJ5TmFtZShbJ3F1YWxpdHknXSkuYmluZERhdGEoe1xyXG5cdFx0XHRcdG9iamVjdDogZmlsZVR5cGUsXHJcblx0XHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRmaWVsZC5wYXJlbnQoKS5nZXQoJy5xdWFsaXR5LXZhbHVlJykudGV4dCh2YWx1ZSArICclJyk7XHJcblx0XHRcdFx0ZmlsZVR5cGUucXVhbGl0eSA9IE51bWJlcih2YWx1ZSk7XHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIE1heC4gd2lkdGggKHB4KVxyXG5cdFx0XHRlbGVtZW50LmdldCgnLm1heFdpZHRoIGlucHV0JykuYmluZERhdGEoe1xyXG5cdFx0XHRcdG9iamVjdDogZmlsZVR5cGUubWF4V2lkdGgsXHJcblx0XHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoa2V5ID09ICdlbmFibGVkJykge1xyXG5cdFx0XHRcdFx0ZmllbGRzLnZhbHVlLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ3ZhbHVlJykge1xyXG5cdFx0XHRcdFx0ZmlsZVR5cGUubWF4V2lkdGgudmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIENvbnZlcnQgdG9cclxuXHRcdFx0ZWxlbWVudC5nZXQoJy5jb252ZXJ0JykuZ2V0KCdpbnB1dCwgc2VsZWN0JykuYmluZERhdGEoe1xyXG5cdFx0XHRcdG9iamVjdDogZmlsZVR5cGUuY29udmVydCxcclxuXHRcdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ2VuYWJsZWQnKSB7XHJcblx0XHRcdFx0XHRmaWVsZHMudHlwZS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gRmlsdGVyXHJcblx0XHRcdF9maWxlVHlwZUNvbnRyb2xzW3R5cGVdLmZpbHRlci5sb2FkKHR5cGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlRmlsZVNldHRpbmdzO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5cclxuY29uc3QgVGFza1BhZ2VTY2hlZHVsZSA9ICh7IHRhc2ssIHN0b3JlSXRlbSB9KSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxmb3JtIGNsYXNzPVwiVGFza1BhZ2VTY2hlZHVsZSBmbGV4IGZsZXgtY29sIGdhcC0xMCAhcHktMTBcIj5cclxuXHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3ggZW5hYmxlZFwiPlxyXG5cdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWVcIj5cclxuXHRcdFx0XHRcdDxiPkVuYWJsZWQ8L2I+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRTZWxlY3QgdGhlIGRheXMgb2YgdGhlIHdlZWssIGFuZCBzcGVjaWZ5IHRoZSBzdGFydCB0aW1lcyBhbmQgcmVjdXJyZW5jZSBmb3IgdGhlIHRhc2sgZXhlY3V0aW9uLlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHQ8dGFibGU+XHJcblx0XHRcdFx0PHRoZWFkPlxyXG5cdFx0XHRcdFx0PHRyPlxyXG5cdFx0XHRcdFx0XHQ8dGg+QWx3YXlzIHJ1bjwvdGg+XHJcblx0XHRcdFx0XHRcdDx0aD5TdGFydCBvbiB0aW1lPC90aD5cclxuXHRcdFx0XHRcdFx0PHRoIGNvbHNwYW49XCIzXCI+UmVwZWF0IGV2ZXJ5PC90aD5cclxuXHRcdFx0XHRcdDwvdHI+XHJcblx0XHRcdFx0PC90aGVhZD5cclxuXHRcdFx0XHQ8dGJvZHk+e1xyXG5cdFx0XHRcdFx0c2hhcmVkLmNvbnN0YW50cy53ZWVrZGF5cy5tYXAoZGF5ID0+XHJcblx0XHRcdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiIHRpdGxlPVwiRW5hYmxlL0Rpc2FibGVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7ZGF5LmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRpbWVcIiBuYW1lPVwic3RhcnRUaW1lXCIgLz5cclxuXHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdDx0ZCBjbGFzcz1cInJlcGVhdFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJyZXBlYXRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJyZXBlYXRUaW1lVmFsdWVcIiBtaW49XCIxXCIgc3RlcD1cIjFcIiBwYXR0ZXJuPVwiXFxkKlwiIG9uSW5wdXQ9e29uSW5wdXRSZXBlYXRWYWx1ZX0gb25DaGFuZ2U9e29uQ2hhbmdlUmVwZWF0VmFsdWV9IC8+XHJcblx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJyZXBlYXRUaW1lVW5pdFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2hhcmVkLmNvbnN0YW50cy5yZXBlYXRUaW1lVW5pdC5tYXAodW5pdCA9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3VuaXQubmFtZX0+e3VuaXQuZGlzcGxheU5hbWV9PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH08L3Rib2R5PlxyXG5cdFx0XHQ8L3RhYmxlPlxyXG5cdFx0PC9mb3JtPlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHQvLyBTdGFydCB0YXNrIG9uXHJcblx0XHQkcm9vdC5nZXQoJy5lbmFibGVkJykuZ2V0QnlOYW1lKFtcclxuXHRcdFx0J2VuYWJsZWQnLFxyXG5cdFx0XSkuYmluZERhdGEoe1xyXG5cdFx0XHRvYmplY3Q6IHRhc2suc2NoZWR1bGUsXHJcblx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdGlmIChrZXkgPT0gJ2VuYWJsZWQnKSB7XHJcblx0XHRcdFx0JHJvb3QuZ2V0KCd0YWJsZScpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY2FtcG9zIGRhIHRhYmVsYVxyXG5cdFx0JHJvb3QuZ2V0KCd0Ym9keSB0cicpLmZvckVhY2goKCRyb3csIGluZGV4KSA9PiB7XHJcblx0XHRcdGNvbnN0IHdlZWtkYXkgPSB0YXNrLnNjaGVkdWxlLndlZWtkYXlzW2luZGV4XTtcclxuXHJcblx0XHRcdCRyb3cuZ2V0QnlOYW1lKFtcclxuXHRcdFx0XHQnZW5hYmxlZCcsXHJcblx0XHRcdFx0J3N0YXJ0VGltZScsXHJcblx0XHRcdFx0J3JlcGVhdCcsXHJcblx0XHRcdFx0J3JlcGVhdFRpbWVWYWx1ZScsXHJcblx0XHRcdFx0J3JlcGVhdFRpbWVVbml0JyxcclxuXHRcdFx0XSkuYmluZERhdGEoe1xyXG5cdFx0XHRcdG9iamVjdDogd2Vla2RheSxcclxuXHRcdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ2VuYWJsZWQnKSB7XHJcblx0XHRcdFx0XHRsZXQgY2hlY2tlZDEgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGxldCBjaGVja2VkMiA9IGNoZWNrZWQxICYmIGZpZWxkcy5yZXBlYXQuYXR0cignY2hlY2tlZCcpO1xyXG5cclxuXHRcdFx0XHRcdGZpZWxkcy5yZXBlYXQucGFyZW50KCkuZGlzYWJsZSghY2hlY2tlZDEpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLnN0YXJ0VGltZS5kaXNhYmxlKCFjaGVja2VkMSk7XHJcblx0XHRcdFx0XHRmaWVsZHMucmVwZWF0VGltZVZhbHVlLmRpc2FibGUoIWNoZWNrZWQyKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5yZXBlYXRUaW1lVW5pdC5kaXNhYmxlKCFjaGVja2VkMik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoa2V5ID09ICdyZXBlYXQnICYmIGV2ZW50KSB7XHJcblx0XHRcdFx0XHRsZXQgY2hlY2tlZDIgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRmaWVsZHMucmVwZWF0VGltZVZhbHVlLmRpc2FibGUoIWNoZWNrZWQyKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5yZXBlYXRUaW1lVW5pdC5kaXNhYmxlKCFjaGVja2VkMik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoa2V5ID09ICdyZXBlYXRUaW1lVmFsdWUnKSB7XHJcblx0XHRcdFx0XHR3ZWVrZGF5LnJlcGVhdFRpbWVWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbklucHV0UmVwZWF0VmFsdWUoZXZlbnQpIHtcclxuXHRcdC8vIHNvbWVudGUgbnVtZXJvcyBpbnRlaXJvc1xyXG5cdFx0ZXZlbnQudGFyZ2V0LnZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL1xcRC9nLCAnJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkNoYW5nZVJlcGVhdFZhbHVlKGV2ZW50KSB7XHJcblx0XHRsZXQgZGVmYXVsdFZhbHVlID0gMTtcclxuXHJcblx0XHRldmVudC50YXJnZXQudmFsdWUgPSBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCBkZWZhdWx0VmFsdWU7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2VTY2hlZHVsZTtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBUYXNrUGFnZUV4Y2VwdGlvbnMgPSAoeyB0YXNrLCBzdG9yZUl0ZW0gfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8Zm9ybSBjbGFzcz1cIlRhc2tQYWdlRXhjZXB0aW9ucyBmbGV4IGZsZXgtY29sIGdhcC0xMCAhcHktMTBcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHQ8Yj5FbmFibGVkPC9iPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtZGVzY3JpcHRpb25cIj5cclxuXHRcdFx0XHRcdFx0U3BlY2lmeSB0aGUgZGlyZWN0b3J5IHBhdGhzIHRvIGJlIGV4Y2x1ZGVkIGZyb20gdGhlIG9wdGltaXphdGlvbiBzZXJ2aWNlLlxyXG5cdFx0XHRcdFx0XHQ8YnIvPkZvciBlYWNoIHNwZWNpZmllZCBwYXRoLCBzZWxlY3QgdGhlIHByb3RlY3Rpb24gdHlwZS5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVcIj5cclxuXHRcdFx0XHQ8dGFibGU+XHJcblx0XHRcdFx0XHQ8dGhlYWQ+XHJcblx0XHRcdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdFx0XHQ8dGggY29sc3Bhbj1cIjJcIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW5cIj5QYXRoPC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PC90aD5cclxuXHRcdFx0XHRcdFx0XHQ8dGg+XHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uXCI+UHJvdGVjdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvdGg+XHJcblx0XHRcdFx0XHRcdFx0PHRoPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtblwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTBcIiBvbkNsaWNrPXthZGRJdGVtfSB0aXRsZT1cIkFkZFwiPntJY29uKCdhZGQnKX08L2J1dHRvbj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvdGg+XHJcblx0XHRcdFx0XHRcdDwvdHI+XHJcblx0XHRcdFx0XHQ8L3RoZWFkPlxyXG5cdFx0XHRcdFx0PHRib2R5PntcclxuXHRcdFx0XHRcdFx0dGFzay5leGNlcHRpb25zLml0ZW1zLm1hcCgoZXhjZXB0aW9uLCBpbmRleCkgPT5cclxuXHRcdFx0XHRcdFx0XHQ8dHI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCIgdGl0bGU9XCJFbmFibGUvRGlzYWJsZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTBcIiBuYW1lPVwiYnV0dG9uUGF0aFwiIG9uQ2xpY2s9eygpID0+IHNlbGVjdFBhdGgoZXhjZXB0aW9uLCBpbmRleCl9IHRpdGxlPVwiU2VsZWN0IGZvbGRlclwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e0ljb24oJ2ZvbGRlcicpfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJwYXRoXCIgY2xhc3M9XCJ3LVs1NTBweF1cIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxzZWxlY3QgbmFtZT1cImNvbnRlbnRcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwicm9vdFwiIHNlbGVjdGVkPlJvb3QgZmlsZXM8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwiYWxsXCI+QWxsIGRpcmVjdG9yeTwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG5hbWU9XCJidXR0b25EZWxldGVcIiBvbkNsaWNrPXtlID0+IGRlbGV0ZUl0ZW0oZXhjZXB0aW9uLCBlKX0gdGl0bGU9XCJEZWxldGVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7SWNvbigndHJhc2gnKX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdDwvdHI+XHJcblx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdH08L3Rib2R5PlxyXG5cdFx0XHRcdDwvdGFibGU+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9mb3JtPlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHQkcm9vdC5nZXQoJ1tuYW1lPWVuYWJsZWRdJykuZmlyc3QoKVxyXG5cdFx0XHQuYmluZERhdGEoeyBvYmplY3Q6IHRhc2suZXhjZXB0aW9ucyB9KVxyXG5cdFx0XHQub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdCRyb290LmdldCgnLnRhYmxlJykuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0Y29uc3QgJHRyID0gJHJvb3QuZ2V0KCd0Ym9keSB0cicpO1xyXG5cclxuXHRcdHRhc2suZXhjZXB0aW9ucy5pdGVtcy5mb3JFYWNoKChleGNlcHRpb24sIGluZGV4KSA9PiB7XHJcblx0XHRcdGJpbmRJdGVtKCR0ci5hdChpbmRleCksIGV4Y2VwdGlvbik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZEl0ZW0oKSB7XHJcblx0XHRjb25zdCAkdGJvZHkgPSAkcm9vdC5nZXQoJ3Rib2R5Jyk7XHJcblx0XHRjb25zdCAkdHIgPSAkdGJvZHkuZ2V0KCd0cicpLmZpcnN0KCkuY2xvbmUoKTtcclxuXHRcdGNvbnN0IGV4Y2VwdGlvbiA9IHtcclxuXHRcdFx0ZW5hYmxlZDogdHJ1ZSxcclxuXHRcdFx0cGF0aDogJycsXHJcblx0XHRcdGNvbnRlbnQ6ICdyb290JyxcclxuXHRcdH07XHJcblxyXG5cdFx0JHRib2R5Lmluc2VydCgkdHIpO1xyXG5cdFx0YmluZEl0ZW0oJHRyLCBleGNlcHRpb24pO1xyXG5cdFx0dGFzay5leGNlcHRpb25zLml0ZW1zLnB1c2goZXhjZXB0aW9uKTtcclxuXHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHJcblx0XHQvLyBldmVudG9zXHJcblx0XHQkdHIuZ2V0KCdbbmFtZT1idXR0b25QYXRoXScpLm9uKCdjbGljaycsICgpID0+XHJcblx0XHRcdHNlbGVjdFBhdGgoZXhjZXB0aW9uLCAkdHIuYXR0cigncm93SW5kZXgnKSAtIDEpXHJcblx0XHQpO1xyXG5cclxuXHRcdCR0ci5nZXQoJ1tuYW1lPWJ1dHRvbkRlbGV0ZV0nKS5vbignY2xpY2snLCAoeyBldmVudCB9KSA9PlxyXG5cdFx0XHRkZWxldGVJdGVtKGV4Y2VwdGlvbiwgZXZlbnQpXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gc2VsZWN0UGF0aChleGNlcHRpb24sIGluZGV4KSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLmZvbGRlclBpY2tlcignU2VsZWN0IGZvbGRlcicpO1xyXG5cclxuXHRcdGlmIChwYXRoKSB7XHJcblx0XHRcdGxldCAkcGF0aCA9ICRyb290LmdldCgnW25hbWU9cGF0aF0nKS5hdChpbmRleCk7XHJcblxyXG5cdFx0XHQkcGF0aC52YWx1ZShwYXRoKTtcclxuXHRcdFx0ZXhjZXB0aW9uLnBhdGggPSBwYXRoO1xyXG5cdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWxldGVJdGVtKGV4Y2VwdGlvbiwgZSkge1xyXG5cdFx0bGV0ICR0ciA9IGRvbShlLnRhcmdldC5jbG9zZXN0KCd0cicpKTtcclxuXHJcblx0XHRpZiAoJHJvb3QuZ2V0KCd0Ym9keSB0cicpLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0dGFzay5leGNlcHRpb25zLml0ZW1zID0gdGFzay5leGNlcHRpb25zLml0ZW1zLmZpbHRlcigoeCwgaSkgPT4gaSAhPSAkdHIuYXR0cigncm93SW5kZXgnKSAtIDEpO1xyXG5cdFx0XHQkdHIucmVtb3ZlKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBtYW50ZW0gZSBsaW1wYSBvIFx1MDBGQWx0aW1vXHJcblx0XHRcdGV4Y2VwdGlvbi5lbmFibGVkID0gdHJ1ZTtcclxuXHRcdFx0ZXhjZXB0aW9uLnBhdGggPSAnJztcclxuXHRcdFx0ZXhjZXB0aW9uLmNvbnRlbnQgPSAncm9vdCc7XHJcblxyXG5cdFx0XHQkdHIuZ2V0KCdbbmFtZT1lbmFibGVkXScpLmF0dHIoJ2NoZWNrZWQnLCBleGNlcHRpb24uZW5hYmxlZCk7XHJcblx0XHRcdCR0ci5nZXQoJ1tuYW1lPXBhdGhdJykudmFsdWUoZXhjZXB0aW9uLnBhdGgpO1xyXG5cdFx0XHQkdHIuZ2V0KCdbbmFtZT1jb250ZW50XScpLnZhbHVlKGV4Y2VwdGlvbi5jb250ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiaW5kSXRlbSgkdHIsIG9iaikge1xyXG5cdFx0JHRyLmdldCgnaW5wdXQsIHNlbGVjdCwgYnV0dG9uJylcclxuXHRcdFx0LmJpbmREYXRhKHsgb2JqZWN0OiBvYmogfSlcclxuXHRcdFx0Lm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoa2V5ID09ICdwYXRoJykge1xyXG5cdFx0XHRcdFx0b2JqLnBhdGggPSB2YWx1ZS5yZXBsYWNlKC9cXFxcKyQvLCAnJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoa2V5ID09ICdlbmFibGVkJykge1xyXG5cdFx0XHRcdFx0JHRyLmdldCgnW25hbWU9YnV0dG9uUGF0aF0nKS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0XHQkdHIuZ2V0KCdbbmFtZT1idXR0b25EZWxldGVdJykuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLnBhdGguZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLmNvbnRlbnQuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZUV4Y2VwdGlvbnM7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCByb3V0ZXIgZnJvbSAnLi4vc2VydmljZXMvUm91dGVyU2VydmljZSc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9saWIvVXRpbHMnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgVG9hc3QgZnJvbSAnLi4vbGliL1RvYXN0L1RvYXN0JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IFRhYnMgZnJvbSAnLi4vY29tcG9uZW50cy9UYWJzJztcclxuaW1wb3J0IFRhc2tQYWdlR2VuZXJhbCBmcm9tICcuL1Rhc2tQYWdlR2VuZXJhbCc7XHJcbmltcG9ydCBUYXNrUGFnZUZpbGVTZXR0aW5ncyBmcm9tICcuL1Rhc2tQYWdlRmlsZVNldHRpbmdzJztcclxuaW1wb3J0IFRhc2tQYWdlU2NoZWR1bGUgZnJvbSAnLi9UYXNrUGFnZVNjaGVkdWxlJztcclxuaW1wb3J0IFRhc2tQYWdlRXhjZXB0aW9ucyBmcm9tICcuL1Rhc2tQYWdlRXhjZXB0aW9ucyc7XHJcblxyXG5jb25zdCBUYXNrUGFnZSA9IGFzeW5jICgpID0+IHtcclxuXHRsZXQgX3N0b3JlZFRhc2s7XHJcblx0bGV0IF90YWJJbmRleDtcclxuXHRsZXQgX3RhYlR5cGVJbmRleDtcclxuXHJcblx0c2V0U3RvcmFnZSgpO1xyXG5cclxuXHRjb25zdCBfaWQgPSByb3V0ZXIuY3VycmVudC50YXJnZXQ7XHJcblx0Y29uc3QgX3Rhc2sgPSBhd2FpdCBnZXRUYXNrKCk7XHJcblxyXG5cdGNvbnN0IGhlYWRlciA9IFBhZ2VIZWFkZXIoeyBvbkNsaWNrQmFja0J1dHRvbjogYmFjayB9KTtcclxuXHRjb25zdCBnZW5lcmFsID0gVGFza1BhZ2VHZW5lcmFsKHsgdGFzazogX3Rhc2ssIHN0b3JlSXRlbSB9KTtcclxuXHRjb25zdCBmaWxlU2V0dGluZ3MgPSBUYXNrUGFnZUZpbGVTZXR0aW5ncyh7IHRhc2s6IF90YXNrLCB0YWJJbmRleDogX3RhYlR5cGVJbmRleCB8fCAwLCBzdG9yZUl0ZW0gfSk7XHJcblx0Y29uc3Qgc2NoZWR1bGUgPSBUYXNrUGFnZVNjaGVkdWxlKHsgdGFzazogX3Rhc2ssIHN0b3JlSXRlbSB9KTtcclxuXHRjb25zdCBleGNlcHRpb25zID0gVGFza1BhZ2VFeGNlcHRpb25zKHsgdGFzazogX3Rhc2ssIHN0b3JlSXRlbSB9KTtcclxuXHRjb25zdCB0YWJzID0gVGFicyh7XHJcblx0XHRuYW1lczogWydHZW5lcmFsJywgJ0ZpbGUgc2V0dGluZ3MnLCAnU2NoZWR1bGluZycsICdFeGNlcHRpb25zJ10sXHJcblx0XHRjb250ZW50czogW1xyXG5cdFx0XHRnZW5lcmFsLmVsZW1lbnQsXHJcblx0XHRcdGZpbGVTZXR0aW5ncy5lbGVtZW50LFxyXG5cdFx0XHRzY2hlZHVsZS5lbGVtZW50LFxyXG5cdFx0XHRleGNlcHRpb25zLmVsZW1lbnQsXHJcblx0XHRdLFxyXG5cdFx0b25DaGFuZ2U6IGluZGV4ID0+IHtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RhYkluZGV4JywgaW5kZXgpO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ID09IDEpIHtcclxuXHRcdFx0XHQvLyBGaWx0ZXIgPiBWYWx1ZVxyXG5cdFx0XHRcdCRyb290LmdldCgndGV4dGFyZWFbZGF0YS10eXBlPXN0cmluZ10nKS5yZXNpemUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9KTtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiYWN0aW9uLWJhclwiPlxyXG5cdFx0XHR7dGFicy5lbGVtZW50Lm5vZGVzWzBdfVxyXG5cdFx0XHQ8c3BhbiBjbGFzcz1cImRpdmlkZXIgaC01XCI+PC9zcGFuPlxyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiBoLTEwIHB4LTMgdmlld2ZpbGVzXCIgb25DbGljaz17dmlld0ZpbGVzfT5cclxuXHRcdFx0XHR7SWNvbignc2VhcmNoJyl9PHNwYW4+VmlldyBmaWxlczwvc3Bhbj5cclxuXHRcdFx0PC9idXR0b24+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiVGFza1BhZ2VcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYi1jb250ZW50c1wiPlxyXG5cdFx0XHRcdHtnZW5lcmFsLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0e2ZpbGVTZXR0aW5ncy5lbGVtZW50Lm5vZGVzWzBdfVxyXG5cdFx0XHRcdHtzY2hlZHVsZS5lbGVtZW50Lm5vZGVzWzBdfVxyXG5cdFx0XHRcdHtleGNlcHRpb25zLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBnYXAtNSBweS03IGJ0XCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmFtZT1cInNhdmVcIiBjbGFzcz1cImJ1dHRvbiBwcmltYXJ5IGgtMTAgdy1bOTBweF0gcHgtM1wiIG9uQ2xpY2s9e3NhdmV9PlxyXG5cdFx0XHRcdFx0PHNwYW4+U2F2ZTwvc3Bhbj5cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuYW1lPVwiY2FuY2VsXCIgY2xhc3M9XCJidXR0b24gYm9yZGVyIGgtMTAgdy1bOTBweF0gcHgtM1wiIG9uQ2xpY2s9e2JhY2t9PlxyXG5cdFx0XHRcdFx0PHNwYW4+Q2FuY2VsPC9zcGFuPlxyXG5cdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogYWN0aW9uQmFyLFxyXG5cdFx0XHRjb250ZW50OiByb290LFxyXG5cdFx0fSxcclxuXHRcdG9uU2hvdyxcclxuXHRcdG9uSGlkZSxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblxyXG5cdC8vIEZVTlx1MDBDN1x1MDBENUVTXHJcblxyXG5cdGZ1bmN0aW9uIHNldFN0b3JhZ2UoKSB7XHJcblx0XHRfc3RvcmVkVGFzayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YXNrJyk7XHJcblx0XHRfdGFiSW5kZXggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFiSW5kZXgnKTtcclxuXHRcdF90YWJUeXBlSW5kZXggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFiVHlwZUluZGV4Jyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBnZXRUYXNrKCkge1xyXG5cdFx0cmV0dXJuIF9pZCA9PSAnbmV3JyA/XHJcblx0XHRcdChhd2FpdCB3ZWJBUEkubmV3VGFzaygpKS5yZXN1bHQgOlxyXG5cdFx0XHRKU09OLnBhcnNlKF9zdG9yZWRUYXNrIHx8IG51bGwpIHx8XHJcblx0XHRcdChhd2FpdCB3ZWJBUEkuZ2V0VGFza0J5SWQoX2lkKSkucmVzdWx0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rhc2snLCBKU09OLnN0cmluZ2lmeShfdGFzaykpO1xyXG5cdFx0aGVhZGVyLnNldFBhZ2VNYXAoW1xyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiBoLTEwIHB4LTNcIiBvbkNsaWNrPXtiYWNrfT5UYXNrczwvYnV0dG9uPixcclxuXHRcdFx0PHNwYW4gdGl0bGU9e190YXNrLm5hbWV9Pnt1dGlscy50cnVuY2F0ZVRleHQoX3Rhc2submFtZSwgNjApIHx8ICdOZXcgdGFzayd9PC9zcGFuPlxyXG5cdFx0XSk7XHJcblx0XHR0YWJzLnNlbGVjdFRhYihfdGFiSW5kZXggfHwgMCk7XHJcblx0XHRnZW5lcmFsLm9uU2hvdygpO1xyXG5cdFx0ZmlsZVNldHRpbmdzLm9uU2hvdygpO1xyXG5cdFx0c2NoZWR1bGUub25TaG93KCk7XHJcblx0XHRleGNlcHRpb25zLm9uU2hvdygpO1xyXG5cdFx0JHJvb3QuZ2V0KCd0ZXh0YXJlYScpLnJlc2l6ZSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25IaWRlKCkge1xyXG5cdFx0Ly8gbGltcGEgbyBjYWNoZVxyXG5cdFx0aWYgKHJvdXRlci5jdXJyZW50LnRhcmdldC5tYXRjaCgvdGFza3N8aGlzdG9yeS9pKSkge1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFzaycsICcnKTtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RhYkluZGV4JywgMCk7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWJUeXBlSW5kZXgnLCAwKTtcclxuXHRcdH1cclxuXHJcblx0XHRzaGFyZWQudGVtcCA9IG51bGw7IC8vIFRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyID4gY29weUl0ZW1zXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdG9yZUl0ZW0odGFzaykge1xyXG5cdFx0Ly8gUGVyc2lzdGUgbyBpdGVtIG5vIGNhY2hlIGRvIG5hdmVnYWRvciBwYXJhIGV2ZW50dWFsIGF0dWFsaXphXHUwMEU3XHUwMEUzbyBkZSBwXHUwMEUxZ2luYS5cclxuXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFzaycsIEpTT04uc3RyaW5naWZ5KHRhc2spKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHZpZXdGaWxlcygpIHtcclxuXHRcdGxldCBpc0F2YWlsYWJsZSA9IGF3YWl0IHdlYkFQSS5wYXRoSXNBdmFpbGFibGUoX3Rhc2sucGF0aCk7XHJcblxyXG5cdFx0aWYgKGlzQXZhaWxhYmxlKVxyXG5cdFx0XHRsb2NhdGlvbi5oYXNoID0gYHRhc2svJHtfdGFzay5pZH0vZmlsZXNgO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gaXNUYXNrUnVubmluZygpIHtcclxuXHRcdGlmICghX2lkIHx8IF9pZCA9PSAnbmV3JylcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdGxldCB7IHJlc3VsdDogaXNSdW5uaW5nIH0gPSBhd2FpdCB3ZWJBUEkuaXNUYXNrUnVubmluZyhfdGFzay5pZCk7XHJcblxyXG5cdFx0aWYgKGlzUnVubmluZylcclxuXHRcdFx0dG9hc3RJbmZvKCdUYXNrIGluIHByb2dyZXNzLicpO1xyXG5cclxuXHRcdHJldHVybiBpc1J1bm5pbmc7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBzYXZlKCkge1xyXG5cdFx0aWYgKGF3YWl0IGlzVGFza1J1bm5pbmcoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh2YWxpZGF0ZSgpKSB7XHJcblx0XHRcdGlmICghX2lkIHx8IF9pZCA9PSAnbmV3JylcclxuXHRcdFx0XHRhd2FpdCB3ZWJBUEkuaW5zZXJ0VGFzayhfdGFzayk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRhd2FpdCB3ZWJBUEkudXBkYXRlVGFzayhfdGFzayk7XHJcblxyXG5cdFx0XHRiYWNrKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiYWNrKCkge1xyXG5cdFx0bG9jYXRpb24uaGFzaCA9ICd0YXNrcyc7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB2YWxpZGF0ZSgpIHtcclxuXHRcdGxldCBpc1ZhbGlkID0gdHJ1ZTtcclxuXHJcblx0XHQvLyBHZW5lcmFsXHJcblx0XHRjb25zdCAkZm9ybUdlbmVyYWwgPSAkcm9vdC5nZXQoJ2Zvcm0nKS5hdCgwKTtcclxuXHRcdGxldCAkaW52YWxpZEZpZWxkO1xyXG5cclxuXHRcdFsuLi4kZm9ybUdlbmVyYWwuYXR0cignZWxlbWVudHMnKV0uZm9yRWFjaChmaWVsZCA9PiB7XHJcblx0XHRcdGlmICghZmllbGQuY2hlY2tWYWxpZGl0eSgpICYmIGlzVmFsaWQpIHtcclxuXHRcdFx0XHQkaW52YWxpZEZpZWxkID0gZmllbGQ7XHJcblx0XHRcdFx0ZmllbGQuZm9jdXMoKTtcclxuXHRcdFx0XHRpc1ZhbGlkID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmICghaXNWYWxpZCkge1xyXG5cdFx0XHRUb2FzdCh7XHJcblx0XHRcdFx0aWNvbjogSWNvbignaW5mbycpLFxyXG5cdFx0XHRcdG1lc3NhZ2U6ICdGaWxsIGluIHRoZSByZXF1aXJlZCBmaWVsZHMuJyxcclxuXHRcdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSBjZW50ZXInLFxyXG5cdFx0XHRcdHRpbWU6IDRcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0YWJzLnNlbGVjdFRhYigwKTtcclxuXHRcdFx0JGludmFsaWRGaWVsZC5mb2N1cygpO1xyXG5cdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvYXN0SW5mbyhtZXNzYWdlKSB7XHJcblx0XHRpZiAoIW1lc3NhZ2UpIHJldHVybjtcclxuXHJcblx0XHRUb2FzdCh7XHJcblx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcclxuXHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0dGltZTogNFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2U7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuL0ljb24nO1xyXG5cclxuY29uc3QgUGFnZXIgPSAoeyBwYWdlSW5kZXggPSAwLCBsaW1pdCA9IDAsIHRvdGFsID0gMCwgb25QcmV2LCBvbk5leHQgfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiUGFnZXJcIj5cclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgb25DbGljaz17cHJldn0+XHJcblx0XHRcdFx0e0ljb24oJ2xlZnQnKX1cclxuXHRcdFx0PC9idXR0b24+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJwYWdlLXRvdGFsXCI+XHJcblx0XHRcdFx0PHNwYW4gY2xhc3M9XCJwYWdlXCI+e2xpbWl0fTwvc3Bhbj5cclxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInNlcGFyYXRvclwiPi88L3NwYW4+XHJcblx0XHRcdFx0PHNwYW4gY2xhc3M9XCJ0b3RhbFwiPnt0b3RhbH08L3NwYW4+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTBcIiBvbkNsaWNrPXtuZXh0fT5cclxuXHRcdFx0XHR7SWNvbigncmlnaHQnKX1cclxuXHRcdFx0PC9idXR0b24+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpLmhpZGUoKTtcclxuXHRjb25zdCAkcGFnZSA9ICRyb290LmdldCgnLnBhZ2UnKTtcclxuXHRjb25zdCAkdG90YWwgPSAkcm9vdC5nZXQoJy50b3RhbCcpO1xyXG5cdGNvbnN0ICRidXR0b25QcmV2ID0gJHJvb3QuZ2V0KCcuYnV0dG9uIHctMTAgaC0xMCcpLmF0KDApLmRpc2FibGUoKTtcclxuXHRjb25zdCAkYnV0dG9uTmV4dCA9ICRyb290LmdldCgnLmJ1dHRvbiB3LTEwIGgtMTAnKS5hdCgxKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0bGltaXQsXHJcblx0XHRzZXRQYWdlLFxyXG5cdFx0c2V0VG90YWwsXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gc2V0UGFnZShfcGFnZUluZGV4LCBpdGVtc0xlbmd0aCkge1xyXG5cdFx0cGFnZUluZGV4ID0gX3BhZ2VJbmRleDtcclxuXHRcdGl0ZW1zTGVuZ3RoICs9IF9wYWdlSW5kZXg7XHJcblxyXG5cdFx0JGJ1dHRvblByZXYuZGlzYWJsZShwYWdlSW5kZXggPD0gMCk7XHJcblxyXG5cdFx0aWYgKHBhZ2VJbmRleCA+IDAgJiYgaXRlbXNMZW5ndGggPj0gdG90YWwpIHtcclxuXHRcdFx0JGJ1dHRvbk5leHQuZGlzYWJsZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JGJ1dHRvbk5leHQuZGlzYWJsZShmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0JHBhZ2UudGV4dChpdGVtc0xlbmd0aCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRUb3RhbChfdG90YWwpIHtcclxuXHRcdHRvdGFsID0gX3RvdGFsO1xyXG5cclxuXHRcdGlmICgkcGFnZS50ZXh0KCkgPiB0b3RhbClcclxuXHRcdFx0JHBhZ2UudGV4dCh0b3RhbCk7XHJcblxyXG5cdFx0JHRvdGFsLnRleHQodG90YWwpO1xyXG5cdFx0JHJvb3Quc2hvdyh0b3RhbCA+IGxpbWl0KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHByZXYoKSB7XHJcblx0XHRwYWdlSW5kZXggLT0gbGltaXQ7XHJcblxyXG5cdFx0aWYgKG9uUHJldilcclxuXHRcdFx0b25QcmV2KHBhZ2VJbmRleCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBuZXh0KCkge1xyXG5cdFx0cGFnZUluZGV4ICs9IGxpbWl0O1xyXG5cclxuXHRcdGlmIChvbk5leHQpXHJcblx0XHRcdG9uTmV4dChwYWdlSW5kZXgpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2VyO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJy4uL3NlcnZpY2VzL1JvdXRlclNlcnZpY2UnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vbGliL1V0aWxzJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBQYWdlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBNZW51IGZyb20gJy4uL2xpYi9NZW51L01lbnUnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgVGFza0ZpbGVzUGFnZSA9ICgpID0+IHtcclxuXHRjb25zdCBoZWFkZXIgPSBQYWdlSGVhZGVyKHsgb25DbGlja0JhY2tCdXR0b246IGJhY2sgfSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdyZWZyZXNoJyxcclxuXHRcdFx0XHR0b29sdGlwOiAnUmVmcmVzaCcsXHJcblx0XHRcdFx0aWNvbjogSWNvbigncmVmcmVzaCcpLFxyXG5cdFx0XHRcdHN0eWxlOiAnbWFyZ2luLWxlZnQ6IDAuOGVtOycsXHJcblx0XHRcdFx0b25DbGljazogcmVmcmVzaFxyXG5cdFx0XHR9LFxyXG5cdFx0XVxyXG5cdH0pO1xyXG5cdGNvbnN0IHBhZ2VyID0gUGFnZXIoe1xyXG5cdFx0bGltaXQ6IDEwMCxcclxuXHRcdG9uUHJldjogcGFnZUluZGV4ID0+IHNlYXJjaChwYWdlSW5kZXgpLFxyXG5cdFx0b25OZXh0OiBwYWdlSW5kZXggPT4gc2VhcmNoKHBhZ2VJbmRleCksXHJcblx0fSk7XHJcblx0Y29uc3QgY2hlY2tib3hFbmFibGVFeGNlcHRpb25zID0gKFxyXG5cdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuXHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVFeGNlcHRpb25zXCIgb25DbGljaz17cmVmcmVzaH0gLz5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWVcIj5cclxuXHRcdFx0XHQ8Yj5FbmFibGUgZXhjZXB0aW9uczwvYj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2xhYmVsPlxyXG5cdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogW1xyXG5cdFx0XHRcdGNoZWNrYm94RW5hYmxlRXhjZXB0aW9ucyxcclxuXHRcdFx0XHRhY3Rpb25CYXIuZWxlbWVudCxcclxuXHRcdFx0XHRwYWdlci5lbGVtZW50LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRjb250ZW50OiBudWxsLFxyXG5cdFx0fSxcclxuXHRcdG9uU2hvdyxcclxuXHRcdG9uSGlkZSxcclxuXHR9O1xyXG5cdGxldCBfdGFzaztcclxuXHRsZXQgX3NlbGVjdGVkUm93O1xyXG5cdGxldCBfZGF0YVRhYmxlO1xyXG5cdGxldCBfZmlsZXNDb250ZXh0TWVudTtcclxuXHJcblx0c2V0RGF0YVRhYmxlKCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRjb25zdCB0YXNrSWQgPSByb3V0ZXIuY3VycmVudC5oYXNoUGFydHNbMV07XHJcblx0XHRfdGFzayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rhc2snKSB8fCBudWxsKSB8fCAoYXdhaXQgd2ViQVBJLmdldFRhc2tCeUlkKHRhc2tJZCkpLnJlc3VsdDtcclxuXHJcblx0XHRpZiAoIV90YXNrKSByZXR1cm47XHJcblxyXG5cdFx0Ly8gVGFza3MgPiBUYXNrID4gRmlsZXNcclxuXHRcdGhlYWRlci5zZXRQYWdlTWFwKFtcclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gbG9jYXRpb24uaGFzaCA9ICd0YXNrcyd9PlRhc2tzPC9idXR0b24+LCAvLyB2b2x0YSBwYXJhIHBcdTAwRTFnaW5hIHRhc2tzIGUgc2VsZWNpb25hIG8gaXRlbSBuYSBsaXN0YVxyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBsb2NhdGlvbi5oYXNoID0gJ3Rhc2svJyArIF90YXNrLmlkfSB0aXRsZT17X3Rhc2submFtZX0+XHJcblx0XHRcdFx0e3V0aWxzLnRydW5jYXRlVGV4dChfdGFzay5uYW1lLCA2MCkgfHwgJ05ldyB0YXNrJ31cclxuXHRcdFx0PC9idXR0b24+LCAvLyB2b2x0YSBwYXJhIHBcdTAwRTFnaW5hIHRhc2sgZSBzZWxlY2lvbmEgYXMgXHUwMEZBbHRpbWFzIHRhYnNcclxuXHRcdFx0PHNwYW4+RmlsZXM8L3NwYW4+XHJcblx0XHRdKTtcclxuXHJcblx0XHRfZmlsZXNDb250ZXh0TWVudSA9IE1lbnUoe1xyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ1JlZnJlc2gnLCBpY29uOiBJY29uKCdyZWZyZXNoJyksIG9uQ2xpY2s6IHNlYXJjaCB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ09wZW4gZmlsZScsIGljb246IEljb24oJ29wZW4nKSwgb25DbGljazogb3BlbkZpbGUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdWaWV3IGluIGZpbGUgZXhwbG9yZXInLCBpY29uOiBJY29uKCdmb2xkZXJTZWFyY2gnKSwgb25DbGljazogdmlld0luRmlsZUV4cGxvcmVyIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ29weScsIGljb246IEljb24oJ2NvcHknKSwgb25DbGljazogY29weUNsaXBJdGVtcyB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNlYXJjaCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25IaWRlKCkge1xyXG5cdFx0X2RhdGFUYWJsZS5kZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0aWQ6ICd0YXNrZmlsZXMnLFxyXG5cdFx0XHRoZWlnaHQ6ICcxMDAlJyxcclxuXHRcdFx0c29ydDogdHJ1ZSxcclxuXHRcdFx0cmVzaXplOiB0cnVlLFxyXG5cdFx0XHRjb2x1bW5zOiB7XHJcblx0XHRcdFx0cGF0aDogeyBkaXNwbGF5TmFtZTogJ1BhdGgnLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0dHlwZTogeyBkaXNwbGF5TmFtZTogJ1R5cGUnLCB3aWR0aDogOTAgfSxcclxuXHRcdFx0XHR3aWR0aDogeyBkaXNwbGF5TmFtZTogJ1dpZHRoIChweCknLCB3aWR0aDogMTEwIH0sXHJcblx0XHRcdFx0aGVpZ2h0OiB7IGRpc3BsYXlOYW1lOiAnSGVpZ2h0IChweCknLCB3aWR0aDogMTEwIH0sXHJcblx0XHRcdFx0d2lkdGhIZWlnaHRSYXRpbzogeyBkaXNwbGF5TmFtZTogJ1cvSCBSYXRpbycsIHdpZHRoOiAxMDAgfSxcclxuXHRcdFx0XHRzaXplOiB7IGRpc3BsYXlOYW1lOiAnU2l6ZSAoTUIpJywgd2lkdGg6IDEwMCB9LFxyXG5cdFx0XHRcdGNyZWF0ZWQ6IHsgZGlzcGxheU5hbWU6ICdDcmVhdGVkJywgd2lkdGg6IDEzMCB9LFxyXG5cdFx0XHRcdG1vZGlmaWVkOiB7IGRpc3BsYXlOYW1lOiAnTW9kaWZpZWQnIH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IHRydWUsXHJcblx0XHRcdH0sXHJcblx0XHRcdGNlbGxzOiB7XHJcblx0XHRcdFx0cGF0aDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBvbkNsaWNrPXtvcGVuRmlsZX0gY2xhc3M9XCJsaW5rXCIgc3R5bGU9XCJvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcIj57dmFsdWV9PC9hPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dHlwZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUudG9VcHBlckNhc2UoKS5zdWJzdHJpbmcoMSlcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNpemU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+ICh2YWx1ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDQpIC8vIE1CXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjcmVhdGVkOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxzcGFuPntcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi11cycsIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHRcdHRpbWVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHR9KS5mb3JtYXQobmV3IERhdGUodmFsdWUpKSA6ICcnXHJcblx0XHRcdFx0XHRcdH08L3NwYW4+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRtb2RpZmllZDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQWRkUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdGRvbShyb3cuZWxlbWVudCkub24oJ2NvbnRleHRtZW51JywgKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFyb3cuaXNTZWxlY3RlZClcclxuXHRcdFx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cclxuXHRcdFx0XHRcdF9maWxlc0NvbnRleHRNZW51LnNob3coZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkRvdWJsZUNsaWNrUm93OiAoeyByb3csIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRvcGVuRmlsZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uU2VsZWN0Um93czogKHsgcm93cyB9KSA9PiB7XHJcblx0XHRcdFx0X3NlbGVjdGVkUm93ID0gcm93c1swXTtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVuc2VsZWN0Um93czogKCkgPT4ge1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Db3B5Q2xpcDogKHsgdGV4dCB9KSA9PiB7XHJcblx0XHRcdFx0Y29weUNsaXBJdGVtcygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNsaWNrT3V0OiAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZXZlbnQuY2FuY2VsVW5zZWxlY3RSb3dzID0gISFldmVudC50YXJnZXQuY2xvc2VzdCgnLmFjdGlvbmJhcicpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y29udGV4dC5lbGVtZW50cy5jb250ZW50ID0gX2RhdGFUYWJsZS5lbGVtZW50O1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gc2VhcmNoKHBhZ2VJbmRleCA9IDApIHtcclxuXHRcdGRvbSgnLmljb24ucmVmcmVzaCcpLmFkZENsYXNzKCdzcGluJyk7XHJcblx0XHRfZGF0YVRhYmxlLmNsZWFyKCk7XHJcblx0XHRzZXRGb290ZXIoKTtcclxuXHJcblx0XHRsZXQgZW5hYmxlRXhjZXB0aW9ucyA9IGRvbShjaGVja2JveEVuYWJsZUV4Y2VwdGlvbnMpLmdldCgnaW5wdXQnKS5hdHRyKCdjaGVja2VkJyk7XHJcblx0XHRjb25zdCB7IHJlc3VsdCB9ID0gYXdhaXQgd2ViQVBJLnNlYXJjaFRhc2tGaWxlc1BhZ2VkKF90YXNrLCBlbmFibGVFeGNlcHRpb25zLCBwYWdlSW5kZXgsIHBhZ2VyLmxpbWl0KTtcclxuXHJcblx0XHRpZiAocmVzdWx0Lml0ZW1zKSB7XHJcblx0XHRcdHBhZ2VyLnNldFBhZ2UocGFnZUluZGV4LCByZXN1bHQuaXRlbXMubGVuZ3RoKTtcclxuXHRcdFx0cGFnZXIuc2V0VG90YWwocmVzdWx0LnRvdGFsKTtcclxuXHRcdFx0c2V0Rm9vdGVyKHJlc3VsdC50b3RhbCk7XHJcblx0XHRcdF9kYXRhVGFibGUubG9hZChyZXN1bHQuaXRlbXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRvbSgnLmljb24ucmVmcmVzaCcpLnJlbW92ZUNsYXNzKCdzcGluJyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiByZWZyZXNoKCkge1xyXG5cdFx0c2VhcmNoKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvcGVuRmlsZShldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnBvaW50ZXJJZCAmJiBldmVudC5wb2ludGVySWQgIT0gMSkgcmV0dXJuOyAvLyBzb21lbnRlIGJvdFx1MDBFM28gcHJpbmNpcGFsIGRvIG1vdXNlXHJcblxyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS5vcGVuRmlsZShfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmlld0luRmlsZUV4cGxvcmVyKCkge1xyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS52aWV3SW5GaWxlRXhwbG9yZXIoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvcHlDbGlwSXRlbXMoKSB7XHJcblx0XHR3ZWJBUEkuY29weUNsaXAoX2RhdGFUYWJsZS5leHBvcnQoKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRGb290ZXIodG90YWwpIHtcclxuXHRcdHNoYXJlZC5mb290ZXIuaW5mbyhgJHt0b3RhbCB8fCAnTm8nfSBmaWxlcyBmb3VuZGApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmFjaygpIHtcclxuXHRcdGhpc3RvcnkuYmFjaygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0FjdGlvbkJhckJ1dHRvbnMoc2hvdyA9IHRydWUpIHtcclxuXHRcdC8vLi5cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrRmlsZXNQYWdlO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgUGFnZUhlYWRlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXInO1xyXG5pbXBvcnQgQWN0aW9uQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvQWN0aW9uQmFyJztcclxuaW1wb3J0IFBhZ2VyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZXInO1xyXG5pbXBvcnQgRGF0YVRhYmxlIGZyb20gJy4uL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4JztcclxuaW1wb3J0IE1vZGFsIGZyb20gJy4uL2xpYi9Nb2RhbC9Nb2RhbCc7XHJcbmltcG9ydCBNZW51IGZyb20gJy4uL2xpYi9NZW51L01lbnUnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgSGlzdG9yeVBhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7XHJcblx0XHRwYWdlTWFwOiBbJ0hpc3RvcnknXSxcclxuXHRcdGRlc2NyaXB0aW9uOiAnTW9uaXRvciB0YXNrIGV4ZWN1dGlvbiBoaXN0b3J5IGFuZCBicm93c2Ugb3B0aW1pemVkIGZpbGVzLidcclxuXHR9KTtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSBBY3Rpb25CYXIoe1xyXG5cdFx0YnV0dG9uczogW1xyXG5cdFx0XHR7IG5hbWU6ICdoaXN0b3J5TWVudScsIHRvb2x0aXA6ICcnLCBpY29uOiBJY29uKCdlbGxpcHNpc1ZlcnRpY2FsJykgfSxcclxuXHRcdFx0eyB0b29sdGlwOiAnUmVmcmVzaCcsIGljb246IEljb24oJ3JlZnJlc2gnKSwgb25DbGljazogcmVmcmVzaCB9LFxyXG5cdFx0XHR7IG5hbWU6ICd2aWV3RmlsZXMnLCB0b29sdGlwOiAnVmlldyBmaWxlcycsIGljb246IEljb24oJ3NlYXJjaCcpLCBvbkNsaWNrOiB2aWV3RmlsZXMgfSxcclxuXHRcdF1cclxuXHR9KTtcclxuXHRjb25zdCBwYWdlciA9IFBhZ2VyKHtcclxuXHRcdGxpbWl0OiAxMDAsXHJcblx0XHRvblByZXY6IHBhZ2VJbmRleCA9PiBsb2FkKHBhZ2VJbmRleCksXHJcblx0XHRvbk5leHQ6IHBhZ2VJbmRleCA9PiBsb2FkKHBhZ2VJbmRleCksXHJcblx0fSk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogW1xyXG5cdFx0XHRcdGFjdGlvbkJhci5lbGVtZW50LFxyXG5cdFx0XHRcdHBhZ2VyLmVsZW1lbnQsXHJcblx0XHRcdF0sXHJcblx0XHRcdGNvbnRlbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0ZGF0YVRhYmxlOiBudWxsLFxyXG5cdFx0b25TaG93LFxyXG5cdFx0b25IaWRlLFxyXG5cdH07XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblx0bGV0IF9zZWxlY3RlZFJvdztcclxuXHRsZXQgX2hpc3RvcnlDb250ZXh0TWVudTtcclxuXHJcblx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0YXdhaXQgbG9hZCgpO1xyXG5cclxuXHRcdGNvbnN0IGlkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJyk7XHJcblxyXG5cdFx0aWYgKGlkKSB7XHJcblx0XHRcdGNvbnN0IHJvdyA9IF9kYXRhVGFibGUucm93c0J5RmllbGRWYWx1ZSgnaGlzdG9yeUZpbGVOYW1lJywgaWQpWzBdO1xyXG5cclxuXHRcdFx0Ly8gc2VsZWNpb25hIG8gaXRlbVxyXG5cdFx0XHRpZiAocm93KSB7XHJcblx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgJycpO1xyXG5cclxuXHRcdC8vIE1lbnVzXHJcblx0XHRNZW51KHtcclxuXHRcdFx0dHJpZ2dlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9aGlzdG9yeU1lbnVdJyksXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnRXhwb3J0IGhpc3RvcnknLCBpY29uOiBJY29uKCdzaGVldCcpLCBvbkNsaWNrOiBleHBvcnRIaXN0b3J5IH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0X2hpc3RvcnlDb250ZXh0TWVudSA9IE1lbnUoe1xyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ1JlZnJlc2gnLCBpY29uOiBJY29uKCdyZWZyZXNoJyksIG9uQ2xpY2s6IHJlZnJlc2ggfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdWaWV3IGZpbGVzJywgaWNvbjogSWNvbignc2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdGaWxlcyB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgaW4gZmlsZSBleHBsb3JlcicsIGljb246IEljb24oJ2ZvbGRlclNlYXJjaCcpLCBvbkNsaWNrOiB2aWV3SW5GaWxlRXhwbG9yZXIgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBvbkNsaWNrOiBjb3B5Q2xpcEl0ZW1zIH0sXHJcblx0XHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRGVsZXRlJywgaWNvbjogSWNvbigndHJhc2gnKSwgb25DbGljazogZGVsZXRlSXRlbSB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25IaWRlKCkge1xyXG5cdFx0X2RhdGFUYWJsZS5kZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0aWQ6ICdoaXN0b3J5JyxcclxuXHRcdFx0aGVpZ2h0OiAnMTAwJScsXHJcblx0XHRcdHNvcnQ6IHRydWUsXHJcblx0XHRcdHJlc2l6ZTogdHJ1ZSxcclxuXHRcdFx0Y29sdW1uczoge1xyXG5cdFx0XHRcdGlkOiB7IGRpc3BsYXlOYW1lOiAnSWQnLCBoaWRkZW46IHRydWUgfSxcclxuXHRcdFx0XHR0YXNrSWQ6IHsgZGlzcGxheU5hbWU6ICdUYXNrIElkJywgaGlkZGVuOiB0cnVlIH0sXHJcblx0XHRcdFx0aGlzdG9yeUZpbGVOYW1lOiB7IGRpc3BsYXlOYW1lOiAnSGlzdG9yeUZpbGVOYW1lJywgaGlkZGVuOiB0cnVlIH0sXHJcblx0XHRcdFx0ZGF0ZVRpbWU6IHsgZGlzcGxheU5hbWU6ICdEYXRlL1RpbWUnLCB3aWR0aDogMTMwIH0sXHJcblx0XHRcdFx0bmFtZTogeyBkaXNwbGF5TmFtZTogJ1Rhc2snLCB3aWR0aDogMTcwIH0sXHJcblx0XHRcdFx0YWN0aW9uOiB7IGRpc3BsYXlOYW1lOiAnQWN0aW9uJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdHN0YXR1czogeyBkaXNwbGF5TmFtZTogJ1N0YXR1cycsIHdpZHRoOiA5MCB9LFxyXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB7IGRpc3BsYXlOYW1lOiAnRGVzY3JpcHRpb24nLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0cGF0aDogeyBkaXNwbGF5TmFtZTogJ1BhdGgnIH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IHRydWUsXHJcblx0XHRcdH0sXHJcblx0XHRcdGNlbGxzOiB7XHJcblx0XHRcdFx0ZGF0ZVRpbWU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0YXR1czoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUgPyA8ZGl2IGNsYXNzPVwiY2hpcHNcIj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hpcFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdHNoYXJlZC5jb25zdGFudHMuc3RhdHVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gdmFsdWUpPy5kaXNwbGF5TmFtZVxyXG5cdFx0XHRcdFx0XHRcdH08L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+IDogJyc7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0c3R5bGU6IHsgcGFkZGluZzogJzVweCA4cHggIWltcG9ydGFudCcgfSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBhdGg6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6XCIgb25DbGljaz17dmlld0luRmlsZUV4cGxvcmVyfSBjbGFzcz1cImxpbmtcIiBzdHlsZT1cIm92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1wiPnt2YWx1ZX08L2E+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdFx0b25BZGRSb3c6ICh7IHJvdyB9KSA9PiB7XHJcblx0XHRcdFx0ZG9tKHJvdy5lbGVtZW50KS5vbignY29udGV4dG1lbnUnLCAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoIXJvdy5pc1NlbGVjdGVkKVxyXG5cdFx0XHRcdFx0XHRyb3cuc2VsZWN0KCk7XHJcblxyXG5cdFx0XHRcdFx0X2hpc3RvcnlDb250ZXh0TWVudS5zaG93KGV2ZW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRfc2VsZWN0ZWRSb3cgPSByb3dzWzBdO1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uVW5zZWxlY3RSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkRvdWJsZUNsaWNrUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdHZpZXdGaWxlcygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNvcHlDbGlwOiAoeyB0ZXh0IH0pID0+IHtcclxuXHRcdFx0XHRjb3B5Q2xpcEl0ZW1zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ2xpY2tPdXQ6ICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRldmVudC5jYW5jZWxVbnNlbGVjdFJvd3MgPSAhIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuYWN0aW9uYmFyJyk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRjb250ZXh0LmVsZW1lbnRzLmNvbnRlbnQgPSBfZGF0YVRhYmxlLmVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBsb2FkKHBhZ2VJbmRleCA9IDApIHtcclxuXHRcdGRvbSgnLmljb24ucmVmcmVzaCcpLmFkZENsYXNzKCdzcGluJyk7XHJcblx0XHRzZXRGb290ZXIoKTtcclxuXHJcblx0XHRjb25zdCB7IHJlc3VsdCB9ID0gYXdhaXQgd2ViQVBJLmdldEhpc3RvcnlQYWdlZChwYWdlSW5kZXgsIHBhZ2VyLmxpbWl0KTtcclxuXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHBhZ2VyLnNldFBhZ2UocGFnZUluZGV4LCByZXN1bHQuaXRlbXMubGVuZ3RoKTtcclxuXHRcdFx0cGFnZXIuc2V0VG90YWwocmVzdWx0LnRvdGFsKTtcclxuXHRcdFx0X2RhdGFUYWJsZS5sb2FkKHJlc3VsdC5pdGVtcyk7XHJcblx0XHRcdHNldEZvb3RlcihyZXN1bHQudG90YWwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRvbSgnLmljb24ucmVmcmVzaCcpLnJlbW92ZUNsYXNzKCdzcGluJyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiByZWZyZXNoKCkge1xyXG5cdFx0bG9hZCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmlld0luRmlsZUV4cGxvcmVyKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQucG9pbnRlcklkICYmIGV2ZW50LnBvaW50ZXJJZCAhPSAxKSByZXR1cm47IC8vIHNvbWVudGUgYm90XHUwMEUzbyBwcmluY2lwYWwgZG8gbW91c2VcclxuXHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLnZpZXdJbkZpbGVFeHBsb3Jlcihfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29weUNsaXBJdGVtcygpIHtcclxuXHRcdHdlYkFQSS5jb3B5Q2xpcChfZGF0YVRhYmxlLmV4cG9ydCgpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdGaWxlcygpIHtcclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXN0T3BlbmVkSXRlbScsIF9zZWxlY3RlZFJvdy5kYXRhKCkuaGlzdG9yeUZpbGVOYW1lKTtcclxuXHRcdGxvY2F0aW9uLmhhc2ggPSAnaGlzdG9yeWZpbGVzLycgKyBfc2VsZWN0ZWRSb3cuZGF0YSgpLmhpc3RvcnlGaWxlTmFtZTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUl0ZW0oKSB7XHJcblx0XHRjb25zdCBtb2RhbCA9IE1vZGFsKHtcclxuXHRcdFx0dGl0bGU6ICdEZWxldGUgcmVnaXN0cnknLFxyXG5cdFx0XHRjb250ZW50OiAnVGhlIHNlbGVjdGVkIGl0ZW0ocykgd2lsbCBiZSBwZXJtYW5lbnRseSBkZWxldGVkLjxicj48YnI+RG8geW91IHdpc2ggdG8gY29udGludWU/JyxcclxuXHRcdFx0YnV0dG9uczogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5hbWU6ICdPSycsIHByaW1hcnk6IHRydWUsIG9uQ2xpY2s6IGFzeW5jICgpID0+IHtcclxuXHRcdFx0XHRcdFx0bW9kYWwuYmxvY2soKTtcclxuXHRcdFx0XHRcdFx0bW9kYWwuc2hvd1NwaW4oKTtcclxuXHRcdFx0XHRcdFx0YXdhaXQgX2RlbGV0ZSgpO1xyXG5cdFx0XHRcdFx0XHRtb2RhbC5ibG9jayhmYWxzZSk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmhpZGUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NhbmNlbCcgfVxyXG5cdFx0XHRdXHJcblx0XHR9KTtcclxuXHJcblx0XHRtb2RhbC5zaG93KCk7XHJcblxyXG5cdFx0YXN5bmMgZnVuY3Rpb24gX2RlbGV0ZSgpIHtcclxuXHRcdFx0bGV0IHJvd3MgPSBfZGF0YVRhYmxlLnNlbGVjdGVkUm93cygpO1xyXG5cdFx0XHRsZXQgaWRzID0gcm93cy5tYXAoeCA9PiB4LmRhdGEoKS5pZCkuam9pbignLCcpO1xyXG5cclxuXHRcdFx0Y29uc3QgeyByZXN1bHQ6IHRvdGFsLCBlcnJvciB9ID0gYXdhaXQgd2ViQVBJLmRlbGV0ZUhpc3RvcnlFdmVudHMoaWRzKTtcclxuXHJcblx0XHRcdGlmICghZXJyb3IpIHtcclxuXHRcdFx0XHRwYWdlci5zZXRUb3RhbCh0b3RhbCk7XHJcblx0XHRcdFx0c2V0Rm9vdGVyKHRvdGFsKTtcclxuXHRcdFx0XHRfZGF0YVRhYmxlLnJlbW92ZVNlbGVjdGVkUm93cygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBleHBvcnRIaXN0b3J5KCkge1xyXG5cdFx0Y29uc3QgZmlsZU5hbWUgPSAnSGlzdG9yeS54bHN4JztcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuc2F2ZUZpbGVQaWNrZXIoJ0V4cG9ydCBoaXN0b3J5JywgZmlsZU5hbWUsICd4bHN4Jyk7XHJcblxyXG5cdFx0aWYgKHBhdGgpXHJcblx0XHRcdHdlYkFQSS5leHBvcnRIaXN0b3J5KCdIaXN0b3J5JywgcGF0aCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRGb290ZXIodG90YWwpIHtcclxuXHRcdHNoYXJlZC5mb290ZXIuaW5mbyhgJHt0b3RhbCB8fCAnTm8nfSBleGVjdXRpb25zYCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93QWN0aW9uQmFyQnV0dG9ucyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0YWN0aW9uQmFyLmVsZW1lbnQuZ2V0KCdbbmFtZT12aWV3RmlsZXNdJykuc2hvdyhzaG93KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5UGFnZTtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uL2xpYi9VdGlscyc7XHJcbmltcG9ydCBQYWdlSGVhZGVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZUhlYWRlcic7XHJcbmltcG9ydCBBY3Rpb25CYXIgZnJvbSAnLi4vY29tcG9uZW50cy9BY3Rpb25CYXInO1xyXG5pbXBvcnQgUGFnZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlcic7XHJcbmltcG9ydCBEYXRhVGFibGUgZnJvbSAnLi4vbGliL0RhdGFUYWJsZS9zcmMvaW5kZXgnO1xyXG5pbXBvcnQgTWVudSBmcm9tICcuLi9saWIvTWVudS9NZW51JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IEhpc3RvcnlGaWxlc1BhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7XHJcblx0XHRvbkNsaWNrQmFja0J1dHRvbjogYmFjayxcclxuXHRcdGRlc2NyaXB0aW9uOiAnUHJvY2Vzc2VkIGZpbGVzIGFuZCBvcHRpbWl6YXRpb24gZGV0YWlscy4nLFxyXG5cdH0pO1xyXG5cdGNvbnN0IGFjdGlvbkJhciA9IEFjdGlvbkJhcih7XHJcblx0XHRidXR0b25zOiBbXHJcblx0XHRcdHsgbmFtZTogJ3BhZ2VNZW51JywgdG9vbHRpcDogJycsIGljb246IEljb24oJ2VsbGlwc2lzVmVydGljYWwnKSB9LFxyXG5cdFx0XHR7IHRvb2x0aXA6ICdSZWZyZXNoJywgaWNvbjogSWNvbigncmVmcmVzaCcpLCBvbkNsaWNrOiByZWZyZXNoIH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3QgcGFnZXIgPSBQYWdlcih7XHJcblx0XHRsaW1pdDogMTAwLFxyXG5cdFx0b25QcmV2OiBwYWdlSW5kZXggPT4gbG9hZChwYWdlSW5kZXgpLFxyXG5cdFx0b25OZXh0OiBwYWdlSW5kZXggPT4gbG9hZChwYWdlSW5kZXgpLFxyXG5cdH0pO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRoZWFkZXI6IGhlYWRlci5lbGVtZW50LFxyXG5cdFx0XHRhY3Rpb25CYXI6IFtcclxuXHRcdFx0XHRhY3Rpb25CYXIuZWxlbWVudCxcclxuXHRcdFx0XHRwYWdlci5lbGVtZW50LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRjb250ZW50OiBudWxsLFxyXG5cdFx0fSxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cdGNvbnN0IF9oaXN0b3J5RmlsZU5hbWUgPSBsb2NhdGlvbi5oYXNoLnNwbGl0KCcvJylbMV07XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblx0bGV0IF9zZWxlY3RlZFJvdztcclxuXHRsZXQgX2ZpbGVzQ29udGV4dE1lbnU7XHJcblxyXG5cdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRzZXREYXRhVGFibGUoKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdGNvbnN0IF90YXNrSWQgPSBfaGlzdG9yeUZpbGVOYW1lLnNwbGl0KCdfJylbMF07XHJcblx0XHRjb25zdCB7IHJlc3VsdDogdGFzayB9ID0gYXdhaXQgd2ViQVBJLmdldFRhc2tCeUlkKF90YXNrSWQpO1xyXG5cclxuXHRcdC8vIEhpc3RvcnkgPiBUYXNrID4gRmlsZXNcclxuXHRcdGhlYWRlci5zZXRQYWdlTWFwKFtcclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17YmFja30+SGlzdG9yeTwvYnV0dG9uPixcclxuXHRcdFx0PHNwYW4gdGl0bGU9e3Rhc2submFtZX0+e3V0aWxzLnRydW5jYXRlVGV4dCh0YXNrLm5hbWUsIDYwKX08L3NwYW4+LFxyXG5cdFx0XHQ8c3Bhbj5GaWxlczwvc3Bhbj5cclxuXHRcdF0pO1xyXG5cclxuXHRcdC8vIE1lbnVzXHJcblx0XHRNZW51KHtcclxuXHRcdFx0dHJpZ2dlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9cGFnZU1lbnVdJyksXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnRXhwb3J0IGZpbGVzJywgaWNvbjogSWNvbignc2hlZXQnKSwgb25DbGljazogZXhwb3J0SGlzdG9yeSB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdF9maWxlc0NvbnRleHRNZW51ID0gTWVudSh7XHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnUmVmcmVzaCcsIGljb246IEljb24oJ3JlZnJlc2gnKSwgb25DbGljazogcmVmcmVzaCB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ09wZW4gZmlsZScsIGljb246IEljb24oJ29wZW4nKSwgb25DbGljazogb3BlbkZpbGUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdWaWV3IGluIGZpbGUgZXhwbG9yZXInLCBpY29uOiBJY29uKCdmb2xkZXJTZWFyY2gnKSwgb25DbGljazogdmlld0luRmlsZUV4cGxvcmVyIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ29weScsIGljb246IEljb24oJ2NvcHknKSwgb25DbGljazogY29weUNsaXBJdGVtcyB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGF3YWl0IGxvYWQoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldERhdGFUYWJsZSgpIHtcclxuXHRcdF9kYXRhVGFibGUgPSBEYXRhVGFibGUoe1xyXG5cdFx0XHRpZDogJ2hpc3RvcnlmaWxlcycsXHJcblx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRyZXNpemU6IHRydWUsXHJcblx0XHRcdHNvcnQ6IHRydWUsXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRkYXRlVGltZTogeyBkaXNwbGF5TmFtZTogJ0RhdGUvVGltZScsIHdpZHRoOiAxNDAgfSxcclxuXHRcdFx0XHRwYXRoOiB7IGRpc3BsYXlOYW1lOiAnUGF0aCcsIHdpZHRoOiAzMDAgfSxcclxuXHRcdFx0XHRhY3Rpb246IHsgZGlzcGxheU5hbWU6ICdBY3Rpb24nLCB3aWR0aDogMTQwIH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7IGRpc3BsYXlOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiB7IGRpc3BsYXlOYW1lOiAnRGVzY3JpcHRpb24nLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0c2l6ZVB4OiB7IGRpc3BsYXlOYW1lOiAnU2l6ZSAocHgpJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdG5ld1NpemVQeDogeyBkaXNwbGF5TmFtZTogJ05ldyBTaXplIChweCknLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0c2l6ZUJ5dGVzOiB7IGRpc3BsYXlOYW1lOiAnU2l6ZSAoTUIpJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdG5ld1NpemVCeXRlczogeyBkaXNwbGF5TmFtZTogJ05ldyBTaXplIChNQiknLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0Y29tcHJlc3Npb246IHsgZGlzcGxheU5hbWU6ICdDb21wcmVzc2lvbicsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHR0eXBlOiB7IGRpc3BsYXlOYW1lOiAnVHlwZScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRuZXdUeXBlOiB7IGRpc3BsYXlOYW1lOiAnTmV3IFR5cGUnIH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IHRydWUsXHJcblx0XHRcdH0sXHJcblx0XHRcdGNlbGxzOiB7XHJcblx0XHRcdFx0ZGF0ZVRpbWU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBhdGg6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6XCIgb25DbGljaz17b3BlbkZpbGV9IGNsYXNzPVwibGlua1wiIHN0eWxlPVwib3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XCI+e3ZhbHVlfTwvYT5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0YXR1czoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUgPyA8ZGl2IGNsYXNzPVwiY2hpcHNcIj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hpcFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdHNoYXJlZC5jb25zdGFudHMuc3RhdHVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gdmFsdWUpPy5kaXNwbGF5TmFtZVxyXG5cdFx0XHRcdFx0XHRcdH08L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+IDogJyc7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0c3R5bGU6IHsgcGFkZGluZzogJzVweCA4cHggIWltcG9ydGFudCcgfSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNpemVCeXRlczoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKHZhbHVlIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoNCkgLy8gTUJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG5ld1NpemVCeXRlczoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKHZhbHVlIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoNCkgLy8gTUJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbXByZXNzaW9uOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiBgJHtOdW1iZXIodmFsdWUpLnRvRml4ZWQoMil9JWBcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHR5cGU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG5ld1R5cGU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRkb20ocm93LmVsZW1lbnQpLm9uKCdjb250ZXh0bWVudScsICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRcdGlmICghcm93LmlzU2VsZWN0ZWQpXHJcblx0XHRcdFx0XHRcdHJvdy5zZWxlY3QoKTtcclxuXHJcblx0XHRcdFx0XHRfZmlsZXNDb250ZXh0TWVudS5zaG93KGV2ZW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRfc2VsZWN0ZWRSb3cgPSByb3dzWzBdO1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uVW5zZWxlY3RSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkRvdWJsZUNsaWNrUm93OiAoeyByb3csIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRvcGVuRmlsZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ29weUNsaXA6ICh7IHRleHQgfSkgPT4ge1xyXG5cdFx0XHRcdGNvcHlDbGlwSXRlbXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25DbGlja091dDogKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cyA9ICEhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5hY3Rpb25iYXInKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnRleHQuZWxlbWVudHMuY29udGVudCA9IF9kYXRhVGFibGUuZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWQocGFnZUluZGV4ID0gMCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQgfSA9IGF3YWl0IHdlYkFQSS5nZXRJdGVtc0Zyb21IaXN0b3J5RmlsZVBhZ2VkKF9oaXN0b3J5RmlsZU5hbWUsIHBhZ2VJbmRleCwgcGFnZXIubGltaXQpO1xyXG5cclxuXHRcdHNldEZvb3RlcigpO1xyXG5cclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0cGFnZXIuc2V0UGFnZShwYWdlSW5kZXgsIHJlc3VsdC5pdGVtcy5sZW5ndGgpO1xyXG5cdFx0XHRwYWdlci5zZXRUb3RhbChyZXN1bHQudG90YWwpO1xyXG5cdFx0XHRfZGF0YVRhYmxlLmxvYWQocmVzdWx0Lml0ZW1zKTtcclxuXHRcdFx0c2V0Rm9vdGVyKHJlc3VsdC50b3RhbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiByZWZyZXNoKCkge1xyXG5cdFx0bG9hZCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb3BlbkZpbGUoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudC5wb2ludGVySWQgJiYgZXZlbnQucG9pbnRlcklkICE9IDEpIHJldHVybjsgLy8gc29tZW50ZSBib3RcdTAwRTNvIHByaW5jaXBhbCBkbyBtb3VzZVxyXG5cclxuXHRcdC8vIHNldFRpbWVvdXQgbmVjZXNzXHUwMEUxcmlvIHBhcmEgcXVlIHNlbGVjdGVkUm93IHNlamEgYXR1YWxpemFkb1xyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB3ZWJBUEkub3BlbkZpbGUoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdJbkZpbGVFeHBsb3JlcigpIHtcclxuXHRcdC8vIHNldFRpbWVvdXQgbmVjZXNzXHUwMEUxcmlvIHBhcmEgcXVlIHNlbGVjdGVkUm93IHNlamEgYXR1YWxpemFkb1xyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB3ZWJBUEkudmlld0luRmlsZUV4cGxvcmVyKF9zZWxlY3RlZFJvdy5kYXRhKCkucGF0aCksIDIwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5Q2xpcEl0ZW1zKCkge1xyXG5cdFx0d2ViQVBJLmNvcHlDbGlwKF9kYXRhVGFibGUuZXhwb3J0KCkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0Rm9vdGVyKHRvdGFsKSB7XHJcblx0XHRzaGFyZWQuZm9vdGVyLmluZm8oYCR7dG90YWwgfHwgJ05vJ30gZmlsZXNgKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJhY2soKSB7XHJcblx0XHRoaXN0b3J5LmJhY2soKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEhpc3RvcnkoKSB7XHJcblx0XHRjb25zdCBmaWxlTmFtZSA9ICdIaXN0b3J5IGZpbGVzLnhsc3gnO1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHBhdGggfSA9IGF3YWl0IHdlYkFQSS5zYXZlRmlsZVBpY2tlcignRXhwb3J0IGZpbGVzJywgZmlsZU5hbWUsICd4bHN4Jyk7XHJcblxyXG5cdFx0aWYgKHBhdGgpXHJcblx0XHRcdHdlYkFQSS5leHBvcnRIaXN0b3J5RmlsZXMoX2hpc3RvcnlGaWxlTmFtZSwgJ0hpc3RvcnkgZmlsZXMnLCBwYXRoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3dBY3Rpb25CYXJCdXR0b25zKHNob3cgPSB0cnVlKSB7XHJcblx0XHQvLy4uXHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeUZpbGVzUGFnZTtcclxuIiwgImltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgeyBkb20gfSBmcm9tICcuL2xpYi9kb20vZG9tJztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuL3NoYXJlZCc7XHJcbmltcG9ydCByb3V0ZXIgZnJvbSAnLi9zZXJ2aWNlcy9Sb3V0ZXJTZXJ2aWNlJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuL2NvbXBvbmVudHMvSWNvbic7XHJcbmltcG9ydCBQYWdlTGF5b3V0IGZyb20gJy4vY29tcG9uZW50cy9QYWdlTGF5b3V0JztcclxuaW1wb3J0IEFwcEJhciBmcm9tICcuL2NvbXBvbmVudHMvQXBwQmFyJztcclxuaW1wb3J0IE5hdmlnYXRpb24gZnJvbSAnLi9jb21wb25lbnRzL05hdmlnYXRpb24nO1xyXG5pbXBvcnQgUGFnZUZvb3RlciBmcm9tICcuL2NvbXBvbmVudHMvUGFnZUZvb3Rlcic7XHJcbmltcG9ydCBMb2dpblBhZ2UgZnJvbSAnLi9wYWdlcy9Mb2dpblBhZ2UnO1xyXG5pbXBvcnQgVGFza3NQYWdlIGZyb20gJy4vcGFnZXMvVGFza3NQYWdlJztcclxuaW1wb3J0IFRhc2tQYWdlIGZyb20gJy4vcGFnZXMvVGFza1BhZ2UnO1xyXG5pbXBvcnQgVGFza0ZpbGVzUGFnZSBmcm9tICcuL3BhZ2VzL1Rhc2tGaWxlc1BhZ2UnO1xyXG5pbXBvcnQgSGlzdG9yeVBhZ2UgZnJvbSAnLi9wYWdlcy9IaXN0b3J5UGFnZSc7XHJcbmltcG9ydCBIaXN0b3J5RmlsZXNQYWdlIGZyb20gJy4vcGFnZXMvSGlzdG9yeUZpbGVzUGFnZSc7XHJcblxyXG5sZXQgcGFnZUxheW91dDtcclxubGV0IG5hdmlnYXRpb247XHJcbmxldCBhcHBCYXI7XHJcbmxldCBmb290ZXI7XHJcblxyXG5yb3V0ZXIucm91dGVzKHtcclxuXHQnbG9naW4nOiBMb2dpblBhZ2UsXHJcblx0J3Rhc2tzJzogVGFza3NQYWdlLFxyXG5cdCd0YXNrLz8nOiBUYXNrUGFnZSxcclxuXHQndGFzay8/L2ZpbGVzJzogVGFza0ZpbGVzUGFnZSxcclxuXHQnaGlzdG9yeSc6IEhpc3RvcnlQYWdlLFxyXG5cdCdoaXN0b3J5ZmlsZXMvPyc6IEhpc3RvcnlGaWxlc1BhZ2UsXHJcbn0pO1xyXG53aW5kb3cuZG9tID0gZG9tO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IG1vdW50UGFnZSgpKTtcclxuLy8hd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIGRlc2FiaWxpdGEgbyBtZW51IGRlIGNvbnRleHRvIG5hdGl2b1xyXG5cclxuKGFzeW5jICgpID0+IHtcclxuXHRjb25zdCBfaXNBdXRoZW50aWNhdGVkID0gYXdhaXQgaXNBdXRoZW50aWNhdGVkKCk7XHJcblxyXG5cdGlmICghX2lzQXV0aGVudGljYXRlZCkge1xyXG5cdFx0bG9jYXRpb24uaGFzaCA9ICdsb2dpbic7XHJcblx0fSBlbHNlIHtcclxuXHRcdHN0YXJ0KCk7XHJcblx0fVxyXG59KSgpO1xyXG5cclxuXHJcbi8vIEZVTlx1MDBDN1x1MDBENUVTXHJcblxyXG5hc3luYyBmdW5jdGlvbiBpc0F1dGhlbnRpY2F0ZWQoKSB7XHJcblx0cmV0dXJuIHRydWU7XHJcblx0cmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpICE9IG51bGw7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG5cdGNvbnN0IHsgcmVzdWx0OiBjb25zdGFudHMgfSA9IGF3YWl0IHdlYkFQSS5nZXRDb25zdGFudHMoKTtcclxuXHJcblx0aWYgKGNvbnN0YW50cylcclxuXHRcdHNoYXJlZC5jb25zdGFudHMgPSB7IC4uLnNoYXJlZC5jb25zdGFudHMsIC4uLmNvbnN0YW50cyB9O1xyXG5cclxuXHRuYXZpZ2F0aW9uID0gTmF2aWdhdGlvbihbXHJcblx0XHR7IHRpdGxlOiAnVGFza3MnLCBuYW1lOiAndGFzaycsIGhyZWY6ICcjdGFza3MnLCBpY29uOiBJY29uKCd0YXNrcycpIH0sXHJcblx0XHR7IHRpdGxlOiAnSGlzdG9yeScsIG5hbWU6ICdoaXN0b3J5JywgaHJlZjogJyNoaXN0b3J5JywgaWNvbjogSWNvbignaGlzdG9yeScpIH0sXHJcblx0XSk7XHJcblx0YXBwQmFyID0gQXBwQmFyKCk7XHJcblx0Zm9vdGVyID0gUGFnZUZvb3RlcigpO1xyXG5cdHBhZ2VMYXlvdXQgPSBQYWdlTGF5b3V0KHtcclxuXHRcdGFwcEJhcixcclxuXHRcdG5hdmlnYXRpb24sXHJcblx0XHRmb290ZXIsXHJcblx0fSk7XHJcblxyXG5cdHNoYXJlZC5mb290ZXIgPSBmb290ZXI7XHJcblxyXG5cdHJlbmRlcihwYWdlTGF5b3V0LmVsZW1lbnQubm9kZXNbMF0sIGRvY3VtZW50LmJvZHkpO1xyXG5cdHN0YXJ0V2ViU29ja2V0KCk7XHJcblx0bW91bnRQYWdlKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG1vdW50UGFnZSgpIHtcclxuXHRsb2NhdGlvbi5oYXNoID0gbG9jYXRpb24uaGFzaCB8fCAndGFza3MnO1xyXG5cclxuXHRsZXQgcGFnZSA9IHJvdXRlci5yb3V0ZSgpO1xyXG5cclxuXHRwYWdlID0gYXdhaXQgcGFnZSgpO1xyXG5cclxuXHRpZiAoc2hhcmVkLmN1cnJlbnRQYWdlICYmIHNoYXJlZC5jdXJyZW50UGFnZS5vbkhpZGUpXHJcblx0XHRzaGFyZWQuY3VycmVudFBhZ2Uub25IaWRlKCk7XHJcblxyXG5cdHNoYXJlZC5jdXJyZW50UGFnZSA9IHBhZ2U7XHJcblxyXG5cdGlmIChsb2NhdGlvbi5oYXNoID09ICcjbG9naW4nKSB7XHJcblx0XHRyZW5kZXIocGFnZS5lbGVtZW50Lm5vZGVzWzBdLCBkb2N1bWVudC5ib2R5KTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cGFnZUxheW91dC5lbGVtZW50cy5oZWFkZXIuaHRtbCgnJykuaW5zZXJ0KHBhZ2UuZWxlbWVudHMuaGVhZGVyKTtcclxuXHRcdHBhZ2VMYXlvdXQuZWxlbWVudHMuYWN0aW9uQmFyLmh0bWwoJycpLmluc2VydChwYWdlLmVsZW1lbnRzLmFjdGlvbkJhcik7XHJcblx0XHRwYWdlTGF5b3V0LmVsZW1lbnRzLmNvbnRlbnQuaHRtbCgnJykuaW5zZXJ0KHBhZ2UuZWxlbWVudHMuY29udGVudCk7XHJcblx0XHRuYXZpZ2F0aW9uLnNldEFjdGl2ZSgpO1xyXG5cdFx0Zm9vdGVyLmluZm8oJycpO1xyXG5cdFx0cmVuZGVyKHBhZ2VMYXlvdXQuZWxlbWVudC5ub2Rlc1swXSwgZG9jdW1lbnQuYm9keSk7XHJcblx0fVxyXG5cclxuXHRpZiAocGFnZS5vblNob3cpXHJcblx0XHRhd2FpdCBwYWdlLm9uU2hvdygpO1xyXG5cclxuXHQvLyBjYXJyZWdhIG9zIFx1MDBFRGNvbmVzIGRvIGx1Y2lkZVxyXG5cdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydFdlYlNvY2tldCgpIHtcclxuXHRjb25zdCBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGB3czovLyR7bG9jYXRpb24uaG9zdH0vd3NgKTtcclxuXHJcblx0c29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0Ly8gdGFyZWZhcyBlbSBleGVjdVx1MDBFN1x1MDBFM29cclxuXHRcdGNvbnN0IHJ1bm5pbmdUYXNrcyA9IGV2ZW50LmRhdGE7XHJcblxyXG5cdFx0aWYgKHNoYXJlZC5jdXJyZW50UGFnZS51cGRhdGVSdW5uaW5nVGFza3MpXHJcblx0XHRcdHNoYXJlZC5jdXJyZW50UGFnZS51cGRhdGVSdW5uaW5nVGFza3MocnVubmluZ1Rhc2tzKTtcclxuXHR9O1xyXG5cclxuXHRzZXRJbnRlcnZhbCgoKSA9PiB7XHJcblx0XHQvLyBzZXJ2aWRvciBuXHUwMEUzbyByZXNwb25kZVxyXG5cdFx0aWYgKHNvY2tldC5yZWFkeVN0YXRlICE9IDEpXHJcblx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdH0sIDEwMDApO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUFPLFdBQVMsY0FBYyxLQUF3QixVQUFlLFVBQWlCO0FBQ3JGLFVBQU0sVUFBVSxPQUFPLFFBQVEsYUFDNUIsSUFBSSxLQUFLLElBQ1QsU0FBUyxjQUFjLEdBQUc7QUFFN0IsZUFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLE9BQU8sUUFB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cUJBQU8sWUFBWSxPQUFPO0FBRTNCLG1CQUFPLGNBQWM7QUFFckIsUUFBSSxTQUFTLFFBQVEsVUFBVTtBQUM5QixhQUFPLEtBQUssUUFBUSxNQUFNLENBQUMsR0FBRyxTQUFTLElBQUk7QUFBQSxJQUM1QyxPQUFPO0FBQ04saUJBQVcsU0FBUyxPQUFPLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxTQUFTLE1BQU07QUFDL0QsaUJBQVcsU0FBUyxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxTQUFTLFNBQVM7QUFDckUsaUJBQVcsU0FBUyxRQUFRLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxTQUFTLE9BQU87QUFDakUsaUJBQVcsVUFBVTtBQUNyQixhQUFPLEtBQUssRUFBRTtBQUNkLGFBQU8sV0FBVyxRQUFRLE1BQU0sQ0FBQyxHQUFHLFNBQVMsSUFBSTtBQUFBLElBQ2xEO0FBRUEsUUFBSSxLQUFLO0FBQ1IsWUFBTSxLQUFLLE9BQU87QUFHbkIsV0FBTyxZQUFZO0FBQUEsRUFDcEI7QUFFQSxXQUFTLGlCQUFpQjtBQUN6QixVQUFNLFNBQVMsSUFBSSxVQUFVLFFBQVEsU0FBUyxJQUFJLEtBQUs7QUFFdkQsV0FBTyxZQUFZLFNBQVUsT0FBTztBQUVuQyxZQUFNLGVBQWUsTUFBTTtBQUUzQixVQUFJLGVBQU8sWUFBWTtBQUN0Qix1QkFBTyxZQUFZLG1CQUFtQixZQUFZO0FBQUEsSUFDcEQ7QUFFQSxnQkFBWSxNQUFNO0FBRWpCLFVBQUksT0FBTyxjQUFjO0FBQ3hCLGlCQUFTLE9BQU87QUFBQSxJQUNsQixHQUFHLEdBQUk7QUFBQSxFQUNSOyIsCiAgIm5hbWVzIjogWyJkb20iLCAieCIsICJhdHRyIiwgInZhbHVlIiwgInNob3ciLCAiaGlkZSIsICJyZW1vdmUiLCAiZGlzYWJsZSIsICJyb3V0ZXMiLCAicm91dGUiLCAibmF2aWdhdGlvbiIsICJhcHBCYXIiLCAiZm9vdGVyIiwgIiRtZW51IiwgInBhZ2VNYXAiLCAiYnV0dG9uIiwgImRpc2FibGUiLCAic2hvdyIsICIkY2VsbCIsICJjaGVja2VkIiwgInNob3ciLCAiJGhlYWRlciIsICJjZWxsIiwgInNob3ciLCAiJGNlbGwiLCAidmFsdWUiLCAic2hvdyIsICJjaGVja2VkIiwgIiRyb3ciLCAib3B0aW9ucyIsICJjZWxsIiwgInNob3ciLCAibWV0YSIsICJkYXRhIiwgInRleHQiLCAiJGZvb3RlciIsICJjb250ZW50IiwgInNob3ciLCAiJHRhYmxlIiwgImZvb3RlciIsICJkaXNhYmxlIiwgInNob3ciLCAid2lkdGgiLCAiaGVpZ2h0IiwgImRhdGEiLCAibWV0YSIsICJvcHRpb25zIiwgImNvbHVtbiIsICJkZWZhdWx0T3B0aW9ucyIsICIkb3ZlcmxheSIsICJibG9jayIsICJzaG93IiwgInV0aWxzIiwgIlV0aWxzIiwgInZhbHVlIiwgImZpZWxkIiwgImRvbSJdCn0K
