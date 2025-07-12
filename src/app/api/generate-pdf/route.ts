
import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { z } from 'zod';
import { fileTypeFromBuffer } from 'file-type';

// Helper to fetch an image and convert it to a Base64 Data URI
const imageToDataUri = async (url: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const type = await fileTypeFromBuffer(buffer);
        if (!type) {
            throw new Error('Could not determine file type');
        }
        return `data:${type.mime};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error(`Error converting image from URL ${url}:`, error);
        return null;
    }
};

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

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

    const {
        registrationId, riderNumber, registrationType, status, isCheckedIn,
        riderName, riderAge, riderPhone, photoUrl
    } = validation.data;

    const qrData = JSON.stringify({ registrationId, rider: riderNumber });
    
    // Concurrently fetch images
    const [qrCodeDataUrl, photoDataUrl] = await Promise.all([
        imageToDataUri(generateQrCodeUrl(qrData)),
        photoUrl ? imageToDataUri(photoUrl) : Promise.resolve(null)
    ]);
    
    if (!qrCodeDataUrl) {
      return NextResponse.json({ error: 'Failed to generate QR code for PDF.' }, { status: 500 });
    }

    // Initialize PDF
    const doc = new jsPDF({ orientation: 'p', unit: 'px', format: [350, 500] });
    const primaryColor = '#FF9933';
    const textColor = '#1A202C';
    const mutedColor = '#64748B';

    // --- Drawing the ticket ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1.5);
    doc.roundedRect(5, 5, 340, 490, 8, 8, 'S');

    // Header Background
    doc.setFillColor(255, 247, 237); // primary/10
    doc.roundedRect(6, 6, 338, 55, 8, 8, 'F');
    doc.setFillColor(255, 255, 255);
    
    // --- Header Content ---
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.text('TeleFun Mobile', 20, 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.setFontSize(9);
    doc.text('Independence Day Ride 2025', 20, 42);

    // --- Status Badges ---
    doc.setFillColor(status === 'approved' ? primaryColor : '#E53E3E');
    doc.roundedRect(260, 15, 75, 14, 7, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(status.toUpperCase(), 300, 24, { align: 'center' });

    doc.setFillColor(isCheckedIn ? '#C6F6D5' : '#E2E8F0');
    doc.roundedRect(260, 33, 75, 14, 7, 7, 'F');
    doc.setTextColor(isCheckedIn ? '#22543D' : '#4A5568');
    doc.text(isCheckedIn ? 'CHECKED-IN' : 'NOT CHECKED-IN', 300, 42, { align: 'center' });
    
    // --- Main Content ---
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.setFontSize(18);
    doc.text('Your Ride Ticket', 20, 85);
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text('Present this ticket at the check-in counter.', 20, 98);

    // --- Rider Details with circular photo ---
    if (photoDataUrl) {
      doc.saveGraphicsState();
      doc.circle(45, 140, 25);
      doc.clip();
      doc.addImage(photoDataUrl, 'JPEG', 20, 115, 50, 50);
      doc.restoreGraphicsState();
    } else {
        // Fallback placeholder circle
        doc.setFillColor(226, 232, 240); // muted color
        doc.circle(45, 140, 25, 'F');
    }
    
    const textStartX = 80;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(`${riderName}, ${riderAge} years`, textStartX, 138);
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text(riderPhone || '', textStartX, 152);
    
    // --- Reg Type & ID ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. Type', 20, 190);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(registrationType.charAt(0).toUpperCase() + registrationType.slice(1), 20, 205);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. ID', 120, 190);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(registrationId.substring(0, 10).toUpperCase(), 120, 205);
    
    // --- QR Code ---
    doc.addImage(qrCodeDataUrl, 'PNG', 220, 120, 100, 100);

    // --- Separator ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 240, 330, 240);

    // --- Footer Details ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Date', 20, 260);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('August 15, 2025', 20, 275);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Assembly Time', 180, 260);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('6:00 AM', 180, 275);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Starting Point', 20, 300);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('Telefun Mobiles: Mahadevpet, Madikeri', 20, 315);
    
    // Return the PDF
    const pdfOutput = doc.output('arraybuffer');
    const pdfFilename = `RideRegister-Ticket-${riderName.replace(/ /g, '_')}.pdf`;

    return new NextResponse(pdfOutput, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF.' }, { status: 500 });
  }
}
