import { expect, test, type Page } from '@playwright/test';

const fixture = `<!DOCTYPE html>
<html>
<head><title>Fixture</title></head>
<body>
  <main>
    <h1 id="title">Hello <strong>John</strong> welcome</h1>
    <div id="card" style="background-color: rgb(255, 255, 255)">
      <img id="photo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3C/svg%3E" alt="demo">
      <p>Paragraph</p>
    </div>
    <section id="target"><p>Target</p></section>
  </main>
</body>
</html>`;

async function upload(page: Page) {
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'fixture.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame = page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#title')).toBeVisible();
  return frame;
}

test('uploads HTML and selects an iframe element', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#title').click();
  await expect(page.getByText('<h1> · heading')).toBeVisible();
});

test('edits direct text without deleting nested children', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#title').click();
  const textarea = page.locator('textarea').first();
  await textarea.fill('Updated');
  await textarea.blur();
  await expect(frame.locator('#title strong')).toHaveText('John');
  await expect(frame.locator('#title')).toHaveText('UpdatedJohn');
});

test('universal CSS editor applies inline CSS to selected element', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#card').click({position:{x:4,y:4}});
  const css=page.getByLabel('Element CSS');
  await expect(css).toHaveValue(/background-color/i);
  await css.fill('background-color: rgb(12, 34, 56); padding: 33px; border-radius: 9px;');
  await page.getByRole('button',{name:'Apply CSS'}).click();
  await expect(frame.locator('#card')).toHaveCSS('background-color','rgb(12, 34, 56)');
  await expect(frame.locator('#card')).toHaveCSS('padding-top','33px');
});

test('copies selected block and pastes after another block with unique editor IDs', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#card').click({position:{x:4,y:4}});
  await page.getByTitle('Copy block').click();
  await frame.locator('#target').click({position:{x:4,y:4}});
  await page.getByTitle('Paste after').click();
  await expect(frame.locator('main > div#card')).toHaveCount(2);
  const ids=await frame.locator('[data-vpb-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});

test('inserts catalog elements before, inside, and after selection', async ({ page }) => {
  const frame=await upload(page);
  const panel=page.locator('aside').filter({hasText:'Elements'}).first();
  await frame.locator('#target').click({position:{x:4,y:4}});
  await panel.getByRole('tab',{name:'Content'}).click();
  await panel.getByRole('button',{name:'Before'}).click();
  await panel.getByTitle('Insert Paragraph').click();
  await expect(frame.locator('#target').locator('xpath=preceding-sibling::*[1]')).toHaveText('Paragraph');

  await frame.locator('#target').click({position:{x:4,y:4}});
  await panel.getByRole('button',{name:'Inside'}).click();
  await panel.getByTitle('Insert Heading 2').click();
  await expect(frame.locator('#target > h2')).toHaveText('Heading 2');

  await frame.locator('#target').click({position:{x:4,y:4}});
  await panel.getByRole('button',{name:'After'}).click();
  await panel.getByTitle('Insert Text').click();
  await expect(frame.locator('#target').locator('xpath=following-sibling::*[1]')).toHaveText('Text');
});

test('HTML Embed inserts raw nested HTML and reindexes editor IDs', async ({ page }) => {
  const frame=await upload(page);
  await frame.locator('#target').click({position:{x:4,y:4}});
  const panel=page.locator('aside').filter({hasText:'Elements'}).first();
  await panel.getByRole('tab',{name:'Embed'}).click();
  await panel.getByTitle('Insert HTML Embed').click();
  const editor=panel.locator('textarea');
  await editor.fill('<article id="embedded"><h3>Embedded title</h3><p>Nested content</p></article>');
  await panel.getByRole('button',{name:'Insert HTML'}).click();
  await expect(frame.locator('#target > #embedded h3')).toHaveText('Embedded title');
  const ids=await frame.locator('[data-vpb-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});

test('keeps editor IDs unique after duplicate', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#card').click({position:{x:4,y:4}});
  await page.getByTitle('Duplicate').click();
  const ids = await frame.locator('[data-vpb-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});

test('switches responsive preview width without editing HTML', async ({ page }) => {
  await upload(page);
  await page.getByTitle('mobile').click();
  const iframe = page.locator('iframe[title="HTML canvas"]');
  const wrapper = iframe.locator('..');
  await expect(wrapper).toHaveCSS('width', '375px');
});

test('exports clean HTML without editor metadata and keeps applied CSS', async ({ page }) => {
  const frame = await upload(page);
  await frame.locator('#title').click();
  const css=page.getByLabel('Element CSS');
  await css.fill('color: rgb(10, 20, 30); font-size: 44px;');
  await page.getByRole('button',{name:'Apply CSS'}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export HTML/i }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = Buffer.concat(chunks).toString('utf8');
  expect(exported).toContain('<!DOCTYPE html>');
  expect(exported).toContain('<strong>John</strong>');
  expect(exported).toContain('font-size: 44px');
  expect(exported).not.toContain('data-vpb-');
});
