import { AbstractField } from './AbstractField';

export class FieldSelect extends AbstractField {
  input_elm: HTMLSelectElement;
  list: Array<string>;
  action: Function;

  constructor(attr, parent) {
    super(attr, parent);
    var that = this;
    this.value = parseInt(this.initValue);
    this.initLabel();
    if(this.list) {
      this.input_elm = document.createElement("select");
      this.input_elm.setAttribute("class", "dgui-field-text");
      this.list.forEach((list_item, i) => {
        let option = document.createElement("option");
        option.setAttribute("value", (typeof list_item === "string") ? i.toString() : list_item.value);
        option.textContent = (typeof list_item === "string") ? list_item : list_item.label;
        this.input_elm.appendChild(option);
      });
      this.input_elm.addEventListener("input", (e) => {
        that.value = e.currentTarget.value;
      });
      if(typeof this.action === "function") {
        this.input_elm.addEventListener("input", (e) => {
          this.action(e.currentTarget.value);
        });
      }
    }
  }
}