export type UserRole = 'freelancer' | 'client' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

export interface Profile {
  uid: string;
  bio?: string;
  skills?: string[];
  portfolio?: { title: string; url: string; description: string }[];
  experience?: { company: string; role: string; duration: string; description: string }[];
  rating?: number;
  reviewCount?: number;
}

export interface Gig {
  id: string;
  freelancerId: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  tags: string[];
  status: 'open' | 'closed';
  createdAt: any;
  updatedAt: any;
}

export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  roomId: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}
