
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Basic components ////////////////////////////////////////////////////

/* --------------------------------- Utility functions -------------------------------------------------*/

// User

export function copyToClipboard(target: string | HTMLElement) {
  var target_elm = null;
  if(typeof target == "string") {
    target_elm = document.createElement("div");
    target_elm.innerHTML = target;
  }
  else if(target instanceof HTMLElement) {
    target_elm = target;
  }
  else {
    alert(new Error("copyToClipboad requires either a string or a HTMLElement as input"));
    return false;
  }
  document.body.appendChild(target_elm);
	let range = document.createRange();
	range.selectNode(target_elm);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand("copy");
  window.getSelection().removeAllRanges();
  document.body.removeChild(target_elm);
}

// Controller

export function elementBelongsToDataType(element: any, dataType: string) {
  do {
    if(element.dataset) {
      if(element.dataset.type) {
        if(element.dataset.type == dataType) {
          return true;
        }
      }
    }
    element = element.parentNode;
  } while(element);
  return false;
}

export function splitWhereOneOfSeperators(str: string, separators: Array<string>) {
  let i = 0, str_arr = [];
  do {
    str_arr = str.split(separators[i]); ++i;
  }
  while(str_arr.length == 1);
  return str_arr;
}

export function notEmpty(obj: {} | []) {
  if(typeof obj === "object") {
    return Object.keys(obj).length !== 0;
  }
  else if(Array.isArray(obj)) {
    return true;
  }
  return false;
}

export function setModifier(path: string, obj1: {}) {
  let obj2 = {};
  for(let attr in obj1) {
    obj2[path + "." + attr] =  obj1[attr];
  }
  return {$set: obj2};
}

export function disableDefaultContextmenu(elm: any) {
  elm.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  })
}

export function disableMouseSelection(elm: any) {
  elm.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
}

export function setDefaultCursor(elm: any) {
  elm.style.cursor = "default";
}

/* --------------------------------- dGUI translation --------------------------------------------------*/

var translations = {
  titles: {
    information: {en: "Information", fr: "Information"},
    entry: {en: "Entry", fr: "Saisie"},
    choice: {en: "Choice", fr: "Choix"},
    confirm: {en: "Confirm", fr: "Confirmation"},
    serverError: {en: "Server error", fr: "Erreur sur le serveur"},
    new: {en: "New", fr: "Ajouter"},
    edit: {en: "Edit", fr: "Modifier"},
    remove: {en: "Remove", fr: "Supprimer"}
  },
  buttons: {
    ok: {en: "Ok", fr: "D'accord"},
    cancel: {en: "Cancel", fr: "Annuler"},
    submit: {en: "Submit", fr: "Soumettre"},
    valid: {en: "Valid", fr: "Valider"},
    confirm: {en: "Confirm", fr: "Confirmer"},
    yes: {en: "Yes", fr: "Oui"},
    no: {en: "No", fr: "Non"}
  },
  messages: {
    serverError: {
      en: "An error has occured on the server. Please try to submit your request again. If the error persists, please contact the administrator, giving him the details of the error thereafter :",
      fr: "Une erreur est survenue sur le serveur. Veuillez soumettre votre requête à nouveau. Si l'erreur persiste, prière de contacter l'administrateur, en lui communiquant les détails de l'erreur ci-après :"
    }
  },
  labels: {
    year: {en: "Year", fr: "Année"},
    month: {en: "Month", fr: "Mois"},
    day: {en: "Day", fr: "Jour"}
  },
  placeholders: {
    YYYY: {en: "YYYY", fr: "AAAA"},
    YY: {en: "YY", fr: "AA"},
    MM: {en: "MM", fr: "MM"},
    DD: {en: "DD", fr: "JJ"}
  }
};

var language = "fr";

var tr = {
  title: (value: string) => {
    return translations.titles[value][language];
  },
  btn: (value: string) => {
    return translations.buttons[value][language];
  },
  msg: (value: string) => {
    return translations.messages[value][language];
  },
  lbl: (value: string) => {
    return translations.labels[value][language];
  },
  plcldr: (value: string) => {
    return translations.placeholders[value][language];
  }
}

/* --------------------------------- CLASS Colorset ----------------------------------------------------*/

interface colorSet_rgb_value {
  r: number;
  g: number;
  b: number;
}

interface colorSet_hsl_value {
  h: number;
  s: number;
  l: number;
}

class ColorSet {
  prmColor: string;
  secColor: string;
  secBrdColor: string;
  thrColor: string;
  thrBrdColor: string;
  fontColor: string;
  borderColor: string;
  arr_baseIntensity: Array<string>;

  constructor(color1: string, color2?: string, color3?: string) {
    this.arr_baseIntensity = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    this.prmColor = color1;
    this.secColor = (color2) ? color2 : this.algo0(color1, 15);
    this.secBrdColor = this.algo0(this.secColor, 30);
    this.thrColor = (color3) ? color3 : this.algo0(this.secColor, 25);
    this.thrBrdColor = this.algo0(this.thrColor, 50);
    this.fontColor = this.algo0(this.thrColor, 80);
  }

  algo0(hexa_color: string, diff: number) {
    return this.rgbToHexa(this.subtractMultiply(hexa_color, diff));
  }

  algo1(hexa_color: string, diff: number) {
    return this.rgbToHexa(this.addMultiply(hexa_color, diff));
  }

  subtractMultiply(hexa_color: string, diff: number) {
    let rgb = this.hexaToRgb(hexa_color);
    rgb.r = Math.round(rgb.r - (rgb.r * (diff / 200)));
    rgb.g = Math.round(rgb.g - (rgb.g * (diff / 200)));
    rgb.b = Math.round(rgb.b - (rgb.b * (diff / 200)));
    return rgb;
  }

  addMultiply(hexa_color: string, diff: number) {
    let rgb = this.hexaToRgb(hexa_color);
    rgb.r = Math.round(rgb.r + ((diff / 4) * (((rgb.g + rgb.b) / 2) / rgb.r)));
    rgb.g = Math.round(rgb.g + ((diff / 4) * (((rgb.r + rgb.b) / 2) / rgb.g)));
    rgb.b = Math.round(rgb.b + ((diff / 4) * (((rgb.r + rgb.g) / 2) / rgb.b)));
    return rgb;
  }

