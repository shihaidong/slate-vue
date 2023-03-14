import { Editor } from "slate";
// hotkey中的函数返回true则表示不执行接下来的操作

export const HOTKEYS: Record<string, string> = {
  Escape: "Escape",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  CapsLock: "CapsLock",
  Unidentified: "Unidentified",
  Meta: "Meta",
  Alt: "Alt",
  ContextMenu: "ContextMenu",
  Tab: "Tab",
  Control: "Control",
  Shift: "Shift",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  Backspace: "Backspace",
  Delete: "Delete",
  ArrowUp: "Arrow",
  ArrowDown: "Arrow",
  ArrowLeft: "Arrow",
  ArrwoRight: "Arrwo",
  NumLock: "NumLock"
};

export function isHotKeys(key: string) {
  if (Object.keys(HOTKEYS).includes(key)) {
    return true;
  }
  return false;
}


export class KeyEvent {
  private event: Array<Function>;
  constructor() {
    this.event = [];
  }

  use(fn: Function) {
    this.event.push(fn)
  }
  
  emit(event: KeyboardEvent, editor: Editor, next?: Function) {
    // debugger
    if(this.event.length === 0) {
      return
    }
    let arr = [this.event[this.event.length - 1]]
    for(let i = this.event.length - 2; i >= 0; i--) {

      let temp = arr[arr.length - 1]

      let wrap = (e: KeyboardEvent, editor: Editor) => {
        const n = (e: KeyboardEvent, editor: Editor) => {
          return (text: any) => {
            if(text) {
              temp(text, next)
            }else {
              temp(e, editor, next);
            }
          }
        }
        this.event[i](e, editor, n(e, editor))
      }
      arr.push(wrap)
    }
    arr[arr.length - 1](event, editor)    
  }
}