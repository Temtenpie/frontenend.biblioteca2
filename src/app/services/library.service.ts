import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Book, Loan } from '../interfaces/library.interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBooks(): Observable<ApiResponse<Book[]>> {
    return this.http.get<ApiResponse<Book[]>>(`${this.apiUrl}/books`);
  }

  getUserLoans(userId: string): Observable<ApiResponse<Loan[]>> {
    return this.http.get<ApiResponse<Loan[]>>(`${this.apiUrl}/loans/usuario/${userId}`);
  }

  requestLoan(usuarioId: string, libroId: string, diasPrestamo: number = 14): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.apiUrl}/loans`, {
      usuarioId,
      libroId,
      diasPrestamo
    });
  }
}