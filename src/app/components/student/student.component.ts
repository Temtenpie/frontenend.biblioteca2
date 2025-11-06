import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
  userName = signal('');
  userId = signal('');
  userEmail = signal('');
  loading = signal(false);
  books = signal<any[]>([]);
  loans = signal<any[]>([]);
  activeTab = signal<'dashboard' | 'books' | 'loans'>('dashboard');
  
  // Computed signal para contar préstamos activos
  activeLoansCount = computed(() => {
    return this.loans().filter(l => l.estado === 'activo').length;
  });

  // Verificar si ya existe un préstamo activo del libro
  hasActiveLoan(bookId: string): boolean {
    return this.loans().some(l => (l.libroId?._id === bookId || l.libroId === bookId) && l.estado === 'activo');
  }

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserData();
  }

  ngOnInit() {
    this.loadBooks();
    this.loadLoans();
  }

  // Cargar datos del usuario desde localStorage
  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName.set(user.name || 'Estudiante');
      this.userId.set(user.id || '');
      this.userEmail.set(user.email || '');
    }
  }

  // Cargar libros disponibles
  loadBooks() {
    this.loading.set(true);
    this.http.get<any>(environment.apiUrl + '/books')
      .subscribe({
        next: (response) => {
          // La respuesta viene en response.data
          const booksData = response.data || response || [];
          this.books.set(booksData);
          console.log('📚 Libros cargados:', booksData.length);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando libros:', err);
          this.loading.set(false);
        }
      });
  }

  // Cargar préstamos del estudiante
  loadLoans() {
    const userId = this.userId();
    if (!userId) {
      console.warn('⚠️ No hay ID de usuario');
      return;
    }

    this.loading.set(true);
    this.http.get<any>(environment.apiUrl + `/loans/usuario/${userId}`)
      .subscribe({
        next: (response) => {
          // La respuesta viene en response.data
          const loansData = response.data || response || [];
          this.loans.set(loansData);
          console.log('📤 Préstamos cargados:', loansData.length);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando préstamos:', err);
          this.loading.set(false);
        }
      });
  }

  // Cambiar pestaña
  switchTab(tab: 'dashboard' | 'books' | 'loans') {
    this.activeTab.set(tab);
    
    // Recargar datos cuando cambio de pestaña
    if (tab === 'books') {
      this.loadBooks();
    } else if (tab === 'loans') {
      this.loadLoans();
    }
  }

  // Solicitar préstamo
  requestLoan(book: any) {
    if (!book._id) {
      alert('Error: Libro no válido');
      return;
    }

    // Bloqueo preventivo en UI si ya hay préstamo activo de este libro
    if (this.hasActiveLoan(book._id)) {
      alert('⚠️ Ya tienes un préstamo activo de este libro');
      return;
    }

    const loanData = {
      usuarioId: this.userId(),
      libroId: book._id,
      diasPrestamo: 14
    };

    this.http.post(environment.apiUrl + '/loans', loanData)
      .subscribe({
        next: (response: any) => {
          alert('✅ Préstamo solicitado exitosamente');
          this.loadBooks();
          this.loadLoans();
        },
        error: (err) => {
          console.error('Error:', err);
          alert('❌ Error al solicitar préstamo: ' + (err.error?.message || err.message));
        }
      });
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}