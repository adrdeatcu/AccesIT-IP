import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


interface LogResponse {
  usersCurrentlyIn: number;
  usersInDetails: UserInDetail[];
  logs: LogPrezenta[];
}

interface UserInDetail {
  id_utilizator: number;
  nume_utilizator: string;
  ultima_intrare: string;
}

interface LogPrezenta {
  id: number;
  id_utilizator: number;
  timestamp: string;
  tip_actiune: string;
  nume_utilizator: string;
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
    let url = `http://localhost:3000/api/loguri-prezenta?sortBy=${this.currentSortColumn}&sortOrder=${this.sortDirection}`;
    
    if (this.selectedDate) {
      url += `&filterDate=${this.selectedDate}`;
    }
    
    if (this.selectedAction) {
      url += `&filterAction=${this.selectedAction}`;
    }

    this.http.get<LogResponse>(url)
      .subscribe({
        next: (response) => {
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
}
