import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-athlete',
  standalone: true,
  imports: [],
  template: `
    <div class="page-wrapper">
      <div class="card">
        @if (user) {
          <div class="avatar-row">
            @if (user.profilePicture) {
              <img class="avatar" [src]="user.profilePicture" alt="Profilna slika" />
            } @else {
              <div class="avatar-placeholder">{{ initials }}</div>
            }
          </div>
          <h1>Dobrodošli, {{ user.firstName }}!</h1>
          <p class="subtitle">Prijavljeni ste kao <strong>Sportista</strong></p>
          <div class="info-grid">
            <div class="info-item"><span class="label">Korisnik</span><span>{{ user.username }}</span></div>
            <div class="info-item"><span class="label">Email</span><span>{{ user.email }}</span></div>
          </div>
          <p class="wip">Dashboard sportiste je u izradi.</p>
          <button class="btn-logout" (click)="logout()">Odjavi se</button>
        } @else {
          <div class="pending-icon">⏳</div>
          <h1>Zahtev primljen!</h1>
          <p class="subtitle">Vaša registracija je uspešno poslata.</p>
          <p class="wip">Sačekajte odobrenje administratora. Kada vas administrator odobri, moći ćete da se prijavite.</p>
          <a class="btn-link" href="/login">Idi na prijavu</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { display:flex; justify-content:center; align-items:center; min-height:80vh; padding:2rem; }
    .card { background:white; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,.1); padding:2.5rem; text-align:center; max-width:440px; width:100%; }
    .avatar { width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #667eea; margin-bottom:1rem; }
    .avatar-placeholder { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); display:flex; align-items:center; justify-content:center; font-size:2rem; color:white; font-weight:700; margin:0 auto 1rem; }
    .avatar-row { display:flex; justify-content:center; }
    h1 { color:#333; margin:.5rem 0; font-size:1.6rem; }
    .subtitle { color:#666; margin-bottom:1.5rem; }
    .info-grid { display:flex; flex-direction:column; gap:.5rem; margin:1rem 0 1.5rem; text-align:left; background:#f8f9fa; border-radius:8px; padding:1rem; }
    .info-item { display:flex; justify-content:space-between; font-size:.9rem; }
    .label { color:#888; font-weight:500; }
    .wip { color:#888; font-size:.9rem; font-style:italic; margin-bottom:1.5rem; }
    .pending-icon { font-size:3rem; margin-bottom:1rem; }
    .btn-logout { background:linear-gradient(135deg,#667eea,#764ba2); color:white; border:none; padding:.75rem 2rem; border-radius:6px; font-size:1rem; cursor:pointer; font-weight:500; }
    .btn-logout:hover { opacity:.9; }
    .btn-link { display:inline-block; background:linear-gradient(135deg,#667eea,#764ba2); color:white; text-decoration:none; padding:.75rem 2rem; border-radius:6px; font-size:1rem; font-weight:500; }
  `]
})
export class AthleteComponent implements OnInit {
  user: any = null;

  get initials(): string {
    if (!this.user) return '';
    return (this.user.firstName?.[0] ?? '') + (this.user.lastName?.[0] ?? '');
  }

  constructor(private router: Router) {}

  ngOnInit() {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.role === 'athlete') this.user = u;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
