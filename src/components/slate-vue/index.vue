<template>
  <div>
    <div>
      <DefaultFormat :transforms="{ toggleMark, toggleBlock, addNode, currentFormat, addMark }"></DefaultFormat>
      <slot v-bind="{ toggleMark, toggleBlock, addNode, currentFormat }"></slot>
    </div>
    <div
      ref="editorInstance"
      contenteditable="true"
      class="slate-main"
      @click="onClick"
      @beforeinput="onBeforeInput"
      @input="onInput"
      @keydown="onKeyDown"
      @compositionend="onCompositionend"
      @compositionupdate="onCompositionUpdate"
      @cut="onCut"
      @copy="onCopy"
      @paste="onPaste"
      @dragover="onDragOver"
      @dragend="onDragEnd"
      @drop="onDrop"
    >
      <ElementComponent
        v-for="(item, i) in data"
        :key="i"
        :path="[i]"
        :data="item"
        :renderElement="renderElement"
        :renderLeaf="renderLeaf"
      ></ElementComponent>
    </div>
  </div>
</template>

<script lang="ts">
import {
  createEditor,
  Descendant,
  Editor,
  Range,
  Transforms,
  Element as SlateElement,
} from "slate";
import { HAS_BEFORE_INPUT_SUPPORT } from "./utils/environment";
import {
  nextTick,
  onUpdated,
  getCurrentInstance,
  reactive,
  toRaw,
  ref,
} from "vue";
import {
  ELEMENT_TO_NODE,
  PATH_TO_ELEMENT,
  NODE_TO_PATH,
} from "./utils/mapData";
import ElementComponent from "./ElementComponent.vue";
import DefaultFormat from "./components/DefaultFormat.vue";
import { normalizeInitData, KeyEvent, toSlateRange } from "./utils";
import Hotkeys from "./utils/HotKeys";

