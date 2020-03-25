import { AbstractField } from './AbstractField';

export class FieldDuration extends AbstractField {
  input_elm: HTMLInputElement;
  inputs_elm: Array<HTMLInputElement>;

  constructor(attr, parent) {
    super(attr, parent);
    this.inputs_elm = [];
    this.initLabel();
    this.label_elm.style.marginTop = "0px";
    this.input_elm = document.createElement("input");
    this.input_elm.setAttribute("type", "hidden");
    if(typeof this.initValue !== "undefined") {
      var duration_arr = this.initValue.split(":");
      duration_arr.forEach((val) => {
      val = parseInt(val);
     });
    }
    [{max: "100", min: "0"}, {max: "60", min: "-1"}].forEach((input_attr, i) => {
      let input_xx = document.createElement("input");
      input_xx.type = "number"; input_xx.min = "0"; input_xx.setAttribute("class", "dgui-field-text");
      input_xx.style.marginTop = "-2px"; //////////////////////////////temporaire pour ajuster la hauteur quand plusieurs champs horizontalement
      input_xx.style.marginBottom = "5px";
      input_xx.style.borderColor = this.parent.colorSet.secBrdColor;
      input_xx.setAttribute("step", "01");
      input_xx.setAttribute("max", input_attr.max);
      input_xx.setAttribute("min", input_attr.min);
      input_xx.setAttribute("placeholder", (i == 0) ? "hh" : "mm");
      input_xx.value = "";
      if(typeof duration_arr !== "undefined") {
        input_xx.value = duration_arr[i];
      }
      input_xx.addEventListener("input", (e) => {
        this.updateDuration();
      });
      this.inputs_elm.push(input_xx);
    });
    // -----------------
    this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
    // ------------------ A mettre en commun avec width group V
    let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
    this.inputs_elm.forEach((input_elm) => {
      let elm = document.createElement("div");
      elm.setAttribute("class", "dgui-form-pannel-element");
      elm.setAttribute("style", "flex: 1; padding-left: 2px; padding-right: 2px;");
      elm.appendChild(input_elm);
      hLayout_elm.appendChild(elm);
    });
    if(this.label) { let label_elm = document.createElement("label"); label_elm.textContent = this.label; label_elm.setAttribute("style", "margin-bottom: 0px; padding-top: 10px; margin-left: 5px;"); this.elm.appendChild(label_elm); }
    this.elm.appendChild(hLayout_elm);
  }

  updateDuration(): void {
    if(this.inputs_elm[0].value == "") {
      this.inputs_elm[0].value = "0";
    }
    if(this.inputs_elm[1].value == "60") {
      this.inputs_elm[1].value = "0";
      this.inputs_elm[0].value =  (parseInt(this.inputs_elm[0].value)+1).toString();
    }
    else if(this.inputs_elm[1].value == "-1") {
      if(this.inputs_elm[0].value != "0") {
        this.inputs_elm[1].value = "59";
        this.inputs_elm[0].value =  (parseInt(this.inputs_elm[0].value)-1).toString();
      }
      else {
        this.inputs_elm[1].value = "0";
      }
    }
    let hh = (this.inputs_elm[0].value.length == 1) ? "0" + this.inputs_elm[0].value : this.inputs_elm[0].value;
    let mm = (this.inputs_elm[1].value.length == 1) ? "0" + this.inputs_elm[1].value : this.inputs_elm[1].value;
    this.input_elm.value = hh + ":" + ((mm) ? mm : "00");
    this.value = this.input_elm.value;
  }

  getValue() {
    return this.value;
  }
}