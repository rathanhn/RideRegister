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
  id:number;
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

export interface Registration {
    id: string;
    registrationType: 'solo' | 'duo';
    fullName: string;
    age: number;
    phoneNumber: string;
    whatsappNumber?: string;
    fullName2?: string;
    age2?: number;
    phoneNumber2?: string;
    createdAt: any; // Firestore timestamp
}
