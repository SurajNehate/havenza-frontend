import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, Coupon } from '../../../../core/models/models';
import { CouponFormDialogComponent } from './coupon-form-dialog.component';

@Component({
  selector: 'app-admin-coupon-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatSlideToggleModule, MatTooltipModule, DatePipe
  ],
  template: `
    <div class="page-header">
      <div class="header-titles">
        <h1>Coupon Management</h1>
        <p>Create and manage discount coupons for your store</p>
      </div>
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon> Create Coupon
      </button>
    </div>

    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="coupons" class="custom-table" *ngIf="coupons.length > 0">

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef> Code </th>
            <td mat-cell *matCellDef="let el"> <strong class="coupon-code">{{ el.code }}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="discount">
            <th mat-header-cell *matHeaderCellDef> Discount </th>
            <td mat-cell *matCellDef="let el">
              {{ el.discountPercentage }}% off
              <span class="sub-text" *ngIf="el.maxDiscountAmount">(max ₹{{ el.maxDiscountAmount }})</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="minOrder">
            <th mat-header-cell *matHeaderCellDef> Min Order </th>
            <td mat-cell *matCellDef="let el">
              {{ el.minOrderAmount ? '₹' + el.minOrderAmount : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="validity">
            <th mat-header-cell *matHeaderCellDef> Validity </th>
            <td mat-cell *matCellDef="let el">
              {{ el.validFrom | date:'mediumDate' }} — {{ el.validUntil | date:'mediumDate' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let el">
              <mat-slide-toggle [checked]="el.active" (change)="toggleActive(el)" color="primary"
                                [matTooltip]="el.active ? 'Deactivate' : 'Activate'">
              </mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let el" class="actions-cell">
              <button mat-icon-button color="primary" matTooltip="Edit" (click)="openEditDialog(el)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteCoupon(el)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="empty-state" *ngIf="coupons.length === 0">
          <mat-icon>local_offer</mat-icon>
          <p>No coupons yet. Create your first coupon!</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 500; color: var(--text-primary); }
    .page-header p { margin: 0; color: var(--text-secondary); }
    .page-header button mat-icon { margin-right: 6px; }
    .table-card { border-radius: 12px; border: 1px solid var(--border-color); box-shadow: none; background: var(--bg-card); }
    .table-container { padding: 0 !important; overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .coupon-code { font-family: 'Roboto Mono', monospace; letter-spacing: 1px; color: #3f51b5; }
    .sub-text { font-size: 12px; color: var(--text-secondary); }
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; white-space: nowrap; }
    .empty-state { padding: 60px 24px; text-align: center; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; margin-bottom: 12px; }
    .empty-state p { margin: 0; font-size: 15px; }
    tr.mat-mdc-row:hover { background: rgba(63, 81, 181, 0.04); }
  `]
})
export class AdminCouponListComponent implements OnInit {
  http = inject(HttpClient);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  apiUrl = `${environment.apiUrl}/admin/coupons`;
  displayedColumns = ['code', 'discount', 'minOrder', 'validity', 'status', 'actions'];
  coupons: Coupon[] = [];

  ngOnInit() { this.loadCoupons(); }

  loadCoupons() {
    this.http.get<ApiResponse<Coupon[]>>(this.apiUrl).subscribe(res => {
      if (res.success) this.coupons = res.data;
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CouponFormDialogComponent, {
      width: '520px', data: { coupon: null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post<ApiResponse<Coupon>>(this.apiUrl, result).subscribe({
          next: () => { this.loadCoupons(); this.snackBar.open('Coupon created!', 'Close', { duration: 3000 }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed to create', 'Close', { duration: 3000 })
        });
      }
    });
  }

  openEditDialog(coupon: Coupon) {
    const dialogRef = this.dialog.open(CouponFormDialogComponent, {
      width: '520px', data: { coupon }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.put<ApiResponse<Coupon>>(`${this.apiUrl}/${coupon.id}`, result).subscribe({
          next: () => { this.loadCoupons(); this.snackBar.open('Coupon updated!', 'Close', { duration: 3000 }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed to update', 'Close', { duration: 3000 })
        });
      }
    });
  }

  toggleActive(coupon: Coupon) {
    this.http.patch<ApiResponse<Coupon>>(`${this.apiUrl}/${coupon.id}/toggle`, {}).subscribe({
      next: () => { this.loadCoupons(); },
      error: () => this.snackBar.open('Failed to toggle status', 'Close', { duration: 3000 })
    });
  }

  deleteCoupon(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${coupon.id}`).subscribe({
      next: () => { this.loadCoupons(); this.snackBar.open('Coupon deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
    });
  }
}
