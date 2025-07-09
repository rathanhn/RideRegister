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

export interface Organizer {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  imageHint: string;
}

export interface ScheduleEvent {
    id: number;
    time: string;
    title: string;
    description: string;
    icon: React.ElementType;
}
