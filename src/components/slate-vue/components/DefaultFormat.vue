<template>
  <div
    class="json-toolbar"
    style="display: flex; align-items: center; justify-content: center"
  >
    <nav @click="handleMul">
      <div class="json-icon json-fontMul-icon"></div>
    </nav>
    <input 
      type="text"
      :value="format.currentFormat.currentMark.fontSize ? format.currentFormat.currentMark.fontSize : 16" 
      class="json-font-size"
      @change="handleFontSize"/>
    <nav @click="handleAdd">
      <div class="json-icon json-fontAdd-icon"></div>
    </nav>
    <div class="line"></div>
    <select
      @input="(e) => blockChange(e.target.value, format)"
      :value="format.currentFormat.currentType"
    >
      <option value="paragraph">正文</option>
      <option value="head-one">h1</option>
      <option value="head-two">h2</option>
      <option value="head-three">h3</option>
    </select>
    <div class="line"></div>
    <InlineActive format="bold" :transforms="format">
      <div class="json-icon json-bold-icon"></div>
    </InlineActive>
    <InlineActive format="u" :transforms="format">
      <div class="json-icon json-underline-icon"></div>
    </InlineActive>
    <nav @click="changeColor">
      <div class="json-icon json-color-icon"></div>
    </nav>
    <InlineActive format="code" :transforms="format">
      {{ "<>" }}
    </InlineActive>
    <div class="line"></div>
    <nav @click="addImage">
      <div class="json-icon json-img-icon"></div>
    </nav>
    <BlockActive format="ul" :transforms="format">
      <div class="json-icon json-ul-icon"></div>
    </BlockActive>
    <BlockActive format="ol" :transforms="format">
      <div class="json-icon json-ol-icon"></div>
    </BlockActive>
    <BlockActive format="block-quote" :transforms="format"> ” </BlockActive>
    <div class="line"></div>
    <BlockActive format="textAlign" value="left" :transforms="format">
      <div class="json-icon json-left-icon"></div>
    </BlockActive>
    <BlockActive format="textAlign" value="center" :transforms="format">
      <div class="json-icon json-center-icon"></div>
    </BlockActive>
    <BlockActive format="textAlign" value="right" :transforms="format">
      <div class="json-icon json-right-icon"></div>
    </BlockActive>
  </div>
</template>

<script setup lang="ts">
import BlockActive from "./BlockActive.vue";
import InlineActive from "./InlineActive.vue";
import { onUpdated, reactive } from 'vue'
const props = defineProps({
  transforms: {
    type: Object,
    required: true,
  },
});
const format = props.transforms;

const blockChange = (format, obj) => {
  console.log(format, obj);
  const { toggleBlock, currentMark } = obj;
  console.log(currentMark);
  toggleBlock(format);
};

const addImage = () => {
  const file = document.createElement("input");
  file.type = "file";
  file.onchange = (e) => {
    const url = URL.createObjectURL(e.target.files[0]);
    format.addNode({
      type: "image",
      url: url,
      children: [{ text: "" }],
    });
  };
  file.click();
};
const changeColor = () => {
  const color = document.createElement("input");
  color.type = "color";
  color.onchange = (e) => {
    // console.log(e.target.value)
    format.toggleMark("color", e.target.value);
  };
  color.click();
};
onUpdated(() => {
  console.log(format.currentFormat.currentMark)
})
const handleMul = () => {
  // format.toggleMark('fontSize', '16px')
  console.log(format.currentFormat.currentMark.fontSize)
  format.addMark('fontSize', props.transforms.currentFormat.currentMark.fontSize ? format.currentFormat.currentMark.fontSize - 1 : 16)
}
const handleAdd = () => {
  format.addMark('fontSize', props.transforms.currentFormat.currentMark.fontSize ? format.currentFormat.currentMark.fontSize + 1 : 16)
}
const handleFontSize = (e) => {
  format.addMark = () => {
    format.addMark('fontSize', e.target.value)
  }
}
</script>

<style scoped>
select {
  width: 116px;
  margin-right: 3px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  padding: 0 4px;
  cursor: pointer;
  background-color: #edf2fa;
  outline: none;
  user-select: none;
}
.json-font-size {
  width: 32px;
  height: 28px;
  border: 1px;
  margin-right: 3px;
  border-radius: 4px;
  outline: none;
  text-align: center;
}
select:hover {
  background-color: #eaeaea;
}
.json-toolbar {
  background-color: #edf2fa;
  border: none;
  border-radius: 24px;
  font-family: Google Sans, Roboto, sans-serif;
  margin: 6px 16px 8px 16px;
  min-height: 40px;
  padding: 0 8px;
  -webkit-font-smoothing: antialiased;
}
.json-icon {
  position: relative;
  height: 20px;
  width: 20px;
  margin: 0 auto;
  margin-top: 50%;
  transform: translateY(-50%);
  overflow: hidden;
}
.json-icon::before {
  position: absolute;
  content: url("../assets/material_common_sprite494_gm3_grey_medium.svg");
}
.json-img-icon::before {
  top: -7020px;
  left: 0;
  overflow: hidden;
}
.json-ul-icon::before {
  left: 0;
  top: -5880px;
}
.json-ol-icon::before {
  top: -2806px;
  left: 0;
}
.json-underline-icon::before {
  left: -52px;
  top: -4180px;
}
.json-bold-icon::before {
  left: -20px;
  top: -6442px;
}
.json-color-icon::before {
  left: -26px;
  top: -8514px;
}
.json-left-icon::before {
  left: -20px;
  top: -5740px;
}
.json-center-icon::before {
  left: 0;
  top: -5214px;
}
.json-right-icon::before {
  left: -52px;
  top: -11012px;
}
.json-fontMul-icon::before {
  left: -20px;
  top: -474px;
}
.json-fontAdd-icon::before {
  left: -48px;
  top: -4966px;
}
</style>

<style scoped>
.line {
  border-left: 1px solid #c7c7c7;
  height: 28px;
  width: 1px;
  margin-right: 3px;
}
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
nav:hover {
  background-color: #eaeaea;
}
</style>
