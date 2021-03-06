import { tr } from '../translations';
import { dguiUserInterface } from '../state';

import { setDefaultCursor } from '../utility';

import { Modal } from './Modal';
import { ColorSet } from './Colorset';
import { Button } from './Button';
import { MDI } from './MDI';
import { BlazeTemplate } from './BlazeTemplate';

import { AbstractField } from './fields/AbstractField';
import { InputField } from './fields/InputField';
import { FieldText } from './fields/FieldText';
import { FieldNumber } from './fields/FieldNumber';
import { FieldDate } from './fields/FieldDate';
import { FieldDuration } from './fields/FieldDuration';
import { FieldSelect } from './fields/FieldSelect';
import { FieldSwitch } from './fields/FieldSwitch';

import { confirm, modal, contextMenu} from '../dgui.ts';

// import { field_condition, field_radioButton, field_descriptor } from '../class/fields/interfaces';

/* --------------------------------- Interfaces Form ---------------------------------------------*/

export interface formPannel_options {
  mode?: "new" | "edit";
  color?: string;
  maxWidth?: number;
  maxHeight?: number;
  containerWidth?: number;
  shape?: "rounded" | "squared";
  allFieldsMandatory?: boolean; //à implémenter
  initValues?: any;
}

export interface button {
  action: string;
  value: string;
  BSClass: string;
}

export interface formPannel_fieldGroup {
  name: string;
  fields: Array<Field>
}

/* --------------------------------- CLASS Form --------------------------------------------------*/

export class Form {
  name: string;
  id: string;
  type: string
  parent: Modal;
  title?: string;s
  rTitle?: string;
  fields: Array<Field>;
  footer: Array<button>;
  options: formPannel_options;
  // user & controller
  loader_elm: HTMLImageElement;
  errorMessage_elm: any;
  MDI: MDI;
  template: BlazeTemplate;
  footer_elm: HTMLDivElement;
  // controller
  elm: HTMLDivElement;
  colorSet: ColorSet;
  groups: Array<formPannel_fieldGroup>;
  conditionalFields: Array<Field>;
  toHide: any;

