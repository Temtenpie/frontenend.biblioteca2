import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  // Registro (modal)
  showRegister = signal(false);
  regName = '';
  regEmail = '';
  regUsername = '';
  regPassword = '';
  regConfirmPassword = '';
  regRole: 'student' | 'teacher' | null = null;
  regLoading = signal(false);
  regError = signal('');
  regSuccess = signal('');

  // Touched flags para validación en tiempo real
  regNameTouched = signal(false);
  regEmailTouched = signal(false);
  regUsernameTouched = signal(false);
  regPasswordTouched = signal(false);
  regConfirmTouched = signal(false);
  regRoleTouched = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);

  // Abrir/Cerrar modal de registro
  openRegister() {
    this.showRegister.set(true);
    this.regError.set('');
    this.regSuccess.set('');
  }

  closeRegister() {
    this.showRegister.set(false);
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.error.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: (response: LoginResponse) => {
        console.log('Login exitoso:', response);
        
        // Guarda el token si lo necesitas
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Guarda los datos del usuario
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        this.loading.set(false);
        
        // ⭐ REDIRECCIONA SEGÚN EL ROL
        const role = response.user?.role;

        if (role === 'admin') {
          console.log('Redirigiendo a admin...');
          this.router.navigate(['/admin']);
        } else if (role === 'student' || role === 'teacher') {
          console.log('Redirigiendo a estudiante/profesor...');
          this.router.navigate(['/student']);
        } else {
          console.log('Rol desconocido:', role);
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        console.error('Error en login:', err);
        this.error.set('Credenciales inválidas o error en el servidor');
        this.loading.set(false);
      }
    });
  }

  // Enviar registro desde el modal
  onRegisterSubmit() {
    const error = this.validateRegistration();
    if (error) {
      this.regError.set(error);
      return;
    }

    this.regLoading.set(true);
    this.regError.set('');
    this.regSuccess.set('');

    const payload = {
      name: this.regName.trim(),
      email: this.regEmail.trim().toLowerCase(),
      username: this.regUsername.trim(),
      password: this.regPassword,
      role: this.regRole as 'student' | 'teacher'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.regLoading.set(false);
        this.regSuccess.set('Usuario registrado exitosamente. Ahora puede iniciar sesión.');
        setTimeout(() => {
          this.closeRegister();
          this.username = payload.username;
          this.password = '';
        }, 800);
      },
      error: (err: any) => {
        console.error('Error en registro:', err);
        const message = err?.error?.message || 'Error al registrar usuario';
        this.regError.set(message);
        this.regLoading.set(false);
      }
    });
  }

  // Validaciones de registro
  private validateRegistration(): string | null {
    const name = this.regName?.trim();
    const email = this.regEmail?.trim();
    const username = this.regUsername?.trim();
    const password = this.regPassword || '';
    const confirm = this.regConfirmPassword || '';

    if (!name || !email || !username || !password || !confirm) {
      return 'Por favor complete todos los campos';
    }

    // Email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Correo electrónico no válido';
    }

    // Usuario mínimo 3 caracteres
    if (username.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres';
    }

    // Contraseña: mínimo 8, al menos una letra y un número
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      return 'La contraseña debe incluir letras y números';
    }

    if (password !== confirm) {
      return 'Las contraseñas no coinciden';
    }

    // Rol requerido
    if (!this.regRole) {
      return 'Selecciona un rol';
    }

    return null;
  }

  // Validación por campo (para UI)
  getNameError(): string | null {
    const name = this.regName?.trim();
    if (!name) return 'El nombre es obligatorio';
    return null;
  }

  getEmailError(): string | null {
    const email = this.regEmail?.trim();
    if (!email) return 'El email es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) return 'Correo electrónico no válido';
    return null;
  }

  getUsernameError(): string | null {
    const username = (this.regUsername || '').trim();
    if (!username) return 'El usuario es obligatorio';
    if (username.length < 3) return 'Mínimo 3 caracteres';
    return null;
  }

  getPasswordError(): string | null {
    const password = this.regPassword || '';
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) return 'Debe incluir letras y números';
    return null;
  }

  getConfirmError(): string | null {
    const confirm = this.regConfirmPassword || '';
    if (!confirm) return 'Confirma tu contraseña';
    if (confirm !== this.regPassword) return 'Las contraseñas no coinciden';
    return null;
  }

  markTouched(field: 'name' | 'email' | 'username' | 'password' | 'confirm' | 'role') {
    if (field === 'name') this.regNameTouched.set(true);
    if (field === 'email') this.regEmailTouched.set(true);
    if (field === 'username') this.regUsernameTouched.set(true);
    if (field === 'password') this.regPasswordTouched.set(true);
    if (field === 'confirm') this.regConfirmTouched.set(true);
    if (field === 'role') this.regRoleTouched.set(true);
  }

  getRoleError(): string | null {
    const role = this.regRole;
    if (!role) return 'Selecciona un rol';
    if (role !== 'student' && role !== 'teacher') return 'Rol inválido';
    return null;
  }
}