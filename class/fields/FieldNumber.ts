import { field_descriptor } from './interfaces';
import { Form } from '../Form';
import { InputField } from './InputField';

export class FieldNumber extends InputField {
  constructor(attr: field_descriptor, parent?: Form) {
    super(attr, parent);
    this.input_elm.value = this.value;
    this.input_elm.setAttribute("step", (attr.step) ? attr.step : "1");
    this.input_elm.setAttribute("min", "0");
    this.input_elm.addEventListener("blur", (e) => {
      let value = (<HTMLInputElement>e.currentTarget).value;
      if(value.includes(".") || value.includes(",")) {
        if(value.includes(".")) {
          var value_arr = value.split(".");
        }
        else if(value.includes(",")) {
          var value_arr = value.split(",");
        }
        value = value_arr.join(".");
      }
      this.input_elm.value = value;
    });
    // if(!this.value) {
    //   this.input_elm.value = "0";
    // }
  }

  applyCondition(condition) {
    this.show();
    this.clearValue();
    if(condition.focus) {
      this.focus();
    }
  }

  clearValue() {
    this.input_elm.value = this.initValue;
  }
}
