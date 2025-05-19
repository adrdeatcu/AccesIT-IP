import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Angajat {
  // Define properties of Angajat based on your API response
}

interface Utilizator {
  id_utilizator: number;
  email: string;
  rol: string;
  data_creare: string;
  angajati: Angajat | null;  // Mark as potentially null
}

@Component({
  selector: 'app-admin-utilizatori',
  templateUrl: './admin-utilizatori.component.html',
  styleUrl: './admin-utilizatori.component.css',
  standalone: false
})
export class AdminUtilizatoriComponent implements OnInit {
  utilizatori: Utilizator[] = [];
  currentSortColumn: string = 'id_utilizator';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedDate: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadUtilizatori();
  }

  loadUtilizatori() {
    let url = `http://localhost:3000/api/utilizatori?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;
    
    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Utilizator[]>(url, { headers })
      .subscribe({
        next: (data) => {
          console.log('Received users:', data); // Debug log
          this.utilizatori = data;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          } else {
            alert('Eroare la încărcarea utilizatorilor');
          }
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
    this.loadUtilizatori();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) return 'bi-sort';
    return this.sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
  }

  onDateSelect(event: any) {
    this.selectedDate = event.target.value;
    this.loadUtilizatori();
  }

  clearDateFilter() {
    this.selectedDate = '';
    this.loadUtilizatori();
  }

  deleteUser(id_utilizator: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:3000/api/delete-user/${id_utilizator}`, { headers })
        .subscribe({
          next: () => {
            this.loadUtilizatori();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            if (error.status === 401) {
              this.router.navigate(['/login']);
            } else {
              alert('Failed to delete user');
            }
          }
        });
    }
  }

  editUser(userId: number) {  // Changed from string to number
    localStorage.setItem('selectedUserId', userId.toString());
    this.router.navigate(['/admin/admin-profile']);
  }
}
