import type{Device,PageMeta,SavedRevision,WorkspaceFile}from'../types/editor';
import{fileTypeFromName,makeWorkspaceFile}from'./workspace';

const REVISION_KEY='visual-html-page-builder:revisions:v1';
const BP:Record<Device,string|null>={desktop:null,tablet:'1024px',mobile:'640px'};

export async function filesFromProject(input:FileList|File[]){
  const source=Array.from(input);const out:WorkspaceFile[]=[];
  for(const file of source){const type=fileTypeFromName(file.name);if(!type)continue;const rel=(file as File&{webkitRelativePath?:string}).webkitRelativePath||file.name;const path=rel.split('/').filter(Boolean).slice(rel.includes('/')?1:0).join('/')||file.name;out.push(makeWorkspaceFile(path,type,await file.text()))}
  return out;
}
export function chooseEntry(files:WorkspaceFile[]){return files.find(f=>f.type==='html'&&/(^|\/)index\.html?$/i.test(f.name))||files.find(f=>f.type==='html')||null}

function crcTable(){const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t}const CRC=crcTable();
function crc32(data:Uint8Array){let c=0xffffffff;for(const b of data)c=CRC[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function u16(v:number){return[v&255,(v>>>8)&255]}function u32(v:number){return[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
export function downloadProjectZip(files:WorkspaceFile[],name='page-builder-project.zip'){
  const enc=new TextEncoder(),locals:number[]=[],centrals:number[]=[];let offset=0;
  for(const file of files){const filename=enc.encode(file.name),data=enc.encode(file.content),crc=crc32(data),local=[...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(filename.length),...u16(0),...filename,...data];locals.push(...local);const central=[...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(filename.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...filename];centrals.push(...central);offset+=local.length}
  const end=[...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centrals.length),...u32(locals.length),...u16(0)],blob=new Blob([new Uint8Array([...locals,...centrals,...end])],{type:'application/zip'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
export function loadRevisions():SavedRevision[]{try{const v=JSON.parse(localStorage.getItem(REVISION_KEY)||'[]');return Array.isArray(v)?v.slice(0,20):[]}catch{return[]}}
export function saveRevision(r:SavedRevision){try{const next=[r,...loadRevisions().filter(x=>x.id!==r.id)].slice(0,20);localStorage.setItem(REVISION_KEY,JSON.stringify(next))}catch{}}
export function makeRevision(files:WorkspaceFile[],activeFileId:string,entryFileId:string,device:Device,label='Manual snapshot'):SavedRevision{return{id:crypto.randomUUID(),createdAt:Date.now(),label,files:structuredClone(files),activeFileId,entryFileId,device}}

function ensureStyle(doc:Document){let style=doc.querySelector<HTMLStyleElement>('style[data-vpb-responsive-rules]');if(!style){style=doc.createElement('style');style.setAttribute('data-vpb-responsive-rules','true');doc.head.append(style)}return style}
export function ensureBuilderClass(el:HTMLElement){let cls=[...el.classList].find(x=>x.startsWith('vpb-'));if(!cls){const id=el.getAttribute('data-vpb-id')||crypto.randomUUID();cls=`vpb-${id.replace(/[^a-z0-9_-]/gi,'').slice(0,12)}`;el.classList.add(cls)}return cls}
function parseRuleBook(style:HTMLStyleElement){try{return JSON.parse(style.dataset.vpbRuleBook||'{}')as Record<string,Record<string,string>>}catch{return{}}}
function writeRuleBook(style:HTMLStyleElement,book:Record<string,Record<string,string>>){style.dataset.vpbRuleBook=JSON.stringify(book);const base:string[]=[],tablet:string[]=[],mobile:string[]=[];for(const[key,props]of Object.entries(book)){const body=Object.entries(props).filter(([,v])=>v!=='').map(([p,v])=>`${p}:${v}`).join(';');if(!body)continue;if(key.startsWith('tablet|'))tablet.push(`${key.slice(7)}{${body}}`);else if(key.startsWith('mobile|'))mobile.push(`${key.slice(7)}{${body}}`);else base.push(`${key}{${body}}`)}style.textContent=[...base,tablet.length?`@media(max-width:${BP.tablet}){${tablet.join('')}}`:'',mobile.length?`@media(max-width:${BP.mobile}){${mobile.join('')}}`:''].filter(Boolean).join('\n')}
export function setResponsiveRule(doc:Document,el:HTMLElement,device:Device,property:string,value:string,pseudo=''){const cls=ensureBuilderClass(el),style=ensureStyle(doc),book=parseRuleBook(style),selector=`.${CSS.escape(cls)}${pseudo}`,key=device==='desktop'?selector:`${device}|${selector}`;book[key]??={};if(value)book[key][property]=value;else delete book[key][property];writeRuleBook(style,book)}
export function getResponsiveRule(doc:Document,el:HTMLElement,device:Device,property:string,pseudo=''){const cls=[...el.classList].find(x=>x.startsWith('vpb-'));if(!cls)return'';const style=doc.querySelector<HTMLStyleElement>('style[data-vpb-responsive-rules]');if(!style)return'';const book=parseRuleBook(style),selector=`.${CSS.escape(cls)}${pseudo}`,key=device==='desktop'?selector:`${device}|${selector}`;return book[key]?.[property]||''}

export function getPageMeta(doc:Document):PageMeta{return{title:doc.title||'',description:doc.querySelector<HTMLMetaElement>('meta[name="description"]')?.content||'',favicon:doc.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href||''}}
export function setPageMeta(doc:Document,meta:Partial<PageMeta>){if(meta.title!==undefined)doc.title=meta.title;if(meta.description!==undefined){let el=doc.querySelector<HTMLMetaElement>('meta[name="description"]');if(!el){el=doc.createElement('meta');el.name='description';doc.head.append(el)}el.content=meta.description}if(meta.favicon!==undefined){let el=doc.querySelector<HTMLLinkElement>('link[rel~="icon"]');if(!el){el=doc.createElement('link');el.rel='icon';doc.head.append(el)}el.href=meta.favicon}}
