import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class AuthResolver implements Resolve<Observable<any>> {

  constructor(private auth: AuthService) { }

  resolve(): Observable<any>|Promise<any>|any {
    return this.auth.user.first();
  }
}
