import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultBtnComponent } from './default-btn.component';

describe('DefaultBtnComponent', () => {
  let component: DefaultBtnComponent;
  let fixture: ComponentFixture<DefaultBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
