import { Component, OnInit } from '@angular/core';
import { ToastService, ToastData } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  toast$: Observable<ToastData | null>;

  constructor(private toastService: ToastService) {
    this.toast$ = this.toastService.getToast();
  }

  ngOnInit(): void {}

  handleAction(callback: () => void): void {
    callback();
    this.close();
  }

  close(): void {
    this.toastService.clear();
  }
}