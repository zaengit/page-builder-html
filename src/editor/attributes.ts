export const isInternalAttribute=(name:string)=>name.toLowerCase().startsWith('data-vpb-');
export const isEventAttribute=(name:string)=>/^on/i.test(name);
export const isEditableAttribute=(name:string)=>{const n=name.trim().toLowerCase();return !!n&&n!=='style'&&!isInternalAttribute(n)&&!isEventAttribute(n)};

export function editableAttributes(el:HTMLElement){return [...el.attributes].filter(a=>isEditableAttribute(a.name)&&!['id','class','title'].includes(a.name.toLowerCase())).map(a=>({name:a.name,value:a.value}))}

export function idConflict(doc:Document,el:HTMLElement,id:string){const next=id.trim();if(!next)return false;return [...doc.querySelectorAll<HTMLElement>('[id]')].some(x=>x!==el&&x.id===next)}

export function createUniqueElementId(doc:Document,el:HTMLElement){
  const base=`vpb-${el.tagName.toLowerCase()}`;
  let index=1;
  let id=`${base}-${index}`;
  while(doc.getElementById(id)){index++;id=`${base}-${index}`}
  return id;
}

export function setSafeAttribute(el:HTMLElement,name:string,value:string){const n=name.trim();if(!isEditableAttribute(n))return false;const v=value.trim();if(v)el.setAttribute(n,v);else el.removeAttribute(n);return true}
