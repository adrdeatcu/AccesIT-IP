import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hr-home',
  standalone: false,
  templateUrl: './hr-home.component.html',
  styleUrl: './hr-home.component.css'
})
export class HrHomeComponent implements OnInit {
  nume: string = '';

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const id_utilizator = currentUser.id_utilizator;

      // Fetch nume from the angajati table
      this.http.get<any>(`http://localhost:3000/api/angajati/${id_utilizator}`)
        .subscribe({
          next: (response) => {
            this.nume = response.nume || 'Utilizator'; // Default to 'Utilizator' if nume is missing
          },
          error: (error) => {
            console.error('Error fetching nume:', error);
            this.nume = 'Utilizator'; // Fallback in case of error
          }
        });
    } else {
      console.warn('No user data found in AuthService');
      this.nume = 'Utilizator';
    }
  }
}

