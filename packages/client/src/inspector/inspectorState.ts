export interface InspectorState {
  isEnable: boolean;
  isRending: boolean;
  isTreeOpen: boolean;
  activeEl: HTMLElement | null;
  prevActiveEl: HTMLElement | null;
}

export const inspectorState: InspectorState = {
  isEnable: false,
  isRending: false,
  isTreeOpen: false,
  activeEl: null,
  prevActiveEl: null,
};
