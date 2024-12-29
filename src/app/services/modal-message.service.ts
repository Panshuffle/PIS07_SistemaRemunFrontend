import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalMessageService {
  private modalSubject = new Subject<string>();
  private modalTypeSubjext = new Subject<boolean>();
  modalState$ = this.modalSubject.asObservable();
  modalType$ = this.modalTypeSubjext.asObservable();

  showMessage(message: string, error:boolean) {
    this.modalSubject.next(message);
    this.modalTypeSubjext.next(error);
  }

}
