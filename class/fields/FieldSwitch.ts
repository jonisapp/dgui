import { AbstractField } from './AbstractField';

export class FieldSwitch extends AbstractField {
  input_elm: HTMLDivElement;
  group: string;
  action: Function | string;

  constructor(attr, parent) {
    super(attr, parent);
    var that = this;
    this.value = (attr.initValue === true) ? true : false;
    this.input_elm = document.createElement("div");
    this.generateSwitch(this.input_elm, this.label);
    this.input_elm.setAttribute("class", (this.initValue) ? "dgui-field-switch-selected" : "dgui-field-switch");
    this.input_elm.style.backgroundColor = (this.initValue) ? "#696969" : this.parent.colorSet.secColor;
    this.input_elm.style.height = "36px";
    this.input_elm.addEventListener("click", (e) => {
      let elm: any = e.currentTarget;
      if(!that.value) {
        if(that.parent && that.group) {
          that.parent.groups.forEach((group) => {
            if(group.name == that.group) {
              group.fields.forEach((field) => {
                field.value = false;
                field.conditionalFields.forEach((cf) => {
                  cf.check_condition(field);
                });
                field.input_elm.setAttribute("class", "dgui-field-switch");
                field.input_elm.style.backgroundColor = that.parent.colorSet.secColor;
              });
            }
          });
        }
        elm.setAttribute("class", "dgui-field-switch-selected");
        elm.style.backgroundColor = "#696969";
        that.value = true;
      }
      else {
        elm.setAttribute("class", "dgui-field-switch");
        elm.style.backgroundColor = that.parent.colorSet.secColor;
        that.value = false;
      }
      that.conditionalFields.forEach((cf) => {
        cf.check_condition(that);
      });
      // action
      if(typeof that.action !== "undefined") {
        if(typeof that.action === "function") {
          that.action(that.value);
        }
      }
    });
    this.elm = document.createElement('div');
    this.elm.setAttribute("class", "dgui-form-pannel-element-switch");
    this.elm.appendChild(this.input_elm);
  }

  getValue() {
    return this.value;
  }
}