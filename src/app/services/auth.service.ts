import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authToken: string = 'authToken';

  constructor() { }

  setToken(token:string):void
  {
    localStorage.setItem(this.authToken, token);
  }

  getToken():string | null
  {
    return localStorage.getItem(this.authToken);
  }
}
