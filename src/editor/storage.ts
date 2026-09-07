import type{Device}from'../types/editor';

export const AUTOSAVE_KEY='visual-html-page-builder:draft:v1';

export interface SavedDraft{version:1;html:string;fileName:string;device:Device;savedAt:number}

export function loadDraft():SavedDraft|null{
  try{
    if(typeof window==='undefined')return null;
    const raw=window.localStorage.getItem(AUTOSAVE_KEY);
    if(!raw)return null;
    const value=JSON.parse(raw) as Partial<SavedDraft>;
    if(value.version!==1||typeof value.html!=='string'||!value.html)return null;
    return{version:1,html:value.html,fileName:typeof value.fileName==='string'&&value.fileName?value.fileName:'edited.html',device:value.device==='tablet'||value.device==='mobile'?'device' in value?value.device:'desktop':'desktop',savedAt:typeof value.savedAt==='number'?value.savedAt:0};
  }catch{return null}
}

export function saveDraft(draft:Omit<SavedDraft,'version'|'savedAt'>):boolean{
  try{
    window.localStorage.setItem(AUTOSAVE_KEY,JSON.stringify({version:1,...draft,savedAt:Date.now()} satisfies SavedDraft));
    return true;
  }catch{return false}
}

export function clearDraft(){try{window.localStorage.removeItem(AUTOSAVE_KEY)}catch{}}
