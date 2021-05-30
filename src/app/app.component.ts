import { Component, Renderer2 } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService, LoaderService } from './_services';
import { User } from './_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [],
  preserveWhitespaces: true
})

export class AppComponent {
  title = 'create-portal';
  currentUser: User;
  isLogged: boolean=false;
  showLoader: boolean;
  previousUrl: string;

  constructor(
        private renderer: Renderer2,
        private router: Router,
        private authenticationService: AuthenticationService,
        private loaderService: LoaderService
  ) {
      this.authenticationService.currentUser.subscribe((x: any) => this.currentUser = x);
      if(this.currentUser.userId == 0){
        this.isLogged = false;
      }
      else{
        this.isLogged = true;   
        if(this.currentUser.userId == -1){
          this.authenticationService.getUser(atob(this.currentUser.apikey!))
          .pipe(first())
          .subscribe(
            (data: any) => {
              this.isLogged = true;   
            },
            (error: any) => {
              this.isLogged = false;
            }
          );     
        }
      }
      
      this.router.events
      .subscribe((event: any) => {
        if (event instanceof NavigationStart) {
          if (this.previousUrl) {
            this.renderer.removeClass(document.body, this.previousUrl);
          }
          let currentUrlSlug = event.url.slice(1)
          if (currentUrlSlug) {
            this.renderer.addClass(document.body, currentUrlSlug);
          }
          this.previousUrl = currentUrlSlug;
        }
      });
    }    

  ngOnInit() {
    this.loaderService.status.subscribe((val: boolean) => {
      setTimeout(() => this.showLoader = val, 0);
    });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
