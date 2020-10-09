// import Observer from "./observe";
// import Compile from "./compile";

// //vueClass
// class Vue {
//     constructor(option) {
//         //缓存对应的数据
//         let self = this;
//         self.$data = option.data;
//         self.$el = option.el;
//         self.method = option.method;

//         //将vue内部访问的this指向为data
//         Object.keys(self.$data).forEach((key)=>{
//             self.proxy(key);
//         });
//         //监控数据
//         new Observer(self.$data);
//         //编译模板
//         new Compile(self.$el);
//         //执行挂载
//         option.mounted.call(self);
//     }
//     proxy(key){
//         let self = this;
//         Object.defineProperty(self,key,{
//             enumerable: false,//不可遍历
//             configurable: true,//可配置
//             get(){
//                 return self.$data[key];
//             },
//             set(val) {
//                 if (self.$data[key]===val)return;
//                 self.$data[key]=val;
//             }
//         })
//     }
// }
class selfVue{
    constructor(option){
        let self = this
        self.$data = option.data
        self.$method = option.method
        self.$el = option.el
        new Observer(self.$data);
        //         //编译模板
        new Compile(self.$el);
        Object.keys(self.$data).map(key=>self.proxyData(key))
        option.mouted.call(self)
    }
    proxyData(key) {
        let self = this;
        Object.defineProperty(self,key,{
            enumerable:false,
            configurable:true,
            get(){
                return self.$data[key]
            },
            set(newVal){
                if (self.$data[key] === newVal)return
                self.$data[key] = newVal
            }
        })
    }
}

class Observer {
    constructor(data) {
        let self = this
        self.observe(data);
    }
    observe(data) {
        if (!data || typeof data != "object")return
        Object.keys(data).map((key)=>{
            self.defineReactive(key,data[key],data)
            self.observe(data[key]);
        })
    }
    defineReactive(key,val,data) {
        let self = this;
        let dep = new Dep();
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get(){
                if (Dep.target)dep.addSub(Dep.target)
                return val
            },
            set(newVal){
                if (val===newVal)return
                val===newVal
                dep.notify()
            }
        })
    }
}
class Dep{
    constructor(){
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.map(watcher=>watcher.update)
    }
}
class watcher{
    constructor(vm,exp,cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.value = this.get();
    }
    get(){
        Dep.target = this;
        let value = this.vm.$data[this.exp]
        Dep.target = null;
        return value
    }
    update(){
        this.run();
    }
    run(){
        let value = this.vm.$data[this.exp];
        let oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }

    }
}