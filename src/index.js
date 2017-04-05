/**
 * 自定义 jsx
 */

/** @jsx h */
function h(type, props, ...children) {
  return { type, props, children };
}

const a = (
  <ul className="list">
    <li>item 1</li>
    <li>item 2</li>
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
	$el.children
	   .map(createElement)
	   .forEach($el.appendChild.bind($el));
	return $el;
}
