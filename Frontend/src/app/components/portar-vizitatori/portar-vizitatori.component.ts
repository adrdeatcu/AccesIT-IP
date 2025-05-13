import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LogPrezenta {
  id_vizitator: number;
  cnp: string;
  ora_intrare: string;
  ora_iesire: string | null;
}

@Component({
  selector: 'app-portar-vizitatori',
  templateUrl: './portar-vizitatori.component.html',
  styleUrls: ['./portar-vizitatori.component.css'],
  standalone: false
})
export class PortarVizitatoriComponent implements OnInit {
  logs: LogPrezenta[] = [];
  currentSortColumn: string = 'ora_intrare';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    let url = `http://localhost:3000/api/loguri-vizitatori?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;

    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }

    this.http.get<LogPrezenta[]>(url).subscribe({
      next: (data) => {
        this.logs = data;
      },
      error: (error) => {
        console.error('Error fetching logs:', error);
        alert('Eroare la încărcarea logurilor');
      }
    });
  }

  toggleSort(column: string): void {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadLogs();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) {
      return 'bi-sort';
    }
    return this.sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
  }

  onDateSelect(event: any): void {
    this.selectedDate = event.target.value;
    this.loadLogs();
  }

  clearDateFilter(): void {
    this.selectedDate = '';
    this.loadLogs();
  }

  
  deleteLog(id: number): void {
    if (!confirm('Sigur vrei să ștergi această înregistrare?')) return;

    this.http
      .delete<{ message: string }>(`http://localhost:3000/api/loguri-vizitatori/${id}`)
      .subscribe({
        next: () => {
          alert('Înregistrare ștearsă cu succes');
          this.loadLogs();
        },
        error: (err) => {
          console.error('Error deleting log:', err);
          alert('Eroare la ștergerea înregistrării');
        }
      });
  }
}
