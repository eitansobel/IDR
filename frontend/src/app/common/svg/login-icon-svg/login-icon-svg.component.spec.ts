import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginIconSvgComponent } from './login-icon-svg.component';

describe('LoginIconSvgComponent', () => {
  let component: LoginIconSvgComponent;
  let fixture: ComponentFixture<LoginIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
