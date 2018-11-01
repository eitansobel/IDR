import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdrModalWrapComponent } from './idr-modal-wrap.component';

describe('IdrModalWrapComponent', () => {
  let component: IdrModalWrapComponent;
  let fixture: ComponentFixture<IdrModalWrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdrModalWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdrModalWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
