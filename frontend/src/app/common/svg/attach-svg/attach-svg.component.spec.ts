import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachSvgComponent } from './attach-svg.component';

describe('AttachSvgComponent', () => {
  let component: AttachSvgComponent;
  let fixture: ComponentFixture<AttachSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
