import{useEffect,useState}from'react';
import{Section}from'../components/ui';
import{setDirectText}from'../editor/mutations';
import type{EditorContextValue}from'../types/editor';

function selected(e:EditorContextValue){const d=e.iframeRef.current?.contentDocument;return d&&e.selectedId?d.querySelector<HTMLElement>(`[data-vpb-id="${CSS.escape(e.selectedId)}"]`):null}
function directText(el:HTMLElement|null){return el?[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim():''}

export function TextPanel({e}:{e:EditorContextValue}){
  const[value,setValue]=useState('');
  useEffect(()=>setValue(directText(selected(e))),[e.selectedId,e.analysis]);
  const change=(next:string)=>{setValue(next);e.mutateGrouped(`content:${e.selectedId}`,el=>setDirectText(el,next))};
  return <Section title="Content"><textarea aria-label="Element content" value={value} onChange={x=>change(x.target.value)} onBlur={e.flushGroupedMutation} className="min-h-20 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none focus:border-blue-500"/></Section>
}
