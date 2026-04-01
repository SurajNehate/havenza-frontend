import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductVariant } from '../../../core/models/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, StarRatingComponent, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="container" *ngIf="product">
      <div class="product-header">
        <button mat-button color="primary" (click)="goBack()"><mat-icon>arrow_back</mat-icon> Back to Products</button>
      </div>

      <div class="main-layout">
        <!-- Image Gallery Left Side -->
        <div class="gallery-section">
          <div class="main-image-container">
            <img [src]="selectedImage || product.thumbnailUrl" [alt]="product.name" class="main-img">
          </div>
          <div class="thumbnail-list" *ngIf="product.images?.length">
            <img *ngFor="let img of product.images" 
                 [src]="img.imageUrl" 
                 class="thumb-img"
                 [class.active]="selectedImage === img.imageUrl"
                 (click)="selectedImage = img.imageUrl">
          </div>
        </div>

        <!-- Details Right Side -->
        <div class="details-section">
          <div class="category-badge">{{ product.category?.name }}</div>
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="rating-row">
            <app-star-rating [rating]="4.5" [showText]="true"></app-star-rating>
            <span class="reviews-link">(24 reviews)</span>
          </div>

          <div class="price-row">
            <span class="price">&#8377; {{ activeVariant?.price || product.basePrice }}</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <!-- Variant Selection (Simplified POC approach) -->
          <div class="variants-section" *ngIf="product.variants && product.variants.length > 0">
            <h3>Select Option</h3>
            <mat-chip-listbox>
              <mat-chip-option *ngFor="let variant of product.variants" 
                               [selected]="activeVariant?.id === variant.id"
                               (selectionChange)="selectVariant(variant)"
                               [color]="activeVariant?.id === variant.id ? 'primary' : 'basic'">
                {{ variant.name }}
              </mat-chip-option>
            </mat-chip-listbox>
            <div class="stock-info" *ngIf="activeVariant">
              <span [class.in-stock]="activeVariant.stockQuantity > 0" [class.out-of-stock]="activeVariant.stockQuantity <= 0">
                {{ activeVariant.stockQuantity > 0 ? 'In Stock (' + activeVariant.stockQuantity + ')' : 'Out of Stock' }}
              </span>
            </div>
          </div>

          <div class="actions-section">
            <div class="qty-selector">
              <button mat-icon-button (click)="decreaseQty()" [disabled]="quantity <= 1"><mat-icon>remove</mat-icon></button>
              <span class="qty">{{ quantity }}</span>
              <button mat-icon-button (click)="increaseQty()" [disabled]="activeVariant && quantity >= activeVariant.stockQuantity"><mat-icon>add</mat-icon></button>
            </div>
            
            <button mat-flat-button color="primary" class="add-to-cart-btn" 
                    [disabled]="!activeVariant || activeVariant.stockQuantity <= 0 || isAdding"
                    (click)="addToCart()">
              <mat-icon>shopping_cart</mat-icon>
              {{ isAdding ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="tabs-section">
        <mat-tab-group animationDuration="0ms">
          <mat-tab label="Product Details">
            <div class="tab-content" [innerHTML]="product.description"></div>
          </mat-tab>
          <mat-tab label="Reviews (24)">
            <div class="tab-content">
              <!-- Review POC content -->
              <p>Reviews feature coming soon!</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .product-header { margin-bottom: 20px; }
    
    .main-layout { display: flex; gap: 40px; margin-bottom: 40px; }
    @media (max-width: 800px) { .main-layout { flex-direction: column; } }
    
    .gallery-section { flex: 1; max-width: 500px; }
    .main-image-container { background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 20px; display: flex; justify-content: center; align-items: center; height: 400px; margin-bottom: 16px; }
    .main-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    
    .thumbnail-list { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
    .thumb-img { width: 80px; height: 80px; object-fit: contain; border: 2px solid transparent; border-radius: 4px; cursor: pointer; background: #fafafa; padding: 4px; }
    .thumb-img.active { border-color: #3f51b5; }
    
    .details-section { flex: 1; display: flex; flex-direction: column; }
    .category-badge { color: #757575; text-transform: uppercase; font-size: 13px; font-weight: 500; letter-spacing: 1px; margin-bottom: 8px; }
    .product-title { margin: 0 0 16px 0; font-size: 32px; font-weight: 300; line-height: 1.2; color: #212121; }
    
    .rating-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .reviews-link { color: #3f51b5; cursor: pointer; font-size: 14px; }
    
    .price { font-size: 32px; font-weight: 500; color: #3f51b5; }
    .price-row { margin-bottom: 24px; }
    
    .description { font-size: 16px; line-height: 1.6; color: #616161; margin-bottom: 32px; }
    
    .variants-section { margin-bottom: 32px; border-top: 1px solid #eee; padding-top: 24px; }
    .variants-section h3 { margin: 0 0 16px 0; font-size: 16px; }
    .stock-info { padding-top: 12px; font-size: 14px; font-weight: 500; }
    .in-stock { color: #4caf50; }
    .out-of-stock { color: #f44336; }
    
    .actions-section { display: flex; gap: 24px; align-items: center; margin-top: auto; padding-top: 32px; border-top: 1px solid #eee; }
    .qty-selector { display: flex; align-items: center; border: 1px solid #ccc; border-radius: 4px; }
    .qty { min-width: 40px; text-align: center; font-weight: 500; font-size: 16px; }
    .add-to-cart-btn { padding: 8px 32px; font-size: 16px; }
    .add-to-cart-btn mat-icon { margin-right: 8px; }
    
    .tabs-section { margin-top: 40px; }
    .tab-content { padding: 24px 0; line-height: 1.6; color: #424242; }
  `]
})
export class ProductDetailComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  product: Product | null = null;
  isLoading = true;
  isAdding = false;
  
  selectedImage: string | null = null;
  activeVariant: ProductVariant | null = null;
  quantity = 1;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadProduct(slug);
    });
  }

  loadProduct(slug: string) {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.success) {
          this.product = res.data;
          this.selectedImage = this.product.thumbnailUrl;
          if (this.product.images?.length > 0 && !this.selectedImage) {
            this.selectedImage = this.product.images[0].imageUrl;
          }
          if (this.product.variants && this.product.variants.length > 0) {
            this.activeVariant = this.product.variants[0];
          }
        } else {
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  selectVariant(variant: ProductVariant) {
    this.activeVariant = variant;
    this.quantity = 1; // reset quantity
    if (variant.imageUrl) {
      this.selectedImage = variant.imageUrl;
    }
  }

  increaseQty() {
    if (this.activeVariant && this.quantity < this.activeVariant.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to add items to your cart', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    if (this.activeVariant) {
      this.isAdding = true;
      this.cartService.addItem({ variantId: this.activeVariant.id, quantity: this.quantity }).subscribe({
        next: (res) => {
          this.isAdding = false;
          if (res.success) {
            this.snackBar.open('Added to cart successfully!', 'View Cart', { duration: 3000 })
              .onAction().subscribe(() => this.router.navigate(['/cart']));
          }
        },
        error: () => this.isAdding = false
      });
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
