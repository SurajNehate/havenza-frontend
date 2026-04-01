import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Review, CreateReviewRequest, ApiResponse, PagedResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number, page: number = 0, size: number = 10): Observable<ApiResponse<PagedResponse<Review>>> {
    return this.http.get<ApiResponse<PagedResponse<Review>>>(`${this.apiUrl}/product/${productId}`, {
      params: new HttpParams().set('page', page.toString()).set('size', size.toString())
    });
  }

  addReview(request: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(this.apiUrl, request);
  }

  deleteReview(reviewId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${reviewId}`);
  }
}
