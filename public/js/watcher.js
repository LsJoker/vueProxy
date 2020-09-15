//VUe 
export //观察者Observer
class Dep{
  constructor(){
      //订阅的数组
      this.subs = []
  }
  //添加订阅
  addSub(watcher){
      this.subs.push(watcher);
  }
  notify(){
      //调用watcher的更新方法
      this.subs.forEach(watcher => watcher.update());
  }
}

//订阅者
export class Watcher {
  constructor(vm, exp, cb){
    this.cb = cb;
    this.vm = vm;
     
    this.exp = exp;
    this.value = this.get();  // 将自己添加到订阅器的操作
  }

  get() {
    Dep.target = this;  // 缓存自己
    let value = this.vm.$data[this.exp]  // 强制执行监听器里的get函数
    Dep.target = null;  // 释放自己
    return value;
  }

  update() {
    this.run();
  }
  
  run() {
    let value = this.vm.$data[this.exp];
    let oldVal = this.value;
    if (value !== oldVal) {
        this.value = value;
        this.cb.call(this.vm, value, oldVal);
    }
  }
}