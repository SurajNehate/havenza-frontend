import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BannerService } from '../../core/services/banner.service';
import { ProductService } from '../../core/services/product.service';
import { Banner, Category, Product } from '../../core/models/models';

import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, ImgFallbackDirective],
  template: `
    <!-- Top Scrollable Carousel covering full window (Full viewport minus header) -->
    <div class="hero-carousel-section" *ngIf="banners.length > 0">
      <div class="carousel-track" [style.transform]="'translateX(-' + currentSlide * 100 + 'vw)'">
        <div class="carousel-slide" *ngFor="let banner of banners">
          <div class="slide-bg" [style.backgroundImage]="'url(' + (banner.imageUrl || 'assets/placeholder.png') + ')'"></div>
          <div class="slide-overlay">
            <div class="slide-content">
              <h1 class="slide-title" style="margin-bottom: 32px;">{{ banner.title }}</h1>
              <button *ngIf="banner.linkUrl" mat-raised-button color="accent" class="shop-now-btn" [routerLink]="banner.linkUrl">Shop Now</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Controls -->
      <button mat-icon-button class="carousel-control prev" (click)="prevSlide()">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <button mat-icon-button class="carousel-control next" (click)="nextSlide()">
        <mat-icon>chevron_right</mat-icon>
      </button>
      
      <div class="carousel-indicators">
        <div class="dot" *ngFor="let b of banners; let i=index" 
             [class.active]="currentSlide === i" (click)="goToSlide(i)"></div>
      </div>
    </div>

    <div class="container main-content-padding">
      <!-- All Products & Filters -->
      <section class="section">
        <div class="section-header">
          <h2>Our Collection</h2>
          <div class="filter-chips">
            <button mat-stroked-button [class.active-filter]="selectedCategory === null" (click)="filterByCategory(null)">All</button>
            <button mat-stroked-button [class.active-filter]="selectedCategory === -1" (click)="filterByCategory(-1)">NEW</button>
            <button mat-stroked-button *ngFor="let cat of categories" 
                    [class.active-filter]="selectedCategory === cat.id" 
                    (click)="filterByCategory(cat.id)">
              {{ cat.name }}
            </button>
          </div>
        </div>
        
        <div class="products-grid">
          <mat-card class="product-card" *ngFor="let prod of filteredProducts" [routerLink]="['/products', prod.slug]">
            <div class="img-wrapper">
              <img [src]="prod.thumbnailUrl || 'assets/placeholder.png'" 
                   appImgFallback="product" 
                   [alt]="prod.name" class="prod-img">
              <div class="hover-action">
                <button mat-mini-fab color="accent"><mat-icon>shopping_cart</mat-icon></button>
              </div>
            </div>
            <mat-card-content class="prod-content">
              <span class="cat-label">{{ prod.category?.name }}</span>
              <h4 class="prod-title">{{ prod.name | slice:0:40 }}{{prod.name.length > 40 ? '...' : ''}}</h4>
              <p class="prod-price">&#8377; {{ prod.basePrice }}</p>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="no-products" *ngIf="filteredProducts.length === 0">
           No products found in this category.
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Hero Carousel - Reduced height */
    .hero-carousel-section {
      width: 100vw;
      height: 450px; /* Reduced fixed height */
      position: relative;
      overflow: hidden;
      margin-left: calc(-50vw + 50%);
      margin-top: -1px;
    }
    .carousel-track {
      display: flex;
      height: 100%;
      width: max-content;
      transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .carousel-slide {
      width: 100vw;
      height: 100%;
      position: relative;
    }
    .slide-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: cover;
      background-position: center;
      transition: transform 6s ease;
    }
    .carousel-slide:hover .slide-bg {
      transform: scale(1.05);
    }
    .slide-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%);
      display: flex;
      align-items: center;
      padding: 0 8%;
    }
    .slide-content {
      max-width: 600px;
      color: white;
    }
    .new-badge {
      display: inline-block;
      background: #ffca28;
      color: #000;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }
    .slide-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
    .slide-desc { font-size: 1.1rem; opacity: 0.8; margin-bottom: 24px; line-height: 1.5; }
    .slide-price { font-size: 2rem; font-weight: 700; color: #ffca28; margin-bottom: 32px; }
    .shop-now-btn { height: 50px; padding: 0 32px; font-size: 16px; border-radius: 25px; }

    /* Controls */
    .carousel-control {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.2) !important;
      color: white !important;
      width: 48px; height: 48px;
    }
    .carousel-control:hover { background: rgba(255,255,255,0.4) !important; }
    .carousel-control.prev { left: 24px; }
    .carousel-control.next { right: 24px; }
    
    .carousel-indicators {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
    }
    .dot {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgba(255,255,255,0.4);
      cursor: pointer; transition: 0.3s;
    }
    .dot.active { background: #ffca28; transform: scale(1.2); }
    
    /* Layout */
    .container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
    .main-content-padding { padding-top: 60px; padding-bottom: 60px; }
    .section-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 32px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px;
      flex-wrap: wrap; gap: 16px;
    }
    .section-header h2 { margin: 0; font-size: 28px; font-weight: 300; }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chips button { border-radius: 20px; }
    .active-filter { background: #3f51b5 !important; color: white !important; border-color: #3f51b5 !important; }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }
    .product-card {
      cursor: pointer; border-radius: 12px; overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: 1px solid transparent;
      padding: 0; /* Remove internal padding of mat-card */
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.1);
      border-color: #e0e0e0;
    }
    .img-wrapper { position: relative; height: 260px; overflow: hidden; background: #f9f9f9; display: flex; align-items: center; justify-content: center; padding: 20px;}
    .prod-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.5s; }
    .product-card:hover .prod-img { transform: scale(1.08); }
    
    .hover-action {
      position: absolute; bottom: -50px; right: 16px; transition: 0.3s;
    }
    .product-card:hover .hover-action { bottom: 16px; }

    .prod-content { padding: 20px; }
    .cat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #757575; display: block; margin-bottom: 8px; }
    .prod-title { font-size: 16px; font-weight: 400; margin: 0 0 12px 0; color: var(--text-color, #212121); line-height: 1.4; height: 44px; }
    .prod-price { font-weight: 700; color: #ffca28; margin: 0; font-size: 20px; }
    
    .no-products { text-align: center; padding: 60px; color: #757575; font-size: 16px; background: #f5f5f5; border-radius: 12px; }

    @media (max-width: 768px) {
      .slide-title { font-size: 2.2rem; }
      .hero-carousel-section { height: 60vh; }
      .section-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  bannerService = inject(BannerService);

  categories: Category[] = [];
  banners: Banner[] = [];
  featuredProducts: Product[] = []; // Top 5
  allProducts: Product[] = []; // Bottom grid
  filteredProducts: Product[] = []; // Bottom grid display

  selectedCategory: number | null = null;
  currentSlide = 0;
  slideInterval: any;

  ngOnInit() {
    this.productService.getCategories().subscribe(res => {
      if (res.success) this.categories = res.data;
    });

    // Fetch active banners for Top Carousel
    this.bannerService.getActiveBanners().subscribe(res => {
      if (res.success) {
        // Sort matching backend order
        this.banners = res.data.filter(b => b.active).sort((a,b) => a.sortOrder - b.sortOrder);
        this.startAutoSlide();
      }
    });

    // Fetch 5 latest products for New Arrivals
    this.productService.getProducts(0, 5, 'createdAt,desc').subscribe(res => {
      if (res.success) {
        this.featuredProducts = res.data.content;
      }
    });

    // Fetch up to 50 latest products for the grid below
    this.productService.getProducts(0, 50, 'createdAt,desc').subscribe(res => {
      if (res.success) {
        this.allProducts = res.data.content;
        this.filteredProducts = this.allProducts;
      }
    });
  }

  filterByCategory(catId: number | null) {
    this.selectedCategory = catId;
    if (catId === null) {
      this.filteredProducts = this.allProducts;
    } else if (catId === -1) {
      this.filteredProducts = this.featuredProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(p => p.category?.id === catId);
    }
  }

  // Carousel Logic
  nextSlide() {
    if (this.banners.length === 0) return;
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    this.resetTimer();
  }

  prevSlide() {
    if (this.banners.length === 0) return;
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
    this.resetTimer();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetTimer();
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      if (this.banners.length > 0) {
        this.currentSlide = (this.currentSlide + 1) % this.banners.length;
      }
    }, 5000);
  }

  resetTimer() {
    clearInterval(this.slideInterval);
    this.startAutoSlide();
  }
}
