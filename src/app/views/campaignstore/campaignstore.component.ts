import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-campaignstore',
  templateUrl: './campaignstore.component.html',
  styleUrls: ['./campaignstore.component.scss']
})

export class CampaignStoreComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    id: number = 0;
    companyId: any= 0;    
    campaignName: string = "";
    campaigns: any = [];
    campaign: any = null;
    static: any = null;
    order: string = 'storeId';
    reverse: boolean = false;
    selView: number =  -1;
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
      this.id = this.route.snapshot.params.id;
      this.companyId = this.route.snapshot.params.companyId;
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
        id: ['0'],
        companyId: ['0'],
        name: ['', Validators.required],
        uniqueUrl: [''],
        headerText: [''],
        isActive: ['']
      });

      this.authenticationService.currentUser.subscribe((x: any) => {
        this.currentUser = x;
      });

      this.loaderService.status.subscribe((val: boolean) => {
        setTimeout(() => this.showLoader = val, 0);
      });

      this.getCampaign();
    } 

    getCampaign(){
        if(this.id != 0){
            this.loading = true;
            this.loaderService.display(true);
            this.authenticationService.getCampaign(this.id, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null && data.uid != ''){
                            this.campaignName=data.name;
                            this.getCampaignStores();
                            this.error = "";
                        }
                        else{
                            this.campaignName = "";
                            this.error = "No store found";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.campaignName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
        }
    }   

    getCampaignStores(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getCampaignStores(this.companyId, this.id, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.length > 0){
                        this.campaigns = data;
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                    else{
                        this.campaigns = [];
                        this.error = "no campaign store found";
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.campaigns = [];
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

      this.campaign = {
        Id: this.f.id.value,
        CompanyId: this.companyId,
        Name: this.f.name.value,
        UniqueUrl: this.f.uniqueUrl.value,
        StartDate: this.f.startDate.value,
        EndDate: this.f.endDate.value,
        TextColor: this.f.textColor.value?.hex,
        HeaderColor: this.f.headerColor.value?.hex,
        HeaderText: this.f.headerText.value,
        IsActive: (this.f.isActive.value==true)?1:0,
      };

      if(this.isNew){
        this.authenticationService.createCampaign(this.campaign, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "campaign store created!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCampaignStores();
                  }
                  else{
                    this.error = "error on campaign store creation";
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
        this.authenticationService.updateCampaign(this.campaign, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "campaign store updated!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCampaignStores();
                  }
                  else{
                    this.error = "error on campaign store updated";
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

    removeCampaign(Id: number) {
      if(confirm('Are you sure you want to delete this campaign store?')){
        this.loaderService.display(true);
        this.authenticationService.deleteCampaign(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){    
                    this.success = "campaign store deleted!!!";   
                    this.loading = false;
                    this.loaderService.display(false);                    
                     this.campaigns = this.campaigns.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on campaign store deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
                  this.error = error;
              });
      }
    }

    edit(campaign: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;

      this.campaign= campaign;

      this.form.controls.id.setValue(this.campaign.id);
      this.form.controls.name.setValue(this.campaign.name);
      this.form.controls.uniqueUrl.setValue(this.campaign.uniqueUrl);
      this.form.controls.headerText.setValue(this.campaign.headerText);
      this.form.controls.isActive.setValue(this.campaign.isActive);
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;

      this.campaign= null;

      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.headerText.setValue('');
      this.form.controls.isActive.setValue('');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;

      this.campaign= null;

      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.headerText.setValue('');
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

    goto(){
      this.router.navigate(["campaigns/" + this.companyId]);
    }
}