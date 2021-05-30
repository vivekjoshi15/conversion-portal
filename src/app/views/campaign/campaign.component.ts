import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Color } from '@angular-material-components/color-picker';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})

export class CampaignComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    companyId: any= 0;    
    companyName: string = "";
    campaigns: any = [];
    campaign: any = null;
    static: any = null;
    order: string = 'createdDate';
    reverse: boolean = true;
    selView: number =  -1;
    isForm: boolean= false;
    isNew: boolean= false;
    isEdit: boolean= false;
    disabled = false;
    color: ThemePalette = 'primary';
    touchUi = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
      this.companyId = this.route.snapshot.params.companyId;
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
        id: ['0'],
        companyId: ['0'],
        name: ['', Validators.required],
        uniqueUrl: [''],
        startDate: [''],
        endDate: [''],
        textColor: [new Color(255, 255, 255)],
        headerColor: [new Color(255, 255, 255)],
        headerText: [''],
        isActive: ['']
      });

      this.authenticationService.currentUser.subscribe((x: any) => {
        this.currentUser = x;
      });

      this.loaderService.status.subscribe((val: boolean) => {
        setTimeout(() => this.showLoader = val, 0);
      });

      this.getCompany();
    }  

    getCompany(){
      if(this.companyId != 0){
        this.loaderService.display(true);
        this.loading = true;
        this.authenticationService.getCompany(this.companyId, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null){
                          this.companyName=data.name;
                          this.error = "";
                          this.getCampaigns();
                        }
                        else{
                          this.companyName = "";
                          this.error = "No company found";
                          this.loading = false;
                          this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.companyName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
      }
    }  

    getCampaigns(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getCompanyCampaigns(this.companyId, this.currentUser.apikey)
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
                        this.error = "no campaign found";
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
                    this.success = "campaign created!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCampaigns();
                  }
                  else{
                    this.error = "error on campaign creation";
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
                    this.success = "campaign updated!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCampaigns();
                  }
                  else{
                    this.error = "error on campaign updated";
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
      if(confirm('Are you sure you want to delete this campaign?')){
        this.loaderService.display(true);
        this.authenticationService.deleteCampaign(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){    
                    this.success = "campaign deleted!!!";   
                    this.loading = false;
                    this.loaderService.display(false);                    
                     this.campaigns = this.campaigns.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on campaign deletion";
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
      this.form.controls.startDate.setValue(this.campaign.startDate);
      this.form.controls.endDate.setValue(this.campaign.endDate);
      this.form.controls.textColor.setValue(this.hexToRGB(this.campaign.textColor, false));
      this.form.controls.headerColor.setValue(this.hexToRGB(this.campaign.headerColor, false));
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
      this.form.controls.startDate.setValue('');
      this.form.controls.endDate.setValue('');
      this.form.controls.textColor.setValue(new Color(255, 255, 255));
      this.form.controls.headerColor.setValue(new Color(255, 255, 255));
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
      this.form.controls.startDate.setValue('');
      this.form.controls.endDate.setValue('');
      this.form.controls.textColor.setValue(new Color(255, 255, 255));
      this.form.controls.headerColor.setValue(new Color(255, 255, 255));
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

    hexToRGB(hex: any, alpha: any) {
      hex = hex.replace('#','');
      var r = parseInt(hex.substring(0,2), 16);
      var g = parseInt(hex.substring(2,4), 16);
      var b = parseInt(hex.substring(4,6), 16);

      if (alpha) {
          return new Color(r, g, b, alpha/100);
      } else {
          return new Color(r, g, b);
      }
  }
}