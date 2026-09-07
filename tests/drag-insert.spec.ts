import{expect,test}from'@playwright/test';

const fixture='<!doctype html><html><body><main id="main"><section id="one" style="min-height:120px;padding:30px">One</section><section id="two" style="min-height:120px;padding:30px">Two</section></main></body></html>';

test('palette element can be dragged into iframe canvas',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#one')).toBeVisible();

  const source=page.getByTitle('Insert Section');
  await expect(source).toHaveAttribute('draggable','true');
  await source.dragTo(frame.locator('#one'));

  await expect(frame.locator('#one > section')).toHaveCount(1);
  const ids=await frame.locator('[data-vpb-id]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});

test('click insertion remains available as mobile fallback',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'drag.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('#one').click({position:{x:10,y:10}});
  await page.getByRole('button',{name:'Elements'}).click();
  await page.getByTitle('Insert Section').click();
  await expect(frame.locator('#one > section')).toHaveCount(1);
});
