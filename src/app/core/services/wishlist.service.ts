import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Wishlist, ApiResponse, PagedResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/wishlists`;

  wishlistItems = signal<Wishlist[]>([]);

  constructor(private http: HttpClient) {}

  getWishlist(page: number = 0, size: number = 50): Observable<ApiResponse<PagedResponse<Wishlist>>> {
    return this.http.get<ApiResponse<PagedResponse<Wishlist>>>(this.apiUrl, {
      params: new HttpParams().set('page', page.toString()).set('size', size.toString())
    }).pipe(
      tap(res => {
        if (res.success) this.wishlistItems.set(res.data.content);
      })
    );
  }

  addToWishlist(productId: number): Observable<ApiResponse<Wishlist>> {
    return this.http.post<ApiResponse<Wishlist>>(`${this.apiUrl}/${productId}`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistItems.update(items => [res.data, ...items]);
        }
      })
    );
  }

  removeFromWishlist(productId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${productId}`).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistItems.update(items => items.filter(w => w.product.id !== productId));
        }
      })
    );
  }

  isWishlisted(productId: number): boolean {
    return this.wishlistItems().some(w => w.product.id === productId);
  }
}
