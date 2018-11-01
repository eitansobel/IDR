import {Injectable} from '@angular/core';

@Injectable()
export class DataColumnsUpdateIntervalMapService {
    private updateNeededMap = {
        1: "Every 15 min",
        2: "Every 30 min",
        3: "Every 45 min",
        4: "Every 1 hr",
        5: "Every 2 hrs",
        6: "Every 3 hrs",
        7: "Every 4 hrs",
        8: "Every 5 hrs",
        9: "Every 6 hrs",
        10: "Every 7 hrs",
        11: "Every 8 hrs",
        12: "Every 9 hrs",
        13: "Every 10 hrs",
        14: "Every 11 hrs",
        15: "Every 12 hrs",
        16: "Daily",
        17: "PRN",
        18: "No Alert Required"
    };

    get getLabelValue() {
        return Object.entries(this.updateNeededMap).map(item => {
            return {value: item[0], label: item[1]};
        });
    }

    get keyValueMap() {
        return this.updateNeededMap;
    }

    secondsToUpdate(updateValue) {
        switch (updateValue) {
            case 1:
                return 15 * 60 * 1000;
            case 2:
                return 30 * 60 * 1000;
            case 3:
                return 45 * 60 * 1000;
            case 4:
                return 60 * 60 * 1000;
            case 5:
                return 2 * 60 * 60 * 1000;
            case 6:
                return 3 * 60 * 60 * 1000;
            case 7:
                return 4 * 60 * 60 * 1000;
            case 8:
                return 5 * 60 * 60 * 1000;
            case 9:
                return 6 * 60 * 60 * 1000;
            case 10:
                return 7 * 60 * 60 * 1000;
            case 11:
                return 8 * 60 * 60 * 1000;
            case 12:
                return 9 * 60 * 60 * 1000;
            case 13:
                return 10 * 60 * 60 * 1000;
            case 14:
                return 11 * 60 * 60 * 1000;
            case 15:
                return 12 * 60 * 60 * 1000;
            default:
                return null;
        }
    }
}
