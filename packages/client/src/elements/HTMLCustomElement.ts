import { resetChildren } from '../utils/ui';

export abstract class HTMLCustomElement<
  State extends AnyObject = AnyObject,
> extends HTMLElement {
  readonly shadowRoot: ShadowRoot = undefined as unknown as ShadowRoot;
  protected readonly state: State = undefined as unknown as State;

  public constructor(state: Partial<State> = {}) {
    super();
    this.state = state as State;
    Object.defineProperty(this, 'shadowRoot', {
      value: this.attachShadow({ mode: 'closed' }),
    });
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ) {
    this.attrChanged?.(name, parse(newValue), parse(oldValue));
  }

  public connectedCallback() {
    resetChildren(this.shadowRoot, this.host());
    this.mounted?.();
  }

  public disconnectedCallback() {
    this.unmount?.();
  }

  protected abstract host(): HTMLElement;
  protected attrChanged?(name: string, newValue: any, oldValue: any): void;
  protected mounted?(): void;
  protected unmount?(): void;
}

function parse(val: string) {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}
