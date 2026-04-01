import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule
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
    }
  `]
})
export class CheckoutDialogComponent {
  shippingAddress = '';
  paymentMethod = 'COD';

  constructor(private dialogRef: MatDialogRef<CheckoutDialogComponent>) {}

  confirm() {
    if (!this.shippingAddress.trim() || !this.paymentMethod) return;
    this.dialogRef.close({ shippingAddress: this.shippingAddress.trim(), paymentMethod: this.paymentMethod });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
