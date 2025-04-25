import { Component, OnInit, OnDestroy } from '@angular/core';

type BarrierState = 'closed' | 'opening' | 'opened' | 'closing';

@Component({
  selector: 'app-portar-home',
  standalone: false,
  templateUrl: './portar-home.component.html',
  styleUrl: './portar-home.component.css'
})
export class PortarHomeComponent implements OnInit, OnDestroy {
  barrierState: BarrierState = 'closed';
  buttonDisabled = false;
  currentTime: string = '';
  private timeInterval: any;

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  toggleBarrier() {
    if (this.barrierState === 'closed') {
      this.startOpening();
    } else if (this.barrierState === 'opened') {
      this.startClosing();
    }
  }

  private startOpening() {
    this.buttonDisabled = true;
    this.barrierState = 'opening';
    setTimeout(() => {
      this.barrierState = 'opened';
      this.buttonDisabled = false;
    }, 3000);
  }

  private startClosing() {
    this.buttonDisabled = true;
    this.barrierState = 'closing';
    setTimeout(() => {
      this.barrierState = 'closed';
      this.buttonDisabled = false;
    }, 3000);
  }
}
