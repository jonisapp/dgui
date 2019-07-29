import { Form } from './Form';

export class BlazeTemplate {
  elm: any;
  parent: Form;
  private template: any;
  private blazeInstance: any;
  private templateWidth: number;
  private templateHeight: number;

  constructor(template, parent) {
    this.template = template;
    this.parent = parent;
    this.elm = document.createElement("div");
    this.render();
    ["templateWidth", "templateHeight"].forEach((attr) => {
      if(typeof parent.options !== "undefined") {
        if(typeof parent.options[attr] !== "undefined") {
          this[attr] = parent.options[attr];
        }
      }
    });
    if(this.templateWidth) { this.elm.style.width = this.templateWidth + "px"; }
    if(this.templateHeight) { this.elm.style.height = this.templateHeight + "px"; }
  }

  render() {
    if(this.blazeInstance) { this.remove(); }
    this.blazeInstance = Blaze.render(this.template, this.elm);
  }

  instance() {
    return this.blazeInstance._templateInstance;
  }

  remove() {
    Blaze.remove(this.blazeInstance);
  }
}
