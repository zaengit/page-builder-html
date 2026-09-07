import{expect,test}from'@playwright/test';

const html='<!DOCTYPE html><html><head><title>Scoped CSS</title></head><body><main><section><h2>First heading</h2></section><section><h2>Second heading</h2></section></main></body></html>';

test('creates a unique id for an unscoped selected element and uses it in CSS helpers',async({page})=>{
  await page.goto('./');
  await page.evaluate(()=>localStorage.clear());
  await page.locator('input[type="file"]').setInputFiles({name:'scoped.html',mimeType:'text/html',buffer:Buffer.from(html)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  const first=frame.locator('h2').first();
  await expect(first).toBeVisible();
  await first.click();
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  await props.getByRole('button',{name:'Page CSS'}).click();
  await expect(props.getByText('Selector is not uniquely scoped')).toBeVisible();
  await props.getByRole('button',{name:'Create unique ID'}).click();
  await expect(first).toHaveAttribute('id','vpb-h2-1');
  await expect(props.getByText('#vpb-h2-1',{exact:true})).toBeVisible();
  await props.getByRole('button',{name:/Insert selector/i}).click();
  await expect(props.getByLabel('Page CSS')).toHaveValue(/#vpb-h2-1 \{/);
  await props.getByLabel('Page CSS').blur();
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+z');
  await expect(first).not.toHaveAttribute('id');
});

test('generated scoped ids avoid collisions',async({page})=>{
  const withCollision='<!DOCTYPE html><html><body><div id="vpb-h2-1"></div><h2>Target</h2></body></html>';
  await page.goto('./');
  await page.evaluate(()=>localStorage.clear());
  await page.locator('input[type="file"]').setInputFiles({name:'collision.html',mimeType:'text/html',buffer:Buffer.from(withCollision)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('h2').click();
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  await props.getByRole('button',{name:'Page CSS'}).click();
  await props.getByRole('button',{name:'Create unique ID'}).click();
  await expect(frame.locator('h2')).toHaveAttribute('id','vpb-h2-2');
});
