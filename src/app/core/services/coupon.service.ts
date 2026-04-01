import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Coupon, CreateCouponRequest, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  validateCoupon(code: string): Observable<ApiResponse<Coupon>> {
    return this.http.get<ApiResponse<Coupon>>(`${this.apiUrl}/validate/${code}`);
  }

  createCoupon(request: CreateCouponRequest): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(this.apiUrl, request);
  }
}
