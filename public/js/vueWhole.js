import Observer from "./observe";
import Compile from "./compile";

//vueClass
class Vue {
    constructor(option) {
        //缓存对应的数据
        let self = this;
        self.$data = option.data;
        self.$el = option.el;
        self.method = option.method;

        //将vue内部访问的this指向为data
        Object.keys(self.$data).forEach((key)=>{
            self.proxy(key);
        });
        //监控数据
        new Observer(self.$data);
        //编译模板
        new Compile(self.$el);
        //执行挂载
        option.mounted.call(self);
    }
    proxy(key){
        let self = this;
        Object.defineProperty(self,key,{
            enumerable: false,//不可遍历
            configurable: true,//可配置
            get(){
                return self.$data[key];
            },
            set(val) {
                if (self.$data[key]===val)return;
                self.$data[key]=val;
            }
        })
    }
}