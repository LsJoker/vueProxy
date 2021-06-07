import { Watcher } from './watcher';

class selfVue {
	constructor(option) {
		let self = this;
		self.$data = option.data;
		self.$method = option.method;
		self.$el = option.el;
		new Observer(self.$data);
		//         //编译模板
		new Compile(self.$el, self);
		Object.keys(self.$data).map(key => self.proxyData(key));
		option.mouted.call(self);
	}
	proxyData(key) {
		let self = this;
		Object.defineProperty(self, key, {
			enumerable: false,
			configurable: true,
			get() {
				return self.$data[key];
			},
			set(newVal) {
				if (self.$data[key] === newVal) return;
				self.$data[key] = newVal;
			},
		});
	}
}

class Observer {
	constructor(data) {
		let self = this;
		self.observe(data);
	}
	observe(data) {
		if (!data || typeof data != 'object') return;
		Object.keys(data).map(key => {
			self.defineReactive(key, data[key], data);
			self.observe(data[key]);
		});
	}
	defineReactive(key, val, data) {
		let self = this;
		let dep = new Dep();
		Object.defineProperty(data, key, {
			enumerable: true,
			configurable: true,
			get() {
				if (Dep.target) dep.addSub(Dep.target);
				return val;
			},
			set(newVal) {
				if (val === newVal) return;
				val === newVal;
				dep.notify();
			},
		});
	}
}
class Dep {
	constructor() {
		this.subs = [];
	}
	addSub(watcher) {
		this.subs.push(watcher);
	}
	notify() {
		this.subs.map(watcher => watcher.update);
	}
}
class watcher {
	constructor(vm, exp, cb) {
		this.vm = vm;
		this.exp = exp;
		this.cb = cb;
		this.value = this.get();
	}
	get() {
		Dep.target = this;
		let value = this.vm.$data[this.exp];
		Dep.target = null;
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
class Compile {
	constructor(el, vm) {
		this.$el = document.querySelector(el);
		this.fragment = null;
		this.vm = vm;
		this.init();
	}
	init() {
		if (this.$el) {
			this.fragment = this.nodeToFragment(this.$el);
			this.compileElement(this.fragment);
			this.$el.appendChild(this.fragment);
		} else {
			alert('No dom!');
		}
	}
	nodeToFragment(el) {
		let childNode = el.firstChild;
		let fragment = document.createDocumentFragment();
		while (childNode) {
			fragment.appendChild(childNode);
			childNode = el.firstChild;
		}
		return fragment;
	}
	compileElement(el) {
		let self = this;
		let childNodes = el.childNodes;
		let reg = /\{\{(.*)\}\}/;
		[].slice.call(childNodes).map(childNode => {
			if (self.isElement(childNode)) {
				self.compile(childNode);
			} else if (self.isTextNode(childNode) && reg.test(childNode)) {
				self.compileTxt(childNode, reg.exec(childNode)[1]);
			}
			if (childNode.childNodes && childNode.childNodes.length > 0) {
				self.compileElement(childNode);
			}
		});
	}
	isElement(node) {
		return node.type === 1;
	}
	compile(node) {
		let attrs = node.attributes;
		let self = this;
		Array.prototype.forEach.call(attrs, function(attr) {
			if (self.isDerictive(attr)) {
				let dir = attr.split('-')[1];
				let exp = attr.value;
				if (self.isEventDerictive(dir)) {
					self.compileEvent(self.vm, node, exp, dir);
				} else {
					self.compileModel(self.vm, node, exp, dir);
				}
				node.removeAttribute(attr);
			}
		});
	}
	isDerictive(attr) {
		return attr.indexOf('v-') === 0;
	}
	isEventDerictive(dir) {
		return dir.indexOf('on:') === 0;
	}
	compileEvent(vm, node, exp, dir) {
		let event = dir.split(':')[1];
		if (vm.method && vm.method[exp]) {
			node.addEventListener(event, vm.method[exp].call(vm), false);
		}
	}
	compileModel(vm, node, exp, dir) {
		let val = vm[exp];
		self.updateMode(node, val);
		new Watcher(vm, exp, function() {
			self.updateMode(node, val);
		});
		node.addEventListener('input', function(e) {
			let newVal = e.target.value;
			if (newVal === val) return;
			self.vm[exp] = newValue;
			val = newValue;
		});
	}
	updateMode(node, val) {
		node.value = typeof value == 'undefined' ? '' : value;
	}
	compileTxt(node, exp) {
		let self = this;
		let initText = self.vm[exp];
		this.updateText(node, initText); // 将初始化的数据初始化到视图中
		new Watcher(self.vm, exp, function(value) {
			// 生成订阅器并绑定更新函数
			self.updateText(node, value);
		});
	}

	updateText(node, value) {
		node.textContent = typeof value == 'undefined' ? '' : value;
	}

	isTextNode(node) {
		return node.nodeType == 3;
	}
}
