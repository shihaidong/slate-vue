import { Editor, Point, Node, Transforms, Path, Range, Element as SlateElement } from "slate";

const LIST_TYPES: Array<string> = ["ul", "ol"];
const TEXT_ALIGN_TYPES: Array<string> = ["left", "center", "right", "justify"];
const toggleMark = (editor: Editor, format: string, value = true) => {
  if (isMarkActive(editor, format)) {
    editor.removeMark(format);
  } else {
    editor.addMark(format, value);
  }
  // refushMark()
  // refush();
};

const isMarkActive = (editor: Editor, e: string) => {
  const marks: any = Editor.marks(editor);
  const isActive = marks[e] ? true : false;
  return isActive;
};
const isBlockActive = (editor: Editor, format: String, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "textAlign" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {match: (n) =>  { console.log(n);return !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format)},split: true});
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      textAlign: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "li" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
  // refushMark();
  // refush();
};

export {
  isBlockActive,
  toggleBlock,
  isMarkActive,
  toggleMark
}

