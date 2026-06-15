import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value;
  if (!v) return null;
  const msgs: string[] = [];
  if (v.length < 8 || v.length > 12) msgs.push('mora imati 8–12 karaktera');
  if (!/^[a-zA-Z]/.test(v)) msgs.push('mora počinjati slovom');
  if (!/[A-Z]/.test(v)) msgs.push('mora sadržati barem jedno veliko slovo');
  if (!/\d/.test(v)) msgs.push('mora sadržati barem jedan broj');
  if (!/[!@#$%^&*()\-_+=<>?;:,.'"\\|]/.test(v)) msgs.push('mora sadržati barem jedan specijalni karakter');
  return msgs.length > 0 ? { passwordErrors: msgs } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  selectedRole = 'athlete';
  selectedSports: string[] = [];
  profilePictureBase64 = '';
  previewUrl = '';
  avatarUrl = '';
  avatarGenerated = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  usernameAvailable: boolean | null = null;
  checkingUsername = false;
  sportsDropdownOpen = false;

  readonly allSports = [
    'Fudbal', 'Košarka', 'Tenis', 'Odbojka', 'Plivanje',
    'Džudo', 'Karate', 'Stoni tenis', 'Atletika', 'Rukomet'
  ];

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.form = this.fb.group({
      username:           ['', [Validators.required, Validators.minLength(3)]],
      password:           ['', [Validators.required, passwordValidator]],
      firstName:          ['', Validators.required],
      lastName:           ['', Validators.required],
      phone:              ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      email:              ['', [Validators.required, Validators.email]],
      facilityName:       [''],
      facilityAddress:    [''],
      registrationNumber: [''],
      taxId:              ['']
    });

    this.form.get('username')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((val: string) => {
      if (val && val.length >= 3) {
        this.checkingUsername = true;
        this.usernameAvailable = null;
        this.http.get<{ available: boolean }>(`http://localhost:4000/api/auth/check-username?username=${encodeURIComponent(val)}`).subscribe({
          next: (res) => { this.checkingUsername = false; this.usernameAvailable = res.available; },
          error: () => { this.checkingUsername = false; this.usernameAvailable = null; }
        });
      } else {
        this.usernameAvailable = null;
        this.checkingUsername = false;
      }
    });
  }

  f(name: string) { return this.form.get(name)!; }

  invalid(name: string): boolean {
    return !!(this.f(name).invalid && this.f(name).touched);
  }

  get passwordErrors(): string[] {
    return this.f('password').errors?.['passwordErrors'] ?? [];
  }

  selectRole(role: string) {
    this.selectedRole = role;
    const emp = ['facilityName', 'facilityAddress', 'registrationNumber', 'taxId'];
    if (role === 'employee') {
      this.f('facilityName').setValidators([Validators.required]);
      this.f('facilityAddress').setValidators([Validators.required]);
      this.f('registrationNumber').setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      this.f('taxId').setValidators([Validators.required, Validators.pattern(/^[1-9]\d{8}$/)]);
    } else {
      emp.forEach(field => this.f(field).clearValidators());
    }
    emp.forEach(field => this.f(field).updateValueAndValidity());
  }

  toggleSportsDropdown() {
    this.sportsDropdownOpen = !this.sportsDropdownOpen;
  }

  toggleSport(sport: string) {
    const idx = this.selectedSports.indexOf(sport);
    if (idx > -1) {
      this.selectedSports = this.selectedSports.filter(s => s !== sport);
    } else if (this.selectedSports.length < 5) {
      this.selectedSports = [...this.selectedSports, sport];
    }
  }

  isSportSelected(sport: string): boolean {
    return this.selectedSports.includes(sport);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePictureBase64 = e.target!.result as string;
      this.previewUrl = this.profilePictureBase64;
      this.avatarGenerated = false;
      this.avatarUrl = '';
    };
    reader.readAsDataURL(input.files[0]);
  }

  generateAvatar() {
    const seed = this.f('username').value || 'korisnik';
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;
    this.previewUrl = this.avatarUrl;
    this.avatarGenerated = true;
    this.profilePictureBase64 = '';
  }

  saveAvatarAsProfilePicture() {
    if (!this.avatarUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#b6e3f4';
      ctx.fillRect(0, 0, 200, 200);
      ctx.drawImage(img, 0, 0, 200, 200);
      this.profilePictureBase64 = canvas.toDataURL('image/png');
      this.previewUrl = this.profilePictureBase64;
      this.avatarGenerated = false;
      this.avatarUrl = '';
    };
    img.onerror = () => {
      this.errorMessage = 'Nije moguće konvertovati avatar. Otpremite sliku ručno.';
      this.avatarUrl = '';
      this.previewUrl = '';
      this.avatarGenerated = false;
      this.profilePictureBase64 = '';
    };
    img.src = this.avatarUrl;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Popunite sva obavezna polja ispravno.';
      return;
    }
    if (this.usernameAvailable === false) {
      this.errorMessage = 'Korisničko ime je već zauzeto. Odaberite drugo.';
      return;
    }
    if (this.selectedSports.length === 0) {
      this.errorMessage = 'Odaberite barem jedan sport.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const body = {
      ...this.form.value,
      role: this.selectedRole,
      sports: this.selectedSports,
      profilePicture: this.profilePictureBase64
    };

    this.http.post<any>('http://localhost:4000/api/auth/register', body).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Zahtev poslat. Sačekajte odobrenje administratora.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Greška pri registraciji. Pokušajte ponovo.';
      }
    });
  }
}
