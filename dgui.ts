
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
  value: string | number | Array<string> | Array<number>;
}

/* --------------------------------- CLASS Field -------------------------------------------------------*/

class Field {

  /*                                              - Définition -                                        */
  // user
  type: "message" | "button" | "text" | "quantity" | "choice" | "switch" | "select";
  key: string;
  name: string;
  label: string;
  value: string | boolean | number;
  size: number;
  list: Array<string> | Array<Object>;
  action: any;
  condition: boolean | field_condition;
  BSClass: string;
  group: string;
  // constroller
  parent?: FormPannel;
  input_elm: any;
  button_elm: HTMLButtonElement;
  label_elm: HTMLLabelElement;
  elm: any;
  switched: boolean;
  // user & controller
  initValue: string | boolean | number;
  radioButtons: Array<field_radioButton>;

  /*                                              - Constructor -                                       */
  constructor(field, parent?: FormPannel) {
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
    /*                                            - init according to type -                            */
    switch(field.type) {
      case "switch":
      this.input_elm = document.createElement("div");
      this.input_elm.setAttribute("class", "invoice-leftMenu-button");
      this.input_elm.setAttribute("style", "display: flex; justify-content: center; align-items: center");
      let text_elm = document.createElement("div");
      text_elm.textContent = this.label;
      this.input_elm.appendChild(text_elm);
      this.input_elm.setAttribute("class", (this.initValue) ? "invoice-leftMenu-button-selected" : "invoice-leftMenu-button");
      this.value = this.initValue;
      this.input_elm.addEventListener("click", (e) => {
        let elm = e.currentTarget;
        if(!that.value) {
          if(that.parent && that.group) {
            that.parent.groups.forEach((group) => {
              if(group.name == that.group) {
                group.fields.forEach((field) => {
                  field.value = false;
                  field.input_elm.setAttribute("class", "invoice-leftMenu-button");
                });
              }
            });
          }
          elm.setAttribute("class", "invoice-leftMenu-button-selected");
          that.value = true;
        }
        else {
          elm.setAttribute("class", "invoice-leftMenu-button");
          that.value = false;
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
        this.button_elm.addEventListener("click", that.action);
      case "text": case "password": case "quantity":
        if(field.label) {
          this.label_elm = document.createElement("label");
          this.label_elm.textContent = field.label;
          this.label_elm.setAttribute("style", "text-align: left");
        }
        this.input_elm = document.createElement("input");
        this.input_elm.setAttribute("type", field.type);
        this.input_elm.setAttribute("class", "form form-control");
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
        if(typeof this.initValue !== "undefined") {
          this.input_elm.value = this.initValue;
        }
        else {
          this.initValue = "";
        } break;
      case "select":
        if(this.list) {
          this.input_elm = document.createElement("select");
          this.input_elm.setAttribute("class", "form form-control");
          this.list.forEach((list_item, i) => {
            let option = document.createElement("option");
            option.setAttribute("value", i.toString());
            option.textContent = list_item;
            this.input_elm.appendChild(option);
          });
          this.input_elm.addEventListener("input", (e) => {
            that.value = e.currentTarget.value;
          });
        }
        break;
      case "choice":
        if(typeof this.radioButtons !== "undefined") {
          this.radioButtons.map(function(radioButton, index) {
            radioButton.input_elm = document.createElement("input");
            let input_elm_id = "radio_"+field.name+"_"+index;
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
    if(field.type == "quantity") {
      this.input_elm.setAttribute("type", "number");
      this.input_elm.setAttribute("step", "1");
      this.input_elm.setAttribute("min", "0");
      if(!this.initValue) {
        this.input_elm.value = "1";
      }
    }
    /*                                            - init display -                                      */
    this.elm = document.createElement("div");
    if(field.type != "message") {
      this.elm.setAttribute("class", "dgui-form-pannel-element");
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
    else if(this.type == "button") {
      this.elm.appendChild(this.button_elm);
    }
    else if(field.type == "text" || field.type == "password") {
      if(field.label) {
        this.elm.appendChild(this.label_elm);
      }
      this.elm.appendChild(this.input_elm);
    }
    else {
      this.elm.appendChild(this.input_elm);
    }
    /*                                            - display according to condition -                    */
    if(typeof this.condition !== "undefined") {
      if(typeof this.condition === "boolean") {
        if(this.condition === false) {
          this.elm.style.display = "none";
        }
      }
      else if((this.condition.key && this.condition.value) && this.parent) {
        this.parent.fields.forEach((field) => {
          if(field.key == this.condition.key) {
            that.check_condition(field);
            field.input_elm.addEventListener("input", (e) => {
              that.check_condition(e.currentTarget);
            });
          }
        });
      }
    }
  }

  check_condition(targetField) {
    if(Array.isArray(this.condition.value)) {
      this.elm.style.display = (this.condition.value.includes(targetField.value)) ? "block" : "none";
    }
    else {
      this.elm.style.display = (this.condition.value == targetField.value) ? "block" : "none";
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
                  that.setTabStyle(lastSelectedTab, {backgroundColor: that.parent.colorSet.thrColor, height: "40px", marginTop: "7px", borderBottomWidth: "1px", fontWeight: "normal", borderColor: "#8A8A8A"});
                }
                else {
                  that.setTabStyle(lastSelectedTab, {backgroundColor: that.parent.colorSet.thrColor , height: "40px", marginLeft: "7px", borderRightWidth: "1px", fontWeight: "normal", borderColor: "#8A8A8A"});
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
      this.setTabStyle(tab, {backgroundColor: this.parent.colorSet.secColor , height: "44px", marginTop: "3px", borderBottomWidth: "0px", fontWeight: "normal", borderColor: "#AAAAAA"});
    }
    else if(this.options.menuLayout == "vertical") {
      this.setTabStyle(tab, {backgroundColor: this.parent.colorSet.secColor, height: "44px", marginLeft: "3px", borderRightWidth: "0px", fontWeight: "normal", borderColor: "#AAAAAA"});
    }
    if(this.options.menuItemWidth) {
      this.setTabStyle(tab, {width: this.options.menuItemWidth+4+"px"});
    }
  }

  initSection(sectionElm) {
    sectionElm.style.display = "block";
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Form dGUI ///////////////////////////////////////////////////////////

class ColorSet {
  prmColor: string;
  secColor: string;
  thrColor: string;
  borderColor: string;
  arr_baseIntensity: Array<string>;

  constructor(color1: string, color2?: string, color3?: string) {
    this.arr_baseIntensity = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    this.prmColor = color1;
    this.secColor = (color2) ? color2 : this.calculateColor(color1, 20);
    this.thrColor = (color3) ? color3 : this.calculateColor(this.secColor, 40);
    console.log(this.secColor);
    console.log(this.thrColor);
  }

  calculateColor(hexa_color: string, diff: number) {
    let r_1 = hexa_color.substr(1, 1);
    let r_2 = hexa_color.substr(2, 1);
    let g_1 = hexa_color.substr(3, 1);
    let g_2 = hexa_color.substr(4, 1);
    let b_1 = hexa_color.substr(5, 1);
    let b_2 = hexa_color.substr(6, 1);
    return "#" + this.addIntensity(r_1, r_2, diff) + this.addIntensity(g_1, g_2, diff) + this.addIntensity(b_1, b_2, diff); 
  }

  addIntensity(comp1: string, comp2: string, diff: number) {
    let res_comp1 = this.arr_baseIntensity.indexOf(comp1) + 1;
    let res_comp2 = this.arr_baseIntensity.indexOf(comp2) - diff + 1;
    if(res_comp2 < 0) {
      let remainning = (res_comp2 * -1 > 16) ? (res_comp2 * -1) % 16 : res_comp2 * -1;
      let unities = (res_comp2 * -1 >= this.arr_baseIntensity.length) ? Math.round((res_comp2 * -1) / this.arr_baseIntensity.length) : 1;
      console.log(unities);
      res_comp2 = this.arr_baseIntensity.length - remainning;
      res_comp1 -= unities;
    }
    return this.arr_baseIntensity[res_comp1-1] + this.arr_baseIntensity[res_comp2-1];
  }
}

/* --------------------------------- Interfaces FormPannel ---------------------------------------------*/

interface formPannel_options {
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
  id: string;
  type: string
  elm: HTMLDivElement;
  parent: modal;
  title: string;
  fields: Array<Field>;
  footer: Array<button>;
  options: formPannel_options;
  // user & controller
  errorMessage_elm: any;
  MDI: MDI;
  footer_elm: HTMLDivElement;
  // controller
  colorSet: ColorSet;
  groups: Array<formPannel_fieldGroup>;

  constructor(properties, parent) {
    var that = this;
    for(let property in properties) {
      this[property] = properties[property];
    }
    this.parent = parent;
    this.groups = [];

    if(!this.options) {
      this.options = {};
    }
    if(!this.options.shape) {this.options.shape = "rounded";}
    if(!this.options.color) {this.options.color = "#D3D3D3";}
    this.colorSet = new ColorSet(this.options.color);

    this.elm = document.createElement("div");
    this.elm.setAttribute("style", "background-color: #B9BAB8; padding: 5px; padding-top: 0px; border-radius: 7px; margin-bottom: 30px; border: 1px solid #B2B2B2;");
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
    this.elm.appendChild(scrollElm);

    this.initDisplay();
    // initialisation
    let formPannelHeader = document.createElement("div");
    formPannelHeader.setAttribute("style", "padding: 7px");
    let formPannelTitle = document.createElement("div");
    setDefaultCursor(formPannelTitle);
    formPannelTitle.setAttribute("style", "font-size: 18px; font-weight: bold; color: rgba(0, 0, 0, 0.86);");
    formPannelTitle.textContent = this.title;
    formPannelHeader.appendChild(formPannelTitle);
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
    formPannelBody.setAttribute("style", "padding: 10px; border-radius: 7px; text-align: center;");
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
      fields.forEach(function(field_s) {
        if(Array.isArray(field_s)) {
          var formPannelLayout = document.createElement("div");
          formPannelLayout.setAttribute("class", "dgui-form-pannel-layout");
          var reduce_padding = (field_s.length > 1) ? true : false;
          if(reduce_padding) {
            formPannelLayout.style.paddingLeft = 15+"px";
            formPannelLayout.style.paddingRight = 15+"px";
          }
          var fields_inputs = [];
          field_s.forEach(function(field) {
            field = new Field(field, that);
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
            fieldsContainer.fields.push(field);
            if(reduce_padding) {
              field.elm.style.paddingLeft = 5+"px";
              field.elm.style.paddingRight = 5+"px";
            }
            formPannelLayout.appendChild(field.elm);
          });
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
          let field = new Field(field_s, that);
          fieldsContainer.fields.push(field);
          scrollElm.appendChild(field.elm);
        }
      });
    }
    console.log(this.groups);
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
        {action: "submit", value: "Submit", BSClass: "btn-success"},
        {action: "abort", value: "Cancel", BSClass: "btn-warning"}
      ];
    }
    this.footer_elm = document.createElement("div");
    this.footer_elm.setAttribute("class", "form-pannel-footer");
    var that = this;
    this.footer.map(function(button_params) {
      let button = new Button(that, button_params.value, button_params.BSClass);
      button.setAction(button_params.action);
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
    this.parent.quit();
  }

  submit() {
    var that = this;
    let values = [];
    if(this.fields) {
      values.push(this.submitFields(this.fields));
    }
    if(this.groups) {
      values.push(this.submitGroups(this.groups));
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
    this.parent.submit({value: proper_values, end: function(){
      that.parent.quit();
    }, errorMessage: function(message) {
      that.errorMessage_elm.textContent = message;
      that.errorMessage_elm.style.display = "block";
    }});
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
    if(field.type == "text" || field.type == "password" || field.type == "quantity" || field.type == "select") {
      // On ne soumet que les champs dont la valeur a été modifiée
      if(field.input_elm.value != initValue) {
        // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
        if(typeof field.key !== "undefined") {
          let objTextField = {};
          objTextField[field.key] = field.input_elm.value;
          if(field.type == "select" || field.type == "quantity") {
            objTextField[field.key] = parseInt(field.input_elm.value);
          }
          values.push(objTextField);
        }
        else {
          values.push(field.input_elm.value);
        }
      }
    }
    else if(field.type == "switch") {
      // On ne soumet que les champs dont la valeur a été modifiée
      if(field.value != initValue) {
        // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
        if(typeof field.key !== "undefined") {
          let objSwitchField = {};
          objSwitchField[field.key] = field.value;
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
    this.selected_items = [];
    this.mouseover = false;
    //                                            - Initial DOM setup -
    this.elm = document.createElement("div");
    this.elm.setAttribute("class", "dgui-contextMenu light-shadow");
    this.elm.setAttribute("data-type", "dgui_contextMenu")
    if(this.options) {
      if(this.options.initPosition) {
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
      }
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
            that.fields.forEach((field) => {
              if(field.type == "context") {
                if(field.contextMenuObj) {
                  field.contextMenuObj.close();
                  delete field.contextMenuObj;
                }
              }
            });
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
    let elm_htmlPosition = this.elm.getBoundingClientRect();
    if(elm_htmlPosition.right > window.innerWidth) {
      console.log("on est dans ce cas");
      if(this.parent_menu) {
        let parentElm_htmlPosition = this.parent.elm.getBoundingClientRect();
        this.elm.style.left = parentElm_htmlPosition.left - elm_htmlPosition.width+"px";
        this.parent_menu.options.initPosition = "left";
      }
    }
    setTimeout(() => {
      document.body.addEventListener("mousedown", this.event_close);
    }, 10);
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
    title: title || "Information",
    fields: [{type: "message", message: message}],
    footer: [{action: "quit", value: "Ok", BSClass: "btn-success"}]
  }, callback);
}

export function confirm(message: string, title="Confirm", callback: Function) {
  if(typeof title == "function") {
    callback = title;
    title = "Confirmation";
  }
  new modal({
    title: title,
    fields: [{type: "message", message: message}],
    footer: [
      {action: "confirm", value: "Confirm", BSClass: "btn-danger"},
      {action: "abort", value: "Cancel", BSClass: "btn-warning"}
    ]
  }, callback);
}

export function prompt(message, title="Entry", callback, maxWidth=500) {
  new modal({
    title: title,
    fields: [{type: "message", message: message}, {type: "text"}],
    footer: [
      {action: "submit", value: "Submit", BSClass: "btn-danger"},
      {action: "quit", value: "Cancel", BSClass: "btn-warning"}
    ],
    display: {maxWidth: maxWidth}
  }, callback);
}

export function choose(title="Choix", message, name, radioButtons, callback) {
  new modal({
    title: title,
    fields: [
      {type: "message", message: message},
      {type: "choice", name: name, radioButtons: radioButtons}
    ],
    footer: [
      {action: "submit", value: "Valider", BSClass: "btn-success"},
      {action: "quit", value: "Annuler", BSClass: "btn-warning"}
    ]
  }, callback);
}

export function modalForm(parameters, callback) {
  new modal(parameters, callback);
}

export function ownmodal(htmlElm, clean, title="Boîte de modale personnalisée") {
  new modal({
    type: "html",
    title: title,
    elm: htmlElm,
    clean: clean
  }, function(){});
}