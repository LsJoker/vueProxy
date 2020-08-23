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

