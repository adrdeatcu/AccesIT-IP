import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portar-adaugare-vizitator',
  templateUrl: './portar-adaugare-vizitator.component.html',
  styleUrls: ['./portar-adaugare-vizitator.component.css'],
  standalone: false
})
export class PortarAdaugareVizitatorComponent {
  vizitatorData = {
    nume: '',
    ora_intrare: '',
    ora_iesire: ''
  };

  successMessage = ''; // ✅ mesaj de succes

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    // Validate all fields are filled
    if (!this.vizitatorData.nume || !this.vizitatorData.ora_intrare || !this.vizitatorData.ora_iesire) {
        alert('Toate câmpurile sunt obligatorii');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nu sunteți autentificat.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Sending data:', this.vizitatorData); // Debug log

    const url = 'http://localhost:3000/api/adaugare-vizitator';

    this.http.post(url, this.vizitatorData, { headers: headers }).subscribe({
        next: (response: any) => {
            console.log('Success response:', response);
            this.successMessage = response.message || 'Vizitator adăugat cu succes!';
            alert(this.successMessage);
            this.resetForm();
        },
        error: (error) => {
            console.error('Error submitting form:', error);
            alert(error.error?.error || 'A apărut o eroare. Verifică datele introduse.');
        }
    });
}

private resetForm(): void {
    this.vizitatorData = {
        nume: '',
        ora_intrare: '',
        ora_iesire: ''
    };
}
}