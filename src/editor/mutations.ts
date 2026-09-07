export function setDirectText(el:HTMLElement,value:string){
  const directTextNodes=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
  const first=directTextNodes[0];
  if(first){
    first.textContent=value;
    directTextNodes.slice(1).forEach(node=>node.remove());
  }else{
    el.insertBefore(el.ownerDocument.createTextNode(value),el.firstChild);
  }
}
export function duplicateElement(el:HTMLElement){const clone=el.cloneNode(true)as HTMLElement;el.after(clone);return clone}
export function deleteElement(el:HTMLElement){if(['BODY','HTML'].includes(el.tagName))return false;el.remove();return true}
export function moveElement(el:HTMLElement,dir:-1|1){if(dir<0&&el.previousElementSibling)el.parentElement?.insertBefore(el,el.previousElementSibling);if(dir>0&&el.nextElementSibling)el.parentElement?.insertBefore(el.nextElementSibling,el);}
export function cloneBlock(el:HTMLElement){return el.cloneNode(true)as HTMLElement}
export function pasteBlock(target:HTMLElement,source:HTMLElement,where:'before'|'after'){
  const clone=source.cloneNode(true)as HTMLElement;
  if(where==='before')target.before(clone);else target.after(clone);
  return clone;
}
export const setStyle=(el:HTMLElement,key:string,value:string)=>el.style.setProperty(key,value);
