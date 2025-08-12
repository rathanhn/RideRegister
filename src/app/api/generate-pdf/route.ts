
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return new NextResponse('Missing name parameter', { status: 400 });
    }

    // =========================================================================================
    //  DEVELOPER NOTE:
    //  This is a placeholder for server-side PDF generation.
    //  The client-side canvas-to-PDF method was unreliable.
    //
    //  To make this work, you will need to install a PDF generation library
    //  that can run in a Node.js environment (e.g., 'puppeteer', 'pdf-lib').
    //
    //  EXAMPLE LOGIC USING A HYPOTHETICAL PDF LIBRARY:
    //
    //  1. Import the library:
    //     import { createPdf } from 'some-pdf-library';
    //
    //  2. Generate the PDF content, perhaps using an HTML template:
    //     const htmlContent = `
    //       <html>
    //         <body>
    //           <h1>Certificate for ${name}</h1>
    //           <p>Congratulations on completing the ride!</p>
    //         </body>
    //       </html>
    //     `;
    //
    //  3. Create the PDF buffer:
    //     const pdfBuffer = await createPdf(htmlContent);
    //
    //  4. Return the PDF as a response:
    //     return new NextResponse(pdfBuffer, {
    //       status: 200,
    //       headers: {
    //         'Content-Type': 'application/pdf',
    //         'Content-Disposition': `attachment; filename="${name}-certificate.pdf"`,
    //       },
    //     });
    // =========================================================================================

    // Current placeholder response:
    const placeholderText = `
    PDF Generation for: ${name}

    This is a placeholder file. A server-side PDF generation library 
    (like Puppeteer or PDF-lib) needs to be installed and configured 
    in this API route to generate the actual certificate.
    `;
    
    return new NextResponse(placeholderText, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${name}-certificate-placeholder.txt"`,
        },
    });
}
