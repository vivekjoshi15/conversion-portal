import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  constructor(private http: HttpClient) { }

  httpGet(path: string, params?: HttpParams) {
    
    let header: HttpHeaders = new HttpHeaders();
    header = header.append('Content-Type', 'application/json');

    if(sessionStorage.getItem('token') != null && sessionStorage.getItem('token') != undefined) {
      header = header.append('Authorization', sessionStorage.getItem('token') || '{}');    
    }
    
    return this.http.get(environment.apiUrl + path, { params: params, headers: header });
  }

  httpGetWithParameters(path: string, param?: HttpParams) {
    // let body = JSON.stringify(bodyData);
    let header: HttpHeaders = new HttpHeaders();
    header = header.append('Content-Type', 'application/json');

    if(sessionStorage.getItem('token') != null && sessionStorage.getItem('token') != undefined) {
      header = header.append('Authorization', sessionStorage.getItem('token') || '{}');    
    }

    return this.http.get(environment.apiUrl + path, { params: param, headers: header });
  }

  httpPost(path: string, body: any) {
    const data = JSON.stringify(body);
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(sessionStorage.getItem('token') != null && sessionStorage.getItem('token') != undefined) {
      headers = headers.append('Authorization', sessionStorage.getItem('token') || '{}');
    }
    return this.http.post(environment.apiUrl + path, data, { headers });
  }

  httpPut(path: string, body: any) {
    const data = JSON.stringify(body);
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    if(sessionStorage.getItem('token') != null && sessionStorage.getItem('token') != undefined) {
      headers = headers.append('Authorization', sessionStorage.getItem('token') || '{}');    
    }
    return this.http.put(environment.apiUrl + path, data, { headers });
  }

  // httpDelete(path: any, params?: HttpParams) {
  //   let headers: HttpHeaders = new HttpHeaders();
  //   let param = null;
  //   headers = headers.append('Content-Type', 'application/json').append('Authorization', sessionStorage.getItem('token'));

  //   if (params) {
  //     param = params;
  //   }
  //   const options = { headers, params: param };
  //   return this.http.delete(environment.APIEndpoint + path, options);
  // }
  // private handleError(err: HttpErrorResponse) {
  //   let errorMessage = '';
  //   if (err.error instanceof ErrorEvent) {
  //     errorMessage = `An error occurred: ${err.error.message}`;
  //   } else {
  //     errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
  //   }
  //   return throwError(errorMessage);
  // }
}
