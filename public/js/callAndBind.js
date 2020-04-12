/**
 * call和bind以及apply的区别
 * 
 * 相同点：改变this上下文
 * 不同点：fn.bind： 不会立即调用，而是返回一个绑定后的新函数。
  fn.call：立即调用，返回函数执行结果，this指向第一个参数，后面可有多个参数，并且这些都是fn函数的参数。
  fn.apply：立即调用，返回函数的执行结果，this指向第一个参数，第二个参数是个数组，这个数组里内容是fn函数的参数。
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



