import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.status === 403) {
          router.navigate(['/']);
          errorMessage = 'You do not have permission to access this resource.';
        }
      }

      snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      return throwError(() => error);
    })
  );
};
