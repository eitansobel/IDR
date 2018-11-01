import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryContactsComponent } from './country-contacts.component';

describe('CountryContactsComponent', () => {
  let component: CountryContactsComponent;
  let fixture: ComponentFixture<CountryContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
