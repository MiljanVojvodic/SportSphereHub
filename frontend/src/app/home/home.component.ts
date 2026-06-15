import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface Facility {
  _id: string;
  name: string;
  city: string;
  likes: number;
  dislikes: number;
}

interface Promotion {
  _id: string;
  name: string;
  facility: { _id: string; name: string };
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  sport: string;
}

interface HomeData {
  activeFacilitiesCount: number;
  top3Facilities: Facility[];
  promotions: Promotion[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  homeData: HomeData | null = null;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get dashboardRoute(): string {
    const role = this.authService.getRole();
    if (role === 'admin') return '/admin';
    if (role === 'employee') return '/employee';
    return '/athlete';
  }

  goToDashboard() {
    this.router.navigate([this.dashboardRoute]);
  }

  ngOnInit(): void {
    this.http.get<HomeData>('http://localhost:4000/api/home').subscribe({
      next: (data) => (this.homeData = data),
      error: (err) => console.error('Failed to load home data', err),
    });
  }
}
