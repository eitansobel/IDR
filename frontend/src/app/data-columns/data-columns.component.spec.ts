import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataColumnsComponent} from './data-columns.component';
import {DataColumnsService} from "./services/data-columns.service";

describe('DataColumnsComponent', () => {
    let component: DataColumnsComponent;
    let fixture: ComponentFixture<DataColumnsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataColumnsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataColumnsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
