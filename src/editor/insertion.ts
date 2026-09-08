import{ID}from'./selection';

export type InsertPosition='inside'|'before'|'after';

const voidTags=new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR']);
const phrasingOnly=new Set(['A','ABBR','B','BDI','BDO','BUTTON','CITE','CODE','DEL','EM','H1','H2','H3','H4','H5','H6','I','INS','KBD','LABEL','MARK','P','Q','S','SAMP','SMALL','SPAN','STRONG','SUB','SUP','TIME','U','VAR']);
const blockTags=new Set(['ADDRESS','ARTICLE','ASIDE','BLOCKQUOTE','DETAILS','DIALOG','DIV','DL','FIELDSET','FIGURE','FOOTER','FORM','H1','H2','H3','H4','H5','H6','HEADER','HR','MAIN','NAV','OL','P','PRE','SECTION','TABLE','UL']);

export function canContainChildren(el:Element){return !voidTags.has(el.tagName)}

function firstElementTag(node:Node){
  if(node.nodeType===Node.ELEMENT_NODE)return(node as Element).tagName;
  if(node.nodeType===Node.DOCUMENT_FRAGMENT_NODE)return(node as DocumentFragment).firstElementChild?.tagName||null;
  return null;
}

export function canInsertInside(target:Element,node:Node){
  if(!canContainChildren(target))return false;
  const childTag=firstElementTag(node);
  if(!childTag)return true;
  if(phrasingOnly.has(target.tagName)&&blockTags.has(childTag))return false;
  if((target.tagName==='UL'||target.tagName==='OL')&&childTag!=='LI')return false;
  if(target.tagName==='SELECT'&&!['OPTION','OPTGROUP'].includes(childTag))return false;
  if(target.tagName==='TABLE'&&!['CAPTION','COLGROUP','THEAD','TBODY','TFOOT','TR'].includes(childTag))return false;
  if(target.tagName==='TR'&&!['TD','TH'].includes(childTag))return false;
  return true;
}

export function insertNode(doc:Document,target:HTMLElement|null,node:Node,position:InsertPosition){
  if(!target||target===doc.body){doc.body.appendChild(node);return}
  if(position==='inside'&&canInsertInside(target,node)){target.appendChild(node);return}
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
