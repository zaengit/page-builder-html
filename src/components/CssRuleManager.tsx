import{useEffect,useMemo,useState}from'react';
import{Copy,Trash2}from'lucide-react';
import{deleteCssRule,duplicateCssRule,listCssRules,updateCssRule}from'../editor/cssRules';

export function CssRuleManager({css,onChange,onCommit}:{css:string;onChange:(css:string)=>void;onCommit:()=>void}){
  const rules=useMemo(()=>listCssRules(css),[css]);
  const[selectedKey,setSelectedKey]=useState('');
  const selected=rules.find(r=>r.path.join('.')===selectedKey)||null;
  const[declarations,setDeclarations]=useState('');
  useEffect(()=>{if(selected)setDeclarations(selected.declarations);else{setDeclarations('');if(selectedKey)setSelectedKey('')}},[selected?.path.join('.'),selected?.declarations]);
  if(!rules.length)return <div className="mb-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-[10px] text-zinc-600">No editable style rules yet.</div>;
  const choose=(key:string)=>{onCommit();setSelectedKey(key)};
  const changeDeclarations=(value:string)=>{setDeclarations(value);if(selected)onChange(updateCssRule(css,selected.path,value))};
  const duplicate=()=>{if(!selected)return;onChange(duplicateCssRule(css,selected.path));onCommit()};
  const remove=()=>{if(!selected)return;onChange(deleteCssRule(css,selected.path));onCommit();setSelectedKey('')};
  return <div className="mb-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-2" aria-label="CSS rule manager">
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Rules</div>
    <div className="max-h-32 space-y-1 overflow-auto">{rules.map(rule=>{const key=rule.path.join('.');return <button key={key} onClick={()=>choose(key)} className={`block w-full rounded px-2 py-1.5 text-left ${selectedKey===key?'bg-blue-500/10':'hover:bg-zinc-800'}`}><code className="block truncate text-[10px] text-blue-300">{rule.selector}</code>{rule.context&&<span className="block truncate text-[9px] text-zinc-600">{rule.context}</span>}</button>})}</div>
    {selected&&<div className="mt-2 border-t border-zinc-800 pt-2"><div className="mb-1 flex items-center gap-1"><code className="min-w-0 flex-1 truncate text-[10px] text-zinc-400">{selected.selector}</code><button onClick={duplicate} title="Duplicate CSS rule" className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"><Copy size={12}/></button><button onClick={remove} title="Delete CSS rule" className="rounded p-1 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={12}/></button></div><textarea aria-label="Rule declarations" value={declarations} onChange={x=>changeDeclarations(x.target.value)} onBlur={onCommit} spellCheck={false} placeholder="padding: 20px;" className="min-h-20 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] leading-5 text-zinc-200 outline-none focus:border-blue-500"/></div>}
  </div>;
}
