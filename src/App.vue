<script lang="ts">
import { reactive, h, watchEffect, onMounted, VNode, readonly } from "vue";
import Slate from "./components/slate-vue/index.vue";
export default {
  components: {
    Slate,
  },
  setup() {
    const initialValue = reactive({
      value: [
        {
          type: "paragraph",
          children: [
            { text: "This is editable " },
            { text: "rich", bold: true },
            { text: " text, " },
            { text: "much", italic: true },
            { text: " better than a " },
            { text: "<textarea>", code: true },
            { text: "!" },
          ],
        },
        {
          type: "paragraph",
          children: [
            { text: '﻿' }
          ]
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
          align: "center",
          children: [{ text: "Try it out for yourself!" }],
        },
      ],
    });
    const map: Record<string, { tag?: string; name: string; value?: string }> = reactive({
      h1: {
        tag: "h1",
        name: "标题",
        level: '0'
      },
      bold: {
        tag: "strong",
        name: "加粗",
        level: '1'
      },
      li: {
        tag: "li",
        name: "li",
        level: '2'
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
      img: {
        tag: "img",
        name: "图片",
      },
      color: {
        tag: 'color',
        name: '颜色'
      },
      blockQuote: {
        tag: 'blockquote',
        name: '”'
      },
      center: {
        name: '居中'
      },
      left: {
        name: '居左'
      },
      right: {
        name: '居右'
      }
    });
    const renderElement = (node: any, options: any) => {
      let res: any = node;
      for (const key in options) {
        if (key === "text") {
          continue;
        }
        // console.log('*', key)
        if (key === "color") {
          if(!res.props) {
            res.props = {}
          }
          res.props.style ? res.props.style.color = "red" : res.props.style = { color: 'red'} 
          continue;
        }
        // if (["center", "left" , "right"].includes(key)) {
        //   console.log(res)
        //   if(!res.props) {
        //     res.props = {}
        //   }
        //   res.props.style ? res.props.style.textAlign = key : res.props.style = { textAlign: key} 
        //   console.log(res)
        //   continue
        // }
        
        if (options[key]) {
          res = h(map[key].tag, res);
        }
      }
      return res;
    };
    const f = (t: any, key: string, value: string | undefined) => {
      const { format, addNode } = t;
      if (key === "img") {
        const file = document.createElement("input");
        file.type = "file";
        file.onchange = (e) => {
          Promise.resolve({ data: "" }).then((res) => {
            addNode({ text: "http://localhost:3304" });
          });
        };
        Promise.resolve({ data: "" }).then((res) => {
          addNode( { type: 'image', url: 'data:image/jpeg;base64,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', children: [{ text: '﻿'}] });
        });
      } else if(key == 'color') {
        const input = document.createElement("input");
        input.type = "color"
        input.onchange = (e) => {
          console.log(e)
          format(key, 'red')
        }
        input.click()

      } else {
        format(key, value);
      }
    };
    const updateValue = (e: Array<any>, v: any) => {
      initialValue.value.length = 0;
      initialValue.value.push(...e);
    };
    const getData = () => {
      console.log(initialValue.value);
    };
    return {
      initialValue,
      map,
      renderElement,
      updateValue,
      getData,
      f,
    };
  },
};
</script>

<template>
  <Slate
    :initialValue="initialValue.value"
    :renderElement="renderElement"
    @test="updateValue"
  >
    <template #default="format">
      <div v-for="(m, k) in map" :key="m.tag" class="format-btn">
        <button @click="f(format, k, m.value)">
          {{ m.name }}
        </button>
      </div>
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
:deep(p) {
  padding: 0;
  margin: 0;
}
:deep(h1) {
  padding: 0;
  margin: 0;
}
</style>
