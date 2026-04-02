import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CheckoutDialogComponent } from './checkout-dialog.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="page-container">
      <h1 class="page-title">Shopping Cart</h1>
      
      <div class="cart-layout" *ngIf="cart && cart.items.length > 0; else emptyCart">
        
        <!-- Cart Items -->
        <div class="items-column">
          <mat-card class="cart-item" *ngFor="let item of cart.items">
            <div class="item-visual" [routerLink]="['/products', item.variant.productSlug]">
              <img [src]="item.variant.imageUrl || 'assets/placeholder.png'" 
                   appImgFallback
                   alt="Product Image">
            </div>
            
            <div class="item-details">
              <h3 [routerLink]="['/products', item.variant.productSlug]">{{ item.variant.productName }}</h3>
              <p class="variant-name">Variant: {{ item.variant.name }}</p>
              <div class="price-row">
                <span class="price">&#8377; {{ item.variant.price }}</span>
              </div>
            </div>
            
            <div class="item-actions">
              <div class="qty-controls">
                <button mat-icon-button (click)="updateQty(item, -1)" [disabled]="item.quantity <= 1">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="qty">{{ item.quantity }}</span>
                <button mat-icon-button (click)="updateQty(item, 1)" [disabled]="item.quantity >= item.variant.stockQuantity">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              
              <button mat-icon-button color="warn" matTooltip="Remove" (click)="removeItem(item)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card>
        </div>
        
        <!-- Order Summary -->
        <div class="summary-column">
          <mat-card class="summary-card">
            <h2>Order Summary</h2>
            <mat-divider></mat-divider>
            
            <div class="summary-row">
              <span>Subtotal ({{ totalItems }} items)</span>
              <span>&#8377; {{ subtotal }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-shipping">Free</span>
            </div>
            <div class="summary-row">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row total-row">
              <span>Total</span>
              <span>&#8377; {{ subtotal }}</span>
            </div>
            
            <button mat-flat-button color="primary" class="checkout-btn" (click)="proceedToCheckout()">
              Proceed to Checkout
            </button>
            
            <p class="secure-checkout"><mat-icon>lock</mat-icon> Secure Checkout</p>
          </mat-card>
        </div>
        
      </div>
      
      <ng-template #emptyCart>
        <div class="empty-state">
           <mat-icon>shopping_basket</mat-icon>
           <h2>Your cart is empty</h2>
           <p>Looks like you haven't added anything to your cart yet.</p>
           <button mat-flat-button color="primary" routerLink="/products">Continue Shopping</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; min-height: 80vh; }
    .page-title { font-size: 32px; font-weight: 300; margin-bottom: 32px; color: var(--text-primary); }
    
    .cart-layout { display: flex; gap: 32px; align-items: flex-start; }
    @media (max-width: 900px) { .cart-layout { flex-direction: column; } }
    
    .items-column { flex: 2; display: flex; flex-direction: column; gap: 16px; }
    
    .cart-item { display: flex; flex-direction: row; padding: 16px; align-items: center; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: none; background: var(--bg-card); gap: 24px; }
    .item-visual { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; background: #fff; border: 1px solid var(--border-color); cursor: pointer; display: flex; justify-content: center; align-items: center; padding: 8px; flex-shrink: 0; }
    .item-visual img { max-width: 100%; max-height: 100%; object-fit: contain; }
    
    .item-details { flex: 1; min-width: 0; }
    .item-details h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 500; cursor: pointer; color: var(--text-primary); }
    .item-details h3:hover { color: #3f51b5; }
    .variant-name { margin: 0 0 8px 0; font-size: 14px; color: var(--text-secondary); }
    .price-row { font-size: 18px; font-weight: 600; color: #ffca28; }
    
    .item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
    .qty-controls { display: inline-flex; align-items: center; background: var(--bg-secondary); border-radius: 24px; padding: 4px; }
    .qty { width: 30px; text-align: center; font-weight: 500; font-size: 14px; color: var(--text-primary); }
    
    .summary-column { flex: 1; width: 100%; }
    .summary-card { padding: 24px; border-radius: 12px; background: var(--bg-card); position: sticky; top: 88px; border: 1px solid var(--border-color); box-shadow: none; }
    .summary-card h2 { margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: var(--text-primary); }
    mat-divider { margin: 16px 0; }
    
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: var(--text-secondary); font-size: 15px; }
    .free-shipping { color: #2e7d32; font-weight: 500; }
    .total-row { font-size: 20px; font-weight: 600; color: var(--text-primary); margin-top: 8px; }
    
    .checkout-btn { width: 100%; height: 50px; font-size: 16px; border-radius: 25px; margin-top: 24px; margin-bottom: 16px; }
    .secure-checkout { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-secondary); font-size: 13px; margin: 0; }
    .secure-checkout mat-icon { font-size: 16px; width: 16px; height: 16px; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; text-align: center; background: var(--bg-card); border-radius: 12px; }
    .empty-state mat-icon { font-size: 80px; width: 80px; height: 80px; color: var(--text-secondary); opacity: 0.5; margin-bottom: 24px; }
    .empty-state h2 { margin: 0 0 8px 0; font-size: 24px; color: var(--text-primary); }
    .empty-state p { margin: 0 0 24px 0; color: var(--text-secondary); }
  `]
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  dialog = inject(MatDialog);
  
  cart: Cart | null = null;
  isLoading = true;
  subtotal = 0;
  totalItems = 0;

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cart = res.data;
          this.calculateTotals();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  calculateTotals() {
    if (!this.cart) return;
    this.totalItems = this.cart.items.reduce((acc, item) => acc + item.quantity, 0);
    this.subtotal = this.cart.items.reduce((acc, item) => acc + (item.quantity * item.variant.price), 0);
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.variant.stockQuantity) return;
    
    this.isLoading = true;
    this.cartService.updateItemQuantity(item.id, newQty).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cart = res.data;
          this.calculateTotals();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  removeItem(item: CartItem) {
    this.isLoading = true;
    this.cartService.removeItem(item.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cart = res.data;
          this.calculateTotals();
          this.snackBar.open('Item removed from cart', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  proceedToCheckout() {
    const dialogRef = this.dialog.open(CheckoutDialogComponent, {
      width: '480px',
      disableClose: true,
      panelClass: 'checkout-dialog-panel'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return; // user cancelled

      this.isLoading = true;
      const req = {
        shippingAddress: result.shippingAddress,
        paymentMethod: result.paymentMethod,
      };

      const apiUrl = this.cartService['apiUrl'].replace('/cart', '/orders');
      this.cartService['http'].post(apiUrl, req).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.snackBar.open('Order placed successfully! 🎉', 'Close', { duration: 4000 });
            this.cartService.clearCartLocal();
            this.router.navigate(['/orders']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Unable to complete checkout. Please try again.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    });
  }
}
