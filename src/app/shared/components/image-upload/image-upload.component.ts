import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="upload-container" 
         (dragover)="onDragOver($event)" 
         (dragleave)="onDragLeave($event)" 
         (drop)="onDrop($event)"
         [class.is-dragover]="isDragover">
         
      <div *ngIf="previewUrl && !isUploading" class="preview-area">
        <img [src]="previewUrl" alt="Preview Image" class="preview-img" />
        <button type="button" mat-icon-button color="warn" class="remove-btn" (click)="removeImage($event)">
          <mat-icon>delete</mat-icon>
        </button>
      </div>

      <div *ngIf="!previewUrl && !isUploading" class="drop-area">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p>Drag & Drop your image here</p>
        <span class="or-text">- or -</span>
        <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()">
          Browse Files
        </button>
      </div>

      <div *ngIf="isUploading" class="uploading-state">
        <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
        <p>Uploading... {{uploadProgress}}%</p>
      </div>

      <input type="file" #fileInput hidden accept="image/*" (change)="onFileSelected($event)">
    </div>
  `,
  styles: [`
    .upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
      background: #fafafa;
      position: relative;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .upload-container.is-dragover {
      background: #e3f2fd;
      border-color: #2196f3;
    }
    .upload-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #757575;
      margin-bottom: 16px;
    }
    .drop-area p { margin: 8px 0; color: #616161; }
    .or-text { display: block; margin: 8px 0; color: #9e9e9e; font-size: 12px; }
    .preview-area {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
    }
    .preview-img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
      object-fit: contain;
    }
    .remove-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .uploading-state {
      width: 100%;
      padding: 20px;
    }
  `]
})
export class ImageUploadComponent {
  @Input() previewUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  isDragover = false;
  isUploading = false;
  uploadProgress = 0;

  constructor(private cloudinaryService: CloudinaryService) {}

  onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFile(event.target.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.match(/image\/*/)) return;
    
    // Preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (e: any) => this.previewUrl = e.target.result;
    reader.readAsDataURL(file);

    this.isUploading = true;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) this.uploadProgress += 10;
    }, 200);

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (secureUrl) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        setTimeout(() => {
          this.previewUrl = secureUrl;
          this.isUploading = false;
          this.uploadProgress = 0;
          this.imageUploaded.emit(secureUrl);
        }, 500);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.previewUrl = null;
        console.error('Upload failed', err);
      }
    });
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.previewUrl = null;
    this.imageRemoved.emit();
  }
}
