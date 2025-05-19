import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Angajat {
  prenume: string;
  nume: string;
  poza: string;
  nr_legitimatie: string;
  id_divizie: number;
  cod_bluetooth: string;
  identificator_smartphone: string;
  nr_masina: string;
  acces_activ: boolean;
  badge_acordat_de: string;
}

interface Utilizator {
  id_utilizator: string;  // UUID
  email: string;
  rol: string;
  data_creare: string;    
  angajati: Angajat;
}

@Component({
  selector: 'app-normal-profile',
  templateUrl: './normal-profile.component.html',
  styleUrls: ['./normal-profile.component.css'],
  standalone: false
})
export class NormalProfileComponent implements OnInit {
  model: Utilizator = {
    id_utilizator: '',
    email: '',
    rol: '',
    data_creare: '',
    angajati: {
      prenume: '',
      nume: '',
      poza: '',
      nr_legitimatie: '',
      id_divizie: 0,
      cod_bluetooth: '',
      identificator_smartphone: '',
      nr_masina: '',
      acces_activ: false,
      badge_acordat_de: ''
    }
  };
  divizii: any[] = [];

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const currentUser = this.authService.getCurrentUser();

    if (!token || !currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = currentUser.id_utilizator;

    this.http.get<Utilizator>(`http://localhost:3000/api/normal-profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        if (data) {
          console.log('Profile data received:', data);
          this.model = data;
          this.loadDivizii();
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else {
          alert('Eroare la încărcarea profilului. Vă rugăm să încercați din nou.');
        }
      }
    });
  }

  private loadDivizii() {
    this.http.get<any[]>('http://localhost:3000/api/divizii')
      .subscribe({
        next: data => this.divizii = data,
        error: err => console.error('Error loading divizii:', err)
      });
  }

  onSubmit() {
    const payload: any = {
      email: this.model.email
    };

    // Add password update if provided
    if (this.passwordData.oldPassword && 
        this.passwordData.newPassword && 
        this.passwordData.newPassword === this.passwordData.confirmPassword) {
      payload.oldPassword = this.passwordData.oldPassword;
      payload.newPassword = this.passwordData.newPassword;
    }

    this.http.put(
      `http://localhost:3000/api/normal-profile/${this.model.id_utilizator}`,
      payload,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    ).subscribe({
      next: () => {
        alert('Profil actualizat cu succes');
        this.router.navigate(['/normal-home']);
      },
      error: err => {
        console.error('Error updating profile:', err);
        if (err.error?.message === 'Invalid old password') {
          alert('Parola veche este incorectă');
        } else {
          alert('Eroare la actualizarea profilului');
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/normal-home']);
  }
}
