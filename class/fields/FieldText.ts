import { InputField } from './InputField';

export class FieldText extends InputField {
  /*                                              - Définition -                                        */
    placeholder: string;
  
    constructor(attr: field_descriptor, parent?: Form) {
      super(attr, parent);
      //this.initValue = (attr.initValue) ? attr.initValue : "";
      this.input_elm.setAttribute("autocorrect", "off");
      this.input_elm.setAttribute("spellcheck", "false");
      if(attr.placeholder) this.input_elm.setAttribute("placeholder", attr.placeholder);
    }
  }