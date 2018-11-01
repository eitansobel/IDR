import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormWrapComponent } from './form-wrap.component';

describe('FormWrapComponent', () => {
  let component: FormWrapComponent;
  let fixture: ComponentFixture<FormWrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