  constructor(properties, parent) {
    console.log(properties);
    var that = this;
    for(let property in properties) {
      this[property] = properties[property];
    }

    if(this.name) {
      dguiUserInterface.dguiObjects[this.name] = this;
    }

    this.parent = parent;
    this.groups = []; this.conditionalFields = [];

    if(!this.options) {
      this.options = {};
    }
    if(this.rTitle && this.options.mode) {
      if(this.options.mode == "new") {
        this.title = tr.title("new") + " " + this.rTitle;
      }
      else if(this.options.mode == "edit") {
        this.title = tr.title("edit") + " " + this.rTitle;
      }
      else {
        this.title = this.rTitle;
      }
    }
    this.fields = [];

    if(!this.options.shape) {this.options.shape = "rounded";}
    if(!this.options.color) {this.options.color = "#eeeeee";}
    this.colorSet = new ColorSet(this.options.color);

    this.elm = document.createElement("div");
    this.elm.setAttribute("style", "background-color: #B9BAB8; padding: 5px; padding-top: 0px; border-radius: 7px; border: 1px solid #B2B2B2;");
    this.elm.style.backgroundColor = this.colorSet.thrColor;
    this.elm.addEventListener("keydown", function(e) {
      if(e.keyCode == 13) {
        that.submit();
      }
    });

    if(typeof this.MDI !== "undefined") {
      this.MDI = new MDI(this.MDI, this);
    }
    
    let scrollElm = document.createElement("div");
    //scrollElm.style.height = this.options.containerHeight-60+"px";
    scrollElm.style.overflow = "auto";
    let fields = properties.fields;
    this.generateFields(that, fields, scrollElm);
    this.initConditionalFields(this);
    this.elm.appendChild(scrollElm);

    this.initDisplay();
    // initialisation
    let formPannelHeader = document.createElement("div");
    formPannelHeader.setAttribute("style", "padding: 7px; padding-top: 4px;");
    let formPannelTitle = document.createElement("div");
    setDefaultCursor(formPannelTitle);
    formPannelTitle.setAttribute("style", "display: inline-block; margin-top: 3px; font-size: 18px; font-weight: bold; color: rgba(0, 0, 0, 0.8);");
    formPannelTitle.textContent = this.title;
    this.loader_elm = document.createElement("img");
    this.loader_elm.setAttribute("src", "/icons/loader.svg");
    this.loader_elm.setAttribute("style", "display: none; margin-left: 10px; height: 21px;");
    formPannelHeader.appendChild(formPannelTitle);
    formPannelHeader.appendChild(this.loader_elm);
    if(this.parent instanceof Modal) {
      let close_button_elm = document.createElement("div");
      close_button_elm.setAttribute("class", "dgui-modal-close");
      close_button_elm.setAttribute("style", "color: " + this.colorSet.fontColor);
      close_button_elm.addEventListener("click", () => {
        that.quit();
      });
      let close_svg_elm = document.createElement("i");
      close_svg_elm.setAttribute("class", "fas fa-times");
      close_button_elm.appendChild(close_svg_elm);
      formPannelHeader.appendChild(close_button_elm);
    }
    else {
      if(this.toHide) {
        this.toHide.style.display = "none";
      }
    }
    var formPannelBody = document.createElement("div");
    this.errorMessage_elm = document.createElement("div");
    this.errorMessage_elm.setAttribute("style", "display: none; background-color: #e26c6c; color: white; border-radius: 3px; font-weight: normal; margin: 5px;padding: 5px;");
    if(this.options.containerWidth) {
      this.errorMessage_elm.style.width = this.options.containerWidth+150+"px";
    }
    formPannelBody.appendChild(this.errorMessage_elm);
    if(typeof this.MDI !== "undefined") {
      formPannelBody.appendChild(this.MDI.elm);
    }
    if(this.template) {
      this.template = new BlazeTemplate(this.template, this);
      formPannelBody.appendChild(this.template.elm);
    }
    formPannelBody.setAttribute("style", "padding: 10px; border-radius: 7px; text-align: center;");
    if(this.template) { formPannelBody.style.padding = "0px"; }
    formPannelBody.style.backgroundColor = this.colorSet.prmColor;
    if(this.options.shape == "squared") {
      formPannelBody.style.borderRadius = "0px";
    }
    if(typeof this.fields !== "undefined") {
      var that = this;
      // this.fields.map(function(field, index) {
      //   if(field.type != "choice") {
      //     (function(field, index, that){
      //       field.input_elm.addEventListener("keydown", function(e) {
      //         if(e.keyCode == 9 && (index < that.fields.length-1)) {
      //           e.preventDefault();
      //           that.fields[index+1].input_elm.focus();
      //         }
      //       });
      //     })(field, index, that);
      //   }
      //   formPannelBody.appendChild(field.elm);
      // });
      formPannelBody.appendChild(scrollElm);
    }

    this.initFooter();

    if(typeof properties.elm !== "undefined") {
      formPannelBody.appendChild(properties.elm);
    }

    formPannelBody.appendChild(this.footer_elm);
    this.elm.appendChild(formPannelHeader);
    this.elm.appendChild(formPannelBody);
  }

