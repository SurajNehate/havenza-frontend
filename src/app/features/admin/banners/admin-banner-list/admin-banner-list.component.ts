import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, Banner } from '../../../../core/models/models';
import { BannerFormDialogComponent } from './banner-form-dialog.component';

@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatSlideToggleModule, MatTooltipModule
  ],
  template: `
    <div class="page-header">
      <div class="header-titles">
        <h1>Banner Management</h1>
        <p>Manage promotional banners displayed on the homepage</p>
      </div>
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon> Create Banner
      </button>
    </div>

    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="banners" class="custom-table" *ngIf="banners.length > 0">
          
          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef> Image </th>
            <td mat-cell *matCellDef="let element">
               <img [src]="element.imageUrl" class="banner-img" alt="Banner Image" onerror="this.src='assets/placeholder.png'">
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef> Title & Link </th>
            <td mat-cell *matCellDef="let element">
              <strong>{{ element.title }}</strong>
              <div class="sub-text" *ngIf="element.linkUrl">🔗 {{ element.linkUrl }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="order">
            <th mat-header-cell *matHeaderCellDef> Display Order </th>
            <td mat-cell *matCellDef="let element"> Sort: {{ element.sortOrder }} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element">
              <mat-slide-toggle [checked]="element.active" (change)="toggleActive(element)" color="primary"
                                [matTooltip]="element.active ? 'Deactivate' : 'Activate'">
              </mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary" matTooltip="Edit" (click)="openEditDialog(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteBanner(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-state" *ngIf="banners.length === 0">
           <mat-icon>view_carousel</mat-icon>
           <p>No banners found. Create your first promotional banner.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 500; color: var(--text-primary); }
    .page-header p { margin: 0; color: var(--text-secondary); }
    .table-card { border-radius: 12px; border: 1px solid var(--border-color); box-shadow: none; background: var(--bg-card); }
    .table-container { padding: 0 !important; overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .banner-img { height: 60px; min-width: 120px; border-radius: 4px; object-fit: cover; border: 1px solid #eee; background: #f5f5f5; margin: 8px 0; }
    .sub-text { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; white-space: nowrap; }
    .empty-state { padding: 60px 24px; text-align: center; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; margin-bottom: 12px; }
    .empty-state p { margin: 0; font-size: 15px; }
    tr.mat-mdc-row:hover { background: rgba(63, 81, 181, 0.04); }
  `]
})
export class AdminBannerListComponent implements OnInit {
  http = inject(HttpClient);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  apiUrl = `${environment.apiUrl}/admin/banners`;
  displayedColumns = ['image', 'title', 'order', 'status', 'actions'];
  banners: Banner[] = [];

  ngOnInit() { this.loadBanners(); }

  loadBanners() {
    this.http.get<ApiResponse<Banner[]>>(this.apiUrl).subscribe(res => {
      if (res.success) {
        // Sort banners by sortOrder for display in admin
        this.banners = res.data.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(BannerFormDialogComponent, {
      width: '520px', data: { banner: null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post<ApiResponse<Banner>>(this.apiUrl, result).subscribe({
          next: () => { this.loadBanners(); this.snackBar.open('Banner created!', 'Close', { duration: 3000 }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed to create', 'Close', { duration: 3000 })
        });
      }
    });
  }

  openEditDialog(banner: Banner) {
    const dialogRef = this.dialog.open(BannerFormDialogComponent, {
      width: '520px', data: { banner }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.put<ApiResponse<Banner>>(`${this.apiUrl}/${banner.id}`, result).subscribe({
          next: () => { this.loadBanners(); this.snackBar.open('Banner updated!', 'Close', { duration: 3000 }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed to update', 'Close', { duration: 3000 })
        });
      }
    });
  }

  toggleActive(banner: Banner) {
    // We reuse PUT to update the status fully
    const updatedBanner = { ...banner, active: !banner.active };
    this.http.put<ApiResponse<Banner>>(`${this.apiUrl}/${banner.id}`, updatedBanner).subscribe({
      next: () => { this.loadBanners(); },
      error: () => this.snackBar.open('Failed to modify banner status', 'Close', { duration: 3000 })
    });
  }

  deleteBanner(banner: Banner) {
    if (!confirm(`Delete banner "${banner.title}"? This cannot be undone.`)) return;
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${banner.id}`).subscribe({
      next: () => { this.loadBanners(); this.snackBar.open('Banner deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
    });
  }
}
