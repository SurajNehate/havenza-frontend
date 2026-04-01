import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Cart, AddToCartRequest, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  
  currentCart = signal<Cart | null>(null);
  
  cartItemCount = computed(() => {
    const cart = this.currentCart();
    return cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  });

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) this.currentCart.set(res.data);
      })
    );
  }

  addItem(request: AddToCartRequest): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/items`, request).pipe(
      tap(res => {
        if (res.success) this.currentCart.set(res.data);
      })
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/items/${itemId}?quantity=${quantity}`, {}).pipe(
      tap(res => {
        if (res.success) this.currentCart.set(res.data);
      })
    );
  }

  removeItem(itemId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(res => {
        if (res.success) this.currentCart.set(res.data);
      })
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) this.currentCart.set(null);
      })
    );
  }

  clearCartLocal(): void {
    this.currentCart.set(null);
  }
}
