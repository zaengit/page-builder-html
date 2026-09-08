import{expect,test}from'@playwright/test';

const fixture='<!DOCTYPE html><html><body><main><section id="hero"><h1 id="title">Hello</h1><p>World</p></section></main></body></html>';

async function upload(page:any){
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'elements.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#title')).toBeVisible();
  return frame;
}

test('Elements defaults to Insert and search filters across groups',async({page})=>{
  await upload(page);
  await expect(page.getByRole('tab',{name:'Insert'})).toHaveAttribute('aria-selected','true');
  const search=page.getByLabel('Search elements');
  await search.fill('Heading 4');
  await expect(page.getByTitle('Insert Heading 4')).toBeVisible();
  await expect(page.getByTitle('Insert Section')).toHaveCount(0);
});

test('Elements exposes common layout and content building blocks',async({page})=>{
  await upload(page);
  await expect(page.getByTitle('Insert Section')).toBeVisible();
  await expect(page.getByTitle('Insert Flex')).toBeVisible();
  await expect(page.getByTitle('Insert Column')).toBeVisible();
  await expect(page.getByTitle('Insert Spacer')).toBeVisible();
  await expect(page.getByTitle('Insert Divider')).toBeVisible();
  await page.getByRole('tab',{name:'Content'}).click();
  await expect(page.getByTitle('Insert Heading 1')).toBeVisible();
  await expect(page.getByTitle('Insert Paragraph')).toBeVisible();
  await expect(page.getByTitle('Insert Blockquote')).toBeVisible();
  await expect(page.getByTitle('Insert Bullet List')).toBeVisible();
  await expect(page.getByTitle('Insert Numbered List')).toBeVisible();
  await expect(page.getByTitle('Insert Table')).toBeVisible();
});

test('Inside insertion falls back to a valid sibling for block elements',async({page})=>{
  const frame=await upload(page);
  await frame.locator('#title').click();
  await page.getByRole('tab',{name:'Layout'}).click();
  await page.getByTitle('Insert Section').click();
  await expect(frame.locator('#title > section')).toHaveCount(0);
  await expect(frame.locator('#hero > h1 + section')).toHaveCount(1);
});

test('Tree tab exposes imported DOM and can select an existing node',async({page})=>{
  const frame=await upload(page);
  await page.getByRole('tab',{name:'Tree'}).click();
  await expect(page.getByRole('tab',{name:'Tree'})).toHaveAttribute('aria-selected','true');
  const elementsPanel=page.locator('aside').filter({hasText:'Elements'}).first();
  await expect(elementsPanel.getByText('body',{exact:true})).toBeVisible();
  await expect(elementsPanel.getByText('main',{exact:true})).toBeVisible();
  await expect(elementsPanel.getByText('section',{exact:true})).toBeVisible();
  await elementsPanel.getByText('h1',{exact:true}).click();
  await expect(frame.locator('#title')).toHaveAttribute('data-vpb-selected','');
  await expect(page.getByText('<h1> · heading')).toBeVisible();
});
