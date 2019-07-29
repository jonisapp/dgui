import { field_descriptor } from './interfaces';

export abstract class AbstractField {
  /*                                              - Définition -                                        */
  key: string;
  value: any; // string | boolean | number | Array<{}>
  initValue: any;
  type: "message" | "button" | "text" | "password" | "number" | "choice" | "switch" | "switchGroup" | "select" | "selectMany" | "date" | "duration";
  label: string;
  label_elm?: HTMLLabelElement;
  required?: boolean;
  trigger?: Function;
  parent?: Form;
  elm: HTMLDivElement;

  constructor(attr: field_descriptor, parent?: Form) {
    this.key = attr.key;
    this.value = attr.initValue;
    this.type = (attr.type) ? attr.type : "text";
    this.parent = (parent) ? parent : null;
    this.label = (attr.label) ? attr.label : null;
    this.elm = document.createElement("div");
    this.elm.style.flex = ((attr.size) ? attr.size : 1).toString();
  }

  initLabel() {
    if(this.label) {
      this.label_elm = document.createElement("label");
      this.label_elm.textContent = this.label;
      this.label_elm.setAttribute("style", "text-align: left");
    }
  }

  reset() {
    this.value = this.initValue;
  }

  hide() {
    this.elm.style.display = "none";
  }

  check_condition(targetField: Field) {
    var that = this;
    let operator = (this.condition.operator) ? this.condition.operator : "==";
    this.condition.action = (this.condition.action) ? this.condition.action : ["show"];
    this.condition.action = (Array.isArray(this.condition.action)) ? this.condition.action : [this.condition.action];
    this.condition.hasValue = (this.condition.hasValue) ? this.condition.hasValue : 0;
    if(Array.isArray(this.condition.hasValue)) {
      this.elm.style.display = (this.condition.hasValue.includes(targetField.input_elm.value)) ? "block" : "none";
    }
    else {
      let fulfilled = false;
      var value1 = (this.condition.hasValue) ? this.condition.hasValue : "0";
      var value2 = (targetField.value) ? targetField.value : "0";
      // ---------------------------- operator hasChanged
      if(operator == "hasChanged") {
        if((targetField.type == "switch" || targetField.type == "date") && targetField.initValue != targetField.value) {
          fulfilled = true;
        }
        else if(targetField.initValue != targetField.input_elm.value) {
          fulfilled = true;
        }
      }
      // ---------------------------- other operators
      else if(eval(value1 + operator + value2)) {
        fulfilled = true;
      }
      if(fulfilled) {
        if(this.condition.action.includes("show")) { this.elm.style.display = "block"; }
        if(this.condition.action.includes("sync")) {
          if(this.type != "date" && targetField.type != "date") {
            this.value = targetField.value
          }
          else {
            this.updateDateValue(targetField.inputs_elm);
            for(let i = 0; i < this.inputs_elm.length; ++i) {
              this.inputs_elm[i].value = targetField.inputs_elm[i].value;
            }
          }
        } 
      }
      else {
        if(this.condition.action.includes("show")) { this.elm.style.display = "none"; }
      }
    }
  }
}