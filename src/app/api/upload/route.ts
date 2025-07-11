
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfk9licqv',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '547273686289121',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'n_rTx_EgUrZqaIOQAf-0lLXPqE0',
});

export async function POST(request: Request) {
  try {
    const { file } = await request.json();
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'rideregister',
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Could not upload photo: ${errorMessage}` }, { status: 500 });
  }
}
