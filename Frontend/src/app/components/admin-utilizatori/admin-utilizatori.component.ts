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
  currentSortColumn: string = 'id_utilizator';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUtilizatori();
  }

  loadUtilizatori() {
    let url = `http://localhost:3000/api/utilizatori?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;
    
    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }

    this.http.get<Utilizator[]>(url)
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
        this.http.delete(`http://localhost:3000/api/delete-user/${id_utilizator}`)
            .subscribe({
                next: () => {
                    this.loadUtilizatori();
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user');
                }
            });
    }
  }
}
