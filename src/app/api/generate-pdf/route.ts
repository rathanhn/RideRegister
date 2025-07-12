
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
            // Fallback for SVGs or other types not detected by file-type
            if (url.endsWith('.svg')) {
                 return `data:image/svg+xml;base64,${buffer.toString('base64')}`;
            }
            throw new Error('Could not determine file type');
        }
        return `data:${type.mime};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error(`Error converting image from URL ${url}:`, error);
        return null;
    }
};

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
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
    
    const isDuo = registrationType === 'duo';

    const qrData = JSON.stringify({ registrationId, rider: riderNumber });
    const logoUrl = 'https://res.cloudinary.com/dfk9licqv/image/upload/v1721749595/RideRegister/Logo_xjan6k.png';
    
    // Concurrently fetch images
    const [qrCodeDataUrl, photoDataUrl, logoDataUrl] = await Promise.all([
        imageToDataUri(generateQrCodeUrl(qrData)),
        photoUrl ? imageToDataUri(photoUrl) : Promise.resolve(null),
        imageToDataUri(logoUrl)
    ]);
    
    if (!qrCodeDataUrl) {
      return NextResponse.json({ error: 'Failed to generate QR code for PDF.' }, { status: 500 });
    }

    // Initialize PDF - A4 aspect ratio, using points as units
    const doc = new jsPDF({ orientation: 'p', unit: 'px', format: [350, 550] });
    const primaryColor = '#FF9933';
    const textColor = '#1A202C';
    const mutedColor = '#64748B';

    // --- Drawing the ticket ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor('#E2E8F0'); // border color
    doc.setLineWidth(1);
    doc.roundedRect(5, 5, 340, 540, 10, 10, 'FD');

    // Header Background
    doc.setFillColor(255, 247, 237); // primary/10
    doc.rect(6, 6, 338, 70, 'F');
    
    // --- Header Content ---
    if(logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 20, 18, 40, 40);
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.text('TeleFun Mobile', 70, 32);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.setFontSize(10);
    doc.text('Independence Day Ride 2025', 70, 48);

    // --- Status Badges ---
    const statusText = status.toUpperCase();
    const statusBadgeWidth = doc.getTextWidth(statusText) + 15;
    doc.setFillColor(status === 'approved' ? primaryColor : '#E53E3E');
    doc.roundedRect(335 - statusBadgeWidth, 20, statusBadgeWidth, 16, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(statusText, 335 - statusBadgeWidth / 2, 30, { align: 'center' });

    const checkedInText = isCheckedIn ? 'CHECKED-IN' : 'NOT CHECKED-IN';
    const checkedInBadgeWidth = doc.getTextWidth(checkedInText) + 15;
    doc.setFillColor(isCheckedIn ? '#C6F6D5' : '#E2E8F0');
    doc.roundedRect(335 - checkedInBadgeWidth, 42, checkedInBadgeWidth, 16, 8, 8, 'F');
    doc.setTextColor(isCheckedIn ? '#22543D' : '#4A5568');
    doc.text(checkedInText, 335 - checkedInBadgeWidth / 2, 52, { align: 'center' });

    
    // --- Main Content ---
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.setFontSize(22);
    doc.text(`Your Ride Ticket ${isDuo ? `(Rider ${riderNumber})` : ''}`, 20, 105);
    doc.setFontSize(11);
    doc.setTextColor(mutedColor);
    doc.text('Present this ticket at the check-in counter.', 20, 120);

    // --- Rider Details with circular photo ---
    doc.saveGraphicsState();
    doc.circle(55, 175, 30);
    doc.clip();
    if (photoDataUrl) {
      doc.addImage(photoDataUrl, 'JPEG', 25, 145, 60, 60);
    } else {
        doc.setFillColor(226, 232, 240); // muted color
        doc.circle(55, 175, 30, 'F');
    }
    doc.restoreGraphicsState();
    
    const textStartX = 110;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(riderName, textStartX, 165);
    doc.setFontSize(12);
    doc.setTextColor(mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`${riderAge} years`, textStartX, 180);
    doc.text(riderPhone || '', textStartX, 195);
    
    // --- QR Code ---
    doc.addImage(qrCodeDataUrl, 'PNG', 205, 220, 120, 120);

    // --- Reg Type & ID ---
    const regIdYPos = 250;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. Type', 20, regIdYPos);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(registrationType.charAt(0).toUpperCase() + registrationType.slice(1), 20, regIdYPos + 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. ID', 20, regIdYPos + 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(registrationId.substring(0, 10).toUpperCase(), 20, regIdYPos + 70);
    
    // --- Separator ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(20, 360, 330, 360);

    // --- Footer Details ---
    const footerY = 380;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Date', 20, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('August 15, 2025', 20, footerY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Assembly Time', 180, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('6:00 AM', 180, footerY + 18);

    const footerY2 = footerY + 50;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Starting Point', 20, footerY2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('Telefun Mobiles: Mahadevpet, Madikeri', 20, footerY2 + 18);
    
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
