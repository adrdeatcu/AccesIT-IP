import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; // To navigate after success

interface VizitatorLog { // This is the interface for displaying logs
  id_vizitator: number;
  nume: string;
  tip_log: 'IN' | 'OUT';  // Changed from 'intrare' | 'iesire' to match DB values
  data_log: string;
}

@Component({
  selector: 'app-portar-vizitatori',
  templateUrl: './portar-vizitatori.component.html', // This should point to the HTML that LISTS visitors
  styleUrls: ['./portar-vizitatori.component.css'],
  standalone: false
})
export class PortarVizitatoriComponent implements OnInit {
  logs: VizitatorLog[] = []; // Use the correct interface for displaying
  currentSortColumn: keyof VizitatorLog = 'data_log'; // Use keyof for type safety
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nu sunteți autentificat.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let url = `http://localhost:3000/api/vizitatori?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;

    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }

    this.http.get<VizitatorLog[]>(url, { headers }).subscribe({ // Expect VizitatorLog array
      next: (data) => {
        console.log('Received visitor logs:', data);
        this.logs = data;
      },
      error: (error) => {
        console.error('Error fetching logs:', error);
        alert('Eroare la încărcarea logurilor');
      }
    });
  }

  toggleSort(column: keyof VizitatorLog): void { // Use keyof
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadLogs();
  }

  getSortIcon(column: keyof VizitatorLog): string { // Use keyof
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

  deleteLog(id_vizitator: number): void { // Parameter is id_vizitator
    if (!confirm('Sigur vrei să ștergi această înregistrare?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nu sunteți autentificat.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete<{ message: string }>(`http://localhost:3000/api/vizitatori/${id_vizitator}`, { headers })
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

// The PortarAdaugareVizitatorComponent should be separate
// @Component({ ... })
// export class PortarAdaugareVizitatorComponent { ... }
