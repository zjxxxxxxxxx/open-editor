export interface InspectorState {
  isEnable: boolean;
  isActive: boolean;
  isRendering: boolean;
  isTreeOpen: boolean;
  activeEl: HTMLElement | null;
  prevActiveEl: HTMLElement | null;
}

export const inspectorState: InspectorState = {
  isEnable: false,
  isActive: false,
  isRendering: false,
  isTreeOpen: false,
  activeEl: null,
  prevActiveEl: null,
};
