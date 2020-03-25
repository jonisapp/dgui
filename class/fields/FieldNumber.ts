import { field_descriptor } from './interfaces';
import { Form } from '../Form';
import { InputField } from './InputField';

export class FieldNumber extends InputField {
step: number;

  constructor(attr: field_descriptor, parent?: Form) {
    super(attr, parent);
    this.step = parseFloat(attr.step);
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

  applyCondition(condition): void {
    this.show();
    this.clearValue();
    if(condition.focus) {
      this.focus();
    }
  }

  getValue(): number {
    return (this.step < 1) ? parseFloat(this.input_elm.value) : parseInt(this.input_elm.value);
  }

  clearValue(): void {
    this.input_elm.value = this.initValue;
  }
}
