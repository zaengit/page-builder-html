import type{Device,WorkspaceFile}from'../types/editor';

export const AUTOSAVE_KEY='visual-html-page-builder:draft:v2';
const LEGACY_KEY='visual-html-page-builder:draft:v1';
export interface SavedDraft{version:2;files:WorkspaceFile[];activeFileId:string;entryFileId:string;device:Device;savedAt:number}

function validDevice(v:unknown):Device{return v==='tablet'||v==='mobile'||v==='desktop'?v:'desktop'}
export function loadDraft():SavedDraft|null{try{if(typeof window==='undefined')return null;const raw=window.localStorage.getItem(AUTOSAVE_KEY);if(raw){const v=JSON.parse(raw)as Partial<SavedDraft>;if(v.version===2&&Array.isArray(v.files)&&v.files.length){const files=v.files.filter((f):f is WorkspaceFile=>!!f&&typeof f.id==='string'&&typeof f.name==='string'&&typeof f.content==='string'&&(f.type==='html'||f.type==='css'||f.type==='js'));if(files.length){const entry=files.find(f=>f.id===v.entryFileId&&f.type==='html')||files.find(f=>f.type==='html');const active=files.find(f=>f.id===v.activeFileId)||entry||files[0];if(entry)return{version:2,files,activeFileId:active.id,entryFileId:entry.id,device:validDevice(v.device),savedAt:typeof v.savedAt==='number'?v.savedAt:0}}}}
const legacy=window.localStorage.getItem(LEGACY_KEY);if(!legacy)return null;const old=JSON.parse(legacy)as{version?:number;html?:string;fileName?:string;device?:Device};if(old.version!==1||typeof old.html!=='string'||!old.html)return null;const id=crypto.randomUUID();const file:WorkspaceFile={id,name:old.fileName||'index.html',type:'html',content:old.html,updatedAt:Date.now()};return{version:2,files:[file],activeFileId:id,entryFileId:id,device:validDevice(old.device),savedAt:Date.now()}}catch{return null}}
export function saveDraft(draft:Omit<SavedDraft,'version'|'savedAt'>){try{window.localStorage.setItem(AUTOSAVE_KEY,JSON.stringify({version:2,...draft,savedAt:Date.now()}satisfies SavedDraft));return true}catch{return false}}
export function clearDraft(){try{window.localStorage.removeItem(AUTOSAVE_KEY);window.localStorage.removeItem(LEGACY_KEY)}catch{}}
