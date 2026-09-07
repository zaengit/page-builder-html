export type ElementType='text'|'heading'|'image'|'link'|'button'|'input'|'video'|'container'|'unknown';
export type ElementCapability='text'|'typography'|'color'|'image'|'alt'|'href'|'target'|'layout'|'size'|'objectFit'|'spacing'|'background'|'backgroundImage'|'border';
export interface ElementAnalysis{type:ElementType;tagName:string;capabilities:ElementCapability[];attributes:Record<string,string>;computedStyle:Record<string,string>;hasDirectText:boolean;hasBackgroundImage:boolean}
export type Device='desktop'|'tablet'|'mobile';
export interface TreeNode{id:string;tag:string;label:string;children:TreeNode[]}
export interface EditorSnapshot{html:string;selectedId:string|null}
export interface EditorContextValue{iframeRef:React.RefObject<HTMLIFrameElement|null>;html:string;fileName:string;selectedId:string|null;analysis:ElementAnalysis|null;tree:TreeNode[];device:Device;canUndo:boolean;canRedo:boolean;loadFile:(f:File)=>Promise<void>;select:(id:string|null)=>void;setDevice:(d:Device)=>void;mutate:(fn:(el:HTMLElement)=>void,group?:boolean)=>void;duplicate:()=>void;remove:()=>void;move:(dir:-1|1)=>void;undo:()=>void;redo:()=>void;exportHtml:()=>void;refresh:()=>void}