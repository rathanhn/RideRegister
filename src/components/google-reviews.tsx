
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, ExternalLink, Loader2, Star, User } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

interface Review {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceDetails {
  name: string;
  rating: number;
  reviews?: Review[];
  user_ratings_total: number;
  url: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
      />
    ))}
  </div>
);

const ReviewSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
             <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="w-full space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-2/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
);


export function GoogleReviews() {
  const [data, setData] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch reviews.');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Google Reviews</CardTitle>
            {loading && <CardDescription>Loading our latest reviews...</CardDescription>}
            {error && <CardDescription className="text-destructive">Could not load reviews.</CardDescription>}
            {data && (
                 <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">{data.rating}</span>
                        <StarRating rating={data.rating} />
                        <span className="text-muted-foreground">({data.user_ratings_total} reviews)</span>
                    </div>
                    <Button asChild variant="link" className="p-0 h-auto self-start sm:self-center mt-1 sm:mt-0">
                        <Link href={data.url} target="_blank">
                            View on Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </CardHeader>
      <CardContent>
        {loading && <ReviewSkeleton />}
        {error && (
            <div className="flex flex-col items-center justify-center h-40 text-center text-destructive bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Failed to Load Reviews</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        {data && data.reviews && data.reviews.length > 0 && (
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <div key={review.time} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.profile_photo_url} alt={review.author_name} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <a href={review.author_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{review.author_name}</a>
                      <p className="text-xs text-muted-foreground mt-1 sm:mt-0">{review.relative_time_description}</p>
                    </div>
                    <div className="my-1">
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{review.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
         {data && (!data.reviews || data.reviews.length === 0) && (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground bg-secondary/50 rounded-lg">
                <p>No reviews available to display at the moment.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
