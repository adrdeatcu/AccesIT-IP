import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LogPrezenta {
  id: number;
  id_utilizator: number;
  timestamp: string;
  tip_actiune: string;
  nume_utilizator: string;
}

@Component({
  selector: 'app-normal-loguri',
  standalone: false,
  templateUrl: './normal-loguri.component.html',
  styleUrl: './normal-loguri.component.css'
})
export class NormalLoguriComponent implements OnInit {
  loguri: LogPrezenta[] = [];
  currentUserId: number | undefined;

  constructor(private http: HttpClient) {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUserId = user.id_utilizator;
    }
  }

  ngOnInit() {
    if (this.currentUserId) {
      this.loadUserLogs();
    }
  }

  private loadUserLogs() {
    this.http.get<LogPrezenta[]>(`http://localhost:3000/api/normal-loguri/${this.currentUserId}`)
      .subscribe({
        next: (data) => {
          this.loguri = data;
        },
        error: (error) => {
          console.error('Error loading logs:', error);
        }
      });
  }
}
