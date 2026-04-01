import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="admin-header">
      <div class="header-titles">
        <h1>Product Management</h1>
        <p>Manage store catalog and variants</p>
      </div>
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> Add New Product
      </button>
    </div>

    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="products" class="custom-table" *ngIf="products.length > 0">
          
          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef> Image </th>
            <td mat-cell *matCellDef="let element"> 
              <img [src]="element.thumbnailUrl || 'assets/placeholder.png'" class="row-img">
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="product-name">{{ element.name }}</span>
              <br>
              <span class="product-sku">SKU: {{ element.variants?.[0]?.sku || 'N/A' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef> Category </th>
            <td mat-cell *matCellDef="let element"> {{ element.category?.name }} </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Base Price </th>
            <td mat-cell *matCellDef="let element" class="price-cell"> &#8377; {{ element.basePrice }} </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Total Stock </th>
            <td mat-cell *matCellDef="let element"> 
              <span [class.text-warn]="getTotalStock(element) <= 10">
                {{ getTotalStock(element) }} units
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary" [routerLink]="[element.id, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(element.id)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-state" *ngIf="products.length === 0 && !isLoading">
          <mat-icon class="empty-icon">inventory_2</mat-icon>
          <h3>No products found</h3>
          <p>Add some products to your catalog to get started.</p>
        </div>

        <mat-paginator *ngIf="totalElements > 0"
                       [length]="totalElements"
                       [pageSize]="pageSize"
                       [pageIndex]="pageIndex"
                       [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-titles h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 500; }
    .header-titles p { margin: 0; color: #757575; }
    
    .table-card { overflow: hidden; }
    .table-container { padding: 0 !important; }
    
    .custom-table { width: 100%; border-collapse: collapse; }
    
    .row-img { width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #eee; background: #fafafa; }
    
    .product-name { font-weight: 500; color: #333; }
    .product-sku { font-size: 12px; color: #757575; }
    
    .price-cell { font-weight: 500; color: #3f51b5; }
    .text-warn { color: #f44336; font-weight: 500; }
    
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: #757575; }
    .empty-icon { font-size: 48px; height: 48px; width: 48px; color: #e0e0e0; margin-bottom: 16px; }
    
    /* Enhance table row hover */
    mat-row { transition: background 0.2s; }
    mat-row:hover { background: #fafafa; }
  `]
})
export class AdminProductListComponent implements OnInit {
  productService = inject(ProductService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'actions'];
  products: Product[] = [];
  isLoading = true;

  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.pageIndex, this.pageSize, 'createdAt,desc').subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data.content;
          this.totalElements = res.data.totalElements;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  getTotalStock(product: Product): number {
    if (!product.variants) return 0;
    return product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.isLoading = true;
      this.productService.deleteProduct(id).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          }
        },
        error: () => this.isLoading = false
      });
    }
  }
}
