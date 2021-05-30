import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})

export class ModuleComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    modules: any = [];
    module: any = null;
    order: string = 'name';
    reverse: boolean = false;
    isForm: boolean= false;
    isNew: boolean= false;
    isEdit: boolean= false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
    
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
            id: ['0'],
            name: ['', Validators.required],
            type: ['', Validators.required],
            isActive: ['']
        });

        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
        });

        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });

        this.getModules();
    }

    getModules(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getModules(this.currentUser.apikey)
            .pipe(first())
            .subscribe(
              (data: any) => {
                if(data != null && data.length > 0){
                  this.modules = data;
                  this.loading = false;
                  this.loaderService.display(false);
                }
                else{
                  this.modules = [];
                  this.error = "no module found";
                  this.loading = false;
                  this.loaderService.display(false);
                  }
              },
              (error: any) => {
                this.modules = [];
                this.error = error;
                this.loading = false;
                this.loaderService.display(false);
              });
    }

    onSubmit(){  
      this.loaderService.display(true);
      this.submitted = true;
      this.success = "";
      this.error = "";

      if (this.form.invalid) {
        this.error = "Please fill required fields";
        this.loaderService.display(false);
        return;
      }

      this.loading = true;

      this.module = {
        Id: this.f.id.value,
        Name: this.f.name.value,
        Type: this.f.type.value,
        IsActive: (this.f.isActive.value==true)?1:0,
      };

      if(this.isNew){
        this.authenticationService.createModule(this.module, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "module created!!!";
                    this.module = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getModules();
                  }
                  else{
                    this.error = "error on module creation";
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
      else{
        this.authenticationService.updateModule(this.module, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "module updated!!!";
                    this.module = null;
                    this.loading = false;
                    this.loaderService.display(false);
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getModules();
                  }
                  else{
                    this.error = "error on module updated";
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

    removeModule(Id: number) {
      if(confirm('Are you sure you want to delete this module?')){
        this.loaderService.display(true);

        this.authenticationService.deleteModule(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){ 
                    this.success = "module deleted!!!";
                    this.loading = false;
                    this.loaderService.display(false);                    
                    this.modules = this.modules.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on module deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
              });
      }
    }

    edit(module: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;

      this.module= module;

      this.form.controls.id.setValue(this.module.id);
      this.form.controls.name.setValue(this.module.name);
      this.form.controls.type.setValue(this.module.type);
      this.form.controls.isActive.setValue(this.module.isActive);
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;

      this.module= null;
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.type.setValue('');
      this.form.controls.isActive.setValue('');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;

      this.module= null;
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.type.setValue('');
      this.form.controls.isActive.setValue('');
    }

    formatDate(value: any){
      var customDate = new Date(value.match(/\d+/)[0] * 1);  
      return  customDate;
    }

    setOrder(value: string) {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }

      this.order = value;
    }

    encode(value: string){
      return encodeURI(value);
    }   

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
}