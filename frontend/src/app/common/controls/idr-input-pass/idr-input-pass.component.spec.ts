import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdrInputPassComponent } from './idr-input-pass.component';

describe('IdrInputPassComponent', () => {
  let component: IdrInputPassComponent;
  let fixture: ComponentFixture<IdrInputPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdrInputPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdrInputPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
