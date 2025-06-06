import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TeacherGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isTeacher().pipe(
      // Assuming AuthService has isTeacher()
      take(1),
      map((isTeacher) => {
        if (isTeacher) {
          return true; // User is a teacher, allow access
        } else {
          // User is not a teacher, redirect to dashboard or show an unauthorized message
          console.warn(
            'TeacherGuard: Access Denied. User is not a teacher. Redirecting to dashboard.'
          );
          return this.router.createUrlTree(['/dashboard']); // Redirect to dashboard
        }
      })
    );
  }
}
