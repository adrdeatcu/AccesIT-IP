import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


interface LogResponse {
  usersCurrentlyIn: number;
  usersInDetails: UserInDetail[];
  logs: LogPrezenta[];
}

interface UserInDetail {
  id_utilizator: number;
  nume_complet: string;
  ultima_intrare: string;
}

interface LogPrezenta {
  id: number;  // Changed from id_log to id
  id_utilizator: number;
  timestamp: string;
  tip_actiune: string;
  nume_complet: string;
}

@Component({
  selector: 'app-portar-loguri',
  templateUrl: './portar-loguri.component.html',
  standalone: false
})
export class PortarLoguriComponent implements OnInit {
  loguri: LogPrezenta[] = [];
  usersCurrentlyIn = 0;
  usersInDetails: UserInDetail[] = [];
  currentSortColumn: string = 'data_log';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedDate: string = '';
  selectedAction: string = '';

  constructor(
    private http: HttpClient,
    
  ) {}

  ngOnInit() {
    this.loadLoguri();
  }

  private loadLoguri() {
    // Change from loguri-prezenta to loguri
    let url = `http://localhost:3000/api/loguri?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;
    
    if (this.selectedDate) {
        url += `&filterDate=${this.selectedDate}`;
    }
    
    if (this.selectedAction) {
        url += `&filterAction=${this.selectedAction}`;
    }

    this.http.get<LogResponse>(url)
        .subscribe({
            next: (response) => {
                console.log('Received logs:', response.logs); // Debug log
                this.loguri = response.logs;
                this.usersCurrentlyIn = response.usersCurrentlyIn;
                this.usersInDetails = response.usersInDetails;
            },
            error: (error) => {
                console.error('Error loading logs:', error);
            }
        });
}

  toggleSort(column: string) {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'desc';
    }
    this.loadLoguri();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) return 'bi-sort';
    return this.sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
  }

  onDateSelect(event: any) {
    this.selectedDate = event.target.value;
    this.loadLoguri();
  }

  onActionSelect(event: any) {
    this.selectedAction = event.target.value;
    this.loadLoguri();
  }

  clearFilters() {
    this.selectedDate = '';
    this.selectedAction = '';
    this.loadLoguri();
  }

  deleteLog(logId: number | undefined) {
    console.log('Attempting to delete log with ID:', logId);

    if (typeof logId !== 'number') {
        console.error('Invalid log ID:', logId);
        alert('Cannot delete log: Invalid ID');
        return;
    }

    if (confirm('Are you sure you want to delete this log?')) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Nu sunteți autentificat.');
            
            return;
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        this.http.delete(`http://localhost:3000/api/delete-log/${logId}`, { headers: headers })
            .subscribe({
                next: (response: any) => {
                    console.log('Log deleted successfully:', response);
                    this.loadLoguri();
                },
                error: (error) => {
                    console.error('Error deleting log:', error);
                    alert(error.error?.error || 'Failed to delete log');
                }
            });
    }
  }
}
