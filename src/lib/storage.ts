import { User, UserData, Task, Subject } from '../types';

const STORAGE_KEY = 'studysync_users';
const CURRENT_USER_KEY = 'studysync_current_user';

// Mock hash function for basic security in localStorage
const hashPassword = (password: string) => {
  return btoa(password); // Simple base64 for demo purposes
};

export const getStoredUsers = (): Record<string, User> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const signup = (username: string, password: string): User | null => {
  const users = getStoredUsers();
  if (users[username]) return null;

  const newUser: User = {
    username,
    passwordHash: hashPassword(password),
    data: {
      tasks: [],
      subjects: [
        { id: '1', name: 'Math', color: '#3b82f6' },
        { id: '2', name: 'Science', color: '#10b981' },
        { id: '3', name: 'History', color: '#f59e0b' },
      ],
      points: 0,
      streak: 0,
    },
  };

  users[username] = newUser;
  saveUsers(users);
  return newUser;
};

export const login = (username: string, password: string): User | null => {
  const users = getStoredUsers();
  const user = users[username];
  if (user && user.passwordHash === hashPassword(password)) {
    localStorage.setItem(CURRENT_USER_KEY, username);
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const username = localStorage.getItem(CURRENT_USER_KEY);
  if (!username) return null;
  const users = getStoredUsers();
  return users[username] || null;
};

export const updateUserData = (username: string, data: UserData) => {
  const users = getStoredUsers();
  if (users[username]) {
    users[username].data = data;
    saveUsers(users);
  }
};

// Demo data (not persisted)
export const getDemoData = (): UserData => ({
  tasks: [
    { id: 'd1', title: 'Algebra Homework', subjectId: '1', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], completed: false, createdAt: Date.now(), difficulty: 'medium' },
    { id: 'd2', title: 'Lab Report', subjectId: '2', dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: false, createdAt: Date.now(), difficulty: 'hard' },
    { id: 'd3', title: 'Read Chapter 5', subjectId: '3', dueDate: new Date().toISOString().split('T')[0], completed: true, createdAt: Date.now(), difficulty: 'easy', reflection: 'Learned about civil rights.', mood: '😊', pointsEarned: 10 },
  ],
  subjects: [
    { id: '1', name: 'Math', color: '#3b82f6' },
    { id: '2', name: 'Science', color: '#10b981' },
    { id: '3', name: 'History', color: '#f59e0b' },
  ],
  points: 10,
  streak: 2,
});
