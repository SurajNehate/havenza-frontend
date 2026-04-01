import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-client-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule, LoadingSpinnerComponent, MatTooltipModule],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-container">
      <div class="header-section">
        <h1>All Products</h1>
        
        <div class="filters">
          <mat-form-field appearance="outline" class="sort-field">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategoryId" (selectionChange)="filterProducts()">
              <mat-option [value]="0">All Categories</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat.id">
                {{ cat.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="sort-field">
            <mat-label>Sort By</mat-label>
            <mat-select [(ngModel)]="sortParam" (selectionChange)="loadProducts()">
              <mat-option value="createdAt,desc">Newest First</mat-option>
              <mat-option value="price_asc">Price: Low to High</mat-option>
              <mat-option value="price_desc">Price: High to Low</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="products-grid" *ngIf="filteredProducts.length > 0; else noProducts">
        <mat-card class="product-card" *ngFor="let product of filteredProducts">
          <button mat-icon-button class="wishlist-overlay-btn" (click)="toggleWishlist($event, product)" [matTooltip]="isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
            <mat-icon [class.wishlist-active]="isWishlisted(product.id)">{{ isWishlisted(product.id) ? 'favorite' : 'favorite_border' }}</mat-icon>
          </button>
          
          <div class="product-image-wrapper" [routerLink]="['/products', product.slug]">
            <img [src]="product.thumbnailUrl || 'assets/placeholder.png'" [alt]="product.name">
          </div>
          <mat-card-content class="product-info" [routerLink]="['/products', product.slug]">
            <div class="category-tag">{{ product.category?.name }}</div>
            <h3 class="product-title">{{ product.name }}</h3>
            <div class="price-row">
              <span class="price">&#8377; {{ product.basePrice }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #noProducts>
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <h3>No products found</h3>
          <p>We couldn't find any products matching your criteria.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 40px 24px; min-height: 80vh; }
    
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .header-section h1 { font-size: 32px; font-weight: 300; margin: 0; color: var(--text-primary); }
    
    .filters { display: flex; gap: 16px; }
    .sort-field { width: 200px; }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .wishlist-overlay-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      background: rgba(255, 255, 255, 0.8);
    }
    .wishlist-active { color: #f44336; }

    .product-image-wrapper {
      height: 250px;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
    }
    .product-image-wrapper img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-image-wrapper img { transform: scale(1.05); }

    .product-info { padding: 20px; display: flex; flex-direction: column; flex: 1; text-align: left; }
    .category-tag { font-size: 12px; font-weight: 600; color: #3f51b5; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
    .product-title { margin: 0 0 12px 0; font-size: 18px; font-weight: 500; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .price { font-size: 20px; font-weight: 700; color: #ffca28; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      background: var(--bg-card);
      border-radius: 12px;
      text-align: center;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--text-secondary); margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 24px; margin: 0 0 8px 0; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); margin: 0; }
  `]
})
export class ClientProductListComponent implements OnInit {
  productService = inject(ProductService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute);
  router = inject(Router);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  isLoading = true;
  sortParam = 'createdAt,desc';
  selectedCategoryId = 0;
  searchTerm = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId = Number(params['category']);
      }
      this.searchTerm = params['search'] || '';
      this.loadCategories();
      this.loadProducts();
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(res => {
      if (res.success) this.categories = res.data;
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(0, 100, this.sortParam).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products = res.data.content;
          this.filterProducts();
          this.loadWishlist();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadWishlist() {
    if (this.authService.isLoggedIn() && this.wishlistService.wishlistItems().length === 0) {
      this.wishlistService.getWishlist().subscribe();
    }
  }

  isWishlisted(productId: number): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  toggleWishlist(event: Event, product: Product) {
    event.stopPropagation();
    
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to use wishlist', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    if (this.isWishlisted(product.id)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 });
          }
        }
      });
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('Added to wishlist!', 'View Wishlist', { duration: 3000 })
              .onAction().subscribe(() => this.router.navigate(['/wishlist']));
          }
        }
      });
    }
  }

  filterProducts() {
    let results = [...this.products];
    
    if (this.selectedCategoryId !== 0) {
      results = results.filter(p => p.category?.id === this.selectedCategoryId);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
      );
    }
    
    this.filteredProducts = results;
  }
}
