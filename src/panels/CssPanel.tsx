import{useEffect,useMemo,useState}from'react';
import{Check,Code2,Plus}from'lucide-react';
import type{EditorContextValue}from'../types/editor';

function selectedElement(e:EditorContextValue){const d=e.iframeRef.current?.contentDocument;return d&&e.selectedId?d.querySelector<HTMLElement>(`[data-vpb-id="${CSS.escape(e.selectedId)}"]`):null}
function pageStyle(doc:Document){return doc.querySelector<HTMLStyleElement>('style[data-vpb-user-css]')}
function selectorFor(el:HTMLElement|null){if(!el)return'';if(el.id)return`#${CSS.escape(el.id)}`;const cls=[...el.classList][0];if(cls)return`.${CSS.escape(cls)}`;return el.tagName.toLowerCase()}

type CssTab='inline'|'page';

export function CssPanel({e}:{e:EditorContextValue}){
  const[tab,setTab]=useState<CssTab>('inline');const[current,setCurrent]=useState('');const[pageCss,setPageCss]=useState('');const[applied,setApplied]=useState(false);
  const selector=useMemo(()=>selectorFor(selectedElement(e)),[e.selectedId,e.analysis]);
  useEffect(()=>{const el=selectedElement(e);setCurrent(el?.style.cssText||'');const d=e.iframeRef.current?.contentDocument;setPageCss(d?pageStyle(d)?.textContent||'':'');setApplied(false)},[e.selectedId,e.analysis]);
  const flash=()=>{setApplied(true);window.setTimeout(()=>setApplied(false),1200)};
  const applyInline=()=>{e.mutate(el=>{el.style.cssText=current.trim()});flash()};
  const applyPage=()=>{const d=e.iframeRef.current?.contentDocument;if(!d)return;e.mutate(()=>{let style=pageStyle(d);if(!style){style=d.createElement('style');style.dataset.vpbUserCss='';d.head?.append(style)}style.textContent=pageCss});flash()};
  const insertSelector=()=>{if(!selector)return;setPageCss(v=>`${v}${v.trim()?`\n\n`:''}${selector} {\n  \n}`);setTab('page')};
  const active=tab==='inline'?current:pageCss;
  const setActive=(v:string)=>tab==='inline'?setCurrent(v):setPageCss(v);
  const apply=tab==='inline'?applyInline:applyPage;
  return <div className="p-3">
    <div className="grid grid-cols-2 rounded-md border border-zinc-800 bg-zinc-900 p-0.5"><button onClick={()=>setTab('inline')} className={`rounded px-2 py-2 text-xs font-medium ${tab==='inline'?'bg-zinc-700 text-white':'text-zinc-500 hover:text-zinc-200'}`}>Inline Style</button><button onClick={()=>setTab('page')} className={`rounded px-2 py-2 text-xs font-medium ${tab==='page'?'bg-zinc-700 text-white':'text-zinc-500 hover:text-zinc-200'}`}>Page CSS</button></div>
    <div className="mt-3 mb-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500"><span className="inline-flex items-center gap-1"><Code2 size={12}/>{tab==='inline'?'Style attribute for selected element':'CSS rules stored in this document'}</span>{applied&&<span className="inline-flex items-center gap-1 text-emerald-400"><Check size={12}/>Applied</span>}</div>
    {tab==='page'&&<div className="mb-2 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-2"><code className="min-w-0 flex-1 truncate text-[11px] text-blue-300">{selector||'No selector'}</code><button onClick={insertSelector} disabled={!selector} className="inline-flex shrink-0 items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"><Plus size={11}/>Insert selector</button></div>}
    <textarea aria-label={tab==='inline'?'Element CSS':'Page CSS'} value={active} onChange={x=>{setActive(x.target.value);setApplied(false)}} onKeyDown={x=>{if((x.ctrlKey||x.metaKey)&&x.key==='Enter'){x.preventDefault();apply()}}} spellCheck={false} placeholder={tab==='inline'?'color: white;\npadding: 20px;\nbackground: #111827;':'#hero {\n  min-height: 600px;\n}\n\n@media (max-width: 640px) {\n  #hero { padding: 24px; }\n}'} className="min-h-52 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-200 outline-none focus:border-blue-500"/>
    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[10px] text-zinc-600">Ctrl/Cmd + Enter to apply</span><button onClick={apply} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">Apply {tab==='inline'?'CSS':'Page CSS'}</button></div>
  </div>;
}
