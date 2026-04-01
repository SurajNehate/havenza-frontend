import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Banner, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getActiveBanners(): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>(this.apiUrl);
  }

  createBanner(banner: Banner): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>(this.apiUrl, banner);
  }
}
