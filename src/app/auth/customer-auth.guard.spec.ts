import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';

import { CustomerAuthGuard } from './customer-auth.guard';

describe('CustomerAuthGuard', () => {
  let guard: CustomerAuthGuard;
  let oktaAuth: {
    isAuthenticated: jasmine.Spy<() => Promise<boolean>>;
    signInWithRedirect: jasmine.Spy<(options: { originalUri: string; state: string }) => Promise<void>>;
  };

  beforeEach(() => {
    oktaAuth = {
      isAuthenticated: jasmine.createSpy().and.resolveTo(false),
      signInWithRedirect: jasmine.createSpy().and.resolveTo(),
    };

    TestBed.configureTestingModule({
      providers: [
        CustomerAuthGuard,
        { provide: OKTA_AUTH, useValue: oktaAuth },
      ],
    });

    guard = TestBed.inject(CustomerAuthGuard);
  });

  function mockRoute(customerId: string | null): ActivatedRouteSnapshot {
    return {
      queryParamMap: {
        get: (key: string) => (key === 'customerId' ? customerId : null),
      },
    } as unknown as ActivatedRouteSnapshot;
  }

  const state = { url: '/?customerId=123' } as RouterStateSnapshot;
  const blankState = { url: '' } as RouterStateSnapshot;

  it('allows navigation when already authenticated', async () => {
    oktaAuth.isAuthenticated.and.resolveTo(true);

    const result = await guard.canActivate(mockRoute('123'), state);

    expect(result).toBeTrue();
    expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
  });

  it('redirects to Okta when not authenticated', async () => {
    const result = await guard.canActivate(mockRoute('456'), state);

    expect(result).toBeFalse();
    expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
      originalUri: state.url,
      state: JSON.stringify({ customerId: '456' }),
    });
  });

  it('redirects to Okta when customerId is missing', async () => {
    const result = await guard.canActivate(mockRoute(null), state);

    expect(result).toBeFalse();
    expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
      originalUri: state.url,
      state: JSON.stringify({ customerId: null }),
    });
  });

  it('uses root path when state url is empty', async () => {
    const result = await guard.canActivate(mockRoute('789'), blankState);

    expect(result).toBeFalse();
    expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
      originalUri: '/',
      state: JSON.stringify({ customerId: '789' }),
    });
  });
});
