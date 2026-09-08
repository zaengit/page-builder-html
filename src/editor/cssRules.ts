export type CssRuleEntry={path:number[];selector:string;declarations:string;context:string};
export type CssDeclaration={property:string;value:string;priority:string};

function sheetFrom(css:string){const sheet=new CSSStyleSheet();try{sheet.replaceSync(css)}catch{return null}return sheet}

function walk(rules:CSSRuleList,path:number[]=[],context=''){const out:CssRuleEntry[]=[];[...rules].forEach((rule,index)=>{const next=[...path,index];if(rule instanceof CSSStyleRule)out.push({path:next,selector:rule.selectorText,declarations:rule.style.cssText,context});else if(rule instanceof CSSMediaRule)out.push(...walk(rule.cssRules,next,`@media ${rule.conditionText}`));});return out}

function byPath(sheet:CSSStyleSheet,path:number[]){let rules:CSSRuleList=sheet.cssRules;let rule:CSSRule|null=null;for(const index of path){rule=rules[index]||null;if(!rule)return null;if(rule instanceof CSSGroupingRule)rules=rule.cssRules}return rule}

function ownerAt(sheet:CSSStyleSheet,path:number[]){if(!path.length)return null;let rules:CSSRuleList=sheet.cssRules;let owner:CSSStyleSheet|CSSGroupingRule=sheet;for(let i=0;i<path.length-1;i++){const rule=rules[path[i]];if(!(rule instanceof CSSGroupingRule))return null;owner=rule;rules=rule.cssRules}return{owner,rules,index:path[path.length-1]}}

function serialize(sheet:CSSStyleSheet){return[...sheet.cssRules].map(rule=>rule.cssText).join('\n\n')}

export function listCssRules(css:string){const sheet=sheetFrom(css);return sheet?walk(sheet.cssRules):[]}

export function updateCssRule(css:string,path:number[],declarations:string){const sheet=sheetFrom(css);if(!sheet)return css;const rule=byPath(sheet,path);if(!(rule instanceof CSSStyleRule))return css;rule.style.cssText=declarations;return serialize(sheet)}

export function renameCssRule(css:string,path:number[],selector:string){const sheet=sheetFrom(css);if(!sheet)return css;const rule=byPath(sheet,path);if(!(rule instanceof CSSStyleRule))return css;const next=selector.trim();if(!next)return css;try{rule.selectorText=next}catch{return css}return serialize(sheet)}

export function deleteCssRule(css:string,path:number[]){const sheet=sheetFrom(css);if(!sheet)return css;const info=ownerAt(sheet,path);if(!info)return css;info.owner.deleteRule(info.index);return serialize(sheet)}

export function duplicateCssRule(css:string,path:number[]){const sheet=sheetFrom(css);if(!sheet)return css;const info=ownerAt(sheet,path);if(!info)return css;const rule=info.rules[info.index];if(!rule)return css;try{info.owner.insertRule(rule.cssText,info.index+1)}catch{return css}return serialize(sheet)}

export function moveCssRule(css:string,path:number[],direction:-1|1){const sheet=sheetFrom(css);if(!sheet)return css;const info=ownerAt(sheet,path);if(!info)return css;const target=info.index+direction;if(target<0||target>=info.rules.length)return css;const rule=info.rules[info.index];if(!rule)return css;const text=rule.cssText;info.owner.deleteRule(info.index);const insertAt=direction===1?target:target;try{info.owner.insertRule(text,insertAt)}catch{return css}return serialize(sheet)}

export function insertCssRule(css:string,selector:string,context=''){const sheet=sheetFrom(css);if(!sheet)return css;const sel=selector.trim();if(!sel)return css;const ruleText=`${sel} { }`;try{
  if(context.startsWith('@media ')){
    const condition=context.slice(7).trim();
    const media=[...sheet.cssRules].find(r=>r instanceof CSSMediaRule&&r.conditionText===condition)as CSSMediaRule|undefined;
    if(media)media.insertRule(ruleText,media.cssRules.length);
    else sheet.insertRule(`@media ${condition} { ${ruleText} }`,sheet.cssRules.length);
  }else sheet.insertRule(ruleText,sheet.cssRules.length);
}catch{return css}return serialize(sheet)}

function declarationChunks(input:string){const out:string[]=[];let start=0,depth=0,quote='';for(let i=0;i<input.length;i++){const ch=input[i];if(quote){if(ch==='\\'){i++;continue}if(ch===quote)quote='';continue}if(ch==='"'||ch==="'"){quote=ch;continue}if(ch==='('||ch==='['){depth++;continue}if((ch===')'||ch===']')&&depth>0){depth--;continue}if(ch===';'&&depth===0){out.push(input.slice(start,i));start=i+1}}out.push(input.slice(start));return out}

export function parseDeclarations(declarations:string){const out:CssDeclaration[]=[];for(const raw of declarationChunks(declarations)){const line=raw.trim();if(!line)continue;const colon=line.indexOf(':');if(colon<=0)continue;const property=line.slice(0,colon).trim();let value=line.slice(colon+1).trim();let priority='';if(/\s*!important\s*$/i.test(value)){value=value.replace(/\s*!important\s*$/i,'').trim();priority='important'}if(property)out.push({property,value,priority})}return out}

export function serializeDeclarations(rows:CssDeclaration[]){return rows.filter(r=>r.property.trim()).map(r=>`${r.property.trim()}: ${r.value.trim()}${r.priority?' !important':''};`).join(' ')}
