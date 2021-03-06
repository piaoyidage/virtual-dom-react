/* eslint-disable */

/**
 * 自定义 jsx
 */

/** @jsx h */
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

const a = (
	<ul className="list">
		<li>item 1</li>
		<li>item 2</li>
	</ul>
);

const b = (
	<ul className="list">
    	<li>item 1</li>
    	<li>hello</li>
  	</ul>
);

console.log(a);

/**
 * [createElement 根据 virtual dom 创建真实 dom]
 * @param  {[type]} node [virtual dom]
 * @return {[type]}      [real dom]
 */
function createElement(node) {
	if (typeof node === 'string') {
		// 如果是文本节点
		return document.createTextNode(node);
	}

	// 非文本节点
	let $el = document.createElement(node.type);

	// 设置 属性
	setProps($el, node.props);

	// 添加事件
	addEventListeners($el, node.props);

	node.children
	   .map(createElement)
	   .forEach($el.appendChild.bind($el));
	return $el;
}

/**
 * [updateElement 更新dom节点]
 * @param  {[type]} $parent [virtual node 的父亲节点]
 * @param  {[type]} newNode [新的 virtual node]
 * @param  {[type]} oldNode [旧的 virtual node]
 * @param  {Number} index   [新的 virtual node 在父亲节点的位置]
 * @return {[type]}         [description]
 */
function updateElement($parent, newNode, oldNode, index = 0) {
	 if (!oldNode) {
	 	// 老节点 没有，增加新节点
	 	$parent.appendChild(createElement(newNode));
	 } else if (!newNode) {
	 	// 新节点 没有，删除老节点
	 	$parent.removeChild($parent.childNodes[index]);
	 } else if (changed(newNode, oldNode)){
	 	// 新节点和老节点 发生变化，替换
	 	$parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
	 } else if (newNode.type) {
	 	// 更新属性
	 	updateProps($parent.childNodes[index], newNode.props, oldNode.props);
	 	// 遍历子节点 再比较更新
	 	const newNodeLength = newNode.children.length,
	 		oldNodeLength = oldNode.children.length;

	 	for (let i = 0; i < newNodeLength || i < oldNodeLength; i++){
	 		updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
	 	}
	 }
}

/**
 * [changed 判断两个节点是否发生了改变]
 * @param  {[type]} node1 [description]
 * @param  {[type]} node2 [description]
 * @return {[type]}       [description]
 */
function changed(node1, node2) {
	return typeof node1 !== typeof node2 ||
		   typeof node1 === 'string' && node1 !== node2 ||
		   node1.type !== node2.type ||
		   node1.props && node1.props.forceUpdate;
}


const $root = document.getElementById('root'),
      $reload = document.getElementById('reload');

// updateElement($root, a);

// $reload.addEventListener('click', () => {
// 	updateElement($root, b, a)
// });



/**
 * [setProps 设置属性]
 * @param {[type]} $target [description]
 * @param {[type]} props   [description]
 */
function setProps($target, props) {
	Object.keys(props).forEach(name => {
		// 过滤__ 前缀属性
		if (name.slice(0, 2) !== '__'){
			setProp($target, name, props[name]);
		}
	});
}
/**
 * [setProp 设置属性]
 * @param {[type]} $target [description]
 * @param {[type]} name    [description]
 * @param {[type]} value   [description]
 */
function setProp($target, name, value) {
	if (isCustomProp(name)){
		// 是否是自定义属性
		return;
	} else if (name === 'className') {
		// 当前属性是 className 修正
		$target.setAttribute('class', value);
	} else if (typeof value === 'boolean') {
		// 当前属性是 boolean 修正
		setBooleanProp($target, name, value);
	} else {
		$target.setAttribute(name, value);
	}
}

/**
 * [isCustomProp 是否自定义属性 ]
 * @param  {[type]}  name [description]
 * @return {Boolean}      [description]
 */
