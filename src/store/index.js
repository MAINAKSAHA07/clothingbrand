import { proxy, subscribe } from 'valtio';

const state = proxy({
  intro: true,
  color: '#8b5cf6',
  isFrontLogoTexture: true,
  isBackLogoTexture: true,
  isFrontText: true,
  isBackText: true,
  isFullTexture: false,
  frontLogoDecal: './favicon.png',
  fullDecal: './texture.jpeg',
  frontLogoPosition: [ 0, 0.04, 0.15 ],
  frontLogoScale: 0.15,
  backLogoDecal: './favicon.png',
  backLogoPosition: [0, 0.04, -0.15],
  backLogoRotation: [0, Math.PI, 0],
  backLogoScale: 0.15,
  frontText: 'Front Text',
  frontTextPosition: [0, -0.04, 0.15],
  frontTextRotation: [0, 0, 0],
  frontTextFontSize: 0.1,
  frontTextScale: [0.15, 0.04, 0.1],
  frontTextFont: 'Arial',
  frontTextSize: 64,
  frontTextColor: 'black',
  backText: 'Back Text',
  backTextPosition: [0, -0.04, -0.15],
  backTextRotation: [0, Math.PI, 0],
  backTextFontSize: 0.1,
  backTextScale: [0.15, 0.04, 0.1],
  backTextFont: 'Arial',
  backTextSize: 64,
  backTextColor: 'white',
});

// --- DEBOUNCED UNDO HISTORY SYSTEM ---
export const historyStack = proxy({
  canUndo: false,
  list: []
});

let isUndoing = false;
let saveTimeout = null;

const saveHistory = () => {
  if (isUndoing) return;

  const snapshot = {
    color: state.color,
    isFrontLogoTexture: state.isFrontLogoTexture,
    isBackLogoTexture: state.isBackLogoTexture,
    isFrontText: state.isFrontText,
    isBackText: state.isBackText,
    isFullTexture: state.isFullTexture,
    frontLogoDecal: state.frontLogoDecal,
    fullDecal: state.fullDecal,
    frontLogoPosition: [...state.frontLogoPosition],
    frontLogoScale: state.frontLogoScale,
    backLogoDecal: state.backLogoDecal,
    backLogoPosition: [...state.backLogoPosition],
    backLogoRotation: [...state.backLogoRotation],
    backLogoScale: state.backLogoScale,
    frontText: state.frontText,
    frontTextPosition: [...state.frontTextPosition],
    frontTextRotation: [...state.frontTextRotation],
    frontTextScale: [...state.frontTextScale],
    backText: state.backText,
    backTextPosition: [...state.backTextPosition],
    backTextRotation: [...state.backTextRotation],
    backTextScale: [...state.backTextScale],
  };

  // Skip if identical to last snapshot (prevents duplicate saves)
  if (historyStack.list.length > 0) {
    const last = historyStack.list[historyStack.list.length - 1];
    if (JSON.stringify(last) === JSON.stringify(snapshot)) return;
  }

  historyStack.list.push(snapshot);

  // Limit stack size to 30 elements
  if (historyStack.list.length > 30) {
    historyStack.list.shift();
  }

  // Update undoability flag
  historyStack.canUndo = historyStack.list.length > 1;
};

// Subscribe to state updates with 400ms debounce
subscribe(state, () => {
  if (isUndoing) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveHistory();
  }, 400);
});

// Save initial state on start
setTimeout(() => {
  saveHistory();
}, 100);

// Exported undo function
export const undo = () => {
  if (historyStack.list.length <= 1) return;

  isUndoing = true;

  // Pop the current state from the stack
  historyStack.list.pop();

  // Retrieve the previous state
  const previousState = historyStack.list[historyStack.list.length - 1];

  if (previousState) {
    // Restore all parameters
    Object.keys(previousState).forEach((key) => {
      if (Array.isArray(previousState[key])) {
        state[key] = [...previousState[key]];
      } else {
        state[key] = previousState[key];
      }
    });
  }

  historyStack.canUndo = historyStack.list.length > 1;

  // Release the lock
  setTimeout(() => {
    isUndoing = false;
  }, 150);
};

export default state;