  generateFields(fieldsContainer, fields, scrollElm) {
    var that = this;
    if(fields) {
      fields.forEach(function(field_s_descriptor) {
        if(Array.isArray(field_s_descriptor)) {
          var formPannelLayout = document.createElement("div");
          formPannelLayout.setAttribute("class", "dgui-form-pannel-layout");
          var reduce_padding = (field_s_descriptor.length > 1) ? true : false;
          if(reduce_padding) {
            formPannelLayout.style.paddingLeft = 15+"px";
            formPannelLayout.style.paddingRight = 15+"px";
          }
          var fields_inputs = [];
          var label_count = 0;
          field_s_descriptor.forEach(function(field) {
            if(field.label) { ++label_count; }
            field = that.generateField(fieldsContainer, field);
            fields_inputs.push({input: field.type === 'switchGroup' ? field.elm : field.input_elm, max: (field.max) ? field.max : null});
            if(reduce_padding) {
              field.elm.style.paddingLeft = 5+"px";
              field.elm.style.paddingRight = 5+"px";
            }
            formPannelLayout.appendChild(field.elm);
          });
          // unique label for horizontally layered fields
          if(label_count == 1) {
            field_s_descriptor
          }
          // Set field max attribut
          for(let i = 0; i < fields_inputs.length; ++i) {

              if(fields_inputs[i].max) {
                fields_inputs[i].input.addEventListener("input", (e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                });
              }
              fields_inputs[i].input.addEventListener("keyup", (e) => {
                if(fields_inputs[i].max) {
                  if(i < fields_inputs.length-1 && e.currentTarget.value.length == fields_inputs[i].max) {
                    fields_inputs[i+1].input.focus();
                  }
                }
                if(i >= 1 && (e.keyCode == 8 && e.currentTarget.value.length == 0)) {
                  fields_inputs[i-1].input.focus();
                }
              });

          }
          scrollElm.appendChild(formPannelLayout);
        }
        else {
          let field = that.generateField(fieldsContainer, field_s_descriptor);
          scrollElm.appendChild(field.elm);
        }
      });
    }
  }

  fieldGroup(field) {
    if(field.group) {
      var group_index= -1;
      this.groups.forEach((group, i) => {
        if(group.name == field.group) {
          group_index = i;
        }
      });
      if(group_index != -1) {
        this.groups[group_index].fields.push(field);
      }
      else {
        this.groups.push({name: field.group, fields: []});
        this.groups.forEach((group) => {
          if(group.name == field.group) {
            group.fields.push(field);
          }
        })
      }
    }
  }

  generateField(fieldsContainer, field_descriptor) {
    var field = null;
    switch(field_descriptor.type) {
      case "text": case undefined: field = new FieldText(field_descriptor, this); break;
      case "password": field = new InputField(field_descriptor, this); break;
      case "number": field = new FieldNumber(field_descriptor, this); break;
      case "date": field = new FieldDate(field_descriptor, this); break;
      case "duration": field = new FieldDuration(field_descriptor, this); break;
      case "select": field = new FieldSelect(field_descriptor, this); break;
      case "switch": field = new FieldSwitch(field_descriptor, this); break;
      default: field = new Field(field_descriptor, this);
    }
    // group
    this.fieldGroup(field);
    // conditionnal field
    if(typeof field.condition !== "undefined") {
      if(typeof field.condition === "boolean") {
        if(field.condition === false) {
          field.elm.style.display = "none";
        }
      }
      else {
        this.conditionalFields.push(field);
      }
    }
    fieldsContainer.fields.push(field);
    return field;
  }

  convertCondition(conditions_arr, condition, i) {
    if(!condition.key) {
      var new_condition = {};
      for(let k in condition) {
        new_condition["key"] = k;
        new_condition["value"] = condition[k];
      }
      conditions_arr.$and[i] = new_condition;
    }
  }

  convertUniqueCondition(condition) {
    if(!condition.$eq.key) {
      var new_condition = {};
      for(let k in condition.$eq) {
        new_condition["key"] = k;
        new_condition["value"] = condition.$eq[k];
      }
      condition.$eq = new_condition;
    }
    return condition;
  }

  getField(fieldKey) {
    for(let i=0; i < this.fields.length; ++i) {
      if(this.fields[i].key == fieldKey) {
        return this.fields[i];
      } 
    }
  }

  getFields(fieldKeys_arr) {
    let fields = [];
    for(let i=0; i < fieldKeys_arr.length; ++i) {
      fields.push(this.getField(fieldKeys_arr[i]));
    }
    return fields;
  }

