import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('KFC App E2E & WCAG AA Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/');
    // Wait for the app container to render
    await page.waitForSelector('text=HALAL KFC UK');
  });

  test('renders initial list view with default ordering and filters', async ({ page }) => {
    // 1. Verify Brand Header
    await expect(page.locator('text=HALAL KFC UK')).toBeVisible();

    // 2. Verify List View is active by default
    const listTab = page.locator('text=/📋 List View/');
    await expect(listTab).toBeVisible();

    // 3. Verify Halal Only is first amenity chip and unselected
    const halalChip = page.locator('text=/Halal Only \\(\\d+\\)/');
    await expect(halalChip).toBeVisible();

    // 4. Verify results count
    await expect(page.getByText(/Showing \d+.*restaurants/)).toBeVisible();

    // 5. Verify dedicated Open in Maps button exists
    const mapsButtons = page.locator('text=📍 Open in Maps');
    await expect(mapsButtons.first()).toBeVisible();
  });

  test('filters by Halal Only and toggles amenities', async ({ page }) => {
    // Click Halal Only filter
    const halalChip = page.locator('text=/Halal Only \\(\\d+\\)/');
    await halalChip.click();

    // Verify counter updates to Halal count (225)
    await expect(page.locator('text=Showing 225 Halal restaurants')).toBeVisible();

    // Verify Halal badge appears on cards
    await expect(page.locator('text=✓ 100% HALAL CERTIFIED').first()).toBeVisible();
  });

  test('expands and collapses amenities on card', async ({ page }) => {
    const moreButton = page.locator('text=/\\+\\d+ more/').first();
    if (await moreButton.isVisible()) {
      await moreButton.click();
      await expect(page.locator('text=Show less').first()).toBeVisible();

      // Click again to collapse
      await page.locator('text=Show less').first().click();
      await expect(page.locator('text=/\\+\\d+ more/').first()).toBeVisible();
    }
  });

  test('switches to Map View and back to List View', async ({ page }) => {
    const mapTab = page.locator('text=🗺️ Map View');
    await mapTab.click();

    // Map container should render
    await expect(page.locator('text=/📍 Centered/')).toBeVisible();

    // Switch back to List View
    const listTab = page.locator('text=/📋 List View/');
    await listTab.click();
    await expect(page.locator('text=📍 Open in Maps').first()).toBeVisible();
  });

  test('toggles dark mode seamlessly', async ({ page }) => {
    const themeToggle = page.locator('text=/🌙 Dark|☀️ Light/');
    await expect(themeToggle).toBeVisible();

    // Click to toggle dark mode
    await themeToggle.click();
    await expect(page.locator('text=☀️ Light')).toBeVisible();

    // Click to toggle back to light mode
    await page.locator('text=☀️ Light').click();
    await expect(page.locator('text=🌙 Dark')).toBeVisible();
  });

  test('passes WCAG AA accessibility audit in Light Mode', async ({ page }) => {
    // Run axe-core accessibility scanner on Light Mode
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('iframe') // Exclude third-party OpenStreetMap tile iframe
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('passes WCAG AA accessibility audit in Dark Mode', async ({ page }) => {
    // Switch to Dark Mode
    const themeToggle = page.locator('text=🌙 Dark');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }

    // Run axe-core accessibility scanner on Dark Mode
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('iframe')
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

