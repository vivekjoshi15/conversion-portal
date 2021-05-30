import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
    profileForm: FormGroup ;
    loading = false;
    showLoader: boolean;
    currentUser: User;
    submitted = false;
    error: any = '';
    success: any = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
    }

    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            company: [''],
            email: ['', Validators.required],
            phone: [''],
            password: [''],
            confirmpassword: [''],
            mailchimpKey: [''],
        });

        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
            if(this.currentUser.userId > 0){   
                this.profileForm.controls.firstname.setValue(this.currentUser.firstname);
                this.profileForm.controls.lastname.setValue(this.currentUser.lastname);
                this.profileForm.controls.company.setValue(this.currentUser.company);
                this.profileForm.controls.email.setValue(this.currentUser.userEmail);
                this.profileForm.controls.phone.setValue(this.currentUser.userphone);
                this.profileForm.controls.mailchimpKey.setValue(this.currentUser.MailChimpApiKey);
                this.profileForm.controls.password.setValue('');
            }
        });

        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });
    }    

    // convenience getter for easy access to form fields
    get f() { return this.profileForm.controls; }

    onSubmit() {
        this.loaderService.display(true);
        this.submitted = true;
        this.success = "";
        this.error = "";

        if (this.profileForm.invalid) {
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

        this.loading = true;
        this.authenticationService.updateUser(this.currentUser.userId, this.f.firstname.value, this.f.lastname.value, this.f.email.value, this.f.password.value, this.f.company.value, this.f.phone.value, this.f.mailchimpKey.value, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data.userId != null && data.userId != 0){
                        this.loading = false;

                        this.authenticationService.getUser(data.apikey)
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
                                
                        this.loaderService.display(false);
                        this.success = "Profile Updated!!!";
                    }
                    else{
                        this.error = data.message;
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
}