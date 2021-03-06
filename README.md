# 如何去写你自己的 Virtual DOM

## 两个重要概念

1. Virtual DOM 是真实 DOM 的一种表示
2. 当在 Virtual DOM Tree 中有改变的时候，会得到一个新的 Virtual Tree。算法会比较这两个树（新树和旧树），找到差异，只对真正的DOM进行必要的小改动。


## 表示 DOM Tree

```html
<ul class="list">
  <li>item 1</li>
  <li>item 2</li>
</ul>
```

### 用 JS Object 来表示：

```js
{ 
  type: 'ul', 
  props: {'class': 'list'}, 
  children: [
    {
      type: 'li',
      props: {},
      children: ['item1']
    },
    {
      type: 'li',
      props: {},
      children: ["item2"]
    }
  ]
}
```

### 写个 helper 方法

```js
function h(type, props, ...children){
  return {type, props, children};
}
```

#### 使用 helper 方法

```js
h(
  'ul', 
  {'class': 'list'}, 
  h('li', {}, 'item 1'),
  h('li', {}, 'item 2')
)
```

### jsx 语法

```html
<ul className=”list”>
  <li>item 1</li>
  <li>item 2</li>
</ul>
```

对于上面的代码，使用 jsx 语法，React：

```js
React.createElement(‘ul’, { className: ‘list’ },
  React.createElement(‘li’, {}, ‘item 1’),
  React.createElement(‘li’, {}, ‘item 2’),
);
```

使用自定义的 jsx 语法替换 React 中的创建方式：

```
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

console.log(a);
```

## 使用 DOM 表示法

使用前面virtual DOM 来表示真实 DOM。

```js
// 创建一个节点 两种情况
// 1. virtual text nodes
// 2. virtual element nodes
function createElement(node) {
  if (typeof node === 'string'){
    return document.createTextNode(node);
  } 

  let $el = document.createElement(node.type);
  node.children
      .map(createElement)
      .forEach($el.appendChild.bind($el));

  return $el;
}
```

## 处理变化

思考下如何比较两棵 virtual Tree 的不同？

1. appendChild
2. removeChild
3. replaceChild

### 当前位置添加节点

```html
<!-- new -->
<ul>
  <li>hello</li>
  <li>world</li>
</ul>

<!-- old -->
<ul>
  <li>hello</li>
</ul>

```

```js
function updateElement($parent, newNode, oldNode){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  }
}
```

### 当前位置没有节点

```html
<!-- new -->
<ul>
  <li>hello</li>
</ul>

<!-- old -->
<ul>
  <li>hello</li> 
  <li>world</li>
</ul>

```

```js
function updateElement($parent, newNode, oldNode, index = 0){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  } else if (!newNode){
    $parent.removeChild($parent.childNodes[index]);
  }
}
```

### 比较两个 virtual 节点的不同

```html
<!-- new -->
<div>
  <p>hello</p>
  <button>world</button>
</div>

<!-- old -->
<div>
  <p>hello</p>
  <p>world</p>
</div>

```

```js
function changed(node1, node2){
  return typeof node1 !== typeof node2 ||
         typeof node1 === 'string' && node1 !== node2 ||
         node1.type !== node2.type;
}

function updateElement($parent, newNode, oldNode, index = 0){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  } else if (!newNode){
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(newNode, oldNode)){
    $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
  }
}
```

### 比较子节点

```html
<!-- new -->
<ul>
  <li>hello</li>
  <li>
    <p>hello</p>
    <p>world</p>
  </li>
</ul>

<!-- old -->
<ul>
  <li>hello</li> 
  <li>
    <p>hello</p>
    <div>hello</div>
  </li>
</ul>

```

```js
function updateElement($parent, newNode, oldNode, index = 0){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  } else if (!newNode){
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(newNode, oldNode)){
    $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
  } else if (newNode.type) {
    const newNodeLength = newNode.children.length;
    const oldNodeLength = oldNode.children.length;
    for (let i=0; i < newNodeLength || i < oldNodeLength; i++){
      updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);  
    }
  }
}
```

### 测试

