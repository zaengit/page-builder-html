import { expect, test, type FrameLocator } from '@playwright/test';

const fixture=`<!DOCTYPE html><html><head><style>
body{margin:0;padding:20px}main{display:grid;gap:12px}.block{height:80px;padding:12px;border:1px solid #ccc}
</style></head><body><main id="list">
<section id="one" class="block">One</section>
<section id="two" class="block">Two</section>
<section id="three" class="block">Three</section>
</main></body></html>`;

async function dragAfter(frame:FrameLocator,sourceSelector:string,targetSelector:string){
  await frame.locator(sourceSelector).evaluate((source,{targetSelector})=>{
    const target=document.querySelector<HTMLElement>(targetSelector);if(!target)return;
    const dt=new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:dt}));
    const rect=target.getBoundingClientRect();
    const init={bubbles:true,cancelable:true,dataTransfer:dt,clientX:rect.left+12,clientY:rect.bottom-4};
    target.dispatchEvent(new DragEvent('dragover',init));
    target.dispatchEvent(new DragEvent('drop',init));
    source.dispatchEvent(new DragEvent('dragend',{bubbles:true,cancelable:true,dataTransfer:dt}));
  },{targetSelector});
}

test('selected canvas block can be dragged after another block',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#one')).toBeVisible();
  await frame.locator('#one').click({position:{x:8,y:8}});
  await expect(frame.locator('#one')).toHaveAttribute('draggable','true');
  await dragAfter(frame,'#one','#three');
  const order=await frame.locator('#list > .block').evaluateAll(nodes=>nodes.map(node=>node.id));
  expect(order).toEqual(['two','three','one']);
  await expect(frame.locator('#one')).toHaveAttribute('data-vpb-id',/vpb-/);
});

test('drag move is undoable and keeps editor IDs unique',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('#one').click({position:{x:8,y:8}});
  await dragAfter(frame,'#one','#three');
  await page.keyboard.press('Control+z');
  const order=await frame.locator('#list > .block').evaluateAll(nodes=>nodes.map(node=>node.id));
  expect(order).toEqual(['one','two','three']);
  const ids=await frame.locator('[data-vpb-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});
