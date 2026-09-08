import { expect, test, type Page } from '@playwright/test';

const complexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complex Fixture</title>
  <style>
    :root { --brand: #7c3aed; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; }
    header { display: flex; justify-content: space-between; padding: 24px; }
    .hero { min-height: 360px; padding: 48px; background-image: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%237c3aed"/%3E%3C/svg%3E'); background-size: cover; background-position: center; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; }
    .card { padding: 20px; border: 2px solid #ddd; border-radius: 14px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header id="site-header">
    <a id="brand" href="https://example.com"><span>Complex</span> Builder</a>
    <nav><a href="#features">Features</a><a href="#contact">Contact</a></nav>
  </header>
  <main>
    <section id="hero" class="hero">
      Leading text <strong id="hero-strong">with emphasis</strong> trailing text
      <h1 id="hero-title">Build <em>anything</em> visually</h1>
      <p id="hero-copy">A paragraph with <a href="https://example.com/docs">nested link</a> and more text.</p>
      <button id="danger-button" onclick="window.__inlineRan=true">Inline handler button</button>
    </section>
    <section id="features" class="grid">
      <article class="card" id="card-a"><h2>Card A</h2><p>Alpha</p><img alt="alpha" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'%3E%3Crect width='40' height='30' fill='red'/%3E%3C/svg%3E"></article>
      <article class="card" id="card-b"><h2>Card B</h2><p>Beta</p></article>
      <article class="card" id="card-c"><h2>Card C</h2><p>Gamma</p></article>
    </section>
    <section id="contact">
      <form action="https://example.com/submit" method="post">
        <label>Name <input id="name-input" name="name" value="Jane"></label>
        <textarea id="message">Hello</textarea>
        <select id="choice"><option>A</option><option selected>B</option></select>
        <button id="submit-button" type="submit">Submit</button>
      </form>
    </section>
  </main>
  <footer><small>Footer text</small></footer>
  <script>window.__scriptRan=true</script>
</body>
</html>`;

async function uploadComplex(page: Page) {
  await page.goto('./');
  await page.locator('input[type="file"]').setInputFiles({name:'complex.html',mimeType:'text/html',buffer:Buffer.from(complexHtml)});
  const frame = page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#hero-title')).toBeVisible();
  return frame;
}

test('complex document indexes a deep DOM with unique editor IDs', async ({ page }) => {
  const frame = await uploadComplex(page);
  const ids = await frame.locator('[data-vpb-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-vpb-id')));
  expect(ids.length).toBeGreaterThan(25);
  expect(new Set(ids).size).toBe(ids.length);
});

test('elements panel exposes grouped insertion tabs', async ({ page }) => {
  await uploadComplex(page);
  const panel=page.locator('aside').filter({hasText:'Elements'}).first();
  for(const label of ['Layout','Content','Media','Interactive','Embed','Semantic'])await expect(panel.getByRole('tab',{name:label})).toBeVisible();
  await panel.getByRole('tab',{name:'Content'}).click();
  await expect(panel.getByTitle('Insert Heading 1')).toBeVisible();
  await expect(panel.getByTitle('Insert Paragraph')).toBeVisible();
});

test('sandbox blocks uploaded script and inline event handler', async ({ page }) => {
  const frame = await uploadComplex(page);
  expect(await frame.locator('body').evaluate(() => (window as typeof window & { __scriptRan?: boolean }).__scriptRan)).toBeUndefined();
  await frame.locator('#danger-button').click();
  expect(await frame.locator('body').evaluate(() => (window as typeof window & { __inlineRan?: boolean }).__inlineRan)).toBeUndefined();
});

test('background-image container can be selected and edited through universal CSS', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#hero').click({ position: { x: 20, y: 20 } });
  await expect(page.getByText('<section> · container')).toBeVisible();
  const css=page.getByLabel('Element CSS');
  await expect(css).toBeVisible();
  await css.fill('background-color: rgb(1, 2, 3); padding: 20px;');
  await page.getByRole('button',{name:'Apply CSS'}).click();
  await expect(frame.locator('#hero')).toHaveCSS('background-color','rgb(1, 2, 3)');
});

test('editing complex direct text preserves nested strong and heading nodes', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#hero').click({ position: { x: 20, y: 20 } });
  const textarea = page.locator('textarea').first();
  await textarea.fill('Replaced hero direct text');
  await textarea.blur();
  await expect(frame.locator('#hero-strong')).toHaveText('with emphasis');
  await expect(frame.locator('#hero-title em')).toHaveText('anything');
  await expect(frame.locator('#hero')).toContainText('Replaced hero direct text');
  await expect(frame.locator('#hero')).not.toContainText('Leading text');
  await expect(frame.locator('#hero')).not.toContainText('trailing text');
});

test('duplicate and reorder complex cards keeps DOM mapping unique', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#card-b').click({ position: { x: 6, y: 6 } });
  await expect(page.getByText('<article> · container')).toBeVisible();
  await page.getByTitle('Duplicate').click();
  await expect(frame.locator('#features > article')).toHaveCount(4);
  let ids = await frame.locator('[data-vpb-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
  await page.getByTitle('Move down').click();
  ids = await frame.locator('[data-vpb-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-vpb-id')));
  expect(new Set(ids).size).toBe(ids.length);
});

test('form submit is prevented inside sandboxed editor', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#submit-button').click();
  await expect(frame.locator('#hero-title')).toBeVisible();
  expect(page.url()).not.toContain('example.com/submit');
});

test('canvas selection remains synchronized with properties on complex nested element', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#hero-title').click();
  await expect(page.getByText('<h1> · heading')).toBeVisible();
  await expect(frame.locator('#hero-title')).toHaveAttribute('data-vpb-selected', '');
});

test('complex export preserves document content and removes editor metadata', async ({ page }) => {
  const frame = await uploadComplex(page);
  await frame.locator('#card-a').click({ position: { x: 6, y: 6 } });
  await page.getByTitle('Duplicate').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export HTML/i }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = Buffer.concat(chunks).toString('utf8');
  expect(exported).toContain('<!DOCTYPE html>');
  expect(exported).toContain('<style>');
  expect(exported).toContain('window.__scriptRan=true');
  expect(exported).toContain('onclick="window.__inlineRan=true"');
  expect(exported).toContain('Build <em>anything</em> visually');
  expect(exported).not.toContain('data-vpb-');
  expect(exported).not.toContain('data-vpb-ui');
});
