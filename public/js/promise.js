//promise
//基于promiseA+
function Promise (fnc){
	//存回调，值，及状态
	const cbs = [];
	let val = null;
	let state = "pending";
	

	function resolve (newVal) {
		//fulllfilled状态返回
		const fn = ()=>{
			if (state !== "pending") return;
			//问题1：如果then中执行一个函数返回的是promise。则返回不正确
			if(newVal && (typeof newVal === "object" || typeof newVal === "function")) {
				const {then} = newValue
				if(typeof then === 'function'){   
					// newValue 为新产生的 Promise,此时resolve为上个 promise 的resolve
					//相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
					then.call(newValue,resolve)
					return
				}
			}
			state = "fullfilled";
			val = newVal;
			//下一个回调执行
			handleCb(newVal);
		}
		setTimeout(fn,0);
	}
	function reject (error) {
		//fulllfilled状态返回
		const fn = ()=>{
			if (state !== "pending") return;
			//问题1：如果then中执行一个函数返回的是promise。则返回不正确
			if(error && (typeof error === "object" || typeof error === "function")) {
				const {then} = error
				if(typeof then === 'function'){   
					// newValue 为新产生的 Promise,此时resolve为上个 promise 的resolve
					//相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
					then.call(error,resolve)
					return
				}
			}
			state = "rejected";
			val = error;
			//下一个回调执行
			handleCb(error);
		}
		setTimeout(fn,0);
	}
	function handleCb (newVal) {
		while(cbs.length>0) {
			const cb = cbs.shift();
			handle(cb);
		}
	}
	function handle(callback){
		if (state === "pending") {
			cbs.push(callback);
			return;
		}

		const cb = state === "fullfilled" ? callback.onfullfilled : callback.onrejected;
		const next = state === "fullfilled" ? callback.resolve : callback.reject;
		if (!cb) {
			next(val);
			return;
		}
		//做异常处理
		try {
			const res = cb(val);
			next(val);
		} catch (ex){
			callback.reject(ex)
		}
		
		// if (state === "fullfilled") {
		// 	if(!callback.onFulfilled){
		// 		callback.resolve(value)
		// 		return; 
		// 	}
		// 	//处理回调
		// 	const res = callback.onfullfilled(val);
		// 	//处理下一个promise
		// 	callback.resolve(res);
		// }
	}
	//then方法
	this.then = (onfullfilled,onrejected)=>{
		return new Promise((resolve,reject)=>{
			handle({resolve,onfullfilled,onrejected,reject})
		})
	}
	//catch
	this.catch=function(onError) {
		this.then(null,onError)
	}
	//finally,最后执行的操作，任意状态最后都要执行
	this.finally=function(onDone){
		this.then(onDone,onDone);
	}
	//resolve 无参数 [直接返回一个resolved状态的 Promise 对象]
	// 普通数据对象 [直接返回一个resolved状态的 Promise 对象]
	// 一个Promise实例 [直接返回当前实例]
	// 一个thenable对象(thenable对象指的是具有then方法的对象) [转为 Promise 对象，并立即执行thenable对象的then方法。]
	this.resolve = function(value){
		if (value instanceof Promise) {
			return value
		} else if (value && typeof value.then === "function") {
			const thenFun = value.then;
			return new Promise ((resolve)=>{
				thenFun(resolve)
			})
		} else if (value) {
			return new Promise(resolve=>resolve(value))
		} else {
			return new Promise(resolve=>resolve)
		}
	}
	//reject和resolve同理，但是reject状态确定，只能是rejected状态
	this.reject = function(value){
		return new Promise((resolve,reject)=>reject(value))
	}
	//all方法
	//计数promise个数，逐个执行存值，返回值
	this.all=function(arr) {
		return new Promise(function(resolve,reject){
			let args = [].prototype.slice.call(arr);
			let restLen = args.length;
			function res(idx,itemPromise) {
				try {
					if (itemPromise && typeof itemPromise.then === "function") {
						itemPromise.then.call(itemPromise,function(itemPromise){
							res(i,itemPromise);
						},reject)
						return;
					}
					args[i] = itemPromise;
					if (--restLen === 0) {
						resolve(args);
					}
				} catch(ex) {
					reject(ex);
				}
				

			}

			for (let i=0;i<args.length;i++) {
				res(i,args[i]);
			}
		})		
	}

	//race
	this.race = function(arr) {
		return new Promise(function(resolve,reject){
			for (let i=0;i<arr.length;i++) {
				arr[i].then.call(arr[i],resolve,reject)
			}
		})
	}
	//fn执行
	try {
		fnc(resolve,reject);
	} catch (ex) {
		reject(ex);
	}
	
}
//原理参照
new Promise(function(resolve,reject){
	// resolve(1)
	// reject(0)
	console.log(32)
	resolve(1)
}).then(function(resolve,reject) {
	console.lo(resolve);
}).catch((ex)=>{
	debugger
	console.log(ex)
})