  initConditionalFields(fieldsContainer) {
    var that = this;
    fieldsContainer.conditionalFields.forEach((cf) => {
      if(Array.isArray(cf.condition)) {
        var targetFields_keys = [];
        cf.condition.forEach((cond) => {
          var operator = null;
          if(cond.$eq) operator = "$eq";
          else if(cond.$and) operator = "$and";
          else if(cond.$or) operator = "$or";
          if(operator) {
            if(operator == "$eq") {
              cond = that.convertUniqueCondition(cond);
              if(!targetFields_keys.includes(cond.$eq.key)) {
                targetFields_keys.push(cond.$eq.key);
              }
            }
            else {
              cond[operator].forEach((cond_part, i) => {
                that.convertCondition(cond, cond_part, i);
                if(!targetFields_keys.includes(cond[operator][i].key)) {
                  targetFields_keys.push(cond[operator][i].key);
                }
              });
            }
          }
        });
        fieldsContainer.fields.forEach((field) => {
          if(targetFields_keys.includes(field.key)) {
            cf.testConditions(targetFields_keys);
            field.input_elm.addEventListener("input", (e) => {
              cf.testConditions(targetFields_keys);
            })
          }
        });
      }
      else {
        fieldsContainer.fields.forEach((field, i) => {
          if(field.key == cf.condition.key) {
            cf.check_condition(field);
            if(!["date", "switch", "switchGroup"].includes(field.type)) {
              field.input_elm.addEventListener("input", (e) => {
                cf.check_condition(field);
              });
            }
            else if(field.type == "switch") {
              field.conditionalFields.push(cf);
            }
            else if(field.type == "switchGroup") {
              field.inputs_elm.forEach((input_elm) => {
                input_elm.addEventListener("click", (e) => {
                  cf.check_condition(field);
                });
              });
            }
            else {
              field.inputs_elm.forEach((input_elm) => {
                input_elm.addEventListener("input", (e) => {
                  cf.check_condition(field);
                });
              });
            }
          }
        });
      }
    })

  }
  
  initDisplay() {
    if(this.options) {
      for(let attribut in this.options) {
        switch(attribut) {
          case "width":
            this.elm.style.width = this.options[attribut]+"px"; break;
          case "height":
            this.elm.style.height = this.options[attribut]+"px"; break;
          case "maxWidth":
            this.elm.style.maxWidth = this.options[attribut]+"px"; break;
          case "maxHeight":
            this.elm.style.maxHeight = this.options[attribut]+"px"; break;
          case "containerWidth":
            this.elm.style.width = this.options[attribut]+"px"; break;
        }
      }
    }
  }

  initFooter() {
    var that = this;

    if(typeof this.footer === "undefined") {
      this.footer = [
        {action: "submit", value: tr.btn("valid"), BSClass: "btn-success"},
        {action: "abort", value: tr.btn("cancel"), BSClass: "btn-warning"}
      ];
    }
    this.footer_elm = document.createElement("div");
    this.footer_elm.setAttribute("class", "form-pannel-footer");
    if(this.template) { this.footer_elm.style.marginTop = "10px"; }
    var that = this;
    this.footer.forEach((button_descriptor) => {
      if(typeof button_descriptor.type === "undefined") {
        var button = new Button(that, button_descriptor.value, button_descriptor.BSClass);
        if(typeof button_descriptor.action === "string") {
          button.setAction(button_descriptor.action);
        }
        else if(typeof button_descriptor.action === "function") {
          button.setFunction(button_descriptor.action);
        }
      }
      else {
        var button = new Field(button_descriptor);
      }
      that.footer_elm.appendChild(button.elm);
    });
  }

  init() {
    if(typeof this.fields !== "undefined") {
      for(let i=0; i<this.fields.length; ++i) {
        if(this.fields[i].type=="text") {
          this.fields[i].input_elm.setAttribute("tabindex", "-1");
          this.fields[i].input_elm.focus();
          break;
        }
      }
    }
  }

  quit() {
    if(this.template) { this.template.remove(); }
    if(this.toHide) { this.toHide.style.display = "block"; }
    this.parent.quit();
  }

