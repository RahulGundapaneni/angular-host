declare module 'agentUi/AgentApp' {
  export interface AgentUiProps {
    customerId?: string;
  }

  export function mountAgentUi(target: HTMLElement, props?: AgentUiProps): Promise<HTMLElement>;
  export function updateAgentUi(props: AgentUiProps): void;
  export function unmountAgentUi(): Promise<void>;
}
