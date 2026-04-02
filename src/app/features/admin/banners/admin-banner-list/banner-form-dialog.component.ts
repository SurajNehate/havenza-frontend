import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Banner } from '../../../../core/models/models';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-banner-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule,
    ImageUploadComponent
  ],
  template: `
    <div class="dialog-header">
      <mat-icon class="header-icon">view_carousel</mat-icon>
      <div>
        <h2 mat-dialog-title>{{ isEdit ? 'Edit Banner' : 'Create Banner' }}</h2>
        <p>{{ isEdit ? 'Update promotional banner details' : 'Add a new banner to the homepage' }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <!-- Wrap content in a div with proper spacing -->
      <div class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Banner Title</mat-label>
          <input matInput [(ngModel)]="form.title" placeholder="e.g. Summer Sale 50% Off" required>
          <mat-icon matPrefix>title</mat-icon>
        </mat-form-field>

        <div class="image-upload-section">
          <label class="section-label">Banner Image <span class="required">*</span></label>
          <p class="section-hint">Upload a horizontal banner image.</p>
          <app-image-upload 
            [previewUrl]="form.imageUrl" 
            (imageUploaded)="onImageUploaded($event)"
            (imageRemoved)="form.imageUrl = ''">
          </app-image-upload>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Link URL (Optional)</mat-label>
          <input matInput [(ngModel)]="form.linkUrl" placeholder="e.g. /products?search=summer">
          <mat-icon matPrefix>link</mat-icon>
          <mat-hint>Where users go when they click this banner</mat-hint>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Display Order</mat-label>
            <input matInput type="number" [(ngModel)]="form.sortOrder" required min="0">
            <mat-icon matPrefix>sort</mat-icon>
            <mat-hint>Lower numbers appear first (e.g. 0, 1, 2)</mat-hint>
          </mat-form-field>
          
          <div class="toggle-container" style="flex: 1;">
            <mat-slide-toggle [(ngModel)]="form.active" color="primary">
              Active Status
            </mat-slide-toggle>
            <p class="toggle-hint">Inactive banners are hidden from users</p>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!isValid()" (click)="save()">
        <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 0; border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 16px; margin-bottom: 16px;
    }
    .header-icon { font-size: 36px; width: 36px; height: 36px; color: #3f51b5; }
    .dialog-header h2 { margin: 0 0 2px; font-size: 20px; font-weight: 600; padding: 0; }
    .dialog-header p { margin: 0; font-size: 13px; color: #757575; }
    mat-dialog-content { padding: 8px 24px 20px !important; min-width: 450px; overflow-x: hidden; }
    
    .form-container { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
    
    .full-width { width: 100%; display: block; }
    
    .image-upload-section { margin-bottom: 8px; }
    .section-label { display: block; font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
    .section-hint { font-size: 12px; color: var(--text-secondary); margin: 0 0 12px 0; }
    .required { color: #f44336; }
    
    .row { display: flex; gap: 16px; align-items: flex-start; }
    
    .toggle-container { margin-top: 10px; padding-left: 8px; }
    .toggle-hint { margin: 4px 0 0; font-size: 11px; color: var(--text-secondary); }
    
    mat-dialog-actions { padding: 8px 24px 20px !important; gap: 12px; border-top: 1px solid rgba(0,0,0,0.04); }
    mat-dialog-actions button mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
    
    @media (max-width: 480px) {
      mat-dialog-content { min-width: unset; }
      .row { flex-direction: column; gap: 16px; }
    }
  `]
})
export class BannerFormDialogComponent {
  isEdit: boolean;
  form = {
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    active: true
  };

  constructor(
    private dialogRef: MatDialogRef<BannerFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { banner: Banner | null }
  ) {
    this.isEdit = !!data.banner;
    if (data.banner) {
      this.form = {
        title: data.banner.title,
        imageUrl: data.banner.imageUrl,
        linkUrl: data.banner.linkUrl || '',
        sortOrder: data.banner.sortOrder,
        active: data.banner.active
      };
    }
  }

  onImageUploaded(url: string) {
    this.form.imageUrl = url;
  }

  isValid(): boolean {
    return !!(this.form.title.trim() && this.form.imageUrl.trim() && this.form.sortOrder >= 0);
  }

  save() {
    if (!this.isValid()) return;
    this.dialogRef.close({
      title: this.form.title.trim(),
      imageUrl: this.form.imageUrl.trim(),
      linkUrl: this.form.linkUrl.trim() || undefined,
      sortOrder: this.form.sortOrder,
      active: this.form.active
    });
  }

  cancel() { this.dialogRef.close(null); }
}
