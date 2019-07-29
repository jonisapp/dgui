export class Translucent {
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
    this.elm.style.left = 0 + window.scrollX + "px";
    this.elm.style.top = 0 + window.scrollY + "px";
    this.elm.style.width = window.innerWidth + "px";
    this.elm.style.height = window.innerHeight + "px";
    //this.fadeIn();  active la transition en javascript (ne pas oublier de désattribuer la classe CSS translucent)
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