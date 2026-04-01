import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatInputModule, MatIconModule, ImageUploadComponent],
  template: `
    <div class="page-container">
      <div class="row layout">
        <div class="side-col">
          <mat-card class="profile-card text-center">
            <app-image-upload 
              [previewUrl]="profileForm.value.avatarUrl || null" 
              (imageUploaded)="onAvatarUploaded($event)" 
              (imageRemoved)="onAvatarRemoved()">
            </app-image-upload>
            <h2>{{ authService.currentUser()?.fullName }}</h2>
            <p class="role-badge">{{ authService.currentUser()?.role }}</p>
            <p class="email-text">{{ authService.currentUser()?.email }}</p>
          </mat-card>
        </div>

        <div class="main-col">
          <mat-card class="profile-card">
            <mat-card-header>
               <mat-card-title>Personal Information</mat-card-title>
               <mat-card-subtitle>Update your details here</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-layout">
                 <div class="form-row">
                   <mat-form-field appearance="outline" class="full-width">
                     <mat-label>Full Name</mat-label>
                     <input matInput formControlName="fullName" placeholder="John Doe">
                     <mat-error *ngIf="profileForm.get('fullName')?.hasError('required')">Name is required</mat-error>
                   </mat-form-field>
                 </div>
                 
                 <div class="form-row">
                   <mat-form-field appearance="outline" class="full-width">
                     <mat-label>Email Address</mat-label>
                     <input matInput formControlName="email">
                     <mat-hint>Email cannot be changed.</mat-hint>
                   </mat-form-field>
                 </div>

                 <div class="form-row">
                   <mat-form-field appearance="outline" class="full-width">
                     <mat-label>Phone Number</mat-label>
                     <input matInput formControlName="phone" placeholder="+1234567890">
                   </mat-form-field>
                 </div>
                 
                 <div class="form-actions">
                   <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || isSaving || profileForm.pristine">
                      <mat-icon>save</mat-icon> {{ isSaving ? 'Saving...' : 'Save Changes' }}
                   </button>
                 </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 40px 24px; min-height: 80vh; }
    .layout { display: flex; gap: 32px; align-items: flex-start; }
    @media (max-width: 800px) { .layout { flex-direction: column; } }
    
    .side-col { flex: 1; width: 100%; min-width: 250px; }
    .main-col { flex: 2; width: 100%; }

    .profile-card { border-radius: 12px; padding: 24px; background: var(--bg-card); box-shadow: var(--shadow-sm); }
    .text-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
    
    .avatar-circle { width: 120px; height: 120px; border-radius: 50%; background: #e8eaf6; color: #3f51b5; display: flex; justify-content: center; align-items: center; margin-bottom: 24px; }
    .avatar-circle mat-icon { font-size: 64px; width: 64px; height: 64px; }
    
    .text-center h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 500; color: var(--text-primary); }
    .role-badge { display: inline-block; padding: 4px 12px; background: #3f51b5; color: white; border-radius: 16px; font-size: 12px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: 0.5px; }
    .email-text { color: var(--text-secondary); margin: 0; }

    mat-card-header { margin-bottom: 24px; }
    mat-card-title { font-size: 20px; font-weight: 500; color: var(--text-primary); margin: 0; }
    mat-card-subtitle { color: var(--text-secondary); margin-top: 4px; }
    
    .form-layout { display: flex; flex-direction: column; gap: 16px; }
    .form-row { width: 100%; }
    .full-width { width: 100%; }
    
    .form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
    .form-actions button { height: 44px; padding: 0 24px; border-radius: 22px; }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  profileForm: FormGroup;
  isSaving = false;

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      avatarUrl: ['']
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
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
    if (this.profileForm.invalid) return;
    
    this.isSaving = true;
    const req = {
      fullName: this.profileForm.value.fullName,
      phone: this.profileForm.value.phone,
      avatarUrl: this.profileForm.value.avatarUrl
    };

    this.authService.updateProfile(req).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          this.profileForm.markAsPristine();
        } else {
          this.snackBar.open('Failed to update profile.', 'Close', { duration: 3000 });
        }
        this.isSaving = false;
      },
      error: () => {
        this.snackBar.open('Error occurred while updating profile.', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }
}
