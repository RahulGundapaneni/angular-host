import { TestBed } from '@angular/core/testing';
import { loadRemoteModule } from '@angular-architects/module-federation-runtime';

import {
  AGENT_UI_REMOTE_CONFIG,
  AGENT_UI_REMOTE_LOADER,
  AgentUiRemoteConfig,
} from '../config/agent-ui-remote.token';
import { AgentUiHostService } from './agent-ui-host.service';

describe('AgentUiHostService', () => {
  let service: AgentUiHostService;
  let loaderSpy: jasmine.Spy;
  let mockModule: {
    mountAgentUi: jasmine.Spy;
    updateAgentUi: jasmine.Spy;
    unmountAgentUi: jasmine.Spy;
  };

  const config: AgentUiRemoteConfig = {
    remoteName: 'agentUi',
    exposedModule: './AgentApp',
    remoteEntry: 'http://localhost:4205/agentUiEntry.js',
    type: 'module',
  };

  beforeEach(() => {
    mockModule = {
      mountAgentUi: jasmine.createSpy('mountAgentUi').and.resolveTo(undefined),
      updateAgentUi: jasmine.createSpy('updateAgentUi'),
      unmountAgentUi: jasmine.createSpy('unmountAgentUi').and.resolveTo(undefined),
    };

    loaderSpy = jasmine.createSpy('loadRemoteModule').and.returnValue(
      Promise.resolve(mockModule as never),
    );

    TestBed.configureTestingModule({
      providers: [
        AgentUiHostService,
        { provide: AGENT_UI_REMOTE_CONFIG, useValue: config },
        { provide: AGENT_UI_REMOTE_LOADER, useValue: loaderSpy },
      ],
    });

    service = TestBed.inject(AgentUiHostService);
  });

  it('loads the remote module and mounts it with the provided props', async () => {
    const target = document.createElement('div');
    const props = { customerId: 'abc-123' } as never;

    await service.mount(target, props);

    expect(loaderSpy).toHaveBeenCalledTimes(1);
    expect(loaderSpy.calls.mostRecent().args[0]).toEqual({
      type: config.type,
      remoteEntry: config.remoteEntry,
      remoteName: config.remoteName,
      exposedModule: config.exposedModule,
    });
    expect(mockModule.mountAgentUi).toHaveBeenCalledWith(target, props);
  });

  it('reuses the loaded module for updates without reloading it', async () => {
    const target = document.createElement('div');
    await service.mount(target, { customerId: 'initial' } as never);

    loaderSpy.calls.reset();

    await service.update({ customerId: 'next' } as never);

    expect(loaderSpy).not.toHaveBeenCalled();
    expect(mockModule.updateAgentUi).toHaveBeenCalledWith({ customerId: 'next' });
  });

  it('ignores unmount calls before anything has been mounted', async () => {
    await service.unmount();

    expect(loaderSpy).not.toHaveBeenCalled();
    expect(mockModule.unmountAgentUi).not.toHaveBeenCalled();
  });

  it('cleans up the remote and allows it to be loaded again after unmount', async () => {
    const target = document.createElement('div');
    await service.mount(target, { customerId: 'one' } as never);
    await service.unmount();

    expect(mockModule.unmountAgentUi).toHaveBeenCalledTimes(1);

    loaderSpy.calls.reset();

    await service.mount(target, { customerId: 'two' } as never);

    expect(loaderSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back to the default loader when none is provided', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AgentUiHostService,
        { provide: AGENT_UI_REMOTE_CONFIG, useValue: config },
      ],
    });

    const fallbackService = TestBed.inject(AgentUiHostService) as unknown as {
      loader: typeof loadRemoteModule;
    };

    expect(fallbackService.loader).toBe(loadRemoteModule);
  });
});
