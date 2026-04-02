import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Coupon } from '../../../../core/models/models';

@Component({
  selector: 'app-coupon-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="dialog-header">
      <mat-icon class="header-icon">local_offer</mat-icon>
      <div>
        <h2 mat-dialog-title>{{ isEdit ? 'Edit Coupon' : 'Create Coupon' }}</h2>
        <p>{{ isEdit ? 'Update coupon details' : 'Add a new discount coupon' }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Coupon Code</mat-label>
        <input matInput [(ngModel)]="form.code" placeholder="e.g. SUMMER25" required style="text-transform: uppercase;">
        <mat-icon matPrefix>tag</mat-icon>
      </mat-form-field>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Discount %</mat-label>
          <input matInput type="number" [(ngModel)]="form.discountPercentage" min="1" max="100" required>
          <mat-icon matPrefix>percent</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Max Discount (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="form.maxDiscountAmount" min="0">
          <mat-icon matPrefix>money</mat-icon>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Min Order Amount (₹)</mat-label>
        <input matInput type="number" [(ngModel)]="form.minOrderAmount" min="0">
        <mat-icon matPrefix>shopping_cart</mat-icon>
        <mat-hint>Leave 0 for no minimum</mat-hint>
      </mat-form-field>

      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Valid From</mat-label>
          <input matInput [matDatepicker]="fromPicker" [(ngModel)]="validFromDate" required>
          <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valid Until</mat-label>
          <input matInput [matDatepicker]="untilPicker" [(ngModel)]="validUntilDate" required>
          <mat-datepicker-toggle matSuffix [for]="untilPicker"></mat-datepicker-toggle>
          <mat-datepicker #untilPicker></mat-datepicker>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!isValid()" (click)="save()">
        <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 0; border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 16px; margin-bottom: 8px;
    }
    .header-icon { font-size: 36px; width: 36px; height: 36px; color: #3f51b5; }
    .dialog-header h2 { margin: 0 0 2px; font-size: 20px; font-weight: 600; padding: 0; }
    .dialog-header p { margin: 0; font-size: 13px; color: #757575; }
    mat-dialog-content { padding: 20px 24px !important; min-width: 400px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    mat-dialog-actions { padding: 8px 24px 20px !important; gap: 12px; }
    mat-dialog-actions button mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
    @media (max-width: 480px) {
      mat-dialog-content { min-width: unset; }
      .row { flex-direction: column; gap: 0; }
    }
  `]
})
export class CouponFormDialogComponent {
  isEdit: boolean;
  form = {
    code: '',
    discountPercentage: 10,
    maxDiscountAmount: null as number | null,
    minOrderAmount: null as number | null,
  };
  validFromDate: Date = new Date();
  validUntilDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  constructor(
    private dialogRef: MatDialogRef<CouponFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { coupon: Coupon | null }
  ) {
    this.isEdit = !!data.coupon;
    if (data.coupon) {
      this.form.code = data.coupon.code;
      this.form.discountPercentage = data.coupon.discountPercentage;
      this.form.maxDiscountAmount = data.coupon.maxDiscountAmount;
      this.form.minOrderAmount = data.coupon.minOrderAmount;
      this.validFromDate = new Date(data.coupon.validFrom);
      this.validUntilDate = new Date(data.coupon.validUntil);
    }
  }

  isValid(): boolean {
    return !!(this.form.code.trim() && this.form.discountPercentage > 0 &&
              this.form.discountPercentage <= 100 && this.validFromDate && this.validUntilDate);
  }

  save() {
    if (!this.isValid()) return;
    this.dialogRef.close({
      code: this.form.code.trim().toUpperCase(),
      discountPercentage: this.form.discountPercentage,
      maxDiscountAmount: this.form.maxDiscountAmount || null,
      minOrderAmount: this.form.minOrderAmount || null,
      validFrom: this.validFromDate.toISOString(),
      validUntil: this.validUntilDate.toISOString()
    });
  }

  cancel() { this.dialogRef.close(null); }
}
