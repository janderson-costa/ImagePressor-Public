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
    create();
    function create() {
      let _toasts = document.querySelector(".toasts");
      if (!_toasts) {
        _toasts = document.createElement("div");
        _toasts.className = "toasts";
        document.body.appendChild(_toasts);
      }
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
			<div class="toast-button">
				<button type="button" class="toast-button-icon" onclick="this.parentElement.parentElement.remove()">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
					</svg>
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
        _toasts.classList.add("left");
      } else if (options.position.match("right")) {
        _toasts.classList.add("right");
      } else {
        _toasts.classList.add("center");
      }
      if (options.position.match("top")) {
        _toasts.classList.add("top");
        _toasts.prepend(toast);
        toast.classList.add("show", "top");
      } else {
        _toasts.classList.add("bottom");
        _toasts.appendChild(toast);
        toast.classList.add("show", "bottom");
      }
      setTimeout(() => {
        toast.className = toast.className.replace("show", "hide");
        setTimeout(() => toast.remove(), 500);
      }, options.time * 1e3);
    }
  }

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
    const root = /* @__PURE__ */ createElement("div", { class: "Navigation" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "header" }, /* @__PURE__ */ createElement("div", { class: "logo" }, /* @__PURE__ */ createElement("img", { src: "logo.svg" })), /* @__PURE__ */ createElement("label", { class: "title" }, "ImagePressor")), /* @__PURE__ */ createElement("div", { class: "items" }, items.map(
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
          nextRun: { displayName: "Next Scheduled Run", width: 140, sort: false }
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
      let element = /* @__PURE__ */ createElement("div", { class: "flex flex-col gap-10" }, /* @__PURE__ */ createElement("div", { class: "text-lg font-bold" }, type.displayName), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "flex items-center gap-5 w-80" }, /* @__PURE__ */ createElement("b", null, "Quality"), /* @__PURE__ */ createElement("input", { type: "range", min: "0", max: "100", step: "5", name: "quality", class: "range" }), /* @__PURE__ */ createElement("span", { class: "quality-value" })), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "The lower the quality, the smaller the file size. Find the right balance.")), /* @__PURE__ */ createElement("div", { class: "flex flex-col maxWidth" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name flex gap-8 items-baseline" }, /* @__PURE__ */ createElement("b", null, "Max. width (px)"), /* @__PURE__ */ createElement("input", { type: "number", min: "0", name: "value", class: "min-w-[6em]" }))), /* @__PURE__ */ createElement("div", { class: "text-[0.9em] opacity-75 pt-1" }, "Limits the width of images that exceed the specified width.", /* @__PURE__ */ createElement("br", null), /* @__PURE__ */ createElement("b", null, "Note"), ": Does not affect images smaller than the specified width.")), /* @__PURE__ */ createElement("div", { class: "flex flex-col convert" }, /* @__PURE__ */ createElement("label", { class: "checkbox" }, /* @__PURE__ */ createElement("input", { type: "checkbox", name: "enabled" }), /* @__PURE__ */ createElement("div", { class: "checkbox-name flex gap-8 items-baseline" }, /* @__PURE__ */ createElement("b", null, "Convert to"), /* @__PURE__ */ createElement("select", { name: "type", class: "min-w-[6em]" }, /* @__PURE__ */ createElement("option", null), shared_default.constants.fileTypes.map((_type) => {
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
          newType: { displayName: "New Type", width: 120 }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9qc3gvZmFjdG9yeS50cyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9kb20vZG9tLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2hhcmVkLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvc2VydmljZXMvUm91dGVyU2VydmljZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9Ub2FzdC9Ub2FzdC5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvSWNvbi5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlTGF5b3V0LmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9NZW51L01lbnUuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL0FwcEJhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL05hdmlnYXRpb24uanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlRm9vdGVyLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0xvZ2luUGFnZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9jb21wb25lbnRzL1BhZ2VIZWFkZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9BY3Rpb25CYXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9Sb3dQcm9ncmVzc0Jhci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy91dGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbnN0YW50cy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvQ29sdW1uLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9IZWFkZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL0NlbGwuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9saWIvRGF0YVRhYmxlL3NyYy9jb21wb25lbnRzL1Jvdy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2NvbXBvbmVudHMvRm9vdGVyLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL0RhdGFUYWJsZS9zcmMvY29tcG9uZW50cy9UYWJsZS5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvbGliL01vZGFsL01vZGFsLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza3NQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL2xpYi9VdGlscy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2NvbXBvbmVudHMvVGFicy5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUdlbmVyYWwuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VGaWxlU2V0dGluZ3MuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2VTY2hlZHVsZS5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrUGFnZUV4Y2VwdGlvbnMuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvcGFnZXMvVGFza1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvY29tcG9uZW50cy9QYWdlci5qc3giLCAiLi4vLi4vY2xpZW50L3NyYy9wYWdlcy9UYXNrRmlsZXNQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlQYWdlLmpzeCIsICIuLi8uLi9jbGllbnQvc3JjL3BhZ2VzL0hpc3RvcnlGaWxlc1BhZ2UuanN4IiwgIi4uLy4uL2NsaWVudC9zcmMvQXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnOiBzdHJpbmcgfCBGdW5jdGlvbiwgcHJvcHM6IGFueSwgLi4uY2hpbGRyZW46IGFueVtdKSB7XHJcblx0Y29uc3QgZWxlbWVudCA9IHR5cGVvZiB0YWcgPT09IFwiZnVuY3Rpb25cIlxyXG5cdFx0PyB0YWcocHJvcHMpIC8vIENoYW1hIGEgZnVuXHUwMEU3XHUwMEUzbyBzZSBmb3IgdW0gY29tcG9uZW50ZVxyXG5cdFx0OiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7IC8vIENyaWEgdW0gZWxlbWVudG8gcGFyYSBvIERPTVxyXG5cclxuXHRmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcHMgfHwge30pKSB7XHJcblx0XHRpZiAobmFtZS5zdGFydHNXaXRoKFwib25cIikgJiYgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUuc2xpY2UoMikudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyAvLyBBZGljaW9uYSBldmVudG9cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTsgLy8gRGVmaW5lIGF0cmlidXRvc1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcclxuXHRcdFx0Y2hpbGQuZm9yRWFjaChuZXN0ZWRDaGlsZCA9PiBlbGVtZW50LmFwcGVuZChuZXN0ZWRDaGlsZCkpOyAvLyBBZGljaW9uYSBmaWxob3MgYW5pbmhhZG9zXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbGVtZW50LmFwcGVuZChjaGlsZCBpbnN0YW5jZW9mIE5vZGUgPyBjaGlsZCA6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoaWxkKSk7IC8vIEFkaWNpb25hIHRleHRvIG91IG5cdTAwRjNzXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBlbGVtZW50OyAvLyBSZXRvcm5hIG8gZWxlbWVudG8gY3JpYWRvXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY29tcG9uZW50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcclxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjsgLy8gTGltcGEgbyBjb250YWluZXJcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQoY29tcG9uZW50KTsgLy8gQWRpY2lvbmEgbyBjb21wb25lbnRlIGFvIGNvbnRhaW5lclxyXG59XHJcbiIsICIvKlxyXG5cdGRvbSAtIENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDI4LzEyLzIwMjMuXHJcblxyXG5cdERlc2NyaVx1MDBFN1x1MDBFM286IFVtIGpRdWVyeSBvdGltaXphZG8uXHJcblxyXG5cdFJlY3Vyc29zOlxyXG5cdFx0Lm5vZGVzXHJcblx0XHQubGVuZ3RoXHJcblxyXG5cdFx0Q3JpYWRvcmVzXHJcblx0XHRcdC5pbnNlcnQoKVxyXG5cdFx0XHQuY2xvbmUoKVxyXG5cclxuXHRcdERlc3RydXRvcmVzXHJcblx0XHRcdC5yZW1vdmUoKVxyXG5cclxuXHRcdFNlbGV0b3Jlc1xyXG5cdFx0XHQuZ2V0KClcclxuXHRcdFx0LmF0KClcclxuXHRcdFx0LmdldEJ5QXR0cigpXHJcblx0XHRcdC5nZXRCeUlkKClcclxuXHRcdFx0LmdldEJ5TmFtZSgpXHJcblx0XHRcdC5nZXRCeUNsYXNzKClcclxuXHRcdFx0LnBhcmVudCgpXHJcblx0XHRcdC5maW5kVXAoKVxyXG5cdFx0XHQuZmlyc3QoKVxyXG5cdFx0XHQubGFzdCgpXHJcblx0XHRcdC5uZXh0KClcclxuXHRcdFx0LnByZXZpb3VzKClcclxuXHRcdFx0LmZvckVhY2goKVxyXG5cdFx0XHQubWFwKClcclxuXHRcdFx0LnNvbWUoKVxyXG5cdFx0XHQuZmluZCgpXHJcblx0XHRcdC5maWx0ZXIoKVxyXG5cdFx0XHQuZm9jdXMoKVxyXG5cclxuXHRcdE1vZGlmaWNhZG9yZXNcclxuXHRcdFx0LnZhbHVlKClcclxuXHRcdFx0LnRleHQoKVxyXG5cdFx0XHQuaHRtbCgpXHJcblx0XHRcdC5hdHRyKClcclxuXHRcdFx0LnN0eWxlKClcclxuXHRcdFx0LndpZHRoKClcclxuXHRcdFx0LmhlaWdodCgpXHJcblx0XHRcdC5hZGRDbGFzcygpXHJcblx0XHRcdC5yZW1vdmVDbGFzcygpXHJcblx0XHRcdC5zaG93KClcclxuXHRcdFx0LmhpZGUoKVxyXG5cdFx0XHQucmVzaXplKClcclxuXHRcdFx0LmRpc2FibGUoKVxyXG5cclxuXHRcdE1hbmlwdWxhZG9yZXMgZGUgZXZlbnRvXHJcblx0XHRcdC5vbigpXHJcblx0XHRcdC5iaW5kRGF0YSgpXHJcblxyXG5cdE9ic2VydmFcdTAwRTdcdTAwRjVlczpcclxuXHRcdC0gQXJndW1lbnRvcyBpbnRlcm5vcyBwcmVjZWRpZG9zIHBvciAnX18nOiBVc3VcdTAwRTFyaW8gblx1MDBFM28gcHJlY2lzYSBpbmlmb3JtYXIuXHJcbiovXHJcblxyXG5leHBvcnQgY29uc3QgZG9tID0gKCgpID0+IHtcclxuXHRjb25zdCB1dGlsID0gVXRpbCgpO1xyXG5cclxuXHRzZXRTdHlsZSgpO1xyXG5cclxuXHRyZXR1cm4gRG9tO1xyXG5cclxuXHRmdW5jdGlvbiBEb20oc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpIHtcclxuXHRcdGlmIChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCkpIHtcclxuXHRcdFx0XHRpZiAodXRpbC5pc0hUTUwoc2VsZWN0b3JPckh0bWxPckVsZW1lbnQpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZShzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldChzZWxlY3Rvck9ySHRtbE9yRWxlbWVudCk7XHJcblx0XHRcdH0gZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KSkge1xyXG5cdFx0XHRcdHJldHVybiBfaW50ZXJmYWNlKHNlbGVjdG9yT3JIdG1sT3JFbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gc2VsZWN0b3JPckh0bWxPckVsZW1lbnQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKGRvY3VtZW50KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gSU5URVJGQUNFXHJcblxyXG5cdFx0ZnVuY3Rpb24gX2ludGVyZmFjZShub2RlcywgX19iYXNlTm9kZSkge1xyXG5cdFx0XHRub2RlcyA9IHV0aWwudG9MaXN0KG5vZGVzKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0YmFzZU5vZGU6IF9fYmFzZU5vZGUgfHwgbm9kZXMsXHJcblx0XHRcdFx0bm9kZXM6IG5vZGVzLFxyXG5cdFx0XHRcdGxlbmd0aDogbm9kZXMubGVuZ3RoLFxyXG5cclxuXHRcdFx0XHQvLyBjcmlhZG9yZXNcclxuXHRcdFx0XHRpbnNlcnQ6ICh0YWdPckh0bWxPckVsZW1lbnQsIHRvcCkgPT4gaW5zZXJ0KHRhZ09ySHRtbE9yRWxlbWVudCwgdG9wLCBub2RlcyksXHJcblx0XHRcdFx0Y2xvbmU6ICgpID0+IGNsb25lKG5vZGVzKSxcclxuXHJcblx0XHRcdFx0Ly8gZGVzdHJ1dG9yZXNcclxuXHRcdFx0XHRyZW1vdmU6ICgpID0+IHJlbW92ZShub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIHNlbGV0b3Jlc1xyXG5cdFx0XHRcdGF0OiBpbmRleCA9PiBhdChpbmRleCwgbm9kZXMpLFxyXG5cdFx0XHRcdGdldDogc2VsZWN0b3IgPT4gZ2V0KHNlbGVjdG9yLCBub2RlcyksXHJcblx0XHRcdFx0Z2V0QnlJZDogaWQgPT4gZ2V0QnlBdHRyKCdpZCcsIGlkLCBub2RlcyksIC8vIGlkOiBudW1iZXIvc3RyaW5nL1tudW1iZXIvc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5TmFtZTogbmFtZSA9PiBnZXRCeUF0dHIoJ25hbWUnLCBuYW1lLCBub2RlcyksIC8vIG5hbWU6IHN0cmluZy9bc3RyaW5nXVxyXG5cdFx0XHRcdGdldEJ5QXR0cjogKGF0dHJpYnV0ZSwgdmFsdWUpID0+IGdldEJ5QXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBub2RlcyksIC8vIHZhbHVlOiBzdHJpbmcvW3N0cmluZ11cclxuXHRcdFx0XHRnZXRCeUNsYXNzOiBjbGFzc05hbWUgPT4gZ2V0QnlBdHRyKCdjbGFzcycsIGNsYXNzTmFtZSwgbm9kZXMpLCAvLyBjbGFzczogc3RyaW5nL1tzdHJpbmddXHJcblx0XHRcdFx0ZmluZFVwOiBzZWxlY3RvciA9PiBmaW5kVXAoc2VsZWN0b3IsIG5vZGVzKSxcclxuXHRcdFx0XHRwYXJlbnQ6ICgpID0+IHBhcmVudChub2RlcyksXHJcblx0XHRcdFx0Zmlyc3Q6ICgpID0+IGZpcnN0KG5vZGVzKSxcclxuXHRcdFx0XHRsYXN0OiAoKSA9PiBsYXN0KG5vZGVzKSxcclxuXHRcdFx0XHRuZXh0OiAoKSA9PiBuZXh0T3JQcmV2aW91cyh0cnVlLCBub2RlcyksXHJcblx0XHRcdFx0cHJldmlvdXM6ICgpID0+IG5leHRPclByZXZpb3VzKGZhbHNlLCBub2RlcyksXHJcblx0XHRcdFx0Zm9yRWFjaDogY2FsbGJhY2sgPT4gbm9kZXMuZm9yRWFjaCgoeCwgaW5kZXgpID0+IGNhbGxiYWNrKF9pbnRlcmZhY2UoeCksIGluZGV4KSksXHJcblx0XHRcdFx0bWFwOiBjYWxsYmFjayA9PiBub2Rlcy5tYXAoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdHNvbWU6IGNhbGxiYWNrID0+IG5vZGVzLnNvbWUoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbmQ6IGNhbGxiYWNrID0+IG5vZGVzLmZpbmQoKHgsIGluZGV4KSA9PiBjYWxsYmFjayhfaW50ZXJmYWNlKHgpLCBpbmRleCkpLFxyXG5cdFx0XHRcdGZpbHRlcjogY2FsbGJhY2sgPT4gbm9kZXMuZmlsdGVyKCh4LCBpbmRleCkgPT4gY2FsbGJhY2soX2ludGVyZmFjZSh4KSwgaW5kZXgpKSxcclxuXHRcdFx0XHRmb2N1czogZm9jdXNlZCA9PiBmb2N1cyhmb2N1c2VkLCBub2RlcyksXHJcblxyXG5cdFx0XHRcdC8vIG1vZGlmaWNhZG9yZXNcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUgPT4gYXR0cigndmFsdWUnLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHRleHQ6IHRleHQgPT4gYXR0cignaW5uZXJUZXh0JywgdGV4dCwgbm9kZXMpLFxyXG5cdFx0XHRcdGh0bWw6IGh0bWwgPT4gYXR0cignaW5uZXJIVE1MJywgaHRtbCwgbm9kZXMpLFxyXG5cdFx0XHRcdGF0dHI6IChwcm9wLCB2YWx1ZSkgPT4gYXR0cihwcm9wLCB2YWx1ZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHN0eWxlOiAocHJvcCwgdmFsdWUpID0+IGF0dHIocHJvcCwgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSxcclxuXHRcdFx0XHR3aWR0aDogdmFsdWUgPT4gdmFsdWUgPyBhdHRyKCd3aWR0aCcsIHZhbHVlLCBub2RlcywgJ3N0eWxlJykgOiBnZXRBdHRyKCdvZmZzZXRXaWR0aCcsIG5vZGVzKSxcclxuXHRcdFx0XHRoZWlnaHQ6IHZhbHVlID0+IHZhbHVlID8gYXR0cignaGVpZ2h0JywgdmFsdWUsIG5vZGVzLCAnc3R5bGUnKSA6IGdldEF0dHIoJ29mZnNldEhlaWdodCcsIG5vZGVzKSxcclxuXHRcdFx0XHRhZGRDbGFzczogKGNsYXNzTmFtZSwgYWRkKSA9PiBhZGRDbGFzcyhjbGFzc05hbWUsIGFkZCwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlbW92ZUNsYXNzOiAoY2xhc3NOYW1lLCBhZGQpID0+IHJlbW92ZUNsYXNzKGNsYXNzTmFtZSwgYWRkLCBub2RlcyksXHJcblx0XHRcdFx0c2hvdzogKF9zaG93LCBkaXNwbGF5KSA9PiBzaG93KF9zaG93LCBkaXNwbGF5LCBub2RlcyksXHJcblx0XHRcdFx0aGlkZTogX2hpZGUgPT4gaGlkZShfaGlkZSwgbm9kZXMpLFxyXG5cdFx0XHRcdHJlc2l6ZTogb3B0aW9ucyA9PiByZXNpemUob3B0aW9ucywgbm9kZXMpLFxyXG5cdFx0XHRcdGRpc2FibGU6IChfZGlzYWJsZSwgb3B0aW9ucykgPT4gZGlzYWJsZShfZGlzYWJsZSwgb3B0aW9ucywgbm9kZXMpLFxyXG5cclxuXHRcdFx0XHQvLyBtYW5pcHVsYWRvcmVzIGRlIGV2ZW50b1xyXG5cdFx0XHRcdG9uOiAoZXZlbnROYW1lLCBfZnVuY3Rpb24sIHVzZUNhcHR1cmUpID0+IG9uKGV2ZW50TmFtZSwgX2Z1bmN0aW9uLCB1c2VDYXB0dXJlLCBub2RlcyksXHJcblx0XHRcdFx0YmluZERhdGE6IGFyZ3MgPT4gYmluZERhdGEoYXJncywgbm9kZXMsIF9fYmFzZU5vZGUpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBGVU5cdTAwQzdcdTAwRDVFU1xyXG5cclxuXHRcdGZ1bmN0aW9uIGNyZWF0ZSh0YWdPckh0bWwgPSAnJykge1xyXG5cdFx0XHRjb25zdCBwYXJlbnRPZiA9IHtcclxuXHRcdFx0XHRvcHRpb246ICdzZWxlY3QnLFxyXG5cdFx0XHRcdHRoZWFkOiAndGFibGUnLFxyXG5cdFx0XHRcdHRib2R5OiAndGFibGUnLFxyXG5cdFx0XHRcdHRyOiAndGFibGUnLFxyXG5cdFx0XHRcdHRoOiAndHInLFxyXG5cdFx0XHRcdHRkOiAndHInLFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRsZXQgbm9kZTtcclxuXHJcblx0XHRcdHRhZ09ySHRtbCA9IHV0aWwucGFyc2VIVE1MKHRhZ09ySHRtbCk7XHJcblxyXG5cdFx0XHRpZiAodGFnT3JIdG1sLnN0YXJ0c1dpdGgoJzwnKSkge1xyXG5cdFx0XHRcdGNvbnN0IHRhZ05hbWUgPSB0YWdPckh0bWwubWF0Y2goL1thLXpdKy9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdGNvbnN0IHBhcmVudFRhZ05hbWUgPSBwYXJlbnRPZlt0YWdOYW1lXSB8fCAnZGl2JztcclxuXHJcblx0XHRcdFx0bm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50VGFnTmFtZSk7XHJcblx0XHRcdFx0bm9kZS5pbm5lckhUTUwgPSB0YWdPckh0bWw7XHJcblx0XHRcdFx0bm9kZSA9IG5vZGUucXVlcnlTZWxlY3Rvcih0YWdOYW1lKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0YWdPckh0bWwpIHtcclxuXHRcdFx0XHRub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdPckh0bWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpbnNlcnQodGFnT3JIdG1sT3JFbGVtZW50LCB0b3AgPSBmYWxzZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0aWYgKHRhZ09ySHRtbE9yRWxlbWVudCkge1xyXG5cdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudCA9IHV0aWwudG9MaXN0KHRhZ09ySHRtbE9yRWxlbWVudCk7XHJcblxyXG5cdFx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRcdHRhZ09ySHRtbE9yRWxlbWVudC5mb3JFYWNoKHggPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAodXRpbC5pc1N0cmluZyh4KSlcclxuXHRcdFx0XHRcdFx0XHRfaW5zZXJ0KF9fbm9kZSwgY3JlYXRlKHgpLm5vZGVzWzBdKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodXRpbC5pc0hUTUxFbGVtZW50KHgpKVxyXG5cdFx0XHRcdFx0XHRcdF9pbnNlcnQoX19ub2RlLCB4KTtcclxuXHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdHgubm9kZXMuZm9yRWFjaCh4ID0+IF9pbnNlcnQoX19ub2RlLCB4KSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIF9pbnNlcnQoX19ub2RlLCBub2RlKSB7XHJcblx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHJcblx0XHRcdFx0aWYgKHRvcClcclxuXHRcdFx0XHRcdF9fbm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgX19ub2RlLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdF9fbm9kZS5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGNsb25lKF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2UoX19ub2Rlc1swXS5jbG9uZU5vZGUodHJ1ZSksIF9fbm9kZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHJlbW92ZShfX25vZGVzKSB7XHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4gX19ub2RlLnJlbW92ZSgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBnZXQoc2VsZWN0b3IgPSAnJywgX19ub2RlID0gZG9jdW1lbnQpIHtcclxuXHRcdFx0aWYgKHNlbGVjdG9yKSB7XHJcblx0XHRcdFx0bGV0IG5vZGVzID0gW107XHJcblxyXG5cdFx0XHRcdGlmICh1dGlsLmlzTGlzdChfX25vZGUpKSB7XHJcblx0XHRcdFx0XHRfX25vZGUuZm9yRWFjaCh4ID0+XHJcblx0XHRcdFx0XHRcdG5vZGVzLnB1c2goLi4ueC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSlcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gWy4uLl9fbm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGdldEJ5QXR0cihhdHRyLCB2YWx1ZSwgX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0dmFsdWUgPSB1dGlsLnRvTGlzdCh2YWx1ZSk7XHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+IHtcclxuXHRcdFx0XHR2YWx1ZS5mb3JFYWNoKHZhbHVlID0+IHtcclxuXHRcdFx0XHRcdGxldCByZXNvdXJjZXM7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGF0dHIgPT0gJ2lkJylcclxuXHRcdFx0XHRcdFx0cmVzb3VyY2VzID0gZ2V0KCcjJyArIHZhbHVlLCBfX25vZGUpO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ciA9PSAnY2xhc3MnKVxyXG5cdFx0XHRcdFx0XHRyZXNvdXJjZXMgPSBnZXQoJy4nICsgdmFsdWUsIF9fbm9kZSk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHJlc291cmNlcyA9IGdldChgWyR7YXR0cn0ke3ZhbHVlICE9IHVuZGVmaW5lZCA/ICc9XCInICsgdmFsdWUgKyAnXCInIDogJyd9XWAsIF9fbm9kZSk7XHJcblxyXG5cdFx0XHRcdFx0cmVzb3VyY2VzLm5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghbm9kZXMuc29tZSh4ID0+IHggPT0gbm9kZSkpXHJcblx0XHRcdFx0XHRcdFx0bm9kZXMucHVzaChub2RlKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhdChpbmRleCwgX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzW2luZGV4XSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyc3QoX19ub2Rlcykge1xyXG5cdFx0XHRyZXR1cm4gYXQoMCwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGFzdChfX25vZGVzKSB7XHJcblx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGVzLnBvcCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2Uobm9kZSB8fCBbXSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbmV4dE9yUHJldmlvdXMobmV4dCA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBuZXh0ID8gX19ub2RlLm5leHRTaWJsaW5nIDogX19ub2RlLnByZXZpb3VzU2libGluZztcclxuXHJcblx0XHRcdFx0aWYgKG5vZGUpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaW5kVXAoc2VsZWN0b3IsIF9fbm9kZXMpIHtcclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBfX25vZGUuY2xvc2VzdChzZWxlY3Rvcik7XHJcblxyXG5cdFx0XHRcdGlmIChub2RlICYmICFub2Rlcy5zb21lKHggPT4geCA9PT0gbm9kZSkpXHJcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBfaW50ZXJmYWNlKG5vZGVzLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBwYXJlbnQoX19ub2Rlcykge1xyXG5cdFx0XHRjb25zdCBub2RlcyA9IFtdO1xyXG5cclxuXHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PlxyXG5cdFx0XHRcdG5vZGVzLnB1c2goX19ub2RlLnBhcmVudEVsZW1lbnQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShub2RlcywgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYXR0cihhdHRyaWJ1dGUsIHZhbHVlLCBfX25vZGVzLCBvYmplY3QpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmcvb2JqZWN0XHJcblxyXG5cdFx0XHRpZiAodXRpbC5pc1N0cmluZyhhdHRyaWJ1dGUpKSB7XHJcblx0XHRcdFx0bGV0IGtleSA9IGF0dHJpYnV0ZTtcclxuXHJcblx0XHRcdFx0aWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGdldEF0dHIoa2V5LCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHJldHVybiBzZXRBdHRyKHsgW2tleV06IHZhbHVlIH0sIF9fbm9kZXMsIG9iamVjdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHNldEF0dHIoYXR0cmlidXRlLCBfX25vZGVzLCBvYmplY3QpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0QXR0cihhdHRyaWJ1dGUgPSAnJywgX19ub2Rlcywgb2JqZWN0ID0gJycpIHtcclxuXHRcdFx0Ly8gYXR0cmlidXRlOiBzdHJpbmdcclxuXHRcdFx0Ly8gb2JqZWN0OiBzdHJpbmcgLSBleC46IHN0eWxlXHJcblxyXG5cdFx0XHRjb25zdCB2YWx1ZXMgPSBbXTtcclxuXHJcblx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBvYmplY3QgPyBfX25vZGVbb2JqZWN0XSA6IF9fbm9kZTtcclxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHV0aWwuaXNVbmRlZmluZWQobm9kZVthdHRyaWJ1dGVdKSA/XHJcblx0XHRcdFx0XHRub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpIDpcclxuXHRcdFx0XHRcdG5vZGVbYXR0cmlidXRlXTtcclxuXHJcblx0XHRcdFx0aWYgKCF1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSlcclxuXHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXMgOiB2YWx1ZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2V0QXR0cihhdHRyaWJ1dGVzID0ge30sIF9fbm9kZXMsIG9iamVjdE5hbWUgPSAnJykge1xyXG5cdFx0XHQvLyBhdHRyaWJ1dGVzOiBvYmplY3RcclxuXHRcdFx0Ly8gb2JqZWN0TmFtZTogc3RyaW5nIC0gZXguOiBzdHlsZVxyXG5cclxuXHRcdFx0aWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGF0dHJpYnV0ZXMpKSB7XHJcblx0XHRcdFx0X19ub2Rlcy5mb3JFYWNoKF9fbm9kZSA9PiB7XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBub2RlID0gb2JqZWN0TmFtZSA/IF9fbm9kZVtvYmplY3ROYW1lXSA6IF9fbm9kZTtcclxuXHRcdFx0XHRcdFx0bGV0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gdmFsb3JlcyBpbnRlaXJvcyBjb20gdW5pZGFkZSBweFxyXG5cdFx0XHRcdFx0XHRpZiAob2JqZWN0TmFtZSA9PSAnc3R5bGUnKSB7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGltcG9ydGFudCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBweFxyXG5cdFx0XHRcdFx0XHRcdGlmICgha2V5Lm1hdGNoKC9pbmRleHxsaW5lfGdyaWR8b3JkZXJ8dGFifG9ycGhhbnN8d2lkb3dzfGNvbHVtbnN8Y291bnRlcnxvcGFjaXR5L2kpKVxyXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgPyB2YWx1ZSArICdweCcgOiB2YWx1ZTtcclxuXHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vICFpbXBvcnRhbnRcclxuXHRcdFx0XHRcdFx0XHRpZiAodmFsdWUubWF0Y2goL2ltcG9ydGFudC9pKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgdmFsdWUuaW5kZXhPZignIScpIC0gMSkudHJpbSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aW1wb3J0YW50ID0gJ2ltcG9ydGFudCc7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoaW1wb3J0YW50KVxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQpO1xyXG5cdFx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGVba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHR5cGVvZiBub2RlW2tleV0gPT0gJ3VuZGVmaW5lZCcgP1xyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSkgOlxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIF9pbnRlcmZhY2UoX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSwgZGlzcGxheSA9ICcnLCBfX25vZGVzKSB7XHJcblx0XHRcdHJldHVybiBhdHRyKCdkaXNwbGF5Jywgc2hvdyA/IGRpc3BsYXkgOiAnbm9uZScsIF9fbm9kZXMsICdzdHlsZScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGhpZGUoaGlkZSA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIHNob3coIWhpZGUsICcnLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhZGRDbGFzcyhjbGFzc05hbWUsIGFkZCA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0Ly8gY2xhc3NOYW1lOiBzdHJpbmcvW3N0cmluZ11cclxuXHJcblx0XHRcdGNsYXNzTmFtZSA9IHV0aWwudG9MaXN0KGNsYXNzTmFtZSk7XHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+XHJcblx0XHRcdFx0X19ub2RlLmNsYXNzTGlzdFthZGQgPyAnYWRkJyA6ICdyZW1vdmUnXSguLi5jbGFzc05hbWUpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiByZW1vdmVDbGFzcyhjbGFzc05hbWUsIHJlbW92ZSA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0cmV0dXJuIGFkZENsYXNzKGNsYXNzTmFtZSwgIXJlbW92ZSwgX19ub2Rlcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZm9jdXMoZm9jdXNlZCA9IHRydWUsIF9fbm9kZXMpIHtcclxuXHRcdFx0aWYgKGZvY3VzZWQpXHJcblx0XHRcdFx0X19ub2Rlc1swXS5mb2N1cygpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0X19ub2Rlc1swXS5ibHVyKCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGUgPSB0cnVlLCBvcHRpb25zID0ge30sIF9fbm9kZXMpIHtcclxuXHRcdFx0aWYgKG9wdGlvbnMub3BhY2l0eSkge1xyXG5cdFx0XHRcdF9fbm9kZXMuZm9yRWFjaChfX25vZGUgPT5cclxuXHRcdFx0XHRcdF9fbm9kZS5zdHlsZS5vcGFjaXR5ID0gZGlzYWJsZSA/IG9wdGlvbnMub3BhY2l0eSA6ICcnXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFkZENsYXNzKCdkb20tZGlzYWJsZWQnLCBkaXNhYmxlLCBfX25vZGVzKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiByZXNpemUob3B0aW9ucywgX19ub2Rlcykge1xyXG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHRcdFx0b3B0aW9ucy5vZmZzZXQgPSBvcHRpb25zLm9mZnNldCAhPSB1bmRlZmluZWQgPyBvcHRpb25zLm9mZnNldCA6IDA7XHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+IHtcclxuXHRcdFx0XHQvLyBPYnMuOiBQYXJhIHRleHRhcmVhIGEgZnVuXHUwMEU3XHUwMEUzbyByZXNpemUgZGV2ZSBzZXIgY2hhbWFkYSBubyBldmVudG8gb25pbnB1dC5cclxuXHRcdFx0XHRpZiAodXRpbC5nZXRUYWdOYW1lKF9fbm9kZSkgPT0gJ3RleHRhcmVhJykge1xyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcclxuXHRcdFx0XHRcdF9fbm9kZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG5cdFx0XHRcdFx0X19ub2RlLnN0eWxlLmhlaWdodCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdGxldCBkaWZmID0gX19ub2RlLm9mZnNldEhlaWdodCAtIF9fbm9kZS5zY3JvbGxIZWlnaHQ7XHJcblx0XHRcdFx0XHRsZXQgaGVpZ2h0ID0gX19ub2RlLnNjcm9sbEhlaWdodCArIChkaWZmID4gMCA/IGRpZmYgOiAwKSArIG9wdGlvbnMub2Zmc2V0O1xyXG5cclxuXHRcdFx0XHRcdF9fbm9kZS5zdHlsZS5oZWlnaHQgPSB0eXBlb2YgaGVpZ2h0ID09ICdudW1iZXInICYmIGhlaWdodCA+IDAgPyBoZWlnaHQgKyAncHgnIDogaGVpZ2h0IHx8ICdhdXRvJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIF9fbm9kZXM7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYmluZERhdGEoYXJncyA9IHt9LCBfX2ZpZWxkcywgX19iYXNlTm9kZSkge1xyXG5cdFx0XHQvKlxyXG5cdFx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRcdGtleTogc3RyaW5nLFxyXG5cdFx0XHRcdFx0b2JqZWN0OiBvYmplY3QsXHJcblx0XHRcdFx0XHR2YWx1ZTogYW55LFxyXG5cdFx0XHRcdFx0ZGlzcGF0Y2hFdmVudDogYm9vbGVhblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0Ki9cclxuXHJcblx0XHRcdGFyZ3MuZGlzcGF0Y2hFdmVudCA9IGFyZ3MuZGlzcGF0Y2hFdmVudCAhPSB1bmRlZmluZWQgPyBhcmdzLmRpc3BhdGNoRXZlbnQgOiB0cnVlO1xyXG5cclxuXHRcdFx0bGV0IF9maWVsZHMgPSB7fTtcclxuXHRcdFx0bGV0IF9vbkNoYW5nZTtcclxuXHJcblx0XHRcdF9fZmllbGRzLmZvckVhY2goX19maWVsZCA9PiB7XHJcblx0XHRcdFx0Y29uc3Qga2V5ID0gYXJncy5rZXkgfHwgX19maWVsZC5uYW1lO1xyXG5cclxuXHRcdFx0XHRpZiAoa2V5KSB7XHJcblx0XHRcdFx0XHRfZmllbGRzW2tleV0gPSBfZmllbGRzW2tleV0gPyB1dGlsLmlzQXJyYXkoX2ZpZWxkc1trZXldKSA/IF9maWVsZHNba2V5XS5wdXNoKF9pbnRlcmZhY2UoX19maWVsZCkpIDogW19maWVsZHNba2V5XSwgX2ludGVyZmFjZShfX2ZpZWxkKV0gOiBfaW50ZXJmYWNlKF9fZmllbGQpO1xyXG5cclxuXHRcdFx0XHRcdGlmICghdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSB8fCBhcmdzLm9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHRcdC8vIGF0dWFsaXphIG8gY2FtcG9cclxuXHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSAhdXRpbC5pc1VuZGVmaW5lZChhcmdzLnZhbHVlKSA/IGFyZ3MudmFsdWUgOiBhcmdzLm9iamVjdFtrZXldO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKF9fZmllbGQudHlwZSA9PSAncmFkaW8nKSB7XHJcblx0XHRcdFx0XHRcdFx0X19maWVsZC5jaGVja2VkID0gX19maWVsZC52YWx1ZSA9PSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChfX2ZpZWxkLnR5cGUgPT0gJ2NoZWNrYm94Jykge1xyXG5cdFx0XHRcdFx0XHRcdF9fZmllbGQuY2hlY2tlZCA9IHV0aWwuaXNCb29sZWFuKHZhbHVlKSA/IHZhbHVlIDogdXRpbC5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLnNvbWUodmFsdWUgPT4gX19maWVsZC52YWx1ZSA9PSB2YWx1ZSkgOiBfX2ZpZWxkLnZhbHVlID09IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKF9fZmllbGQudHlwZSA9PSAnZGF0ZScgJiYgdHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7IC8vIHRpbWVzdGFtcFxyXG5cdFx0XHRcdFx0XHRcdF9fZmllbGQudmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKF9fZmllbGQudHlwZSA9PSAnZGF0ZXRpbWUtbG9jYWwnICYmIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykgeyAvLyB0aW1lc3RhbXBcclxuXHRcdFx0XHRcdFx0XHRfX2ZpZWxkLnZhbHVlID0gbmV3IERhdGUodmFsdWUpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTYpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdF9fZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8gYXR1YWxpemEgbyBvYmpldG8gb3UgdmFsb3JcclxuXHRcdFx0XHRcdFx0Y29uc3QgZiA9IGV2ZW50ID0+IGNoYW5nZShldmVudCwga2V5KTtcclxuXHJcblx0XHRcdFx0XHRcdF9fZmllbGQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBfX2ZpZWxkLl9fZG9tX2JpbmREYXRhX2NoYW5nZSk7XHJcblx0XHRcdFx0XHRcdF9fZmllbGQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmKTtcclxuXHRcdFx0XHRcdFx0X19maWVsZC5fX2RvbV9iaW5kRGF0YV9jaGFuZ2UgPSBmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdG9uQ2hhbmdlOiBjYWxsYmFjayA9PiB7XHJcblx0XHRcdFx0XHRfb25DaGFuZ2UgPSBjYWxsYmFjaztcclxuXHJcblx0XHRcdFx0XHQvLyBhY2lvbmEgb25DaGFuZ2VcclxuXHRcdFx0XHRcdGlmIChhcmdzLmRpc3BhdGNoRXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gX2ZpZWxkcylcclxuXHRcdFx0XHRcdFx0XHRjaGFuZ2UobnVsbCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gY2hhbmdlKGV2ZW50LCBrZXkpIHtcclxuXHRcdFx0XHRsZXQgZmllbGQgPSBfZmllbGRzW2tleV07XHJcblx0XHRcdFx0bGV0IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRpZiAodXRpbC5pc0FycmF5KGZpZWxkKSkge1xyXG5cdFx0XHRcdFx0bGV0IHR5cGUgPSBmaWVsZFswXS5ub2Rlc1swXS50eXBlO1xyXG5cclxuXHRcdFx0XHRcdGlmICh0eXBlID09ICdyYWRpbycpIHtcclxuXHRcdFx0XHRcdFx0bGV0IHggPSBmaWVsZC5maW5kKHggPT4geC5ub2Rlc1swXS5jaGVja2VkKTtcclxuXHJcblx0XHRcdFx0XHRcdHZhbHVlID0geCA/IHgubm9kZXNbMF0udmFsdWUgOiAnJztcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0XHRcdHZhbHVlID0gZmllbGQuZmlsdGVyKHggPT4geC5ub2Rlc1swXS5jaGVja2VkKS5tYXAoeCA9PiB4Lm5vZGVzWzBdLnZhbHVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2UgaWYgKGZpZWxkLm5vZGVzWzBdLnR5cGUgPT0gJ2NoZWNrYm94Jykge1xyXG5cdFx0XHRcdFx0bGV0IG9ialZhbHVlID0gIXV0aWwuaXNVbmRlZmluZWQoYXJncy52YWx1ZSkgPyBhcmdzLnZhbHVlIDogYXJncy5vYmplY3Rba2V5XTtcclxuXHRcdFx0XHRcdGxldCBpc0NoZWNrZWQgPSBmaWVsZC5ub2Rlc1swXS5jaGVja2VkO1xyXG5cclxuXHRcdFx0XHRcdGlmICh1dGlsLmlzQm9vbGVhbihvYmpWYWx1ZSkpIHtcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBpc0NoZWNrZWQ7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHV0aWwuaXNBcnJheShvYmpWYWx1ZSkpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGlzQ2hlY2tlZCkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghb2JqVmFsdWUuc29tZSh4ID0+IHggPT0gdmFsdWUpKVxyXG5cdFx0XHRcdFx0XHRcdFx0b2JqVmFsdWUucHVzaCh2YWx1ZSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0b2JqVmFsdWUgPSBvYmpWYWx1ZS5maWx0ZXIoeCA9PiB4ICE9IHZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBvYmpWYWx1ZS5zb3J0KCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhbHVlID0gZmllbGQubm9kZXNbMF0udmFsdWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIXV0aWwuaXNVbmRlZmluZWQoYXJncy52YWx1ZSkpXHJcblx0XHRcdFx0XHRhcmdzLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0YXJncy5vYmplY3Rba2V5XSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHQvLyBjYWxsYmFja1xyXG5cdFx0XHRcdGlmIChfb25DaGFuZ2UpIHtcclxuXHRcdFx0XHRcdF9vbkNoYW5nZSh7XHJcblx0XHRcdFx0XHRcdGJhc2VOb2RlOiBfaW50ZXJmYWNlKF9fYmFzZU5vZGUpLFxyXG5cdFx0XHRcdFx0XHRhcmdzLFxyXG5cdFx0XHRcdFx0XHRvYmplY3Q6IGFyZ3Mub2JqZWN0LFxyXG5cdFx0XHRcdFx0XHRrZXksXHJcblx0XHRcdFx0XHRcdHZhbHVlLFxyXG5cdFx0XHRcdFx0XHRmaWVsZCxcclxuXHRcdFx0XHRcdFx0ZmllbGRzOiBfZmllbGRzLFxyXG5cdFx0XHRcdFx0XHRldmVudCxcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIG9uKGV2ZW50TmFtZSwgX2Z1bmN0aW9uLCB1c2VDYXB0dXJlID0gZmFsc2UsIF9fbm9kZXMpIHtcclxuXHRcdFx0Ly8gdXNlQ2FwdHVyZTogYm9vbGVhbiAob3BjaW9uYWwpXHJcblxyXG5cdFx0XHRfX25vZGVzLmZvckVhY2goX19ub2RlID0+XHJcblx0XHRcdFx0X19ub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudCA9PlxyXG5cdFx0XHRcdFx0X2Z1bmN0aW9uKHsgZWxlbWVudDogX2ludGVyZmFjZShfX25vZGUpLCBldmVudDogZXZlbnQgfSksIHVzZUNhcHR1cmVcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX2ludGVyZmFjZShfX25vZGVzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIFV0aWwoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRnZXRUYWdOYW1lLFxyXG5cdFx0XHR0b0xpc3QsXHJcblx0XHRcdHBhcnNlSFRNTCxcclxuXHRcdFx0aXNOdWxsLFxyXG5cdFx0XHRpc1VuZGVmaW5lZCxcclxuXHRcdFx0aXNFbXB0eSxcclxuXHRcdFx0aXNOdWxsT3JVbmRlZmluZWQsXHJcblx0XHRcdGlzTnVsbE9yVW5kZWZpbmVkT3JFbXB0eSxcclxuXHRcdFx0aXNPYmplY3QsXHJcblx0XHRcdGlzU3RyaW5nLFxyXG5cdFx0XHRpc0Jvb2xlYW4sXHJcblx0XHRcdGlzSFRNTCxcclxuXHRcdFx0aXNIVE1MRWxlbWVudCxcclxuXHRcdFx0aXNOb2RlTGlzdCxcclxuXHRcdFx0aXNBcnJheSxcclxuXHRcdFx0aXNMaXN0LFxyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBnZXRUYWdOYW1lKG5vZGUpIHtcclxuXHRcdFx0cmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA/IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpIDogJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdG9MaXN0KGVsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIGlzTm9kZUxpc3QoZWxlbWVudCkgPyBbLi4uZWxlbWVudF0gOiBpc0FycmF5KGVsZW1lbnQpID8gZWxlbWVudCA6IFtlbGVtZW50XTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBwYXJzZUhUTUwoaHRtbCkge1xyXG5cdFx0XHQvLyBSZW1vdmUgcXVlYnJhcyBkZSBsaW5oYSwgdGFidWxhXHUwMEU3XHUwMEY1ZXMgZSBzcGFcdTAwRTdvcyBkdXBsaWNhZG9zLlxyXG5cclxuXHRcdFx0cmV0dXJuIGh0bWwucmVwbGFjZSgvXFxufFxcdC9nLCAnJykucmVwbGFjZSgvICAvZywgJyAnKS50cmltKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZSA9PSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWUgPT0gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIGlzTnVsbCh2YWx1ZSkgfHwgaXNVbmRlZmluZWQodmFsdWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkT3JFbXB0eSh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gaXNOdWxsKHZhbHVlKSB8fCBpc1VuZGVmaW5lZCh2YWx1ZSkgfHwgaXNFbXB0eSh2YWx1ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yID09IE9iamVjdDtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzQm9vbGVhbih2YWx1ZSkge1xyXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlID09ICdib29sZWFuJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc0hUTUwodmFsdWUpIHtcclxuXHRcdFx0dmFsdWUgPSBwYXJzZUhUTUwodmFsdWUpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGlzU3RyaW5nKHZhbHVlKSAmJiB2YWx1ZS5zdGFydHNXaXRoKCc8JykgJiYgdmFsdWUuZW5kc1dpdGgoJz4nKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc0hUTUxFbGVtZW50KG9iaikge1xyXG5cdFx0XHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gaXNOb2RlTGlzdChvYmopIHtcclxuXHRcdFx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIE5vZGVMaXN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XHJcblx0XHRcdHJldHVybiBvYmogaW5zdGFuY2VvZiBBcnJheTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpc0xpc3QoZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gaXNOb2RlTGlzdChlbGVtZW50KSB8fCBpc0FycmF5KGVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0U3R5bGUoKSB7XHJcblx0XHRpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3R5bGUjZG9tLXN0eWxlJykpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRjb25zdCBzdHlsZSA9IHV0aWwucGFyc2VIVE1MKC8qaHRtbCovYFxyXG5cdFx0XHQ8c3R5bGUgaWQ9XCJkb20tc3R5bGVcIj5cclxuXHRcdFx0XHQuZG9tLWRpc2FibGVkIHtcclxuXHRcdFx0XHRcdG9wYWNpdHk6IC42O1xyXG5cdFx0XHRcdFx0LXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcclxuXHRcdFx0XHRcdC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XHJcblx0XHRcdFx0XHR1c2VyLXNlbGVjdDogbm9uZTtcclxuXHRcdFx0XHRcdHBvaW50ZXItZXZlbnRzOiBub25lO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0PC9zdHlsZT5cclxuXHRcdGApO1xyXG5cclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIHN0eWxlKTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsICJjb25zdCBzaGFyZWQgPSB7XHJcblx0dGVtcDogbnVsbCxcclxuXHRjb25zdGFudHM6IG51bGwsXHJcblxyXG5cdC8vIHBcdTAwRTFnaW5hc1xyXG5cdGN1cnJlbnRQYWdlOiBudWxsLFxyXG5cclxuXHQvLyBjb21wb25lbnRlc1xyXG5cdG5hdmlnYXRpb246IG51bGwsXHJcblx0YXBwQmFyOiBudWxsLFxyXG5cdGZvb3RlcjogbnVsbCxcclxuXHJcblx0Ly8gZnVuXHUwMEU3XHUwMEY1ZXNcclxuXHRzZXRDb250ZW50U2l6ZTogbnVsbCxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNoYXJlZDtcclxuIiwgImNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXJTZXJ2aWNlKCk7XHJcblxyXG5mdW5jdGlvbiBSb3V0ZXJTZXJ2aWNlKCkge1xyXG5cdGNvbnN0IF90aGlzID0gdGhpcztcclxuXHRsZXQgX3JvdXRlcztcclxuXHJcblx0dGhpcy5yb3V0ZXMgPSByb3V0ZXM7XHJcblx0dGhpcy5yb3V0ZSA9IHJvdXRlO1xyXG5cdHRoaXMubmV4dCA9IG51bGw7XHJcblx0dGhpcy5jdXJyZW50ID0gZ2V0TG9jYXRpb24oKTtcclxuXHR0aGlzLnByZXZpb3VzID0gZ2V0TG9jYXRpb24obG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3ByZXZpb3VzVXJsJykpO1xyXG5cclxuXHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIG9uSGFzaENoYW5nZSk7XHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBvbkhhc2hDaGFuZ2UpO1xyXG5cclxuXHRmdW5jdGlvbiBvbkhhc2hDaGFuZ2UoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudClcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ByZXZpb3VzVXJsJywgZXZlbnQub2xkVVJMKTtcclxuXHJcblx0XHRfdGhpcy5wcmV2aW91cyA9IGdldExvY2F0aW9uKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwcmV2aW91c1VybCcpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJvdXRlcyhyb3V0ZXMpIHtcclxuXHRcdC8qXHJcblx0XHRcdHJvdXRlczogRXguOiB7XHJcblx0XHRcdFx0J3Rhc2tzJzogVGFza3NQYWdlLFxyXG5cdFx0XHRcdCd0YXNrLz8nOiBUYXNrUGFnZSxcclxuXHRcdFx0XHQndGFzay8/L2ZpbGVzJzogVGFza0ZpbGVzUGFnZSxcclxuXHRcdFx0XHQnZXhjZXB0aW9ucyc6IEV4Y2VwdGlvbnNQYWdlLFxyXG5cdFx0XHRcdCdleGNlcHRpb24vPyc6IEV4Y2VwdGlvblBhZ2UsXHJcblx0XHRcdFx0J2hpc3RvcnknOiBIaXN0b3J5UGFnZSxcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0PzogVmFyaVx1MDBFMXZlbCAtIEV4LjogaWQsIG5hbWUsIHZhbHVlLCBvdXRyb3MuLlxyXG5cdFx0Ki9cclxuXHJcblx0XHRpZiAocm91dGVzKVxyXG5cdFx0XHRfcm91dGVzID0gcm91dGVzO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gX3JvdXRlcztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJvdXRlKCkge1xyXG5cdFx0Y29uc3QgX2xvY2F0aW9uID0gZ2V0TG9jYXRpb24oKTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHJvdXRlIGluIF9yb3V0ZXMpIHtcclxuXHRcdFx0Y29uc3Qgcm91dGVQYXJ0cyA9IHJvdXRlLnNwbGl0KCcvJyk7XHJcblx0XHRcdGxldCBwYWdlID0gX3JvdXRlc1tyb3V0ZV07XHJcblx0XHRcdGxldCBjb3VudCA9IDA7XHJcblxyXG5cdFx0XHRfbG9jYXRpb24uaGFzaFBhcnRzLmZvckVhY2goKGhhc2hQYXJ0LCBpbmRleCkgPT4ge1xyXG5cdFx0XHRcdGxldCByb3V0ZVBhcnQgPSByb3V0ZVBhcnRzW2luZGV4XTtcclxuXHJcblx0XHRcdFx0aWYgKF9sb2NhdGlvbi5oYXNoUGFydHMubGVuZ3RoID09IHJvdXRlUGFydHMubGVuZ3RoICYmIChcclxuXHRcdFx0XHRcdGhhc2hQYXJ0ID09IHJvdXRlUGFydCB8fFxyXG5cdFx0XHRcdFx0cm91dGVQYXJ0ID09ICc/J1xyXG5cdFx0XHRcdCkpIGNvdW50Kys7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYgKF9sb2NhdGlvbi5oYXNoUGFydHMubGVuZ3RoID09IGNvdW50KSB7XHJcblx0XHRcdFx0X3RoaXMuY3VycmVudCA9IF9sb2NhdGlvbjtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHBhZ2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldExvY2F0aW9uKHVybCkge1xyXG5cdFx0dXJsID0gdXJsIHx8IGxvY2F0aW9uLmhyZWY7XHJcblxyXG5cdFx0aWYgKCF1cmwubWF0Y2goLyMvKSkgcmV0dXJuO1xyXG5cclxuXHRcdGxldCBmdWxsSGFzaCA9IHVybC5zcGxpdCgnIycpWzFdO1xyXG5cdFx0bGV0IGhhc2ggPSBmdWxsSGFzaC5zcGxpdCgnJicpWzBdO1xyXG5cdFx0bGV0IHBhcmFtcyA9IGZ1bGxIYXNoLnNwbGl0KCcmJylbMV07XHJcblx0XHRsZXQgaGFzaFBhcnRzID0gaGFzaC5zcGxpdCgnLycpO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHVybCxcclxuXHRcdFx0ZnVsbEhhc2gsXHJcblx0XHRcdGhhc2gsXHJcblx0XHRcdGhhc2hQYXJ0cyxcclxuXHRcdFx0dGFyZ2V0OiBoYXNoLnN1YnN0cmluZyhoYXNoLmxhc3RJbmRleE9mKCcvJykgKyAxKSxcclxuXHRcdFx0cGFyYW1zOiBwYXJzZVBhcmFtcyhwYXJhbXMpLFxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHBhcnNlUGFyYW1zKGhhc2hQYXJhbXMpIHtcclxuXHRcdGlmICghaGFzaFBhcmFtcykgcmV0dXJuO1xyXG5cclxuXHRcdGNvbnN0IHBhcmFtcyA9IHt9O1xyXG5cclxuXHRcdGhhc2hQYXJhbXMuc3BsaXQoJyYnKS5mb3JFYWNoKHBhcmFtID0+IHtcclxuXHRcdFx0bGV0IGtleVZhbHVlID0gcGFyYW0uc3BsaXQoJz0nKTtcclxuXHJcblx0XHRcdHBhcmFtc1trZXlWYWx1ZVswXV0gPSBrZXlWYWx1ZVsxXTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBwYXJhbXM7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7XHJcbiIsICIvKlxyXG5cdENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDE3LzAzLzIwMjQuXHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUb2FzdChvcHRpb25zID0ge30pIHtcclxuXHQvKlxyXG5cdFx0b3B0aW9uczoge1xyXG5cdFx0XHRpY29uOiBzdHJpbmcgKHRleHQvaHRtbCksXHJcblx0XHRcdG1lc3NhZ2U6IHN0cmluZyAodGV4dC9odG1sKSxcclxuXHRcdFx0cG9zaXRpb246IHN0cmluZyAoJ3RvcCBsZWZ0JywgJ3RvcCBjZW50ZXInLCAndG9wIHJpZ2h0JywgJ2JvdHRvbSBsZWZ0JywgJ2JvdHRvbSBjZW50ZXInLCAnYm90dG9tIHJpZ2h0JyksXHJcblx0XHRcdHRpbWU6IGludCAoc2Vjb25kcyksXHJcblx0XHR9XHJcblx0Ki9cclxuXHJcblx0b3B0aW9ucy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gPyBvcHRpb25zLnBvc2l0aW9uIDogJ2JvdHRvbSBjZW50ZXInO1xyXG5cdG9wdGlvbnMudGltZSA9IG9wdGlvbnMudGltZSA/IG9wdGlvbnMudGltZSA6IDU7XHJcblxyXG5cdGNyZWF0ZSgpO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHQvLyBDb250YWluZXJcclxuXHRcdGxldCBfdG9hc3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvYXN0cycpO1xyXG5cclxuXHRcdGlmICghX3RvYXN0cykge1xyXG5cdFx0XHRfdG9hc3RzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRcdF90b2FzdHMuY2xhc3NOYW1lID0gJ3RvYXN0cyc7XHJcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoX3RvYXN0cyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCd0b2FzdCcpO1xyXG5cdFx0dG9hc3QuaW5uZXJIVE1MID0gLypodG1sKi9gXHJcblx0XHRcdCR7b3B0aW9ucy5pY29uID8gLypodG1sKi9gPGRpdiBjbGFzcz1cInRvYXN0LWljb25cIj48L2Rpdj5gIDogYDxzcGFuPjwvc3Bhbj5gfVxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidG9hc3QtYm9keVwiIHN0eWxlPVwiJHtvcHRpb25zLmljb24gPyAncGFkZGluZy1sZWZ0OiAwJyA6ICcnfVwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1jb250ZW50XCI+XHJcblx0XHRcdFx0XHQke29wdGlvbnMubWVzc2FnZX1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0b2FzdC1idXR0b25cIj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRvYXN0LWJ1dHRvbi1pY29uXCIgb25jbGljaz1cInRoaXMucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZSgpXCI+XHJcblx0XHRcdFx0XHQ8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cclxuXHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xOCA2IDYgMThcIj48L3BhdGg+PHBhdGggZD1cIm02IDYgMTIgMTJcIj48L3BhdGg+XHJcblx0XHRcdFx0XHQ8L3N2Zz5cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgO1xyXG5cclxuXHRcdC8vIFx1MDBDRGNvbmVcclxuXHRcdGlmIChvcHRpb25zLmljb24pIHtcclxuXHRcdFx0Y29uc3QgaWNvbiA9IHRvYXN0LnF1ZXJ5U2VsZWN0b3IoJy50b2FzdC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5pY29uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdFx0aWNvbi5hcHBlbmRDaGlsZChvcHRpb25zLmljb24pO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0aWNvbi5pbm5lckhUTUwgPSBvcHRpb25zLmljb247XHJcblxyXG5cdFx0XHR0b2FzdC5wcmVwZW5kKGljb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBvc2lcdTAwRTdcdTAwRTNvIGhvcml6b250YWxcclxuXHRcdGlmIChvcHRpb25zLnBvc2l0aW9uLm1hdGNoKCdsZWZ0JykpIHtcclxuXHRcdFx0X3RvYXN0cy5jbGFzc0xpc3QuYWRkKCdsZWZ0Jyk7XHJcblx0XHR9IGVsc2UgaWYgKG9wdGlvbnMucG9zaXRpb24ubWF0Y2goJ3JpZ2h0JykpIHtcclxuXHRcdFx0X3RvYXN0cy5jbGFzc0xpc3QuYWRkKCdyaWdodCcpO1xyXG5cdFx0fSBlbHNlICB7XHJcblx0XHRcdF90b2FzdHMuY2xhc3NMaXN0LmFkZCgnY2VudGVyJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUG9zaVx1MDBFN1x1MDBFM28gdmVydGljYWxcclxuXHRcdGlmIChvcHRpb25zLnBvc2l0aW9uLm1hdGNoKCd0b3AnKSkge1xyXG5cdFx0XHRfdG9hc3RzLmNsYXNzTGlzdC5hZGQoJ3RvcCcpO1xyXG5cclxuXHRcdFx0Ly8gQWRpY2lvbmEgZW0gY2ltYSBkbyBhbnRlcmlvclxyXG5cdFx0XHRfdG9hc3RzLnByZXBlbmQodG9hc3QpO1xyXG5cdFx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JywgJ3RvcCcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0X3RvYXN0cy5jbGFzc0xpc3QuYWRkKCdib3R0b20nKTtcclxuXHJcblx0XHRcdC8vIEFkaWNpb25hIGVtIGJhaXhvIGRvIGFudGVyaW9yXHJcblx0XHRcdF90b2FzdHMuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cdFx0XHR0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JywgJ2JvdHRvbScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJlbW92ZSBhbyB0XHUwMEU5cm1pbm8gZG8gdGVtcG8gZGUgZXhpYmlcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0Ly8gT2N1bHRhXHJcblx0XHRcdHRvYXN0LmNsYXNzTmFtZSA9IHRvYXN0LmNsYXNzTmFtZS5yZXBsYWNlKCdzaG93JywgJ2hpZGUnKTtcclxuXHJcblx0XHRcdC8vIFJlbW92ZVxyXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCA1MDApO1xyXG5cdFx0fSwgb3B0aW9ucy50aW1lICogMTAwMCk7XHJcblx0fVxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG5cdC8vIFN0eWxlXHJcblx0Ly8gbGV0IGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rI3RvYXN0Jyk7XHJcblxyXG5cdC8vIGlmIChsaW5rKSByZXR1cm47XHJcblxyXG5cdC8vIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0Ly8gbGluay5pZCA9ICd0b2FzdCc7XHJcblx0Ly8gbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0Ly8gbGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHQvLyBsaW5rLmhyZWYgPSAnLi9zdHlsZS5jc3M/dj0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblx0Ly8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmFwcGVuZENoaWxkKGxpbmspO1xyXG59KSgpO1xyXG4iLCAiLy8gUmVmLjogaHR0cHM6Ly9sdWNpZGUuZGV2XHJcblxyXG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgSWNvbiA9IG5hbWUgPT4ge1xyXG5cdGNvbnN0IGljb25zID0ge1xyXG5cdFx0ZWxsaXBzaXNWZXJ0aWNhbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJlbGxpcHNpcy12ZXJ0aWNhbFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YmVsbDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJiZWxsXCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRsb2dJbjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJsb2ctaW5cIj48L2k+LFxyXG5cdFx0bG9nT3V0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImxvZy1vdXRcIj48L2k+LFxyXG5cdFx0dXNlcjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaXJjbGUtdXNlci1yb3VuZFwiIHN0eWxlPVwic2NhbGU6IDEuMjtcIj48L2k+LFxyXG5cdFx0YWRkOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsdXNcIiBzdHlsZT1cInN0cm9rZS13aWR0aDogMS44OyBzY2FsZTogMS4yO1wiPjwvaT4sXHJcblx0XHRlZGl0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBlbmNpbFwiPjwvaT4sXHJcblx0XHRzZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2VhcmNoXCI+PC9pPixcclxuXHRcdHN0YXJ0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInBsYXlcIj48L2k+LFxyXG5cdFx0c3RvcDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJzcXVhcmVcIj48L2k+LFxyXG5cdFx0cmVmcmVzaDogPGkgY2xhc3M9XCJpY29uIHJlZnJlc2hcIiBkYXRhLWx1Y2lkZT1cInJlZnJlc2gtY3dcIj48L2k+LFxyXG5cdFx0dGFza3M6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwibGlzdC10b2RvXCIgc3R5bGU9XCJzY2FsZTogMS4zO1wiPjwvaT4sXHJcblx0XHRoaXN0b3J5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImhpc3RvcnlcIiBzdHlsZT1cInNjYWxlOiAxLjM7XCI+PC9pPixcclxuXHRcdGluZm86IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiaW5mb1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0YWxlcnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2lyY2xlLWFsZXJ0XCIgc3R5bGU9XCJzY2FsZTogMS4xO1wiPjwvaT4sXHJcblx0XHRjb3B5OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImNvcHlcIj48L2k+LFxyXG5cdFx0cGFzdGU6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2xpcGJvYXJkLXBhc3RlXCI+PC9pPixcclxuXHRcdGR1cGxpY2F0ZTogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjb3B5LWNoZWNrXCI+PC9pPixcclxuXHRcdHRyYXNoOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cInRyYXNoLTJcIj48L2k+LFxyXG5cdFx0Zm9sZGVyOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZvbGRlclwiPjwvaT4sXHJcblx0XHRmb2xkZXJTZWFyY2g6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiZm9sZGVyLXNlYXJjaFwiPjwvaT4sXHJcblx0XHRvcGVuOiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImV4dGVybmFsLWxpbmtcIj48L2k+LFxyXG5cdFx0Y2hlY2tlZDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGVja1wiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0dXA6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi11cFwiIHN0eWxlPVwic2NhbGU6IDEuMTtcIj48L2k+LFxyXG5cdFx0ZG93bjogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJjaGV2cm9uLWRvd25cIiBzdHlsZT1cInNjYWxlOiAxLjE7XCI+PC9pPixcclxuXHRcdGxlZnQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1sZWZ0XCIgc3R5bGU9XCJzY2FsZTogMS4xNTtcIj48L2k+LFxyXG5cdFx0cmlnaHQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwiY2hldnJvbi1yaWdodFwiIHN0eWxlPVwic2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGFycm93TGVmdDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJhcnJvdy1sZWZ0XCIgc3R5bGU9XCJzdHJva2Utd2lkdGg6IDEuODsgc2NhbGU6IDEuMTU7XCI+PC9pPixcclxuXHRcdGltcG9ydDogPGkgY2xhc3M9XCJpY29uXCIgZGF0YS1sdWNpZGU9XCJmaWxlLWRvd25cIj48L2k+LFxyXG5cdFx0ZXhwb3J0OiA8aSBjbGFzcz1cImljb25cIiBkYXRhLWx1Y2lkZT1cImZpbGUtdXBcIj48L2k+LFxyXG5cdFx0c2hlZXQ6IDxpIGNsYXNzPVwiaWNvblwiIGRhdGEtbHVjaWRlPVwic2hlZXRcIj48L2k+LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBpY29uc1tuYW1lXTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEljb247XHJcbiIsICJpbXBvcnQgVG9hc3QgZnJvbSAnLi4vbGliL1RvYXN0L1RvYXN0JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IHdlYkFQSSA9IG5ldyBXZWJBUElTZXJ2aWNlKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB3ZWJBUEk7XHJcblxyXG5mdW5jdGlvbiBXZWJBUElTZXJ2aWNlKCkge1xyXG5cdC8qXHJcblx0XHRSZXRvcm5vIHBhZHJcdTAwRTNvIGRhcyBmdW5cdTAwRTdcdTAwRjVlcyAtPiB7IHJlc3VsdCwgZXJyb3IgfVxyXG5cdCovXHJcblxyXG5cdHRoaXMuZ2V0Q29uc3RhbnRzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRDb25zdGFudHMnIH0pO1xyXG5cclxuXHQvLyB1dGlsc1xyXG5cdHRoaXMuY29weUNsaXAgPSB0ZXh0ID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnQ29weUNsaXAnLCB0ZXh0OiB0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnJTBBJykucmVwbGFjZSgvXFx0L2csICclMDknKSB9KTtcclxuXHJcblx0Ly8gZm9sZGVyL2ZpbGVcclxuXHR0aGlzLnBhdGhJc0F2YWlsYWJsZSA9IHBhdGggPT4gX3BhdGhJc0F2YWlsYWJsZSh7IG1ldGhvZDogJ1BhdGhJc0F2YWlsYWJsZScsIHBhdGggfSk7XHJcblx0dGhpcy52aWV3SW5GaWxlRXhwbG9yZXIgPSBmaWxlT3JGb2xkZXJQYXRoID0+IF92aWV3SW5GaWxlRXhwbG9yZXIoeyBtZXRob2Q6ICdWaWV3SW5GaWxlRXhwbG9yZXInLCBmaWxlT3JGb2xkZXJQYXRoIH0pO1xyXG5cclxuXHQvLyBmb2xkZXJcclxuXHR0aGlzLmZvbGRlclBpY2tlciA9IHRpdGxlID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRm9sZGVyUGlja2VyJywgdGl0bGUgfSk7XHJcblxyXG5cdC8vIGZpbGVcclxuXHR0aGlzLmZpbGVQaWNrZXIgPSAodGl0bGUsIGZpbGVUeXBlcykgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVUeXBlcyB9KTtcclxuXHR0aGlzLnNhdmVGaWxlUGlja2VyID0gKHRpdGxlLCBmaWxlTmFtZSwgZmlsZVR5cGVzKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NhdmVGaWxlUGlja2VyJywgdGl0bGUsIGZpbGVOYW1lLCBmaWxlVHlwZXMgfSk7XHJcblx0dGhpcy5kb3dubG9hZEZpbGUgPSAodXJsLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0Rvd25sb2FkRmlsZScsIHVybCwgcGF0aCB9KTtcclxuXHR0aGlzLm9wZW5GaWxlID0gcGF0aCA9PiBfb3BlbkZpbGUoeyBtZXRob2Q6ICdPcGVuRmlsZScsIHBhdGggfSk7XHJcblxyXG5cdC8vIGRhdGE6IHRhc2tzXHJcblx0dGhpcy5uZXdUYXNrID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdOZXdUYXNrJyB9KTtcclxuXHR0aGlzLm5ld1Rhc2tGaWxlRmlsdGVySXRlbSA9ICgpID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnTmV3VGFza0ZpbGVGaWx0ZXJJdGVtJyB9KTtcclxuXHR0aGlzLmdldFRhc2tzID0gKCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRUYXNrcycgfSk7XHJcblx0dGhpcy5nZXRUYXNrQnlJZCA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnR2V0VGFza0J5SWQnLCBpZCB9KTtcclxuXHR0aGlzLmluc2VydFRhc2sgPSBpdGVtID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnSW5zZXJ0VGFzaycsIGl0ZW0gfSk7XHJcblx0dGhpcy5pbXBvcnRUYXNrcyA9IHBhdGggPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdJbXBvcnRUYXNrcycsIHBhdGggfSk7XHJcblx0dGhpcy51cGRhdGVUYXNrID0gaXRlbSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1VwZGF0ZVRhc2snLCBpdGVtIH0pO1xyXG5cdHRoaXMuZGVsZXRlVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnRGVsZXRlVGFzaycsIGlkLCBkZWxldGVIaXN0b3J5OiB0cnVlIH0pO1xyXG5cclxuXHQvLyBkYXRhOiBoaXN0b3J5XHJcblx0dGhpcy5nZXRIaXN0b3J5UGFnZWQgPSAocGFnZUluZGV4LCBsaW1pdCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdHZXRIaXN0b3J5UGFnZWQnLCBwYWdlSW5kZXgsIGxpbWl0IH0pO1xyXG5cdHRoaXMuZGVsZXRlSGlzdG9yeUV2ZW50cyA9IGlkcyA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0RlbGV0ZUhpc3RvcnlFdmVudHMnLCBpZHMgfSk7XHJcblx0dGhpcy5nZXRJdGVtc0Zyb21IaXN0b3J5RmlsZVBhZ2VkID0gKGZpbGVOYW1lLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0dldEl0ZW1zRnJvbUhpc3RvcnlGaWxlUGFnZWQnLCBmaWxlTmFtZSwgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmV4cG9ydEhpc3RvcnkgPSAoc2hlZXROYW1lLCBwYXRoKSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0V4cG9ydEhpc3RvcnknLCBzaGVldE5hbWUsIHBhdGggfSk7XHJcblx0dGhpcy5leHBvcnRIaXN0b3J5RmlsZXMgPSAoZmlsZU5hbWUsIHNoZWV0TmFtZSwgcGF0aCkgPT4gX3JlcXVlc3RBUEkoeyBtZXRob2Q6ICdFeHBvcnRIaXN0b3J5RmlsZXMnLCBmaWxlTmFtZSwgc2hlZXROYW1lLCBwYXRoIH0pO1xyXG5cclxuXHQvLyB0YXNrXHJcblx0dGhpcy5zZWFyY2hUYXNrRmlsZXNQYWdlZCA9IChpdGVtLCBlbmFibGVFeGNlcHRpb25zLCBwYWdlSW5kZXgsIGxpbWl0KSA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ1NlYXJjaFRhc2tGaWxlc1BhZ2VkJywgaXRlbSwgZW5hYmxlRXhjZXB0aW9ucywgcGFnZUluZGV4LCBsaW1pdCB9KTtcclxuXHR0aGlzLmlzVGFza1J1bm5pbmcgPSBpZCA9PiBfcmVxdWVzdEFQSSh7IG1ldGhvZDogJ0lzVGFza1J1bm5pbmcnLCBpZCB9KTtcclxuXHR0aGlzLnN0YXJ0VGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RhcnRUYXNrJywgaWQgfSk7XHJcblx0dGhpcy5zdG9wVGFzayA9IGlkID0+IF9yZXF1ZXN0QVBJKHsgbWV0aG9kOiAnU3RvcFRhc2snLCBpZCB9KTtcclxuXHJcblxyXG5cdC8vIEZVTlx1MDBDN1x1MDBENUVTXHJcblxyXG5cdGZ1bmN0aW9uIF9yZXF1ZXN0QVBJKHBhcmFtcyA9IHt9KSB7XHJcblx0XHRyZXR1cm4gZmV0Y2goJy9hcGknLCB7XHJcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShwYXJhbXMpXHJcblx0XHR9KS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfcGF0aElzQXZhaWxhYmxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IGlzQXZhaWxhYmxlIH0gPSBhd2FpdCBfcmVxdWVzdEFQSShwYXJhbXMpO1xyXG5cclxuXHRcdGlmICghaXNBdmFpbGFibGUpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgaW52YWxpZCBvciBhY2Nlc3MgaXMgZGVuaWVkLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGlzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gX29wZW5GaWxlKHBhcmFtcykge1xyXG5cdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0VG9hc3Qoe1xyXG5cdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRtZXNzYWdlOiAnVW5hYmxlIHRvIG9wZW4gdGhlIGZpbGUuIFBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUgZGlyZWN0b3J5IGFuZCB2ZXJpZnkgaXRzIGNvbnRlbnRzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA2XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBfdmlld0luRmlsZUV4cGxvcmVyKHBhcmFtcykge1xyXG5cdFx0aWYgKHBhcmFtcy5maWxlT3JGb2xkZXJQYXRoLmxlbmd0aCA8PSAyNjApIHtcclxuXHRcdFx0Y29uc3QgeyBlcnJvciB9ID0gYXdhaXQgX3JlcXVlc3RBUEkocGFyYW1zKTtcclxuXHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0XHRcdG1lc3NhZ2U6IGVycm9yLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHRcdHRpbWU6IDQsXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRpY29uOiBJY29uKCdpbmZvJyksXHJcblx0XHRcdFx0bWVzc2FnZTogJ0Nhbm5vdCBvcGVuIGZvbGRlcjogcGF0aCBleGNlZWRzIDI2MCBjaGFyYWN0ZXJzLicsXHJcblx0XHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0XHR0aW1lOiA0LFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBQYWdlTGF5b3V0ID0gKHsgbmF2aWdhdGlvbiwgYXBwQmFyLCBmb290ZXIgfSkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwibGF5b3V0XCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJuYXZpZ2F0aW9uXCI+XHJcblx0XHRcdFx0e25hdmlnYXRpb24gPyBuYXZpZ2F0aW9uLmVsZW1lbnQubm9kZXNbMF0gOiAnJ31cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJtYWluXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImFwcGJhciBiYlwiPlxyXG5cdFx0XHRcdFx0e2FwcEJhciA/IGFwcEJhci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInBhZ2VcIj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJoZWFkZXJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJhY3Rpb25iYXIgYmJcIj48L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb250ZW50XCI+PC9kaXY+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlciBidFwiPlxyXG5cdFx0XHRcdFx0e2Zvb3RlciA/IGZvb3Rlci5lbGVtZW50Lm5vZGVzWzBdIDogJyd9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRlbGVtZW50czoge1xyXG5cdFx0XHRuYXZpZ2F0aW9uOiAkcm9vdC5nZXQoJy5uYXZpZ2F0aW9uJyksXHJcblx0XHRcdGFwcEJhcjogJHJvb3QuZ2V0KCcubWFpbiAuYXBwYmFyJyksXHJcblx0XHRcdHBhZ2U6ICRyb290LmdldCgnLnBhZ2UnKSxcclxuXHRcdFx0aGVhZGVyOiAkcm9vdC5nZXQoJy5wYWdlIC5oZWFkZXInKSxcclxuXHRcdFx0YWN0aW9uQmFyOiAkcm9vdC5nZXQoJy5wYWdlIC5hY3Rpb25iYXInKSxcclxuXHRcdFx0Y29udGVudDogJHJvb3QuZ2V0KCcucGFnZSAuY29udGVudCcpLFxyXG5cdFx0XHRmb290ZXI6ICRyb290LmdldCgnLm1haW4gLmZvb3RlcicpLFxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZUxheW91dDtcclxuIiwgIi8qXHJcblx0Q3JpYWRvIHBvciBKYW5kZXJzb24gQ29zdGEgZW0gIDA3LzAxLzIwMjQuXHJcblx0RGVzY3JpXHUwMEU3XHUwMEUzbzogTWVudSBkZSBjb250ZXh0byBzaW1wbGVzLlxyXG4qL1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0dHJpZ2dlcjogbnVsbCwgLy8gSFRNTEVsZW1lbnQgKGV4LjogYnV0dG9uIHwgYSB8IGRpdilcclxuXHRpdGVtczogW10sIC8vIFt7IGljb246IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcsIG9uQ2xpY2s6IGZ1bmN0aW9uIH1dXHJcblx0YWxpZ246ICdsZWZ0JywgLy8gbGVmdCB8IHJpZ2h0XHJcblx0dG9wOiAwLCAvLyBBanVzdGUgZGUgcG9zaVx1MDBFN1x1MDBFM29vIHZlcnRpY2FsIHF1YW5kbyBuZWNlc3NcdTAwRTFyaW9cclxuXHRvblNob3c6IG51bGwsXHJcblx0b25IaWRlOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWVudShvcHRpb25zKSB7XHJcblx0b3B0aW9ucyA9IHtcclxuXHRcdC4uLmRlZmF1bHRPcHRpb25zLFxyXG5cdFx0Li4ub3B0aW9ucyxcclxuXHR9O1xyXG5cclxuXHRsZXQgJG1lbnU7XHJcblx0bGV0IF9jbGFzc1Zpc2libGUgPSAnJztcclxuXHRsZXQgX2NsYXNzSW52aXNpYmxlID0gJyc7XHJcblxyXG5cdGlmIChvcHRpb25zLnRyaWdnZXIpIHtcclxuXHRcdG9wdGlvbnMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdHNob3coKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgX2NvbnRleHQgPSB7XHJcblx0XHRvcHRpb25zLFxyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGl0ZW06IF9pdGVtLFxyXG5cdFx0c2hvdyxcclxuXHRcdGhpZGUsXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIF9jb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRtZW51LmNsYXNzTmFtZSA9ICdjdHgtbWVudSc7XHJcblx0XHQkbWVudS5pbm5lckhUTUwgPSAvKmh0bWwqL2Ake29wdGlvbnMuaXRlbXMubWFwKGl0ZW0gPT4ge1xyXG5cdFx0XHRpZiAoaXRlbS5kaXZpZGVyKSB7XHJcblx0XHRcdFx0cmV0dXJuICgvKmh0bWwqL2BcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGl2aWRlclwiPjwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAoLypodG1sKi9gXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY3R4LWl0ZW1cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImN0eC1pY29uXCI+PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtdGV4dFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtbmFtZVwiPiR7aXRlbS5uYW1lfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjdHgtZGVzY3JpcHRpb25cIj4ke2l0ZW0uZGVzY3JpcHRpb24gfHwgJyd9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0YCk7XHJcblx0XHRcdH1cclxuXHRcdH0pLmpvaW4oJycpfWA7XHJcblxyXG5cdFx0Ly8gSXRlbnNcclxuXHRcdCRtZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IGRpdicpLmZvckVhY2goKCRpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRjb25zdCBpdGVtID0gb3B0aW9ucy5pdGVtc1tpbmRleF07XHJcblx0XHRcdGNvbnN0IGljb24gPSBpdGVtLmljb247XHJcblxyXG5cdFx0XHQkaXRlbS5kYXRhID0gaXRlbTtcclxuXHRcdFx0aXRlbS5lbGVtZW50ID0gJGl0ZW07XHJcblxyXG5cdFx0XHQvLyBcdTAwQ0Rjb25lXHJcblx0XHRcdGlmIChpY29uKSB7XHJcblx0XHRcdFx0Y29uc3QgJGljb24gPSAkaXRlbS5xdWVyeVNlbGVjdG9yKCcuY3R4LWljb24nKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBpY29uID09ICdzdHJpbmcnKVxyXG5cdFx0XHRcdFx0JGljb24uaW5uZXJIVE1MID0gaWNvbjtcclxuXHRcdFx0XHRlbHNlIGlmIChpY29uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcblx0XHRcdFx0XHQkaWNvbi5hcHBlbmRDaGlsZChpY29uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRXZlbnRvXHJcblx0XHRcdGlmIChpdGVtLmRpdmlkZXIgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0JGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XHJcblx0XHRcdFx0XHRoaWRlKCk7XHJcblx0XHJcblx0XHRcdFx0XHRpZiAoaXRlbS5vbkNsaWNrKVxyXG5cdFx0XHRcdFx0XHRpdGVtLm9uQ2xpY2soZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRfY29udGV4dC5lbGVtZW50ID0gJG1lbnU7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCRtZW51KTtcclxuXHJcblx0XHRyZXR1cm4gJG1lbnU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfaXRlbShuYW1lKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRnZXQsXHJcblx0XHRcdGljb24sXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0cmV0dXJuIG9wdGlvbnMuaXRlbXMuZmluZCh4ID0+IHgubmFtZSA9PSBuYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBpY29uKGVsZW1lbnQpIHtcclxuXHRcdFx0Y29uc3QgJGl0ZW0gPSBnZXQoKS5lbGVtZW50O1xyXG5cdFx0XHRjb25zdCAkaWNvblBsYWNlID0gJGl0ZW0ucXVlcnlTZWxlY3RvcignLmN0eC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZiAoZWxlbWVudCkge1xyXG5cdFx0XHRcdCRpY29uUGxhY2UuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRcdFx0JGljb25QbGFjZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuXHRcdFx0fSBlbHNlIGlmIChlbGVtZW50ID09ICcnKSB7XHJcblx0XHRcdFx0JGljb25QbGFjZS5pbm5lckhUTUwgPSAnJztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gJGljb25QbGFjZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhldmVudCA9IHt9KSB7XHJcblx0XHRsZXQgeDtcclxuXHRcdGxldCB5O1xyXG5cclxuXHRcdGRlc3Ryb3koKTtcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xpY2soKTsgLy8gRGVzdHJvaSBvdXRyb3MgbWVudXNcclxuXHRcdCRtZW51ID0gY3JlYXRlKCk7XHJcblx0XHRfY2xhc3NWaXNpYmxlID0gJ2N0eC1tZW51LXZpc2libGUtbGVmdCc7XHJcblx0XHRfY2xhc3NJbnZpc2libGUgPSAnY3R4LW1lbnUtaW52aXNpYmxlLWxlZnQnO1xyXG5cclxuXHRcdC8vIEJvdFx1MDBFM28gZGlyZWl0byBkbyBtb3VzZVxyXG5cdFx0aWYgKGV2ZW50LnR5cGUgPT0gJ2NvbnRleHRtZW51Jykge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBJbXBlZGUgcXVlIG8gbWVudSBkZSBjb250ZXh0byBuYXRpdm8gZG8gbmF2ZWdhZG9yIHNlamEgYWJlcnRvXHJcblxyXG5cdFx0XHQvLyBDb29yZGVuYWRhcyBkbyBjdXJzb3JcclxuXHRcdFx0eCA9IGV2ZW50Lng7XHJcblx0XHRcdHkgPSBldmVudC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBvc2lcdTAwRTdcdTAwRTNvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgLy8gUGFyYSBxdWUgd2luZG93IGNsaWNrIG5cdTAwRTNvIGZlY2hlIG8gbWVudVxyXG5cdFx0XHRpZiAob3B0aW9ucy50cmlnZ2VyKSB7XHJcblx0XHRcdFx0Y29uc3QgdHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlcjtcclxuXHJcblx0XHRcdFx0Ly8gQ2FudG8gaW5mZXJpb3IgZXNxdWVyZG8gZG8gdHJpZ2dlclxyXG5cdFx0XHRcdHggPSB0cmlnZ2VyLm9mZnNldExlZnQ7XHJcblx0XHRcdFx0eSA9IHRyaWdnZXIub2Zmc2V0VG9wICsgdHJpZ2dlci5vZmZzZXRIZWlnaHQgKyAxO1xyXG5cclxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGlnbiA9PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQvLyBDYW50byBpbmZlcmlvciBkaXJlaXRvIGRvIHRyaWdnZXJcclxuXHRcdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGggKyB0cmlnZ2VyLm9mZnNldFdpZHRoIC0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh4ICsgJG1lbnUub2Zmc2V0V2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG5cdFx0XHRcdHggPSB4IC0gJG1lbnUub2Zmc2V0V2lkdGg7XHJcblxyXG5cdFx0XHRcdF9jbGFzc1Zpc2libGUgPSAnY3R4LW1lbnUtdmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdFx0X2NsYXNzSW52aXNpYmxlID0gJ2N0eC1tZW51LWludmlzaWJsZS1yaWdodCc7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh5ICsgJG1lbnUub2Zmc2V0SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0ID4gMClcclxuXHRcdFx0XHR5ID0gd2luZG93LmlubmVySGVpZ2h0IC0gJG1lbnUub2Zmc2V0SGVpZ2h0O1xyXG5cclxuXHRcdFx0JG1lbnUuY2xhc3NOYW1lID0gJ2N0eC1tZW51JztcclxuXHRcdFx0JG1lbnUuY2xhc3NMaXN0LmFkZChfY2xhc3NWaXNpYmxlKTtcclxuXHRcdFx0JG1lbnUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG5cdFx0XHQkbWVudS5zdHlsZS50b3AgPSBvcHRpb25zLnRvcCArIHkgKyAncHgnO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMub25TaG93KVxyXG5cdFx0XHRcdG9wdGlvbnMub25TaG93KF9jb250ZXh0KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGUpO1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGlkZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoaWRlKGV2ZW50KSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0aWYgKGV2ZW50KSB7XHJcblx0XHRcdGlmICghKCFldmVudC50YXJnZXQuY2xvc2VzdCgnLmN0eC1tZW51JykgfHwgZXZlbnQua2V5ID09ICdFc2NhcGUnKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JG1lbnUuY2xhc3NMaXN0LnJlbW92ZShfY2xhc3NWaXNpYmxlKTtcclxuXHRcdCRtZW51LmNsYXNzTGlzdC5hZGQoX2NsYXNzSW52aXNpYmxlKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkhpZGUpXHJcblx0XHRcdG9wdGlvbnMub25IaWRlKF9jb250ZXh0KTtcclxuXHJcblx0XHRzZXRUaW1lb3V0KGRlc3Ryb3ksIDIwMCk7XHJcblxyXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoaWRlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcblx0XHRpZiAoISRtZW51KSByZXR1cm47XHJcblxyXG5cdFx0JG1lbnUucmVtb3ZlKCk7XHJcblx0XHQkbWVudSA9IG51bGw7XHJcblx0fVxyXG59O1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vSWNvbic7XHJcblxyXG5jb25zdCBBcHBCYXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJBcHBCYXIgZmxleCBqdXN0aWZ5LWJldHdlZW4gdy1mdWxsXCI+XHJcblx0XHRcdDxkaXY+PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yXCI+XHJcblx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwIG5vdGlmaWNhdGlvblwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ2JlbGwnKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTAgdXNlclwiPlxyXG5cdFx0XHRcdFx0e0ljb24oJ3VzZXInKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRzZXQoKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHNldCgpIHtcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiAkcm9vdC5nZXQoJ2J1dHRvbi51c2VyJykubm9kZXNbMF0sXHJcblx0XHRcdGFsaWduOiAncmlnaHQnLFxyXG5cdFx0XHR0b3A6IDEsXHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnVXNlciBuYW1lJywgaWNvbjogSWNvbigndXNlcicpLCBkZXNjcmlwdGlvbjogJ01hbmFnZSB5b3VyIGFwcCBhY2NvdW50LicsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IGRpdmlkZXI6IHRydWUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdMb2cgb3V0JywgaWNvbjogSWNvbignbG9nT3V0JyksIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdBYm91dCcsIG9uQ2xpY2s6IG51bGwgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHBCYXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgTmF2aWdhdGlvbiA9IChpdGVtcyA9IFtdKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJOYXZpZ2F0aW9uXCI+XHJcblx0XHRcdDxkaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImhlYWRlclwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImxvZ29cIj5cclxuXHRcdFx0XHRcdFx0PGltZyBzcmM9XCJsb2dvLnN2Z1wiIC8+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cInRpdGxlXCI+XHJcblx0XHRcdFx0XHRcdEltYWdlUHJlc3NvclxyXG5cdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiaXRlbXNcIj57XHJcblx0XHRcdFx0XHRpdGVtcy5tYXAoaXRlbSA9PlxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPXtpdGVtLmhyZWZ9IGNsYXNzPVwiaXRlbVwiIGRhdGEta2V5d29yZD17aXRlbS5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHR7aXRlbS5pY29ufVxyXG5cdFx0XHRcdFx0XHRcdDxsYWJlbD57aXRlbS50aXRsZX08L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHQ8L2E+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fTwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlclwiPlxyXG5cdFx0XHRcdFZlcnNpb24gMS4wLjFcclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRzZXRBY3RpdmUsXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gc2V0QWN0aXZlKCkge1xyXG5cdFx0JHJvb3QuZ2V0KCcuaXRlbScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG5cdFx0XHRjb25zdCBrZXl3b3JkID0gaXRlbS5hdHRyKCdkYXRhLWtleXdvcmQnKTtcclxuXHJcblx0XHRcdGlmIChsb2NhdGlvbi5oYXNoLm1hdGNoKGtleXdvcmQpKVxyXG5cdFx0XHRcdGl0ZW0uYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTmF2aWdhdGlvbjtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcblxyXG5jb25zdCBQYWdlRm9vdGVyID0gKCkgPT4ge1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiUGFnZUZvb3RlciBmbGV4IHctZnVsbFwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5mbyBmbGV4IGl0ZW1zLWNlbnRlclwiPjwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0aW5mbyxcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBpbmZvKHRleHRPckh0bWxPckVsZW1lbnQpIHtcclxuXHRcdGNvbnN0ICRpbmZvID0gJHJvb3QuZ2V0KCcuaW5mbycpO1xyXG5cclxuXHRcdHRleHRPckh0bWxPckVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA/ICRpbmZvLmluc2VydCh0ZXh0T3JIdG1sT3JFbGVtZW50KSA6ICRpbmZvLmh0bWwodGV4dE9ySHRtbE9yRWxlbWVudCB8fCAnJyk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZUZvb3RlcjtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IExvZ2luUGFnZSA9ICgpID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJMb2dpblBhZ2VcIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRpdGxlXCI+U2lnbiBpbiB0byB5b3VyIGFjY291bnQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkc1wiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+WW91ciBlbWFpbDwvZGl2PlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImVtYWlsXCIgcmVxdWlyZWQgc3BlbGxjaGVjaz1cImZhbHNlXCIgcGxhY2Vob2xkZXI9XCIuLi5ALi4uXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTtcIiAvPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UGFzc3dvcmQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIiByZXF1aXJlZCBwbGFjZWhvbGRlcj1cIlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlwiIHN0eWxlPVwid2lkdGg6IDEwMCU7XCIgLz5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OlwiIGNsYXNzPVwibGluayBibHVlIGxpbmstZm9yZ290XCI+XHJcblx0XHRcdFx0Rm9yZ290IHBhc3N3b3JkP1xyXG5cdFx0XHQ8L2E+XHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uLXNpZ25pblwiPlNpZ24gaW48L2J1dHRvbj5cclxuXHRcdDwvZm9ybT5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdG9uU2hvdyxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdsb2dpbi10aGVtZScpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvZ2luUGFnZTtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vSWNvbic7XHJcblxyXG5jb25zdCBQYWdlSGVhZGVyID0gKHsgcGFnZU1hcCA9IFtdLCBkZXNjcmlwdGlvbiA9ICcnLCBvbkNsaWNrQmFja0J1dHRvbiB9KSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJQYWdlSGVhZGVyXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJicmVhZGNydW1iXCI+PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJkZXNjcmlwdGlvblwiPlxyXG5cdFx0XHRcdHtkZXNjcmlwdGlvbn1cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRlbGVtZW50OiAkcm9vdCxcclxuXHRcdHNldFBhZ2VNYXAsXHJcblx0fTtcclxuXHJcblx0c2V0UGFnZU1hcChwYWdlTWFwKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIHNldFBhZ2VNYXAocGFnZU1hcCkge1xyXG5cdFx0Y29uc3QgJGJyZWFkY3J1bWIgPSAkcm9vdC5nZXQoJy5icmVhZGNydW1iJykuaHRtbCgnJyk7XHJcblxyXG5cdFx0cGFnZU1hcC5mb3JFYWNoKCgkaXRlbSwgaW5kZXgpID0+IHtcclxuXHRcdFx0JGl0ZW0gPSBkb20oJGl0ZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA/ICRpdGVtIDogPHNwYW4+eyRpdGVtfTwvc3Bhbj4pLmFkZENsYXNzKCdpdGVtJyk7XHJcblxyXG5cdFx0XHRsZXQgdGFnID0gJGl0ZW0uYXR0cigndGFnTmFtZScpO1xyXG5cclxuXHRcdFx0aWYgKHRhZyA9PSAnQScgfHwgdGFnID09ICdCVVRUT04nKVxyXG5cdFx0XHRcdCRpdGVtLmFkZENsYXNzKCdidXR0b24nLCAndy0xMCcsICdoLTEwJyk7XHJcblxyXG5cdFx0XHRpZiAocGFnZU1hcC5sZW5ndGggPT0gMSlcclxuXHRcdFx0XHQkaXRlbS5zdHlsZSgncGFkZGluZycsICcwcHgnKTtcclxuXHJcblx0XHRcdGlmIChpbmRleCA9PSBwYWdlTWFwLmxlbmd0aCAtIDEpXHJcblx0XHRcdFx0JGl0ZW0uYWRkQ2xhc3MoJ2xhc3QnKTtcclxuXHJcblx0XHRcdCRicmVhZGNydW1iLmluc2VydCgkaXRlbSk7XHJcblxyXG5cdFx0XHRpZiAoaW5kZXggPCBwYWdlTWFwLmxlbmd0aCAtIDEpXHJcblx0XHRcdFx0JGJyZWFkY3J1bWIuaW5zZXJ0KEljb24oJ3JpZ2h0JykpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9uQ2xpY2tCYWNrQnV0dG9uKSB7XHJcblx0XHRcdCRicmVhZGNydW1iLmluc2VydChcclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTAgYmFja2J1dHRvblwiIG9uQ2xpY2s9e29uQ2xpY2tCYWNrQnV0dG9ufT5cclxuXHRcdFx0XHRcdHtJY29uKCdhcnJvd0xlZnQnKX1cclxuXHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHQsIHRydWVcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWdlSGVhZGVyO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuXHJcbmNvbnN0IEFjdGlvbkJhciA9ICh7IGJ1dHRvbnMgPSBbXSB9KSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJBY3Rpb25CYXIgZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC1bMC40ZW1dXCI+XHJcblx0XHRcdHtidXR0b25zLm1hcChidXR0b24gPT4ge1xyXG5cdFx0XHRcdGlmIChidXR0b24uZGl2aWRlcikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIDxzcGFuIGNsYXNzPVwiZGl2aWRlciBoLTVcIj48L3NwYW4+O1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zdCAkYnV0dG9uID0gKFxyXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiBidXR0b24gdy0xMCBoLTEwXCIgbmFtZT17YnV0dG9uLm5hbWUgfHwgJyd9IHRpdGxlPXtidXR0b24udG9vbHRpcCB8fCAnJ30gc3R5bGU9e2J1dHRvbi5zdHlsZSB8fCAnJ30gb25DbGljaz17YnV0dG9uLm9uQ2xpY2t9PlxyXG5cdFx0XHRcdFx0XHRcdHtidXR0b24uaWNvbiB8fCAnJ31cclxuXHRcdFx0XHRcdFx0XHR7YnV0dG9uLmRpc3BsYXlOYW1lID8gPHNwYW4gY2xhc3M9XCJuYW1lXCI+e2J1dHRvbi5kaXNwbGF5TmFtZX08L3NwYW4+IDogJyd9XHJcblx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHQkYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgISFidXR0b24uZGlzYWJsZWQpO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiAkYnV0dG9uO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSl9XHJcblx0XHQ8L2Rpdj5cclxuXHQpO1xyXG5cdGNvbnN0ICRyb290ID0gZG9tKHJvb3QpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRidXR0b24sXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gYnV0dG9uKG5hbWUpIHtcclxuXHRcdGxldCAkYnV0dG9uID0gJHJvb3QuZ2V0QnlOYW1lKG5hbWUpO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGRpc2FibGUsXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZSA9IHRydWUpIHtcclxuXHRcdFx0JGJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnLCBkaXNhYmxlKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25CYXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgUm93UHJvZ3Jlc3NCYXIgPSAoKSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJSb3dQcm9ncmVzc0JhclwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiYmFyXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCI+PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidmFsdWVcIj48L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6IHJvb3QsXHJcblx0XHR1cGRhdGUsXHJcblx0XHRzaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGUocGVyY2VudCA9IDAsIHZhbHVlID0gJycpIHtcclxuXHRcdCRyb290LmdldCgnLnByb2dyZXNzJykuc3R5bGUoJ3dpZHRoJywgYCR7cGVyY2VudH0lYCk7XHJcblx0XHQkcm9vdC5nZXQoJy52YWx1ZScpLmh0bWwodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0JHJvb3Quc3R5bGUoeyB2aXNpYmlsaXR5OiBzaG93ID8gJ3Zpc2libGUnIDogJ2hpZGRlbicgfSk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm93UHJvZ3Jlc3NCYXI7XHJcbiIsICJjb25zdCB1dGlscyA9IG5ldyBVdGlscygpO1xyXG5cclxuZXhwb3J0IHsgdXRpbHMgfTtcclxuXHJcbmZ1bmN0aW9uIFV0aWxzKCkge1xyXG5cdHRoaXMuZ2VuZXJhdGVHdWlkID0gZ2VuZXJhdGVHdWlkO1xyXG5cdHRoaXMubWVyZ2VQcm9wcyA9IG1lcmdlUHJvcHM7XHJcblx0dGhpcy5nZXRFbGVtZW50SW5kZXggPSBnZXRFbGVtZW50SW5kZXg7XHJcblx0dGhpcy5jcmVhdGVSYW5nZUFycmF5ID0gY3JlYXRlUmFuZ2VBcnJheTtcclxuXHR0aGlzLmlzQXJyYXlPZkhUTUxFbGVtZW50ID0gaXNBcnJheU9mSFRNTEVsZW1lbnQ7XHJcblx0dGhpcy5wYXJzZURpbWVuc2lvbiA9IHBhcnNlRGltZW5zaW9uO1xyXG5cdHRoaXMuc2V0RWxlbWVudEF0dHIgPSBzZXRFbGVtZW50QXR0cjtcclxuXHR0aGlzLnNldEVsZW1lbnRTdHlsZSA9IHNldEVsZW1lbnRTdHlsZTtcclxuXHJcblx0ZnVuY3Rpb24gZ2VuZXJhdGVHdWlkKCkge1xyXG5cdFx0Ly8gUmV0b3JuYSByYW5kb21pY2FtZW50ZSB1bSBHVUlEIC0gRXguOiBhOTFlMzJkZi05MzUyLTQ1MjAtOWYwOS0xNzE1YTlhMGNlNDFcclxuXHJcblx0XHRjb25zdCBndWlkID0gKFsxZTZdICsgLTFlMyArIC00ZTMgKyAtOGUzICsgLTFlMTEpLnJlcGxhY2UoL1swMThdL2csIGMgPT5cclxuXHRcdFx0KGMgXiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEpKVswXSAmIDE1ID4+IGMgLyA0KS50b1N0cmluZygxNilcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gYWRpY2lvbmEgdW1hIGxldHJhIGNvbW8gcHJpbWVpcm8gY2FyYWN0ZXJlIHBhcmEgZXZpdGFyIGVycm8gbmEgZnVuXHUwMEU3XHUwMEUzbyBxdWVyeVNlbGVjdG9yXHJcblx0XHRyZXR1cm4gJ2EnICsgZ3VpZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlUHJvcHModGFyZ2V0LCBzb3VyY2UpIHtcclxuXHRcdGNvbnN0IG1lcmdlZCA9IHsgLi4udGFyZ2V0IH07XHJcblxyXG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcblx0XHRcdGlmIChcclxuXHRcdFx0XHRzb3VyY2Vba2V5XSBpbnN0YW5jZW9mIE9iamVjdCAmJlxyXG5cdFx0XHRcdCEoc291cmNlW2tleV0gaW5zdGFuY2VvZiBBcnJheSkgJiZcclxuXHRcdFx0XHQhKHNvdXJjZVtrZXldIGluc3RhbmNlb2YgRnVuY3Rpb24pICYmXHJcblx0XHRcdFx0IShzb3VyY2Vba2V5XSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRtZXJnZWRba2V5XSA9IG1lcmdlUHJvcHModGFyZ2V0W2tleV0gfHwge30sIHNvdXJjZVtrZXldKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtZXJnZWRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEVsZW1lbnRJbmRleCgkZWxlbWVudCkge1xyXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBBcnJheS5mcm9tKCRlbGVtZW50LnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pO1xyXG5cclxuXHRcdHJldHVybiBjaGlsZHJlbi5pbmRleE9mKCRlbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZVJhbmdlQXJyYXkoc3RhcnROdW1iZXIsIGVuZE51bWJlcikge1xyXG5cdFx0Ly8gdmVyaWZpY2EgYSBkaXJlXHUwMEU3XHUwMEUzbyBkbyBpbnRlcnZhbG8gKGNyZXNjZW50ZSBvdSBkZWNyZXNjZW50ZSlcclxuXHRcdGNvbnN0IGlzQXNjZW5kaW5nID0gc3RhcnROdW1iZXIgPD0gZW5kTnVtYmVyO1xyXG5cclxuXHRcdC8vIGNyaWEgbyBpbnRlcnZhbG9cclxuXHRcdHJldHVybiBBcnJheS5mcm9tKFxyXG5cdFx0XHR7IGxlbmd0aDogTWF0aC5hYnMoZW5kTnVtYmVyIC0gc3RhcnROdW1iZXIpICsgMSB9LFxyXG5cdFx0XHQoXywgaW5kZXgpID0+IGlzQXNjZW5kaW5nXHJcblx0XHRcdFx0PyBzdGFydE51bWJlciArIGluZGV4XHJcblx0XHRcdFx0OiBzdGFydE51bWJlciAtIGluZGV4XHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNBcnJheU9mSFRNTEVsZW1lbnQob2JqKSB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShvYmopKVxyXG5cdFx0XHRyZXR1cm4gb2JqLmV2ZXJ5KGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KTtcclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwYXJzZURpbWVuc2lvbih2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyA/IGAke3ZhbHVlfXB4YCA6IHZhbHVlIHx8ICcnO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RWxlbWVudFN0eWxlKGVsZW1lbnRzLCBhdHRyaWJ1dGVzID0ge30pIHtcclxuXHRcdHNldEVsZW1lbnRBdHRyKGVsZW1lbnRzLCBhdHRyaWJ1dGVzLCAnc3R5bGUnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEVsZW1lbnRBdHRyKGVsZW1lbnRzLCBhdHRyaWJ1dGVzID0ge30sIG9iamVjdE5hbWUgPSAnJykge1xyXG5cdFx0Ly8gYXR0cmlidXRlczogb2JqZWN0XHJcblx0XHQvLyBvYmplY3Q6IHN0cmluZyAtIGV4Ljogc3R5bGVcclxuXHJcblx0XHRlbGVtZW50cyA9IGVsZW1lbnRzIGluc3RhbmNlb2YgQXJyYXkgPyBlbGVtZW50cyA6IFtlbGVtZW50c107XHJcblxyXG5cdFx0ZWxlbWVudHMuZm9yRWFjaCh4ID0+IHtcclxuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xyXG5cdFx0XHRcdGxldCBub2RlID0gb2JqZWN0TmFtZSA/IHhbb2JqZWN0TmFtZV0gOiB4O1xyXG5cdFx0XHRcdGxldCB2YWx1ZSA9IGF0dHJpYnV0ZXNba2V5XTtcclxuXHJcblx0XHRcdFx0Ly8gdmFsb3JlcyBpbnRlaXJvcyBjb20gdW5pZGFkZSBweFxyXG5cdFx0XHRcdGlmIChvYmplY3ROYW1lID09ICdzdHlsZScpIHtcclxuXHRcdFx0XHRcdGxldCBpbXBvcnRhbnQgPSAnJztcclxuXHJcblx0XHRcdFx0XHRpZiAoIWtleS5tYXRjaCgvaW5kZXh8bGluZXxncmlkfG9yZGVyfHRhYnxvcnBoYW5zfHdpZG93c3xjb2x1bW5zfGNvdW50ZXJ8b3BhY2l0eS9pKSlcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgPyB2YWx1ZSArICdweCcgOiB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRpZiAodmFsdWUubWF0Y2goL2ltcG9ydGFudC9pKSkge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5pbmRleE9mKCchJykgLSAxKS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGltcG9ydGFudCA9ICdpbXBvcnRhbnQnO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmIChpbXBvcnRhbnQpXHJcblx0XHRcdFx0XHRcdG5vZGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgaW1wb3J0YW50KTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0bm9kZVtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHR5cGVvZiBub2RlW2tleV0gPT0gJ3VuZGVmaW5lZCcgP1xyXG5cdFx0XHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKSA6XHJcblx0XHRcdFx0XHRcdG5vZGVba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbiIsICJleHBvcnQgY2xhc3MgVGFibGVPcHRpb25zIHtcclxuXHRkYXRhID0gW107IC8qIFtcclxuXHRcdHsgZmllbGROYW1lMTogdmFsdWUsIGZpZWxkTmFtZTI6IHZhbHVlIH0sXHJcblx0XHR7IGZpZWxkTmFtZTI6IHZhbHVlLCBmaWVsZE5hbWUyOiB2YWx1ZSB9LFxyXG5cdFx0Li5cclxuXHRdICovXHJcblx0cGxhY2UgPSBudWxsOyAvLyBIVE1MRWxlbWVudFxyXG5cdGhlYWRlciA9IHtcclxuXHRcdGhpZGRlbjogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdGRpc2FibGVkOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdH07XHJcblx0Y29sdW1ucyA9IG51bGw7IC8qIHtcclxuXHRcdGZpZWxkTmFtZTE6IENvbHVtbk9wdGlvbnMsXHJcblx0XHRmaWVsZE5hbWUyOiBDb2x1bW5PcHRpb25zLFxyXG5cdFx0Li5cclxuXHR9ICovXHJcblx0cm93cyA9IHtcclxuXHRcdHNlbGVjdE9uQ2xpY2s6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRhbGxvd011bHRpcGxlU2VsZWN0aW9uOiB0cnVlLCAvLyBib29sZWFuXHJcblx0fTtcclxuXHRjZWxscyA9IG51bGw7IC8qIHtcclxuXHRcdGZpZWxkTmFtZTE6IHtcclxuXHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4geyByZXR1cm4uLiB9LFxyXG5cdFx0XHRzdHlsZTogb2JqZWN0LFxyXG5cdFx0fSxcclxuXHRcdGZpZWxkTmFtZTI6IHtcclxuXHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4geyByZXR1cm4uLiB9LFxyXG5cdFx0XHRzdHlsZTogb2JqZWN0LFxyXG5cdFx0fVxyXG5cdFx0Li5cclxuXHR9ICovXHJcblx0Ym9yZGVycyA9IHtcclxuXHRcdHRhYmxlOiB7XHJcblx0XHRcdHRvcDogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHRcdFx0Ym90dG9tOiBmYWxzZSwgLy8gYm9vbGVhblxyXG5cdFx0XHRhbGw6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRcdHJhZGl1czogbnVsbCwgLy8gcHhcclxuXHRcdH0sXHJcblx0XHRyb3dzOiB0cnVlLCAvLyBib29sZWFuXHJcblx0XHRjZWxsczogZmFsc2UsIC8vIGJvb2xlYW5cclxuXHR9O1xyXG5cdGZvb3RlciA9IHtcclxuXHRcdGhpZGRlbjogdHJ1ZSwgLy8gYm9vbGVhblxyXG5cdFx0ZGlzYWJsZWQ6IGZhbHNlLCAvLyBib29sZWFuXHJcblx0XHRjb250ZW50OiBudWxsLCAvLyBIVE1MRWxlbWVudCB8IHN0cmluZ1xyXG5cdH07XHJcblx0d2lkdGggPSBudWxsOyAvLyBudW1iZXJcclxuXHRoZWlnaHQgPSBudWxsOyAvLyBudW1iZXJcclxuXHRzdHlsZSA9IG51bGw7IC8vIG9iamVjdDogZXguOiB7IGNvbG9yOiByZWQsICdtaW4td2lkdGgnOiAxNTAgfVxyXG5cdGNoZWNrYm94ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRzb3J0ID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRyZXNpemUgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGRpc2FibGVkID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRvbkFkZFJvdyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25TZWxlY3RSb3dzID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRvblVuc2VsZWN0Um93cyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25VcGRhdGVSb3cgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uUmVtb3ZlUm93cyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25Eb3VibGVDbGlja1JvdyA9IG51bGw7IC8vIGZ1bmN0aW9uXHJcblx0b25SZXNpemVDb2x1bW4gPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uQ2xpY2tPdXQgPSBudWxsOyAvLyBmdW5jdGlvblxyXG5cdG9uQ29weUNsaXAgPSBudWxsOyAvLyBmdW5jdGlvblxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbHVtbk9wdGlvbnMge1xyXG5cdC8vIHByaXZhdGVcclxuXHRjaGVja2JveCA9IGZhbHNlOyAvLyBib29sZWFuXHJcblxyXG5cdC8vIHB1YmxpY1xyXG5cdG5hbWUgPSBudWxsOyAvLyBzdHJpbmdcclxuXHRkaXNwbGF5TmFtZSA9IG51bGw7IC8vIHN0cmluZ1xyXG5cdHdpZHRoID0gbnVsbDsgLy8gbnVtYmVyIHwgc3RyaW5nXHJcblx0bWluV2lkdGggPSBudWxsOyAvLyBudW1iZXIgfCBzdHJpbmdcclxuXHRyZXNpemUgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGhpZGRlbiA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGlzYWJsZWQgPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdHN0eWxlID0gbnVsbDsgLy8gb2JqZWN0OiBleC46IHsgY29sb3I6IHJlZCwgJ21pbi13aWR0aCc6IDE1MCB9XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ2VsbE9wdGlvbnMge1xyXG5cdC8vIHByaXZhdGVcclxuXHRyb3cgPSBudWxsOyAvLyBSb3dcclxuXHRjaGVja2JveCA9IGZhbHNlOyAvLyBib29sZWFuXHJcblx0ZGF0YSA9IG51bGw7IC8vIG9iamVjdFxyXG5cdHZhbHVlID0gbnVsbDsgLy8gYW55XHJcblxyXG5cdC8vIHB1YmxpY1xyXG5cdG5hbWUgPSBudWxsOyAvLyBzdHJpbmdcclxuXHRoaWRkZW4gPSBmYWxzZTsgLy8gYm9vbGVhblxyXG5cdGRpc2FibGVkID0gZmFsc2U7IC8vIGJvb2xlYW5cclxuXHRkaXNwbGF5ID0gbnVsbDsgLy8gZnVuY3Rpb25cclxuXHRzdHlsZSA9IG51bGw7IC8vIG9iamVjdDogZXguOiB7IGNvbG9yOiByZWQsICdtaW4td2lkdGgnOiAxNTAgfVxyXG59O1xyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHRhYmxlLCBvcHRpb25zKSB7XHJcblx0Ly8gb3B0aW9uczogQ29sdW1uT3B0aW9uc1xyXG5cclxuXHRjb25zdCAkY2VsbCA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IF9jZWxsID0ge1xyXG5cdFx0ZWxlbWVudDogJGNlbGwsXHJcblx0XHRpc0hpZGRlbjogb3B0aW9ucy5oaWRkZW4sXHJcblx0XHRpc0Rpc2FibGVkOiBvcHRpb25zLmRpc2FibGVkLFxyXG5cdFx0b3B0aW9ucyxcclxuXHRcdHNob3csXHJcblx0XHRjaGVja2VkLFxyXG5cdFx0ZGlzYWJsZSxcclxuXHR9O1xyXG5cclxuXHRzaG93KCFvcHRpb25zLmhpZGRlbik7XHJcblx0ZGlzYWJsZShvcHRpb25zLmRpc2FibGVkKTtcclxuXHJcblx0cmV0dXJuIF9jZWxsO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ2R0LWhlYWRlci1jZWxsJyk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiZHQtcm93LWNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgLz5cclxuXHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdGNvbnN0ICRjaGVja2JveCA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsJyk7XHJcblxyXG5cdFx0XHQkY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LnRhcmdldC5jaGVja2VkID9cclxuXHRcdFx0XHRcdHRhYmxlLnNlbGVjdFJvd3MoKSA6XHJcblx0XHRcdFx0XHR0YWJsZS51bnNlbGVjdFJvd3MoZXZlbnQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCRjZWxsLmRhdGFzZXQubmFtZSA9IG9wdGlvbnMubmFtZTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwibmFtZVwiPiR7b3B0aW9ucy5kaXNwbGF5TmFtZX08L2xhYmVsPlxyXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwiY29udHJvbHNcIj5cclxuXHRcdFx0XHRcdDxpIGNsYXNzPVwic29ydCBhc2NcIiB0aXRsZT1cIlNvcnRcIj48L2k+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmVzaXplclwiPjwvZGl2PlxyXG5cdFx0XHRcdDwvc3Bhbj5cclxuXHRcdFx0YCk7XHJcblxyXG5cdFx0XHRjb25zdCAkaWNvblNvcnQgPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuc29ydCcpO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMuc29ydCAmJiBvcHRpb25zLnNvcnQgIT0gZmFsc2UpIHtcclxuXHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdzb3J0YWJsZScpO1xyXG5cclxuXHRcdFx0XHQkY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRcdGlmICh0YWJsZS5oZWFkZXIuaXNEaXNhYmxlZCB8fCBfY2VsbC5pc0Rpc2FibGVkKVxyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRcdFx0dGFibGUuaGVhZGVyLmNlbGxzLmZvckVhY2goY2VsbCA9PlxyXG5cdFx0XHRcdFx0XHRjZWxsLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc29ydGVkJylcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGFzY2VuZGVudCA9ICEoJGljb25Tb3J0LmdldEF0dHJpYnV0ZSgnYXNjZW5kZW50JykgPT0gJ3RydWUnKTtcclxuXHJcblx0XHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdzb3J0ZWQnKTtcclxuXHRcdFx0XHRcdCRpY29uU29ydC5jbGFzc0xpc3QudG9nZ2xlKCdhc2MnLCBhc2NlbmRlbnQpO1xyXG5cdFx0XHRcdFx0JGljb25Tb3J0LmNsYXNzTGlzdC50b2dnbGUoJ2Rlc2MnLCAhYXNjZW5kZW50KTtcclxuXHRcdFx0XHRcdCRpY29uU29ydC5zZXRBdHRyaWJ1dGUoJ2FzY2VuZGVudCcsIGFzY2VuZGVudCk7XHJcblxyXG5cdFx0XHRcdFx0dGFibGUuc29ydChvcHRpb25zLm5hbWUsIGFzY2VuZGVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLnJlc2l6ZSB8fCBvcHRpb25zLnJlc2l6ZSlcclxuXHRcdFx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdyZXNpemFibGUnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLnN0eWxlKVxyXG5cdFx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkY2VsbCwgb3B0aW9ucy5zdHlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuYm9yZGVycy5jZWxscylcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2VsbC1ib3JkZXItcmlnaHQnKTtcclxuXHJcblx0XHRyZXR1cm4gJGNlbGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja2VkKGNoZWNrZWQgPSB0cnVlKSB7XHJcblx0XHRjb25zdCAkY2hlY2tib3ggPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuZHQtcm93LWNoZWNrYm94IGlucHV0Jyk7XHJcblxyXG5cdFx0aWYgKCRjaGVja2JveClcclxuXHRcdFx0JGNoZWNrYm94LmNoZWNrZWQgPSBjaGVja2VkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNIaWRkZW4gPSAhc2hvdztcclxuXHRcdG9wdGlvbnMuaGlkZGVuID0gX2NlbGwuaXNIaWRkZW47XHJcblxyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cclxuXHRcdHRhYmxlLl9zZXRCb3JkZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2NlbGwuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cdFx0JGNlbGwuZGF0YXNldC5kaXNhYmxlZCA9IGRpc2FibGVkOyAvLyBjb21wbGVtZW50YSBzdHlsZS5zY3NzXHJcblxyXG5cdFx0QXJyYXkuZnJvbSgkY2VsbC5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT5cclxuXHRcdFx0JGNoaWxkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpXHJcblx0XHQpO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IENvbHVtbk9wdGlvbnMgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBDb2x1bW4gfSBmcm9tICcuL0NvbHVtbi5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVyKHRhYmxlKSB7XHJcblx0Y29uc3QgX2hlYWRlciA9IHtcclxuXHRcdGVsZW1lbnQ6IG51bGwsXHJcblx0XHRjZWxsczogW10sXHJcblx0XHRpc0hpZGRlbjogZmFsc2UsXHJcblx0XHRpc0Rpc2FibGVkOiBmYWxzZSxcclxuXHRcdGNlbGwsXHJcblx0XHRzaG93LFxyXG5cdFx0ZGlzYWJsZSxcclxuXHR9O1xyXG5cdGNvbnN0ICRoZWFkZXIgPSBjcmVhdGUoKTtcclxuXHJcblx0cmV0dXJuIF9oZWFkZXI7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2R0LWhlYWRlcicpO1xyXG5cclxuXHRcdGlmICh0YWJsZS5vcHRpb25zLmNoZWNrYm94KSB7XHJcblx0XHRcdGNvbnN0IG9wdGlvbnMgPSBuZXcgQ29sdW1uT3B0aW9ucygpO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5jaGVja2JveCA9IHRydWU7XHJcblx0XHRcdG9wdGlvbnMucmVzaXplID0gZmFsc2U7XHJcblxyXG5cdFx0XHRjb25zdCBjZWxsID0gQ29sdW1uKHRhYmxlLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdF9oZWFkZXIuY2VsbHMucHVzaChjZWxsKTtcclxuXHRcdFx0JGhlYWRlci5hcHBlbmRDaGlsZChjZWxsLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoY29uc3QgbmFtZSBpbiB0YWJsZS5vcHRpb25zLmNvbHVtbnMpIHtcclxuXHRcdFx0Y29uc3QgY29sdW1uID0gdGFibGUub3B0aW9ucy5jb2x1bW5zW25hbWVdO1xyXG5cdFx0XHRjb25zdCBvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgQ29sdW1uT3B0aW9ucygpLCBjb2x1bW4pO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRcdGNvbnN0IGNlbGwgPSBDb2x1bW4odGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X2hlYWRlci5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkaGVhZGVyLmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0X2hlYWRlci5lbGVtZW50ID0gJGhlYWRlcjtcclxuXHJcblx0XHRyZXR1cm4gJGhlYWRlcjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNlbGwobmFtZU9ySW5kZXgpIHtcclxuXHRcdGNvbnN0IGNlbGwgPSB0eXBlb2YgbmFtZU9ySW5kZXggPT0gJ251bWJlcicgP1xyXG5cdFx0XHRfaGVhZGVyLmNlbGxzW25hbWVPckluZGV4XSA6XHJcblx0XHRcdF9oZWFkZXIuY2VsbHMuZmluZChjZWxsID0+IGNlbGwub3B0aW9ucy5uYW1lID09IG5hbWVPckluZGV4KTtcclxuXHJcblx0XHRyZXR1cm4gY2VsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coc2hvdyA9IHRydWUpIHtcclxuXHRcdF9oZWFkZXIuaXNIaWRkZW4gPSAhc2hvdztcclxuXHRcdCRoZWFkZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlZCA9IHRydWUpIHtcclxuXHRcdF9oZWFkZXIuaXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG5cclxuXHRcdEFycmF5LmZyb20oJGhlYWRlci5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT4ge1xyXG5cdFx0XHQkY2hpbGQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENlbGwodGFibGUsIG9wdGlvbnMpIHtcclxuXHQvLyBvcHRpb25zOiBDZWxsT3B0aW9uc1xyXG5cclxuXHRjb25zdCAkY2VsbCA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IF9jZWxsID0ge1xyXG5cdFx0ZWxlbWVudDogJGNlbGwsXHJcblx0XHRpc0hpZGRlbjogb3B0aW9ucy5oaWRkZW4sXHJcblx0XHRpc0Rpc2FibGVkOiBvcHRpb25zLmRpc2FibGVkLFxyXG5cdFx0b3B0aW9ucyxcclxuXHRcdHZhbHVlLFxyXG5cdFx0ZGlzcGxheSxcclxuXHRcdGNoZWNrZWQsXHJcblx0XHRzaG93LFxyXG5cdFx0c2hvd0NvbnRlbnQsXHJcblx0XHRkaXNhYmxlLFxyXG5cdH07XHJcblxyXG5cdHNob3coIW9wdGlvbnMuaGlkZGVuKTtcclxuXHRzaG93Q29udGVudCghb3B0aW9ucy5oaWRkZW4pO1xyXG5cdGRpc3BsYXkodmFsdWUoKSk7XHJcblxyXG5cdHJldHVybiBfY2VsbDtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkY2VsbC5jbGFzc0xpc3QuYWRkKCdkdC1ib2R5LXJvdy1jZWxsJyk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiZHQtcm93LWNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIvPlxyXG5cdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdGApO1xyXG5cclxuXHRcdFx0Y29uc3QgJGNoZWNrYm94ID0gJGNlbGwucXVlcnlTZWxlY3RvcignbGFiZWwnKTtcclxuXHJcblx0XHRcdCRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHRcdFx0JGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGV2ZW50ID0+IHtcclxuXHRcdFx0XHR0YWJsZS5oZWFkZXIuY2VsbHNbMF0uY2hlY2tlZChmYWxzZSk7XHJcblx0XHRcdFx0b3B0aW9ucy5yb3cuc2VsZWN0KGV2ZW50LnRhcmdldC5jaGVja2VkLCBldmVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb25zLnZhbHVlICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMudmFsdWUgOiAnJztcclxuXHRcdFx0Y29uc3QgY2VsbCA9IHRhYmxlLm9wdGlvbnMuY2VsbHMgPyB0YWJsZS5vcHRpb25zLmNlbGxzW29wdGlvbnMubmFtZV0gfHwge30gOiB7fTtcclxuXHJcblx0XHRcdCRjZWxsLmRhdGFzZXQubmFtZSA9IG9wdGlvbnMubmFtZTtcclxuXHRcdFx0JGNlbGwuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgLypodG1sKi9gXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInZhbHVlLWhpZGRlblwiPiR7dmFsdWV9PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInZhbHVlLWRpc3BsYXlcIj4ke3ZhbHVlfTwvZGl2PlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdGlmIChjZWxsLnN0eWxlKVxyXG5cdFx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkY2VsbCwgY2VsbC5zdHlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuYm9yZGVycy5jZWxscylcclxuXHRcdFx0JGNlbGwuY2xhc3NMaXN0LmFkZCgnY2VsbC1ib3JkZXItcmlnaHQnKTtcclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5ib3JkZXJzLnJvd3MpXHJcblx0XHRcdCRjZWxsLmNsYXNzTGlzdC5hZGQoJ2NlbGwtYm9yZGVyLWJvdHRvbScpO1xyXG5cclxuXHRcdHJldHVybiAkY2VsbDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZhbHVlKHZhbHVlKSB7XHJcblx0XHRjb25zdCAkdmFsdWUgPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcudmFsdWUtaGlkZGVuJyk7XHJcblxyXG5cdFx0aWYgKCEkdmFsdWUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdG9wdGlvbnMuZGF0YVtvcHRpb25zLm5hbWVdID0gdmFsdWU7XHJcblx0XHRcdCR2YWx1ZS52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFsdWUgPSBvcHRpb25zLnZhbHVlICE9IHVuZGVmaW5lZCA/IG9wdGlvbnMudmFsdWUgOiAkdmFsdWUudmFsdWU7XHJcblxyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNwbGF5KHZhbHVlKSB7XHJcblx0XHRjb25zdCAkZGlzcGxheSA9ICRjZWxsLnF1ZXJ5U2VsZWN0b3IoJy52YWx1ZS1kaXNwbGF5Jyk7XHJcblx0XHRjb25zdCBjZWxsID0gdGFibGUub3B0aW9ucy5jZWxscyA/IHRhYmxlLm9wdGlvbnMuY2VsbHNbb3B0aW9ucy5uYW1lXSB8fCB7fSA6IHt9O1xyXG5cclxuXHRcdGlmIChjZWxsLmRpc3BsYXkpIHtcclxuXHRcdFx0dmFsdWUgPSBjZWxsLmRpc3BsYXkoeyBpdGVtOiBvcHRpb25zLmRhdGEsIHZhbHVlIH0pO1xyXG5cdFx0XHQkZGlzcGxheS5pbm5lckhUTUwgPSAnJztcclxuXHJcblx0XHRcdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcblx0XHRcdFx0JGRpc3BsYXkuYXBwZW5kQ2hpbGQodmFsdWUpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXlPZkhUTUxFbGVtZW50KHZhbHVlKSkge1xyXG5cdFx0XHRcdHZhbHVlLmZvckVhY2goeCA9PiAkZGlzcGxheS5hcHBlbmRDaGlsZCh4KSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JGRpc3BsYXkuaW5uZXJIVE1MID0gdmFsdWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coc2hvdyA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzSGlkZGVuID0gIXNob3c7XHJcblxyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdFx0JGNlbGwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0NvbnRlbnQoc2hvdyA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzSGlkZGVuID0gIXNob3c7XHJcblxyXG5cdFx0QXJyYXkuZnJvbSgkY2VsbC5jaGlsZHJlbikuZm9yRWFjaCgkY2hpbGQgPT4ge1xyXG5cdFx0XHQkY2hpbGQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXNob3cpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja2VkKGNoZWNrZWQgPSB0cnVlKSB7XHJcblx0XHRjb25zdCAkY2hlY2tib3ggPSAkY2VsbC5xdWVyeVNlbGVjdG9yKCcuZHQtcm93LWNoZWNrYm94IGlucHV0Jyk7XHJcblxyXG5cdFx0aWYgKCRjaGVja2JveClcclxuXHRcdFx0JGNoZWNrYm94LmNoZWNrZWQgPSBjaGVja2VkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlzYWJsZShkaXNhYmxlZCA9IHRydWUpIHtcclxuXHRcdF9jZWxsLmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHJcblx0XHRBcnJheS5mcm9tKCRjZWxsLmNoaWxkcmVuKS5mb3JFYWNoKCRjaGlsZCA9PiB7XHJcblx0XHRcdCRjaGlsZC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGRpc2FibGVkKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IENlbGxPcHRpb25zIH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHsgQ2VsbCB9IGZyb20gJy4vQ2VsbC5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUm93KHRhYmxlLCBvcHRpb25zKSB7XHJcblx0Y29uc3QgX3JvdyA9IHtcclxuXHRcdGVsZW1lbnQ6IG51bGwsXHJcblx0XHRpZDogdXRpbHMuZ2VuZXJhdGVHdWlkKCksXHJcblx0XHRjZWxsczogW10sXHJcblx0XHRpc1NlbGVjdGVkOiBmYWxzZSxcclxuXHRcdGlzSGlkZGVuOiBmYWxzZSxcclxuXHRcdGlzRGlzYWJsZWQ6IGZhbHNlLFxyXG5cdFx0X2RhdGE6IG9wdGlvbnMuZGF0YSB8fCB7fSwgLy8gaW50ZXJub1xyXG5cdFx0ZGF0YSxcclxuXHRcdGNlbGwsXHJcblx0XHRpbmRleCxcclxuXHRcdHNob3csXHJcblx0XHRkaXNhYmxlLFxyXG5cdFx0c2VsZWN0LFxyXG5cdFx0dGV4dCxcclxuXHRcdHJlbW92ZSxcclxuXHR9O1xyXG5cdGNvbnN0ICRyb3cgPSBjcmVhdGUoKTtcclxuXHJcblx0X2xvYWRDZWxscygpO1xyXG5cclxuXHRyZXR1cm4gX3JvdztcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0Y29uc3QgJHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRyb3cuaWQgPSBfcm93LmlkO1xyXG5cdFx0JHJvdy5jbGFzc0xpc3QuYWRkKCdkdC1ib2R5LXJvdycpO1xyXG5cdFx0JHJvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0aWYgKCF0YWJsZS5vcHRpb25zLmNoZWNrYm94ICYmIHRhYmxlLm9wdGlvbnMucm93cy5zZWxlY3RPbkNsaWNrKVxyXG5cdFx0XHRcdHNlbGVjdCh0cnVlLCBldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdCRyb3cuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBldmVudCA9PiB7XHJcblx0XHRcdGlmICghdGFibGUub3B0aW9ucy5yb3dzLnNlbGVjdE9uQ2xpY2spXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0Ly8gaW1wZWRlIHF1ZSBvIHRleHRvIHNlamEgc2VsZWNpb25hZG9cclxuXHRcdFx0aWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pXHJcblx0XHRcdFx0d2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xyXG5cclxuXHRcdFx0aWYgKHRhYmxlLm9wdGlvbnMub25Eb3VibGVDbGlja1JvdylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uRG91YmxlQ2xpY2tSb3coeyByb3c6IF9yb3csIGV2ZW50IH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RhYmxlJywgdGFibGUub3B0aW9ucy5yb3dzLnNlbGVjdE9uQ2xpY2spO1xyXG5cclxuXHRcdF9yb3cuZWxlbWVudCA9ICRyb3c7XHJcblxyXG5cdFx0cmV0dXJuICRyb3c7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfbG9hZENlbGxzKCkge1xyXG5cdFx0aWYgKHRhYmxlLm9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0Y29uc3Qgb3B0aW9ucyA9IG5ldyBDZWxsT3B0aW9ucygpO1xyXG5cclxuXHRcdFx0b3B0aW9ucy5yb3cgPSBfcm93O1xyXG5cdFx0XHRvcHRpb25zLmNoZWNrYm94ID0gdHJ1ZTtcclxuXHRcdFx0b3B0aW9ucy5yZXNpemUgPSBmYWxzZTtcclxuXHJcblx0XHRcdGNvbnN0IGNlbGwgPSBDZWxsKHRhYmxlLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdF9yb3cuY2VsbHMucHVzaChjZWxsKTtcclxuXHRcdFx0JHJvdy5hcHBlbmRDaGlsZChjZWxsLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoY29uc3QgbmFtZSBpbiB0YWJsZS5vcHRpb25zLmNvbHVtbnMpIHtcclxuXHRcdFx0Y29uc3QgY29sdW1uID0gdGFibGUub3B0aW9ucy5jb2x1bW5zW25hbWVdO1xyXG5cdFx0XHRjb25zdCBvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgQ2VsbE9wdGlvbnMoKSwgY29sdW1uKTtcclxuXHJcblx0XHRcdG9wdGlvbnMubmFtZSA9IG5hbWU7XHJcblx0XHRcdG9wdGlvbnMuZGF0YSA9IF9yb3cuX2RhdGE7XHJcblx0XHRcdG9wdGlvbnMudmFsdWUgPSBfcm93Ll9kYXRhW25hbWVdO1xyXG5cclxuXHRcdFx0Y29uc3QgY2VsbCA9IENlbGwodGFibGUsIG9wdGlvbnMpO1xyXG5cclxuXHRcdFx0X3Jvdy5jZWxscy5wdXNoKGNlbGwpO1xyXG5cdFx0XHQkcm93LmFwcGVuZENoaWxkKGNlbGwuZWxlbWVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjZWxsKG5hbWVPckluZGV4KSB7XHJcblx0XHQvLyBSZXRvcm5hIGEgY1x1MDBFOWx1bGEgcGVsbyBub21lIG91IHBlbG8gXHUwMEVEbmRpY2UuXHJcblxyXG5cdFx0Y29uc3QgY2VsbCA9IHR5cGVvZiBuYW1lT3JJbmRleCA9PSAnbnVtYmVyJyA/XHJcblx0XHRcdF9yb3cuY2VsbHNbbmFtZU9ySW5kZXhdIDpcclxuXHRcdFx0X3Jvdy5jZWxscy5maW5kKGNlbGwgPT4gY2VsbC5vcHRpb25zLm5hbWUgPT0gbmFtZU9ySW5kZXgpO1xyXG5cclxuXHRcdHJldHVybiBjZWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW5kZXgoKSB7XHJcblx0XHRyZXR1cm4gdXRpbHMuZ2V0RWxlbWVudEluZGV4KCRyb3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X3Jvdy5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X3Jvdy5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblx0XHQkcm93LmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0KHNlbGVjdGVkID0gdHJ1ZSwgZXZlbnQpIHtcclxuXHRcdC8vIGltcGVkZSBxdWUgbyB0ZXh0byBzZWphIHNlbGVjaW9uYWRvIGNvbSBzaGlmdFxyXG5cdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHdpbmRvdy5nZXRTZWxlY3Rpb24pXHJcblx0XHRcdHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHJcblx0XHRpZiAodGFibGUub3B0aW9ucy5jaGVja2JveCkge1xyXG5cdFx0XHRfcm93LmlzU2VsZWN0ZWQgPSBzZWxlY3RlZDtcclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cyh7IHJvd3M6IHRhYmxlLnNlbGVjdGVkUm93cygpIH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdCF0YWJsZS5vcHRpb25zLnJvd3MuYWxsb3dNdWx0aXBsZVNlbGVjdGlvbiB8fFxyXG5cdFx0XHRcdCFldmVudCB8fFxyXG5cdFx0XHRcdCghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuc2hpZnRLZXkpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdHRhYmxlLnVuc2VsZWN0Um93cyhldmVudCwgZmFsc2UpO1xyXG5cdFx0XHRcdHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQgPSBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoZXZlbnQgJiYgZXZlbnQuY3RybEtleSkge1xyXG5cdFx0XHRcdC8vIGludmVydGUgYSBzZWxlXHUwMEU3XHUwMEUzbyBjb20gQ1RSTCBwcmVzc2lvbmFkb1xyXG5cdFx0XHRcdHNlbGVjdGVkID0gIV9yb3cuaXNTZWxlY3RlZDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRsZXQgaW5kZXhlcyA9IHV0aWxzLmNyZWF0ZVJhbmdlQXJyYXkodXRpbHMuZ2V0RWxlbWVudEluZGV4KHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQpLCB1dGlscy5nZXRFbGVtZW50SW5kZXgoJHJvdykpO1xyXG5cclxuXHRcdFx0XHR0YWJsZS5zZWxlY3RSb3dzKGluZGV4ZXMpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfcm93LmlzU2VsZWN0ZWQgPSBzZWxlY3RlZDtcclxuXHJcblx0XHRcdGlmICghZXZlbnQgfHwgIWV2ZW50LnNoaWZ0S2V5KVxyXG5cdFx0XHRcdHRhYmxlLl9sYXN0Um93U2VsZWN0ZWQgPSAkcm93O1xyXG5cclxuXHRcdFx0JHJvdy5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsIHNlbGVjdGVkKTtcclxuXHJcblx0XHRcdGlmICh0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uU2VsZWN0Um93cyh7IHJvd3M6IHRhYmxlLnNlbGVjdGVkUm93cygpIH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGF0YShmaWVsZHMsIG1ldGEgPSBmYWxzZSkge1xyXG5cdFx0aWYgKGZpZWxkcykge1xyXG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgaW4gZmllbGRzKSB7XHJcblx0XHRcdFx0bGV0IHZhbHVlID0gZmllbGRzW25hbWVdO1xyXG5cdFx0XHRcdGxldCBjZWxsID0gX3Jvdy5jZWxsKG5hbWUpO1xyXG5cclxuXHRcdFx0XHRjZWxsLnZhbHVlKHZhbHVlKTtcclxuXHRcdFx0XHRjZWxsLmRpc3BsYXkodmFsdWUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodGFibGUub3B0aW9ucy5vblVwZGF0ZVJvdylcclxuXHRcdFx0XHR0YWJsZS5vcHRpb25zLm9uVXBkYXRlUm93KHsgcm93OiBfcm93LCBmaWVsZHMgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyByZW1vdmUgYSBwcm9wcmllZGFkZSBtZXRhXHJcblx0XHRcdGlmICghbWV0YSlcclxuXHRcdFx0XHRyZXR1cm4gKCh7IG1ldGEsIC4uLmRhdGEgfSkgPT4gZGF0YSkoX3Jvdy5fZGF0YSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gX3Jvdy5fZGF0YTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRleHQoZmllbGROYW1lcykge1xyXG5cdFx0bGV0IGNlbGxzID0gZmllbGROYW1lcyA/IF9yb3cuY2VsbHMuZmlsdGVyKHggPT4gISFmaWVsZE5hbWVzLmZpbmQobmFtZSA9PiBuYW1lID09IHgub3B0aW9ucy5uYW1lKSkgOiBfcm93LmNlbGxzO1xyXG5cdFx0bGV0IHRleHQgPSBbXTtcclxuXHJcblx0XHRjZWxscy5mb3JFYWNoKGNlbGwgPT5cclxuXHRcdFx0dGV4dC5wdXNoKGNlbGwuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudmFsdWUtZGlzcGxheScpLmlubmVyVGV4dC50cmltKCkpXHJcblx0XHQpO1xyXG5cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cdFx0dGFibGUucmVtb3ZlUm93cyhfcm93KTtcclxuXHR9XHJcbn1cclxuIiwgImV4cG9ydCBmdW5jdGlvbiBGb290ZXIodGFibGUpIHtcclxuXHRjb25zdCAkZm9vdGVyID0gY3JlYXRlKCk7XHJcblx0Y29uc3QgX2Zvb3RlciA9IHtcclxuXHRcdGVsZW1lbnQ6ICRmb290ZXIsXHJcblx0XHRpc0hpZGRlbjogdGFibGUub3B0aW9ucy5mb290ZXIuaGlkZGVuLFxyXG5cdFx0aXNEaXNhYmxlZDogdGFibGUub3B0aW9ucy5mb290ZXIuZGlzYWJsZWQsXHJcblx0XHRzaG93LFxyXG5cdFx0ZGlzYWJsZSxcclxuXHRcdGNvbnRlbnQsXHJcblx0fTtcclxuXHJcblx0Y29udGVudCh0YWJsZS5vcHRpb25zLmZvb3Rlci5jb250ZW50KTtcclxuXHRzaG93KCFfZm9vdGVyLmlzSGlkZGVuKTtcclxuXHJcblx0cmV0dXJuIF9mb290ZXI7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdGNvbnN0ICRmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkZm9vdGVyLmNsYXNzTGlzdC5hZGQoJ2R0LWZvb3RlcicpO1xyXG5cclxuXHRcdHJldHVybiAkZm9vdGVyO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29udGVudChjb250ZW50KSB7XHJcblx0XHRpZiAoY29udGVudClcclxuXHRcdFx0JGZvb3Rlci5pbm5lckhUTUwgPSBjb250ZW50O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvdyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0X2Zvb3Rlci5pc0hpZGRlbiA9ICFzaG93O1xyXG5cdFx0JGZvb3Rlci5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc2hvdyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X2Zvb3Rlci5pc0Rpc2FibGVkID0gZGlzYWJsZWQ7XHJcblx0XHQkZm9vdGVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc2FibGVkJywgZGlzYWJsZWQpO1xyXG5cdH1cclxufVxyXG4iLCAiaW1wb3J0IHsgdXRpbHMgfSBmcm9tICcuLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEhlYWRlciB9IGZyb20gJy4vSGVhZGVyLmpzJztcclxuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9Sb3cuanMnO1xyXG5pbXBvcnQgeyBGb290ZXIgfSBmcm9tICcuL0Zvb3Rlci5qcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gVGFibGUob3B0aW9ucykge1xyXG5cdGNvbnN0IF90YWJsZSA9IHtcclxuXHRcdG9wdGlvbnMsXHJcblx0XHRpZDogb3B0aW9ucy5pZCA/ICdkdC0nICsgb3B0aW9ucy5pZCA6IHV0aWxzLmdlbmVyYXRlR3VpZCgpLFxyXG5cdFx0ZWxlbWVudDogbnVsbCxcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdHNjcm9sbGFibGU6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0aGVhZGVyOiBudWxsLFxyXG5cdFx0Ym9keToge1xyXG5cdFx0XHRlbGVtZW50OiBudWxsLFxyXG5cdFx0fSxcclxuXHRcdF9jb2x1bW5XaWR0aHM6IG51bGwsXHJcblx0XHRyb3dzOiBbXSxcclxuXHRcdF9sYXN0Um93U2VsZWN0ZWQ6IG51bGwsXHJcblx0XHRmb290ZXI6IG51bGwsXHJcblx0XHRpc0Rpc2FibGVkOiBmYWxzZSxcclxuXHRcdF9kYXRhOiBvcHRpb25zLmRhdGEgfHwgW10sXHJcblx0XHRkYXRhLFxyXG5cdFx0bG9hZCxcclxuXHRcdHJlbG9hZCxcclxuXHRcdHdpZHRoLFxyXG5cdFx0aGVpZ2h0LFxyXG5cdFx0Y29sdW1uLFxyXG5cdFx0YWRkUm93LFxyXG5cdFx0c2VsZWN0ZWRSb3dzLFxyXG5cdFx0c2VsZWN0Um93cyxcclxuXHRcdHVuc2VsZWN0Um93cyxcclxuXHRcdHJvd3NCeUZpZWxkVmFsdWUsXHJcblx0XHRtb3ZlU2VsZWN0ZWRSb3dzLFxyXG5cdFx0cmVtb3ZlUm93cyxcclxuXHRcdHJlbW92ZVNlbGVjdGVkUm93cyxcclxuXHRcdHNvcnQsXHJcblx0XHRkaXNhYmxlLFxyXG5cdFx0Y2xlYXIsXHJcblx0XHRleHBvcnQ6IF9leHBvcnQsXHJcblx0XHRfc2V0Qm9yZGVycyxcclxuXHR9O1xyXG5cdGNvbnN0ICR0YWJsZSA9IGNyZWF0ZSgpO1xyXG5cdGNvbnN0IGtleV9zdG9yZWRXaWR0aHMgPSBgJHtfdGFibGUuaWR9LXdpZHRoc2A7XHJcblxyXG5cdGNyZWF0ZUhlYWRlcigpO1xyXG5cdGNyZWF0ZUJvZHkoKTtcclxuXHRjcmVhdGVGb290ZXIoKTtcclxuXHR3aWR0aChvcHRpb25zLndpZHRoKTtcclxuXHRoZWlnaHQob3B0aW9ucy5oZWlnaHQpO1xyXG5cdGRpc2FibGUob3B0aW9ucy5kaXNhYmxlZCk7XHJcblx0bG9hZChvcHRpb25zLmRhdGEpO1xyXG5cclxuXHRyZXR1cm4gX3RhYmxlO1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQkdGFibGUuaWQgPSBfdGFibGUuaWQ7XHJcblx0XHQkdGFibGUuY2xhc3NMaXN0LmFkZCgnZHQnKTtcclxuXHJcblx0XHRjb25zdCAkc2Nyb2xsYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRzY3JvbGxhYmxlLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGFibGUnKTtcclxuXHRcdCR0YWJsZS5hcHBlbmRDaGlsZCgkc2Nyb2xsYWJsZSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS5hbGwpIHtcclxuXHRcdFx0JHRhYmxlLmNsYXNzTGlzdC5hZGQoJ3RhYmxlLWJvcmRlci1hbGwnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmJvcmRlcnMudGFibGUucmFkaXVzICE9IG51bGwpIHtcclxuXHRcdFx0XHRsZXQgcmFkaXVzID0gb3B0aW9ucy5ib3JkZXJzLnRhYmxlLnJhZGl1cztcclxuXHJcblx0XHRcdFx0JHRhYmxlLnN0eWxlLmJvcmRlclJhZGl1cyA9IHV0aWxzLnBhcnNlRGltZW5zaW9uKHJhZGl1cyk7XHJcblx0XHRcdFx0JHNjcm9sbGFibGUuc3R5bGUuYm9yZGVyUmFkaXVzID0gdXRpbHMucGFyc2VEaW1lbnNpb24ocmFkaXVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKG9wdGlvbnMuYm9yZGVycy50YWJsZS50b3ApXHJcblx0XHRcdFx0JHRhYmxlLmNsYXNzTGlzdC5hZGQoJ3RhYmxlLWJvcmRlci10b3AnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmJvcmRlcnMudGFibGUuYm90dG9tKVxyXG5cdFx0XHRcdCR0YWJsZS5jbGFzc0xpc3QuYWRkKCd0YWJsZS1ib3JkZXItYm90dG9tJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3R5bGUpXHJcblx0XHRcdHV0aWxzLnNldEVsZW1lbnRTdHlsZSgkdGFibGUsIG9wdGlvbnMuc3R5bGUpO1xyXG5cclxuXHRcdF90YWJsZS5lbGVtZW50ID0gJHRhYmxlO1xyXG5cdFx0X3RhYmxlLmVsZW1lbnRzLnNjcm9sbGFibGUgPSAkc2Nyb2xsYWJsZTtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlSGVhZGVyKCkge1xyXG5cdFx0Y29uc3QgaGVhZGVyID0gSGVhZGVyKF90YWJsZSk7XHJcblxyXG5cdFx0X3RhYmxlLmhlYWRlciA9IGhlYWRlcjtcclxuXHJcblx0XHQkdGFibGUucXVlcnlTZWxlY3RvcignLnNjcm9sbGFibGUnKS5hcHBlbmRDaGlsZChoZWFkZXIuZWxlbWVudCk7XHJcblx0XHRoZWFkZXIuc2hvdyghb3B0aW9ucy5oZWFkZXIuaGlkZGVuKTtcclxuXHRcdGhlYWRlci5kaXNhYmxlKG9wdGlvbnMuaGVhZGVyLmRpc2FibGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUJvZHkoKSB7XHJcblx0XHRjb25zdCAkYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdCRib2R5LmNsYXNzTGlzdC5hZGQoJ2R0LWJvZHknKTtcclxuXHRcdF90YWJsZS5ib2R5LmVsZW1lbnQgPSAkYm9keTtcclxuXHJcblx0XHQkdGFibGUucXVlcnlTZWxlY3RvcignLnNjcm9sbGFibGUnKS5hcHBlbmRDaGlsZCgkYm9keSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVGb290ZXIoKSB7XHJcblx0XHRpZiAob3B0aW9ucy5mb290ZXIpIHtcclxuXHRcdFx0Y29uc3QgZm9vdGVyID0gRm9vdGVyKF90YWJsZSk7XHJcblxyXG5cdFx0XHRfdGFibGUuZm9vdGVyID0gZm9vdGVyO1xyXG5cdFx0XHQkdGFibGUuYXBwZW5kQ2hpbGQoZm9vdGVyLmVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29sdW1uKG5hbWVPckluZGV4KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzaG93LFxyXG5cdFx0XHRkaXNhYmxlLFxyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBzaG93KHNob3cgPSB0cnVlKSB7XHJcblx0XHRcdF90YWJsZS5oZWFkZXIuY2VsbChuYW1lT3JJbmRleCkuc2hvdyhzaG93KTtcclxuXHRcdFx0X3RhYmxlLnJvd3MuZm9yRWFjaChyb3cgPT4gcm93LmNlbGwobmFtZU9ySW5kZXgpLnNob3coc2hvdykpO1xyXG5cclxuXHRcdFx0X3NldENvbHVtbldpZHRocygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRpc2FibGUoZGlzYWJsZWQgPSB0cnVlKSB7XHJcblx0XHRcdF90YWJsZS5oZWFkZXIuY2VsbChuYW1lT3JJbmRleCkuZGlzYWJsZShkaXNhYmxlZCk7XHJcblx0XHRcdF90YWJsZS5yb3dzLmZvckVhY2gocm93ID0+IHJvdy5jZWxsKG5hbWVPckluZGV4KS5kaXNhYmxlKGRpc2FibGVkKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB3aWR0aCh3aWR0aCkge1xyXG5cdFx0aWYgKHdpZHRoID09IHVuZGVmaW5lZClcclxuXHRcdFx0cmV0dXJuICR0YWJsZS5jbGllbnRXaWR0aDtcclxuXHJcblx0XHQkdGFibGUuc3R5bGUud2lkdGggPSB1dGlscy5wYXJzZURpbWVuc2lvbih3aWR0aCkgfHwgJ2F1dG8nO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGVpZ2h0KGhlaWdodCkge1xyXG5cdFx0aWYgKGhlaWdodCA9PSB1bmRlZmluZWQpXHJcblx0XHRcdHJldHVybiAkdGFibGUuY2xpZW50SGVpZ2h0O1xyXG5cclxuXHRcdCR0YWJsZS5zdHlsZS5oZWlnaHQgPSB1dGlscy5wYXJzZURpbWVuc2lvbihoZWlnaHQpIHx8ICdhdXRvJztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRhdGEoZGF0YSwgbWV0YSA9IGZhbHNlKSB7XHJcblx0XHRfdGFibGUuX2RhdGEgPSBkYXRhIHx8IF90YWJsZS5fZGF0YTtcclxuXHJcblx0XHQvLyByZW1vdmUgYSBwcm9wcmllZGFkZSBtZXRhXHJcblx0XHRpZiAoIW1ldGEpXHJcblx0XHRcdHJldHVybiBfdGFibGUuX2RhdGEubWFwKCh7IG1ldGEsIC4uLml0ZW0gfSkgPT4gaXRlbSk7XHJcblxyXG5cdFx0cmV0dXJuIF90YWJsZS5fZGF0YTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGxvYWQoX2RhdGEpIHtcclxuXHRcdGNsZWFyKCEhX2RhdGEpO1xyXG5cclxuXHRcdGRhdGEoX2RhdGEsIHRydWUpLmZvckVhY2goaXRlbSA9PlxyXG5cdFx0XHRhZGRSb3coaXRlbSwgZmFsc2UsIGZhbHNlKVxyXG5cdFx0KTtcclxuXHJcblx0XHRfc2V0Q29sdW1uV2lkdGhzKCk7XHJcblx0XHRfc2V0Q29sdW1uUmVzaXphYmxlKCk7XHJcblx0XHRfc2V0Qm9yZGVycygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVsb2FkKCkge1xyXG5cdFx0bG9hZCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2xlYXIoY2xlYXJEYXRhID0gdHJ1ZSkge1xyXG5cdFx0aWYgKGNsZWFyRGF0YSlcclxuXHRcdFx0ZGF0YShbXSk7XHJcblxyXG5cdFx0X3RhYmxlLnJvd3MgPSBbXTtcclxuXHRcdF90YWJsZS5ib2R5LmVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYWRkUm93KGRhdGEsIGluc2VydCA9IHRydWUsIHNldEJvcmRlcnMgPSB0cnVlKSB7XHJcblx0XHRjb25zdCByb3cgPSBSb3coX3RhYmxlLCB7IGRhdGEgfSk7XHJcblxyXG5cdFx0X3RhYmxlLnJvd3MucHVzaChyb3cpO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudC5hcHBlbmRDaGlsZChyb3cuZWxlbWVudCk7XHJcblxyXG5cdFx0ZGF0YS5tZXRhID0ge1xyXG5cdFx0XHRyb3c6IHtcclxuXHRcdFx0XHRpZDogcm93LmlkLFxyXG5cdFx0XHR9LFxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAoaW5zZXJ0KVxyXG5cdFx0XHRfdGFibGUuX2RhdGEucHVzaChkYXRhKTtcclxuXHJcblx0XHRpZiAoc2V0Qm9yZGVycylcclxuXHRcdFx0X3NldEJvcmRlcnMoKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkFkZFJvdylcclxuXHRcdFx0b3B0aW9ucy5vbkFkZFJvdyh7IHJvdyB9KTtcclxuXHJcblx0XHRyZXR1cm4gcm93O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0ZWRSb3dzKCkge1xyXG5cdFx0cmV0dXJuIF90YWJsZS5yb3dzLmZpbHRlcih4ID0+IHguaXNTZWxlY3RlZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByb3dzQnlGaWVsZFZhbHVlKGZpZWxkTmFtZSwgdmFsdWUpIHtcclxuXHRcdGlmIChmaWVsZE5hbWUgPT0gdW5kZWZpbmVkIHx8IHZhbHVlID09IHVuZGVmaW5lZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHJldHVybiBfdGFibGUucm93cy5maWx0ZXIocm93ID0+XHJcblx0XHRcdHJvdy5fZGF0YVtmaWVsZE5hbWVdID09IHZhbHVlXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0Um93cyhpbmRleGVzKSB7XHJcblx0XHQvLyBTZWxlY2lvbmEgdG9kYXMgYXMgbGluaGFzIG91IGFwZW5hcyBhcyBlc3BlY2lmaWNhZGFzLlxyXG5cclxuXHRcdGlmIChpbmRleGVzKVxyXG5cdFx0XHRpbmRleGVzID0gaW5kZXhlcyBpbnN0YW5jZW9mIEFycmF5ID8gaW5kZXhlcyA6IFtpbmRleGVzXTtcclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiB7XHJcblx0XHRcdGxldCBzZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ZXMpIHtcclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4ZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh1dGlscy5nZXRFbGVtZW50SW5kZXgocm93LmVsZW1lbnQpID09IGluZGV4ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0c2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyb3cuaXNTZWxlY3RlZCA9IHNlbGVjdGVkO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuY2hlY2tib3gpIHtcclxuXHRcdFx0XHRyb3cuY2VsbHNbMF0uY2hlY2tlZChzZWxlY3RlZCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cm93LmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBzZWxlY3RlZCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmNoZWNrYm94KVxyXG5cdFx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vblNlbGVjdFJvd3MpXHJcblx0XHRcdG9wdGlvbnMub25TZWxlY3RSb3dzKHsgcm93czogc2VsZWN0ZWRSb3dzKCkgfSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1bnNlbGVjdFJvd3MoZXZlbnQsIGNhbGxiYWNrID0gdHJ1ZSkge1xyXG5cdFx0Ly8gRGVzc2VsZWNpb25hIHRvZGFzIGFzIGxpbmhhcy5cclxuXHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cclxuXHRcdHNlbGVjdGVkUm93cygpLmZvckVhY2gocm93ID0+IHtcclxuXHRcdFx0cm93LmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0cm93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTtcclxuXHRcdFx0cm93LmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub25VbnNlbGVjdFJvd3MgJiYgY2FsbGJhY2spXHJcblx0XHRcdG9wdGlvbnMub25VbnNlbGVjdFJvd3MoeyBldmVudCB9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1vdmVTZWxlY3RlZFJvd3MoZG93biA9IHRydWUpIHtcclxuXHRcdGlmIChvcHRpb25zLnNvcnQpIHJldHVybjtcclxuXHJcblx0XHRpZiAoZG93bikge1xyXG5cdFx0XHRmb3IgKGxldCBpID0gX3RhYmxlLnJvd3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0XHRsZXQgZnJvbUluZGV4ID0gaTtcclxuXHRcdFx0XHRsZXQgdG9JbmRleCA9IGkgKyAxO1xyXG5cclxuXHRcdFx0XHRpZiAoX3RhYmxlLnJvd3NbaV0uaXNTZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0aWYgKHRvSW5kZXggPCBfdGFibGUucm93cy5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdGNoYW5nZVBvc2l0aW9uKGZyb21JbmRleCwgdG9JbmRleCk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfdGFibGUucm93cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxldCBmcm9tSW5kZXggPSBpO1xyXG5cdFx0XHRcdGxldCB0b0luZGV4ID0gaSAtIDE7XHJcblxyXG5cdFx0XHRcdGlmIChfdGFibGUucm93c1tpXS5pc1NlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRpZiAodG9JbmRleCA+PSAwKVxyXG5cdFx0XHRcdFx0XHRjaGFuZ2VQb3NpdGlvbihmcm9tSW5kZXgsIHRvSW5kZXgpO1xyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiBfdGFibGUuYm9keS5lbGVtZW50LmFwcGVuZENoaWxkKHJvdy5lbGVtZW50KSk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gY2hhbmdlUG9zaXRpb24oZnJvbUluZGV4LCB0b0luZGV4KSB7XHJcblx0XHRcdGNvbnN0IHJvdyA9IF90YWJsZS5yb3dzLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdO1xyXG5cdFx0XHRjb25zdCBpdGVtID0gX3RhYmxlLl9kYXRhLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdO1xyXG5cclxuXHRcdFx0X3RhYmxlLnJvd3Muc3BsaWNlKHRvSW5kZXgsIDAsIHJvdyk7XHJcblx0XHRcdF90YWJsZS5fZGF0YS5zcGxpY2UodG9JbmRleCwgMCwgaXRlbSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVSb3dzKHJvd3MpIHtcclxuXHRcdHJvd3MgPSByb3dzIGluc3RhbmNlb2YgQXJyYXkgPyByb3dzIDogW3Jvd3NdO1xyXG5cclxuXHRcdGlmICghcm93cy5sZW5ndGgpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRyb3dzLmZvckVhY2gocm93ID0+IHtcclxuXHRcdFx0Ly8gcm93XHJcblx0XHRcdF90YWJsZS5yb3dzLmZvckVhY2goKF9yb3csIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0aWYgKF9yb3cuaWQgPT0gcm93LmlkKVxyXG5cdFx0XHRcdFx0X3RhYmxlLnJvd3Muc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBkYXRhXHJcblx0XHRcdF90YWJsZS5fZGF0YS5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xyXG5cdFx0XHRcdGlmIChpdGVtLm1ldGEucm93LmlkID09IHJvdy5pZClcclxuXHRcdFx0XHRcdF90YWJsZS5fZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJvdy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub25SZW1vdmVSb3dzKVxyXG5cdFx0XHRvcHRpb25zLm9uUmVtb3ZlUm93cygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlU2VsZWN0ZWRSb3dzKCkge1xyXG5cdFx0cmVtb3ZlUm93cyhzZWxlY3RlZFJvd3MoKSk7XHJcblx0XHRfdGFibGUuaGVhZGVyLmNlbGxzWzBdLmNoZWNrZWQoZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc29ydChmaWVsZE5hbWUsIGFzY2VuZGluZyA9IHRydWUpIHtcclxuXHRcdF90YWJsZS5yb3dzLnNvcnQoKGEsIGIpID0+IHtcclxuXHRcdFx0Ly8gbGV0IHZhID0gYS5fZGF0YVtmaWVsZE5hbWVdO1xyXG5cdFx0XHQvLyBsZXQgdmIgPSBiLl9kYXRhW2ZpZWxkTmFtZV07XHJcblx0XHRcdGxldCB2YSA9IGEuY2VsbChmaWVsZE5hbWUpLnZhbHVlKCk7XHJcblx0XHRcdGxldCB2YiA9IGIuY2VsbChmaWVsZE5hbWUpLnZhbHVlKCk7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHZhID09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0dmEgPSBTdHJpbmcodmEpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0dmIgPSBTdHJpbmcodmIpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh2YSA8IHZiKVxyXG5cdFx0XHRcdHJldHVybiBhc2NlbmRpbmcgPyAtMSA6IDE7XHJcblxyXG5cdFx0XHRpZiAodmEgPiB2YilcclxuXHRcdFx0XHRyZXR1cm4gYXNjZW5kaW5nID8gMSA6IC0xO1xyXG5cclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9KTtcclxuXHJcblx0XHRfdGFibGUucm93cy5mb3JFYWNoKHJvdyA9PiBfdGFibGUuYm9keS5lbGVtZW50LmFwcGVuZENoaWxkKHJvdy5lbGVtZW50KSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlKGRpc2FibGVkID0gdHJ1ZSkge1xyXG5cdFx0X3RhYmxlLmlzRGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuXHRcdCR0YWJsZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGRpc2FibGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9leHBvcnQocm93cywgb3B0aW9ucyA9IHsgc2VwYXJhdG9yOiAnXFx0JyB9KSB7XHJcblx0XHQvLyBFeHBvcnRhIGFzIGxpbmhhcyBlc3BlY2lmaWNhZGFzIG91IHNlbGVjaW9uYWRhcyBwYXJhIHVtIGZvcm1hdG8gZGUgdGV4dG8gc2VwYXJhZG8gcG9yIHRhYnVsYVx1MDBFN1x1MDBFM28uXHJcblxyXG5cdFx0bGV0IHRleHQgPSAocm93cyB8fCBfdGFibGUuc2VsZWN0ZWRSb3dzKCkpLm1hcChyb3cgPT4ge1xyXG5cdFx0XHRsZXQgZmllbGROYW1lcyA9IHJvdy5jZWxscy5maWx0ZXIoeCA9PiAheC5jaGVja2JveCAmJiAheC5pc0hpZGRlbikubWFwKHggPT4geC5vcHRpb25zLm5hbWUpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJvdy50ZXh0KGZpZWxkTmFtZXMpLmpvaW4ob3B0aW9ucy5zZXBhcmF0b3IpO1xyXG5cdFx0fSkuam9pbignXFxuJyk7XHJcblxyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2V0Q29sdW1uV2lkdGhzKCkge1xyXG5cdFx0bGV0IHdpZHRocyA9IF9zdG9yZWRXaWR0aHMoKSB8fCBfdGFibGUuX2NvbHVtbldpZHRocztcclxuXHJcblx0XHRpZiAoIXdpZHRocykge1xyXG5cdFx0XHR3aWR0aHMgPSBbXTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmNoZWNrYm94KVxyXG5cdFx0XHRcdHdpZHRocy5wdXNoKCczNHB4Jyk7XHJcblxyXG5cdFx0XHRmb3IgKGxldCBuYW1lIGluIG9wdGlvbnMuY29sdW1ucykge1xyXG5cdFx0XHRcdGxldCBjb2x1bW4gPSBvcHRpb25zLmNvbHVtbnNbbmFtZV07XHJcblxyXG5cdFx0XHRcdGlmIChjb2x1bW4uaGlkZGVuKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCB3aWR0aCA9IGNvbHVtbi53aWR0aDtcclxuXHRcdFx0XHRsZXQgbWluV2lkdGggPSBjb2x1bW4ubWluV2lkdGg7XHJcblx0XHRcdFx0bGV0IG1pbk1heFdpZHRoO1xyXG5cclxuXHRcdFx0XHRpZiAoIXdpZHRoICYmICFtaW5XaWR0aCkge1xyXG5cdFx0XHRcdFx0bWluTWF4V2lkdGggPSAnMWZyJztcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHdpZHRoID09IG1pbldpZHRoKSB7XHJcblx0XHRcdFx0XHRtaW5NYXhXaWR0aCA9IHdpZHRoICsgJ3B4JztcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0d2lkdGggPSB3aWR0aCA/IHdpZHRoICsgJ3B4JyA6ICcxZnInO1xyXG5cdFx0XHRcdFx0bWluV2lkdGggPSBtaW5XaWR0aCA/IG1pbldpZHRoICsgJ3B4JyA6IHdpZHRoO1xyXG5cdFx0XHRcdFx0bWluTWF4V2lkdGggPSBgbWlubWF4KCR7bWluV2lkdGh9LCAke3dpZHRofSlgO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0d2lkdGhzLnB1c2gobWluTWF4V2lkdGgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0X3RhYmxlLl9jb2x1bW5XaWR0aHMgPSB3aWR0aHM7XHJcblx0XHRfdGFibGUuaGVhZGVyLmVsZW1lbnQuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IHdpZHRocy5qb2luKCcgJyk7XHJcblx0XHRfdGFibGUuYm9keS5lbGVtZW50LnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSB3aWR0aHMuam9pbignICcpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3NldENvbHVtblJlc2l6YWJsZSgpIHtcclxuXHRcdGNvbnN0ICRoZWFkZXIgPSBfdGFibGUuaGVhZGVyLmVsZW1lbnQ7XHJcblx0XHRjb25zdCAkaGVhZGVyQ2VsbHMgPSAkaGVhZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kdC1oZWFkZXItY2VsbDpub3QoLmhpZGRlbiknKTtcclxuXHRcdGNvbnN0ICRib2R5ID0gX3RhYmxlLmJvZHkuZWxlbWVudDtcclxuXHRcdGxldCBjdXJyZW50Q29sdW1uID0gbnVsbDtcclxuXHRcdGxldCBjdXJyZW50Q29sdW1uSW5kZXg7XHJcblx0XHRsZXQgY29sdW1uV2lkdGhzO1xyXG5cdFx0bGV0IHN0YXJ0WDtcclxuXHRcdGxldCBzdGFydFdpZHRoO1xyXG5cdFx0bGV0IGRpZmY7XHJcblx0XHRsZXQgaXNSZXNpemluZyA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICgkaGVhZGVyLmhhc1Jlc2l6ZUhhbmRsZXIpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHQkaGVhZGVyQ2VsbHMuZm9yRWFjaCgoJGNlbGwsIGluZGV4KSA9PiB7XHJcblx0XHRcdGNvbnN0ICRyZXNpemVyID0gJGNlbGwucXVlcnlTZWxlY3RvcignLnJlc2l6ZXInKTtcclxuXHJcblx0XHRcdGlmICgkcmVzaXplcikge1xyXG5cdFx0XHRcdCRyZXNpemVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHN0YXJ0UmVzaXplKGV2ZW50LCBpbmRleCwgJGNlbGwpKTtcclxuXHRcdFx0XHQkcmVzaXplci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0JGhlYWRlci5oYXNSZXNpemVIYW5kbGVyID0gdHJ1ZTtcclxuXHJcblx0XHRmdW5jdGlvbiBzdGFydFJlc2l6ZShldmVudCwgaW5kZXgsICRjb2x1bW4pIHtcclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKTtcclxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BSZXNpemUpO1xyXG5cclxuXHRcdFx0Y3VycmVudENvbHVtbiA9IF90YWJsZS5oZWFkZXIuY2VsbCgkY29sdW1uLmRhdGFzZXQubmFtZSk7XHJcblxyXG5cdFx0XHRpZiAoIW9wdGlvbnMucmVzaXplICYmICFjdXJyZW50Q29sdW1uLm9wdGlvbnMucmVzaXplKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdCRoZWFkZXIuY2xhc3NMaXN0LmFkZCgncmVzaXppbmcnKTtcclxuXHRcdFx0aXNSZXNpemluZyA9IHRydWU7XHJcblx0XHRcdGN1cnJlbnRDb2x1bW5JbmRleCA9IGluZGV4O1xyXG5cdFx0XHRzdGFydFggPSBldmVudC5wYWdlWDtcclxuXHRcdFx0Y29sdW1uV2lkdGhzID0gZ2V0Q29tcHV0ZWRTdHlsZSgkaGVhZGVyKS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJyk7XHJcblx0XHRcdHN0YXJ0V2lkdGggPSBwYXJzZUZsb2F0KGNvbHVtbldpZHRoc1tjdXJyZW50Q29sdW1uSW5kZXhdKTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZS1yZXNpemUnO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnbm9uZSc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gcmVzaXplKGUpIHtcclxuXHRcdFx0aWYgKCFpc1Jlc2l6aW5nKSByZXR1cm47XHJcblxyXG5cdFx0XHRkaWZmID0gZS5wYWdlWCAtIHN0YXJ0WDtcclxuXHJcblx0XHRcdGxldCBtaW5XaWR0aCA9IGN1cnJlbnRDb2x1bW4ub3B0aW9ucy5taW5XaWR0aCB8fCA1MDtcclxuXHRcdFx0bGV0IHdpZHRoID0gTWF0aC5tYXgobWluV2lkdGgsIHN0YXJ0V2lkdGggKyBkaWZmKTtcclxuXHJcblx0XHRcdHNldENvbHVtbldpZHRoKGN1cnJlbnRDb2x1bW5JbmRleCwgd2lkdGgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHNldENvbHVtbldpZHRoKGNvbHVtbkluZGV4LCB3aWR0aCkge1xyXG5cdFx0XHR3aWR0aCA9IHR5cGVvZiB3aWR0aCA9PSAnbnVtYmVyJyA/IHdpZHRoICsgJ3B4JyA6IHdpZHRoO1xyXG5cclxuXHRcdFx0Y29sdW1uV2lkdGhzID0gZ2V0Q29tcHV0ZWRTdHlsZSgkaGVhZGVyKS5ncmlkVGVtcGxhdGVDb2x1bW5zLnNwbGl0KCcgJyk7XHJcblx0XHRcdGNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF0gPSB3aWR0aDtcclxuXHRcdFx0JGhlYWRlci5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gY29sdW1uV2lkdGhzLmpvaW4oJyAnKTtcclxuXHRcdFx0JGJvZHkuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGNvbHVtbldpZHRocy5qb2luKCcgJyk7XHJcblx0XHRcdF90YWJsZS5fY29sdW1uV2lkdGhzID0gY29sdW1uV2lkdGhzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHN0b3BSZXNpemUoKSB7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSk7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wUmVzaXplKTtcclxuXHJcblx0XHRcdGlmICghaXNSZXNpemluZylcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRpc1Jlc2l6aW5nID0gZmFsc2U7XHJcblx0XHRcdCRoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXppbmcnKTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnJztcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJyc7XHJcblx0XHRcdF9zdG9yZWRXaWR0aHMoX3RhYmxlLl9jb2x1bW5XaWR0aHMpO1xyXG5cclxuXHRcdFx0aWYgKGRpZmYgJiYgb3B0aW9ucy5vblJlc2l6ZUNvbHVtbikge1xyXG5cdFx0XHRcdG9wdGlvbnMub25SZXNpemVDb2x1bW4oeyBjb2x1bW46IGN1cnJlbnRDb2x1bW4sIHdpZHRoczogX3RhYmxlLl9jb2x1bW5XaWR0aHMgfSk7XHJcblx0XHRcdFx0ZGlmZiA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9zdG9yZWRXaWR0aHMod2lkdGhzKSB7XHJcblx0XHRpZiAod2lkdGhzKSB7XHJcblx0XHRcdHdpZHRoc1t3aWR0aHMubGVuZ3RoIC0gMV0gPSBgbWlubWF4KCR7d2lkdGhzW3dpZHRocy5sZW5ndGggLSAxXX0sIDFmcilgOyAvLyBcdTAwRkFsdGltYSBjb2x1bmEgY29tIGxhcmd1cmEgbVx1MDBFMXhpbWFcclxuXHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleV9zdG9yZWRXaWR0aHMsIEpTT04uc3RyaW5naWZ5KHdpZHRocykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0d2lkdGhzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5X3N0b3JlZFdpZHRocyk7XHJcblxyXG5cdFx0XHRpZiAod2lkdGhzKVxyXG5cdFx0XHRcdF90YWJsZS5fY29sdW1uV2lkdGhzID0gSlNPTi5wYXJzZSh3aWR0aHMpO1xyXG5cclxuXHRcdFx0cmV0dXJuIF90YWJsZS5fY29sdW1uV2lkdGhzO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3NldEJvcmRlcnMoKSB7XHJcblx0XHRpZiAoIShcclxuXHRcdFx0ZGF0YSgpLmxlbmd0aCAmJlxyXG5cdFx0XHRfdGFibGUuaGVhZGVyICYmXHJcblx0XHRcdF90YWJsZS5ib2R5XHJcblx0XHQpKSByZXR1cm47XHJcblxyXG5cdFx0Ly8gcmVtb3ZlIGEgYm9yZGEgZGEgXHUwMEZBbHRpbWEgY1x1MDBFOWx1bGEgY29tIGEgY2xhc3NlIC52aXNpYmxlIChuXHUwMEUzbyBcdTAwRTkgcG9zc1x1MDBFRHZlbCBmYXplciBpc3NvIHZpYSBjc3MpLlxyXG5cdFx0X3RhYmxlLmhlYWRlci5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aXNpYmxlOmxhc3QtY2hpbGQnKS5jbGFzc0xpc3QucmVtb3ZlKCdjZWxsLWJvcmRlci1yaWdodCcpO1xyXG5cdFx0X3RhYmxlLmJvZHkuZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2goKCRyb3csIGluZGV4KSA9PiB7XHJcblx0XHRcdCRyb3cucXVlcnlTZWxlY3RvcignLnZpc2libGU6bGFzdC1jaGlsZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2NlbGwtYm9yZGVyLXJpZ2h0Jyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBmb290ZXJcclxuXHRcdGxldCByYWRpdXMgPSBvcHRpb25zLmZvb3Rlci5oaWRkZW4gPyAnaW5oZXJpdCcgOiAnMHB4JztcclxuXHJcblx0XHRfdGFibGUuZWxlbWVudHMuc2Nyb2xsYWJsZS5zdHlsZS5ib3JkZXJCb3R0b21MZWZ0UmFkaXVzID0gcmFkaXVzO1xyXG5cdFx0X3RhYmxlLmVsZW1lbnRzLnNjcm9sbGFibGUuc3R5bGUuYm9yZGVyYm90dG9tUmlnaHRSYWRpdXMgPSByYWRpdXM7XHJcblx0fVxyXG59XHJcbiIsICIvKlxyXG5cdENyaWFkbyBwb3IgSmFuZGVyc29uIENvc3RhIGVtIDA1LzAxLzIwMjUuXHJcbiovXHJcblxyXG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBUYWJsZU9wdGlvbnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi9jb21wb25lbnRzL1RhYmxlLmpzJztcclxuXHJcbmNvbnN0IERhdGFUYWJsZSA9IG9wdGlvbnMgPT4ge1xyXG5cdC8vIG9wdGlvbnM6IFRhYmxlT3B0aW9uc1xyXG5cclxuXHRvcHRpb25zID0gdXRpbHMubWVyZ2VQcm9wcyhuZXcgVGFibGVPcHRpb25zKCksIG9wdGlvbnMpO1xyXG5cclxuXHRjb25zdCBfdGFibGUgPSBUYWJsZShvcHRpb25zKTtcclxuXHJcblx0aWYgKG9wdGlvbnMucGxhY2UpXHJcblx0XHRvcHRpb25zLnBsYWNlLmFwcGVuZENoaWxkKF90YWJsZS5lbGVtZW50KTtcclxuXHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25XaW5kb3dDbGljayk7XHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xyXG5cclxuXHRfdGFibGUuZGVzdHJveSA9IGRlc3Ryb3k7XHJcblxyXG5cdHJldHVybiBfdGFibGU7XHJcblxyXG5cdGZ1bmN0aW9uIG9uV2luZG93Q2xpY2soZXZlbnQpIHtcclxuXHRcdGlmIChfdGFibGUuaXNEaXNhYmxlZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdC8vIHJlbW92ZSBhIHNlbGVcdTAwRTdcdTAwRTNvIGFvIGNsaWNhciBmb3JhXHJcblx0XHRpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZHQtaGVhZGVyJykgJiYgIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZHQtYm9keScpKSB7XHJcblx0XHRcdGlmIChvcHRpb25zLm9uQ2xpY2tPdXQpXHJcblx0XHRcdFx0b3B0aW9ucy5vbkNsaWNrT3V0KHsgZXZlbnQgfSk7XHJcblxyXG5cdFx0XHQvLyBldmVudC5jYW5jZWxVbnNlbGVjdFJvd3M6IGJvb2xlYW4gLSBQcm9wcmllZGFkZSBjdXN0b21pemFkYSBkZWZpbmlkYSBlbSBvcHRpb25zLm9uQ2xpY2tPdXQoKSBwYXJhIGNhbmNlbGFyIGEgZGVzc2VsZVx1MDBFN1x1MDBFM28gZGFzIGxpbmhhcy5cclxuXHRcdFx0aWYgKCFvcHRpb25zLmNoZWNrYm94ICYmICFldmVudC5jYW5jZWxVbnNlbGVjdFJvd3MpXHJcblx0XHRcdFx0X3RhYmxlLnVuc2VsZWN0Um93cyhldmVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbktleURvd24oZXZlbnQpIHtcclxuXHRcdC8vIGN0cmwrYVxyXG5cdFx0aWYgKFxyXG5cdFx0XHRldmVudC5jdHJsS2V5ICYmXHJcblx0XHRcdGV2ZW50LmtleSA9PSAnYScgJiYgKChcclxuXHRcdFx0XHRvcHRpb25zLnJvd3Muc2VsZWN0T25DbGljayAmJlxyXG5cdFx0XHRcdG9wdGlvbnMucm93cy5hbGxvd011bHRpcGxlU2VsZWN0aW9uXHJcblx0XHRcdCkgfHxcclxuXHRcdFx0XHRvcHRpb25zLmNoZWNrYm94XHJcblx0XHRcdClcclxuXHRcdCkge1xyXG5cdFx0XHQvLyBwcmV2aW5lIG8gY29tcG9ydGFtZW50byBwYWRyXHUwMEUzbyBkZSBzZWxlY2lvbmFyIHR1ZG9cclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdC8vIHNlbGVjaW9uYSB0b2RhcyBhcyBsaW5oYXMgZGEgdGFiZWxhXHJcblx0XHRcdF90YWJsZS5zZWxlY3RSb3dzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY3RybCtjXHJcblx0XHRpZiAoXHJcblx0XHRcdG9wdGlvbnMub25Db3B5Q2xpcCAmJlxyXG5cdFx0XHRldmVudC5jdHJsS2V5ICYmXHJcblx0XHRcdGV2ZW50LmtleSA9PSAnYycgJiYgKChcclxuXHRcdFx0XHRvcHRpb25zLnJvd3Muc2VsZWN0T25DbGlja1xyXG5cdFx0XHQpIHx8XHJcblx0XHRcdFx0b3B0aW9ucy5jaGVja2JveFxyXG5cdFx0XHQpXHJcblx0XHQpIHtcclxuXHRcdFx0b3B0aW9ucy5vbkNvcHlDbGlwKHsgdGV4dDogX3RhYmxlLmV4cG9ydCgpIH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGVzY1xyXG5cdFx0aWYgKGV2ZW50LmtleSA9PSAnRXNjYXBlJylcclxuXHRcdFx0X3RhYmxlLnVuc2VsZWN0Um93cyhldmVudCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZXN0cm95KCkge1xyXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25XaW5kb3dDbGljayk7XHJcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XHJcblxyXG5cdFx0X3RhYmxlLmVsZW1lbnQucmVtb3ZlKCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGF0YVRhYmxlO1xyXG4iLCAiLypcclxuXHRDcmlhZG8gcG9yIEphbmRlcnNvbiBDb3N0YSBlbSAgMjcvMDUvMjAyNC5cclxuXHREZXNjcmlcdTAwRTdcdTAwRTNvOiBDYWl4YSBkZSBkaVx1MDBFMWxvZ28gZG8gdGlwbyBtb2RhbCBzaW1wbGVzLlxyXG4qL1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0dGl0bGU6ICcnLCAvLyBzdHJpbmcsXHJcblx0Y29udGVudDogJycsIC8vIHN0cmluZy9IVE1MRWxlbWVudCxcclxuXHRidXR0b25zOiBudWxsLCAvKiBbXHJcblx0XHR7XHJcblx0XHRcdG5hbWU6ICdPSycsXHJcblx0XHRcdHByaW1hcnk6IHRydWUsXHJcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uXHJcblx0XHR9LCBcclxuXHRcdHtcclxuXHRcdFx0bmFtZTogJ0NhbmNlbGFyJyxcclxuXHRcdFx0cHJpbWFyeTogZmFsc2UsXHJcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uXHJcblx0XHR9XHJcblx0XSovXHJcblx0d2lkdGg6IDM2MCwgLy8gbnVtYmVyXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNb2RhbChvcHRpb25zKSB7XHJcblx0b3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcclxuXHJcblx0bGV0IF9ibG9ja2VkID0gZmFsc2U7XHJcblx0bGV0ICRvdmVybGF5O1xyXG5cdGxldCAkYnV0dG9ucztcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHNob3csXHJcblx0XHRoaWRlLFxyXG5cdFx0YmxvY2ssXHJcblx0XHRzaG93U3BpbixcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHRjb25zdCAkb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblxyXG5cdFx0JG92ZXJsYXkuY2xhc3NOYW1lID0gJ21vZGFsLW92ZXJsYXknO1xyXG5cdFx0JG92ZXJsYXkuaW5uZXJIVE1MID0gLypodG1sKi9gXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC10aXRsZVwiPlxyXG5cdFx0XHRcdFx0PHNwYW4+JHtvcHRpb25zLnRpdGxlfTwvc3Bhbj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibW9kYWwtc3BpblwiPjwvc3Bhbj5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPjwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC1idXR0b25zXCI+PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YDtcclxuXHRcdGNvbnN0ICRtb2RhbCA9ICRvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbCcpO1xyXG5cdFx0Y29uc3QgJGNvbnRlbnQgPSAkb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcubW9kYWwtY29udGVudCcpO1xyXG5cclxuXHRcdC8vIG92ZXJsYXlcclxuXHRcdCRvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblxyXG5cdFx0Ly8gbW9kYWxcclxuXHRcdCRtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy53aWR0aClcclxuXHRcdFx0JG1vZGFsLnN0eWxlLndpZHRoID0gb3B0aW9ucy53aWR0aCArICdweCc7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY29udGVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG5cdFx0XHQkY29udGVudC5hcHBlbmRDaGlsZChvcHRpb25zLmNvbnRlbnQpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHQkY29udGVudC5pbm5lckhUTUwgPSBvcHRpb25zLmNvbnRlbnQ7XHJcblxyXG5cdFx0Ly8gYm90XHUwMEY1ZXNcclxuXHRcdCRidXR0b25zID0gJG92ZXJsYXkucXVlcnlTZWxlY3RvcignLm1vZGFsLWJ1dHRvbnMnKTtcclxuXHJcblx0XHQob3B0aW9ucy5idXR0b25zIHx8IFtdKS5mb3JFYWNoKGJ1dHRvbiA9PiB7XHJcblx0XHRcdGNvbnN0ICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHJcblx0XHRcdCRidXR0b24udHlwZSA9ICdidXR0b24nO1xyXG5cdFx0XHQkYnV0dG9uLmlubmVySFRNTCA9IGJ1dHRvbi5uYW1lO1xyXG5cdFx0XHQkYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ3ByaW1hcnknLCAhIWJ1dHRvbi5wcmltYXJ5KTtcclxuXHJcblx0XHRcdGlmIChidXR0b24ub25DbGljaylcclxuXHRcdFx0XHQkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYnV0dG9uLm9uQ2xpY2spO1xyXG5cclxuXHRcdFx0aWYgKGJ1dHRvbi5uYW1lLm1hdGNoKC9DYW5jZWx8Tm8vKSlcclxuXHRcdFx0XHQkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZSk7XHJcblxyXG5cdFx0XHQkYnV0dG9ucy5hcHBlbmRDaGlsZCgkYnV0dG9uKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiAkb3ZlcmxheTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3coKSB7XHJcblx0XHQkb3ZlcmxheSA9IGNyZWF0ZSgpO1xyXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCgkb3ZlcmxheSk7XHJcblx0XHQkb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pbnZpc2libGUnKTtcclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLXZpc2libGUnKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5idXR0b25zKVxyXG5cdFx0XHQkYnV0dG9ucy5xdWVyeVNlbGVjdG9yKCdidXR0b24nKS5mb2N1cygpO1xyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhpZGUoKSB7XHJcblx0XHRkZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBibG9jayhibG9jayA9IHRydWUpIHtcclxuXHRcdGlmICghb3B0aW9ucy5idXR0b25zKSByZXR1cm47XHJcblxyXG5cdFx0X2Jsb2NrZWQgPSBibG9jaztcclxuXHJcblx0XHQkYnV0dG9ucy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKS5mb3JFYWNoKCRidXR0b24gPT4ge1xyXG5cdFx0XHQkYnV0dG9uLmJsdXIoKTtcclxuXHRcdFx0JGJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdkaXNhYmxlZCcsIGJsb2NrKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd1NwaW4oc2hvdyA9IHRydWUpIHtcclxuXHRcdCRvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1zcGluJykuY2xhc3NMaXN0LnRvZ2dsZSgndmlzaWJsZScsIHNob3cpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuXHRcdGlmIChfYmxvY2tlZCkgcmV0dXJuO1xyXG5cclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLXZpc2libGUnKTtcclxuXHRcdCRvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLWludmlzaWJsZScpO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHQkb3ZlcmxheS5yZW1vdmUoKTtcclxuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xyXG5cdFx0fSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LmtleSA9PSAnVGFiJykge1xyXG5cdFx0XHRpZiAoX2Jsb2NrZWQpXHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZXZlbnQua2V5ID09ICdFc2NhcGUnKSB7XHJcblx0XHRcdGRlc3Ryb3koKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBSb3dQcm9ncmVzc0JhciBmcm9tICcuLi9jb21wb25lbnRzL1Jvd1Byb2dyZXNzQmFyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBNb2RhbCBmcm9tICcuLi9saWIvTW9kYWwvTW9kYWwnO1xyXG5pbXBvcnQgTWVudSBmcm9tICcuLi9saWIvTWVudS9NZW51JztcclxuaW1wb3J0IFRvYXN0IGZyb20gJy4uL2xpYi9Ub2FzdC9Ub2FzdCc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBUYXNrc1BhZ2UgPSAoKSA9PiB7XHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7XHJcblx0XHRwYWdlTWFwOiBbJ1Rhc2tzJ10sXHJcblx0XHRkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhbmQgbWFuYWdlIGF1dG9tYXRlZCB0YXNrcyB0byBlZmZpY2llbnRseSBvcHRpbWl6ZSB5b3VyIGltYWdlcy4nXHJcblx0fSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0eyBuYW1lOiAndGFza3NNZW51JywgdG9vbHRpcDogJycsIGljb246IEljb24oJ2VsbGlwc2lzVmVydGljYWwnKSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdhZGQnLCB0b29sdGlwOiAnTmV3IHRhc2snLCBpY29uOiBJY29uKCdhZGQnKSwgb25DbGljazogbmV3SXRlbSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdlZGl0JywgdG9vbHRpcDogJ0VkaXQnLCBpY29uOiBJY29uKCdlZGl0JyksIG9uQ2xpY2s6IGVkaXRJdGVtIH0sXHJcblx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdzZWFyY2gnLCB0b29sdGlwOiAnVmlldyBmaWxlcycsIGljb246IEljb24oJ3NlYXJjaCcpLCBvbkNsaWNrOiB2aWV3RmlsZXMgfSxcclxuXHRcdFx0eyBuYW1lOiAnc3RhcnQnLCB0b29sdGlwOiAnU3RhcnQgdGFzaycsIGljb246IEljb24oJ3N0YXJ0JyksIG9uQ2xpY2s6IHN0YXJ0VGFzayB9LFxyXG5cdFx0XHR7IG5hbWU6ICdzdG9wJywgdG9vbHRpcDogJ1N0b3AnLCBpY29uOiBJY29uKCdzdG9wJyksIG9uQ2xpY2s6IHN0b3BUYXNrIH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogYWN0aW9uQmFyLmVsZW1lbnQsXHJcblx0XHRcdGNvbnRlbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0b25TaG93LFxyXG5cdFx0b25IaWRlLFxyXG5cdFx0dXBkYXRlUnVubmluZ1Rhc2tzLFxyXG5cdH07XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblx0bGV0IF9zZWxlY3RlZFJvdztcclxuXHRsZXQgX3Rhc2tzQ29udGV4dE1lbnU7XHJcblx0bGV0IF9wYXVzZTtcclxuXHJcblx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0YXdhaXQgbG9hZCgpO1xyXG5cclxuXHRcdGNvbnN0IGlkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJyk7XHJcblxyXG5cdFx0aWYgKGlkKSB7XHJcblx0XHRcdGNvbnN0IHJvd3MgPSBfZGF0YVRhYmxlLnJvd3NCeUZpZWxkVmFsdWUoJ2lkJywgaWQpO1xyXG5cclxuXHRcdFx0Ly8gc2VsZWNpb25hIG8gaXRlbVxyXG5cdFx0XHRpZiAocm93cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRyb3dzWzBdLnNlbGVjdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgJycpO1xyXG5cclxuXHRcdC8vIE1lbnVzXHJcblx0XHRNZW51KHtcclxuXHRcdFx0dHJpZ2dlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9dGFza3NNZW51XScpLFxyXG5cdFx0XHRpdGVtczogW1xyXG5cdFx0XHRcdHsgbmFtZTogJ0ltcG9ydCB0YXNrcycsIGljb246IEljb24oJ2ltcG9ydCcpLCBvbkNsaWNrOiBpbXBvcnRUYXNrcyB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0V4cG9ydCB0YXNrcycsIGljb246IEljb24oJ2V4cG9ydCcpLCBvbkNsaWNrOiBleHBvcnRUYXNrcyB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdF90YXNrc0NvbnRleHRNZW51ID0gTWVudSh7XHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnRGlzYWJsZWQnLCBpY29uOiAnJywgb25DbGljazogKCkgPT4gZGlzYWJsZVRhc2soKSB9LFxyXG5cdFx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0VkaXQnLCBpY29uOiBJY29uKCdlZGl0JyksIG9uQ2xpY2s6IGVkaXRJdGVtIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRHVwbGljYXRlJywgaWNvbjogSWNvbignZHVwbGljYXRlJyksIG9uQ2xpY2s6IGR1cGxpY2F0ZUl0ZW0gfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBvbkNsaWNrOiBjb3B5Q2xpcEl0ZW1zIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBpbiBmaWxlIGV4cGxvcmVyJywgaWNvbjogSWNvbignZm9sZGVyU2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdJbkZpbGVFeHBsb3JlciB9LFxyXG5cdFx0XHRcdHsgZGl2aWRlcjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgZmlsZXMnLCBpY29uOiBJY29uKCdzZWFyY2gnKSwgb25DbGljazogdmlld0ZpbGVzIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnU3RhcnQgdGFzaycsIGljb246IEljb24oJ3N0YXJ0JyksIG9uQ2xpY2s6IHN0YXJ0VGFzayB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1N0b3AnLCBpY29uOiBJY29uKCdzdG9wJyksIG9uQ2xpY2s6IHN0b3BUYXNrIH0sXHJcblx0XHRcdFx0eyBkaXZpZGVyOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnRGVsZXRlJywgaWNvbjogSWNvbigndHJhc2gnKSwgb25DbGljazogZGVsZXRlSXRlbSB9LFxyXG5cdFx0XHRdLFxyXG5cdFx0XHRvblNob3c6ICgpID0+IHtcclxuXHRcdFx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb25IaWRlKCkge1xyXG5cdFx0X2RhdGFUYWJsZS5kZXN0cm95KCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBsb2FkKCkge1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IGRhdGEgfSA9IGF3YWl0IHdlYkFQSS5nZXRUYXNrcygpO1xyXG5cclxuXHRcdGlmIChkYXRhKVxyXG5cdFx0XHRfZGF0YVRhYmxlLmxvYWQoZGF0YS5pdGVtcyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREYXRhVGFibGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlID0gRGF0YVRhYmxlKHtcclxuXHRcdFx0aWQ6ICd0YXNrcycsXHJcblx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRzb3J0OiB0cnVlLFxyXG5cdFx0XHRyZXNpemU6IHRydWUsXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRpZDogeyBkaXNwbGF5TmFtZTogJ0lkJywgaGlkZGVuOiB0cnVlIH0sXHJcblx0XHRcdFx0bmFtZTogeyBkaXNwbGF5TmFtZTogJ05hbWUnLCB3aWR0aDogMjAwIH0sXHJcblx0XHRcdFx0cGF0aDogeyBkaXNwbGF5TmFtZTogJ1BhdGgnLCB3aWR0aDogMzAwIH0sXHJcblx0XHRcdFx0Y29udGVudDogeyBkaXNwbGF5TmFtZTogJ0NvbnRlbnQnLCB3aWR0aDogMTAwIH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7IGRpc3BsYXlOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDEwMCB9LFxyXG5cdFx0XHRcdHByb2dyZXNzOiB7IGRpc3BsYXlOYW1lOiAnUHJvZ3Jlc3MnLCBtaW5XaWR0aDogMjAwLCBzb3J0OiBmYWxzZSB9LFxyXG5cdFx0XHRcdGVsYXBzZWRUaW1lOiB7IGRpc3BsYXlOYW1lOiAnRWxhcHNlZCBUaW1lJywgd2lkdGg6IDEyMCwgc29ydDogZmFsc2UgfSxcclxuXHRcdFx0XHRsYXN0UnVuOiB7IGRpc3BsYXlOYW1lOiAnTGFzdCBSdW4nLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0bmV4dFJ1bjogeyBkaXNwbGF5TmFtZTogJ05leHQgU2NoZWR1bGVkIFJ1bicsIHdpZHRoOiAxNDAsIHNvcnQ6IGZhbHNlIH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdGFsbG93TXVsdGlwbGVTZWxlY3Rpb246IGZhbHNlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjZWxsczoge1xyXG5cdFx0XHRcdHBhdGg6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjZWxsXCIgc3R5bGU9XCJwYWRkaW5nOiA3cHggOHB4IDlweCA4cHg7IG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1wiPnt2YWx1ZX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBvbkNsaWNrPXt2aWV3SW5GaWxlRXhwbG9yZXJ9IGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIHRpdGxlPVwiVmlldyBpbiBmaWxlIGV4cGxvcmVyXCI+XHJcblx0XHRcdFx0XHRcdFx0XHR7SWNvbignZm9sZGVyU2VhcmNoJyl9XHJcblx0XHRcdFx0XHRcdFx0PC9hPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRzdHlsZTogeyBwYWRkaW5nOiAnMCAhaW1wb3J0YW50JyB9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y29udGVudDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUgPT0gJ3Jvb3QnID8gJ1Jvb3QgZmlsZXMnIDogJ0FsbCBkaXJlY3RvcnknXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdGF0dXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHNoYXJlZC5jb25zdGFudHMuc3RhdHVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gdmFsdWUpPy5kaXNwbGF5TmFtZSB8fCAnJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHByb2dyZXNzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHByb2dyZXNzID0gUm93UHJvZ3Jlc3NCYXIoKTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgcGVyY2VudCA9IHZhbHVlLnNwbGl0KCclJylbMF07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHByb2dyZXNzLnNob3coKTtcclxuXHRcdFx0XHRcdFx0XHRwcm9ncmVzcy51cGRhdGUocGVyY2VudCwgdmFsdWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcHJvZ3Jlc3MuZWxlbWVudDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlbGFwc2VkVGltZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUgfHwgJydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGxhc3RSdW46IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG5leHRSdW46IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRkaXNhYmxlUm93KHJvdyk7XHJcblx0XHRcdFx0c2V0Rm9vdGVyKCk7XHJcblxyXG5cdFx0XHRcdGRvbShyb3cuZWxlbWVudCkub24oJ2NvbnRleHRtZW51JywgKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFyb3cuaXNTZWxlY3RlZClcclxuXHRcdFx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cclxuXHRcdFx0XHRcdF90YXNrc0NvbnRleHRNZW51LnNob3coZXZlbnQpO1xyXG5cdFx0XHRcdFx0X3Rhc2tzQ29udGV4dE1lbnUuaXRlbSgnRGlzYWJsZWQnKS5pY29uKFxyXG5cdFx0XHRcdFx0XHRyb3cuZGF0YSgpLnN0YXR1cyA9PSAnZGlzYWJsZWQnID8gSWNvbignY2hlY2tlZCcpIDogJydcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uU2VsZWN0Um93czogKHsgcm93cyB9KSA9PiB7XHJcblx0XHRcdFx0X3NlbGVjdGVkUm93ID0gcm93c1swXTtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblVuc2VsZWN0Um93czogKCkgPT4ge1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKGZhbHNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Eb3VibGVDbGlja1JvdzogKHsgcm93LCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZWRpdEl0ZW0oKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25SZW1vdmVSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2V0Rm9vdGVyKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ29weUNsaXA6ICh7IHRleHQgfSkgPT4ge1xyXG5cdFx0XHRcdGNvcHlDbGlwSXRlbXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25DbGlja091dDogKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cyA9ICEhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5hY3Rpb25iYXInKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnRleHQuZWxlbWVudHMuY29udGVudCA9IF9kYXRhVGFibGUuZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG5ld0l0ZW0oKSB7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ3Rhc2svbmV3JztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVkaXRJdGVtKCkge1xyXG5cdFx0bGV0IGlkID0gX3NlbGVjdGVkUm93LmRhdGEoKS5pZDtcclxuXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCBpZCk7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ3Rhc2svJyArIGlkO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gdmlld0ZpbGVzKCkge1xyXG5cdFx0bGV0IGlkID0gX3NlbGVjdGVkUm93LmRhdGEoKS5pZDtcclxuXHRcdGxldCBpc0F2YWlsYWJsZSA9IGF3YWl0IHdlYkFQSS5wYXRoSXNBdmFpbGFibGUoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKTtcclxuXHJcblx0XHRpZiAoaXNBdmFpbGFibGUpIHtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgaWQpO1xyXG5cdFx0XHRsb2NhdGlvbi5oYXNoID0gYHRhc2svJHtpZH0vZmlsZXNgO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gaXNUYXNrUnVubmluZyhyb3cpIHtcclxuXHRcdGxldCB0YXNrID0gKHJvdyB8fCBfc2VsZWN0ZWRSb3cpLmRhdGEoKTtcclxuXHRcdGxldCB7IHJlc3VsdDogaXNSdW5uaW5nIH0gPSBhd2FpdCB3ZWJBUEkuaXNUYXNrUnVubmluZyh0YXNrLmlkKTtcclxuXHJcblx0XHRpZiAoaXNSdW5uaW5nKVxyXG5cdFx0XHR0b2FzdEluZm8oJ1Rhc2sgaW4gcHJvZ3Jlc3MuJyk7XHJcblxyXG5cdFx0cmV0dXJuIGlzUnVubmluZztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHN0YXJ0VGFzaygpIHtcclxuXHRcdGxldCB0YXNrID0gX3NlbGVjdGVkUm93LmRhdGEoKTtcclxuXHJcblx0XHRpZiAoYXdhaXQgaXNUYXNrUnVubmluZygpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHRhc2suc3RhdHVzID09ICdkaXNhYmxlZCcpIHtcclxuXHRcdFx0dG9hc3RJbmZvKCdUYXNrIGlzIGRpc2FibGVkLicpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGlzQXZhaWxhYmxlID0gYXdhaXQgd2ViQVBJLnBhdGhJc0F2YWlsYWJsZSh0YXNrLnBhdGgpO1xyXG5cclxuXHRcdGlmICghaXNBdmFpbGFibGUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRjb25zdCBtb2RhbCA9IE1vZGFsKHtcclxuXHRcdFx0dGl0bGU6ICdTdGFydCB0YXNrJyxcclxuXHRcdFx0Y29udGVudDogJ1RoZSBvcHRpbWl6YXRpb24gcHJvY2VzcyB3aWxsIGJlZ2luLCBhbmQgdGhlIGZpbGVzIHdpbGwgYmUgcGVybWFuZW50bHkgY29tcHJlc3NlZC48YnI+PGJyPkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlPycsXHJcblx0XHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRuYW1lOiAnT0snLCBwcmltYXJ5OiB0cnVlLCBvbkNsaWNrOiAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdHdlYkFQSS5zdGFydFRhc2sodGFzay5pZCkudGhlbihyZXNwb25zZSA9PlxyXG5cdFx0XHRcdFx0XHRcdHRvYXN0SW5mbyhyZXNwb25zZS5yZXN1bHQpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmhpZGUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NhbmNlbCcgfVxyXG5cdFx0XHRdXHJcblx0XHR9KTtcclxuXHJcblx0XHRtb2RhbC5zaG93KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGVSdW5uaW5nVGFza3MocnVubmluZ1Rhc2tzKSB7XHJcblx0XHQvLyBBdHVhbGl6YSBpbmZvcm1hXHUwMEU3XHUwMEY1ZXMgZGFzIHRhcmVmYXMgZW0gZXhlY3VcdTAwRTdcdTAwRTNvIG5hIGdyYWRlLlxyXG5cclxuXHRcdGlmICghcnVubmluZ1Rhc2tzIHx8IF9wYXVzZSkgcmV0dXJuO1xyXG5cclxuXHRcdHJ1bm5pbmdUYXNrcyA9IEpTT04ucGFyc2UocnVubmluZ1Rhc2tzKTtcclxuXHJcblx0XHRpZiAocnVubmluZ1Rhc2tzKSB7XHJcblx0XHRcdHJ1bm5pbmdUYXNrcy5mb3JFYWNoKHJ1bm5pbmdUYXNrID0+IHtcclxuXHRcdFx0XHRjb25zdCByb3cgPSBfZGF0YVRhYmxlLnJvd3NCeUZpZWxkVmFsdWUoJ2lkJywgcnVubmluZ1Rhc2suaWQpWzBdO1xyXG5cclxuXHRcdFx0XHRpZiAocm93KSB7XHJcblx0XHRcdFx0XHRyb3cuZGF0YSh7XHJcblx0XHRcdFx0XHRcdHN0YXR1czogcnVubmluZ1Rhc2suZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogcnVubmluZ1Rhc2suc3RhdHVzLFxyXG5cdFx0XHRcdFx0XHRlbGFwc2VkVGltZTogcnVubmluZ1Rhc2suZWxhcHNlZFRpbWUsXHJcblx0XHRcdFx0XHRcdG5leHRSdW46IHJ1bm5pbmdUYXNrLm5leHRSdW4sXHJcblx0XHRcdFx0XHRcdGxhc3RSdW46IHJ1bm5pbmdUYXNrLmxhc3RSdW4sXHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHR1cGRhdGVQcm9ncmVzcyhyb3csIHJ1bm5pbmdUYXNrKTtcclxuXHRcdFx0XHRcdGRpc2FibGVSb3cocm93LCBydW5uaW5nVGFzay5kaXNhYmxlZCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzKHJvdywgcnVubmluZ1Rhc2spIHtcclxuXHRcdGxldCBpbmRleCA9IHJ1bm5pbmdUYXNrLmluZGV4O1xyXG5cdFx0bGV0IHRvdGFsID0gcnVubmluZ1Rhc2sudG90YWw7XHJcblx0XHRsZXQgcGVyY2VudCA9IE1hdGgucm91bmQoaW5kZXggLyB0b3RhbCAqIDEwMCk7XHJcblx0XHRsZXQgdmFsdWUgPSBpbmRleCA/IGAke3BlcmNlbnR9JSAke2luZGV4fS8ke3RvdGFsfWAgOiAnJztcclxuXHJcblx0XHRyb3cuZGF0YSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHN0b3BUYXNrKCkge1xyXG5cdFx0d2ViQVBJLnN0b3BUYXNrKF9zZWxlY3RlZFJvdy5kYXRhKCkuaWQpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZHVwbGljYXRlSXRlbSgpIHtcclxuXHRcdGxldCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShfc2VsZWN0ZWRSb3cuZGF0YSgpKTtcclxuXHJcblx0XHRjb25zdCB7IHJlc3VsdDogdGFzayB9ID0gYXdhaXQgd2ViQVBJLmluc2VydFRhc2soY2xvbmUpO1xyXG5cclxuXHRcdF9kYXRhVGFibGUuYWRkUm93KHRhc2spLnNlbGVjdCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29weUNsaXBJdGVtcygpIHtcclxuXHRcdHdlYkFQSS5jb3B5Q2xpcChfZGF0YVRhYmxlLmV4cG9ydCgpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZpZXdJbkZpbGVFeHBsb3JlcihldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnBvaW50ZXJJZCAmJiBldmVudC5wb2ludGVySWQgIT0gMSkgcmV0dXJuOyAvLyBzb21lbnRlIGJvdFx1MDBFM28gcHJpbmNpcGFsIGRvIG1vdXNlXHJcblxyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS52aWV3SW5GaWxlRXhwbG9yZXIoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGRpc2FibGVUYXNrKHJvdykge1xyXG5cdFx0aWYgKGF3YWl0IGlzVGFza1J1bm5pbmcoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCB0YXNrID0gKHJvdyB8fCBfc2VsZWN0ZWRSb3cpLmRhdGEoKTtcclxuXHJcblx0XHR0YXNrLnN0YXR1cyA9IHRhc2suc3RhdHVzID09ICdkaXNhYmxlZCcgPyAnJyA6ICdkaXNhYmxlZCc7XHJcblx0XHRfc2VsZWN0ZWRSb3cuZGF0YSh7IHN0YXR1czogdGFzay5zdGF0dXMgfSk7XHJcblx0XHR3ZWJBUEkudXBkYXRlVGFzayh0YXNrKTtcclxuXHRcdF9wYXVzZSA9IHRydWU7XHJcblxyXG5cdFx0c2V0VGltZW91dCgoKSA9PiBfcGF1c2UgPSBmYWxzZSwgMTAwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaXNhYmxlUm93KHJvdywgZGlzYWJsZSkge1xyXG5cdFx0cm93ID0gcm93IHx8IF9zZWxlY3RlZFJvdztcclxuXHRcdGRpc2FibGUgPSBkaXNhYmxlICE9IHVuZGVmaW5lZCA/IGRpc2FibGUgOiByb3cuZGF0YSgpLnN0YXR1cyA9PSAnZGlzYWJsZWQnO1xyXG5cclxuXHRcdHJvdy5jZWxscy5mb3JFYWNoKGNlbGwgPT5cclxuXHRcdFx0Y2VsbC5lbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBkaXNhYmxlID8gMC43NSA6ICcnXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZGVsZXRlSXRlbSgpIHtcclxuXHRcdGlmIChhd2FpdCBpc1Rhc2tSdW5uaW5nKCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRjb25zdCBtb2RhbCA9IE1vZGFsKHtcclxuXHRcdFx0dGl0bGU6ICdEZWxldGUgdGFzaycsXHJcblx0XHRcdGNvbnRlbnQ6ICdUaGUgc2VsZWN0ZWQgaXRlbSB3aWxsIGJlIHBlcm1hbmVudGx5IGRlbGV0ZWQuPGJyPjxicj5EbyB5b3Ugd2lzaCB0byBjb250aW51ZT8nLFxyXG5cdFx0XHRidXR0b25zOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bmFtZTogJ09LJywgcHJpbWFyeTogdHJ1ZSwgb25DbGljazogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQgaWQgPSBfc2VsZWN0ZWRSb3cuZGF0YSgpLmlkO1xyXG5cclxuXHRcdFx0XHRcdFx0d2ViQVBJLmRlbGV0ZVRhc2soaWQpO1xyXG5cdFx0XHRcdFx0XHRfc2VsZWN0ZWRSb3cucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ2FuY2VsJyB9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cclxuXHRcdG1vZGFsLnNob3coKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3dBY3Rpb25CYXJCdXR0b25zKHNob3cgPSB0cnVlKSB7XHJcblx0XHRsZXQgc2VsZWN0b3IgPSAnLmRpdmlkZXIsIFtuYW1lPWVkaXRdLCBbbmFtZT1zZWFyY2hdLCBbbmFtZT1zdGFydF0sIFtuYW1lPXN0b3BdJztcclxuXHJcblx0XHRhY3Rpb25CYXIuZWxlbWVudC5nZXQoc2VsZWN0b3IpLnNob3coc2hvdyk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBpbXBvcnRUYXNrcygpIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuZmlsZVBpY2tlcignSW1wb3J0IHRhc2tzJywgJ2pzb24nKTtcclxuXHJcblx0XHRpZiAocGF0aCkge1xyXG5cdFx0XHRjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB3ZWJBUEkuaW1wb3J0VGFza3MocGF0aCk7XHJcblxyXG5cdFx0XHRpZiAoIWVycm9yKVxyXG5cdFx0XHRcdGxvYWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFRhc2tzKCkge1xyXG5cdFx0Y29uc3QgZmlsZU5hbWUgPSAnVGFza3MuanNvbic7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLnNhdmVGaWxlUGlja2VyKCdFeHBvcnQgdGFza3MnLCBmaWxlTmFtZSwgJ2pzb24nKTtcclxuXHJcblx0XHRpZiAocGF0aClcclxuXHRcdFx0YXdhaXQgd2ViQVBJLmRvd25sb2FkRmlsZShgaHR0cDovL2xvY2FsaG9zdDoxMDEwL2RhdGEvJHtmaWxlTmFtZX1gLCBwYXRoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZvb3RlcigpIHtcclxuXHRcdGxldCBpdGVtcyA9IF9kYXRhVGFibGUuZGF0YSgpLmxlbmd0aDtcclxuXHJcblx0XHRzaGFyZWQuZm9vdGVyLmluZm8oYCR7aXRlbXMgfHwgJ05vJ30gdGFza3NgKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvYXN0SW5mbyhtZXNzYWdlKSB7XHJcblx0XHRpZiAoIW1lc3NhZ2UpIHJldHVybjtcclxuXHJcblx0XHRUb2FzdCh7XHJcblx0XHRcdGljb246IEljb24oJ2luZm8nKSxcclxuXHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcclxuXHRcdFx0cG9zaXRpb246ICdib3R0b20gY2VudGVyJyxcclxuXHRcdFx0dGltZTogNFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza3NQYWdlO1xyXG4iLCAiY29uc3QgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHV0aWxzO1xyXG5cclxuZnVuY3Rpb24gVXRpbHMoKSB7XHJcblx0dGhpcy5nZW5lcmF0ZUd1aWQgPSBnZW5lcmF0ZUd1aWQ7XHJcblx0dGhpcy5jb252ZXJ0ID0gY29udmVydDtcclxuXHR0aGlzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcclxuXHR0aGlzLmlzRW1wdHkgPSBpc0VtcHR5O1xyXG5cdHRoaXMuaXNOdWxsT3JFbXB0eSA9IGlzTnVsbE9yRW1wdHk7XHJcblx0dGhpcy5pc1VuZGVmaW5lZE9yTnVsbCA9IGlzVW5kZWZpbmVkT3JOdWxsO1xyXG5cdHRoaXMuaXNVbmRlZmluZWRPck51bGxPckVtcHR5ID0gaXNVbmRlZmluZWRPck51bGxPckVtcHR5O1xyXG5cdHRoaXMuaXNOdW1iZXIgPSBpc051bWJlcjtcclxuXHR0aGlzLmlzSW50ZWdlciA9IGlzSW50ZWdlcjtcclxuXHR0aGlzLmlzRGF0ZVRpbWUgPSBpc0RhdGVUaW1lO1xyXG5cdHRoaXMuaXNJZnJhbWUgPSBpc0lmcmFtZTtcclxuXHR0aGlzLmNvbXByZXNzVGVtcGxhdGVTdHJpbmcgPSBjb21wcmVzc1RlbXBsYXRlU3RyaW5nO1xyXG5cdHRoaXMudHJ1bmNhdGVUZXh0ID0gdHJ1bmNhdGVUZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBnZW5lcmF0ZUd1aWQoKSB7XHJcblx0XHQvLyBSZXRvcm5hIHJhbmRvbWljYW1lbnRlIHVtIEdVSUQgcGFkclx1MDBFM28gLSBFeC46IGE5MWUzMmRmLTkzNTItNDUyMC05ZjA5LTE3MTVhOWEwY2U0MVxyXG5cclxuXHRcdGNvbnN0IGd1aWQgPSAoWzFlNl0gKyAtMWUzICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYyA9PlxyXG5cdFx0XHQoXHJcblx0XHRcdFx0YyBeXHJcblx0XHRcdFx0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdICYgKDE1ID4+IChjIC8gNCkpKVxyXG5cdFx0XHQpLnRvU3RyaW5nKDE2KVxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBhZGljaW9uYSB1bWEgbGV0cmEgY29tbyBwcmltZWlybyBjYXJhY3RlcmUgcGFyYSBldml0YXIgZXJybyBuYSBmdW5cdTAwRTdcdTAwRTNvIHF1ZXJ5U2VsZWN0b3JcclxuXHRcdHJldHVybiAnYScgKyBndWlkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29udmVydCgpIHtcclxuXHRcdGZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlLCBvcHRpb25zKSB7XHJcblx0XHRcdC8vIENvbnZlcnRlIHF1YWxxdWVyIHZhbG9yIHF1ZSBjb250ZW5oYSBuXHUwMEZBbWVyb3MgcGFyYSB1bSBuXHUwMEZBbWVybyBwdXJvLCBpbnRlaXJvIG91IGRlY2ltYWwuXHJcblxyXG5cdFx0XHQvKlxyXG5cdFx0XHRcdG9wdGlvbnM6IHtcclxuXHRcdFx0XHRcdGRpZ2l0czogaW50LydhdXRvJ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0Ki9cclxuXHJcblx0XHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpKSByZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdGNvbnN0IF9vcHRpb25zID0ge1xyXG5cdFx0XHRcdGRpZ2l0czogMixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zKSB7XHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuZGlnaXRzICE9PSAnYXV0bycpXHJcblx0XHRcdFx0XHRvcHRpb25zLmRpZ2l0cyA9XHJcblx0XHRcdFx0XHRcdGlzTnVtYmVyKG9wdGlvbnMuZGlnaXRzKSAmJiBvcHRpb25zLmRpZ2l0cyA+PSAwXHJcblx0XHRcdFx0XHRcdFx0PyBvcHRpb25zLmRpZ2l0c1xyXG5cdFx0XHRcdFx0XHRcdDogX29wdGlvbnMuZGlnaXRzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG9wdGlvbnMgPSBfb3B0aW9ucztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IG51bWJlciA9IHZhbHVlO1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHRsZXQgaXNOZWdhdGl2ZSA9IHZhbHVlLnN0YXJ0c1dpdGgoJy0nKTtcclxuXHRcdFx0XHRsZXQgbnVtYmVycyA9IHZhbHVlLm1hdGNoKC9cXGQrL2cpOyAvLyBzb21lbnRlIG5cdTAwRkFtZXJvc1xyXG5cclxuXHRcdFx0XHRudW1iZXIgPSAnJztcclxuXHJcblx0XHRcdFx0aWYgKG51bWJlcnMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRudW1iZXIgKz0gbnVtYmVyc1tpXTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChpID09PSBudW1iZXJzLmxlbmd0aCAtIDIpIG51bWJlciArPSAnLic7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRudW1iZXIgPSBOdW1iZXIoaXNOZWdhdGl2ZSA/ICctJyArIG51bWJlciA6IG51bWJlcik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBvcHRpb25zLmRpZ2l0cyA9PT0gJ2F1dG8nXHJcblx0XHRcdFx0PyBudW1iZXJcclxuXHRcdFx0XHQ6IE51bWJlcihudW1iZXIudG9GaXhlZChvcHRpb25zLmRpZ2l0cykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xyXG5cdFx0XHQvLyBDb252ZXJ0ZSBxdWFscXVlciB2YWxvciBxdWUgc2UgZW50ZW5kYSBjb21vIHZlcmRhZGVpcm8gb3UgZmFsc28gcGFyYSBib29sZWFuby5cclxuXHJcblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdFx0fSBlbHNlIGlmIChVdGlscygpLmlzVW5kZWZpbmVkT3JOdWxsT3JFbXB0eSh2YWx1ZSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gMTtcclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcclxuXHJcblx0XHRcdFx0aWYgKHZhbHVlLm1hdGNoKC9edHJ1ZSR8XnllcyR8XnNpbSR8XjEkLykpIHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdGVsc2UgaWYgKHZhbHVlLm1hdGNoKC9eZmFsc2UkfF5ubyR8Xm5cdTAwRTNvJHxeMCQvKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbnVtYmVyVG9QeCh2YWx1ZSkge1xyXG5cdFx0XHQvLyBDb252ZXJ0ZSBxdWFscXVlciB2YWxvciBxdWUgY29udGVuaGEgblx1MDBGQW1lcm9zIHBhcmEgcHguXHJcblxyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHZhbHVlID8gYCR7dmFsdWV9cHhgIDogJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dG9OdW1iZXIsXHJcblx0XHRcdHRvQm9vbGVhbixcclxuXHRcdFx0bnVtYmVyVG9QeCxcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUpIHtcclxuXHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gJycgfHwgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmICF2YWx1ZS5sZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNOdWxsT3JFbXB0eSh2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHZhbHVlID09PSBudWxsIHx8IGlzRW1wdHkodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGxPckVtcHR5KHZhbHVlKSB7XHJcblx0XHRyZXR1cm4gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHx8IGlzTnVsbE9yRW1wdHkodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcclxuXHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHx8IGlzQm9vbGVhbih2YWx1ZSkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRyZXR1cm4gIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlKSB7XHJcblx0XHRpZiAoaXNVbmRlZmluZWRPck51bGxPckVtcHR5KHZhbHVlKSB8fCBpc0Jvb2xlYW4odmFsdWUpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmV0dXJuIE51bWJlci5pc0ludGVnZXIoTnVtYmVyKHZhbHVlKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0RhdGVUaW1lKHZhbHVlLCBmb3JtYXQpIHtcclxuXHRcdGlmIChpc1VuZGVmaW5lZE9yTnVsbE9yRW1wdHkodmFsdWUpIHx8IGlzQm9vbGVhbih2YWx1ZSkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0XHRpZiAoZm9ybWF0ID09PSAnZGQvbW0veXl5eScpXHJcblx0XHRcdHJldHVybiB2YWx1ZS5tYXRjaCgvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSQvKSAhPT0gbnVsbDtcclxuXHRcdGlmIChmb3JtYXQgPT09ICdkZC9tbS95eXl5IGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSAoXFxkezJ9KTooXFxkezJ9KSQvKSAhPT1cclxuXHRcdFx0XHRudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAnZGQvbW0veXl5eSBoaDptbTpzcycpXHJcblx0XHRcdHJldHVybiAoXHJcblx0XHRcdFx0dmFsdWUubWF0Y2goXHJcblx0XHRcdFx0XHQvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KSAoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KSQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQnKVxyXG5cdFx0XHRyZXR1cm4gdmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KSQvKSAhPT0gbnVsbDtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pJC8pICE9PVxyXG5cdFx0XHRcdG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkIGhoOm1tJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pIChcXGR7Mn0pOihcXGR7Mn0pJC8pICE9PVxyXG5cdFx0XHRcdG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tOnNzJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkkL1xyXG5cdFx0XHRcdCkgIT09IG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkIGhoOm1tOnNzJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkgKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkkL1xyXG5cdFx0XHRcdCkgIT09IG51bGxcclxuXHRcdFx0KTtcclxuXHRcdGlmIChmb3JtYXQgPT09ICd5eXl5LW1tLWRkVGhoOm1tOnNzWicpXHJcblx0XHRcdHJldHVybiAoXHJcblx0XHRcdFx0dmFsdWUubWF0Y2goXHJcblx0XHRcdFx0XHQvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0pWiQvXHJcblx0XHRcdFx0KSAhPT0gbnVsbFxyXG5cdFx0XHQpO1xyXG5cdFx0aWYgKGZvcm1hdCA9PT0gJ3l5eXktbW0tZGQgaGg6bW06c3NaJylcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHR2YWx1ZS5tYXRjaChcclxuXHRcdFx0XHRcdC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkgKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSlaJC9cclxuXHRcdFx0XHQpICE9PSBudWxsXHJcblx0XHRcdCk7XHJcblx0XHRpZiAoZm9ybWF0ID09PSAneXl5eS1tbS1kZFonKVxyXG5cdFx0XHRyZXR1cm4gdmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KVokLykgIT09IG51bGw7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpc0lmcmFtZSgpIHtcclxuXHRcdC8vIFJldG9ybmEgc2UgYSBwXHUwMEUxZ2luYSBhdHVhbCBlc3RcdTAwRTEgZW0gdW0gaWZyYW1lLlxyXG5cclxuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24gIT09IHdpbmRvdy5wYXJlbnQubG9jYXRpb247XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb21wcmVzc1RlbXBsYXRlU3RyaW5nKHRleHQpIHtcclxuXHRcdHJldHVybiB0ZXh0LnJlcGxhY2UoL1xcbnxcXHQvZywgJycpLnRyaW0oKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRydW5jYXRlVGV4dCh0ZXh0LCBtYXhMZW5ndGgpIHtcclxuXHRcdGlmICh0ZXh0Lmxlbmd0aCA+IG1heExlbmd0aClcclxuXHRcdFx0cmV0dXJuIHRleHQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCAtIDMpICsgJy4uLic7XHJcblxyXG5cdFx0cmV0dXJuIHRleHQ7XHJcblx0fVxyXG59XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5cclxuY29uc3QgVGFicyA9ICh7IG5hbWVzID0gW10sIGNvbnRlbnRzID0gW10sIHZlcnRpY2FsID0gZmFsc2UsIHN0eWxlID0gbnVsbCwgb25DaGFuZ2UgPSBudWxsIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGRpdiBjbGFzcz1cIlRhYnNcIj5cclxuXHRcdFx0e25hbWVzLm1hcCgobmFtZSwgaW5kZXgpID0+IChcclxuXHRcdFx0XHQ8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0YWIgYnV0dG9uIGgtMTAgcHgtM1wiIG9uQ2xpY2s9eyhlKSA9PiBvbkNsaWNrVGFiKGluZGV4LCBlKX0+XHJcblx0XHRcdFx0XHQ8c3Bhbj57bmFtZX08L3NwYW4+XHJcblx0XHRcdFx0PC9hPlxyXG5cdFx0XHQpKX1cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0Y29udGVudHMsXHJcblx0XHRzZWxlY3RUYWIsXHJcblx0fTtcclxuXHRjb25zdCAkdGFicyA9ICRyb290LmdldCgnLnRhYicpO1xyXG5cclxuXHRzZXQoKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIHNldCgpIHtcclxuXHRcdCRyb290LmFkZENsYXNzKCd2ZXJ0aWNhbCcsIHZlcnRpY2FsKTtcclxuXHRcdCRyb290LmdldCgnLnRhYicpLmFkZENsYXNzKCd2ZXJ0aWNhbCcsIHZlcnRpY2FsKTtcclxuXHRcdCRyb290LmdldCgnLnRhYicpLmFkZENsYXNzKCdob3Jpem9udGFsJywgIXZlcnRpY2FsKTtcclxuXHJcblx0XHQkdGFicy5mb3JFYWNoKCR0YWIgPT4ge1xyXG5cdFx0XHRpZiAoc3R5bGUpXHJcblx0XHRcdFx0JHRhYi5zdHlsZShzdHlsZSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBleGliZSBhIHByaW1laXJhIHRhYiBlIG9jdWx0YSBhcyBvdXRyYXNcclxuXHRcdGNvbnRlbnRzLmZvckVhY2goKCRjb250ZW50LCBpbmRleCkgPT4ge1xyXG5cdFx0XHRpZiAoaW5kZXggPiAwKVxyXG5cdFx0XHRcdCRjb250ZW50LmhpZGUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VsZWN0VGFiKGluZGV4KSB7XHJcblx0XHQkdGFicy5mb3JFYWNoKCgkdGFiLCBfaW5kZXgpID0+IHtcclxuXHRcdFx0Ly8gdGFiXHJcblx0XHRcdCR0YWIuYWRkQ2xhc3MoJ2FjdGl2ZScsIGluZGV4ID09IF9pbmRleCk7XHJcblxyXG5cdFx0XHQvLyBjb250ZW50XHJcblx0XHRcdGNvbnN0ICRjb250ZW50ID0gY29udGVudHNbX2luZGV4XTtcclxuXHJcblx0XHRcdGlmICgkY29udGVudClcclxuXHRcdFx0XHQkY29udGVudC5zaG93KGluZGV4ID09IF9pbmRleCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAob25DaGFuZ2UpIG9uQ2hhbmdlKGluZGV4KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uQ2xpY2tUYWIoaW5kZXgsIGV2ZW50KSB7XHJcblx0XHRzZWxlY3RUYWIoaW5kZXgsIGV2ZW50KTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYWJzO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgVGFza1BhZ2VHZW5lcmFsID0gKHsgdGFzaywgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0xMCAhcHktMTAgdy1bNjAwcHhdXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbCByZXF1aXJlZFwiPk5hbWU8L2Rpdj5cclxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibmFtZVwiIGNsYXNzPVwidy1mdWxsXCIgcmVxdWlyZWQgc3BlbGxjaGVjaz1cImZhbHNlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkRlc2NyaXB0aW9uPC9kaXY+XHJcblx0XHRcdFx0PHRleHRhcmVhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNsYXNzPVwidy1mdWxsICFtaW4taC0yM1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIG9uSW5wdXQ9e2UgPT4gZG9tKGUudGFyZ2V0KS5yZXNpemUoKX0+PC90ZXh0YXJlYT5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZCBwYXRoIGZsZXggZmxleC1jb2xcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGQtbGFiZWwgcmVxdWlyZWRcIj5EaXJlY3RvcnkgcGF0aDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy1bZml0LWNvbnRlbnQoMTAwJSlfMWZyXSBnYXAteC0xIGdhcC15LTFcIj5cclxuXHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG9uQ2xpY2s9e3NlbGVjdFBhdGh9IHRpdGxlPVwiU2VsZWN0IGZvbGRlclwiPlxyXG5cdFx0XHRcdFx0XHR7SWNvbignZm9sZGVyJyl9XHJcblx0XHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJwYXRoXCIgcmVxdWlyZWQgY2xhc3M9XCJ3LWZ1bGxcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiAvPlxyXG5cdFx0XHRcdFx0PHNwYW4+PC9zcGFuPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWRlc2NyaXB0aW9uXCI+RGlyZWN0b3J5IHBhdGggY29udGFpbmluZyB0aGUgZmlsZXMgdG8gYmUgb3B0aW1pemVkLjwvZGl2PlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cImZpZWxkLWxhYmVsXCI+Q29udGVudDwvZGl2PlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC00XCI+XHJcblx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJyYWRpb1wiPlxyXG5cdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImNvbnRlbnRcIiB2YWx1ZT1cInJvb3RcIiAvPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmFkaW8tbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHRcdHtzaGFyZWQuY29uc3RhbnRzLmNvbnRlbnQuZmluZCh4ID0+IHgubmFtZSA9PSAncm9vdCcpPy5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyYWRpby1kZXNjcmlwdGlvblwiPlxyXG5cdFx0XHRcdFx0XHRcdE9wdGltaXplcyBvbmx5IHRoZSBmaWxlcyBpbiB0aGUgcm9vdCBkaXJlY3RvcnkuXHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cInJhZGlvXCI+XHJcblx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiY29udGVudFwiIHZhbHVlPVwiYWxsXCIgLz5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInJhZGlvLW5hbWVcIj5cclxuXHRcdFx0XHRcdFx0XHR7c2hhcmVkLmNvbnN0YW50cy5jb250ZW50LmZpbmQoeCA9PiB4Lm5hbWUgPT0gJ2FsbCcpPy5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyYWRpby1kZXNjcmlwdGlvblwiPlxyXG5cdFx0XHRcdFx0XHRcdE9wdGltaXplcyBhbGwgZmlsZXMgd2l0aGluIHRoZSBkaXJlY3RvcnksIGluY2x1ZGluZyBmb2xkZXJzIGFuZCBzdWJmb2xkZXJzLlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9mb3JtPlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHQkcm9vdC5nZXQoJ2lucHV0LCB0ZXh0YXJlYScpXHJcblx0XHRcdC5iaW5kRGF0YSh7IG9iamVjdDogdGFzayB9KVxyXG5cdFx0XHQub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ3BhdGgnKSB7XHJcblx0XHRcdFx0XHR0YXNrLnBhdGggPSB2YWx1ZS5yZXBsYWNlKC9cXFxcKyQvLCAnJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gc2VsZWN0UGF0aCgpIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuZm9sZGVyUGlja2VyKCdTZWxlY3QgZm9sZGVyJyk7XHJcblxyXG5cdFx0aWYgKHBhdGgpIHtcclxuXHRcdFx0dGFzay5wYXRoID0gcGF0aDtcclxuXHRcdFx0JHJvb3QuZ2V0QnlOYW1lKCdwYXRoJykudmFsdWUocGF0aCk7XHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZUdlbmVyYWw7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCBBY3Rpb25CYXIgZnJvbSAnLi4vY29tcG9uZW50cy9BY3Rpb25CYXInO1xyXG5pbXBvcnQgRGF0YVRhYmxlIGZyb20gJy4uL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4JztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuXHJcbmNvbnN0IFRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyID0gKHsgdGFzaywgZmlsZVR5cGVDb250cm9scywgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSBBY3Rpb25CYXIoe1xyXG5cdFx0YnV0dG9uczogW1xyXG5cdFx0XHR7IG5hbWU6ICdhZGQnLCB0b29sdGlwOiAnQWRkIGl0ZW0nLCBpY29uOiBJY29uKCdhZGQnKSwgb25DbGljazogYWRkSXRlbSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdtb3ZlVXAnLCB0b29sdGlwOiAnTW92ZSB1cCcsIGljb246IEljb24oJ3VwJyksIGRpc2FibGVkOiB0cnVlLCBvbkNsaWNrOiAoKSA9PiBtb3ZlSXRlbSgndXAnKSB9LFxyXG5cdFx0XHR7IG5hbWU6ICdtb3ZlRG93bicsIHRvb2x0aXA6ICdNb3ZlIGRvd24nLCBpY29uOiBJY29uKCdkb3duJyksIGRpc2FibGVkOiB0cnVlLCBvbkNsaWNrOiAoKSA9PiBtb3ZlSXRlbSgnZG93bicpIH0sXHJcblx0XHRcdHsgbmFtZTogJ2NvcHknLCB0b29sdGlwOiAnQ29weScsIGljb246IEljb24oJ2NvcHknKSwgZGlzYWJsZWQ6IHRydWUsIG9uQ2xpY2s6IGNvcHlJdGVtcyB9LFxyXG5cdFx0XHR7IG5hbWU6ICdwYXN0ZScsIHRvb2x0aXA6ICdQYXN0ZScsIGljb246IEljb24oJ3Bhc3RlJyksIGRpc2FibGVkOiB0cnVlLCBvbkNsaWNrOiBwYXN0ZUl0ZW1zIH0sXHJcblx0XHRcdHsgbmFtZTogJ2RlbGV0ZScsIHRvb2x0aXA6ICdEZWxldGUnLCBpY29uOiBJY29uKCd0cmFzaCcpLCBkaXNhYmxlZDogdHJ1ZSwgb25DbGljazogcmVtb3ZlSXRlbSB9LFxyXG5cdFx0XVxyXG5cdH0pO1xyXG5cdGNvbnN0IHJvb3QgPSAoXHJcblx0XHQ8ZGl2IGNsYXNzPVwiVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIgdy1taW5cIj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cImFjdGlvbi1iYXIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHBiLTEuNVwiPlxyXG5cdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWVcIj5cclxuXHRcdFx0XHRcdFx0PGI+RmlsdGVyPC9iPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHR7YWN0aW9uQmFyLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZHQtcGxhY2VcIj48L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRleHQtWzAuOWVtXSBvcGFjaXR5LTc1IHB0LTJcIj5cclxuXHRcdFx0XHRFbmFibGUgdGhlIHNlYXJjaCBmaWx0ZXIgdG8gY3JlYXRlIHJ1bGUgc2V0cyB1c2luZyBtdWx0aXBsZSBwcm9wZXJ0aWVzLCB2YWx1ZXMsIGFuZCBjb25kaXRpb25zLiBXaGVuIHRoZSB0YXNrIHN0YXJ0cywgb25seSB0aGUgZmlsdGVyZWQgZmlsZXMgd2lsbCBiZSBvcHRpbWl6ZWQuIFRvIHRlc3QgYW5kIHZhbGlkYXRlIHRoZSBmaWx0ZXIsIGNsaWNrIHRoZSA8c3BhbiBjbGFzcz1cImZvbnQtc2VtaWJvbGRcIj5WaWV3IGZpbGVzPC9zcGFuPiBidXR0b24uXHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCBsZWZ0QnJhY2tldE9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIubGVmdEJyYWNrZXRPcHRpb25zO1xyXG5cdGNvbnN0IHJpZ2h0QnJhY2tldE9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIucmlnaHRCcmFja2V0T3B0aW9ucztcclxuXHRjb25zdCBwcm9wZXJ0eU9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIucHJvcGVydHlPcHRpb25zO1xyXG5cdGNvbnN0IGNvbmRpdGlvbk9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIuY29uZGl0aW9uT3B0aW9ucztcclxuXHRjb25zdCBvcGVyYXRvck9wdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIub3BlcmF0b3JPcHRpb25zO1xyXG5cdGNvbnN0IG51bWJlckNvbmRpdGlvbnMgPSBzaGFyZWQuY29uc3RhbnRzLmZpbGVGaWx0ZXIubnVtYmVyQ29uZGl0aW9ucztcclxuXHRjb25zdCBzdHJpbmdDb25kaXRpb25zID0gc2hhcmVkLmNvbnN0YW50cy5maWxlRmlsdGVyLnN0cmluZ0NvbmRpdGlvbnM7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnQ6ICRyb290LFxyXG5cdFx0YWN0aW9uQmFyLFxyXG5cdFx0bG9hZCxcclxuXHR9O1xyXG5cdGxldCBfZmlsZVR5cGU7XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblxyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0ZnVuY3Rpb24gc2V0RGF0YVRhYmxlKCkge1xyXG5cdFx0X2RhdGFUYWJsZSA9IERhdGFUYWJsZSh7XHJcblx0XHRcdHBsYWNlOiAkcm9vdC5nZXQoJy5kdC1wbGFjZScpLm5vZGVzWzBdLFxyXG5cdFx0XHRjaGVja2JveDogdHJ1ZSxcclxuXHRcdFx0c29ydDogZmFsc2UsXHJcblx0XHRcdHJlc2l6ZTogZmFsc2UsXHJcblx0XHRcdGJvcmRlcnM6IHtcclxuXHRcdFx0XHR0YWJsZToge1xyXG5cdFx0XHRcdFx0YWxsOiB0cnVlLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cm93czogdHJ1ZSxcclxuXHRcdFx0XHRjZWxsczogdHJ1ZSxcclxuXHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0J2JvcmRlci1jb2xvcic6ICcjY2NjJyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb2x1bW5zOiB7XHJcblx0XHRcdFx0bGVmdFBhcmVudGhlc2VzOiB7IGRpc3BsYXlOYW1lOiAnKCcsIHdpZHRoOiA0MCwgc3R5bGU6IHsgY29sb3I6ICcjNjY2JywgcGFkZGluZ0xlZnQ6IDExIH0gfSxcclxuXHRcdFx0XHRwcm9wZXJ0eTogeyBkaXNwbGF5TmFtZTogJ1Byb3BlcnR5Jywgd2lkdGg6IDE0MCwgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDExIH0gfSxcclxuXHRcdFx0XHRjb25kaXRpb246IHsgZGlzcGxheU5hbWU6ICdDb25kaXRpb24nLCB3aWR0aDogMTQwLCBzdHlsZTogeyBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdHZhbHVlOiB7IGRpc3BsYXlOYW1lOiAnVmFsdWUnLCB3aWR0aDogMjAwLCBzdHlsZTogeyBwYWRkaW5nTGVmdDogMTEgfSB9LFxyXG5cdFx0XHRcdHJpZ2h0UGFyZW50aGVzZXM6IHsgZGlzcGxheU5hbWU6ICcpJywgd2lkdGg6IDQwLCBzdHlsZTogeyBjb2xvcjogJyM2NjYnLCBwYWRkaW5nTGVmdDogMTIgfSB9LFxyXG5cdFx0XHRcdG9wZXJhdG9yOiB7IGRpc3BsYXlOYW1lOiAnT3BlcmF0b3InLCB3aWR0aDogOTAsIHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxMSB9IH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdHJvd3M6IHtcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiBmYWxzZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2VsbHM6IHtcclxuXHRcdFx0XHRsZWZ0UGFyZW50aGVzZXM6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwibGVmdFBhcmVudGhlc2VzXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRsZWZ0QnJhY2tldE9wdGlvbnMubWFwKHByb3AgPT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17cHJvcC5uYW1lfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwcm9wZXJ0eToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJwcm9wZXJ0eVwiIGNsYXNzPVwibm8taWNvbiBiLXRyYW5zcGFyZW50XCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlPcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0gZGF0YS10eXBlPXtwcm9wLmRhdGFUeXBlfT5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cHJvcC5kaXNwbGF5TmFtZX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZmllbGQudmFsdWUgPSB2YWx1ZTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmaWVsZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb25kaXRpb246IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwiY29uZGl0aW9uXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRjb25kaXRpb25PcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3Byb3AuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmllbGQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgaW5wdXRIaWRkZW4gPSA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ2YWx1ZVwiPjwvaW5wdXQ+O1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbnB1dE51bWJlciA9IDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIGNsYXNzPVwiYi10cmFuc3BhcmVudFwiIC8+O1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbnB1dERhdGUgPSA8aW5wdXQgdHlwZT1cImRhdGVcIiBjbGFzcz1cImItdHJhbnNwYXJlbnRcIiAvPjtcclxuXHRcdFx0XHRcdFx0Y29uc3QgdGV4dGFyZWEgPSA8dGV4dGFyZWEgZGF0YS10eXBlPVwic3RyaW5nXCIgcm93cz1cIjFcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiBjbGFzcz1cImItdHJhbnNwYXJlbnRcIj48L3RleHRhcmVhPjtcclxuXHJcblx0XHRcdFx0XHRcdGlucHV0SGlkZGVuLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGRvbShpbnB1dE51bWJlcikudmFsdWUodmFsdWUpLmhpZGUoKS5vbignaW5wdXQnLCAoeyBlbGVtZW50IH0pID0+IHVwZGF0ZUlucHV0SGlkZGVuKGVsZW1lbnQudmFsdWUoKSkpO1xyXG5cdFx0XHRcdFx0XHRkb20oaW5wdXREYXRlKS52YWx1ZSh2YWx1ZSkuaGlkZSgpLm9uKCdpbnB1dCcsICh7IGVsZW1lbnQgfSkgPT4gdXBkYXRlSW5wdXRIaWRkZW4oZWxlbWVudC52YWx1ZSgpKSk7XHJcblx0XHRcdFx0XHRcdGRvbSh0ZXh0YXJlYSkudmFsdWUodmFsdWUpLm9uKCdpbnB1dCcsICh7IGVsZW1lbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZUlucHV0SGlkZGVuKGVsZW1lbnQudmFsdWUoKSk7XHJcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5yZXNpemUoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWVsZHNcIj5cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dEhpZGRlbn1cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dE51bWJlcn1cclxuXHRcdFx0XHRcdFx0XHRcdHtpbnB1dERhdGV9XHJcblx0XHRcdFx0XHRcdFx0XHR7dGV4dGFyZWF9XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbiB1cGRhdGVJbnB1dEhpZGRlbih2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlucHV0SGlkZGVuLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXRIaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JykpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cmlnaHRQYXJlbnRoZXNlczoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmaWVsZCA9IChcclxuXHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJyaWdodFBhcmVudGhlc2VzXCIgY2xhc3M9XCJuby1pY29uIGItdHJhbnNwYXJlbnRcIj57XHJcblx0XHRcdFx0XHRcdFx0XHRyaWdodEJyYWNrZXRPcHRpb25zLm1hcChwcm9wID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3Byb3AubmFtZX0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3Byb3AuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdH08L3NlbGVjdD5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmllbGQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0b3BlcmF0b3I6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmllbGQgPSAoXHJcblx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwib3BlcmF0b3JcIiBjbGFzcz1cIm5vLWljb24gYi10cmFuc3BhcmVudFwiPntcclxuXHRcdFx0XHRcdFx0XHRcdG9wZXJhdG9yT3B0aW9ucy5tYXAocHJvcCA9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPXtwcm9wLm5hbWV9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtwcm9wLmRpc3BsYXlOYW1lfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHR9PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZpZWxkO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRpZiAoIXJvdy5kYXRhKCkub3BlcmF0b3IpXHJcblx0XHRcdFx0XHRyb3cuZGF0YSh7IG9wZXJhdG9yOiAnYW5kJyB9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRlbmFibGVBY3Rpb25CYXJCdXR0b25zKHJvd3MubGVuZ3RoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25VcGRhdGVSb3c6ICh7IHJvdywgZmllbGRzIH0pID0+IHtcclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uUmVtb3ZlUm93czogKCkgPT4ge1xyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0XHRlbmFibGVBY3Rpb25CYXJCdXR0b25zKF9kYXRhVGFibGUuc2VsZWN0ZWRSb3dzKCkubGVuZ3RoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbG9hZChmaWxlVHlwZSkge1xyXG5cdFx0Y29uc3QgZmlsdGVyID0gdGFzay5maWxlVHlwZXMuZmluZCh4ID0+IHgudHlwZSA9PSBmaWxlVHlwZSkuZmlsdGVyO1xyXG5cclxuXHRcdF9maWxlVHlwZSA9IGZpbGVUeXBlO1xyXG5cclxuXHRcdCRyb290LmdldEJ5TmFtZSgnZW5hYmxlZCcpLmZpcnN0KCkuYmluZERhdGEoe1xyXG5cdFx0XHRvYmplY3Q6IGZpbHRlcixcclxuXHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0Ly8gaGFiaWxpdGEvZGVzYWJpbGl0YSBvIGZpbHRyb1xyXG5cdFx0XHRfZGF0YVRhYmxlLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0ZG9tKGFjdGlvbkJhci5lbGVtZW50KS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGxvYWRGaWx0ZXIoKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWRGaWx0ZXIoKSB7XHJcblx0XHRjb25zdCBpdGVtcyA9IHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gX2ZpbGVUeXBlKS5maWx0ZXIuaXRlbXM7XHJcblxyXG5cdFx0X2RhdGFUYWJsZS5sb2FkKGl0ZW1zKTtcclxuXHRcdGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiBiaW5kRGF0YShpdGVtLCBpbmRleCkpO1xyXG5cdFx0ZW5hYmxlQWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbmFibGVBY3Rpb25CYXJCdXR0b25zKGVuYWJsZSA9IHRydWUpIHtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ21vdmVVcCcpLmRpc2FibGUoIWVuYWJsZSk7XHJcblx0XHRhY3Rpb25CYXIuYnV0dG9uKCdtb3ZlRG93bicpLmRpc2FibGUoIWVuYWJsZSk7XHJcblx0XHRhY3Rpb25CYXIuYnV0dG9uKCdjb3B5JykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ3Bhc3RlJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdGFjdGlvbkJhci5idXR0b24oJ2RlbGV0ZScpLmRpc2FibGUoIWVuYWJsZSk7XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbmFibGVQYXN0ZUJ1dHRvbkZvckFsbEZpbHRlcnMoZW5hYmxlKSB7XHJcblx0XHRlbmFibGUgPSBlbmFibGUgfHwgc2hhcmVkLnRlbXAgJiYgc2hhcmVkLnRlbXAuc2VsZWN0ZWRGaWx0ZXJJdGVtcy5sZW5ndGg7XHJcblxyXG5cdFx0Zm9yIChsZXQgZmlsZVR5cGUgaW4gZmlsZVR5cGVDb250cm9scykge1xyXG5cdFx0XHRsZXQgZGF0YXRhYmxlRmlsdGVyID0gZmlsZVR5cGVDb250cm9sc1tmaWxlVHlwZV0uZmlsdGVyO1xyXG5cclxuXHRcdFx0ZGF0YXRhYmxlRmlsdGVyLmFjdGlvbkJhci5idXR0b24oJ3Bhc3RlJykuZGlzYWJsZSghZW5hYmxlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW0oKSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogZmlsdGVySXRlbSB9ID0gYXdhaXQgd2ViQVBJLm5ld1Rhc2tGaWxlRmlsdGVySXRlbSgpO1xyXG5cclxuXHRcdF9kYXRhVGFibGUuYWRkUm93KGZpbHRlckl0ZW0pO1xyXG5cdFx0YmluZERhdGEoZmlsdGVySXRlbSwgX2RhdGFUYWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbW92ZUl0ZW0oZGlyZWN0aW9uKSB7XHJcblx0XHQvLyBkaXJlY3Rpb246IHN0cmluZyAodXAvZG93bilcclxuXHJcblx0XHRfZGF0YVRhYmxlLm1vdmVTZWxlY3RlZFJvd3MoZGlyZWN0aW9uID09ICdkb3duJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5SXRlbXMoKSB7XHJcblx0XHRsZXQgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoX2RhdGFUYWJsZS5zZWxlY3RlZFJvd3MoKS5tYXAocm93ID0+IHJvdy5kYXRhKCkpKTtcclxuXHJcblx0XHRzaGFyZWQudGVtcCA9IHtcclxuXHRcdFx0c2VsZWN0ZWRGaWx0ZXJJdGVtczogY2xvbmVcclxuXHRcdH07XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwYXN0ZUl0ZW1zKCkge1xyXG5cdFx0aWYgKHNoYXJlZC50ZW1wICYmIHNoYXJlZC50ZW1wLnNlbGVjdGVkRmlsdGVySXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gX2ZpbGVUeXBlKS5maWx0ZXIuaXRlbXMucHVzaCguLi5zaGFyZWQudGVtcC5zZWxlY3RlZEZpbHRlckl0ZW1zKTtcclxuXHRcdFx0bG9hZEZpbHRlcigpO1xyXG5cdFx0XHRzaGFyZWQudGVtcCA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZW5hYmxlUGFzdGVCdXR0b25Gb3JBbGxGaWx0ZXJzKGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZUl0ZW0oKSB7XHJcblx0XHRfZGF0YVRhYmxlLnJlbW92ZVNlbGVjdGVkUm93cygpO1xyXG5cclxuXHRcdC8vIGFkaWNpb25hIHVtIGl0ZW0gdmF6aW8gc2UgdHVkbyBmb3IgZGVsZXRhZG9cclxuXHRcdGlmICghX2RhdGFUYWJsZS5yb3dzLmxlbmd0aClcclxuXHRcdFx0YWRkSXRlbSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmluZERhdGEoZmlsdGVySXRlbSwgcm93SW5kZXgpIHtcclxuXHRcdGxldCAkcm93ID0gZG9tKF9kYXRhVGFibGUucm93c1tyb3dJbmRleF0uZWxlbWVudCk7XHJcblxyXG5cdFx0JHJvdy5nZXQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0JykuYmluZERhdGEoe1xyXG5cdFx0XHRvYmplY3Q6IGZpbHRlckl0ZW0sXHJcblx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdGlmIChrZXkgPT0gJ3Byb3BlcnR5Jykge1xyXG5cdFx0XHRcdHNldEZpZWxkcyh7IGtleSwgZmllbGQsIGZpZWxkcywgZXZlbnQgfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RmllbGRzKHsga2V5LCBmaWVsZCwgZmllbGRzLCBldmVudCB9KSB7XHJcblx0XHRpZiAoa2V5ID09ICdwcm9wZXJ0eScpIHtcclxuXHRcdFx0Y29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gZmllbGQubm9kZXNbMF0uc2VsZWN0ZWRPcHRpb25zO1xyXG5cclxuXHRcdFx0aWYgKHNlbGVjdGVkT3B0aW9ucy5sZW5ndGgpIHtcclxuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eURhdGFUeXBlID0gc2VsZWN0ZWRPcHRpb25zWzBdLmRhdGFzZXQudHlwZTtcclxuXHJcblx0XHRcdFx0Ly8gQ29uZGl0aW9uIC0gZXhpYmUvb2N1bHRhIGFzIG9wXHUwMEU3XHUwMEY1ZXMgY29ycmV0YXMgcGVsYSBwcm9wcmllZGFkZSBzZWxlY2lvbmFkYVxyXG5cdFx0XHRcdGZpZWxkcy5jb25kaXRpb24uZ2V0KCdvcHRpb24nKS5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBjb25kaXRpb25zID0gcHJvcGVydHlEYXRhVHlwZSA9PSAnbnVtYmVyJyB8fCBwcm9wZXJ0eURhdGFUeXBlID09ICdkYXRlJyA/IG51bWJlckNvbmRpdGlvbnMgOiBzdHJpbmdDb25kaXRpb25zO1xyXG5cdFx0XHRcdFx0bGV0IHNob3cgPSBjb25kaXRpb25zLnNvbWUoeCA9PiB4ID09IG9wdGlvbi52YWx1ZSgpKTtcclxuXHJcblx0XHRcdFx0XHRvcHRpb24uc2hvdyhzaG93KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIXNob3cgJiYgb3B0aW9uLnZhbHVlKCkgPT0gZmllbGRzLmNvbmRpdGlvbi52YWx1ZSgpKVxyXG5cdFx0XHRcdFx0XHRmaWVsZHMuY29uZGl0aW9uLnZhbHVlKCcnKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0Ly8gVmFsdWUgLSBleGliZSB1bSBkb3MgY2FtcG9zIChpbnB1dDpudW1iZXIsIGlucHV0OmRhdGUgb3UgdGV4dGFyZWEpIHBlbG8gbyB0aXBvIGRlIGRhZG9cclxuXHRcdFx0XHRmaWVsZHMudmFsdWUucGFyZW50KCkuZ2V0KCcqJykuaGlkZSgpLmZvckVhY2goZmllbGQgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKFxyXG5cdFx0XHRcdFx0XHRmaWVsZC5hdHRyKCd0eXBlJykgPT0gcHJvcGVydHlEYXRhVHlwZSB8fFxyXG5cdFx0XHRcdFx0XHRmaWVsZC5hdHRyKCdkYXRhLXR5cGUnKSA9PSBwcm9wZXJ0eURhdGFUeXBlXHJcblx0XHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcdFx0ZmllbGRzLnZhbHVlLnZhbHVlKCcnKTtcclxuXHRcdFx0XHRcdFx0XHRmaWVsZC52YWx1ZSgnJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGZpZWxkLnNob3coKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlRmlsZVNldHRpbmdzRmlsdGVyO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgVGFicyBmcm9tICcuLi9jb21wb25lbnRzL1RhYnMnO1xyXG5pbXBvcnQgVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIgZnJvbSAnLi9UYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlcic7XHJcblxyXG5jb25zdCBUYXNrUGFnZUZpbGVTZXR0aW5ncyA9ICh7IHRhc2ssIHRhYkluZGV4ID0gMCwgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCBfZmlsZVR5cGVDb250cm9scyA9IHt9O1xyXG5cdGNvbnN0IHRhYnMgPSBUYWJzKHtcclxuXHRcdG5hbWVzOiBzaGFyZWQuY29uc3RhbnRzLmZpbGVUeXBlcy5tYXAodHlwZSA9PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXJcIj5cclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiIG9uQ2xpY2s9e2UgPT4gZS5wcmV2ZW50RGVmYXVsdCgpfT5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwiZmlsZVR5cGVcIiB2YWx1ZT17dHlwZS5uYW1lfSBvbkNsaWNrPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9IC8+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHQ8Yj57dHlwZS5kaXNwbGF5TmFtZX08L2I+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0KSxcclxuXHRcdHN0eWxlOiB7XHJcblx0XHRcdCdwYWRkaW5nLWxlZnQnOiA4LFxyXG5cdFx0fSxcclxuXHRcdG9uQ2hhbmdlOiBpbmRleCA9PiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFiVHlwZUluZGV4JywgaW5kZXgpXHJcblx0fSk7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxmb3JtIGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMTAgIXB5LTEwXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sXCI+XHJcblx0XHRcdFx0PGI+VHlwZXM8L2I+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRleHQtWzAuOWVtXSBvcGFjaXR5LTc1IHB0LTFcIj5cclxuXHRcdFx0XHRcdFNlbGVjdCB0aGUgZmlsZSB0eXBlcyB0byBiZSBvcHRpbWl6ZWQuXHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInB5LTMgYm9yZGVyLWItMSBib3JkZXItZ3JheS0zMDBcIj5cclxuXHRcdFx0XHRcdHt0YWJzLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHR7c2hhcmVkLmNvbnN0YW50cy5maWxlVHlwZXMubWFwKHR5cGUgPT4ge1xyXG5cdFx0XHRcdGxldCBmaWx0ZXIgPSBUYXNrUGFnZUZpbGVTZXR0aW5nc0ZpbHRlcih7IHRhc2ssIGZpbGVUeXBlQ29udHJvbHM6IF9maWxlVHlwZUNvbnRyb2xzLCBzdG9yZUl0ZW0gfSk7XHJcblx0XHRcdFx0bGV0IGVsZW1lbnQgPSAoXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMTBcIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRleHQtbGcgZm9udC1ib2xkXCI+e3R5cGUuZGlzcGxheU5hbWV9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC01IHctODBcIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxiPlF1YWxpdHk8L2I+XHJcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiMFwiIG1heD1cIjEwMFwiIHN0ZXA9XCI1XCIgbmFtZT1cInF1YWxpdHlcIiBjbGFzcz1cInJhbmdlXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwicXVhbGl0eS12YWx1ZVwiPjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1bMC45ZW1dIG9wYWNpdHktNzUgcHQtMVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0VGhlIGxvd2VyIHRoZSBxdWFsaXR5LCB0aGUgc21hbGxlciB0aGUgZmlsZSBzaXplLiBGaW5kIHRoZSByaWdodCBiYWxhbmNlLlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgbWF4V2lkdGhcIj5cclxuXHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lIGZsZXggZ2FwLTggaXRlbXMtYmFzZWxpbmVcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGI+TWF4LiB3aWR0aCAocHgpPC9iPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBuYW1lPVwidmFsdWVcIiBjbGFzcz1cIm1pbi13LVs2ZW1dXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRleHQtWzAuOWVtXSBvcGFjaXR5LTc1IHB0LTFcIj5cclxuXHRcdFx0XHRcdFx0XHRcdExpbWl0cyB0aGUgd2lkdGggb2YgaW1hZ2VzIHRoYXQgZXhjZWVkIHRoZSBzcGVjaWZpZWQgd2lkdGguXHJcblx0XHRcdFx0XHRcdFx0XHQ8YnIvPjxiPk5vdGU8L2I+OiBEb2VzIG5vdCBhZmZlY3QgaW1hZ2VzIHNtYWxsZXIgdGhhbiB0aGUgc3BlY2lmaWVkIHdpZHRoLlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgY29udmVydFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNoZWNrYm94LW5hbWUgZmxleCBnYXAtOCBpdGVtcy1iYXNlbGluZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8Yj5Db252ZXJ0IHRvPC9iPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8c2VsZWN0IG5hbWU9XCJ0eXBlXCIgY2xhc3M9XCJtaW4tdy1bNmVtXVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24+PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e3NoYXJlZC5jb25zdGFudHMuZmlsZVR5cGVzLm1hcChfdHlwZSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3R5cGUubmFtZSAhPSB0eXBlLm5hbWUpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiA8b3B0aW9uIHZhbHVlPXtfdHlwZS5uYW1lfT57X3R5cGUubmFtZS50b1VwcGVyQ2FzZSgpfTwvb3B0aW9uPjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KX1cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0ZXh0LVswLjllbV0gb3BhY2l0eS03NSBwdC0xXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRDb252ZXJ0cyB0aGUgb3JpZ2luYWwgaW1hZ2UgdG8gdGhlIHNwZWNpZmllZCB0eXBlLiBOb3RlOiBUaGlzIHdpbGwgbm90IGNyZWF0ZSBhIG5ldyBpbWFnZS5cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdHtmaWx0ZXIuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGVsZW1lbnQgPSBkb20oZWxlbWVudCk7XHJcblxyXG5cdFx0XHRcdF9maWxlVHlwZUNvbnRyb2xzW3R5cGUubmFtZV0gPSB7XHJcblx0XHRcdFx0XHRlbGVtZW50LFxyXG5cdFx0XHRcdFx0ZmlsdGVyLFxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dGFicy5jb250ZW50cy5wdXNoKGVsZW1lbnQpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZWxlbWVudC5ub2Rlc1swXTtcclxuXHRcdFx0fSl9XHJcblx0XHQ8L2Zvcm0+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdHRhYnMuc2VsZWN0VGFiKHRhYkluZGV4KTtcclxuXHJcblx0XHR0YWJzLmVsZW1lbnQuZ2V0QnlOYW1lKCdmaWxlVHlwZScpLmZvckVhY2goJGZpbGVUeXBlID0+IHtcclxuXHRcdFx0Y29uc3QgdHlwZSA9ICRmaWxlVHlwZS52YWx1ZSgpO1xyXG5cdFx0XHRjb25zdCBlbGVtZW50ID0gX2ZpbGVUeXBlQ29udHJvbHNbdHlwZV0uZWxlbWVudDtcclxuXHRcdFx0Y29uc3QgZmlsZVR5cGUgPSB0YXNrLmZpbGVUeXBlcy5maW5kKHggPT4geC50eXBlID09IHR5cGUpO1xyXG5cclxuXHRcdFx0JGZpbGVUeXBlLmJpbmREYXRhKHtcclxuXHRcdFx0XHRrZXk6ICdlbmFibGVkJyxcclxuXHRcdFx0XHRvYmplY3Q6IGZpbGVUeXBlLFxyXG5cdFx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZG9tKGVsZW1lbnQpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Zm9yIChjb25zdCB0eXBlIGluIF9maWxlVHlwZUNvbnRyb2xzKSB7XHJcblx0XHRcdGNvbnN0IGVsZW1lbnQgPSBfZmlsZVR5cGVDb250cm9sc1t0eXBlXS5lbGVtZW50O1xyXG5cdFx0XHRjb25zdCBmaWxlVHlwZSA9IHRhc2suZmlsZVR5cGVzLmZpbmQoeCA9PiB4LnR5cGUgPT0gdHlwZSk7XHJcblxyXG5cdFx0XHQvLyBRdWFsaXR5XHJcblx0XHRcdGVsZW1lbnQuZ2V0QnlOYW1lKFsncXVhbGl0eSddKS5iaW5kRGF0YSh7XHJcblx0XHRcdFx0b2JqZWN0OiBmaWxlVHlwZSxcclxuXHRcdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGZpZWxkLnBhcmVudCgpLmdldCgnLnF1YWxpdHktdmFsdWUnKS50ZXh0KHZhbHVlICsgJyUnKTtcclxuXHRcdFx0XHRmaWxlVHlwZS5xdWFsaXR5ID0gTnVtYmVyKHZhbHVlKTtcclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gTWF4LiB3aWR0aCAocHgpXHJcblx0XHRcdGVsZW1lbnQuZ2V0KCcubWF4V2lkdGggaW5wdXQnKS5iaW5kRGF0YSh7XHJcblx0XHRcdFx0b2JqZWN0OiBmaWxlVHlwZS5tYXhXaWR0aCxcclxuXHRcdFx0fSkub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ2VuYWJsZWQnKSB7XHJcblx0XHRcdFx0XHRmaWVsZHMudmFsdWUuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGtleSA9PSAndmFsdWUnKSB7XHJcblx0XHRcdFx0XHRmaWxlVHlwZS5tYXhXaWR0aC52YWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gQ29udmVydCB0b1xyXG5cdFx0XHRlbGVtZW50LmdldCgnLmNvbnZlcnQnKS5nZXQoJ2lucHV0LCBzZWxlY3QnKS5iaW5kRGF0YSh7XHJcblx0XHRcdFx0b2JqZWN0OiBmaWxlVHlwZS5jb252ZXJ0LFxyXG5cdFx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0aWYgKGtleSA9PSAnZW5hYmxlZCcpIHtcclxuXHRcdFx0XHRcdGZpZWxkcy50eXBlLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBGaWx0ZXJcclxuXHRcdFx0X2ZpbGVUeXBlQ29udHJvbHNbdHlwZV0uZmlsdGVyLmxvYWQodHlwZSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2VGaWxlU2V0dGluZ3M7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcblxyXG5jb25zdCBUYXNrUGFnZVNjaGVkdWxlID0gKHsgdGFzaywgc3RvcmVJdGVtIH0pID0+IHtcclxuXHRjb25zdCByb290ID0gKFxyXG5cdFx0PGZvcm0gY2xhc3M9XCJUYXNrUGFnZVNjaGVkdWxlIGZsZXggZmxleC1jb2wgZ2FwLTEwICFweS0xMFwiPlxyXG5cdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveCBlbmFibGVkXCI+XHJcblx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0PGI+RW5hYmxlZDwvYj5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtZGVzY3JpcHRpb25cIj5cclxuXHRcdFx0XHRcdFNlbGVjdCB0aGUgZGF5cyBvZiB0aGUgd2VlaywgYW5kIHNwZWNpZnkgdGhlIHN0YXJ0IHRpbWVzIGFuZCByZWN1cnJlbmNlIGZvciB0aGUgdGFzayBleGVjdXRpb24uXHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvbGFiZWw+XHJcblx0XHRcdDx0YWJsZT5cclxuXHRcdFx0XHQ8dGhlYWQ+XHJcblx0XHRcdFx0XHQ8dHI+XHJcblx0XHRcdFx0XHRcdDx0aD5BbHdheXMgcnVuPC90aD5cclxuXHRcdFx0XHRcdFx0PHRoPlN0YXJ0IG9uIHRpbWU8L3RoPlxyXG5cdFx0XHRcdFx0XHQ8dGggY29sc3Bhbj1cIjNcIj5SZXBlYXQgZXZlcnk8L3RoPlxyXG5cdFx0XHRcdFx0PC90cj5cclxuXHRcdFx0XHQ8L3RoZWFkPlxyXG5cdFx0XHRcdDx0Ym9keT57XHJcblx0XHRcdFx0XHRzaGFyZWQuY29uc3RhbnRzLndlZWtkYXlzLm1hcChkYXkgPT5cclxuXHRcdFx0XHRcdFx0PHRyPlxyXG5cdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCIgdGl0bGU9XCJFbmFibGUvRGlzYWJsZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZWRcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtkYXkuZGlzcGxheU5hbWV9XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwidGltZVwiIG5hbWU9XCJzdGFydFRpbWVcIiAvPlxyXG5cdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0PHRkIGNsYXNzPVwicmVwZWF0XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cInJlcGVhdFwiIC8+XHJcblx0XHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInJlcGVhdFRpbWVWYWx1ZVwiIG1pbj1cIjFcIiBzdGVwPVwiMVwiIHBhdHRlcm49XCJcXGQqXCIgb25JbnB1dD17b25JbnB1dFJlcGVhdFZhbHVlfSBvbkNoYW5nZT17b25DaGFuZ2VSZXBlYXRWYWx1ZX0gLz5cclxuXHRcdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDxzZWxlY3QgbmFtZT1cInJlcGVhdFRpbWVVbml0XCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRzaGFyZWQuY29uc3RhbnRzLnJlcGVhdFRpbWVVbml0Lm1hcCh1bml0ID0+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17dW5pdC5uYW1lfT57dW5pdC5kaXNwbGF5TmFtZX08L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdFx0fTwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdDwvdHI+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fTwvdGJvZHk+XHJcblx0XHRcdDwvdGFibGU+XHJcblx0XHQ8L2Zvcm0+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdC8vIFN0YXJ0IHRhc2sgb25cclxuXHRcdCRyb290LmdldCgnLmVuYWJsZWQnKS5nZXRCeU5hbWUoW1xyXG5cdFx0XHQnZW5hYmxlZCcsXHJcblx0XHRdKS5iaW5kRGF0YSh7XHJcblx0XHRcdG9iamVjdDogdGFzay5zY2hlZHVsZSxcclxuXHRcdH0pLm9uQ2hhbmdlKCh7IGFyZ3MsIGJhc2VOb2RlLCBmaWVsZCwgZmllbGRzLCBvYmplY3QsIGtleSwgdmFsdWUsIGV2ZW50IH0pID0+IHtcclxuXHRcdFx0aWYgKGtleSA9PSAnZW5hYmxlZCcpIHtcclxuXHRcdFx0XHQkcm9vdC5nZXQoJ3RhYmxlJykuZGlzYWJsZSghdmFsdWUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBjYW1wb3MgZGEgdGFiZWxhXHJcblx0XHQkcm9vdC5nZXQoJ3Rib2R5IHRyJykuZm9yRWFjaCgoJHJvdywgaW5kZXgpID0+IHtcclxuXHRcdFx0Y29uc3Qgd2Vla2RheSA9IHRhc2suc2NoZWR1bGUud2Vla2RheXNbaW5kZXhdO1xyXG5cclxuXHRcdFx0JHJvdy5nZXRCeU5hbWUoW1xyXG5cdFx0XHRcdCdlbmFibGVkJyxcclxuXHRcdFx0XHQnc3RhcnRUaW1lJyxcclxuXHRcdFx0XHQncmVwZWF0JyxcclxuXHRcdFx0XHQncmVwZWF0VGltZVZhbHVlJyxcclxuXHRcdFx0XHQncmVwZWF0VGltZVVuaXQnLFxyXG5cdFx0XHRdKS5iaW5kRGF0YSh7XHJcblx0XHRcdFx0b2JqZWN0OiB3ZWVrZGF5LFxyXG5cdFx0XHR9KS5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0aWYgKGtleSA9PSAnZW5hYmxlZCcpIHtcclxuXHRcdFx0XHRcdGxldCBjaGVja2VkMSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0bGV0IGNoZWNrZWQyID0gY2hlY2tlZDEgJiYgZmllbGRzLnJlcGVhdC5hdHRyKCdjaGVja2VkJyk7XHJcblxyXG5cdFx0XHRcdFx0ZmllbGRzLnJlcGVhdC5wYXJlbnQoKS5kaXNhYmxlKCFjaGVja2VkMSk7XHJcblx0XHRcdFx0XHRmaWVsZHMuc3RhcnRUaW1lLmRpc2FibGUoIWNoZWNrZWQxKTtcclxuXHRcdFx0XHRcdGZpZWxkcy5yZXBlYXRUaW1lVmFsdWUuZGlzYWJsZSghY2hlY2tlZDIpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLnJlcGVhdFRpbWVVbml0LmRpc2FibGUoIWNoZWNrZWQyKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ3JlcGVhdCcgJiYgZXZlbnQpIHtcclxuXHRcdFx0XHRcdGxldCBjaGVja2VkMiA9IHZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdGZpZWxkcy5yZXBlYXRUaW1lVmFsdWUuZGlzYWJsZSghY2hlY2tlZDIpO1xyXG5cdFx0XHRcdFx0ZmllbGRzLnJlcGVhdFRpbWVVbml0LmRpc2FibGUoIWNoZWNrZWQyKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ3JlcGVhdFRpbWVWYWx1ZScpIHtcclxuXHRcdFx0XHRcdHdlZWtkYXkucmVwZWF0VGltZVZhbHVlID0gTnVtYmVyKHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uSW5wdXRSZXBlYXRWYWx1ZShldmVudCkge1xyXG5cdFx0Ly8gc29tZW50ZSBudW1lcm9zIGludGVpcm9zXHJcblx0XHRldmVudC50YXJnZXQudmFsdWUgPSBldmVudC50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csICcnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9uQ2hhbmdlUmVwZWF0VmFsdWUoZXZlbnQpIHtcclxuXHRcdGxldCBkZWZhdWx0VmFsdWUgPSAxO1xyXG5cclxuXHRcdGV2ZW50LnRhcmdldC52YWx1ZSA9IE51bWJlcihldmVudC50YXJnZXQudmFsdWUpIHx8IGRlZmF1bHRWYWx1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZVNjaGVkdWxlO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHdlYkFQSSBmcm9tICcuLi9zZXJ2aWNlcy9XZWJBUElTZXJ2aWNlJztcclxuaW1wb3J0IEljb24gZnJvbSAnLi4vY29tcG9uZW50cy9JY29uJztcclxuXHJcbmNvbnN0IFRhc2tQYWdlRXhjZXB0aW9ucyA9ICh7IHRhc2ssIHN0b3JlSXRlbSB9KSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxmb3JtIGNsYXNzPVwiVGFza1BhZ2VFeGNlcHRpb25zIGZsZXggZmxleC1jb2wgZ2FwLTEwICFweS0xMFwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiZmllbGRcIj5cclxuXHRcdFx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1uYW1lXCI+XHJcblx0XHRcdFx0XHRcdDxiPkVuYWJsZWQ8L2I+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGVja2JveC1kZXNjcmlwdGlvblwiPlxyXG5cdFx0XHRcdFx0XHRTcGVjaWZ5IHRoZSBkaXJlY3RvcnkgcGF0aHMgdG8gYmUgZXhjbHVkZWQgZnJvbSB0aGUgb3B0aW1pemF0aW9uIHNlcnZpY2UuXHJcblx0XHRcdFx0XHRcdDxici8+Rm9yIGVhY2ggc3BlY2lmaWVkIHBhdGgsIHNlbGVjdCB0aGUgcHJvdGVjdGlvbiB0eXBlLlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVwiPlxyXG5cdFx0XHRcdDx0YWJsZT5cclxuXHRcdFx0XHRcdDx0aGVhZD5cclxuXHRcdFx0XHRcdFx0PHRyPlxyXG5cdFx0XHRcdFx0XHRcdDx0aCBjb2xzcGFuPVwiMlwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtblwiPlBhdGg8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8L3RoPlxyXG5cdFx0XHRcdFx0XHRcdDx0aD5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW5cIj5Qcm90ZWN0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PC90aD5cclxuXHRcdFx0XHRcdFx0XHQ8dGg+XHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG9uQ2xpY2s9e2FkZEl0ZW19IHRpdGxlPVwiQWRkXCI+e0ljb24oJ2FkZCcpfTwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PC90aD5cclxuXHRcdFx0XHRcdFx0PC90cj5cclxuXHRcdFx0XHRcdDwvdGhlYWQ+XHJcblx0XHRcdFx0XHQ8dGJvZHk+e1xyXG5cdFx0XHRcdFx0XHR0YXNrLmV4Y2VwdGlvbnMuaXRlbXMubWFwKChleGNlcHRpb24sIGluZGV4KSA9PlxyXG5cdFx0XHRcdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIiB0aXRsZT1cIkVuYWJsZS9EaXNhYmxlXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJlbmFibGVkXCIgLz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cclxuXHRcdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG5hbWU9XCJidXR0b25QYXRoXCIgb25DbGljaz17KCkgPT4gc2VsZWN0UGF0aChleGNlcHRpb24sIGluZGV4KX0gdGl0bGU9XCJTZWxlY3QgZm9sZGVyXCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7SWNvbignZm9sZGVyJyl9XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInBhdGhcIiBjbGFzcz1cInctWzU1MHB4XVwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIC8+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PHNlbGVjdCBuYW1lPVwiY29udGVudFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9XCJyb290XCIgc2VsZWN0ZWQ+Um9vdCBmaWxlczwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9XCJhbGxcIj5BbGwgZGlyZWN0b3J5PC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDwvc2VsZWN0PlxyXG5cdFx0XHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gdy0xMCBoLTEwXCIgbmFtZT1cImJ1dHRvbkRlbGV0ZVwiIG9uQ2xpY2s9e2UgPT4gZGVsZXRlSXRlbShleGNlcHRpb24sIGUpfSB0aXRsZT1cIkRlbGV0ZVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtJY29uKCd0cmFzaCcpfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvdGQ+XHJcblx0XHRcdFx0XHRcdFx0PC90cj5cclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0fTwvdGJvZHk+XHJcblx0XHRcdFx0PC90YWJsZT5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Zvcm0+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRvblNob3csXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdCRyb290LmdldCgnW25hbWU9ZW5hYmxlZF0nKS5maXJzdCgpXHJcblx0XHRcdC5iaW5kRGF0YSh7IG9iamVjdDogdGFzay5leGNlcHRpb25zIH0pXHJcblx0XHRcdC5vbkNoYW5nZSgoeyBhcmdzLCBiYXNlTm9kZSwgZmllbGQsIGZpZWxkcywgb2JqZWN0LCBrZXksIHZhbHVlLCBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0JHJvb3QuZ2V0KCcudGFibGUnKS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRjb25zdCAkdHIgPSAkcm9vdC5nZXQoJ3Rib2R5IHRyJyk7XHJcblxyXG5cdFx0dGFzay5leGNlcHRpb25zLml0ZW1zLmZvckVhY2goKGV4Y2VwdGlvbiwgaW5kZXgpID0+IHtcclxuXHRcdFx0YmluZEl0ZW0oJHRyLmF0KGluZGV4KSwgZXhjZXB0aW9uKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYWRkSXRlbSgpIHtcclxuXHRcdGNvbnN0ICR0Ym9keSA9ICRyb290LmdldCgndGJvZHknKTtcclxuXHRcdGNvbnN0ICR0ciA9ICR0Ym9keS5nZXQoJ3RyJykuZmlyc3QoKS5jbG9uZSgpO1xyXG5cdFx0Y29uc3QgZXhjZXB0aW9uID0ge1xyXG5cdFx0XHRlbmFibGVkOiB0cnVlLFxyXG5cdFx0XHRwYXRoOiAnJyxcclxuXHRcdFx0Y29udGVudDogJ3Jvb3QnLFxyXG5cdFx0fTtcclxuXHJcblx0XHQkdGJvZHkuaW5zZXJ0KCR0cik7XHJcblx0XHRiaW5kSXRlbSgkdHIsIGV4Y2VwdGlvbik7XHJcblx0XHR0YXNrLmV4Y2VwdGlvbnMuaXRlbXMucHVzaChleGNlcHRpb24pO1xyXG5cdFx0c3RvcmVJdGVtKHRhc2spO1xyXG5cclxuXHRcdC8vIGV2ZW50b3NcclxuXHRcdCR0ci5nZXQoJ1tuYW1lPWJ1dHRvblBhdGhdJykub24oJ2NsaWNrJywgKCkgPT5cclxuXHRcdFx0c2VsZWN0UGF0aChleGNlcHRpb24sICR0ci5hdHRyKCdyb3dJbmRleCcpIC0gMSlcclxuXHRcdCk7XHJcblxyXG5cdFx0JHRyLmdldCgnW25hbWU9YnV0dG9uRGVsZXRlXScpLm9uKCdjbGljaycsICh7IGV2ZW50IH0pID0+XHJcblx0XHRcdGRlbGV0ZUl0ZW0oZXhjZXB0aW9uLCBldmVudClcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBzZWxlY3RQYXRoKGV4Y2VwdGlvbiwgaW5kZXgpIHtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiBwYXRoIH0gPSBhd2FpdCB3ZWJBUEkuZm9sZGVyUGlja2VyKCdTZWxlY3QgZm9sZGVyJyk7XHJcblxyXG5cdFx0aWYgKHBhdGgpIHtcclxuXHRcdFx0bGV0ICRwYXRoID0gJHJvb3QuZ2V0KCdbbmFtZT1wYXRoXScpLmF0KGluZGV4KTtcclxuXHJcblx0XHRcdCRwYXRoLnZhbHVlKHBhdGgpO1xyXG5cdFx0XHRleGNlcHRpb24ucGF0aCA9IHBhdGg7XHJcblx0XHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlbGV0ZUl0ZW0oZXhjZXB0aW9uLCBlKSB7XHJcblx0XHRsZXQgJHRyID0gZG9tKGUudGFyZ2V0LmNsb3Nlc3QoJ3RyJykpO1xyXG5cclxuXHRcdGlmICgkcm9vdC5nZXQoJ3Rib2R5IHRyJykubGVuZ3RoID4gMSkge1xyXG5cdFx0XHR0YXNrLmV4Y2VwdGlvbnMuaXRlbXMgPSB0YXNrLmV4Y2VwdGlvbnMuaXRlbXMuZmlsdGVyKCh4LCBpKSA9PiBpICE9ICR0ci5hdHRyKCdyb3dJbmRleCcpIC0gMSk7XHJcblx0XHRcdCR0ci5yZW1vdmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIG1hbnRlbSBlIGxpbXBhIG8gXHUwMEZBbHRpbW9cclxuXHRcdFx0ZXhjZXB0aW9uLmVuYWJsZWQgPSB0cnVlO1xyXG5cdFx0XHRleGNlcHRpb24ucGF0aCA9ICcnO1xyXG5cdFx0XHRleGNlcHRpb24uY29udGVudCA9ICdyb290JztcclxuXHJcblx0XHRcdCR0ci5nZXQoJ1tuYW1lPWVuYWJsZWRdJykuYXR0cignY2hlY2tlZCcsIGV4Y2VwdGlvbi5lbmFibGVkKTtcclxuXHRcdFx0JHRyLmdldCgnW25hbWU9cGF0aF0nKS52YWx1ZShleGNlcHRpb24ucGF0aCk7XHJcblx0XHRcdCR0ci5nZXQoJ1tuYW1lPWNvbnRlbnRdJykudmFsdWUoZXhjZXB0aW9uLmNvbnRlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHN0b3JlSXRlbSh0YXNrKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJpbmRJdGVtKCR0ciwgb2JqKSB7XHJcblx0XHQkdHIuZ2V0KCdpbnB1dCwgc2VsZWN0LCBidXR0b24nKVxyXG5cdFx0XHQuYmluZERhdGEoeyBvYmplY3Q6IG9iaiB9KVxyXG5cdFx0XHQub25DaGFuZ2UoKHsgYXJncywgYmFzZU5vZGUsIGZpZWxkLCBmaWVsZHMsIG9iamVjdCwga2V5LCB2YWx1ZSwgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ3BhdGgnKSB7XHJcblx0XHRcdFx0XHRvYmoucGF0aCA9IHZhbHVlLnJlcGxhY2UoL1xcXFwrJC8sICcnKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChrZXkgPT0gJ2VuYWJsZWQnKSB7XHJcblx0XHRcdFx0XHQkdHIuZ2V0KCdbbmFtZT1idXR0b25QYXRoXScpLmRpc2FibGUoIXZhbHVlKTtcclxuXHRcdFx0XHRcdCR0ci5nZXQoJ1tuYW1lPWJ1dHRvbkRlbGV0ZV0nKS5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0XHRmaWVsZHMucGF0aC5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0XHRmaWVsZHMuY29udGVudC5kaXNhYmxlKCF2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzdG9yZUl0ZW0odGFzayk7XHJcblx0XHRcdH0pO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlRXhjZXB0aW9ucztcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBzaGFyZWQgZnJvbSAnLi4vc2hhcmVkJztcclxuaW1wb3J0IHJvdXRlciBmcm9tICcuLi9zZXJ2aWNlcy9Sb3V0ZXJTZXJ2aWNlJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uL2xpYi9VdGlscyc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBUb2FzdCBmcm9tICcuLi9saWIvVG9hc3QvVG9hc3QnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5pbXBvcnQgUGFnZUhlYWRlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXInO1xyXG5pbXBvcnQgVGFicyBmcm9tICcuLi9jb21wb25lbnRzL1RhYnMnO1xyXG5pbXBvcnQgVGFza1BhZ2VHZW5lcmFsIGZyb20gJy4vVGFza1BhZ2VHZW5lcmFsJztcclxuaW1wb3J0IFRhc2tQYWdlRmlsZVNldHRpbmdzIGZyb20gJy4vVGFza1BhZ2VGaWxlU2V0dGluZ3MnO1xyXG5pbXBvcnQgVGFza1BhZ2VTY2hlZHVsZSBmcm9tICcuL1Rhc2tQYWdlU2NoZWR1bGUnO1xyXG5pbXBvcnQgVGFza1BhZ2VFeGNlcHRpb25zIGZyb20gJy4vVGFza1BhZ2VFeGNlcHRpb25zJztcclxuXHJcbmNvbnN0IFRhc2tQYWdlID0gYXN5bmMgKCkgPT4ge1xyXG5cdGxldCBfc3RvcmVkVGFzaztcclxuXHRsZXQgX3RhYkluZGV4O1xyXG5cdGxldCBfdGFiVHlwZUluZGV4O1xyXG5cclxuXHRzZXRTdG9yYWdlKCk7XHJcblxyXG5cdGNvbnN0IF9pZCA9IHJvdXRlci5jdXJyZW50LnRhcmdldDtcclxuXHRjb25zdCBfdGFzayA9IGF3YWl0IGdldFRhc2soKTtcclxuXHJcblx0Y29uc3QgaGVhZGVyID0gUGFnZUhlYWRlcih7IG9uQ2xpY2tCYWNrQnV0dG9uOiBiYWNrIH0pO1xyXG5cdGNvbnN0IGdlbmVyYWwgPSBUYXNrUGFnZUdlbmVyYWwoeyB0YXNrOiBfdGFzaywgc3RvcmVJdGVtIH0pO1xyXG5cdGNvbnN0IGZpbGVTZXR0aW5ncyA9IFRhc2tQYWdlRmlsZVNldHRpbmdzKHsgdGFzazogX3Rhc2ssIHRhYkluZGV4OiBfdGFiVHlwZUluZGV4IHx8IDAsIHN0b3JlSXRlbSB9KTtcclxuXHRjb25zdCBzY2hlZHVsZSA9IFRhc2tQYWdlU2NoZWR1bGUoeyB0YXNrOiBfdGFzaywgc3RvcmVJdGVtIH0pO1xyXG5cdGNvbnN0IGV4Y2VwdGlvbnMgPSBUYXNrUGFnZUV4Y2VwdGlvbnMoeyB0YXNrOiBfdGFzaywgc3RvcmVJdGVtIH0pO1xyXG5cdGNvbnN0IHRhYnMgPSBUYWJzKHtcclxuXHRcdG5hbWVzOiBbJ0dlbmVyYWwnLCAnRmlsZSBzZXR0aW5ncycsICdTY2hlZHVsaW5nJywgJ0V4Y2VwdGlvbnMnXSxcclxuXHRcdGNvbnRlbnRzOiBbXHJcblx0XHRcdGdlbmVyYWwuZWxlbWVudCxcclxuXHRcdFx0ZmlsZVNldHRpbmdzLmVsZW1lbnQsXHJcblx0XHRcdHNjaGVkdWxlLmVsZW1lbnQsXHJcblx0XHRcdGV4Y2VwdGlvbnMuZWxlbWVudCxcclxuXHRcdF0sXHJcblx0XHRvbkNoYW5nZTogaW5kZXggPT4ge1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFiSW5kZXgnLCBpbmRleCk7XHJcblxyXG5cdFx0XHRpZiAoaW5kZXggPT0gMSkge1xyXG5cdFx0XHRcdC8vIEZpbHRlciA+IFZhbHVlXHJcblx0XHRcdFx0JHJvb3QuZ2V0KCd0ZXh0YXJlYVtkYXRhLXR5cGU9c3RyaW5nXScpLnJlc2l6ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdH0pO1xyXG5cdGNvbnN0IGFjdGlvbkJhciA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJhY3Rpb24tYmFyXCI+XHJcblx0XHRcdHt0YWJzLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdDxzcGFuIGNsYXNzPVwiZGl2aWRlciBoLTVcIj48L3NwYW4+XHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIGgtMTAgcHgtMyB2aWV3ZmlsZXNcIiBvbkNsaWNrPXt2aWV3RmlsZXN9PlxyXG5cdFx0XHRcdHtJY29uKCdzZWFyY2gnKX08c3Bhbj5WaWV3IGZpbGVzPC9zcGFuPlxyXG5cdFx0XHQ8L2J1dHRvbj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJUYXNrUGFnZVwiPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFiLWNvbnRlbnRzXCI+XHJcblx0XHRcdFx0e2dlbmVyYWwuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0XHR7ZmlsZVNldHRpbmdzLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0e3NjaGVkdWxlLmVsZW1lbnQubm9kZXNbMF19XHJcblx0XHRcdFx0e2V4Y2VwdGlvbnMuZWxlbWVudC5ub2Rlc1swXX1cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4IGdhcC01IHB5LTcgYnRcIj5cclxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuYW1lPVwic2F2ZVwiIGNsYXNzPVwiYnV0dG9uIHByaW1hcnkgaC0xMCB3LVs5MHB4XSBweC0zXCIgb25DbGljaz17c2F2ZX0+XHJcblx0XHRcdFx0XHQ8c3Bhbj5TYXZlPC9zcGFuPlxyXG5cdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5hbWU9XCJjYW5jZWxcIiBjbGFzcz1cImJ1dHRvbiBib3JkZXIgaC0xMCB3LVs5MHB4XSBweC0zXCIgb25DbGljaz17YmFja30+XHJcblx0XHRcdFx0XHQ8c3Bhbj5DYW5jZWw8L3NwYW4+XHJcblx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblx0KTtcclxuXHRjb25zdCAkcm9vdCA9IGRvbShyb290KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0aGVhZGVyOiBoZWFkZXIuZWxlbWVudCxcclxuXHRcdFx0YWN0aW9uQmFyOiBhY3Rpb25CYXIsXHJcblx0XHRcdGNvbnRlbnQ6IHJvb3QsXHJcblx0XHR9LFxyXG5cdFx0b25TaG93LFxyXG5cdFx0b25IaWRlLFxyXG5cdH07XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHJcblx0Ly8gRlVOXHUwMEM3XHUwMEQ1RVNcclxuXHJcblx0ZnVuY3Rpb24gc2V0U3RvcmFnZSgpIHtcclxuXHRcdF9zdG9yZWRUYXNrID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rhc2snKTtcclxuXHRcdF90YWJJbmRleCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWJJbmRleCcpO1xyXG5cdFx0X3RhYlR5cGVJbmRleCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWJUeXBlSW5kZXgnKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGdldFRhc2soKSB7XHJcblx0XHRyZXR1cm4gX2lkID09ICduZXcnID9cclxuXHRcdFx0KGF3YWl0IHdlYkFQSS5uZXdUYXNrKCkpLnJlc3VsdCA6XHJcblx0XHRcdEpTT04ucGFyc2UoX3N0b3JlZFRhc2sgfHwgbnVsbCkgfHxcclxuXHRcdFx0KGF3YWl0IHdlYkFQSS5nZXRUYXNrQnlJZChfaWQpKS5yZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFzaycsIEpTT04uc3RyaW5naWZ5KF90YXNrKSk7XHJcblx0XHRoZWFkZXIuc2V0UGFnZU1hcChbXHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIGgtMTAgcHgtM1wiIG9uQ2xpY2s9e2JhY2t9PlRhc2tzPC9idXR0b24+LFxyXG5cdFx0XHQ8c3BhbiB0aXRsZT17X3Rhc2submFtZX0+e3V0aWxzLnRydW5jYXRlVGV4dChfdGFzay5uYW1lLCA2MCkgfHwgJ05ldyB0YXNrJ308L3NwYW4+XHJcblx0XHRdKTtcclxuXHRcdHRhYnMuc2VsZWN0VGFiKF90YWJJbmRleCB8fCAwKTtcclxuXHRcdGdlbmVyYWwub25TaG93KCk7XHJcblx0XHRmaWxlU2V0dGluZ3Mub25TaG93KCk7XHJcblx0XHRzY2hlZHVsZS5vblNob3coKTtcclxuXHRcdGV4Y2VwdGlvbnMub25TaG93KCk7XHJcblx0XHQkcm9vdC5nZXQoJ3RleHRhcmVhJykucmVzaXplKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkhpZGUoKSB7XHJcblx0XHQvLyBsaW1wYSBvIGNhY2hlXHJcblx0XHRpZiAocm91dGVyLmN1cnJlbnQudGFyZ2V0Lm1hdGNoKC90YXNrc3xoaXN0b3J5L2kpKSB7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrJywgJycpO1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFiSW5kZXgnLCAwKTtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RhYlR5cGVJbmRleCcsIDApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHNoYXJlZC50ZW1wID0gbnVsbDsgLy8gVGFza1BhZ2VGaWxlU2V0dGluZ3NGaWx0ZXIgPiBjb3B5SXRlbXNcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHN0b3JlSXRlbSh0YXNrKSB7XHJcblx0XHQvLyBQZXJzaXN0ZSBvIGl0ZW0gbm8gY2FjaGUgZG8gbmF2ZWdhZG9yIHBhcmEgZXZlbnR1YWwgYXR1YWxpemFcdTAwRTdcdTAwRTNvIGRlIHBcdTAwRTFnaW5hLlxyXG5cclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrJywgSlNPTi5zdHJpbmdpZnkodGFzaykpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gdmlld0ZpbGVzKCkge1xyXG5cdFx0bGV0IGlzQXZhaWxhYmxlID0gYXdhaXQgd2ViQVBJLnBhdGhJc0F2YWlsYWJsZShfdGFzay5wYXRoKTtcclxuXHJcblx0XHRpZiAoaXNBdmFpbGFibGUpXHJcblx0XHRcdGxvY2F0aW9uLmhhc2ggPSBgdGFzay8ke190YXNrLmlkfS9maWxlc2A7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBpc1Rhc2tSdW5uaW5nKCkge1xyXG5cdFx0aWYgKCFfaWQgfHwgX2lkID09ICduZXcnKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0bGV0IHsgcmVzdWx0OiBpc1J1bm5pbmcgfSA9IGF3YWl0IHdlYkFQSS5pc1Rhc2tSdW5uaW5nKF90YXNrLmlkKTtcclxuXHJcblx0XHRpZiAoaXNSdW5uaW5nKVxyXG5cdFx0XHR0b2FzdEluZm8oJ1Rhc2sgaW4gcHJvZ3Jlc3MuJyk7XHJcblxyXG5cdFx0cmV0dXJuIGlzUnVubmluZztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHNhdmUoKSB7XHJcblx0XHRpZiAoYXdhaXQgaXNUYXNrUnVubmluZygpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKHZhbGlkYXRlKCkpIHtcclxuXHRcdFx0aWYgKCFfaWQgfHwgX2lkID09ICduZXcnKVxyXG5cdFx0XHRcdGF3YWl0IHdlYkFQSS5pbnNlcnRUYXNrKF90YXNrKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGF3YWl0IHdlYkFQSS51cGRhdGVUYXNrKF90YXNrKTtcclxuXHJcblx0XHRcdGJhY2soKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJhY2soKSB7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ3Rhc2tzJztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZhbGlkYXRlKCkge1xyXG5cdFx0bGV0IGlzVmFsaWQgPSB0cnVlO1xyXG5cclxuXHRcdC8vIEdlbmVyYWxcclxuXHRcdGNvbnN0ICRmb3JtR2VuZXJhbCA9ICRyb290LmdldCgnZm9ybScpLmF0KDApO1xyXG5cdFx0bGV0ICRpbnZhbGlkRmllbGQ7XHJcblxyXG5cdFx0Wy4uLiRmb3JtR2VuZXJhbC5hdHRyKCdlbGVtZW50cycpXS5mb3JFYWNoKGZpZWxkID0+IHtcclxuXHRcdFx0aWYgKCFmaWVsZC5jaGVja1ZhbGlkaXR5KCkgJiYgaXNWYWxpZCkge1xyXG5cdFx0XHRcdCRpbnZhbGlkRmllbGQgPSBmaWVsZDtcclxuXHRcdFx0XHRmaWVsZC5mb2N1cygpO1xyXG5cdFx0XHRcdGlzVmFsaWQgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKCFpc1ZhbGlkKSB7XHJcblx0XHRcdFRvYXN0KHtcclxuXHRcdFx0XHRpY29uOiBJY29uKCdpbmZvJyksXHJcblx0XHRcdFx0bWVzc2FnZTogJ0ZpbGwgaW4gdGhlIHJlcXVpcmVkIGZpZWxkcy4nLFxyXG5cdFx0XHRcdHBvc2l0aW9uOiAnYm90dG9tIGNlbnRlcicsXHJcblx0XHRcdFx0dGltZTogNFxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRhYnMuc2VsZWN0VGFiKDApO1xyXG5cdFx0XHQkaW52YWxpZEZpZWxkLmZvY3VzKCk7XHJcblx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBpc1ZhbGlkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9hc3RJbmZvKG1lc3NhZ2UpIHtcclxuXHRcdGlmICghbWVzc2FnZSkgcmV0dXJuO1xyXG5cclxuXHRcdFRvYXN0KHtcclxuXHRcdFx0aWNvbjogSWNvbignaW5mbycpLFxyXG5cdFx0XHRtZXNzYWdlOiBtZXNzYWdlLFxyXG5cdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSBjZW50ZXInLFxyXG5cdFx0XHR0aW1lOiA0XHJcblx0XHR9KTtcclxuXHJcblx0XHRsdWNpZGUuY3JlYXRlSWNvbnMoKTtcclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZTtcclxuIiwgImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vSWNvbic7XHJcblxyXG5jb25zdCBQYWdlciA9ICh7IHBhZ2VJbmRleCA9IDAsIGxpbWl0ID0gMCwgdG90YWwgPSAwLCBvblByZXYsIG9uTmV4dCB9KSA9PiB7XHJcblx0Y29uc3Qgcm9vdCA9IChcclxuXHRcdDxkaXYgY2xhc3M9XCJQYWdlclwiPlxyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ1dHRvbiB3LTEwIGgtMTBcIiBvbkNsaWNrPXtwcmV2fT5cclxuXHRcdFx0XHR7SWNvbignbGVmdCcpfVxyXG5cdFx0XHQ8L2J1dHRvbj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInBhZ2UtdG90YWxcIj5cclxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInBhZ2VcIj57bGltaXR9PC9zcGFuPlxyXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwic2VwYXJhdG9yXCI+Lzwvc3Bhbj5cclxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInRvdGFsXCI+e3RvdGFsfTwvc3Bhbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIHctMTAgaC0xMFwiIG9uQ2xpY2s9e25leHR9PlxyXG5cdFx0XHRcdHtJY29uKCdyaWdodCcpfVxyXG5cdFx0XHQ8L2J1dHRvbj5cclxuXHRcdDwvZGl2PlxyXG5cdCk7XHJcblx0Y29uc3QgJHJvb3QgPSBkb20ocm9vdCkuaGlkZSgpO1xyXG5cdGNvbnN0ICRwYWdlID0gJHJvb3QuZ2V0KCcucGFnZScpO1xyXG5cdGNvbnN0ICR0b3RhbCA9ICRyb290LmdldCgnLnRvdGFsJyk7XHJcblx0Y29uc3QgJGJ1dHRvblByZXYgPSAkcm9vdC5nZXQoJy5idXR0b24gdy0xMCBoLTEwJykuYXQoMCkuZGlzYWJsZSgpO1xyXG5cdGNvbnN0ICRidXR0b25OZXh0ID0gJHJvb3QuZ2V0KCcuYnV0dG9uIHctMTAgaC0xMCcpLmF0KDEpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0ZWxlbWVudDogJHJvb3QsXHJcblx0XHRsaW1pdCxcclxuXHRcdHNldFBhZ2UsXHJcblx0XHRzZXRUb3RhbCxcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBzZXRQYWdlKF9wYWdlSW5kZXgsIGl0ZW1zTGVuZ3RoKSB7XHJcblx0XHRwYWdlSW5kZXggPSBfcGFnZUluZGV4O1xyXG5cdFx0aXRlbXNMZW5ndGggKz0gX3BhZ2VJbmRleDtcclxuXHJcblx0XHQkYnV0dG9uUHJldi5kaXNhYmxlKHBhZ2VJbmRleCA8PSAwKTtcclxuXHJcblx0XHRpZiAocGFnZUluZGV4ID4gMCAmJiBpdGVtc0xlbmd0aCA+PSB0b3RhbCkge1xyXG5cdFx0XHQkYnV0dG9uTmV4dC5kaXNhYmxlKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkYnV0dG9uTmV4dC5kaXNhYmxlKGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQkcGFnZS50ZXh0KGl0ZW1zTGVuZ3RoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFRvdGFsKF90b3RhbCkge1xyXG5cdFx0dG90YWwgPSBfdG90YWw7XHJcblxyXG5cdFx0aWYgKCRwYWdlLnRleHQoKSA+IHRvdGFsKVxyXG5cdFx0XHQkcGFnZS50ZXh0KHRvdGFsKTtcclxuXHJcblx0XHQkdG90YWwudGV4dCh0b3RhbCk7XHJcblx0XHQkcm9vdC5zaG93KHRvdGFsID4gbGltaXQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcHJldigpIHtcclxuXHRcdHBhZ2VJbmRleCAtPSBsaW1pdDtcclxuXHJcblx0XHRpZiAob25QcmV2KVxyXG5cdFx0XHRvblByZXYocGFnZUluZGV4KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG5leHQoKSB7XHJcblx0XHRwYWdlSW5kZXggKz0gbGltaXQ7XHJcblxyXG5cdFx0aWYgKG9uTmV4dClcclxuXHRcdFx0b25OZXh0KHBhZ2VJbmRleCk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZXI7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCByb3V0ZXIgZnJvbSAnLi4vc2VydmljZXMvUm91dGVyU2VydmljZSc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9saWIvVXRpbHMnO1xyXG5pbXBvcnQgUGFnZUhlYWRlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXInO1xyXG5pbXBvcnQgQWN0aW9uQmFyIGZyb20gJy4uL2NvbXBvbmVudHMvQWN0aW9uQmFyJztcclxuaW1wb3J0IFBhZ2VyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZXInO1xyXG5pbXBvcnQgRGF0YVRhYmxlIGZyb20gJy4uL2xpYi9EYXRhVGFibGUvc3JjL2luZGV4JztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBUYXNrRmlsZXNQYWdlID0gKCkgPT4ge1xyXG5cdGNvbnN0IGhlYWRlciA9IFBhZ2VIZWFkZXIoeyBvbkNsaWNrQmFja0J1dHRvbjogYmFjayB9KTtcclxuXHRjb25zdCBhY3Rpb25CYXIgPSBBY3Rpb25CYXIoe1xyXG5cdFx0YnV0dG9uczogW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ3JlZnJlc2gnLFxyXG5cdFx0XHRcdHRvb2x0aXA6ICdSZWZyZXNoJyxcclxuXHRcdFx0XHRpY29uOiBJY29uKCdyZWZyZXNoJyksXHJcblx0XHRcdFx0c3R5bGU6ICdtYXJnaW4tbGVmdDogMC44ZW07JyxcclxuXHRcdFx0XHRvbkNsaWNrOiByZWZyZXNoXHJcblx0XHRcdH0sXHJcblx0XHRdXHJcblx0fSk7XHJcblx0Y29uc3QgcGFnZXIgPSBQYWdlcih7XHJcblx0XHRsaW1pdDogMTAwLFxyXG5cdFx0b25QcmV2OiBwYWdlSW5kZXggPT4gc2VhcmNoKHBhZ2VJbmRleCksXHJcblx0XHRvbk5leHQ6IHBhZ2VJbmRleCA9PiBzZWFyY2gocGFnZUluZGV4KSxcclxuXHR9KTtcclxuXHRjb25zdCBjaGVja2JveEVuYWJsZUV4Y2VwdGlvbnMgPSAoXHJcblx0XHQ8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxyXG5cdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImVuYWJsZUV4Y2VwdGlvbnNcIiBvbkNsaWNrPXtyZWZyZXNofSAvPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiPlxyXG5cdFx0XHRcdDxiPkVuYWJsZSBleGNlcHRpb25zPC9iPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvbGFiZWw+XHJcblx0KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0aGVhZGVyOiBoZWFkZXIuZWxlbWVudCxcclxuXHRcdFx0YWN0aW9uQmFyOiBbXHJcblx0XHRcdFx0Y2hlY2tib3hFbmFibGVFeGNlcHRpb25zLFxyXG5cdFx0XHRcdGFjdGlvbkJhci5lbGVtZW50LFxyXG5cdFx0XHRcdHBhZ2VyLmVsZW1lbnQsXHJcblx0XHRcdF0sXHJcblx0XHRcdGNvbnRlbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0b25TaG93LFxyXG5cdFx0b25IaWRlLFxyXG5cdH07XHJcblx0bGV0IF90YXNrO1xyXG5cdGxldCBfc2VsZWN0ZWRSb3c7XHJcblx0bGV0IF9kYXRhVGFibGU7XHJcblx0bGV0IF9maWxlc0NvbnRleHRNZW51O1xyXG5cclxuXHRzZXREYXRhVGFibGUoKTtcclxuXHJcblx0cmV0dXJuIGNvbnRleHQ7XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdGNvbnN0IHRhc2tJZCA9IHJvdXRlci5jdXJyZW50Lmhhc2hQYXJ0c1sxXTtcclxuXHRcdF90YXNrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFzaycpIHx8IG51bGwpIHx8IChhd2FpdCB3ZWJBUEkuZ2V0VGFza0J5SWQodGFza0lkKSkucmVzdWx0O1xyXG5cclxuXHRcdGlmICghX3Rhc2spIHJldHVybjtcclxuXHJcblx0XHQvLyBUYXNrcyA+IFRhc2sgPiBGaWxlc1xyXG5cdFx0aGVhZGVyLnNldFBhZ2VNYXAoW1xyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBsb2NhdGlvbi5oYXNoID0gJ3Rhc2tzJ30+VGFza3M8L2J1dHRvbj4sIC8vIHZvbHRhIHBhcmEgcFx1MDBFMWdpbmEgdGFza3MgZSBzZWxlY2lvbmEgbyBpdGVtIG5hIGxpc3RhXHJcblx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IGxvY2F0aW9uLmhhc2ggPSAndGFzay8nICsgX3Rhc2suaWR9IHRpdGxlPXtfdGFzay5uYW1lfT5cclxuXHRcdFx0XHR7dXRpbHMudHJ1bmNhdGVUZXh0KF90YXNrLm5hbWUsIDYwKSB8fCAnTmV3IHRhc2snfVxyXG5cdFx0XHQ8L2J1dHRvbj4sIC8vIHZvbHRhIHBhcmEgcFx1MDBFMWdpbmEgdGFzayBlIHNlbGVjaW9uYSBhcyBcdTAwRkFsdGltYXMgdGFic1xyXG5cdFx0XHQ8c3Bhbj5GaWxlczwvc3Bhbj5cclxuXHRcdF0pO1xyXG5cclxuXHRcdF9maWxlc0NvbnRleHRNZW51ID0gTWVudSh7XHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnUmVmcmVzaCcsIGljb246IEljb24oJ3JlZnJlc2gnKSwgb25DbGljazogc2VhcmNoIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnT3BlbiBmaWxlJywgaWNvbjogSWNvbignb3BlbicpLCBvbkNsaWNrOiBvcGVuRmlsZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgaW4gZmlsZSBleHBsb3JlcicsIGljb246IEljb24oJ2ZvbGRlclNlYXJjaCcpLCBvbkNsaWNrOiB2aWV3SW5GaWxlRXhwbG9yZXIgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBvbkNsaWNrOiBjb3B5Q2xpcEl0ZW1zIH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0c2VhcmNoKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkhpZGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlLmRlc3Ryb3koKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldERhdGFUYWJsZSgpIHtcclxuXHRcdF9kYXRhVGFibGUgPSBEYXRhVGFibGUoe1xyXG5cdFx0XHRpZDogJ3Rhc2tmaWxlcycsXHJcblx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRzb3J0OiB0cnVlLFxyXG5cdFx0XHRyZXNpemU6IHRydWUsXHJcblx0XHRcdGNvbHVtbnM6IHtcclxuXHRcdFx0XHRwYXRoOiB7IGRpc3BsYXlOYW1lOiAnUGF0aCcsIHdpZHRoOiAzMDAgfSxcclxuXHRcdFx0XHR0eXBlOiB7IGRpc3BsYXlOYW1lOiAnVHlwZScsIHdpZHRoOiA5MCB9LFxyXG5cdFx0XHRcdHdpZHRoOiB7IGRpc3BsYXlOYW1lOiAnV2lkdGggKHB4KScsIHdpZHRoOiAxMTAgfSxcclxuXHRcdFx0XHRoZWlnaHQ6IHsgZGlzcGxheU5hbWU6ICdIZWlnaHQgKHB4KScsIHdpZHRoOiAxMTAgfSxcclxuXHRcdFx0XHR3aWR0aEhlaWdodFJhdGlvOiB7IGRpc3BsYXlOYW1lOiAnVy9IIFJhdGlvJywgd2lkdGg6IDEwMCB9LFxyXG5cdFx0XHRcdHNpemU6IHsgZGlzcGxheU5hbWU6ICdTaXplIChNQiknLCB3aWR0aDogMTAwIH0sXHJcblx0XHRcdFx0Y3JlYXRlZDogeyBkaXNwbGF5TmFtZTogJ0NyZWF0ZWQnLCB3aWR0aDogMTMwIH0sXHJcblx0XHRcdFx0bW9kaWZpZWQ6IHsgZGlzcGxheU5hbWU6ICdNb2RpZmllZCcgfSxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm93czoge1xyXG5cdFx0XHRcdHNlbGVjdE9uQ2xpY2s6IHRydWUsXHJcblx0XHRcdFx0YWxsb3dNdWx0aXBsZVNlbGVjdGlvbjogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2VsbHM6IHtcclxuXHRcdFx0XHRwYXRoOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OlwiIG9uQ2xpY2s9e29wZW5GaWxlfSBjbGFzcz1cImxpbmtcIiBzdHlsZT1cIm92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1wiPnt2YWx1ZX08L2E+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0eXBlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB2YWx1ZS50b1VwcGVyQ2FzZSgpLnN1YnN0cmluZygxKVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2l6ZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKHZhbHVlIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoNCkgLy8gTUJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNyZWF0ZWQ6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IChcclxuXHRcdFx0XHRcdFx0PHNwYW4+e1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLXVzJywge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGltZVN0eWxlOiAnc2hvcnQnLFxyXG5cdFx0XHRcdFx0XHRcdH0pLmZvcm1hdChuZXcgRGF0ZSh2YWx1ZSkpIDogJydcclxuXHRcdFx0XHRcdFx0fTwvc3Bhbj5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG1vZGlmaWVkOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAoXHJcblx0XHRcdFx0XHRcdDxzcGFuPntcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi11cycsIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHRcdHRpbWVTdHlsZTogJ3Nob3J0JyxcclxuXHRcdFx0XHRcdFx0XHR9KS5mb3JtYXQobmV3IERhdGUodmFsdWUpKSA6ICcnXHJcblx0XHRcdFx0XHRcdH08L3NwYW4+XHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdFx0b25BZGRSb3c6ICh7IHJvdyB9KSA9PiB7XHJcblx0XHRcdFx0ZG9tKHJvdy5lbGVtZW50KS5vbignY29udGV4dG1lbnUnLCAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoIXJvdy5pc1NlbGVjdGVkKVxyXG5cdFx0XHRcdFx0XHRyb3cuc2VsZWN0KCk7XHJcblxyXG5cdFx0XHRcdFx0X2ZpbGVzQ29udGV4dE1lbnUuc2hvdyhldmVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uRG91YmxlQ2xpY2tSb3c6ICh7IHJvdywgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdG9wZW5GaWxlKGV2ZW50KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25TZWxlY3RSb3dzOiAoeyByb3dzIH0pID0+IHtcclxuXHRcdFx0XHRfc2VsZWN0ZWRSb3cgPSByb3dzWzBdO1xyXG5cdFx0XHRcdHNob3dBY3Rpb25CYXJCdXR0b25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uVW5zZWxlY3RSb3dzOiAoKSA9PiB7XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNvcHlDbGlwOiAoeyB0ZXh0IH0pID0+IHtcclxuXHRcdFx0XHRjb3B5Q2xpcEl0ZW1zKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ2xpY2tPdXQ6ICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRldmVudC5jYW5jZWxVbnNlbGVjdFJvd3MgPSAhIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuYWN0aW9uYmFyJyk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRjb250ZXh0LmVsZW1lbnRzLmNvbnRlbnQgPSBfZGF0YVRhYmxlLmVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBzZWFyY2gocGFnZUluZGV4ID0gMCkge1xyXG5cdFx0ZG9tKCcuaWNvbi5yZWZyZXNoJykuYWRkQ2xhc3MoJ3NwaW4nKTtcclxuXHRcdF9kYXRhVGFibGUuY2xlYXIoKTtcclxuXHRcdHNldEZvb3RlcigpO1xyXG5cclxuXHRcdGxldCBlbmFibGVFeGNlcHRpb25zID0gZG9tKGNoZWNrYm94RW5hYmxlRXhjZXB0aW9ucykuZ2V0KCdpbnB1dCcpLmF0dHIoJ2NoZWNrZWQnKTtcclxuXHRcdGNvbnN0IHsgcmVzdWx0IH0gPSBhd2FpdCB3ZWJBUEkuc2VhcmNoVGFza0ZpbGVzUGFnZWQoX3Rhc2ssIGVuYWJsZUV4Y2VwdGlvbnMsIHBhZ2VJbmRleCwgcGFnZXIubGltaXQpO1xyXG5cclxuXHRcdGlmIChyZXN1bHQuaXRlbXMpIHtcclxuXHRcdFx0cGFnZXIuc2V0UGFnZShwYWdlSW5kZXgsIHJlc3VsdC5pdGVtcy5sZW5ndGgpO1xyXG5cdFx0XHRwYWdlci5zZXRUb3RhbChyZXN1bHQudG90YWwpO1xyXG5cdFx0XHRzZXRGb290ZXIocmVzdWx0LnRvdGFsKTtcclxuXHRcdFx0X2RhdGFUYWJsZS5sb2FkKHJlc3VsdC5pdGVtcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZG9tKCcuaWNvbi5yZWZyZXNoJykucmVtb3ZlQ2xhc3MoJ3NwaW4nKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2goKSB7XHJcblx0XHRzZWFyY2goKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9wZW5GaWxlKGV2ZW50KSB7XHJcblx0XHRpZiAoZXZlbnQucG9pbnRlcklkICYmIGV2ZW50LnBvaW50ZXJJZCAhPSAxKSByZXR1cm47IC8vIHNvbWVudGUgYm90XHUwMEUzbyBwcmluY2lwYWwgZG8gbW91c2VcclxuXHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLm9wZW5GaWxlKF9zZWxlY3RlZFJvdy5kYXRhKCkucGF0aCksIDIwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB2aWV3SW5GaWxlRXhwbG9yZXIoKSB7XHJcblx0XHQvLyBzZXRUaW1lb3V0IG5lY2Vzc1x1MDBFMXJpbyBwYXJhIHF1ZSBzZWxlY3RlZFJvdyBzZWphIGF0dWFsaXphZG9cclxuXHRcdHNldFRpbWVvdXQoKCkgPT4gd2ViQVBJLnZpZXdJbkZpbGVFeHBsb3Jlcihfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29weUNsaXBJdGVtcygpIHtcclxuXHRcdHdlYkFQSS5jb3B5Q2xpcChfZGF0YVRhYmxlLmV4cG9ydCgpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZvb3Rlcih0b3RhbCkge1xyXG5cdFx0c2hhcmVkLmZvb3Rlci5pbmZvKGAke3RvdGFsIHx8ICdObyd9IGZpbGVzIGZvdW5kYCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiYWNrKCkge1xyXG5cdFx0aGlzdG9yeS5iYWNrKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaG93QWN0aW9uQmFyQnV0dG9ucyhzaG93ID0gdHJ1ZSkge1xyXG5cdFx0Ly8uLlxyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRhc2tGaWxlc1BhZ2U7XHJcbiIsICJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi4vc2VydmljZXMvanN4L2ZhY3RvcnknO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uL3NoYXJlZCc7XHJcbmltcG9ydCB3ZWJBUEkgZnJvbSAnLi4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBQYWdlSGVhZGVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGFnZUhlYWRlcic7XHJcbmltcG9ydCBBY3Rpb25CYXIgZnJvbSAnLi4vY29tcG9uZW50cy9BY3Rpb25CYXInO1xyXG5pbXBvcnQgUGFnZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlcic7XHJcbmltcG9ydCBEYXRhVGFibGUgZnJvbSAnLi4vbGliL0RhdGFUYWJsZS9zcmMvaW5kZXgnO1xyXG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vbGliL01vZGFsL01vZGFsJztcclxuaW1wb3J0IE1lbnUgZnJvbSAnLi4vbGliL01lbnUvTWVudSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4uL2NvbXBvbmVudHMvSWNvbic7XHJcblxyXG5jb25zdCBIaXN0b3J5UGFnZSA9ICgpID0+IHtcclxuXHRjb25zdCBoZWFkZXIgPSBQYWdlSGVhZGVyKHtcclxuXHRcdHBhZ2VNYXA6IFsnSGlzdG9yeSddLFxyXG5cdFx0ZGVzY3JpcHRpb246ICdNb25pdG9yIHRhc2sgZXhlY3V0aW9uIGhpc3RvcnkgYW5kIGJyb3dzZSBvcHRpbWl6ZWQgZmlsZXMuJ1xyXG5cdH0pO1xyXG5cdGNvbnN0IGFjdGlvbkJhciA9IEFjdGlvbkJhcih7XHJcblx0XHRidXR0b25zOiBbXHJcblx0XHRcdHsgbmFtZTogJ2hpc3RvcnlNZW51JywgdG9vbHRpcDogJycsIGljb246IEljb24oJ2VsbGlwc2lzVmVydGljYWwnKSB9LFxyXG5cdFx0XHR7IHRvb2x0aXA6ICdSZWZyZXNoJywgaWNvbjogSWNvbigncmVmcmVzaCcpLCBvbkNsaWNrOiByZWZyZXNoIH0sXHJcblx0XHRcdHsgbmFtZTogJ3ZpZXdGaWxlcycsIHRvb2x0aXA6ICdWaWV3IGZpbGVzJywgaWNvbjogSWNvbignc2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdGaWxlcyB9LFxyXG5cdFx0XVxyXG5cdH0pO1xyXG5cdGNvbnN0IHBhZ2VyID0gUGFnZXIoe1xyXG5cdFx0bGltaXQ6IDEwMCxcclxuXHRcdG9uUHJldjogcGFnZUluZGV4ID0+IGxvYWQocGFnZUluZGV4KSxcclxuXHRcdG9uTmV4dDogcGFnZUluZGV4ID0+IGxvYWQocGFnZUluZGV4KSxcclxuXHR9KTtcclxuXHRjb25zdCBjb250ZXh0ID0ge1xyXG5cdFx0ZWxlbWVudHM6IHtcclxuXHRcdFx0aGVhZGVyOiBoZWFkZXIuZWxlbWVudCxcclxuXHRcdFx0YWN0aW9uQmFyOiBbXHJcblx0XHRcdFx0YWN0aW9uQmFyLmVsZW1lbnQsXHJcblx0XHRcdFx0cGFnZXIuZWxlbWVudCxcclxuXHRcdFx0XSxcclxuXHRcdFx0Y29udGVudDogbnVsbCxcclxuXHRcdH0sXHJcblx0XHRkYXRhVGFibGU6IG51bGwsXHJcblx0XHRvblNob3csXHJcblx0XHRvbkhpZGUsXHJcblx0fTtcclxuXHRsZXQgX2RhdGFUYWJsZTtcclxuXHRsZXQgX3NlbGVjdGVkUm93O1xyXG5cdGxldCBfaGlzdG9yeUNvbnRleHRNZW51O1xyXG5cclxuXHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0c2V0RGF0YVRhYmxlKCk7XHJcblxyXG5cdHJldHVybiBjb250ZXh0O1xyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBvblNob3coKSB7XHJcblx0XHRhd2FpdCBsb2FkKCk7XHJcblxyXG5cdFx0Y29uc3QgaWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nKTtcclxuXHJcblx0XHRpZiAoaWQpIHtcclxuXHRcdFx0Y29uc3Qgcm93ID0gX2RhdGFUYWJsZS5yb3dzQnlGaWVsZFZhbHVlKCdoaXN0b3J5RmlsZU5hbWUnLCBpZClbMF07XHJcblxyXG5cdFx0XHQvLyBzZWxlY2lvbmEgbyBpdGVtXHJcblx0XHRcdGlmIChyb3cpIHtcclxuXHRcdFx0XHRyb3cuc2VsZWN0KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdE9wZW5lZEl0ZW0nLCAnJyk7XHJcblxyXG5cdFx0Ly8gTWVudXNcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1oaXN0b3J5TWVudV0nKSxcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdFeHBvcnQgaGlzdG9yeScsIGljb246IEljb24oJ3NoZWV0JyksIG9uQ2xpY2s6IGV4cG9ydEhpc3RvcnkgfSxcclxuXHRcdFx0XSxcclxuXHRcdFx0b25TaG93OiAoKSA9PiB7XHJcblx0XHRcdFx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHRfaGlzdG9yeUNvbnRleHRNZW51ID0gTWVudSh7XHJcblx0XHRcdGl0ZW1zOiBbXHJcblx0XHRcdFx0eyBuYW1lOiAnUmVmcmVzaCcsIGljb246IEljb24oJ3JlZnJlc2gnKSwgb25DbGljazogcmVmcmVzaCB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgZmlsZXMnLCBpY29uOiBJY29uKCdzZWFyY2gnKSwgb25DbGljazogdmlld0ZpbGVzIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnVmlldyBpbiBmaWxlIGV4cGxvcmVyJywgaWNvbjogSWNvbignZm9sZGVyU2VhcmNoJyksIG9uQ2xpY2s6IHZpZXdJbkZpbGVFeHBsb3JlciB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ0NvcHknLCBpY29uOiBJY29uKCdjb3B5JyksIG9uQ2xpY2s6IGNvcHlDbGlwSXRlbXMgfSxcclxuXHRcdFx0XHR7IGRpdmlkZXI6IHRydWUgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdEZWxldGUnLCBpY29uOiBJY29uKCd0cmFzaCcpLCBvbkNsaWNrOiBkZWxldGVJdGVtIH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkhpZGUoKSB7XHJcblx0XHRfZGF0YVRhYmxlLmRlc3Ryb3koKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldERhdGFUYWJsZSgpIHtcclxuXHRcdF9kYXRhVGFibGUgPSBEYXRhVGFibGUoe1xyXG5cdFx0XHRpZDogJ2hpc3RvcnknLFxyXG5cdFx0XHRoZWlnaHQ6ICcxMDAlJyxcclxuXHRcdFx0c29ydDogdHJ1ZSxcclxuXHRcdFx0cmVzaXplOiB0cnVlLFxyXG5cdFx0XHRjb2x1bW5zOiB7XHJcblx0XHRcdFx0aWQ6IHsgZGlzcGxheU5hbWU6ICdJZCcsIGhpZGRlbjogdHJ1ZSB9LFxyXG5cdFx0XHRcdHRhc2tJZDogeyBkaXNwbGF5TmFtZTogJ1Rhc2sgSWQnLCBoaWRkZW46IHRydWUgfSxcclxuXHRcdFx0XHRoaXN0b3J5RmlsZU5hbWU6IHsgZGlzcGxheU5hbWU6ICdIaXN0b3J5RmlsZU5hbWUnLCBoaWRkZW46IHRydWUgfSxcclxuXHRcdFx0XHRkYXRlVGltZTogeyBkaXNwbGF5TmFtZTogJ0RhdGUvVGltZScsIHdpZHRoOiAxMzAgfSxcclxuXHRcdFx0XHRuYW1lOiB7IGRpc3BsYXlOYW1lOiAnVGFzaycsIHdpZHRoOiAxNzAgfSxcclxuXHRcdFx0XHRhY3Rpb246IHsgZGlzcGxheU5hbWU6ICdBY3Rpb24nLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7IGRpc3BsYXlOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDkwIH0sXHJcblx0XHRcdFx0ZGVzY3JpcHRpb246IHsgZGlzcGxheU5hbWU6ICdEZXNjcmlwdGlvbicsIHdpZHRoOiAzMDAgfSxcclxuXHRcdFx0XHRwYXRoOiB7IGRpc3BsYXlOYW1lOiAnUGF0aCcgfSxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm93czoge1xyXG5cdFx0XHRcdHNlbGVjdE9uQ2xpY2s6IHRydWUsXHJcblx0XHRcdFx0YWxsb3dNdWx0aXBsZVNlbGVjdGlvbjogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2VsbHM6IHtcclxuXHRcdFx0XHRkYXRlVGltZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZSA/IDxkaXYgY2xhc3M9XCJjaGlwc1wiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGlwXCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0c2hhcmVkLmNvbnN0YW50cy5zdGF0dXMuZmluZCh4ID0+IHgubmFtZSA9PSB2YWx1ZSk/LmRpc3BsYXlOYW1lXHJcblx0XHRcdFx0XHRcdFx0fTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj4gOiAnJztcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDhweCAhaW1wb3J0YW50JyB9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cGF0aDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBvbkNsaWNrPXt2aWV3SW5GaWxlRXhwbG9yZXJ9IGNsYXNzPVwibGlua1wiIHN0eWxlPVwib3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XCI+e3ZhbHVlfTwvYT5cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkFkZFJvdzogKHsgcm93IH0pID0+IHtcclxuXHRcdFx0XHRkb20ocm93LmVsZW1lbnQpLm9uKCdjb250ZXh0bWVudScsICh7IGV2ZW50IH0pID0+IHtcclxuXHRcdFx0XHRcdGlmICghcm93LmlzU2VsZWN0ZWQpXHJcblx0XHRcdFx0XHRcdHJvdy5zZWxlY3QoKTtcclxuXHJcblx0XHRcdFx0XHRfaGlzdG9yeUNvbnRleHRNZW51LnNob3coZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblNlbGVjdFJvd3M6ICh7IHJvd3MgfSkgPT4ge1xyXG5cdFx0XHRcdF9zZWxlY3RlZFJvdyA9IHJvd3NbMF07XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25VbnNlbGVjdFJvd3M6ICgpID0+IHtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uRG91YmxlQ2xpY2tSb3c6ICh7IHJvdyB9KSA9PiB7XHJcblx0XHRcdFx0dmlld0ZpbGVzKCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQ29weUNsaXA6ICh7IHRleHQgfSkgPT4ge1xyXG5cdFx0XHRcdGNvcHlDbGlwSXRlbXMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25DbGlja091dDogKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdGV2ZW50LmNhbmNlbFVuc2VsZWN0Um93cyA9ICEhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5hY3Rpb25iYXInKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGNvbnRleHQuZWxlbWVudHMuY29udGVudCA9IF9kYXRhVGFibGUuZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWQocGFnZUluZGV4ID0gMCkge1xyXG5cdFx0ZG9tKCcuaWNvbi5yZWZyZXNoJykuYWRkQ2xhc3MoJ3NwaW4nKTtcclxuXHRcdHNldEZvb3RlcigpO1xyXG5cclxuXHRcdGNvbnN0IHsgcmVzdWx0IH0gPSBhd2FpdCB3ZWJBUEkuZ2V0SGlzdG9yeVBhZ2VkKHBhZ2VJbmRleCwgcGFnZXIubGltaXQpO1xyXG5cclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0cGFnZXIuc2V0UGFnZShwYWdlSW5kZXgsIHJlc3VsdC5pdGVtcy5sZW5ndGgpO1xyXG5cdFx0XHRwYWdlci5zZXRUb3RhbChyZXN1bHQudG90YWwpO1xyXG5cdFx0XHRfZGF0YVRhYmxlLmxvYWQocmVzdWx0Lml0ZW1zKTtcclxuXHRcdFx0c2V0Rm9vdGVyKHJlc3VsdC50b3RhbCk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZG9tKCcuaWNvbi5yZWZyZXNoJykucmVtb3ZlQ2xhc3MoJ3NwaW4nKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2goKSB7XHJcblx0XHRsb2FkKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB2aWV3SW5GaWxlRXhwbG9yZXIoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudC5wb2ludGVySWQgJiYgZXZlbnQucG9pbnRlcklkICE9IDEpIHJldHVybjsgLy8gc29tZW50ZSBib3RcdTAwRTNvIHByaW5jaXBhbCBkbyBtb3VzZVxyXG5cclxuXHRcdC8vIHNldFRpbWVvdXQgbmVjZXNzXHUwMEUxcmlvIHBhcmEgcXVlIHNlbGVjdGVkUm93IHNlamEgYXR1YWxpemFkb1xyXG5cdFx0c2V0VGltZW91dCgoKSA9PiB3ZWJBUEkudmlld0luRmlsZUV4cGxvcmVyKF9zZWxlY3RlZFJvdy5kYXRhKCkucGF0aCksIDIwMCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb3B5Q2xpcEl0ZW1zKCkge1xyXG5cdFx0d2ViQVBJLmNvcHlDbGlwKF9kYXRhVGFibGUuZXhwb3J0KCkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmlld0ZpbGVzKCkge1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3RPcGVuZWRJdGVtJywgX3NlbGVjdGVkUm93LmRhdGEoKS5oaXN0b3J5RmlsZU5hbWUpO1xyXG5cdFx0bG9jYXRpb24uaGFzaCA9ICdoaXN0b3J5ZmlsZXMvJyArIF9zZWxlY3RlZFJvdy5kYXRhKCkuaGlzdG9yeUZpbGVOYW1lO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZGVsZXRlSXRlbSgpIHtcclxuXHRcdGNvbnN0IG1vZGFsID0gTW9kYWwoe1xyXG5cdFx0XHR0aXRsZTogJ0RlbGV0ZSByZWdpc3RyeScsXHJcblx0XHRcdGNvbnRlbnQ6ICdUaGUgc2VsZWN0ZWQgaXRlbShzKSB3aWxsIGJlIHBlcm1hbmVudGx5IGRlbGV0ZWQuPGJyPjxicj5EbyB5b3Ugd2lzaCB0byBjb250aW51ZT8nLFxyXG5cdFx0XHRidXR0b25zOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bmFtZTogJ09LJywgcHJpbWFyeTogdHJ1ZSwgb25DbGljazogYXN5bmMgKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRtb2RhbC5ibG9jaygpO1xyXG5cdFx0XHRcdFx0XHRtb2RhbC5zaG93U3BpbigpO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCBfZGVsZXRlKCk7XHJcblx0XHRcdFx0XHRcdG1vZGFsLmJsb2NrKGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0bW9kYWwuaGlkZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnQ2FuY2VsJyB9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cclxuXHRcdG1vZGFsLnNob3coKTtcclxuXHJcblx0XHRhc3luYyBmdW5jdGlvbiBfZGVsZXRlKCkge1xyXG5cdFx0XHRsZXQgcm93cyA9IF9kYXRhVGFibGUuc2VsZWN0ZWRSb3dzKCk7XHJcblx0XHRcdGxldCBpZHMgPSByb3dzLm1hcCh4ID0+IHguZGF0YSgpLmlkKS5qb2luKCcsJyk7XHJcblxyXG5cdFx0XHRjb25zdCB7IHJlc3VsdDogdG90YWwsIGVycm9yIH0gPSBhd2FpdCB3ZWJBUEkuZGVsZXRlSGlzdG9yeUV2ZW50cyhpZHMpO1xyXG5cclxuXHRcdFx0aWYgKCFlcnJvcikge1xyXG5cdFx0XHRcdHBhZ2VyLnNldFRvdGFsKHRvdGFsKTtcclxuXHRcdFx0XHRzZXRGb290ZXIodG90YWwpO1xyXG5cdFx0XHRcdF9kYXRhVGFibGUucmVtb3ZlU2VsZWN0ZWRSb3dzKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEhpc3RvcnkoKSB7XHJcblx0XHRjb25zdCBmaWxlTmFtZSA9ICdIaXN0b3J5Lnhsc3gnO1xyXG5cdFx0Y29uc3QgeyByZXN1bHQ6IHBhdGggfSA9IGF3YWl0IHdlYkFQSS5zYXZlRmlsZVBpY2tlcignRXhwb3J0IGhpc3RvcnknLCBmaWxlTmFtZSwgJ3hsc3gnKTtcclxuXHJcblx0XHRpZiAocGF0aClcclxuXHRcdFx0d2ViQVBJLmV4cG9ydEhpc3RvcnkoJ0hpc3RvcnknLCBwYXRoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZvb3Rlcih0b3RhbCkge1xyXG5cdFx0c2hhcmVkLmZvb3Rlci5pbmZvKGAke3RvdGFsIHx8ICdObyd9IGV4ZWN1dGlvbnNgKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNob3dBY3Rpb25CYXJCdXR0b25zKHNob3cgPSB0cnVlKSB7XHJcblx0XHRhY3Rpb25CYXIuZWxlbWVudC5nZXQoJ1tuYW1lPXZpZXdGaWxlc10nKS5zaG93KHNob3cpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhpc3RvcnlQYWdlO1xyXG4iLCAiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4uL3NlcnZpY2VzL2pzeC9mYWN0b3J5JztcclxuaW1wb3J0IHNoYXJlZCBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4uL3NlcnZpY2VzL1dlYkFQSVNlcnZpY2UnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vbGliL1V0aWxzJztcclxuaW1wb3J0IFBhZ2VIZWFkZXIgZnJvbSAnLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyJztcclxuaW1wb3J0IEFjdGlvbkJhciBmcm9tICcuLi9jb21wb25lbnRzL0FjdGlvbkJhcic7XHJcbmltcG9ydCBQYWdlciBmcm9tICcuLi9jb21wb25lbnRzL1BhZ2VyJztcclxuaW1wb3J0IERhdGFUYWJsZSBmcm9tICcuLi9saWIvRGF0YVRhYmxlL3NyYy9pbmRleCc7XHJcbmltcG9ydCBNZW51IGZyb20gJy4uL2xpYi9NZW51L01lbnUnO1xyXG5pbXBvcnQgSWNvbiBmcm9tICcuLi9jb21wb25lbnRzL0ljb24nO1xyXG5cclxuY29uc3QgSGlzdG9yeUZpbGVzUGFnZSA9ICgpID0+IHtcclxuXHRjb25zdCBoZWFkZXIgPSBQYWdlSGVhZGVyKHtcclxuXHRcdG9uQ2xpY2tCYWNrQnV0dG9uOiBiYWNrLFxyXG5cdFx0ZGVzY3JpcHRpb246ICdQcm9jZXNzZWQgZmlsZXMgYW5kIG9wdGltaXphdGlvbiBkZXRhaWxzLicsXHJcblx0fSk7XHJcblx0Y29uc3QgYWN0aW9uQmFyID0gQWN0aW9uQmFyKHtcclxuXHRcdGJ1dHRvbnM6IFtcclxuXHRcdFx0eyBuYW1lOiAncGFnZU1lbnUnLCB0b29sdGlwOiAnJywgaWNvbjogSWNvbignZWxsaXBzaXNWZXJ0aWNhbCcpIH0sXHJcblx0XHRcdHsgdG9vbHRpcDogJ1JlZnJlc2gnLCBpY29uOiBJY29uKCdyZWZyZXNoJyksIG9uQ2xpY2s6IHJlZnJlc2ggfSxcclxuXHRcdF1cclxuXHR9KTtcclxuXHRjb25zdCBwYWdlciA9IFBhZ2VyKHtcclxuXHRcdGxpbWl0OiAxMDAsXHJcblx0XHRvblByZXY6IHBhZ2VJbmRleCA9PiBsb2FkKHBhZ2VJbmRleCksXHJcblx0XHRvbk5leHQ6IHBhZ2VJbmRleCA9PiBsb2FkKHBhZ2VJbmRleCksXHJcblx0fSk7XHJcblx0Y29uc3QgY29udGV4dCA9IHtcclxuXHRcdGVsZW1lbnRzOiB7XHJcblx0XHRcdGhlYWRlcjogaGVhZGVyLmVsZW1lbnQsXHJcblx0XHRcdGFjdGlvbkJhcjogW1xyXG5cdFx0XHRcdGFjdGlvbkJhci5lbGVtZW50LFxyXG5cdFx0XHRcdHBhZ2VyLmVsZW1lbnQsXHJcblx0XHRcdF0sXHJcblx0XHRcdGNvbnRlbnQ6IG51bGwsXHJcblx0XHR9LFxyXG5cdFx0b25TaG93LFxyXG5cdH07XHJcblx0Y29uc3QgX2hpc3RvcnlGaWxlTmFtZSA9IGxvY2F0aW9uLmhhc2guc3BsaXQoJy8nKVsxXTtcclxuXHRsZXQgX2RhdGFUYWJsZTtcclxuXHRsZXQgX3NlbGVjdGVkUm93O1xyXG5cdGxldCBfZmlsZXNDb250ZXh0TWVudTtcclxuXHJcblx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoZmFsc2UpO1xyXG5cdHNldERhdGFUYWJsZSgpO1xyXG5cclxuXHRyZXR1cm4gY29udGV4dDtcclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gb25TaG93KCkge1xyXG5cdFx0Y29uc3QgX3Rhc2tJZCA9IF9oaXN0b3J5RmlsZU5hbWUuc3BsaXQoJ18nKVswXTtcclxuXHRcdGNvbnN0IHsgcmVzdWx0OiB0YXNrIH0gPSBhd2FpdCB3ZWJBUEkuZ2V0VGFza0J5SWQoX3Rhc2tJZCk7XHJcblxyXG5cdFx0Ly8gSGlzdG9yeSA+IFRhc2sgPiBGaWxlc1xyXG5cdFx0aGVhZGVyLnNldFBhZ2VNYXAoW1xyXG5cdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtiYWNrfT5IaXN0b3J5PC9idXR0b24+LFxyXG5cdFx0XHQ8c3BhbiB0aXRsZT17dGFzay5uYW1lfT57dXRpbHMudHJ1bmNhdGVUZXh0KHRhc2submFtZSwgNjApfTwvc3Bhbj4sXHJcblx0XHRcdDxzcGFuPkZpbGVzPC9zcGFuPlxyXG5cdFx0XSk7XHJcblxyXG5cdFx0Ly8gTWVudXNcclxuXHRcdE1lbnUoe1xyXG5cdFx0XHR0cmlnZ2VyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1wYWdlTWVudV0nKSxcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdFeHBvcnQgZmlsZXMnLCBpY29uOiBJY29uKCdzaGVldCcpLCBvbkNsaWNrOiBleHBvcnRIaXN0b3J5IH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0X2ZpbGVzQ29udGV4dE1lbnUgPSBNZW51KHtcclxuXHRcdFx0aXRlbXM6IFtcclxuXHRcdFx0XHR7IG5hbWU6ICdSZWZyZXNoJywgaWNvbjogSWNvbigncmVmcmVzaCcpLCBvbkNsaWNrOiByZWZyZXNoIH0sXHJcblx0XHRcdFx0eyBuYW1lOiAnT3BlbiBmaWxlJywgaWNvbjogSWNvbignb3BlbicpLCBvbkNsaWNrOiBvcGVuRmlsZSB9LFxyXG5cdFx0XHRcdHsgbmFtZTogJ1ZpZXcgaW4gZmlsZSBleHBsb3JlcicsIGljb246IEljb24oJ2ZvbGRlclNlYXJjaCcpLCBvbkNsaWNrOiB2aWV3SW5GaWxlRXhwbG9yZXIgfSxcclxuXHRcdFx0XHR7IG5hbWU6ICdDb3B5JywgaWNvbjogSWNvbignY29weScpLCBvbkNsaWNrOiBjb3B5Q2xpcEl0ZW1zIH0sXHJcblx0XHRcdF0sXHJcblx0XHRcdG9uU2hvdzogKCkgPT4ge1xyXG5cdFx0XHRcdGx1Y2lkZS5jcmVhdGVJY29ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0YXdhaXQgbG9hZCgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RGF0YVRhYmxlKCkge1xyXG5cdFx0X2RhdGFUYWJsZSA9IERhdGFUYWJsZSh7XHJcblx0XHRcdGlkOiAnaGlzdG9yeWZpbGVzJyxcclxuXHRcdFx0aGVpZ2h0OiAnMTAwJScsXHJcblx0XHRcdHJlc2l6ZTogdHJ1ZSxcclxuXHRcdFx0c29ydDogdHJ1ZSxcclxuXHRcdFx0Y29sdW1uczoge1xyXG5cdFx0XHRcdGRhdGVUaW1lOiB7IGRpc3BsYXlOYW1lOiAnRGF0ZS9UaW1lJywgd2lkdGg6IDE0MCB9LFxyXG5cdFx0XHRcdHBhdGg6IHsgZGlzcGxheU5hbWU6ICdQYXRoJywgd2lkdGg6IDMwMCB9LFxyXG5cdFx0XHRcdGFjdGlvbjogeyBkaXNwbGF5TmFtZTogJ0FjdGlvbicsIHdpZHRoOiAxNDAgfSxcclxuXHRcdFx0XHRzdGF0dXM6IHsgZGlzcGxheU5hbWU6ICdTdGF0dXMnLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0ZGVzY3JpcHRpb246IHsgZGlzcGxheU5hbWU6ICdEZXNjcmlwdGlvbicsIHdpZHRoOiAzMDAgfSxcclxuXHRcdFx0XHRzaXplUHg6IHsgZGlzcGxheU5hbWU6ICdTaXplIChweCknLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0bmV3U2l6ZVB4OiB7IGRpc3BsYXlOYW1lOiAnTmV3IFNpemUgKHB4KScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRzaXplQnl0ZXM6IHsgZGlzcGxheU5hbWU6ICdTaXplIChNQiknLCB3aWR0aDogMTIwIH0sXHJcblx0XHRcdFx0bmV3U2l6ZUJ5dGVzOiB7IGRpc3BsYXlOYW1lOiAnTmV3IFNpemUgKE1CKScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0XHRjb21wcmVzc2lvbjogeyBkaXNwbGF5TmFtZTogJ0NvbXByZXNzaW9uJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdHR5cGU6IHsgZGlzcGxheU5hbWU6ICdUeXBlJywgd2lkdGg6IDEyMCB9LFxyXG5cdFx0XHRcdG5ld1R5cGU6IHsgZGlzcGxheU5hbWU6ICdOZXcgVHlwZScsIHdpZHRoOiAxMjAgfSxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm93czoge1xyXG5cdFx0XHRcdHNlbGVjdE9uQ2xpY2s6IHRydWUsXHJcblx0XHRcdFx0YWxsb3dNdWx0aXBsZVNlbGVjdGlvbjogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y2VsbHM6IHtcclxuXHRcdFx0XHRkYXRlVGltZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj57XHJcblx0XHRcdFx0XHRcdFx0dmFsdWUgPyBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4tdXMnLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRlU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0aW1lU3R5bGU6ICdzaG9ydCcsXHJcblx0XHRcdFx0XHRcdFx0fSkuZm9ybWF0KG5ldyBEYXRlKHZhbHVlKSkgOiAnJ1xyXG5cdFx0XHRcdFx0XHR9PC9zcGFuPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cGF0aDoge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gKFxyXG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDpcIiBvbkNsaWNrPXtvcGVuRmlsZX0gY2xhc3M9XCJsaW5rXCIgc3R5bGU9XCJvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcIj57dmFsdWV9PC9hPlxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c3RhdHVzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZSA/IDxkaXYgY2xhc3M9XCJjaGlwc1wiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjaGlwXCI+e1xyXG5cdFx0XHRcdFx0XHRcdFx0c2hhcmVkLmNvbnN0YW50cy5zdGF0dXMuZmluZCh4ID0+IHgubmFtZSA9PSB2YWx1ZSk/LmRpc3BsYXlOYW1lXHJcblx0XHRcdFx0XHRcdFx0fTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj4gOiAnJztcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDhweCAhaW1wb3J0YW50JyB9LFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2l6ZUJ5dGVzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAodmFsdWUgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSAvLyBNQlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bmV3U2l6ZUJ5dGVzOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiAoeyBpdGVtLCB2YWx1ZSB9KSA9PiAodmFsdWUgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCg0KSAvLyBNQlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y29tcHJlc3Npb246IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICh7IGl0ZW0sIHZhbHVlIH0pID0+IGAke051bWJlcih2YWx1ZSkudG9GaXhlZCgyKX0lYFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dHlwZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bmV3VHlwZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogKHsgaXRlbSwgdmFsdWUgfSkgPT4gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG9uQWRkUm93OiAoeyByb3cgfSkgPT4ge1xyXG5cdFx0XHRcdGRvbShyb3cuZWxlbWVudCkub24oJ2NvbnRleHRtZW51JywgKHsgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFyb3cuaXNTZWxlY3RlZClcclxuXHRcdFx0XHRcdFx0cm93LnNlbGVjdCgpO1xyXG5cclxuXHRcdFx0XHRcdF9maWxlc0NvbnRleHRNZW51LnNob3coZXZlbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblNlbGVjdFJvd3M6ICh7IHJvd3MgfSkgPT4ge1xyXG5cdFx0XHRcdF9zZWxlY3RlZFJvdyA9IHJvd3NbMF07XHJcblx0XHRcdFx0c2hvd0FjdGlvbkJhckJ1dHRvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25VbnNlbGVjdFJvd3M6ICgpID0+IHtcclxuXHRcdFx0XHRzaG93QWN0aW9uQmFyQnV0dG9ucyhmYWxzZSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG9uRG91YmxlQ2xpY2tSb3c6ICh7IHJvdywgZXZlbnQgfSkgPT4ge1xyXG5cdFx0XHRcdG9wZW5GaWxlKGV2ZW50KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0b25Db3B5Q2xpcDogKHsgdGV4dCB9KSA9PiB7XHJcblx0XHRcdFx0Y29weUNsaXBJdGVtcygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbkNsaWNrT3V0OiAoeyBldmVudCB9KSA9PiB7XHJcblx0XHRcdFx0ZXZlbnQuY2FuY2VsVW5zZWxlY3RSb3dzID0gISFldmVudC50YXJnZXQuY2xvc2VzdCgnLmFjdGlvbmJhcicpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y29udGV4dC5lbGVtZW50cy5jb250ZW50ID0gX2RhdGFUYWJsZS5lbGVtZW50O1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gbG9hZChwYWdlSW5kZXggPSAwKSB7XHJcblx0XHRjb25zdCB7IHJlc3VsdCB9ID0gYXdhaXQgd2ViQVBJLmdldEl0ZW1zRnJvbUhpc3RvcnlGaWxlUGFnZWQoX2hpc3RvcnlGaWxlTmFtZSwgcGFnZUluZGV4LCBwYWdlci5saW1pdCk7XHJcblxyXG5cdFx0c2V0Rm9vdGVyKCk7XHJcblxyXG5cdFx0aWYgKHJlc3VsdCkge1xyXG5cdFx0XHRwYWdlci5zZXRQYWdlKHBhZ2VJbmRleCwgcmVzdWx0Lml0ZW1zLmxlbmd0aCk7XHJcblx0XHRcdHBhZ2VyLnNldFRvdGFsKHJlc3VsdC50b3RhbCk7XHJcblx0XHRcdF9kYXRhVGFibGUubG9hZChyZXN1bHQuaXRlbXMpO1xyXG5cdFx0XHRzZXRGb290ZXIocmVzdWx0LnRvdGFsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2goKSB7XHJcblx0XHRsb2FkKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvcGVuRmlsZShldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnBvaW50ZXJJZCAmJiBldmVudC5wb2ludGVySWQgIT0gMSkgcmV0dXJuOyAvLyBzb21lbnRlIGJvdFx1MDBFM28gcHJpbmNpcGFsIGRvIG1vdXNlXHJcblxyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS5vcGVuRmlsZShfc2VsZWN0ZWRSb3cuZGF0YSgpLnBhdGgpLCAyMDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdmlld0luRmlsZUV4cGxvcmVyKCkge1xyXG5cdFx0Ly8gc2V0VGltZW91dCBuZWNlc3NcdTAwRTFyaW8gcGFyYSBxdWUgc2VsZWN0ZWRSb3cgc2VqYSBhdHVhbGl6YWRvXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHdlYkFQSS52aWV3SW5GaWxlRXhwbG9yZXIoX3NlbGVjdGVkUm93LmRhdGEoKS5wYXRoKSwgMjAwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvcHlDbGlwSXRlbXMoKSB7XHJcblx0XHR3ZWJBUEkuY29weUNsaXAoX2RhdGFUYWJsZS5leHBvcnQoKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRGb290ZXIodG90YWwpIHtcclxuXHRcdHNoYXJlZC5mb290ZXIuaW5mbyhgJHt0b3RhbCB8fCAnTm8nfSBmaWxlc2ApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmFjaygpIHtcclxuXHRcdGhpc3RvcnkuYmFjaygpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZnVuY3Rpb24gZXhwb3J0SGlzdG9yeSgpIHtcclxuXHRcdGNvbnN0IGZpbGVOYW1lID0gJ0hpc3RvcnkgZmlsZXMueGxzeCc7XHJcblx0XHRjb25zdCB7IHJlc3VsdDogcGF0aCB9ID0gYXdhaXQgd2ViQVBJLnNhdmVGaWxlUGlja2VyKCdFeHBvcnQgZmlsZXMnLCBmaWxlTmFtZSwgJ3hsc3gnKTtcclxuXHJcblx0XHRpZiAocGF0aClcclxuXHRcdFx0d2ViQVBJLmV4cG9ydEhpc3RvcnlGaWxlcyhfaGlzdG9yeUZpbGVOYW1lLCAnSGlzdG9yeSBmaWxlcycsIHBhdGgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2hvd0FjdGlvbkJhckJ1dHRvbnMoc2hvdyA9IHRydWUpIHtcclxuXHRcdC8vLi5cclxuXHR9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5RmlsZXNQYWdlO1xyXG4iLCAiaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9qc3gvZmFjdG9yeSc7XHJcbmltcG9ydCB7IGRvbSB9IGZyb20gJy4vbGliL2RvbS9kb20nO1xyXG5pbXBvcnQgc2hhcmVkIGZyb20gJy4vc2hhcmVkJztcclxuaW1wb3J0IHJvdXRlciBmcm9tICcuL3NlcnZpY2VzL1JvdXRlclNlcnZpY2UnO1xyXG5pbXBvcnQgd2ViQVBJIGZyb20gJy4vc2VydmljZXMvV2ViQVBJU2VydmljZSc7XHJcbmltcG9ydCBJY29uIGZyb20gJy4vY29tcG9uZW50cy9JY29uJztcclxuaW1wb3J0IFBhZ2VMYXlvdXQgZnJvbSAnLi9jb21wb25lbnRzL1BhZ2VMYXlvdXQnO1xyXG5pbXBvcnQgQXBwQmFyIGZyb20gJy4vY29tcG9uZW50cy9BcHBCYXInO1xyXG5pbXBvcnQgTmF2aWdhdGlvbiBmcm9tICcuL2NvbXBvbmVudHMvTmF2aWdhdGlvbic7XHJcbmltcG9ydCBQYWdlRm9vdGVyIGZyb20gJy4vY29tcG9uZW50cy9QYWdlRm9vdGVyJztcclxuaW1wb3J0IExvZ2luUGFnZSBmcm9tICcuL3BhZ2VzL0xvZ2luUGFnZSc7XHJcbmltcG9ydCBUYXNrc1BhZ2UgZnJvbSAnLi9wYWdlcy9UYXNrc1BhZ2UnO1xyXG5pbXBvcnQgVGFza1BhZ2UgZnJvbSAnLi9wYWdlcy9UYXNrUGFnZSc7XHJcbmltcG9ydCBUYXNrRmlsZXNQYWdlIGZyb20gJy4vcGFnZXMvVGFza0ZpbGVzUGFnZSc7XHJcbmltcG9ydCBIaXN0b3J5UGFnZSBmcm9tICcuL3BhZ2VzL0hpc3RvcnlQYWdlJztcclxuaW1wb3J0IEhpc3RvcnlGaWxlc1BhZ2UgZnJvbSAnLi9wYWdlcy9IaXN0b3J5RmlsZXNQYWdlJztcclxuXHJcbmxldCBwYWdlTGF5b3V0O1xyXG5sZXQgbmF2aWdhdGlvbjtcclxubGV0IGFwcEJhcjtcclxubGV0IGZvb3RlcjtcclxuXHJcbnJvdXRlci5yb3V0ZXMoe1xyXG5cdCdsb2dpbic6IExvZ2luUGFnZSxcclxuXHQndGFza3MnOiBUYXNrc1BhZ2UsXHJcblx0J3Rhc2svPyc6IFRhc2tQYWdlLFxyXG5cdCd0YXNrLz8vZmlsZXMnOiBUYXNrRmlsZXNQYWdlLFxyXG5cdCdoaXN0b3J5JzogSGlzdG9yeVBhZ2UsXHJcblx0J2hpc3RvcnlmaWxlcy8/JzogSGlzdG9yeUZpbGVzUGFnZSxcclxufSk7XHJcbndpbmRvdy5kb20gPSBkb207XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4gbW91bnRQYWdlKCkpO1xyXG4vLyF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBldmVudCA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKTsgLy8gZGVzYWJpbGl0YSBvIG1lbnUgZGUgY29udGV4dG8gbmF0aXZvXHJcblxyXG4oYXN5bmMgKCkgPT4ge1xyXG5cdGNvbnN0IF9pc0F1dGhlbnRpY2F0ZWQgPSBhd2FpdCBpc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHJcblx0aWYgKCFfaXNBdXRoZW50aWNhdGVkKSB7XHJcblx0XHRsb2NhdGlvbi5oYXNoID0gJ2xvZ2luJztcclxuXHR9IGVsc2Uge1xyXG5cdFx0c3RhcnQoKTtcclxuXHR9XHJcbn0pKCk7XHJcblxyXG5cclxuLy8gRlVOXHUwMEM3XHUwMEQ1RVNcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGlzQXV0aGVudGljYXRlZCgpIHtcclxuXHRyZXR1cm4gdHJ1ZTtcclxuXHRyZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykgIT0gbnVsbDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc3RhcnQoKSB7XHJcblx0Y29uc3QgeyByZXN1bHQ6IGNvbnN0YW50cyB9ID0gYXdhaXQgd2ViQVBJLmdldENvbnN0YW50cygpO1xyXG5cclxuXHRpZiAoY29uc3RhbnRzKVxyXG5cdFx0c2hhcmVkLmNvbnN0YW50cyA9IHsgLi4uc2hhcmVkLmNvbnN0YW50cywgLi4uY29uc3RhbnRzIH07XHJcblxyXG5cdG5hdmlnYXRpb24gPSBOYXZpZ2F0aW9uKFtcclxuXHRcdHsgdGl0bGU6ICdUYXNrcycsIG5hbWU6ICd0YXNrJywgaHJlZjogJyN0YXNrcycsIGljb246IEljb24oJ3Rhc2tzJykgfSxcclxuXHRcdHsgdGl0bGU6ICdIaXN0b3J5JywgbmFtZTogJ2hpc3RvcnknLCBocmVmOiAnI2hpc3RvcnknLCBpY29uOiBJY29uKCdoaXN0b3J5JykgfSxcclxuXHRdKTtcclxuXHRhcHBCYXIgPSBBcHBCYXIoKTtcclxuXHRmb290ZXIgPSBQYWdlRm9vdGVyKCk7XHJcblx0cGFnZUxheW91dCA9IFBhZ2VMYXlvdXQoe1xyXG5cdFx0YXBwQmFyLFxyXG5cdFx0bmF2aWdhdGlvbixcclxuXHRcdGZvb3RlcixcclxuXHR9KTtcclxuXHJcblx0c2hhcmVkLmZvb3RlciA9IGZvb3RlcjtcclxuXHJcblx0cmVuZGVyKHBhZ2VMYXlvdXQuZWxlbWVudC5ub2Rlc1swXSwgZG9jdW1lbnQuYm9keSk7XHJcblx0c3RhcnRXZWJTb2NrZXQoKTtcclxuXHRtb3VudFBhZ2UoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbW91bnRQYWdlKCkge1xyXG5cdGxvY2F0aW9uLmhhc2ggPSBsb2NhdGlvbi5oYXNoIHx8ICd0YXNrcyc7XHJcblxyXG5cdGxldCBwYWdlID0gcm91dGVyLnJvdXRlKCk7XHJcblxyXG5cdHBhZ2UgPSBhd2FpdCBwYWdlKCk7XHJcblxyXG5cdGlmIChzaGFyZWQuY3VycmVudFBhZ2UgJiYgc2hhcmVkLmN1cnJlbnRQYWdlLm9uSGlkZSlcclxuXHRcdHNoYXJlZC5jdXJyZW50UGFnZS5vbkhpZGUoKTtcclxuXHJcblx0c2hhcmVkLmN1cnJlbnRQYWdlID0gcGFnZTtcclxuXHJcblx0aWYgKGxvY2F0aW9uLmhhc2ggPT0gJyNsb2dpbicpIHtcclxuXHRcdHJlbmRlcihwYWdlLmVsZW1lbnQubm9kZXNbMF0sIGRvY3VtZW50LmJvZHkpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRwYWdlTGF5b3V0LmVsZW1lbnRzLmhlYWRlci5odG1sKCcnKS5pbnNlcnQocGFnZS5lbGVtZW50cy5oZWFkZXIpO1xyXG5cdFx0cGFnZUxheW91dC5lbGVtZW50cy5hY3Rpb25CYXIuaHRtbCgnJykuaW5zZXJ0KHBhZ2UuZWxlbWVudHMuYWN0aW9uQmFyKTtcclxuXHRcdHBhZ2VMYXlvdXQuZWxlbWVudHMuY29udGVudC5odG1sKCcnKS5pbnNlcnQocGFnZS5lbGVtZW50cy5jb250ZW50KTtcclxuXHRcdG5hdmlnYXRpb24uc2V0QWN0aXZlKCk7XHJcblx0XHRmb290ZXIuaW5mbygnJyk7XHJcblx0XHRyZW5kZXIocGFnZUxheW91dC5lbGVtZW50Lm5vZGVzWzBdLCBkb2N1bWVudC5ib2R5KTtcclxuXHR9XHJcblxyXG5cdGlmIChwYWdlLm9uU2hvdylcclxuXHRcdGF3YWl0IHBhZ2Uub25TaG93KCk7XHJcblxyXG5cdC8vIGNhcnJlZ2Egb3MgXHUwMEVEY29uZXMgZG8gbHVjaWRlXHJcblx0bHVjaWRlLmNyZWF0ZUljb25zKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0V2ViU29ja2V0KCkge1xyXG5cdGNvbnN0IHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYHdzOi8vJHtsb2NhdGlvbi5ob3N0fS93c2ApO1xyXG5cclxuXHRzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0XHQvLyB0YXJlZmFzIGVtIGV4ZWN1XHUwMEU3XHUwMEUzb1xyXG5cdFx0Y29uc3QgcnVubmluZ1Rhc2tzID0gZXZlbnQuZGF0YTtcclxuXHJcblx0XHRpZiAoc2hhcmVkLmN1cnJlbnRQYWdlLnVwZGF0ZVJ1bm5pbmdUYXNrcylcclxuXHRcdFx0c2hhcmVkLmN1cnJlbnRQYWdlLnVwZGF0ZVJ1bm5pbmdUYXNrcyhydW5uaW5nVGFza3MpO1xyXG5cdH07XHJcblxyXG5cdHNldEludGVydmFsKCgpID0+IHtcclxuXHRcdC8vIHNlcnZpZG9yIG5cdTAwRTNvIHJlc3BvbmRlXHJcblx0XHRpZiAoc29ja2V0LnJlYWR5U3RhdGUgIT0gMSlcclxuXHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XHJcblx0fSwgMTAwMCk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQU8sV0FBUyxjQUFjLEtBQXdCLFVBQWUsVUFBaUI7QUFDckYsVUFBTSxVQUFVLE9BQU8sUUFBUSxhQUM1QixJQUFJLEtBQUssSUFDVCxTQUFTLGNBQWMsR0FBRztBQUU3QixlQUFXLENBQUMsTUFBTSxLQUFL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QU8sY0FBYztBQUVyQixRQUFJLFNBQVMsUUFBUSxVQUFVO0FBQzlCLGFBQU8sS0FBSyxRQUFRLE1BQU0sQ0FBQyxHQUFHLFNBQVMsSUFBSTtBQUFBLElBQzVDLE9BQU87QUFDTixpQkFBVyxTQUFTLE9BQU8sS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFNBQVMsTUFBTTtBQUMvRCxpQkFBVyxTQUFTLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFNBQVMsU0FBUztBQUNyRSxpQkFBVyxTQUFTLFFBQVEsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFNBQVMsT0FBTztBQUNqRSxpQkFBVyxVQUFVO0FBQ3JCLGFBQU8sS0FBSyxFQUFFO0FBQ2QsYUFBTyxXQUFXLFFBQVEsTUFBTSxDQUFDLEdBQUcsU0FBUyxJQUFJO0FBQUEsSUFDbEQ7QUFFQSxRQUFJLEtBQUs7QUFDUixZQUFNLEtBQUssT0FBTztBQUduQixXQUFPLFlBQVk7QUFBQSxFQUNwQjtBQUVBLFdBQVMsaUJBQWlCO0FBQ3pCLFVBQU0sU0FBUyxJQUFJLFVBQVUsUUFBUSxTQUFTLElBQUksS0FBSztBQUV2RCxXQUFPLFlBQVksU0FBVSxPQUFPO0FBRW5DLFlBQU0sZUFBZSxNQUFNO0FBRTNCLFVBQUksZUFBTyxZQUFZO0FBQ3RCLHVCQUFPLFlBQVksbUJBQW1CLFlBQVk7QUFBQSxJQUNwRDtBQUVBLGdCQUFZLE1BQU07QUFFakIsVUFBSSxPQUFPLGNBQWM7QUFDeEIsaUJBQVMsT0FBTztBQUFBLElBQ2xCLEdBQUcsR0FBSTtBQUFBLEVBQ1I7IiwKICAibmFtZXMiOiBbImRvbSIsICJ4IiwgImF0dHIiLCAidmFsdWUiLCAic2hvdyIsICJoaWRlIiwgInJlbW92ZSIsICJkaXNhYmxlIiwgInJvdXRlcyIsICJyb3V0ZSIsICJuYXZpZ2F0aW9uIiwgImFwcEJhciIsICJmb290ZXIiLCAiJG1lbnUiLCAicGFnZU1hcCIsICJidXR0b24iLCAiZGlzYWJsZSIsICJzaG93IiwgIiRjZWxsIiwgImNoZWNrZWQiLCAic2hvdyIsICIkaGVhZGVyIiwgImNlbGwiLCAic2hvdyIsICIkY2VsbCIsICJ2YWx1ZSIsICJzaG93IiwgImNoZWNrZWQiLCAiJHJvdyIsICJvcHRpb25zIiwgImNlbGwiLCAic2hvdyIsICJtZXRhIiwgImRhdGEiLCAidGV4dCIsICIkZm9vdGVyIiwgImNvbnRlbnQiLCAic2hvdyIsICIkdGFibGUiLCAiZm9vdGVyIiwgImRpc2FibGUiLCAic2hvdyIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZGF0YSIsICJtZXRhIiwgIm9wdGlvbnMiLCAiY29sdW1uIiwgImRlZmF1bHRPcHRpb25zIiwgIiRvdmVybGF5IiwgImJsb2NrIiwgInNob3ciLCAidXRpbHMiLCAiVXRpbHMiLCAidmFsdWUiLCAiZmllbGQiLCAiZG9tIl0KfQo=
