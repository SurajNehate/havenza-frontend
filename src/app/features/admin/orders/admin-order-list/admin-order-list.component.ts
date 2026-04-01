import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderStatus } from '../../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatPaginatorModule, LoadingSpinnerComponent, DatePipe],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="admin-header">
      <div class="header-titles">
        <h1>Order Management</h1>
        <p>Track, process, and update customer orders.</p>
      </div>
    </div>

    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="orders" class="custom-table" *ngIf="orders.length > 0">
          
          <ng-container matColumnDef="orderId">
            <th mat-header-cell *matHeaderCellDef> Order ID </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> #{{ element.id }} </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef> Customer </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="customer-name">{{ element.userName || ('User ' + element.userId) }}</span>
              <br>
              <span class="customer-email">{{ element.userEmail }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{ element.createdAt | date:'mediumDate' }} </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef> Total Amount </th>
            <td mat-cell *matCellDef="let element" class="price-cell"> &#8377; {{ element.totalAmount - (element.discountAmount || 0) }} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <mat-chip [color]="getStatusColor(element.status)" selected>{{ element.status }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-flat-button color="primary" [routerLink]="[element.id]">
                View Details
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-state" *ngIf="orders.length === 0 && !isLoading">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <h3>No orders found</h3>
          <p>You have no customer orders matching the criteria.</p>
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
    .admin-header { margin-bottom: 24px; }
    .header-titles h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 500; }
    .header-titles p { margin: 0; color: #757575; }
    
    .table-card { overflow: hidden; }
    .table-container { padding: 0 !important; }
    .custom-table { width: 100%; border-collapse: collapse; }
    
    .id-cell { font-weight: 500; color: #424242; }
    .customer-name { font-weight: 500; color: #333; }
    .customer-email { font-size: 12px; color: #757575; }
    .price-cell { font-weight: 500; color: #3f51b5; }
    
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: #757575; }
    .empty-icon { font-size: 48px; height: 48px; width: 48px; color: #e0e0e0; margin-bottom: 16px; }
    
    mat-row { transition: background 0.2s; }
    mat-row:hover { background: #fafafa; }
  `]
})
export class AdminOrderListComponent implements OnInit {
  orderService = inject(OrderService);
  router = inject(Router);

  displayedColumns = ['orderId', 'customer', 'date', 'total', 'status', 'actions'];
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
    const apiUrl = this.orderService['apiUrl'].replace('/orders', '/admin/orders');
    this.orderService['http'].get<any>(apiUrl, {
      params: { page: this.pageIndex.toString(), size: this.pageSize.toString() }
    }).subscribe({
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
      case OrderStatus.SHIPPED: return 'accent';
      default: return '';
    }
  }
}
