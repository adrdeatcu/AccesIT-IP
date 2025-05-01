import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ManualLog {
  id_utilizator: number;
  tip_log: 'IN' | 'OUT';
}

@Component({
  selector: 'app-portar-manual-log',
  standalone: false,
  templateUrl: './portar-manual-log.component.html',
  styleUrl: './portar-manual-log.component.css'
})
export class PortarManualLogComponent {
  logData: ManualLog = {
    id_utilizator: 0,
    tip_log: 'IN'
  };

  constructor(private http: HttpClient) {}

  toggleTipLog() {
    this.logData.tip_log = this.logData.tip_log === 'IN' ? 'OUT' : 'IN';
  }

  onSubmit() {
    if (!this.logData.id_utilizator) {
      alert('Vă rugăm introduceți ID-ul utilizatorului');
      return;
    }

    this.http.post('http://localhost:3000/api/loguri-manuale', this.logData)
      .subscribe({
        next: (response) => {
          alert('Log creat cu succes!');
          this.logData.id_utilizator = 0; // Reset form
        },
        error: (error) => {
          console.error('Error creating log:', error);
          alert(error.error.error || 'Eroare la crearea logului');
        }
      });
  }
}
