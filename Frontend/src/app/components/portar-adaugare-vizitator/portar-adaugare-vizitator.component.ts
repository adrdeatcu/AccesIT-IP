import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portar-adaugare-vizitator',
  templateUrl: './portar-adaugare-vizitator.component.html',
  styleUrls: ['./portar-adaugare-vizitator.component.css'],
  standalone: false
})
export class PortarAdaugareVizitatorComponent {
  vizitatorData = {
    cnp: '',
    ora_intrare: '',
    ora_iesire: ''
  };

  successMessage = ''; // ✅ mesaj de succes

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    const url = 'http://localhost:3000/api/adaugare-vizitator';

    this.http.post(url, this.vizitatorData).subscribe({
      next: () => {
        this.successMessage = 'Vizitator adăugat cu succes!';
        alert(this.successMessage); // ✅ mesaj de succes
      },
      error: (error) => {
        console.error('Eroare la trimiterea formularului:', error);
        alert('A apărut o eroare. Verifică datele introduse.');
      }
    });
  }
}