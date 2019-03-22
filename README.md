# Vcm
Vue Single Js Component Manager, Standalone, without webpack / npm / node

# 前言
Vue 的单文件组件（Single File Component）看着十分诱人，But 必须要上 webpack  
webpack 的新人友好度太低，心有不甘，捣腾一番就有了这个 Vcm (Vue Single Js Component Manager)  
不需要 webpack / npm / nodejs 也能轻松愉快的用上 单JS文件组件  

# 快速入门

单例组件
```
是一种特殊的全局组件，和 Vue 插件有点相似，只不过 Vue 插件可以有更多其他功能  
Vcm 会保证只生成一个实例，不需要额外代码  
单例组件 export 方法注册到 Vue.prototype，所有组件实例都可直接访问到  
最常见的使用场景就是 弹框信息组件
```

单例组件 / 全局组件 / 局部组件 定义，定义方式基本完全一样
```js
// 创建单JS组件实例
let component = Vcm.create();
// 这个就是 new Vue() 的参数
component.options = {
    // 平常怎么写，就怎么写
    // 按 Vue 文档，组件的 data 必须是个函数
    data : function(){
        return {};
    },
}
// 组件样式，字符串 或者 数组
component.style = [
];
// 定义 单例组件 导出方法，单例组件 有这部分，全局组件 / 局部组件 没有
component.export = {
    method : function(){}，
};
```
html 文件内
```js
// 单例组件
Vcm.singleton('$singleton', 'js/vcm/singleton.js');
// 全局组件
Vcm.global('global', 'js/vcm/global.js');

let app = new Vue({
    el : '#app',
    data : {},
    components : {
        // 局部组件
        'local' : Vcm.local('js/vcm/local.js'),
    },
});
```
组件内 引入 子组件
```js
// js/vcm/local.js
components : {
    // 这里用的是相对于当前组件（js文件）的相对路径
    'local-sub' : component.local('sub.js'),
    // 这里用的是相对于页面的相对路径，路径部分下面会有详细文档
    'local-base' : Vcm.local('local-base.js'),
},
```

# 技术细节

`1` 依赖
``` html
只需要 Vue 和 axios 两个库 和 Vcm 本身  
<script src="js/axios-0.19.0.js"></script>  
<script src="js/vue-2.6.8.js"></script>  
<script src="js/vcm.js"></script>
```
`2` 路径
```js
页面文件 : http://vcm.demo/path/index.html 
基准路径 : http://vcm.demo/path  
根路径　 : http://vcm.demo  
组件文件 : http://vcm.demo/path/js/vcm/test.js  
```
```
引入 JS 组件文件时支持以下路径方式：

           前缀    Vcm 方法 singleton/global/local  组件方法 local
相对路径     ''     http://vcm.demo/path            http://vcm.demo/path/js/vcm
基准路径    '/'     http://vcm.demo/path            http://vcm.demo/path
根路径　   '//'     http://vcm.demo                 http://vcm.demo

绝对路径   'http://domain/path/absolute.js' 不做转换，直接使用
```
```
Vcm 方法 singleton/global/local

  'js/vcm/foo.js' => http://vcm.demo/path/js/vcm/foo.js
 '/js/vcm/foo.js' => http://vcm.demo/path/js/vcm/foo.js
'//js/vcm/foo.js' => http://vcm.demo/js/vcm/foo.js

'http://domain/path/absolute.js' => http://domain/path/absolute.js
```
```
组件方法 local ( 组件 js 路径 http://vcm.demo/path/js/vcm/test.js )

  'foo.js' => http://vcm.demo/path/js/vcm/foo.js
 '/foo.js' => http://vcm.demo/path/foo.js
'//foo.js' => http://vcm.demo/foo.js

'http://domain/path/absolute.js' => http://domain/path/absolute.js
```

`3` 单例组件 / 全局组件 / 局部组件 / 子组件 引入方式
```js
/**  
 * 单例组件  
 * @param $name 变量名，被注册到 Vue.prototype  
 * @param $uri  js文件路径 (参考上一节 路径)  
 * @param $dom  dom引用 单例组件将被插入到哪个dom节点下 (默认为 document.body)  
 */  
Vcm.singleton($name, $uri, $dom);
```
```js
/**  
 * 全局组件  
 * @param $tag html标签名  
 * @param $uri js文件路径 (参考上一节 路径)  
 */  
Vcm.global($tag, $uri);
```
```js
/**  
 * 局部组件  
 * @param $uri js文件路径 (参考上一节 路径)  
 */  
Vcm.local($uri);
```
```js
/**  
 * 组件内引用子组件  
 * @var   component js组件实例  
 * @param $uri      js文件路径 (参考上一节 路径)  
 */ 
component.local($uri);
```

`4` 引入子组件的两种方法

    页面URL    : http://vcm.demo/path/index.html  
    组件JS URL : http://vcm.demo/path/js/vcm/local.js

    1. 组件实例方法   component.local('sub.js') => http://vcm.demo/path/js/vcm/sub.js 
    2. Vcm.local     Vcm.local('sub.js')       => http://vcm.demo/path/sub.js

`5` 样式

    目前只支持直接的 CSS 语法, scoped style 尚不支持 
    所有组件的 css 各自被创建并插入到 HEAD 节点下  
    <style type="text/css" data-uri="这里是组件JS的绝对 URI，方便调试">  

`6` 加载 及 加载顺序

    单JS组件的 js 都通过 ajax 进行异步加载  
    全局组件 和 局部组件 使用了 Vue 的异步加载机制  
    Vcm 会保证 单例组件 只有一个实例  
    Vcm 会保证 单例组件 在 全局组件 和 局部组件 之前加载完成  

### More ###
