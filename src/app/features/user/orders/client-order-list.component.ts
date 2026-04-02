import { Component, OnInit, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-client-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatPaginatorModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-container">
      <div class="header-section">
        <h1>Order History</h1>
        <p>View your recent orders and track their status.</p>
      </div>

      <mat-card class="table-card" *ngIf="orders.length > 0; else emptyOrders">
        <table mat-table [dataSource]="orders" class="orders-table" multiTemplateDataRows>
          
          <ng-container matColumnDef="orderId">
            <th mat-header-cell *matHeaderCellDef> Order ID </th>
            <td mat-cell *matCellDef="let order" class="order-id"> #HVZ-{{ order.id }} </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let order"> {{ order.createdAt | date:'mediumDate' }} </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef> Total Amount </th>
            <td mat-cell *matCellDef="let order" class="total-amount"> &#8377; {{ order.totalAmount }} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let order">
              <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let order" class="action-cell">
               <button mat-stroked-button color="primary" (click)="expandedOrder = expandedOrder === order ? null : order; $event.stopPropagation()">
                 {{ expandedOrder === order ? 'Hide Details' : 'View Details' }}
               </button>
            </td>
          </ng-container>

          <!-- Expanded Content Column -->
          <ng-container matColumnDef="expandedDetail">
            <td mat-cell *matCellDef="let order" [attr.colspan]="displayedColumns.length">
              <div class="order-detail" [@detailExpand]="order == expandedOrder ? 'expanded' : 'collapsed'">
                <div class="detail-container">
                  <h4>Items in this order</h4>
                  <div class="item-list">
                    <div class="order-item" *ngFor="let item of order.items">
                      <img [src]="item.variant?.imageUrl || 'assets/placeholder.png'" 
                           appImgFallback="product"
                           class="item-img" alt="Product Image">
                      <div class="item-info">
                        <h5>{{ item.variant?.productName || item.variant?.name || 'Product' }}</h5>
                        <span class="variant-name">Variant: {{ item.variant?.name }}</span>
                        <span class="qty">Qty: {{ item.quantity }} &times; &#8377;{{ item.unitPrice }}</span>
                      </div>
                      <div class="item-total">
                         &#8377;{{ item.quantity * item.unitPrice }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="order-summary-box">
                    <p><strong>Shipping Address:</strong> {{ order.shippingAddress }}</p>
                    <p><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
                    <p *ngIf="order.discountAmount > 0" style="color: #c62828;">
                       <strong>Discount Applied:</strong> -&#8377;{{ order.discountAmount }}
                    </p>
                  </div>
                </div>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let order; columns: displayedColumns;"
                   class="order-row"
                   [class.expanded-row]="expandedOrder === order"
                   (click)="expandedOrder = expandedOrder === order ? null : order">
          </tr>
          <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="detail-row"></tr>
        </table>

        <mat-paginator [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" 
                       (page)="onPageChange($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
      
      <ng-template #emptyOrders>
        <div class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
          <button mat-flat-button color="primary" routerLink="/products" style="margin-top: 24px;">Start Shopping</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; min-height: 80vh; }
    
    .header-section { margin-bottom: 32px; }
    .header-section h1 { font-size: 32px; font-weight: 300; margin: 0 0 8px 0; color: var(--text-primary); }
    .header-section p { color: var(--text-secondary); margin: 0; }
    
    .table-card { border-radius: 12px; overflow: hidden; background: var(--bg-card); box-shadow: var(--shadow-sm); }
    .orders-table { width: 100%; background: transparent; }
    
    mat-header-cell { font-weight: 600; color: var(--text-secondary); font-size: 14px; }
    mat-cell { color: var(--text-primary); font-size: 14px; }
    
    .order-id { font-weight: 600; color: #3f51b5; }
    .total-amount { font-weight: 500; }
    
    .action-cell { justify-content: flex-end; text-align: right; }
    
    .status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-placed { background: #e3f2fd; color: #1976d2; }
    .status-confirmed, .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-shipped { background: #fff3e0; color: #f57c00; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .status-returned { background: #f3e5f5; color: #7b1fa2; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; background: var(--bg-card); border-radius: 12px; text-align: center; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--text-secondary); margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 24px; margin: 0 0 8px 0; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); margin: 0; }
    
    /* Expandable Row Styles */
    .orders-table .mat-row { border-bottom-width: 0; }
    .orders-table .detail-row { height: 0; min-height: 0; }
    .order-row { cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.05) !important; transition: background 0.2s; }
    .order-row:hover { background: rgba(0,0,0,0.02); }
    .expanded-row { background: rgba(0,0,0,0.02); }
    
    .order-detail { overflow: hidden; width: 100%; display: flex; }
    .detail-container { padding: 24px 16px; width: 100%; box-sizing: border-box; background: var(--bg-card); border-bottom: 1px solid rgba(0,0,0,0.05); }
    .detail-container h4 { margin: 0 0 16px 0; color: var(--text-primary); font-size: 16px; font-weight: 500; }
    
    .item-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .order-item { display: flex; align-items: center; gap: 16px; padding: 12px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; }
    .item-img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; background: #f5f5f5; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-info h5 { margin: 0 0 4px 0; font-size: 15px; color: var(--text-primary); }
    .variant-name { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
    .qty { font-size: 13px; color: var(--text-primary); font-weight: 500; }
    .item-total { font-weight: 600; font-size: 16px; color: var(--text-primary); }
    
    .order-summary-box { background: rgba(0,0,0,0.02); padding: 16px; border-radius: 8px; border: 1px dashed rgba(0,0,0,0.1); }
    .order-summary-box p { margin: 0 0 8px 0; font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
    .order-summary-box p:last-child { margin-bottom: 0; }
    .order-summary-box strong { color: var(--text-primary); }

    /* Mobile Responsiveness */
    @media (max-width: 600px) {
      .page-container { padding: 40px 16px; }
      .header-section h1 { font-size: 24px; }
      
      /* Hide date and actions on mobile to save space */
      .mat-column-date, .mat-column-actions { display: none !important; }
      
      .mat-cell, .mat-header-cell { padding: 8px !important; }
      .order-id { font-size: 13px; }
      
      .detail-container { padding: 16px 12px; }
      .order-item { flex-direction: column; align-items: flex-start; }
      .item-img { width: 100%; height: 180px; }
      .item-total { width: 100%; text-align: right; margin-top: 8px; border-top: 1px dotted rgba(0,0,0,0.1); padding-top: 8px; }
    }
  `],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ClientOrderListComponent implements OnInit {
  orderService = inject(OrderService);
  
  orders: Order[] = [];
  isLoading = true;
  expandedOrder: Order | null = null;
  
  displayedColumns = ['orderId', 'date', 'total', 'status', 'actions'];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrders(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
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

  getStatusClass(status: string): string {
    switch(status) {
      case 'PLACED': return 'status-placed';
      case 'CONFIRMED': return 'status-confirmed';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      case 'RETURNED': return 'status-returned';
      default: return 'status-placed';
    }
  }
}
