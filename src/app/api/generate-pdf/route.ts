
import { NextRequest, NextResponse } from 'next/server';
import { Pdf, IronPdfGlobalConfig } from "@ironsoftware/ironpdf";
import { z } from 'zod';

const ticketSchema = z.object({
  html: z.string(),
  css: z.string(),
});

// Optional: Set a license key if you have one
// IronPdfGlobalConfig.set({ licenseKey: "YOUR-LICENSE-KEY" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ticketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    
    const { html, css } = validation.data;

    // Combine HTML and CSS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    const pdf = await Pdf.renderHtml(fullHtml, {
      displayHeaderFooter: false,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    const pdfBuffer = await pdf.toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="RideRegister-Ticket.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF with IronPDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Could not generate PDF: ${errorMessage}` }, { status: 500 });
  }
}
