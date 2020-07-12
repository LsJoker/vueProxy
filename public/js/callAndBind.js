/**
 * call和bind以及apply的区别
 * 
 * 相同点：改变this上下文
 * 不同点：fn.bind： 不会立即调用，而是返回一个绑定后的新函数。
  fn.call：立即调用，返回函数执行结果，this指向第一个参数，后面可有多个参数，并且这些都是fn函数的参数。
  fn.apply：立即调用，返回函数的执行结果，this指向第一个参数，第二个参数是个数组，这个数组里内容是fn函数的参数。
  
  原型以及原型链相关知识：
	1.对象具有原型属性_proto_,实例对象指向其构造函数的原型对象prototype，普通对象则是Object.prototype
	2.函数具有原型属性以及原型对象prototype，prototype是指向函数本身的一个指针，
	function.prototype.constructor === function，他们的构造函数都是Function,属于Function的实例对象，其_proto_指向Function.prototype
	  Function本身也是一种构造函数，所以Function._proto_ === Function.prototype,所有的函数的prototype又都是对象，
	  既Function.prototype._proto_ === Object.prototype
	3.Object本身也是一种特殊的构造函数，所以Object._proto_ === Function.prototype

  */

 /*
  _proto_&&prototype
 */

 //列子1
var A = function() {};
A.prototype.n = 1;
var b = new A();
A.prototype = {
  n: 2,
  m: 3
}
var c = new A();

// console.log(b.n);
// console.log(b.m);

// console.log(c.n);
// console.log(c.m);

var F = function() {};

Object.prototype.a = function() {
  console.log('a');
};

Function.prototype.b = function() {
  console.log('b');
}

var f = new F();

f.a();
// f.b();

F.a();
F.b();

//__proto__指向上一层的原型对象
Object.__proto__ === Function.prototype;
Function.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ === null;

/**
 * 1.call原理
 */
Function.prototype.myCall = function(context){
	//指向当前this
	context = context ? Object(context) : window;
	context.fn = this;
	//调用
	let res = context.fn([...arguments].slice(1));
	//删除原函数
	delete context.fn;
	return res
}


/**
 * 1.apply原理
 */ 
Function.prototype.myApply = function(context){
	context = context ? Object(context) : window;
	context.fn = this;
	let res = context.fn([...arguments][1]);
	delete context.fn;
	return res
}


/**
 * 1.bind原理
 * 
 */
Function.prototype.myBind = function(context){
	context = context ? Object(context) : window;
	context.fn = this;
	let res = function(){
		return context.fn.apply(context,[...arguments].slice(1));
	};
	// delete context.fn;
	return res
}

//组合继承,复制原型的属性至本身属性，复制原型的方法至本身的原型对象上
// function Girl(name){
// 	this.advantages = ['cute','nice'];
// 	this.name = name
// }
// Girl.prototype.sayName = function(){
// 	console.log(this.name);
// }
// function girlFriends (name) {
// 	Girl.call(this,name);//构造函数第一次调用
// }
// girlFriends.prototype = new Girl();//原型拷贝第二次调用
// let girlFriendOne = new girlFriends("one");
// girlFriendOne.advantages.push('sexy');
// console.log(girlFriendOne.advantages);
// girlFriendOne.sayName();

// let girlFriendTwo = new girlFriends("2");
// girlFriendTwo.advantages.push('beauty');
// console.log(girlFriendTwo.advantages);
// girlFriendTwo.sayName();

//以上方式会调用两次父类，为此可以为父类创建副本
function Girl(name){
	this.advantages = ['cute','nice'];
	this.name = name
}
Girl.prototype.sayName = function(){
	console.log(this.name);
}
function girlFriends (name) {
	Girl.call(this,name);//构造函数第一次调用
}
function inheritPrototype (subObj,superObj) {
	let prototypeObj = Object.create(superObj.prototype);
	prototypeObj.constructor = subObj;
	subObj.prototype = prototypeObj;

}

inheritPrototype(girlFriends,Girl);

let girlFriendOne = new girlFriends("one");
girlFriendOne.advantages.push('sexy');
console.log(girlFriendOne.advantages);
girlFriendOne.sayName();

let girlFriendTwo = new girlFriends("2");
girlFriendTwo.advantages.push('beauty');
console.log(girlFriendTwo.advantages);
girlFriendTwo.sayName();

//经典Date继承
//避免没有原型设置方法
Object.setPrototypeOf = Object.setPrototypeOf || function(obj,proto){
	obj.__proto__ = proto;
};
function myDate(){
	var dateInt = new(Function.prototype.bind.apply(Date,[Date].concat(Array.prototype.slice.call(arguments))))();
	Object.setPrototypeOf(dateInt,myDate.prototype);
	return dateInt;
}
//将原型指向Date原型
Object.setPrototypeOf(MyDate.prototype, Date.prototype)

MyDate.prototype.getTest = function getTest() {
    return this.getTime();
};

var date = new MyDate();

// 正常输出，譬如1515638988725
console.log(date.getTest());


//Object.create(),新建一个对象以原对象为原型，原理
Object.create = function(obj) {
	let a = {};
	a.__proto__ = obj;
	return a;
}
Object.create = function(obj) {
	let a = {};
	Object.setPrototypeOf(a,obj);
	return a;
}
Object.create = function(obj) {
	let a = function(){};
	a.prototype = obj;
	return new a();
}
//算法问题，汉诺塔算法
// if(n==0) //如果全部移过去，就返回
// 			return;
// 		else {
// 			hanio(n-1, x, z, y);   //将n-1个在A柱子的盘子通过c柱子移动到B柱子
// 			move(n, x, z);			//将A柱子上编号为n的盘子移动到c柱子
// 			hanio(n- 1, y, x, z);	 //将在B柱子的n-1盘子通过A柱子移动到C柱子		
// 		}
// disc,3:hanoi(2,src,dst,aux)

// disc,2:hanoi(1,src,aux,dst)
// 1,

function hanoi(discs,src,aux,dst) {
	if (discs>0) {
		hanoi(discs-1,src,dst,aux);
		console.log("将SRC"+discs+"移动到"+dst);
		hanoi(discs-1,aux,src,dst);
	}
}
hanoi(4,"a","b","c");