import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdrCheckboxComponent } from './idr-checkbox.component';

describe('IdrCheckboxComponent', () => {
  let component: IdrCheckboxComponent;
  let fixture: ComponentFixture<IdrCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdrCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdrCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
