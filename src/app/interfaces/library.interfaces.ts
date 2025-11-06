export interface Book {
  _id: string;
  titulo: string;
  autor: string;
  isbn: string;
  anio: number;
  categoria: string;
  descripcion?: string;
  disponibles: number;
}

export interface Loan {
  _id: string;
  usuarioId: string;
  libroId: Book;
  fechaPrestamo: Date;
  fechaLimite: Date;
  fechaDevolucion?: Date;
  estado: 'activo' | 'devuelto' | 'vencido';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}