  submit() {
    //animation
    this.loader_elm.style.display = "inline";
    var that = this;
    let values = [];
    if(this.fields) {
      values.push(this.submitFields(this.fields));
    }
    if(this.groups) {
      if(this.groups.length > 0) {
        values.push(this.submitGroups(this.groups));
      }
    }
    if(this.MDI) {
      this.MDI.sections.map(function(section) {
        if(typeof section.key !== "undefined") {
          if(typeof section.fields !== "undefined") {
            let objet = {};
            objet[section.key] = that.submitFields(section.fields);
            if(section.onSubmit) {
              if(typeof section.onSubmit == "function") {
                section.promise = that.returnPromise(objet, section);
              }
              else {
                console.error(new Error("The onSubmit parameter should be a function"));
              }
            }
            else {
              values.push(objet);
            }
          }
        }
        else {
          values.push(that.submitFields(section.fields));
        }
      });
      let promises = [];
      this.MDI.sections.forEach((section) => {
        if(section.promise) {
          promises.push(section.promise);
        }
      });
      if(promises.length > 0) {
        Promise.all(promises).then(() => {that.quit();}).catch((err) => { that.errorMessage(err.message); this.loader_elm.style.display = "none"; });
      }
    }
    let proper_values = this.properType(values);
    if(Object.keys(proper_values).length !== 0) {
      this.parent.submit({value: proper_values, end: function() {
        that.parent.quit();
      }, errorMessage: function(message) {
        that.loader_elm.style.display = "none";
        that.errorMessage_elm.textContent = message;
        that.errorMessage_elm.style.display = "block";
      }, confirm: function(err, callback) {
        that.loader_elm.style.display = "none";
        confirm(err.reason, (res) => {
          if(res) {
            callback(res);
          }
        }, err.error);
      }, serverError: function(err) {
        if(err) {
          modal({
            title: tr.title("serverError"),
            fields: [
              {type: "message", message: tr.msg("serverError")},
              {type: "message", message: "<div style='background-color: white; width: 100%; padding: 5px; color: red'>" + err + "</div>"}
            ], footer: [{value: tr.btn("ok"), action: "quit", BSClass: "btn-success"}],
            options: {width: 600, color: "#ff5151"}
          }, ()=> {});
        }
      }, templateRender: (that.template) ? that.template.render : null});
    }
    else {
      this.quit();
    }
  }

  returnPromise(objet, section) { 
    return new Promise((resolve, reject) => {
      if(Object.keys(objet[section.key]).length !== 0) {
        section.onSubmit(objet[section.key], resolve, reject);
      }
      else {
        // Si l'objet est vide on ne le soumet pas à l'utilisateur pour validation
        resolve(true);
      }
    });
  }

  submitGroups(groups) {
    let values = []
    groups.forEach((group) => {
      group.fields.forEach((field) => {
        if(field.value) {
          let field_result = {};
          field_result[group.name] = field.key;
          values.push(field_result);
        }
      });
    });
    let proper_values = this.properType(values);
    return proper_values;
  }

  submitFields(fields) {
    var that = this;
    var values = [];
    fields.forEach(function(field) {
      if(!field.group) {
        that.submitField(field, values);
      }
    });
    let proper_values = this.properType(values);
    return proper_values;
  }

  submitField(field, values) {
    if(field.active) {
      let initValue = (typeof field.initValue !== "undefined") ? field.initValue : "";
      if(["number", "text", "password", "select", "duration", "date", "switch"].includes(field.type)) {
        // On ne soumet que les champs dont la valeur a été modifiée ou qui sont "requis"
        if((field.input_elm.value != initValue || field.required === true) && typeof field.key !== "undefined") {
          values.push(field.retrieve());
        }
      }
      else if(field.type == "switchGroup" || field.type == "selectMany") {
        // On ne soumet que les champs dont la valeur a été modifiée
        if((field.value != initValue || field.required === true) && !field.exclude) {
          // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
          if(typeof field.key !== "undefined") {
            let objSwitchField = {};
            objSwitchField[field.key] = (["selectMany"].includes(field.type)) ? field.value : parseInt(field.value);
            values.push(objSwitchField);
          }
          else {
            values.push(field.value);
          }
        }
      }
      else if(field.type == "choice") {
        for(let i = 0; i < field.radioButtons.length; ++i) {
          if(field.radioButtons[i].input_elm.checked) {
            if(typeof field.key !== "undefined") {
              let objRadioField = {};
              objRadioField[field.key] = field.radioButtons[i].value;
              values.push(objRadioField);
            }
            else {
              values.push(field.radioButtons[i].value);
            }
          }
        }
      }
    }
  }

