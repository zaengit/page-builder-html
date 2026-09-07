import{ArrowDown,ArrowUp,ClipboardCopy,ClipboardPaste,Copy,Trash2}from'lucide-react';
import{Button}from'./ui';
import{TextPanel}from'../panels/TextPanel';
import{CssPanel}from'../panels/CssPanel';
import type{EditorContextValue}from'../types/editor';

export function PropertiesPanel({e,className=''}:{e:EditorContextValue;className?:string}){
  const hasText=e.analysis?.capabilities.includes('text')||false;
  return <aside className={`w-72 shrink-0 overflow-auto border-l border-zinc-800 bg-zinc-950 ${className}`}>
    <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 p-3">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Properties</div>
        {e.analysis&&<div className="mt-1 truncate text-xs text-zinc-300">&lt;{e.analysis.tagName}&gt; · {e.analysis.type}</div>}
      </div>
      {e.analysis&&<div className="mt-3 flex flex-wrap gap-1">
        <Button onClick={()=>e.move(-1)} title="Move up"><ArrowUp size={12}/></Button>
        <Button onClick={()=>e.move(1)} title="Move down"><ArrowDown size={12}/></Button>
        <Button onClick={e.copyBlock} title="Copy block"><ClipboardCopy size={12}/></Button>
        <Button onClick={()=>e.pasteBlock('before')} disabled={!e.hasCopiedBlock} title="Paste before"><ClipboardPaste size={12}/><span className="text-[10px]">↑</span></Button>
        <Button onClick={()=>e.pasteBlock('after')} disabled={!e.hasCopiedBlock} title="Paste after"><ClipboardPaste size={12}/><span className="text-[10px]">↓</span></Button>
        <Button onClick={e.duplicate} title="Duplicate"><Copy size={12}/></Button>
        <Button onClick={e.remove} title="Delete"><Trash2 size={12}/></Button>
      </div>}
    </div>
    {!e.analysis?<div className="p-5 text-center text-xs text-zinc-600">Select an element to edit its content or CSS.</div>:<>
      {hasText&&<TextPanel e={e}/>} 
      <CssPanel e={e}/>
    </>}
  </aside>;
}
