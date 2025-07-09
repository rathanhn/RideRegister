

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
    status: 'pending' | 'approved' | 'rejected';
    rider1CheckedIn?: boolean;
    rider2CheckedIn?: boolean;
}

export interface QnaQuestion {
    id: string;
    text: string;
    userId: string;
    userName: string;
    userPhotoURL?: string | null;
    createdAt: any; // Firestore timestamp
    isPinned?: boolean;
}

export interface QnaReply {
    id: string;
    text: string;
    userId: string;
    userName:string;
    userPhotoURL?: string | null;
    createdAt: any; // Firestore timestamp
    isAdmin?: boolean;
}

export type UserRole = 'superadmin' | 'admin' | 'viewer' | 'user';

export interface AppUser {
    id: string; // Corresponds to Firebase Auth UID
    email?: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    createdAt: any; // Firestore timestamp
}
