import{useEffect}from'react';
import{indexDocument,ID}from'../editor/selection';
import{ELEMENT_DRAG_TYPE}from'./ElementTree';
import type{EditorContextValue,InsertPosition}from'../types/editor';

const widths={desktop:'100%',tablet:'768px',mobile:'375px'};
const voidTags=new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR','IFRAME']);

function dropPosition(target:HTMLElement,clientY:number):InsertPosition{
  if(voidTags.has(target.tagName))return clientY<target.getBoundingClientRect().top+target.getBoundingClientRect().height/2?'before':'after';
  const rect=target.getBoundingClientRect();
  const ratio=rect.height?((clientY-rect.top)/rect.height):.5;
  if(ratio<.25)return'before';
  if(ratio>.75)return'after';
  return'inside';
}

export function Canvas({e}:{e:EditorContextValue}){
  useEffect(()=>{
    const f=e.iframeRef.current;if(!f)return;
    const onLoad=()=>{
      const d=f.contentDocument;if(!d)return;
      indexDocument(d);
      const style=d.createElement('style');
      style.dataset.vpbUi='';
      style.textContent='[data-vpb-hover]{outline:2px dashed #60a5fa!important;outline-offset:2px}[data-vpb-selected]{outline:2px solid #2563eb!important;outline-offset:2px}[data-vpb-drop="inside"]{box-shadow:inset 0 0 0 3px #22c55e!important}[data-vpb-drop="before"]{box-shadow:inset 0 3px 0 #22c55e!important}[data-vpb-drop="after"]{box-shadow:inset 0 -3px 0 #22c55e!important}';
      d.head?.append(style);
      let hover:HTMLElement|null=null;
      let dropTarget:HTMLElement|null=null;
      const clearDrop=()=>{dropTarget?.removeAttribute('data-vpb-drop');dropTarget=null};
      d.addEventListener('mouseover',ev=>{const t=ev.target as HTMLElement;if(!t?.getAttribute)return;hover?.removeAttribute('data-vpb-hover');hover=t;hover.setAttribute('data-vpb-hover','')});
      d.addEventListener('mouseout',()=>hover?.removeAttribute('data-vpb-hover'));
      d.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const t=ev.target as HTMLElement;d.querySelectorAll('[data-vpb-selected]').forEach(x=>x.removeAttribute('data-vpb-selected'));t.setAttribute('data-vpb-selected','');e.select(t.getAttribute(ID))},true);
      d.addEventListener('submit',ev=>ev.preventDefault(),true);
      d.addEventListener('dragover',ev=>{
        const types=[...ev.dataTransfer?.types||[]];
        if(!types.includes(ELEMENT_DRAG_TYPE))return;
        ev.preventDefault();
        if(ev.dataTransfer)ev.dataTransfer.dropEffect='copy';
        const t=ev.target as HTMLElement;if(!t?.getAttribute)return;
        const pos=dropPosition(t,ev.clientY);
        if(dropTarget!==t){clearDrop();dropTarget=t}
        dropTarget.setAttribute('data-vpb-drop',pos);
      },true);
      d.addEventListener('dragleave',ev=>{if(!(ev.relatedTarget instanceof d.defaultView!.Node))clearDrop()},true);
      d.addEventListener('drop',ev=>{
        const kind=ev.dataTransfer?.getData(ELEMENT_DRAG_TYPE);if(!kind)return;
        ev.preventDefault();ev.stopPropagation();
        const t=ev.target as HTMLElement;
        const pos=dropPosition(t,ev.clientY);
        const targetId=t.getAttribute(ID);
        clearDrop();
        e.insertElement(kind,pos,targetId);
      },true);
      e.refresh();
    };
    f.addEventListener('load',onLoad);
    return()=>f.removeEventListener('load',onLoad)
  },[e.html]);

  return <main className="min-w-0 flex-1 overflow-auto bg-zinc-900 p-2 pb-16 sm:p-4 sm:pb-4 lg:p-5"><div className="mx-auto h-full min-h-[420px] overflow-hidden rounded-md bg-white shadow-2xl transition-[width] duration-200 sm:min-h-[500px] sm:rounded-lg" style={{width:widths[e.device],maxWidth:'100%'}}>{e.html?<iframe ref={e.iframeRef} srcDoc={e.html} sandbox="allow-same-origin" className="h-full min-h-[calc(100dvh-118px)] w-full border-0 sm:min-h-[calc(100dvh-90px)]" title="HTML canvas"/>:<div className="flex h-full min-h-[420px] items-center justify-center px-6 text-center text-sm text-zinc-400 sm:min-h-[500px]">Upload an HTML file to start editing</div>}</div></main>
}
