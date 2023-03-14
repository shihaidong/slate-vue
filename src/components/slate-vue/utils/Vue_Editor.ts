import { Editor, Point, Node, Transforms, Path, Range } from "slate";
import { ELEMENT_TO_NODE, PATH_TO_ELEMENT, NODE_TO_PATH } from "./mapData";
import { isDOMSelection } from './util'
export const BLANK_CHARACTER: string = '﻿'

// 获取指定path的string
export function getFragmentText(editor: Editor, path: Path) {
  const node = Node.get(editor, path)
  const str = Node.string(node)
  return str;
}

export function toSlateRange(editor: Editor, domRange: Selection | globalThis.Range) {
  let anchorNode
  let anchorOffset
  let focusNode
  let focusOffset
  if(isDOMSelection(domRange)) {
    anchorNode = domRange.anchorNode;
    anchorOffset = domRange.anchorOffset;
    focusNode = domRange.focusNode;
    focusOffset = domRange.focusOffset;
  } else {
    anchorNode = domRange.startContainer
    anchorOffset = domRange.startOffset
    focusNode = domRange.endContainer
    focusOffset = domRange.endOffset
  }
  
  if (anchorNode == null || anchorOffset == null || focusNode == null || focusOffset == null) {
    return null
  }
  let node =
    anchorNode.parentElement &&
    ELEMENT_TO_NODE.get(anchorNode?.parentElement);
  let last =
    focusNode?.parentElement &&
    ELEMENT_TO_NODE.get(focusNode?.parentElement);
  // 然后根据node获取path，
  let path = NODE_TO_PATH.get(node);
  let lpath = NODE_TO_PATH.get(last);
  const l = anchorNode.parentElement?.closest('.common')
  const r = anchorNode.parentElement?.closest('.common')
  const range = new window.Range()
  range.setStart(anchorNode, 0)
  range.setEnd(focusNode, focusOffset)
  if(range.toString() === BLANK_CHARACTER) {
    anchorOffset = 0;
    focusOffset = 0;
  }
  return {
    anchor: {
      offset: anchorOffset,
      path: path,
    },
    focus: {
      offset: focusOffset,
      path: lpath,
    },
  }
}

