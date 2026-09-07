import { expect, test } from '@playwright/test';

const html='<!DOCTYPE html><html><body><main><h1 id="title">Responsive fixture</h1><p>Paragraph</p></main></body></html>';

async function upload(page:any){await page.goto('./');await page.locator('input[type="file"]').setInputFiles({name:'responsive.html',mimeType:'text/html',buffer:Buffer.from(html)});await expect(page.frameLocator('iframe[title="HTML canvas"]').locator('#title')).toBeVisible();}

test.use({viewport:{width:390,height:844}});

test('mobile layout keeps canvas visible and sidebars off-canvas',async({page})=>{await page.goto('./');await expect(page.getByText('Elements',{exact:true})).toBeVisible();await expect(page.locator('aside').filter({hasText:'Elements'}).first()).toBeHidden();await expect(page.locator('main')).toBeVisible();});

test('mobile Elements drawer opens and closes',async({page})=>{await upload(page);await page.getByRole('button',{name:'Elements'}).click();const drawer=page.locator('aside').filter({hasText:'Elements'}).last();await expect(drawer).toBeVisible();await page.getByRole('button',{name:'Close panel'}).click();await expect(drawer).toBeHidden();});

test('mobile Properties drawer edits selected element',async({page})=>{await upload(page);const frame=page.frameLocator('iframe[title="HTML canvas"]');await frame.locator('#title').click();await page.getByRole('button',{name:'Properties'}).click();await expect(page.getByText('<h1> · heading')).toBeVisible();});

test('toolbar does not force page horizontal overflow on mobile',async({page})=>{await page.goto('./');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);expect(overflow).toBeFalsy();});
