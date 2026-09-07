import{expect,test}from'@playwright/test';

const fixture='<!DOCTYPE html><html><body><main><h1 id="title">Original title</h1><p>Persistent paragraph</p></main></body></html>';
const key='visual-html-page-builder:draft:v1';

test('autosaves edited HTML to localStorage and restores after reload',async({page})=>{
  await page.goto('./');
  await page.evaluate(k=>localStorage.removeItem(k),key);
  await page.locator('input[type="file"]').setInputFiles({name:'autosave.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  const frame=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(frame.locator('#title')).toBeVisible();
  await frame.locator('#title').click();
  const textarea=page.locator('textarea').first();
  await textarea.fill('Saved automatically');
  await textarea.blur();
  await page.waitForTimeout(500);
  const draft=await page.evaluate(k=>localStorage.getItem(k),key);
  expect(draft).toBeTruthy();
  expect(draft).toContain('Saved automatically');
  expect(draft).not.toContain('data-vpb-');
  await page.reload();
  const restored=page.frameLocator('iframe[title="HTML canvas"]');
  await expect(restored.locator('#title')).toHaveText('Saved automatically');
});

test('autosave restores selected preview device',async({page})=>{
  await page.goto('./');
  await page.evaluate(k=>localStorage.removeItem(k),key);
  await page.locator('input[type="file"]').setInputFiles({name:'device.html',mimeType:'text/html',buffer:Buffer.from(fixture)});
  await page.getByTitle('mobile').click();
  await page.reload();
  await expect(page.getByTitle('mobile')).toHaveClass(/bg-zinc-700/);
});
