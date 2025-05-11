import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  standalone: false,
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  nume: string = ''; 

   constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const id_utilizator = currentUser.id_utilizator;

      // Fetch prenume from the angajati table
      this.http.get<any>(`http://localhost:3000/api/angajati/${id_utilizator}`)
        .subscribe({
          next: (response) => {
            this.nume = response.nume || 'Utilizator'; // Default to 'Utilizator' if prenume is missing
          },
          error: (error) => {
            console.error('Error fetching prenume:', error);
            this.nume = 'Utilizator'; // Fallback in case of error
          }
        });
    } else {
      console.warn('No user data found in AuthService');
      this.nume = 'Utilizator';
    }
  }
}
