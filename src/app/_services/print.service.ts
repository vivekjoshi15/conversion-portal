import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable()
export class PrintingService {
    
    popupWindow: Window;
    companyName: string;

    constructor(private winSrv: WindowService) {
        // getting the native window obj
        this.popupWindow = winSrv.nativeWindow;
    }

    public print(printEl: HTMLElement) {
        let printContainer: HTMLElement = document.getElementById('print-container') as HTMLElement;
        let popupWinindow: Window;

        if (!printContainer) {
            printContainer = document.createElement('div');
            printContainer.id = 'print-container';
        }

        printContainer.innerHTML = '';

        let elementCopy = printEl.cloneNode(true);
        printContainer.appendChild(elementCopy);
        //document.body.appendChild(printContainer);

        var title = this.companyName;

        //window.print();
        var window = this.popupWindow.open('', '_blank', 'width=650,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no') as Window;
        window.document.open();
        window.document.write('<html><head><title>' + title+'</title><style></style></head><body onload="window.print();window.close()">' + printContainer.innerHTML + '</body></html>');
        window.document.close();
    }
}