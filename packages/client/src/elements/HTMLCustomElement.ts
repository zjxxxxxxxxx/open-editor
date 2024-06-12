import { replaceChildren } from '../utils/dom';
import { CLIENT } from '../constants';

const BrowserHTMLElement = CLIENT
  ? HTMLElement
  : (class HTMLElement {} as typeof HTMLElement);

export abstract class HTMLCustomElement<
  State extends AnyObject = AnyObject,
> extends BrowserHTMLElement {
  declare readonly shadowRoot: ShadowRoot;
  protected declare readonly state: State;

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
    replaceChildren(this.shadowRoot, this.host());
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
