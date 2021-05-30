import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})

export class ResetComponent implements OnInit {
	resetForm: FormGroup ;
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
        this.resetForm = this.formBuilder.group({
            email: ['', Validators.required]
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
            this.error = "Please fill email";
            this.loaderService.display(false);
            return;
        }

        this.loading = true;
        this.authenticationService.reset(this.f.email.value)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data[0].result != "fail"){
                        this.resetForm.controls.email.setValue('');
                        this.loaderService.display(false);
                        this.submitted = false;
                        this.loading = false;
                        this.error = "Email sent with instructions";
                    }
                    else{
                        this.error = data[0].message;
                        this.loading = false;
                        this.submitted = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.error = "Error while resetting password";
                    this.loading = false;
                    this.submitted = false;
                    this.loaderService.display(false);
                });
    }
}