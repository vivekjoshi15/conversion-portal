import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})

export class ForgotPasswordComponent implements OnInit {
	resetForm: FormGroup ;
    loading = false;
    submitted = false;
    returnUrl: string ='';
    email: string ='';
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
        this.email = this.route.snapshot.queryParams.token;
    }

    ngOnInit() {
        this.resetForm = this.formBuilder.group({
            password: ['', Validators.required],
            confirmpassword: [''],
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.resetForm.controls; }

    onSubmit() {
        this.loaderService.display(true);
        this.submitted = true;

        // stop here if form is invalid
        if (this.resetForm.invalid) {
            this.error = "Please fill password";
            this.loaderService.display(false);
            return;
        }

        // stop here if form is invalid
        if (this.f.password.value != this.f.confirmpassword.value) {
            this.error = "Password and Confirm Password are not matching";
            this.loaderService.display(false);
            return;
        }

        this.loading = true;
        this.authenticationService.forgotPassword(this.email, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    this.resetForm.controls.password.setValue('');
                    this.loaderService.display(false);
                    this.submitted = false;
                    this.loading = false;
                    this.error = "password changed!!";
                },
                (error: any) => {
                    this.error = "Error while changing password";
                    this.loading = false;
                    this.submitted = false;
                    this.loaderService.display(false);
                });
    }
}