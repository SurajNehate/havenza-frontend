import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule,
    MatSidenavModule, MatListModule, MatToolbarModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <div class="admin-shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <mat-icon class="sidebar-logo">admin_panel_settings</mat-icon>
          <span class="sidebar-title" *ngIf="!sidebarCollapsed">Admin Panel</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             [matTooltip]="sidebarCollapsed ? 'Dashboard' : ''" matTooltipPosition="right">
            <mat-icon>dashboard</mat-icon>
            <span *ngIf="!sidebarCollapsed">Dashboard</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed ? 'Products' : ''" matTooltipPosition="right">
            <mat-icon>inventory_2</mat-icon>
            <span *ngIf="!sidebarCollapsed">Products</span>
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed ? 'Orders' : ''" matTooltipPosition="right">
            <mat-icon>local_shipping</mat-icon>
            <span *ngIf="!sidebarCollapsed">Orders</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed ? 'Users' : ''" matTooltipPosition="right">
            <mat-icon>people</mat-icon>
            <span *ngIf="!sidebarCollapsed">Users</span>
          </a>
          <a routerLink="/admin/coupons" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed ? 'Coupons' : ''" matTooltipPosition="right">
            <mat-icon>local_offer</mat-icon>
            <span *ngIf="!sidebarCollapsed">Coupons</span>
          </a>
          <a routerLink="/admin/banners" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed ? 'Banners' : ''" matTooltipPosition="right">
            <mat-icon>view_carousel</mat-icon>
            <span *ngIf="!sidebarCollapsed">Banners</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/"
             [matTooltip]="sidebarCollapsed ? 'Back to Store' : ''" matTooltipPosition="right">
            <mat-icon>storefront</mat-icon>
            <span *ngIf="!sidebarCollapsed">Back to Store</span>
          </a>
        </div>
      </aside>

      <!-- Main area -->
      <div class="admin-main">
        <header class="admin-header">
          <button mat-icon-button (click)="sidebarCollapsed = !sidebarCollapsed" matTooltip="Toggle sidebar">
            <mat-icon>{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</mat-icon>
          </button>

          <span class="admin-header-title">Havenza Admin</span>
          <span class="spacer"></span>

          <span class="admin-user-name">{{ authService.currentUser()?.fullName }}</span>
          <button mat-icon-button (click)="logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-secondary);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      background: var(--bg-primary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease;
      overflow: hidden;
      flex-shrink: 0;
    }
    .sidebar.collapsed { width: 64px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      background: var(--header-bg);
      color: var(--header-text);
      min-height: 64px;
    }
    .sidebar-logo { font-size: 28px; width: 28px; height: 28px; }
    .sidebar-title { font-size: 18px; font-weight: 700; white-space: nowrap; }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 8px 0;
      overflow-y: auto;
    }
    .sidebar-nav a, .sidebar-footer a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      border-left: 3px solid transparent;
      transition: all 0.15s ease;
    }
    .sidebar-nav a:hover, .sidebar-footer a:hover {
      background: rgba(63, 81, 181, 0.08);
    }
    .sidebar-nav a.active {
      background: rgba(63, 81, 181, 0.12);
      color: #3f51b5;
      border-left-color: #3f51b5;
      font-weight: 600;
    }

    .sidebar-footer {
      border-top: 1px solid var(--border-color);
      padding: 8px 0;
    }

    /* ── Main Area ── */
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .admin-header {
      display: flex;
      align-items: center;
      height: 64px;
      padding: 0 24px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .admin-header-title {
      font-size: 18px;
      font-weight: 600;
      margin-left: 8px;
      color: var(--text-primary);
    }
    .spacer { flex: 1; }
    .admin-user-name {
      font-size: 14px;
      color: var(--text-secondary);
      margin-right: 8px;
    }

    .admin-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: var(--bg-secondary);
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .sidebar { width: 64px; }
      .sidebar-title, .sidebar-nav a span, .sidebar-footer a span { display: none; }

      .admin-header { padding: 0 12px; }
      .admin-content { padding: 16px; }
      .admin-user-name { display: none; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  sidebarCollapsed = false;

  ngOnInit() {
    // Collapse sidebar on mobile
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
