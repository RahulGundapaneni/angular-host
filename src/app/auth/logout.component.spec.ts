import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';

import { LogoutComponent } from './logout.component';
import { environment } from '../../environments/environment';

describe('LogoutComponent', () => {
  let fixture: ComponentFixture<LogoutComponent>;
  let component: LogoutComponent;
  let oktaAuth: { signOut: jasmine.Spy<(options: { postLogoutRedirectUri: string }) => Promise<void>> };
  let router: { navigate: jasmine.Spy };

  function setupTest(queryParams: Record<string, string | undefined>) {
    const route = {
      snapshot: {
        queryParamMap: {
          has: (key: string) => key in queryParams,
        },
      },
    } as unknown as ActivatedRoute;

    return route;
  }

  beforeEach(async () => {
    oktaAuth = {
      signOut: jasmine.createSpy(),
    };

    router = {
      navigate: jasmine.createSpy().and.resolveTo(true),
    };

    await TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        { provide: OKTA_AUTH, useValue: oktaAuth },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: setupTest({}) },
      ],
    }).compileComponents();
  });

  it('calls signOut when not already done', async () => {
    oktaAuth.signOut.and.resolveTo();
    const route = setupTest({});
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;

    await (component as any).handleLogout();

    expect(oktaAuth.signOut).toHaveBeenCalledWith({
      postLogoutRedirectUri: `${environment.auth.postLogoutRedirectUri}?done=1`,
    });
    expect(component['signedOut']).toBeFalse();
  });

  it('marks signedOut when done flag is present', async () => {
    const route = setupTest({ done: '1' });
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;

    await (component as any).handleLogout();

    expect(component['signedOut']).toBeTrue();
    expect(oktaAuth.signOut).not.toHaveBeenCalled();
  });

  it('navigates home on signOut failure', async () => {
    oktaAuth.signOut.and.rejectWith(new Error('fail'));
    const route = setupTest({});
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;

    await (component as any).handleLogout();

    expect(router.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it('ngOnInit triggers the async handler', async () => {
    oktaAuth.signOut.and.resolveTo();
    const route = setupTest({});
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    const handler = spyOn<any>(component, 'handleLogout').and.callThrough();

    component.ngOnInit();

    await handler.calls.mostRecent().returnValue;
    expect(oktaAuth.signOut).toHaveBeenCalled();
  });
});
