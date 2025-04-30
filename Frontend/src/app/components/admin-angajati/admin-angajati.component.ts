import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Angajat {
  id_utilizator: number;
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
  data_acordarii: string;
  data_modificare: string | null;
}

@Component({
  selector: 'app-admin-angajati',
  standalone: false,
  templateUrl: './admin-angajati.component.html',
  styleUrl: './admin-angajati.component.css'
})
export class AdminAngajatiComponent implements OnInit {
  angajati: Angajat[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAngajati();
  }

  private loadAngajati() {
    this.http.get<Angajat[]>('http://localhost:3000/api/angajati')
      .subscribe({
        next: (data) => {
          this.angajati = data;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }
}
