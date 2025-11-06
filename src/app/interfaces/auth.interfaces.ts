export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    role: 'admin' | 'student' | 'teacher';
    name: string;
  };
  message?: string;
}