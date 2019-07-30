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
  conditionalFields: Array<any>; // !
  condition: any;                // !

  constructor(attr: field_descriptor, parent?: Form) {
    this.key = attr.key;
    this.value = attr.initValue;
    this.type = (attr.type) ? attr.type : "text";
    this.parent = (parent) ? parent : null;
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
  }

  hide() {
    this.elm.style.display = "none";
  }

  getField(fields, key) {
    for(let i=0; i < fields.length; ++i) {
      if(fields[i].key == key) {
        return fields[i];
      }
    }
  }

  testConditions(keys) {
    var fields = this.parent.getFields(keys);
    var fulfilled = false;
    this.condition.forEach((condition) => {
      if(condition.$eq) {
        let field = this.getField(fields, condition.$eq.key);
        if(condition.$eq.value == field.value) {
          fulfilled = true;
          if(condition.list) {
            this.generateList(condition.list);
          }
          this.show();
        }
      }
      else if(condition.$and) {
        var counter = 0;
        condition.$and.forEach((condition_part) => {
          let field = this.getField(fields, condition_part.key);
          if(condition_part.value == field.value) {
            ++counter;
          }
        });
        if(counter == condition.$and.length) {
          fulfilled = true;
          if(condition.list) {
            this.generateList(condition.list);
          }
          this.show();
        }
      }
    });
    if(!fulfilled) {
      this.hide();
    }
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