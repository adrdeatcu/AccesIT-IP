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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLoguri();
  }

  private loadLoguri() {
    this.http.get<LogResponse>('http://localhost:3000/api/loguri-prezenta')
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
}
