import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        var user: User={
            userId: 0, userEmail:'', password: '', firstname: '', lastname: '', CustomerId: 0, MailChimpApiKey: '', SubscriptionId: 0, company:'', userphone:'', billingPlan:'', planUsage:'', planPasses:''
        }
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user') || JSON.stringify(user)));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        var url= environment.apiUrl +'/loginUser/'+ btoa(username)+'/'+btoa(password);       
    
        let header: HttpHeaders = new HttpHeaders();
        header = header.append('Content-Type', 'application/json');
        header = header.append('Access-Control-Allow-Origin', '*');

        return this.http.jsonp(`${url}`, 'callback')
            .pipe(map((user: any) => {
                if(user[0].result != "fail"){
                    user[0].userId=-1;
                    user[0].password='';
                    user[0].createdDate='';
                    user[0].apikey=btoa(user[0].apikey);
                    localStorage.setItem('user', JSON.stringify(user[0]));
                    localStorage.setItem('auth', btoa(user[0].apikey));
                }
                this.currentUserSubject.next(user[0]);
                //user.authdata = window.btoa(username + ':' + password);
                return user[0];
            }));
    }

    getUser(apikey?: string){
        var url= environment.apiUrl +'/getUserByUID/'+ apikey;   

        return this.http.jsonp(`${url}`, 'callback')
            .pipe(map((user: any) => {
                if(user[0].result != "fail"){
                    user[0].password='';
                    user[0].createdDate='';
                    user[0].apikey=btoa(user[0].apikey);
                    localStorage.setItem('user', JSON.stringify(user[0]));
                    localStorage.setItem('auth', btoa(user[0].apikey));
                }
                this.currentUserSubject.next(user[0]);
                return user[0];
            }));
    }

    reset(email: string) {
        var url= environment.apiMainUrl +'/api/googlepay/resetPassword/'+ btoa(email);  
        
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json'
          })
        };

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((user: any) => {
                return user;
            }));
    }

    forgotPassword(email: string, password: string) {
        var url= environment.apiMainUrl +'/api/googlepay/forgotpassword/'+ email + '/' + btoa(password);  
        
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json'
          })
        }; 

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((user: any) => {
                return user;
            }));
    }

    signUp(firstname: string, lastname: string, email: string, password: string, company: string) {
        var url= environment.apiUrl +'/registerUser/'+ btoa(email)+ '/' + btoa(password)+ '/free/0/0?name=' + firstname +' '+ lastname + '&company=' + company;  
        
        return this.http.jsonp(`${url}`, 'callback')
            .pipe(map((user: any) => {
                if(user[0].result != "fail"){
                }
                return user[0];
            }));
    }

    updateUser(userId: number, firstname: string, lastname: string, email: string, password: string, company: string, phone: string, mailchimpKey: string, apikey?: string) {
        var objPass = {
            "firstname": firstname,
            "lastname": lastname,
            "userEmail": btoa(email),
            "userphone": phone,
            "company": company,
            "MailChimpApiKey": mailchimpKey,
            "isActive": true,
            "password": (password != '')?btoa(password):'',
        }   

        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiMainUrl +'/api/googlepay/updateUser/'+ userId;  
        
        return this.http.put<any>(`${url}`, JSON.stringify(objPass), httpOptions! )
            .pipe(map((user: any) => {
                if(user[0].result != "fail"){
                }
                return user[0];
            }));
    }

    getModules(apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Module';   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((module: any) => {
                return module;
            }));
    }

    deleteModule(Id: number){
        
        var url= environment.apiApiUrl +'/Module/'+ Id;   

        return this.http.delete<any>(`${url}`)
            .pipe(map((module: any) => {                
                return module;
            }));
    }    

    createModule(module: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Module';  
       
        return this.http.post<any>(`${url}`, JSON.stringify(module), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }    

    updateModule(module: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Module/' + module.Id;  
        
        return this.http.put<any>(`${url}`, JSON.stringify(module), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }

    getTemplate(id: number, apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';
        
        var url= environment.apiApiUrl +'/getPassTemplate/'+ id;   

        return this.http.jsonp(`${url}`, 'callback')
            .pipe(map((user: any) => {
                if(user[0].result != "fail"){
                    return user[0];
                }
                return user[0];
            }));
    }

    getCompanies(apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Company';   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((company: any) => {
                return company;
            }));
    }

    getCompany(Id: number, apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl + '/Company/' + Id;   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    deleteCompany(Id: number){
        
        var url= environment.apiApiUrl +'/Company/'+ Id;   

        return this.http.delete<any>(`${url}`)
            .pipe(map((company: any) => {                
                return company;
            }));
    }   

    createCompany(company: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Company';  
       
        return this.http.post<any>(`${url}`, JSON.stringify(company), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }    

    updateCompany(company: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Company/' + company.Id;  
        
        return this.http.put<any>(`${url}`, JSON.stringify(company), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }

    getCampaigns(apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Campaign';   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((campaign: any) => {
                return campaign;
            }));
    }

    getCompanyCampaigns(Id: number, apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Campaign/getCompanyCampaigns/' + Id;   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    getStoreCampaigns(Id: number, campaignId: number, apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/CampaignStore/getStoreCampaigns/' + Id + '/' + campaignId;   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    deleteCampaign(Id: number){
        
        var url= environment.apiApiUrl +'/Campaign/'+ Id;   

        return this.http.delete<any>(`${url}`)
            .pipe(map((campaign: any) => {                
                return campaign;
            }));
    }   

    createCampaign(campaign: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Campaign';  
       
        return this.http.post<any>(`${url}`, JSON.stringify(campaign), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }    

    updateCampaign(campaign: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Campaign/' + campaign.Id;  
        
        return this.http.put<any>(`${url}`, JSON.stringify(campaign), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }

    getStores(apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Store';   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    getCompanyStores(Id: number,apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Store/getCompanyStores/' + Id;   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    getStore(Id: number, apikey?: string){
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl + '/Store/' + Id;   

        return this.http.get<any>(`${url}`, httpOptions!)
            .pipe(map((store: any) => {
                return store;
            }));
    }

    deleteStore(Id: number){
        
        var url= environment.apiApiUrl +'/Store/'+ Id;   

        return this.http.delete<any>(`${url}`)
            .pipe(map((store: any) => {                
                return store;
            }));
    }   

    createStore(store: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Store';  
       
        return this.http.post<any>(`${url}`, JSON.stringify(store), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }    

    updateStore(store: any, apikey?: string) {
        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };

        var url= environment.apiApiUrl +'/Store/' + store.Id;  
        
        return this.http.put<any>(`${url}`, JSON.stringify(store), httpOptions! )
            .pipe(map((result: any) => {
                return result;
            }));
    }

    getPassStatic(templateId: number){
        
        var url= environment.apiUrl +'/GetPassStaticById/'+ templateId;   

        return this.http.jsonp(`${url}`, 'callback')
            .pipe(map((user: any) => {
                if(user.result != "fail"){
                    return user;
                }
                return user;
            }));
    }

    reGenerateAPIKey(apikey?: string){

        var apiKey: string=(apikey != undefined)?apikey as string:'';

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Accept':  'application/json',
            'apikey': atob(apiKey)
          })
        };
        httpOptions.headers = httpOptions.headers.append('Access-Control-Allow-Origin', '*');
        
        var url= environment.apiMainUrl +'/api/googlepay/regenerateapikey/'+ atob(apiKey);   

        return this.http.get(`${url}`, httpOptions)
            .pipe(map((user: any) => {
                if(user != null && user.result != "fail"){
                    return user;
                }
                return user;
            }));
    }

    logout() {
        var user: User={
            userId: 0, userEmail:'', password: '', firstname: '', lastname: '', CustomerId: 0, MailChimpApiKey: '', SubscriptionId: 0, company:'', userphone:'', billingPlan:'', planUsage:'', planPasses:''
        }
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        //this.currentUserSubject = new BehaviorSubject<User>({});
        this.currentUserSubject.next(user);
    }

    //set name user new in storage
    setUserName(username:string){
        localStorage.setItem('username', JSON.stringify(username));        
    }

    getUserName(){
        var user=JSON.parse(localStorage.getItem('user')!);
        var username=user.firstname + ' ' + user.lastname;
        return JSON.parse(username || '');
    }
}