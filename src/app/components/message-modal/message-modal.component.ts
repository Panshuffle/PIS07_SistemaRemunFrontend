import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalMessageService } from '../../services/modal-message.service';

@Component({
  selector: 'app-message-modal',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './message-modal.component.html',
})
export class MessageModalComponent implements OnInit {
  message: string = '';
  modalSubscription: Subscription | undefined;
  modalSubscriptionType: Subscription | undefined;
  iconClass: string = '';
  type: boolean | undefined;
  iconStyles: any = {};


  constructor(private modalService: ModalMessageService) { }

  ngOnInit(): void {
    this.modalSubscription = this.modalService.modalState$.subscribe(message => {
      this.message = message;
      this.openModal();
    });
    this.modalSubscriptionType = this.modalService.modalType$.subscribe(type =>{
      this.type = type;
      this.iconClass = this.type ? 'text-danger' : 'text-success';
      this.iconStyles = {
        'font-size': '3rem',
        'color': this.type ? '#eb6c5b' : '#009632',
      };
    })


  }

  ngOnDestroy(): void {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  openModal() {
    const modalElement = document.getElementById('popup-modal');
    if (modalElement) {
      modalElement.classList.remove('hidden');
    }
  }

  closeModal() {
    const modalElement = document.getElementById('popup-modal');
    if (modalElement) {
      modalElement.classList.add('hidden');
    }
  }
}
