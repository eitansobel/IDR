import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HiwPageComponent } from './hiw-page.component';

describe('HiwPageComponent', () => {
  let component: HiwPageComponent;
  let fixture: ComponentFixture<HiwPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HiwPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiwPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
