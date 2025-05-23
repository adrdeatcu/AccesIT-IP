import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

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
    email: '',
    password: '', // Changed from parola to password
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

  isFormValid(form: NgForm): boolean {
    if (!form) return false;
    
    // Check required fields
    const hasRequiredFields = 
        Boolean(this.userData.email) && 
        Boolean(this.userData.password) && // Changed from parola to password
        Boolean(this.userData.rol) &&
        Boolean(this.userData.angajat.prenume) && 
        Boolean(this.userData.angajat.nume) &&
        Boolean(this.userData.angajat.nr_legitimatie);
    
    // Check if divizie is selected (convert to number for comparison)
    const hasDivizie = 
        this.userData.angajat.id_divizie !== null && 
        this.userData.angajat.id_divizie !== undefined && 
        Number(this.userData.angajat.id_divizie) > 0;

    return hasRequiredFields && hasDivizie;
  }

  onSubmit(form: NgForm) {
    if (!this.isFormValid(form)) {
      alert('Vă rugăm completați toate câmpurile obligatorii');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Nu sunteți autentificat.');
        this.router.navigate(['/login']); // Redirect to login page
        return;
    }

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
    });

    this.http.post('http://localhost:3000/api/register', this.userData, { headers: headers })
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
