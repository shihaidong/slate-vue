<template>
  <nav @click="format" :class="
        props.transforms.currentFormat.currentType === props.format
          ? 'active'
          : ''
      ">
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
  }
})
const format = () => {
  const { toggleBlock } = props.transforms
  toggleBlock(props.format)
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
