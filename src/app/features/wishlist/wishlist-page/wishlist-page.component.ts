import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../products/product-card/product-card.component';
import { ProductVariant } from '../../../core/models/models';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, LoadingSpinnerComponent, ProductCardComponent],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="container main-content-padding">
      <div class="header">
        <h1>My Wishlist ({{ wishlistService.wishlistItems().length }})</h1>
      </div>

      <div class="empty-state" *ngIf="wishlistService.wishlistItems().length === 0 && !isLoading">
        <mat-icon class="empty-icon">favorite_border</mat-icon>
        <h2>Your wishlist is empty</h2>
        <p>Save items you like to your wishlist to easily find them later.</p>
        <button mat-flat-button color="primary" routerLink="/products">Continue Shopping</button>
      </div>

      <div class="product-grid" *ngIf="wishlistService.wishlistItems().length > 0">
        <mat-card class="wishlist-card" *ngFor="let item of wishlistService.wishlistItems()">
          <app-product-card [product]="item.product"></app-product-card>
          <div class="card-actions">
            <button mat-stroked-button color="primary" class="full-width" (click)="moveToCart(item.product.id, item.product.variants)">
              Move to Cart
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    .header h1 { margin: 0; font-weight: 300; }
    
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; text-align: center; color: #616161;
      background: #fafafa; border-radius: 8px; border: 1px dashed #ccc;
    }
    .empty-icon { font-size: 64px; height: 64px; width: 64px; color: #bdbdbd; margin-bottom: 16px; }
    .empty-state h2 { margin: 0 0 16px 0; font-weight: 400; color: #424242; }
    .empty-state p { margin-bottom: 24px; }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 24px;
    }
    
    .wishlist-card {
      /* Remove internal padding from app-product-card container */
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .card-actions {
      padding: 0 16px 16px 16px;
      margin-top: -10px; /* pull closer to the card content */
      z-index: 10;
    }
    .full-width { width: 100%; }
  `]
})
export class WishlistPageComponent implements OnInit {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);
  snackBar = inject(MatSnackBar);

  isLoading = true;

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }

  moveToCart(productId: number, variants: ProductVariant[]) {
    if (!variants || variants.length === 0) {
      this.snackBar.open('Product is currently unavailable', 'Close', { duration: 3000 });
      return;
    }

    // Default to the first variant for quick "Move to Cart" action
    const variantId = variants[0].id;

    this.cartService.addItem({ variantId, quantity: 1 }).subscribe(res => {
      if (res.success) {
        // Remove from wishlist after moving
        this.wishlistService.removeFromWishlist(productId).subscribe();
        this.snackBar.open('Moved to cart successfully', 'Close', { duration: 3000 });
      }
    });
  }
}
