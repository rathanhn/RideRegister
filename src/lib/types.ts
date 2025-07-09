export interface Announcement {
  id: number;
  message: string;
  timestamp: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  validity: string;
  imageUrl: string;
  imageHint: string;
}
