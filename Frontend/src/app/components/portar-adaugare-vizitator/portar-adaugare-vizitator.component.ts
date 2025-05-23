import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface NewVisitorLog {
  nume: string;
  tip_log: 'intrare' | 'iesire';
  data_log: string;
}

@Component({
  selector: 'app-portar-adaugare-vizitator',
  templateUrl: './portar-adaugare-vizitator.component.html', // Points to its own HTML for the form
  // styleUrls: ['./portar-adaugare-vizitator.component.css']
  standalone: false
})
export class PortarAdaugareVizitatorComponent {
  visitorLog: NewVisitorLog = { // This property belongs here
    nume: '',
    tip_log: 'intrare',
    data_log: new Date().toISOString().substring(0, 16)
  };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.visitorLog.nume || !this.visitorLog.tip_log || !this.visitorLog.data_log) {
      this.errorMessage = 'Toate câmpurile sunt obligatorii.';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Nu sunteți autentificat.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      ...this.visitorLog,
      data_log: new Date(this.visitorLog.data_log).toISOString()
    };

    this.http.post('http://localhost:3000/api/adaugare-vizitator', payload, { headers })
      .subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Înregistrare adăugată cu succes!';
          console.log('Visitor log added:', response.data);
          this.visitorLog = {
            nume: '',
            tip_log: 'intrare',
            data_log: new Date().toISOString().substring(0, 16)
          };
          // Optionally navigate: this.router.navigate(['/portar/vizitatori']);
        },
        error: (errorResponse) => {
          console.error('Error adding visitor log:', errorResponse);
          this.errorMessage = errorResponse.error?.error || errorResponse.error?.details || 'Eroare la adăugarea înregistrării.';
        }
      });
  }
}