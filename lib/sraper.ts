import { chromium } from "playwright";

export async function scrapePerson(name: string) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  
  const page = await context.newPage();

  //  Google Search — Scrape snippets
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(name)} biography`;
  await page.goto(googleUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const googleSnippets = await page.evaluate(() => {
    const snippets: string[] = [];
    
    // Try multiple selectors for search results
    const selectors = [
      '.VwiC3b',
      '.hgKElc',
      '.IsZvec',
      '.aCOpRe',
      '.s',
      'div[data-content-feature="1"] .VwiC3b'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 20 && !snippets.includes(text)) {
          snippets.push(text);
        }
      });
      if (snippets.length >= 5) break;
    }
    
    return snippets.slice(0, 5);
  });

  // Knowledge Panel
  const panel = await page.evaluate(() => {
    const get = (selectors: string[]) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.textContent?.trim()) return el.textContent.trim();
      }
      return "";
    };
    
    return {
      title: get(['.SPZz6b', '.qrShPb', 'h2[data-attrid="title"]', 'h2.qrShPb']),
      subtitle: get(['.wwUB2c', '.kno-ecr-pt', 'span[data-attrid="subtitle"]']),
      description: get(['.kno-rdesc span', '.PZPZlf', 'div[data-attrid="description"] span']),
      born: get(['div[data-attrid="kc:/people/person:born"] span', '.Z1hOCe', 'div[data-attrid="Born"] .Z1hOCe']),
    };
  });

  // Wikipedia summary
  const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
  const wikiRes = await fetch(wikiUrl, {
    headers: {
      "User-Agent": "HighProfileScraper/1.0"
    }
  });
  
  const wiki = await wikiRes.json().catch(() => ({}));

  await browser.close();

  return {
    name,
    googleSnippets,
    googleKnowledge: panel,
    wikipedia: {
      extract: wiki.extract || "",
      title: wiki.title || "",
      thumbnail: wiki.thumbnail?.source || null,
    }
  };
}
