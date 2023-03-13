<template>
  <div>
    <slot v-bind="{ format, addNode }"></slot>
    <div
      ref="editorInstance"
      contenteditable="true"
      class="slate-main"
      @click="onClick"
      @beforeInput="onBeforeInput"
      @input="onInput"
      @keydown="onKeyDown"
      @copy="onCopy"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragend="onDragEnd"
      @drop="onDrop"
    >
      <ElementComponent
        v-for="(item, i) in children"
        :key="i"
        :path="[i]"
        :data="item"
        :renderElement="renderElement"
      ></ElementComponent>
    </div>
  </div>
</template>

<script lang="ts">
import {
  createEditor,
  Descendant,
  Editor,
  Point,
  Transforms,
  Node,
} from "slate";
import { nextTick, onUpdated, getCurrentInstance } from "vue";
import { ELEMENT_TO_NODE, PATH_TO_ELEMENT, NODE_TO_PATH } from "./mapData";
import ElementComponent from "./ElementComponent.vue";
import { deleteBackward, deleteForward, insertNewRow } from "./utils";
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
  },
  emits: ["test"],
  components: {
    ElementComponent,
  },
  setup(props, ctx) {
    const editor = createEditor();
    const instance = getCurrentInstance()
    const temp = JSON.parse(JSON.stringify(props.initialValue));
    editor.children = temp;
    window.document.addEventListener("selectionchange", (e) => {
      const selection = window.document.getSelection();
      
      if (document.activeElement?.closest(".slate-main") != instance.refs.editorInstance) {
        return;
      }
      
      console.log(ELEMENT_TO_NODE);
      console.log("***", JSON.parse(JSON.stringify(editor)), selection);
      if (selection) {
        if (selection.isCollapsed) {
          // 判断isCollapsed
        }
        // 根据element获取当前node
        let node =
          selection.anchorNode?.parentElement &&
          ELEMENT_TO_NODE.get(selection.anchorNode?.parentElement);
        let last =
          selection.focusNode?.parentElement &&
          ELEMENT_TO_NODE.get(selection.focusNode?.parentElement);
        // 然后根据node获取path，
        let path = NODE_TO_PATH.get(node);
        let lpath = NODE_TO_PATH.get(last);
        // 获取path和offset之后，设置当前editor实例的selection
        const [anchor, focus] = Editor.edges(editor, {
          anchor: {
            offset: selection.anchorOffset,
            path: path,
          },
          focus: {
            offset: selection.focusOffset,
            path: lpath,
          },
        });
        Transforms.select(editor, {
          anchor,
          focus,
        });
      }
    });
    const onKeyDown = (e: KeyboardEvent) => {
      console.log(e);
      // 如果当前点击的时方向键时，不要阻止默认行为
      if (e.key.startsWith("Arrow")) {
        return;
      } else {
        e.preventDefault();
      }

      // 如果editor的selection不存在或者activeElement不是指定dom元素
      if (!editor.selection) {
        return;
      }
      if (e.ctrlKey) {
        if (e.key === "Control") {
          return;
        }
        if (e.key === "c") {
          console.log("复制");
        } else if (e.key === "v") {
          console.log("粘贴");
        }
      }
      if (e.shiftKey) {
        if (e.key === "Shift") {
          return;
        }
        Editor.insertText(editor, e.key.toUpperCase());
        ctx.emit("test", JSON.parse(JSON.stringify(editor.children)));
        return;
      }
      if (e.code == "Backspace") {
        deleteBackward(editor);
      } else if (e.code == "Delete") {
        deleteForward(editor);
      } else if (e.code == "Enter") {
        insertNewRow(editor);
      } else {
        Editor.insertText(editor, e.key);
      }
      nextTick(() => {
        ctx.emit("test", JSON.parse(JSON.stringify(editor.children)));
      });
    };
    const onCopy = (e: ClipboardEvent) => {
      // console.log(e)
      // e.preventDefault()
    };
    const format = (format: string, value = true) => {
      console.log(JSON.parse(JSON.stringify(editor)));
      if (isMark(format)) {
        editor.removeMark(format);
      } else {
        editor.addMark(format, value);
      }
      console.log(JSON.parse(JSON.stringify(editor)));
      nextTick(() => {
        ctx.emit("test", JSON.parse(JSON.stringify(editor.children)), editor);
      });
    };
    const onDragEnd = (e) => {
      // e.preventDefault();
      console.log("dragend", e);
    };
    const onDrop = (e) => {
      e.preventDefault();
      console.log(document.getSelection());
      console.log("drop", e);
    };
    onUpdated(() => {
      console.log(PATH_TO_ELEMENT);
      console.log(JSON.parse(JSON.stringify(editor)));
      const startEl = PATH_TO_ELEMENT.get(
        editor.selection?.anchor.path.join(",")
      )?.firstChild;
      const endEl = PATH_TO_ELEMENT.get(
        editor.selection?.focus.path.join(",")
      )?.firstChild;
      if (startEl && endEl) {
        const range = new Range();
        range.setStart(startEl, editor.selection?.anchor.offset);
        range.setEnd(endEl, editor.selection?.focus.offset);
        console.log(range);
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(range);
      }
    });
    const addNode = (val: any) => {
      Editor.insertFragment(editor, val);
      Transforms.insertNodes(editor, val);
      ctx.emit("test", JSON.parse(JSON.stringify(editor.children)));
    };
    const isMark = (e: string) => {
      const marks: any = Editor.marks(editor);
      const isActive = marks[e] ? true : false;
      return isActive;
    };
    const onClick = (e: MouseEvent) => {};
    const onBeforeInput = (e: FormDataEvent) => {
      console.log(e);
    };
    const onInput = (e) => {
      console.log(e);
    };
    const onDragStart = (e) => {
      console.log("dragStart");
      e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e) => {
      e.dataTransfer.dropEffect = "move";
    };
    return {
      onKeyDown,
      onClick,
      onCopy,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDrop,
      onBeforeInput,
      onInput,
      format,
      addNode,
      children: props.initialValue,
      renderElement: props.renderElement,
    };
  },
};
</script>

<style scoped>
.slate-main {
  height: 400px;
  width: 100%;
  border: 1px solid black;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
}
</style>
<style>
blockquote {
  border-left: 2px solid #ddd;
  margin-left: 0;
  margin-right: 0;
  padding-left: 10px;
  color: #aaa;
  font-style: italic;
}
</style>
