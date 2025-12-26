import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';

import { LoginCallbackComponent } from './login-callback.component';

describe('LoginCallbackComponent', () => {
  let fixture: ComponentFixture<LoginCallbackComponent>;
  let component: LoginCallbackComponent;
  let oktaAuth: {
    token: { parseFromUrl: jasmine.Spy<() => Promise<{ tokens: any; state: unknown }>> };
    tokenManager: { setTokens: jasmine.Spy<(tokens: any) => Promise<void>> };
  };
  let router: { navigate: jasmine.Spy };

  beforeEach(async () => {
    oktaAuth = {
      token: {
        parseFromUrl: jasmine.createSpy(),
      },
      tokenManager: {
        setTokens: jasmine.createSpy(),
      },
    };

    router = {
      navigate: jasmine.createSpy().and.resolveTo(true),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginCallbackComponent],
      providers: [
        { provide: OKTA_AUTH, useValue: oktaAuth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginCallbackComponent);
    component = fixture.componentInstance;
  });

  it('parses tokens and navigates with customerId when state is valid', async () => {
    oktaAuth.token.parseFromUrl.and.resolveTo({
      tokens: { idToken: {}, accessToken: {} },
      state: JSON.stringify({ customerId: 'abc123' }),
    });
    oktaAuth.tokenManager.setTokens.and.resolveTo();

    await (component as any).handleLoginCallback();

    expect(oktaAuth.tokenManager.setTokens).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/'],
      {
        queryParams: { customerId: 'abc123' },
        replaceUrl: true,
      },
    );
  });

  it('navigates without customerId when state is malformed', async () => {
    oktaAuth.token.parseFromUrl.and.resolveTo({
      tokens: { idToken: {}, accessToken: {} },
      state: 'not-json',
    });
    oktaAuth.tokenManager.setTokens.and.resolveTo();

    await (component as any).handleLoginCallback();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/'],
      {
        queryParams: undefined,
        replaceUrl: true,
      },
    );
  });

  it('redirects to logout on failure', async () => {
    oktaAuth.token.parseFromUrl.and.rejectWith(new Error('parse failure'));

    await (component as any).handleLoginCallback();

    expect(router.navigate).toHaveBeenCalledWith(['/logout'], { replaceUrl: true });
  });

  it('navigates without params when state is non-string', async () => {
    oktaAuth.token.parseFromUrl.and.resolveTo({
      tokens: { idToken: {}, accessToken: {} },
      state: { not: 'a string' } as unknown,
    });
    oktaAuth.tokenManager.setTokens.and.resolveTo();

    await (component as any).handleLoginCallback();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/'],
      {
        queryParams: undefined,
        replaceUrl: true,
      },
    );
  });

  it('drops empty customerId values', async () => {
    oktaAuth.token.parseFromUrl.and.resolveTo({
      tokens: { idToken: {}, accessToken: {} },
      state: JSON.stringify({ customerId: '   ' }),
    });
    oktaAuth.tokenManager.setTokens.and.resolveTo();

    await (component as any).handleLoginCallback();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/'],
      {
        queryParams: undefined,
        replaceUrl: true,
      },
    );
  });

  it('ngOnInit triggers the async handler', async () => {
    oktaAuth.token.parseFromUrl.and.resolveTo({
      tokens: { idToken: {}, accessToken: {} },
      state: undefined,
    });
    oktaAuth.tokenManager.setTokens.and.resolveTo();
    const handler = spyOn<any>(component, 'handleLoginCallback').and.callThrough();

    component.ngOnInit();

    await handler.calls.mostRecent().returnValue;
    expect(oktaAuth.tokenManager.setTokens).toHaveBeenCalled();
  });
});
