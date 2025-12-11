import puppeteer from "puppeteer";

export async function generatePDF(html: string) {
 const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
});

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({ 
    format: "A4",
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
  return pdf;
}
