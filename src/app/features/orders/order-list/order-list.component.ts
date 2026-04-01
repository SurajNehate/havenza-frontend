import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Order, OrderStatus } from '../../../core/models/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatPaginatorModule, LoadingSpinnerComponent, DatePipe],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="container main-content-padding">
      <div class="header">
        <h1>My Orders</h1>
      </div>

      <div class="empty-state" *ngIf="orders.length === 0 && !isLoading">
        <mat-icon class="empty-icon">inbox</mat-icon>
        <h2>No orders found</h2>
        <p>You haven't placed any orders yet.</p>
        <button mat-flat-button color="primary" routerLink="/products">Start Shopping</button>
      </div>

      <div class="orders-list" *ngIf="orders.length > 0">
        <mat-card class="order-card" *ngFor="let order of orders" [routerLink]="['/orders', order.id]">
          <div class="order-header">
            <div class="order-meta">
              <span class="order-id">Order #{{ order.id }}</span>
              <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
            </div>
            <div class="order-status">
              <mat-chip [color]="getStatusColor(order.status)" selected>{{ order.status }}</mat-chip>
            </div>
          </div>
          
          <mat-card-content class="order-content">
            <div class="item-preview">
              <div class="preview-imgs">
                <img *ngFor="let item of order.items | slice:0:3" [src]="item.variant.imageUrl || 'assets/placeholder.png'" class="mini-img">
                <div class="more-items" *ngIf="order.items.length > 3">+{{ order.items.length - 3 }}</div>
              </div>
              <div class="item-text">
                <p>{{ order.items.length }} Item(s)</p>
                <p class="total">Total: &#8377; {{ order.totalAmount - (order.discountAmount || 0) }}</p>
              </div>
            </div>
          </mat-card-content>
          
          <div class="order-actions">
            <button mat-stroked-button color="primary" [routerLink]="['/orders', order.id]" (click)="$event.stopPropagation()">View Details</button>
            <ng-container *ngIf="order.status === 'DELIVERED'">
              <button mat-button class="review-btn" (click)="$event.stopPropagation(); navigateToReview(order.items[0].variant.id)">Write a Review</button>
            </ng-container>
          </div>
        </mat-card>

        <mat-paginator *ngIf="totalElements > 0"
                       [length]="totalElements"
                       [pageSize]="pageSize"
                       [pageIndex]="pageIndex"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    .header h1 { margin: 0; font-weight: 300; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; text-align: center; color: #757575; }
    .empty-icon { font-size: 64px; height: 64px; width: 64px; color: #bdbdbd; margin-bottom: 16px; }
    
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    
    .order-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #eee; background: #fafafa; border-radius: 4px 4px 0 0; }
    .order-meta { display: flex; flex-direction: column; }
    .order-id { font-weight: 500; font-size: 16px; color: #3f51b5; margin-bottom: 4px; }
    .order-date { font-size: 13px; color: #757575; }
    
    .order-content { padding: 16px; }
    .item-preview { display: flex; align-items: center; justify-content: space-between; }
    .preview-imgs { display: flex; align-items: center; gap: 8px; }
    .mini-img { width: 50px; height: 50px; object-fit: contain; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px; }
    .more-items { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #eee; color: #757575; border-radius: 4px; font-weight: 500; font-size: 12px; }
    
    .item-text { text-align: right; }
    .item-text p { margin: 0 0 4px 0; color: #616161; }
    .total { font-weight: 700 !important; font-size: 18px !important; color: #212121 !important; margin-top: 8px !important; }
    
    .order-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 12px 16px; border-top: 1px dashed #eee; }
    .review-btn { color: #ff9800; }
  `]
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);

  orders: Order[] = [];
  isLoading = true;
  
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrders(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.data.content;
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
    this.loadOrders();
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED: return 'warn';
      default: return 'accent';
    }
  }

  navigateToReview(productId: number) {
    // Navigate to product detail reviews tab
    // In a real app we'd open a review dialog or route to a dedicated review page
  }
}
