// This API route is no longer used for PDF generation.
// The functionality has been replaced by client-side PDF generation
// in `digital-ticket.tsx` to improve reliability.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json(
        { error: 'This endpoint is deprecated. PDF generation has moved to the client.' },
        { status: 410 } // 410 Gone
    );
}
