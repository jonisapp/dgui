import { AbstractField } from './AbstractField';

import { field_descriptor } from './interfaces';
import { Form } from '../Form';

import { splitWhereOneOfSeperators} from '../../utility';
import { tr } from '../../translations';

export class FieldDate extends AbstractField {
  /*                                              - Définition -                                        */
    date_units: Array<string>;
    date_comps_indexes: {y: number, m: number, d: number};
    inputs_elm: Array<HTMLInputElement>;
    input_elm: HTMLInputElement;
    labels_elm: Array<HTMLLabelElement>;
  
    constructor(attr: field_descriptor, parent?: Form) {
      super(attr, parent);
      this.required = true;
      this.generateDateField(attr);
      this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
  
      let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
      for(let i = 0; i < this.inputs_elm.length; ++i) {
        let date_layer = document.createElement("div");
        date_layer.setAttribute("class", "dgui-form-pannel-element");
        date_layer.setAttribute("style", "padding-left: 5px; padding-right: 5px; flex: 1;");
        date_layer.style.flex = (this.date_units[i] == "YYYY") ? "2" : "1";
        if(!attr.label) { date_layer.appendChild(this.labels_elm[i]); }
        date_layer.appendChild(this.inputs_elm[i]);
        if(!this.label) { this.elm.appendChild(date_layer); }
        else { hLayout_elm.appendChild(date_layer) }
      }
      if(this.label) { this.elm.appendChild(this.label_elm); this.elm.appendChild(hLayout_elm); }
      this.elm.style.paddingLeft = "15px"; this.elm.style.paddingRight = "15px";
    }
  
    updateDateValue(inputs_elm) {
      var that = this;
      inputs_elm.forEach((elm, i) => {
        if(elm.value.length == 1) { elm.value = "0" + elm.value; }
        if(elm.dataset.type == "DD" || elm.dataset.type == "dd") { that.date_comps_indexes.d = i; }
        else if(elm.dataset.type == "MM" || elm.dataset.type == "mm") { that.date_comps_indexes.m = i; }
        else { that.date_comps_indexes.y = i; }
      });
      let dIElm = inputs_elm;
      let y_value = (dIElm[this.date_comps_indexes.y].value.length == 4) ? dIElm[this.date_comps_indexes.y].value : "20"+dIElm[this.date_comps_indexes.y].value;
      this.value = y_value + "-" + dIElm[this.date_comps_indexes.m].value + "-" + dIElm[this.date_comps_indexes.d].value;
      this.input_elm.value = this.value;
    }
  
    updateDaysInMonth(month: string) {
      let tmp_date = new Date(2019, parseInt(month), 15);
      tmp_date = new Date(tmp_date.getFullYear(), tmp_date.getMonth(), 0);
      this.inputs_elm[this.date_comps_indexes.d].max = tmp_date.getDate().toString();
      if(parseInt(this.inputs_elm[this.date_comps_indexes.d].value) > parseInt(this.inputs_elm[this.date_comps_indexes.d].max)) {
        this.inputs_elm[this.date_comps_indexes.d].value = this.inputs_elm[this.date_comps_indexes.d].max;
      }  
    }
  
    generateDateField(field) {
      var that = this;
      if(!field.format) {field.format = "YYYY.MM.AA"}
      this.date_comps_indexes = {y: null, m: null, d: null};
      let date = (field.initValue) ? new Date(field.initValue) : new Date();
      var initYearValue = date.getFullYear().toString();
      var initMonthValue = (date.getMonth()+1).toString();
      initMonthValue = (initMonthValue.length == 2) ? (initMonthValue) : ("0" + initMonthValue);
      var initDayValue = date.getDate().toString(); initDayValue = (initDayValue.length == 2) ? initDayValue : ("0" + initDayValue);
      this.initValue = initYearValue + "-" + initMonthValue + "-" + initDayValue;
      this.value = this.initValue;
      let format_arr = splitWhereOneOfSeperators(field.format, ["-",".",":"," ", ","]);
      this.input_elm = document.createElement("input"); this.input_elm.setAttribute("type", "hidden");
      this.input_elm.value = this.initValue;
      if(field.label) {
        this.label_elm = document.createElement("label"); this.label_elm.textContent = field.label;
        this.label_elm.setAttribute("style", "width: 100%; margin-bottom: 0px; margin-left: 5px; margin-top: 10px");
      }
      this.inputs_elm = []; this.labels_elm = []; this.date_units = [];
      format_arr.forEach((unit: string, index) => {
        let input = document.createElement("input");
        input.type = "number"; input.min = "1"; input.setAttribute("class", "dgui-field-text");
        input.style.marginTop = "-2px"; //////////////////////////////temporaire pour ajuster la hauteur quand plusieurs champs horizontalement
        input.style.borderColor = that.parent.colorSet.secBrdColor;
        unit = unit.toUpperCase();
        input.setAttribute("placeholder", tr.plcldr(unit));
        if(!this.label) { var label = document.createElement("label") };
        let label_str = "";
        var today = new Date();
        switch(unit) {
          case "YYYY": case "YY":
            this.date_comps_indexes.y = index;
            if(unit == "YYYY") {
              input.value = initYearValue; input.min = "1900";
            }
            else if(unit == "YY") {
              input.value = initYearValue.substr(2,2); input.min = "1900";
            }
            label_str = tr.lbl("year"); break;
          case "MM":
            this.date_comps_indexes.m = index;
            input.value = initMonthValue; input.max = "12";
            label_str = tr.lbl("month"); 
            input.addEventListener("input", (e) => {
              that.updateDaysInMonth((<HTMLInputElement>e.currentTarget).value);
            }); break;
          case "DD":
            this.date_comps_indexes.d = index;
            input.value = initDayValue;
            label_str = tr.lbl("day"); break;
        }
        if(!this.label) { label.textContent = label_str; }
        input.setAttribute("data-type", unit);
        input.addEventListener("input", () => { that.updateDateValue(that.inputs_elm); });
        this.date_units.push(unit);
        if(this.label) { this.labels_elm.push(label); }
        this.inputs_elm.push(input);
      });
      that.updateDaysInMonth(this.inputs_elm[this.date_comps_indexes.m].value);
    }
  }