import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertCheckboxComponent } from './alert-checkbox.component';

describe('AlertCheckboxComponent', () => {
  let component: AlertCheckboxComponent;
  let fixture: ComponentFixture<AlertCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
