import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface AngajatData {
  id_utilizator: number;
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
    rol: '',
    angajat: {
      id_utilizator: 0, // This will be set after user creation
      prenume: '',
      nume: '',
      poza: '',
      nr_legitimatie: '',
      id_divizie: null as number | null,
      cod_bluetooth: '',
      identificator_smartphone: '',
      nr_masina: '',
      acces_activ: true,
      badge_acordat_de: ''
    }
  };

  divizii: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadDivizii();
  }

  loadDivizii() {
    this.http.get('http://localhost:3000/api/divizii')
      .subscribe({
        next: (data: any) => {
          this.divizii = data;
        },
        error: (error) => {
          console.error('Error loading divizii:', error);
        }
      });
  }

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
