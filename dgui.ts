import { tr } from './translations';
import { get } from './state';

import { splitWhereOneOfSeperators, copyToClipboard, elementBelongsToDataType, notEmpty, join, setModifier, disableDefaultContextmenu, disableMouseSelection, setDefaultCursor } from './utility';

import { Form, formPannel_options, button, formPannel_fieldGroup } from './class/Form';
import { BlazeTemplate } from './class/BlazeTemplate';
import { Modal } from './class/Modal';

//Exports

export { splitWhereOneOfSeperators, copyToClipboard, elementBelongsToDataType, notEmpty, join, setModifier, disableDefaultContextmenu, disableMouseSelection, setDefaultCursor };

export { get };







//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Contextual menu dGUI ////////////////////////////////////////////////

/* --------------------------------- Interfaces ContextMenu --------------------------------------------*/

interface contextMenu_field {
  // user
  type?: "switch" | "button" | "context",
  key?: string,
  group?: string | contextMenu_group,
  label: string,
  initValue?: any,
  contextMenu?: contextMenu_init,
  condition?: boolean,
  action?: Function,
  switchLock?: boolean,
  // controller
  elm: HTMLDivElement,
  value: boolean,
  contextMenuObj: ContextMenu | null
}

interface contextMenu_group {
  name: string,
  fields: Array<contextMenu_field>
}

interface contextMenu_options {
  initPosition?: "bottom" | "right" | "left" | "mouse"
}

interface contextMenu_init {
  fields: Array<contextMenu_field>,
  options: contextMenu_options
}

interface contextMenu_parentAttributes {
  parent: contextMenu_field,
  parent_menu: ContextMenu,
  target: any
}

/* --------------------------------- CLASS ContextMenu -------------------------------------------------*/

class ContextMenu {

  /*                                              - Définition -                                        */
  // attributs
  elm: HTMLDivElement;
  parent_menu: ContextMenu;
  parent: contextMenu_field;
  target: any;
  options: contextMenu_options;
  groups: Array<contextMenu_group>;
  fields: Array<contextMenu_field>;
  contextFields: Array<contextMenu_field>;
  selected_items: Array<string>;
  mouseover: boolean;
  // methods
  event_close: any;
  recursive_close: any;
  close: any;
  /*                                              - Constructor -                                       */

