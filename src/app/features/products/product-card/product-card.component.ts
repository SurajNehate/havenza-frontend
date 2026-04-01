import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../../core/models/models';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="product-card">
      <div class="image-container" (click)="navigate()">
        <img mat-card-image [src]="product.thumbnailUrl || 'assets/placeholder.png'" [alt]="product.name">
        <button mat-icon-button class="wishlist-btn" (click)="$event.stopPropagation(); toggleWishlist()">
          <mat-icon [color]="isWishlisted() ? 'warn' : ''">{{ isWishlisted() ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </div>
      
      <mat-card-content (click)="navigate()" class="content-area">
        <div class="category-name">{{ product.category?.name }}</div>
        <h3 class="product-name">{{ product.name | slice:0:40 }}{{ product.name.length > 40 ? '...' : '' }}</h3>
        
        <div class="price-row">
          <span class="price">&#8377; {{ getLowestPrice() }} <span *ngIf="hasMultiplePrices()">+</span></span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.3s;
      cursor: pointer;
    }
    .product-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .image-container {
      position: relative;
      padding-top: 100%;
      overflow: hidden;
      background: #fafafa;
    }
    .image-container img {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: contain;
      padding: 16px;
      box-sizing: border-box;
    }
    .wishlist-btn {
      position: absolute;
      top: 8px; right: 8px;
      background: rgba(255,255,255,0.8);
    }
    .content-area {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .category-name {
      font-size: 12px;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .product-name {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.4;
      flex: 1;
    }
    .price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price {
      font-size: 18px;
      font-weight: 700;
      color: #3f51b5;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  authService = inject(AuthService);
  wishlistService = inject(WishlistService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  getLowestPrice(): number {
    if (!this.product.variants || this.product.variants.length === 0) return this.product.basePrice;
    return Math.min(...this.product.variants.map(v => v.price));
  }

  hasMultiplePrices(): boolean {
    if (!this.product.variants || this.product.variants.length <= 1) return false;
    const firstPrice = this.product.variants[0].price;
    return this.product.variants.some(v => v.price !== firstPrice);
  }

  isWishlisted(): boolean {
    return this.wishlistService.isWishlisted(this.product.id);
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to add to wishlist', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    if (this.isWishlisted()) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe();
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe();
    }
  }

  navigate() {
    this.router.navigate(['/products', this.product.slug]);
  }
}
