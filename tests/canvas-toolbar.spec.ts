import{expect,test}from'@playwright/test';

const html=`<!DOCTYPE html><html><body><main><section id="one" style="padding:24px">One</section><section id="two" style="padding:24px">Two</section></main></body></html>`;

test('selected canvas block shows floating toolbar with block actions',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'toolbar.html',mimeType:'text/html',buffer:Buffer.from(html)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#one')).toBeVisible();
  await frame.locator('#one').click({position:{x:8,y:8}});
  const toolbar=page.getByTestId('canvas-block-toolbar');
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toContainText('<section>');

  await page.getByTitle('Canvas duplicate').click();
  await expect(frame.locator('main > section')).toHaveCount(3);

  await page.getByTitle('Canvas copy block').click();
  await expect(page.getByTitle('Canvas paste after')).toBeEnabled();
});

test('canvas toolbar delete removes selected block and toolbar',async({page})=>{
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'toolbar.html',mimeType:'text/html',buffer:Buffer.from(html)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('#two').click({position:{x:8,y:8}});
  await expect(page.getByTestId('canvas-block-toolbar')).toBeVisible();
  await page.getByTitle('Canvas delete').click();
  await expect(frame.locator('#two')).toHaveCount(0);
  await expect(page.getByTestId('canvas-block-toolbar')).toHaveCount(0);
});
