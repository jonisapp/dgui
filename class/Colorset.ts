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

export class ColorSet {
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
    this.secBrdColor = this.algo0(this.secColor, 20);
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
