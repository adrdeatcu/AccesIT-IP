import { Component } from '@angular/core';

type BarrierState = 'closed' | 'opening' | 'opened' | 'closing';

@Component({
  selector: 'app-portar-home',
  standalone: false,
  templateUrl: './portar-home.component.html',
  styleUrl: './portar-home.component.css'
})
export class PortarHomeComponent {
  barrierState: BarrierState = 'closed';
  buttonDisabled = false;

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
