import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { AuthenticationService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-header-secure',
  templateUrl: './header-secure.component.html',
  styleUrls: ['./header-secure.component.scss']
})
export class HeaderSecureComponent implements OnInit {
   currentUser: User;
   username: string;
   previousUrl: string;

  constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { 
    }   

    ngOnInit() {
        this.router.events
          .subscribe((event: any) => {
            if (event instanceof NavigationStart) {              
              let currentUrlSlug = event.url.slice(1);  
              if(currentUrlSlug == undefined){
                this.previousUrl = '';
              }       
              else{
                this.previousUrl = currentUrlSlug;
              }
            }
          });

        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
            if(this.currentUser.userId > 0){
              this.username = (this.currentUser.firstname)?this.currentUser.firstname:'' + ' ' + (this.currentUser.lastname)?this.currentUser.lastname:'';
            }
        });
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    getColor(url: string){
        if(this.previousUrl == url){
            return "1";
        }
        else{
            return "0.8";   
        }
    }
}
