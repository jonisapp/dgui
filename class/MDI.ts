//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// MDIs dGUI ///////////////////////////////////////////////////////////

/* --------------------------------- Interfaces MDI ----------------------------------------------------*/

interface MDI_options {
  containerWidth?: number;
  containerHeight?: number;
  menuItemWidth?: number;
  menuLayout?: string;
  initSection?: number;
  shape?: "rounded" | "squared";
}

/* --------------------------------- CLASS MDI ---------------------------------------------------------*/

export class MDI {
  elm: HTMLDivElement;
  menu_elm: HTMLDivElement;
  container_elm: HTMLDivElement;
  lastSelectedElmIndex: any;
  sections: any;
  options: MDI_options;
  menu_layout: any;
  parent: Form;

  constructor(mdi, parent) {
    for(let attribut in mdi) {
      this[attribut] = mdi[attribut];
    }
    this.parent = parent;
    if(!this.options) { this.options = {}; }
    if(!this.options.menuLayout) { this.options.menuLayout = "horizontal";  }
    if(!this.options.shape) { this.options.shape = this.parent.options.shape; }
    this.options.initSection = (this.options.initSection) ? this.options.initSection : 0;
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
      this.lastSelectedElmIndex = this.options.initSection;
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
          this.sections[i].options = (this.sections[i].options) ? this.sections[i].options : {};
          this.sections[i].elm = document.createElement("div");
          this.sections[i].elm.id = parent.id + "_section" + i.toString();
          this.sections[i].elm.setAttribute("class", "form-pannel-vertical-layout");
          this.sections[i].elm.setAttribute("style", "display: none;");
          if(this.sections[i].template) {
            this.sections[i].template = new BlazeTemplate(this.sections[i].template, this.sections[i]);
            this.sections[i].elm.appendChild(this.sections[i].template.elm);
          }
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
      this.initTab(this.sections[this.options.initSection].tabElm);
      this.initSection(this.sections[this.options.initSection].elm);
    }
    var that = this;
    this.sections.forEach((section) => {
      section.fields.forEach((field) => {
        that.parent.fields.push(field);
      });
    });
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