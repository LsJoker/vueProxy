//compil编译
import Watcher from './watcher.js'
export default class Compile {
  constructor(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
  }

  init(){
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    } else {
        console.log('Dom元素不存在');
    } 
  }

  //生成dom片段
  nodeToFragment(el){
    let fragment = document.createDocumentFragment();
    let child = el.firstChild;
    while (child) {
        // 将Dom元素移入fragment中
        fragment.appendChild(child);
        child = el.firstChild;
    }
    return fragment;
  }

  //{{}}指令
  compileElement(el){
    let childNodes = el.childNodes;
    let self = this;
    [].slice.call(childNodes).forEach(function(node) {
        let reg = /\{\{(.*)\}\}/;
        let text = node.textContent;
        if (self.isElementNode(node)) {  
          self.compile(node);
        } else if (self.isTextNode(node) && reg.test(text)) {  // 判断是否是符合这种形式{{}}的指令
            self.compileText(node, reg.exec(text)[1]);
        }
        if (node.childNodes && node.childNodes.length) {
            self.compileElement(node);  // 继续递归遍历子节点
        }
    });
  }

  isElementNode(node) {
    return node.nodeType == 1;
  }

  compile(node) {
    let nodeAttrs = node.attributes;
    let self = this;
    Array.prototype.forEach.call(nodeAttrs, function(attr) {
        let attrName = attr.name;
        if (self.isDirective(attrName)) {
            let exp = attr.value;
            let dir = attrName.substring(2);
            if (self.isEventDirective(dir)) {  // 事件指令
                self.compileEvent(node, self.vm, exp, dir);
            } else {  // v-model 指令
                self.compileModel(node, self.vm, exp, dir);
            }
            node.removeAttribute(attrName);
        }
    });
  }

  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  }
  
  isEventDirective(dir) {
    return dir.indexOf('on:') === 0;
  }

  compileEvent (node, vm, exp, dir) {
    let eventType = dir.split(':')[1];
    let cb = vm.methods && vm.methods[exp];
    if (eventType && cb) {
        node.addEventListener(eventType, cb.bind(vm), false);
    }
  }

  compileModel(node, vm, exp, dir) {
    let self = this;
    let val = this.vm[exp];
    this.modelUpdater(node, val);
    new Watcher(this.vm, exp, function (value) {
        self.modelUpdater(node, value);
    });

    node.addEventListener('input', function(e) {
        let newValue = e.target.value;
        if (val === newValue) {
            return;
        }
        self.vm[exp] = newValue;
        val = newValue;
    });
  }

  modelUpdater(node, value) {
    node.value = typeof value == 'undefined' ? '' : value;
  }

  //compileText
  compileText(node, exp){
    let self = this;
    let initText = this.vm[exp];
    this.updateText(node, initText);  // 将初始化的数据初始化到视图中
    new Watcher(this.vm, exp, function (value) {  // 生成订阅器并绑定更新函数
        self.updateText(node, value);
    });
  }

  updateText (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  }

  isTextNode(node) {
    return node.nodeType == 3;
  }
}