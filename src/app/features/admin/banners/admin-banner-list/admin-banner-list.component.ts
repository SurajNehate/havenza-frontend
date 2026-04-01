import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, Banner } from '../../../../core/models/models';

@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-header">
      <div class="header-titles">
        <h1>Banner Management</h1>
        <p>Manage promotional banners</p>
      </div>
    </div>
    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="banners" class="custom-table" *ngIf="banners.length > 0">
          
          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef> Image </th>
            <td mat-cell *matCellDef="let element">
               <img [src]="element.imageUrl" class="banner-img">
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef> Title </th>
            <td mat-cell *matCellDef="let element"> {{ element.title }} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [color]="element.active ? 'primary' : 'warn'" selected>
                {{ element.active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div class="empty-state" *ngIf="banners.length === 0">
           No banners found.
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 500; }
    .page-header p { margin: 0; color: var(--text-secondary, #757575); }
    .table-container { padding: 0 !important; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .banner-img { height: 60px; border-radius: 4px; object-fit: cover; }
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; }
    .empty-state { padding: 40px; text-align: center; color: #757575; }
    mat-row:hover { background: #fafafa; }
  `]
})
export class AdminBannerListComponent implements OnInit {
  http = inject(HttpClient);
  displayedColumns = ['image', 'title', 'status', 'actions'];
  banners: Banner[] = [];

  ngOnInit() {
    this.http.get<ApiResponse<Banner[]>>(`${environment.apiUrl}/admin/banners`).subscribe(res => {
      if (res.success) {
        this.banners = res.data;
      }
    });
  }
}
