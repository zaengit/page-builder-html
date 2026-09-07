import{useMemo,useState}from'react';
import{Box,Columns3,FileCode2,Heading1,Image,LayoutGrid,MousePointerClick,PanelTop,Rows3,Type,X}from'lucide-react';
import{elementCatalog,elementGroups,type ElementGroup}from'../editor/elementCatalog';
import type{EditorContextValue,InsertPosition}from'../types/editor';

const icons:Record<ElementGroup,typeof Box>={layout:LayoutGrid,content:Type,media:Image,interactive:MousePointerClick,embed:FileCode2,semantic:PanelTop};
const itemIcons:Record<string,typeof Box>={section:PanelTop,container:Box,flex:Rows3,row:Rows3,column:Columns3,grid:LayoutGrid,text:Type,paragraph:Type,h1:Heading1,h2:Heading1,h3:Heading1,h4:Heading1,h5:Heading1,h6:Heading1,image:Image,html:FileCode2};
const positions:{id:InsertPosition;label:string}[]=[{id:'inside',label:'Inside'},{id:'before',label:'Before'},{id:'after',label:'After'}];

export function ElementTree({e,className=''}:{e:EditorContextValue;className?:string}){
  const[group,setGroup]=useState<ElementGroup>('layout');
  const[position,setPosition]=useState<InsertPosition>('inside');
  const[embedOpen,setEmbedOpen]=useState(false);
  const[snippet,setSnippet]=useState('<div class="custom-block">\n  Custom HTML\n</div>');
  const items=useMemo(()=>elementCatalog.filter(x=>x.group===group),[group]);

  const insert=(id:string)=>{
    if(id==='html'){setEmbedOpen(true);return}
    e.insertElement(id,position);
  };

  const insertHtml=()=>{
    if(!snippet.trim())return;
    e.insertHtml(snippet,position);
    setEmbedOpen(false);
  };

  return <aside className={`relative w-64 shrink-0 overflow-auto border-r border-zinc-800 bg-zinc-950 ${className}`}>
    <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Elements</div>
      <div className="mt-3 grid grid-cols-3 gap-1" role="tablist" aria-label="Element groups">
        {elementGroups.map(g=>{const I=icons[g.id];const active=group===g.id;return <button key={g.id} role="tab" aria-selected={active} onClick={()=>setGroup(g.id)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-[10px] transition ${active?'border-blue-500/50 bg-blue-500/15 text-blue-300':'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200'}`}><I size={14}/><span>{g.label}</span></button>})}
      </div>
      <div className="mt-2 grid grid-cols-3 rounded-md border border-zinc-800 bg-zinc-900 p-0.5" aria-label="Insert position">
        {positions.map(p=><button key={p.id} onClick={()=>setPosition(p.id)} className={`rounded px-1 py-1.5 text-[10px] font-medium ${position===p.id?'bg-zinc-700 text-white':'text-zinc-500 hover:text-zinc-200'}`}>{p.label}</button>)}
      </div>
    </div>

    <div className="p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{elementGroups.find(x=>x.id===group)?.label}</span><span className="text-[10px] text-zinc-700">Insert {position}</span></div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item=>{const I=itemIcons[item.id]||Box;return <button key={item.id} onClick={()=>insert(item.id)} title={`Insert ${item.label}`} className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2 py-3 text-center text-xs text-zinc-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"><I size={18}/><span>{item.label}</span></button>})}
      </div>
      {!e.html&&<p className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] leading-5 text-zinc-500">Upload HTML first. New elements are inserted relative to the selected block.</p>}
    </div>

    {embedOpen&&<div className="absolute inset-0 z-30 flex items-end bg-black/65 p-2" onClick={()=>setEmbedOpen(false)}>
      <div className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl" onClick={x=>x.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-semibold text-zinc-200">HTML Embed</div><div className="mt-0.5 text-[10px] text-zinc-500">Insert {position} selected element</div></div><button onClick={()=>setEmbedOpen(false)} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white" aria-label="Close HTML embed"><X size={15}/></button></div>
        <textarea value={snippet} onChange={x=>setSnippet(x.target.value)} className="min-h-44 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 p-2 font-mono text-[11px] leading-5 text-zinc-200 outline-none focus:border-blue-500" spellCheck={false}/>
        <div className="mt-3 flex justify-end gap-2"><button onClick={()=>setEmbedOpen(false)} className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800">Cancel</button><button onClick={insertHtml} disabled={!snippet.trim()} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40">Insert HTML</button></div>
      </div>
    </div>}
  </aside>
}
