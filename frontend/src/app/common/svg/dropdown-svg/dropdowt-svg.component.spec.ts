import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSvgComponent } from './dropdown-svg.component';

describe('DropdownSvgComponent', () => {
  let component: DropdownSvgComponent;
  let fixture: ComponentFixture<DropdownSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
