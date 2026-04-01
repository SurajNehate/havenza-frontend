import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http: HttpClient;

  // We inject HttpBackend directly to create a new HttpClient that bypasses
  // all application interceptors (like AuthInterceptor) because Cloudinary 
  // API requests must not contain our application's JWT header.
  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  uploadImage(file: File): Observable<string> {
    const cloudName = environment.cloudinary.cloudName;
    const uploadPreset = environment.cloudinary.uploadPreset;
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    return this.http.post<any>(url, formData).pipe(
      map(response => response.secure_url)
    );
  }
}
