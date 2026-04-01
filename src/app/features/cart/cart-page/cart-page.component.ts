import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon } from '../../../core/models/models';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatDividerModule],
  template: `
    <div class="container main-content-padding">
      <h1>Shopping Cart</h1>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="(cartService.currentCart()?.items || []).length === 0">
        <mat-icon class="empty-icon">remove_shopping_cart</mat-icon>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button mat-flat-button color="primary" routerLink="/products">Continue Shopping</button>
      </div>

      <!-- Cart Content -->
      <div class="cart-layout" *ngIf="(cartService.currentCart()?.items || []).length > 0">
        
        <!-- Items List -->
        <div class="cart-items-container">
          <mat-card class="cart-item" *ngFor="let item of cartService.currentCart()!.items">
            <div class="item-img-container" [routerLink]="['/products', 'product-details']">
              <img [src]="item.variant.imageUrl || 'assets/placeholder.png'" class="item-img">
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.variant.name }}</h3>
              <p class="item-sku">SKU: {{ item.variant.sku }}</p>
              
              <div class="item-actions">
                <div class="qty-selector">
                  <button mat-icon-button (click)="updateQuantity(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="qty">{{ item.quantity }}</span>
                  <button mat-icon-button (click)="updateQuantity(item.id, item.quantity + 1)" [disabled]="item.quantity >= item.variant.stockQuantity">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                
                <button mat-icon-button color="warn" (click)="removeItem(item.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <div class="item-price">
              <p class="unit-price">&#8377; {{ item.variant.price }} x {{ item.quantity }}</p>
              <h3 class="line-total">&#8377; {{ item.variant.price * item.quantity }}</h3>
            </div>
          </mat-card>
        </div>

        <!-- Order Summary -->
        <div class="summary-container">
          <mat-card class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="coupon-section">
               <mat-form-field appearance="outline" class="coupon-input">
                 <mat-label>Coupon Code</mat-label>
                 <input matInput [(ngModel)]="couponCode" placeholder="Enter code">
               </mat-form-field>
               <button mat-stroked-button color="primary" (click)="applyCoupon()" [disabled]="!couponCode || isApplyingCoupon">
                 Apply
               </button>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row">
              <span>Subtotal</span>
              <span>&#8377; {{ cartSubtotal() }}</span>
            </div>
            
            <div class="summary-row" *ngIf="appliedCoupon">
              <span class="discount-label">Discount ({{ appliedCoupon.code }}) 
                <mat-icon (click)="removeCoupon()" class="remove-coupon">close</mat-icon>
              </span>
              <span class="discount-amount">- &#8377; {{ discountAmount() }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row total-row">
              <span>Total</span>
              <span>&#8377; {{ cartTotal() }}</span>
            </div>
            
            <button mat-flat-button color="primary" class="checkout-btn" (click)="proceedToCheckout()">
              Proceed to Checkout
            </button>
            
            <button mat-button class="clear-cart-btn" color="warn" (click)="clearCart()">
              Clear Cart
            </button>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { margin-bottom: 24px; font-weight: 300; }
    
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; text-align: center; background: #fafafa; border-radius: 8px;
    }
    .empty-icon { font-size: 64px; height: 64px; width: 64px; color: #bdbdbd; margin-bottom: 16px; }
    
    .cart-layout { display: flex; gap: 32px; align-items: flex-start; }
    @media (max-width: 900px) { .cart-layout { flex-direction: column; } }
    
    .cart-items-container { flex: 2; display: flex; flex-direction: column; gap: 16px; }
    .cart-item { display: flex; flex-direction: row; padding: 16px; }
    @media (max-width: 600px) { .cart-item { flex-direction: column; position: relative; } }
    
    .item-img-container { width: 100px; height: 100px; background: #fafafa; flex-shrink: 0; margin-right: 16px; cursor: pointer; }
    .item-img { width: 100%; height: 100%; object-fit: contain; }
    
    .item-details { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .item-name { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; }
    .item-sku { font-size: 13px; color: #757575; margin: 0 0 16px 0; }
    
    .item-actions { display: flex; align-items: center; justify-content: space-between; max-width: 200px; }
    .qty-selector { display: flex; align-items: center; border: 1px solid #e0e0e0; border-radius: 4px; }
    .qty { min-width: 32px; text-align: center; font-weight: 500; }
    
    .item-price { text-align: right; min-width: 120px; display: flex; flex-direction: column; justify-content: flex-end; }
    .unit-price { font-size: 13px; color: #757575; margin: 0 0 4px 0; }
    .line-total { margin: 0; font-size: 18px; font-weight: 700; color: #3f51b5; }
    
    .summary-container { flex: 1; position: sticky; top: 80px; width: 100%; }
    .summary-card { padding: 24px; }
    .summary-card h3 { margin: 0 0 24px 0; font-size: 20px; font-weight: 500; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    
    .coupon-section { display: flex; gap: 8px; margin-bottom: 24px; align-items: flex-start; }
    .coupon-input { flex: 1; }
    .coupon-section button { height: 50px; margin-top: 4px; }
    
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; }
    .discount-label { display: flex; align-items: center; color: #4caf50; }
    .remove-coupon { font-size: 16px; height: 16px; width: 16px; cursor: pointer; margin-left: 8px; opacity: 0.7; }
    .discount-amount { color: #f44336; font-weight: 500; }
    
    .total-row { font-size: 20px; font-weight: 700; margin-top: 8px; color: #212121; }
    
    .checkout-btn { width: 100%; padding: 8px 0; font-size: 16px; margin-top: 24px; }
    .clear-cart-btn { width: 100%; margin-top: 12px; }
  `]
})
export class CartPageComponent implements OnInit {
  cartService = inject(CartService);
  couponService = inject(CouponService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  couponCode = '';
  appliedCoupon: Coupon | null = null;
  isApplyingCoupon = false;

  ngOnInit() {
    this.cartService.getCart().subscribe();
    
    // Check if we already applied a coupon in a previous state
    const savedCoupon = sessionStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      this.appliedCoupon = JSON.parse(savedCoupon);
    }
  }

