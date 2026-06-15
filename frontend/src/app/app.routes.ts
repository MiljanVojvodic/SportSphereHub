import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AthleteComponent } from './athlete/athlete.component';
import { EmployeeComponent } from './employee/employee.component';
import { AdminComponent } from './admin/admin.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'athlete', component: AthleteComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin-login', component: AdminLoginComponent },
];
