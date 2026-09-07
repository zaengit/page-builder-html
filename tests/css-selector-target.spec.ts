import{expect,test}from'@playwright/test';

const html='<!DOCTYPE html><html><head><title>Selector target</title></head><body><main><section id="hero" class="card featured">Hero</section><section class="card">Second</section></main></body></html>';

test('CSS helper can target class, id, and tag explicitly',async({page})=>{
  await page.goto('./');
  await page.evaluate(()=>localStorage.clear());
  await page.locator('input[type="file"]').setInputFiles({name:'selector.html',mimeType:'text/html',buffer:Buffer.from(html)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('#hero').click({position:{x:4,y:4}});
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  await props.getByRole('button',{name:'Page CSS'}).click();

  await props.getByRole('button',{name:'Class',exact:true}).click();
  await expect(props.getByLabel('CSS selector class')).toBeVisible();
  await props.getByLabel('CSS selector class').selectOption('featured');
  await props.getByRole('button',{name:'Hover'}).click();
  await expect(props.getByText('.featured:hover',{exact:true})).toBeVisible();
  await props.getByRole('button',{name:/Insert selector/i}).click();
  await expect(props.getByLabel('Page CSS')).toHaveValue(/\.featured:hover \{/);

  await props.getByRole('button',{name:'ID',exact:true}).click();
  await expect(props.getByText('#hero:hover',{exact:true})).toBeVisible();

  await props.getByRole('button',{name:'Tag',exact:true}).click();
  await expect(props.getByText('section:hover',{exact:true})).toBeVisible();
});

test('selector target disables unavailable id and class choices',async({page})=>{
  const noHooks='<!DOCTYPE html><html><body><p>Plain</p></body></html>';
  await page.goto('./');
  await page.evaluate(()=>localStorage.clear());
  await page.locator('input[type="file"]').setInputFiles({name:'plain.html',mimeType:'text/html',buffer:Buffer.from(noHooks)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await frame.locator('p').click();
  const props=page.locator('aside').filter({hasText:'Properties'}).last();
  await props.getByRole('tab',{name:'CSS'}).click();
  await props.getByRole('button',{name:'Page CSS'}).click();
  await expect(props.getByRole('button',{name:'ID',exact:true})).toBeDisabled();
  await expect(props.getByRole('button',{name:'Class',exact:true})).toBeDisabled();
  await expect(props.getByText('Selector is not uniquely scoped')).toBeVisible();
});
