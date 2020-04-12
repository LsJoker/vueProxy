//VUe 
export default //观察者Observer
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
        console.log(self);
        self.defineReactive(data, key, data[key]);
        self.observe(data[key]); // 递归遍历所有子属性
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