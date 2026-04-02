import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductVariant } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-client-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-container" *ngIf="product">
      <div class="breadcrumbs">
        <button mat-button (click)="goBack()"><mat-icon>arrow_back</mat-icon> Back</button>
        <span class="divider">/</span>
        <span class="category">{{ product.category?.name }}</span>
      </div>

      <div class="product-layout">
        <!-- Visuals Column -->
        <div class="visuals-col">
          <div class="main-image-container">
            <img [src]="selectedImage || product.thumbnailUrl || 'assets/placeholder.png'" 
                 appImgFallback="product"
                 [alt]="product.name" class="main-image">
          </div>
          
          <div class="thumbnails-row" *ngIf="product.images && product.images.length > 0">
            <!-- Thumbnail is implicitly first if we want, or just loop images -->
            <div class="thumb-box" 
                 [class.active]="selectedImage === product.thumbnailUrl"
                 (click)="selectedImage = product.thumbnailUrl">
              <img [src]="product.thumbnailUrl || 'assets/placeholder.png'" appImgFallback="product">
            </div>
            
            <div class="thumb-box" *ngFor="let img of product.images"
                 [class.active]="selectedImage === img.imageUrl"
                 (click)="selectedImage = img.imageUrl">
              <img [src]="img.imageUrl" appImgFallback="product">
            </div>
          </div>
        </div>

        <!-- Details Column -->
        <div class="details-col">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="price-section">
            <h2 class="price">&#8377; {{ activeVariant ? activeVariant.price : product.basePrice }}</h2>
            <span class="stock-badge" [class.out-of-stock]="activeVariant ? activeVariant.stockQuantity === 0 : false">
              {{ activeVariant ? (activeVariant.stockQuantity > 0 ? 'In Stock' : 'Out of Stock') : 'Available' }}
            </span>
          </div>

          <p class="description">{{ product.description }}</p>

          <div class="variants-section" *ngIf="product.variants && product.variants.length > 0">
            <h3>Select Option</h3>
            <div class="variant-chips">
              <button mat-stroked-button *ngFor="let v of product.variants"
                      [class.variant-active]="activeVariant?.id === v.id"
                      (click)="selectVariant(v)"
                      [disabled]="v.stockQuantity === 0">
                {{ v.name }}
              </button>
            </div>
          </div>

          <div class="quantity-section">
            <h3>Quantity</h3>
            <div class="qty-controls">
              <button mat-icon-button (click)="decrementQty()"><mat-icon>remove</mat-icon></button>
              <span class="qty">{{ quantity }}</span>
              <button mat-icon-button (click)="incrementQty()"><mat-icon>add</mat-icon></button>
            </div>
          </div>

          <div class="actions-section">
            <button mat-flat-button color="primary" class="add-to-cart-btn" 
                    [disabled]="!canAddToCart()"
                    (click)="addToCart()">
              <mat-icon>shopping_cart</mat-icon> Add to Cart
            </button>
            <button mat-stroked-button color="accent" class="wishlist-btn" (click)="toggleWishlist()">
              <mat-icon>{{ isWishlisted ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
          </div>
          
          <div class="features-list">
             <div class="feature-item"><mat-icon>local_shipping</mat-icon> Free shipping on orders over ₹1000</div>
             <div class="feature-item"><mat-icon>verified</mat-icon> 1 Year Brand Warranty</div>
             <div class="feature-item"><mat-icon>assignment_return</mat-icon> 7 Days Replacement Policy</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 24px; min-height: 80vh; }
    
    .breadcrumbs { display: flex; align-items: center; color: #757575; margin-bottom: 24px; font-size: 14px; }
    .divider { margin: 0 12px; }
    .category { text-transform: uppercase; letter-spacing: 1px; color: #3f51b5; font-weight: 500; }

    .product-layout { display: flex; gap: 48px; align-items: flex-start; }
    @media (max-width: 900px) { .product-layout { flex-direction: column; } }

    /* Visuals */
    .visuals-col { flex: 1; min-width: 0; width: 100%; display: flex; flex-direction: column; gap: 16px; }
    .main-image-container { 
      background: var(--bg-card); border-radius: 16px; padding: 40px; 
      display: flex; justify-content: center; align-items: center;
      border: 1px solid var(--border-color); height: 500px; overflow: hidden;
    }
    .main-image { max-width: 100%; max-height: 100%; object-fit: contain; }

    .thumbnails-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
    .thumbnails-row::-webkit-scrollbar { height: 6px; }
    .thumbnails-row::-webkit-scrollbar-track { background: var(--bg-secondary); border-radius: 4px; }
    .thumbnails-row::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
    .thumbnails-row::-webkit-scrollbar-thumb:hover { background: #999; }
    .thumb-box { 
      width: 80px; height: 80px; border-radius: 8px; border: 2px solid transparent; 
      cursor: pointer; overflow: hidden; background: var(--bg-card); flex-shrink: 0;
      padding: 8px; box-sizing: border-box; display: flex; justify-content: center; align-items: center;
    }
    .thumb-box.active { border-color: #3f51b5; }
    .thumb-box img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Details */
    .details-col { flex: 1; min-width: 0; width: 100%; }
    .product-title { font-size: 32px; font-weight: 300; margin: 0 0 16px 0; color: var(--text-primary); line-height: 1.2; }
    
    .price-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .price { margin: 0; font-size: 36px; font-weight: 700; color: #ffca28; }
    .stock-badge { 
      padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;
      background: #e8f5e9; color: #2e7d32; 
    }
    .out-of-stock { background: #ffebee; color: #c62828; }

    .description { font-size: 16px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 32px; }

    .variants-section h3, .quantity-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 500; color: var(--text-primary); }
    
    .variant-chips { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
    .variant-chips button { border-radius: 8px; height: 44px; padding: 0 24px; }
    .variant-active { border-color: #3f51b5 !important; background: #e8eaf6; color: #3f51b5 !important; }

    .quantity-section { margin-bottom: 40px; }
    .qty-controls { display: inline-flex; align-items: center; background: var(--bg-secondary); border-radius: 24px; padding: 4px; }
    .qty { width: 40px; text-align: center; font-weight: 500; font-size: 16px; color: var(--text-primary); }

    .actions-section { display: flex; gap: 16px; margin-bottom: 40px; }
    .add-to-cart-btn { padding: 0 40px; height: 56px; font-size: 16px; border-radius: 28px; flex: 1; }
    .wishlist-btn { height: 56px; width: 56px; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
    
    .features-list { display: flex; flex-direction: column; gap: 16px; padding-top: 24px; border-top: 1px solid var(--border-color); }
    .feature-item { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); font-size: 14px; }
    .feature-item mat-icon { color: var(--text-secondary); }
  `]
})
export class ClientProductDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  productService = inject(ProductService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  product: Product | null = null;
  isLoading = true;
  selectedImage: string | null = null;
  activeVariant: ProductVariant | null = null;
  quantity = 1;
  isWishlisted = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.product = res.data;
          this.selectedImage = this.product.thumbnailUrl;
          
          if (this.product.variants && this.product.variants.length > 0) {
            this.activeVariant = this.product.variants[0]; // Auto select first variant
          }

          // Check if product is wishlisted
          if (this.authService.isLoggedIn()) {
            this.isWishlisted = this.wishlistService.isWishlisted(this.product.id);
            // Load wishlist if not loaded yet
            if (this.wishlistService.wishlistItems().length === 0) {
              this.wishlistService.getWishlist().subscribe(() => {
                if (this.product) {
                  this.isWishlisted = this.wishlistService.isWishlisted(this.product.id);
                }
              });
            }
          }
        } else {
          this.snackBar.open('Product not found.', 'Close', { duration: 3000 });
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading product details.', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to use wishlist', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }
    if (!this.product) return;

    if (this.isWishlisted) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe(res => {
        if (res.success) {
          this.isWishlisted = false;
          this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe(res => {
        if (res.success) {
          this.isWishlisted = true;
          this.snackBar.open('Added to wishlist!', 'View Wishlist', { duration: 4000 })
            .onAction().subscribe(() => this.router.navigate(['/wishlist']));
        }
      });
    }
  }

  selectVariant(v: ProductVariant) {
    this.activeVariant = v;
  }

  incrementQty() {
    const max = this.activeVariant ? this.activeVariant.stockQuantity : 99;
    if (this.quantity < max) this.quantity++;
  }

  decrementQty() {
    if (this.quantity > 1) this.quantity--;
  }

  canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.product.variants && this.product.variants.length > 0 && !this.activeVariant) return false;
    if (this.activeVariant && this.activeVariant.stockQuantity <= 0) return false;
    return true;
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to add items to cart', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    if (!this.product) return;

    this.isLoading = true;
    this.cartService.addItem({
      variantId: this.activeVariant ? this.activeVariant.id : 0,
      quantity: this.quantity
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Added to cart!', 'View Cart', { duration: 4000 })
            .onAction().subscribe(() => this.router.navigate(['/cart']));
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  goBack() {
    this.location.back();
  }
}
