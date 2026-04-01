import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Order, PlaceOrderRequest, ApiResponse, PagedResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(request: PlaceOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, request);
  }

  getOrders(page: number = 0, size: number = 10): Observable<ApiResponse<PagedResponse<Order>>> {
    return this.http.get<ApiResponse<PagedResponse<Order>>>(this.apiUrl, {
      params: new HttpParams().set('page', page.toString()).set('size', size.toString())
    });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
