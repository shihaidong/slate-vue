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
import TextComponent from "./components/TextComponent.vue";
import { ELEMENT_TO_NODE, NODE_TO_PATH, PATH_TO_ELEMENT } from "./utils/mapData";

type ElementComponentProps = {
  data: Object;
  path: Array<Number>;
  renderElement?: Function;
  renderLeaf?: Function;
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
    renderLeaf: {
      type: Function,
      default: null
    }
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
          renderLeaf: p.renderLeaf
        });
      });
    };
    const refInstance = (e: Element) => {
      let path = [...props.path, 0];
      PATH_TO_ELEMENT.set(path.join(','), e)
    }
    return () => {
      const isRoot = props.path.length == 1 ? true : false
      return h(Blank, () => {
        if (props.data.text || props.data.text === "") {
          NODE_TO_PATH.set(props.data, props.path);
          const wrap = h("span", { ref: 'tt', class:"text" }, props.data.text == '' ? h(TextComponent) : props.data.text)
          return props.renderLeaf
            ? props.renderLeaf(wrap, props.data)
            : wrap;
        } else if (props.data.type === "paragraph" || !props.renderElement) {
          return isRoot ? h('p', { class: 'common', style: { ...props.data } }, recursion(props)) : recursion(props);
        } else {
          const child = props.renderElement(recursion(props), { type: props.data.type, ...props.data})
          return isRoot ? h('p', { class: 'common', style: { ...props.data } }, child) : child;
        } 
      });
    };
  },
});
</script>
<style scoped>

</style>
