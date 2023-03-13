import { Editor, Point, Node, Transforms, Path } from "slate";

export const BLANK_CHARACTER = '﻿'

function getText(editor: Editor, path: Path) {
  return 
}

export function deleteBackward(editor: Editor) {
  if(!editor.selection) {
    return
  }
  // 如果当前没有选中内容，则删除光标前一个字符否则删除选中的内容
  if(Point.equals(editor.selection?.anchor, editor.selection.focus)) {
    // 判断当前字符是否是一个空的fragement
    if(Node.leaf(editor, editor.selection.anchor.path).text === BLANK_CHARACTER) {
      console.log(Node.get(editor, editor.selection.anchor.path))
      Transforms.select(editor, {
        anchor: {
          offset: 1,
          path: editor.selection.anchor.path
        },
        focus: {
          offset: 1,
          path: editor.selection.focus.path
        }
      })
      Editor.deleteBackward(editor, { unit: 'line' })
      console.log(JSON.parse(JSON.stringify(editor)))
      Editor.deleteBackward(editor, { unit: 'character'})
    } else {
      Editor.deleteBackward(editor, {unit: 'character'})
    }
    
  }else {
    Editor.deleteFragment(editor)
  }
  // 如果删除某一个fragment为空时，必须插入一个空的字符，保证dom中的range可以获取到
  if (Node.leaf(editor, editor.selection.anchor.path).text === '') {
    Transforms.insertText(editor, BLANK_CHARACTER)
  }
}


export function deleteForward(editor: Editor) {
  if(!editor.selection) {
    return
  }
  if(Point.equals(editor.selection?.anchor, editor.selection.focus)) {
    if(Node.leaf(editor, editor.selection.anchor.path).text === BLANK_CHARACTER) {
      Transforms.select(editor, {
        anchor: {
          offset: 0,
          path: editor.selection.anchor.path
        },
        focus: {
          offset: 0,
          path: editor.selection.focus.path
        }
      })
      
      Editor.deleteForward(editor, { unit: 'character'})
      Editor.deleteForward(editor, { unit: 'line' })
    }else {
      Editor.deleteForward(editor, {unit: 'character'})
    }
    
  }else {
    Editor.deleteFragment(editor)
  }
  // 当按delete键删除到最后一个字符时，保证dom中的range，所以插入一个空白字符
  if (Node.leaf(editor, editor.selection.anchor.path).text === '') {
    Transforms.insertText(editor, BLANK_CHARACTER)
  }
}


export function insertNewRow(editor: Editor) {
  Editor.insertBreak(editor)
  Editor.insertText(editor, BLANK_CHARACTER)
}
