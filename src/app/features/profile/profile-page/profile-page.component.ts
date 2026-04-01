import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { environment } from '../../../../environments/environment';
import { ApiResponse, User } from '../../../core/models/models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, ImageUploadComponent],
  template: `
    <div class="container main-content-padding">
      <div class="header">
        <h1>My Profile</h1>
      </div>

      <div class="profile-layout" *ngIf="user">
        <mat-card class="avatar-card">
          <mat-card-header>
            <mat-card-title>Profile Picture</mat-card-title>
          </mat-card-header>
          <mat-card-content class="avatar-content">
            <app-image-upload [previewUrl]="user.avatarUrl" 
                              (imageUploaded)="onAvatarUploaded($event)"
                              (imageRemoved)="onAvatarRemoved()">
            </app-image-upload>
            <p class="help-text">JPG or PNG no larger than 2MB</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Account Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email (Read-only)</mat-label>
                <input matInput formControlName="email" readonly>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <div class="actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isSaving || profileForm.pristine">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
    .header h1 { margin: 0; font-weight: 300; }
    
    .profile-layout { display: flex; gap: 24px; }
    @media (max-width: 768px) { .profile-layout { flex-direction: column; } }
    
    .avatar-card { flex: 1; max-width: 350px; }
    .avatar-content { padding-top: 16px; text-align: center; }
    .help-text { font-size: 12px; color: #757575; margin-top: 16px; }
    
    .details-card { flex: 2; }
    .full-width { width: 100%; margin-top: 12px; }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }
  `]
})
export class ProfilePageComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);

  user: User | null = null;
  isSaving = false;

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    email: [{value: '', disabled: true}],
    phone: [''],
    avatarUrl: ['']
  });

  ngOnInit() {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone,
        avatarUrl: this.user.avatarUrl
      });
    }
  }

  onAvatarUploaded(url: string) {
    this.profileForm.patchValue({ avatarUrl: url });
    this.profileForm.markAsDirty();
  }

  onAvatarRemoved() {
    this.profileForm.patchValue({ avatarUrl: '' });
    this.profileForm.markAsDirty();
  }

  saveProfile() {
    if (this.profileForm.valid && this.user) {
      this.isSaving = true;
      const url = `${environment.apiUrl}/users/${this.user.id}`;
      // Note: for POC, assuming backend has PUT /users/{id}
      this.http.put<ApiResponse<User>>(url, this.profileForm.getRawValue()).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            this.authService.loadUser(); // refresh session data
            this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
            this.profileForm.markAsPristine();
          }
        },
        error: () => this.isSaving = false
      });
    }
  }
}
