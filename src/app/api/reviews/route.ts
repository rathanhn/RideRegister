
import { NextResponse } from 'next/server';

const PLACE_ID = 'ChIJ1531aM2EpzsRB3g6xgYqay0'; // Place ID for Telefun Mobiles, Madikeri

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('Google Places API key is missing.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key.' },
      { status: 500 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,user_ratings_total,url&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API Error:', data.error_message || data.status);
      return NextResponse.json(
        { error: 'Failed to fetch reviews from Google.' },
        { status: 502 } // Bad Gateway
      );
    }
    
    return NextResponse.json(data.result);

  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
