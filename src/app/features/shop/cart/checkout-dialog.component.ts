import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon } from '../../../core/models/models';

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <mat-icon class="header-icon">local_shipping</mat-icon>
      <div>
        <h2 mat-dialog-title>Checkout</h2>
        <p>Complete your order details</p>
      </div>
    </div>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Shipping Address</mat-label>
        <textarea matInput
                  rows="4"
                  placeholder="e.g. 123 MG Road, Srinagar Colony, Mumbai, Maharashtra - 400001"
                  [(ngModel)]="shippingAddress"
                  required>
        </textarea>
        <mat-icon matPrefix>home</mat-icon>
        <mat-hint>Include flat/house no, street, city, state and pincode</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width" style="margin-top: 16px;">
        <mat-label>Payment Method</mat-label>
        <mat-select [(ngModel)]="paymentMethod" required>
          <mat-option value="COD">
            <mat-icon>money</mat-icon> Cash on Delivery (COD)
          </mat-option>
          <mat-option value="UPI">
            <mat-icon>smartphone</mat-icon> UPI
          </mat-option>
          <mat-option value="CARD">
            <mat-icon>credit_card</mat-icon> Credit / Debit Card
          </mat-option>
        </mat-select>
        <mat-icon matPrefix>payment</mat-icon>
      </mat-form-field>

      <!-- Coupon Code Section -->
      <div class="coupon-section" style="margin-top: 16px;">
        <mat-form-field appearance="outline" class="coupon-field">
          <mat-label>Coupon Code</mat-label>
          <input matInput
                 [(ngModel)]="couponCode"
                 placeholder="Enter promo code"
                 [disabled]="!!appliedCoupon"
                 (keyup.enter)="applyCoupon()">
          <mat-icon matPrefix>confirmation_number</mat-icon>
        </mat-form-field>
        <button mat-stroked-button
                color="primary"
                class="apply-btn"
                *ngIf="!appliedCoupon"
                [disabled]="!couponCode.trim() || isValidating"
                (click)="applyCoupon()">
          <mat-spinner *ngIf="isValidating" diameter="18"></mat-spinner>
          <span *ngIf="!isValidating">Apply</span>
        </button>
        <button mat-stroked-button
                color="warn"
                class="apply-btn"
                *ngIf="appliedCoupon"
                (click)="removeCoupon()">
          Remove
        </button>
      </div>

      <!-- Coupon Applied Banner -->
      <div class="coupon-applied" *ngIf="appliedCoupon">
        <mat-icon>check_circle</mat-icon>
        <div>
          <strong>{{ appliedCoupon.code }}</strong> applied!
          <span>{{ appliedCoupon.discountPercentage }}% off
            <span *ngIf="appliedCoupon.maxDiscountAmount">(max &#8377;{{ appliedCoupon.maxDiscountAmount }})</span>
          </span>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary"
              [disabled]="!shippingAddress.trim() || !paymentMethod"
              (click)="confirm()">
        <mat-icon>check_circle</mat-icon> Place Order
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 0;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 16px;
      margin-bottom: 8px;
    }
    .header-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #3f51b5;
      opacity: 0.85;
    }
    .dialog-header h2 {
      margin: 0 0 2px 0;
      font-size: 20px;
      font-weight: 600;
      padding: 0;
    }
    .dialog-header p {
      margin: 0;
      font-size: 13px;
      color: #757575;
    }
    mat-dialog-content {
      padding: 20px 24px !important;
      min-width: 400px;
    }
    .full-width { width: 100%; }

    .coupon-section {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .coupon-field { flex: 1; }
    .apply-btn {
      margin-top: 4px;
      height: 56px;
      min-width: 80px;
    }
    .apply-btn mat-spinner { margin: 0 auto; }

    .coupon-applied {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px 14px;
      border-radius: 8px;
      margin-top: 8px;
      font-size: 13px;
    }
    .coupon-applied mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .coupon-applied strong { margin-right: 4px; }
    .coupon-applied span { opacity: 0.85; }

    mat-dialog-actions {
      padding: 8px 24px 20px !important;
      gap: 12px;
    }
    mat-dialog-actions button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    @media (max-width: 480px) {
      mat-dialog-content { min-width: unset; }
      .coupon-section { flex-direction: column; }
      .apply-btn { width: 100%; height: 40px; }
    }
  `]
})
export class CheckoutDialogComponent {
  private couponService = inject(CouponService);
  private snackBar = inject(MatSnackBar);

  shippingAddress = '';
  paymentMethod = 'COD';
  couponCode = '';
  appliedCoupon: Coupon | null = null;
  isValidating = false;

  constructor(private dialogRef: MatDialogRef<CheckoutDialogComponent>) {}

  applyCoupon() {
    if (!this.couponCode.trim() || this.isValidating) return;
    this.isValidating = true;
    this.couponService.validateCoupon(this.couponCode.trim()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.appliedCoupon = res.data;
          this.couponCode = res.data.code;
          this.snackBar.open(`Coupon "${res.data.code}" applied!`, 'Close', { duration: 3000 });
        }
        this.isValidating = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Invalid coupon code', 'Close', { duration: 3000 });
        this.isValidating = false;
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponCode = '';
  }

  confirm() {
    if (!this.shippingAddress.trim() || !this.paymentMethod) return;
    this.dialogRef.close({
      shippingAddress: this.shippingAddress.trim(),
      paymentMethod: this.paymentMethod,
      couponCode: this.appliedCoupon?.code || null
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