  algo2(hexa_color: string, diff: number) {
    let r_1 = hexa_color.substr(1, 1);
    let r_2 = hexa_color.substr(2, 1);
    let g_1 = hexa_color.substr(3, 1);
    let g_2 = hexa_color.substr(4, 1);
    let b_1 = hexa_color.substr(5, 1);
    let b_2 = hexa_color.substr(6, 1);
    return "#" + this.add(r_1, r_2, diff) + this.add(g_1, g_2, diff) + this.add(b_1, b_2, diff); 
  }

  add(comp1: string, comp2: string, diff: number) {
    let int_comp1 = this.arr_baseIntensity.indexOf(comp1) + 1;
    let int_comp2 = this.arr_baseIntensity.indexOf(comp2) + 1;
    let unities = Math.round((diff + int_comp2) / 16);
    let remainning = int_comp2 - (diff % 16);
    if(remainning <= 0) {
      remainning += 16;
      ++unities;
    }
    return this.arr_baseIntensity[int_comp1 - unities] + this.arr_baseIntensity[remainning - 1];
  }

  hexaToRgb(hexa_color: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexa_color);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHexa(rgb: colorSet_rgb_value) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
  }
}

/* --------------------------------- CLASS Translucent -------------------------------------------------*/

class Translucent {
  elm: HTMLDivElement;
  opacity: number;
  tmp_body_backgroud: string;

  constructor() {
    var that = this;
    this.opacity = 0.0;
    this.elm = document.createElement("div");
    this.elm.setAttribute("id", "dgui_translucent");
    this.elm.setAttribute("class", "translucent");//                     <- Classe translucent
    this.elm.style.display = "flex";
    this.elm.style.justifyContent = "center";
    this.elm.style.alignItems = "center";
    this.elm.style.position = "absolute";
    this.elm.style.left = 0 + "px";
    this.elm.style.top = 0 + "px";
    this.elm.style.width = window.innerWidth + window.scrollX + "px";
    this.elm.style.height = window.innerHeight + window.scrollY + "px";
    //this.fadeIn();  active la transition en javascript (ne pas oubllier de désattribuer la classe CSS translucent)
    this.elm.addEventListener("selectstart", function(e) {
      e.preventDefault(); return false;
    });
    var that = this;
    window.addEventListener("resize", function() {
      that.elm.style.width = window.innerWidth + window.scrollX + "px";
      that.elm.style.height = window.innerHeight + window.scrollY + "px";
    });
    window.addEventListener("scroll", that.scrollLock);
    this.tmp_body_backgroud = document.body.style.background;
    // permet de rendre l'animation plus fluide en cas d'arrière-plan trop riche (dégradés, ombres, etc.)
    document.body.style.background = "white";//                           <- l'apparence que va avoir l'arrière plan de la page tant que la fenêtre est active
    document.body.style.overflow = "hidden";
  }

  // Transition en javascript
  fadeIn() {
    var that = this;
    setTimeout(function() {
      if(that.opacity < 0.5) {
        that.opacity += 0.025;
        that.elm.style.backgroundColor = "rgba(0,0,0," + that.opacity + ")";
        that.fadeIn();
      }
    }, 10);
  }

  scrollLock(e) {
    window.scrollTo(0,0);
    e.preventDefault();
  }

  del() {
    var that = this;
    this.elm.parentNode.removeChild(this.elm);
    if(!document.getElementById("dgui_translucent")) {
      window.removeEventListener("scroll", that.scrollLock);
      document.body.style.background = this.tmp_body_backgroud;
      document.body.style.overflow = "visible";
    }
  }
}

/* --------------------------------- CLASS Button ------------------------------------------------------*/

class Button {
  elm: HTMLElement;
  parent: FormPannel;

  constructor (parent, label, button_BScolor_class) {
    this.parent = parent;
    this.elm = document.createElement("button");
    this.elm.setAttribute("class", "btn "+ button_BScolor_class);
    this.elm.setAttribute("style", "text-align: center; margin-left: 5px; margin-right: 5px; min-width: 70px");
    this.elm.textContent = label;
  }

  setFunction(actionFunction) {
    this.elm.addEventListener("click", (e) => {
      actionFunction();
    });
  }

