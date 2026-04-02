import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Wishlist, Product } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CartService } from '../../../core/services/cart.service';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-container">
      <div class="header-section">
        <h1>My Wishlist</h1>
        <p>Save your favorite items here to review them later.</p>
      </div>
      
      <div class="wishlist-grid" *ngIf="wishlistItems.length > 0; else emptyWishlist">
        <mat-card class="product-card" *ngFor="let item of wishlistItems">
          
          <button mat-icon-button class="remove-btn" color="warn" matTooltip="Remove" (click)="removeFromWishlist(item.product.id)">
             <mat-icon>close</mat-icon>
          </button>
          
          <div class="product-image-wrapper" [routerLink]="['/products', item.product.slug]">
            <img [src]="item.product.thumbnailUrl || 'assets/placeholder.png'" 
                 appImgFallback
                 [alt]="item.product.name">
          </div>
          
          <mat-card-content class="product-info">
            <div class="category-tag">{{ item.product.category?.name }}</div>
            <h3 class="product-title" [routerLink]="['/products', item.product.slug]">{{ item.product.name }}</h3>
            <div class="price-row">
              <span class="price">&#8377; {{ item.product.basePrice }}</span>
            </div>
          </mat-card-content>
          
          <mat-card-actions class="card-actions">
             <button mat-flat-button color="primary" class="full-width" (click)="addToCartFast(item.product)">
               <mat-icon>shopping_cart</mat-icon> Quick Add
             </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #emptyWishlist>
        <div class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <h3>Your wishlist is empty</h3>
          <p>You haven't added any products to your wishlist yet.</p>
          <button mat-flat-button color="primary" routerLink="/products" style="margin-top: 24px;">Browse Products</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 40px 24px; min-height: 80vh; }
    
    .header-section { margin-bottom: 32px; }
    .header-section h1 { font-size: 32px; font-weight: 300; margin: 0 0 8px 0; color: var(--text-primary); }
    .header-section p { color: var(--text-secondary); margin: 0; }
    
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      position: relative;
      cursor: default;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
    }
    
    .remove-btn { position: absolute; top: 8px; right: 8px; z-index: 10; background: rgba(255,255,255,0.9); }

    .product-image-wrapper {
      height: 250px;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      cursor: pointer;
    }
    .product-image-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }

    .product-info { padding: 20px; display: flex; flex-direction: column; flex: 1; text-align: left; }
    .category-tag { font-size: 12px; font-weight: 600; color: #3f51b5; text-transform: uppercase; margin-bottom: 8px; }
    .product-title { margin: 0 0 12px 0; font-size: 18px; font-weight: 500; color: var(--text-primary); cursor: pointer; }
    .product-title:hover { color: #3f51b5; }
    
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .price { font-size: 20px; font-weight: 700; color: #ffca28; }
    
    .card-actions { padding: 16px; padding-top: 0; }
    .full-width { width: 100%; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px 24px; background: var(--bg-card); border-radius: 12px; text-align: center;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--text-secondary); margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 24px; margin: 0 0 8px 0; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); margin: 0; }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);
  snackBar = inject(MatSnackBar);

  wishlistItems: Wishlist[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.wishlistItems = res.data.content;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe(res => {
      if (res.success) {
        this.wishlistItems = this.wishlistItems.filter(w => w.product.id !== productId);
        this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
      }
    });
  }

  addToCartFast(product: Product) {
    if (!product.variants || product.variants.length === 0) {
      this.snackBar.open('Product has no variants available.', 'Close');
      return;
    }
    // Fast add defaults to first variant
    this.cartService.addItem({ variantId: product.variants[0].id, quantity: 1 }).subscribe(res => {
      if (res.success) {
        this.snackBar.open('Added to cart!', 'Close', { duration: 3000 });
      }
    });
  }
}
