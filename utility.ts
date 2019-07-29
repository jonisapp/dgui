export const splitWhereOneOfSeperators = function (str: string, separators: Array<string>) {
  let i = 0, str_arr = [];
  do {
    str_arr = str.split(separators[i]); ++i;
  }
  while(str_arr.length == 1);
  return str_arr;
}

export const copyToClipboard = function (target: string | HTMLElement) {
  var target_elm = null;
  if(typeof target == "string") {
    target_elm = document.createElement("div");
    target_elm.innerHTML = target;
  }
  else if(target instanceof HTMLElement) {
    target_elm = target;
  }
  else {
    alert(new Error("copyToClipboard requires either a string or a HTMLElement as input"));
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

export const elementBelongsToDataType = function(element: any, dataType: string) {
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

export const notEmpty = function(obj: {} | []) {
  if(typeof obj === "object") {
    return Object.keys(obj).length !== 0;
  }
  else if(Array.isArray(obj)) {
    return obj.length !== 0;
  }
  return false;
}


export const join = function(objects_arr: Array<{}>) {
  let single_obj = {};
  objects_arr.forEach((obj) => {
    for(let attr in obj) {
      single_obj[attr] = obj[attr];
    }
  });
  return single_obj;
}

export const setModifier = function(path: string, obj1: {}) {
  let obj2 = {};
  path = (path) ? path + "." : "";
  for(let attr in obj1) {
    obj2[path + attr] =  obj1[attr];
  }
  return {$set: obj2};
}

export const disableDefaultContextmenu = function(elm: any) {
  elm.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  })
}

export const disableMouseSelection = function(elm: any) {
  elm.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
}

export const setDefaultCursor = function(elm: any) {
  elm.style.cursor = "default";
}