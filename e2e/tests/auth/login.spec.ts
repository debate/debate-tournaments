import { test, expect } from '@playwright/test';
import factories from '../../../indexcards/tests/factories/index.js';

test('user can log in', async ({ page }) => {
	const password = 'password';
	const Person = await factories.person.create({ password });

	await page.goto('/user/login');
	await page.getByRole('textbox', { name: 'Email' }).fill(Person.email!);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('textbox', { name: 'Password' }).press('Enter');
	await expect(page).toHaveURL('/');
});
