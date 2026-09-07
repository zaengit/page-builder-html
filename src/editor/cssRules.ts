export type CssRuleEntry={path:number[];selector:string;declarations:string;context:string};

function sheetFrom(css:string){const sheet=new CSSStyleSheet();try{sheet.replaceSync(css)}catch{return null}return sheet}

function walk(rules:CSSRuleList,path:number[]=[],context=''){const out:CssRuleEntry[]=[];[...rules].forEach((rule,index)=>{const next=[...path,index];if(rule instanceof CSSStyleRule)out.push({path:next,selector:rule.selectorText,declarations:rule.style.cssText,context});else if(rule instanceof CSSMediaRule)out.push(...walk(rule.cssRules,next,`@media ${rule.conditionText}`));});return out}

function byPath(sheet:CSSStyleSheet,path:number[]){let rules:CSSRuleList=sheet.cssRules;let rule:CSSRule|null=null;for(const index of path){rule=rules[index]||null;if(!rule)return null;if(rule instanceof CSSGroupingRule)rules=rule.cssRules}return rule}

function serialize(sheet:CSSStyleSheet){return[...sheet.cssRules].map(rule=>rule.cssText).join('\n\n')}

export function listCssRules(css:string){const sheet=sheetFrom(css);return sheet?walk(sheet.cssRules):[]}

export function updateCssRule(css:string,path:number[],declarations:string){const sheet=sheetFrom(css);if(!sheet)return css;const rule=byPath(sheet,path);if(!(rule instanceof CSSStyleRule))return css;rule.style.cssText=declarations;return serialize(sheet)}

export function deleteCssRule(css:string,path:number[]){const sheet=sheetFrom(css);if(!sheet||!path.length)return css;let rules:CSSRuleList=sheet.cssRules;let owner:CSSStyleSheet|CSSGroupingRule=sheet;for(let i=0;i<path.length-1;i++){const rule=rules[path[i]];if(!(rule instanceof CSSGroupingRule))return css;owner=rule;rules=rule.cssRules}owner.deleteRule(path[path.length-1]);return serialize(sheet)}

export function duplicateCssRule(css:string,path:number[]){const sheet=sheetFrom(css);if(!sheet||!path.length)return css;let rules:CSSRuleList=sheet.cssRules;let owner:CSSStyleSheet|CSSGroupingRule=sheet;for(let i=0;i<path.length-1;i++){const rule=rules[path[i]];if(!(rule instanceof CSSGroupingRule))return css;owner=rule;rules=rule.cssRules}const index=path[path.length-1],rule=rules[index];if(!rule)return css;owner.insertRule(rule.cssText,index+1);return serialize(sheet)}
