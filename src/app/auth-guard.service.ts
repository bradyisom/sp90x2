import { Injectable } from '@angular/core';
import {
  CanActivateChild, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot,
                  state: RouterStateSnapshot): Observable<boolean> {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): Observable<boolean> {
    const result = new AsyncSubject<boolean>();
    this.authService.user.subscribe( (user) => {
      if (user) {
        result.next(true);
        result.complete();
      } else {
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
