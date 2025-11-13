import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { HostComponent } from './host.component';
import { AgentUiHostService } from '../../services/agent-ui-host.service';

const createParamMap = (customerId?: string): ParamMap =>
  convertToParamMap(customerId ? { customerId } : {});

describe('HostComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;
  let params$: BehaviorSubject<ParamMap>;
  let remoteHost: jasmine.SpyObj<AgentUiHostService>;

  const emitCustomer = async (customerId?: string): Promise<void> => {
    params$.next(createParamMap(customerId));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject<ParamMap>(createParamMap());
    remoteHost = jasmine.createSpyObj<AgentUiHostService>('AgentUiHostService', [
      'mount',
      'update',
      'unmount',
    ]);
    remoteHost.mount.and.resolveTo(undefined);
    remoteHost.update.and.resolveTo(undefined);
    remoteHost.unmount.and.resolveTo(undefined);

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: params$.asObservable() } },
        { provide: AgentUiHostService, useValue: remoteHost },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('mounts the remote app when a customer id is provided', async () => {
    await emitCustomer('  12345  ');

    expect(remoteHost.mount).toHaveBeenCalledTimes(1);
    const [target, props] = remoteHost.mount.calls.mostRecent().args;
    const internals = component as unknown as {
      outlet?: { nativeElement: HTMLElement };
      currentCustomerId?: string;
    };

    expect(internals.outlet).toBeTruthy();
    expect(target).toBe(internals.outlet!.nativeElement);
    expect(props).toEqual({ customerId: '12345' });
    expect(internals.currentCustomerId).toBe('12345');
  });

  it('updates the remote app for subsequent customer changes', async () => {
    await emitCustomer('first');
    await emitCustomer('second');

    expect(remoteHost.mount).toHaveBeenCalledTimes(1);
    expect(remoteHost.update).toHaveBeenCalledWith({ customerId: 'second' });

    remoteHost.mount.calls.reset();
    remoteHost.update.calls.reset();

    await emitCustomer('second');

    expect(remoteHost.mount).not.toHaveBeenCalled();
    expect(remoteHost.update).not.toHaveBeenCalled();
  });

  it('unmounts the remote when the customer id disappears', async () => {
    await emitCustomer('abc');

    await emitCustomer();

    expect(remoteHost.unmount).toHaveBeenCalledTimes(1);
    const internals = component as unknown as { currentCustomerId?: string };
    expect(internals.currentCustomerId).toBeUndefined();
  });

  it('skips remote calls when the outlet is missing', async () => {
    const internals = component as unknown as {
      outlet?: { nativeElement: HTMLElement };
    };
    internals.outlet = undefined;

    await emitCustomer('noop');

    expect(remoteHost.mount).not.toHaveBeenCalled();
    expect(remoteHost.update).not.toHaveBeenCalled();
  });

  it('delegates cleanup to the host service on destroy', async () => {
    await component.ngOnDestroy();

    expect(remoteHost.unmount).toHaveBeenCalledTimes(1);
  });
});
