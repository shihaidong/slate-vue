<script lang="ts">
import { reactive, h, getCurrentInstance } from "vue";
import Slate from "./components/slate-vue/index.vue";
import BlockActive from "./components/slate-vue/components/BlockActive.vue";
import InlineActive from "./components/slate-vue/components/InlineActive.vue";
import TextComponent from "./components/slate-vue/components/TextComponent.vue";
export default {
  components: {
    Slate,
    BlockActive,
    InlineActive,
    TextComponent
  },
  setup() {
    const instance = getCurrentInstance();
    const initialValue = reactive({
      value: [
        {
          type: "ul",
          children: [
            {
              type: 'li',
              children: [
                {
                  text: 'testli'
                }
              ]
            }
          ]
        },
        {
          type: "ol",
          children: [
            {
              type: 'li',
              children: [
                {
                  text: 'testoi'
                }
              ]
            }
          ]
        },
        {
          type: "paragraph",
          children: [
            { text: "This is editable " },
            { text: "rich", bold: true, color: "red" },
            { text: " text, " },
            { text: "much", italic: true },
            { text: " better than a " },
            { text: "<textarea>", code: true },
            { text: "!" },
          ],
        },
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
        {
          type: "head-one",
          children: [{ text: "abc" }],
        },
        {
          type: "paragraph",
          children: [
            {
              text: "Since it's rich text, you can do things like turn a selection of text ",
            },
            { text: "bold", bold: true },
            {
              text: ", or add a semantically rendered block quote in the middle of the page, like this:",
            },
          ],
        },
        {
          type: "block-quote",
          children: [{ text: "A wise quote." }],
        },
        {
          type: "paragraph",
          textAlign: "center",
          children: [{ text: "Try it out for yourself!" }],
        },
      ],
    });
    const map: Record<string, { tag?: string; name: string; value?: string }> =
      reactive({
        bold: {
          tag: "strong",
          name: "加粗",
          level: "1",
        },
        italic: {
          tag: "em",
          name: "斜体",
        },
        u: {
          tag: "u",
          name: "下划线",
        },
        code: {
          tag: "code",
          name: "代码块",
        },
        color: {
          tag: "color",
          name: "颜色",
        }
      });
    const renderLeaf = (node: any, options: any) => {
      let res: any = node;
      let props = {}

      for (const key in options) {
        if (key === "text") {
          continue;
        }
        if (key === "textAlign") {
          console.log(key)
          if (!res.props) {
            res.props = {};
          }
          if(!res.props.style) {
            res.props.style = {}
          }
          res.props.style.textAlign = options.textAlign
          continue
        }
        

        if (options[key] && map[key]?.tag) {
          res = h(map[key].tag, props, res);
        }
      }
      return res;
    };
    const renderElement = (node: any, options: any) => {
      if (options.type == "paragraph") {
        return h("p", { ...options.attributes }, node);
      }
      if (options.type == "block-quote") {
        return h("blockquote", { ...options.attributes }, node);
      }
      if (options.type == "head-one") {
        return h("h1", { ...options.attributes }, node);
      }
      if (options.type == "head-two") {
        return h("h2", { ...options.attributes }, node);
      }
      if(options.type == "image") {
        return h('p', [h('span', h("img", { ...options.attributes, src: options.url })), node])
      }
      if(options.type == "ul") {
        return h('ul', node)
      }
      if(options.type == "li") {
        return h('li', node)
      }
      if(options.type == "ol") {
        return h("ol", node)
      }
    };
    const config = reactive({
      includeFormat: ["head", "font-size", "bold", "underline", "color", "code", "picture", "list", "number-list", "textAlign", "common"],
      excludeFormat: [],
      uploadImage: () => {
        
      }
    })
    const getData = () => {
      console.log(instance.refs.ins.getInstance());
    };
    return {
      initialValue,
      config,
      map,
      renderElement,
      renderLeaf,
      getData
    };
  },
};
</script>

<template>
  <Slate
    ref="ins"
    :initialValue="initialValue.value"
    :renderElement="renderElement"
    :renderLeaf="renderLeaf"
    :config="config"
  >
    <template #default="format">    
    </template>
  </Slate>
  <button @click="getData">获取数据</button>
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}


.format-btn {
  display: inline-block;
  margin-right: 10px;
  padding: 2px 5px;
}
.bold {
  font-weight: 700;
  color: black;
  background-color: #d3e3fd;
}
:deep(p) {
  padding: 0;
  margin: 0;
}
:deep(h1) {
  padding: 0;
  margin: 0;
}
nav {
  display: inline-block;
  margin-right: 2px;
  min-width: 28px;
  height: 28px;
  text-align: center;
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
}
</style>