```

const a = (
  <ul>
    <li>item 1</li>
    <li>item 2</li>
  </ul>
);

const b = (
  <ul>
    <li>item 1</li>
    <li>
      <div>hello</div>
      <p>world</p>
    </li>
  </ul>
);

const $root = document.getElementById('root');
const $reload = document.getElementById('reload');

updateElement($root, a);

$reload.addEventListener('click', () => {
  updateElement($root, b, a);
});

```



### 比较属性

比较属性，有三种情况

```html
<!-- new -->
<li className="hello"></li>

<!-- old -->
<li></li>
```

```html
<!-- new -->
<li></li>

<!-- old -->
<li className="hello"></li>
```

```html
<!-- new -->
<li className="hello"></li>

<!-- old -->
<li className="world"></li>
```

上面三种情况，无非就是设置属性或者删除属性

```js
function updateProp($target, name, newValue, oldValue) {
  if (!newValue) {
    removeProp($target, name, oldValue);
  } else if (!oldValue || newValue !== oldValue) {
    setProp($target, name, newValue);
  }
}

function updateProps($target, newProps, oldProps) {
  const props = Object.assign({}, newProps, oldProps);
  Object.keys(props)
        .filter(name => {return !name.match(/^__*/);})
        .forEach(name => {
          updateProp($target, name, newProps[name], oldProps[name]);
        });
}

```

#### 设置属性

##### 初步思路

```js
function setProp($target, name, value) {
  $target.setAttribute(name, value);
}

function setProps($target, props) {
  Object.keys(props).forEach(name => {
    setProp($target, name, props[name]);
  });
}
```

##### 进一步优化

```js
function setProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === "className") {
    $target.setAttribute("class", value);
  } else if (typeof value === "boolean") {
    setBooleanProp($target, name, value);
  } else {
    $target.setAttribute(name, value);
  }
}

function setProps($target, props) {
  Object.keys(props).filter(name => {
    return !name.match(/^__*/);
  }).forEach(name => {
    setProp($target, name, props[name]);
  });
}

function setBooleanProp($target, name, value) {
  if (value) {
    $target.setAttribute(name, value);
    $target[name] = true;
  } else {
    $target[name] = false;
  }
}

function isCustomProp(name) {
  return false;
}
```

#### 删除属性

```js
function removeProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === "className") {
    $target.removeAttribute("class", value);
  } else if (typeof value === "boolean") {
    removeBooleanProp($target, name);
  } else {
    $target.removeAttribute(name);
  }
}

function removeBooleanProp($target, name) {
  $target.removeAttribute(name, value);
  $target[name] = false;
}
```

#### 添加到 updateElement

```js
function updateElement($parent, newNode, oldNode, index = 0) {
  if (!oldNode) {
    $parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(newNode, oldNode)) {
    $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
  } else if (newNode.type) {

    updateProps($parent.childNodes[index], newNode.props, oldNode.props);

    const newNodeLength = newNode.children.length;
    const oldNodeLength = oldNode.children.length;
    for (let i = 0; i < newNodeLength || i < oldNodeLength; i++) {
      updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
    }
  }
}
```

### 测试

```
const f = (
  <ul style="list-style: none;">
    <li className="item">item 1</li>
    <li className="item">
      <input type="checkbox" checked={true} />
      <input type="text" disabled={false} />
    </li>
  </ul>
);

const g = (
  <ul style="list-style: none;">
    <li className="item item2">item 1</li>
    <li style="background: red;">
      <input type="checkbox" checked={false} />
      <input type="text" disabled={true} />
    </li>
  </ul>
);

const $root = document.getElementById('root');
const $reload = document.getElementById('reload');

updateElement($root, f);
$reload.addEventListener('click', () => {
  updateElement($root, g, f);
});
```

## 事件

```html
<button onClick={() => alert('hello');}></button>
```

事件可以看作是一种特殊的属性

```js
function isEventProp(name) {
  return /^on/.test(name);
}

function extractEventName(name) {
  return name.slice(2).toLowerCase();
}

function addEventListeners($target, props) {
  Object.keys(props).forEach( name => {
    if (isEventProp(name)) {
      $target.addEventListener(extractEventName(name), props[name]);
    }
  });
}
```

#### 添加到 createElement

```js
function createElement(node) {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }

  let $el = document.createElement(node.type);

  setProps($el, node.props);

  addEventListeners($el, node.props);

  node.children.map(createElement).forEach($el.appendChild.bind($el));

  return $el;
}
```


