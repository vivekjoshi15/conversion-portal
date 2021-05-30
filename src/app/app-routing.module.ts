import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './views/login';
import { ResetComponent } from './views/reset';
import { SignupComponent } from './views/signup';
import { HomeComponent } from './views/home';
import { ProfileComponent } from './views/profile';
import { SettingsComponent } from './views/settings';
import { StoreComponent } from './views/store';
import { ModuleComponent } from './views/module';
import { CampaignComponent } from './views/campaign';
import { ReportsComponent } from './views/reports';
import { ForgotPasswordComponent } from './views/forgotpassword';
import { BulkUploadComponent } from './views/bulkupload';

import { AuthGuard } from './_helpers';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]}, 
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard]}, 
  { path: 'reports/:templateId', component: ReportsComponent, canActivate: [AuthGuard]}, 
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard]},  
  { path: 'modules', component: ModuleComponent, canActivate: [AuthGuard]},  
  { path: 'stores/:companyId', component: StoreComponent, canActivate: [AuthGuard]}, 
  { path: 'campaigns/:companyId', component: CampaignComponent, canActivate: [AuthGuard]},  
  { path: 'bulkupload/:id', component: BulkUploadComponent, canActivate: [AuthGuard]},  
  { path: 'login', component: LoginComponent }, 
  { path: 'reset', component: ResetComponent },
  { path: 'sign-up', component: SignupComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: "enabled",
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
