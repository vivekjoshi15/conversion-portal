import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { LoaderService, AuthenticationService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})

export class ReportsComponent implements OnInit {
    showLoader: boolean;
    currentUser: User;
    username: string;
    error: any = '';
    success: any = '';
    loading = false;
    templates: any = [];
    selView: number =  -1;
    templateId: number = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private loaderService: LoaderService
    ) { 
        if(this.route.snapshot.params.templateId != undefined){
            this.templateId = this.route.snapshot.params.templateId;
        }
    }   

    ngOnInit() {
        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
        });

        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });

        this.loaderService.display(true);
        this.authenticationService.getModules(this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.PassStatics.length > 0){
                        this.templates = data.PassStatics;
                        if(this.templateId != 0){
                            this.templates=this.templates.filter((item: any) =>item.TemplateId==this.templateId);
                            this.selView = 0;
                        }
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                    else{
                        this.templates = [];
                        this.error = "No Pass Statistics found";
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.templates = [];
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
    }
}