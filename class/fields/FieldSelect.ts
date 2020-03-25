import { AbstractField } from './AbstractField';

export class FieldSelect extends AbstractField {
  input_elm: HTMLSelectElement;
  list: Array<string>;
  action: Function;
  addBlankInput: boolean;

  constructor(attr, parent) {
    console.log(parent);
    super(attr, parent);
    this.list = (attr.list) ? attr.list : [];
    this.initLabel();
    if(this.list.length == 0) this.hide();
    this.value = attr.initValue;
    this.addBlankInput = attr.addBlankInput;
    this.input_elm = document.createElement("select");
    this.input_elm.setAttribute("class", "dgui-field-text");
    this.input_elm.style.borderColor = parent.colorSet.secBrdColor;
    this.generateList(this.list);
    if(this.label) {
      this.elm.appendChild(this.label_elm);
    }
    this.elm.appendChild(this.input_elm);
  }

  generateList(list) {
    if(list) {
      if(this.addBlankInput) {
        this.input_elm.appendChild(document.createElement("option"));
      }
      console.log(list);
      list.forEach((list_item, i) => {
        let index = (this.addBlankInput) ? i+1 : i;
        let option = document.createElement("option");
        option.setAttribute("value", (typeof list_item === "string") ? index.toString() : list_item.value);
        option.textContent = (typeof list_item === "string") ? list_item : list_item.label;
        this.input_elm.appendChild(option);
      });
      this.input_elm.value = this.value;
      this.input_elm.addEventListener("input", (e) => {
        this.value = parseInt((<HTMLSelectElement>e.currentTarget).value);
      });
      if(typeof this.action === "function") {
        this.input_elm.addEventListener("input", (e) => {
          this.action(parseInt((<HTMLSelectElement>e.currentTarget).value));
        });
      }
    }
  }

  clearList() {
    this.input_elm.innerHTML = "";
  }

  clearValue() {
    this.input_elm.value = "0";
    this.value = 0;
  }

  checkCondition1(a, b) {
    return (a == b);
  }

  testAnd(conditions) {
    var counter = 0;
    conditions.forEach((condition) => {
      this.parent.fields.forEach((field) => {
        if(condition.key == field.key) {
          if(this.checkCondition1(condition.value, field.value)) {
            ++counter;
          }
        }
      })
    });
    return (counter == conditions.length);
  }

  getField(fields, key) {
    for(let i=0; i < fields.length; ++i) {
      if(fields[i].key == key) {
        return fields[i];
      }
    }
  }

  getValue(): string | number {
    if(!isNaN(this.input_elm.value)) {
      return parseInt(this.input_elm.value);
    }
    return this.input_elm.value;
  }

  applyCondition(condition) {
    this.active = true;
    this.show();
    this.clearList();
    this.generateList(condition.list);
    this.clearValue();
    if(condition.focus) {
      this.input_elm.focus();
    }
  }
}