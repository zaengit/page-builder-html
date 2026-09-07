import{useEffect,useState}from'react';
import{Check,Code2}from'lucide-react';
import{Section}from'../components/ui';
import type{EditorContextValue}from'../types/editor';

function selectedElement(e:EditorContextValue){
  const d=e.iframeRef.current?.contentDocument;
  return d&&e.selectedId?d.querySelector<HTMLElement>(`[data-vpb-id="${CSS.escape(e.selectedId)}"]`):null;
}

export function CssPanel({e}:{e:EditorContextValue}){
  const[current,setCurrent]=useState('');
  const[applied,setApplied]=useState(false);

  useEffect(()=>{
    const el=selectedElement(e);
    setCurrent(el?.style.cssText||'');
    setApplied(false);
  },[e.selectedId,e.analysis]);

  const apply=()=>{
    const next=current.trim();
    e.mutate(el=>{el.style.cssText=next});
    setApplied(true);
    window.setTimeout(()=>setApplied(false),1200);
  };

  return <Section title="Element CSS">
    <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
      <span className="inline-flex items-center gap-1"><Code2 size={12}/>Inline CSS for selected element</span>
      {applied&&<span className="inline-flex items-center gap-1 text-emerald-400"><Check size={12}/>Applied</span>}
    </div>
    <textarea
      aria-label="Element CSS"
      value={current}
      onChange={x=>{setCurrent(x.target.value);setApplied(false)}}
      onKeyDown={x=>{if((x.ctrlKey||x.metaKey)&&x.key==='Enter'){x.preventDefault();apply()}}}
      spellCheck={false}
      placeholder={'color: white;\npadding: 20px;\nbackground: #111827;\nborder-radius: 12px;'}
      className="min-h-44 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-200 outline-none focus:border-blue-500"
    />
    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="text-[10px] text-zinc-600">Ctrl/Cmd + Enter to apply</span>
      <button onClick={apply} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">Apply CSS</button>
    </div>
  </Section>;
}
