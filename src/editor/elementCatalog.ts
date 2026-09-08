export type ElementGroup='layout'|'content'|'media'|'interactive'|'embed'|'semantic';

export interface ElementDefinition{
  id:string;
  label:string;
  group:ElementGroup;
  create:(doc:Document)=>HTMLElement;
}

const el=(doc:Document,tag:string,text?:string)=>{const node=doc.createElement(tag);if(text)node.textContent=text;return node};

export const elementGroups:{id:ElementGroup;label:string}[]=[
  {id:'layout',label:'Layout'},
  {id:'content',label:'Content'},
  {id:'media',label:'Media'},
  {id:'interactive',label:'Interactive'},
  {id:'embed',label:'Embed'},
  {id:'semantic',label:'Semantic'},
];

export const elementCatalog:ElementDefinition[]=[
  {id:'section',label:'Section',group:'layout',create:d=>el(d,'section')},
  {id:'container',label:'Container',group:'layout',create:d=>{const n=el(d,'div');n.setAttribute('style','max-width: 1200px; margin: 0 auto; padding: 16px;');return n}},
  {id:'flex',label:'Flex',group:'layout',create:d=>{const n=el(d,'div');n.style.cssText='display:flex;gap:16px;';return n}},
  {id:'row',label:'Row',group:'layout',create:d=>{const n=el(d,'div');n.style.cssText='display:flex;flex-direction:row;gap:16px;';return n}},
  {id:'column',label:'Column',group:'layout',create:d=>{const n=el(d,'div');n.style.cssText='display:flex;flex-direction:column;gap:16px;';return n}},
  {id:'grid',label:'Grid',group:'layout',create:d=>{const n=el(d,'div');n.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;';return n}},
  {id:'spacer',label:'Spacer',group:'layout',create:d=>{const n=el(d,'div');n.style.minHeight='48px';n.setAttribute('aria-hidden','true');return n}},
  {id:'divider',label:'Divider',group:'layout',create:d=>el(d,'hr')},

  {id:'text',label:'Text',group:'content',create:d=>el(d,'span','Text')},
  {id:'paragraph',label:'Paragraph',group:'content',create:d=>el(d,'p','Paragraph')},
  {id:'h1',label:'Heading 1',group:'content',create:d=>el(d,'h1','Heading 1')},
  {id:'h2',label:'Heading 2',group:'content',create:d=>el(d,'h2','Heading 2')},
  {id:'h3',label:'Heading 3',group:'content',create:d=>el(d,'h3','Heading 3')},
  {id:'h4',label:'Heading 4',group:'content',create:d=>el(d,'h4','Heading 4')},
  {id:'h5',label:'Heading 5',group:'content',create:d=>el(d,'h5','Heading 5')},
  {id:'h6',label:'Heading 6',group:'content',create:d=>el(d,'h6','Heading 6')},
  {id:'blockquote',label:'Blockquote',group:'content',create:d=>el(d,'blockquote','Quote')},
  {id:'strong',label:'Bold Text',group:'content',create:d=>el(d,'strong','Bold text')},
  {id:'emphasis',label:'Emphasis',group:'content',create:d=>el(d,'em','Emphasized text')},
  {id:'unordered-list',label:'Bullet List',group:'content',create:d=>{const n=el(d,'ul');n.append(el(d,'li','List item'),el(d,'li','List item'));return n}},
  {id:'ordered-list',label:'Numbered List',group:'content',create:d=>{const n=el(d,'ol');n.append(el(d,'li','List item'),el(d,'li','List item'));return n}},
  {id:'list-item',label:'List Item',group:'content',create:d=>el(d,'li','List item')},
  {id:'table',label:'Table',group:'content',create:d=>{const table=el(d,'table');const head=el(d,'thead');const hr=el(d,'tr');hr.append(el(d,'th','Column 1'),el(d,'th','Column 2'));head.append(hr);const body=el(d,'tbody');const row=el(d,'tr');row.append(el(d,'td','Cell'),el(d,'td','Cell'));body.append(row);table.append(head,body);return table}},

  {id:'image',label:'Image',group:'media',create:d=>{const n=el(d,'img') as HTMLImageElement;n.alt='Image';n.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect width="640" height="360" fill="%23272a36"/%3E%3Ctext x="50%25" y="50%25" fill="%23a1a1aa" font-size="28" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E';return n}},
  {id:'video',label:'Video',group:'media',create:d=>{const n=el(d,'video') as HTMLVideoElement;n.controls=true;n.style.minHeight='180px';return n}},
  {id:'audio',label:'Audio',group:'media',create:d=>{const n=el(d,'audio') as HTMLAudioElement;n.controls=true;return n}},
  {id:'figure',label:'Figure',group:'media',create:d=>{const n=el(d,'figure');n.append(el(d,'figcaption','Figure caption'));return n}},

  {id:'button',label:'Button',group:'interactive',create:d=>{const n=el(d,'button','Button') as HTMLButtonElement;n.type='button';return n}},
  {id:'link',label:'Link',group:'interactive',create:d=>{const n=el(d,'a','Link') as HTMLAnchorElement;n.href='#';return n}},
  {id:'label',label:'Label',group:'interactive',create:d=>el(d,'label','Label')},
  {id:'input',label:'Input',group:'interactive',create:d=>{const n=el(d,'input') as HTMLInputElement;n.placeholder='Input';return n}},
  {id:'textarea',label:'Textarea',group:'interactive',create:d=>{const n=el(d,'textarea') as HTMLTextAreaElement;n.placeholder='Textarea';return n}},
  {id:'select',label:'Select',group:'interactive',create:d=>{const n=el(d,'select') as HTMLSelectElement;const o=el(d,'option','Option') as HTMLOptionElement;n.append(o);return n}},
  {id:'form',label:'Form',group:'interactive',create:d=>{const n=el(d,'form');const input=el(d,'input') as HTMLInputElement;input.placeholder='Input';const button=el(d,'button','Submit') as HTMLButtonElement;button.type='submit';n.append(input,button);return n}},

  {id:'html',label:'HTML Embed',group:'embed',create:d=>{const n=el(d,'div','HTML Embed');n.setAttribute('data-embed-placeholder','html');return n}},
  {id:'iframe',label:'iframe',group:'embed',create:d=>{const n=el(d,'iframe') as HTMLIFrameElement;n.title='Embedded content';n.src='about:blank';n.style.minHeight='180px';return n}},
  {id:'code',label:'Code / Pre',group:'embed',create:d=>{const n=el(d,'pre');n.append(el(d,'code','const example = true;'));return n}},

  {id:'header',label:'Header',group:'semantic',create:d=>el(d,'header')},
  {id:'main',label:'Main',group:'semantic',create:d=>el(d,'main')},
  {id:'nav',label:'Nav',group:'semantic',create:d=>el(d,'nav')},
  {id:'article',label:'Article',group:'semantic',create:d=>el(d,'article')},
  {id:'aside',label:'Aside',group:'semantic',create:d=>el(d,'aside')},
  {id:'footer',label:'Footer',group:'semantic',create:d=>el(d,'footer')},
  {id:'details',label:'Details',group:'semantic',create:d=>{const n=el(d,'details');n.append(el(d,'summary','Details'),el(d,'p','Details content'));return n}},
  {id:'summary',label:'Summary',group:'semantic',create:d=>el(d,'summary','Summary')},
];

export function createCatalogElement(doc:Document,id:string){return elementCatalog.find(x=>x.id===id)?.create(doc)||null}
