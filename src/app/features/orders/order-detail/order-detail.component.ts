import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Order, OrderStatus } from '../../../core/models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatStepperModule, MatDividerModule, LoadingSpinnerComponent, DatePipe],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="container main-content-padding" *ngIf="order">
      <div class="header-actions">
        <button mat-button (click)="goBack()"><mat-icon>arrow_back</mat-icon> Back to Orders</button>
      </div>

      <div class="order-header">
        <div class="title-group">
          <h1>Order #{{ order.id }}</h1>
          <mat-chip [color]="getStatusColor(order.status)" selected>{{ order.status }}</mat-chip>
        </div>
        <div class="date-group">
          <p>Placed on {{ order.createdAt | date:'medium' }}</p>
        </div>
      </div>

      <!-- Order Status Timeline POC -->
      <mat-card class="timeline-card">
        <mat-card-content>
          <div class="stepper-horizontal">
            <!-- Simplified custom stepper for styling -->
            <div class="step" [class.active]="step >= 1">
              <div class="circle"><mat-icon>receipt</mat-icon></div>
              <div class="label">Placed</div>
            </div>
            <div class="line" [class.active]="step >= 2"></div>
            
            <div class="step" [class.active]="step >= 2">
              <div class="circle"><mat-icon>verified</mat-icon></div>
              <div class="label">Confirmed</div>
            </div>
            <div class="line" [class.active]="step >= 3"></div>
            
            <div class="step" [class.active]="step >= 3">
              <div class="circle"><mat-icon>local_shipping</mat-icon></div>
              <div class="label">Shipped</div>
            </div>
            <div class="line" [class.active]="step >= 4"></div>
            
            <div class="step" [class.active]="step >= 4">
              <div class="circle"><mat-icon>home</mat-icon></div>
              <div class="label">Delivered</div>
            </div>
          </div>
          
          <div class="cancelled-state" *ngIf="order.status === 'CANCELLED' || order.status === 'RETURNED'">
            <mat-icon color="warn">cancel</mat-icon>
            <p>This order has been {{ order.status | lowercase }}.</p>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="main-layout">
        <!-- Order Items -->
        <mat-card class="items-card">
          <mat-card-header>
            <mat-card-title>Items in Order</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="order-item" *ngFor="let item of order.items">
              <img [src]="item.variant.imageUrl || 'assets/placeholder.png'" class="item-img">
              <div class="item-info">
                <h4>{{ item.variant.name }}</h4>
                <p>SKU: {{ item.variant.sku }}</p>
                <div class="qty-price">
                  <span>Qty: {{ item.quantity }}</span>
                  <span class="price">&#8377; {{ item.unitPrice }}</span>
                </div>
              </div>
              <div class="item-total">
                &#8377; {{ item.unitPrice * item.quantity }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Order Summary & Details -->
        <div class="sidebar">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Order Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-row">
                <span>Items Subtotal</span>
                <span>&#8377; {{ order.totalAmount }}</span>
              </div>
              <div class="summary-row" *ngIf="order.discountAmount">
                <span>Discount</span>
                <span class="discount">- &#8377; {{ order.discountAmount }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <mat-divider style="margin: 16px 0"></mat-divider>
              <div class="summary-row total-row">
                <span>Grand Total</span>
                <span>&#8377; {{ order.totalAmount - (order.discountAmount || 0) }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="shipping-card">
            <mat-card-header>
              <mat-card-title>Shipping Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="address-text">{{ order.shippingAddress }}</p>
              
              <h4 style="margin-top: 16px;">Payment Method</h4>
              <p>{{ order.paymentMethod }}</p>
            </mat-card-content>
            <div class="card-actions" *ngIf="canCancel()">
              <button mat-stroked-button color="warn" class="full-width" (click)="cancelOrder()" [disabled]="isCancelling">
                {{ isCancelling ? 'Cancelling...' : 'Cancel Order' }}
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header-actions { margin-bottom: 16px; margin-left: -16px; }
    
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title-group { display: flex; align-items: center; gap: 16px; }
    .title-group h1 { margin: 0; font-weight: 300; }
    .date-group p { margin: 0; color: #757575; }
    @media (max-width: 600px) { .order-header { flex-direction: column; align-items: flex-start; gap: 8px; } }
    
    /* Stepper Styling */
    .timeline-card { margin-bottom: 24px; padding: 24px; }
    .stepper-horizontal { display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bdbdbd; z-index: 2; }
    .step.active { color: #3f51b5; }
    .circle { width: 48px; height: 48px; border-radius: 50%; background: #f5f5f5; display: flex; justify-content: center; align-items: center; border: 2px solid currentColor; background: white; }
    .label { font-size: 14px; font-weight: 500; }
    .line { flex: 1; height: 4px; background: #eee; margin: 0 -24px; z-index: 1; margin-top: -24px; }
    .line.active { background: #3f51b5; }
    
    .cancelled-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 0; color: #f44336; }
    .cancelled-state mat-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 8px; }
    .cancelled-state p { font-size: 18px; font-weight: 500; margin: 0; }
    
    .main-layout { display: flex; gap: 24px; align-items: flex-start; }
    @media (max-width: 900px) { .main-layout { flex-direction: column; } }
    
    .items-card { flex: 2; padding: 16px; }
    .order-item { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #eee; }
    .order-item:last-child { border-bottom: none; }
    .item-img { width: 80px; height: 80px; object-fit: contain; margin-right: 16px; background: #fafafa; border-radius: 4px; padding: 4px; border: 1px solid #eee; }
    .item-info { flex: 1; }
    .item-info h4 { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; }
    .item-info p { margin: 0 0 8px 0; font-size: 13px; color: #757575; }
    .qty-price { display: flex; gap: 16px; font-size: 14px; color: #616161; }
    .item-total { font-weight: 700; font-size: 18px; color: #212121; }
    
    .sidebar { flex: 1; display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .summary-card, .shipping-card { padding: 16px; }
    mat-card-title { font-size: 18px; margin-bottom: 16px; }
    
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #424242; }
    .discount { color: #f44336; }
    .total-row { font-size: 20px; font-weight: 700; color: #212121; margin-top: 8px; }
    
    .address-text { line-height: 1.6; color: #616161; margin: 0; }
    .card-actions { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #eee; }
    .full-width { width: 100%; }
  `]
})
export class OrderDetailComponent implements OnInit {
  orderService = inject(OrderService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  order: Order | null = null;
  isLoading = true;
  isCancelling = false;
  step = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadOrder(Number(id));
      }
    });
  }

  loadOrder(id: number) {
    this.isLoading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.order = res.data;
          this.calculateStep();
        } else {
          this.router.navigate(['/orders']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  calculateStep() {
    if (!this.order) return;
    switch (this.order.status) {
      case OrderStatus.PLACED: this.step = 1; break;
      case OrderStatus.CONFIRMED: this.step = 2; break;
      case OrderStatus.SHIPPED: this.step = 3; break;
      case OrderStatus.DELIVERED: this.step = 4; break;
      default: this.step = 0; break;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED: return 'warn';
      default: return 'accent';
    }
  }

  canCancel(): boolean {
    return this.order?.status === OrderStatus.PLACED || this.order?.status === OrderStatus.CONFIRMED;
  }

  cancelOrder() {
    if (!this.order || !confirm('Are you sure you want to cancel this order?')) return;
    
    this.isCancelling = true;
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (res) => {
        this.isCancelling = false;
        if (res.success) {
          this.order = res.data;
          this.calculateStep();
          this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
        }
      },
      error: () => this.isCancelling = false
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
