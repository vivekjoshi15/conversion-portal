import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
	loginForm: FormGroup ;
    loading = false;
    submitted = false;
    returnUrl: string ='';
    error: any = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue &&  this.authenticationService.currentUserValue.userId > 0) { 
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            remember: ['']
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.loaderService.display(true);
        this.submitted = true;
        this.error = "";

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            this.error = "Please fill required fields";
            this.loaderService.display(false);
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data.userId != null && data.userId != 0){
                        this.authenticationService.getUser(atob(data.apikey))
                        .pipe(first())
                        .subscribe(
                            (data: any) => {
                                this.loading = false;
                            },
                            (error: any) => {
                                this.error = error;
                                this.loading = false;
                            }
                        );
                        this.loaderService.display(false);
                        this.router.navigate([this.returnUrl]);
                    }
                    else{
                        this.error = data.message;
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                }
            );
    }
}