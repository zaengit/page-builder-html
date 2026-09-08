export type ElementType='text'|'heading'|'image'|'link'|'button'|'input'|'video'|'container'|'unknown';
export type ElementCapability='text'|'typography'|'color'|'image'|'alt'|'href'|'target'|'layout'|'size'|'objectFit'|'spacing'|'background'|'backgroundImage'|'border';
export interface ElementAnalysis{type:ElementType;tagName:string;capabilities:ElementCapability[];attributes:Record<string,string>;computedStyle:Record<string,string>;hasDirectText:boolean;hasBackgroundImage:boolean}
export type Device='desktop'|'tablet'|'mobile';
export type InsertPosition='inside'|'before'|'after';
export type EditorMode='visual'|'raw';
export type WorkspaceFileType='html'|'css'|'js';
export interface WorkspaceFile{id:string;name:string;type:WorkspaceFileType;content:string;updatedAt:number}
export interface TreeNode{id:string;tag:string;label:string;children:TreeNode[]}
export interface EditorSnapshot{html:string;selectedId:string|null}
export interface EditorContextValue{
  iframeRef:React.RefObject<HTMLIFrameElement|null>;
  html:string;renderedHtml:string;fileName:string;files:WorkspaceFile[];activeFileId:string;entryFileId:string;mode:EditorMode;
  selectedId:string|null;analysis:ElementAnalysis|null;tree:TreeNode[];device:Device;canUndo:boolean;canRedo:boolean;hasCopiedBlock:boolean;hasCopiedStyle:boolean;
  loadFile:(f:File)=>Promise<void>;select:(id:string|null)=>void;setDevice:(d:Device)=>void;setMode:(mode:EditorMode)=>void;setActiveFile:(id:string)=>void;
  createFile:(name:string,type:WorkspaceFileType)=>boolean;renameFile:(id:string,name:string)=>boolean;duplicateFile:(id:string)=>void;deleteFile:(id:string)=>void;updateActiveFileContent:(content:string)=>void;setEntryFile:(id:string)=>void;
  mutate:(fn:(el:HTMLElement)=>void)=>void;mutateGrouped:(key:string,fn:(el:HTMLElement)=>void)=>void;flushGroupedMutation:()=>void;insertElement:(kind:string,position?:InsertPosition,targetId?:string|null)=>void;insertHtml:(html:string,position?:InsertPosition,targetId?:string|null)=>void;moveBlock:(sourceId:string,targetId:string,position:InsertPosition)=>void;duplicate:()=>void;copyBlock:()=>void;pasteBlock:(where:'before'|'after')=>void;copyStyle:()=>void;pasteStyle:()=>void;clearInlineStyle:()=>void;remove:()=>void;move:(dir:-1|1)=>void;undo:()=>void;redo:()=>void;exportHtml:()=>void;exportCurrentFile:()=>void;refresh:()=>void
}