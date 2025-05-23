import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Angajat {
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
  currentSortColumn: string = 'id_utilizator';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedDate: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAngajati();
    const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Decoded JWT:', payload);
}
  }

  private loadAngajati() {
    let url = `http://localhost:3000/api/angajati?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;
  
    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Angajat[]>(url, { headers })
      .subscribe({
        next: (data) => {
          console.log('Received data:', data);
          this.angajati = data; // ✅ correct spelling here
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }

  toggleSort(column: string) {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadAngajati();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) return 'bi-sort';
    return this.sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
  }

  onDateSelect(event: any) {
    this.selectedDate = event.target.value;
    this.loadAngajati();
  }

  clearDateFilter() {
    this.selectedDate = '';
    this.loadAngajati();
  }

  getHomeRoute(): string {
    const userRole = this.authService.getUserRole();
    if (userRole === 'Admin') {
      return '/admin-home';
    } else if (userRole === 'HR') {
      return '/hr-home';
    }
    return '/login';
  }

  deleteUser(id_utilizator: number) {
    if (confirm('Are you sure you want to delete this user?')) {
        this.http.delete(`http://localhost:3000/api/delete-user/${id_utilizator}`)
            .subscribe({
                next: () => {
                    // Refresh the users list
                    this.loadAngajati();
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user');
                }
            });
    }
  } 
}