  updateQuantity(itemId: number, quantity: number) {
    this.cartService.updateItemQuantity(itemId, quantity).subscribe();
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe();
  }

  clearCart() {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      this.cartService.clearCart().subscribe();
      this.removeCoupon();
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
    
    if (this.appliedCoupon.minOrderAmount && subtotal < this.appliedCoupon.minOrderAmount) {
      this.removeCoupon();
      this.snackBar.open('Cart total no longer meets coupon minimum', 'Close', { duration: 3000 });
      return 0;
    }

    let discount = subtotal * (this.appliedCoupon.discountPercentage / 100);
    if (this.appliedCoupon.maxDiscountAmount && discount > this.appliedCoupon.maxDiscountAmount) {
      discount = this.appliedCoupon.maxDiscountAmount;
    }
    return discount;
  }

  cartTotal(): number {
    return this.cartSubtotal() - this.discountAmount();
  }

  applyCoupon() {
    if (!this.couponCode) return;
    
    this.isApplyingCoupon = true;
    this.couponService.validateCoupon(this.couponCode).subscribe({
      next: (res) => {
        this.isApplyingCoupon = false;
        if (res.success && res.data) {
          
          if (res.data.minOrderAmount && this.cartSubtotal() < res.data.minOrderAmount) {
            this.snackBar.open(`Minimum order amount of ₹${res.data.minOrderAmount} required`, 'Close', { duration: 3000 });
            return;
          }

          this.appliedCoupon = res.data;
          sessionStorage.setItem('appliedCoupon', JSON.stringify(res.data));
          this.snackBar.open('Coupon applied successfully!', 'Close', { duration: 3000 });
          this.couponCode = '';
        }
      },
      error: () => {
        this.isApplyingCoupon = false;
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon = null;
    sessionStorage.removeItem('appliedCoupon');
  }

  proceedToCheckout() {
    if ((this.cartService.currentCart()?.items || []).length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}
