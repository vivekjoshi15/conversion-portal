import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

export class SignupComponent implements OnInit {
	signupForm: FormGroup ;
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
        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            company: [''],
            email: ['', Validators.required],
            password: ['', Validators.required],
            confirmpassword: ['', Validators.required],
            remember: ['']
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.signupForm.controls; }

    onSubmit() {
        this.loaderService.display(true);
        this.submitted = true;
        this.error = "";

        if (this.signupForm.invalid) {
            this.error = "Please fill required fields";
            this.loaderService.display(false);
            return;
        }

        // stop here if form is invalid
        if (this.f.password.value != this.f.confirmpassword.value) {
            this.error = "Password and Confirm Password are not matching";
            this.loaderService.display(false);
            return;
        }

        // stop here if form is invalid
        if (this.f.remember.value == null || this.f.remember.value == "") {
            this.error = "Please agree to our Privacy Policy and Terms";
            this.loaderService.display(false);
            return;
        }

        this.loading = true;
        this.authenticationService.signUp(this.f.firstname.value, this.f.lastname.value, this.f.email.value, this.f.password.value, this.f.company.value)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data.userId != null && data.userId != 0){
                        this.loaderService.display(false);
                        this.router.navigate(['/login']);
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
                });
    }
}