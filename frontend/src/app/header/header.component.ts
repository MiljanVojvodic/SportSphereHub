import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private authService: AuthService, private router: Router) {}

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