  constructor(event, contextMenu_init: contextMenu_init, callback, parentAttributes?: contextMenu_parentAttributes) {
    // Attributs initialization
    var that = this;
    this.target = event.currentTarget;
    for(let property in contextMenu_init) {
      this[property] = contextMenu_init[property];
    }
    this.groups = [];
    if(parentAttributes) {
      this.parent = parentAttributes.parent;
      this.target = parentAttributes.target;
      this.parent_menu = parentAttributes.parent_menu;
    }
    this.contextFields = [];
    this.selected_items = [];
    this.mouseover = false;
    //                                            - Initial DOM setup -
    this.elm = document.createElement("div");
    this.elm.setAttribute("class", "dgui-contextMenu light-shadow");
    this.elm.setAttribute("data-type", "dgui_contextMenu");

    if(typeof this.options === "undefined") { this.options = {initPosition: "mouse"}; }
    if(typeof this.options.initPosition === "undefined") { this.options.initPosition = "mouse"; }

    var htmlTargetPosition = event.currentTarget.getBoundingClientRect();
    if(this.parent) {
      htmlTargetPosition = this.parent.elm.getBoundingClientRect();
    }
    switch(this.options.initPosition) {
      case "mouse":
        this.elm.style.left = event.clientX + window.scrollX + "px";
        this.elm.style.top = event.clientY + window.scrollY + "px"; break;
      case "bottom":
        this.elm.style.left = htmlTargetPosition.left + window.scrollX + "px";
        this.elm.style.top = htmlTargetPosition.bottom + window.scrollY + "px";
        this.elm.style.width = htmlTargetPosition.width + "px"; 
        break;
      case "right":
        this.elm.style.left = htmlTargetPosition.right + window.scrollX + "px";
        this.elm.style.top = htmlTargetPosition.top + window.scrollY + "px"; break;       
    }
    //                                            - Initial events -
    disableDefaultContextmenu(this.elm);
    disableMouseSelection(this.elm);
    this.elm.addEventListener("mouseover", () => {
      this.mouseover = true;
    });
    this.elm.addEventListener("mouseout", () => {
      this.mouseover = false;
    });
    document.addEventListener("keypress", (e) => {
      if(e.keyCode == 13) {
        that.close(true);
      }
    });
    if(this.fields) {
      this.fields.forEach((field, index) => {
        /*                                        - Field init attributs -                              */
        if(field.contextMenu) {
          field.type = "context";
        }
        else if(field.group) {
          field.type = "switch";
          field.switchLock = (typeof field.switchLock !== "undefined") ? field.switchLock : false;
          let group_index = -1;
          that.groups.forEach((group, i) => {
            if(group.name == field.group) { group_index = i; }
          });
          if(group_index === -1) { that.groups.push({name: field.group, fields: []}); }
          group_index = (group_index !== -1) ? group_index : that.groups.length-1;
          that.groups[group_index].fields.push(field);
          field.group = that.groups[group_index];
        }
        else if(!field.type) {
          field.type = "button";
        }
        /*                                        - Fields init display -                               */
        field.elm = document.createElement("div");
        if(typeof field.condition !== "undefined") {
          field.elm.style.display = (field.condition) ? "block" : "none";
        }
        field.elm.setAttribute("data-index", index.toString());
        field.elm.setAttribute("class", "dgui-contextMenu-item");
        if(event.type == "contextmenu") { field.elm.style.minWidth = "200px"; }
        if(field.type != "context") {
          field.elm.textContent = field.label;
        }
        else {
          let label = document.createElement("div");
          label.style.display = "inline-block";
          label.textContent = field.label;
          let arrow = document.createElement("div");
          arrow.setAttribute("class", "dgui_arrow-right");
          let arrow_container = document.createElement("div");
          arrow_container.setAttribute("data-type", "arrow");
          arrow_container.setAttribute("style", "float: right");
          arrow_container.appendChild(arrow);
          field.elm.appendChild(label);
          field.elm.appendChild(arrow_container);
          this.contextFields.push(field);
        }
        if(field.type == "switch") {
          if(field.initValue) {
            field.value = true;
            this.selected_items.push(field.key);
            that.changeColor(field.elm, "rgba(93, 78, 109, 0.5)", "white");
          }
        }
        /*                                        - Fields init events -                                */
        if(field.type != "context") {
          field.elm.addEventListener("mouseover", () => {
            that.closeContextFields();
          });
          if(field.type == "switch") {
            field.elm.addEventListener("click", (event) => {
              let index = (<HTMLDivElement>event.target).dataset.index;
              // main callback
              if(!that.selected_items.includes(that.fields[index].key)) {
                if(field.group) {
                  field.group.fields.forEach((field) => {
                    let f_index = that.selected_items.indexOf(field.key);
                    if(f_index !== -1) { that.selected_items.splice(f_index, 1) }
                    field.value = false;
                    that.changeColor(field.elm, "rgba(124, 110, 127, 0)", "#262626");
                  });
                }
                field.value = true;
                that.changeColor(event.target, "rgba(93, 78, 109, 0.5)", "white");
                that.selected_items.push(that.fields[index].key);
              }
              else {
                field.value = false;
                let itemToRemoveIndex = that.selected_items.indexOf(that.fields[index].key);
                that.selected_items.splice(itemToRemoveIndex, 1);
                that.changeColor(event.target, "rgba(124, 110, 127, 0)", "#262626");
              }
              // action
              if(field.action) {
                field.action(that.target, field.value);
              }
              if(!field.switchLock) {
                that.recursive_close();
                that.close(true);
              }
            });
            field.elm.addEventListener("mouseover", (event) => {
              if(!field.value) {
                that.changeColor(event.target, "rgba(124, 110, 127, 0.4)", "white");
              }
            });
            field.elm.addEventListener("mouseout", (event) => {
              if(!field.value) {
                that.changeColor(event.target, "rgba(112 ,112 ,112, 0)", "#262626");
              }
            });
          }
          else if(field.type == "button") {
            field.elm.addEventListener("click", (event) => {
              let index = (<HTMLButtonElement>event.target).dataset.index;
              if(that.fields[index].action) {
                that.fields[index].action(that.target);
              }
              if(that.fields[index].key) {
                that.selected_items.push(that.fields[index].key);
              }
              that.recursive_close();
              that.close(true);
            });
          }
        }
        else {
          field.elm.addEventListener("mouseover", () => {
            if(!field.contextMenuObj) {
              if(!field.contextMenu.options) { field.contextMenu.options = {}; }
              if(!field.contextMenu.options.initPosition) {
                field.contextMenu.options.initPosition = "right";
              }
              this.closeContextFields();
              field.contextMenuObj = new ContextMenu(event, field.contextMenu, callback, {parent: field, parent_menu: that, target: that.target});
              field.elm.addEventListener("mouseleave", (event) => {
                event.stopPropagation();
                if(field.contextMenuObj) {
                  setTimeout(() => {
                    if(field.contextMenuObj) {
                      if(!field.contextMenuObj.mouseover) {
                        field.contextMenuObj.close();
                        delete field.contextMenuObj;
                      }
                    }
                  }, 10);
                }
              });
            }
          });
        }
        this.elm.appendChild(field.elm);
      });
    }
    /*                                            - Methods -                                           */
    this.close = function(fireCallback?) {
      document.body.removeEventListener("mousedown", that.event_close);
      if(that.elm) { that.elm.parentNode.removeChild(that.elm); }
      if(fireCallback) {
        callback(that.selected_items);
      }
    }
    this.recursive_close = function() {
      if(that.parent_menu) {
        that.parent_menu.recursive_close()
        that.parent_menu.close();
      }
    }
    this.event_close = function(event) {
      event.stopPropagation();
      if(!elementBelongsToDataType(event.target, "dgui_contextMenu")) {
        that.close(true);
      }
    }
    document.body.appendChild(this.elm);
    if(this.options.initPosition == "left") {
      this.elm.style.left = htmlTargetPosition.left - this.elm.offsetWidth + window.scrollX + "px";
      this.elm.style.top = htmlTargetPosition.top + window.scrollY + "px";
    }
    this.adaptPosition("left", "right", "width", "innerWidth");
    this.adaptPosition("top", "bottom", "height", "innerHeight");
    setTimeout(() => {
      document.body.addEventListener("mousedown", this.event_close);
    }, 10);
  }

