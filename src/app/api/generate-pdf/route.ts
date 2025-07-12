
import { NextRequest, NextResponse } from 'next/server';
import { Pdf, IronPdfGlobalConfig, PdfRenderOptions } from "@ironsoftware/ironpdf";
import { z } from 'zod';

const ticketSchema = z.object({
  html: z.string(),
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
    
    const { html } = validation.data;
    
    // Get the base URL from the request headers to resolve relative paths for CSS/images
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // IronPDF will use this baseUrl to fetch CSS and images referenced in the HTML
    const renderOptions = new PdfRenderOptions();
    renderOptions.baseUrl = baseUrl;
    
    const pdf = await Pdf.renderHtml(html, renderOptions);

    const pdfBuffer = await pdf.toBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
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
