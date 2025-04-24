import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-creare-utilizator',
  standalone: false,
  templateUrl: './admin-creare-utilizator.component.html',
  styleUrl: './admin-creare-utilizator.component.css'
})
export class AdminCreareUtilizatorComponent {
  userData = {
    nume_utilizator: '',
    parola: '',
    rol: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.userData.rol) {
      alert('Vă rugăm selectați un rol');
      return;
    }

    this.http.post('http://localhost:3000/api/register', this.userData)
      .subscribe({
        next: (response) => {
          alert('Utilizator creat cu succes!');
          this.router.navigate(['/admin/utilizatori']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert(error.error.error || 'Eroare la crearea utilizatorului');
        }
      });
  }
}
