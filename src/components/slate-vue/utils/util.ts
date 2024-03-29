import { BLANK_CHARACTER } from "./Vue_Editor";
export function normalizeInitData(initData: Array<any>) {
  let result = []
  for(let i = 0; i < initData.length; i++) {
    let temp: any = {}
    // console.log(initData[i])
    Object.assign(temp, {...initData[i]}, { children: undefined})
    if(temp.text === '') {
      temp.text = ''
    }
    
    if(initData[i].children) {
      temp.children = normalizeInitData(initData[i].children)
    }
    result.push(temp)
    
  }
  return result
}


export function isObject(val: any) {
  return typeof val === 'object' && val !== null
}
export function isDOMSelection(sel: any): sel is Selection {
  return sel instanceof Selection && sel.anchorNode != null
}
var RTL = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC'
var LTR =
  'A-Za-z\u00C0-\u00D6\u00D8-\u00F6' +
  '\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C' +
  '\uFE00-\uFE6F\uFEFD-\uFFFF'

var rtl = new RegExp('^[^' + LTR + ']*[' + RTL + ']')
var ltr = new RegExp('^[^' + RTL + ']*[' + LTR + ']')

function direction(value) {
  value = String(value || '')

  if (rtl.test(value)) {
    return 'rtl'
  }

  if (ltr.test(value)) {
    return 'ltr'
  }

  return 'neutral'
}
// 排除keys属性
export function exclude(obj: any, keys: Array<string>) {
  if(typeof obj != 'object' && obj !== null) {
    throw 'obj 必须是一个对象'
  }
  let res: any = {}
  for(const key in obj) {
    if(keys.includes(key)) {
      continue
    }
    res[key] = obj[key]
  }
  return res
}
// 获取keys属性
export function extract(obj: any, keys: Array<string>) {
  if(typeof obj != 'object' && obj !== null) {
    throw 'obj 必须是一个对象'
  }
  let res: any = {}
  for(const key of keys) {
    if(!obj[key]) {
      continue
    }
    res[key] = obj[key]
  }
  return res
}