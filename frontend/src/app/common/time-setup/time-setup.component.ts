import {Component, forwardRef, OnInit, ViewChild} from '@angular/core';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS, } from '@angular/forms';
import {ValueAccessorBase} from '../../models/value-accessor';
import * as moment from 'moment';
@Component({
    selector: 'idr-time-setup',
    templateUrl: './time-setup.component.html',
    styleUrls: ['./time-setup.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeSetupComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TimeSetupComponent),
            multi: true,
        },
    ],
})
export class TimeSetupComponent extends ValueAccessorBase<string> implements OnInit {
    today = new Date();
    minDate;
    minTime = new Date();
    selectedMoment: any = new Date();
    button;
    am_pmText;
    @ViewChild('hour12Timer') hour12Timer;
    ngOnInit() {
        const day = this.today.getDate();
        const month = this.today.getMonth();
        const year = this.today.getFullYear();
        this.minDate = new Date(year, month, day);
    }

    onClose($event) {
        if (moment(this.selectedMoment).format()) {
            if (this.minTime.getTime() > this.selectedMoment.format('x')) {
                this.selectedMoment = new Date();
                this.value = this.selectedMoment;
            }
        }
    }

    onCloseDate($event) {
        if(moment(this.selectedMoment).format('YYYY-DD-MM') === moment(this.today).format('YYYY-DD-MM')) {
            this.selectedMoment = new Date();
            this.value = this.selectedMoment;
        }
    }

    onOpen() {
        this.button = document.getElementsByClassName("owl-dt-timer-hour12-box");
        const open = document.getElementsByClassName("owl-dt-timer-hour12");
       
        this.am_pmText = this.button[0].childNodes[0].childNodes[0].textContent;
  
        let arrowTop = document.createElement("div");
        arrowTop.classList.add("topArrow");
        arrowTop.innerHTML = `<button _ngcontent-c17="" class="owl-dt-control-button owl-dt-control-arrow-button" tabindex="0" type="button" aria-label="Add a minute"><span _ngcontent-c17="" class="owl-dt-control-button-content" tabindex="-1"><svg _ngcontent-c17="" xml:space="preserve" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" style="enable-background:new 0 0 451.847 451.846;" version="1.1" viewBox="0 0 451.847 451.846" width="100%" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><path _ngcontent-c17="" d="M248.292,106.406l194.281,194.29c12.365,12.359,12.365,32.391,0,44.744c-12.354,12.354-32.391,12.354-44.744,0
        L225.923,173.529L54.018,345.44c-12.36,12.354-32.395,12.354-44.748,0c-12.359-12.354-12.359-32.391,0-44.75L203.554,106.4
        c6.18-6.174,14.271-9.259,22.369-9.259C234.018,97.141,242.115,100.232,248.292,106.406z"></path></svg></span></button>`;
        open[0].appendChild(arrowTop);
        let arrowBottom = document.createElement("div");
        arrowBottom.classList.add("bottomArrow");
        arrowBottom.innerHTML = `<button _ngcontent-c17="" class="owl-dt-control-button owl-dt-control-arrow-button" tabindex="0" type="button" disabled="" aria-label="Minus a minute"><span _ngcontent-c17="" class="owl-dt-control-button-content" tabindex="-1"><svg _ngcontent-c17="" xml:space="preserve" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" style="enable-background:new 0 0 451.847 451.846;" version="1.1" viewBox="0 0 451.847 451.846" width="100%" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><path _ngcontent-c17="" d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
        c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
        c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"></path></svg></span></button>`;
        open[0].appendChild(arrowBottom);
        if(this.am_pmText == 'AM'){
            arrowTop.classList.add("active");
        } else {
            arrowBottom.classList.add("active");
        }
             arrowTop.onclick = () => {
                 this.am_pmText = this.button[0].childNodes[0].childNodes[0].textContent;
                if(this.am_pmText == 'AM'){
                    this.button[0].click();
                        setTimeout(() => {
                            this.am_pmText = this.button[0].childNodes[0].childNodes[0].textContent;
                            arrowTop.classList.remove("active");
                            arrowBottom.classList.add("active");
                        });
                } 
            }
       
            arrowBottom.onclick = () => {
            
                if(this.am_pmText == 'PM'){
                    this.button[0].click();
                    setTimeout(() => {
                        this.am_pmText = this.button[0].childNodes[0].childNodes[0].textContent;
                        if(this.am_pmText == 'AM') {
                            arrowBottom.classList.remove("active");
                            arrowTop.classList.add("active");
                        }
                    });
                }
            }
        
       
        
    }
}
