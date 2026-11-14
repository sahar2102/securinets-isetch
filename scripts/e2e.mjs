import puppeteer from "puppeteer-core";

const base = "http://localhost:3000";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 200)));
await page.setViewport({ width: 1440, height: 1000 });

const log = (...a) => console.log("•", ...a);

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#email");
await page.type("#email", "admin@securinets-isetch.tn");
await page.type("#password", "ChangeMe!2026");
await Promise.all([
  page.waitForFunction(() => location.pathname !== "/login", { timeout: 25000 }),
  page.click('button[type="submit"]'),
]);
log("logged in ->", await page.evaluate(() => location.pathname));

const navText = await page.evaluate(() => document.querySelector("header")?.innerText.replace(/\n/g, " | "));
log("header:", navText?.slice(0, 160));

await page.goto(`${base}/challenges/caesars-last-words`, { waitUntil: "domcontentloaded" });
await page.waitForSelector('input[placeholder="SNT{...}"]');
await page.type('input[placeholder="SNT{...}"]', "SNT{c4es4r_w0uld_b3_pr0ud}");
await page.click('form button[type="submit"]');
await page.waitForFunction(() => /Correct|Incorrect|already|Too many/.test(document.body.innerText), { timeout: 20000 });
log("submit result:", await page.evaluate(() => {
  const el = [...document.querySelectorAll("p")].find((p) => /Correct|Incorrect|already|Too many/.test(p.textContent ?? ""));
  return el?.textContent?.trim();
}));
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: ".shots/solved.png" });

await page.goto(`${base}/admin`, { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 1800));
log("admin h1:", await page.evaluate(() => document.querySelector("h1")?.textContent));
await page.screenshot({ path: ".shots/admin.png" });

await page.goto(`${base}/leaderboard`, { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 2000));
log("leaderboard rows:", await page.evaluate(() => document.querySelectorAll("tbody tr").length));
await page.screenshot({ path: ".shots/leaderboard2.png" });

await browser.close();
