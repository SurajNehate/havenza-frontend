import { Component, inject, Renderer2, OnInit, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatBadgeModule, MatMenuModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <div class="client-layout" [class.dark-theme]="isDark">
      <!-- HEADER -->
      <header class="header">
        <div class="header-inner">
          <a class="brand" routerLink="/">
            <mat-icon class="brand-icon">storefront</mat-icon>
            <span class="brand-text">Havenza</span>
          </a>

          <!-- Desktop nav -->
          <nav class="nav-center hide-mobile">
            <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">Home</a>
            <a mat-button routerLink="/products" routerLinkActive="active-link">Products</a>
          </nav>

          <!-- Search Bar -->
          <div class="search-bar hide-mobile">
            <mat-icon class="search-icon">search</mat-icon>
            <input type="text" placeholder="Search products..." [(ngModel)]="searchQuery" (keydown.enter)="onSearch()">
          </div>

          <div class="nav-actions">
            <button mat-icon-button (click)="toggleTheme()" [matTooltip]="isDark ? 'Light mode' : 'Dark mode'">
              <mat-icon>{{ isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <button mat-icon-button routerLink="/wishlist" *ngIf="authService.isLoggedIn()" matTooltip="Wishlist">
              <mat-icon [matBadge]="wishlistCount()" matBadgeColor="warn" [matBadgeHidden]="wishlistCount() === 0">favorite_border</mat-icon>
            </button>

            <button mat-icon-button routerLink="/cart" *ngIf="authService.isLoggedIn()" matTooltip="Cart">
              <mat-icon [matBadge]="cartItemCount()" matBadgeColor="accent"
                        [matBadgeHidden]="cartItemCount() === 0">shopping_cart</mat-icon>
            </button>

            <!-- Not logged in -->
            <ng-container *ngIf="!authService.isLoggedIn(); else userMenuTpl">
              <a mat-button routerLink="/login" class="login-btn hide-mobile">Login</a>
              <button mat-icon-button routerLink="/login" class="show-mobile" matTooltip="Login">
                <mat-icon>login</mat-icon>
              </button>
            </ng-container>

            <!-- Logged in -->
            <ng-template #userMenuTpl>
              <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Account">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon> Profile</button>
                <button mat-menu-item routerLink="/orders"><mat-icon>history</mat-icon> Orders</button>
                <button mat-menu-item *ngIf="authService.isAdmin()" routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon> Admin Panel
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()"><mat-icon>exit_to_app</mat-icon> Logout</button>
              </mat-menu>
            </ng-template>

            <!-- Mobile hamburger -->
            <button mat-icon-button [matMenuTriggerFor]="mobileMenu" class="show-mobile" aria-label="Menu">
              <mat-icon>menu</mat-icon>
            </button>
            <mat-menu #mobileMenu="matMenu">
              <div class="mobile-search-box" style="padding: 8px 16px;">
                <input type="text" placeholder="Search..." [(ngModel)]="searchQuery" (keydown.enter)="onSearch()" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px; background: var(--bg-card); color: var(--text-primary);">
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/">Home</button>
              <button mat-menu-item routerLink="/products">Products</button>
              <ng-container *ngIf="authService.isLoggedIn()">
                <button mat-menu-item routerLink="/profile">Profile</button>
                <button mat-menu-item routerLink="/orders">Orders</button>
                <button mat-menu-item *ngIf="authService.isAdmin()" routerLink="/admin">Admin Panel</button>
              </ng-container>
            </mat-menu>
          </div>
        </div>
      </header>

      <!-- MAIN -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <mat-icon>storefront</mat-icon>
            <span>Havenza</span>
          </div>
          <p class="footer-copy">&copy; 2026 Havenza E-commerce. All rights reserved.</p>
          <div class="footer-links">
            <a href="mailto:contact@havenza.com">Email</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .client-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-secondary);
    }

    /* ── Header ── */
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--header-bg);
      color: var(--header-text);
      box-shadow: var(--shadow-md);
    }
    .header-inner {
      display: flex;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      width: 100%;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      flex-shrink: 0;
    }
    .brand-icon { color: #ffca28; }
    .brand-text {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .nav-center {
      display: flex;
      align-items: center;
      margin-left: 32px;
      gap: 4px;
    }
    .nav-center a { color: rgba(255,255,255,0.85); font-weight: 500; }
    .nav-center a.active-link { color: #fff; background: rgba(255,255,255,0.15); border-radius: 8px; }

    /* ── Search Bar ── */
    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 6px 16px;
      margin-left: 24px;
      flex: 1;
      max-width: 360px;
      transition: background 0.2s ease;
    }
    .search-bar:focus-within { background: rgba(255,255,255,0.25); }
    .search-icon { font-size: 20px; margin-right: 8px; color: rgba(255,255,255,0.7); }
    .search-bar input {
      border: none;
      outline: none;
      background: transparent;
      color: #fff;
      font-size: 14px;
      width: 100%;
    }
    .search-bar input::placeholder { color: rgba(255,255,255,0.6); }

    .nav-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: 4px;
      color: rgba(255,255,255,0.9);
    }

    .login-btn {
      color: #ffca28 !important;
      font-weight: 600;
    }

    /* ── Main ── */
    .main-content {
      flex: 1;
      min-height: calc(100vh - 64px - 80px);
    }

    /* ── Footer ── */
    .footer {
      background: var(--footer-bg);
      color: var(--footer-text);
      padding: 24px 0;
    }
    .footer-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
    }
    .footer-copy {
      margin: 0;
      font-size: 13px;
      opacity: 0.8;
    }
    .footer-links {
      display: flex;
      gap: 16px;
    }
    .footer-links a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: 13px;
      &:hover { color: #fff; }
    }

    /* ── Responsive ── */
    .show-mobile { display: none !important; }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .show-mobile { display: inline-flex !important; }

      .header-inner { padding: 0 12px; }

      .brand-text { font-size: 18px; }

      .footer-inner {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class ClientLayoutComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  router = inject(Router);
  renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  isDark = false;
  searchQuery = '';
  cartItemCount = this.cartService.cartItemCount;

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.cartService.getCart().subscribe();
        this.wishlistService.getWishlist().subscribe();
      }
    });
  }

  wishlistCount() {
    return this.wishlistService.wishlistItems().length;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('havenza-theme');
      this.isDark = saved === 'dark';
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('havenza-theme', this.isDark ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDark) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCartLocal();
    this.router.navigate(['/']);
  }

  onSearch() {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { search: q } });
    } else {
      this.router.navigate(['/products'], { queryParams: { search: null }, queryParamsHandling: 'merge' });
    }
  }
}
