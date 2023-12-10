import { append } from '../utils/ui';

export abstract class HTMLCustomElement<
  State extends AnyObject = AnyObject,
> extends HTMLElement {
  readonly shadowRoot!: ShadowRoot;
  readonly state: State;

  constructor(state: Partial<State> = {}) {
    super();

    this.state = state as State;

    const shadow = this.attachShadow({ mode: 'closed' });
    Object.defineProperty(this, 'shadowRoot', {
      value: shadow,
    });
    append(shadow, this.host());
  }

  abstract host(): HTMLElement;
  abstract connectedCallback(): void;
  abstract disconnectedCallback(): void;
}
