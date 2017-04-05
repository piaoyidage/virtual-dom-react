// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
// import './index.css';

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );


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
