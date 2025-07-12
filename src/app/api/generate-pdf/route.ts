
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
        let mime = type?.mime;
        if (!mime) {
            // Fallback for SVGs or other types not detected by file-type
            if (url.endsWith('.svg')) {
                 mime = 'image/svg+xml';
            } else if (url.includes('googleusercontent')) {
                 // Assume JPEG for Google user content
                 mime = 'image/jpeg';
            } else {
                 throw new Error('Could not determine file type');
            }
        }
        return `data:${mime};base64,${buffer.toString('base64')}`;
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
    
    const isDuo = registrationType === 'duo';

    const qrData = JSON.stringify({ registrationId, rider: riderNumber });
    const logoUrl = 'https://res.cloudinary.com/dfk9licqv/image/upload/v1721749595/RideRegister/Logo_xjan6k.png';
    
    const [qrCodeDataUrl, photoDataUrl, logoDataUrl] = await Promise.all([
        imageToDataUri(generateQrCodeUrl(qrData)),
        photoUrl ? imageToDataUri(photoUrl) : Promise.resolve(null),
        imageToDataUri(logoUrl)
    ]);
    
    if (!qrCodeDataUrl) {
      return NextResponse.json({ error: 'Failed to generate QR code for PDF.' }, { status: 500 });
    }

    const doc = new jsPDF({ orientation: 'p', unit: 'px', format: [400, 600] });
    const primaryColor = '#FF9933';
    const textColor = '#1A202C';
    const mutedColor = '#64748B';
    const cardBg = '#FFFFFF';
    const headerBg = 'rgba(255, 153, 51, 0.1)';

    // --- Card Background ---
    doc.setFillColor(cardBg);
    doc.setDrawColor('#E2E8F0'); // border color
    doc.setLineWidth(1.5);
    doc.roundedRect(5, 5, 390, 590, 10, 10, 'FD');

    // --- Header ---
    doc.setFillColor(255, 248, 237); // Corresponds to primary/10
    doc.rect(6, 6, 388, 70, 'F');
    
    if(logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 20, 20, 40, 40);
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.text('TeleFun Mobile', 70, 35);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.setFontSize(10);
    doc.text('Independence Day Ride 2025', 70, 50);

    const statusBadge = {
        text: status.toUpperCase(),
        color: status === 'approved' ? '#4CAF50' : '#E53E3E',
        textColor: '#FFFFFF',
    };
    const statusTextWidth = doc.getTextWidth(statusBadge.text) + 12;
    doc.setFillColor(statusBadge.color);
    doc.roundedRect(380 - statusTextWidth, 20, statusTextWidth, 16, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statusBadge.textColor);
    doc.setFontSize(8);
    doc.text(statusBadge.text, 380 - statusTextWidth / 2, 30, { align: 'center' });

    if(isCheckedIn) {
        const checkedInBadge = { text: 'CHECKED-IN', color: '#C6F6D5', textColor: '#22543D' };
        const checkedInWidth = doc.getTextWidth(checkedInBadge.text) + 12;
        doc.setFillColor(checkedInBadge.color);
        doc.roundedRect(380 - checkedInWidth, 42, checkedInWidth, 16, 8, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(checkedInBadge.textColor);
        doc.setFontSize(8);
        doc.text(checkedInBadge.text, 380 - checkedInWidth / 2, 52, { align: 'center' });
    }

    // --- Main Content ---
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.setFontSize(22);
    doc.text(`Your Ride Ticket ${isDuo ? `(Rider ${riderNumber})` : ''}`, 20, 110);
    doc.setFontSize(11);
    doc.setTextColor(mutedColor);
    doc.text('Present this ticket at the check-in counter.', 20, 125);

    // --- Rider Details ---
    const avatarX = 20, avatarY = 150, avatarSize = 64;
    doc.saveGraphicsState();
    doc.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2);
    doc.clip();
    if (photoDataUrl) {
      doc.addImage(photoDataUrl, 'JPEG', avatarX, avatarY, avatarSize, avatarSize);
    } else {
        doc.setFillColor(230, 230, 230); // Placeholder color
        doc.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 'F');
    }
    doc.restoreGraphicsState();
    
    const textStartX = avatarX + avatarSize + 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(riderName, textStartX, 165);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text(`${riderAge} years`, textStartX, 185);
    doc.text(riderPhone || '', textStartX, 200);

    // --- QR Code & Reg Info ---
    doc.addImage(qrCodeDataUrl, 'PNG', 260, 230, 120, 120);

    const regIdYPos = 250;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. Type', 30, regIdYPos);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(registrationType.charAt(0).toUpperCase() + registrationType.slice(1), 30, regIdYPos + 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor);
    doc.text('Reg. ID', 30, regIdYPos + 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text(registrationId.substring(0, 10).toUpperCase(), 30, regIdYPos + 85);

    // --- Separator ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(20, 380, 380, 380);

    // --- Footer Details ---
    const footerY = 410;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Date', 30, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('August 15, 2025', 30, footerY + 20);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Assembly Time', 220, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('6:00 AM', 220, footerY + 20);
    
    const footerY2 = footerY + 60;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Starting Point', 30, footerY2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor);
    doc.text('Telefun Mobiles: Mahadevpet, Madikeri', 30, footerY2 + 20);
    
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

    