import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, User, Role } from '../../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImgFallbackDirective } from '../../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatPaginatorModule, MatDialogModule, MatInputModule, MatSelectModule, MatDividerModule, MatTooltipModule, LoadingSpinnerComponent, DatePipe, ImgFallbackDirective],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="admin-header">
      <div class="header-titles">
        <h1>User Management</h1>
        <p>Manage customer accounts and admin privileges.</p>
      </div>
    </div>

    <mat-card class="table-card">
      <mat-card-content class="table-container">
        <table mat-table [dataSource]="users" class="custom-table" *ngIf="users.length > 0">
          
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef> User </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="user-cell">
                <img [src]="element.avatarUrl || 'assets/default-avatar.png'" appImgFallback="user" class="avatar">
                <div>
                  <div class="user-name">{{ element.fullName }}</div>
                  <div class="user-email">{{ element.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef> Phone </th>
            <td mat-cell *matCellDef="let element"> {{ element.phone || 'N/A' }} </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef> Role </th>
            <td mat-cell *matCellDef="let element"> 
              <mat-chip [color]="element.role === 'ADMIN' ? 'accent' : ''" selected>{{ element.role }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="joined">
            <th mat-header-cell *matHeaderCellDef> Joined </th>
            <td mat-cell *matCellDef="let element"> {{ element.createdAt | date:'mediumDate' }} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary" matTooltip="Edit User" (click)="openEditPanel(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [color]="element.role === 'ADMIN' ? 'warn' : 'primary'" matTooltip="Toggle Admin Role" (click)="toggleRole(element)">
                <mat-icon>{{ element.role === 'ADMIN' ? 'remove_moderator' : 'add_moderator' }}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <mat-paginator *ngIf="totalElements > 0"
                       [length]="totalElements"
                       [pageSize]="pageSize"
                       [pageIndex]="pageIndex"
                       [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card-content>
    </mat-card>

    <!-- Inline Edit Panel -->
    <div class="edit-overlay" *ngIf="editingUser" (click)="closeEditPanel()">
      <mat-card class="edit-panel" (click)="$event.stopPropagation()">
        <div class="edit-header">
          <h2>Edit User</h2>
          <button mat-icon-button (click)="closeEditPanel()"><mat-icon>close</mat-icon></button>
        </div>
        <mat-divider></mat-divider>

        <div class="edit-body">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="editForm.fullName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput [value]="editingUser.email" disabled>
            <mat-hint>Email cannot be changed</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput [(ngModel)]="editForm.phone">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="editForm.role">
              <mat-option value="CUSTOMER">CUSTOMER</mat-option>
              <mat-option value="ADMIN">ADMIN</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="edit-actions">
          <button mat-stroked-button (click)="closeEditPanel()">Cancel</button>
          <button mat-flat-button color="primary" (click)="saveUserEdit()" [disabled]="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-header { margin-bottom: 24px; }
    .header-titles h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 500; }
    .header-titles p { margin: 0; color: #757575; }
    
    .table-container { padding: 0 !important; }
    .custom-table { width: 100%; border-collapse: collapse; }
    
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: #e0e0e0; }
    .user-name { font-weight: 500; color: #333; }
    .user-email { font-size: 12px; color: #757575; }
    
    .actions-header { text-align: right; padding-right: 24px !important; }
    .actions-cell { text-align: right; padding-right: 16px !important; }
    
    mat-row:hover { background: #fafafa; }

    /* Edit Overlay */
    .edit-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 100;
      display: flex; justify-content: center; align-items: flex-start;
      padding-top: 80px;
    }
    .edit-panel {
      width: 100%; max-width: 500px; padding: 24px; border-radius: 16px;
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .edit-header h2 { margin: 0; font-size: 20px; font-weight: 500; }
    mat-divider { margin-bottom: 24px !important; }
    .edit-body { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `]
})
export class AdminUserListComponent implements OnInit {
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);

  displayedColumns = ['user', 'phone', 'role', 'joined', 'actions'];
  users: User[] = [];
  isLoading = true;

  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  // Edit panel
  editingUser: User | null = null;
  editForm = { fullName: '', phone: '', role: '' };
  isSaving = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    const url = `${environment.apiUrl}/admin/users?page=${this.pageIndex}&size=${this.pageSize}&sort=createdAt,desc`;
    this.http.get<ApiResponse<any>>(url).subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data.content;
          this.totalElements = res.data.totalElements;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  toggleRole(user: User) {
    const newRole = user.role === Role.ADMIN ? Role.CUSTOMER : Role.ADMIN;
    if (confirm(`Are you sure you want to change ${user.fullName} to ${newRole}?`)) {
      this.isLoading = true;
      this.http.put<ApiResponse<any>>(`${environment.apiUrl}/admin/users/${user.id}/role`, { role: newRole }).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          } else {
            this.isLoading = false;
            this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
          }
        },
        error: () => this.isLoading = false
      });
    }
  }

  openEditPanel(user: User) {
    this.editingUser = user;
    this.editForm = {
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role as string
    };
  }

  closeEditPanel() {
    this.editingUser = null;
  }

  saveUserEdit() {
    if (!this.editingUser) return;
    this.isSaving = true;

    const body = {
      fullName: this.editForm.fullName,
      phone: this.editForm.phone,
      role: this.editForm.role
    };

    this.http.put<ApiResponse<any>>(`${environment.apiUrl}/admin/users/${this.editingUser.id}`, body).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
          this.closeEditPanel();
          this.loadUsers();
        }
        this.isSaving = false;
      },
      error: () => {
        this.snackBar.open('Failed to update user.', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }
}

