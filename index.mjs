import fs from "fs/promises";
import { addDays, format } from "date-fns";
import puppeteer from "puppeteer";

// import history from "./history.json";
// import data from "./data.json";

// ...
// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page
async function run() {
  const history = await loadJson("history");
  const data = await loadJson("data");

  let overtimeAmount = 0;
  const overtimeText = process.argv[2] || "0";

  const [overtimeHour, overtimeMinute] = overtimeText.split(":");

  if (data.extra.usarExtra) {
    let overtime = 0;
    if (overtimeHour) {
      overtime += Number(overtimeHour);
    }

    if (overtimeMinute) {
      overtime += Number(overtimeMinute) / 60;
    }

    overtimeAmount =
      overtime * data.extra.valorHoraExtra * data.servico.valorHoraNormal;
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://invoice.remessaonline.com.br/");
  await page.setViewport({ width: 1080, height: 1024 });

  await page.$eval("#w-tabs-0-data-w-pane-0", (el) => el.remove());

  await page.locator(".tab-link-tab-2").click();

  // await page.waitForFunction(
  //   () => {
  //     const tab = document.querySelector(".tab-pane-tab-2");

  //     return tab && tab.style.opacity === "1";
  //   },
  //   { timeout: 5000, polling: true }
  // );

  await page.locator("#value-usd-2").fill(data.contratada.nome);
  await page.locator("#email2").fill(data.contratada.email);
  await page.locator("#CEP-en").fill(data.contratada.cep);
  await page.locator("#Creation-date-3").fill(data.contratada.cidade);
  await page.locator("#Creation-date-4").fill(data.contratada.rua);
  await page
    .locator("#Full-name-of-receiver-3")
    .fill(data.contratada.complemento);

  await page
    .locator(".padding-section #Company-who-s-paying-4")
    .fill(data.contratante.nome);
  await page.locator("#Company-who-s-paying-3").fill(data.contratante.endereco);

  const lastInvoice = (history.lastInvoice || 0) + 1;
  const now = new Date();
  const emissionDate = format(now, "MM/dd/yyyy");
  const dueDate = format(addDays(now, 5), "MM/dd/yyyy");

  await page
    .locator(".column #Company-who-s-paying-4")
    .fill(lastInvoice.toString());
  await page.locator(".column #emission-date-en").fill(emissionDate);
  await page.locator(".column #due-date-en").fill(dueDate);

  let description = data.servico.descricao;
  if (overtimeAmount) {
    description += "EXTRA:\n";
    description += `Overtime: ${overtimeHour}h${overtimeMinute}m\n`;
    description += `Amount: €${overtimeAmount.toFixed(2)}`;
  }
  await page.locator("#field-2").fill(description);

  await page.locator(".select-currency-en").fill(data.servico.moeda);
  await page
    .locator(".input-value")
    .fill((data.servico.valor + overtimeAmount).toFixed(2).toString());

  await page.locator("#en_lead_gerador_invoice").click();

  await browser.close();

  saveJson("history", { lastInvoice });
}

async function saveJson(type, jsonData) {
  var textedJson = JSON.stringify(jsonData);

  await fs.writeFile(`${type}.json`, textedJson, "utf8");
}

async function loadJson(type) {
  let file = await fs.readFile(`${type}.json`);

  const data = JSON.parse(file);

  return data;
}

run();
