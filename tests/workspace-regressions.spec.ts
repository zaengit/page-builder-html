import{expect,test}from'@playwright/test';

const key='visual-html-page-builder:draft:v2';
const fixture='<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1 id="hero">Fixture</h1></body></html>';

async function clearAndOpen(page:any){
  await page.addInitScript(()=>{if(window===window.top)localStorage.clear()});
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'fixture.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#hero')).toBeVisible();
  return frame;
}

test('visual mutation is preserved when a new workspace file is created',async({page})=>{
  const frame=await clearAndOpen(page);
  await frame.locator('#hero').click();
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  const inline=props.getByLabel('Element CSS');
  await inline.fill('padding: 37px;');
  await inline.blur();
  await expect(frame.locator('#hero')).toHaveCSS('padding-top','37px');

  await page.getByRole('button',{name:'Files',exact:true}).click();
  page.once('dialog',d=>d.accept('theme'));
  await page.getByTitle('New CSS').click();
  await expect(page.getByTestId('raw-editor')).toBeVisible();
  await page.waitForTimeout(500);

  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),key);
  const entry=saved.files?.find((f:any)=>f.id===saved.entryFileId);
  expect(entry?.content).toContain('padding: 37px');
  expect(saved.files?.some((f:any)=>f.name==='theme.css')).toBe(true);
});

test('renaming workspace css and js files rewrites entry references',async({page})=>{
  const workspace={version:2,files:[
    {id:'html-1',name:'index.html',type:'html',content:'<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><h1>App</h1><script src="main.js"></script></body></html>',updatedAt:1},
    {id:'css-1',name:'style.css',type:'css',content:'h1{color:red}',updatedAt:1},
    {id:'js-1',name:'main.js',type:'js',content:'window.__app=true',updatedAt:1}
  ],activeFileId:'html-1',entryFileId:'html-1',device:'desktop',savedAt:1};
  await page.addInitScript(({key,workspace})=>{if(window===window.top){localStorage.clear();localStorage.setItem(key,JSON.stringify(workspace))}},{key,workspace});
  await page.goto('./');
  await page.getByRole('button',{name:'Files',exact:true}).click();

  page.once('dialog',d=>d.accept('theme.css'));
  await page.getByTestId('file-explorer').getByRole('button',{name:/style\.css/}).dblclick();
  page.once('dialog',d=>d.accept('app.js'));
  await page.getByTestId('file-explorer').getByRole('button',{name:/main\.js/}).dblclick();
  await page.waitForTimeout(500);

  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),key);
  const entry=saved.files.find((f:any)=>f.id==='html-1');
  expect(entry.content).toContain('href="theme.css"');
  expect(entry.content).toContain('src="app.js"');
  expect(entry.content).not.toContain('href="style.css"');
  expect(entry.content).not.toContain('src="main.js"');
});

test('undo snapshot survives switching to raw mode and autosave',async({page})=>{
  const frame=await clearAndOpen(page);
  await frame.locator('#hero').click();
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  const inline=props.getByLabel('Element CSS');
  await inline.fill('margin: 41px;');
  await inline.blur();
  await expect(frame.locator('#hero')).toHaveCSS('margin-top','41px');
  await page.keyboard.press('Control+z');
  await expect(frame.locator('#hero')).not.toHaveAttribute('style');

  await page.getByTestId('mode-raw').click();
  await expect(page.getByTestId('raw-editor')).toBeVisible();
  await page.waitForTimeout(500);
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),key);
  const entry=saved.files?.find((f:any)=>f.id===saved.entryFileId);
  expect(entry?.content).not.toContain('margin: 41px');
});
