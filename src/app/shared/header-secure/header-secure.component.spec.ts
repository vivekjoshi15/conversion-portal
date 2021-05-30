import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSecureComponent } from './header-secure.component';

describe('HeaderSecureComponent', () => {
  let component: HeaderSecureComponent;
  let fixture: ComponentFixture<HeaderSecureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderSecureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSecureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
