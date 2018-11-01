import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodAlertComponent } from './method-alert.component';

describe('MethodAlertComponent', () => {
  let component: MethodAlertComponent;
  let fixture: ComponentFixture<MethodAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MethodAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MethodAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
