import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  username = '';
  password = '';
  role: 'student' | 'teacher' = 'student';

  loading = signal(false);
  error = signal('');
  success = signal('');

  private router = inject(Router);
  private authService = inject(AuthService);

  onRegister() {
    if (!this.name || !this.email || !this.username || !this.password) {
      this.error.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register({
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.success.set('Usuario registrado exitosamente. Ahora puede iniciar sesión.');
        // Redirigir al login tras breve pausa
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err: any) => {
        console.error('Error en registro:', err);
        const message = err?.error?.message || 'Error al registrar usuario';
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }
}