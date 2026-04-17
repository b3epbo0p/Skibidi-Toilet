export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  completed: boolean;
  createdAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mood?: string;
  reflection?: string;
  pointsEarned?: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface UserData {
  tasks: Task[];
  subjects: Subject[];
  profilePicture?: string;
  points: number;
  streak: number;
  lastCompletionDate?: string; // YYYY-MM-DD
  currentMood?: string;
}

export interface User {
  username: string;
  passwordHash: string; // In a real app, this would be handled server-side
  data: UserData;
}