  properType(values) {
    // Si le formulaire ne possède qu'un seul champs, on renvoie une valeur unique plutôt qu'un tableau.
    if(values.length == 1) {
      values = values[0];
    }
    // Si tous les champs du formulaires on un paramètre key, on renvoie un objet unique. 
    // !!! Le développeur doit être attentif à ce que chaque key soit différente.
    else if(values.every(function(field) {return typeof field === "object";})) {
      var obj = {};
      values.map(function(field) {
        for(let key in field) {
          obj[key] = field[key];
        }
      });
      return obj;
    }
    return values;
  }

  confirm() {
    if(this.parent instanceof Modal) this.parent.confirm();
  }

  abort() {
    if(this.parent instanceof Modal) this.parent.abort();
  }

  errorMessage(message) {
    this.errorMessage_elm.textContent = message;
    this.errorMessage_elm.style.display = "block";
  }
}

interface SelectManyItem {
  label: string;
  value: string;
}

class Field extends AbstractField {

  /*                                              - Définition -                                        */
  // user
  name: string;
  required: boolean;
  placeholder: string;
  size: number;
  list: Array<string> | Array<SelectManyItem>;
  condition: boolean | field_condition;
  BSClass: string;
  group: string;
  // constroller
  conditionalFields: Array<Field>;
  input_elm: any;
  labels_elm?: Array<HTMLLabelElement>;
  button_elm: HTMLButtonElement;
  switched?: boolean;
  // user & controller
  radioButtons: Array<field_radioButton>;

