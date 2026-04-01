import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay" *ngIf="show">
      <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
      <p *ngIf="message" class="spinner-msg">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .spinner-msg {
      margin-top: 16px;
      color: #3f51b5;
      font-weight: 500;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() show: boolean = false;
  @Input() message: string = '';
  @Input() diameter: number = 40;
}
