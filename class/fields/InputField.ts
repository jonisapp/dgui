import { AbstractField } from './AbstractField';

export class InputField extends AbstractField {
  /*                                              - Définition -                                        */
    input_elm: HTMLInputElement;
    action: Function;
  
    constructor(attr: field_descriptor, parent?: Form) {
      super(attr, parent);
      this.initLabel();
      this.input_elm = document.createElement("input");
      this.input_elm.setAttribute("type", (attr.type) ? attr.type : "text");
      this.input_elm.setAttribute("class", "dgui-field-text");
      this.input_elm.value = (this.value) ? this.value : "";
      if(this.parent) this.input_elm.style.borderColor = this.parent.colorSet.secBrdColor;
      this.input_elm.style.height = "36px";
      if(this.label) this.elm.appendChild(this.label_elm);
      this.elm.setAttribute("class", "dgui-form-pannel-element");
      this.elm.appendChild(this.input_elm);
  
      if(attr.max) {
        this.input_elm.setAttribute("maxlength", attr.max);
      }
  
      if(attr.align) {
        this.input_elm.style.textAlign = attr.align;
      }
  
      if(typeof this.action === "function") {
        this.input_elm.addEventListener("input", (e) => {
          this.action(e.currentTarget.value);
        });
      }
    }
  }