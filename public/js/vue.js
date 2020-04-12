//VUe 
import Compile from './compile.js'
import Observer from './observe.js'
export default class Vue {
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