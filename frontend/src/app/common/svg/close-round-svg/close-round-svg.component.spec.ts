import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseRoundSvgComponent } from './close-round-svg.component';

describe('CloseRoundSvgComponent', () => {
  let component: CloseRoundSvgComponent;
  let fixture: ComponentFixture<CloseRoundSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseRoundSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseRoundSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
