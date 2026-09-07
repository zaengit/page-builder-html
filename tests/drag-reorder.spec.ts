import { expect, test } from '@playwright/test';

const fixture=`<!DOCTYPE html><html><head><style>
body{margin:0;padding:20px}main{display:grid;gap:12px}.block{height:80px;padding:12px;border:1px solid #ccc}
</style></head><body><main id="list">
<section id="one" class="block">One</section>
<section id="two" class="block">Two</section>
<section id="three" class="block">Three</section>
</main></body></html>`;

test('selected canvas block can be dragged after another block',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#one')).toBeVisible();
  await frame.locator('#one').click({position:{x:8,y:8}});
  await expect(frame.locator('#one')).toHaveAttribute('draggable','true');
  const box=await frame.locator('#three').boundingBox();
  expect(box).not.toBeNull();
  await frame.locator('#one').dragTo(frame.locator('#three'),{targetPosition:{x:12,y:(box?.height||80)-4}});
  const order=await frame.locator('#list > .block').evaluateAll(nodes=>nodes.map(node=>node.id));
  expect(order).toEqual(['two','three','one']);
  await expect(frame.locator('#one')).toHaveAttribute('data-vpb-id',/vpb-/);
});

test('drag move is undoable and keeps editor IDs unique',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('#one').click({position:{x:8,y:8}});
  const box=await frame.locator('#three').boundingBox();
  await frame.locator('#one').dragTo(frame.locator('#three'),{targetPosition:{x:12,y:(box?.height||80)-4}});
  await page.keyboard.press('Control+z');
  const order=await frame.locator('#list > .block').evaluateAll(nodes=>nodes.map(node=>node.id));
  expect(order).toEqual(['one','two','three']);
  const ids=await frame.locator('[data-vpb-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});
