import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  activeTab = 'pending';
  pendingUsers: any[] = [];
  allUsers: any[] = [];
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private apiUrl = 'http://localhost:4000/api';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      this.router.navigate(['/admin-login']);
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPendingUsers();
    this.loadAllUsers();
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadPendingUsers() {
    this.http.get<any[]>(`${this.apiUrl}/admin/pending-users`, { headers: this.headers() }).subscribe({
      next: (users) => { this.pendingUsers = users; },
      error: () => { this.toast('Greška pri učitavanju zahteva', 'error'); }
    });
  }

  loadAllUsers() {
    this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers: this.headers() }).subscribe({
      next: (users) => { this.allUsers = users; },
      error: () => { this.toast('Greška pri učitavanju korisnika', 'error'); }
    });
  }

  approve(id: string) {
    this.http.put(`${this.apiUrl}/admin/users/${id}/approve`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.toast('Korisnik je odobren', 'success');
        this.pendingUsers = this.pendingUsers.filter(u => u._id !== id);
        this.loadAllUsers();
      },
      error: () => this.toast('Greška pri odobravanju', 'error')
    });
  }

  reject(id: string) {
    this.http.put(`${this.apiUrl}/admin/users/${id}/reject`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.toast('Zahtev je odbijen', 'success');
        this.pendingUsers = this.pendingUsers.filter(u => u._id !== id);
      },
      error: () => this.toast('Greška pri odbijanju', 'error')
    });
  }

  blockUser(id: string) {
    this.http.put(`${this.apiUrl}/admin/users/${id}/block`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.toast('Korisnik je blokiran', 'success');
        this.loadAllUsers();
      },
      error: () => this.toast('Greška pri blokiranju', 'error')
    });
  }

  unblockUser(id: string) {
    this.http.put(`${this.apiUrl}/admin/users/${id}/unblock`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.toast('Korisnik je odblokiran', 'success');
        this.loadAllUsers();
      },
      error: () => this.toast('Greška pri odblokiranju', 'error')
    });
  }

  deleteUser(id: string) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) return;
    this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.headers() }).subscribe({
      next: () => {
        this.toast('Korisnik je obrisan', 'success');
        this.allUsers = this.allUsers.filter(u => u._id !== id);
      },
      error: () => this.toast('Greška pri brisanju', 'error')
    });
  }

  toast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => { this.toastMessage = ''; }, 3500);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  get activeCount(): number {
    return this.allUsers.filter(u => u.status === 'approved').length;
  }

  get blockedCount(): number {
    return this.allUsers.filter(u => u.status === 'blocked').length;
  }

  roleLabel(role: string): string {
    if (role === 'athlete') return 'Sportista';
    if (role === 'employee') return 'Zaposleni';
    return role;
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Aktivan';
      case 'blocked': return 'Blokiran';
      case 'pending': return 'Na čekanju';
      case 'rejected': return 'Odbijen';
      default: return status;
    }
  }
}
