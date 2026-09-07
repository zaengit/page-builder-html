import{useCallback,useEffect,useRef,useState}from'react';
import{analyzeElement}from'../editor/elementAnalyzer';
import{buildTree,byId,indexDocument,ID}from'../editor/selection';
import{deleteElement,duplicateElement,moveElement}from'../editor/mutations';
import{createCatalogElement}from'../editor/elementCatalog';
import{insertNode,parseHtmlSnippet}from'../editor/insertion';
import{downloadHtml,serialize}from'../editor/serializer';
import{loadDraft,saveDraft}from'../editor/storage';
import{useHistory}from'./useHistory';
import type{Device,EditorContextValue,TreeNode,ElementAnalysis,InsertPosition}from'../types/editor';

export function useEditor():EditorContextValue{
  const iframeRef=useRef<HTMLIFrameElement>(null);
  const history=useHistory();
  const initialDraft=useRef(loadDraft()).current;
  const[html,setHtml]=useState(initialDraft?.html||'');
  const[fileName,setFileName]=useState(initialDraft?.fileName||'edited.html');
  const[selectedId,setSelectedId]=useState<string|null>(null);
  const[analysis,setAnalysis]=useState<ElementAnalysis|null>(null);
  const[tree,setTree]=useState<TreeNode[]>([]);
  const[device,setDeviceState]=useState<Device>(initialDraft?.device||'desktop');
  const[hasCopiedBlock,setHasCopiedBlock]=useState(false);
  const copiedBlock=useRef<string>('');
  const[,tick]=useState(0);
  const saveTimer=useRef<number|null>(null);
  const doc=()=>iframeRef.current?.contentDocument||null;

  const refresh=useCallback(()=>{
    const d=doc();
    if(!d)return;
    setTree(buildTree(d));
    const el=byId(d,selectedId);
    setAnalysis(el?analyzeElement(el):null);
    tick(x=>x+1);
  },[selectedId]);

  const persistNow=useCallback(()=>{
    const d=doc();
    const currentHtml=d?serialize(d):html;
    if(!currentHtml)return;
    saveDraft({html:currentHtml,fileName,device});
  },[html,fileName,device]);

  const queueAutosave=useCallback(()=>{
    if(saveTimer.current!==null)window.clearTimeout(saveTimer.current);
    saveTimer.current=window.setTimeout(()=>{
      saveTimer.current=null;
      persistNow();
    },350);
  },[persistNow]);

  useEffect(()=>{if(initialDraft?.html)history.reset({html:initialDraft.html,selectedId:null})},[]);
  useEffect(()=>{
    const flush=()=>persistNow();
    const visibility=()=>{if(document.visibilityState==='hidden')flush()};
    window.addEventListener('pagehide',flush);
    document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',visibility);if(saveTimer.current!==null)window.clearTimeout(saveTimer.current)};
  },[persistNow]);

  const snap=()=>{const d=doc();return d?{html:d.documentElement.outerHTML,selectedId}:null};
  const restore=(s:{html:string;selectedId:string|null}|null)=>{const d=doc();if(!d||!s)return;d.open();d.write(s.html);d.close();indexDocument(d);setSelectedId(s.selectedId);setTimeout(()=>{refresh();queueAutosave()})};

  const loadFile=async(f:File)=>{const text=await f.text();setHtml(text);setFileName(f.name);setSelectedId(null);setAnalysis(null);setTree([]);copiedBlock.current='';setHasCopiedBlock(false);history.reset({html:text,selectedId:null});saveDraft({html:text,fileName:f.name,device})};
  const select=(id:string|null)=>{setSelectedId(id);const d=doc();const el=d&&byId(d,id);setAnalysis(el?analyzeElement(el):null)};

  const mutate=(fn:(el:HTMLElement)=>void)=>{const d=doc(),el=d&&byId(d,selectedId);if(!el)return;const before=snap();if(before)history.push(before);fn(el);const after=snap();if(after)history.push(after);refresh();queueAutosave()};

  const finishInsert=(d:Document,node:HTMLElement|null)=>{
    indexDocument(d);
    if(node)setSelectedId(node.getAttribute(ID));
    const after=snap();if(after)history.push(after);
    setTimeout(()=>{refresh();queueAutosave();node?.scrollIntoView({block:'center',behavior:'smooth'})});
  };

  const insertElement=(kind:string,position:InsertPosition='inside')=>{
    const d=doc();if(!d||!d.body)return;
    const before=snap();if(before)history.push(before);
    const node=createCatalogElement(d,kind);if(!node)return;
    insertNode(d,byId(d,selectedId),node,position);
    finishInsert(d,node);
  };

  const insertHtml=(snippet:string,position:InsertPosition='inside')=>{
    const d=doc();if(!d||!d.body||!snippet.trim())return;
    const before=snap();if(before)history.push(before);
    const{fragment,firstElement}=parseHtmlSnippet(d,snippet);
    if(!fragment.childNodes.length)return;
    insertNode(d,byId(d,selectedId),fragment,position);
    finishInsert(d,firstElement);
  };

  const duplicate=()=>mutate(el=>{const c=duplicateElement(el);c.querySelectorAll(`[${ID}]`).forEach(x=>x.removeAttribute(ID));c.removeAttribute(ID);indexDocument(el.ownerDocument);setSelectedId(c.getAttribute(ID))});
  const copyBlock=()=>{const d=doc(),el=d&&byId(d,selectedId);if(!el)return;const clone=el.cloneNode(true)as HTMLElement;clone.removeAttribute(ID);clone.querySelectorAll(`[${ID}]`).forEach(x=>x.removeAttribute(ID));clone.removeAttribute('data-vpb-selected');clone.removeAttribute('data-vpb-hover');clone.querySelectorAll('[data-vpb-selected],[data-vpb-hover]').forEach(x=>{x.removeAttribute('data-vpb-selected');x.removeAttribute('data-vpb-hover')});copiedBlock.current=clone.outerHTML;setHasCopiedBlock(true)};
  const pasteBlock=(where:'before'|'after')=>{const d=doc(),target=d&&byId(d,selectedId);if(!d||!target||!copiedBlock.current||['BODY','HTML'].includes(target.tagName))return;mutate(el=>{const template=d.createElement('template');template.innerHTML=copiedBlock.current.trim();const clone=template.content.firstElementChild as HTMLElement|null;if(!clone)return;if(where==='before')el.before(clone);else el.after(clone);indexDocument(d);setSelectedId(clone.getAttribute(ID))})};
  const remove=()=>mutate(el=>{if(deleteElement(el))setSelectedId(null)});
  const move=(dir:-1|1)=>mutate(el=>moveElement(el,dir));
  const undo=()=>restore(history.undo());const redo=()=>restore(history.redo());
  const exportHtml=()=>{const d=doc();if(d)downloadHtml(serialize(d),fileName)};
  const setDevice=(next:Device)=>{setDeviceState(next);const d=doc();const currentHtml=d?serialize(d):html;if(currentHtml)saveDraft({html:currentHtml,fileName,device:next})};

  return{iframeRef,html,fileName,selectedId,analysis,tree,device,canUndo:history.canUndo,canRedo:history.canRedo,hasCopiedBlock,loadFile,select,setDevice,mutate,insertElement,insertHtml,duplicate,copyBlock,pasteBlock,remove,move,undo,redo,exportHtml,refresh};
}
