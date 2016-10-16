import { Injectable } from '@angular/core';
import {
  CanActivateChild, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, AsyncSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot,
                  state: RouterStateSnapshot): Observable<boolean> {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): Observable<boolean> {
    let result = new AsyncSubject<boolean>();
    this.authService.user.subscribe( (user) => {
      if (user) {
        result.next(true);
        result.complete();
      }
      else {
        // // Store the attempted URL for redirecting
        // this.authService.redirectUrl = url;

        result.next(false);
        result.complete();

        this.router.navigate(['/']);
      }
    });

    return result;
  }
}