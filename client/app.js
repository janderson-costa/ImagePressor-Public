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
    const root = /* @__PURE__ */ createElement("div", { class: "Navigation" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "header" }, /* @__PURE__ */ createElement("div", { class: "logo" }, /* @__PURE__ */ createElement("img", { src: "logo.svg" })), /* @__PURE__ */ createElement("label", { class: "title" }, "TransFile")), /* @__PURE__ */ createElement("div", { class: "items" }, items.map(
      (item) => /* @__PURE__ */ createElement("a", { href: item.href, class: "item", "data-keyword": item.name }, item.icon, /* @__PURE__ */ createElement("label", null, item.title))
    ))), /* @__PURE__ */ createElement("div", { class: "footer" }, "Version 1.1"));
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
    const root = /* @__PURE__ */ createElement("div", { class: "PageFooter" }, /* @__PURE__ */ createElement("div", { class: "info" }));
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
    const root = /* @__PURE__ */ createElement("div", { class: "ActionBar" }, buttons.map((button2) => {
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
      pageMap: ["Taskssss"],
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
          nextRun: { displayName: "Next Scheduled Run", minWidth: 160, sort: false }
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
    const root = /* @__PURE__ */ createElement("form", { class: "flex flex-col gap-10 !py-10 w-[600px]" }, /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label required" }, "Name"), /* @__PURE__ */ createElement("input", { type: "text", name: "name", class: "w-full", required: true, spellcheck: "false" })), /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Description"), /* @__PURE__ */ createElement("textarea", { name: "description", class: "w-full !min-h-23", spellcheck: "false", onInput: (e) => dom(e.target).resize() })), /* @__PURE__ */ createElement("div", { class: "field path flex flex-col" }, /* @__PURE__ */ createElement("div", { class: "field-label required" }, "Directory path"), /* @__PURE__ */ createElement("div", { class: "grid grid-cols-[fit-content(100%)_1fr] gap-x-1 gap-y-1" }, /* @__PURE__ */ createElement("button", { type: "button", class: "button w-10 h-10", onClick: selectPath, title: "Select folder" }, Icon_default("folder")), /* @__PURE__ */ createElement("input", { type: "text", name: "path", required: true, class: "w-full", spellcheck: "false" }), /* @__PURE__ */ createElement("span", null), /* @__PURE__ */ createElement("div", { class: "field-description" }, "Directory path containing the files to be optimized."))), /* @__PURE__ */ createElement("div", { class: "field" }, /* @__PURE__ */ createElement("div", { class: "field-label" }, "Content"), /* @__PURE__ */ createElement("div", { class: "flex items-baseline" }, /* @__PURE__ */ createElement("label", { class: "radio max-w-[200px]" }, /* @__PURE__ */ createElement("input", { type: "radio", name: "content", value: "root" }), /* @__PURE__ */ createElement("div", { class: "radio-name" }, shared_default.constants.content.find((x) => x.name == "root")?.displayName), /* @__PURE__ */ createElement("div", { class: "radio-description" }, "Optimizes only the files in the root directory.")), /* @__PURE__ */ createElement("label", { class: "radio max-w-[220px]" }, /* @__PURE__ */ createElement("input", { type: "radio", name: "content", value: "all" }), /* @__PURE__ */ createElement("div", { class: "radio-name" }, shared_default.constants.content.find((x) => x.name == "all")?.displayName), /* @__PURE__ */ createElement("div", { class: "radio-description" }, "Optimizes all files within the directory, including folders and subfolders.")))));
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
    const root = /* @__PURE__ */ createElement("div", { class: "TaskPageFileSettingsFilter" }, /* @__PURE__ */ createElement("div", { class: "action-bar" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Search filter"))), actionBar.element.nodes[0]), /* @__PURE__ */ createElement("div", { class: "dt-place" }), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-2" }, "Enable the search filter to create rule sets using multiple properties, values, and conditions. When the task starts, only the filtered files will be optimized. To test and validate the filter, click the ", /* @__PURE__ */ createElement("span", { class: "font-semibold" }, "View files"), " button."));
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
      let element = /* @__PURE__ */ createElement("div", { class: "flex gap-12" }, /* @__PURE__ */ createElement("section", { class: "flex flex-col gap-6 min-w-[280px] max-w-[280px]" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "flex items-center gap-5 w-full" }, /* @__PURE__ */ createElement("b", null, "Quality"), /* @__PURE__ */ createElement("input", { type: "range", min: "0", max: "100", step: "5", name: "quality", class: "range" }), /* @__PURE__ */ createElement("span", { class: "quality-value" })), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "The lower the quality, the smaller the file size. Find the right balance.")), /* @__PURE__ */ createElement("div", { class: "flex gap-6 maxWidth" }, /* @__PURE__ */ createElement("label", { class: "checkbox mt-[0.6em]" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Max. width (px)")), /* @__PURE__ */ createElement("div", { class: "checkbox-description" }, "Limits the width of images that exceed the specified width. Note: Does not affect images smaller than the specified width.")), /* @__PURE__ */ createElement("input", { type: "number", min: "0", name: "value", class: "min-w-[6em]" })), /* @__PURE__ */ createElement("div", { class: "flex gap-6 convert" }, /* @__PURE__ */ createElement("label", { class: "checkbox mt-[0.6em]" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name" }, /* @__PURE__ */ createElement("b", null, "Convert to")), /* @__PURE__ */ createElement("div", { class: "checkbox-description" }, "Converts the original image to the specified type. Note: This will not create a new image.")), /* @__PURE__ */ createElement("select", { name: "type", class: "min-w-[6em]" }, /* @__PURE__ */ createElement("option", null), shared_default.constants.fileTypes.map((_type) => {
        if (_type.name != type.name)
          return /* @__PURE__ */ createElement("option", { value: _type.name }, _type.name.toUpperCase());
      })))), /* @__PURE__ */ createElement("section", null, filter.element.nodes[0]));
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
          modified: { displayName: "Modified", minWidth: 130 }
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
          path: { displayName: "Path", minWidth: 500 }
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
          newType: { displayName: "New Type", minWidth: 120 }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9qc3gvZmFjdG9yeS50cyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9kb20vZG9tLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2hhcmVkLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2VydmljZXMvUm91dGVyU2VydmljZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9Ub2FzdC9Ub2FzdC5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvSWNvbi5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlTGF5b3V0LmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9NZW51L01lbnUuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL0FwcEJhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL05hdmlnYXRpb24uanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlRm9vdGVyLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0xvZ2luUGFnZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL1BhZ2VIZWFkZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9BY3Rpb25CYXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9Sb3dQcm9ncmVzc0Jhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy91dGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbnN0YW50cy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvQ29sdW1uLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9IZWFkZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL0NlbGwuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL1Jvdy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvRm9vdGVyLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9UYWJsZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL01vZGFsL01vZGFsLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza3NQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9VdGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvVGFicy5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUdlbmVyYWwuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3MuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VTY2hlZHVsZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUV4Y2VwdGlvbnMuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrRmlsZXNQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlGaWxlc1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvQXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnOiBzdHJpbmcgfCBGdW5jdGlvbiwgcHJvcHM6IGFueSwgLi4uY2hpbGRyZW46IGFueVtdKSB7XHJcblx0Y29uc3QgZWxlbWVudCA9IHR5cGVvZiB0YWcgPT09IFwiZnVuY3Rpb25cIlxyXG5cdFx0PyB0YWcocHJvcHMpIC8vIENoYW1hIGEgZnVuXHUwMEU3XHUwMEUzbyBzZSBmb3IgdW0gY29tcG9uZW50ZVxyXG5cdFx0OiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7IC8vIENyaWEgdW0gZWxlbWVudG8gcGFyYSBvIERPTVxyXG5cclxuXHRmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcHMgfHwge30pKSB7XHJcblx0XHRpZiAobmFtZS5zdGFydHNXaXRoKFwib25cIikgJiYgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUuc2xpY2UoMikudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyAvLyBBZGljaW9uYSBldmVudG9cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTsgLy8gRGVmaW5lIGF0cmlidXRvc1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcclxuXHRcdFx0Y2hpbGQuZm9yRWFjaChuZXN0ZWRDaGlsZCA9PiBlbGVtZW50LmFwcGVuZChuZXN0ZWRDaGlsZCkpOyAvLyBBZGljaW9uYSBmaWxob3MgYW5pbmhhZG9zXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbGVtZW50LmFwcGVuZChjaGlsZCBpbnN0YW5jZW9mIE5vZGUgPyBjaGlsZCA6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoaWxkKSk7IC8vIEFkaWNpb25hIHRleHRvIG91IG5cdTAwRjNzXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBlbGVtZW50OyAvLyBSZXRvcm5hIG8gZWxlbWVudG8gY3JpYWRvXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY29tcG9uZW50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcclxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjsgLy8gTGltcGEgbyBjb250YWluZXJcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoY29tcG9uZW50KTsgLy8gQWRpY2lvbmEgbyBjb21wb25lbnRlIGFvIGNvbnRhaW5lclxyXG59XHJcbiIsICIvKlxyXG5cdGRvbSAtIENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDI4LzEyLzIwMjMuXHJcblxyXG5cdERlc2NyaVx1MDBFN1x1MDBFM286IFVtIGpRdWVyeSBvdGltaXphZG8uXHJcblxyXG5cdFJlY3Vyc29zOlxyXG5cdFx0Lm5vZGVzXHJcblx0XHQubGVuZ3RoXHJcblxyXG5cdFx0Q3JpYWRvcmVzXHJcblx0XHRcdC5pbnNlcnQoKVxyXG5cdFx0XHQuY2xvbmUoKVxyXG5cclxuXHRcdERlc3RydXRvcmVzXHJcblx0XHRcdC5yZW1vdmUoKVxyXG5cclxuXHRcdFNlbGV0b3Jlc1xyXG5cdFx0XHQuZ2V0KClcclxuXHRcdFx0LmF0KClcclxuXHRcdFx0LmdldEJ5QXR0cigpXHJcblx0XHRcdC5nZXRCeUlkKClcclxuXHRcdFx0LmdldEJ5TmFtZSgpXHJcblx0XHRcdC5nZXRCeUNsYXNzKClcclxuXHRcdFx0LnBhcmVudCgpXHJcblx0XHRcdC5maW5kVXAoKVxyXG5cdFx0XHQuZmlyc3QoKVxyXG5cdFx0XHQubGFzdCgpXHJcblx0XHRcdC5uZXh0KClcclxuXHRcdFx0LnByZXZpb3VzKClcclxuXHRcdFx0LmZvckVhY2goKVxyXG5cdFx0XHQubWFwKClcclxuXHRcdFx0LnNvbWUoKVxyXG5cdFx0XHQuZmluZCgpXHJcblx0XHRcdC5maWx0ZXIoKVxyXG5cdFx0XHQuZm9jdXMoKVxyXG5cclxuXHRcdE1vZGlmaWNhZG9yZXNcclxuXHRcdFx0LnZhbHVlKClcclxuXHRcdFx0LnRleHQoKVxyXG5cdFx0XHQuaHRtbCgpXHJcblx0XHRcdC5hdHRyKClcclxuXHRcdFx0LnN0eWxlKClcclxuXHRcdFx0LndpZHRoKClcclxuXHRcdFx0LmhlaWdodCgpXHJcblx0XHRcdC5hZGRDbGFzcygpXHJcblx0XHRcdC5yZW1vdmVDbGFzcygpXHJcblx0XHRcdC5zaG93KClcclxuXHRcdFx0LmhpZGUoKVxyXG5cdFx0XHQucmVzaXplKClcclxuXHRcdFx0LmRpc2FibGUoKVxyXG5cclxuXHRcdE1hbmlwdWxhZG9yZXMgZGUgZXZlbnRvXHJcblx0XHRcdC5vbigpXHJcblx0XHRcdC5iaW5kRGF0YSgpXHJcblxyXG5cdE9ic2VydmFcdTAwRTdcdTAwRjVlczpcclxuXHRcdC0gQXJndW1lbnRvcyBpbnRlcm5vcyBwcmVjZWRpZG9zIHBvciAnX18nOiBVc3VcdTAwRTFyaW8gblx1MDBFM28gcHJlY2lzYSBpbmlmb3JtYXIuXHJcbiovXHJcblxyXG5leHBvcnQgY29uc3QgZG9tID0gKCgpID0+IHtcclxuXHRjb25zdCB1dGlsID0gVXRpbCgpO1xyXG5cclxuXHRzZXRTdHlsZSgpO1xyXG5cclxuXHRyZXR1cm4gRG9tO1xyXG5cclxuXHRmdW5jdGlvbiBEb20oc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpIHtcclxuXHRcdGlmIChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkpIHtcclxuXHRcdFx0XHRpZiAodXRpbC5pc0hUTUwoc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZShzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdH0gZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KSkge1xyXG5cdFx0XHRcdHJldHVybiBfaW50ZXJmYWNlKHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gc2VsZWN0b3JPckh0bWxPckVsZW1lbnQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKGRvY3VtZW50KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gSU5URVJGQUNFXHJcblxyXG5cdFx0ZnVuY3Rpb24gX2ludGVyZmFjZShub2RlcywgX19iYXNlTm9kZSkge1xyXG5cdFx0XHRub2RlcyA9IHV0aWwudG9MaXN0KG5vZGVzKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0YmFzZU5vZGU6IF9fYmFzZU5vZGUgfHwgbm9kZXMsXHJcblx0XHRcdFx0bm9kZXM6IG5vZGVzLFxyXG5cdFx0XHRcdGxlbmd0aDogbm9kZXMubGVuZ3RoLFxyXG5cclxuXHRcdFx0XHQvLyBjcmlhZG9yZXNcclxuXHRcdFx0XHRpbnNlcnQ6ICh0YWdPckh0bWxPckVsZW1lbnQsIHRvcCkgPT4gaW5zZXJ0KHRhZ09ySHRtbE9yRWxlbWVudCwgdG9wLCBub2RlcyksXHJcblx0XHRcdFx0Y2xvbmU6ICgpID0+IGNsb25lKG5vZGVzKSxcclxuXHJcblx0XHRcdFx0Ly8gZGVzdHJ1dG9yZXNcclxuXHRcdFx0XHRyZW1vdmU6ICgpID0+IHJlbW92ZShub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIHNlbGV0b3Jlc1xyXG5cdFx0XHRcdGF0OiBpbmRleCA9PiBhdChpbmRleCwgbm9kZXMpLFxyXG5cdFx0XHRcdGdldDogc2VsZWN0b3IgPT4gZ2V0KHNlbGVjdG9yLCBub2RlcyksXHJcblx0XHRcdFx0Z2V0QnlJZDogaWQgPT4gZ2V0QnlBdHRyKCdpZCcsIGlkLCBub2RlcyksIC8vIGlkOiBudW1iZXIvc3RyaW5nL1tudW1iZXIvc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5TmFtZTogbmFtZSA9PiBnZXRCeUF0dHIoJ25hbWUnLCBuYW1lLCBub2RlcyksIC8vIG5hbWU6IHN0cmluZy9bc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5QXR0cjogKGF0dHJpYnV0ZSwgdmFsdWUpID0+IGdldEJ5QXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBub2RlcyksIC8vIHZhbHVlOiBzdHJpbmcvW3N0cmluZ11cclxuXHRcdFx0XHRnZXRCeUNsYXNzOiBjbGFzc05hbWUgPT4gZ2V0QnlBdHRyKCdjbGFzcycsIGNsYXNzTmFtZSwgbm9kZXMpLCAvLyBjbGFzczogc3RyaW5nL1tzdHJpbmddXHJcblx0XHRcdFx0ZmluZFVwOiBzZWxlY3RvciA9PiBmaW5kVXAoc2VsZWN0b3IsIG5vZGVzKSxcclxuXHRcdFx0XHRwYXJlbnQ6ICgpID0+IHBhcmVudChub2RlcyksXHJcblx0XHRcdFx0Zmlyc3Q6ICgpID0+IGZpcnN0KG5vZGVzKSxcclxuXHRcdFx0XHRsYXN0OiAoKSA9PiBsYXN0KG5vZGVzKSxcclxuXHRcdFx0XHRuZXh0OiAoKSA9PiBuZXh0T3JQcmV2aW91cyh0cnVlLCBub2RlcyksXHJcblx0XHRcdFx0cHJldmlvdXM6ICgpID0+IG5leHRPclByZXZpb3VzKGZhbHNlLCBub2RlcyksXHJcblx0XHRcdFx0Zm9yRWFjaDogY2FsbGJhY2sgPT4gbm9kZXMuZm9yRWFjaCgoeCwgaW5kZXgpID0+IGNhbGxiYWNrKF9pbnRlcmZhY2UoeCksIGluZGV4KSksXHJcblx0XHRcdFx0bWFwOiBjYWxsYmFjayA9PiBub2Rlcy5tYXAoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdHNvbWU6IGNhbGxiYWNrID0+IG5vZGVzLnNvbWUoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbmQ6IGNhbGxiYWNrID0+IG5vZGVzLmZpbmQoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbHRlcjogY2FsbGJhY2sgPT4gbm9kZXMuZmlsdGVyKCh4LCBpbmRleCkgPT4gY2FsbGJhY2soX2ludGVyZmFjZSh4KSwgaW5kZXgpKSxcclxuXHRcdFx0XHRmb2N1czogZm9jdXNlZCA9PiBmb2N1cyhmb2N1c2VkLCBub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIG1vZGlmaWNhZG9yZXNcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUgPT4gYXR0cigndmFsdWUnLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHRleHQ6IHRleHQgPT4gYXR0cignaW5uZXJUZXh0JywgdGV4dCwgbm9kZXMpLFxyXG5cdFx0XHRcdGh0bWw6IGh0bWwgPT4gYXR0cignaW5uZXJIVE1MJywgaHRtbCwgbm9kZXMpLFxyXG5cdFx0XHRcdGF0dHI6IChwcm9wLCB2YWx1ZSkgPT4gYXR0cihwcm9wLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHN0eWxlOiAocHJvcCwgdmFsdWUpID0+IGF0dHIocHJvcCwgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSxcclxuXHRcdFx0XHR3aWR0aDogdmFsdWUgPT4gdmFsdWUgPyBhdHRyKCd3aWR0aCcsIHZhbHVlLCBub2RlcywgJ3N0eWxlJykgOiBnZXRBdHRyKCdvZmZzZXRXaWR0aCcsIG5vZGVzKSxcclxuXHRcdFx0XHRoZWlnaHQ6IHZhbHVlID0+IHZhbHVlID8gYXR0cignaGVpZ2h0JywgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSA6IGdldEF0dHIoJ29mZnNldEhlaWdodCcsIG5vZGVzKSxcclxuXHRcdFx0XHRhZGRDbGFzczogKGNsYXNzTmFtZSwgYWRkKSA9PiBhZGRDbGFzcyhjbGFzc05hbWUsIGFkZCwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzOiAoY2xhc3NOYW1lLCBhZGQpID0+IHJlbW92ZUNsYXNzKGNsYXNzTmFtZSwgYWRkLCBub2RlcyksXHJcblx0XHRcdFx0c2hvdzogKF9zaG93LCBkaXNwbGF5KSA9PiBzaG93KF9zaG93LCBkaXNwbGF5LCBub2RlcyksXHJcblx0XHRcdFx0aGlkZTogX2hpZGUgPT4gaGlkZShfaGlkZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlc2l6ZTogb3B0aW9ucyA9PiByZXNpemUob3B0aW9ucywgbm9kZXMpLFxyXG5cdFx0XHRcdGRpc2FibGU6IChfZGlzYWJsZSwgb3B0aW9ucykgPT4gZGlzYWJsZShfZGlzYWJsZSwgb3B0aW9ucywgbm9kZXMpLFxyXG5cclxuXHRcdFx0XHQvLyBtYW5pcHVsYWRvcmVzIGRlIGV2ZW50b1xyXG5cdFx0XHRcdG9uOiAoZXZlbnROYW1lLCBfZnVuY3Rpb24sIHVzZUNhcHR1cmUpID0+IG9uKGV2ZW50TmFtZSwgX2Z1bmN0aW9uLCB1c2VDYXB0dXJlLCBub2RlcyksXHJcblx0XHRcdFx0YmluZERhdGE6IGFyZ3MgPT4gYmluZERhdGEoYXJncywgbm9kZXMsIF9fYmFzZU5vZGUpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBGVU5cdTAwQzdcdTAwRDVFU1xyXG5cclxuXHRcdGZ1bmN0aW9uIGNyZWF0ZSh0YWdPckh0bWwgPSAnJykge1xyXG5cdFx0XHRjb25zdCBwYXJlbnRPZiA9IHtcclxuXHRcdFx0XHRvcHRpb246ICdzZWxlY3QnLFxyXG5cdFx0XHRcdHRoZWFkOiAndGFibGUnLFxyXG5cdFx0XHRcdHRib2R5OiAndGFibGUnLFxyXG5cdFx0XHRcdHRyOiAndGFibGUnLFxyXG5cdFx0XHRcdHRoOiAndHInLFxyXG5cdFx0XHRcdHRkOiAndHInLFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRsZXQgbm9kZTtcclxuXHJcblx0XHRcdHRhZ09ySHRtbCA9IHV0aWwucGFyc2VIVE1MKHRhZ09ySHRtbCk7XHJcblxyXG5cdFx0XHRpZiAodGFnT3JIdG1sLnN0YXJ0c1dpdGgoJzwnKSkge1xyXG5cdFx0XHRcdGNvbnN0IHRhZ05hbWUgPSB0YWdPckh0bWwubWF0Y2goL1thLXpdKy9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdGNvbnN0IHBhcmVudFRhZ05hbWUgPSBwYXJlbnRPZlt0YWdOYW1lXSB8fCAnZGl2JztcclxuXHJcblx0XHRcdFx0bm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50VGFnTmFtZSk7XHJcblx0XHRcdFx0bm9kZS5pbm5lckhUTUwgPSB0YWdPckh0bWw7XHJcblx0XHRcdFx0bm9kZSA9IG5vZGUucXVlcnlTZWxlY3Rvcih0YWdOYW1lKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0YWdPckh0bWwpIHtcclxuXHRcdFx0XHRub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdPckh0bWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpbnNlcnQodGFnT3JIdG1sT3JFbGVtZW50LCB0b3AgPSBmYWxzZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0aWYgKHRhZ09ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudCA9IHV0aWwudG9MaXN0KHRhZ09ySHRtbE9yRWxlbWVudCk7XHJcblxyXG5cdFx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudC5mb3JFYWNoKHggPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAodXRpbC5pc1N0cmluZyh4KSlcclxuXHRcdFx0XHRcdFx0XHRfaW5zZXJ0KF9fbm9kZSwgY3JlYXRlKHgpLm5vZGVzWzBdKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHgpKVxyXG5cdFx0XHRcdFx0XHRcdF9pbnNlcnQoX19ub2RlLCB4KTtcclxuXHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdHgubm9kZXMuZm9yRWFjaCh4ID0+IF9pbnNlcnQoX19ub2RlLCB4KSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIF9pbnNlcnQoX19ub2RlLCBub2RlKSB7XHJcblx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHJcblx0XHRcdFx0aWYgKHRvcClcclxuXHRcdFx0XHRcdF9fbm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgX19ub2RlLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdF9fbm9kZS5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGNsb25lKF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2UoX19ub2Rlc1swXS5jbG9uZU5vZGUodHJ1ZSksIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlbW92ZShfX25vZGVzKSB7XHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4gX19ub2RlLnJlbW92ZSgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBnZXQoc2VsZWN0b3IgPSAnJywgX19ub2RlID0gZG9jdW1lbnQpIHtcclxuXHRcdFx0aWYgKHNlbGVjdG9yKSB7XHJcblx0XHRcdFx0bGV0IG5vZGVzID0gW107XHJcblxyXG5cdFx0XHRcdGlmICh1dGlsLmlzTGlzdChfX25vZGUpKSB7XHJcblx0XHRcdFx0XHRfX25vZGUuZm9yRWFjaCh4ID0+XHJcblx0XHRcdFx0XHRcdG5vZGVzLnB1c2goLi4ueC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSlcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gWy4uLl9fbm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGdldEJ5QXR0cihhdHRyLCB2YWx1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0dmFsdWUgPSB1dGlsLnRvTGlzdCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+IHtcclxuXHRcdFx0XHR2YWx1ZS5mb3JFYWNoKHZhbHVlID0+IHtcclxuXHRcdFx0XHRcdGxldCByZXNvdXJjZXM7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGF0dHIgPT0gJ2lkJylcclxuXHRcdFx0XHRcdFx0cmVzb3VyY2VzID0gZ2V0KCcjJyArIHZhbHVlLCBfX25vZGUpO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ciA9PSAnY2xhc3MnKVxyXG5cdFx0XHRcdFx0XHRyZXNvdXJjZXMgPSBnZXQoJy4nICsgdmFsdWUsIF9fbm9kZSk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHJlc291cmNlcyA9IGdldChgWyR7YXR0cn0ke3ZhbHVlICE9IHVuZGVmaW5lZCA/ICc9XCInICsgdmFsdWUgKyAnXCInIDogJyd9XWAsIF9fbm9kZSk7XHJcblxyXG5cdFx0XHRcdFx0cmVzb3VyY2VzLm5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghbm9kZXMuc29tZSh4ID0+IHggPT0gbm9kZSkpXHJcblx0XHRcdFx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhdChpbmRleCwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzW2luZGV4XSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyc3QoX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gYXQoMCwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGFzdChfX25vZGVzKSB7XHJcblx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGVzLnBvcCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2Uobm9kZSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbmV4dE9yUHJldmlvdXMobmV4dCA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBuZXh0ID8gX19ub2RlLm5leHRTaWJsaW5nIDogX19ub2RlLnByZXZpb3VzU2libGluZztcclxuXHJcblx0XHRcdFx0aWYgKG5vZGUpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaW5kVXAoc2VsZWN0b3IsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGUuY2xvc2VzdChzZWxlY3Rvcik7XHJcblxyXG5cdFx0XHRcdGlmIChub2RlICYmICFub2Rlcy5zb21lKHggPT4geCA9PT0gbm9kZSkpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBwYXJlbnQoX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PlxyXG5cdFx0XHRcdG5vZGVzLnB1c2goX19ub2RlLnBhcmVudEVsZW1lbnQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBfX25vZGVzLCBvYmplY3QpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmcvb2JqZWN0XHJcblxyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhhdHRyaWJ1dGUpKSB7XHJcblx0XHRcdFx0bGV0IGtleSA9IGF0dHJpYnV0ZTtcclxuXHJcblx0XHRcdFx0aWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldEF0dHIoa2V5LCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHJldHVybiBzZXRBdHRyKHsgW2tleV06IHZhbHVlIH0sIF9fbm9kZXMsIG9iamVjdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHNldEF0dHIoYXR0cmlidXRlLCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0QXR0cihhdHRyaWJ1dGUgPSAnJywgX19ub2Rlcywgb2JqZWN0ID0gJycpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmdcclxuXHRcdFx0Ly8gb2JqZWN0OiBzdHJpbmcgLSBleC46IHN0eWxlXHJcblxyXG5cdFx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBvYmplY3QgPyBfX25vZGVbb2JqZWN0XSA6IF9fbm9kZTtcclxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHV0aWwuaXNVbmRlZmluZWQobm9kZVthdHRyaWJ1dGVdKSA/XHJcblx0XHRcdFx0XHRub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpIDpcclxuXHRcdFx0XHRcdG5vZGVbYXR0cmlidXRlXTtcclxuXHJcblx0XHRcdFx0aWYgKCF1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSlcclxuXHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXMgOiB2YWx1ZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2V0QXR0cihhdHRyaWJ1dGVzID0ge30sIF9fbm9kZXMsIG9iamVjdE5hbWUgPSAnJykge1xyXG5cdFx0XHQvLyBhdHRyaWJ1dGVzOiBvYmplY3RcclxuXHRcdFx0Ly8gb2JqZWN0TmFtZTogc3RyaW5nIC0gZXguOiBzdHlsZVxyXG5cclxuXHRcdFx0aWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGF0dHJpYnV0ZXMpKSB7XHJcblx0XHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PiB7XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBub2RlID0gb2JqZWN0TmFtZSA/IF9fbm9kZVtvYmplY3ROYW1lXSA6IF9fbm9kZTtcclxuXHRcdFx0XHRcdFx0bGV0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gdmFsb3JlcyBpbnRlaXJvcyBjb20gdW5pZGFkZSBweFxyXG5cdFx0XHRcdFx0XHRpZiAob2JqZWN0TmFtZSA9PSAnc3R5bGUnKSB7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGltcG9ydGFudCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWtleS5tYXRjaCgvaW5kZXh8bGluZXxncmlkfG9yZGVyfHRhYnxvcnBoYW5zfHdpZG93c3xjb2x1bW5zfGNvdW50ZXJ8b3BhY2l0eS9pKSlcclxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlID0gdHlwZW9mIHZhbHVlID09ICdudW1iZXInID8gdmFsdWUgKyAncHgnIDogdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh2YWx1ZS5tYXRjaCgvaW1wb3J0YW50L2kpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5pbmRleE9mKCchJykgLSAxKS50cmltKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpbXBvcnRhbnQgPSAnaW1wb3J0YW50JztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChpbXBvcnRhbnQpXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCk7XHJcblx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dHlwZW9mIG5vZGVba2V5XSA9PSAndW5kZWZpbmVkJyA/XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKSA6XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlW2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlLCBkaXNwbGF5ID0gJycsIF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIGF0dHIoJ2Rpc3BsYXknLCBzaG93ID8gZGlzcGxheSA6ICdub25lJywgX19ub2RlcywgJ3N0eWxlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaGlkZShoaWRlID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gc2hvdyghaGlkZSwgJycsIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGFkZENsYXNzKGNsYXNzTmFtZSwgYWRkID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHQvLyBjbGFzc05hbWU6IHN0cmluZy9bc3RyaW5nXVxyXG5cclxuXHRcdFx0Y2xhc3NOYW1lID0gdXRpbC50b0xpc3QoY2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRfX25vZGUuY2xhc3NMaXN0W2FkZCA/ICdhZGQnIDogJ3JlbW92ZSddKC4uLmNsYXNzTmFtZSlcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGNsYXNzTmFtZSwgcmVtb3ZlID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gYWRkQ2xhc3MoY2xhc3NOYW1lLCAhcmVtb3ZlLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmb2N1cyhmb2N1c2VkID0gdHJ1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRpZiAoZm9jdXNlZClcclxuXHRcdFx0XHRfX25vZGVzWzBdLmZvY3VzKCk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRfX25vZGVzWzBdLmJsdXIoKTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZSA9IHRydWUsIG9wdGlvbnMgPSB7fSwgX19ub2Rlcykge1xyXG5cdFx0XHRpZiAob3B0aW9ucy5vcGFjaXR5KSB7XHJcblx0XHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PlxyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLm9wYWNpdHkgPSBkaXNhYmxlID8gb3B0aW9ucy5vcGFjaXR5IDogJydcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYWRkQ2xhc3MoJ2RvbS1kaXNhYmxlZCcsIGRpc2FibGUsIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlc2l6ZShvcHRpb25zLCBfX25vZGVzKSB7XHJcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cdFx0XHRvcHRpb25zLm9mZnNldCA9IG9wdGlvbnMub2Zmc2V0ICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMub2Zmc2V0IDogMDtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdC8vIE9icy46IFBhcmEgdGV4dGFyZWEgYSBmdW5cdTAwRTdcdTAwRTNvIHJlc2l6ZSBkZXZlIHNlciBjaGFtYWRhIG5vIGV2ZW50byBvbmlucHV0LlxyXG5cdFx0XHRcdGlmICh1dGlsLmdldFRhZ05hbWUoX19ub2RlKSA9PSAndGV4dGFyZWEnKSB7XHJcblx0XHRcdFx0XHRfX25vZGUuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcblx0XHRcdFx0XHRfX25vZGUuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGRpZmYgPSBfX25vZGUub2Zmc2V0SGVpZ2h0IC0gX19ub2RlLnNjcm9sbEhlaWdodDtcclxuXHRcdFx0XHRcdGxldCBoZWlnaHQgPSBfX25vZGUuc2Nyb2xsSGVpZ2h0ICsgKGRpZmYgPiAwID8gZGlmZiA6IDApICsgb3B0aW9ucy5vZmZzZXQ7XHJcblxyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLmhlaWdodCA9IHR5cGVvZiBoZWlnaHQgPT0gJ251bWJlcicgJiYgaGVpZ2h0ID4gMCA/IGhlaWdodCArICdweCcgOiBoZWlnaHQgfHwgJ2F1dG8nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX19ub2RlcztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBiaW5kRGF0YShhcmdzID0ge30sIF9fZmllbGRzLCBfX2Jhc2VOb2RlKSB7XHJcblx0XHRcdC8qXHJcblx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0a2V5OiBzdHJpbmcsXHJcblx0XHRcdFx0XHRvYmplY3Q6IG9iamVjdCxcclxuXHRcdFx0XHRcdHZhbHVlOiBhbnksXHJcblx0XHRcdFx0XHRkaXNwYXRjaEV2ZW50OiBib29sZWFuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHQqL1xyXG5cclxuXHRcdFx0YXJncy5kaXNwYXRjaEV2ZW50ID0gYXJncy5kaXNwYXRjaEV2ZW50ICE9IHVuZGVmaW5lZCA/IGFyZ3MuZGlzcGF0Y2hFdmVudCA6IHRydWU7XHJcblxyXG5cdFx0XHRsZXQgX2ZpZWxkcyA9IHt9O1xyXG5cdFx0XHRsZXQgX29uQ2hhbmdlO1xyXG5cclxuXHRcdFx0X19maWVsZHMuZm9yRWFjaChfX2ZpZWxkID0+IHtcclxuXHRcdFx0XHRjb25zdCBrZXkgPSBhcmdzLmtleSB8fCBfX2ZpZWxkLm5hbWU7XHJcblxyXG5cdFx0XHRcdGlmIChrZXkpIHtcclxuXHRcdFx0XHRcdF9maWVsZHNba2V5XSA9IF9maWVsZHNba2V5XSA/IHV0aWwuaXNBcnJheShfZmllbGRzW2tleV0pID8gX2ZpZWxkc1trZXldLnB1c2goX2ludGVyZmFjZShfX2ZpZWxkKSkgOiBbX2ZpZWxkc1trZXldLCBfaW50ZXJmYWNlKF9fZmllbGQpXSA6IF9pbnRlcmZhY2UoX19maWVsZCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCF1dGlsLmlzVW5kZWZpbmVkKGFyZ3MudmFsdWUpIHx8IGFyZ3Mub2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0XHRcdFx0Ly8gYXR1YWxpemEgbyBjYW1wb1xyXG5cdFx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9ICF1dGlsLmlzVW5kZWZpbmVkKGFyZ3MudmFsdWUpID8gYXJncy52YWx1ZSA6IGFyZ3Mub2JqZWN0W2tleV07XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoX19maWVsZC50eXBlID09ICdyYWRpbycpIHtcclxuXHRcdFx0XHRcdFx0XHRfX2ZpZWxkLmNoZWNrZWQgPSBfX2ZpZWxkLnZhbHVlID09IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKF9fZmllbGQudHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC5jaGVja2VkID0gdXRpbC5pc0Jvb2xlYW4odmFsdWUpID8gdmFsdWUgOiB1dGlsLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc29tZSh2YWx1ZSA9PiBfX2ZpZWxkLnZhbHVlID09IHZhbHVlKSA6IF9fZmllbGQudmFsdWUgPT0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoX19maWVsZC50eXBlID09ICdkYXRlJyAmJiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHsgLy8gdGltZXN0YW1wXHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC52YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoX19maWVsZC50eXBlID09ICdkYXRldGltZS1sb2NhbCcgJiYgdHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7IC8vIHRpbWVzdGFtcFxyXG5cdFx0XHRcdFx0XHRcdF9fZmllbGQudmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxNik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBhdHVhbGl6YSBvIG9iamV0byBvdSB2YWxvclxyXG5cdFx0XHRcdFx0XHRjb25zdCBmID0gZXZlbnQgPT4gY2hhbmdlKGV2ZW50LCBrZXkpO1xyXG5cclxuXHRcdFx0XHRcdFx0X19maWVsZC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIF9fZmllbGQuX19kb21fYmluZERhdGFfY2hhbmdlKTtcclxuXHRcdFx0XHRcdFx0X19maWVsZC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGYpO1xyXG5cdFx0XHRcdFx0XHRfX2ZpZWxkLl9fZG9tX2JpbmREYXRhX2NoYW5nZSA9IGY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0b25DaGFuZ2U6IGNhbGxiYWNrID0+IHtcclxuXHRcdFx0XHRcdF9vbkNoYW5nZSA9IGNhbGxiYWNrO1xyXG5cclxuXHRcdFx0XHRcdC8vIGFjaW9uYSBvbkNoYW5nZVxyXG5cdFx0XHRcdFx0aWYgKGFyZ3MuZGlzcGF0Y2hFdmVudCkge1xyXG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBfZmllbGRzKVxyXG5cdFx0XHRcdFx0XHRcdGNoYW5nZShudWxsLCBrZXkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjaGFuZ2UoZXZlbnQsIGtleSkge1xyXG5cdFx0XHRcdGxldCBmaWVsZCA9IF9maWVsZHNba2V5XTtcclxuXHRcdFx0XHRsZXQgdmFsdWU7XHJcblxyXG5cdFx0XHRcdGlmICh1dGlsLmlzQXJyYXkoZmllbGQpKSB7XHJcblx0XHRcdFx0XHRsZXQgdHlwZSA9IGZpZWxkWzBdLm5vZGVzWzBdLnR5cGU7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gJ3JhZGlvJykge1xyXG5cdFx0XHRcdFx0XHRsZXQgeCA9IGZpZWxkLmZpbmQoeCA9PiB4Lm5vZGVzWzBdLmNoZWNrZWQpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFsdWUgPSB4ID8geC5ub2Rlc1swXS52YWx1ZSA6ICcnO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlID09ICdjaGVja2JveCcpIHtcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBmaWVsZC5maWx0ZXIoeCA9PiB4Lm5vZGVzWzBdLmNoZWNrZWQpLm1hcCh4ID0+IHgubm9kZXNbMF0udmFsdWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZmllbGQubm9kZXNbMF0udHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0XHRsZXQgb2JqVmFsdWUgPSAhdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSA/IGFyZ3MudmFsdWUgOiBhcmdzLm9iamVjdFtrZXldO1xyXG5cdFx0XHRcdFx0bGV0IGlzQ2hlY2tlZCA9IGZpZWxkLm5vZGVzWzBdLmNoZWNrZWQ7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHV0aWwuaXNCb29sZWFuKG9ialZhbHVlKSkge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGlzQ2hlY2tlZDtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodXRpbC5pc0FycmF5KG9ialZhbHVlKSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoaXNDaGVja2VkKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFvYmpWYWx1ZS5zb21lKHggPT4geCA9PSB2YWx1ZSkpXHJcblx0XHRcdFx0XHRcdFx0XHRvYmpWYWx1ZS5wdXNoKHZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRvYmpWYWx1ZSA9IG9ialZhbHVlLmZpbHRlcih4ID0+IHggIT0gdmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IG9ialZhbHVlLnNvcnQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFsdWUgPSBmaWVsZC5ub2Rlc1swXS52YWx1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICghdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSlcclxuXHRcdFx0XHRcdGFyZ3MudmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRhcmdzLm9iamVjdFtrZXldID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdC8vIGNhbGxiYWNrXHJcblx0XHRcdFx0aWYgKF9vbkNoYW5nZSkge1xyXG5cdFx0XHRcdFx0X29uQ2hhbmdlKHtcclxuXHRcdFx0XHRcdFx0YmFzZU5vZGU6IF9pbnRlcmZhY2UoX19iYXNlTm9kZSksXHJcblx0XHRcdFx0XHRcdGFyZ3MsXHJcblx0XHRcdFx0XHRcdG9iamVjdDogYXJncy5vYmplY3QsXHJcblx0XHRcdFx0XHRcdGtleSxcclxuXHRcdFx0XHRcdFx0dmFsdWUsXHJcblx0XHRcdFx0XHRcdGZpZWxkLFxyXG5cdFx0XHRcdFx0XHRmaWVsZHM6IF9maWVsZHMsXHJcblx0XHRcdFx0XHRcdGV2ZW50LFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gb24oZXZlbnROYW1lLCBfZnVuY3Rpb24sIHVzZUNhcHR1cmUgPSBmYWxzZSwgX19ub2Rlcykge1xyXG5cdFx0XHQvLyB1c2VDYXB0dXJlOiBib29sZWFuIChvcGNpb25hbClcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRfX25vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50ID0+XHJcblx0XHRcdFx0XHRfZnVuY3Rpb24oeyBlbGVtZW50OiBfaW50ZXJmYWNlKF9fbm9kZSksIGV2ZW50OiBldmVudCB9KSwgdXNlQ2FwdHVyZVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gVXRpbCgpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGdldFRhZ05hbWUsXHJcblx0XHRcdHRvTGlzdCxcclxuXHRcdFx0cGFyc2VIVE1MLFxyXG5cdFx0XHRpc051bGwsXHJcblx0XHRcdGlzVW5kZWZpbmVkLFxyXG5cdFx0XHRpc0VtcHR5LFxyXG5cdFx0XHRpc051bGxPclVuZGVmaW5lZCxcclxuXHRcdFx0aXNOdWxsT3JVbmRlZmluZWRPckVtcHR5LFxyXG5cdFx0XHRpc09iamVjdCxcclxuXHRcdFx0aXNTdHJpbmcsXHJcblx0XHRcdGlzQm9vbGVhbixcclxuXHRcdFx0aXNIVE1MLFxyXG5cdFx0XHRpc0hUTUxFbGVtZW50LFxyXG5cdFx0XHRpc05vZGVMaXN0LFxyXG5cdFx0XHRpc0FycmF5LFxyXG5cdFx0XHRpc0xpc3QsXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldFRhZ05hbWUobm9kZSkge1xyXG5cdFx0XHRyZXR1cm4gbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgOiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0b0xpc3QoZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gaXNOb2RlTGlzdChlbGVtZW50KSA/IFsuLi5lbGVtZW50XSA6IGlzQXJyYXkoZWxlbWVudCkgPyBlbGVtZW50IDogW2VsZW1lbnRdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHBhcnNlSFRNTChodG1sKSB7XHJcblx0XHRcdC8vIFJlbW92ZSBxdWVicmFzIGRlIGxpbmhhLCB0YWJ1bGFcdTAwRTdcdTAwRjVlcyBlIHNwYVx1MDBFN29zIGR1cGxpY2Fkb3MuXHJcblxyXG5cdFx0XHRyZXR1cm4gaHRtbC5yZXBsYWNlKC9cXG58XFx0L2csICcnKS5yZXBsYWNlKC8gIC9nLCAnICcpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc051bGwodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlID09IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZSA9PSAnJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZCh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gaXNOdWxsKHZhbHVlKSB8fCBpc1VuZGVmaW5lZCh2YWx1ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWRPckVtcHR5KHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiBpc051bGwodmFsdWUpIHx8IGlzVW5kZWZpbmVkKHZhbHVlKSB8fCBpc0VtcHR5KHZhbHVlKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZyc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Jvb2xlYW4nO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzSFRNTCh2YWx1ZSkge1xyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlSFRNTCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gaXNTdHJpbmcodmFsdWUpICYmIHZhbHVlLnN0YXJ0c1dpdGgoJzwnKSAmJiB2YWx1ZS5lbmRzV2l0aCgnPicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzSFRNTEVsZW1lbnQob2JqKSB7XHJcblx0XHRcdHJldHVybiBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc05vZGVMaXN0KG9iaikge1xyXG5cdFx0XHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgTm9kZUxpc3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNBcnJheShvYmopIHtcclxuXHRcdFx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIEFycmF5O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzTGlzdChlbGVtZW50KSB7XHJcblx0XHRcdHJldHVybiBpc05vZGVMaXN0KGVsZW1lbnQpIHx8IGlzQXJyYXkoZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTdHlsZSgpIHtcclxuXHRcdGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdHlsZSNkb20tc3R5bGUnKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGNvbnN0IHN0eWxlID0gdXRpbC5wYXJzZUhUTUwoLypodG1sKi9gXHJcblx0XHRcdDxzdHlsZSBpZD1cImRvbS1zdHlsZVwiPlxyXG5cdFx0XHRcdC5kb20tZGlzYWJsZWQge1xyXG5cdFx0XHRcdFx0b3BhY2l0eTogLjY7XHJcblx0XHRcdFx0XHQtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG5cdFx0XHRcdFx0LW1vei11c2VyLXNlbGVjdDogbm9uZTtcclxuXHRcdFx0XHRcdHVzZXItc2VsZWN0OiBub25lO1xyXG5cdFx0XHRcdFx0cG9pbnRlci1ldmVudHM6IG5vbmU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQ8L3N0eWxlPlxyXG5cdFx0YCk7XHJcblxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgc3R5bGUpO1xyXG5cdH1cclxufSkoKTtcclxuIiwgImNvbnN0IHNoYXJlZCA9IHtcclxuXHR0ZW1wOiBudWxsLFxyXG5cdGNvbnN0YW50czogbnVsbCxcclxuXHJcblx0Ly8gcFx1MDBFMWdpbmFzXHJcblx0Y3VycmVudFBhZ2U6IG51bGwsXHJcblxyXG5cdC8vIGNvbXBvbmVudGVzXHJcblx0bmF2aWdhdGlvbjogbnVsbCxcclxuXHRhcHBCYXI6IG51bGwsXHJcblx0Zm9vdGVyOiBudWxsLFxyXG5cclxuXHQvLyBmdW5cdTAwRTdcdTAwRjVlc1xyXG5cdHNldENvbnRlbnRTaXplOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2hhcmVkO1xyXG4iLCAiY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlclNlcnZpY2UoKTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlclNlcnZpY2UoKSB7XHJcblx0Y29uc3QgX3RoaXMgPSB0aGlzO1xyXG5cdGxldCBfcm91dGVzO1xyXG5cclxuXHR0aGlzLnJvdXRlcyA9IHJvdXRlcztcclxuXHR0aGlzLnJvdXRlID0gcm91dGU7XHJcblx0dGhpcy5uZXh0ID0gbnVsbDtcclxuXHR0aGlzLmN1cnJlbnQgPSBnZXRMb2NhdGlvbigpO1xyXG5cdHRoaXMucHJldmlvdXMgPSBnZXRMb2NhdGlvbihsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncHJldmlvdXNVcmwnKSk7XHJcblxyXG5cdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgb25IYXNoQ2hhbmdlKTtcclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIG9uSGFzaENoYW5nZSk7XHJcblxyXG5cdGZ1bmN0aW9uIG9uSGFzaENoYW5nZShldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50KVxyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncHJldmlvdXNVcmwnLCBldmVudC5vbGRVUkwpO1xyXG5cclxuXHRcdF90aGlzLnByZXZpb3VzID0gZ2V0TG9jYXRpb24obG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3ByZXZpb3VzVXJsJykpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcm91dGVzKHJvdXRlcykge1xyXG5cdFx0LypcclxuXHRcdFx0cm91dGVzOiBFeC46IHtcclxuXHRcdFx0XHQndGFza3MnOiBUYXNrc1BhZ2UsXHJcblx0XHRcdFx0J3Rhc2svPyc6IFRhc2tQYWdlLFxyXG5cdFx0XHRcdCd0YXNrLz8vZmlsZXMnOiBUYXNrRmlsZXNQYWdlLFxyXG5cdFx0XHRcdCdleGNlcHRpb25zJzogRXhjZXB0aW9uc1BhZ2UsXHJcblx0XHRcdFx0J2V4Y2VwdGlvbi8/JzogRXhjZXB0aW9uUGFnZSxcclxuXHRcdFx0XHQnaGlzdG9yeSc6IEhpc3RvcnlQYWdlLFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQ/OiBWYXJpXHUwMEUxdmVsIC0gRXguOiBpZCwgbmFtZSwgdmFsdWUsIG91dHJvcy4uXHJcblx0XHQqL1xyXG5cclxuXHRcdGlmIChyb3V0ZXMpXHJcblx0XHRcdF9yb3V0ZXMgPSByb3V0ZXM7XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBfcm91dGVzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcm91dGUoKSB7XHJcblx0XHRjb25zdCBfbG9jYXRpb24gPSBnZXRMb2NhdGlvbigpO1xyXG5cclxuXHRcdGZvciAoY29uc3Qgcm91dGUgaW4gX3JvdXRlcykge1xyXG5cdFx0XHRjb25zdCByb3V0ZVBhcnRzID0gcm91dGUuc3BsaXQoJy8nKTtcclxuXHRcdFx0bGV0IHBhZ2UgPSBfcm91dGVzW3JvdXRlXTtcclxuXHRcdFx0bGV0IGNvdW50ID0gMDtcclxuXHJcblx0XHRcdF9sb2NhdGlvbi5oYXNoUGFydHMuZm9yRWFjaCgoaGFzaFBhcnQsIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0bGV0IHJvdXRlUGFydCA9IHJvdXRlUGFydHNbaW5kZXhdO1xyXG5cclxuXHRcdFx0XHRpZiAoX2xvY2F0aW9uLmhhc2hQYXJ0cy5sZW5ndGggPT0gcm91dGVQYXJ0cy5sZW5ndGggJiYgKFxyXG5cdFx0XHRcdFx0aGFzaFBhcnQgPT0gcm91dGVQYXJ0IHx8XHJcblx0XHRcdFx0XHRyb3V0ZVBhcnQgPT0gJz8nXHJcblx0XHRcdFx0KSkgY291bnQrKztcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZiAoX2xvY2F0aW9uLmhhc2hQYXJ0cy5sZW5ndGggPT0gY291bnQpIHtcclxuXHRcdFx0XHRfdGhpcy5jdXJyZW50ID0gX2xvY2F0aW9uO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gcGFnZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0TG9jYXRpb24odXJsKSB7XHJcblx0XHR1cmwgPSB1cmwgfHwgbG9jYXRpb24uaHJlZjtcclxuXHJcblx0XHRpZiAoIXVybC5tYXRjaCgvIy8pKSByZXR1cm47XHJcblxyXG5cdFx0bGV0IGZ1bGxIYXNoID0gdXJsLnNwbGl0KCcjJylbMV07XHJcblx0XHRsZXQgaGFzaCA9IGZ1bGxIYXNoLnNwbGl0KCcmJylbMF07XHJcblx0XHRsZXQgcGFyYW1zID0gZnVsbEhhc2guc3BsaXQoJyYnKVsxXTtcclxuXHRcdGxldCBoYXNoUGFydHMgPSBoYXNoLnNwbGl0KCcvJyk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dXJsLFxyXG5cdFx0XHRmdWxsSGFzaCxcclxuXHRcdFx0aGFzaCxcclxuXHRcdFx0aGFzaFBhcnRzLFxyXG5cdFx0XHR0YXJnZXQ6IGhhc2guc3Vic3RyaW5nKGhhc2gubGFzdEluZGV4T2YoJy8nKSArIDEpLFxyXG5cdFx0XHRwYXJhbXM6IHBhcnNlUGFyYW1zKHBhcmFtcyksXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGFyc2VQYXJhbXMoaGFzaFBhcmFtcykge1xyXG5cdFx0aWYgKCFoYXNoUGFyYW1zKSByZXR1cm47XHJcblxyXG5cdFx0Y29uc3QgcGFyYW1zID0ge307XHJcblxyXG5cdFx0aGFzaFBhcmFtcy5zcGxpdCgnJicpLmZvckVhY2gocGFyYW0gPT4ge1xyXG5cdFx0XHRsZXQga2V5VmFsdWUgPSBwYXJhbS5zcGxpdCgnPScpO1xyXG5cclxuXHRcdFx0cGFyYW1zW2tleVZhbHVlWzBdXSA9IGtleVZhbHVlWzFdO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gMTcvMDMvMjAyNC5cclxuKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRvYXN0KG9wdGlvbnMgPSB7fSkge1xyXG5cdC8qXHJcblx0XHRvcHRpb25zOiB7XHJcblx0XHRcdGljb246IHN0cmluZyAodGV4dC9odG1sKSxcclxuXHRcdFx0bWVzc2FnZTogc3RyaW5nICh0ZXh0L2h0bWwpLFxyXG5cdFx0XHRwb3NpdGlvbjogc3RyaW5nICgndG9wIGxlZnQnLCAndG9wIGNlbnRlcicsICd0b3AgcmlnaHQnLCAnYm90dG9tIGxlZnQnLCAnYm90dG9tIGNlbnRlcicsICdib3R0b20gcmlnaHQnKSxcclxuXHRcdFx0dGltZTogaW50IChzZWNvbmRzKSxcclxuXHRcdH1cclxuXHQqL1xyXG5cclxuXHRvcHRpb25zLnBvc2l0aW9uID0gb3B0aW9ucy5wb3NpdGlvbiA/IG9wdGlvbnMucG9zaXRpb24gOiAnYm90dG9tIGNlbnRlcic7XHJcblx0b3B0aW9ucy50aW1lID0gb3B0aW9ucy50aW1lID8gb3B0aW9ucy50aW1lIDogNTtcclxuXHJcblx0Y29uc3QgdG9hc3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvYXN0cycpO1xyXG5cclxuXHRjcmVhdGUoKTtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCd0b2FzdCcpO1xyXG5cdFx0dG9hc3QuaW5uZXJIVE1MID0gLypodG1sKi9gXHJcblx0XHRcdCR7b3B0aW9ucy5pY29uID8gLypodG1sKi9gPGRpdiBjbGFzcz1cInRvYXN0LWljb25cIj48L2Rpdj5gIDogYDxzcGFuPjwvc3Bhbj5gfVxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidG9hc3QtYm9keVwiIHN0eWxlPVwiJHtvcHRpb25zLmljb24gPyAncGFkZGluZy1sZWZ0OiAwJyA6ICcnfVwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1jb250ZW50XCI+XHJcblx0XHRcdFx0XHQke29wdGlvbnMubWVzc2FnZX1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1idXR0b25cIiBvbmNsaWNrPVwidGhpcy5wYXJlbnRFbGVtZW50LnJlbW92ZSgpXCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0b2FzdC1idXR0b24taWNvblwiPlxyXG5cdFx0XHRcdFx0PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMi41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0xOCA2IDYgMThcIj48L3BhdGg+PHBhdGggZD1cIm02IDYgMTIgMTJcIj48L3BhdGg+PC9zdmc+XHJcblx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YDtcclxuXHJcblx0XHQvLyBcdTAwRURjb25lXHJcblx0XHRpZiAob3B0aW9ucy5pY29uKSB7XHJcblx0XHRcdGNvbnN0IGljb24gPSB0b2FzdC5xdWVyeVNlbGVjdG9yKCcudG9hc3QtaWNvbicpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuaWNvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHRcdGljb24uYXBwZW5kQ2hpbGQob3B0aW9ucy5pY29uKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGljb24uaW5uZXJIVE1MID0gb3B0aW9ucy5pY29uO1xyXG5cclxuXHRcdFx0dG9hc3QucHJlcGVuZChpY29uKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwb3NpXHUwMEU3XHUwMEUzbyBob3Jpem9udGFsXHJcblx0XHRpZiAob3B0aW9ucy5wb3NpdGlvbi5tYXRjaCgnbGVmdCcpKSB7XHJcblx0XHRcdHRvYXN0cy5jbGFzc0xpc3QuYWRkKCdsZWZ0Jyk7XHJcblx0XHR9IGVsc2UgaWYgKG9wdGlvbnMucG9zaXRpb24ubWF0Y2goJ3JpZ2h0JykpIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ3JpZ2h0Jyk7XHJcblx0XHR9IGVsc2UgIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ2NlbnRlcicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHBvc2lcdTAwRTdcdTAwRTNvIHZlcnRpY2FsXHJcblx0XHRpZiAob3B0aW9ucy5wb3NpdGlvbi5tYXRjaCgndG9wJykpIHtcclxuXHRcdFx0dG9hc3RzLmNsYXNzTGlzdC5hZGQoJ3RvcCcpO1xyXG5cclxuXHRcdFx0Ly8gYWRpY2lvbmEgZW0gY2ltYSBkbyBhbnRlcmlvclxyXG5cdFx0XHR0b2FzdHMucHJlcGVuZCh0b2FzdCk7XHJcblx0XHRcdHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3Nob3cnLCAndG9wJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0b2FzdHMuY2xhc3NMaXN0LmFkZCgnYm90dG9tJyk7XHJcblxyXG5cdFx0XHQvLyBhZGljaW9uYSBlbSBiYWl4byBkbyBhbnRlcmlvclxyXG5cdFx0XHR0b2FzdHMuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cdFx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JywgJ2JvdHRvbScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJlbW92ZSBhbyB0XHUwMEU5cm1pbm8gZG8gdGVtcG8gZGUgZXhpYmlcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0Ly8gb2N1bHRhXHJcblx0XHRcdHRvYXN0LmNsYXNzTmFtZSA9IHRvYXN0LmNsYXNzTmFtZS5yZXBsYWNlKCdzaG93JywgJ2hpZGUnKTtcclxuXHJcblx0XHRcdC8vIHJlbW92ZVxyXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCA1MDApO1xyXG5cdFx0fSwgb3B0aW9ucy50aW1lICogMTAwMCk7XHJcblx0fVxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG5cdC8vIHN0eWxlXHJcblx0Ly8gbGV0IGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rI3RvYXN0Jyk7XHJcblxyXG5cdC8vIGlmIChsaW5rKSByZXR1cm47XHJcblxyXG5cdC8vIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0Ly8gbGluay5pZCA9ICd0b2FzdCc7XHJcblx0Ly8gbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0Ly8gbGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHQvLyBsaW5rLmhyZWYgPSAnLi9zdHlsZS5jc3M/dj0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblx0Ly8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmFwcGVuZENoaWxkKGxpbmspO1xyXG5cclxuXHQvLyBjb250YWluZXJcclxuXHRsZXQgdG9hc3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvYXN0cycpO1xyXG5cclxuXHRpZiAoIXRvYXN0cykge1xyXG5cdFx0dG9hc3RzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHR0b2FzdHMuY2xhc3NOYW1lID0gJ3RvYXN0cyc7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0cyk7XHJcblx0fVxyXG59KSgpO1xyXG4iLCAiLy8gUmVmLjogaHR0cHM6Ly9sdWNpZGUuZGV2XHJcblxyXG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgSWNvbiA9IG5hbWUgPT4ge1xyXG5cdGNvbnN0IGljb25zID0ge1xyXG5cdFx0ZWxsaXBzaXNWZXJ0aWNhbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJlbGxpcHNpcy12ZXJ0aWNhbFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YmVsbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJiZWxsXCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRsb2dJbjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJsb2ctaW5cIj48L2k+LFxyXG5cdFx0bG9nT3V0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImxvZy1vdXRcIj48L2k+LFxyXG5cdFx0dXNlcjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaXJjbGUtdXNlci1yb3VuZFwiIHN0eWxlPVwic2NhbGU6IDEuMjtcIj48L2k+LFxyXG5cdFx0YWRkOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsdXNcIiBzdHlsZT1cInN0cm9rZS13aWR0aDogMS44OyBzY2FsZTogMS4yO1wiPjwvaT4sXHJcblx0XHRlZGl0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBlbmNpbFwiPjwvaT4sXHJcblx0XHRzZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2VhcmNoXCI+PC9pPixcclxuXHRcdHN0YXJ0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsYXlcIj48L2k+LFxyXG5cdFx0c3RvcDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJzcXVhcmVcIj48L2k+LFxyXG5cdFx0cmVmcmVzaDogPGkgY2xhc3M9XCJpY29uIHJlZnJlc2hcIiBkYXRhLWx1Y2lkZT1cInJlZnJlc2gtY3dcIj48L2k+LFxyXG5cdFx0dGFza3M6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwibGlzdC10b2RvXCIgc3R5bGU9XCJzY2FsZTogMS4zO1wiPjwvaT4sXHJcblx0XHRoaXN0b3J5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImhpc3RvcnlcIiBzdHlsZT1cInNjYWxlOiAxLjM7XCI+PC9pPixcclxuXHRcdGluZm86IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiaW5mb1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YWxlcnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2lyY2xlLWFsZXJ0XCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRjb3B5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImNvcHlcIj48L2k+LFxyXG5cdFx0cGFzdGU6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2xpcGJvYXJkLXBhc3RlXCI+PC9pPixcclxuXHRcdGR1cGxpY2F0ZTogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjb3B5LWNoZWNrXCI+PC9pPixcclxuXHRcdHRyYXNoOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInRyYXNoLTJcIj48L2k+LFxyXG5cdFx0Zm9sZGVyOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZvbGRlclwiPjwvaT4sXHJcblx0XHRmb2xkZXJTZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiZm9sZGVyLXNlYXJjaFwiPjwvaT4sXHJcblx0XHRvcGVuOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImV4dGVybmFsLWxpbmtcIj48L2k+LFxyXG5cdFx0Y2hlY2tlZDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGVja1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0dXA6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi11cFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0ZG93bjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGV2cm9uLWRvd25cIiBzdHlsZT1cInNjYWxlOiAxLjE7XCI+PC9pPixcclxuXHRcdGxlZnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1sZWZ0XCIgc3R5bGU9XCJzY2FsZTogMS4xNTtcIj48L2k+LFxyXG5cdFx0cmlnaHQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1yaWdodFwiIHN0eWxlPVwic2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGFycm93TGVmdDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJhcnJvdy1sZWZ0XCIgc3R5bGU9XCJzdHJva2Utd2lkdGg6IDEuODsgc2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGltcG9ydDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJmaWxlLWRvd25cIj48L2k+LFxyXG5cdFx0ZXhwb3J0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZpbGUtdXBcIj48L2k+LFxyXG5cdFx0c2hlZXQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2hlZXRcIj48L2k+LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBpY29uc1tuYW1lXTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEljb247XHJcbiIsICJpbXBvcnQgVG9hc3QgZnJvbSAnLi4vbGliL1RvYXN0L1RvYXN0JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IHdlYkFQSSA9IG5ldyBXZWJBUElTZXJ2aWNlKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB3ZWJBUEk7XHJcblxyXG5mdW5jdGlvbiBXZWJBUElTZXJ2aWNlKCkge1xyXG5cdC8qXHJcblx0XHRSZXRvcm5vIHBhZHJcdTAwRTNvIGRhcyBmdW5cdTAwRTdcdTAwRjVlcyAtPiB7IHJlc3VsdCwgZXJyb3IgfVxyXG5cdCovXHJcblxyXG5cdHRoaXMuZ2V0Q29uc3RhbnRzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRDb25zdGFudHMnIH0pO1xyXG5cclxuXHQvLyB1dGlsc1xyXG5cdHRoaXMuY29weUNsaXAgPSB0ZXh0ID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnQ29weUNsaXAnLCB0ZXh0OiB0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnJTBBJykucmVwbGFjZSgvXFx0L2csICclMDknKSB9KTtcclxuXHJcblx0Ly8gZm9sZGVyL2ZpbGVcclxuXHR0aGlzLnBhdGhJc0F2YWlsYWJsZSA9IHBhdGggPT4gX3BhdGhJc0F2YWlsYWJsZSh7IG1ldGhvZDogJ1BhdGhJc0F2YWlsYWJsZScsIHBhdGggfSk7XHJcblx0dGhpcy52aWV3SW5GaWxlRXhwbG9yZXIgPSBmaWxlT3JGb2xkZXJQYXRoID0+IF92aWV3SW5GaWxlRXhwbG9yZXIoeyBtZXRob2Q6ICdWaWV3SW5GaWxlRXhwbG9yZXInLCBmaWxlT3JGb2xkZXJQYXRoIH0pO1xyXG5cclxuXHQvLyBmb2xkZXJcclxuXHR0aGlzLmZvbGRlclBpY2tlciA9IHRpdGxlID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRm9sZGVyUGlja2VyJywgdGl0bGUgfSk7XHJcblxyXG5cdC8vIGZpbGVcclxuXHR0aGlzLmZpbGVQaWNrZXIgPSAodGl0bGUsIGZpbGVUeXBlcykgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVUeXBlcyB9KTtcclxuXHR0aGlzLnNhdmVGaWxlUGlja2VyID0gKHRpdGxlLCBmaWxlTmFtZSwgZmlsZVR5cGVzKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NhdmVGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVOYW1lLCBmaWxlVHlwZXMgfSk7XHJcblx0dGhpcy5kb3dubG9hZEZpbGUgPSAodXJsLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0Rvd25sb2FkRmlsZScsIHVybCwgcGF0aCB9KTtcclxuXHR0aGlzLm9wZW5GaWxlID0gcGF0aCA9PiBfb3BlbkZpbGUoeyBtZXRob2Q6ICdPcGVuRmlsZScsIHBhdGggfSk7XHJcblxyXG5cdC8vIGRhdGE6IHRhc2tzXHJcblx0dGhpcy5uZXdUYXNrID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdOZXdUYXNrJyB9KTtcclxuXHR0aGlzLm5ld1Rhc2tGaWxlRmlsdGVySXRlbSA9ICgpID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnTmV3VGFza0ZpbGVGaWx0ZXJJdGVtJyB9KTtcclxuXHR0aGlzLmdldFRhc2tzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRUYXNrcycgfSk7XHJcblx0dGhpcy5nZXRUYXNrQnlJZCA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnR2V0VGFza0J5SWQnLCBpZCB9KTtcclxuXHR0aGlzLmluc2VydFRhc2sgPSBpdGVtID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnSW5zZXJ0VGFzaycsIGl0ZW0gfSk7XHJcblx0dGhpcy5pbXBvcnRUYXNrcyA9IHBhdGggPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdJbXBvcnRUYXNrcycsIHBhdGggfSk7XHJcblx0dGhpcy51cGRhdGVUYXNrID0gaXRlbSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1VwZGF0ZVRhc2snLCBpdGVtIH0pO1xyXG5cdHRoaXMuZGVsZXRlVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRGVsZXRlVGFzaycsIGlkLCBkZWxldGVIaXN0b3J5OiB0cnVlIH0pO1xyXG5cclxuXHQvLyBkYXRhOiBoaXN0b3J5XHJcblx0dGhpcy5nZXRIaXN0b3J5UGFnZWQgPSAocGFnZUluZGV4LCBsaW1pdCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRIaXN0b3J5UGFnZWQnLCBwYWdlSW5kZXgsIGxpbWl0IH0pO1xyXG5cdHRoaXMuZGVsZXRlSGlzdG9yeUV2ZW50cyA9IGlkcyA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0RlbGV0ZUhpc3RvcnlFdmVudHMnLCBpZHMgfSk7XHJcblx0dGhpcy5nZXRJdGVtc0Zyb21IaXN0b3J5RmlsZVBhZ2VkID0gKGZpbGVOYW1lLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0dldEl0ZW1zRnJvbUhpc3RvcnlGaWxlUGFnZWQnLCBmaWxlTmFtZSwgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmV4cG9ydEhpc3RvcnkgPSAoc2hlZXROYW1lLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0V4cG9ydEhpc3RvcnknLCBzaGVldE5hbWUsIHBhdGggfSk7XHJcblx0dGhpcy5leHBvcnRIaXN0b3J5RmlsZXMgPSAoZmlsZU5hbWUsIHNoZWV0TmFtZSwgcGF0aCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdFeHBvcnRIaXN0b3J5RmlsZXMnLCBmaWxlTmFtZSwgc2hlZXROYW1lLCBwYXRoIH0pO1xyXG5cclxuXHQvLyB0YXNrXHJcblx0dGhpcy5zZWFyY2hUYXNrRmlsZXNQYWdlZCA9IChpdGVtLCBlbmFibGVFeGNlcHRpb25zLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NlYXJjaFRhc2tGaWxlc1BhZ2VkJywgaXRlbSwgZW5hYmxlRXhjZXB0aW9ucywgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmlzVGFza1J1bm5pbmcgPSBpZCA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0lzVGFza1J1bm5pbmcnLCBpZCB9KTtcclxuXHR0aGlzLnN0YXJ0VGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RhcnRUYXNrJywgaWQgfSk7XHJcblx0dGhpcy5zdG9wVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RvcFRhc2snLCBpZCB9KTtcclxuXHJcblxyXG5cdC8vIEZVTlx1MDBDN1x1MDBENUVTXHJcblxyXG5cdGZ1bmN0aW9uIF9yZXF1ZXN0QVBJKHBhcmFtcyA9IHt9KSB7XHJcblx0XHRyZXR1cm4gZmV0Y2goJy9hcGknLCB7XHJcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShwYXJhbXMpXHJcblx0XHR9KS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfcGF0aElzQXZhaWxhYmxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IGlzQXZhaWxhYmxlIH0gPSBhd2FpdCBfcmVxdWVzdEFQSShwYXJhbXMpO1xyXG5cclxuXHRcdGlmICghaXNBdmFpbGFibGUpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgaW52YWxpZCBvciBhY2Nlc3MgaXMgZGVuaWVkLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGlzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gX29wZW5GaWxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVW5hYmxlIHRvIG9wZW4gdGhlIGZpbGUuIFBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUgZGlyZWN0b3J5IGFuZCB2ZXJpZnkgaXRzIGNvbnRlbnRzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA2XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfdmlld0luRmlsZUV4cGxvcmVyKHBhcmFtcykge1xyXG5cdFx0aWYgKHBhcmFtcy5maWxlT3JGb2xkZXJQYXRoLmxlbmd0aCA8PSAyNjApIHtcclxuXHRcdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRcdG1lc3NhZ2U6IGVycm9yLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHRcdHRpbWU6IDQsXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRpY29uOiBJY29uKCdpbmZvJyksXHJcblx0XHRcdFx0bWVzc2FnZTogJ0Nhbm5vdCBvcGVuIGZvbGRlcjogcGF0aCBleGNlZWRzIDI2MCBjaGFyYWN0ZXJzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0LFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBQYWdlTGF5b3V0ID0gKHsgbmF2aWdhdGlvbiwgYXBwQmFyLCBmb290ZXIgfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwibGF5b3V0XCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJuYXZpZ2F0aW9uXCI+XHJcblx0XHRcdFx0e25hdmlnYXRpb24gPyBuYXZpZ2F0aW9uLmVsZW1lbnQubm9kZXNbMF0gOiAnJ31cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJtYWluXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImFwcGJhciBiYlwiPlxyXG5cdFx0XHRcdFx0e2FwcEJhciA/IGFwcEJhci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInBhZ2VcIj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJhY3Rpb25iYXIgYmJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb250ZW50XCI+PC9kaXY+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlciBidFwiPlxyXG5cdFx0XHRcdFx0e2Zvb3RlciA/IGZvb3Rlci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRuYXZpZ2F0aW9uOiAkcm9vdC5nZXQoJy5uYXZpZ2F0aW9uJyksXHJcblx0XHRcdGFwcEJhcjogJHJvb3QuZ2V0KCcubWFpbiAuYXBwYmFyJyksXHJcblx0XHRcdHBhZ2U6ICRyb290LmdldCgnLnBhZ2UnKSxcclxuXHRcdFx0aGVhZGVyOiAkcm9vdC5nZXQoJy5wYWdlIC5oZWFkZXInKSxcclxuXHRcdFx0YWN0aW9uQmFyOiAkcm9vdC5nZXQoJy5wYWdlIC5hY3Rpb25iYXInKSxcclxuXHRcdFx0Y29udGVudDogJHJvb3QuZ2V0KCcucGFnZSAuY29udGVudCcpLFxyXG5cdFx0XHRmb290ZXI6ICRyb290LmdldCgnLm1haW4gLmZvb3RlcicpLFxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZUxheW91dDtcclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gIDA3LzAxLzIwMjQuXHJcblx0RGVzY3JpXHUwMEU3XHUwMEUzbzogTWVudSBkZSBjb250ZXh0byBzaW1wbGVzLlxyXG4qL1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0dHJpZ2dlcjogbnVsbCwgLy8gSFRNTEVsZW1lbnQgKGV4LjogYnV0dG9uIHwgYSB8IGRpdilcclxuXHRpdGVtczogW10sIC8vIFt7IGljb246IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcsIG9uQ2xpY2s6IGZ1bmN0aW9uIH1dXHJcblx0YWxpZ246ICdsZWZ0JywgLy8gbGVmdCB8IHJpZ2h0XHJcblx0dG9wOiAwLCAvLyBBanVzdGUgZGUgcG9zaVx1MDBFN1x1MDBFM29vIHZlcnRpY2FsIHF1YW5kbyBuZWNlc3NcdTAwRTFyaW9cclxuXHRvblNob3c6IG51bGwsXHJcblx0b25IaWRlOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWVudShvcHRpb25zKSB7XHJcblx0b3B0aW9ucyA9IHtcclxuXHRcdC4uLmRlZmF1bHRPcHRpb25zLFxyXG5cdFx0Li4ub3B0aW9ucyxcclxuXHR9O1xyXG5cclxuXHRsZXQgJG1lbnU7XHJcblx0bGV0IF9jbGFzc1Zpc2libGUgPSAnJztcclxuXHRsZXQgX2NsYXNzSW52aXNpYmxlID0gJyc7XHJcblxyXG5cdGlmIChvcHRpb25zLnRyaWdnZXIpIHtcclxuXHRcdG9wdGlvbnMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdHNob3coKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgX2NvbnRleHQgPSB7XHJcblx0XHRvcHRpb25zLFxyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGl0ZW06IF9pdGVtLFxyXG5cdFx0c2hvdyxcclxuXHRcdGhpZGUsXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIF9jb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRtZW51LmNsYXNzTmFtZSA9ICdjdHgtbWVudSc7XHJcblx0XHQkbWVudS5pbm5lckhUTUwgPSAvKmh0bWwqL2Ake29wdGlvbnMuaXRlbXMubWFwKGl0ZW0gPT4ge1xyXG5cdFx0XHRpZiAoaXRlbS5kaXZpZGVyKSB7XHJcblx0XHRcdFx0cmV0dXJuICgvKmh0bWwqL2BcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGl2aWRlclwiPjwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAoLypodG1sKi9gXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY3R4LWl0ZW1cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImN0eC1pY29uXCI+PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtdGV4dFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtbmFtZVwiPiR7aXRlbS5uYW1lfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGVzY3JpcHRpb25cIj4ke2l0ZW0uZGVzY3JpcHRpb24gfHwgJyd9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0YCk7XHJcblx0XHRcdH1cclxuXHRcdH0pLmpvaW4oJycpfWA7XHJcblxyXG5cdFx0Ly8gSXRlbnNcclxuXHRcdCRtZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IGRpdicpLmZvckVhY2goKCRpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRjb25zdCBpdGVtID0gb3B0aW9ucy5pdGVtc1tpbmRleF07XHJcblx0XHRcdGNvbnN0IGljb24gPSBpdGVtLmljb247XHJcblxyXG5cdFx0XHQkaXRlbS5kYXRhID0gaXRlbTtcclxuXHRcdFx0aXRlbS5lbGVtZW50ID0gJGl0ZW07XHJcblxyXG5cdFx0XHQvLyBcdTAwQ0Rjb25lXHJcblx0XHRcdGlmIChpY29uKSB7XHJcblx0XHRcdFx0Y29uc3QgJGljb24gPSAkaXRlbS5xdWVyeVNlbGVjdG9yKCcuY3R4LWljb24nKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBpY29uID09ICdzdHJpbmcnKVxyXG5cdFx0XHRcdFx0JGljb24uaW5uZXJIVE1MID0gaWNvbjtcclxuXHRcdFx0XHRlbHNlIGlmIChpY29uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdFx0XHQkaWNvbi5hcHBlbmRDaGlsZChpY29uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRXZlbnRvXHJcblx0XHRcdGlmIChpdGVtLmRpdmlkZXIgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0JGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XHJcblx0XHRcdFx0XHRoaWRlKCk7XHJcblx0XHJcblx0XHRcdFx0XHRpZiAoaXRlbS5vbkNsaWNrKVxyXG5cdFx0XHRcdFx0XHRpdGVtLm9uQ2xpY2soZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRfY29udGV4dC5lbGVtZW50ID0gJG1lbnU7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRtZW51KTtcclxuXHJcblx0XHRyZXR1cm4gJG1lbnU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfaXRlbShuYW1lKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRnZXQsXHJcblx0XHRcdGljb24sXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0cmV0dXJuIG9wdGlvbnMuaXRlbXMuZmluZCh4ID0+IHgubmFtZSA9PSBuYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpY29uKGVsZW1lbnQpIHtcclxuXHRcdFx0Y29uc3QgJGl0ZW0gPSBnZXQoKS5lbGVtZW50O1xyXG5cdFx0XHRjb25zdCAkaWNvblBsYWNlID0gJGl0ZW0ucXVlcnlTZWxlY3RvcignLmN0eC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZiAoZWxlbWVudCkge1xyXG5cdFx0XHRcdCRpY29uUGxhY2UuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRcdFx0JGljb25QbGFjZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIGlmIChlbGVtZW50ID09ICcnKSB7XHJcblx0XHRcdFx0JGljb25QbGFjZS5pbm5lckhUTUwgPSAnJztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gJGljb25QbGFjZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhldmVudCA9IHt9KSB7XHJcblx0XHRsZXQgeDtcclxuXHRcdGxldCB5O1xyXG5cclxuXHRcdGRlc3Ryb3koKTtcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xpY2soKTsgLy8gRGVzdHJvaSBvdXRyb3MgbWVudXNcclxuXHRcdCRtZW51ID0gY3JlYXRlKCk7XHJcblx0XHRfY2xhc3NWaXNpYmxlID0gJ2N0eC1tZW51LXZpc2libGUtbGVmdCc7XHJcblx0XHRfY2xhc3NJbnZpc2libGUgPSAnY3R4LW1lbnUtaW52aXNpYmxlLWxlZnQnO1xyXG5cclxuXHRcdC8vIEJvdFx1MDBFM28gZGlyZWl0byBkbyBtb3VzZVxyXG5cdFx0aWYgKGV2ZW50LnR5cGUgPT0gJ2NvbnRleHRtZW51Jykge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBJbXBlZGUgcXVlIG8gbWVudSBkZSBjb250ZXh0byBuYXRpdm8gZG8gbmF2ZWdhZG9yIHNlamEgYWJlcnRvXHJcblxyXG5cdFx0XHQvLyBDb29yZGVuYWRhcyBkbyBjdXJzb3JcclxuXHRcdFx0eCA9IGV2ZW50Lng7XHJcblx0XHRcdHkgPSBldmVudC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBvc2lcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgLy8gUGFyYSBxdWUgd2luZG93IGNsaWNrIG5cdTAwRTNvIGZlY2hlIG8gbWVudVxyXG5cdFx0XHRpZiAob3B0aW9ucy50cmlnZ2VyKSB7XHJcblx0XHRcdFx0Y29uc3QgdHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlcjtcclxuXHJcblx0XHRcdFx0Ly8gQ2FudG8gaW5mZXJpb3IgZXNxdWVyZG8gZG8gdHJpZ2dlclxyXG5cdFx0XHRcdHggPSB0cmlnZ2VyLm9mZnNldExlZnQ7XHJcblx0XHRcdFx0eSA9IHRyaWdnZXIub2Zmc2V0VG9wICsgdHJpZ2dlci5vZmZzZXRIZWlnaHQgKyAxO1xyXG5cclxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGlnbiA9PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQvLyBDYW50byBpbmZlcmlvciBkaXJlaXRvIGRvIHRyaWdnZXJcclxuXHRcdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGggKyB0cmlnZ2VyLm9mZnNldFdpZHRoIC0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh4ICsgJG1lbnUub2Zmc2V0V2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG5cdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGg7XHJcblxyXG5cdFx0XHRcdF9jbGFzc1Zpc2libGUgPSAnY3R4LW1lbnUtdmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdFx0X2NsYXNzSW52aXNpYmxlID0gJ2N0eC1tZW51LWludmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh5ICsgJG1lbnUub2Zmc2V0SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0ID4gMClcclxuXHRcdFx0XHR5ID0gd2luZG93LmlubmVySGVpZ2h0IC0gJG1lbnUub2Zmc2V0SGVpZ2h0O1xyXG5cclxuXHRcdFx0JG1lbnUuY2xhc3NOYW1lID0gJ2N0eC1tZW51JztcclxuXHRcdFx0JG1lbnUuY2xhc3NMaXN0LmFkZChfY2xhc3NWaXNpYmxlKTtcclxuXHRcdFx0JG1lbnUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG5cdFx0XHQkbWVudS5zdHlsZS50b3AgPSBvcHRpb25zLnRvcCArIHkgKyAncHgnO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMub25TaG93KVxyXG5cdFx0XHRcdG9wdGlvbnMub25TaG93KF9jb250ZXh0KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGUpO1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGlkZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoaWRlKGV2ZW50KSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0aWYgKGV2ZW50KSB7XHJcblx0XHRcdGlmICghKCFldmVudC50YXJnZXQuY2xvc2VzdCgnLmN0eC1tZW51JykgfHwgZXZlbnQua2V5ID09ICdFc2NhcGUnKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JG1lbnUuY2xhc3NMaXN0LnJlbW92ZShfY2xhc3NWaXNpYmxlKTtcclxuXHRcdCRtZW51LmNsYXNzTGlzdC5hZGQoX2NsYXNzSW52aXNpYmxlKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkhpZGUpXHJcblx0XHRcdG9wdGlvbnMub25IaWRlKF9jb250ZXh0KTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KGRlc3Ryb3ksIDIwMCk7XHJcblxyXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoaWRlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0JG1lbnUucmVtb3ZlKCk7XHJcblx0XHQkbWVudSA9IG51bGw7XHJcblx0fVxyXG59O1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vSWNvbic7XHJcblxyXG5jb25zdCBBcHBCYXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJBcHBCYXIgZmxleCBqdXN0aWZ5LWJldHdlZW4gdy1mdWxsXCI+XHJcblx0XHRcdDxkaXY+PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yXCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwIG5vdGlmaWNhdGlvblwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ2JlbGwnKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTAgdXNlclwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ3VzZXInKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRzZXQoKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHNldCgpIHtcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiAkcm9vdC5nZXQoJ2J1dHRvbi51c2VyJykubm9kZXNbMF0sXHJcblx0XHRcdGFsaWduOiAncmlnaHQnLFxyXG5cdFx0XHR0b3A6IDEsXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnVXNlciBuYW1lJywgaWNvbjogSWNvbigndXNlcicpLCBkZXNjcmlwdGlvbjogJ01hbmFnZSB5b3VyIGFwcCBhY2NvdW50LicsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IGRpdmlkZXI6IHRydWUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdMb2cgb3V0JywgaWNvbjogSWNvbignbG9nT3V0JyksIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdBYm91dCcsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHBCYXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgTmF2aWdhdGlvbiA9IChpdGVtcyA9IFtdKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJOYXZpZ2F0aW9uXCI+XHJcblx0XHRcdDxkaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImhlYWRlclwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImxvZ29cIj5cclxuXHRcdFx0XHRcdFx0PGltZyBzcmM9XCJsb2dvLnN2Z1wiIC8+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cInRpdGxlXCI+VHJhbnNGaWxlPC9sYWJlbD5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiaXRlbXNcIj57XHJcblx0XHRcdFx0XHRpdGVtcy5tYXAoaXRlbSA9PlxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPXtpdGVtLmhyZWZ9IGNsYXNzPVwiaXRlbVwiIGRhdGEta2V5d29yZD17aXRlbS5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHR7aXRlbS5pY29ufVxyXG5cdFx0XHRcdFx0XHRcdDxsYWJlbD57aXRlbS50aXRsZX08L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHQ8L2E+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fTwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlclwiPlxyXG5cdFx0XHRcdFZlcnNpb24gMS4xXHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0c2V0QWN0aXZlLFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHNldEFjdGl2ZSgpIHtcclxuXHRcdCRyb290LmdldCgnLml0ZW0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJykuZm9yRWFjaChpdGVtID0+IHtcclxuXHRcdFx0Y29uc3Qga2V5d29yZCA9IGl0ZW0uYXR0cignZGF0YS1rZXl3b3JkJyk7XHJcblxyXG5cdFx0XHRpZiAobG9jYXRpb24uaGFzaC5tYXRjaChrZXl3b3JkKSlcclxuXHRcdFx0XHRpdGVtLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb247XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgUGFnZUZvb3RlciA9ICgpID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlBhZ2VGb290ZXJcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImluZm9cIj48L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdGluZm8sXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gaW5mbyh0ZXh0T3JIdG1sT3JFbGVtZW50KSB7XHJcblx0XHRjb25zdCAkaW5mbyA9ICRyb290LmdldCgnLmluZm8nKTtcclxuXHJcblx0XHR0ZXh0T3JIdG1sT3JFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgPyAkaW5mby5pbnNlcnQodGV4dE9ySHRtbE9yRWxlbWVudCkgOiAkaW5mby5odG1sKHRleHRPckh0bWxPckVsZW1lbnQgfHwgJycpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2VGb290ZXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBMb2dpblBhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxmb3JtIGNsYXNzPVwiTG9naW5QYWdlXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0aXRsZVwiPlNpZ24gaW4gdG8geW91ciBhY2NvdW50PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZHNcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGRcIj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPllvdXIgZW1haWw8L2Rpdj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJlbWFpbFwiIHJlcXVpcmVkIHNwZWxsY2hlY2s9XCJmYWxzZVwiIHBsYWNlaG9sZGVyPVwiLi4uQC4uLlwiIHN0eWxlPVwid2lkdGg6IDEwMCU7XCIgLz5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGRcIj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlBhc3N3b3JkPC9kaXY+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmFtZT1cInBhc3N3b3JkXCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiIC8+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBjbGFzcz1cImxpbmsgYmx1ZSBsaW5rLWZvcmdvdFwiPlxyXG5cdFx0XHRcdEZvcmdvdCBwYXNzd29yZD9cclxuXHRcdFx0PC9hPlxyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbi1zaWduaW5cIj5TaWduIGluPC9idXR0b24+XHJcblx0XHQ8L2Zvcm0+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbG9naW4tdGhlbWUnKTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2dpblBhZ2U7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuL0ljb24nO1xyXG5cclxuY29uc3QgUGFnZUhlYWRlciA9ICh7IHBhZ2VNYXAgPSBbXSwgZGVzY3JpcHRpb24gPSAnJywgb25DbGlja0JhY2tCdXR0b24gfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiUGFnZUhlYWRlclwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiYnJlYWRjcnVtYlwiPjwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb25cIj5cclxuXHRcdFx0XHR7ZGVzY3JpcHRpb259XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRzZXRQYWdlTWFwLFxyXG5cdH07XHJcblxyXG5cdHNldFBhZ2VNYXAocGFnZU1hcCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBzZXRQYWdlTWFwKHBhZ2VNYXApIHtcclxuXHRcdGNvbnN0ICRicmVhZGNydW1iID0gJHJvb3QuZ2V0KCcuYnJlYWRjcnVtYicpLmh0bWwoJycpO1xyXG5cclxuXHRcdHBhZ2VNYXAuZm9yRWFjaCgoJGl0ZW0sIGluZGV4KSA9PiB7XHJcblx0XHRcdCRpdGVtID0gZG9tKCRpdGVtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgPyAkaXRlbSA6IDxzcGFuPnskaXRlbX08L3NwYW4+KS5hZGRDbGFzcygnaXRlbScpO1xyXG5cclxuXHRcdFx0bGV0IHRhZyA9ICRpdGVtLmF0dHIoJ3RhZ05hbWUnKTtcclxuXHJcblx0XHRcdGlmICh0YWcgPT0gJ0EnIHx8IHRhZyA9PSAnQlVUVE9OJylcclxuXHRcdFx0XHQkaXRlbS5hZGRDbGFzcygnYnV0dG9uJywgJ3ctMTAnLCAnaC0xMCcpO1xyXG5cclxuXHRcdFx0aWYgKHBhZ2VNYXAubGVuZ3RoID09IDEpXHJcblx0XHRcdFx0JGl0ZW0uc3R5bGUoJ3BhZGRpbmcnLCAnMHB4Jyk7XHJcblxyXG5cdFx0XHRpZiAoaW5kZXggPT0gcGFnZU1hcC5sZW5ndGggLSAxKVxyXG5cdFx0XHRcdCRpdGVtLmFkZENsYXNzKCdsYXN0Jyk7XHJcblxyXG5cdFx0XHQkYnJlYWRjcnVtYi5pbnNlcnQoJGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4IDwgcGFnZU1hcC5sZW5ndGggLSAxKVxyXG5cdFx0XHRcdCRicmVhZGNydW1iLmluc2VydChJY29uKCdyaWdodCcpKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChvbkNsaWNrQmFja0J1dHRvbikge1xyXG5cdFx0XHQkYnJlYWRjcnVtYi5pbnNlcnQoXHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwIGJhY2tidXR0b25cIiBvbkNsaWNrPXtvbkNsaWNrQmFja0J1dHRvbn0+XHJcblx0XHRcdFx0XHR7SWNvbignYXJyb3dMZWZ0Jyl9XHJcblx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0LCB0cnVlXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZUhlYWRlcjtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBBY3Rpb25CYXIgPSAoeyBidXR0b25zID0gW10gfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiQWN0aW9uQmFyXCI+XHJcblx0XHRcdHtidXR0b25zLm1hcChidXR0b24gPT4ge1xyXG5cdFx0XHRcdGlmIChidXR0b24uZGl2aWRlcikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIDxzcGFuIGNsYXNzPVwiZGl2aWRlciBoLTVcIj48L3NwYW4+O1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zdCAkYnV0dG9uID0gKFxyXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiBidXR0b24gdy0xMCBoLTEwXCIgbmFtZT17YnV0dG9uLm5hbWUgfHwgJyd9IHRpdGxlPXtidXR0b24udG9vbHRpcCB8fCAnJ30gc3R5bGU9e2J1dHRvbi5zdHlsZSB8fCAnJ30gb25DbGljaz17YnV0dG9uLm9uQ2xpY2t9PlxyXG5cdFx0XHRcdFx0XHRcdHtidXR0b24uaWNvbiB8fCAnJ31cclxuXHRcdFx0XHRcdFx0XHR7YnV0dG9uLmRpc3BsYXlOYW1lID8gPHNwYW4gY2xhc3M9XCJuYW1lXCI+e2J1dHRvbi5kaXNwbGF5TmFtZX08L3NwYW4+IDogJyd9XHJcblx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHQkYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgISFidXR0b24uZGlzYWJsZWQpO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiAkYnV0dG9uO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSl9XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRidXR0b24sXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gYnV0dG9uKG5hbWUpIHtcclxuXHRcdGxldCAkYnV0dG9uID0gJHJvb3QuZ2V0QnlOYW1lKG5hbWUpO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGRpc2FibGUsXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZSA9IHRydWUpIHtcclxuXHRcdFx0JGJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnLCBkaXNhYmxlKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25CYXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgUm93UHJvZ3Jlc3NCYXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJSb3dQcm9ncmVzc0JhclwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiYmFyXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCI+PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidmFsdWVcIj48L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6IHJvb3QsXHJcblx0XHR1cGRhdGUsXHJcblx0XHRzaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGUocGVyY2VudCA9IDAsIHZhbHVlID0gJycpIHtcclxuXHRcdCRyb290LmdldCgnLnByb2dyZXNzJykuc3R5bGUoJ3dpZHRoJywgYCR7cGVyY2VudH0lYCk7XHJcblx0XHQkcm9vdC5nZXQoJy52YWx1ZScpLmh0bWwodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0JHJvb3Quc3R5bGUoeyB2aXNpYmlsaXR5OiBzaG93ID8gJ3Zpc2libGUnIDogJ2hpZGRlbicgfSk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm93UHJvZ3Jlc3NCYXI7XHJcbiIsICJjb25zdCB1dGlscyA9IG5ldyBVdGlscygpO1xyXG5cclxuZXhwb3J0IHsgdXRpbHMgfTtcclxuXHJcbmZ1bmN0aW9uIFV0aWxzKCkge1xyXG5cdHRoaXMuZ2VuZXJhdGVHdWlkID0gZ2VuZXJhdGVHdWlkO1xyXG5cdHRoaXMubWVyZ2VQcm9wcyA9IG1lcmdlUHJvcHM7XHJcblx0dGhpcy5nZXRFbGVtZW50SW5kZXggPSBnZXRFbGVtZW50SW5kZXg7XHJcblx0dGhpcy5jcmVhdGVSYW5nZUFycmF5ID0gY3JlYXRlUmFuZ2VBcnJheTtcclxuXHR0aGlzLmlzQXJyYXlPZkhUTUxFbGVtZW50ID0gaXNBcnJheU9mSFRNTEVsZW1lbnQ7XHJcblx0dGhpcy5wYXJzZURpbWVuc2lvbiA9IHBhcnNlRGltZW5zaW9uO1xyXG5cdHRoaXMuc2V0RWxlbWVudEF0dHIgPSBzZXRFbGVtZW50QXR0cjtcclxuXHR0aGlzLnNldEVsZW1lbnRTdHlsZSA9IHNldEVsZW1lbnRTdHlsZTtcclxuXHJcblx0ZnVuY3Rpb24gZ2VuZXJhdGVHdWlkKCkge1xyXG5cdFx0Ly8gUmV0b3JuYSByYW5kb21pY2FtZW50ZSB1bSBHVUlEIC0gRXguOiBhOTFlMzJkZi05MzUyLTQ1MjAtOWYwOS0xNzE1YTlhMGNlNDFcclxuXHJcblx0XHRjb25zdCBndWlkID0gKFsxZTZdICsgLTFlMyArIC00ZTMgKyAtOGUzICsgLTFlMTEpLnJlcGxhY2UoL1swMThdL2csIGMgPT5cclxuXHRcdFx0KGMgXiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEpKVswXSAmIDE1ID4+IGMgLyA0KS50b1N0cmluZygxNilcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gYWRpY2lvbmEgdW1hIGxldHJhIGNvbW8gcHJpbWVpcm8gY2FyYWN0ZXJlIHBhcmEgZXZpdGFyIGVycm8gbmEgZnVuXHUwMEU3XHUwMEUzbyBxdWVyeVNlbGVjdG9yXHJcblx0XHRyZXR1cm4gJ2EnICsgZ3VpZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlUHJvcHModGFyZ2V0LCBzb3VyY2UpIHtcclxuXHRcdGNvbnN0IG1lcmdlZCA9IHsgLi4udGFyZ2V0IH07XHJcblxyXG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcblx0XHRcdGlmIChcclxuXHRcdFx0XHRzb3VyY2Vba2V5XSBpbnN0YW5jZW9mIE9iamVjdCAmJlxyXG5cdFx0XHRcdCEoc291cmNlW2tleV0gaW5zdGFuY2VvZiBBcnJheSkgJiZcclxuXHRcdFx0XHQhKHNvdXJjZVtrZXldIGluc3RhbmNlb2YgRnVuY3Rpb24pICYmXHJcblx0XHRcdFx0IShzb3VyY2Vba2V5XSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRtZXJnZWRba2V5XSA9IG1lcmdlUHJvcHModGFyZ2V0W2tleV0gfHwge30sIHNvdXJjZVtrZXldKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtZXJnZWRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEVsZW1lbnRJbmRleCgkZWxlbWVudCkge1xyXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBBcnJheS5mcm9tKCRlbGVtZW50LnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pO1xyXG5cclxuXHRcdHJldHVybiBjaGlsZHJlbi5pbmRleE9mKCRlbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZVJhbmdlQXJyYXkoc3RhcnROdW1iZXIsIGVuZE51bWJlcikge1xyXG5cdFx0Ly8gdmVyaWZpY2EgYSBkaXJlXHUwMEU3XHUwMEUzbyBkbyBpbnRlcnZhbG8gKGNyZXNjZW50ZSBvdSBkZWNyZXNjZW50ZSlcclxuXHRcdGNvbnN0IGlzQXNjZW5kaW5nID0gc3RhcnROdW1iZXIgPD0gZW5kTnVtYmVyO1xyXG5cclxuXHRcdC8vIGNyaWEgbyBpbnRlcnZhbG9cclxuXHRcdHJldHVybiBBcnJheS5mcm9tKFxyXG5cdFx0XHR7IGxlbmd0aDogTWF0aC5hYnMoZW5kTnVtYmVyIC0gc3RhcnROdW1iZXIpICsgMSB9LFxyXG5cdFx0XHQoXywgaW5kZXgpID0+IGlzQXNjZW5kaW5nXHJcblx0XHRcdFx0PyBzdGFydE51bWJlciArIGluZGV4XHJcblx0XHRcdFx0OiBzdGFydE51bWJlciAtIGluZGV4XHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNBcnJheU9mSFRNTEVsZW1lbnQob2JqKSB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShvYmopKVxyXG5cdFx0XHRyZXR1cm4gb2JqLmV2ZXJ5KGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KTtcclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwYXJzZURpbWVuc2lvbih2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyA/IGAke3ZhbHVlfXB4YCA6IHZhbHVlIHx8ICcnO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RWxlbWVudFN0eWxlKGVsZW1lbnRzLCBhdHRyaWJ1dGVzID0ge30pIHtcclxuXHRcdHNldEVsZW1lbnRBdHRyKGVsZW1lbnRzLCBhdHRyaWJ1dGVzLCAnc3R5bGUnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEVsZW1lbnRBdHRyKGVsZW1lbnRzLCBhdHRyaWJ1dGVzID0ge30sIG9iamVjdE5hbWUgPSAnJykge1xyXG5cdFx0Ly8gYXR0cmlidXRlczogb2JqZWN0XHJcblx0XHQvLyBvYmplY3Q6IHN0cmluZyAtIGV4Ljogc3R5bGVcclxuXHJcblx0XHRlbGVtZW50cyA9IGVsZW1lbnRzIGluc3RhbmNlb2YgQXJyYXkgPyBlbGVtZW50cyA6IFtlbGVtZW50c107XHJcblxyXG5cdFx0ZWxlbWVudHMuZm9yRWFjaCh4ID0+IHtcclxuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xyXG5cdFx0XHRcdGxldCBub2RlID0gb2JqZWN0TmFtZSA/IHhbb2JqZWN0TmFtZV0gOiB4O1xyXG5cdFx0XHRcdGxldCB2YWx1ZSA9IGF0dHJpYnV0ZXNba2V5XTtcclxuXHJcblx0XHRcdFx0Ly8gdmFsb3JlcyBpbnRlaXJvcyBjb20gdW5pZGFkZSBweFxyXG5cdFx0XHRcdGlmIChvYmplY3ROYW1lID09ICdzdHlsZScpIHtcclxuXHRcdFx0XHRcdGxldCBpbXBvcnRhbnQgPSAnJztcclxuXHJcblx0XHRcdFx0XHRpZiAoIWtleS5tYXRjaCgvaW5kZXh8bGluZXxncmlkfG9yZGVyfHRhYnxvcnBoYW5zfHdpZG93c3xjb2x1bW5zfGNvdW50ZXJ8b3BhY2l0eS9pKSlcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgPyB2YWx1ZSArICdweCcgOiB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRpZiAodmFsdWUubWF0Y2goL2ltcG9ydGFudC9pKSkge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5pbmRleE9mKCchJykgLSAxKS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGltcG9ydGFudCA9ICdpbXBvcnRhbnQnO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmIChpbXBvcnRhbnQpXHJcblx0XHRcdFx0XHRcdG5vZGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgaW1wb3J0YW50KTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHR5cGVvZiBub2RlW2tleV0gPT0gJ3VuZGVmaW5lZCcgP1xyXG5cdFx0XHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKSA6XHJcblx0XHRcdFx0XHRcdG5vZGVba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbiIsICJleHBvcnQgY2xhc3MgVGFibGVPcHRpb25zIHtcclxuXHRkYXRhID0gW107IC8qIFtcclxuXHRcdHsgZmllbGROYW1lMTogdmFsdWUsIGZpZWxkTmFtZTI6IHZhbHVlIH0sXHJcblx0XHR7IGZpZWxkTmFtZTI6IHZhbHVlLCBmaWVsZE5hbWUyOiB2YWx1ZSB9LFxyXG5cdFx0Li5cclxuXHRdICovXHJcblx0cGxhY2UgPSBudWxsOyAvLyBIVE1MRWxlbWVudFxyXG5cdGhlYWRlciA9IHtcclxuXHRcdGhpZGRlbjogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdGRpc2FibGVkOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdH07XHJcblx0Y29sdW1ucyA9IG51bGw7IC8qIHtcclxuXHRcdGZpZWxkTmFtZTE6IENvbHVtbk9wdGlvbnMsXHJcblx0XHRmaWVsZE5hbWUyOiBDb2x1bW5PcHRpb25zLFxyXG5cdFx0Li5cclxuXHR9ICovXHJcblx0cm93cyA9IHtcclxuXHRcdHNlbGVjdE9uQ2xpY2s6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRhbGxvd011bHRpcGxlU2VsZWN0aW9uOiB0cnVlLCAvLyBib29sZWFuXHJcblx0fTtcclxuXHRjZWxscyA9IG51bGw7IC8qIHtcclxuXHRcdGZpZWxkTmFtZTE6IHtcclxuXHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4geyByZXR1cm4uLiB9LFxyXG5cdFx0XHRzdHlsZTogb2JqZWN0LFxyXG5cdFx0fSxcclxuXHRcdGZpZWxkTmFtZTI6IHtcclxuXHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4geyByZXR1cm4uLiB9LFxyXG5cdFx0XHRzdHlsZTogb2JqZWN0LFxyXG5cdFx0fVxyXG5cdFx0Li5cclxuXHR9ICovXHJcblx0Ym9yZGVycyA9IHtcclxuXHRcdHRhYmxlOiB7XHJcblx0XHRcdHRvcDogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdFx0Ym90dG9tOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdFx0XHRhbGw6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRcdHJhZGl1czogbnVsbCwgLy8gcHhcclxuXHRcdH0sXHJcblx0XHRyb3dzOiB0cnVlLCAvLyBib29sZWFuXHJcblx0XHRjZWxsczogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHR9O1xyXG5cdGZvb3RlciA9IHtcclxuXHRcdGhpZGRlbjogdHJ1ZSwgLy8gYm9vbGVhblxyXG5cdFx0ZGlzYWJsZWQ6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRjb250ZW50OiBudWxsLCAvLyBIVE1MRWxlbWVudCB8IHN0cmluZ1xyXG5cdH07XHJcblx0d2lkdGggPSBudWxsOyAvLyBudW1iZXJcclxuXHRoZWlnaHQgPSBudWxsOyAvLyBudW1iZXJcclxuXHRzdHlsZSA9IG51bGw7IC8vIG9iamVjdDogZXguOiB7IGNvbG9yOiByZWQsICdtaW4td2lkdGgnOiAxNTAgfVxyXG5cdGNoZWNrYm94ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRzb3J0ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRyZXNpemUgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGRpc2FibGVkID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRvbkFkZFJvdyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25TZWxlY3RSb3dzID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvblVuc2VsZWN0Um93cyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25VcGRhdGVSb3cgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uUmVtb3ZlUm93cyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25Eb3VibGVDbGlja1JvdyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25SZXNpemVDb2x1bW4gPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uQ2xpY2tPdXQgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uQ29weUNsaXAgPSBudWxsOyAvLyBmdW5jdGlvblxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbHVtbk9wdGlvbnMge1xyXG5cdC8vIHByaXZhdGVcclxuXHRjaGVja2JveCA9IGZhbHNlOyAvLyBib29sZWFuXHJcblxyXG5cdC8vIHB1YmxpY1xyXG5cdG5hbWUgPSBudWxsOyAvLyBzdHJpbmdcclxuXHRkaXNwbGF5TmFtZSA9IG51bGw7IC8vIHN0cmluZ1xyXG5cdHdpZHRoID0gbnVsbDsgLy8gbnVtYmVyIHwgc3RyaW5nXHJcblx0bWluV2lkdGggPSBudWxsOyAvLyBudW1iZXIgfCBzdHJpbmdcclxuXHRyZXNpemUgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGhpZGRlbiA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGlzYWJsZWQgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdHN0eWxlID0gbnVsbDsgLy8gb2JqZWN0OiBleC46IHsgY29sb3I6IHJlZCwgJ21pbi13aWR0aCc6IDE1MCB9XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbE9wdGlvbnMge1xyXG5cdC8vIHByaXZhdGVcclxuXHRyb3cgPSBudWxsOyAvLyBSb3dcclxuXHRjaGVja2JveCA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGF0YSA9IG51bGw7IC8vIG9iamVjdFxyXG5cdHZhbHVlID0gbnVsbDsgLy8gYW55XHJcblxyXG5cdC8vIHB1YmxpY1xyXG5cdG5hbWUgPSBudWxsOyAvLyBzdHJpbmdcclxuXHRoaWRkZW4gPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGRpc2FibGVkID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRkaXNwbGF5ID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRzdHlsZSA9IG51bGw7IC8vIG9iamVjdDogZXguOiB7IGNvbG9yOiByZWQsICdtaW4td2lkdGgnOiAxNTAgfVxyXG59O1xyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHRhYmxlLCBvcHRpb25zKSB7XHJcblx0Ly8gb3B0aW9uczogQ29sdW1uT3B0aW9uc1xyXG5cclxuXHRjb25zdCAkY2VsbCA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IF9jZWxsID0ge1xyXG5cdFx0ZWxlbWVudDogJGNlbGwsXHJcblx0XHRpc0hpZGRlbjogb3B0aW9ucy5oaWRkZW4sXHJcblx0XHRpc0Rpc2FibGVkOiBvcHRpb25zLmRpc2FibGVkLFxyXG5cdFx0b3B0aW9ucyxcclxuXHRcdHNob3csXHJcblx0XHRjaGVja2VkLFxyXG5cdFx0ZGlzYWJsZSxcclxuXHR9O1xyXG5cclxuXHRzaG93KCFvcHRpb25zLmhpZGRlbik7XHJcblx0ZGlzYWJsZShvcHRpb25zLmRpc2FibGVkKTtcclxuXHJcblx0cmV0dXJuIF9jZWxsO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ2R0LWhlYWRlci1jZWxsJyk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiZHQtcm93LWNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgLz5cclxuXHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdGNvbnN0ICRjaGVja2JveCA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsJyk7XHJcblxyXG5cdFx0XHQkY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LnRhcmdldC5jaGVja2VkID9cclxuXHRcdFx0XHRcdHRhYmxlLnNlbGVjdFJvd3MoKSA6XHJcblx0XHRcdFx0XHR0YWJsZS51bnNlbGVjdFJvd3MoZXZlbnQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCRjZWxsLmRhdGFzZXQubmFtZSA9IG9wdGlvbnMubmFtZTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwibmFtZVwiPiR7b3B0aW9ucy5kaXNwbGF5TmFtZX08L2xhYmVsPlxyXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwiY29udHJvbHNcIj5cclxuXHRcdFx0XHRcdDxpIGNsYXNzPVwic29ydCBhc2NcIiB0aXRsZT1cIlNvcnRcIj48L2k+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmVzaXplclwiPjwvZGl2PlxyXG5cdFx0XHRcdDwvc3Bhbj5cclxuXHRcdFx0YCk7XHJcblxyXG5cdFx0XHRjb25zdCAkaWNvblNvcnQgPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuc29ydCcpO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMuc29ydCAmJiBvcHRpb25zLnNvcnQgIT0gZmFsc2UpIHtcclxuXHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdzb3J0YWJsZScpO1xyXG5cclxuXHRcdFx0XHQkY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRcdGlmICh0YWJsZS5oZWFkZXIuaXNEaXNhYmxlZCB8fCBfY2VsbC5pc0Rpc2FibGVkKVxyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRcdFx0dGFibGUuaGVhZGVyLmNlbGxzLmZvckVhY2goY2VsbCA9PlxyXG5cdFx0XHRcdFx0XHRjZWxsLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc29ydGVkJylcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGFzY2VuZGVudCA9ICEoJGljb25Tb3J0LmdldEF0dHJpYnV0ZSgnYXNjZW5kZW50JykgPT0gJ3RydWUnKTtcclxuXHJcblx0XHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdzb3J0ZWQnKTtcclxuXHRcdFx0XHRcdCRpY29uU29ydC5jbGFzc0xpc3QudG9nZ2xlKCdhc2MnLCBhc2NlbmRlbnQpO1xyXG5cdFx0XHRcdFx0JGljb25Tb3J0LmNsYXNzTGlzdC50b2dnbGUoJ2Rlc2MnLCAhYXNjZW5kZW50KTtcclxuXHRcdFx0XHRcdCRpY29uU29ydC5zZXRBdHRyaWJ1dGUoJ2FzY2VuZGVudCcsIGFzY2VuZGVudCk7XHJcblxyXG5cdFx0XHRcdFx0dGFibGUuc29ydChvcHRpb25zLm5hbWUsIGFzY2VuZGVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLnJlc2l6ZSB8fCBvcHRpb25zLnJlc2l6ZSlcclxuXHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdyZXNpemFibGUnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLnN0eWxlKVxyXG5cdFx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkY2VsbCwgb3B0aW9ucy5zdHlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuYm9yZGVycy5jZWxscylcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2VsbC1ib3JkZXItcmlnaHQnKTtcclxuXHJcblx0XHRyZXR1cm4gJGNlbGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja2VkKGNoZWNrZWQgPSB0cnVlKSB7XHJcblx0XHRjb25zdCAkY2hlY2tib3ggPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuZHQtcm93LWNoZWNrYm94IGlucHV0Jyk7XHJcblxyXG5cdFx0aWYgKCRjaGVja2JveClcclxuXHRcdFx0JGNoZWNrYm94LmNoZWNrZWQgPSBjaGVja2VkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNIaWRkZW4gPSAhc2hvdztcclxuXHRcdG9wdGlvbnMuaGlkZGVuID0gX2NlbGwuaXNIaWRkZW47XHJcblxyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cclxuXHRcdHRhYmxlLl9zZXRCb3JkZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cdFx0JGNlbGwuZGF0YXNldC5kaXNhYmxlZCA9IGRpc2FibGVkOyAvLyBjb21wbGVtZW50YSBzdHlsZS5zY3NzXHJcblxyXG5cdFx0QXJyYXkuZnJvbSgkY2VsbC5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT5cclxuXHRcdFx0JGNoaWxkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpXHJcblx0XHQpO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IENvbHVtbk9wdGlvbnMgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBDb2x1bW4gfSBmcm9tICcuL0NvbHVtbi5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVyKHRhYmxlKSB7XHJcblx0Y29uc3QgX2hlYWRlciA9IHtcclxuXHRcdGVsZW1lbnQ6IG51bGwsXHJcblx0XHRjZWxsczogW10sXHJcblx0XHRpc0hpZGRlbjogZmFsc2UsXHJcblx0XHRpc0Rpc2FibGVkOiBmYWxzZSxcclxuXHRcdGNlbGwsXHJcblx0XHRzaG93LFxyXG5cdFx0ZGlzYWJsZSxcclxuXHR9O1xyXG5cdGNvbnN0ICRoZWFkZXIgPSBjcmVhdGUoKTtcclxuXHJcblx0cmV0dXJuIF9oZWFkZXI7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2R0LWhlYWRlcicpO1xyXG5cclxuXHRcdGlmICh0YWJsZS5vcHRpb25zLmNoZWNrYm94KSB7XHJcblx0XHRcdGNvbnN0IG9wdGlvbnMgPSBuZXcgQ29sdW1uT3B0aW9ucygpO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5jaGVja2JveCA9IHRydWU7XHJcblx0XHRcdG9wdGlvbnMucmVzaXplID0gZmFsc2U7XHJcblxyXG5cdFx0XHRjb25zdCBjZWxsID0gQ29sdW1uKHRhYmxlLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdF9oZWFkZXIuY2VsbHMucHVzaChjZWxsKTtcclxuXHRcdFx0JGhlYWRlci5hcHBlbmRDaGlsZChjZWxsLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoY29uc3QgbmFtZSBpbiB0YWJsZS5vcHRpb25zLmNvbHVtbnMpIHtcclxuXHRcdFx0Y29uc3QgY29sdW1uID0gdGFibGUub3B0aW9ucy5jb2x1bW5zW25hbWVdO1xyXG5cdFx0XHRjb25zdCBvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgQ29sdW1uT3B0aW9ucygpLCBjb2x1bW4pO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRcdGNvbnN0IGNlbGwgPSBDb2x1bW4odGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X2hlYWRlci5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkaGVhZGVyLmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0X2hlYWRlci5lbGVtZW50ID0gJGhlYWRlcjtcclxuXHJcblx0XHRyZXR1cm4gJGhlYWRlcjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNlbGwobmFtZU9ySW5kZXgpIHtcclxuXHRcdGNvbnN0IGNlbGwgPSB0eXBlb2YgbmFtZU9ySW5kZXggPT0gJ251bWJlcicgP1xyXG5cdFx0XHRfaGVhZGVyLmNlbGxzW25hbWVPckluZGV4XSA6XHJcblx0XHRcdF9oZWFkZXIuY2VsbHMuZmluZChjZWxsID0+IGNlbGwub3B0aW9ucy5uYW1lID09IG5hbWVPckluZGV4KTtcclxuXHJcblx0XHRyZXR1cm4gY2VsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coc2hvdyA9IHRydWUpIHtcclxuXHRcdF9oZWFkZXIuaXNIaWRkZW4gPSAhc2hvdztcclxuXHRcdCRoZWFkZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlZCA9IHRydWUpIHtcclxuXHRcdF9oZWFkZXIuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cclxuXHRcdEFycmF5LmZyb20oJGhlYWRlci5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT4ge1xyXG5cdFx0XHQkY2hpbGQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENlbGwodGFibGUsIG9wdGlvbnMpIHtcclxuXHQvLyBvcHRpb25zOiBDZWxsT3B0aW9uc1xyXG5cclxuXHRjb25zdCAkY2VsbCA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IF9jZWxsID0ge1xyXG5cdFx0ZWxlbWVudDogJGNlbGwsXHJcblx0XHRpc0hpZGRlbjogb3B0aW9ucy5oaWRkZW4sXHJcblx0XHRpc0Rpc2FibGVkOiBvcHRpb25zLmRpc2FibGVkLFxyXG5cdFx0b3B0aW9ucyxcclxuXHRcdHZhbHVlLFxyXG5cdFx0ZGlzcGxheSxcclxuXHRcdGNoZWNrZWQsXHJcblx0XHRzaG93LFxyXG5cdFx0c2hvd0NvbnRlbnQsXHJcblx0XHRkaXNhYmxlLFxyXG5cdH07XHJcblxyXG5cdHNob3coIW9wdGlvbnMuaGlkZGVuKTtcclxuXHRzaG93Q29udGVudCghb3B0aW9ucy5oaWRkZW4pO1xyXG5cdGRpc3BsYXkodmFsdWUoKSk7XHJcblxyXG5cdHJldHVybiBfY2VsbDtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdkdC1ib2R5LXJvdy1jZWxsJyk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiZHQtcm93LWNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIvPlxyXG5cdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdGApO1xyXG5cclxuXHRcdFx0Y29uc3QgJGNoZWNrYm94ID0gJGNlbGwucXVlcnlTZWxlY3RvcignbGFiZWwnKTtcclxuXHJcblx0XHRcdCRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHRcdFx0JGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGV2ZW50ID0+IHtcclxuXHRcdFx0XHR0YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblx0XHRcdFx0b3B0aW9ucy5yb3cuc2VsZWN0KGV2ZW50LnRhcmdldC5jaGVja2VkLCBldmVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb25zLnZhbHVlICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMudmFsdWUgOiAnJztcclxuXHRcdFx0Y29uc3QgY2VsbCA9IHRhYmxlLm9wdGlvbnMuY2VsbHMgPyB0YWJsZS5vcHRpb25zLmNlbGxzW29wdGlvbnMubmFtZV0gfHwge30gOiB7fTtcclxuXHJcblx0XHRcdCRjZWxsLmRhdGFzZXQubmFtZSA9IG9wdGlvbnMubmFtZTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInZhbHVlLWhpZGRlblwiPiR7dmFsdWV9PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInZhbHVlLWRpc3BsYXlcIj4ke3ZhbHVlfTwvZGl2PlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdGlmIChjZWxsLnN0eWxlKVxyXG5cdFx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkY2VsbCwgY2VsbC5zdHlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuYm9yZGVycy5jZWxscylcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2VsbC1ib3JkZXItcmlnaHQnKTtcclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5ib3JkZXJzLnJvd3MpXHJcblx0XHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ2NlbGwtYm9yZGVyLWJvdHRvbScpO1xyXG5cclxuXHRcdHJldHVybiAkY2VsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZhbHVlKHZhbHVlKSB7XHJcblx0XHRjb25zdCAkdmFsdWUgPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcudmFsdWUtaGlkZGVuJyk7XHJcblxyXG5cdFx0aWYgKCEkdmFsdWUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdG9wdGlvbnMuZGF0YVtvcHRpb25zLm5hbWVdID0gdmFsdWU7XHJcblx0XHRcdCR2YWx1ZS52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFsdWUgPSBvcHRpb25zLnZhbHVlICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMudmFsdWUgOiAkdmFsdWUudmFsdWU7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNwbGF5KHZhbHVlKSB7XHJcblx0XHRjb25zdCAkZGlzcGxheSA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy52YWx1ZS1kaXNwbGF5Jyk7XHJcblx0XHRjb25zdCBjZWxsID0gdGFibGUub3B0aW9ucy5jZWxscyA/IHRhYmxlLm9wdGlvbnMuY2VsbHNbb3B0aW9ucy5uYW1lXSB8fCB7fSA6IHt9O1xyXG5cclxuXHRcdGlmIChjZWxsLmRpc3BsYXkpIHtcclxuXHRcdFx0dmFsdWUgPSBjZWxsLmRpc3BsYXkoeyBpdGVtOiBvcHRpb25zLmRhdGEsIHZhbHVlIH0pO1xyXG5cdFx0XHQkZGlzcGxheS5pbm5lckhUTUwgPSAnJztcclxuXHJcblx0XHRcdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcblx0XHRcdFx0JGRpc3BsYXkuYXBwZW5kQ2hpbGQodmFsdWUpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXlPZkhUTUxFbGVtZW50KHZhbHVlKSkge1xyXG5cdFx0XHRcdHZhbHVlLmZvckVhY2goeCA9PiAkZGlzcGxheS5hcHBlbmRDaGlsZCh4KSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JGRpc3BsYXkuaW5uZXJIVE1MID0gdmFsdWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coc2hvdyA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzSGlkZGVuID0gIXNob3c7XHJcblxyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0NvbnRlbnQoc2hvdyA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzSGlkZGVuID0gIXNob3c7XHJcblxyXG5cdFx0QXJyYXkuZnJvbSgkY2VsbC5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT4ge1xyXG5cdFx0XHQkY2hpbGQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja2VkKGNoZWNrZWQgPSB0cnVlKSB7XHJcblx0XHRjb25zdCAkY2hlY2tib3ggPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuZHQtcm93LWNoZWNrYm94IGlucHV0Jyk7XHJcblxyXG5cdFx0aWYgKCRjaGVja2JveClcclxuXHRcdFx0JGNoZWNrYm94LmNoZWNrZWQgPSBjaGVja2VkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlZCA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHJcblx0XHRBcnJheS5mcm9tKCRjZWxsLmNoaWxkcmVuKS5mb3JFYWNoKCRjaGlsZCA9PiB7XHJcblx0XHRcdCRjaGlsZC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGRpc2FibGVkKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IENlbGxPcHRpb25zIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHsgQ2VsbCB9IGZyb20gJy4vQ2VsbC5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUm93KHRhYmxlLCBvcHRpb25zKSB7XHJcblx0Y29uc3QgX3JvdyA9IHtcclxuXHRcdGVsZW1lbnQ6IG51bGwsXHJcblx0XHRpZDogdXRpbHMuZ2VuZXJhdGVHdWlkKCksXHJcblx0XHRjZWxsczogW10sXHJcblx0XHRpc1NlbGVjdGVkOiBmYWxzZSxcclxuXHRcdGlzSGlkZGVuOiBmYWxzZSxcclxuXHRcdGlzRGlzYWJsZWQ6IGZhbHNlLFxyXG5cdFx0X2RhdGE6IG9wdGlvbnMuZGF0YSB8fCB7fSwgLy8gaW50ZXJub1xyXG5cdFx0ZGF0YSxcclxuXHRcdGNlbGwsXHJcblx0XHRpbmRleCxcclxuXHRcdHNob3csXHJcblx0XHRkaXNhYmxlLFxyXG5cdFx0c2VsZWN0LFxyXG5cdFx0dGV4dCxcclxuXHRcdHJlbW92ZSxcclxuXHR9O1xyXG5cdGNvbnN0ICRyb3cgPSBjcmVhdGUoKTtcclxuXHJcblx0X2xvYWRDZWxscygpO1xyXG5cclxuXHRyZXR1cm4gX3JvdztcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRyb3cuaWQgPSBfcm93LmlkO1xyXG5cdFx0JHJvdy5jbGFzc0xpc3QuYWRkKCdkdC1ib2R5LXJvdycpO1xyXG5cdFx0JHJvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0aWYgKCF0YWJsZS5vcHRpb25zLmNoZWNrYm94ICYmIHRhYmxlLm9wdGlvbnMucm93cy5zZWxlY3RPbkNsaWNrKVxyXG5cdFx0XHRcdHNlbGVjdCh0cnVlLCBldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdCRyb3cuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBldmVudCA9PiB7XHJcblx0XHRcdGlmICghdGFibGUub3B0aW9ucy5yb3dzLnNlbGVjdE9uQ2xpY2spXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0Ly8gaW1wZWRlIHF1ZSBvIHRleHRvIHNlamEgc2VsZWNpb25hZG9cclxuXHRcdFx0aWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pXHJcblx0XHRcdFx0d2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMub25Eb3VibGVDbGlja1JvdylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uRG91YmxlQ2xpY2tSb3coeyByb3c6IF9yb3csIGV2ZW50IH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RhYmxlJywgdGFibGUub3B0aW9ucy5yb3dzLnNlbGVjdE9uQ2xpY2spO1xyXG5cclxuXHRcdF9yb3cuZWxlbWVudCA9ICRyb3c7XHJcblxyXG5cdFx0cmV0dXJuICRyb3c7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfbG9hZENlbGxzKCkge1xyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0Y29uc3Qgb3B0aW9ucyA9IG5ldyBDZWxsT3B0aW9ucygpO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5yb3cgPSBfcm93O1xyXG5cdFx0XHRvcHRpb25zLmNoZWNrYm94ID0gdHJ1ZTtcclxuXHRcdFx0b3B0aW9ucy5yZXNpemUgPSBmYWxzZTtcclxuXHJcblx0XHRcdGNvbnN0IGNlbGwgPSBDZWxsKHRhYmxlLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdF9yb3cuY2VsbHMucHVzaChjZWxsKTtcclxuXHRcdFx0JHJvdy5hcHBlbmRDaGlsZChjZWxsLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoY29uc3QgbmFtZSBpbiB0YWJsZS5vcHRpb25zLmNvbHVtbnMpIHtcclxuXHRcdFx0Y29uc3QgY29sdW1uID0gdGFibGUub3B0aW9ucy5jb2x1bW5zW25hbWVdO1xyXG5cdFx0XHRjb25zdCBvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgQ2VsbE9wdGlvbnMoKSwgY29sdW1uKTtcclxuXHJcblx0XHRcdG9wdGlvbnMubmFtZSA9IG5hbWU7XHJcblx0XHRcdG9wdGlvbnMuZGF0YSA9IF9yb3cuX2RhdGE7XHJcblx0XHRcdG9wdGlvbnMudmFsdWUgPSBfcm93Ll9kYXRhW25hbWVdO1xyXG5cclxuXHRcdFx0Y29uc3QgY2VsbCA9IENlbGwodGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X3Jvdy5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkcm93LmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjZWxsKG5hbWVPckluZGV4KSB7XHJcblx0XHQvLyBSZXRvcm5hIGEgY1x1MDBFOWx1bGEgcGVsbyBub21lIG91IHBlbG8gXHUwMEVEbmRpY2UuXHJcblxyXG5cdFx0Y29uc3QgY2VsbCA9IHR5cGVvZiBuYW1lT3JJbmRleCA9PSAnbnVtYmVyJyA/XHJcblx0XHRcdF9yb3cuY2VsbHNbbmFtZU9ySW5kZXhdIDpcclxuXHRcdFx0X3Jvdy5jZWxscy5maW5kKGNlbGwgPT4gY2VsbC5vcHRpb25zLm5hbWUgPT0gbmFtZU9ySW5kZXgpO1xyXG5cclxuXHRcdHJldHVybiBjZWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW5kZXgoKSB7XHJcblx0XHRyZXR1cm4gdXRpbHMuZ2V0RWxlbWVudEluZGV4KCRyb3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X3Jvdy5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X3Jvdy5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblx0XHQkcm93LmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0KHNlbGVjdGVkID0gdHJ1ZSwgZXZlbnQpIHtcclxuXHRcdC8vIGltcGVkZSBxdWUgbyB0ZXh0byBzZWphIHNlbGVjaW9uYWRvIGNvbSBzaGlmdFxyXG5cdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHdpbmRvdy5nZXRTZWxlY3Rpb24pXHJcblx0XHRcdHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHRfcm93LmlzU2VsZWN0ZWQgPSBzZWxlY3RlZDtcclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cyh7IHJvd3M6IHRhYmxlLnNlbGVjdGVkUm93cygpIH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdCF0YWJsZS5vcHRpb25zLnJvd3MuYWxsb3dNdWx0aXBsZVNlbGVjdGlvbiB8fFxyXG5cdFx0XHRcdCFldmVudCB8fFxyXG5cdFx0XHRcdCghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuc2hpZnRLZXkpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdHRhYmxlLnVuc2VsZWN0Um93cyhldmVudCwgZmFsc2UpO1xyXG5cdFx0XHRcdHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQgPSBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoZXZlbnQgJiYgZXZlbnQuY3RybEtleSkge1xyXG5cdFx0XHRcdC8vIGludmVydGUgYSBzZWxlXHUwMEU3XHUwMEUzbyBjb20gQ1RSTCBwcmVzc2lvbmFkb1xyXG5cdFx0XHRcdHNlbGVjdGVkID0gIV9yb3cuaXNTZWxlY3RlZDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRsZXQgaW5kZXhlcyA9IHV0aWxzLmNyZWF0ZVJhbmdlQXJyYXkodXRpbHMuZ2V0RWxlbWVudEluZGV4KHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQpLCB1dGlscy5nZXRFbGVtZW50SW5kZXgoJHJvdykpO1xyXG5cclxuXHRcdFx0XHR0YWJsZS5zZWxlY3RSb3dzKGluZGV4ZXMpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfcm93LmlzU2VsZWN0ZWQgPSBzZWxlY3RlZDtcclxuXHJcblx0XHRcdGlmICghZXZlbnQgfHwgIWV2ZW50LnNoaWZ0S2V5KVxyXG5cdFx0XHRcdHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQgPSAkcm93O1xyXG5cclxuXHRcdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsIHNlbGVjdGVkKTtcclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cyh7IHJvd3M6IHRhYmxlLnNlbGVjdGVkUm93cygpIH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGF0YShmaWVsZHMsIG1ldGEgPSBmYWxzZSkge1xyXG5cdFx0aWYgKGZpZWxkcykge1xyXG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgaW4gZmllbGRzKSB7XHJcblx0XHRcdFx0bGV0IHZhbHVlID0gZmllbGRzW25hbWVdO1xyXG5cdFx0XHRcdGxldCBjZWxsID0gX3Jvdy5jZWxsKG5hbWUpO1xyXG5cclxuXHRcdFx0XHRjZWxsLnZhbHVlKHZhbHVlKTtcclxuXHRcdFx0XHRjZWxsLmRpc3BsYXkodmFsdWUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodGFibGUub3B0aW9ucy5vblVwZGF0ZVJvdylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uVXBkYXRlUm93KHsgcm93OiBfcm93LCBmaWVsZHMgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyByZW1vdmUgYSBwcm9wcmllZGFkZSBtZXRhXHJcblx0XHRcdGlmICghbWV0YSlcclxuXHRcdFx0XHRyZXR1cm4gKCh7IG1ldGEsIC4uLmRhdGEgfSkgPT4gZGF0YSkoX3Jvdy5fZGF0YSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX3Jvdy5fZGF0YTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRleHQoZmllbGROYW1lcykge1xyXG5cdFx0bGV0IGNlbGxzID0gZmllbGROYW1lcyA/IF9yb3cuY2VsbHMuZmlsdGVyKHggPT4gISFmaWVsZE5hbWVzLmZpbmQobmFtZSA9PiBuYW1lID09IHgub3B0aW9ucy5uYW1lKSkgOiBfcm93LmNlbGxzO1xyXG5cdFx0bGV0IHRleHQgPSBbXTtcclxuXHJcblx0XHRjZWxscy5mb3JFYWNoKGNlbGwgPT5cclxuXHRcdFx0dGV4dC5wdXNoKGNlbGwuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudmFsdWUtZGlzcGxheScpLmlubmVyVGV4dC50cmltKCkpXHJcblx0XHQpO1xyXG5cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cdFx0dGFibGUucmVtb3ZlUm93cyhfcm93KTtcclxuXHR9XHJcbn1cclxuIiwgImV4cG9ydCBmdW5jdGlvbiBGb290ZXIodGFibGUpIHtcclxuXHRjb25zdCAkZm9vdGVyID0gY3JlYXRlKCk7XHJcblx0Y29uc3QgX2Zvb3RlciA9IHtcclxuXHRcdGVsZW1lbnQ6ICRmb290ZXIsXHJcblx0XHRpc0hpZGRlbjogdGFibGUub3B0aW9ucy5mb290ZXIuaGlkZGVuLFxyXG5cdFx0aXNEaXNhYmxlZDogdGFibGUub3B0aW9ucy5mb290ZXIuZGlzYWJsZWQsXHJcblx0XHRzaG93LFxyXG5cdFx0ZGlzYWJsZSxcclxuXHRcdGNvbnRlbnQsXHJcblx0fTtcclxuXHJcblx0Y29udGVudCh0YWJsZS5vcHRpb25zLmZvb3Rlci5jb250ZW50KTtcclxuXHRzaG93KCFfZm9vdGVyLmlzSGlkZGVuKTtcclxuXHJcblx0cmV0dXJuIF9mb290ZXI7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkZm9vdGVyLmNsYXNzTGlzdC5hZGQoJ2R0LWZvb3RlcicpO1xyXG5cclxuXHRcdHJldHVybiAkZm9vdGVyO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29udGVudChjb250ZW50KSB7XHJcblx0XHRpZiAoY29udGVudClcclxuXHRcdFx0JGZvb3Rlci5pbm5lckhUTUwgPSBjb250ZW50O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2Zvb3Rlci5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0JGZvb3Rlci5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2Zvb3Rlci5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblx0XHQkZm9vdGVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEhlYWRlciB9IGZyb20gJy4vSGVhZGVyLmpzJztcclxuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9Sb3cuanMnO1xyXG5pbXBvcnQgeyBGb290ZXIgfSBmcm9tICcuL0Zvb3Rlci5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gVGFibGUob3B0aW9ucykge1xyXG5cdGNvbnN0IF90YWJsZSA9IHtcclxuXHRcdG9wdGlvbnMsXHJcblx0XHRpZDogb3B0aW9ucy5pZCA/ICdkdC0nICsgb3B0aW9ucy5pZCA6IHV0aWxzLmdlbmVyYXRlR3VpZCgpLFxyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdHNjcm9sbGFibGU6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0aGVhZGVyOiBudWxsLFxyXG5cdFx0Ym9keToge1xyXG5cdFx0XHRlbGVtZW50OiBudWxsLFxyXG5cdFx0fSxcclxuXHRcdF9jb2x1bW5XaWR0aHM6IG51bGwsXHJcblx0XHRyb3dzOiBbXSxcclxuXHRcdF9sYXN0Um93U2VsZWN0ZWQ6IG51bGwsXHJcblx0XHRmb290ZXI6IG51bGwsXHJcblx0XHRpc0Rpc2FibGVkOiBmYWxzZSxcclxuXHRcdF9kYXRhOiBvcHRpb25zLmRhdGEgfHwgW10sXHJcblx0XHRkYXRhLFxyXG5cdFx0bG9hZCxcclxuXHRcdHJlbG9hZCxcclxuXHRcdHdpZHRoLFxyXG5cdFx0aGVpZ2h0LFxyXG5cdFx0Y29sdW1uLFxyXG5cdFx0YWRkUm93LFxyXG5cdFx0c2VsZWN0ZWRSb3dzLFxyXG5cdFx0c2VsZWN0Um93cyxcclxuXHRcdHVuc2VsZWN0Um93cyxcclxuXHRcdHJvd3NCeUZpZWxkVmFsdWUsXHJcblx0XHRtb3ZlU2VsZWN0ZWRSb3dzLFxyXG5cdFx0cmVtb3ZlUm93cyxcclxuXHRcdHJlbW92ZVNlbGVjdGVkUm93cyxcclxuXHRcdHNvcnQsXHJcblx0XHRkaXNhYmxlLFxyXG5cdFx0Y2xlYXIsXHJcblx0XHRleHBvcnQ6IF9leHBvcnQsXHJcblx0XHRfc2V0Qm9yZGVycyxcclxuXHR9O1xyXG5cdGNvbnN0ICR0YWJsZSA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IGtleV9zdG9yZWRXaWR0aHMgPSBgJHtfdGFibGUuaWR9LXdpZHRoc2A7XHJcblxyXG5cdGNyZWF0ZUhlYWRlcigpO1xyXG5cdGNyZWF0ZUJvZHkoKTtcclxuXHRjcmVhdGVGb290ZXIoKTtcclxuXHR3aWR0aChvcHRpb25zLndpZHRoKTtcclxuXHRoZWlnaHQob3B0aW9ucy5oZWlnaHQpO1xyXG5cdGRpc2FibGUob3B0aW9ucy5kaXNhYmxlZCk7XHJcblx0bG9hZChvcHRpb25zLmRhdGEpO1xyXG5cclxuXHRyZXR1cm4gX3RhYmxlO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkdGFibGUuaWQgPSBfdGFibGUuaWQ7XHJcblx0XHQkdGFibGUuY2xhc3NMaXN0LmFkZCgnZHQnKTtcclxuXHJcblx0XHRjb25zdCAkc2Nyb2xsYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRzY3JvbGxhYmxlLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGFibGUnKTtcclxuXHRcdCR0YWJsZS5hcHBlbmRDaGlsZCgkc2Nyb2xsYWJsZSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS5hbGwpIHtcclxuXHRcdFx0JHRhYmxlLmNsYXNzTGlzdC5hZGQoJ3RhYmxlLWJvcmRlci1hbGwnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmJvcmRlcnMudGFibGUucmFkaXVzICE9IG51bGwpIHtcclxuXHRcdFx0XHRsZXQgcmFkaXVzID0gb3B0aW9ucy5ib3JkZXJzLnRhYmxlLnJhZGl1cztcclxuXHJcblx0XHRcdFx0JHRhYmxlLnN0eWxlLmJvcmRlclJhZGl1cyA9IHV0aWxzLnBhcnNlRGltZW5zaW9uKHJhZGl1cyk7XHJcblx0XHRcdFx0JHNjcm9sbGFibGUuc3R5bGUuYm9yZGVyUmFkaXVzID0gdXRpbHMucGFyc2VEaW1lbnNpb24ocmFkaXVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS50b3ApXHJcblx0XHRcdFx0JHRhYmxlLmNsYXNzTGlzdC5hZGQoJ3RhYmxlLWJvcmRlci10b3AnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmJvcmRlcnMudGFibGUuYm90dG9tKVxyXG5cdFx0XHRcdCR0YWJsZS5jbGFzc0xpc3QuYWRkKCd0YWJsZS1ib3JkZXItYm90dG9tJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3R5bGUpXHJcblx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkdGFibGUsIG9wdGlvbnMuc3R5bGUpO1xyXG5cclxuXHRcdF90YWJsZS5lbGVtZW50ID0gJHRhYmxlO1xyXG5cdFx0X3RhYmxlLmVsZW1lbnRzLnNjcm9sbGFibGUgPSAkc2Nyb2xsYWJsZTtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlSGVhZGVyKCkge1xyXG5cdFx0Y29uc3QgaGVhZGVyID0gSGVhZGVyKF90YWJsZSk7XHJcblxyXG5cdFx0X3RhYmxlLmhlYWRlciA9IGhlYWRlcjtcclxuXHJcblx0XHQkdGFibGUucXVlcnlTZWxlY3RvcignLnNjcm9sbGFibGUnKS5hcHBlbmRDaGlsZChoZWFkZXIuZWxlbWVudCk7XHJcblx0XHRoZWFkZXIuc2hvdyghb3B0aW9ucy5oZWFkZXIuaGlkZGVuKTtcclxuXHRcdGhlYWRlci5kaXNhYmxlKG9wdGlvbnMuaGVhZGVyLmRpc2FibGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUJvZHkoKSB7XHJcblx0XHRjb25zdCAkYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRib2R5LmNsYXNzTGlzdC5hZGQoJ2R0LWJvZHknKTtcclxuXHRcdF90YWJsZS5ib2R5LmVsZW1lbnQgPSAkYm9keTtcclxuXHJcblx0XHQkdGFibGUucXVlcnlTZWxlY3RvcignLnNjcm9sbGFibGUnKS5hcHBlbmRDaGlsZCgkYm9keSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVGb290ZXIoKSB7XHJcblx0XHRpZiAob3B0aW9ucy5mb290ZXIpIHtcclxuXHRcdFx0Y29uc3QgZm9vdGVyID0gRm9vdGVyKF90YWJsZSk7XHJcblxyXG5cdFx0XHRfdGFibGUuZm9vdGVyID0gZm9vdGVyO1xyXG5cdFx0XHQkdGFibGUuYXBwZW5kQ2hpbGQoZm9vdGVyLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29sdW1uKG5hbWVPckluZGV4KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzaG93LFxyXG5cdFx0XHRkaXNhYmxlLFxyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHRcdF90YWJsZS5oZWFkZXIuY2VsbChuYW1lT3JJbmRleCkuc2hvdyhzaG93KTtcclxuXHRcdFx0X3RhYmxlLnJvd3MuZm9yRWFjaChyb3cgPT4gcm93LmNlbGwobmFtZU9ySW5kZXgpLnNob3coc2hvdykpO1xyXG5cclxuXHRcdFx0X3NldENvbHVtbldpZHRocygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRcdF90YWJsZS5oZWFkZXIuY2VsbChuYW1lT3JJbmRleCkuZGlzYWJsZShkaXNhYmxlZCk7XHJcblx0XHRcdF90YWJsZS5yb3dzLmZvckVhY2gocm93ID0+IHJvdy5jZWxsKG5hbWVPckluZGV4KS5kaXNhYmxlKGRpc2FibGVkKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB3aWR0aCh3aWR0aCkge1xyXG5cdFx0aWYgKHdpZHRoID09IHVuZGVmaW5lZClcclxuXHRcdFx0cmV0dXJuICR0YWJsZS5jbGllbnRXaWR0aDtcclxuXHJcblx0XHQkdGFibGUuc3R5bGUud2lkdGggPSB1dGlscy5wYXJzZURpbWVuc2lvbih3aWR0aCkgfHwgJ2F1dG8nO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGVpZ2h0KGhlaWdodCkge1xyXG5cdFx0aWYgKGhlaWdodCA9PSB1bmRlZmluZWQpXHJcblx0XHRcdHJldHVybiAkdGFibGUuY2xpZW50SGVpZ2h0O1xyXG5cclxuXHRcdCR0YWJsZS5zdHlsZS5oZWlnaHQgPSB1dGlscy5wYXJzZURpbWVuc2lvbihoZWlnaHQpIHx8ICdhdXRvJztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRhdGEoZGF0YSwgbWV0YSA9IGZhbHNlKSB7XHJcblx0XHRfdGFibGUuX2RhdGEgPSBkYXRhIHx8IF90YWJsZS5fZGF0YTtcclxuXHJcblx0XHQvLyByZW1vdmUgYSBwcm9wcmllZGFkZSBtZXRhXHJcblx0XHRpZiAoIW1ldGEpXHJcblx0XHRcdHJldHVybiBfdGFibGUuX2RhdGEubWFwKCh7IG1ldGEsIC4uLml0ZW0gfSkgPT4gaXRlbSk7XHJcblxyXG5cdFx0cmV0dXJuIF90YWJsZS5fZGF0YTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGxvYWQoX2RhdGEpIHtcclxuXHRcdGNsZWFyKCEhX2RhdGEpO1xyXG5cclxuXHRcdGRhdGEoX2RhdGEsIHRydWUpLmZvckVhY2goaXRlbSA9PlxyXG5cdFx0XHRhZGRSb3coaXRlbSwgZmFsc2UsIGZhbHNlKVxyXG5cdFx0KTtcclxuXHJcblx0XHRfc2V0Q29sdW1uV2lkdGhzKCk7XHJcblx0XHRfc2V0Q29sdW1uUmVzaXphYmxlKCk7XHJcblx0XHRfc2V0Qm9yZGVycygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVsb2FkKCkge1xyXG5cdFx0bG9hZCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2xlYXIoY2xlYXJEYXRhID0gdHJ1ZSkge1xyXG5cdFx0aWYgKGNsZWFyRGF0YSlcclxuXHRcdFx0ZGF0YShbXSk7XHJcblxyXG5cdFx0X3RhYmxlLnJvd3MgPSBbXTtcclxuXHRcdF90YWJsZS5ib2R5LmVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYWRkUm93KGRhdGEsIGluc2VydCA9IHRydWUsIHNldEJvcmRlcnMgPSB0cnVlKSB7XHJcblx0XHRjb25zdCByb3cgPSBSb3coX3RhYmxlLCB7IGRhdGEgfSk7XHJcblxyXG5cdFx0X3RhYmxlLnJvd3MucHVzaChyb3cpO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudC5hcHBlbmRDaGlsZChyb3cuZWxlbWVudCk7XHJcblxyXG5cdFx0ZGF0YS5tZXRhID0ge1xyXG5cdFx0XHRyb3c6IHtcclxuXHRcdFx0XHRpZDogcm93LmlkLFxyXG5cdFx0XHR9LFxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAoaW5zZXJ0KVxyXG5cdFx0XHRfdGFibGUuX2RhdGEucHVzaChkYXRhKTtcclxuXHJcblx0XHRpZiAoc2V0Qm9yZGVycylcclxuXHRcdFx0X3NldEJvcmRlcnMoKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkFkZFJvdylcclxuXHRcdFx0b3B0aW9ucy5vbkFkZFJvdyh7IHJvdyB9KTtcclxuXHJcblx0XHRyZXR1cm4gcm93O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0ZWRSb3dzKCkge1xyXG5cdFx0cmV0dXJuIF90YWJsZS5yb3dzLmZpbHRlcih4ID0+IHguaXNTZWxlY3RlZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByb3dzQnlGaWVsZFZhbHVlKGZpZWxkTmFtZSwgdmFsdWUpIHtcclxuXHRcdGlmIChmaWVsZE5hbWUgPT0gdW5kZWZpbmVkIHx8IHZhbHVlID09IHVuZGVmaW5lZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHJldHVybiBfdGFibGUucm93cy5maWx0ZXIocm93ID0+XHJcblx0XHRcdHJvdy5fZGF0YVtmaWVsZE5hbWVdID09IHZhbHVlXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0Um93cyhpbmRleGVzKSB7XHJcblx0XHQvLyBTZWxlY2lvbmEgdG9kYXMgYXMgbGluaGFzIG91IGFwZW5hcyBhcyBlc3BlY2lmaWNhZGFzLlxyXG5cclxuXHRcdGlmIChpbmRleGVzKVxyXG5cdFx0XHRpbmRleGVzID0gaW5kZXhlcyBpbnN0YW5jZW9mIEFycmF5ID8gaW5kZXhlcyA6IFtpbmRleGVzXTtcclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiB7XHJcblx0XHRcdGxldCBzZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ZXMpIHtcclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4ZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh1dGlscy5nZXRFbGVtZW50SW5kZXgocm93LmVsZW1lbnQpID09IGluZGV4ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0c2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyb3cuaXNTZWxlY3RlZCA9IHNlbGVjdGVkO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0XHRyb3cuY2VsbHNbMF0uY2hlY2tlZChzZWxlY3RlZCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cm93LmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBzZWxlY3RlZCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmNoZWNrYm94KVxyXG5cdFx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vblNlbGVjdFJvd3MpXHJcblx0XHRcdG9wdGlvbnMub25TZWxlY3RSb3dzKHsgcm93czogc2VsZWN0ZWRSb3dzKCkgfSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1bnNlbGVjdFJvd3MoZXZlbnQsIGNhbGxiYWNrID0gdHJ1ZSkge1xyXG5cdFx0Ly8gRGVzc2VsZWNpb25hIHRvZGFzIGFzIGxpbmhhcy5cclxuXHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cclxuXHRcdHNlbGVjdGVkUm93cygpLmZvckVhY2gocm93ID0+IHtcclxuXHRcdFx0cm93LmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0cm93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTtcclxuXHRcdFx0cm93LmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub25VbnNlbGVjdFJvd3MgJiYgY2FsbGJhY2spXHJcblx0XHRcdG9wdGlvbnMub25VbnNlbGVjdFJvd3MoeyBldmVudCB9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1vdmVTZWxlY3RlZFJvd3MoZG93biA9IHRydWUpIHtcclxuXHRcdGlmIChvcHRpb25zLnNvcnQpIHJldHVybjtcclxuXHJcblx0XHRpZiAoZG93bikge1xyXG5cdFx0XHRmb3IgKGxldCBpID0gX3RhYmxlLnJvd3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0XHRsZXQgZnJvbUluZGV4ID0gaTtcclxuXHRcdFx0XHRsZXQgdG9JbmRleCA9IGkgKyAxO1xyXG5cclxuXHRcdFx0XHRpZiAoX3RhYmxlLnJvd3NbaV0uaXNTZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0aWYgKHRvSW5kZXggPCBfdGFibGUucm93cy5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdGNoYW5nZVBvc2l0aW9uKGZyb21JbmRleCwgdG9JbmRleCk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfdGFibGUucm93cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxldCBmcm9tSW5kZXggPSBpO1xyXG5cdFx0XHRcdGxldCB0b0luZGV4ID0gaSAtIDE7XHJcblxyXG5cdFx0XHRcdGlmIChfdGFibGUucm93c1tpXS5pc1NlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRpZiAodG9JbmRleCA+PSAwKVxyXG5cdFx0XHRcdFx0XHRjaGFuZ2VQb3NpdGlvbihmcm9tSW5kZXgsIHRvSW5kZXgpO1xyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiBfdGFibGUuYm9keS5lbGVtZW50LmFwcGVuZENoaWxkKHJvdy5lbGVtZW50KSk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gY2hhbmdlUG9zaXRpb24oZnJvbUluZGV4LCB0b0luZGV4KSB7XHJcblx0XHRcdGNvbnN0IHJvdyA9IF90YWJsZS5yb3dzLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdO1xyXG5cdFx0XHRjb25zdCBpdGVtID0gX3RhYmxlLl9kYXRhLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdO1xyXG5cclxuXHRcdFx0X3RhYmxlLnJvd3Muc3BsaWNlKHRvSW5kZXgsIDAsIHJvdyk7XHJcblx0XHRcdF90YWJsZS5fZGF0YS5zcGxpY2UodG9JbmRleCwgMCwgaXRlbSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVSb3dzKHJvd3MpIHtcclxuXHRcdHJvd3MgPSByb3dzIGluc3RhbmNlb2YgQXJyYXkgPyByb3dzIDogW3Jvd3NdO1xyXG5cclxuXHRcdGlmICghcm93cy5sZW5ndGgpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRyb3dzLmZvckVhY2gocm93ID0+IHtcclxuXHRcdFx0Ly8gcm93XHJcblx0XHRcdF90YWJsZS5yb3dzLmZvckVhY2goKF9yb3csIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0aWYgKF9yb3cuaWQgPT0gcm93LmlkKVxyXG5cdFx0XHRcdFx0X3RhYmxlLnJvd3Muc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBkYXRhXHJcblx0XHRcdF90YWJsZS5fZGF0YS5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRcdGlmIChpdGVtLm1ldGEucm93LmlkID09IHJvdy5pZClcclxuXHRcdFx0XHRcdF90YWJsZS5fZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJvdy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub25SZW1vdmVSb3dzKVxyXG5cdFx0XHRvcHRpb25zLm9uUmVtb3ZlUm93cygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlU2VsZWN0ZWRSb3dzKCkge1xyXG5cdFx0cmVtb3ZlUm93cyhzZWxlY3RlZFJvd3MoKSk7XHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc29ydChmaWVsZE5hbWUsIGFzY2VuZGluZyA9IHRydWUpIHtcclxuXHRcdF90YWJsZS5yb3dzLnNvcnQoKGEsIGIpID0+IHtcclxuXHRcdFx0Ly8gbGV0IHZhID0gYS5fZGF0YVtmaWVsZE5hbWVdO1xyXG5cdFx0XHQvLyBsZXQgdmIgPSBiLl9kYXRhW2ZpZWxkTmFtZV07XHJcblx0XHRcdGxldCB2YSA9IGEuY2VsbChmaWVsZE5hbWUpLnZhbHVlKCk7XHJcblx0XHRcdGxldCB2YiA9IGIuY2VsbChmaWVsZE5hbWUpLnZhbHVlKCk7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHZhID09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0dmEgPSBTdHJpbmcodmEpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0dmIgPSBTdHJpbmcodmIpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh2YSA8IHZiKVxyXG5cdFx0XHRcdHJldHVybiBhc2NlbmRpbmcgPyAtMSA6IDE7XHJcblxyXG5cdFx0XHRpZiAodmEgPiB2YilcclxuXHRcdFx0XHRyZXR1cm4gYXNjZW5kaW5nID8gMSA6IC0xO1xyXG5cclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9KTtcclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiBfdGFibGUuYm9keS5lbGVtZW50LmFwcGVuZENoaWxkKHJvdy5lbGVtZW50KSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X3RhYmxlLmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHRcdCR0YWJsZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGRpc2FibGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9leHBvcnQocm93cywgb3B0aW9ucyA9IHsgc2VwYXJhdG9yOiAnXFx0JyB9KSB7XHJcblx0XHQvLyBFeHBvcnRhIGFzIGxpbmhhcyBlc3BlY2lmaWNhZGFzIG91IHNlbGVjaW9uYWRhcyBwYXJhIHVtIGZvcm1hdG8gZGUgdGV4dG8gc2VwYXJhZG8gcG9yIHRhYnVsYVx1MDBFN1x1MDBFM28uXHJcblxyXG5cdFx0bGV0IHRleHQgPSAocm93cyB8fCBfdGFibGUuc2VsZWN0ZWRSb3dzKCkpLm1hcChyb3cgPT4ge1xyXG5cdFx0XHRsZXQgZmllbGROYW1lcyA9IHJvdy5jZWxscy5maWx0ZXIoeCA9PiAheC5jaGVja2JveCAmJiAheC5pc0hpZGRlbikubWFwKHggPT4geC5vcHRpb25zLm5hbWUpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJvdy50ZXh0KGZpZWxkTmFtZXMpLmpvaW4ob3B0aW9ucy5zZXBhcmF0b3IpO1xyXG5cdFx0fSkuam9pbignXFxuJyk7XHJcblxyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2V0Q29sdW1uV2lkdGhzKCkge1xyXG5cdFx0bGV0IHdpZHRocyA9IF9zdG9yZWRXaWR0aHMoKSB8fCBfdGFibGUuX2NvbHVtbldpZHRocztcclxuXHJcblx0XHRpZiAoIXdpZHRocykge1xyXG5cdFx0XHR3aWR0aHMgPSBbXTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmNoZWNrYm94KVxyXG5cdFx0XHRcdHdpZHRocy5wdXNoKCczNHB4Jyk7XHJcblxyXG5cdFx0XHRmb3IgKGxldCBuYW1lIGluIG9wdGlvbnMuY29sdW1ucykge1xyXG5cdFx0XHRcdGxldCBjb2x1bW4gPSBvcHRpb25zLmNvbHVtbnNbbmFtZV07XHJcblxyXG5cdFx0XHRcdGlmIChjb2x1bW4uaGlkZGVuKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCB3aWR0aCA9IGNvbHVtbi53aWR0aDtcclxuXHRcdFx0XHRsZXQgbWluV2lkdGggPSBjb2x1bW4ubWluV2lkdGg7XHJcblx0XHRcdFx0bGV0IG1pbk1heFdpZHRoO1xyXG5cclxuXHRcdFx0XHRpZiAoIXdpZHRoICYmICFtaW5XaWR0aCkge1xyXG5cdFx0XHRcdFx0bWluTWF4V2lkdGggPSAnMWZyJztcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHdpZHRoID09IG1pbldpZHRoKSB7XHJcblx0XHRcdFx0XHRtaW5NYXhXaWR0aCA9IHdpZHRoICsgJ3B4JztcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0d2lkdGggPSB3aWR0aCA/IHdpZHRoICsgJ3B4JyA6ICcxZnInO1xyXG5cdFx0XHRcdFx0bWluV2lkdGggPSBtaW5XaWR0aCA/IG1pbldpZHRoICsgJ3B4JyA6IHdpZHRoO1xyXG5cdFx0XHRcdFx0bWluTWF4V2lkdGggPSBgbWlubWF4KCR7bWluV2lkdGh9LCAke3dpZHRofSlgO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0d2lkdGhzLnB1c2gobWluTWF4V2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0X3RhYmxlLl9jb2x1bW5XaWR0aHMgPSB3aWR0aHM7XHJcblx0XHRfdGFibGUuaGVhZGVyLmVsZW1lbnQuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IHdpZHRocy5qb2luKCcgJyk7XHJcblx0XHRfdGFibGUuYm9keS5lbGVtZW50LnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSB3aWR0aHMuam9pbignICcpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3NldENvbHVtblJlc2l6YWJsZSgpIHtcclxuXHRcdGNvbnN0ICRoZWFkZXIgPSBfdGFibGUuaGVhZGVyLmVsZW1lbnQ7XHJcblx0XHRjb25zdCAkaGVhZGVyQ2VsbHMgPSAkaGVhZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kdC1oZWFkZXItY2VsbDpub3QoLmhpZGRlbiknKTtcclxuXHRcdGNvbnN0ICRib2R5ID0gX3RhYmxlLmJvZHkuZWxlbWVudDtcclxuXHRcdGxldCBjdXJyZW50Q29sdW1uID0gbnVsbDtcclxuXHRcdGxldCBjdXJyZW50Q29sdW1uSW5kZXg7XHJcblx0XHRsZXQgY29sdW1uV2lkdGhzO1xyXG5cdFx0bGV0IHN0YXJ0WDtcclxuXHRcdGxldCBzdGFydFdpZHRoO1xyXG5cdFx0bGV0IGRpZmY7XHJcblx0XHRsZXQgaXNSZXNpemluZyA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICgkaGVhZGVyLmhhc1Jlc2l6ZUhhbmRsZXIpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHQkaGVhZGVyQ2VsbHMuZm9yRWFjaCgoJGNlbGwsIGluZGV4KSA9PiB7XHJcblx0XHRcdGNvbnN0ICRyZXNpemVyID0gJGNlbGwucXVlcnlTZWxlY3RvcignLnJlc2l6ZXInKTtcclxuXHJcblx0XHRcdGlmICgkcmVzaXplcikge1xyXG5cdFx0XHRcdCRyZXNpemVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHN0YXJ0UmVzaXplKGV2ZW50LCBpbmRleCwgJGNlbGwpKTtcclxuXHRcdFx0XHQkcmVzaXplci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0JGhlYWRlci5oYXNSZXNpemVIYW5kbGVyID0gdHJ1ZTtcclxuXHJcblx0XHRmdW5jdGlvbiBzdGFydFJlc2l6ZShldmVudCwgaW5kZXgsICRjb2x1bW4pIHtcclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKTtcclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BSZXNpemUpO1xyXG5cclxuXHRcdFx0Y3VycmVudENvbHVtbiA9IF90YWJsZS5oZWFkZXIuY2VsbCgkY29sdW1uLmRhdGFzZXQubmFtZSk7XHJcblxyXG5cdFx0XHRpZiAoIW9wdGlvbnMucmVzaXplICYmICFjdXJyZW50Q29sdW1uLm9wdGlvbnMucmVzaXplKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdCRoZWFkZXIuY2xhc3NMaXN0LmFkZCgncmVzaXppbmcnKTtcclxuXHRcdFx0aXNSZXNpemluZyA9IHRydWU7XHJcblx0XHRcdGN1cnJlbnRDb2x1bW5JbmRleCA9IGluZGV4O1xyXG5cdFx0XHRzdGFydFggPSBldmVudC5wYWdlWDtcclxuXHRcdFx0Y29sdW1uV2lkdGhzID0gZ2V0Q29tcHV0ZWRTdHlsZSgkaGVhZGVyKS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJyk7XHJcblx0XHRcdHN0YXJ0V2lkdGggPSBwYXJzZUZsb2F0KGNvbHVtbldpZHRoc1tjdXJyZW50Q29sdW1uSW5kZXhdKTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZS1yZXNpemUnO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnbm9uZSc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gcmVzaXplKGUpIHtcclxuXHRcdFx0aWYgKCFpc1Jlc2l6aW5nKSByZXR1cm47XHJcblxyXG5cdFx0XHRkaWZmID0gZS5wYWdlWCAtIHN0YXJ0WDtcclxuXHJcblx0XHRcdGxldCBtaW5XaWR0aCA9IGN1cnJlbnRDb2x1bW4ub3B0aW9ucy5taW5XaWR0aCB8fCA1MDtcclxuXHRcdFx0bGV0IHdpZHRoID0gTWF0aC5tYXgobWluV2lkdGgsIHN0YXJ0V2lkdGggKyBkaWZmKTtcclxuXHJcblx0XHRcdHNldENvbHVtbldpZHRoKGN1cnJlbnRDb2x1bW5JbmRleCwgd2lkdGgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHNldENvbHVtbldpZHRoKGNvbHVtbkluZGV4LCB3aWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IHR5cGVvZiB3aWR0aCA9PSAnbnVtYmVyJyA/IHdpZHRoICsgJ3B4JyA6IHdpZHRoO1xyXG5cclxuXHRcdFx0Y29sdW1uV2lkdGhzID0gZ2V0Q29tcHV0ZWRTdHlsZSgkaGVhZGVyKS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJyk7XHJcblx0XHRcdGNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF0gPSB3aWR0aDtcclxuXHRcdFx0JGhlYWRlci5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gY29sdW1uV2lkdGhzLmpvaW4oJyAnKTtcclxuXHRcdFx0JGJvZHkuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGNvbHVtbldpZHRocy5qb2luKCcgJyk7XHJcblx0XHRcdF90YWJsZS5fY29sdW1uV2lkdGhzID0gY29sdW1uV2lkdGhzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHN0b3BSZXNpemUoKSB7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSk7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wUmVzaXplKTtcclxuXHJcblx0XHRcdGlmICghaXNSZXNpemluZylcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRpc1Jlc2l6aW5nID0gZmFsc2U7XHJcblx0XHRcdCRoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXppbmcnKTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnJztcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJyc7XHJcblx0XHRcdF9zdG9yZWRXaWR0aHMoX3RhYmxlLl9jb2x1bW5XaWR0aHMpO1xyXG5cclxuXHRcdFx0aWYgKGRpZmYgJiYgb3B0aW9ucy5vblJlc2l6ZUNvbHVtbikge1xyXG5cdFx0XHRcdG9wdGlvbnMub25SZXNpemVDb2x1bW4oeyBjb2x1bW46IGN1cnJlbnRDb2x1bW4sIHdpZHRoczogX3RhYmxlLl9jb2x1bW5XaWR0aHMgfSk7XHJcblx0XHRcdFx0ZGlmZiA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9zdG9yZWRXaWR0aHMod2lkdGhzKSB7XHJcblx0XHRpZiAod2lkdGhzKSB7XHJcblx0XHRcdHdpZHRoc1t3aWR0aHMubGVuZ3RoIC0gMV0gPSBgbWlubWF4KCR7d2lkdGhzW3dpZHRocy5sZW5ndGggLSAxXX0sIDFmcilgOyAvLyBcdTAwRkFsdGltYSBjb2x1bmEgY29tIGxhcmd1cmEgbVx1MDBFMXhpbWFcclxuXHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleV9zdG9yZWRXaWR0aHMsIEpTT04uc3RyaW5naWZ5KHdpZHRocykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0d2lkdGhzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5X3N0b3JlZFdpZHRocyk7XHJcblxyXG5cdFx0XHRpZiAod2lkdGhzKVxyXG5cdFx0XHRcdF90YWJsZS5fY29sdW1uV2lkdGhzID0gSlNPTi5wYXJzZSh3aWR0aHMpO1xyXG5cclxuXHRcdFx0cmV0dXJuIF90YWJsZS5fY29sdW1uV2lkdGhzO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3NldEJvcmRlcnMoKSB7XHJcblx0XHRpZiAoIShcclxuXHRcdFx0ZGF0YSgpLmxlbmd0aCAmJlxyXG5cdFx0XHRfdGFibGUuaGVhZGVyICYmXHJcblx0XHRcdF90YWJsZS5ib2R5XHJcblx0XHQpKSByZXR1cm47XHJcblxyXG5cdFx0Ly8gcmVtb3ZlIGEgYm9yZGEgZGEgXHUwMEZBbHRpbWEgY1x1MDBFOWx1bGEgY29tIGEgY2xhc3NlIC52aXNpYmxlIChuXHUwMEUzbyBcdTAwRTkgcG9zc1x1MDBFRHZlbCBmYXplciBpc3NvIHZpYSBjc3MpLlxyXG5cdFx0X3RhYmxlLmhlYWRlci5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aXNpYmxlOmxhc3QtY2hpbGQnKS5jbGFzc0xpc3QucmVtb3ZlKCdjZWxsLWJvcmRlci1yaWdodCcpO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2goKCRyb3csIGluZGV4KSA9PiB7XHJcblx0XHRcdCRyb3cucXVlcnlTZWxlY3RvcignLnZpc2libGU6bGFzdC1jaGlsZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2NlbGwtYm9yZGVyLXJpZ2h0Jyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBmb290ZXJcclxuXHRcdGxldCByYWRpdXMgPSBvcHRpb25zLmZvb3Rlci5oaWRkZW4gPyAnaW5oZXJpdCcgOiAnMHB4JztcclxuXHJcblx0XHRfdGFibGUuZWxlbWVudHMuc2Nyb2xsYWJsZS5zdHlsZS5ib3JkZXJCb3R0b21MZWZ0UmFkaXVzID0gcmFkaXVzO1xyXG5cdFx0X3RhYmxlLmVsZW1lbnRzLnNjcm9sbGFibGUuc3R5bGUuYm9yZGVyYm90dG9tUmlnaHRSYWRpdXMgPSByYWRpdXM7XHJcblx0fVxyXG59XHJcbiIsICIvKlxyXG5cdENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDA1LzAxLzIwMjUuXHJcbiovXHJcblxyXG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBUYWJsZU9wdGlvbnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi9jb21wb25lbnRzL1RhYmxlLmpzJztcclxuXHJcbmNvbnN0IERhdGFUYWJsZSA9IG9wdGlvbnMgPT4ge1xyXG5cdC8vIG9wdGlvbnM6IFRhYmxlT3B0aW9uc1xyXG5cclxuXHRvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgVGFibGVPcHRpb25zKCksIG9wdGlvbnMpO1xyXG5cclxuXHRjb25zdCBfdGFibGUgPSBUYWJsZShvcHRpb25zKTtcclxuXHJcblx0aWYgKG9wdGlvbnMucGxhY2UpXHJcblx0XHRvcHRpb25zLnBsYWNlLmFwcGVuZENoaWxkKF90YWJsZS5lbGVtZW50KTtcclxuXHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25XaW5kb3dDbGljayk7XHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xyXG5cclxuXHRfdGFibGUuZGVzdHJveSA9IGRlc3Ryb3k7XHJcblxyXG5cdHJldHVybiBfdGFibGU7XHJcblxyXG5cdGZ1bmN0aW9uIG9uV2luZG93Q2xpY2soZXZlbnQpIHtcclxuXHRcdGlmIChfdGFibGUuaXNEaXNhYmxlZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdC8vIHJlbW92ZSBhIHNlbGVcdTAwRTdcdTAwRTNvIGFvIGNsaWNhciBmb3JhXHJcblx0XHRpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZHQtaGVhZGVyJykgJiYgIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZHQtYm9keScpKSB7XHJcblx0XHRcdGlmIChvcHRpb25zLm9uQ2xpY2tPdXQpXHJcblx0XHRcdFx0b3B0aW9ucy5vbkNsaWNrT3V0KHsgZXZlbnQgfSk7XHJcblxyXG5cdFx0XHQvLyBldmVudC5jYW5jZWxVbnNlbGVjdFJvd3M6IGJvb2xlYW4gLSBQcm9wcmllZGFkZSBjdXN0b21pemFkYSBkZWZpbmlkYSBlbSBvcHRpb25zLm9uQ2xpY2tPdXQoKSBwYXJhIGNhbmNlbGFyIGEgZGVzc2VsZVx1MDBFN1x1MDBFM28gZGFzIGxpbmhhcy5cclxuXHRcdFx0aWYgKCFvcHRpb25zLmNoZWNrYm94ICYmICFldmVudC5jYW5jZWxVbnNlbGVjdFJvd3MpXHJcblx0XHRcdFx0X3RhYmxlLnVuc2VsZWN0Um93cyhldmVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbktleURvd24oZXZlbnQpIHtcclxuXHRcdC8vIGN0cmwrYVxyXG5cdFx0aWYgKFxyXG5cdFx0XHRldmVudC5jdHJsS2V5ICYmXHJcblx0XHRcdGV2ZW50LmtleSA9PSAnYScgJiYgKChcclxuXHRcdFx0XHRvcHRpb25zLnJvd3Muc2VsZWN0T25DbGljayAmJlxyXG5cdFx0XHRcdG9wdGlvbnMucm93cy5hbGxvd011bHRpcGxlU2VsZWN0aW9uXHJcblx0XHRcdCkgfHxcclxuXHRcdFx0XHRvcHRpb25zLmNoZWNrYm94XHJcblx0XHRcdClcclxuXHRcdCkge1xyXG5cdFx0XHQvLyBwcmV2aW5lIG8gY29tcG9ydGFtZW50byBwYWRyXHUwMEUzbyBkZSBzZWxlY2lvbmFyIHR1ZG9cclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdC8vIHNlbGVjaW9uYSB0b2RhcyBhcyBsaW5oYXMgZGEgdGFiZWxhXHJcblx0XHRcdF90YWJsZS5zZWxlY3RSb3dzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY3RybCtjXHJcblx0XHRpZiAoXHJcblx0XHRcdG9wdGlvbnMub25Db3B5Q2xpcCAmJlxyXG5cdFx0XHRldmVudC5jdHJsS2V5ICYmXHJcblx0XHRcdGV2ZW50LmtleSA9PSAnYycgJiYgKChcclxuXHRcdFx0XHRvcHRpb25zLnJvd3Muc2VsZWN0T25DbGlja1xyXG5cdFx0XHQpIHx8XHJcblx0XHRcdFx0b3B0aW9ucy5jaGVja2JveFxyXG5cdFx0XHQpXHJcblx0XHQpIHtcclxuXHRcdFx0b3B0aW9ucy5vbkNvcHlDbGlwKHsgdGV4dDogX3RhYmxlLmV4cG9ydCgpIH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGVzY1xyXG5cdFx0aWYgKGV2ZW50LmtleSA9PSAnRXNjYXBlJylcclxuXHRcdFx0X3RhYmxlLnVuc2VsZWN0Um93cyhldmVudCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZXN0cm95KCkge1xyXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25XaW5kb3dDbGljayk7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XHJcblxyXG5cdFx0X3RhYmxlLmVsZW1lbnQucmVtb3ZlKCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGF0YVRhYmxlO1xyXG4iLCAiLypcclxuXHRDcmlhZG8gcG9yIEphbmRlcnNvbiBDb3N0YSBlbSAgMjcvMDUvMjAyNC5cclxuXHREZXNjcmlcdTAwRTdcdTAwRTNvOiBDYWl4YSBkZSBkaVx1MDBFMWxvZ28gZG8gdGlwbyBtb2RhbCBzaW1wbGVzLlxyXG4qL1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0dGl0bGU6ICcnLCAvLyBzdHJpbmcsXHJcblx0Y29udGVudDogJycsIC8vIHN0cmluZy9IVE1MRWxlbWVudCxcclxuXHRidXR0b25zOiBudWxsLCAvKiBbXHJcblx0XHR7XHJcblx0XHRcdG5hbWU6ICdPSycsXHJcblx0XHRcdHByaW1hcnk6IHRydWUsXHJcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uXHJcblx0XHR9LCBcclxuXHRcdHtcclxuXHRcdFx0bmFtZTogJ0NhbmNlbGFyJyxcclxuXHRcdFx0cHJpbWFyeTogZmFsc2UsXHJcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uXHJcblx0XHR9XHJcblx0XSovXHJcblx0d2lkdGg6IDM2MCwgLy8gbnVtYmVyXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNb2RhbChvcHRpb25zKSB7XHJcblx0b3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcclxuXHJcblx0bGV0IF9ibG9ja2VkID0gZmFsc2U7XHJcblx0bGV0ICRvdmVybGF5O1xyXG5cdGxldCAkYnV0dG9ucztcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHNob3csXHJcblx0XHRoaWRlLFxyXG5cdFx0YmxvY2ssXHJcblx0XHRzaG93U3BpbixcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblxyXG5cdFx0JG92ZXJsYXkuY2xhc3NOYW1lID0gJ21vZGFsLW92ZXJsYXknO1xyXG5cdFx0JG92ZXJsYXkuaW5uZXJIVE1MID0gLypodG1sKi9gXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC10aXRsZVwiPlxyXG5cdFx0XHRcdFx0PHNwYW4+JHtvcHRpb25zLnRpdGxlfTwvc3Bhbj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibW9kYWwtc3BpblwiPjwvc3Bhbj5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPjwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC1idXR0b25zXCI+PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YDtcclxuXHRcdGNvbnN0ICRtb2RhbCA9ICRvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbCcpO1xyXG5cdFx0Y29uc3QgJGNvbnRlbnQgPSAkb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcubW9kYWwtY29udGVudCcpO1xyXG5cclxuXHRcdC8vIG92ZXJsYXlcclxuXHRcdCRvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblxyXG5cdFx0Ly8gbW9kYWxcclxuXHRcdCRtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy53aWR0aClcclxuXHRcdFx0JG1vZGFsLnN0eWxlLndpZHRoID0gb3B0aW9ucy53aWR0aCArICdweCc7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY29udGVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHQkY29udGVudC5hcHBlbmRDaGlsZChvcHRpb25zLmNvbnRlbnQpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkY29udGVudC5pbm5lckhUTUwgPSBvcHRpb25zLmNvbnRlbnQ7XHJcblxyXG5cdFx0Ly8gYm90XHUwMEY1ZXNcclxuXHRcdCRidXR0b25zID0gJG92ZXJsYXkucXVlcnlTZWxlY3RvcignLm1vZGFsLWJ1dHRvbnMnKTtcclxuXHJcblx0XHQob3B0aW9ucy5idXR0b25zIHx8IFtdKS5mb3JFYWNoKGJ1dHRvbiA9PiB7XHJcblx0XHRcdGNvbnN0ICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHJcblx0XHRcdCRidXR0b24udHlwZSA9ICdidXR0b24nO1xyXG5cdFx0XHQkYnV0dG9uLmlubmVySFRNTCA9IGJ1dHRvbi5uYW1lO1xyXG5cdFx0XHQkYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ3ByaW1hcnknLCAhIWJ1dHRvbi5wcmltYXJ5KTtcclxuXHJcblx0XHRcdGlmIChidXR0b24ub25DbGljaylcclxuXHRcdFx0XHQkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYnV0dG9uLm9uQ2xpY2spO1xyXG5cclxuXHRcdFx0aWYgKGJ1dHRvbi5uYW1lLm1hdGNoKC9DYW5jZWx8Tm8vKSlcclxuXHRcdFx0XHQkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblxyXG5cdFx0XHQkYnV0dG9ucy5hcHBlbmRDaGlsZCgkYnV0dG9uKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiAkb3ZlcmxheTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coKSB7XHJcblx0XHQkb3ZlcmxheSA9IGNyZWF0ZSgpO1xyXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCgkb3ZlcmxheSk7XHJcblx0XHQkb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pbnZpc2libGUnKTtcclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLXZpc2libGUnKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5idXR0b25zKVxyXG5cdFx0XHQkYnV0dG9ucy5xdWVyeVNlbGVjdG9yKCdidXR0b24nKS5mb2N1cygpO1xyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhpZGUoKSB7XHJcblx0XHRkZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBibG9jayhibG9jayA9IHRydWUpIHtcclxuXHRcdGlmICghb3B0aW9ucy5idXR0b25zKSByZXR1cm47XHJcblxyXG5cdFx0X2Jsb2NrZWQgPSBibG9jaztcclxuXHJcblx0XHQkYnV0dG9ucy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKS5mb3JFYWNoKCRidXR0b24gPT4ge1xyXG5cdFx0XHQkYnV0dG9uLmJsdXIoKTtcclxuXHRcdFx0JGJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGJsb2NrKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd1NwaW4oc2hvdyA9IHRydWUpIHtcclxuXHRcdCRvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1zcGluJykuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuXHRcdGlmIChfYmxvY2tlZCkgcmV0dXJuO1xyXG5cclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLXZpc2libGUnKTtcclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLWludmlzaWJsZScpO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHQkb3ZlcmxheS5yZW1vdmUoKTtcclxuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xyXG5cdFx0fSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LmtleSA9PSAnVGFiJykge1xyXG5cdFx0XHRpZiAoX2Jsb2NrZWQpXHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZXZlbnQua2V5ID09ICdFc2NhcGUnKSB7XHJcblx0XHRcdGRlc3Ryb3koKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBSb3dQcm9ncmVzc0JhciBmcm9tICcuLi9jb21wb25lbnRzL1Jvd1Byb2dyZXNzQmFyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBNb2RhbCBmcm9tICcuLi9saWIvTW9kYWwvTW9kYWwnO1xyXG5pbXBvcnQgTWVudSBmcm9tICcuLi9saWIvTWVudS9NZW51JztcclxuaW1wb3J0IFRvYXN0IGZyb20gJy4uL2xpYi9Ub2FzdC9Ub2FzdCc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBUYXNrc1BhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7XHJcblx0XHRwYWdlTWFwOiBbJ1Rhc2tzJ10sXHJcblx0XHRkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhbmQgbWFuYWdlIGF1dG9tYXRlZCB0YXNrcyB0byBlZmZpY2llbnRseSBvcHRpbWl6ZSB5b3VyIGltYWdlcy4nXHJcblx0fSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0eyBuYW1lOiAndGFza3NNZW51JywgdG9vbHRpcDogJycsIGljb246IEljb24oJ2VsbGlwc2lzVmVydGljYWwnKSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdhZGQnLCB0b29sdGlwOiAnTmV3IHRhc2snLCBpY29uOiBJY29uKCdhZGQnKSwgb25DbGljazogbmV3SXRlbSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdlZGl0JywgdG9vbHRpcDogJ0VkaXQnLCBpY29uOiBJY29uKCdlZGl0JyksIG9uQ2xpY2s6IGVkaXRJdGVtIH0sXHJcblx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdzZWFyY2gnLCB0b29sdGlwOiAnVmlldyBmaWxlcycsIGljb246IEljb24oJ3NlYXJjaCcpLCBvbkNsaWNrOiB2aWV3RmlsZXMgfSxcclxuXHRcdFx0eyBuYW1lOiAnc3RhcnQnLCB0b29sdGlwOiAnU3RhcnQgdGFzaycsIGljb246IEljb24oJ3N0YXJ0JyksIG9uQ2xpY2s6IHN0YXJ0VGFzayB9LFxyXG5cdFx0XHR7IG5hbWU6ICdzdG9wJywgdG9vbHRpcDogJ1N0b3AnLCBpY29uOiBJY29uKCdzdG9wJyksIG9uQ2xpY2s6IHN0b3BUYXNrIH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogYWN0aW9uQmFyLmVsZW1lbnQsXHJcblx0XHRcdGNvbnRlbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0b25TaG93LFxyXG5cdFx0b25IaWRlLFxyXG5cdFx0dXBkYXRlUnVubmluZ1Rhc2tzLFxyXG5cdH07XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblx0bGV0IF9zZWxlY3RlZFJvdztcclxuXHRsZXQgX3Rhc2tzQ29udGV4dE1lbnU7XHJcblx0bGV0IF9wYXVzZTtcclxuXHJcblx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0YXdhaXQgbG9hZCgpO1xyXG5cclxuXHRcdGNvbnN0IGlkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJyk7XHJcblxyXG5cdFx0aWYgKGlkKSB7XHJcblx0XHRcdGNvbnN0IHJvd3MgPSBfZGF0YVRhYmxlLnJvd3NCeUZpZWxkVmFsdWUoJ2lkJywgaWQpO1xyXG5cclxuXHRcdFx0Ly8gc2VsZWNpb25hIG8gaXRlbVxyXG5cdFx0XHRpZiAocm93cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRyb3dzWzBdLnNlbGVjdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgJycpO1xyXG5cclxuXHRcdC8vIE1lbnVzXHJcblx0XHRNZW51KHtcclxuXHRcdFx0dHJpZ2dlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9dGFza3NNZW51XScpLFxyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ0ltcG9ydCB0YXNrcycsIGljb246IEljb24oJ2ltcG9ydCcpLCBvbkNsaWNrOiBpbXBvcnRUYXNrcyB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0V4cG9ydCB0YXNrcycsIGljb246IEljb24oJ2V4cG9ydCcpLCBvbkNsaWNrOiBleHBvcnRUYXNrcyB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdF90YXNrc0NvbnRleHRNZW51ID0gTWVudSh7XHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnRGlzYWJsZWQnLCBpY29uOiAnJywgb25DbGljazogKCkgPT4gZGlzYWJsZVRhc2soKSB9LFxyXG5cdFx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0VkaXQnLCBpY29uOiBJY29uKCdlZGl0JyksIG9uQ2xpY2s6IGVkaXRJdGVtIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRHVwbGljYXRlJywgaWNvbjogSWNvbignZHVwbGljYXRlJyksIG9uQ2xpY2s6IGR1cGxpY2F0ZUl0ZW0gfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBvbkNsaWNrOiBjb3B5Q2xpcEl0ZW1zIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBpbiBmaWxlIGV4cGxvcmVyJywgaWNvbjogSWNvbignZm9sZGVyU2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdJbkZpbGVFeHBsb3JlciB9LFxyXG5cdFx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgZmlsZXMnLCBpY29uOiBJY29uKCdzZWFyY2gnKSwgb25DbGljazogdmlld0ZpbGVzIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnU3RhcnQgdGFzaycsIGljb246IEljb24oJ3N0YXJ0JyksIG9uQ2xpY2s6IHN0YXJ0VGFzayB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1N0b3AnLCBpY29uOiBJY29uKCdzdG9wJyksIG9uQ2xpY2s6IHN0b3BUYXNrIH0sXHJcblx0XHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRGVsZXRlJywgaWNvbjogSWNvbigndHJhc2gnKSwgb25DbGljazogZGVsZXRlSXRlbSB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25IaWRlKCkge1xyXG5cdFx0X2RhdGFUYWJsZS5kZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBsb2FkKCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IGRhdGEgfSA9IGF3YWl0IHdlYkFQSS5nZXRUYXNrcygpO1xyXG5cclxuXHRcdGlmIChkYXRhKVxyXG5cdFx0XHRfZGF0YVRhYmxlLmxvYWQoZGF0YS5pdGVtcyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0aWQ6ICd0YXNrcycsXHJcblx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRzb3J0OiB0cnVlLFxyXG5cdFx0XHRyZXNpemU6IHRydWUsXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRpZDogeyBkaXNwbGF5TmFtZTogJ0lkJywgaGlkZGVuOiB0cnVlIH0sXHJcblx0XHRcdFx0bmFtZTogeyBkaXNwbGF5TmFtZTogJ05hbWUnLCB3aWR0aDogMjAwIH0sXHJcblx0XHRcdFx0cGF0aDogeyBkaXNwbGF5TmFtZTogJ1BhdGgnLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0Y29udGVudDogeyBkaXNwbGF5TmFtZTogJ0NvbnRlbnQnLCB3aWR0aDogMTAwIH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7IGRpc3BsYXlOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDEwMCB9LFxyXG5cdFx0XHRcdHByb2dyZXNzOiB7IGRpc3BsYXlOYW1lOiAnUHJvZ3Jlc3MnLCBtaW5XaWR0aDogMjAwLCBzb3J0OiBmYWxzZSB9LFxyXG5cdFx0XHRcdGVsYXBzZWRUaW1lOiB7IGRpc3BsYXlOYW1lOiAnRWxhcHNlZCBUaW1lJywgd2lkdGg6IDEyMCwgc29ydDogZmFsc2UgfSxcclxuXHRcdFx0XHRsYXN0UnVuOiB7IGRpc3BsYXlOYW1lOiAnTGFzdCBSdW4nLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0bmV4dFJ1bjogeyBkaXNwbGF5TmFtZTogJ05leHQgU2NoZWR1bGVkIFJ1bicsIG1pbldpZHRoOiAxNjAsIHNvcnQ6IGZhbHNlIH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IGZhbHNlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdHBhdGg6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjZWxsXCIgc3R5bGU9XCJwYWRkaW5nOiA3cHggOHB4IDlweCA4cHg7IG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1wiPnt2YWx1ZX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBvbkNsaWNrPXt2aWV3SW5GaWxlRXhwbG9yZXJ9IGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIHRpdGxlPVwiVmlldyBpbiBmaWxlIGV4cGxvcmVyXCI+XHJcblx0XHRcdFx0XHRcdFx0XHR7SWNvbignZm9sZGVyU2VhcmNoJyl9XHJcblx0XHRcdFx0XHRcdFx0PC9hPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRzdHlsZTogeyBwYWRkaW5nOiAnMCAhaW1wb3J0YW50JyB9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y29udGVudDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUgPT0gJ3Jvb3QnID8gJ1Jvb3QgZmlsZXMnIDogJ0FsbCBkaXJlY3RvcnknXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdGF0dXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHNoYXJlZC5jb25zdGFudHMuc3RhdHVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gdmFsdWUpPy5kaXNwbGF5TmFtZSB8fCAnJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHByb2dyZXNzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHByb2dyZXNzID0gUm93UHJvZ3Jlc3NCYXIoKTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgcGVyY2VudCA9IHZhbHVlLnNwbGl0KCclJylbMF07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHByb2dyZXNzLnNob3coKTtcclxuXHRcdFx0XHRcdFx0XHRwcm9ncmVzcy51cGRhdGUocGVyY2VudCwgdmFsdWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcHJvZ3Jlc3MuZWxlbWVudDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlbGFwc2VkVGltZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUgfHwgJydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGxhc3RSdW46IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG5leHRSdW46IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRkaXNhYmxlUm93KHJvdyk7XHJcblx0XHRcdFx0c2V0Rm9vdGVyKCk7XHJcblxyXG5cdFx0XHRcdGRvbShyb3cuZWxlbWVudCkub24oJ2NvbnRleHRtZW51JywgKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFyb3cuaXNTZWxlY3RlZClcclxuXHRcdFx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cclxuXHRcdFx0XHRcdF90YXNrc0NvbnRleHRNZW51LnNob3coZXZlbnQpO1xyXG5cdFx0XHRcdFx0X3Rhc2tzQ29udGV4dE1lbnUuaXRlbSgnRGlzYWJsZWQnKS5pY29uKFxyXG5cdFx0XHRcdFx0XHRyb3cuZGF0YSgpLnN0YXR1cyA9PSAnZGlzYWJsZWQnID8gSWNvbignY2hlY2tlZCcpIDogJydcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uU2VsZWN0Um93czogKHsgcm93cyB9KSA9PiB7XHJcblx0XHRcdFx0X3NlbGVjdGVkUm93ID0gcm93c1swXTtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVuc2VsZWN0Um93czogKCkgPT4ge1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Eb3VibGVDbGlja1JvdzogKHsgcm93LCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZWRpdEl0ZW0oKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25SZW1vdmVSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2V0Rm9vdGVyKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ29weUNsaXA6ICh7IHRleHQgfSkgPT4ge1xyXG5cdFx0XHRcdGNvcHlDbGlwSXRlbXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25DbGlja091dDogKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cyA9ICEhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5hY3Rpb25iYXInKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnRleHQuZWxlbWVudHMuY29udGVudCA9IF9kYXRhVGFibGUuZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG5ld0l0ZW0oKSB7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ3Rhc2svbmV3JztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVkaXRJdGVtKCkge1xyXG5cdFx0bGV0IGlkID0gX3NlbGVjdGVkUm93LmRhdGEoKS5pZDtcclxuXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCBpZCk7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ3Rhc2svJyArIGlkO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gdmlld0ZpbGVzKCkge1xyXG5cdFx0bGV0IGlkID0gX3NlbGVjdGVkUm93LmRhdGEoKS5pZDtcclxuXHRcdGxldCBpc0F2YWlsYWJsZSA9IGF3YWl0IHdlYkFQSS5wYXRoSXNBdmFpbGFibGUoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKTtcclxuXHJcblx0XHRpZiAoaXNBdmFpbGFibGUpIHtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgaWQpO1xyXG5cdFx0XHRsb2NhdGlvbi5oYXNoID0gYHRhc2svJHtpZH0vZmlsZXNgO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gaXNUYXNrUnVubmluZyhyb3cpIHtcclxuXHRcdGxldCB0YXNrID0gKHJvdyB8fCBfc2VsZWN0ZWRSb3cpLmRhdGEoKTtcclxuXHRcdGxldCB7IHJlc3VsdDogaXNSdW5uaW5nIH0gPSBhd2FpdCB3ZWJBUEkuaXNUYXNrUnVubmluZyh0YXNrLmlkKTtcclxuXHJcblx0XHRpZiAoaXNSdW5uaW5nKVxyXG5cdFx0XHR0b2FzdEluZm8oJ1Rhc2sgaW4gcHJvZ3Jlc3MuJyk7XHJcblxyXG5cdFx0cmV0dXJuIGlzUnVubmluZztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHN0YXJ0VGFzaygpIHtcclxuXHRcdGxldCB0YXNrID0gX3NlbGVjdGVkUm93LmRhdGEoKTtcclxuXHJcblx0XHRpZiAoYXdhaXQgaXNUYXNrUnVubmluZygpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHRhc2suc3RhdHVzID09ICdkaXNhYmxlZCcpIHtcclxuXHRcdFx0dG9hc3RJbmZvKCdUYXNrIGlzIGRpc2FibGVkLicpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGlzQXZhaWxhYmxlID0gYXdhaXQgd2ViQVBJLnBhdGhJc0F2YWlsYWJsZSh0YXNrLnBhdGgpO1xyXG5cclxuXHRcdGlmICghaXNBdmFpbGFibGUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRjb25zdCBtb2RhbCA9IE1vZGFsKHtcclxuXHRcdFx0dGl0bGU6ICdTdGFydCB0YXNrJyxcclxuXHRcdFx0Y29udGVudDogJ1RoZSBvcHRpbWl6YXRpb24gcHJvY2VzcyB3aWxsIGJlZ2luLCBhbmQgdGhlIGZpbGVzIHdpbGwgYmUgcGVybWFuZW50bHkgY29tcHJlc3NlZC48YnI+PGJyPkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlPycsXHJcblx0XHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRuYW1lOiAnT0snLCBwcmltYXJ5OiB0cnVlLCBvbkNsaWNrOiAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdHdlYkFQSS5zdGFydFRhc2sodGFzay5pZCkudGhlbihyZXNwb25zZSA9PlxyXG5cdFx0XHRcdFx0XHRcdHRvYXN0SW5mbyhyZXNwb25zZS5yZXN1bHQpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmhpZGUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NhbmNlbCcgfVxyXG5cdFx0XHRdXHJcblx0XHR9KTtcclxuXHJcblx0XHRtb2RhbC5zaG93KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGVSdW5uaW5nVGFza3MocnVubmluZ1Rhc2tzKSB7XHJcblx0XHQvLyBBdHVhbGl6YSBpbmZvcm1hXHUwMEU3XHUwMEY1ZXMgZGFzIHRhcmVmYXMgZW0gZXhlY3VcdTAwRTdcdTAwRTNvIG5hIGdyYWRlLlxyXG5cclxuXHRcdGlmICghcnVubmluZ1Rhc2tzIHx8IF9wYXVzZSkgcmV0dXJuO1xyXG5cclxuXHRcdHJ1bm5pbmdUYXNrcyA9IEpTT04ucGFyc2UocnVubmluZ1Rhc2tzKTtcclxuXHJcblx0XHRpZiAocnVubmluZ1Rhc2tzKSB7XHJcblx0XHRcdHJ1bm5pbmdUYXNrcy5mb3JFYWNoKHJ1bm5pbmdUYXNrID0+IHtcclxuXHRcdFx0XHRjb25zdCByb3cgPSBfZGF0YVRhYmxlLnJvd3NCeUZpZWxkVmFsdWUoJ2lkJywgcnVubmluZ1Rhc2suaWQpWzBdO1xyXG5cclxuXHRcdFx0XHRpZiAocm93KSB7XHJcblx0XHRcdFx0XHRyb3cuZGF0YSh7XHJcblx0XHRcdFx0XHRcdHN0YXR1czogcnVubmluZ1Rhc2suZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogcnVubmluZ1Rhc2suc3RhdHVzLFxyXG5cdFx0XHRcdFx0XHRlbGFwc2VkVGltZTogcnVubmluZ1Rhc2suZWxhcHNlZFRpbWUsXHJcblx0XHRcdFx0XHRcdG5leHRSdW46IHJ1bm5pbmdUYXNrLm5leHRSdW4sXHJcblx0XHRcdFx0XHRcdGxhc3RSdW46IHJ1bm5pbmdUYXNrLmxhc3RSdW4sXHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHR1cGRhdGVQcm9ncmVzcyhyb3csIHJ1bm5pbmdUYXNrKTtcclxuXHRcdFx0XHRcdGRpc2FibGVSb3cocm93LCBydW5uaW5nVGFzay5kaXNhYmxlZCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzKHJvdywgcnVubmluZ1Rhc2spIHtcclxuXHRcdGxldCBpbmRleCA9IHJ1bm5pbmdUYXNrLmluZGV4O1xyXG5cdFx0bGV0IHRvdGFsID0gcnVubmluZ1Rhc2sudG90YWw7XHJcblx0XHRsZXQgcGVyY2VudCA9IE1hdGgucm91bmQoaW5kZXggLyB0b3RhbCAqIDEwMCk7XHJcblx0XHRsZXQgdmFsdWUgPSBpbmRleCA/IGAke3BlcmNlbnR9JSAke2luZGV4fS8ke3RvdGFsfWAgOiAnJztcclxuXHJcblx0XHRyb3cuZGF0YSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHN0b3BUYXNrKCkge1xyXG5cdFx0d2ViQVBJLnN0b3BUYXNrKF9zZWxlY3RlZFJvdy5kYXRhKCkuaWQpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZHVwbGljYXRlSXRlbSgpIHtcclxuXHRcdGxldCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShfc2VsZWN0ZWRSb3cuZGF0YSgpKTtcclxuXHJcblx0XHRjb25zdCB7IHJlc3VsdDogdGFzayB9ID0gYXdhaXQgd2ViQVBJLmluc2VydFRhc2soY2xvbmUpO1xyXG5cclxuXHRcdF9kYXRhVGFibGUuYWRkUm93KHRhc2spLnNlbGVjdCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29weUNsaXBJdGVtcygpIHtcclxuXHRcdHdlYkFQSS5jb3B5Q2xpcChfZGF0YVRhYmxlLmV4cG9ydCgpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdJbkZpbGVFeHBsb3JlcihldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnBvaW50ZXJJZCAmJiBldmVudC5wb2ludGVySWQgIT0gMSkgcmV0dXJuOyAvLyBzb21lbnRlIGJvdFx1MDBFM28gcHJpbmNpcGFsIGRvIG1vdXNlXHJcblxyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS52aWV3SW5GaWxlRXhwbG9yZXIoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGRpc2FibGVUYXNrKHJvdykge1xyXG5cdFx0aWYgKGF3YWl0IGlzVGFza1J1bm5pbmcoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCB0YXNrID0gKHJvdyB8fCBfc2VsZWN0ZWRSb3cpLmRhdGEoKTtcclxuXHJcblx0XHR0YXNrLnN0YXR1cyA9IHRhc2suc3RhdHVzID09ICdkaXNhYmxlZCcgPyAnJyA6ICdkaXNhYmxlZCc7XHJcblx0XHRfc2VsZWN0ZWRSb3cuZGF0YSh7IHN0YXR1czogdGFzay5zdGF0dXMgfSk7XHJcblx0XHR3ZWJBUEkudXBkYXRlVGFzayh0YXNrKTtcclxuXHRcdF9wYXVzZSA9IHRydWU7XHJcblxyXG5cdFx0c2V0VGltZW91dCgoKSA9PiBfcGF1c2UgPSBmYWxzZSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlUm93KHJvdywgZGlzYWJsZSkge1xyXG5cdFx0cm93ID0gcm93IHx8IF9zZWxlY3RlZFJvdztcclxuXHRcdGRpc2FibGUgPSBkaXNhYmxlICE9IHVuZGVmaW5lZCA/IGRpc2FibGUgOiByb3cuZGF0YSgpLnN0YXR1cyA9PSAnZGlzYWJsZWQnO1xyXG5cclxuXHRcdHJvdy5jZWxscy5mb3JFYWNoKGNlbGwgPT5cclxuXHRcdFx0Y2VsbC5lbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBkaXNhYmxlID8gMC43NSA6ICcnXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZGVsZXRlSXRlbSgpIHtcclxuXHRcdGlmIChhd2FpdCBpc1Rhc2tSdW5uaW5nKCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRjb25zdCBtb2RhbCA9IE1vZGFsKHtcclxuXHRcdFx0dGl0bGU6ICdEZWxldGUgdGFzaycsXHJcblx0XHRcdGNvbnRlbnQ6ICdUaGUgc2VsZWN0ZWQgaXRlbSB3aWxsIGJlIHBlcm1hbmVudGx5IGRlbGV0ZWQuPGJyPjxicj5EbyB5b3Ugd2lzaCB0byBjb250aW51ZT8nLFxyXG5cdFx0XHRidXR0b25zOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bmFtZTogJ09LJywgcHJpbWFyeTogdHJ1ZSwgb25DbGljazogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQgaWQgPSBfc2VsZWN0ZWRSb3cuZGF0YSgpLmlkO1xyXG5cclxuXHRcdFx0XHRcdFx0d2ViQVBJLmRlbGV0ZVRhc2soaWQpO1xyXG5cdFx0XHRcdFx0XHRfc2VsZWN0ZWRSb3cucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ2FuY2VsJyB9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cclxuXHRcdG1vZGFsLnNob3coKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3dBY3Rpb25CYXJCdXR0b25zKHNob3cgPSB0cnVlKSB7XHJcblx0XHRsZXQgc2VsZWN0b3IgPSAnLmRpdmlkZXIsIFtuYW1lPWVkaXRdLCBbbmFtZT1zZWFyY2hdLCBbbmFtZT1zdGFydF0sIFtuYW1lPXN0b3BdJztcclxuXHJcblx0XHRhY3Rpb25CYXIuZWxlbWVudC5nZXQoc2VsZWN0b3IpLnNob3coc2hvdyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBpbXBvcnRUYXNrcygpIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuZmlsZVBpY2tlcignSW1wb3J0IHRhc2tzJywgJ2pzb24nKTtcclxuXHJcblx0XHRpZiAocGF0aCkge1xyXG5cdFx0XHRjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB3ZWJBUEkuaW1wb3J0VGFza3MocGF0aCk7XHJcblxyXG5cdFx0XHRpZiAoIWVycm9yKVxyXG5cdFx0XHRcdGxvYWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFRhc2tzKCkge1xyXG5cdFx0Y29uc3QgZmlsZU5hbWUgPSAnVGFza3MuanNvbic7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLnNhdmVGaWxlUGlja2VyKCdFeHBvcnQgdGFza3MnLCBmaWxlTmFtZSwgJ2pzb24nKTtcclxuXHJcblx0XHRpZiAocGF0aClcclxuXHRcdFx0YXdhaXQgd2ViQVBJLmRvd25sb2FkRmlsZShgaHR0cDovL2xvY2FsaG9zdDoxMDEwL2RhdGEvJHtmaWxlTmFtZX1gLCBwYXRoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZvb3RlcigpIHtcclxuXHRcdGxldCBpdGVtcyA9IF9kYXRhVGFibGUuZGF0YSgpLmxlbmd0aDtcclxuXHJcblx0XHRzaGFyZWQuZm9vdGVyLmluZm8oYCR7aXRlbXMgfHwgJ05vJ30gdGFza3NgKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvYXN0SW5mbyhtZXNzYWdlKSB7XHJcblx0XHRpZiAoIW1lc3NhZ2UpIHJldHVybjtcclxuXHJcblx0XHRUb2FzdCh7XHJcblx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcclxuXHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0dGltZTogNFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza3NQYWdlO1xyXG4iLCAiY29uc3QgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHV0aWxzO1xyXG5cclxuZnVuY3Rpb24gVXRpbHMoKSB7XHJcblx0dGhpcy5nZW5lcmF0ZUd1aWQgPSBnZW5lcmF0ZUd1aWQ7XHJcblx0dGhpcy5jb252ZXJ0ID0gY29udmVydDtcclxuXHR0aGlzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcclxuXHR0aGlzLmlzRW1wdHkgPSBpc0VtcHR5O1xyXG5cdHRoaXMuaXNOdWxsT3JFbXB0eSA9IGlzTnVsbE9yRW1wdHk7XHJcblx0dGhpcy5pc1VuZGVmaW5lZE9yTnVsbCA9IGlzVW5kZWZpbmVkT3JOdWxsO1xyXG5cdHRoaXMuaXNVbmRlZmluZWRPck51bGxPckVtcHR5ID0gaXNVbmRlZmluZWRPck51bGxPckVtcHR5O1xyXG5cdHRoaXMuaXNOdW1iZXIgPSBpc051bWJlcjtcclxuXHR0aGlzLmlzSW50ZWdlciA9IGlzSW50ZWdlcjtcclxuXHR0aGlzLmlzRGF0ZVRpbWUgPSBpc0RhdGVUaW1lO1xyXG5cdHRoaXMuaXNJZnJhbWUgPSBpc0lmcmFtZTtcclxuXHR0aGlzLmNvbXByZXNzVGVtcGxhdGVTdHJpbmcgPSBjb21wcmVzc1RlbXBsYXRlU3RyaW5nO1xyXG5cdHRoaXMudHJ1bmNhdGVUZXh0ID0gdHJ1bmNhdGVUZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBnZW5lcmF0ZUd1aWQoKSB7XHJcblx0XHQvLyBSZXRvcm5hIHJhbmRvbWljYW1lbnRlIHVtIEdVSUQgcGFkclx1MDBFM28gLSBFeC46IGE5MWUzMmRmLTkzNTItNDUyMC05ZjA5LTE3MTVhOWEwY2U0MVxyXG5cclxuXHRcdGNvbnN0IGd1aWQgPSAoWzFlNl0gKyAtMWUzICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYyA9PlxyXG5cdFx0XHQoXHJcblx0XHRcdFx0YyBeXHJcblx0XHRcdFx0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdICYgKDE1ID4+IChjIC8gNCkpKVxyXG5cdFx0XHQpLnRvU3RyaW5nKDE2KVxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBhZGljaW9uYSB1bWEgbGV0cmEgY29tbyBwcmltZWlybyBjYXJhY3RlcmUgcGFyYSBldml0YXIgZXJybyBuYSBmdW5cdTAwRTdcdTAwRTNvIHF1ZXJ5U2VsZWN0b3JcclxuXHRcdHJldHVybiAnYScgKyBndWlkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29udmVydCgpIHtcclxuXHRcdGZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlLCBvcHRpb25zKSB7XHJcblx0XHRcdC8vIENvbnZlcnRlIHF1YWxxdWVyIHZhbG9yIHF1ZSBjb250ZW5oYSBuXHUwMEZBbWVyb3MgcGFyYSB1bSBuXHUwMEZBbWVybyBwdXJvLCBpbnRlaXJvIG91IGRlY2ltYWwuXHJcblxyXG5cdFx0XHQvKlxyXG5cdFx0XHRcdG9wdGlvbnM6IHtcclxuXHRcdFx0XHRcdGRpZ2l0czogaW50LydhdXRvJ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0Ki9cclxuXHJcblx0XHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpKSByZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdGNvbnN0IF9vcHRpb25zID0ge1xyXG5cdFx0XHRcdGRpZ2l0czogMixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zKSB7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuZGlnaXRzICE9PSAnYXV0bycpXHJcblx0XHRcdFx0XHRvcHRpb25zLmRpZ2l0cyA9XHJcblx0XHRcdFx0XHRcdGlzTnVtYmVyKG9wdGlvbnMuZGlnaXRzKSAmJiBvcHRpb25zLmRpZ2l0cyA+PSAwXHJcblx0XHRcdFx0XHRcdFx0PyBvcHRpb25zLmRpZ2l0c1xyXG5cdFx0XHRcdFx0XHRcdDogX29wdGlvbnMuZGlnaXRzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG9wdGlvbnMgPSBfb3B0aW9ucztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IG51bWJlciA9IHZhbHVlO1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHRsZXQgaXNOZWdhdGl2ZSA9IHZhbHVlLnN0YXJ0c1dpdGgoJy0nKTtcclxuXHRcdFx0XHRsZXQgbnVtYmVycyA9IHZhbHVlLm1hdGNoKC9cXGQrL2cpOyAvLyBzb21lbnRlIG5cdTAwRkFtZXJvc1xyXG5cclxuXHRcdFx0XHRudW1iZXIgPSAnJztcclxuXHJcblx0XHRcdFx0aWYgKG51bWJlcnMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRudW1iZXIgKz0gbnVtYmVyc1tpXTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChpID09PSBudW1iZXJzLmxlbmd0aCAtIDIpIG51bWJlciArPSAnLic7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRudW1iZXIgPSBOdW1iZXIoaXNOZWdhdGl2ZSA/ICctJyArIG51bWJlciA6IG51bWJlcik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBvcHRpb25zLmRpZ2l0cyA9PT0gJ2F1dG8nXHJcblx0XHRcdFx0PyBudW1iZXJcclxuXHRcdFx0XHQ6IE51bWJlcihudW1iZXIudG9GaXhlZChvcHRpb25zLmRpZ2l0cykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG5cdFx0XHQvLyBDb252ZXJ0ZSBxdWFscXVlciB2YWxvciBxdWUgc2UgZW50ZW5kYSBjb21vIHZlcmRhZGVpcm8gb3UgZmFsc28gcGFyYSBib29sZWFuby5cclxuXHJcblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdFx0fSBlbHNlIGlmIChVdGlscygpLmlzVW5kZWZpbmVkT3JOdWxsT3JFbXB0eSh2YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gMTtcclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcclxuXHJcblx0XHRcdFx0aWYgKHZhbHVlLm1hdGNoKC9edHJ1ZSR8XnllcyR8XnNpbSR8XjEkLykpIHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdGVsc2UgaWYgKHZhbHVlLm1hdGNoKC9eZmFsc2UkfF5ubyR8Xm5cdTAwRTNvJHxeMCQvKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbnVtYmVyVG9QeCh2YWx1ZSkge1xyXG5cdFx0XHQvLyBDb252ZXJ0ZSBxdWFscXVlciB2YWxvciBxdWUgY29udGVuaGEgblx1MDBGQW1lcm9zIHBhcmEgcHguXHJcblxyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHZhbHVlID8gYCR7dmFsdWV9cHhgIDogJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dG9OdW1iZXIsXHJcblx0XHRcdHRvQm9vbGVhbixcclxuXHRcdFx0bnVtYmVyVG9QeCxcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUpIHtcclxuXHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gJycgfHwgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmICF2YWx1ZS5sZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNOdWxsT3JFbXB0eSh2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHZhbHVlID09PSBudWxsIHx8IGlzRW1wdHkodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGxPckVtcHR5KHZhbHVlKSB7XHJcblx0XHRyZXR1cm4gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHx8IGlzTnVsbE9yRW1wdHkodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcclxuXHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHx8IGlzQm9vbGVhbih2YWx1ZSkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRyZXR1cm4gIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlKSB7XHJcblx0XHRpZiAoaXNVbmRlZmluZWRPck51bGxPckVtcHR5KHZhbHVlKSB8fCBpc0Jvb2xlYW4odmFsdWUpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmV0dXJuIE51bWJlci5pc0ludGVnZXIoTnVtYmVyKHZhbHVlKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0RhdGVUaW1lKHZhbHVlLCBmb3JtYXQpIHtcclxuXHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHx8IGlzQm9vbGVhbih2YWx1ZSkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0XHRpZiAoZm9ybWF0ID09PSAnZGQvbW0veXl5eScpXHJcblx0XHRcdHJldHVybiB2YWx1ZS5tYXRjaCgvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSQvKSAhPT0gbnVsbDtcclxuXHRcdGlmIChmb3JtYXQgPT09ICdkZC9tbS95eXl5IGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSAoXFxkezJ9KTooXFxkezJ9KSQvKSAhPT1cclxuXHRcdFx0XHRudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAnZGQvbW0veXl5eSBoaDptbTpzcycpXHJcblx0XHRcdHJldHVybiAoXHJcblx0XHRcdFx0dmFsdWUubWF0Y2goXHJcblx0XHRcdFx0XHQvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSAoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KSQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQnKVxyXG5cdFx0XHRyZXR1cm4gdmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KSQvKSAhPT0gbnVsbDtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pJC8pICE9PVxyXG5cdFx0XHRcdG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkIGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pIChcXGR7Mn0pOihcXGR7Mn0pJC8pICE9PVxyXG5cdFx0XHRcdG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tOnNzJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkkL1xyXG5cdFx0XHRcdCkgIT09IG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkIGhoOm1tOnNzJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkgKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkkL1xyXG5cdFx0XHRcdCkgIT09IG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tOnNzWicpXHJcblx0XHRcdHJldHVybiAoXHJcblx0XHRcdFx0dmFsdWUubWF0Y2goXHJcblx0XHRcdFx0XHQvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0pWiQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQgaGg6bW06c3NaJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkgKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSlaJC9cclxuXHRcdFx0XHQpICE9PSBudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAneXl5eS1tbS1kZFonKVxyXG5cdFx0XHRyZXR1cm4gdmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KVokLykgIT09IG51bGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0lmcmFtZSgpIHtcclxuXHRcdC8vIFJldG9ybmEgc2UgYSBwXHUwMEUxZ2luYSBhdHVhbCBlc3RcdTAwRTEgZW0gdW0gaWZyYW1lLlxyXG5cclxuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24gIT09IHdpbmRvdy5wYXJlbnQubG9jYXRpb247XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb21wcmVzc1RlbXBsYXRlU3RyaW5nKHRleHQpIHtcclxuXHRcdHJldHVybiB0ZXh0LnJlcGxhY2UoL1xcbnxcXHQvZywgJycpLnRyaW0oKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRydW5jYXRlVGV4dCh0ZXh0LCBtYXhMZW5ndGgpIHtcclxuXHRcdGlmICh0ZXh0Lmxlbmd0aCA+IG1heExlbmd0aClcclxuXHRcdFx0cmV0dXJuIHRleHQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCAtIDMpICsgJy4uLic7XHJcblxyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG59XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgVGFicyA9ICh7IG5hbWVzID0gW10sIGNvbnRlbnRzID0gW10sIHZlcnRpY2FsID0gZmFsc2UsIHN0eWxlID0gbnVsbCwgb25DaGFuZ2UgPSBudWxsIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlRhYnNcIj5cclxuXHRcdFx0e25hbWVzLm1hcCgobmFtZSwgaW5kZXgpID0+IChcclxuXHRcdFx0XHQ8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0YWIgYnV0dG9uIGgtMTAgcHgtM1wiIG9uQ2xpY2s9eyhlKSA9PiBvbkNsaWNrVGFiKGluZGV4LCBlKX0+XHJcblx0XHRcdFx0XHQ8c3Bhbj57bmFtZX08L3NwYW4+XHJcblx0XHRcdFx0PC9hPlxyXG5cdFx0XHQpKX1cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0Y29udGVudHMsXHJcblx0XHRzZWxlY3RUYWIsXHJcblx0fTtcclxuXHRjb25zdCAkdGFicyA9ICRyb290LmdldCgnLnRhYicpO1xyXG5cclxuXHRzZXQoKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIHNldCgpIHtcclxuXHRcdCRyb290LmFkZENsYXNzKCd2ZXJ0aWNhbCcsIHZlcnRpY2FsKTtcclxuXHRcdCRyb290LmdldCgnLnRhYicpLmFkZENsYXNzKCd2ZXJ0aWNhbCcsIHZlcnRpY2FsKTtcclxuXHRcdCRyb290LmdldCgnLnRhYicpLmFkZENsYXNzKCdob3Jpem9udGFsJywgIXZlcnRpY2FsKTtcclxuXHJcblx0XHQkdGFicy5mb3JFYWNoKCR0YWIgPT4ge1xyXG5cdFx0XHRpZiAoc3R5bGUpXHJcblx0XHRcdFx0JHRhYi5zdHlsZShzdHlsZSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBleGliZSBhIHByaW1laXJhIHRhYiBlIG9jdWx0YSBhcyBvdXRyYXNcclxuXHRcdGNvbnRlbnRzLmZvckVhY2goKCRjb250ZW50LCBpbmRleCkgPT4ge1xyXG5cdFx0XHRpZiAoaW5kZXggPiAwKVxyXG5cdFx0XHRcdCRjb250ZW50LmhpZGUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0VGFiKGluZGV4KSB7XHJcblx0XHQkdGFicy5mb3JFYWNoKCgkdGFiLCBfaW5kZXgpID0+IHtcclxuXHRcdFx0Ly8gdGFiXHJcblx0XHRcdCR0YWIuYWRkQ2xhc3MoJ2FjdGl2ZScsIGluZGV4ID09IF9pbmRleCk7XHJcblxyXG5cdFx0XHQvLyBjb250ZW50XHJcblx0XHRcdGNvbnN0ICRjb250ZW50ID0gY29udGVudHNbX2luZGV4XTtcclxuXHJcblx0XHRcdGlmICgkY29udGVudClcclxuXHRcdFx0XHQkY29udGVudC5zaG93KGluZGV4ID09IF9pbmRleCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAob25DaGFuZ2UpIG9uQ2hhbmdlKGluZGV4KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uQ2xpY2tUYWIoaW5kZXgsIGV2ZW50KSB7XHJcblx0XHRzZWxlY3RUYWIoaW5kZXgsIGV2ZW50KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYWJzO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgVGFza1BhZ2VHZW5lcmFsID0gKHsgdGFzaywgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0xMCAhcHktMTAgdy1bNjAwcHhdXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbCByZXF1aXJlZFwiPk5hbWU8L2Rpdj5cclxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibmFtZVwiIGNsYXNzPVwidy1mdWxsXCIgcmVxdWlyZWQgc3BlbGxjaGVjaz1cImZhbHNlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkRlc2NyaXB0aW9uPC9kaXY+XHJcblx0XHRcdFx0PHRleHRhcmVhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNsYXNzPVwidy1mdWxsICFtaW4taC0yM1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIG9uSW5wdXQ9e2UgPT4gZG9tKGUudGFyZ2V0KS5yZXNpemUoKX0+PC90ZXh0YXJlYT5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZCBwYXRoIGZsZXggZmxleC1jb2xcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWwgcmVxdWlyZWRcIj5EaXJlY3RvcnkgcGF0aDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy1bZml0LWNvbnRlbnQoMTAwJSlfMWZyXSBnYXAteC0xIGdhcC15LTFcIj5cclxuXHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG9uQ2xpY2s9e3NlbGVjdFBhdGh9IHRpdGxlPVwiU2VsZWN0IGZvbGRlclwiPlxyXG5cdFx0XHRcdFx0XHR7SWNvbignZm9sZGVyJyl9XHJcblx0XHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJwYXRoXCIgcmVxdWlyZWQgY2xhc3M9XCJ3LWZ1bGxcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiAvPlxyXG5cdFx0XHRcdFx0PHNwYW4+PC9zcGFuPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWRlc2NyaXB0aW9uXCI+RGlyZWN0b3J5IHBhdGggY29udGFpbmluZyB0aGUgZmlsZXMgdG8gYmUgb3B0aW1pemVkLjwvZGl2PlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+Q29udGVudDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWJhc2VsaW5lXCI+XHJcblx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJyYWRpbyBtYXgtdy1bMjAwcHhdXCI+XHJcblx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiY29udGVudFwiIHZhbHVlPVwicm9vdFwiIC8+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyYWRpby1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdFx0e3NoYXJlZC5jb25zdGFudHMuY29udGVudC5maW5kKHggPT4geC5uYW1lID09ICdyb290Jyk/LmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInJhZGlvLWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRcdFx0T3B0aW1pemVzIG9ubHkgdGhlIGZpbGVzIGluIHRoZSByb290IGRpcmVjdG9yeS5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwicmFkaW8gbWF4LXctWzIyMHB4XVwiPlxyXG5cdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImNvbnRlbnRcIiB2YWx1ZT1cImFsbFwiIC8+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyYWRpby1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdFx0e3NoYXJlZC5jb25zdGFudHMuY29udGVudC5maW5kKHggPT4geC5uYW1lID09ICdhbGwnKT8uZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmFkaW8tZGVzY3JpcHRpb25cIj5cclxuXHRcdFx0XHRcdFx0XHRPcHRpbWl6ZXMgYWxsIGZpbGVzIHdpdGhpbiB0aGUgZGlyZWN0b3J5LCBpbmNsdWRpbmcgZm9sZGVycyBhbmQgc3ViZm9sZGVycy5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZm9ybT5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0JHJvb3QuZ2V0KCdpbnB1dCwgdGV4dGFyZWEnKVxyXG5cdFx0XHQuYmluZERhdGEoeyBvYmplY3Q6IHRhc2sgfSlcclxuXHRcdFx0Lm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoa2V5ID09ICdwYXRoJykge1xyXG5cdFx0XHRcdFx0dGFzay5wYXRoID0gdmFsdWUucmVwbGFjZSgvXFxcXCskLywgJycpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHNlbGVjdFBhdGgoKSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLmZvbGRlclBpY2tlcignU2VsZWN0IGZvbGRlcicpO1xyXG5cclxuXHRcdGlmIChwYXRoKSB7XHJcblx0XHRcdHRhc2sucGF0aCA9IHBhdGg7XHJcblx0XHRcdCRyb290LmdldEJ5TmFtZSgncGF0aCcpLnZhbHVlKHBhdGgpO1xyXG5cdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2VHZW5lcmFsO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgQWN0aW9uQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvQWN0aW9uQmFyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcblxyXG5jb25zdCBUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlciA9ICh7IHRhc2ssIGZpbGVUeXBlQ29udHJvbHMsIHN0b3JlSXRlbSB9KSA9PiB7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0eyBuYW1lOiAnYWRkJywgdG9vbHRpcDogJ0FkZCBpdGVtJywgaWNvbjogSWNvbignYWRkJyksIG9uQ2xpY2s6IGFkZEl0ZW0gfSxcclxuXHRcdFx0eyBuYW1lOiAnbW92ZVVwJywgdG9vbHRpcDogJ01vdmUgdXAnLCBpY29uOiBJY29uKCd1cCcpLCBkaXNhYmxlZDogdHJ1ZSwgb25DbGljazogKCkgPT4gbW92ZUl0ZW0oJ3VwJykgfSxcclxuXHRcdFx0eyBuYW1lOiAnbW92ZURvd24nLCB0b29sdGlwOiAnTW92ZSBkb3duJywgaWNvbjogSWNvbignZG93bicpLCBkaXNhYmxlZDogdHJ1ZSwgb25DbGljazogKCkgPT4gbW92ZUl0ZW0oJ2Rvd24nKSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdjb3B5JywgdG9vbHRpcDogJ0NvcHknLCBpY29uOiBJY29uKCdjb3B5JyksIGRpc2FibGVkOiB0cnVlLCBvbkNsaWNrOiBjb3B5SXRlbXMgfSxcclxuXHRcdFx0eyBuYW1lOiAncGFzdGUnLCB0b29sdGlwOiAnUGFzdGUnLCBpY29uOiBJY29uKCdwYXN0ZScpLCBkaXNhYmxlZDogdHJ1ZSwgb25DbGljazogcGFzdGVJdGVtcyB9LFxyXG5cdFx0XHR7IG5hbWU6ICdkZWxldGUnLCB0b29sdGlwOiAnRGVsZXRlJywgaWNvbjogSWNvbigndHJhc2gnKSwgZGlzYWJsZWQ6IHRydWUsIG9uQ2xpY2s6IHJlbW92ZUl0ZW0gfSxcclxuXHRcdF1cclxuXHR9KTtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJhY3Rpb24tYmFyXCI+XHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHQ8Yj5TZWFyY2ggZmlsdGVyPC9iPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHR7YWN0aW9uQmFyLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZHQtcGxhY2VcIj48L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRleHQtWzAuOWVtXSBvcGFjaXR5LTc1IHB0LTJcIj5cclxuXHRcdFx0XHRFbmFibGUgdGhlIHNlYXJjaCBmaWx0ZXIgdG8gY3JlYXRlIHJ1bGUgc2V0cyB1c2luZyBtdWx0aXBsZSBwcm9wZXJ0aWVzLCB2YWx1ZXMsIGFuZCBjb25kaXRpb25zLiBXaGVuIHRoZSB0YXNrIHN0YXJ0cywgb25seSB0aGUgZmlsdGVyZWQgZmlsZXMgd2lsbCBiZSBvcHRpbWl6ZWQuIFRvIHRlc3QgYW5kIHZhbGlkYXRlIHRoZSBmaWx0ZXIsIGNsaWNrIHRoZSA8c3BhbiBjbGFzcz1cImZvbnQtc2VtaWJvbGRcIj5WaWV3IGZpbGVzPC9zcGFuPiBidXR0b24uXHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCBsZWZ0QnJhY2tldE9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIubGVmdEJyYWNrZXRPcHRpb25zO1xyXG5cdGNvbnN0IHJpZ2h0QnJhY2tldE9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIucmlnaHRCcmFja2V0T3B0aW9ucztcclxuXHRjb25zdCBwcm9wZXJ0eU9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIucHJvcGVydHlPcHRpb25zO1xyXG5cdGNvbnN0IGNvbmRpdGlvbk9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIuY29uZGl0aW9uT3B0aW9ucztcclxuXHRjb25zdCBvcGVyYXRvck9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIub3BlcmF0b3JPcHRpb25zO1xyXG5cdGNvbnN0IG51bWJlckNvbmRpdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIubnVtYmVyQ29uZGl0aW9ucztcclxuXHRjb25zdCBzdHJpbmdDb25kaXRpb25zID0gc2hhcmVkLmNvbnN0YW50cy5maWxlRmlsdGVyLnN0cmluZ0NvbmRpdGlvbnM7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0YWN0aW9uQmFyLFxyXG5cdFx0bG9hZCxcclxuXHR9O1xyXG5cdGxldCBfZmlsZVR5cGU7XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblxyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gc2V0RGF0YVRhYmxlKCkge1xyXG5cdFx0X2RhdGFUYWJsZSA9IERhdGFUYWJsZSh7XHJcblx0XHRcdHBsYWNlOiAkcm9vdC5nZXQoJy5kdC1wbGFjZScpLm5vZGVzWzBdLFxyXG5cdFx0XHRjaGVja2JveDogdHJ1ZSxcclxuXHRcdFx0c29ydDogZmFsc2UsXHJcblx0XHRcdHJlc2l6ZTogZmFsc2UsXHJcblx0XHRcdGJvcmRlcnM6IHtcclxuXHRcdFx0XHR0YWJsZToge1xyXG5cdFx0XHRcdFx0YWxsOiB0cnVlLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cm93czogdHJ1ZSxcclxuXHRcdFx0XHRjZWxsczogdHJ1ZSxcclxuXHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0J2JvcmRlci1jb2xvcic6ICcjY2NjJyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb2x1bW5zOiB7XHJcblx0XHRcdFx0bGVmdFBhcmVudGhlc2VzOiB7IGRpc3BsYXlOYW1lOiAnKCcsIHdpZHRoOiA0MCwgc3R5bGU6IHsgY29sb3I6ICcjNjY2JywgcGFkZGluZ0xlZnQ6IDExIH0gfSxcclxuXHRcdFx0XHRwcm9wZXJ0eTogeyBkaXNwbGF5TmFtZTogJ1Byb3BlcnR5Jywgd2lkdGg6IDE0MCwgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDExIH0gfSxcclxuXHRcdFx0XHRjb25kaXRpb246IHsgZGlzcGxheU5hbWU6ICdDb25kaXRpb24nLCB3aWR0aDogMTQwLCBzdHlsZTogeyBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdHZhbHVlOiB7IGRpc3BsYXlOYW1lOiAnVmFsdWUnLCB3aWR0aDogMjAwLCBzdHlsZTogeyBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdHJpZ2h0UGFyZW50aGVzZXM6IHsgZGlzcGxheU5hbWU6ICcpJywgd2lkdGg6IDQwLCBzdHlsZTogeyBjb2xvcjogJyM2NjYnLCBwYWRkaW5nTGVmdDogMTIgfSB9LFxyXG5cdFx0XHRcdG9wZXJhdG9yOiB7IGRpc3BsYXlOYW1lOiAnT3BlcmF0b3InLCB3aWR0aDogOTAsIHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxMSB9IH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiBmYWxzZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2VsbHM6IHtcclxuXHRcdFx0XHRsZWZ0UGFyZW50aGVzZXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwibGVmdFBhcmVudGhlc2VzXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRsZWZ0QnJhY2tldE9wdGlvbnMubWFwKHByb3AgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17cHJvcC5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwcm9wZXJ0eToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJwcm9wZXJ0eVwiIGNsYXNzPVwibm8taWNvbiBiLXRyYW5zcGFyZW50XCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlPcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0gZGF0YS10eXBlPXtwcm9wLmRhdGFUeXBlfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb25kaXRpb246IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwiY29uZGl0aW9uXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRjb25kaXRpb25PcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3Byb3AuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmllbGQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgaW5wdXRIaWRkZW4gPSA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ2YWx1ZVwiPjwvaW5wdXQ+O1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbnB1dE51bWJlciA9IDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIGNsYXNzPVwiYi10cmFuc3BhcmVudFwiIC8+O1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbnB1dERhdGUgPSA8aW5wdXQgdHlwZT1cImRhdGVcIiBjbGFzcz1cImItdHJhbnNwYXJlbnRcIiAvPjtcclxuXHRcdFx0XHRcdFx0Y29uc3QgdGV4dGFyZWEgPSA8dGV4dGFyZWEgZGF0YS10eXBlPVwic3RyaW5nXCIgcm93cz1cIjFcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiBjbGFzcz1cImItdHJhbnNwYXJlbnRcIj48L3RleHRhcmVhPjtcclxuXHJcblx0XHRcdFx0XHRcdGlucHV0SGlkZGVuLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGRvbShpbnB1dE51bWJlcikudmFsdWUodmFsdWUpLmhpZGUoKS5vbignaW5wdXQnLCAoeyBlbGVtZW50IH0pID0+IHVwZGF0ZUlucHV0SGlkZGVuKGVsZW1lbnQudmFsdWUoKSkpO1xyXG5cdFx0XHRcdFx0XHRkb20oaW5wdXREYXRlKS52YWx1ZSh2YWx1ZSkuaGlkZSgpLm9uKCdpbnB1dCcsICh7IGVsZW1lbnQgfSkgPT4gdXBkYXRlSW5wdXRIaWRkZW4oZWxlbWVudC52YWx1ZSgpKSk7XHJcblx0XHRcdFx0XHRcdGRvbSh0ZXh0YXJlYSkudmFsdWUodmFsdWUpLm9uKCdpbnB1dCcsICh7IGVsZW1lbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZUlucHV0SGlkZGVuKGVsZW1lbnQudmFsdWUoKSk7XHJcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5yZXNpemUoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZHNcIj5cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dEhpZGRlbn1cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dE51bWJlcn1cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dERhdGV9XHJcblx0XHRcdFx0XHRcdFx0XHR7dGV4dGFyZWF9XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbiB1cGRhdGVJbnB1dEhpZGRlbih2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlucHV0SGlkZGVuLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXRIaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JykpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cmlnaHRQYXJlbnRoZXNlczoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJyaWdodFBhcmVudGhlc2VzXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRyaWdodEJyYWNrZXRPcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3Byb3AuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmllbGQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0b3BlcmF0b3I6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwib3BlcmF0b3JcIiBjbGFzcz1cIm5vLWljb24gYi10cmFuc3BhcmVudFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdG9wZXJhdG9yT3B0aW9ucy5tYXAocHJvcCA9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPXtwcm9wLm5hbWV9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtwcm9wLmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR9PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpZWxkO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoIXJvdy5kYXRhKCkub3BlcmF0b3IpXHJcblx0XHRcdFx0XHRyb3cuZGF0YSh7IG9wZXJhdG9yOiAnYW5kJyB9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRlbmFibGVBY3Rpb25CYXJCdXR0b25zKHJvd3MubGVuZ3RoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25VcGRhdGVSb3c6ICh7IHJvdywgZmllbGRzIH0pID0+IHtcclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uUmVtb3ZlUm93czogKCkgPT4ge1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0XHRlbmFibGVBY3Rpb25CYXJCdXR0b25zKF9kYXRhVGFibGUuc2VsZWN0ZWRSb3dzKCkubGVuZ3RoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbG9hZChmaWxlVHlwZSkge1xyXG5cdFx0Y29uc3QgZmlsdGVyID0gdGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSBmaWxlVHlwZSkuZmlsdGVyO1xyXG5cclxuXHRcdF9maWxlVHlwZSA9IGZpbGVUeXBlO1xyXG5cclxuXHRcdCRyb290LmdldEJ5TmFtZSgnZW5hYmxlZCcpLmZpcnN0KCkuYmluZERhdGEoe1xyXG5cdFx0XHRvYmplY3Q6IGZpbHRlcixcclxuXHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0Ly8gaGFiaWxpdGEvZGVzYWJpbGl0YSBvIGZpbHRyb1xyXG5cdFx0XHRfZGF0YVRhYmxlLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0ZG9tKGFjdGlvbkJhci5lbGVtZW50KS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGxvYWRGaWx0ZXIoKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWRGaWx0ZXIoKSB7XHJcblx0XHRjb25zdCBpdGVtcyA9IHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gX2ZpbGVUeXBlKS5maWx0ZXIuaXRlbXM7XHJcblxyXG5cdFx0X2RhdGFUYWJsZS5sb2FkKGl0ZW1zKTtcclxuXHRcdGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiBiaW5kRGF0YShpdGVtLCBpbmRleCkpO1xyXG5cdFx0ZW5hYmxlQWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbmFibGVBY3Rpb25CYXJCdXR0b25zKGVuYWJsZSA9IHRydWUpIHtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ21vdmVVcCcpLmRpc2FibGUoIWVuYWJsZSk7XHJcblx0XHRhY3Rpb25CYXIuYnV0dG9uKCdtb3ZlRG93bicpLmRpc2FibGUoIWVuYWJsZSk7XHJcblx0XHRhY3Rpb25CYXIuYnV0dG9uKCdjb3B5JykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ3Bhc3RlJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ2RlbGV0ZScpLmRpc2FibGUoIWVuYWJsZSk7XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbmFibGVQYXN0ZUJ1dHRvbkZvckFsbEZpbHRlcnMoZW5hYmxlKSB7XHJcblx0XHRlbmFibGUgPSBlbmFibGUgfHwgc2hhcmVkLnRlbXAgJiYgc2hhcmVkLnRlbXAuc2VsZWN0ZWRGaWx0ZXJJdGVtcy5sZW5ndGg7XHJcblxyXG5cdFx0Zm9yIChsZXQgZmlsZVR5cGUgaW4gZmlsZVR5cGVDb250cm9scykge1xyXG5cdFx0XHRsZXQgZGF0YXRhYmxlRmlsdGVyID0gZmlsZVR5cGVDb250cm9sc1tmaWxlVHlwZV0uZmlsdGVyO1xyXG5cclxuXHRcdFx0ZGF0YXRhYmxlRmlsdGVyLmFjdGlvbkJhci5idXR0b24oJ3Bhc3RlJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW0oKSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogZmlsdGVySXRlbSB9ID0gYXdhaXQgd2ViQVBJLm5ld1Rhc2tGaWxlRmlsdGVySXRlbSgpO1xyXG5cclxuXHRcdF9kYXRhVGFibGUuYWRkUm93KGZpbHRlckl0ZW0pO1xyXG5cdFx0YmluZERhdGEoZmlsdGVySXRlbSwgX2RhdGFUYWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbW92ZUl0ZW0oZGlyZWN0aW9uKSB7XHJcblx0XHQvLyBkaXJlY3Rpb246IHN0cmluZyAodXAvZG93bilcclxuXHJcblx0XHRfZGF0YVRhYmxlLm1vdmVTZWxlY3RlZFJvd3MoZGlyZWN0aW9uID09ICdkb3duJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5SXRlbXMoKSB7XHJcblx0XHRsZXQgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoX2RhdGFUYWJsZS5zZWxlY3RlZFJvd3MoKS5tYXAocm93ID0+IHJvdy5kYXRhKCkpKTtcclxuXHJcblx0XHRzaGFyZWQudGVtcCA9IHtcclxuXHRcdFx0c2VsZWN0ZWRGaWx0ZXJJdGVtczogY2xvbmVcclxuXHRcdH07XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwYXN0ZUl0ZW1zKCkge1xyXG5cdFx0aWYgKHNoYXJlZC50ZW1wICYmIHNoYXJlZC50ZW1wLnNlbGVjdGVkRmlsdGVySXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gX2ZpbGVUeXBlKS5maWx0ZXIuaXRlbXMucHVzaCguLi5zaGFyZWQudGVtcC5zZWxlY3RlZEZpbHRlckl0ZW1zKTtcclxuXHRcdFx0bG9hZEZpbHRlcigpO1xyXG5cdFx0XHRzaGFyZWQudGVtcCA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZUl0ZW0oKSB7XHJcblx0XHRfZGF0YVRhYmxlLnJlbW92ZVNlbGVjdGVkUm93cygpO1xyXG5cclxuXHRcdC8vIGFkaWNpb25hIHVtIGl0ZW0gdmF6aW8gc2UgdHVkbyBmb3IgZGVsZXRhZG9cclxuXHRcdGlmICghX2RhdGFUYWJsZS5yb3dzLmxlbmd0aClcclxuXHRcdFx0YWRkSXRlbSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmluZERhdGEoZmlsdGVySXRlbSwgcm93SW5kZXgpIHtcclxuXHRcdGxldCAkcm93ID0gZG9tKF9kYXRhVGFibGUucm93c1tyb3dJbmRleF0uZWxlbWVudCk7XHJcblxyXG5cdFx0JHJvdy5nZXQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0JykuYmluZERhdGEoe1xyXG5cdFx0XHRvYmplY3Q6IGZpbHRlckl0ZW0sXHJcblx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdGlmIChrZXkgPT0gJ3Byb3BlcnR5Jykge1xyXG5cdFx0XHRcdHNldEZpZWxkcyh7IGtleSwgZmllbGQsIGZpZWxkcywgZXZlbnQgfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RmllbGRzKHsga2V5LCBmaWVsZCwgZmllbGRzLCBldmVudCB9KSB7XHJcblx0XHRpZiAoa2V5ID09ICdwcm9wZXJ0eScpIHtcclxuXHRcdFx0Y29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gZmllbGQubm9kZXNbMF0uc2VsZWN0ZWRPcHRpb25zO1xyXG5cclxuXHRcdFx0aWYgKHNlbGVjdGVkT3B0aW9ucy5sZW5ndGgpIHtcclxuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eURhdGFUeXBlID0gc2VsZWN0ZWRPcHRpb25zWzBdLmRhdGFzZXQudHlwZTtcclxuXHJcblx0XHRcdFx0Ly8gQ29uZGl0aW9uIC0gZXhpYmUvb2N1bHRhIGFzIG9wXHUwMEU3XHUwMEY1ZXMgY29ycmV0YXMgcGVsYSBwcm9wcmllZGFkZSBzZWxlY2lvbmFkYVxyXG5cdFx0XHRcdGZpZWxkcy5jb25kaXRpb24uZ2V0KCdvcHRpb24nKS5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBjb25kaXRpb25zID0gcHJvcGVydHlEYXRhVHlwZSA9PSAnbnVtYmVyJyB8fCBwcm9wZXJ0eURhdGFUeXBlID09ICdkYXRlJyA/IG51bWJlckNvbmRpdGlvbnMgOiBzdHJpbmdDb25kaXRpb25zO1xyXG5cdFx0XHRcdFx0bGV0IHNob3cgPSBjb25kaXRpb25zLnNvbWUoeCA9PiB4ID09IG9wdGlvbi52YWx1ZSgpKTtcclxuXHJcblx0XHRcdFx0XHRvcHRpb24uc2hvdyhzaG93KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIXNob3cgJiYgb3B0aW9uLnZhbHVlKCkgPT0gZmllbGRzLmNvbmRpdGlvbi52YWx1ZSgpKVxyXG5cdFx0XHRcdFx0XHRmaWVsZHMuY29uZGl0aW9uLnZhbHVlKCcnKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0Ly8gVmFsdWUgLSBleGliZSB1bSBkb3MgY2FtcG9zIChpbnB1dDpudW1iZXIsIGlucHV0OmRhdGUgb3UgdGV4dGFyZWEpIHBlbG8gbyB0aXBvIGRlIGRhZG9cclxuXHRcdFx0XHRmaWVsZHMudmFsdWUucGFyZW50KCkuZ2V0KCcqJykuaGlkZSgpLmZvckVhY2goZmllbGQgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRmaWVsZC5hdHRyKCd0eXBlJykgPT0gcHJvcGVydHlEYXRhVHlwZSB8fFxyXG5cdFx0XHRcdFx0XHRmaWVsZC5hdHRyKCdkYXRhLXR5cGUnKSA9PSBwcm9wZXJ0eURhdGFUeXBlXHJcblx0XHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcdFx0ZmllbGRzLnZhbHVlLnZhbHVlKCcnKTtcclxuXHRcdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSgnJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnNob3coKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgVGFicyBmcm9tICcuLi9jb21wb25lbnRzL1RhYnMnO1xyXG5pbXBvcnQgVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIgZnJvbSAnLi9UYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlcic7XHJcblxyXG5jb25zdCBUYXNrUGFnZUZpbGVTZXR0aW5ncyA9ICh7IHRhc2ssIHRhYkluZGV4ID0gMCwgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCBfZmlsZVR5cGVDb250cm9scyA9IHt9O1xyXG5cdGNvbnN0IHRhYnMgPSBUYWJzKHtcclxuXHRcdG5hbWVzOiBzaGFyZWQuY29uc3RhbnRzLmZpbGVUeXBlcy5tYXAodHlwZSA9PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXJcIj5cclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiIG9uQ2xpY2s9e2UgPT4gZS5wcmV2ZW50RGVmYXVsdCgpfT5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZmlsZVR5cGVcIiB2YWx1ZT17dHlwZS5uYW1lfSBvbkNsaWNrPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9IC8+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHQ8Yj57dHlwZS5kaXNwbGF5TmFtZX08L2I+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0KSxcclxuXHRcdHN0eWxlOiB7XHJcblx0XHRcdCdwYWRkaW5nLWxlZnQnOiA4LFxyXG5cdFx0fSxcclxuXHRcdG9uQ2hhbmdlOiBpbmRleCA9PiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFiVHlwZUluZGV4JywgaW5kZXgpXHJcblx0fSk7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxmb3JtIGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMTAgIXB5LTEwXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sXCI+XHJcblx0XHRcdFx0PGI+VHlwZXM8L2I+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRleHQtWzAuOWVtXSBvcGFjaXR5LTc1IHB0LTFcIj5cclxuXHRcdFx0XHRcdFNlbGVjdCB0aGUgZmlsZSB0eXBlcyB0byBiZSBvcHRpbWl6ZWQuXHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInB5LTMgYm9yZGVyLWItMSBib3JkZXItZ3JheS0zMDBcIj5cclxuXHRcdFx0XHRcdHt0YWJzLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHR7c2hhcmVkLmNvbnN0YW50cy5maWxlVHlwZXMubWFwKHR5cGUgPT4ge1xyXG5cdFx0XHRcdGxldCBmaWx0ZXIgPSBUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlcih7IHRhc2ssIGZpbGVUeXBlQ29udHJvbHM6IF9maWxlVHlwZUNvbnRyb2xzLCBzdG9yZUl0ZW0gfSk7XHJcblx0XHRcdFx0bGV0IGVsZW1lbnQgPSAoXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBnYXAtMTJcIj5cclxuXHRcdFx0XHRcdFx0PHNlY3Rpb24gY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC02IG1pbi13LVsyODBweF0gbWF4LXctWzI4MHB4XVwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTUgdy1mdWxsXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxiPlF1YWxpdHk8L2I+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicmFuZ2VcIiBtaW49XCIwXCIgbWF4PVwiMTAwXCIgc3RlcD1cIjVcIiBuYW1lPVwicXVhbGl0eVwiIGNsYXNzPVwicmFuZ2VcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInF1YWxpdHktdmFsdWVcIj48L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0ZXh0LVswLjllbV0gb3BhY2l0eS03NSBwdC0xXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFRoZSBsb3dlciB0aGUgcXVhbGl0eSwgdGhlIHNtYWxsZXIgdGhlIGZpbGUgc2l6ZS4gRmluZCB0aGUgcmlnaHQgYmFsYW5jZS5cclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGdhcC02IG1heFdpZHRoXCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveCBtdC1bMC42ZW1dXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PGI+TWF4LiB3aWR0aCAocHgpPC9iPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0TGltaXRzIHRoZSB3aWR0aCBvZiBpbWFnZXMgdGhhdCBleGNlZWQgdGhlIHNwZWNpZmllZCB3aWR0aC4gTm90ZTogRG9lcyBub3QgYWZmZWN0IGltYWdlcyBzbWFsbGVyIHRoYW4gdGhlIHNwZWNpZmllZCB3aWR0aC5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJudW1iZXJcIiBtaW49XCIwXCIgbmFtZT1cInZhbHVlXCIgY2xhc3M9XCJtaW4tdy1bNmVtXVwiIC8+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZ2FwLTYgY29udmVydFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3ggbXQtWzAuNmVtXVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxiPkNvbnZlcnQgdG88L2I+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtZGVzY3JpcHRpb25cIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRDb252ZXJ0cyB0aGUgb3JpZ2luYWwgaW1hZ2UgdG8gdGhlIHNwZWNpZmllZCB0eXBlLiBOb3RlOiBUaGlzIHdpbGwgbm90IGNyZWF0ZSBhIG5ldyBpbWFnZS5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwidHlwZVwiIGNsYXNzPVwibWluLXctWzZlbV1cIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbj48L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0e3NoYXJlZC5jb25zdGFudHMuZmlsZVR5cGVzLm1hcChfdHlwZSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF90eXBlLm5hbWUgIT0gdHlwZS5uYW1lKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIDxvcHRpb24gdmFsdWU9e190eXBlLm5hbWV9PntfdHlwZS5uYW1lLnRvVXBwZXJDYXNlKCl9PC9vcHRpb24+O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9KX1cclxuXHRcdFx0XHRcdFx0XHRcdDwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L3NlY3Rpb24+XHJcblx0XHRcdFx0XHRcdDxzZWN0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdHtmaWx0ZXIuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHRcdFx0PC9zZWN0aW9uPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0ZWxlbWVudCA9IGRvbShlbGVtZW50KTtcclxuXHJcblx0XHRcdFx0X2ZpbGVUeXBlQ29udHJvbHNbdHlwZS5uYW1lXSA9IHtcclxuXHRcdFx0XHRcdGVsZW1lbnQsXHJcblx0XHRcdFx0XHRmaWx0ZXIsXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHR0YWJzLmNvbnRlbnRzLnB1c2goZWxlbWVudCk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBlbGVtZW50Lm5vZGVzWzBdO1xyXG5cdFx0XHR9KX1cclxuXHRcdDwvZm9ybT5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0dGFicy5zZWxlY3RUYWIodGFiSW5kZXgpO1xyXG5cclxuXHRcdHRhYnMuZWxlbWVudC5nZXRCeU5hbWUoJ2ZpbGVUeXBlJykuZm9yRWFjaCgkZmlsZVR5cGUgPT4ge1xyXG5cdFx0XHRjb25zdCB0eXBlID0gJGZpbGVUeXBlLnZhbHVlKCk7XHJcblx0XHRcdGNvbnN0IGVsZW1lbnQgPSBfZmlsZVR5cGVDb250cm9sc1t0eXBlXS5lbGVtZW50O1xyXG5cdFx0XHRjb25zdCBmaWxlVHlwZSA9IHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gdHlwZSk7XHJcblxyXG5cdFx0XHQkZmlsZVR5cGUuYmluZERhdGEoe1xyXG5cdFx0XHRcdGtleTogJ2VuYWJsZWQnLFxyXG5cdFx0XHRcdG9iamVjdDogZmlsZVR5cGUsXHJcblx0XHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRkb20oZWxlbWVudCkuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHR5cGUgaW4gX2ZpbGVUeXBlQ29udHJvbHMpIHtcclxuXHRcdFx0Y29uc3QgZWxlbWVudCA9IF9maWxlVHlwZUNvbnRyb2xzW3R5cGVdLmVsZW1lbnQ7XHJcblx0XHRcdGNvbnN0IGZpbGVUeXBlID0gdGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSB0eXBlKTtcclxuXHJcblx0XHRcdC8vIFF1YWxpdHlcclxuXHRcdFx0ZWxlbWVudC5nZXRCeU5hbWUoWydxdWFsaXR5J10pLmJpbmREYXRhKHtcclxuXHRcdFx0XHRvYmplY3Q6IGZpbGVUeXBlLFxyXG5cdFx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZmllbGQucGFyZW50KCkuZ2V0KCcucXVhbGl0eS12YWx1ZScpLnRleHQodmFsdWUgKyAnJScpO1xyXG5cdFx0XHRcdGZpbGVUeXBlLnF1YWxpdHkgPSBOdW1iZXIodmFsdWUpO1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBNYXguIHdpZHRoIChweClcclxuXHRcdFx0ZWxlbWVudC5nZXQoJy5tYXhXaWR0aCBpbnB1dCcpLmJpbmREYXRhKHtcclxuXHRcdFx0XHRvYmplY3Q6IGZpbGVUeXBlLm1heFdpZHRoLFxyXG5cdFx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0aWYgKGtleSA9PSAnZW5hYmxlZCcpIHtcclxuXHRcdFx0XHRcdGZpZWxkcy52YWx1ZS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoa2V5ID09ICd2YWx1ZScpIHtcclxuXHRcdFx0XHRcdGZpbGVUeXBlLm1heFdpZHRoLnZhbHVlID0gTnVtYmVyKHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBDb252ZXJ0IHRvXHJcblx0XHRcdGVsZW1lbnQuZ2V0KCcuY29udmVydCcpLmdldCgnaW5wdXQsIHNlbGVjdCcpLmJpbmREYXRhKHtcclxuXHRcdFx0XHRvYmplY3Q6IGZpbGVUeXBlLmNvbnZlcnQsXHJcblx0XHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoa2V5ID09ICdlbmFibGVkJykge1xyXG5cdFx0XHRcdFx0ZmllbGRzLnR5cGUuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIEZpbHRlclxyXG5cdFx0XHRfZmlsZVR5cGVDb250cm9sc1t0eXBlXS5maWx0ZXIubG9hZCh0eXBlKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZUZpbGVTZXR0aW5ncztcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuXHJcbmNvbnN0IFRhc2tQYWdlU2NoZWR1bGUgPSAoeyB0YXNrLCBzdG9yZUl0ZW0gfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8Zm9ybSBjbGFzcz1cIlRhc2tQYWdlU2NoZWR1bGUgZmxleCBmbGV4LWNvbCBnYXAtMTAgIXB5LTEwXCI+XHJcblx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94IGVuYWJsZWRcIj5cclxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lXCI+XHJcblx0XHRcdFx0XHQ8Yj5FbmFibGVkPC9iPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1kZXNjcmlwdGlvblwiPlxyXG5cdFx0XHRcdFx0U2VsZWN0IHRoZSBkYXlzIG9mIHRoZSB3ZWVrLCBhbmQgc3BlY2lmeSB0aGUgc3RhcnQgdGltZXMgYW5kIHJlY3VycmVuY2UgZm9yIHRoZSB0YXNrIGV4ZWN1dGlvbi5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0PHRhYmxlPlxyXG5cdFx0XHRcdDx0aGVhZD5cclxuXHRcdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdFx0PHRoPkFsd2F5cyBydW48L3RoPlxyXG5cdFx0XHRcdFx0XHQ8dGg+U3RhcnQgb24gdGltZTwvdGg+XHJcblx0XHRcdFx0XHRcdDx0aCBjb2xzcGFuPVwiM1wiPlJlcGVhdCBldmVyeTwvdGg+XHJcblx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdDwvdGhlYWQ+XHJcblx0XHRcdFx0PHRib2R5PntcclxuXHRcdFx0XHRcdHNoYXJlZC5jb25zdGFudHMud2Vla2RheXMubWFwKGRheSA9PlxyXG5cdFx0XHRcdFx0XHQ8dHI+XHJcblx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIiB0aXRsZT1cIkVuYWJsZS9EaXNhYmxlXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlZFwiIC8+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e2RheS5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJ0aW1lXCIgbmFtZT1cInN0YXJ0VGltZVwiIC8+XHJcblx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHQ8dGQgY2xhc3M9XCJyZXBlYXRcIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwicmVwZWF0XCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicmVwZWF0VGltZVZhbHVlXCIgbWluPVwiMVwiIHN0ZXA9XCIxXCIgcGF0dGVybj1cIlxcZCpcIiBvbklucHV0PXtvbklucHV0UmVwZWF0VmFsdWV9IG9uQ2hhbmdlPXtvbkNoYW5nZVJlcGVhdFZhbHVlfSAvPlxyXG5cdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwicmVwZWF0VGltZVVuaXRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNoYXJlZC5jb25zdGFudHMucmVwZWF0VGltZVVuaXQubWFwKHVuaXQgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPXt1bml0Lm5hbWV9Pnt1bml0LmRpc3BsYXlOYW1lfTwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0XHR9PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0PC90cj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9PC90Ym9keT5cclxuXHRcdFx0PC90YWJsZT5cclxuXHRcdDwvZm9ybT5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0Ly8gU3RhcnQgdGFzayBvblxyXG5cdFx0JHJvb3QuZ2V0KCcuZW5hYmxlZCcpLmdldEJ5TmFtZShbXHJcblx0XHRcdCdlbmFibGVkJyxcclxuXHRcdF0pLmJpbmREYXRhKHtcclxuXHRcdFx0b2JqZWN0OiB0YXNrLnNjaGVkdWxlLFxyXG5cdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRpZiAoa2V5ID09ICdlbmFibGVkJykge1xyXG5cdFx0XHRcdCRyb290LmdldCgndGFibGUnKS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGNhbXBvcyBkYSB0YWJlbGFcclxuXHRcdCRyb290LmdldCgndGJvZHkgdHInKS5mb3JFYWNoKCgkcm93LCBpbmRleCkgPT4ge1xyXG5cdFx0XHRjb25zdCB3ZWVrZGF5ID0gdGFzay5zY2hlZHVsZS53ZWVrZGF5c1tpbmRleF07XHJcblxyXG5cdFx0XHQkcm93LmdldEJ5TmFtZShbXHJcblx0XHRcdFx0J2VuYWJsZWQnLFxyXG5cdFx0XHRcdCdzdGFydFRpbWUnLFxyXG5cdFx0XHRcdCdyZXBlYXQnLFxyXG5cdFx0XHRcdCdyZXBlYXRUaW1lVmFsdWUnLFxyXG5cdFx0XHRcdCdyZXBlYXRUaW1lVW5pdCcsXHJcblx0XHRcdF0pLmJpbmREYXRhKHtcclxuXHRcdFx0XHRvYmplY3Q6IHdlZWtkYXksXHJcblx0XHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoa2V5ID09ICdlbmFibGVkJykge1xyXG5cdFx0XHRcdFx0bGV0IGNoZWNrZWQxID0gdmFsdWU7XHJcblx0XHRcdFx0XHRsZXQgY2hlY2tlZDIgPSBjaGVja2VkMSAmJiBmaWVsZHMucmVwZWF0LmF0dHIoJ2NoZWNrZWQnKTtcclxuXHJcblx0XHRcdFx0XHRmaWVsZHMucmVwZWF0LnBhcmVudCgpLmRpc2FibGUoIWNoZWNrZWQxKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5zdGFydFRpbWUuZGlzYWJsZSghY2hlY2tlZDEpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLnJlcGVhdFRpbWVWYWx1ZS5kaXNhYmxlKCFjaGVja2VkMik7XHJcblx0XHRcdFx0XHRmaWVsZHMucmVwZWF0VGltZVVuaXQuZGlzYWJsZSghY2hlY2tlZDIpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGtleSA9PSAncmVwZWF0JyAmJiBldmVudCkge1xyXG5cdFx0XHRcdFx0bGV0IGNoZWNrZWQyID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0ZmllbGRzLnJlcGVhdFRpbWVWYWx1ZS5kaXNhYmxlKCFjaGVja2VkMik7XHJcblx0XHRcdFx0XHRmaWVsZHMucmVwZWF0VGltZVVuaXQuZGlzYWJsZSghY2hlY2tlZDIpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGtleSA9PSAncmVwZWF0VGltZVZhbHVlJykge1xyXG5cdFx0XHRcdFx0d2Vla2RheS5yZXBlYXRUaW1lVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25JbnB1dFJlcGVhdFZhbHVlKGV2ZW50KSB7XHJcblx0XHQvLyBzb21lbnRlIG51bWVyb3MgaW50ZWlyb3NcclxuXHRcdGV2ZW50LnRhcmdldC52YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXEQvZywgJycpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25DaGFuZ2VSZXBlYXRWYWx1ZShldmVudCkge1xyXG5cdFx0bGV0IGRlZmF1bHRWYWx1ZSA9IDE7XHJcblxyXG5cdFx0ZXZlbnQudGFyZ2V0LnZhbHVlID0gTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkgfHwgZGVmYXVsdFZhbHVlO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlU2NoZWR1bGU7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgVGFza1BhZ2VFeGNlcHRpb25zID0gKHsgdGFzaywgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJUYXNrUGFnZUV4Y2VwdGlvbnMgZmxleCBmbGV4LWNvbCBnYXAtMTAgIXB5LTEwXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWVcIj5cclxuXHRcdFx0XHRcdFx0PGI+RW5hYmxlZDwvYj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LWRlc2NyaXB0aW9uXCI+XHJcblx0XHRcdFx0XHRcdFNwZWNpZnkgdGhlIGRpcmVjdG9yeSBwYXRocyB0byBiZSBleGNsdWRlZCBmcm9tIHRoZSBvcHRpbWl6YXRpb24gc2VydmljZS5cclxuXHRcdFx0XHRcdFx0PGJyLz5Gb3IgZWFjaCBzcGVjaWZpZWQgcGF0aCwgc2VsZWN0IHRoZSBwcm90ZWN0aW9uIHR5cGUuXHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlXCI+XHJcblx0XHRcdFx0PHRhYmxlPlxyXG5cdFx0XHRcdFx0PHRoZWFkPlxyXG5cdFx0XHRcdFx0XHQ8dHI+XHJcblx0XHRcdFx0XHRcdFx0PHRoIGNvbHNwYW49XCIyXCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uXCI+UGF0aDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvdGg+XHJcblx0XHRcdFx0XHRcdFx0PHRoPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtblwiPlByb3RlY3Q8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8L3RoPlxyXG5cdFx0XHRcdFx0XHRcdDx0aD5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW5cIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgb25DbGljaz17YWRkSXRlbX0gdGl0bGU9XCJBZGRcIj57SWNvbignYWRkJyl9PC9idXR0b24+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8L3RoPlxyXG5cdFx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdFx0PC90aGVhZD5cclxuXHRcdFx0XHRcdDx0Ym9keT57XHJcblx0XHRcdFx0XHRcdHRhc2suZXhjZXB0aW9ucy5pdGVtcy5tYXAoKGV4Y2VwdGlvbiwgaW5kZXgpID0+XHJcblx0XHRcdFx0XHRcdFx0PHRyPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiIHRpdGxlPVwiRW5hYmxlL0Rpc2FibGVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgbmFtZT1cImJ1dHRvblBhdGhcIiBvbkNsaWNrPXsoKSA9PiBzZWxlY3RQYXRoKGV4Y2VwdGlvbiwgaW5kZXgpfSB0aXRsZT1cIlNlbGVjdCBmb2xkZXJcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtJY29uKCdmb2xkZXInKX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicGF0aFwiIGNsYXNzPVwidy1bNTUwcHhdXCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJjb250ZW50XCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT1cInJvb3RcIiBzZWxlY3RlZD5Sb290IGZpbGVzPC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT1cImFsbFwiPkFsbCBkaXJlY3Rvcnk8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTBcIiBuYW1lPVwiYnV0dG9uRGVsZXRlXCIgb25DbGljaz17ZSA9PiBkZWxldGVJdGVtKGV4Y2VwdGlvbiwgZSl9IHRpdGxlPVwiRGVsZXRlXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e0ljb24oJ3RyYXNoJyl9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHR9PC90Ym9keT5cclxuXHRcdFx0XHQ8L3RhYmxlPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZm9ybT5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0JHJvb3QuZ2V0KCdbbmFtZT1lbmFibGVkXScpLmZpcnN0KClcclxuXHRcdFx0LmJpbmREYXRhKHsgb2JqZWN0OiB0YXNrLmV4Y2VwdGlvbnMgfSlcclxuXHRcdFx0Lm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHQkcm9vdC5nZXQoJy50YWJsZScpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdGNvbnN0ICR0ciA9ICRyb290LmdldCgndGJvZHkgdHInKTtcclxuXHJcblx0XHR0YXNrLmV4Y2VwdGlvbnMuaXRlbXMuZm9yRWFjaCgoZXhjZXB0aW9uLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRiaW5kSXRlbSgkdHIuYXQoaW5kZXgpLCBleGNlcHRpb24pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRJdGVtKCkge1xyXG5cdFx0Y29uc3QgJHRib2R5ID0gJHJvb3QuZ2V0KCd0Ym9keScpO1xyXG5cdFx0Y29uc3QgJHRyID0gJHRib2R5LmdldCgndHInKS5maXJzdCgpLmNsb25lKCk7XHJcblx0XHRjb25zdCBleGNlcHRpb24gPSB7XHJcblx0XHRcdGVuYWJsZWQ6IHRydWUsXHJcblx0XHRcdHBhdGg6ICcnLFxyXG5cdFx0XHRjb250ZW50OiAncm9vdCcsXHJcblx0XHR9O1xyXG5cclxuXHRcdCR0Ym9keS5pbnNlcnQoJHRyKTtcclxuXHRcdGJpbmRJdGVtKCR0ciwgZXhjZXB0aW9uKTtcclxuXHRcdHRhc2suZXhjZXB0aW9ucy5pdGVtcy5wdXNoKGV4Y2VwdGlvbik7XHJcblx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblxyXG5cdFx0Ly8gZXZlbnRvc1xyXG5cdFx0JHRyLmdldCgnW25hbWU9YnV0dG9uUGF0aF0nKS5vbignY2xpY2snLCAoKSA9PlxyXG5cdFx0XHRzZWxlY3RQYXRoKGV4Y2VwdGlvbiwgJHRyLmF0dHIoJ3Jvd0luZGV4JykgLSAxKVxyXG5cdFx0KTtcclxuXHJcblx0XHQkdHIuZ2V0KCdbbmFtZT1idXR0b25EZWxldGVdJykub24oJ2NsaWNrJywgKHsgZXZlbnQgfSkgPT5cclxuXHRcdFx0ZGVsZXRlSXRlbShleGNlcHRpb24sIGV2ZW50KVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHNlbGVjdFBhdGgoZXhjZXB0aW9uLCBpbmRleCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHBhdGggfSA9IGF3YWl0IHdlYkFQSS5mb2xkZXJQaWNrZXIoJ1NlbGVjdCBmb2xkZXInKTtcclxuXHJcblx0XHRpZiAocGF0aCkge1xyXG5cdFx0XHRsZXQgJHBhdGggPSAkcm9vdC5nZXQoJ1tuYW1lPXBhdGhdJykuYXQoaW5kZXgpO1xyXG5cclxuXHRcdFx0JHBhdGgudmFsdWUocGF0aCk7XHJcblx0XHRcdGV4Y2VwdGlvbi5wYXRoID0gcGF0aDtcclxuXHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVsZXRlSXRlbShleGNlcHRpb24sIGUpIHtcclxuXHRcdGxldCAkdHIgPSBkb20oZS50YXJnZXQuY2xvc2VzdCgndHInKSk7XHJcblxyXG5cdFx0aWYgKCRyb290LmdldCgndGJvZHkgdHInKS5sZW5ndGggPiAxKSB7XHJcblx0XHRcdHRhc2suZXhjZXB0aW9ucy5pdGVtcyA9IHRhc2suZXhjZXB0aW9ucy5pdGVtcy5maWx0ZXIoKHgsIGkpID0+IGkgIT0gJHRyLmF0dHIoJ3Jvd0luZGV4JykgLSAxKTtcclxuXHRcdFx0JHRyLnJlbW92ZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gbWFudGVtIGUgbGltcGEgbyBcdTAwRkFsdGltb1xyXG5cdFx0XHRleGNlcHRpb24uZW5hYmxlZCA9IHRydWU7XHJcblx0XHRcdGV4Y2VwdGlvbi5wYXRoID0gJyc7XHJcblx0XHRcdGV4Y2VwdGlvbi5jb250ZW50ID0gJ3Jvb3QnO1xyXG5cclxuXHRcdFx0JHRyLmdldCgnW25hbWU9ZW5hYmxlZF0nKS5hdHRyKCdjaGVja2VkJywgZXhjZXB0aW9uLmVuYWJsZWQpO1xyXG5cdFx0XHQkdHIuZ2V0KCdbbmFtZT1wYXRoXScpLnZhbHVlKGV4Y2VwdGlvbi5wYXRoKTtcclxuXHRcdFx0JHRyLmdldCgnW25hbWU9Y29udGVudF0nKS52YWx1ZShleGNlcHRpb24uY29udGVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmluZEl0ZW0oJHRyLCBvYmopIHtcclxuXHRcdCR0ci5nZXQoJ2lucHV0LCBzZWxlY3QsIGJ1dHRvbicpXHJcblx0XHRcdC5iaW5kRGF0YSh7IG9iamVjdDogb2JqIH0pXHJcblx0XHRcdC5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0aWYgKGtleSA9PSAncGF0aCcpIHtcclxuXHRcdFx0XHRcdG9iai5wYXRoID0gdmFsdWUucmVwbGFjZSgvXFxcXCskLywgJycpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGtleSA9PSAnZW5hYmxlZCcpIHtcclxuXHRcdFx0XHRcdCR0ci5nZXQoJ1tuYW1lPWJ1dHRvblBhdGhdJykuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdFx0JHRyLmdldCgnW25hbWU9YnV0dG9uRGVsZXRlXScpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5wYXRoLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5jb250ZW50LmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2VFeGNlcHRpb25zO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJy4uL3NlcnZpY2VzL1JvdXRlclNlcnZpY2UnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vbGliL1V0aWxzJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IFRvYXN0IGZyb20gJy4uL2xpYi9Ub2FzdC9Ub2FzdCc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcbmltcG9ydCBQYWdlSGVhZGVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZUhlYWRlcic7XHJcbmltcG9ydCBUYWJzIGZyb20gJy4uL2NvbXBvbmVudHMvVGFicyc7XHJcbmltcG9ydCBUYXNrUGFnZUdlbmVyYWwgZnJvbSAnLi9UYXNrUGFnZUdlbmVyYWwnO1xyXG5pbXBvcnQgVGFza1BhZ2VGaWxlU2V0dGluZ3MgZnJvbSAnLi9UYXNrUGFnZUZpbGVTZXR0aW5ncyc7XHJcbmltcG9ydCBUYXNrUGFnZVNjaGVkdWxlIGZyb20gJy4vVGFza1BhZ2VTY2hlZHVsZSc7XHJcbmltcG9ydCBUYXNrUGFnZUV4Y2VwdGlvbnMgZnJvbSAnLi9UYXNrUGFnZUV4Y2VwdGlvbnMnO1xyXG5cclxuY29uc3QgVGFza1BhZ2UgPSBhc3luYyAoKSA9PiB7XHJcblx0bGV0IF9zdG9yZWRUYXNrO1xyXG5cdGxldCBfdGFiSW5kZXg7XHJcblx0bGV0IF90YWJUeXBlSW5kZXg7XHJcblxyXG5cdHNldFN0b3JhZ2UoKTtcclxuXHJcblx0Y29uc3QgX2lkID0gcm91dGVyLmN1cnJlbnQudGFyZ2V0O1xyXG5cdGNvbnN0IF90YXNrID0gYXdhaXQgZ2V0VGFzaygpO1xyXG5cclxuXHRjb25zdCBoZWFkZXIgPSBQYWdlSGVhZGVyKHsgb25DbGlja0JhY2tCdXR0b246IGJhY2sgfSk7XHJcblx0Y29uc3QgZ2VuZXJhbCA9IFRhc2tQYWdlR2VuZXJhbCh7IHRhc2s6IF90YXNrLCBzdG9yZUl0ZW0gfSk7XHJcblx0Y29uc3QgZmlsZVNldHRpbmdzID0gVGFza1BhZ2VGaWxlU2V0dGluZ3MoeyB0YXNrOiBfdGFzaywgdGFiSW5kZXg6IF90YWJUeXBlSW5kZXggfHwgMCwgc3RvcmVJdGVtIH0pO1xyXG5cdGNvbnN0IHNjaGVkdWxlID0gVGFza1BhZ2VTY2hlZHVsZSh7IHRhc2s6IF90YXNrLCBzdG9yZUl0ZW0gfSk7XHJcblx0Y29uc3QgZXhjZXB0aW9ucyA9IFRhc2tQYWdlRXhjZXB0aW9ucyh7IHRhc2s6IF90YXNrLCBzdG9yZUl0ZW0gfSk7XHJcblx0Y29uc3QgdGFicyA9IFRhYnMoe1xyXG5cdFx0bmFtZXM6IFsnR2VuZXJhbCcsICdGaWxlIHNldHRpbmdzJywgJ1NjaGVkdWxpbmcnLCAnRXhjZXB0aW9ucyddLFxyXG5cdFx0Y29udGVudHM6IFtcclxuXHRcdFx0Z2VuZXJhbC5lbGVtZW50LFxyXG5cdFx0XHRmaWxlU2V0dGluZ3MuZWxlbWVudCxcclxuXHRcdFx0c2NoZWR1bGUuZWxlbWVudCxcclxuXHRcdFx0ZXhjZXB0aW9ucy5lbGVtZW50LFxyXG5cdFx0XSxcclxuXHRcdG9uQ2hhbmdlOiBpbmRleCA9PiB7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWJJbmRleCcsIGluZGV4KTtcclxuXHJcblx0XHRcdGlmIChpbmRleCA9PSAxKSB7XHJcblx0XHRcdFx0Ly8gRmlsdGVyID4gVmFsdWVcclxuXHRcdFx0XHQkcm9vdC5nZXQoJ3RleHRhcmVhW2RhdGEtdHlwZT1zdHJpbmddJykucmVzaXplKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cImFjdGlvbi1iYXJcIj5cclxuXHRcdFx0e3RhYnMuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0PHNwYW4gY2xhc3M9XCJkaXZpZGVyIGgtNVwiPjwvc3Bhbj5cclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gaC0xMCBweC0zIHZpZXdmaWxlc1wiIG9uQ2xpY2s9e3ZpZXdGaWxlc30+XHJcblx0XHRcdFx0e0ljb24oJ3NlYXJjaCcpfTxzcGFuPlZpZXcgZmlsZXM8L3NwYW4+XHJcblx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlRhc2tQYWdlXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWItY29udGVudHNcIj5cclxuXHRcdFx0XHR7Z2VuZXJhbC5lbGVtZW50Lm5vZGVzWzBdfVxyXG5cdFx0XHRcdHtmaWxlU2V0dGluZ3MuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHR7c2NoZWR1bGUuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHR7ZXhjZXB0aW9ucy5lbGVtZW50Lm5vZGVzWzBdfVxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZ2FwLTUgcHktNyBidFwiPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5hbWU9XCJzYXZlXCIgY2xhc3M9XCJidXR0b24gcHJpbWFyeSBoLTEwIHctWzkwcHhdIHB4LTNcIiBvbkNsaWNrPXtzYXZlfT5cclxuXHRcdFx0XHRcdDxzcGFuPlNhdmU8L3NwYW4+XHJcblx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmFtZT1cImNhbmNlbFwiIGNsYXNzPVwiYnV0dG9uIGJvcmRlciBoLTEwIHctWzkwcHhdIHB4LTNcIiBvbkNsaWNrPXtiYWNrfT5cclxuXHRcdFx0XHRcdDxzcGFuPkNhbmNlbDwvc3Bhbj5cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRoZWFkZXI6IGhlYWRlci5lbGVtZW50LFxyXG5cdFx0XHRhY3Rpb25CYXI6IGFjdGlvbkJhcixcclxuXHRcdFx0Y29udGVudDogcm9vdCxcclxuXHRcdH0sXHJcblx0XHRvblNob3csXHJcblx0XHRvbkhpZGUsXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cclxuXHQvLyBGVU5cdTAwQzdcdTAwRDVFU1xyXG5cclxuXHRmdW5jdGlvbiBzZXRTdG9yYWdlKCkge1xyXG5cdFx0X3N0b3JlZFRhc2sgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFzaycpO1xyXG5cdFx0X3RhYkluZGV4ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhYkluZGV4Jyk7XHJcblx0XHRfdGFiVHlwZUluZGV4ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhYlR5cGVJbmRleCcpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZ2V0VGFzaygpIHtcclxuXHRcdHJldHVybiBfaWQgPT0gJ25ldycgP1xyXG5cdFx0XHQoYXdhaXQgd2ViQVBJLm5ld1Rhc2soKSkucmVzdWx0IDpcclxuXHRcdFx0SlNPTi5wYXJzZShfc3RvcmVkVGFzayB8fCBudWxsKSB8fFxyXG5cdFx0XHQoYXdhaXQgd2ViQVBJLmdldFRhc2tCeUlkKF9pZCkpLnJlc3VsdDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrJywgSlNPTi5zdHJpbmdpZnkoX3Rhc2spKTtcclxuXHRcdGhlYWRlci5zZXRQYWdlTWFwKFtcclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gaC0xMCBweC0zXCIgb25DbGljaz17YmFja30+VGFza3M8L2J1dHRvbj4sXHJcblx0XHRcdDxzcGFuIHRpdGxlPXtfdGFzay5uYW1lfT57dXRpbHMudHJ1bmNhdGVUZXh0KF90YXNrLm5hbWUsIDYwKSB8fCAnTmV3IHRhc2snfTwvc3Bhbj5cclxuXHRcdF0pO1xyXG5cdFx0dGFicy5zZWxlY3RUYWIoX3RhYkluZGV4IHx8IDApO1xyXG5cdFx0Z2VuZXJhbC5vblNob3coKTtcclxuXHRcdGZpbGVTZXR0aW5ncy5vblNob3coKTtcclxuXHRcdHNjaGVkdWxlLm9uU2hvdygpO1xyXG5cdFx0ZXhjZXB0aW9ucy5vblNob3coKTtcclxuXHRcdCRyb290LmdldCgndGV4dGFyZWEnKS5yZXNpemUoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uSGlkZSgpIHtcclxuXHRcdC8vIGxpbXBhIG8gY2FjaGVcclxuXHRcdGlmIChyb3V0ZXIuY3VycmVudC50YXJnZXQubWF0Y2goL3Rhc2tzfGhpc3RvcnkvaSkpIHtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rhc2snLCAnJyk7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWJJbmRleCcsIDApO1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFiVHlwZUluZGV4JywgMCk7XHJcblx0XHR9XHJcblxyXG5cdFx0c2hhcmVkLnRlbXAgPSBudWxsOyAvLyBUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlciA+IGNvcHlJdGVtc1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc3RvcmVJdGVtKHRhc2spIHtcclxuXHRcdC8vIFBlcnNpc3RlIG8gaXRlbSBubyBjYWNoZSBkbyBuYXZlZ2Fkb3IgcGFyYSBldmVudHVhbCBhdHVhbGl6YVx1MDBFN1x1MDBFM28gZGUgcFx1MDBFMWdpbmEuXHJcblxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rhc2snLCBKU09OLnN0cmluZ2lmeSh0YXNrKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiB2aWV3RmlsZXMoKSB7XHJcblx0XHRsZXQgaXNBdmFpbGFibGUgPSBhd2FpdCB3ZWJBUEkucGF0aElzQXZhaWxhYmxlKF90YXNrLnBhdGgpO1xyXG5cclxuXHRcdGlmIChpc0F2YWlsYWJsZSlcclxuXHRcdFx0bG9jYXRpb24uaGFzaCA9IGB0YXNrLyR7X3Rhc2suaWR9L2ZpbGVzYDtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGlzVGFza1J1bm5pbmcoKSB7XHJcblx0XHRpZiAoIV9pZCB8fCBfaWQgPT0gJ25ldycpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRsZXQgeyByZXN1bHQ6IGlzUnVubmluZyB9ID0gYXdhaXQgd2ViQVBJLmlzVGFza1J1bm5pbmcoX3Rhc2suaWQpO1xyXG5cclxuXHRcdGlmIChpc1J1bm5pbmcpXHJcblx0XHRcdHRvYXN0SW5mbygnVGFzayBpbiBwcm9ncmVzcy4nKTtcclxuXHJcblx0XHRyZXR1cm4gaXNSdW5uaW5nO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gc2F2ZSgpIHtcclxuXHRcdGlmIChhd2FpdCBpc1Rhc2tSdW5uaW5nKCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodmFsaWRhdGUoKSkge1xyXG5cdFx0XHRpZiAoIV9pZCB8fCBfaWQgPT0gJ25ldycpXHJcblx0XHRcdFx0YXdhaXQgd2ViQVBJLmluc2VydFRhc2soX3Rhc2spO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0YXdhaXQgd2ViQVBJLnVwZGF0ZVRhc2soX3Rhc2spO1xyXG5cclxuXHRcdFx0YmFjaygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmFjaygpIHtcclxuXHRcdGxvY2F0aW9uLmhhc2ggPSAndGFza3MnO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmFsaWRhdGUoKSB7XHJcblx0XHRsZXQgaXNWYWxpZCA9IHRydWU7XHJcblxyXG5cdFx0Ly8gR2VuZXJhbFxyXG5cdFx0Y29uc3QgJGZvcm1HZW5lcmFsID0gJHJvb3QuZ2V0KCdmb3JtJykuYXQoMCk7XHJcblx0XHRsZXQgJGludmFsaWRGaWVsZDtcclxuXHJcblx0XHRbLi4uJGZvcm1HZW5lcmFsLmF0dHIoJ2VsZW1lbnRzJyldLmZvckVhY2goZmllbGQgPT4ge1xyXG5cdFx0XHRpZiAoIWZpZWxkLmNoZWNrVmFsaWRpdHkoKSAmJiBpc1ZhbGlkKSB7XHJcblx0XHRcdFx0JGludmFsaWRGaWVsZCA9IGZpZWxkO1xyXG5cdFx0XHRcdGZpZWxkLmZvY3VzKCk7XHJcblx0XHRcdFx0aXNWYWxpZCA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAoIWlzVmFsaWQpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnRmlsbCBpbiB0aGUgcmVxdWlyZWQgZmllbGRzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGFicy5zZWxlY3RUYWIoMCk7XHJcblx0XHRcdCRpbnZhbGlkRmllbGQuZm9jdXMoKTtcclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0b2FzdEluZm8obWVzc2FnZSkge1xyXG5cdFx0aWYgKCFtZXNzYWdlKSByZXR1cm47XHJcblxyXG5cdFx0VG9hc3Qoe1xyXG5cdFx0XHRpY29uOiBJY29uKCdpbmZvJyksXHJcblx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXHJcblx0XHRcdHBvc2l0aW9uOiAnYm90dG9tIGNlbnRlcicsXHJcblx0XHRcdHRpbWU6IDRcclxuXHRcdH0pO1xyXG5cclxuXHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi9JY29uJztcclxuXHJcbmNvbnN0IFBhZ2VyID0gKHsgcGFnZUluZGV4ID0gMCwgbGltaXQgPSAwLCB0b3RhbCA9IDAsIG9uUHJldiwgb25OZXh0IH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlBhZ2VyXCI+XHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG9uQ2xpY2s9e3ByZXZ9PlxyXG5cdFx0XHRcdHtJY29uKCdsZWZ0Jyl9XHJcblx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwicGFnZS10b3RhbFwiPlxyXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwicGFnZVwiPntsaW1pdH08L3NwYW4+XHJcblx0XHRcdFx0PHNwYW4gY2xhc3M9XCJzZXBhcmF0b3JcIj4vPC9zcGFuPlxyXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwidG90YWxcIj57dG90YWx9PC9zcGFuPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgb25DbGljaz17bmV4dH0+XHJcblx0XHRcdFx0e0ljb24oJ3JpZ2h0Jyl9XHJcblx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KS5oaWRlKCk7XHJcblx0Y29uc3QgJHBhZ2UgPSAkcm9vdC5nZXQoJy5wYWdlJyk7XHJcblx0Y29uc3QgJHRvdGFsID0gJHJvb3QuZ2V0KCcudG90YWwnKTtcclxuXHRjb25zdCAkYnV0dG9uUHJldiA9ICRyb290LmdldCgnLmJ1dHRvbiB3LTEwIGgtMTAnKS5hdCgwKS5kaXNhYmxlKCk7XHJcblx0Y29uc3QgJGJ1dHRvbk5leHQgPSAkcm9vdC5nZXQoJy5idXR0b24gdy0xMCBoLTEwJykuYXQoMSk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdGxpbWl0LFxyXG5cdFx0c2V0UGFnZSxcclxuXHRcdHNldFRvdGFsLFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHNldFBhZ2UoX3BhZ2VJbmRleCwgaXRlbXNMZW5ndGgpIHtcclxuXHRcdHBhZ2VJbmRleCA9IF9wYWdlSW5kZXg7XHJcblx0XHRpdGVtc0xlbmd0aCArPSBfcGFnZUluZGV4O1xyXG5cclxuXHRcdCRidXR0b25QcmV2LmRpc2FibGUocGFnZUluZGV4IDw9IDApO1xyXG5cclxuXHRcdGlmIChwYWdlSW5kZXggPiAwICYmIGl0ZW1zTGVuZ3RoID49IHRvdGFsKSB7XHJcblx0XHRcdCRidXR0b25OZXh0LmRpc2FibGUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCRidXR0b25OZXh0LmRpc2FibGUoZmFsc2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCRwYWdlLnRleHQoaXRlbXNMZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0VG90YWwoX3RvdGFsKSB7XHJcblx0XHR0b3RhbCA9IF90b3RhbDtcclxuXHJcblx0XHRpZiAoJHBhZ2UudGV4dCgpID4gdG90YWwpXHJcblx0XHRcdCRwYWdlLnRleHQodG90YWwpO1xyXG5cclxuXHRcdCR0b3RhbC50ZXh0KHRvdGFsKTtcclxuXHRcdCRyb290LnNob3codG90YWwgPiBsaW1pdCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwcmV2KCkge1xyXG5cdFx0cGFnZUluZGV4IC09IGxpbWl0O1xyXG5cclxuXHRcdGlmIChvblByZXYpXHJcblx0XHRcdG9uUHJldihwYWdlSW5kZXgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbmV4dCgpIHtcclxuXHRcdHBhZ2VJbmRleCArPSBsaW1pdDtcclxuXHJcblx0XHRpZiAob25OZXh0KVxyXG5cdFx0XHRvbk5leHQocGFnZUluZGV4KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWdlcjtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHJvdXRlciBmcm9tICcuLi9zZXJ2aWNlcy9Sb3V0ZXJTZXJ2aWNlJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uL2xpYi9VdGlscyc7XHJcbmltcG9ydCBQYWdlSGVhZGVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZUhlYWRlcic7XHJcbmltcG9ydCBBY3Rpb25CYXIgZnJvbSAnLi4vY29tcG9uZW50cy9BY3Rpb25CYXInO1xyXG5pbXBvcnQgUGFnZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlcic7XHJcbmltcG9ydCBEYXRhVGFibGUgZnJvbSAnLi4vbGliL0RhdGFUYWJsZS9zcmMvaW5kZXgnO1xyXG5pbXBvcnQgTWVudSBmcm9tICcuLi9saWIvTWVudS9NZW51JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IFRhc2tGaWxlc1BhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7IG9uQ2xpY2tCYWNrQnV0dG9uOiBiYWNrIH0pO1xyXG5cdGNvbnN0IGFjdGlvbkJhciA9IEFjdGlvbkJhcih7XHJcblx0XHRidXR0b25zOiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAncmVmcmVzaCcsXHJcblx0XHRcdFx0dG9vbHRpcDogJ1JlZnJlc2gnLFxyXG5cdFx0XHRcdGljb246IEljb24oJ3JlZnJlc2gnKSxcclxuXHRcdFx0XHRzdHlsZTogJ21hcmdpbi1sZWZ0OiAwLjhlbTsnLFxyXG5cdFx0XHRcdG9uQ2xpY2s6IHJlZnJlc2hcclxuXHRcdFx0fSxcclxuXHRcdF1cclxuXHR9KTtcclxuXHRjb25zdCBwYWdlciA9IFBhZ2VyKHtcclxuXHRcdGxpbWl0OiAxMDAsXHJcblx0XHRvblByZXY6IHBhZ2VJbmRleCA9PiBzZWFyY2gocGFnZUluZGV4KSxcclxuXHRcdG9uTmV4dDogcGFnZUluZGV4ID0+IHNlYXJjaChwYWdlSW5kZXgpLFxyXG5cdH0pO1xyXG5cdGNvbnN0IGNoZWNrYm94RW5hYmxlRXhjZXB0aW9ucyA9IChcclxuXHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZW5hYmxlRXhjZXB0aW9uc1wiIG9uQ2xpY2s9e3JlZnJlc2h9IC8+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lXCI+XHJcblx0XHRcdFx0PGI+RW5hYmxlIGV4Y2VwdGlvbnM8L2I+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9sYWJlbD5cclxuXHQpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRoZWFkZXI6IGhlYWRlci5lbGVtZW50LFxyXG5cdFx0XHRhY3Rpb25CYXI6IFtcclxuXHRcdFx0XHRjaGVja2JveEVuYWJsZUV4Y2VwdGlvbnMsXHJcblx0XHRcdFx0YWN0aW9uQmFyLmVsZW1lbnQsXHJcblx0XHRcdFx0cGFnZXIuZWxlbWVudCxcclxuXHRcdFx0XSxcclxuXHRcdFx0Y29udGVudDogbnVsbCxcclxuXHRcdH0sXHJcblx0XHRvblNob3csXHJcblx0XHRvbkhpZGUsXHJcblx0fTtcclxuXHRsZXQgX3Rhc2s7XHJcblx0bGV0IF9zZWxlY3RlZFJvdztcclxuXHRsZXQgX2RhdGFUYWJsZTtcclxuXHRsZXQgX2ZpbGVzQ29udGV4dE1lbnU7XHJcblxyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0Y29uc3QgdGFza0lkID0gcm91dGVyLmN1cnJlbnQuaGFzaFBhcnRzWzFdO1xyXG5cdFx0X3Rhc2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YXNrJykgfHwgbnVsbCkgfHwgKGF3YWl0IHdlYkFQSS5nZXRUYXNrQnlJZCh0YXNrSWQpKS5yZXN1bHQ7XHJcblxyXG5cdFx0aWYgKCFfdGFzaykgcmV0dXJuO1xyXG5cclxuXHRcdC8vIFRhc2tzID4gVGFzayA+IEZpbGVzXHJcblx0XHRoZWFkZXIuc2V0UGFnZU1hcChbXHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IGxvY2F0aW9uLmhhc2ggPSAndGFza3MnfT5UYXNrczwvYnV0dG9uPiwgLy8gdm9sdGEgcGFyYSBwXHUwMEUxZ2luYSB0YXNrcyBlIHNlbGVjaW9uYSBvIGl0ZW0gbmEgbGlzdGFcclxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gbG9jYXRpb24uaGFzaCA9ICd0YXNrLycgKyBfdGFzay5pZH0gdGl0bGU9e190YXNrLm5hbWV9PlxyXG5cdFx0XHRcdHt1dGlscy50cnVuY2F0ZVRleHQoX3Rhc2submFtZSwgNjApIHx8ICdOZXcgdGFzayd9XHJcblx0XHRcdDwvYnV0dG9uPiwgLy8gdm9sdGEgcGFyYSBwXHUwMEUxZ2luYSB0YXNrIGUgc2VsZWNpb25hIGFzIFx1MDBGQWx0aW1hcyB0YWJzXHJcblx0XHRcdDxzcGFuPkZpbGVzPC9zcGFuPlxyXG5cdFx0XSk7XHJcblxyXG5cdFx0X2ZpbGVzQ29udGV4dE1lbnUgPSBNZW51KHtcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdSZWZyZXNoJywgaWNvbjogSWNvbigncmVmcmVzaCcpLCBvbkNsaWNrOiBzZWFyY2ggfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdPcGVuIGZpbGUnLCBpY29uOiBJY29uKCdvcGVuJyksIG9uQ2xpY2s6IG9wZW5GaWxlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBpbiBmaWxlIGV4cGxvcmVyJywgaWNvbjogSWNvbignZm9sZGVyU2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdJbkZpbGVFeHBsb3JlciB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NvcHknLCBpY29uOiBJY29uKCdjb3B5JyksIG9uQ2xpY2s6IGNvcHlDbGlwSXRlbXMgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRzZWFyY2goKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uSGlkZSgpIHtcclxuXHRcdF9kYXRhVGFibGUuZGVzdHJveSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RGF0YVRhYmxlKCkge1xyXG5cdFx0X2RhdGFUYWJsZSA9IERhdGFUYWJsZSh7XHJcblx0XHRcdGlkOiAndGFza2ZpbGVzJyxcclxuXHRcdFx0aGVpZ2h0OiAnMTAwJScsXHJcblx0XHRcdHNvcnQ6IHRydWUsXHJcblx0XHRcdHJlc2l6ZTogdHJ1ZSxcclxuXHRcdFx0Y29sdW1uczoge1xyXG5cdFx0XHRcdHBhdGg6IHsgZGlzcGxheU5hbWU6ICdQYXRoJywgd2lkdGg6IDMwMCB9LFxyXG5cdFx0XHRcdHR5cGU6IHsgZGlzcGxheU5hbWU6ICdUeXBlJywgd2lkdGg6IDkwIH0sXHJcblx0XHRcdFx0d2lkdGg6IHsgZGlzcGxheU5hbWU6ICdXaWR0aCAocHgpJywgd2lkdGg6IDExMCB9LFxyXG5cdFx0XHRcdGhlaWdodDogeyBkaXNwbGF5TmFtZTogJ0hlaWdodCAocHgpJywgd2lkdGg6IDExMCB9LFxyXG5cdFx0XHRcdHdpZHRoSGVpZ2h0UmF0aW86IHsgZGlzcGxheU5hbWU6ICdXL0ggUmF0aW8nLCB3aWR0aDogMTAwIH0sXHJcblx0XHRcdFx0c2l6ZTogeyBkaXNwbGF5TmFtZTogJ1NpemUgKE1CKScsIHdpZHRoOiAxMDAgfSxcclxuXHRcdFx0XHRjcmVhdGVkOiB7IGRpc3BsYXlOYW1lOiAnQ3JlYXRlZCcsIHdpZHRoOiAxMzAgfSxcclxuXHRcdFx0XHRtb2RpZmllZDogeyBkaXNwbGF5TmFtZTogJ01vZGlmaWVkJywgbWluV2lkdGg6IDEzMCB9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRyb3dzOiB7XHJcblx0XHRcdFx0c2VsZWN0T25DbGljazogdHJ1ZSxcclxuXHRcdFx0XHRhbGxvd011bHRpcGxlU2VsZWN0aW9uOiB0cnVlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdHBhdGg6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6XCIgb25DbGljaz17b3BlbkZpbGV9IGNsYXNzPVwibGlua1wiIHN0eWxlPVwib3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XCI+e3ZhbHVlfTwvYT5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHR5cGU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHZhbHVlLnRvVXBwZXJDYXNlKCkuc3Vic3RyaW5nKDEpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzaXplOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAodmFsdWUgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSAvLyBNQlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y3JlYXRlZDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bW9kaWZpZWQ6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRkb20ocm93LmVsZW1lbnQpLm9uKCdjb250ZXh0bWVudScsICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRcdGlmICghcm93LmlzU2VsZWN0ZWQpXHJcblx0XHRcdFx0XHRcdHJvdy5zZWxlY3QoKTtcclxuXHJcblx0XHRcdFx0XHRfZmlsZXNDb250ZXh0TWVudS5zaG93KGV2ZW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Eb3VibGVDbGlja1JvdzogKHsgcm93LCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0b3BlbkZpbGUoZXZlbnQpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblNlbGVjdFJvd3M6ICh7IHJvd3MgfSkgPT4ge1xyXG5cdFx0XHRcdF9zZWxlY3RlZFJvdyA9IHJvd3NbMF07XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25VbnNlbGVjdFJvd3M6ICgpID0+IHtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ29weUNsaXA6ICh7IHRleHQgfSkgPT4ge1xyXG5cdFx0XHRcdGNvcHlDbGlwSXRlbXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25DbGlja091dDogKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cyA9ICEhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5hY3Rpb25iYXInKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnRleHQuZWxlbWVudHMuY29udGVudCA9IF9kYXRhVGFibGUuZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHNlYXJjaChwYWdlSW5kZXggPSAwKSB7XHJcblx0XHRkb20oJy5pY29uLnJlZnJlc2gnKS5hZGRDbGFzcygnc3BpbicpO1xyXG5cdFx0X2RhdGFUYWJsZS5jbGVhcigpO1xyXG5cdFx0c2V0Rm9vdGVyKCk7XHJcblxyXG5cdFx0bGV0IGVuYWJsZUV4Y2VwdGlvbnMgPSBkb20oY2hlY2tib3hFbmFibGVFeGNlcHRpb25zKS5nZXQoJ2lucHV0JykuYXR0cignY2hlY2tlZCcpO1xyXG5cdFx0Y29uc3QgeyByZXN1bHQgfSA9IGF3YWl0IHdlYkFQSS5zZWFyY2hUYXNrRmlsZXNQYWdlZChfdGFzaywgZW5hYmxlRXhjZXB0aW9ucywgcGFnZUluZGV4LCBwYWdlci5saW1pdCk7XHJcblxyXG5cdFx0aWYgKHJlc3VsdC5pdGVtcykge1xyXG5cdFx0XHRwYWdlci5zZXRQYWdlKHBhZ2VJbmRleCwgcmVzdWx0Lml0ZW1zLmxlbmd0aCk7XHJcblx0XHRcdHBhZ2VyLnNldFRvdGFsKHJlc3VsdC50b3RhbCk7XHJcblx0XHRcdHNldEZvb3RlcihyZXN1bHQudG90YWwpO1xyXG5cdFx0XHRfZGF0YVRhYmxlLmxvYWQocmVzdWx0Lml0ZW1zKTtcclxuXHRcdH1cclxuXHJcblx0XHRkb20oJy5pY29uLnJlZnJlc2gnKS5yZW1vdmVDbGFzcygnc3BpbicpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gcmVmcmVzaCgpIHtcclxuXHRcdHNlYXJjaCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb3BlbkZpbGUoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudC5wb2ludGVySWQgJiYgZXZlbnQucG9pbnRlcklkICE9IDEpIHJldHVybjsgLy8gc29tZW50ZSBib3RcdTAwRTNvIHByaW5jaXBhbCBkbyBtb3VzZVxyXG5cclxuXHRcdC8vIHNldFRpbWVvdXQgbmVjZXNzXHUwMEUxcmlvIHBhcmEgcXVlIHNlbGVjdGVkUm93IHNlamEgYXR1YWxpemFkb1xyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB3ZWJBUEkub3BlbkZpbGUoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdJbkZpbGVFeHBsb3JlcigpIHtcclxuXHRcdC8vIHNldFRpbWVvdXQgbmVjZXNzXHUwMEUxcmlvIHBhcmEgcXVlIHNlbGVjdGVkUm93IHNlamEgYXR1YWxpemFkb1xyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB3ZWJBUEkudmlld0luRmlsZUV4cGxvcmVyKF9zZWxlY3RlZFJvdy5kYXRhKCkucGF0aCksIDIwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5Q2xpcEl0ZW1zKCkge1xyXG5cdFx0d2ViQVBJLmNvcHlDbGlwKF9kYXRhVGFibGUuZXhwb3J0KCkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0Rm9vdGVyKHRvdGFsKSB7XHJcblx0XHRzaGFyZWQuZm9vdGVyLmluZm8oYCR7dG90YWwgfHwgJ05vJ30gZmlsZXMgZm91bmRgKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJhY2soKSB7XHJcblx0XHRoaXN0b3J5LmJhY2soKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3dBY3Rpb25CYXJCdXR0b25zKHNob3cgPSB0cnVlKSB7XHJcblx0XHQvLy4uXHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza0ZpbGVzUGFnZTtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBQYWdlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBNb2RhbCBmcm9tICcuLi9saWIvTW9kYWwvTW9kYWwnO1xyXG5pbXBvcnQgTWVudSBmcm9tICcuLi9saWIvTWVudS9NZW51JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IEhpc3RvcnlQYWdlID0gKCkgPT4ge1xyXG5cdGNvbnN0IGhlYWRlciA9IFBhZ2VIZWFkZXIoe1xyXG5cdFx0cGFnZU1hcDogWydIaXN0b3J5J10sXHJcblx0XHRkZXNjcmlwdGlvbjogJ01vbml0b3IgdGFzayBleGVjdXRpb24gaGlzdG9yeSBhbmQgYnJvd3NlIG9wdGltaXplZCBmaWxlcy4nXHJcblx0fSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0eyBuYW1lOiAnaGlzdG9yeU1lbnUnLCB0b29sdGlwOiAnJywgaWNvbjogSWNvbignZWxsaXBzaXNWZXJ0aWNhbCcpIH0sXHJcblx0XHRcdHsgdG9vbHRpcDogJ1JlZnJlc2gnLCBpY29uOiBJY29uKCdyZWZyZXNoJyksIG9uQ2xpY2s6IHJlZnJlc2ggfSxcclxuXHRcdFx0eyBuYW1lOiAndmlld0ZpbGVzJywgdG9vbHRpcDogJ1ZpZXcgZmlsZXMnLCBpY29uOiBJY29uKCdzZWFyY2gnKSwgb25DbGljazogdmlld0ZpbGVzIH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3QgcGFnZXIgPSBQYWdlcih7XHJcblx0XHRsaW1pdDogMTAwLFxyXG5cdFx0b25QcmV2OiBwYWdlSW5kZXggPT4gbG9hZChwYWdlSW5kZXgpLFxyXG5cdFx0b25OZXh0OiBwYWdlSW5kZXggPT4gbG9hZChwYWdlSW5kZXgpLFxyXG5cdH0pO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRoZWFkZXI6IGhlYWRlci5lbGVtZW50LFxyXG5cdFx0XHRhY3Rpb25CYXI6IFtcclxuXHRcdFx0XHRhY3Rpb25CYXIuZWxlbWVudCxcclxuXHRcdFx0XHRwYWdlci5lbGVtZW50LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRjb250ZW50OiBudWxsLFxyXG5cdFx0fSxcclxuXHRcdGRhdGFUYWJsZTogbnVsbCxcclxuXHRcdG9uU2hvdyxcclxuXHRcdG9uSGlkZSxcclxuXHR9O1xyXG5cdGxldCBfZGF0YVRhYmxlO1xyXG5cdGxldCBfc2VsZWN0ZWRSb3c7XHJcblx0bGV0IF9oaXN0b3J5Q29udGV4dE1lbnU7XHJcblxyXG5cdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRzZXREYXRhVGFibGUoKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdGF3YWl0IGxvYWQoKTtcclxuXHJcblx0XHRjb25zdCBpZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsYXN0T3BlbmVkSXRlbScpO1xyXG5cclxuXHRcdGlmIChpZCkge1xyXG5cdFx0XHRjb25zdCByb3cgPSBfZGF0YVRhYmxlLnJvd3NCeUZpZWxkVmFsdWUoJ2hpc3RvcnlGaWxlTmFtZScsIGlkKVswXTtcclxuXHJcblx0XHRcdC8vIHNlbGVjaW9uYSBvIGl0ZW1cclxuXHRcdFx0aWYgKHJvdykge1xyXG5cdFx0XHRcdHJvdy5zZWxlY3QoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXN0T3BlbmVkSXRlbScsICcnKTtcclxuXHJcblx0XHQvLyBNZW51c1xyXG5cdFx0TWVudSh7XHJcblx0XHRcdHRyaWdnZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPWhpc3RvcnlNZW51XScpLFxyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ0V4cG9ydCBoaXN0b3J5JywgaWNvbjogSWNvbignc2hlZXQnKSwgb25DbGljazogZXhwb3J0SGlzdG9yeSB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdF9oaXN0b3J5Q29udGV4dE1lbnUgPSBNZW51KHtcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdSZWZyZXNoJywgaWNvbjogSWNvbigncmVmcmVzaCcpLCBvbkNsaWNrOiByZWZyZXNoIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBmaWxlcycsIGljb246IEljb24oJ3NlYXJjaCcpLCBvbkNsaWNrOiB2aWV3RmlsZXMgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdWaWV3IGluIGZpbGUgZXhwbG9yZXInLCBpY29uOiBJY29uKCdmb2xkZXJTZWFyY2gnKSwgb25DbGljazogdmlld0luRmlsZUV4cGxvcmVyIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ29weScsIGljb246IEljb24oJ2NvcHknKSwgb25DbGljazogY29weUNsaXBJdGVtcyB9LFxyXG5cdFx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0RlbGV0ZScsIGljb246IEljb24oJ3RyYXNoJyksIG9uQ2xpY2s6IGRlbGV0ZUl0ZW0gfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uSGlkZSgpIHtcclxuXHRcdF9kYXRhVGFibGUuZGVzdHJveSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RGF0YVRhYmxlKCkge1xyXG5cdFx0X2RhdGFUYWJsZSA9IERhdGFUYWJsZSh7XHJcblx0XHRcdGlkOiAnaGlzdG9yeScsXHJcblx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRzb3J0OiB0cnVlLFxyXG5cdFx0XHRyZXNpemU6IHRydWUsXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRpZDogeyBkaXNwbGF5TmFtZTogJ0lkJywgaGlkZGVuOiB0cnVlIH0sXHJcblx0XHRcdFx0dGFza0lkOiB7IGRpc3BsYXlOYW1lOiAnVGFzayBJZCcsIGhpZGRlbjogdHJ1ZSB9LFxyXG5cdFx0XHRcdGhpc3RvcnlGaWxlTmFtZTogeyBkaXNwbGF5TmFtZTogJ0hpc3RvcnlGaWxlTmFtZScsIGhpZGRlbjogdHJ1ZSB9LFxyXG5cdFx0XHRcdGRhdGVUaW1lOiB7IGRpc3BsYXlOYW1lOiAnRGF0ZS9UaW1lJywgd2lkdGg6IDEzMCB9LFxyXG5cdFx0XHRcdG5hbWU6IHsgZGlzcGxheU5hbWU6ICdUYXNrJywgd2lkdGg6IDE3MCB9LFxyXG5cdFx0XHRcdGFjdGlvbjogeyBkaXNwbGF5TmFtZTogJ0FjdGlvbicsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRzdGF0dXM6IHsgZGlzcGxheU5hbWU6ICdTdGF0dXMnLCB3aWR0aDogOTAgfSxcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogeyBkaXNwbGF5TmFtZTogJ0Rlc2NyaXB0aW9uJywgd2lkdGg6IDMwMCB9LFxyXG5cdFx0XHRcdHBhdGg6IHsgZGlzcGxheU5hbWU6ICdQYXRoJywgbWluV2lkdGg6IDUwMCB9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRyb3dzOiB7XHJcblx0XHRcdFx0c2VsZWN0T25DbGljazogdHJ1ZSxcclxuXHRcdFx0XHRhbGxvd011bHRpcGxlU2VsZWN0aW9uOiB0cnVlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdGRhdGVUaW1lOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxzcGFuPntcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi11cycsIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHRcdHRpbWVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHR9KS5mb3JtYXQobmV3IERhdGUodmFsdWUpKSA6ICcnXHJcblx0XHRcdFx0XHRcdH08L3NwYW4+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdGF0dXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlID8gPGRpdiBjbGFzcz1cImNoaXBzXCI+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoaXBcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRzaGFyZWQuY29uc3RhbnRzLnN0YXR1cy5maW5kKHggPT4geC5uYW1lID09IHZhbHVlKT8uZGlzcGxheU5hbWVcclxuXHRcdFx0XHRcdFx0XHR9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PiA6ICcnO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHN0eWxlOiB7IHBhZGRpbmc6ICc1cHggOHB4ICFpbXBvcnRhbnQnIH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwYXRoOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OlwiIG9uQ2xpY2s9e3ZpZXdJbkZpbGVFeHBsb3Jlcn0gY2xhc3M9XCJsaW5rXCIgc3R5bGU9XCJvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcIj57dmFsdWV9PC9hPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQWRkUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdGRvbShyb3cuZWxlbWVudCkub24oJ2NvbnRleHRtZW51JywgKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFyb3cuaXNTZWxlY3RlZClcclxuXHRcdFx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cclxuXHRcdFx0XHRcdF9oaXN0b3J5Q29udGV4dE1lbnUuc2hvdyhldmVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uU2VsZWN0Um93czogKHsgcm93cyB9KSA9PiB7XHJcblx0XHRcdFx0X3NlbGVjdGVkUm93ID0gcm93c1swXTtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVuc2VsZWN0Um93czogKCkgPT4ge1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Eb3VibGVDbGlja1JvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHR2aWV3RmlsZXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Db3B5Q2xpcDogKHsgdGV4dCB9KSA9PiB7XHJcblx0XHRcdFx0Y29weUNsaXBJdGVtcygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNsaWNrT3V0OiAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZXZlbnQuY2FuY2VsVW5zZWxlY3RSb3dzID0gISFldmVudC50YXJnZXQuY2xvc2VzdCgnLmFjdGlvbmJhcicpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y29udGV4dC5lbGVtZW50cy5jb250ZW50ID0gX2RhdGFUYWJsZS5lbGVtZW50O1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gbG9hZChwYWdlSW5kZXggPSAwKSB7XHJcblx0XHRkb20oJy5pY29uLnJlZnJlc2gnKS5hZGRDbGFzcygnc3BpbicpO1xyXG5cdFx0c2V0Rm9vdGVyKCk7XHJcblxyXG5cdFx0Y29uc3QgeyByZXN1bHQgfSA9IGF3YWl0IHdlYkFQSS5nZXRIaXN0b3J5UGFnZWQocGFnZUluZGV4LCBwYWdlci5saW1pdCk7XHJcblxyXG5cdFx0aWYgKHJlc3VsdCkge1xyXG5cdFx0XHRwYWdlci5zZXRQYWdlKHBhZ2VJbmRleCwgcmVzdWx0Lml0ZW1zLmxlbmd0aCk7XHJcblx0XHRcdHBhZ2VyLnNldFRvdGFsKHJlc3VsdC50b3RhbCk7XHJcblx0XHRcdF9kYXRhVGFibGUubG9hZChyZXN1bHQuaXRlbXMpO1xyXG5cdFx0XHRzZXRGb290ZXIocmVzdWx0LnRvdGFsKTtcclxuXHRcdH1cclxuXHJcblx0XHRkb20oJy5pY29uLnJlZnJlc2gnKS5yZW1vdmVDbGFzcygnc3BpbicpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gcmVmcmVzaCgpIHtcclxuXHRcdGxvYWQoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdJbkZpbGVFeHBsb3JlcihldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnBvaW50ZXJJZCAmJiBldmVudC5wb2ludGVySWQgIT0gMSkgcmV0dXJuOyAvLyBzb21lbnRlIGJvdFx1MDBFM28gcHJpbmNpcGFsIGRvIG1vdXNlXHJcblxyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS52aWV3SW5GaWxlRXhwbG9yZXIoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvcHlDbGlwSXRlbXMoKSB7XHJcblx0XHR3ZWJBUEkuY29weUNsaXAoX2RhdGFUYWJsZS5leHBvcnQoKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB2aWV3RmlsZXMoKSB7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCBfc2VsZWN0ZWRSb3cuZGF0YSgpLmhpc3RvcnlGaWxlTmFtZSk7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ2hpc3RvcnlmaWxlcy8nICsgX3NlbGVjdGVkUm93LmRhdGEoKS5oaXN0b3J5RmlsZU5hbWU7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBkZWxldGVJdGVtKCkge1xyXG5cdFx0Y29uc3QgbW9kYWwgPSBNb2RhbCh7XHJcblx0XHRcdHRpdGxlOiAnRGVsZXRlIHJlZ2lzdHJ5JyxcclxuXHRcdFx0Y29udGVudDogJ1RoZSBzZWxlY3RlZCBpdGVtKHMpIHdpbGwgYmUgcGVybWFuZW50bHkgZGVsZXRlZC48YnI+PGJyPkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlPycsXHJcblx0XHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRuYW1lOiAnT0snLCBwcmltYXJ5OiB0cnVlLCBvbkNsaWNrOiBhc3luYyAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmJsb2NrKCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLnNob3dTcGluKCk7XHJcblx0XHRcdFx0XHRcdGF3YWl0IF9kZWxldGUoKTtcclxuXHRcdFx0XHRcdFx0bW9kYWwuYmxvY2soZmFsc2UpO1xyXG5cdFx0XHRcdFx0XHRtb2RhbC5oaWRlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDYW5jZWwnIH1cclxuXHRcdFx0XVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bW9kYWwuc2hvdygpO1xyXG5cclxuXHRcdGFzeW5jIGZ1bmN0aW9uIF9kZWxldGUoKSB7XHJcblx0XHRcdGxldCByb3dzID0gX2RhdGFUYWJsZS5zZWxlY3RlZFJvd3MoKTtcclxuXHRcdFx0bGV0IGlkcyA9IHJvd3MubWFwKHggPT4geC5kYXRhKCkuaWQpLmpvaW4oJywnKTtcclxuXHJcblx0XHRcdGNvbnN0IHsgcmVzdWx0OiB0b3RhbCwgZXJyb3IgfSA9IGF3YWl0IHdlYkFQSS5kZWxldGVIaXN0b3J5RXZlbnRzKGlkcyk7XHJcblxyXG5cdFx0XHRpZiAoIWVycm9yKSB7XHJcblx0XHRcdFx0cGFnZXIuc2V0VG90YWwodG90YWwpO1xyXG5cdFx0XHRcdHNldEZvb3Rlcih0b3RhbCk7XHJcblx0XHRcdFx0X2RhdGFUYWJsZS5yZW1vdmVTZWxlY3RlZFJvd3MoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZXhwb3J0SGlzdG9yeSgpIHtcclxuXHRcdGNvbnN0IGZpbGVOYW1lID0gJ0hpc3RvcnkueGxzeCc7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLnNhdmVGaWxlUGlja2VyKCdFeHBvcnQgaGlzdG9yeScsIGZpbGVOYW1lLCAneGxzeCcpO1xyXG5cclxuXHRcdGlmIChwYXRoKVxyXG5cdFx0XHR3ZWJBUEkuZXhwb3J0SGlzdG9yeSgnSGlzdG9yeScsIHBhdGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0Rm9vdGVyKHRvdGFsKSB7XHJcblx0XHRzaGFyZWQuZm9vdGVyLmluZm8oYCR7dG90YWwgfHwgJ05vJ30gZXhlY3V0aW9uc2ApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0FjdGlvbkJhckJ1dHRvbnMoc2hvdyA9IHRydWUpIHtcclxuXHRcdGFjdGlvbkJhci5lbGVtZW50LmdldCgnW25hbWU9dmlld0ZpbGVzXScpLnNob3coc2hvdyk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVBhZ2U7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9saWIvVXRpbHMnO1xyXG5pbXBvcnQgUGFnZUhlYWRlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXInO1xyXG5pbXBvcnQgQWN0aW9uQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvQWN0aW9uQmFyJztcclxuaW1wb3J0IFBhZ2VyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZXInO1xyXG5pbXBvcnQgRGF0YVRhYmxlIGZyb20gJy4uL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4JztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBIaXN0b3J5RmlsZXNQYWdlID0gKCkgPT4ge1xyXG5cdGNvbnN0IGhlYWRlciA9IFBhZ2VIZWFkZXIoe1xyXG5cdFx0b25DbGlja0JhY2tCdXR0b246IGJhY2ssXHJcblx0XHRkZXNjcmlwdGlvbjogJ1Byb2Nlc3NlZCBmaWxlcyBhbmQgb3B0aW1pemF0aW9uIGRldGFpbHMuJyxcclxuXHR9KTtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSBBY3Rpb25CYXIoe1xyXG5cdFx0YnV0dG9uczogW1xyXG5cdFx0XHR7IG5hbWU6ICdwYWdlTWVudScsIHRvb2x0aXA6ICcnLCBpY29uOiBJY29uKCdlbGxpcHNpc1ZlcnRpY2FsJykgfSxcclxuXHRcdFx0eyB0b29sdGlwOiAnUmVmcmVzaCcsIGljb246IEljb24oJ3JlZnJlc2gnKSwgb25DbGljazogcmVmcmVzaCB9LFxyXG5cdFx0XVxyXG5cdH0pO1xyXG5cdGNvbnN0IHBhZ2VyID0gUGFnZXIoe1xyXG5cdFx0bGltaXQ6IDEwMCxcclxuXHRcdG9uUHJldjogcGFnZUluZGV4ID0+IGxvYWQocGFnZUluZGV4KSxcclxuXHRcdG9uTmV4dDogcGFnZUluZGV4ID0+IGxvYWQocGFnZUluZGV4KSxcclxuXHR9KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0aGVhZGVyOiBoZWFkZXIuZWxlbWVudCxcclxuXHRcdFx0YWN0aW9uQmFyOiBbXHJcblx0XHRcdFx0YWN0aW9uQmFyLmVsZW1lbnQsXHJcblx0XHRcdFx0cGFnZXIuZWxlbWVudCxcclxuXHRcdFx0XSxcclxuXHRcdFx0Y29udGVudDogbnVsbCxcclxuXHRcdH0sXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHRjb25zdCBfaGlzdG9yeUZpbGVOYW1lID0gbG9jYXRpb24uaGFzaC5zcGxpdCgnLycpWzFdO1xyXG5cdGxldCBfZGF0YVRhYmxlO1xyXG5cdGxldCBfc2VsZWN0ZWRSb3c7XHJcblx0bGV0IF9maWxlc0NvbnRleHRNZW51O1xyXG5cclxuXHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0c2V0RGF0YVRhYmxlKCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRjb25zdCBfdGFza0lkID0gX2hpc3RvcnlGaWxlTmFtZS5zcGxpdCgnXycpWzBdO1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHRhc2sgfSA9IGF3YWl0IHdlYkFQSS5nZXRUYXNrQnlJZChfdGFza0lkKTtcclxuXHJcblx0XHQvLyBIaXN0b3J5ID4gVGFzayA+IEZpbGVzXHJcblx0XHRoZWFkZXIuc2V0UGFnZU1hcChbXHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2JhY2t9Pkhpc3Rvcnk8L2J1dHRvbj4sXHJcblx0XHRcdDxzcGFuIHRpdGxlPXt0YXNrLm5hbWV9Pnt1dGlscy50cnVuY2F0ZVRleHQodGFzay5uYW1lLCA2MCl9PC9zcGFuPixcclxuXHRcdFx0PHNwYW4+RmlsZXM8L3NwYW4+XHJcblx0XHRdKTtcclxuXHJcblx0XHQvLyBNZW51c1xyXG5cdFx0TWVudSh7XHJcblx0XHRcdHRyaWdnZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPXBhZ2VNZW51XScpLFxyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ0V4cG9ydCBmaWxlcycsIGljb246IEljb24oJ3NoZWV0JyksIG9uQ2xpY2s6IGV4cG9ydEhpc3RvcnkgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRfZmlsZXNDb250ZXh0TWVudSA9IE1lbnUoe1xyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ1JlZnJlc2gnLCBpY29uOiBJY29uKCdyZWZyZXNoJyksIG9uQ2xpY2s6IHJlZnJlc2ggfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdPcGVuIGZpbGUnLCBpY29uOiBJY29uKCdvcGVuJyksIG9uQ2xpY2s6IG9wZW5GaWxlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBpbiBmaWxlIGV4cGxvcmVyJywgaWNvbjogSWNvbignZm9sZGVyU2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdJbkZpbGVFeHBsb3JlciB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NvcHknLCBpY29uOiBJY29uKCdjb3B5JyksIG9uQ2xpY2s6IGNvcHlDbGlwSXRlbXMgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRhd2FpdCBsb2FkKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0aWQ6ICdoaXN0b3J5ZmlsZXMnLFxyXG5cdFx0XHRoZWlnaHQ6ICcxMDAlJyxcclxuXHRcdFx0cmVzaXplOiB0cnVlLFxyXG5cdFx0XHRzb3J0OiB0cnVlLFxyXG5cdFx0XHRjb2x1bW5zOiB7XHJcblx0XHRcdFx0ZGF0ZVRpbWU6IHsgZGlzcGxheU5hbWU6ICdEYXRlL1RpbWUnLCB3aWR0aDogMTQwIH0sXHJcblx0XHRcdFx0cGF0aDogeyBkaXNwbGF5TmFtZTogJ1BhdGgnLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0YWN0aW9uOiB7IGRpc3BsYXlOYW1lOiAnQWN0aW9uJywgd2lkdGg6IDE0MCB9LFxyXG5cdFx0XHRcdHN0YXR1czogeyBkaXNwbGF5TmFtZTogJ1N0YXR1cycsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogeyBkaXNwbGF5TmFtZTogJ0Rlc2NyaXB0aW9uJywgd2lkdGg6IDMwMCB9LFxyXG5cdFx0XHRcdHNpemVQeDogeyBkaXNwbGF5TmFtZTogJ1NpemUgKHB4KScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRuZXdTaXplUHg6IHsgZGlzcGxheU5hbWU6ICdOZXcgU2l6ZSAocHgpJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdHNpemVCeXRlczogeyBkaXNwbGF5TmFtZTogJ1NpemUgKE1CKScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRuZXdTaXplQnl0ZXM6IHsgZGlzcGxheU5hbWU6ICdOZXcgU2l6ZSAoTUIpJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdGNvbXByZXNzaW9uOiB7IGRpc3BsYXlOYW1lOiAnQ29tcHJlc3Npb24nLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0dHlwZTogeyBkaXNwbGF5TmFtZTogJ1R5cGUnLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0bmV3VHlwZTogeyBkaXNwbGF5TmFtZTogJ05ldyBUeXBlJywgbWluV2lkdGg6IDEyMCB9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRyb3dzOiB7XHJcblx0XHRcdFx0c2VsZWN0T25DbGljazogdHJ1ZSxcclxuXHRcdFx0XHRhbGxvd011bHRpcGxlU2VsZWN0aW9uOiB0cnVlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdGRhdGVUaW1lOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxzcGFuPntcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi11cycsIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHRcdHRpbWVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHR9KS5mb3JtYXQobmV3IERhdGUodmFsdWUpKSA6ICcnXHJcblx0XHRcdFx0XHRcdH08L3NwYW4+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwYXRoOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OlwiIG9uQ2xpY2s9e29wZW5GaWxlfSBjbGFzcz1cImxpbmtcIiBzdHlsZT1cIm92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1wiPnt2YWx1ZX08L2E+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdGF0dXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlID8gPGRpdiBjbGFzcz1cImNoaXBzXCI+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoaXBcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRzaGFyZWQuY29uc3RhbnRzLnN0YXR1cy5maW5kKHggPT4geC5uYW1lID09IHZhbHVlKT8uZGlzcGxheU5hbWVcclxuXHRcdFx0XHRcdFx0XHR9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PiA6ICcnO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHN0eWxlOiB7IHBhZGRpbmc6ICc1cHggOHB4ICFpbXBvcnRhbnQnIH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzaXplQnl0ZXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+ICh2YWx1ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDQpIC8vIE1CXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRuZXdTaXplQnl0ZXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+ICh2YWx1ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDQpIC8vIE1CXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb21wcmVzc2lvbjoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gYCR7TnVtYmVyKHZhbHVlKS50b0ZpeGVkKDIpfSVgXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0eXBlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRuZXdUeXBlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdFx0b25BZGRSb3c6ICh7IHJvdyB9KSA9PiB7XHJcblx0XHRcdFx0ZG9tKHJvdy5lbGVtZW50KS5vbignY29udGV4dG1lbnUnLCAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoIXJvdy5pc1NlbGVjdGVkKVxyXG5cdFx0XHRcdFx0XHRyb3cuc2VsZWN0KCk7XHJcblxyXG5cdFx0XHRcdFx0X2ZpbGVzQ29udGV4dE1lbnUuc2hvdyhldmVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uU2VsZWN0Um93czogKHsgcm93cyB9KSA9PiB7XHJcblx0XHRcdFx0X3NlbGVjdGVkUm93ID0gcm93c1swXTtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVuc2VsZWN0Um93czogKCkgPT4ge1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Eb3VibGVDbGlja1JvdzogKHsgcm93LCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0b3BlbkZpbGUoZXZlbnQpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNvcHlDbGlwOiAoeyB0ZXh0IH0pID0+IHtcclxuXHRcdFx0XHRjb3B5Q2xpcEl0ZW1zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ2xpY2tPdXQ6ICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRldmVudC5jYW5jZWxVbnNlbGVjdFJvd3MgPSAhIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuYWN0aW9uYmFyJyk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRjb250ZXh0LmVsZW1lbnRzLmNvbnRlbnQgPSBfZGF0YVRhYmxlLmVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBsb2FkKHBhZ2VJbmRleCA9IDApIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0IH0gPSBhd2FpdCB3ZWJBUEkuZ2V0SXRlbXNGcm9tSGlzdG9yeUZpbGVQYWdlZChfaGlzdG9yeUZpbGVOYW1lLCBwYWdlSW5kZXgsIHBhZ2VyLmxpbWl0KTtcclxuXHJcblx0XHRzZXRGb290ZXIoKTtcclxuXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHBhZ2VyLnNldFBhZ2UocGFnZUluZGV4LCByZXN1bHQuaXRlbXMubGVuZ3RoKTtcclxuXHRcdFx0cGFnZXIuc2V0VG90YWwocmVzdWx0LnRvdGFsKTtcclxuXHRcdFx0X2RhdGFUYWJsZS5sb2FkKHJlc3VsdC5pdGVtcyk7XHJcblx0XHRcdHNldEZvb3RlcihyZXN1bHQudG90YWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gcmVmcmVzaCgpIHtcclxuXHRcdGxvYWQoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9wZW5GaWxlKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQucG9pbnRlcklkICYmIGV2ZW50LnBvaW50ZXJJZCAhPSAxKSByZXR1cm47IC8vIHNvbWVudGUgYm90XHUwMEUzbyBwcmluY2lwYWwgZG8gbW91c2VcclxuXHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLm9wZW5GaWxlKF9zZWxlY3RlZFJvdy5kYXRhKCkucGF0aCksIDIwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB2aWV3SW5GaWxlRXhwbG9yZXIoKSB7XHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLnZpZXdJbkZpbGVFeHBsb3Jlcihfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29weUNsaXBJdGVtcygpIHtcclxuXHRcdHdlYkFQSS5jb3B5Q2xpcChfZGF0YVRhYmxlLmV4cG9ydCgpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZvb3Rlcih0b3RhbCkge1xyXG5cdFx0c2hhcmVkLmZvb3Rlci5pbmZvKGAke3RvdGFsIHx8ICdObyd9IGZpbGVzYCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiYWNrKCkge1xyXG5cdFx0aGlzdG9yeS5iYWNrKCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBleHBvcnRIaXN0b3J5KCkge1xyXG5cdFx0Y29uc3QgZmlsZU5hbWUgPSAnSGlzdG9yeSBmaWxlcy54bHN4JztcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuc2F2ZUZpbGVQaWNrZXIoJ0V4cG9ydCBmaWxlcycsIGZpbGVOYW1lLCAneGxzeCcpO1xyXG5cclxuXHRcdGlmIChwYXRoKVxyXG5cdFx0XHR3ZWJBUEkuZXhwb3J0SGlzdG9yeUZpbGVzKF9oaXN0b3J5RmlsZU5hbWUsICdIaXN0b3J5IGZpbGVzJywgcGF0aCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93QWN0aW9uQmFyQnV0dG9ucyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0Ly8uLlxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhpc3RvcnlGaWxlc1BhZ2U7XHJcbiIsICJpbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHsgZG9tIH0gZnJvbSAnLi9saWIvZG9tL2RvbSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi9zaGFyZWQnO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJy4vc2VydmljZXMvUm91dGVyU2VydmljZSc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IEljb24gZnJvbSAnLi9jb21wb25lbnRzL0ljb24nO1xyXG5pbXBvcnQgUGFnZUxheW91dCBmcm9tICcuL2NvbXBvbmVudHMvUGFnZUxheW91dCc7XHJcbmltcG9ydCBBcHBCYXIgZnJvbSAnLi9jb21wb25lbnRzL0FwcEJhcic7XHJcbmltcG9ydCBOYXZpZ2F0aW9uIGZyb20gJy4vY29tcG9uZW50cy9OYXZpZ2F0aW9uJztcclxuaW1wb3J0IFBhZ2VGb290ZXIgZnJvbSAnLi9jb21wb25lbnRzL1BhZ2VGb290ZXInO1xyXG5pbXBvcnQgTG9naW5QYWdlIGZyb20gJy4vcGFnZXMvTG9naW5QYWdlJztcclxuaW1wb3J0IFRhc2tzUGFnZSBmcm9tICcuL3BhZ2VzL1Rhc2tzUGFnZSc7XHJcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuL3BhZ2VzL1Rhc2tQYWdlJztcclxuaW1wb3J0IFRhc2tGaWxlc1BhZ2UgZnJvbSAnLi9wYWdlcy9UYXNrRmlsZXNQYWdlJztcclxuaW1wb3J0IEhpc3RvcnlQYWdlIGZyb20gJy4vcGFnZXMvSGlzdG9yeVBhZ2UnO1xyXG5pbXBvcnQgSGlzdG9yeUZpbGVzUGFnZSBmcm9tICcuL3BhZ2VzL0hpc3RvcnlGaWxlc1BhZ2UnO1xyXG5cclxubGV0IHBhZ2VMYXlvdXQ7XHJcbmxldCBuYXZpZ2F0aW9uO1xyXG5sZXQgYXBwQmFyO1xyXG5sZXQgZm9vdGVyO1xyXG5cclxucm91dGVyLnJvdXRlcyh7XHJcblx0J2xvZ2luJzogTG9naW5QYWdlLFxyXG5cdCd0YXNrcyc6IFRhc2tzUGFnZSxcclxuXHQndGFzay8/JzogVGFza1BhZ2UsXHJcblx0J3Rhc2svPy9maWxlcyc6IFRhc2tGaWxlc1BhZ2UsXHJcblx0J2hpc3RvcnknOiBIaXN0b3J5UGFnZSxcclxuXHQnaGlzdG9yeWZpbGVzLz8nOiBIaXN0b3J5RmlsZXNQYWdlLFxyXG59KTtcclxud2luZG93LmRvbSA9IGRvbTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiBtb3VudFBhZ2UoKSk7XHJcbi8vIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGV2ZW50ID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpOyAvLyBkZXNhYmlsaXRhIG8gbWVudSBkZSBjb250ZXh0byBuYXRpdm9cclxuXHJcbihhc3luYyAoKSA9PiB7XHJcblx0Y29uc3QgX2lzQXV0aGVudGljYXRlZCA9IGF3YWl0IGlzQXV0aGVudGljYXRlZCgpO1xyXG5cclxuXHRpZiAoIV9pc0F1dGhlbnRpY2F0ZWQpIHtcclxuXHRcdGxvY2F0aW9uLmhhc2ggPSAnbG9naW4nO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRzdGFydCgpO1xyXG5cdH1cclxufSkoKTtcclxuXHJcblxyXG4vLyBGVU5cdTAwQzdcdTAwRDVFU1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xyXG5cdHJldHVybiB0cnVlO1xyXG5cdHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSAhPSBudWxsO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzdGFydCgpIHtcclxuXHRjb25zdCB7IHJlc3VsdDogY29uc3RhbnRzIH0gPSBhd2FpdCB3ZWJBUEkuZ2V0Q29uc3RhbnRzKCk7XHJcblxyXG5cdGlmIChjb25zdGFudHMpXHJcblx0XHRzaGFyZWQuY29uc3RhbnRzID0geyAuLi5zaGFyZWQuY29uc3RhbnRzLCAuLi5jb25zdGFudHMgfTtcclxuXHJcblx0bmF2aWdhdGlvbiA9IE5hdmlnYXRpb24oW1xyXG5cdFx0eyB0aXRsZTogJ1Rhc2tzJywgbmFtZTogJ3Rhc2snLCBocmVmOiAnI3Rhc2tzJywgaWNvbjogSWNvbigndGFza3MnKSB9LFxyXG5cdFx0eyB0aXRsZTogJ0hpc3RvcnknLCBuYW1lOiAnaGlzdG9yeScsIGhyZWY6ICcjaGlzdG9yeScsIGljb246IEljb24oJ2hpc3RvcnknKSB9LFxyXG5cdF0pO1xyXG5cdGFwcEJhciA9IEFwcEJhcigpO1xyXG5cdGZvb3RlciA9IFBhZ2VGb290ZXIoKTtcclxuXHRwYWdlTGF5b3V0ID0gUGFnZUxheW91dCh7XHJcblx0XHRhcHBCYXIsXHJcblx0XHRuYXZpZ2F0aW9uLFxyXG5cdFx0Zm9vdGVyLFxyXG5cdH0pO1xyXG5cclxuXHRzaGFyZWQuZm9vdGVyID0gZm9vdGVyO1xyXG5cclxuXHRyZW5kZXIocGFnZUxheW91dC5lbGVtZW50Lm5vZGVzWzBdLCBkb2N1bWVudC5ib2R5KTtcclxuXHRzdGFydFdlYlNvY2tldCgpO1xyXG5cdG1vdW50UGFnZSgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBtb3VudFBhZ2UoKSB7XHJcblx0bG9jYXRpb24uaGFzaCA9IGxvY2F0aW9uLmhhc2ggfHwgJ3Rhc2tzJztcclxuXHJcblx0bGV0IHBhZ2UgPSByb3V0ZXIucm91dGUoKTtcclxuXHJcblx0cGFnZSA9IGF3YWl0IHBhZ2UoKTtcclxuXHJcblx0aWYgKHNoYXJlZC5jdXJyZW50UGFnZSAmJiBzaGFyZWQuY3VycmVudFBhZ2Uub25IaWRlKVxyXG5cdFx0c2hhcmVkLmN1cnJlbnRQYWdlLm9uSGlkZSgpO1xyXG5cclxuXHRzaGFyZWQuY3VycmVudFBhZ2UgPSBwYWdlO1xyXG5cclxuXHRpZiAobG9jYXRpb24uaGFzaCA9PSAnI2xvZ2luJykge1xyXG5cdFx0cmVuZGVyKHBhZ2UuZWxlbWVudC5ub2Rlc1swXSwgZG9jdW1lbnQuYm9keSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHBhZ2VMYXlvdXQuZWxlbWVudHMuaGVhZGVyLmh0bWwoJycpLmluc2VydChwYWdlLmVsZW1lbnRzLmhlYWRlcik7XHJcblx0XHRwYWdlTGF5b3V0LmVsZW1lbnRzLmFjdGlvbkJhci5odG1sKCcnKS5pbnNlcnQocGFnZS5lbGVtZW50cy5hY3Rpb25CYXIpO1xyXG5cdFx0cGFnZUxheW91dC5lbGVtZW50cy5jb250ZW50Lmh0bWwoJycpLmluc2VydChwYWdlLmVsZW1lbnRzLmNvbnRlbnQpO1xyXG5cdFx0bmF2aWdhdGlvbi5zZXRBY3RpdmUoKTtcclxuXHRcdGZvb3Rlci5pbmZvKCcnKTtcclxuXHRcdHJlbmRlcihwYWdlTGF5b3V0LmVsZW1lbnQubm9kZXNbMF0sIGRvY3VtZW50LmJvZHkpO1xyXG5cdH1cclxuXHJcblx0aWYgKHBhZ2Uub25TaG93KVxyXG5cdFx0YXdhaXQgcGFnZS5vblNob3coKTtcclxuXHJcblx0Ly8gY2FycmVnYSBvcyBcdTAwRURjb25lcyBkbyBsdWNpZGVcclxuXHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRXZWJTb2NrZXQoKSB7XHJcblx0Y29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke2xvY2F0aW9uLmhvc3R9L3dzYCk7XHJcblxyXG5cdHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdC8vIHRhcmVmYXMgZW0gZXhlY3VcdTAwRTdcdTAwRTNvXHJcblx0XHRjb25zdCBydW5uaW5nVGFza3MgPSBldmVudC5kYXRhO1xyXG5cclxuXHRcdGlmIChzaGFyZWQuY3VycmVudFBhZ2UudXBkYXRlUnVubmluZ1Rhc2tzKVxyXG5cdFx0XHRzaGFyZWQuY3VycmVudFBhZ2UudXBkYXRlUnVubmluZ1Rhc2tzKHJ1bm5pbmdUYXNrcyk7XHJcblx0fTtcclxuXHJcblx0c2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG5cdFx0Ly8gc2Vydmlkb3Igblx1MDBFM28gcmVzcG9uZGVcclxuXHRcdGlmIChzb2NrZXQucmVhZHlTdGF0ZSAhPSAxKVxyXG5cdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHR9LCAxMDAwKTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBTyxXQUFTLGNBQWMsS0FBd0IsVUFBZSxVQUFpQjtBQUNyRixVQUFNLFVBQVUsT0FBTyxRQUFRLGFBQzVCLElBQUksS0FBSyxJQUNULFNBQVMsY0FBYyxHQUFHO0FBRTdCLGVBQVcsQ0FBQyxNQUFNLEtBQUssS0FBSyxPQUFPLFFBQVEsU0FBUyxDQUFDLENBQUMsR0FBRztBQUN4RCxVQUFJLEtBQUssV0FBVyxJQUFJLEtBQUssT0FBTyxVQUFVLFlBQVk7QUFDekQsZ0JB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QUcsU0FBUyxJQUFJO0FBQUEsSUFDNUMsT0FBTztBQUNOLGlCQUFXLFNBQVMsT0FBTyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssU0FBUyxNQUFNO0FBQy9ELGlCQUFXLFNBQVMsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssU0FBUyxTQUFTO0FBQ3JFLGlCQUFXLFNBQVMsUUFBUSxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssU0FBUyxPQUFPO0FBQ2pFLGlCQUFXLFVBQVU7QUFDckIsYUFBTyxLQUFLLEVBQUU7QUFDZCxhQUFPLFdBQVcsUUFBUSxNQUFNLENBQUMsR0FBRyxTQUFTLElBQUk7QUFBQSxJQUNsRDtBQUVBLFFBQUksS0FBSztBQUNSLFlBQU0sS0FBSyxPQUFPO0FBR25CLFdBQU8sWUFBWTtBQUFBLEVBQ3BCO0FBRUEsV0FBUyxpQkFBaUI7QUFDekIsVUFBTSxTQUFTLElBQUksVUFBVSxRQUFRLFNBQVMsSUFBSSxLQUFLO0FBRXZELFdBQU8sWUFBWSxTQUFVLE9BQU87QUFFbkMsWUFBTSxlQUFlLE1BQU07QUFFM0IsVUFBSSxlQUFPLFlBQVk7QUFDdEIsdUJBQU8sWUFBWSxtQkFBbUIsWUFBWTtBQUFBLElBQ3BEO0FBRUEsZ0JBQVksTUFBTTtBQUVqQixVQUFJLE9BQU8sY0FBYztBQUN4QixpQkFBUyxPQUFPO0FBQUEsSUFDbEIsR0FBRyxHQUFJO0FBQUEsRUFDUjsiLAogICJuYW1lcyI6IFsiZG9tIiwgIngiLCAiYXR0ciIsICJ2YWx1ZSIsICJzaG93IiwgImhpZGUiLCAicmVtb3ZlIiwgImRpc2FibGUiLCAicm91dGVzIiwgInJvdXRlIiwgIm5hdmlnYXRpb24iLCAiYXBwQmFyIiwgImZvb3RlciIsICIkbWVudSIsICJwYWdlTWFwIiwgImJ1dHRvbiIsICJkaXNhYmxlIiwgInNob3ciLCAiJGNlbGwiLCAiY2hlY2tlZCIsICJzaG93IiwgIiRoZWFkZXIiLCAiY2VsbCIsICJzaG93IiwgIiRjZWxsIiwgInZhbHVlIiwgInNob3ciLCAiY2hlY2tlZCIsICIkcm93IiwgIm9wdGlvbnMiLCAiY2VsbCIsICJzaG93IiwgIm1ldGEiLCAiZGF0YSIsICJ0ZXh0IiwgIiRmb290ZXIiLCAiY29udGVudCIsICJzaG93IiwgIiR0YWJsZSIsICJmb290ZXIiLCAiZGlzYWJsZSIsICJzaG93IiwgIndpZHRoIiwgImhlaWdodCIsICJkYXRhIiwgIm1ldGEiLCAib3B0aW9ucyIsICJjb2x1bW4iLCAiZGVmYXVsdE9wdGlvbnMiLCAiJG92ZXJsYXkiLCAiYmxvY2siLCAic2hvdyIsICJ1dGlscyIsICJVdGlscyIsICJ2YWx1ZSIsICJmaWVsZCIsICJkb20iXQp9Cg==
