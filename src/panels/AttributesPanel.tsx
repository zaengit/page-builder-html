import{useEffect,useState}from'react';
import{Plus,Trash2}from'lucide-react';
import{editableAttributes,idConflict,isEditableAttribute,setSafeAttribute}from'../editor/attributes';
import type{EditorContextValue}from'../types/editor';

function selected(e:EditorContextValue){const d=e.iframeRef.current?.contentDocument;return d&&e.selectedId?d.querySelector<HTMLElement>(`[data-vpb-id="${CSS.escape(e.selectedId)}"]`):null}

type Row={name:string;value:string};

export function AttributesPanel({e}:{e:EditorContextValue}){
  const[id,setId]=useState('');const[classes,setClasses]=useState('');const[title,setTitle]=useState('');const[rows,setRows]=useState<Row[]>([]);const[idError,setIdError]=useState('');const[newName,setNewName]=useState('');const[newValue,setNewValue]=useState('');const[newError,setNewError]=useState('');
  useEffect(()=>{const el=selected(e);setId(el?.id||'');setClasses(el?.getAttribute('class')||'');setTitle(el?.getAttribute('title')||'');setRows(el?editableAttributes(el):[]);setIdError('');setNewError('')},[e.selectedId,e.analysis]);

  const changeCore=(name:'id'|'class'|'title',value:string)=>{
    if(name==='id')setId(value);else if(name==='class')setClasses(value);else setTitle(value);
    const el=selected(e),d=el?.ownerDocument;if(!el||!d)return;
    if(name==='id'&&idConflict(d,el,value)){setIdError('ID already exists');return}
    if(name==='id')setIdError('');
    e.mutateGrouped(`attr:${e.selectedId}:${name}`,node=>{const v=value.trim();if(v)node.setAttribute(name,v);else node.removeAttribute(name)});
  };

  const changeRow=(index:number,value:string)=>{
    const row=rows[index];if(!row)return;
    setRows(v=>v.map((x,i)=>i===index?{...x,value}:x));
    e.mutateGrouped(`attr:${e.selectedId}:${row.name}`,el=>setSafeAttribute(el,row.name,value));
  };
  const removeRow=(index:number)=>{const row=rows[index];if(!row)return;e.mutate(el=>el.removeAttribute(row.name));setRows(v=>v.filter((_,i)=>i!==index))};
  const add=()=>{const name=newName.trim();if(!isEditableAttribute(name)||['id','class','title'].includes(name.toLowerCase())){setNewError('Attribute name is reserved or not allowed');return}const el=selected(e);if(!el)return;if(el.hasAttribute(name)){setNewError('Attribute already exists');return}setNewError('');e.mutate(node=>setSafeAttribute(node,name,newValue));setRows(v=>[...v,{name,value:newValue}]);setNewName('');setNewValue('')};
  const input='w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-200 outline-none focus:border-blue-500';
  return <div className="p-3">
    <div className="space-y-3">
      <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">ID</span><input aria-label="Element ID" value={id} onChange={x=>changeCore('id',x.target.value)} onBlur={e.flushGroupedMutation} className={input}/>{idError&&<span className="mt-1 block text-[10px] text-red-400">{idError}</span>}</label>
      <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Class</span><input aria-label="Element class" value={classes} onChange={x=>changeCore('class',x.target.value)} onBlur={e.flushGroupedMutation} className={input}/></label>
      <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Title</span><input aria-label="Element title" value={title} onChange={x=>changeCore('title',x.target.value)} onBlur={e.flushGroupedMutation} className={input}/></label>
    </div>
    <div className="mt-5 border-t border-zinc-800 pt-4"><div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Custom attributes</div>
      <div className="space-y-2">{rows.map((row,i)=><div key={`${row.name}-${i}`} className="grid grid-cols-[88px_1fr_30px] gap-1"><input value={row.name} readOnly className={`${input} text-zinc-500`}/><input aria-label={`Attribute ${row.name}`} value={row.value} onChange={x=>changeRow(i,x.target.value)} onBlur={e.flushGroupedMutation} className={input}/><button onClick={()=>removeRow(i)} title={`Remove ${row.name}`} className="grid place-items-center rounded-md border border-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={13}/></button></div>)}</div>
      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2"><div className="grid grid-cols-2 gap-2"><input aria-label="New attribute name" placeholder="data-name" value={newName} onChange={x=>setNewName(x.target.value)} className={input}/><input aria-label="New attribute value" placeholder="value" value={newValue} onChange={x=>setNewValue(x.target.value)} className={input}/></div>{newError&&<div className="mt-1 text-[10px] text-red-400">{newError}</div>}<button onClick={add} className="mt-2 inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"><Plus size={13}/>Add attribute</button></div>
      <p className="mt-2 text-[10px] leading-4 text-zinc-600">Changes preview live. Internal data-vpb attributes, style, and event handlers are not editable here.</p>
    </div>
  </div>;
}
