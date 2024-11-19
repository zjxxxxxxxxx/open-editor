export interface InspectorState {
  isEnable: boolean;
  isActive: boolean;
  isRending: boolean;
  isTreeOpen: boolean;
  activeEl: HTMLElement | null;
  prevActiveEl: HTMLElement | null;
}

export const inspectorState: InspectorState = {
  isEnable: false,
  isActive: false,
  isRending: false,
  isTreeOpen: false,
  activeEl: null,
  prevActiveEl: null,
};
