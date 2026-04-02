import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Order, OrderStatus } from '../../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatDividerModule, MatSelectModule, FormsModule, LoadingSpinnerComponent, DatePipe, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-header">
      <div>
        <h1>Order #HVZ-{{ order?.id }}</h1>
        <p>Placed on {{ order?.createdAt | date:'medium' }}</p>
      </div>
      <div class="header-actions">
        <button mat-stroked-button color="warn" (click)="deleteOrder()">
          <mat-icon>delete</mat-icon> Delete Order
        </button>
        <button mat-stroked-button routerLink="/admin/orders">
          <mat-icon>arrow_back</mat-icon> Back to Orders
        </button>
      </div>
    </div>

    <div class="detail-grid" *ngIf="order">
      <!-- Customer Info -->
      <mat-card class="info-card">
        <h3><mat-icon>person</mat-icon> Customer</h3>
        <mat-divider></mat-divider>
        <div class="info-row"><span class="label">Name</span><span>{{ order.userName || 'N/A' }}</span></div>
        <div class="info-row"><span class="label">Email</span><span>{{ order.userEmail || 'N/A' }}</span></div>
        <div class="info-row"><span class="label">Mobile</span><span>{{ order.userPhone || 'N/A' }}</span></div>
      </mat-card>

      <!-- Order Info -->
      <mat-card class="info-card">
        <h3><mat-icon>receipt_long</mat-icon> Order Info</h3>
        <mat-divider></mat-divider>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
        </div>
        <div class="info-row"><span class="label">Payment</span><span>{{ order.paymentMethod }}</span></div>
        <div class="info-row"><span class="label">Shipping</span><span>{{ order.shippingAddress }}</span></div>
      </mat-card>

      <!-- Financials -->
      <mat-card class="info-card">
        <h3><mat-icon>payments</mat-icon> Financials</h3>
        <mat-divider></mat-divider>
        <div class="info-row"><span class="label">Subtotal</span><span>&#8377; {{ order.totalAmount }}</span></div>
        <div class="info-row"><span class="label">Discount</span><span class="discount">- &#8377; {{ order.discountAmount || 0 }}</span></div>
        <div class="info-row total"><span class="label">Total</span><span>&#8377; {{ order.totalAmount - (order.discountAmount || 0) }}</span></div>
      </mat-card>

      <!-- Update Status -->
      <mat-card class="info-card">
        <h3><mat-icon>sync</mat-icon> Update Status</h3>
        <mat-divider></mat-divider>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Order Status</mat-label>
          <mat-select [(ngModel)]="newStatus">
            <mat-option value="PLACED">PLACED</mat-option>
            <mat-option value="CONFIRMED">CONFIRMED</mat-option>
            <mat-option value="SHIPPED">SHIPPED</mat-option>
            <mat-option value="DELIVERED">DELIVERED</mat-option>
            <mat-option value="CANCELLED">CANCELLED</mat-option>
            <mat-option value="RETURNED">RETURNED</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-flat-button color="primary" class="full-width" (click)="updateStatus()" [disabled]="newStatus === order.status">
          Update Status
        </button>
      </mat-card>
    </div>

    <!-- Order Items -->
    <mat-card class="items-card" *ngIf="order">
      <h3><mat-icon>inventory_2</mat-icon> Order Items ({{ order.items?.length || 0 }})</h3>
      <mat-divider></mat-divider>
      <div class="item-row" *ngFor="let item of order.items">
        <img [src]="item.variant?.imageUrl || 'assets/placeholder.png'" 
             appImgFallback="product"
             alt="Product" class="item-img">
        <div class="item-info">
          <span class="item-name">{{ item.variant?.productName || item.variant?.name || 'Product' }}</span>
          <span class="item-variant">Variant: {{ item.variant?.name }} &middot; SKU: {{ item.variant?.sku }}</span>
        </div>
        <div class="item-pricing">
          <span class="item-qty">x{{ item.quantity }}</span>
          <span class="item-total" style="margin-left: auto;">&#8377; {{ item.unitPrice * item.quantity }}</span>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 500; }
    .page-header p { margin: 0; color: #757575; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    @media (max-width: 600px) { .header-actions button { width: 100%; } }

    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }

    .info-card { padding: 20px; border-radius: 12px; }
    .info-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 16px; font-weight: 600; }
    .info-card h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #3f51b5; }
    mat-divider { margin-bottom: 16px !important; }

    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .info-row .label { color: #757575; font-weight: 500; }
    .info-row.total { font-weight: 700; font-size: 16px; border-top: 1px solid #e0e0e0; padding-top: 12px; margin-top: 4px; }
    .discount { color: #2e7d32; }

    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-placed { background: #e3f2fd; color: #1976d2; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-shipped { background: #fff3e0; color: #f57c00; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .status-returned { background: #f3e5f5; color: #7b1fa2; }

    .full-width { width: 100%; }

    .items-card { padding: 20px; border-radius: 12px; }
    .items-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 16px; font-weight: 600; }
    .items-card h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #3f51b5; }

    .item-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .item-row:last-child { border-bottom: none; }
    .item-img { width: 56px; height: 56px; border-radius: 8px; object-fit: contain; background: #fafafa; border: 1px solid #e0e0e0; padding: 4px; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 500; font-size: 14px; }
    .item-variant { font-size: 12px; color: #757575; margin-top: 2px; }
    .item-pricing { display: flex; align-items: center; gap: 12px; min-width: 100px; }
    .item-qty { color: #757575; font-size: 14px; white-space: nowrap; }
    .item-total { font-weight: 600; font-size: 15px; color: #3f51b5; }
    
    @media (max-width: 600px) {
      .item-row { flex-wrap: wrap; }
      .item-pricing { width: 100%; justify-content: flex-end; border-top: 1px dashed #eee; padding-top: 8px; margin-top: 4px; }
    }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  order: Order | null = null;
  isLoading = true;
  newStatus = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(Number(id));
  }

  loadOrder(id: number) {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/orders/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.order = res.data;
          this.newStatus = res.data.status;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  updateStatus() {
    if (!this.order) return;
    this.isLoading = true;
    this.http.put<any>(`${environment.apiUrl}/admin/orders/${this.order.id}/status`, { status: this.newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.order = res.data;
          this.snackBar.open('Order status updated!', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to update status.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  deleteOrder() {
    if (!this.order || !confirm(`Are you sure you want to permanently delete order #HVZ-${this.order.id}?`)) return;
    
    this.isLoading = true;
    this.http.delete<any>(`${environment.apiUrl}/admin/orders/${this.order.id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Order permanently deleted', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/orders']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to delete order.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
