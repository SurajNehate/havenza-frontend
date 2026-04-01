import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, Coupon } from '../../../../core/models/models';

@Component({
  selector: 'app-admin-coupon-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, DatePipe],
  template: `
    <div class="page-header">
      <div class="header-titles">
        <h1>Coupon Management</h1>
        <p>Manage discount coupons</p>
      </div>
    </div>
    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="coupons" class="custom-table" *ngIf="coupons.length > 0">
          
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef> Code </th>
            <td mat-cell *matCellDef="let element"> <strong>{{ element.code }}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="discount">
            <th mat-header-cell *matHeaderCellDef> Discount </th>
            <td mat-cell *matCellDef="let element"> {{ element.discountPercentage }}% (Max ₹{{ element.maxDiscountAmount }}) </td>
          </ng-container>

          <ng-container matColumnDef="validity">
            <th mat-header-cell *matHeaderCellDef> Validity </th>
            <td mat-cell *matCellDef="let element"> 
                {{ element.validFrom | date:'shortDate' }} - {{ element.validUntil | date:'shortDate' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [color]="element.active ? 'primary' : 'warn'" selected>
                {{ element.active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-state" *ngIf="coupons.length === 0">
           No coupons found.
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 500; }
    .page-header p { margin: 0; color: var(--text-secondary, #757575); }
    .table-container { padding: 0 !important; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; }
    .empty-state { padding: 40px; text-align: center; color: #757575; }
    mat-row:hover { background: #fafafa; }
  `]
})
export class AdminCouponListComponent implements OnInit {
  http = inject(HttpClient);
  displayedColumns = ['code', 'discount', 'validity', 'status', 'actions'];
  coupons: Coupon[] = [];

  ngOnInit() {
    this.http.get<ApiResponse<Coupon[]>>(`${environment.apiUrl}/admin/coupons`).subscribe(res => {
      if (res.success) {
        this.coupons = res.data;
      }
    });
  }
}
