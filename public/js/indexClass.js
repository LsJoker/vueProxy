//es6 Class版
//观察者Observer

//VUe 
class Vue {
  constructor(options) {
    this.$data = options.data;
    this.methods = options.methods;
    this.$el = options.el;
    let self = this;
    Object.keys(this.$data).forEach(function(key) {
      self.proxyKeys(key);  // 绑定代理属性
    });

    new Observer(this.$data);
    new Compile(options.el, this);
    options.mounted.call(this); // 所有事情处理好后执行mounted函数
  }

  proxyKeys(key) {
    let self = this;
    Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        get() {
            return self.$data[key];
        },
        set(newVal) {
            self.$data[key] = newVal;            
        }
    });
  }
  
}

//观察者Observer
class Observer {
  constructor(data){
    this.observe(data)
  }
  observe(data) {
    let self = this;
    if (!data || typeof data !== 'object') {
        return;
        
    }
    Object.keys(data).forEach(function(key) {
        console.log(this);
        this.defineReactive(data, key, data[key]);
        this.observe(data[key]); // 递归遍历所有子属性
    });
  }
  defineReactive(data, key, val) {
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            if (Dep.target) {
                dep.addSub(Dep.target); // 在这里添加一个订阅者
            }
            return val;
        },
        set(newVal) {
          if (val === newVal) {
              return;
          }
          val = newVal;
          console.log('属性' + key + '已经被监听了，现在值为：“' + newVal.toString() + '”');
          dep.notify(); // 如果数据变化，通知所有订阅者
        }
    });
  }
}


// Dep.target = null;

//订阅器
function Dep () {
  this.subs = [];
}
Dep.prototype = {
  addSub: function(sub) {
      this.subs.push(sub);
  },
  notify: function() {
      this.subs.forEach(function(sub) {
          sub.update();
      });
  }
};

//订阅者
function Watcher(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  this.value = this.get();  // 将自己添加到订阅器的操作
}
Watcher.prototype = {
  update: function() {
      this.run();
  },
  run: function() {
      var value = this.vm.$data[this.exp];
      var oldVal = this.value;
      if (value !== oldVal) {
          this.value = value;
          this.cb.call(this.vm, value, oldVal);
      }
  },
  get: function() {
      Dep.target = this;  // 缓存自己
      var value = this.vm.$data[this.exp]  // 强制执行监听器里的get函数
      Dep.target = null;  // 释放自己
      return value;
  }
};

//compil编译
function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  init: function() { 
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    } else {
        console.log('Dom元素不存在');
    } 
  },
  compile:function(node) {
    var nodeAttrs = node.attributes;
    var self = this;
    Array.prototype.forEach.call(nodeAttrs, function(attr) {
        var attrName = attr.name;
        if (self.isDirective(attrName)) {
            var exp = attr.value;
            var dir = attrName.substring(2);
            if (self.isEventDirective(dir)) {  // 事件指令
                self.compileEvent(node, self.vm, exp, dir);
            } else {  // v-model 指令
                self.compileModel(node, self.vm, exp, dir);
            }
            node.removeAttribute(attrName);
        }
    });
  },
  compileEvent: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var cb = vm.methods && vm.methods[exp];

    if (eventType && cb) {
        node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  compileModel: function (node, vm, exp, dir) {
    var self = this;
    var val = this.vm[exp];
    this.modelUpdater(node, val);
    new Watcher(this.vm, exp, function (value) {
        self.modelUpdater(node, value);
    });

    node.addEventListener('input', function(e) {
        var newValue = e.target.value;
        if (val === newValue) {
            return;
        }
        self.vm[exp] = newValue;
        val = newValue;
    });
  },
  //生成dom片段
  nodeToFragment:function(el){
    var fragment = document.createDocumentFragment();
    var child = el.firstChild;
    while (child) {
        // 将Dom元素移入fragment中
        fragment.appendChild(child);
        child = el.firstChild
    }
    return fragment;
  },
  //{{}}指令
  compileElement:function(el){
    var childNodes = el.childNodes;
    var self = this;
    [].slice.call(childNodes).forEach(function(node) {
        var reg = /\{\{(.*)\}\}/;
        var text = node.textContent;
        if (self.isElementNode(node)) {  
          self.compile(node);
        } else if (self.isTextNode(node) && reg.test(text)) {  // 判断是否是符合这种形式{{}}的指令
            self.compileText(node, reg.exec(text)[1]);
        }

        if (node.childNodes && node.childNodes.length) {
            self.compileElement(node);  // 继续递归遍历子节点
        }
    });
  },
  updateText: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  isTextNode: function(node) {
    return node.nodeType == 3;
  },
  isDirective: function(attr) {
    return attr.indexOf('v-') == 0;
  },
  modelUpdater: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  },
  isEventDirective: function(dir) {
      return dir.indexOf('on:') === 0;
  },
  isElementNode: function (node) {
      return node.nodeType == 1;
  },
  //compileText
  compileText:function(node, exp){
    var self = this;
    var initText = this.vm[exp];
    this.updateText(node, initText);  // 将初始化的数据初始化到视图中
    new Watcher(this.vm, exp, function (value) {  // 生成订阅器并绑定更新函数
        self.updateText(node, value);
    });
  }
};


