import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Utilizator {
  id_utilizator: number;
  nume_utilizator: string;
  rol: string;
  data_creare: Date;
}

@Component({
  selector: 'app-admin-utilizatori',
  templateUrl: './admin-utilizatori.component.html',
  styleUrl: './admin-utilizatori.component.css',
  standalone: false
})
export class AdminUtilizatoriComponent implements OnInit {
  utilizatori: Utilizator[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUtilizatori();
  }

  loadUtilizatori() {
    this.http.get<Utilizator[]>('http://localhost:3000/api/utilizatori')
      .subscribe({
        next: (data) => {
          this.utilizatori = data;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          alert('Eroare la încărcarea utilizatorilor');
        }
      });
  }

  deleteUser(id: number) {
    if (confirm('Sigur doriți să ștergeți acest utilizator?')) {
        this.http.delete(`http://localhost:3000/api/utilizatori/${id}`)
            .subscribe({
                next: () => {
                    this.utilizatori = this.utilizatori.filter(user => user.id_utilizator !== id);
                    alert('Utilizator șters cu succes');
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    alert(error.error.error || 'Eroare la ștergerea utilizatorului');
                }
            });
    }
}
}
