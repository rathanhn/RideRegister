
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PdfTicketDocument } from '@/components/pdf-ticket-document';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';

// Zod schema for input validation - simplified to isolate errors
const pdfRequestSchema = z.object({
  registrationId: z.string(),
  riderNumber: z.union([z.literal(1), z.literal(2)]),
  riderName: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = pdfRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("PDF generation validation error:", validation.error.flatten());
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const ticketData = validation.data;
    
    // Use React.createElement instead of JSX to avoid parsing errors in .ts files
    const stream = await renderToStream(React.createElement(PdfTicketDocument, { data: ticketData }));
    
    const pdfFilename = `RideRegister-Ticket-${ticketData.riderName.replace(/ /g, '_')}.pdf`;
    
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
    });

    return new NextResponse(stream as any, { status: 200, headers });

  } catch (error) {
    console.error('Error generating PDF with react-pdf:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate PDF.', details: errorMessage }, { status: 500 });
  }
}
