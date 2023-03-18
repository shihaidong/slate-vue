<template>
  <nav @click="format"
      :class="
        Object.keys(props.transforms.currentFormat.currentMark).includes(props.format)
          ? 'active'
          : ''
      "
    >
      <slot></slot>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps({
  format: {
    type: String,
    required: true
  },
  transforms: {
    type: Object,
    required: true
  },
  value: {
    type: [Boolean, Number, String],
    default: () => undefined
  }
})
// console.log(props)
const format = () => {
  const { toggleMark } = props.transforms
  console.log(props.format, props.value)
  toggleMark(props.format, props.value)
};
</script>
<style scoped>
nav {
  position: relative;
  display: inline-block;
  margin-right: 3px;
  min-width: 28px;
  height: 28px;
  text-align: center;
  line-height: 28px;
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
}
.active {
  font-weight: 700;
  color: black;
  background-color: #d3e3fd;
}
nav:hover {
  background-color: #eaeaea;
}
</style>