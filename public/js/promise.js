//promise
//基于promiseA+
function Promise (fn){
	//存回调，值，及状态
	const cbs = [];
	let val = null;
	let state = "pending";
	//fn执行
	fn(resolve);

	function resolve (newVal) {
		//fulllfilled状态返回
		if (state !== "pending") return;
		state = "fullfilled";
		val = newVal;
		//下一个回调执行
		handleCb(newVal);
	}
	function handleCb (newVal) {
		while(cbs.length>1) {
			const cb = cbs.shift();
			handle(cb);
		}
	}
	function handle(callback){
		if (state === "pending") {
			cbs.push(callback);
			return;
		}
		if (state === "fullfilled") {
			//处理回调
			const res = callback.onfullfilled(val);
			//处理下一个promise
			callback.resolve(res);
		}
	}
	//then方法
	this.then = (onfullfilled)=>{
		return new Promise((resolve,reject)=>{
			handleCb({resolve,onfullfilled})
		})
	} 
}
//原理参照
new Promise(function(resolve,reject){
	// resolve(1)
	// reject(0)
}).then(function(resolve,reject) {
	
})