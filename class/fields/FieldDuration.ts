import { AbstractField } from './AbstractField';

export class FieldDuration extends AbstractField {
  input_elm: HTMLInputElement;
  inputs_elm: Array<HTMLInputElement>;

  constructor(attr, parent) {
    super(attr, parent);
    var that = this;
    this.inputs_elm = [];
    this.initLabel();
    this.label_elm.style.marginTop = "0px";
    this.input_elm = document.createElement("input");
    this.input_elm.setAttribute("type", "hidden");
    this.input_elm.value = (this.initValue) ? this.initValue : "";
    if(typeof this.initValue !== "undefined") {
     var duration_arr = this.initValue.split(":");
     duration_arr.forEach((val) => {
      val = parseInt(val);
     });
    }
    [{max: "100"}, {max: "59"}].forEach((input_attr, i) => {
      let input_hh = document.createElement("input");
      input_hh.type = "number"; input_hh.min = "0"; input_hh.setAttribute("class", "dgui-field-text");
      input_hh.style.marginTop = "-2px"; //////////////////////////////temporaire pour ajuster la hauteur quand plusieurs champs horizontalement
      input_hh.style.borderColor = that.parent.colorSet.secBrdColor;
      input_hh.setAttribute("step", "01");
      input_hh.setAttribute("max", input_attr.max);
      input_hh.value = "0";
      if(typeof duration_arr !== "undefined") {
        input_hh.value = duration_arr[i];
      }
      input_hh.addEventListener("input", (e) => {
        let hh = (that.inputs_elm[0].value.length == 1) ? "0" + that.inputs_elm[0].value : that.inputs_elm[0].value;
        let mm = (that.inputs_elm[1].value.length == 1) ? "0" + that.inputs_elm[1].value : that.inputs_elm[1].value;
        that.input_elm.value = hh + ":" + mm;
      });
      this.inputs_elm.push(input_hh);
    });
    // -----------------
    this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
    // ------------------ A mettre en commun avec width group V
    let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
    this.inputs_elm.forEach((input_elm) => {
      let elm = document.createElement("div");
      elm.setAttribute("class", "dgui-form-pannel-element");
      elm.setAttribute("style", "flex: 1; padding-left: 2px; padding-right: 2px");
      elm.appendChild(input_elm);
      hLayout_elm.appendChild(elm);
    });
    if(this.label) { let label_elm = document.createElement("label"); label_elm.textContent = this.label; label_elm.setAttribute("style", "margin-bottom: 0px; margin-top: 0px; margin-left: 5px;"); this.elm.appendChild(label_elm); }
    this.elm.appendChild(hLayout_elm);
  }
}