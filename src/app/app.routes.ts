import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Client Routes
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/shop/product-list/client-product-list.component').then(m => m.ClientProductListComponent)
      },
      {
        path: 'products/:slug',
        loadComponent: () => import('./features/shop/product-detail/client-product-detail.component').then(m => m.ClientProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/shop/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/shop/wishlist/wishlist.component').then(m => m.WishlistComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/user/orders/client-order-list.component').then(m => m.ClientOrderListComponent)
      }
    ]
  },
  
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-product-list/admin-product-list.component').then(m => m.AdminProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/admin/products/admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/admin/products/admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-order-list/admin-order-list.component').then(m => m.AdminOrderListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/admin/orders/admin-order-detail/admin-order-detail.component').then(m => m.AdminOrderDetailComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-user-list/admin-user-list.component').then(m => m.AdminUserListComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/coupons/admin-coupon-list/admin-coupon-list.component').then(m => m.AdminCouponListComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./features/admin/banners/admin-banner-list/admin-banner-list.component').then(m => m.AdminBannerListComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
