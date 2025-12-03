import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AgentUiHostService } from '../../services/agent-ui-host.service';

@Component({
  selector: 'app-host-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly remoteHost = inject(AgentUiHostService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('remoteOutlet', { static: true }) private outlet?: ElementRef<HTMLDivElement>;

  protected currentCustomerId: string | undefined;
  private mounted = false;

  ngAfterViewInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('customerId')?.trim() || undefined),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((customerId) => {
        void this.handleCustomer(customerId);
      });
  }

  ngOnDestroy(): void {
    void this.remoteHost.unmount();
  }

  private async handleCustomer(customerId: string | undefined): Promise<void> {
    const outlet = this.outlet?.nativeElement;
    if (!outlet) {
      return;
    }

    if (!customerId) {
      if (this.mounted) {
        await this.remoteHost.unmount();
        this.mounted = false;
        this.currentCustomerId = undefined;
      }
      return;
    }

    if (!this.mounted) {
      await this.remoteHost.mount(outlet, { customerId });
      this.mounted = true;
    } else if (customerId !== this.currentCustomerId) {
      await this.remoteHost.update({ customerId });
    }

    this.currentCustomerId = customerId;
  }
}
