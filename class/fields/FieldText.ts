import { InputField } from './InputField';
import { Form } from '../Form';
import { field_descriptor } from './interfaces';

export class FieldText extends InputField {
  /*                                              - Définition -                                        */
    placeholder: string;
  
    constructor(attr: field_descriptor, parent?: Form) {
      super(attr, parent);
      //this.initValue = (attr.initValue) ? attr.initValue : "";
      this.input_elm.setAttribute("autocorrect", "off");
      this.input_elm.setAttribute("spellcheck", "false");
      if(attr.placeholder) this.setPlaceholder(attr.placeholder);
    }

    setPlaceholder(placeholder: string) {
      this.input_elm.setAttribute("placeholder", (typeof placeholder !== "undefined") ? placeholder : "");
    }

    applyCondition(condition) {
      this.show();
      if(condition.params && typeof condition.placeholder === "function") {
        this.setPlaceholder(condition.placeholder(...condition.paramsValues));
      }
      else if(typeof condition.placeholder === "string") {
        this.setPlaceholder(condition.placeholder);
      }
    }
  }