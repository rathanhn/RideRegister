
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PdfTicketDocument } from '@/components/pdf-ticket-document';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';

// Zod schema for input validation
const pdfRequestSchema = z.object({
  registrationId: z.string(),
  riderNumber: z.union([z.literal(1), z.literal(2)]),
  registrationType: z.enum(['solo', 'duo']),
  status: z.string(),
  isCheckedIn: z.boolean(),
  riderName: z.string(),
  riderAge: z.coerce.number(),
  riderPhone: z.string(),
  photoUrl: z.string().url().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = pdfRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const ticketData = validation.data;
    
    const stream = await renderToStream(React.createElement(PdfTicketDocument, { data: ticketData }));
    
    const pdfFilename = `RideRegister-Ticket-${ticketData.riderName.replace(/ /g, '_')}.pdf`;
    
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
    });

    return new NextResponse(stream as any, { status: 200, headers });

  } catch (error) {
    console.error('Error generating PDF with react-pdf:', error);
    return NextResponse.json({ error: 'Failed to generate PDF.' }, { status: 500 });
  }
}
