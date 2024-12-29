import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { LogUSerDTO } from '../interfaces/log-user-dto';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams	 } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Empleado } from '../interfaces/serverDTOs/empleado';
import { Sueldo } from '../interfaces/serverDTOs/sueldo';
import { MesAnioDTO } from '../interfaces/mes-anio-dto';
import { RegistrarEmpleado } from '../interfaces/serverDTOs/registrar-empleado';
import { TokenGetter } from '../interfaces/serverDTOs/token-getter';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: string = environment.apiurl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  logUser(account: LogUSerDTO): Observable<TokenGetter>
  {
    return this.http.post<TokenGetter>(`${this.baseUrl}/login`, account)
  }

  getEmpleados(): Observable<Empleado[]> {

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.get<Empleado[]>(`${this.baseUrl}/empleados`, { headers });
  }

  getSalarios(mes: number, anio: number): Promise<Sueldo[]> {

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return firstValueFrom(this.http.get<Sueldo[]>(`${this.baseUrl}/sueldos/${anio}/${mes}`, { headers }))
  }

  getEmpleadosQuery(query: string): Promise<Empleado[]>
  {
    let params = new HttpParams().set('query', query);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return firstValueFrom(this.http.get<Empleado[]>(`${this.baseUrl}/empleados/query`, { headers, params }));
  }

  registarEmpleado(employee: RegistrarEmpleado): Observable<Empleado>
  {
    return this.http.post<Empleado>(`${this.baseUrl}/Registrar`, employee);
  }

  calcularSueldosFinales(mes: number, anio: number): Observable<void>
  {
    return this.http.get<void>(`${this.baseUrl}/SueldoFinal/${anio}/${mes}`);
  }

  uploadExcel(formData: FormData, mes: number, anio: number): Promise<void> {
    const url = `${this.baseUrl}/Excel/${anio}/${mes}`;
    console.log(url);
    return firstValueFrom(this.http.post<void>(url,formData));
  }

}
