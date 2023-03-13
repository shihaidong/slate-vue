// 根据element获取node数据，识别当前元素有哪些mark
export const ELEMENT_TO_NODE = new WeakMap<Element, any>()

export const NODE_TO_PATH = new WeakMap();

export const NODE_PARENT = new WeakMap()

// 根据path获取element
// 根据当前editor实例的selection的path获取element元素,创建一个range并保持选择状态
export const PATH_TO_ELEMENT = new Map<any, Element>()

