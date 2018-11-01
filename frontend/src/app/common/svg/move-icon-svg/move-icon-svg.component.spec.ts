import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveIconSvgComponent } from './move-icon-svg.component';

describe('MoveIconSvgComponent', () => {
  let component: MoveIconSvgComponent;
  let fixture: ComponentFixture<MoveIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
