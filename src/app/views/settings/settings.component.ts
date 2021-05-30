import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { LoaderService, AuthenticationService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
    showLoader: boolean;
    loading = false;
    currentUser: User;
    username: string;
    submitted = false;
    error: any = '';
    success: any = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private loaderService: LoaderService
    ) { 
    }   

    ngOnInit() {

        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
        });

        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });
    }  

    regenerate(){
        this.loaderService.display(true);
        this.submitted = true;
        this.success = "";
        this.error = "";

        this.loading = true;
        this.authenticationService.reGenerateAPIKey(this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.userId != null && data.userId != 0){
                        this.loading = false;
                        this.loaderService.display(false);

                        this.authenticationService.getUser(data.uid)
                            .pipe(first())
                            .subscribe(
                                (data2: any) => {
                                    this.currentUser=data2;
                                },
                                (error:any) => {
                                    this.error = error;
                                    this.loading = false;
                                    this.loaderService.display(false);
                                });
                        this.success = "New API Key Generated!!!";
                    }
                    else{
                        this.error = "Invalid API Key";
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error:any) => {
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
    }

    decodeString(apiKey: any){
        return atob(apiKey);
    }
}