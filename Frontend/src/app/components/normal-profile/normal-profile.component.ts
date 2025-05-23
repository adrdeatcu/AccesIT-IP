import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
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
  // divizii: any[] = []; // Keep if you use it

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  emailChangeData = {
    newEmail: '',
    currentPassword: '' // Password to verify for email change
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

    // The backend GET /:id route uses the authenticated user's context (req.user.id)
    // to fetch the correct profile. The ID in the URL might be for other use cases
    // or can be a placeholder like 'me' if the backend is designed to ignore it for this specific call.
    const userIdForUrl = currentUser.id_utilizator || 'me';

    this.http.get<Utilizator>(`http://localhost:3000/api/normal-profile/${userIdForUrl}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) // Use new HttpHeaders
    }).subscribe({
      next: (data) => {
        if (data) {
          console.log('Profile data received:', data);
          this.model = data;
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Eroare la încărcarea profilului. Vă rugăm să încercați din nou.');
        }
      }
    });
  }

  async onSubmit() { // Changed to async to handle multiple calls if needed
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesiune expirată. Vă rugăm să vă reconectați.');
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    let passwordChanged = false;
    let emailChangeInitiated = false;

    // 1. Handle Email Change
    if (this.emailChangeData.newEmail && this.emailChangeData.currentPassword) {
      if (!/\S+@\S+\.\S+/.test(this.emailChangeData.newEmail)) {
        alert('Noua adresă de email nu este validă.');
        return;
      }
      if (this.emailChangeData.newEmail === this.model.email) {
        alert('Noua adresă de email este identică cu cea curentă.');
        // Optionally clear fields or just don't proceed with this part
        // return; // Or let it fall through if other changes are pending
      }

      const emailPayload = {
        currentPassword: this.emailChangeData.currentPassword,
        newEmail: this.emailChangeData.newEmail
      };

      try {
        await this.http.put(
          `http://localhost:3000/api/normal-profile/change-email`,
          emailPayload,
          { headers }
        ).toPromise(); // Using toPromise for sequential execution if needed
        alert(`Un email de confirmare a fost trimis la ${this.emailChangeData.newEmail}. Verificați pentru a finaliza.`);
        this.emailChangeData = { newEmail: '', currentPassword: '' }; // Reset fields
        emailChangeInitiated = true;
      } catch (err: any) {
        console.error('Error changing email:', err);
        alert(err.error?.error || err.error?.message || 'Eroare la inițierea schimbării emailului.');
        // Do not proceed with other changes if email change fails due to critical error (e.g. wrong password)
        if (err.status === 400 && err.error?.error?.includes('Parola curentă este incorectă')) {
            return;
        }
      }
    } else if (this.emailChangeData.newEmail && !this.emailChangeData.currentPassword) {
        alert('Pentru a schimba emailul, trebuie să introduceți parola curentă.');
        return; // Stop if new email is entered but password for verification is missing
    }


    // 2. Handle Password Change (only if new password is provided)
    if (this.passwordData.newPassword) {
      if (!this.passwordData.oldPassword) {
        alert('Pentru a schimba parola, trebuie să introduceți parola veche.');
        return;
      }
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('Parolele noi nu se potrivesc.');
        return;
      }
      if (this.passwordData.newPassword.length < 6) {
        alert('Parola nouă trebuie să conțină cel puțin 6 caractere.');
        return;
      }

      const passwordPayload = {
        oldPassword: this.passwordData.oldPassword,
        newPassword: this.passwordData.newPassword
      };

      try {
        await this.http.put(
          `http://localhost:3000/api/normal-profile/change-password`,
          passwordPayload,
          { headers }
        ).toPromise();
        alert('Parola a fost actualizată cu succes.');
        this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
        passwordChanged = true;
      } catch (err: any) {
        console.error('Error changing password:', err);
        alert(err.error?.error || err.error?.message || 'Eroare la schimbarea parolei.');
         if (err.status === 400 && err.error?.error?.includes('Parola veche este incorectă')) {
            return;
        }
      }
    }

    // Optional: Add logic for other profile field updates here if any
    // For now, this form primarily handles email and password changes.

    if (passwordChanged || emailChangeInitiated) {
      // Optionally, reload profile data or navigate
      // this.ngOnInit(); // To refresh displayed data if email changed (after confirmation)
    }
  }

  onCancel(): void {
    this.router.navigate(['/normal-home']);
  }
}
