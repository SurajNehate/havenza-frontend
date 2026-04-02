# Havenza Frontend

This is the frontend component of the Havenza Premium E-commerce platform, built with Angular 17+ and heavily utilizing RxJS, Angular Material, and custom theming.

## Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- Running backend (`havenza-backend`)

## Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure your environment (if needed)**
   Make sure the `src/environments/environment.ts` points to your active backend (default is `http://localhost:8080/api/v1`).

3. **Start the development server**
   ```bash
   npm run start
   ```
   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Features

### Customer-Facing
- **Homepage**: Hero carousel, category filters, product grid
- **Product Catalog**: Search, sort (newest/price), category filtering
- **Product Detail**: Image gallery, variant selection, reviews
- **Shopping Cart**: Add/remove items, quantity management, checkout
- **Order Management**: Order history, order cancellation
- **Wishlist**: Save products, quick-add to cart
- **Reviews**: Star ratings and text reviews
- **Payment**: UPI, Card, COD support
- **Theme Toggle**: Light/Dark mode with persistence
- **Responsive Design**: Mobile-first responsive layouts

### Admin Portal
- **Dashboard**: Key metrics (users, orders, products, revenue)
- **Product Management**: Full CRUD with variants and image upload
- **Order Management**: View all orders, update status, delete orders
- **User Management**: View users, edit profiles, change roles
- **Coupon Management**: Create discount coupons with validity rules
- **Banner Management**: Create homepage banners

## Deployment to Netlify

Below are the detailed steps to deploy your Angular frontend to Netlify.

### 1. Update Production Values
Before deploying, make sure to update `src/environments/environment.prod.ts` with your live backend API URL (for example, your Render backend URL):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-havenza-backend.onrender.com/api/v1'
};
```
*Commit this change and push your frontend to GitHub.*

### 2. Add a Custom Redirects File for Angular Routing
When deploying a Single Page Application (SPA), the server needs to direct all traffic route to `index.html`. 
Create a file named `_redirects` inside the `src/` folder (or verify it exists) with the following exact content:
```text
/*  /index.html  200
```
*(In your `angular.json`, ensure `src/_redirects` is included in the `"assets"` array so it's copied during the build).*

### 3. Deploy from GitHub to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Authorize GitHub and select your Havenza repository.
4. **Configure your build settings**:
   - **Base directory:** If your frontend is inside a mono-repo folder, enter the folder name (e.g., `havenza-frontend`).
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/havenza-frontend/browser`
5. Click **Deploy site**.
6. Wait a few moments for the build to finish. Your storefront will be live!

## Documentation

Comprehensive user stories for testing (Selenium, API, Manual) are available in:
```
../docs/user-stories/
```
See the [User Stories README](../docs/user-stories/README.md) for the full index.
