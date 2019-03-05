// Utilities



/////////////////////////////////////////////////////////////////

class Translucent {
  elm: HTMLElement;
  opacity: number;
  tmp_body_backgroud: string;

  constructor() {
    var that = this;
    this.opacity = 0.0;
    this.elm = document.createElement("div");
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
    window.removeEventListener("scroll", that.scrollLock);
    document.body.style.background = this.tmp_body_backgroud;
    document.body.style.overflow = "visible";
    this.elm.parentNode.removeChild(this.elm);
  }
}


class Button {
  elm: HTMLElement;
  parent: FormPannel;

  constructor (parent, label, button_BScolor_class) {
    this.parent = parent;
    this.elm = document.createElement("button");
    this.elm.setAttribute("class", "btn "+ button_BScolor_class);
    this.elm.setAttribute("style", "text-align: center; margin-left: 5px; margin-right: 5px");
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


class Field {
  // user
  type: string;
  key: string;
  name: string;
  label: string;
  value: string;
  size: number;
  // constroller
  input_elm: any;
  label_elm: any;
  elm: any;
  // user & controller
  initValue: string;
  radioButtons: Array<radioButton>;

  constructor(field) {
    var that = this;
    for(let attribut in field) {
      this[attribut] = field[attribut];
    }
    //Par défaut un champs dont le type n'est pas définit sera un champs de type text
    if(!field.type) {
      field.type = "text";
      this.type = "text";
    }
    switch(field.type) {
      case "message":
      this.input_elm = document.createElement("div");
      this.input_elm.style.cursor = "default";
      this.input_elm.style.textAlign = "left";
      this.input_elm.innerHTML = field.message; break;
      case "text": case "password":
      this.label_elm = document.createElement("label");
      this.label_elm.textContent = field.label;
      this.input_elm = document.createElement("input");
      this.input_elm.setAttribute("type", field.type);
      this.input_elm.setAttribute("class", "form form-control");
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
    this.elm = document.createElement("div");
    this.elm.setAttribute("class", "dgui-form-pannel-element");
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
    else if(field.type == "text" || field.type == "password") {
      if(field.label) {
        this.elm.appendChild(this.label_elm);
      }
      this.elm.appendChild(this.input_elm);
    }
    else {
      this.elm.appendChild(this.input_elm);
    }
  }
}

interface radioButton {
  // user
  label: string;
  value: string;
  // controller
  input_elm: HTMLInputElement;
  label_elm: HTMLLabelElement;
}
interface button {
  action: string;
  value: string;
  BSClass: string;
}
interface formDisplay {
  maxWidth: number;
  maxHeight: number;
  containerWidth: number;
}

interface MDI_options {
  containerWidth: number;
  containerHeight: number;
  menuItemWidth: number;
  menuLayout: string;
}

class MDI {
  elm: HTMLDivElement;
  menu_elm: HTMLDivElement;
  container_elm: HTMLDivElement;
  lastSelectedElmIndex: any;
  sections: any;
  options: MDI_options;
  menu_layout: any;

  constructor(mdi, parent) {
    for(let attribut in mdi) {
      this[attribut] = mdi[attribut];
    }
    // Initialisation des Sections
    if(typeof this.sections !== "undefined") {
      this.elm = document.createElement("div");
      this.elm.id = parent.id + "_sections_elm";
      this.elm.setAttribute("style", "margin-left: 5px; margin-right: 5px; margin-top: 0px");
      this.menu_elm = document.createElement("div");
      this.menu_elm.id = parent.id + "_sections_tabsElm";
      if(typeof this.options.menuLayout !== "undefined") {
        if(this.options.menuLayout == "horizontal") {
          this.elm.setAttribute("class", "form-pannel-vertical-layout")
          this.menu_elm.setAttribute("class", "form-pannel-layout");
        }
        else if(this.options.menuLayout == "vertical") {
          this.elm.setAttribute("class", "form-pannel-layout")
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
          }
        }
      }
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
                  that.setTabStyle(lastSelectedTab, {backgroundColor: "#BABABA", height: "40px", marginTop: "7px", borderBottomWidth: "1px", fontWeight: "normal", borderColor: "#8A8A8A"});
                }
                else {
                  that.setTabStyle(lastSelectedTab, {backgroundColor: "#BABABA", height: "40px", marginLeft: "7px", borderRightWidth: "1px", fontWeight: "normal", borderColor: "#8A8A8A"});
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
            this.initFields(this.sections[i], section_fields, scrollElm);
            this.sections[i].elm.appendChild(scrollElm);
  ////////////////////////////
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

  initTab(tab) {
    if(this.options.menuLayout == "horizontal") {
      this.setTabStyle(tab, {backgroundColor: "#D3D3D3", height: "44px", marginTop: "3px", borderBottomWidth: "0px", fontWeight: "bold", borderColor: "#AAAAAA"});
    }
    else if(this.options.menuLayout == "vertical") {
      this.setTabStyle(tab, {backgroundColor: "#D3D3D3", height: "44px", marginLeft: "3px", borderRightWidth: "0px", fontWeight: "bold", borderColor: "#AAAAAA"});
    }
    if(this.options.menuItemWidth) {
      this.setTabStyle(tab, {width: this.options.menuItemWidth+4+"px"});
    }
  }

  initFields(section, section_fields, scrollElm) {
    section_fields.forEach(function(field_s) {
      if(Array.isArray(field_s)) {
        var formPannelLayout = document.createElement("div");
        formPannelLayout.setAttribute("class", "form-pannel-layout");
        var reduce_padding = (field_s.length > 3) ? true : false;
        if(reduce_padding) {
          formPannelLayout.style.paddingLeft = 15+"px";
          formPannelLayout.style.paddingRight = 15+"px";
        }
        var fields_inputs = [];
        field_s.forEach(function(field) {
          field = new Field(field);
          fields_inputs.push({input: field.input_elm, max: (field.max) ? field.max : null});
          section.fields.push(field);
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
        let field = new Field(field_s);
        section.fields.push(field);
        scrollElm.appendChild(field.elm);
      }
    });
  }

  initSection(sectionElm) {
    sectionElm.style.display = "block";
  }
}


////////////////////////////////// Classe FormPannel //////////////////////////////////

class FormPannel {
  id: string;
  type: string
  elm: HTMLDivElement;        //dom element de formPannel
  parent: modal;
  title: string;
  fields: Array<Field>;
  footer: Array<button>;
  display: formDisplay;
  // user & controller
  errorMessage_elm: any;
  MDI: MDI;
  footer_elm: HTMLDivElement;

  constructor(properties, parent) {
    var that = this;
    for(let property in properties) {
      this[property] = properties[property];
    }
    this.parent = parent;
    this.elm = document.createElement("div");
    this.elm.setAttribute("style", "background-color: #B9BAB8; padding: 5px; padding-top: 0px; border-radius: 7px; margin-bottom: 30px; border: 1px solid #B2B2B2;");
    this.elm.addEventListener("keydown", function(e) {
      if(e.keyCode == 13) {
        that.submit();
      }
    });

    if(typeof this.MDI !== "undefined") {
      this.MDI = new MDI(this.MDI, this);
    }
    
    // Initalisation des Fields
    if(typeof this.fields !== "undefined") {
      for(let i=0; i<this.fields.length; ++i) {
        this.fields[i] = new Field(this.fields[i]);
      }
    }

    this.initDisplay();

    // initialisation
    let formPannelHeader = document.createElement("div");
    formPannelHeader.setAttribute("style", "padding: 7px");
    let formPannelTitle = document.createElement("div");
    formPannelTitle.setAttribute("style", "font-size: 18px; font-weight: bold; color: rgba(0, 0, 0, 0.86); cursor: default");
    formPannelTitle.textContent = this.title;
    formPannelHeader.appendChild(formPannelTitle);
    var formPannelBody = document.createElement("div");
    this.errorMessage_elm = document.createElement("div");
    this.errorMessage_elm.setAttribute("style", "display: none; background-color: #e26c6c; color: white; border-radius: 3px; font-weight: normal; margin: 5px; padding: 5px;");
    if(this.display) {
      if(this.display.containerWidth) {
        this.errorMessage_elm.style.width = this.display.containerWidth+150+"px";
      }
    }
    formPannelBody.appendChild(this.errorMessage_elm);
    if(typeof this.MDI !== "undefined") {
      formPannelBody.appendChild(this.MDI.elm);
    }
    formPannelBody.setAttribute("style", "padding: 10px; background-color: #DDDDDD; border-radius: 7px; text-align: center;");
    if(typeof this.fields !== "undefined") {
      var that = this;
      this.fields.map(function(field, index) {
        if(field.type != "choice") {
          (function(field, index, that){
            field.input_elm.addEventListener("keydown", function(e) {
              if(e.keyCode == 9 && (index < that.fields.length-1)) {
                e.preventDefault();
                that.fields[index+1].input_elm.focus();
              }
            });
          })(field, index, that);
        }
        formPannelBody.appendChild(field.elm);
      });
    }

    this.initFooter();

    if(typeof properties.elm !== "undefined") {
      formPannelBody.appendChild(properties.elm);
    }

    formPannelBody.appendChild(this.footer_elm);
    this.elm.appendChild(formPannelHeader);
    this.elm.appendChild(formPannelBody);
  }
  
  initDisplay() {
    if(typeof this.display !== "undefined") {
      for(let attribut in this.display) {
        switch(attribut) {
          case "width":
            this.elm.style.width = this.display[attribut]+"px"; break;
          case "height":
            this.elm.style.height = this.display[attribut]+"px"; break;
          case "maxWidth":
            this.elm.style.maxWidth = this.display[attribut]+"px"; break;
          case "maxHeight":
            this.elm.style.maxHeight = this.display[attribut]+"px"; break;
          case "containerWidth":
            //this.sections_containerElm.style.width = this.display[attribut]+"px"; break;
        }
      }
    }
  }

  initFooter() {
    var that = this;

    if(typeof this.footer === "undefined") {
      this.footer = [
        {action: "submit", value: "Valider", BSClass: "btn-success"},
        {action: "abort", value: "Annuler", BSClass: "btn-warning"}
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
    if(typeof this.fields !== "undefined") {
      values.push(this.submitFields(this.fields));
    }
    if(typeof this.MDI !== "undefined") {
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

  submitFields(fields) {
    var that = this;
    var values = [];
    fields.forEach(function(field) {
      that.submitField(field, values);
    });
    let proper_values = this.properType(values);
    return proper_values;
  }

  submitField(field, values) {
    if(field.type == "text" || field.type == "password") {
      // On ne soumet que les champs dont la valeur a été modifiée
      if(field.input_elm.value != field.initValue) {
        // Si le champs possède un attribut key il sera renvoyé sous forme d'objet (key: value)
        if(typeof field.key !== "undefined") {
          let objTextField = {};
          objTextField[field.key] = field.input_elm.value;
          values.push(objTextField);
        }
        else {
          values.push(field.input_elm.value);
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
    this.feedback(false);
    this.background.del();
  }
}

//////////////////////////////////// Boîtes de dialogue communes dGUI ////////////////////////////////////

export function alert(message, callback, title="Information") {
  new modal({
    title: title,
    fields: [{type: "message", message: message}],
    footer: [{action: "quit", value: "D'accord", BSClass: "btn-success"}]
  }, callback);
}

export function confirm(message: string, title="Confirmation", callback: Function) {
  if(typeof title == "function") {
    callback = title;
    title = "Confirmation";
  }
  new modal({
    title: title,
    fields: [{type: "message", message: message}],
    footer: [
      {action: "confirm", value: "Confirmer", BSClass: "btn-danger"},
      {action: "abort", value: "Annuler", BSClass: "btn-warning"}
    ]
  }, callback);
}

export function prompt(message, callback, title="Saisie", maxWidth=500) {
  new modal({
    title: title,
    fields: [{type: "message", message: message}, {type: "text"}],
    footer: [
      {action: "submit", value: "Confirmer", BSClass: "btn-danger"},
      {action: "quit", value: "Annuler", BSClass: "btn-warning"}
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