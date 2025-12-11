import { supabase } from "@/lib/supabase";
import { generatePDF } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name")!;

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  const data = person.data;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: -40px -40px 30px -40px;
            border-radius: 0 0 15px 15px;
          }
          .header h1 {
            font-size: 36px;
            margin-bottom: 8px;
          }
          .header .subtitle {
            font-size: 18px;
            opacity: 0.95;
          }
          .header .meta {
            margin-top: 15px;
            font-size: 14px;
            opacity: 0.9;
          }
          .section {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
          }
          .section h2 {
            color: #667eea;
            font-size: 22px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
          }
          .section p {
            margin-bottom: 12px;
            text-align: justify;
          }
          .info-item {
            display: flex;
            margin-bottom: 10px;
            padding: 8px 0;
          }
          .info-label {
            font-weight: bold;
            color: #667eea;
            min-width: 100px;
          }
          .snippet-list {
            list-style: none;
            counter-reset: snippet-counter;
          }
          .snippet-list li {
            counter-increment: snippet-counter;
            margin-bottom: 15px;
            padding-left: 35px;
            position: relative;
          }
          .snippet-list li:before {
            content: counter(snippet-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #667eea;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .thumbnail {
            float: right;
            margin-left: 20px;
            margin-bottom: 10px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.wikipedia?.title || data.name}</h1>
          ${data.googleKnowledge?.subtitle ? `<div class="subtitle">${data.googleKnowledge.subtitle}</div>` : ''}
          <div class="meta">
            ${data.googleKnowledge?.born ? `📅 Born: ${data.googleKnowledge.born}` : ''}
            <br>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        ${data.wikipedia?.thumbnail ? `
          <img src="${data.wikipedia.thumbnail}" alt="${data.name}" class="thumbnail" width="200">
        ` : ''}

        ${data.wikipedia?.extract ? `
          <div class="section">
            <h2>📖 Overview</h2>
            <p>${data.wikipedia.extract}</p>
          </div>
        ` : ''}

        ${data.googleKnowledge?.description ? `
          <div class="section">
            <h2>🔍 Profile Summary</h2>
            <p>${data.googleKnowledge.description}</p>
          </div>
        ` : ''}

        ${data.googleSnippets && data.googleSnippets.length > 0 ? `
          <div class="section">
            <h2>💡 Key Information</h2>
            <ul class="snippet-list">
              ${data.googleSnippets.map((snippet: string) => `<li>${snippet}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          <p>This report was automatically generated using Profile Finder</p>
          <p>Data sources: Wikipedia, Google Knowledge Graph, and Google Search</p>
        </div>
      </body>
    </html>
  `;

  const pdf = await generatePDF(html);
  const buffer = Buffer.from(pdf);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`
    }
  });
}