  /*                                              - Constructor -                                       */
  constructor(field: field_descriptor, parent?: Form) {
    super(field);
    var that = this;
    for(let attribut in field) {
      this[attribut] = field[attribut];
    }
    this.parent = parent ? parent : null;
    this.initValue = (field.initValue) ? field.initValue : "";
    if(field.group) {
      field.type = "switch";
    }
    this.exclude = (field.exclude) ? field.exclude : false;
    this.conditionalFields = [];
    if(this.parent.options.initValues) {
      for(let key in this.parent.options.initValues) {
        if(key == this.key) { this.initValue = this.parent.options.initValues[key]; }
      }
    }
    /*                                            - init according to type -                            */
    switch(field.type) {
      case "switchGroup":
        this.required = true;
        this.inputs_elm = [];
        this.initValue = (this.initValue) ? this.initValue : 0;
        this.value = this.initValue;
        field.list.forEach((switchLabel, i) => {
          let input_elm = document.createElement("div");
          input_elm.setAttribute("data-value", i);
          that.generateSwitch(input_elm, switchLabel);
          (<HTMLDivElement[]>that.inputs_elm).push(input_elm);
        });
        this.inputs_elm[this.initValue].setAttribute("class", "dgui-field-switch-selected");
        this.inputs_elm[this.initValue].style.backgroundColor = "#696969";
        this.inputs_elm[0].style.borderTopLeftRadius = "18px"; this.inputs_elm[0].style.borderBottomLeftRadius = "18px";
        this.inputs_elm[this.inputs_elm.length-1].style.borderTopRightRadius = "18px";
        this.inputs_elm[this.inputs_elm.length-1].style.borderBottomRightRadius = "18px";
        this.inputs_elm[this.inputs_elm.length-1].style.borderRightWidth = "1px";
        this.inputs_elm.forEach((input_elm, i) => {
          input_elm.addEventListener("click", (e: any) => {
            that.inputs_elm.forEach((ie) => {
              ie.setAttribute("class", "dgui-field-switch");
              ie.style.backgroundColor = that.parent.colorSet.secColor;
            });
            e.currentTarget.setAttribute("class", "dgui-field-switch-selected");
            e.currentTarget.style.backgroundColor = "#696969";
            that.value = e.currentTarget.dataset.value;
          });
        });
        break;
      // case "switch":
      //   this.input_elm = document.createElement("div");
      //   this.generateSwitch(this.input_elm, this.label);
      //   this.input_elm.setAttribute("class", (this.initValue) ? "dgui-field-switch-selected" : "dgui-field-switch");
      //   this.input_elm.style.backgroundColor = (this.initValue) ? "#696969" : this.parent.colorSet.secColor;
      //   this.input_elm.style.height = "36px";
      //   this.value = this.initValue;
      //   this.input_elm.addEventListener("click", (e) => {
      //     let elm = e.currentTarget;
      //     if(!that.value) {
      //       if(that.parent && that.group) {
      //         that.parent.groups.forEach((group) => {
      //           if(group.name == that.group) {
      //             group.fields.forEach((field) => {
      //               field.value = false;
      //               field.conditionalFields.forEach((cf) => {
      //                 cf.check_condition(field);
      //               });
      //               field.input_elm.setAttribute("class", "dgui-field-switch");
      //               field.input_elm.style.backgroundColor = that.parent.colorSet.secColor;
      //             });
      //           }
      //         });
      //       }
      //       elm.setAttribute("class", "dgui-field-switch-selected");
      //       elm.style.backgroundColor = "#696969";
      //       that.value = true;
      //     }
      //     else {
      //       elm.setAttribute("class", "dgui-field-switch");
      //       elm.style.backgroundColor = that.parent.colorSet.secColor;
      //       that.value = false;
      //     }
      //     that.conditionalFields.forEach((cf) => {
      //       cf.check_condition(that);
      //     });
      //     // action
      //     if(typeof that.action !== "undefined") {
      //       if(typeof that.action === "function") {
      //         that.action(that.value);
      //       }
      //     }
      //   });
      //   break;
      case "message":
        this.input_elm = document.createElement("div");
        setDefaultCursor(this.input_elm);
        this.input_elm.setAttribute("style", "margin-top: 10px");
        this.input_elm.style.textAlign = "left";
        this.input_elm.innerHTML = field.message; break;
      case "button":
        this.button_elm = document.createElement("button");
        this.button_elm.setAttribute("class", this.BSClass);
        this.button_elm.textContent = this.label;
        this.button_elm.addEventListener("click", (e) => { that.action }); break;
      case "selectMany":
        this.generateSelectManyField(field); break;
      case "choice":
        if(typeof this.radioButtons !== "undefined") {
          this.radioButtons.forEach((radioButton, i) => {
            radioButton.input_elm = document.createElement("input");
            let input_elm_id = "radio_"+field.name+"_"+ i;
            radioButton.input_elm.type = "radio";
            radioButton.input_elm.id = input_elm_id;
            radioButton.input_elm.name = field.name;
            radioButton.input_elm.value = radioButton.value;
            radioButton.label_elm = document.createElement("label");
            radioButton.label_elm.setAttribute("for", input_elm_id);
            radioButton.label_elm.style.marginLeft = "10px";
            radioButton.label_elm.textContent = radioButton.label;
          });
        } break;
    }
    if(field.htmlAttr) { this.setHtmlAttributs(field.htmlAttr); }
    if(field.cssAttr) { this.setCSSAttributs(field.cssAttr); }
    // if(typeof field.initValue !== "undefined" && field.type != "switchGroup") {
    //   this.input_elm.value = this.initValue;
    // }
    /*                                            - init display -                                      */
    if(!["message", "date", "switchGroup"].includes(field.type)) {
      this.elm.setAttribute("class", "dgui-form-pannel-element");
    }
    else if(field.type == "switchGroup") {
      this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
      this.elm.setAttribute("style", "padding-left: 15px; padding-right: 15px;");
    }
    else {
      this.elm.setAttribute("class", "dgui-form-pannel-element-message");
    }
    if(typeof field.disposition !== "undefined") {
      if(field.disposition == "horizontal") {
        this.elm.style.flexDirection = "row";
      }
    }
    if(field.type == "choice") {
      this.elm.style.textAlign = "left";
      this.radioButtons.map(function(radioButton) {
        let radioAndLabel = document.createElement("div");
        radioAndLabel.appendChild(radioButton.input_elm);
        radioAndLabel.appendChild(radioButton.label_elm);
        that.elm.appendChild(radioAndLabel);
      });
    }
    else if(field.type == "button") {
      this.elm.appendChild(this.button_elm);
    }
    else if(["text", "password", "select", "selectMany", "number"].includes(field.type)) {
      if(field.label) {
        this.elm.appendChild(this.label_elm);
      }
      this.elm.appendChild(this.input_elm);
    }
    else if(field.type == "switchGroup" || field.type == "duration") {
      let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
      this.inputs_elm.forEach((input_elm) => {
        let elm = document.createElement("div");
        elm.setAttribute("class", "dgui-form-pannel-element");
        elm.setAttribute("style", "flex: 1; padding-left: 0px; padding-right: 0px");
        elm.appendChild(input_elm);
        hLayout_elm.appendChild(elm);
      });
      if(this.label) { let label_elm = document.createElement("label"); label_elm.textContent = this.label; label_elm.setAttribute("style", "margin-bottom: 0px; margin-top: 0px; margin-left: 5px;"); this.elm.appendChild(label_elm); }
      this.elm.appendChild(hLayout_elm);
    }
    else {
      this.elm.appendChild(this.input_elm);
    }
  }

