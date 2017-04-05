# 如何去写你自己的 Virtual DOM

## 两个重要概念

1. Virtual DOM 是真实 DOM 的一种表示
2. 当在 Virtual DOM Tree 中有改变的时候，会得到一个新的 Virtual Tree。算法会比较这两个树（新树和旧树），找到差异，只对真正的DOM进行必要的小改动。


## 表示 DOM Tree

```
<ul class="list">
  <li>item 1</li>
  <li>item 2</li>
</ul>
```

### 用 JS Object 来表示：

```
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

```
function h(type, props, ...children){
  return {type, props, children};
}
```

#### 使用 helper 方法

```
h(
  'ul', 
  {'class': 'list'}, 
  h('li', {}, 'item 1'),
  h('li', {}, 'item 2')
)
```

## 使用 DOM 表示法

使用前面virtual DOM 来表示真实 DOM。

```
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

```
function updateElement($parent, newNode, oldNode){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  }
}
```

### 当前位置没有节点

```
function updateElement($parent, newNode, oldNode, index = 0){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  } else if (!newNode){
    $parent.removeChild($parent.childNodes[index]);
  }
}
```

### 比较两个 virtual 节点的不同

```
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

```
function updateElement($parent, newNode, oldNode, index = 0){
  if (!oldNode){
    $parent.appendChild(createElement(newNode));
  } else if (!newNode){
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(newNode, oldNode)){
    $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
  } else if (newNode.type) {
    let newNodeLength = newNode.children.length;
    let oldNodeLength = oldNode.children.length;
    for (let i=0; i < newNodeLength || i < oldNodeLength; i++){
      updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);  
    }
  }
}
```



