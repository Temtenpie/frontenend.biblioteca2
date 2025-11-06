import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  userName = signal('');
  loading = signal(false);
  activeTab = signal<'dashboard' | 'books' | 'loans' | 'users'>('dashboard');
  showBookForm = signal(false);

  // Books
  books = signal<any[]>([]);
  newBook = signal({
    titulo: '',
    autor: '',
    isbn: '',
    anio: new Date().getFullYear(),
    categoria: '',
    descripcion: '',
    editorial: '',
    total: 1
  });
  editingBookId = signal<string | null>(null);

  // Loans
  loans = signal<any[]>([]);
  users = signal<any[]>([]);

  // Stats
  totalBooks = computed(() => this.books().length);
  totalLoans = computed(() => this.loans().length);
  activeLoans = computed(() => this.loans().filter(l => l.estado === 'activo').length);
  totalUsers = computed(() => this.users().length);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserData();
  }

  ngOnInit() {
    this.loadBooks();
    this.loadLoans();
    this.loadUsers();
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName.set(user.name || 'Administrador');
    }
  }

  // ==================== BOOKS ====================
  loadBooks() {
    this.loading.set(true);
    this.http.get<any>(environment.apiUrl + '/books')
      .subscribe({
        next: (response) => {
          this.books.set(response.data || response || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando libros:', err);
          this.loading.set(false);
        }
      });
  }

  saveBook() {
    const book = this.newBook();
    
    if (!book.titulo || !book.autor || !book.isbn || !book.anio) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    this.loading.set(true);

    if (this.editingBookId()) {
      this.http.put(environment.apiUrl + `/books/${this.editingBookId()}`, book)
        .subscribe({
          next: () => {
            alert('✅ Libro actualizado exitosamente');
            this.resetBookForm();
            this.loadBooks();
          },
          error: (err) => {
            alert('❌ Error: ' + (err.error?.message || err.message));
            this.loading.set(false);
          }
        });
    } else {
      this.http.post(environment.apiUrl + '/books', book)
        .subscribe({
          next: () => {
            alert('✅ Libro creado exitosamente');
            this.resetBookForm();
            this.loadBooks();
          },
          error: (err) => {
            alert('❌ Error: ' + (err.error?.message || err.message));
            this.loading.set(false);
          }
        });
    }
  }

  editBook(book: any) {
    this.newBook.set({ ...book });
    this.editingBookId.set(book._id);
    this.showBookForm.set(true);
  }

  deleteBook(id: string) {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;

    this.http.delete(environment.apiUrl + `/books/${id}`)
      .subscribe({
        next: () => {
          alert('✅ Libro eliminado exitosamente');
          this.loadBooks();
        },
        error: (err) => {
          alert('❌ Error: ' + (err.error?.message || err.message));
        }
      });
  }

  resetBookForm() {
    this.newBook.set({
      titulo: '',
      autor: '',
      isbn: '',
      anio: new Date().getFullYear(),
      categoria: '',
      descripcion: '',
      editorial: '',
      total: 1
    });
    this.editingBookId.set(null);
    this.loading.set(false);
    this.showBookForm.set(false);
  }

  // ==================== LOANS ====================
  loadLoans() {
    this.loading.set(true);
    this.http.get<any>(environment.apiUrl + '/loans')
      .subscribe({
        next: (response) => {
          this.loans.set(response.data || response || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando préstamos:', err);
          this.loading.set(false);
        }
      });
  }

  returnBook(loanId: string) {
    if (!confirm('¿Estás seguro de marcar este préstamo como devuelto?')) return;

    this.http.put(environment.apiUrl + `/loans/${loanId}/devolver`, {})
      .subscribe({
        next: () => {
          alert('✅ Préstamo actualizado exitosamente');
          this.loadLoans();
        },
        error: (err) => {
          alert('❌ Error: ' + (err.error?.message || err.message));
        }
      });
  }

  // ==================== USERS ====================
  loadUsers() {
    this.loading.set(true);
    this.http.get<any>(environment.apiUrl + '/users')
      .subscribe({
        next: (response) => {
          this.users.set(response.data || response || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.loading.set(false);
        }
      });
  }

  deleteUser(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    this.http.delete(environment.apiUrl + `/users/${id}`)
      .subscribe({
        next: () => {
          alert('✅ Usuario eliminado exitosamente');
          this.loadUsers();
        },
        error: (err) => {
          alert('❌ Error: ' + (err.error?.message || err.message));
        }
      });
  }

  // ==================== NAVIGATION ====================
  switchTab(tab: 'dashboard' | 'books' | 'loans' | 'users') {
    this.activeTab.set(tab);
    
    if (tab === 'books') {
      this.loadBooks();
    } else if (tab === 'loans') {
      this.loadLoans();
    } else if (tab === 'users') {
      this.loadUsers();
    }
  }

  openCreateBook() {
    this.resetBookForm();
    this.showBookForm.set(true);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}