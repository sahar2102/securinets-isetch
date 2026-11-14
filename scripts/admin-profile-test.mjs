import puppeteer from "puppeteer-core";

const b = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1000 });
await p.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 700));
await p.type('input[type="email"]', "securinetsisetch26@gmail.com");
await p.type('input[type="password"]', "Securinets2026!");
await Promise.all([
  p.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => null),
  p.click('button[type="submit"]'),
]);
await new Promise((r) => setTimeout(r, 1200));
await p.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 800));
const buttons = await p.$$eval("button", (els) =>
  els.map((e) => e.textContent?.trim()).filter((t) => t && t.toLowerCase().includes("player")),
);
console.log("buttons:", buttons);
if (buttons.length) {
  const [btn] = await p.$$("button");
  const target = await p.evaluateHandle((label) => {
    const el = [...document.querySelectorAll("button")].find((b) =>
      (b.textContent ?? "").toLowerCase().includes("player"),
    );
    return el ?? null;
  }, "players");
  await target.asElement()?.click();
  await new Promise((r) => setTimeout(r, 700));
}
const text = await p.evaluate(() => document.body.innerText);
console.log("has university row:", text.includes("ISET Charguia · 2nd year"));
console.log("has motivation:", text.includes("I want to learn pentesting"));
await p.screenshot({ path: ".shots/players2.png", fullPage: false });
