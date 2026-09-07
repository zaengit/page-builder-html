import type{TreeNode}from'../types/editor';export const ID='data-vpb-id';
export function indexDocument(doc:Document){
  const elements=[...doc.querySelectorAll<HTMLElement>('body,body *')];
  const used=new Set<string>();
  let seq=0;
  for(const el of elements){
    const id=el.getAttribute(ID);
    if(!id)continue;
    if(used.has(id)){
      el.removeAttribute(ID);
      continue;
    }
    used.add(id);
    const match=/^vpb-(\d+)$/.exec(id);
    if(match)seq=Math.max(seq,Number(match[1]));
  }
  for(const el of elements){
    if(el.hasAttribute(ID))continue;
    let id='';
    do{id=`vpb-${++seq}`}while(used.has(id));
    el.setAttribute(ID,id);
    used.add(id);
  }
}
export const byId=(doc:Document,id:string|null)=>id?doc.querySelector<HTMLElement>(`[${ID}="${CSS.escape(id)}"]`):null;
export function buildTree(doc:Document):TreeNode[]{
  const walk=(el:Element):TreeNode=>{
    const id=el.getAttribute(ID)!;
    const text=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent?.trim()).filter(Boolean).join(' ').slice(0,24);
    const classLabel=el.getAttribute('class')?.trim().split(/\s+/)[0]||'';
    return{
      id,
      tag:el.tagName.toLowerCase(),
      label:text||el.id||classLabel,
      // Do not use `instanceof HTMLElement` here: iframe elements belong to a
      // different Window/realm and fail instanceof checks against the parent.
      children:Array.from(el.children).map(walk)
    };
  };
  return doc.body?[walk(doc.body)]:[];
}
