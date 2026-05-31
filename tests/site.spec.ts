import { test, expect } from "@playwright/test";

const routes = ["/", "/contact/", "/404.html", "/playground/bezier/"];

const nestedProjectRoutes = [
  "/projects/edupace/",
  "/projects/reinforcement-learning/",
  "/projects/swiss-hospital-insights/methodology/",
  "/projects/swiss-hospital-insights/de/",
];

const staticAssets = [
  "/static/css/shared/site.css",
  "/static/js/shared/site.js",
  "/static/js/shared/includes.js",
];

const swissHospitalAssets = [
  "/projects/swiss-hospital-insights/assets/css/app.css",
  "/projects/swiss-hospital-insights/assets/js/app.js",
  "/projects/swiss-hospital-insights/assets/js/quality-indicators.js",
  "/projects/swiss-hospital-insights/assets/data/qip23_f_procedures.json",
  "/projects/swiss-hospital-insights/assets/data/qip24_mortality_indicators.json",
  "/projects/swiss-hospital-insights/assets/data/qip24_mortality_indicators_with_en.csv",
  "/projects/swiss-hospital-insights/assets/data/hospital_coordinates.json",
  "/projects/swiss-hospital-insights/assets/images/cantons/ch.svg",
];

const brokenLinkScanPages = [
  "/",
  "/projects/",
  "/contact/",
  "/projects/swiss-hospital-insights/",
  "/projects/edupace/",
];

test.describe("site smoke tests", () => {
  for (const route of routes) {
    test(`GET ${route} should load without hard errors`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response).not.toBeNull();
      expect(response?.status()).toBeLessThan(400);
    });
  }

  test("home page should render welcome heading and projects section", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome!" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Featured Projects" }),
    ).toBeVisible();
  });

  test("shared includes should load full site header/footer (not fallback shells)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const header = page.locator("#site-header");
    const footer = page.locator("#site-footer");

    await expect(header.locator("header.site-header")).toBeVisible();
    await expect(footer.locator("footer.site-footer")).toBeVisible();
    await expect(header.locator("[data-fallback='true']")).toHaveCount(0);
    await expect(footer.locator("[data-fallback='true']")).toHaveCount(0);
    await expect(header.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(footer).toContainText(/Adrien\s+Joon[-‑ ]?Ha\s+Im/i);
  });

  test("contact page should expose key contact channels", async ({ page }) => {
    await page.goto("/contact/");
    const contact = page.locator("#contact");

    await expect(
      contact.getByRole("heading", { name: "Contact" }),
    ).toBeVisible();
    await expect(contact.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      /mailto:/,
    );
    await expect(contact.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      /github\.com/,
    );
    await expect(
      contact.getByRole("button", { name: "Send Message" }),
    ).toBeVisible();
  });

  test("extensionless routes should resolve to folder index pages", async ({
    page,
  }) => {
    const response = await page.goto("/about", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(
      page.getByRole("heading", { name: "Adrien Joon‑Ha Im" }),
    ).toBeVisible();
  });

  test("missing routes should return custom 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/404\s*[–-]\s*Page Not Found/);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("key static assets should return HTTP 200", async ({ request }) => {
    for (const assetPath of staticAssets) {
      const response = await request.get(assetPath);
      expect(response.status(), `${assetPath} should be served`).toBe(200);
    }
  });

  test("Swiss Hospital Insights assets should be served from its exportable project directory", async ({
    request,
  }) => {
    for (const assetPath of swissHospitalAssets) {
      const response = await request.get(assetPath);
      expect(response.status(), `${assetPath} should be served`).toBe(200);
    }
  });

  test("representative nested project routes should load", async ({ page }) => {
    for (const route of nestedProjectRoutes) {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response, `${route} should return a response`).not.toBeNull();
      expect(response?.status(), `${route} should be reachable`).toBeLessThan(
        400,
      );
      await expect(page).toHaveURL(new RegExp(`${route}$`));
    }
  });

  test("internal links on key pages should not be broken", async ({
    page,
    request,
  }) => {
    const visited = new Set<string>();

    for (const route of brokenLinkScanPages) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const urls = await page.locator("a[href]").evaluateAll((anchors) => {
        const origin = window.location.origin;

        return anchors
          .map((a) => a.getAttribute("href")?.trim() ?? "")
          .filter((href) => Boolean(href))
          .filter(
            (href) =>
              href.startsWith("/") ||
              href.startsWith("./") ||
              href.startsWith("../") ||
              href.startsWith("#"),
          )
          .map((href) => new URL(href, origin).toString());
      });

      for (const url of urls) {
        const normalized = url.split("#")[0] || url;
        if (visited.has(normalized)) continue;
        visited.add(normalized);

        const response = await request.get(normalized);
        expect(
          response.status(),
          `${normalized} should be reachable`,
        ).toBeLessThan(400);
      }
    }
  });
});
