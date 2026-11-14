import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
page.on("response", (r) => {
  if (r.url().includes("credentials")) console.log("AUTH", r.status());
});
await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 900));
await page.type('input[type="email"]', "securinetsisetch26@gmail.com");
await page.type('input[type="password"]', "Securinets2026!");
await page.click('button[type="submit"]');
await new Promise((r) => setTimeout(r, 3500));
console.log("url:", page.url());
const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 400));
console.log("text:", body);
await browser.close();
