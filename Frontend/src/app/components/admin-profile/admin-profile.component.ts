import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Angajat {
  prenume: string;
  nume: string;
  cnp: string;
  poza: string;
  nr_legitimatie: string;
  id_divizie: number;
  cod_bluetooth: string;
  identificator_smartphone: string;
  nr_masina: string;
  acces_activ: boolean;
  cnp_acordat_de: string;
  badge_acordat_de: string;
}

interface Utilizator {
  id_utilizator: number;  // Changed from string to number
  nume_utilizator: string;
  rol: string;
  data_creare: string;    // Only this timestamp field exists
  angajati: Angajat;
}

// Add this new interface for tracking changes
interface ChangedFields {
  [key: string]: any;
}

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  model: Utilizator = {
    id_utilizator: 0,  // Changed from string to number
    nume_utilizator: '',
    rol: '',
    data_creare: '',      // Changed from created_at
  
    angajati: {
      prenume: '',
      nume: '',
      cnp: '',
      poza: '',
      nr_legitimatie: '',
      id_divizie: 0,
      cod_bluetooth: '',
      identificator_smartphone: '',
      nr_masina: '',
      acces_activ: false,
      cnp_acordat_de: '',
      badge_acordat_de: ''
    }
  };
  divizii: any[] = [];

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Add a property to track changes
  changedFields: ChangedFields = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const selectedUserId = localStorage.getItem('selectedUserId');

    if (!token) {
        this.router.navigate(['/login']);
        return;
    }

    if (selectedUserId) {
        this.loadUserProfile(parseInt(selectedUserId), token);  // Parse string to number
    }
  }

  private loadUserProfile(userId: number, token: string) {  // Changed from string to number
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
    const payload: any = {};

    // Handle direct user fields
    Object.keys(this.changedFields)
        .filter(key => !key.startsWith('angajat.'))
        .forEach(field => {
            payload[field] = this.model[field as keyof Utilizator];
        });

    // Handle password change
    if (this.passwordData.newPassword) {
        payload.newPassword = this.passwordData.newPassword;
    }

    // Handle angajat changes - Create angajat object if any field changed
    const angajatChanges = Object.keys(this.changedFields)
        .filter(key => key.startsWith('angajat.'));
    
    if (angajatChanges.length > 0) {
        payload.angajat = {};
        angajatChanges.forEach(key => {
            const fieldName = key.replace('angajat.', '');
            payload.angajat[fieldName] = this.model.angajati[fieldName as keyof Angajat];
        });
    }

    // Debug log to verify payload
    console.log('Changed fields:', this.changedFields);
    console.log('Sending payload:', payload);

    // Only make the request if there are changes
    if (Object.keys(payload).length > 0) {
        this.http.put(
            `http://localhost:3000/api/admin-profile/${this.model.id_utilizator}`,
            payload,
            {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }
        ).subscribe({
            next: (response: any) => {
                if (response.success) {
                    alert('Profil actualizat cu succes');
                    this.router.navigate(['/admin-utilizatori']);
                    this.changedFields = {};
                } else {
                    alert('Eroare la actualizarea profilului');
                }
            },
            error: (err) => {
                console.error('Error updating profile:', err);
                alert('Eroare la actualizarea profilului');
            }
        });
    } else {
        alert('Nu există modificări de salvat');
    }
  }

  // Add method to track changes
  onFieldChange(fieldPath: string, value: any) {
    this.changedFields[fieldPath] = true;
  }

  onCancel(): void {
    this.router.navigate(['/admin-home']);
  }

}
