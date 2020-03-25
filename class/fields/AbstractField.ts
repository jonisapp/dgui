import { Form } from '../Form';
import { field_descriptor } from './interfaces';

export abstract class AbstractField {
  /*                                              - Définition -                                        */
  key: string;
  value: any; // string | boolean | number | Array<{}>
  initValue: any;
  type: "message" | "button" | "text" | "password" | "number" | "choice" | "switch" | "switchGroup" | "select" | "selectMany" | "date" | "duration";
  label: string;
  label_elm?: HTMLLabelElement;
  required: boolean;
  trigger?: Function;
  parent?: Form;
  elm: HTMLDivElement;
  conditionalFields: Array<any>; // !
  condition: any;                // !
  //private
  protected active: boolean;
  exclude: boolean;
  action: Function | boolean | string;
  display: "noLabel";

  abstract getValue(): any;

  input_elm: HTMLInputElement | HTMLSelectElement | HTMLDivElement;
  inputs_elm: HTMLInputElement[] | HTMLDivElement[];

  constructor(attr: field_descriptor, parent?: Form) {
    this.key = attr.key;
    this.initValue = (attr.initValue) ? attr.initValue : "";
    this.value = (attr.initValue) ? attr.initValue : null;
    this.type = (attr.type) ? attr.type : "text";
    this.parent = (parent) ? parent : null;
    if(attr.display == "noLabel") {
      this.display = "noLabel"
    }
    this.required = (attr.required) ? attr.required : false;
    this.active = true;
    this.conditionalFields = [];
    this.condition = attr.condition;
    this.label = (attr.label) ? attr.label : null;
    this.elm = document.createElement("div");
    if(!["message", "date", "switchGroup"].includes(attr.type)) {
      this.elm.setAttribute("class", "dgui-form-pannel-element");
    }
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

  show() {
    this.elm.style.display = "block";
    this.active = true;
  }

  hide() {
    this.value = null;
    this.elm.style.display = "none";
    this.active = false;
  }

  getField(fields, key) {
    for(let i=0; i < fields.length; ++i) {
      if(fields[i].key == key) {
        return fields[i];
      }
    }
  }

  retrieve() {
    let submittedField = {};
    submittedField[this.key] = this.getValue();
    return submittedField;
  }

  applyCondition(condition) {
    this.show();
  }

  testCondition(condition, fields, fulfilledCondition) {
    condition.paramsValues = [];
    if(condition.$eq) {
      let field = this.getField(fields, condition.$eq.key);
      if(condition.$eq.value == field.value) {
        fulfilledCondition = true;
        this.applyCondition(condition);
      }
    }
    else if(condition.$and) {
      var counter = 0;
      for(let i = 0; i < condition.$and.length; ++i) {
        let field = this.getField(fields, condition.$and[i].key);
        if(field.active) {
          if(typeof condition.$and[i].value === "number") {
            if(condition.$and[i].value == parseInt(field.value)) {
              counter++;
            }
          }
          else if(condition.$and[i].value === "*") {
            counter++;
            if(condition.params.includes(field.key)) {
              condition.paramsValues.push(field.value);
            }
          }
          else if(typeof condition.$and[i].value === "object") {
            if(condition.$and[i].value.$ne) {
              if(condition.$and[i].value.$ne !== parseInt(field.value)) {
                counter++;
              }
            }
            else if(condition.$and[i].value.$nin) {
              if(!condition.$and[i].value.$nin.includes(parseInt(field.value))) {
                counter++;
              }
            }
          }
        }
      }
      if(counter == condition.$and.length) {
        fulfilledCondition = true;
        this.applyCondition(condition);
      }
    }
    return fulfilledCondition; 
  }

  testConditions(keys) {
    var fields = this.parent.getFields(keys);
    var fulfilledCondition = false;
    this.condition.forEach((condition) => {
      fulfilledCondition = this.testCondition(condition, fields, fulfilledCondition);
    });
    if(!fulfilledCondition) {
      this.hide();
      this.reset();
      return false;
    }
  }

  check_condition(targetField: AbstractField) {
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

  generateSwitch(input_elm, label) {
    input_elm.setAttribute("class", "dgui-field-switch");
    input_elm.setAttribute("style", "display: flex; justify-content: center; align-items: center; margin-top: 0px");
    // if(this.display == "noLabel") {
    //   input_elm.style.marginTop = "32px";
    // }
    input_elm.style.backgroundColor = this.parent.colorSet.secColor;
    let text_elm = document.createElement("div");
    text_elm.textContent = label;
    input_elm.appendChild(text_elm);
  }
}