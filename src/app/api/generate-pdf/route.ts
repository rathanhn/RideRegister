
// This file is no longer used for PDF generation and can be safely removed or ignored.
// The certificate download functionality has been reverted to a more reliable client-side implementation.
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return new NextResponse('This API route is no longer in use.', { status: 410 });
}
