import { authContext, maskClientId } from './logging.util';

describe('logging util', () => {
  it('masks clientId and returns auth context', () => {
    const context = authContext();

    expect(context['issuer']).toContain('okta.com');
    expect(context['clientId'].endsWith('ID')).toBeTrue();
    expect(context['clientId'].startsWith('***')).toBeTrue();
    expect(context['redirectUri']).toContain('/login');
    expect(context['postLogoutRedirectUri']).toContain('/logout');
  });

  it('masks short clientId safely', () => {
    const masked = maskClientId('abc');
    expect(masked).toBe('***');
  });

  it('handles missing clientId', () => {
    const masked = maskClientId(undefined);
    expect(masked).toBe('n/a');
  });
});
