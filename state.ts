

export const dguiUserInterface = {
  dguiObjects: {}
}

export const get = function(interfaceObj_str: string) {
  return (dguiUserInterface.dguiObjects[interfaceObj_str]) ? dguiUserInterface.dguiObjects[interfaceObj_str] : false;
}