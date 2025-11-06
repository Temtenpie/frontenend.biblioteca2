export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  carnetId?: string;
}

export interface Book {
  _id?: string;
  titulo: string;
  autor: string;
  isbn: string;
  anio: number;
  categoria: string;
  disponibles: number;
  total: number;
}

export interface Loan {
  _id?: string;
  usuarioId: string | User;
  libroId: string | Book;
  fechaPrestamo: string;
  fechaDevolucion?: string;
  fechaLimite: string;
  estado: 'activo' | 'devuelto' | 'vencido';
}