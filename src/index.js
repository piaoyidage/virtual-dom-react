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
	 	// 遍历子节点 再比较更新
	 	let newNodeLength = newNode.children.length,
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
		   node1.type !== node2.type;
}


const $root = document.getElementById('root'),
      $reload = document.getElementById('reload');

updateElement($root, a);

$reload.addEventListener('click', () => {
	updateElement($root, b, a)
});



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
	// TODO
	return;
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



const f = (
	<ul style="list-style: none;">
		<li className="item">item 1</li>
		<li className="item">
			<input type="checkbox" checked={true} />
			<input type="text" disabled={false} />
		</li>
	</ul>
);

$root.appendChild(createElement(f));