function isCustomProp(name){
	return isEventProp(name) || name === 'forceUpdate';
}

/**
 * [setBooleanProp description]
 * @param {[type]} $target [description]
 * @param {[type]} name    [description]
 * @param {[type]} value   [description]
 */
function setBooleanProp($target, name, value) {
	if (value) {
		$target.setAttribute(name, value);
		$target[name] = true;
	} else {
		$target[name] = false;
	}
}

/**
 * [removeProp 移除属性]
 * @param  {[type]} $target [description]
 * @param  {[type]} name    [description]
 * @param  {[type]} value   [description]
 * @return {[type]}         [description]
 */
function removeProp($target, name, value) {
	if (isCustomProp(name)) {
		return;
	} else if (name === 'className') {
		$target.removeAttribute('class');
	} else if (typeof value === 'boolean') {
		removeBooleanProp($target, name, value);
	} else {
		$target.removeAttribute($target, name, value);
	}
}

function removeBooleanProp($target, name, value) {
	$target.removeAttribute(name);
	$target[name] = false;
}


/**
 * [updateProp 更新属性]
 * @param  {[type]} $target [description]
 * @param  {[type]} name    [description]
 * @param  {[type]} newVal  [description]
 * @param  {[type]} oldVal  [description]
 * @return {[type]}         [description]
 */
function updateProp($target, name, newVal, oldVal) {
	if (!newVal) {
		// 新节点 没有该属性值
		removeProp($target, name, oldVal);
	} else if (!oldVal || newVal !== oldVal) {
		// 旧节点没有该属性 或者 两者不相等
		setProp($target, name, newVal);
	}
}

function updateProps($target, newProps, oldProps = {}) {
	const props = Object.assign({}, newProps, oldProps);
	Object.keys(props).forEach(name => {
		if (name.slice(0, 2) !== '__') {
			// 过滤__前缀属性
			updateProp($target, name, newProps[name], oldProps[name]);
		}
	});
}

/**
 * [isEventProp 判断是否是事件属性]
 * @param  {[type]}  name [description]
 * @return {Boolean}      [description]
 */
function isEventProp(name) {
	// 属性名以 on 为前缀
	return /^on/.test(name);
}

/**
 * [extractEventName 抽取事件名]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function extractEventName(name) {
	return name.slice(2).toLowerCase();
}

function addEventListeners($target, props) {
	Object.keys(props).forEach(name => {
		if (isEventProp(name)) {
			$target.addEventListener(extractEventName(name), props[name]);
		}
	});
}

// const f = (
// 	<ul style="list-style: none;">
// 		<li className="item">item 1</li>
// 		<li className="item">
// 			<input type="checkbox" checked={true} />
// 			<input type="text" disabled={false} />
// 		</li>
// 	</ul>
// );

// const g = (
//   <ul style="list-style: none;">
//     <li className="item item2">item 1</li>
//     <li style="background: red;">
//       <input type="checkbox" checked={false} />
//       <input type="text" disabled={true} />
//     </li>
//   </ul>
// );


function log(e) {
  console.log(e.target.value);
}

const f = (
	<ul style="list-style: none;">
		<li className="item" onClick={() => alert('hi!')}>item 1</li>
		<li className="item">
			<input type="checkbox" checked={true} />
			<input type="text" onInput={log} />
		</li>
		{/* this node will always be updated */}
		<li forceUpdate={true}>text</li>
	</ul>
);

const g = (
	<ul style="list-style: none;">
		<li className="item item2" onClick={() => alert('hi!')}>item 1</li>
		<li style="background: red;">
		    <input type="checkbox" checked={false} />
		    <input type="text" onInput={log} />
		</li>
		{/* this node will always be updated */}
		<li forceUpdate={true}>text</li>
	</ul>
);


// $root.appendChild(createElement(f));


updateElement($root, f);
$reload.addEventListener('click', () => {
	updateElement($root, g, f);
});
