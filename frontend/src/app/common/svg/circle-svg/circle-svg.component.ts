import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'idr-circle-svg',
  templateUrl: './circle-svg.component.html',
  styleUrls: ['./circle-svg.component.scss']
})
export class CircleSvgComponent implements OnInit {
  @Input() color: string;

  constructor() {
  }

  ngOnInit() {
  }

}