  updateSelectManyValue(value) {
    var that = this;
    this.value = value;
    let selected_items = "";
    if(typeof this.list[0] === "string") {
      value.forEach((val) => {
        selected_items = selected_items + that.list[val] + ", ";
      });
    }
    else if(typeof (<SelectManyItem>this.list[0]) === "object") {
      this.value = [];
      value.forEach((val) => {
        that.value.push((<SelectManyItem>that.list[val]).value);
        selected_items = selected_items + (<SelectManyItem>that.list[val]).label + ", ";
      });
    }
    if(typeof this.action !== "undefined") { (<Function>this.action)(this.value); }
    this.input_elm.innerHTML = (this.value.length !== 0) ? selected_items.slice(0, -2) : "<span style='color: #7f7f7f'>" + this.placeholder + "</span>";
  }

  generateSelectManyField(field) {
    var that = this;
    var init_indexes = [];
    this.value = field.initValue;
    this.placeholder = (field.placeholder) ? field.placeholder : tr.plcldr("selectMany");
    if(typeof this.list[0] === "string") {
      field.list.forEach((item, i) => {
        if(that.initValue.includes(i)) {
          init_indexes.push(i);
        }
      });
    }
    else if(typeof this.list[0] === "object") {
      field.list.forEach((item, i) => {
        if(that.initValue.includes(item.value)) {
          init_indexes.push(i);
        }
      });
    }
    this.initLabel();
    this.input_elm = document.createElement("div");
    this.input_elm.setAttribute("class", "dgui-field-text");
    this.updateSelectManyValue(init_indexes);
    this.input_elm.addEventListener("click", (e) => {
      let fields = [];
      if(typeof that.list[0] === "string") {
        that.list.forEach((item, i) => {
          fields.push({key: i, label: item, type: "switch", switchLock: true});
        });
      }
      else if(typeof that.list[0] === "object") {
        that.list.forEach((item, i) => {
          fields.push({key: i, label: item.label, type: "switch", switchLock: true, initValue: (that.value.includes(item.value))});
        }); 
      }
      contextMenu(e, {
        fields: fields,
        options: {initPosition: "bottom"}
      }, (value) => {
        that.updateSelectManyValue(value);
      });
    });
  }

  setHtmlAttributs(attributs: Array<{}>) {
    if(this.type != "switch" && this.type != "choice") {
      for(let attribut in attributs) {
        this.input_elm.setAttribute(attribut, attributs[attribut]);
      }
    }
  }

  setCSSAttributs(attributs: Array<{}>) {
    if(this.type != "switch" && this.type != "choice") {
      for(let attribut in attributs) {
        this.input_elm.style[attribut] = attributs[attribut];
      }
    }
  }
}