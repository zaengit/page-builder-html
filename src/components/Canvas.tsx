import{useCallback,useEffect,useState}from'react';
import{ArrowDown,ArrowUp,ClipboardCopy,ClipboardPaste,Copy,Trash2}from'lucide-react';
import{indexDocument,ID}from'../editor/selection';
import{ELEMENT_DRAG_TYPE}from'./ElementTree';
import type{EditorContextValue,InsertPosition}from'../types/editor';

const widths={desktop:'100%',tablet:'768px',mobile:'375px'};
const voidTags=new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR','IFRAME']);
const BLOCK_DRAG_TYPE='application/x-vpb-block';

type ToolbarPos={left:number;top:number;tag:string}|null;

function dropPosition(target:HTMLElement,clientY:number):InsertPosition{
  if(voidTags.has(target.tagName))return clientY<target.getBoundingClientRect().top+target.getBoundingClientRect().height/2?'before':'after';
  const rect=target.getBoundingClientRect();
  const ratio=rect.height?((clientY-rect.top)/rect.height):.5;
  if(ratio<.25)return'before';
  if(ratio>.75)return'after';
  return'inside';
}

export function Canvas({e}:{e:EditorContextValue}){
  const[toolbar,setToolbar]=useState<ToolbarPos>(null);

  const positionToolbar=useCallback(()=>{
    const f=e.iframeRef.current;
    const d=f?.contentDocument;
    if(!f||!d||!e.selectedId){setToolbar(null);return}
    const el=d.querySelector<HTMLElement>(`[${ID}="${e.selectedId}"]`);
    if(!el||['HTML','BODY'].includes(el.tagName)){setToolbar(null);return}
    const rect=el.getBoundingClientRect();
    const maxLeft=Math.max(8,f.clientWidth-292);
    const left=Math.max(8,Math.min(rect.left,maxLeft));
    const top=Math.max(8,rect.top-38);
    setToolbar({left,top,tag:el.tagName.toLowerCase()});
  },[e.selectedId,e.iframeRef]);

  useEffect(()=>{positionToolbar()},[positionToolbar,e.device]);

  useEffect(()=>{
    const f=e.iframeRef.current;if(!f)return;
    const onLoad=()=>{
      const d=f.contentDocument;if(!d)return;
      indexDocument(d);
      const style=d.createElement('style');
      style.dataset.vpbUi='';
      style.textContent='[data-vpb-hover]{outline:2px dashed #60a5fa!important;outline-offset:2px}[data-vpb-selected]{outline:2px solid #2563eb!important;outline-offset:2px}[data-vpb-drop="inside"]{box-shadow:inset 0 0 0 3px #22c55e!important}[data-vpb-drop="before"]{box-shadow:inset 0 3px 0 #22c55e!important}[data-vpb-drop="after"]{box-shadow:inset 0 -3px 0 #22c55e!important}[data-vpb-dragging]{opacity:.45!important}';
      d.head?.append(style);
      let hover:HTMLElement|null=null;
      let dropTarget:HTMLElement|null=null;
      let dragSource:HTMLElement|null=null;
      const clearDrop=()=>{dropTarget?.removeAttribute('data-vpb-drop');dropTarget=null};
      const clearGeneratedDraggable=()=>{d.querySelectorAll<HTMLElement>('[data-vpb-added-draggable]').forEach(el=>{el.removeAttribute('data-vpb-added-draggable');el.removeAttribute('draggable')})};
      const makeSelectedDraggable=(el:HTMLElement)=>{clearGeneratedDraggable();if(['BODY','HTML'].includes(el.tagName))return;if(!el.hasAttribute('draggable')){el.setAttribute('draggable','true');el.setAttribute('data-vpb-added-draggable','')}};
      const updateToolbar=()=>requestAnimationFrame(positionToolbar);
      d.addEventListener('mouseover',ev=>{const t=ev.target as HTMLElement;if(!t?.getAttribute)return;hover?.removeAttribute('data-vpb-hover');hover=t;hover.setAttribute('data-vpb-hover','')});
      d.addEventListener('mouseout',()=>hover?.removeAttribute('data-vpb-hover'));
      d.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const t=ev.target as HTMLElement;d.querySelectorAll('[data-vpb-selected]').forEach(x=>x.removeAttribute('data-vpb-selected'));t.setAttribute('data-vpb-selected','');makeSelectedDraggable(t);e.select(t.getAttribute(ID));updateToolbar()},true);
      d.addEventListener('submit',ev=>ev.preventDefault(),true);
      d.addEventListener('scroll',updateToolbar,true);
      f.contentWindow?.addEventListener('resize',updateToolbar);
      d.addEventListener('dragstart',ev=>{const t=ev.target as HTMLElement;const sourceId=t?.getAttribute?.(ID);if(!sourceId||['BODY','HTML'].includes(t.tagName)||!ev.dataTransfer)return;dragSource=t;t.setAttribute('data-vpb-dragging','');ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData(BLOCK_DRAG_TYPE,sourceId);ev.dataTransfer.setData('text/plain',sourceId)},true);
      d.addEventListener('dragover',ev=>{
        const types=[...ev.dataTransfer?.types||[]];
        const isPalette=types.includes(ELEMENT_DRAG_TYPE),isMove=types.includes(BLOCK_DRAG_TYPE);
        if(!isPalette&&!isMove)return;
        const t=ev.target as HTMLElement;if(!t?.getAttribute)return;
        const moveId=isMove?ev.dataTransfer?.getData(BLOCK_DRAG_TYPE):null;
        const source=moveId?d.querySelector<HTMLElement>(`[${ID}="${moveId}"]`):dragSource;
        if(isMove&&source&&(source===t||source.contains(t))){clearDrop();return}
        ev.preventDefault();if(ev.dataTransfer)ev.dataTransfer.dropEffect=isMove?'move':'copy';
        const pos=dropPosition(t,ev.clientY);if(dropTarget!==t){clearDrop();dropTarget=t}dropTarget.setAttribute('data-vpb-drop',pos);
      },true);
      d.addEventListener('dragleave',ev=>{if(!(ev.relatedTarget instanceof d.defaultView!.Node))clearDrop()},true);
      d.addEventListener('drop',ev=>{const kind=ev.dataTransfer?.getData(ELEMENT_DRAG_TYPE),sourceId=ev.dataTransfer?.getData(BLOCK_DRAG_TYPE);if(!kind&&!sourceId)return;ev.preventDefault();ev.stopPropagation();const t=ev.target as HTMLElement;const targetId=t.getAttribute(ID);if(!targetId){clearDrop();return}const pos=dropPosition(t,ev.clientY);clearDrop();if(sourceId)e.moveBlock(sourceId,targetId,pos);else if(kind)e.insertElement(kind,pos,targetId);setTimeout(updateToolbar)},true);
      d.addEventListener('dragend',()=>{clearDrop();dragSource?.removeAttribute('data-vpb-dragging');dragSource=null;clearGeneratedDraggable();setTimeout(updateToolbar)},true);
      e.refresh();
    };
    f.addEventListener('load',onLoad);
    return()=>f.removeEventListener('load',onLoad)
  },[e.html]);

  const action=(fn:()=>void)=>{fn();setTimeout(positionToolbar)};

  return <main className="min-w-0 flex-1 overflow-auto bg-zinc-900 p-2 pb-16 sm:p-4 sm:pb-4 lg:p-5">
    <div className="relative mx-auto h-full min-h-[420px] overflow-hidden rounded-md bg-white shadow-2xl transition-[width] duration-200 sm:min-h-[500px] sm:rounded-lg" style={{width:widths[e.device],maxWidth:'100%'}}>
      {e.html?<>
        <iframe ref={e.iframeRef} srcDoc={e.html} sandbox="allow-same-origin" className="h-full min-h-[calc(100dvh-118px)] w-full border-0 sm:min-h-[calc(100dvh-90px)]" title="HTML canvas"/>
        {toolbar&&<div data-testid="canvas-block-toolbar" className="absolute z-40 flex h-8 items-center gap-0.5 rounded-md border border-zinc-700 bg-zinc-950/95 px-1 shadow-xl backdrop-blur" style={{left:toolbar.left,top:toolbar.top}}>
          <span className="max-w-20 truncate px-1.5 font-mono text-[10px] text-blue-300">&lt;{toolbar.tag}&gt;</span>
          <button onClick={()=>action(()=>e.move(-1))} title="Canvas move up" className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><ArrowUp size={13}/></button>
          <button onClick={()=>action(()=>e.move(1))} title="Canvas move down" className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><ArrowDown size={13}/></button>
          <button onClick={()=>e.copyBlock()} title="Canvas copy block" className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><ClipboardCopy size={13}/></button>
          <button disabled={!e.hasCopiedBlock} onClick={()=>action(()=>e.pasteBlock('after'))} title="Canvas paste after" className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30"><ClipboardPaste size={13}/></button>
          <button onClick={()=>action(()=>e.duplicate())} title="Canvas duplicate" className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><Copy size={13}/></button>
          <button onClick={()=>{e.remove();setToolbar(null)}} title="Canvas delete" className="rounded p-1 text-red-400 hover:bg-red-500/15 hover:text-red-300"><Trash2 size={13}/></button>
        </div>}
      </>:<div className="flex h-full min-h-[420px] items-center justify-center px-6 text-center text-sm text-zinc-400 sm:min-h-[500px]">Upload an HTML file to start editing</div>}
    </div>
  </main>
}
