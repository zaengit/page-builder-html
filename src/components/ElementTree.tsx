import{useMemo,useState}from'react';
import{Box,ChevronRight,Columns3,FileCode2,Heading1,Image,LayoutGrid,MousePointerClick,PanelTop,Rows3,Search,Type,X}from'lucide-react';
import{elementCatalog,elementGroups,type ElementGroup}from'../editor/elementCatalog';
import type{EditorContextValue,InsertPosition,TreeNode}from'../types/editor';

export const ELEMENT_DRAG_TYPE='application/x-vpb-element';

const icons:Record<ElementGroup,typeof Box>={layout:LayoutGrid,content:Type,media:Image,interactive:MousePointerClick,embed:FileCode2,semantic:PanelTop};
const itemIcons:Record<string,typeof Box>={section:PanelTop,container:Box,flex:Rows3,row:Rows3,column:Columns3,grid:LayoutGrid,text:Type,paragraph:Type,h1:Heading1,h2:Heading1,h3:Heading1,h4:Heading1,h5:Heading1,h6:Heading1,image:Image,html:FileCode2};
const positions:{id:InsertPosition;label:string}[]=[{id:'inside',label:'Inside'},{id:'before',label:'Before'},{id:'after',label:'After'}];

type MainTab='insert'|'tree';

function TreeItem({node,e,depth=0}:{node:TreeNode;e:EditorContextValue;depth?:number}){
  const[selectedOpen,setSelectedOpen]=useState(true);
  const hasChildren=node.children.length>0;
  return <div>
    <button onClick={()=>e.select(node.id)} className={`flex w-full items-center gap-1 rounded px-1.5 py-1.5 text-left text-xs ${e.selectedId===node.id?'bg-blue-500/15 text-blue-300':'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`} style={{paddingLeft:6+depth*12}}>
      {hasChildren?<span onClick={ev=>{ev.stopPropagation();setSelectedOpen(v=>!v)}} className="grid h-4 w-4 shrink-0 place-items-center"><ChevronRight size={12} className={`transition ${selectedOpen?'rotate-90':''}`}/></span>:<span className="h-4 w-4 shrink-0"/>}
      <span className="shrink-0 text-zinc-300">{node.tag}</span>{node.label&&<span className="truncate text-zinc-600">{node.label}</span>}
    </button>
    {hasChildren&&selectedOpen&&<div>{node.children.map(child=><TreeItem key={child.id} node={child} e={e} depth={depth+1}/>)}</div>}
  </div>;
}