  adaptPosition(position1, position2, dimension, win_dimension) {
    let elm_htmlPosition = this.elm.getBoundingClientRect();
    if(elm_htmlPosition[position2] > window[win_dimension]) {
      if(this.parent_menu) {
        let parentElm_htmlPosition = this.parent.elm.getBoundingClientRect();
        this.elm.style[position1] = parentElm_htmlPosition[position1] - elm_htmlPosition[dimension]+"px";
        this.parent_menu.options.initPosition = position1;
      }
      else {
        this.elm.style[position1] = window[(position1 == "top") ? "scrollY" : "scrollX"] + elm_htmlPosition[position1] - elm_htmlPosition[dimension]+"px";
      }
    }
  }

  closeContextFields() {
    this.contextFields.forEach((field) => {
      if(field.contextMenuObj) {
        field.contextMenuObj.close();
        delete field.contextMenuObj;
      }
    });
  }

  changeColor (elm, bg, c) {
    elm.style.backgroundColor = bg;
    elm.style.color = c;
  }
}

export function contextMenu(event, contextMenu_init, callback?) {
  new ContextMenu(event, contextMenu_init, (callback)? callback : ()=>{} );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Pannel dGUI /////////////////////////////////////////////////////////

/* --------------------------------- Interfaces Pannel -------------------------------------------------*/

interface PannelProps {
  template: any;
  position: "bottom-left" | "bottom-right";
}

/* --------------------------------- CLASS Pannel ------------------------------------------------------*/

class Pannel {
  private template: any;
  private position: "bottom-left" | "bottom-right";
  private elm: any;
  private closeHandler: any;
  constructor(event, pannelProps: PannelProps) {
    var that = this;
    Object.keys(pannelProps).forEach((key) => {
      this[key] = pannelProps[key];
    });
    var htmlTargetPosition = event.currentTarget.getBoundingClientRect();
    this.elm = document.createElement("div");
    this.elm.setAttribute("data-type", "dgui_pannel")
    this.elm.setAttribute("style", "position: absolute;");

    if(this.template) {
      this.template = new BlazeTemplate(this.template, this);
      this.elm.appendChild(this.template.elm);
    }

    this.closeHandler = function(e) {
      e.stopPropagation();
      if(!elementBelongsToDataType(e.target, "dgui_pannel")) {
        that.close();
      }
    }
    document.body.addEventListener("click", this.closeHandler);

    document.body.appendChild(this.elm);
    this.elm.style.top = htmlTargetPosition.top + htmlTargetPosition.height + 10 + window.scrollY + "px";
    if(this.position == "bottom-left") {
      this.elm.style.left = htmlTargetPosition.left - this.elm.offsetWidth + htmlTargetPosition.width + window.scrollX + "px";
    }
    else if(this.position == "bottom-right") {
      this.elm.style.left = htmlTargetPosition.left + window.scrollX + "px";
    }
  }

  close() {
    document.body.removeEventListener("click", this.closeHandler);
    this.elm.parentNode.removeChild(this.elm);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Common dialogbox dGUI ///////////////////////////////////////////////

export function alert(message: string | Error, title?: string, callback?: Function) {
  callback = callback || function(){};
  message = (message instanceof Error) ? message.message : message;
  new Modal({
    title: title || tr.title("information"),
    fields: [{type: "message", message: message}],
    footer: [{action: "quit", value: "Ok", BSClass: "btn-success"}]
  }, callback);
}

export function confirm(message: string, callback: Function, title = tr.title("confirm"), options?) {
  if(typeof title == "function") {
    callback = title;
    title = tr.title("confirm");
  }
  new Modal({
    title: title,
    fields: [{type: "message", message: message}],
    footer: [
      {action: "confirm", value: tr.btn("confirm"), BSClass: "btn-danger"},
      {action: "abort", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ],
    options: options
  }, callback);
}

export function prompt(message: string, callback: any, title:string = tr.title("entry"), options = {maxWidth: 500}) {
  new Modal({
    title: title,
    fields: [{type: "message", message: message}, {type: "text"}],
    footer: [
      {action: "submit", value: tr.btn("valid"), BSClass: "btn-danger"},
      {action: "quit", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ],
    options: options
  }, callback);
}

export function choose(title = tr.title("choice"), message: string, name, radioButtons, callback) {
  new Modal({
    title: title,
    fields: [
      {type: "message", message: message},
      {type: "choice", name: name, radioButtons: radioButtons}
    ],
    footer: [
      {action: "submit", value: tr.btn("valid"), BSClass: "btn-success"},
      {action: "quit", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ]
  }, callback);
}

export function modal(parameters, callback) {
  new Modal(parameters, callback);
}

export function ownmodal(htmlElm: any, clean, title="Boîte de modale personnalisée") {
  new Modal({
    type: "html",
    title: title,
    elm: htmlElm,
    clean: clean
  }, function(){});
}

class FormBlock {
  feedback: Function;
  quit: Function;
  abort: Function;
  submit: Function;
  form: Form;

  constructor(parent: any, formInitializer: formPannel_options, callback) {
    this.feedback = callback;
    this.quit = function() {
      parent.removeChild(this.form.elm);
    };
    this.abort = this.quit;
    this.submit = function(form) {
      this.feedback(form);
    };
    this.form = new Form(formInitializer, this);
    parent.appendChild(this.form.elm);
  }
}

export function form(parent: any, formInitializer: formPannel_options, callback) {
  let formBlock = new FormBlock(parent, formInitializer, callback);
}

export function pannel(event, pannelProps) {
  let pannel = new Pannel(event, pannelProps);
}