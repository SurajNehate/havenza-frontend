import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentMethod, Coupon } from '../../../core/models/models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatRadioModule, MatDividerModule],
  template: `
    <div class="container main-content-padding">
      <div class="header">
        <h1>Checkout</h1>
      </div>

      <div class="checkout-layout">
        <!-- Forms Section -->
        <div class="forms-section">
          <!-- Shipping Address Form -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>1. Shipping Address</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="addressForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="fullName" placeholder="John Doe">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Street Address</mat-label>
                  <input matInput formControlName="street" placeholder="123 Main St">
                </mat-form-field>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state">
                  </mat-form-field>
                </div>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>PIN Code / Zip</mat-label>
                    <input matInput formControlName="pincode">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone">
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Payment Method Form -->
          <mat-card class="form-card payment-card">
            <mat-card-header>
              <mat-card-title>2. Payment Method</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-radio-group [(ngModel)]="selectedPaymentMethod" class="payment-radio-group">
                <mat-radio-button value="UPI">UPI (GPay, PhonePe, Paytm)</mat-radio-button>
                <mat-radio-button value="CARD">Credit / Debit Card</mat-radio-button>
                <mat-radio-button value="COD">Cash on Delivery</mat-radio-button>
              </mat-radio-group>
              
              <!-- Mock Credit Card Form fields if CARD is selected -->
              <div class="card-details" *ngIf="selectedPaymentMethod === 'CARD'">
                <p class="mock-warning">Note: This is a simulation. Do not enter real card details.</p>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Card Number</mat-label>
                  <input matInput placeholder="0000 0000 0000 0000">
                </mat-form-field>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Expiry (MM/YY)</mat-label>
                    <input matInput placeholder="12/26">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>CVV</mat-label>
                    <input matInput type="password" placeholder="123">
                  </mat-form-field>
                </div>
              </div>

              <!-- Mock UPI form -->
              <div class="card-details" *ngIf="selectedPaymentMethod === 'UPI'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>UPI ID</mat-label>
                  <input matInput placeholder="user@okicici">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Order Summary Readonly -->
        <div class="summary-section">
          <mat-card class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="items-preview">
              <div class="preview-item" *ngFor="let item of cartService.currentCart()?.items">
                <span class="preview-name">{{ item.quantity }}x {{ item.variant.name | slice:0:20 }}...</span>
                <span class="preview-price">&#8377; {{ item.quantity * item.variant.price }}</span>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row">
              <span>Subtotal</span>
              <span>&#8377; {{ cartSubtotal() }}</span>
            </div>
            
            <div class="summary-row" *ngIf="appliedCoupon">
              <span class="discount-label">Discount ({{ appliedCoupon.code }})</span>
              <span class="discount-amount">- &#8377; {{ discountAmount() }}</span>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row total-row">
              <span>Total Pay</span>
              <span>&#8377; {{ cartTotal() }}</span>
            </div>
            
            <button mat-flat-button color="primary" class="place-order-btn" 
                    [disabled]="addressForm.invalid || isPlacingOrder" 
                    (click)="placeOrder()">
              {{ isPlacingOrder ? 'Processing...' : 'Place Order' }}
            </button>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    .header h1 { margin: 0; font-weight: 300; }
    
    .checkout-layout { display: flex; gap: 32px; align-items: flex-start; }
    @media (max-width: 900px) { .checkout-layout { flex-direction: column; } }
    
    .forms-section { flex: 2; display: flex; flex-direction: column; gap: 24px; }
    .form-card { padding: 16px; }
    mat-card-title { margin-bottom: 16px; font-size: 18px; color: #3f51b5; }
    
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; width: 100%; }
    .half-width { flex: 1; }
    @media (max-width: 600px) { .form-row { flex-direction: column; gap: 0; } }
    
    .payment-radio-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    
    .card-details { padding: 16px; background: #fafafa; border: 1px dashed #ccc; border-radius: 8px; margin-top: 16px; }
    .mock-warning { color: #f44336; font-size: 13px; margin-top: 0; margin-bottom: 16px; font-weight: 500; }
    
    .summary-section { flex: 1; position: sticky; top: 80px; width: 100%; }
    .summary-card { padding: 24px; }
    .summary-card h3 { margin: 0 0 16px 0; font-size: 20px; font-weight: 500; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    
    .items-preview { max-height: 200px; overflow-y: auto; margin-bottom: 16px; padding-right: 8px; }
    .preview-item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #616161; }
    .preview-name { flex: 1; }
    
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; }
    .discount-label { color: #4caf50; }
    .discount-amount { color: #f44336; font-weight: 500; }
    
    .total-row { font-size: 20px; font-weight: 700; margin-top: 8px; color: #212121; }
    
    .place-order-btn { width: 100%; padding: 12px 0; font-size: 18px; margin-top: 24px; }
  `]
})
export class CheckoutPageComponent implements OnInit {
  fb = inject(FormBuilder);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  addressForm = this.fb.group({
    fullName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', Validators.required],
    phone: ['', Validators.required]
  });

  selectedPaymentMethod: PaymentMethod | string = 'UPI';
  appliedCoupon: Coupon | null = null;
  isPlacingOrder = false;

  ngOnInit() {
    const savedCoupon = sessionStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      this.appliedCoupon = JSON.parse(savedCoupon);
    }

    if ((this.cartService.currentCart()?.items || []).length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  cartSubtotal(): number {
    const cart = this.cartService.currentCart();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + (item.quantity * item.variant.price), 0);
  }

  discountAmount(): number {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.cartSubtotal();
    let discount = subtotal * (this.appliedCoupon.discountPercentage / 100);
    if (this.appliedCoupon.maxDiscountAmount && discount > this.appliedCoupon.maxDiscountAmount) {
      discount = this.appliedCoupon.maxDiscountAmount;
    }
    return discount;
  }

  cartTotal(): number {
    return this.cartSubtotal() - this.discountAmount();
  }

  placeOrder() {
    if (this.addressForm.invalid) return;

    this.isPlacingOrder = true;
    
    // Format full address
    const v = this.addressForm.value;
    const fullAddress = `${v.fullName}, ${v.street}, ${v.city}, ${v.state} - ${v.pincode}. Phone: ${v.phone}`;

    const request = {
      shippingAddress: fullAddress,
      paymentMethod: this.selectedPaymentMethod as PaymentMethod,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : undefined
    };

    this.orderService.placeOrder(request).subscribe({
      next: (res) => {
        this.isPlacingOrder = false;
        if (res.success) {
          sessionStorage.removeItem('appliedCoupon');
          // Update cart state (since order completes checkout, cart is implicitly cleared on backend)
          this.cartService.clearCart().subscribe();
          
          this.snackBar.open('Order placed successfully!', 'Close', { duration: 5000 });
          this.router.navigate(['/orders', res.data.id]);
        }
      },
      error: () => this.isPlacingOrder = false
    });
  }
}
