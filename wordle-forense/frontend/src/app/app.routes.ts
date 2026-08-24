import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  { path: 'play', canActivate: [authGuard], loadComponent: () => import('./pages/play.component').then((m) => m.PlayComponent) },
  { path: 'sessions', canActivate: [authGuard], loadComponent: () => import('./pages/sessions.component').then((m) => m.SessionsComponent) },
  { path: 'users/:id', canActivate: [authGuard], loadComponent: () => import('./pages/profile.component').then((m) => m.ProfileComponent) },
  { path: 'admin', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin.component').then((m) => m.AdminComponent) },
  { path: 'denied', loadComponent: () => import('./pages/denied.component').then((m) => m.DeniedComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'play' },
  { path: '**', redirectTo: 'play' },
];
