import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataColumnListComponent} from './data-column-list.component';

describe('DataColumnListComponent', () => {
    let component: DataColumnListComponent;
    let fixture: ComponentFixture<DataColumnListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataColumnListComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataColumnListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
