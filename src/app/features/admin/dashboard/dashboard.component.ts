import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  salesByStatus: Record<string, number>;
  monthlySales: Record<string, number>;
  topProducts: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgChartsModule, LoadingSpinnerComponent, CurrencyPipe],
  template: `
    <app-loading-spinner [show]="isLoading"></app-loading-spinner>
    
    <div class="dashboard-header">
      <h1>Dashboard Overview</h1>
    </div>

    <div class="metrics-grid" *ngIf="stats">
      <mat-card class="metric-card primary">
        <mat-icon class="bg-icon">attach_money</mat-icon>
        <mat-card-content>
          <p class="metric-title">Total Revenue</p>
          <h2 class="metric-value">{{ stats.totalRevenue | currency:'INR' }}</h2>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="metric-card accent">
        <mat-icon class="bg-icon">shopping_bag</mat-icon>
        <mat-card-content>
          <p class="metric-title">Total Orders</p>
          <h2 class="metric-value">{{ stats.totalOrders }}</h2>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="metric-card warn">
        <mat-icon class="bg-icon">people</mat-icon>
        <mat-card-content>
          <p class="metric-title">Total Customers</p>
          <h2 class="metric-value">{{ stats.totalUsers }}</h2>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="metric-card info">
        <mat-icon class="bg-icon">inventory_2</mat-icon>
        <mat-card-content>
          <p class="metric-title">Total Products</p>
          <h2 class="metric-value">{{ stats.totalProducts }}</h2>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="charts-container" *ngIf="stats">
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Orders by Status</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-wrapper">
          <canvas baseChart
                  [data]="pieChartData"
                  [options]="pieChartOptions"
                  [type]="'pie'">
          </canvas>
        </mat-card-content>
      </mat-card>

      <!-- Mock Bar Chart for Top Products POC -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Sales Analytics</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-wrapper">
          <canvas baseChart
                  [data]="barChartData"
                  [options]="barChartOptions"
                  [type]="'bar'">
          </canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px; }
    .dashboard-header h1 { margin: 0; font-weight: 300; font-size: 28px; }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .metric-card {
      position: relative;
      overflow: hidden;
      color: white;
      padding: 24px;
    }
    .metric-card.primary { background: linear-gradient(45deg, #3f51b5, #5c6bc0); }
    .metric-card.accent { background: linear-gradient(45deg, #ff9800, #ffb74d); }
    .metric-card.warn { background: linear-gradient(45deg, #f44336, #ef5350); }
    .metric-card.info { background: linear-gradient(45deg, #009688, #4db6ac); }
    
    .bg-icon {
      position: absolute;
      right: -10px;
      bottom: -10px;
      font-size: 100px;
      width: 100px;
      height: 100px;
      opacity: 0.2;
    }
    .metric-title { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; opacity: 0.9; }
    .metric-value { margin: 0; font-size: 36px; font-weight: 700; }
    
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    .chart-card { padding: 16px; min-height: 400px; }
    mat-card-title { font-size: 18px; margin-bottom: 16px; }
    .chart-wrapper { display: flex; justify-content: center; height: 320px; }
  `]
})
export class DashboardComponent implements OnInit {
  http = inject(HttpClient);

  stats: DashboardStats | null = null;
  isLoading = true;

  // Pie Chart
  pieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [{ data: [] }] };
  pieChartOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false };

  // Bar Chart
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Sales (₹)' }
    ]
  };
  barChartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.http.get<ApiResponse<DashboardStats>>(`${environment.apiUrl}/admin/dashboard/stats`).subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
          this.setupCharts();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  setupCharts() {
    if (!this.stats) return;

    // Map Orders by Status to Pie Chart
    const labels = Object.keys(this.stats.salesByStatus || {});
    const data = Object.values(this.stats.salesByStatus || {});

    this.pieChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#3f51b5', '#ff9800', '#f44336', '#4caf50', '#9c27b0']
        }
      ]
    };

    // Map Monthly Sales to Bar Chart
    if (this.stats.monthlySales) {
      const barLabels = Object.keys(this.stats.monthlySales);
      const barData = Object.values(this.stats.monthlySales);

      this.barChartData = {
        labels: barLabels,
        datasets: [
          { data: barData, label: 'Sales (₹)', backgroundColor: '#3f51b5' }
        ]
      };
    }
  }
}
