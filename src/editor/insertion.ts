import{ID}from'./selection';

export type InsertPosition='inside'|'before'|'after';

const voidTags=new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR']);

export function canContainChildren(el:Element){return !voidTags.has(el.tagName)}

export function insertNode(doc:Document,target:HTMLElement|null,node:Node,position:InsertPosition){
  if(!target||target===doc.body){doc.body.appendChild(node);return}
  if(position==='inside'&&canContainChildren(target)){target.appendChild(node);return}
  if(position==='before'&&target.parentNode){target.before(node);return}
  if(position==='after'&&target.parentNode){target.after(node);return}
  if(target.parentNode)target.after(node);else doc.body.appendChild(node)
}

export function parseHtmlSnippet(doc:Document,html:string){
  const template=doc.createElement('template');
  template.innerHTML=html.trim();
  template.content.querySelectorAll(`[${ID}]`).forEach(el=>el.removeAttribute(ID));
  template.content.querySelectorAll('[data-vpb-selected],[data-vpb-hover]').forEach(el=>{el.removeAttribute('data-vpb-selected');el.removeAttribute('data-vpb-hover')});
  const firstElement=template.content.firstElementChild as HTMLElement|null;
  return{fragment:template.content,firstElement};
}