const LIST_TYPES = ["ul", "ol"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
export default {
  name: "Slate",
  props: {
    initialValue: {
      type: Array<Descendant>,
      default: () => [],
    },
    renderElement: {
      type: Function,
      default: null,
    },
    renderLeaf: {
      type: Function,
      default: null,
    },
  },
  emits: ["test"],
  components: {
    ElementComponent,
    DefaultFormat
  },
  setup(props, ctx) {
    const editor = createEditor();
    const keyEvent = new KeyEvent();
    const instance = getCurrentInstance();
    let isComponsition = true;
    const rawData = toRaw(props.initialValue);
    let normalizeData = normalizeInitData(rawData);
    const editorData = reactive({
      initialValue: rawData,
    });
    const currentFormat = reactive({
      currentMark: {},
      currentType: '',
    });
    const flag = ref(false);
    editor.children = normalizeData;
    window.document.addEventListener("selectionchange", (e) => {
      if (!isComponsition) {
        return;
      }
      const selection = window.document.getSelection();
      if (!selection) {
        return Transforms.deselect(editor);
      }
      if (
        instance &&
        document.activeElement?.closest(".slate-main") !=
          instance.refs.editorInstance
      ) {
        return;
      }

      if (selection) {
        if (selection.isCollapsed) {
          // 判断isCollapsed
        }
        const range = toSlateRange(editor, selection);
        // 根据element获取当前node
        // let node =
        //   selection.anchorNode?.parentElement &&
        //   ELEMENT_TO_NODE.get(selection.anchorNode?.parentElement);
        // let last =
        //   selection.focusNode?.parentElement &&
        //   ELEMENT_TO_NODE.get(selection.focusNode?.parentElement);
        // // 然后根据node获取path，
        // let path = NODE_TO_PATH.get(node);
        // let lpath = NODE_TO_PATH.get(last);
        // // 获取path和offset之后，设置当前editor实例的selection
        if (range) {
          const [anchor, focus] = Editor.edges(editor, range);
          Transforms.select(editor, {
            anchor,
            focus,
          });
        }
      }
    });
    // debugger
    keyEvent.use((e: KeyboardEvent, editor: Editor, next: Function) => {
      console.log(e);
      if (e.key == "Tab") {
        e.preventDefault();
        Editor.insertText(editor, "\t");
        refush();
        return;
      }
      next();
    });
    keyEvent.use((e: KeyboardEvent, editor: Editor, next: Function) => {
      const { selection } = editor;
      // debugger
      console.log(selection);
      // if(selection) {
      //   Transforms.deselect(editor)
      // }
      const isRTL = false;
      if (Hotkeys.isMoveLineBackward(e)) {
        e.preventDefault();
        Transforms.move(editor, { unit: "line", reverse: true });
        return;
      }

      if (Hotkeys.isMoveLineForward(e)) {
        e.preventDefault();
        Transforms.move(editor, { unit: "line" });
        return;
      }

      if (Hotkeys.isExtendLineBackward(e)) {
        e.preventDefault();
        Transforms.move(editor, {
          unit: "line",
          edge: "focus",
          reverse: true,
        });
        return;
      }

      if (Hotkeys.isExtendLineForward(e)) {
        e.preventDefault();
        Transforms.move(editor, { unit: "line", edge: "focus" });
        return;
      }

      // COMPAT: If a void node is selected, or a zero-width text node
      // adjacent to an inline is selected, we need to handle these
      // hotkeys manually because browsers won't be able to skip over
      // the void node with the zero-width space not being an empty
      // string.
      // if (Hotkeys.isMoveBackward(e)) {
      //   e.preventDefault();

      //   if (selection && Range.isCollapsed(selection)) {
      //     Transforms.move(editor, { reverse: !isRTL });
      //   } else {
      //     Transforms.collapse(editor, { edge: "start" });
      //   }

      //   return;
      // }

      // if (Hotkeys.isMoveForward(e)) {
      //   e.preventDefault();

      //   if (selection && Range.isCollapsed(selection)) {
      //     Transforms.move(editor, { reverse: isRTL });
      //   } else {
      //     Transforms.collapse(editor, { edge: "end" });
      //   }

      //   return;
      // }

      if (Hotkeys.isMoveWordBackward(e)) {
        e.preventDefault();

        if (selection && Range.isExpanded(selection)) {
          Transforms.collapse(editor, { edge: "focus" });
        }

        Transforms.move(editor, { unit: "word", reverse: !isRTL });
        return;
      }

      if (Hotkeys.isMoveWordForward(e)) {
        e.preventDefault();

        if (selection && Range.isExpanded(selection)) {
          Transforms.collapse(editor, { edge: "focus" });
        }

        Transforms.move(editor, { unit: "word", reverse: isRTL });
        return;
      }
      next();
    });
    keyEvent.use((event: KeyboardEvent, editor: Editor, next: Function) => {
      let { selection } = editor;
      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to guessing at the input intention for hotkeys.
      // COMPAT: In iOS, some of these hotkeys are handled in the
      // debugger
      if (!HAS_BEFORE_INPUT_SUPPORT) {
        // We don't have a core behavior for these, but they change the
        // DOM if we don't prevent them, so we have to.
        if (
          Hotkeys.isBold(event) ||
          Hotkeys.isItalic(event) ||
          Hotkeys.isTransposeCharacter(event)
        ) {
          event.preventDefault();
          return;
        }

        if (Hotkeys.isSoftBreak(event)) {
          event.preventDefault();
          Editor.insertSoftBreak(editor);
          return;
        }

        if (Hotkeys.isSplitBlock(event)) {
          event.preventDefault();
          Editor.insertBreak(editor);
          return;
        }

        if (Hotkeys.isDeleteBackward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "backward" });
          } else {
            Editor.deleteBackward(editor);
          }

          return;
        }

        if (Hotkeys.isDeleteForward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "forward" });
          } else {
            Editor.deleteForward(editor);
          }

          return;
        }

        if (Hotkeys.isDeleteLineBackward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "backward" });
          } else {
            Editor.deleteBackward(editor, { unit: "line" });
          }

          return;
        }

        if (Hotkeys.isDeleteLineForward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "forward" });
          } else {
            Editor.deleteForward(editor, { unit: "line" });
          }

          return;
        }

        if (Hotkeys.isDeleteWordBackward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "backward" });
          } else {
            Editor.deleteBackward(editor, { unit: "word" });
          }

          return;
        }

        if (Hotkeys.isDeleteWordForward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor, { direction: "forward" });
          } else {
            Editor.deleteForward(editor, { unit: "word" });
          }

          return;
        }
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      // 如果editor的selection不存在或者activeElement不是指定dom元素
      if (!editor.selection) {
        return;
      }
      // debugger
      const next = () => {
        Editor.insertText(editor, e.key);
        nextTick(() => {
          refush();
        });
      };
      keyEvent.emit(e, editor, next);
    };
    const onCopy = (e: ClipboardEvent) => {
      // console.log(e)
      // e.preventDefault()
    };
    const addMark = (format: string, value = true) => {
      Editor.addMark(editor, format, value)
      refushMark()
      refush()
    }
    const refushMark = () => {
      const selection = document.getSelection()
      let size = parseInt(window.getComputedStyle(selection.anchorNode?.parentElement, null).fontSize.slice(0, -2))
      currentFormat.currentMark = {};
      currentFormat.currentMark.fontSize = size
      const marks = Editor.marks(editor);
      for (let key in marks) {
        currentFormat.currentMark[key] = marks[key];
      }
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        currentFormat.currentType = editor.children[editor.selection.anchor.path.slice(0, 1)].type
        console.log(currentFormat.currentType)
      }
    }
    const toggleMark = (format: string, value = true) => {
      if (isMarkActive(format)) {
        editor.removeMark(format);
      } else {
        editor.addMark(format, value);
      }
      nextTick(() => {
        refushMark()
        refush();
      });
    };

    const isMarkActive = (e: string) => {
      const marks: any = Editor.marks(editor);
      const isActive = marks[e] ? true : false;
      return isActive;
    };
    const isBlockActive = (editor, format, blockType = "type") => {
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

    const toggleBlock = (format) => {
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
      refushMark();
      refush();
    };
    const onDragEnd = (e: DragEvent) => {
      // e.preventDefault();
      console.log("dragend", e);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      console.log(document.getSelection());
      console.log("drop", e);
    };
    onUpdated(() => {
      const startEl = PATH_TO_ELEMENT.get(
        editor.selection?.anchor.path.join(",")
      )?.firstChild;
      const endEl = PATH_TO_ELEMENT.get(
        editor.selection?.focus.path.join(",")
      )?.firstChild;
      if (startEl && endEl && editor.selection) {
        const range = new window.Range();
        range.setStart(startEl, editor.selection?.anchor.offset);
        range.setEnd(endEl, editor.selection?.focus.offset);
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(range);
      }
    });
    const addNode = (val: any) => {
      Editor.insertFragment(editor, val);
      Transforms.insertNodes(editor, val);
      // deleteBackward(editor)
      refush();
    };

    const onClick = (e: MouseEvent) => {
      const selection = window.document.getSelection();
      if (selection) {
        if (selection.isCollapsed) {
          // 判断isCollapsed
        }
        const range = toSlateRange(editor, selection);
        // 根据element获取当前node
        // let node =
        //   selection.anchorNode?.parentElement &&
        //   ELEMENT_TO_NODE.get(selection.anchorNode?.parentElement);
        // let last =
        //   selection.focusNode?.parentElement &&
        //   ELEMENT_TO_NODE.get(selection.focusNode?.parentElement);
        // // 然后根据node获取path，
        // let path = NODE_TO_PATH.get(node);
        // let lpath = NODE_TO_PATH.get(last);
        // // 获取path和offset之后，设置当前editor实例的selection
        // console.log(selection.parent)
        
        
        if(selection.isCollapsed) {
          // if(selection.anchorNode instanceof Text) {
            
          // }
        }
        if (range) {
          const [anchor, focus] = Editor.edges(editor, range);
          if(editor.selection) {
            Transforms.deselect(editor)
          }
          Transforms.select(editor, {
            anchor,
            focus,
          });
          refushMark()
        }
      }
    };
    const onBeforeInput = (event: Event) => {
      console.log("beforeinput", event);
      // COMPAT: BeforeInput events aren't cancelable on android, so we have to handle them differently using the android input manager.
      // if (androidInputManager) {
      //   return androidInputManager.handleDOMBeforeInput(event)
      // }
      // debugger
      // Some IMEs/Chrome extensions like e.g. Grammarly set the selection immediately before
      // triggering a `beforeinput` expecting the change to be applied to the immediately before
      // set selection.
      // scheduleOnDOMSelectionChange.flush()
      // onDOMSelectionChange.flush()

      const { selection } = editor;
      const { inputType: type, data: d } = event as InputEvent;
      const data = (event as any).dataTransfer || d || undefined;

      const isCompositionChange =
        type === "insertCompositionText" || type === "deleteCompositionText";

      // COMPAT: use composition change events as a hint to where we should insert
      // composition text if we aren't composing to work around https://github.com/ianstormtaylor/slate/issues/5038
      if (isCompositionChange) {
        return;
      }

      let native = false;
      if (
        type === "insertText" &&
        selection &&
        Range.isCollapsed(selection) &&
        // Only use native character insertion for single characters a-z or space for now.
        // Long-press events (hold a + press 4 = ä) to choose a special character otherwise
        // causes duplicate inserts.
        d &&
        d.length === 1 &&
        /[a-z ]/i.test(d) &&
        // Chrome has issues correctly editing the start of nodes: https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
        // When there is an inline element, e.g. a link, and you select
        // right after it (the start of the next node).
        selection.anchor.offset !== 0
      ) {
        // native = true

        // Skip native if there are marks, as
        // `insertText` will insert a node, not just text.
        if (editor.marks) {
          native = false;
        }

        // Chrome also has issues correctly editing the end of anchor elements: https://bugs.chromium.org/p/chromium/issues/detail?id=1259100
        // Therefore we don't allow native events to insert text at the end of anchor nodes.
        const { anchor } = selection;

        // const [node, offset] = ReactEditor.toDOMPoint(editor, anchor)
        // const anchorNode = node.parentElement?.closest('a')

        // const window = ReactEditor.getWindow(editor)

        // if (
        //   native &&
        //   anchorNode &&
        //   ReactEditor.hasDOMNode(editor, anchorNode)
        // ) {
        //   // Find the last text node inside the anchor.
        //   const lastText = window?.document
        //     .createTreeWalker(anchorNode, NodeFilter.SHOW_TEXT)
        //     .lastChild() as DOMText | null

        //   if (lastText === node && lastText.textContent?.length === offset) {
        //     native = false
        //   }
        // }

        // Chrome has issues with the presence of tab characters inside elements with whiteSpace = 'pre'
        // causing abnormal insert behavior: https://bugs.chromium.org/p/chromium/issues/detail?id=1219139
        // if (
        //   native &&
        //   node.parentElement &&
        //   window?.getComputedStyle(node.parentElement)?.whiteSpace === 'pre'
        // ) {
        //   const block = Editor.above(editor, {
        //     at: anchor.path,
        //     match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        //   })

        //   if (block && Node.string(block[0]).includes('\t')) {
        //     native = false
        //   }
        // }
      }

      // COMPAT: For the deleting forward/backward input types we don't want
      // to change the selection because it is the range that will be deleted,
      // and those commands determine that for themselves.
      if (!type.startsWith("delete") || type.startsWith("deleteBy")) {
        const [targetRange] = (event as any).getTargetRanges();

        if (targetRange) {
          const range = toSlateRange(editor, targetRange);
          if (!range) {
            return;
          }
          if (!selection || !Range.equals(selection, range)) {
            native = false;

            const selectionRef =
              !isCompositionChange &&
              editor.selection &&
              Editor.rangeRef(editor, editor.selection);

            Transforms.select(editor, range);

            if (selectionRef) {
              // EDITOR_TO_USER_SELECTION.set(editor, selectionRef)
            }
          }
        }
      }

      // Composition change types occur while a user is composing text and can't be
      // cancelled. Let them through and wait for the composition to end.
      if (isCompositionChange) {
        return;
      }

      if (!native) {
        event.preventDefault();
      }

      // COMPAT: If the selection is expanded, even if the command seems like
      // a delete forward/backward command it should delete the selection.
      if (
        selection &&
        Range.isExpanded(selection) &&
        type.startsWith("delete")
      ) {
        const direction = type.endsWith("Backward") ? "backward" : "forward";
        Editor.deleteFragment(editor, { direction });
        return;
      }

      switch (type) {
        case "deleteByComposition":
        case "deleteByCut":
        case "deleteByDrag": {
          Editor.deleteFragment(editor);
          break;
        }

        case "deleteContent":
        case "deleteContentForward": {
          Editor.deleteForward(editor);
          break;
        }

        case "deleteContentBackward": {
          Editor.deleteBackward(editor);
          break;
        }

        case "deleteEntireSoftLine": {
          Editor.deleteBackward(editor, { unit: "line" });
          Editor.deleteForward(editor, { unit: "line" });
          break;
        }

        case "deleteHardLineBackward": {
          Editor.deleteBackward(editor, { unit: "block" });
          break;
        }

        case "deleteSoftLineBackward": {
          Editor.deleteBackward(editor, { unit: "line" });
          break;
        }

        case "deleteHardLineForward": {
          Editor.deleteForward(editor, { unit: "block" });
          break;
        }

        case "deleteSoftLineForward": {
          Editor.deleteForward(editor, { unit: "line" });
          break;
        }

        case "deleteWordBackward": {
          Editor.deleteBackward(editor, { unit: "word" });
          break;
        }

        case "deleteWordForward": {
          Editor.deleteForward(editor, { unit: "word" });
          break;
        }

        case "insertLineBreak":
          Editor.insertSoftBreak(editor);
          break;

        case "insertParagraph": {
          Editor.insertBreak(editor);
          break;
        }

        case "insertFromComposition":
        case "insertFromDrop":
        case "insertFromPaste":
        case "insertFromYank":
        case "insertReplacementText":
        case "insertText": {
          if (type === "insertFromComposition") {
            // COMPAT: in Safari, `compositionend` is dispatched after the
            // `beforeinput` for "insertFromComposition". But if we wait for it
            // then we will abort because we're still composing and the selection
            // won't be updated properly.
            // https://www.w3.org/TR/input-events-2/
            // if (ReactEditor.isComposing(editor)) {
            //   setIsComposing(false)
            //   IS_COMPOSING.set(editor, false)
            // }
          }

          // use a weak comparison instead of 'instanceof' to allow
          // programmatic access of paste events coming from external windows
          // like cypress where cy.window does not work realibly
          if (data?.constructor.name === "DataTransfer") {
            Editor.insertText(editor, data.getData("text/plain"));
          } else if (typeof data === "string") {
            // Only insertText operations use the native functionality, for now.
            // Potentially expand to single character deletes, as well.
            if (native) {
              // deferredOperations.current.push(() =>
              //   Editor.insertText(editor, data)
              // )
            } else {
              Editor.insertText(editor, data);
            }
          }

          break;
        }
      }

      // Restore the actual user section if nothing manually set it.
      // const toRestore = EDITOR_TO_USER_SELECTION.get(editor)?.unref()
      // EDITOR_TO_USER_SELECTION.delete(editor)

      // if (
      //   toRestore &&
      //   (!editor.selection || !Range.equals(editor.selection, toRestore))
      // ) {
      //   Transforms.select(editor, toRestore)
      // }
      refush();
    };

    const onCompositionend = (event: CompositionEvent) => {
      console.log("compositionend", event);
      isComponsition = true;
      Editor.insertText(editor, event.data);
    };
    const onCompositionUpdate = (event: CompositionEvent) => {
      isComponsition = false;
    };
    const onInput = (e: Event) => {
      console.log("input", e);
    };
    const onDragOver = (e: DragEvent) => {
      // e.dataTransfer.dropEffect = "move";
      e.preventDefault();
    };
    const refush = () => {
      editorData.initialValue.length = 0;
      editorData.initialValue.push(
        ...JSON.parse(JSON.stringify(editor.children))
      );
    };
    const getInstance = () => {
      console.log(editor);
    };

    const onCut = (e: ClipboardEvent) => {
      console.log("oncut", e);
      e.preventDefault();
      Editor.deleteFragment(editor);
      refush();
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!HAS_BEFORE_INPUT_SUPPORT) {
        e.preventDefault();
        if (e.clipboardData) {
          Editor.insertText(editor, e.clipboardData.getData("text/plain"));
        }
      }
    };
    return {
      currentFormat,
      flag,
      getInstance,
      onKeyDown,
      onClick,
      onCopy,
      onCut,
      onPaste,
      onDragOver,
      onDragEnd,
      onDrop,
      onBeforeInput,
      onCompositionend,
      onCompositionUpdate,
      onInput,
      addMark,
      toggleMark,
      addNode,
      toggleBlock,
      data: editorData.initialValue,
      renderElement: props.renderElement,
      renderLeaf: props.renderLeaf,
    };
  },
};
</script>

<style scoped>
.slate-main {
  height: 100vh;
  width: 794px;
  /* border: 1px solid black; */
  padding: 60px 50px;
  box-sizing: border-box;
  overflow: auto;
  outline: 1px solid #c7c7c7;
  margin: 0 auto;
  overflow: auto;
}
</style>
<style>
.slate-main * {
  white-space: pre-wrap;
}
.slate-main blockquote {
  border-left: 2px solid #ddd;
  margin-left: 0;
  margin-right: 0;
  padding-left: 10px;
  color: #aaa;
  font-style: italic;
}
.slate-main p > span:empty {
  display: block;
  height: 24px;
}
</style>

<style scoped>
:deep(img) {
  width: 100%;
}
</style>
