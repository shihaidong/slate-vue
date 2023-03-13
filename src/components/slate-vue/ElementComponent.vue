<!-- <template>
  <span v-if="d.text">{{ d.text }}</span>
  <template v-else>
    <element-component v-for="(item, i) in d.children" :key="i" :data="item"></element-component>
  </template>
</template> -->

<script lang="ts">
import {
  defineComponent,
  resolveComponent,
  h,
  getCurrentInstance,
  onMounted,
  onUpdated,
} from "vue";
import Blank from "./blank.vue";
import { ELEMENT_TO_NODE, NODE_TO_PATH, PATH_TO_ELEMENT } from "./mapData";

type ElementComponentProps = {
  data: Object;
  path: Array<Number>;
  renderElement?: Function;
};
export default defineComponent({
  name: "ElementComponent",
  props: {
    data: {
      type: Object,
      default: null,
    },
    path: {
      type: Array<Number>,
      required: true,
    },
    renderElement: {
      type: Function,
      default: null,
    },
  },
  components: {
    Blank,
  },
  setup(props) {
    const instance = getCurrentInstance();
    onMounted(() => {
      // console.log(instance.refs)
      if (instance?.refs.tt) {
        ELEMENT_TO_NODE.set(instance?.refs.tt as Element, props.data);
        PATH_TO_ELEMENT.set(props.path.join(","), instance?.refs.tt as Element);
      }
    });
    onUpdated(() => {
      if (instance?.refs.tt) {
        ELEMENT_TO_NODE.set(instance?.refs.tt as Element, props.data);
        PATH_TO_ELEMENT.set(props.path.join(","), instance?.refs.tt as Element);
      }
    });
    const recursion = (p: ElementComponentProps) => {
      return p.data.children.map((item: Object, i: number) => {
        let path = [...p.path, i];
        return h(resolveComponent("ElementComponent"), {
          data: item,
          path,
          renderElement: p.renderElement,
        });
      });
    };
    return (x) => {
      return h(Blank, () => {
        if (props.data.text || props.data.text === "") {
          NODE_TO_PATH.set(props.data, props.path);
          const wrap = h("span", { ref: 'tt' }, props.data.text)
    
          return props.renderElement
            ? props.renderElement(wrap, props.data)
            : wrap;
        } else if (props.data.type === "paragraph") {
          return h("p", {}, recursion(props));
        } else if (props.data.type === "image") {
          return h(
            "span",
            {ref: 'tt'},
            h("img", {
              src: props.data.url,
              alt: props.data.children[0].text,
            })
          );
        } else if (props.data.type === "block-quote") {
          return h("blockquote", recursion(props));
        }
      });
    };
  },
});
</script>
<style scoped>
p > span:empty {
  display: block;
  height: 30px;
}
</style>
