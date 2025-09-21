import { expect, test } from '@playwright/test';

const modalPath = '/test/tea-modal';

test.describe('TeaModal cube navigation', () => {
  test('intro → brew flow keeps CTA clickable and rotates to brew face', async ({ page }) => {
    await page.goto(modalPath);

    const cubeShell = page.locator('[data-rotating]');
    const introLauncher = page.getByRole('button', { name: 'Főzzük meg!' });
    await introLauncher.click();
    await expect(cubeShell).toHaveAttribute('data-rotating', 'false');
    await expect(page.locator('[class*="faceRight"]')).toHaveAttribute('data-active', 'true');

    const startBrewing = page.getByRole('button', { name: 'Kezdjük a főzést' });
    await startBrewing.click();
    await expect(cubeShell).toHaveAttribute('data-rotating', 'false');
    await expect(page.locator('[class*="faceBack"]')).toHaveAttribute('data-active', 'true');
    await expect(startBrewing).not.toBeVisible();
  });

  test('intro → tea flow returns to the tea face', async ({ page }) => {
    await page.goto(modalPath);

    const cubeShell = page.locator('[data-rotating]');
    await page.getByRole('button', { name: 'Főzzük meg!' }).click();
    await expect(cubeShell).toHaveAttribute('data-rotating', 'false');
    await expect(page.locator('[class*="faceRight"]')).toHaveAttribute('data-active', 'true');

    await page.getByRole('button', { name: 'Vissza a teához' }).click();
    await expect(cubeShell).toHaveAttribute('data-rotating', 'false');
    await expect(page.locator('[class*="faceFront"]')).toHaveAttribute('data-active', 'true');
  });

  test('rotation fallback clears the rotating state when transitionend is missing', async ({ page }) => {
    await page.addInitScript(() => {
      const realSetTimeout = window.setTimeout.bind(window);
      const realClearTimeout = window.clearTimeout.bind(window);
      const stored = new Map<number, () => void>();
      let nextId = 1;

      (window as any).__mockTimeouts = {
        hasPending: () => stored.size > 0,
        runAll: () => {
          const callbacks = Array.from(stored.values());
          stored.clear();
          callbacks.forEach((cb) => cb());
        },
        restore: () => {
          window.setTimeout = realSetTimeout;
          window.clearTimeout = realClearTimeout;
          stored.clear();
        },
      };

      window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
        if (typeof handler === 'function' && typeof timeout === 'number' && timeout >= 350) {
          const id = nextId++;
          stored.set(id, () => handler(...args));
          return id;
        }

        return realSetTimeout(handler as any, timeout as any, ...args as any);
      }) as typeof window.setTimeout;

      window.clearTimeout = ((id?: number) => {
        if (typeof id === 'number' && stored.delete(id)) {
          return;
        }

        return realClearTimeout(id as any);
      }) as typeof window.clearTimeout;
    });

    await page.goto(modalPath);

    const cubeShell = page.locator('[data-rotating]');
    await page.evaluate(() => {
      const shell = document.querySelector('[data-rotating]') as HTMLElement | null;
      if (shell) {
        shell.style.transition = 'none';
      }
    });

    await page.getByRole('button', { name: 'Főzzük meg!' }).click();
    await expect(cubeShell).toHaveAttribute('data-rotating', 'true');

    await page.waitForFunction(() => Boolean((window as any).__mockTimeouts?.hasPending?.()));

    await page.evaluate(() => (window as any).__mockTimeouts?.runAll?.());
    await expect(cubeShell).toHaveAttribute('data-rotating', 'false');

    await page.evaluate(() => (window as any).__mockTimeouts?.restore?.());
  });
});