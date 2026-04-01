import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="star-rating-container" [class.readonly]="readonly">
      <mat-icon *ngFor="let star of stars; let i = index" 
                (click)="rate(i + 1)" 
                (mouseenter)="hover(i + 1)" 
                (mouseleave)="hover(rating)"
                [class.filled]="star <= hoverRating"
                [class.half]="isHalfStar(star)"
                class="star-icon">
        {{ getIconName(star) }}
      </mat-icon>
      <span class="rating-text" *ngIf="showText">({{ rating | number:'1.1-1' }})</span>
    </div>
  `,
  styles: [`
    .star-rating-container {
      display: inline-flex;
      align-items: center;
    }
    .star-rating-container:not(.readonly) .star-icon {
      cursor: pointer;
    }
    .star-icon {
      color: #e0e0e0;
      font-size: 20px;
      height: 20px;
      width: 20px;
      transition: color 0.2s;
    }
    .star-icon.filled {
      color: #FFC107;
    }
    .star-icon.half {
      color: #FFC107;
    }
    .rating-text {
      margin-left: 8px;
      font-size: 14px;
      color: #757575;
    }
  `]
})
export class StarRatingComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = true;
  @Input() showText: boolean = false;
  
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number = 0;

  ngOnInit() {
    this.stars = Array(this.maxRating).fill(0).map((x, i) => i + 1);
    this.hoverRating = this.rating;
  }

  rate(rating: number) {
    if (this.readonly) return;
    this.rating = rating;
    this.hoverRating = rating;
    this.ratingChange.emit(this.rating);
  }

  hover(rating: number) {
    if (this.readonly) return;
    this.hoverRating = rating;
  }

  isHalfStar(star: number): boolean {
    const diff = star - this.hoverRating;
    return diff > 0 && diff < 1;
  }

  getIconName(star: number): string {
    if (star <= this.hoverRating) {
      return 'star';
    } 
    return this.isHalfStar(star) ? 'star_half' : 'star_border';
  }
}
