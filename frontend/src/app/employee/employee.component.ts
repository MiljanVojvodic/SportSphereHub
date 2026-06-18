import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  @ViewChild('pictureInput') pictureInput!: ElementRef<HTMLInputElement>;
  @ViewChild('jsonInput') jsonInput!: ElementRef<HTMLInputElement>;

  activeTab = 'profile';
  profile: any = null;
  facilities: any[] = [];
  availableSports: string[] = [];
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Profile form
  profileForm = { firstName: '', lastName: '', phone: '', email: '', sports: [] as string[] };
  newPictureData = '';
  newPicturePreview = '';

  // Facility list interaction
  expandedFacilityId: string | null = null;
  addCourtTargetId: string | null = null;
  courtForm = { name: '', type: 'open', capacity: 4, sport: '', description: '' };

  // Add facility panel
  showAddFacility = false;
  facilityForm = {
    name: '', city: '', address: '',
    sports: [] as string[],
    hourlyRate: 0,
    workingHoursFrom: '08:00', workingHoursTo: '22:00',
    maxNoShows: 3,
    description: ''
  };
  facilityCourtForm = { name: '', type: 'open', capacity: 4, sport: '', description: '' };
  facilityCourts: any[] = [];
  showFacilityCourtForm = false;

  private apiUrl = 'http://localhost:4000/api';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { this.router.navigate(['/login']); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'employee') { this.router.navigate(['/login']); return; }
    this.loadProfile();
    this.loadFacilities();
    this.loadSports();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` });
  }

  loadProfile() {
    this.http.get<any>(`${this.apiUrl}/employee/profile`, { headers: this.headers() }).subscribe({
      next: (p) => {
        this.profile = p;
        this.profileForm = {
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          email: p.email || '',
          sports: [...(p.sports || [])]
        };
      },
      error: () => this.toast('Greška pri učitavanju profila', 'error')
    });
  }

  saveProfile() {
    const payload: any = { ...this.profileForm };
    if (this.newPictureData) payload.profilePicture = this.newPictureData;

    this.http.put<any>(`${this.apiUrl}/employee/profile`, payload, { headers: this.headers() }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.newPictureData = '';
        this.newPicturePreview = '';
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...stored,
          firstName: updated.firstName,
          email: updated.email,
          profilePicture: updated.profilePicture
        }));
        this.toast('Profil je uspešno ažuriran', 'success');
      },
      error: (err) => this.toast(err.error?.message || 'Greška pri ažuriranju', 'error')
    });
  }

  triggerPictureInput() { this.pictureInput.nativeElement.click(); }

  onPictureChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.newPictureData = e.target?.result as string;
      this.newPicturePreview = this.newPictureData;
    };
    reader.readAsDataURL(file);
  }

  toggleProfileSport(sport: string) {
    const idx = this.profileForm.sports.indexOf(sport);
    if (idx >= 0) {
      this.profileForm.sports.splice(idx, 1);
    } else if (this.profileForm.sports.length < 5) {
      this.profileForm.sports.push(sport);
    }
  }

  isProfileSportSelected(sport: string): boolean {
    return this.profileForm.sports.includes(sport);
  }

  loadFacilities() {
    this.http.get<any[]>(`${this.apiUrl}/employee/facilities`, { headers: this.headers() }).subscribe({
      next: (f) => this.facilities = f,
      error: () => this.toast('Greška pri učitavanju objekata', 'error')
    });
  }

  loadSports() {
    this.http.get<string[]>(`${this.apiUrl}/home/sports`).subscribe({
      next: (s) => this.availableSports = s,
      error: () => {
        this.availableSports = [
          'Fudbal', 'Košarka', 'Tenis', 'Odbojka', 'Plivanje',
          'Atletika', 'Rukomet', 'Badminton', 'Stolni tenis',
          'Squash', 'Fitnes', 'Boks', 'Džudo', 'Karate'
        ];
      }
    });
  }

  toggleExpand(id: string) {
    this.expandedFacilityId = this.expandedFacilityId === id ? null : id;
    if (this.addCourtTargetId !== id) this.addCourtTargetId = null;
  }

  openAddCourt(id: string) {
    this.addCourtTargetId = this.addCourtTargetId === id ? null : id;
    this.courtForm = { name: '', type: 'open', capacity: 4, sport: '', description: '' };
  }

  submitAddCourt(facilityId: string) {
    this.http.post<any>(
      `${this.apiUrl}/employee/facilities/${facilityId}/courts`,
      this.courtForm,
      { headers: this.headers() }
    ).subscribe({
      next: (updated) => {
        const idx = this.facilities.findIndex(f => f._id === facilityId);
        if (idx >= 0) this.facilities[idx] = updated;
        this.addCourtTargetId = null;
        this.toast('Teren je dodat', 'success');
      },
      error: (err) => this.toast(err.error?.message || 'Greška pri dodavanju terena', 'error')
    });
  }

  removeCourt(facilityId: string, courtName: string) {
    if (!confirm(`Obrisati teren "${courtName}"?`)) return;
    this.http.delete<any>(
      `${this.apiUrl}/employee/facilities/${facilityId}/courts/${encodeURIComponent(courtName)}`,
      { headers: this.headers() }
    ).subscribe({
      next: (updated) => {
        const idx = this.facilities.findIndex(f => f._id === facilityId);
        if (idx >= 0) this.facilities[idx] = updated;
        this.toast('Teren je uklonjen', 'success');
      },
      error: (err) => this.toast(err.error?.message || 'Greška pri brisanju terena', 'error')
    });
  }

  openAddFacility() {
    this.showAddFacility = true;
    this.facilityForm = {
      name: '', city: '', address: '', sports: [],
      hourlyRate: 0, workingHoursFrom: '08:00', workingHoursTo: '22:00',
      maxNoShows: 3, description: ''
    };
    this.facilityCourts = [];
    this.showFacilityCourtForm = false;
    this.facilityCourtForm = { name: '', type: 'open', capacity: 4, sport: '', description: '' };
  }

  cancelAddFacility() { this.showAddFacility = false; }

  toggleFacilitySport(sport: string) {
    const idx = this.facilityForm.sports.indexOf(sport);
    if (idx >= 0) { this.facilityForm.sports.splice(idx, 1); } else { this.facilityForm.sports.push(sport); }
  }

  isFacilitySportSelected(sport: string): boolean { return this.facilityForm.sports.includes(sport); }

  addCourtToForm() {
    if (!this.facilityCourtForm.name.trim()) { this.toast('Naziv terena je obavezan', 'error'); return; }
    if (this.facilityCourts.some(c => c.name === this.facilityCourtForm.name)) {
      this.toast('Teren sa tim nazivom već postoji', 'error'); return;
    }
    if (this.facilityCourtForm.type === 'open' && this.facilityCourtForm.capacity < 4) {
      this.toast('Otvoreni teren mora imati kapacitet ≥ 4', 'error'); return;
    }
    this.facilityCourts.push({ ...this.facilityCourtForm });
    this.facilityCourtForm = { name: '', type: 'open', capacity: 4, sport: '', description: '' };
    this.showFacilityCourtForm = false;
  }

  removeCourtFromForm(name: string) {
    this.facilityCourts = this.facilityCourts.filter(c => c.name !== name);
  }

  submitFacility() {
    const payload = {
      name: this.facilityForm.name,
      city: this.facilityForm.city,
      address: this.facilityForm.address,
      sports: this.facilityForm.sports,
      hourlyRate: this.facilityForm.hourlyRate,
      workingHours: { from: this.facilityForm.workingHoursFrom, to: this.facilityForm.workingHoursTo },
      maxNoShows: this.facilityForm.maxNoShows,
      description: this.facilityForm.description,
      courts: this.facilityCourts
    };

    this.http.post<any>(`${this.apiUrl}/employee/facilities`, payload, { headers: this.headers() }).subscribe({
      next: (created) => {
        this.facilities.push(created);
        this.showAddFacility = false;
        this.toast('Objekat je kreiran i čeka odobrenje administratora', 'success');
      },
      error: (err) => this.toast(err.error?.message || 'Greška pri dodavanju objekta', 'error')
    });
  }

  triggerJsonInput() { this.jsonInput.nativeElement.click(); }

  onJsonUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        this.http.post<any>(`${this.apiUrl}/employee/facilities/json`, data, { headers: this.headers() }).subscribe({
          next: (created) => {
            this.facilities.push(created);
            this.toast('Objekat je uvezen iz JSON-a i čeka odobrenje', 'success');
          },
          error: (err) => this.toast(err.error?.message || 'Greška pri uvozu JSON-a', 'error')
        });
      } catch {
        this.toast('Neispravan JSON format fajla', 'error');
      }
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = '';
  }

  getImageUrl(picture: string): string {
    if (!picture) return '';
    if (picture.startsWith('/uploads/')) return `http://localhost:4000${picture}`;
    return picture;
  }

  get initials(): string {
    if (!this.profile) return '';
    return (this.profile.firstName?.[0] ?? '') + (this.profile.lastName?.[0] ?? '');
  }

  statusLabel(status: string): string {
    const map: any = { pending: 'Na čekanju', active: 'Aktivan', rejected: 'Odbijen' };
    return map[status] ?? status;
  }

  courtTypeLabel(type: string): string {
    const map: any = { open: 'Otvoreni', closed: 'Zatvoreni', hall: 'Dvorana' };
    return map[type] ?? type;
  }

  toast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 3500);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