export function ElementTree({e,className=''}:{e:EditorContextValue;className?:string}){
  const[mainTab,setMainTab]=useState<MainTab>('insert');
  const[group,setGroup]=useState<ElementGroup>('layout');
  const[position,setPosition]=useState<InsertPosition>('inside');
  const[query,setQuery]=useState('');
  const[embedOpen,setEmbedOpen]=useState(false);
  const[snippet,setSnippet]=useState('<div class="custom-block">\n  Custom HTML\n</div>');
  const items=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(q)return elementCatalog.filter(x=>`${x.label} ${x.id} ${x.group}`.toLowerCase().includes(q));
    return elementCatalog.filter(x=>x.group===group);
  },[group,query]);

  const insert=(id:string)=>{if(id==='html'){setEmbedOpen(true);return}e.insertElement(id,position)};
  const insertHtml=()=>{if(!snippet.trim())return;e.insertHtml(snippet,position);setEmbedOpen(false)};
  const startDrag=(ev:React.DragEvent<HTMLButtonElement>,id:string)=>{
    if(id==='html'){ev.preventDefault();return}
    ev.dataTransfer.effectAllowed='copy';
    ev.dataTransfer.setData(ELEMENT_DRAG_TYPE,id);
    ev.dataTransfer.setData('text/plain',id);
  };

  return <aside className={`relative w-64 shrink-0 overflow-auto border-r border-zinc-800 bg-zinc-950 ${className}`}>
    <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Elements</div>
      <div className="mt-3 grid grid-cols-2 rounded-md border border-zinc-800 bg-zinc-900 p-0.5" role="tablist" aria-label="Elements mode">
        {(['insert','tree']as MainTab[]).map(tab=><button key={tab} role="tab" aria-selected={mainTab===tab} onClick={()=>setMainTab(tab)} className={`rounded px-2 py-2 text-xs font-medium capitalize ${mainTab===tab?'bg-zinc-700 text-white':'text-zinc-500 hover:text-zinc-200'}`}>{tab}</button>)}
      </div>

      {mainTab==='insert'&&<>
        <label className="mt-3 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-2 focus-within:border-blue-500/60">
          <Search size={14} className="shrink-0 text-zinc-600"/>
          <input value={query} onChange={x=>setQuery(x.target.value)} placeholder="Search elements..." aria-label="Search elements" className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"/>
          {query&&<button onClick={()=>setQuery('')} className="text-zinc-600 hover:text-zinc-300" aria-label="Clear element search"><X size={12}/></button>}
        </label>
        {!query&&<div className="mt-3 grid grid-cols-3 gap-1" role="tablist" aria-label="Element groups">
          {elementGroups.map(g=>{const I=icons[g.id];const active=group===g.id;return <button key={g.id} role="tab" aria-selected={active} onClick={()=>setGroup(g.id)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-[10px] transition ${active?'border-blue-500/50 bg-blue-500/15 text-blue-300':'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200'}`}><I size={14}/><span>{g.label}</span></button>})}
        </div>}
        <div className="mt-2 grid grid-cols-3 rounded-md border border-zinc-800 bg-zinc-900 p-0.5" aria-label="Insert position">
          {positions.map(p=><button key={p.id} onClick={()=>setPosition(p.id)} className={`rounded px-1 py-1.5 text-[10px] font-medium ${position===p.id?'bg-zinc-700 text-white':'text-zinc-500 hover:text-zinc-200'}`}>{p.label}</button>)}
        </div>
      </>}
    </div>

    {mainTab==='insert'?<div className="p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{query?`${items.length} results`:elementGroups.find(x=>x.id===group)?.label}</span><span className="text-[10px] text-zinc-700">Drag or insert {position}</span></div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item=>{const I=itemIcons[item.id]||Box;return <button key={item.id} draggable={item.id!=='html'} onDragStart={ev=>startDrag(ev,item.id)} onClick={()=>insert(item.id)} title={`Insert ${item.label}`} className="flex min-h-16 cursor-grab flex-col items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2 py-3 text-center text-xs text-zinc-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500/40"><I size={18}/><span>{item.label}</span>{query&&<span className="text-[9px] uppercase tracking-wide text-zinc-600">{item.group}</span>}</button>})}
      </div>
      {query&&items.length===0&&<div className="rounded-md border border-dashed border-zinc-800 p-5 text-center text-xs text-zinc-600">No elements found.</div>}
      {!e.html&&<p className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] leading-5 text-zinc-500">Upload HTML first. New elements are inserted relative to the selected block.</p>}
    </div>:<div className="p-2">
      {!e.html?<div className="p-5 text-center text-xs text-zinc-600">Upload HTML to inspect its DOM tree.</div>:e.tree.map(node=><TreeItem key={node.id} node={node} e={e}/>)}
    </div>}

    {embedOpen&&<div className="absolute inset-0 z-30 flex items-end bg-black/65 p-2" onClick={()=>setEmbedOpen(false)}>
      <div className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl" onClick={x=>x.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-semibold text-zinc-200">HTML Embed</div><div className="mt-0.5 text-[10px] text-zinc-500">Insert {position} selected element</div></div><button onClick={()=>setEmbedOpen(false)} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white" aria-label="Close HTML embed"><X size={15}/></button></div>
        <textarea value={snippet} onChange={x=>setSnippet(x.target.value)} className="min-h-44 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 p-2 font-mono text-[11px] leading-5 text-zinc-200 outline-none focus:border-blue-500" spellCheck={false}/>
        <div className="mt-3 flex justify-end gap-2"><button onClick={()=>setEmbedOpen(false)} className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800">Cancel</button><button onClick={insertHtml} disabled={!snippet.trim()} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40">Insert HTML</button></div>
      </div>
    </div>}
  </aside>
}
