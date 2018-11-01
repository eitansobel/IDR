import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSvgComponent } from './send-svg.component';

describe('SendSvgComponent', () => {
  let component: SendSvgComponent;
  let fixture: ComponentFixture<SendSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