  setAction(action) {
    var that = this;
    switch(action) {
      case "quit": this.elm.addEventListener("click", function(e) {
        that.parent.quit();
      }); break;
      case "submit": this.elm.addEventListener("click", function(e) {
        that.parent.submit();
      }); break;
      case "confirm": this.elm.addEventListener("click", function(e) {
        that.parent.confirm();
      }); break;
      case "abort": this.elm.addEventListener("click", function(e) {
        that.parent.abort();
      }); break;
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Fields dGUI /////////////////////////////////////////////////////////

/* --------------------------------- Interfaces Field --------------------------------------------------*/

interface field_descriptor {
  type: "message" | "button" | "text" | "number" | "choice" | "switch" | "switchGroup" | "select" | "date";
  key: string;
  label: string;
  required: boolean;
  initValue: string | boolean | number | Array<string> | Array<number> | Array<boolean>;
  size: number;
  action: any;
  condition: boolean | field_condition;
  BSClass: string;
  htmlAttr: {};                                                  // standard HTML attributs
  cssAttr: {};                                                   // standard CSS attributs
  list: Array<string> | Array<Object>;                           // for type select
  group: string;                                                 // for type switch
  radioButtons: Array<field_radioButton>;                        // for type choice
}

interface field_radioButton {
  // user
  label: string;
  value: string;
  // controller
  input_elm: HTMLInputElement;
  label_elm: HTMLLabelElement;
}

interface field_condition {
  key: string;
  hasValue: string | number | Array<string> | Array<number>;        // If field of key [key] has value [value], display the field
  operator: "==" | "!=" | "<" | ">" | "<=" | ">=" | "hasChanged";
  action: "show" | "sync";
}

/* --------------------------------- CLASS Field -------------------------------------------------------*/

class Field {

  /*                                              - Définition -                                        */
  // user
  type: "message" | "button" | "text" | "number" | "choice" | "switch" | "switchGroup" | "select" | "date";
  key: string;
  name: string;
  label: string;
  required: boolean;
  value: string | boolean | number;
  size: number;
  list: Array<string> | Array<Object>;
  action: any;
  condition: boolean | field_condition;
  BSClass: string;
  group: string;
  // constroller
  parent?: FormPannel;
  conditionalFields: Array<Field>;
  input_elm: any;
  label_elm: HTMLLabelElement;
  inputs_elm?: Array<HTMLDivElement> | Array<HTMLInputElement>;
  labels_elm?: Array<HTMLLabelElement>;
  date_units: Array<string>;
  date_comps_indexes: {y: number, m: number, d: number};
  button_elm: HTMLButtonElement;
  elm: any;
  switched: boolean;
  // user & controller
  initValue: string | boolean | number;
  radioButtons: Array<field_radioButton>;

  /*                                              - Constructor -                                       */
  constructor(field: field_descriptor, parent?: FormPannel) {
    var that = this;
    for(let attribut in field) {
      this[attribut] = field[attribut];
    }
    if(parent) {
      this.parent = parent;
    }
    if(!field.type) {
      field.type = "text";
      this.type = "text";
    }
    if(field.group) {
      field.type = "switch";
    }
    this.conditionalFields = [];
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
          that.inputs_elm.push(input_elm);
        });
        this.inputs_elm[this.initValue].setAttribute("class", "dgui-field-switch-selected");
        this.inputs_elm[this.initValue].style.backgroundColor = "#696969";
        this.inputs_elm.forEach((input_elm, i) => {
          input_elm.addEventListener("click", (e) => {
            that.inputs_elm.forEach((ie) => {
              ie.setAttribute("class", "dgui-field-switch");
              ie.style.backgroundColor = that.parent.colorSet.thrColor;
            });
            e.currentTarget.setAttribute("class", "dgui-field-switch-selected");
            e.currentTarget.style.backgroundColor = "#696969";
            that.value = e.currentTarget.dataset.value;
            console.log(that.value);
          });
        });
        break;
      case "switch":
        this.input_elm = document.createElement("div");
        this.generateSwitch(this.input_elm, this.label);
        this.input_elm.setAttribute("class", (this.initValue) ? "dgui-field-switch-selected" : "dgui-field-switch");
        this.input_elm.style.backgroundColor = (this.initValue) ? "#696969" : this.parent.colorSet.thrColor;
        this.input_elm.style.height = "36px";
        this.value = this.initValue;
        this.input_elm.addEventListener("click", (e) => {
          let elm = e.currentTarget;
          if(!that.value) {
            if(that.parent && that.group) {
              that.parent.groups.forEach((group) => {
                if(group.name == that.group) {
                  group.fields.forEach((field) => {
                    field.value = false;
                    field.conditionalFields.forEach((cf) => {
                      cf.check_condition(field);
                    });
                    field.input_elm.setAttribute("class", "dgui-field-switch");
                    field.input_elm.style.backgroundColor = that.parent.colorSet.thrColor;
                  });
                }
              });
            }
            elm.setAttribute("class", "dgui-field-switch-selected");
            elm.style.backgroundColor = "#696969";
            that.value = true;
            that.conditionalFields.forEach((cf) => {
              cf.check_condition(that);
            });
          }
          else {
            elm.setAttribute("class", "dgui-field-switch");
            elm.style.backgroundColor = that.parent.colorSet.thrColor;
            that.value = false;
          }
          // action
          if(typeof that.action !== "undefined") {
            if(typeof that.action === "function") {
              that.action(that.value);
            }
          }
        });
        break;
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
        this.button_elm.addEventListener("click", that.action); break;
      case "date":
        this.required = true;
        this.generateDateField(field); break;
      case "text": case "password": case "number":
        this.initLabel(field);
        this.input_elm = document.createElement("input");
        this.input_elm.setAttribute("type", field.type);
        // this.input_elm.setAttribute("class", "form form-control");
        this.input_elm.setAttribute("class", "dgui-field-text");
        this.input_elm.style.height = "36px";
        this.input_elm.setAttribute("autocorrect", "off");
        if(field.placeholder) {
          this.input_elm.setAttribute("placeholder", field.placeholder);
        }
        if(field.align) {
          this.input_elm.style.textAlign = field.align;
        }
        if(field.max) {
          this.input_elm.setAttribute("maxlength", field.max);
        }
        if(typeof this.action === "function") {
          this.input_elm.addEventListener("input", (e) => {
            this.action(e.currentTarget.value);
          });
        }
        break;
      case "select":
        this.initLabel(field);
        if(this.list) {
          this.input_elm = document.createElement("select");
          // this.input_elm.setAttribute("class", "form form-control");
          this.input_elm.setAttribute("class", "dgui-field-text");
          this.list.forEach((list_item, i) => {
            let option = document.createElement("option");
            option.setAttribute("value", i.toString());
            option.textContent = list_item;
            this.input_elm.appendChild(option);
          });
          this.input_elm.addEventListener("input", (e) => {
            that.value = e.currentTarget.value;
          });
        } break;
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
    if(field.type == "number") {
      this.input_elm.setAttribute("type", "number");
      this.input_elm.setAttribute("step", "1");
      this.input_elm.setAttribute("min", "0");
      if(!this.initValue) {
        this.input_elm.value = "1";
      }
    }
    if(typeof field.initValue !== "undefined" && field.type != "switchGroup") {
      this.input_elm.value = this.initValue;
    }
    /*                                            - init display -                                      */
    this.elm = document.createElement("div");
    if(!["message", "date", "switchGroup"].includes(field.type)) {
      this.elm.setAttribute("class", "dgui-form-pannel-element");
    }
    else if(field.type == "switchGroup") {
      this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
      this.elm.setAttribute("style", "padding-left: 15px; padding-right: 15px;");
    }
    else if(field.type == "date") {
      this.elm.setAttribute("class", (this.label) ? "dgui-vertical-layout" : "dgui-form-pannel-layout");
    }
    else {
      this.elm.setAttribute("class", "dgui-form-pannel-element-message");
    }
    if(field.size) {
      this.elm.style.flex = field.size;
    }
    else {
      this.elm.style.flex = 1;
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
    else if(field.type == "text" || field.type == "password" || field.type == "select" || field.type == "number") {
      if(field.label) {
        this.elm.appendChild(this.label_elm);
      }
      this.elm.appendChild(this.input_elm);
    }
    else if(field.type == "date") {
      let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
      for(let i = 0; i < this.inputs_elm.length; ++i) {
        let date_layer = document.createElement("div");
        date_layer.setAttribute("class", "dgui-form-pannel-element");
        date_layer.setAttribute("style", "padding-left: 5px; padding-right: 5px; flex: 1;");
        date_layer.style.flex = (this.date_units[i] == "YYYY") ? "2" : "1";
        if(!field.label) { date_layer.appendChild(this.labels_elm[i]); }
        date_layer.appendChild(this.inputs_elm[i]);
        if(!this.label) { this.elm.appendChild(date_layer); }
        else { hLayout_elm.appendChild(date_layer) }
      }
      if(this.label) { this.elm.appendChild(this.label_elm); this.elm.appendChild(hLayout_elm); }
      this.elm.style.paddingLeft = "15px"; this.elm.style.paddingRight = "15px";
    }
    else if(field.type == "switchGroup") {
      let hLayout_elm = document.createElement("div"); hLayout_elm.setAttribute("class", "dgui-form-pannel-layout");
      this.inputs_elm.forEach((input_elm) => {
        let elm = document.createElement("div");
        elm.setAttribute("class", "dgui-form-pannel-element");
        elm.setAttribute("style", "flex: 1; padding-left: 5px; padding-right: 5px");
        elm.appendChild(input_elm);
        hLayout_elm.appendChild(elm);
      });
      if(this.label) { let label_elm = document.createElement("label"); label_elm.textContent = this.label; label_elm.setAttribute("style", "margin-bottom: 0px; margin-top: 10px; margin-left: 5px;"); this.elm.appendChild(label_elm); }
      this.elm.appendChild(hLayout_elm);
    }
    else {
      this.elm.appendChild(this.input_elm);
    }
  }

  initLabel(field) {
    if(field.label) {
      this.label_elm = document.createElement("label");
      this.label_elm.textContent = field.label;
      this.label_elm.setAttribute("style", "text-align: left");
    }
  }

  generateSwitch(input_elm, label) {
    input_elm.setAttribute("class", "dgui-field-switch");
    input_elm.setAttribute("style", "display: flex; justify-content: center; align-items: center; margin-top: 0px");
    input_elm.style.backgroundColor = this.parent.colorSet.thrColor;
    let text_elm = document.createElement("div");
    text_elm.textContent = label;
    input_elm.appendChild(text_elm);
  }

  check_condition(targetField: Field) {
    var that = this;
    let operator = (this.condition.operator) ? this.condition.operator : "==";
    this.condition.action = (this.condition.action) ? this.condition.action : ["show"];
    this.condition.action = (Array.isArray(this.condition.action)) ? this.condition.action : [this.condition.action];
    this.condition.hasValue = (this.condition.hasValue) ? this.condition.hasValue : 0;
    if(Array.isArray(this.condition.hasValue)) {
      this.elm.style.display = (this.condition.hasValue.includes(targetField.input_elm.value)) ? "block" : "none";
    }
    else {
      let fulfilled = false;
      var value1 = (this.condition.hasValue) ? this.condition.hasValue : "0";
      var value2 = (targetField.value) ? targetField.value : "0";
      console.log(targetField);
      if(operator == "hasChanged") {
        if((targetField.type == "switch" || targetField.type == "date") && targetField.initValue != targetField.value) {
          fulfilled = true;
        }
        else if(targetField.initValue != targetField.input_elm.value) {
          fulfilled = true;
        }
      }
      else if(eval(value1 + operator + value2)) {
        fulfilled = true;
      }
      if(fulfilled) {
        if(this.condition.action.includes("show")) { this.elm.style.display = "block"; }
        if(this.condition.action.includes("sync")) {
          if(this.type != "date" && targetField.type != "date") {
            this.value = targetField.value
          }
          else {
            this.updateDateValue(targetField.inputs_elm);
            for(let i = 0; i < this.inputs_elm.length; ++i) {
              this.inputs_elm[i].value = targetField.inputs_elm[i].value;
            }
          }
        } 
      }
      else {
        if(this.condition.action.includes("show")) { this.elm.style.display = "none"; }
      }
    }
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
    if(parseInt(this.inputs_elm[this.date_comps_indexes.d].value) > parseInt(this.inputs_elm[this.date_comps_indexes.d].max)) {
      this.inputs_elm[this.date_comps_indexes.d].value = this.inputs_elm[this.date_comps_indexes.d].max;
    }
    let tmp_date = new Date(tmp_date.getFullYear(), tmp_date.getMonth(), 0);
    console.log(tmp_date.getDate());
    this.inputs_elm[this.date_comps_indexes.d].max = tmp_date.getDate();  
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
      input.type = "number"; input.min = "1"; input.setAttribute("class", "form form-control");
      unit = unit.toUpperCase();
      input.setAttribute("placeholder", tr.plcldr(unit));
      if(!this.label) { var label = document.createElement("label") };
      let label_str = "";
      var today = new Date();
      switch(unit) {
        case "YYYY": case "YY":
          this.date_comps_indexes.y = index;
          if(unit == "YYYY") {
            input.value = initYearValue; input.min = today.getFullYear().toString();
          }
          else if(unit == "YY") {
            input.value = initYearValue.substr(2,2); input.min = input.value;
          }
          label_str = tr.lbl("year"); break;
        case "MM":
          this.date_comps_indexes.m = index;
          input.value = initMonthValue; input.max = "12";
          label_str = tr.lbl("month"); 
          input.addEventListener("input", (e) => {
            //that.updateDaysInMonth(e.currentTarget.value);
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
    console.log(this);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// MDIs dGUI ///////////////////////////////////////////////////////////

/* --------------------------------- Interfaces MDI ----------------------------------------------------*/

interface MDI_options {
  containerWidth?: number;
  containerHeight?: number;
  menuItemWidth?: number;
  menuLayout?: string;
  shape?: "rounded" | "squared";
}

/* --------------------------------- CLASS MDI ---------------------------------------------------------*/

class MDI {
  elm: HTMLDivElement;
  menu_elm: HTMLDivElement;
  container_elm: HTMLDivElement;
  lastSelectedElmIndex: any;
  sections: any;
  options: MDI_options;
  menu_layout: any;
  parent: FormPannel;

  constructor(mdi, parent) {
    for(let attribut in mdi) {
      this[attribut] = mdi[attribut];
    }
    this.parent = parent;
    if(!this.options) { this.options = {}; }
    if(!this.options.menuLayout) { this.options.menuLayout = "horizontal";  }
    if(!this.options.shape) { this.options.shape = this.parent.options.shape; }
    // génération du menu et du container
    if(typeof this.sections !== "undefined") {
      this.elm = document.createElement("div");
      this.elm.id = parent.id + "_sections_elm";
      this.elm.setAttribute("style", "margin-left: 5px; margin-right: 5px; margin-top: 0px");
      this.menu_elm = document.createElement("div");
      this.menu_elm.id = parent.id + "_sections_tabsElm";
      if(this.options.menuLayout) {
        if(this.options.menuLayout == "horizontal") {
          this.elm.setAttribute("class", "form-pannel-vertical-layout")
          this.menu_elm.setAttribute("class", "form-pannel-layout");
        }
        else if(this.options.menuLayout == "vertical") {
          this.elm.setAttribute("class", "form-pannel-layout");
          this.menu_elm.setAttribute("class", "form-pannel-vertical-layout");
        }
      }
      this.container_elm = document.createElement("div");
      this.container_elm.id = parent.id + "_sections_containerElm";
      if(this.options.menuLayout == "horizontal") { this.container_elm.setAttribute("class", "dgui-horizontal-container"); }
      else { this.container_elm.setAttribute("class", "dgui-vertical-container"); }
      if(this.options) {
        for(let attribut in this.options) {
          switch(attribut) {
            case "containerWidth":
              this.container_elm.style.width = this.options[attribut]+"px"; break;
            case "containerHeight":
              this.container_elm.style.height = this.options[attribut]+"px"; break;
            case "shape":
              if(this.options.shape == "squared") {
                this.container_elm.style.borderRadius = "0px";
              }  break;
          }
        }
      }
      this.container_elm.style.backgroundColor = this.parent.colorSet.secColor;
      this.container_elm.style.borderColor = this.parent.colorSet.secBrdColor;
      // génération des sections
      this.lastSelectedElmIndex=0;
      for(var i=0; i < this.sections.length; ++i) {
        if(typeof this.sections[i].condition === "undefined" || (typeof this.sections[i].condition !== "undefined" && this.sections[i].condition === true)) {
          this.sections[i].tabElm = document.createElement("div");
          this.sections[i].tabElm.id = parent.id+"_tab"+i.toString();
          let label = document.createElement("span");
          label.setAttribute("style", "margin: auto;");
          label.textContent = this.sections[i].label;
          this.sections[i].tabElm.appendChild(label);
          if(this.options.menuLayout == "horizontal") {
            this.sections[i].tabElm.setAttribute("class", "dgui-top-tab");
          }
          else {
            this.sections[i].tabElm.setAttribute("class", "dgui-left-tab");
          }
          if(this.options.shape == "squared") {this.sections[i].tabElm.style.borderRadius = "0px";}
          if(this.options.menuItemWidth) {
            this.setTabStyle(this.sections[i].tabElm, {width: this.options.menuItemWidth+"px"});
          }
          this.sections[i].tabElm.style.backgroundColor = this.parent.colorSet.thrColor;
          this.sections[i].tabElm.style.borderColor = this.parent.colorSet.thrBrdColor;
          (function(i, that){
            that.sections[i].tabElm.addEventListener("click", function(e) {
              let sectionToShowID = parent.id + "_section" + i.toString();
              let lastSelectedElement = document.getElementById(parent.id+"_section"+that.lastSelectedElmIndex);
              lastSelectedElement.style.display = "none";
              document.getElementById(sectionToShowID).style.display = "block";
              //  animation
              let lastSelectedElm_id = parent.id+"_tab"+that.lastSelectedElmIndex;
              if(e.currentTarget.id != lastSelectedElm_id ) {
                that.initTab(e.currentTarget);
                let lastSelectedTab = document.getElementById(lastSelectedElm_id );
                if(that.options.menuLayout == "horizontal") {
                  that.setTabStyle(lastSelectedTab, {backgroundColor: that.parent.colorSet.thrColor, height: "40px", marginTop: "7px", borderBottomWidth: "1px", fontWeight: "normal", borderColor: that.parent.colorSet.thrBrdColor});
                }
                else {
                  that.setTabStyle(lastSelectedTab, {backgroundColor: that.parent.colorSet.thrColor , height: "40px", marginLeft: "7px", borderRightWidth: "1px", fontWeight: "normal", borderColor: that.parent.colorSet.thrBrdColor});
                }
                if(that.options.menuItemWidth) {
                  that.setTabStyle(lastSelectedTab, {width: that.options.menuItemWidth+"px"});
                }
                // reset
                that.lastSelectedElmIndex = i.toString();
              }
            });
          })(i, this);
          this.sections[i].elm = document.createElement("div");
          this.sections[i].elm.id = parent.id + "_section" + i.toString();
          this.sections[i].elm.setAttribute("class", "form-pannel-vertical-layout");
          this.sections[i].elm.setAttribute("style", "display: none;");
          if(typeof this.sections[i].fields !== "undefined") {
            let scrollElm = document.createElement("div");
            scrollElm.style.height = this.options.containerHeight-60+"px";
            scrollElm.style.overflow = "auto";
// Initialisation des champs
            var section_fields = this.sections[i].fields;
            this.sections[i].fields = [];
            this.parent.generateFields(this.sections[i], section_fields, scrollElm);
            this.sections[i].elm.appendChild(scrollElm);
          }
          this.menu_elm.appendChild(this.sections[i].tabElm);
          this.container_elm.appendChild(this.sections[i].elm);
        }
      }
      // Ajout de l'élément invisible qui complète la bordure du container
      let spaceBetween = document.createElement("div");
      if(this.options.menuLayout == "horizontal") { spaceBetween.setAttribute("style", "border-bottom: 1px solid #AAAAAA; flex-grow: 1;"); }
      else { spaceBetween.setAttribute("style", "border-right: 1px solid #AAAAAA; flex-grow: 1;"); }
      spaceBetween.style.borderBottomColor = this.parent.colorSet.secBrdColor;
      this.menu_elm.appendChild(spaceBetween);
      // Ajout du menu et du container
      this.elm.appendChild(this.menu_elm);
      this.elm.appendChild(this.container_elm);
      // initialisation du MDI
      this.initTab(this.sections[0].tabElm);
      this.initSection(this.sections[0].elm);
    }
  }

  setTabStyle(tab, style) {
    for(let attribut in style) {
      tab.style[attribut] = style[attribut];
    }
  }

  initTab(tab) { //th: BABABA sec: D3D3D3
    if(this.options.menuLayout == "horizontal") {
      this.setTabStyle(tab, {backgroundColor: this.parent.colorSet.secColor , height: "44px", marginTop: "3px", borderBottomWidth: "0px", fontWeight: "normal", borderColor: this.parent.colorSet.secBrdColor});
    }
    else if(this.options.menuLayout == "vertical") {
      this.setTabStyle(tab, {backgroundColor: this.parent.colorSet.secColor, height: "44px", marginLeft: "3px", borderRightWidth: "0px", fontWeight: "normal", borderColor: this.parent.colorSet.secBrdColor});
    }
    if(this.options.menuItemWidth) {
      this.setTabStyle(tab, {width: this.options.menuItemWidth+4+"px"});
    }
  }

  initSection(sectionElm) {
    sectionElm.style.display = "block";
  }
}

var dguiUserInterface = {
  dguiObjects: {}
}

export const get = function(interfaceObj_str: string) {
  return (dguiUserInterface.dguiObjects[interfaceObj_str]) ? dguiUserInterface.dguiObjects[interfaceObj_str] : false;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Form dGUI ///////////////////////////////////////////////////////////

class BlazeTemplate {
  elm: any;
  private template: any;
  private blazeInstance: any;

  constructor(template) {
    this.template = template;
    this.elm = document.createElement("div");
    this.render();
    this.elm.setAttribute("style", "width: 1110px; height: 550px;");
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

/* --------------------------------- Interfaces FormPannel ---------------------------------------------*/

interface formPannel_options {
  mode?: "new" | "edit";
  color?: string;
  maxWidth?: number;
  maxHeight?: number;
  containerWidth?: number;
  shape?: "rounded" | "squared";
  allFieldsMandatory?: boolean; //à implémenter
}

interface button {
  action: string;
  value: string;
  BSClass: string;
}

interface formPannel_fieldGroup {
  name: string;
  fields: Array<Field>
}

/* --------------------------------- CLASS FormPannel --------------------------------------------------*/

class FormPannel {
  name: string;
  id: string;
  type: string
  parent: modal;
  title?: string;
  rTitle?: string;
  fields: Array<Field>;
  footer: Array<button>;
  options: formPannel_options;
  // user & controller
  errorMessage_elm: any;
  MDI: MDI;
  template: BlazeTemplate;
  footer_elm: HTMLDivElement;
  // controller
  elm: HTMLDivElement;
  colorSet: ColorSet;
  groups: Array<formPannel_fieldGroup>;
  conditionalFields: Array<Field>; 

  constructor(properties, parent) {
    var that = this;
    for(let property in properties) {
      this[property] = properties[property];
    }

    if(this.name) {
      dguiUserInterface.dguiObjects[this.name] = this;
      console.log(dguiUserInterface);
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
    if(!this.options.shape) {this.options.shape = "rounded";}
    if(!this.options.color) {this.options.color = "#D3D3D3";}
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
    let fields = this.fields;
    this.fields = [];
    this.generateFields(that, fields, scrollElm);
    this.initConditionalFields();
    this.elm.appendChild(scrollElm);

    this.initDisplay();
    // initialisation
    let formPannelHeader = document.createElement("div");
    formPannelHeader.setAttribute("style", "padding: 7px; padding-top: 4px;");
    let formPannelTitle = document.createElement("div");
    setDefaultCursor(formPannelTitle);
    formPannelTitle.setAttribute("style", "display: inline-block; margin-top: 3px; font-size: 18px; font-weight: bold; color: rgba(0, 0, 0, 0.8);");
    formPannelTitle.textContent = this.title;
    formPannelHeader.appendChild(formPannelTitle);
    let close_button_elm = document.createElement("div");
    close_button_elm.setAttribute("class", "dgui-modal-close");
    close_button_elm.setAttribute("style", "color: " + this.colorSet.fontColor);
    close_button_elm.addEventListener("click", () => {
      that.quit();
    })
    let close_svg_elm = document.createElement("i");
    close_svg_elm.setAttribute("class", "fas fa-times");
    close_button_elm.appendChild(close_svg_elm);
    formPannelHeader.appendChild(close_button_elm);
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
      this.template = new BlazeTemplate(this.template);
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
            // Groups
            if(field.group) {
              var group_index= -1;
              that.groups.forEach((group, i) => {
                if(group.name == field.group) {
                  group_index = i;
                }
              });
              if(group_index != -1) {
                that.groups[group_index].fields.push(field);
              }
              else {
                that.groups.push({name: field.group, fields: []});
                that.groups.forEach((group) => {
                  if(group.name == field.group) {
                    group.fields.push(field);
                  }
                })
              }
            }
            fields_inputs.push({input: field.input_elm, max: (field.max) ? field.max : null});
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

  generateField(fieldsContainer, field_descriptor) {
    let field = new Field(field_descriptor, this);
    // conditionnal field
    if(typeof field.condition !== "undefined") {
      if(typeof field.condition === "boolean") {
        if(field.condition === false) {
          field.elm.style.display = "none";
        }
      }
      else if(field.condition.key) {
        this.conditionalFields.push(field);
      }
    }
    fieldsContainer.fields.push(field);
    return field;
  }

  initConditionalFields() {
    this.conditionalFields.forEach((conditionalField) => {
      this.fields.forEach((field) => {
        if(field.key == conditionalField.condition.key) {
          conditionalField.check_condition(field);
          if(!["date", "switch", "switchGroup"].includes(field.type)) {
            field.input_elm.addEventListener("input", (e) => {
              conditionalField.check_condition(field);
            });
          }
          else if(field.type == "switch") {
            field.conditionalFields.push(conditionalField);
          }
          else if(field.type == "switchGroup") {
            field.inputs_elm.forEach((input_elm) => {
              input_elm.addEventListener("click", (e) => {
                conditionalField.check_condition(field);
              });
            });
          }
          else {
            field.inputs_elm.forEach((input_elm) => {
              input_elm.addEventListener("input", (e) => {
                conditionalField.check_condition(field);
              });
            });
          }
        }
      });
    });
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
    if(this.template) {
      this.template.remove();
    }
    this.parent.quit();
  }

  submit() {
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
      Promise.all(promises).then(() => {that.quit();}).catch((err) => { that.errorMessage(err.message); });
    }
    let proper_values = this.properType(values);
    if(Object.keys(proper_values).length !== 0) {
      console.log(that);
      this.parent.submit({value: proper_values, end: function() {
        that.parent.quit();
      }, errorMessage: function(message) {
        that.errorMessage_elm.textContent = message;
        that.errorMessage_elm.style.display = "block";
      }, serverError: function(err) {
        if(err) {
          modalForm({
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
    let initValue = (typeof field.initValue !== "undefined") ? field.initValue : "";
    if(["text", "password", "number", "select", "date"].includes(field.type)) {
      // On ne soumet que les champs dont la valeur a été modifiée
      if(field.input_elm.value != initValue || field.required === true) {
        // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
        if(typeof field.key !== "undefined") {
          let objTextField = {};
          objTextField[field.key] = field.input_elm.value;
          if(field.type == "select" || field.type == "number") {
            objTextField[field.key] = parseInt(field.input_elm.value);
          }
          values.push(objTextField);
        }
        else {
          values.push(field.input_elm.value);
        }
      }
    }
    else if(field.type == "switch" || field.type == "switchGroup") {
      // On ne soumet que les champs dont la valeur a été modifiée
      if(field.value != initValue || field.required === true) {
        // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
        if(typeof field.key !== "undefined") {
          let objSwitchField = {};
          objSwitchField[field.key] = (field.type == "switch") ? field.value : parseInt(field.value);
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
    this.parent.confirm();
  }

  abort() {
    this.parent.abort();
  }

  errorMessage(message) {
    this.errorMessage_elm.textContent = message;
    this.errorMessage_elm.style.display = "block";
  }
}


export class modal {
  background: Translucent;
  formPannel: FormPannel;
  feedback: Function;

  constructor(formInitializer, feedback) {
    if(formInitializer != null) {
      //this.clean = formInitializer.clean;
      this.feedback = feedback;
      this.background = new Translucent();
      this.formPannel = new FormPannel(formInitializer, this);
      this.background.elm.appendChild(this.formPannel.elm);
      document.body.appendChild(this.background.elm);
      this.formPannel.init();
    }
  }
  quit() {
    this.background.del();
  }

  submit(form) {
    this.feedback(form);
    //this.background.del();
  }

  confirm() {
    this.feedback(true);
    this.background.del();
  }

  abort() {
    //this.clean();
    //this.feedback(false);
    this.background.del();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Contextual menu dGUI ////////////////////////////////////////////////

/* --------------------------------- Interfaces ContextMenu --------------------------------------------*/

interface contextMenu_field {
  // user
  type?: "switch" | "button" | "context",
  key?: string,
  group?: string,
  label: string,
  initValue?: any,
  contextMenu?: contextMenu_init,
  condition?: boolean,
  action?: Function,
  switchLock?: boolean,
  // controller
  elm: HTMLDivElement,
  value: boolean,
  contextMenuObj: ContextMenu | null
}

interface contextMenu_options {
  initPosition?: "bottom" | "right" | "left" | "mouse"
}

interface contextMenu_init {
  fields: Array<contextMenu_field>,
  options: contextMenu_options
}

interface contextMenu_parentAttributes {
  parent: contextMenu_field,
  parent_menu: ContextMenu,
  target: any
}

/* --------------------------------- CLASS ContextMenu -------------------------------------------------*/

class ContextMenu {

  /*                                              - Définition -                                        */
  // attributs
  elm: HTMLDivElement;
  parent_menu: ContextMenu;
  parent: contextMenu_field;
  target: any;
  options: contextMenu_options;
  fields: Array<contextMenu_field>;
  contextFields: Array<contextMenu_field>;
  selected_items: Array<string>;
  mouseover: boolean;
  // methods
  event_close: any;
  recursive_close: any;
  close: any;
  /*                                              - Constructor -                                       */

  constructor(event, contextMenu_init: contextMenu_init, callback, parentAttributes?: contextMenu_parentAttributes) {
    // Attributs initialization
    var that = this;
    this.target = event.currentTarget;
    for(let property in contextMenu_init) {
      this[property] = contextMenu_init[property];
    }
    if(parentAttributes) {
      this.parent = parentAttributes.parent;
      this.target = parentAttributes.target;
      this.parent_menu = parentAttributes.parent_menu;
    }
    this.contextFields = [];
    this.selected_items = [];
    this.mouseover = false;
    //                                            - Initial DOM setup -
    this.elm = document.createElement("div");
    this.elm.setAttribute("class", "dgui-contextMenu light-shadow");
    this.elm.setAttribute("data-type", "dgui_contextMenu");

    if(typeof this.options === "undefined") { this.options = {initPosition: "mouse"}; }
    if(typeof this.options.initPosition === "undefined") { this.options.initPosition = "mouse"; }

    var htmlTargetPosition = event.currentTarget.getBoundingClientRect();
    if(this.parent) {
      htmlTargetPosition = this.parent.elm.getBoundingClientRect();
    }
    switch(this.options.initPosition) {
      case "mouse":
        this.elm.style.left = event.clientX + window.scrollX + "px";
        this.elm.style.top = event.clientY + window.scrollY + "px"; break;
      case "bottom":
        this.elm.style.left = htmlTargetPosition.left + window.scrollX + "px";
        this.elm.style.top = htmlTargetPosition.bottom + window.scrollY + "px"; break;
      case "right":
        this.elm.style.left = htmlTargetPosition.right + window.scrollX + "px";
        this.elm.style.top = htmlTargetPosition.top + window.scrollY + "px"; break;       
    }
    //                                            - Initial events -
    disableDefaultContextmenu(this.elm);
    disableMouseSelection(this.elm);
    this.elm.addEventListener("mouseover", () => {
      this.mouseover = true;
    });
    this.elm.addEventListener("mouseout", () => {
      this.mouseover = false;
    });
    if(this.fields) {
      this.fields.forEach((field, index) => {
        /*                                        - Field init attributs -                              */
        if(field.contextMenu) {
          field.type = "context";
        }
        else if(field.group) {
          field.type = "switch";
          field.switchLock = (field.switchLock) ? field.switchLock : true;
        }
        else if(!field.type) {
          field.type = "button";
        }
        /*                                        - Fields init display -                               */
        field.elm = document.createElement("div");
        if(typeof field.condition !== "undefined") {
          field.elm.style.display = (field.condition) ? "block" : "none";
        }
        field.elm.setAttribute("data-index", index.toString());
        field.elm.setAttribute("class", "dgui-contextMenu-item");
        if(field.type != "context") {
          field.elm.textContent = field.label;
        }
        else {
          let label = document.createElement("div");
          label.style.display = "inline-block";
          label.textContent = field.label;
          let arrow = document.createElement("div");
          arrow.setAttribute("class", "dgui_arrow-right");
          let arrow_container = document.createElement("div");
          arrow_container.setAttribute("data-type", "arrow");
          arrow_container.setAttribute("style", "float: right");
          arrow_container.appendChild(arrow);
          field.elm.appendChild(label);
          field.elm.appendChild(arrow_container);
          this.contextFields.push(field);
        }
        if(field.type == "switch") {
          if(field.initValue) {
            field.value = true;
            this.selected_items.push(field.key);
            that.changeColor(field.elm, "rgba(93, 78, 109, 0.5)", "white");
          }
        }
        /*                                        - Fields init events -                                */
        if(field.type != "context") {
          field.elm.addEventListener("mouseover", () => {
            that.closeContextFields();
          });
          if(field.type == "switch") {
            field.elm.addEventListener("click", (event) => {
              let index = event.target.dataset.index;
              // main callback
              if(!that.selected_items.includes(that.fields[index].key)) {
                field.value = true;
                that.changeColor(event.target, "rgba(93, 78, 109, 0.5)", "white");
                that.selected_items.push(that.fields[index].key);
              }
              else {
                field.value = false;
                let itemToRemoveIndex = that.selected_items.indexOf(that.fields[index].key);
                that.selected_items.splice(itemToRemoveIndex, 1);
                that.changeColor(event.target, "rgba(124, 110, 127, 0)", "#262626");
              }
              // action
              if(field.action) {
                field.action(that.target, field.value);
              }
              if(!field.switchLock) {
                that.recursive_close();
                that.close(true);
              }
            });
            field.elm.addEventListener("mouseover", (event) => {
              if(!field.value) {
                that.changeColor(event.target, "rgba(124, 110, 127, 0.4)", "white");
              }
            });
            field.elm.addEventListener("mouseout", (event) => {
              if(!field.value) {
                that.changeColor(event.target, "rgba(112 ,112 ,112, 0)", "#262626");
              }
            });
          }
          else if(field.type == "button") {
            field.elm.addEventListener("click", (event) => {
              let index = event.target.dataset.index;
              if(that.fields[index].action) {
                that.fields[index].action(that.target);
              }
              if(that.fields[index].key) {
                that.selected_items.push(that.fields[index].key);
              }
              that.recursive_close();
              that.close(true);
            });
          }
        }
        else {
          field.elm.addEventListener("mouseover", () => {
            if(!field.contextMenuObj) {
              if(!field.contextMenu.options) { field.contextMenu.options = {}; }
              if(!field.contextMenu.options.initPosition) {
                field.contextMenu.options.initPosition = "right";
              }
              this.closeContextFields();
              field.contextMenuObj = new ContextMenu(event, field.contextMenu, callback, {parent: field, parent_menu: that, target: that.target});
              field.elm.addEventListener("mouseleave", (event) => {
                event.stopPropagation();
                if(field.contextMenuObj) {
                  setTimeout(() => {
                    if(field.contextMenuObj) {
                      if(!field.contextMenuObj.mouseover) {
                        field.contextMenuObj.close();
                        delete field.contextMenuObj;
                      }
                    }
                  }, 10);
                }
              });
            }
          });
        }
        this.elm.appendChild(field.elm);
      });
    }
    /*                                            - Methods -                                           */
    this.close = function(fireCallback?) {
      document.body.removeEventListener("mousedown", that.event_close);
      document.body.removeChild(that.elm);
      if(fireCallback) {
        callback(that.selected_items);
      }
    }
    this.recursive_close = function() {
      if(that.parent_menu) {
        that.parent_menu.recursive_close()
        that.parent_menu.close();
      }
    }
    this.event_close = function(event) {
      event.stopPropagation();
      if(!elementBelongsToDataType(event.target, "dgui_contextMenu")) {
        that.close(true);
      }
    }
    document.body.appendChild(this.elm);
    if(this.options.initPosition == "left") {
      this.elm.style.left = htmlTargetPosition.left - this.elm.offsetWidth + window.scrollX + "px";
      this.elm.style.top = htmlTargetPosition.top + window.scrollY + "px";
    }
    this.adaptPosition("left", "right", "width", "innerWidth");
    this.adaptPosition("top", "bottom", "height", "innerHeight");
    setTimeout(() => {
      document.body.addEventListener("mousedown", this.event_close);
    }, 10);
  }

  adaptPosition(position1, position2, dimension, win_dimension) {
    let elm_htmlPosition = this.elm.getBoundingClientRect();
    if(elm_htmlPosition[position2] > window[win_dimension]) {
      if(this.parent_menu) {
        let parentElm_htmlPosition = this.parent.elm.getBoundingClientRect();
        this.elm.style[position1] = parentElm_htmlPosition[position1] - elm_htmlPosition[dimension]+"px";
        this.parent_menu.options.initPosition = position1;
      }
      else {
        this.elm.style[position1] = elm_htmlPosition[position1] - elm_htmlPosition[dimension]+"px";
      }
    }
  }

  closeContextFields() {
    this.contextFields.forEach((field) => {
      if(field.contextMenuObj) {
        field.contextMenuObj.close();
        delete field.contextMenuObj;
      }
    });
  }

  changeColor (elm, bg, c) {
    elm.style.backgroundColor = bg;
    elm.style.color = c;
  }
}

export function contextMenu(event, contextMenu_init, callback) {
  new ContextMenu(event, contextMenu_init, callback);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Common dialogbox dGUI ///////////////////////////////////////////////

export function alert(message: string | Error, title?: string, callback?: Function) {
  callback = callback || function(){};
  message = (message instanceof Error) ? message.message : message;
  new modal({
    title: title || tr.title("information"),
    fields: [{type: "message", message: message}],
    footer: [{action: "quit", value: "Ok", BSClass: "btn-success"}]
  }, callback);
}

export function confirm(message: string, callback: Function, title = tr.title("confirm"), options) {
  if(typeof title == "function") {
    callback = title;
    title = tr.title("confirm");
  }
  new modal({
    title: title,
    fields: [{type: "message", message: message}],
    footer: [
      {action: "confirm", value: tr.btn("confirm"), BSClass: "btn-danger"},
      {action: "abort", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ],
    options: options
  }, callback);
}

export function prompt(message: string, callback: any, title:string = tr.title("entry"), options = {maxWidth: 500}) {
  new modal({
    title: title,
    fields: [{type: "message", message: message}, {type: "text"}],
    footer: [
      {action: "submit", value: tr.btn("valid"), BSClass: "btn-danger"},
      {action: "quit", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ],
    options: options
  }, callback);
}

export function choose(title = tr.title("choice"), message: string, name, radioButtons, callback) {
  new modal({
    title: title,
    fields: [
      {type: "message", message: message},
      {type: "choice", name: name, radioButtons: radioButtons}
    ],
    footer: [
      {action: "submit", value: tr.btn("valid"), BSClass: "btn-success"},
      {action: "quit", value: tr.btn("cancel"), BSClass: "btn-warning"}
    ]
  }, callback);
}

export function modalForm(parameters, callback) {
  new modal(parameters, callback);
}

export function ownmodal(htmlElm: any, clean, title="Boîte de modale personnalisée") {
  new modal({
    type: "html",
    title: title,
    elm: htmlElm,
    clean: clean
  }, function(){});
}