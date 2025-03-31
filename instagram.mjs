import puppeteer from "puppeteer";
import { setTimeout } from "timers/promises";

const laps = 4;
const publishes = 10;

const credentialsList = [
  {
    username: "gustavo_fsoares",
    password: "!y695FPR&8!",
  },
];

for (let credentials of credentialsList) {
  for (let i = 0; i < laps; i++) {
    async function publishComment() {
      return new Promise(async (resolve) => {
        for (let x = 0; x < publishes; x++) {
          console.log("Publicando v:", i + 1, "- p:", x + 1);
          await page.locator("textarea").fill("@matheusrodalespersonal");
          await page
            .locator('.xdj266r.x1emribx.xat24cr.x1i64zmx div[role="button"]')
            .click();

          await setTimeout(1000);

          if (x === publishes - 1) {
            resolve();
          }
        }
      });
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://www.instagram.com/accounts/login/");
    await page.setViewport({ width: 1080, height: 1024 });

    await setTimeout(2000);

    await page.locator('input[name="username"]').fill(credentials.username);
    await page.locator('input[name="password"]').fill(credentials.password);

    await page.locator('button[type="submit"]').click();
    await page.waitForNavigation();

    await page.goto(
      "https://www.instagram.com/p/DC4-OraSOwE/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    );

    await setTimeout(2000);

    await publishComment();

    await browser.close();
  }
}
