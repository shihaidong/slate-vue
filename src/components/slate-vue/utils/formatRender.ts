import { h } from 'vue'
const map: Record<string, { tag?: string; name: string; value?: string }> =
  {
    bold: {
      tag: "strong",
      name: "加粗"
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
  }
export const renderLeaf = (node: any, options: any) => {
  let res: any = node;
  let props = {}

  for (const key in options) {
    if (key === "text") {
      continue;
    }
    // console.log('*', key)
    if (key === "color") {
      if (!res.props) {
        res.props = {};
      }
      if (!res.props.style) {
        res.props.style = {}
      }
      res.props.style.color = options.color
      continue;
    }
    if (key === "fontSize") {
      if (!res.props) {
        res.props = {};
      }
      if (!res.props.style) {
        res.props.style = {}
      }
      res.props.style.fontSize = options.fontSize + 'px'
      console.log(res)
      continue
    }
    if (key === "textAlign") {
      console.log(key)
      if (!res.props) {
        res.props = {};
      }
      if (!res.props.style) {
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

export const renderElement = (node: any, options: any) => {
  if (options.type == "block-quote") {
    return h("blockquote", node);
  }
  if (options.type == "head-one") {
    return h("h1", node);
  }
  if (options.type == "head-two") {
    return h("h2", node);
  }
  if (options.type == "image") {
    return h('p', [h('span', h("img", { src: options.url })), node])
  }
  if (options.type == "ul") {
    return h('ul', node)
  }
  if (options.type == "li") {
    return h('li', node)
  }
  if (options.type == "ol") {
    return h("ol", node)
  }
  if (options.type == "paragraph") {
    return h("p", node);
  }
};