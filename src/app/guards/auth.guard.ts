import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private supabaseService: SupabaseService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
//     return this.supabaseService.userSubject.pipe(
//       map(user => {
//         console.log('user', user);
//         if (user) {
//           if (state.url === '/landing') {
//             this.router.navigate(['/']);
//             return false;
//           }
//           return true;
//         } else {
//           if (state.url !== '/landing') {
//             this.router.navigate(['/landing']);
//             return false;
//           }
//           return true;
//         }
//       })
//     );
//   }

canActivate(): Observable<boolean> {
  return this.authService.user$.pipe(
    map(user => {
      if (user) {
        return true;  // User is logged in, allow access
      } else {
        this.router.navigate(['/']);  // Redirect to landing page
        return false;  // Block access
      }
    })
  );
}

// canActivate(): Observable<boolean | UrlTree> {
//     return this.supabaseService.isSessionInitialized().pipe(
//       switchMap(() => this.supabaseService.getCurrentUser()),
//       take(1),
//       map(user => {
//         if (user) {
//           return true;
//         } else {
//           console.log('AuthGuard: User is not logged in, redirecting to login');
//           // return this.router.createUrlTree(['/login']);
//           return true;
//         }
//       })
//     );
//   }
}