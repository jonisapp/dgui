import { field_descriptor } from './interfaces';

import { InputField } from './InputField';

export class FieldNumber extends InputField {
  constructor(attr: field_descriptor, parent?: Form) {
    super(attr, parent);
    this.input_elm.setAttribute("step", (attr.step) ? attr.step : 1);
    this.input_elm.setAttribute("min", "0");
    if(!this.value) {
      this.input_elm.value = "0";
    }
  }
}
