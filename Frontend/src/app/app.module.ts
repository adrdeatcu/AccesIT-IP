import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { HrHomeComponent } from './components/hr-home/hr-home.component';
import { PortarHomeComponent } from './components/portar-home/portar-home.component';
import { authGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminUtilizatoriComponent } from './components/admin-utilizatori/admin-utilizatori.component';
import { AdminCreareUtilizatorComponent } from './components/admin-creare-utilizator/admin-creare-utilizator.component';
import { NormalLoguriComponent } from './components/normal-loguri/normal-loguri.component';
import { AdminAngajatiComponent } from './components/admin-angajati/admin-angajati.component';
import { PortarManualLogComponent } from './components/portar-manual-log/portar-manual-log.component';
import { PortarLoguriComponent } from './components/portar-loguri/portar-loguri.component';
import { FooterComponent } from './components/footer/footer.component';
import { PortarAdaugareVizitatorComponent } from './components/portar-adaugare-vizitator/portar-adaugare-vizitator.component';
import { PortarVizitatoriComponent } from './components/portar-vizitatori/portar-vizitatori.component';
import { NormalProfileComponent } from './components/normal-profile/normal-profile.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { ContactInfoComponent } from './components/contact-info/contact-info.component';



const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { hideNav: true } // <--- Add this data property
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { hideNav: true } // <--- Optionally hide nav on register page too
  },
  {
    path: 'normal-home',
    component: HomeComponent,
    canActivate: [authGuard, RoleGuard],
    data: { role: 'Normal' }
  },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    canActivate: [authGuard, RoleGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'hr-home',
    component: HrHomeComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'HR' }
  },
  {
    path: 'gate-home',
    component: PortarHomeComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Portar' }
  },
  {
    path: 'admin/utilizatori',
    component: AdminUtilizatoriComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Admin' }
  },
  {
    path: 'admin/creare-utilizator',
    component: AdminCreareUtilizatorComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Admin' }
  },
  {
    path: 'portar/loguri',
    component: PortarLoguriComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Portar' }
  },
  {
    path: 'normal/loguri',
    component: NormalLoguriComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Normal' }
  },
  {
    path: 'admin/angajati',
    component: AdminAngajatiComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: ['Admin', 'HR'] } // RoleGuard should handle array of roles
  },
  {
    path: 'portar/log-manual',
    component: PortarManualLogComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Portar' }
  },
  {
    path: 'portar/adaugare-vizitator',
    component: PortarAdaugareVizitatorComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Portar' }
  },
  {
    path: 'portar/vizitatori',
    component: PortarVizitatoriComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Portar' }
  },
  {
    path: 'normal/normal-profile', // Consider a more generic path like 'profile'
    component: NormalProfileComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: ['Normal', 'Portar', 'HR'] } // RoleGuard should handle array
  },
  {
    path: 'admin-profile', // This path seems a bit standalone
    component: AdminProfileComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Admin' }
  },
  {
    path: 'admin/admin-profile', // This is more consistent for admin section
    component: AdminProfileComponent,
    canActivate: [authGuard, RoleGuard], // Add authGuard
    data: { role: 'Admin' }
  },
  {
    path: 'contact/contact-info', // This route is public (no guards)
    component: ContactInfoComponent,
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Or a dedicated 404 page
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
    AdminAngajatiComponent,
    PortarManualLogComponent,
    FooterComponent,
    PortarAdaugareVizitatorComponent,
    PortarVizitatoriComponent,
    NormalProfileComponent,
    AdminProfileComponent,
    ContactInfoComponent,
  
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }