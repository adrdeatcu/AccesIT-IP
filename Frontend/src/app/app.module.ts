import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { HrHomeComponent } from './components/hr-home/hr-home.component';
import { PortarHomeComponent } from './components/portar-home/portar-home.component';
import { RoleGuard } from './guards/role.guard';
import { AdminUtilizatoriComponent } from './components/admin-utilizatori/admin-utilizatori.component';
import { AdminCreareUtilizatorComponent } from './components/admin-creare-utilizator/admin-creare-utilizator.component';
import { PortarLoguriComponent } from './components/portar-loguri/portar-loguri.component';
import { NormalLoguriComponent } from './components/normal-loguri/normal-loguri.component';
import { AdminAngajatiComponent } from './components/admin-angajati/admin-angajati.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
  path: 'normal-home',
  component: HomeComponent,
  canActivate: [RoleGuard],
  data: { role: 'Normal' }
  },
  { 
    path: 'admin-home', 
    component: AdminHomeComponent,
    canActivate: [RoleGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'hr-home', 
    component: HrHomeComponent,
    canActivate: [RoleGuard],
    data: { role: 'HR' }
  },
  {
    path: 'gate-home',
    component: PortarHomeComponent,
    canActivate: [RoleGuard],
    data: { role: 'Portar' }
  },
  { 
    path: 'admin/utilizatori', 
    component: AdminUtilizatoriComponent,
    canActivate: [RoleGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/creare-utilizator', 
    component: AdminCreareUtilizatorComponent,
    canActivate: [RoleGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'portar/loguri',
    component: PortarLoguriComponent,
    canActivate: [RoleGuard],
    data: { role: 'Portar' }
  },
  {
    path: 'normal/loguri',
  component: NormalLoguriComponent,
  canActivate: [RoleGuard],
  data: { role: 'Normal' }
  },
  {
    path: 'admin/angajati',
    component: AdminAngajatiComponent,
    canActivate: [RoleGuard],
    data: { role: 'Admin' }
  }
];

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AdminHomeComponent,
    HrHomeComponent,
    PortarHomeComponent,
    AdminUtilizatoriComponent,
    AdminCreareUtilizatorComponent,
    PortarLoguriComponent,
    NormalLoguriComponent,
    AdminAngajatiComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }