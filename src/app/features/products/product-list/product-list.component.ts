import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/models';
import { ProductCardComponent } from '../product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSidenavModule, MatCheckboxModule, MatSliderModule, MatSelectModule, MatPaginatorModule, MatInputModule, MatIconModule, MatButtonModule, ProductCardComponent, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <mat-sidenav-container class="catalog-container">
      <mat-sidenav mode="side" opened class="filters-sidenav">
        <div class="filter-section">
          <h3>Categories</h3>
          <div class="category-list">
            <!-- For POC, just using single selection via clicking name. Can be refined to checkboxes -->
            <div class="category-item" 
                 [class.active]="!currentCategorySlug" 
                 (click)="filterByCategory('')">
              All Products
            </div>
            <div *ngFor="let cat of categories" 
                 class="category-item" 
                 [class.active]="currentCategorySlug === cat.slug"
                 (click)="filterByCategory(cat.slug)">
              {{ cat.name }}
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="catalog-content">
        <div class="toolbar">
          <mat-form-field appearance="outline" class="search-bar">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Search products..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
          </mat-form-field>

          <mat-form-field appearance="outline" class="sort-dropdown">
            <mat-label>Sort By</mat-label>
            <mat-select [(value)]="currentSort" (selectionChange)="loadProducts()">
              <mat-option value="createdAt,desc">Newest First</mat-option>
              <mat-option value="basePrice,asc">Price: Low to High</mat-option>
              <mat-option value="basePrice,desc">Price: High to Low</mat-option>
              <mat-option value="name,asc">Name: A-Z</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="product-grid" *ngIf="products.length > 0">
          <app-product-card *ngFor="let prod of products" [product]="prod"></app-product-card>
        </div>

        <div class="empty-state" *ngIf="products.length === 0 && !isLoading">
          <mat-icon class="empty-icon">search_off</mat-icon>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters.</p>
          <button mat-flat-button color="primary" (click)="clearFilters()">Clear Filters</button>
        </div>

        <mat-paginator *ngIf="totalElements > 0"
                       [length]="totalElements"
                       [pageSize]="pageSize"
                       [pageSizeOptions]="[12, 24, 48]"
                       [pageIndex]="pageIndex"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .catalog-container { height: calc(100vh - 64px); background: #f5f5f5; }
    .filters-sidenav { width: 250px; padding: 20px; background: white; border-right: 1px solid #e0e0e0; }
    .filter-section h3 { margin-top: 0; font-size: 16px; font-weight: 500; border-bottom: 1px solid #eee; padding-bottom: 8px;}
    .category-item { padding: 8px 0; cursor: pointer; color: #616161; transition: color 0.2s; }
    .category-item:hover { color: #3f51b5; }
    .category-item.active { color: #3f51b5; font-weight: 500; }
    
    .catalog-content { padding: 20px; display: flex; flex-direction: column; }
    .toolbar { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
    .search-bar { flex: 1; max-width: 400px; }
    .sort-dropdown { width: 200px; }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .empty-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; color: #757575;
    }
    .empty-icon { font-size: 64px; height: 64px; width: 64px; color: #e0e0e0; margin-bottom: 16px; }
  `]
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  categories: Category[] = [];
  products: Product[] = [];
  isLoading = true;

  // Filters & Pagination
  currentCategorySlug = '';
  searchQuery = '';
  searchSubject = new Subject<string>();
  
  currentSort = 'createdAt,desc';
  pageIndex = 0;
  pageSize = 12;
  totalElements = 0;

  ngOnInit() {
    this.productService.getCategories().subscribe(res => {
      if (res.success) this.categories = res.data;
    });

    this.route.queryParams.subscribe(params => {
      if (params['category']) this.currentCategorySlug = params['category'];
      if (params['search']) this.searchQuery = params['search'];
      this.loadProducts();
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.router.navigate([], { queryParams: { search: query || null }, queryParamsHandling: 'merge' });
    });
  }

  loadProducts() {
    this.isLoading = true;
    
    // In a real scenario, the backend would support search & category filtering as HTTP params on GET /products
    // For this POC, we'll fetch products and filter in memory if the backend Specification isn't fully robust.
    
    this.productService.getProducts(this.pageIndex, this.pageSize, this.currentSort).subscribe({
      next: (res) => {
        if (res.success) {
          let content = res.data.content;
          
          // Client-side filtering as fallback for missing backend query params support
          if (this.currentCategorySlug) {
            content = content.filter(p => p.category?.slug === this.currentCategorySlug);
          }
          if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            content = content.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
          }
          
          this.products = content;
          this.totalElements = res.data.totalElements; // this will be inaccurate with client-side filters, but fine for POC
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  filterByCategory(slug: string) {
    this.router.navigate([], { queryParams: { category: slug || null, page: 0 }, queryParamsHandling: 'merge' });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  clearFilters() {
    this.searchQuery = '';
    this.currentCategorySlug = '';
    this.router.navigate(['/products']);
  }
}
