# Vcm
Vue Single Js Component Manager, Standalone, without webpack / npm / node

[中文 README](https://github.com/FractalDev/Vcm/blob/master/README.zhcn.md)

# 前言
Vue `SFC` （Single File Component）is awesome, but it require `Webpack`  
`Webpack` is not friendly to newbie, i work several days, make this `Vcm` (Vue Single Js Component Manager)  
enjoy `Vue Single Js Component` without webpack / npm / nodejs

# Quick Start

Singleton Component
```
Singleton Component is special kind of Global Component, a little bit like Vue Plugin, but Vue Plugin can do more things.  
do not need any extra code for singleton instance, Vcm make it done.  
Singleton Component export methods, register to Vue.prototype, all component can access these methods.  
The most common usage : Toast
```

Singleton Component / Global Component / Local Component, all these component's code are almost the same
```js
// create single js component instance
let component = Vcm.create();
// options is same as param in new Vue() 
component.options = {
    // anything just like you coding common Vue component
    // component data must be a method , as Vue doc says
    data : function(){
        return {};
    },
}
// component style, string or array
component.style = [
];
// singleton component export methods, Global Component / Local Component has no such part
component.export = {
    method : function(){},
};
// return component info
return component;
```
html
```js
// import singleton component
Vcm.singleton('$singleton', 'js/vcm/singleton.js');
// import global component
Vcm.global('global', 'js/vcm/global.js');

let app = new Vue({
    el : '#app',
    data : {},
    components : {
        // import local component
        'local' : Vcm.local('js/vcm/local.js'),
    },
});
```
sub local component
```js
// js/vcm/local.js
components : {
    // sub.js is relative to component instance
    'local-sub' : component.local('sub.js'),
    // local-base.js is relative to page base uri
    'local-base' : Vcm.local('local-base.js'),
},
```

# Detail Doc

`1` Depend
``` html
only require Vue & axios & Vcm    
<script src="js/axios-0.19.0.js"></script>  
<script src="js/vue-2.6.8.js"></script>  
<script src="js/vcm.js"></script>
```
`2` Path
```js
Html      : http://vcm.demo/path/index.html 
Base      : http://vcm.demo/path  
Root　    : http://vcm.demo  
Component : http://vcm.demo/path/js/vcm/test.js  
```
```
Path mode for import Js Component：

          prefix    Vcm singleton/global/local  component.local
Relative      ''    http://vcm.demo/path        http://vcm.demo/path/js/vcm
Base         '/'    http://vcm.demo/path        http://vcm.demo/path
Root 　     '//'    http://vcm.demo             http://vcm.demo

Absolute 'http://domain/path/absolute.js' , juse use it
```
```
Sample : Vcm singleton/global/local

  'js/vcm/foo.js' => http://vcm.demo/path/js/vcm/foo.js
 '/js/vcm/foo.js' => http://vcm.demo/path/js/vcm/foo.js
'//js/vcm/foo.js' => http://vcm.demo/js/vcm/foo.js

'http://domain/path/absolute.js' => http://domain/path/absolute.js
```
```
Sample component.local ( component js url : http://vcm.demo/path/js/vcm/test.js )

  'foo.js' => http://vcm.demo/path/js/vcm/foo.js
 '/foo.js' => http://vcm.demo/path/foo.js
'//foo.js' => http://vcm.demo/foo.js

'http://domain/path/absolute.js' => http://domain/path/absolute.js
```

`3` method doc
```js
/**  
 * Singleton Component
 * @param $name Variable Name, register to Vue.prototype  
 * @param $uri  js uri  
 * @param $dom  dom, Singleton Component will append to this node ( default is document.body )  
 */  
Vcm.singleton($name, $uri, $dom);
```
```js
/**  
 * Global Component  
 * @param $tag html tag name  
 * @param $uri js uri  
 */  
Vcm.global($tag, $uri);
```
```js
/**  
 * Local Component  
 * @param $uri js uri  
 */  
Vcm.local($uri);
```
```js
/**  
 * Sub Local Component
 * @var   component js component instance  
 * @param $uri      js uri  
 */ sonly
component.local($uri);
```

`4` tow way to import sub local component

    page url         : http://vcm.demo/path/index.html  
    component js url : http://vcm.demo/path/js/vcm/local.js

    1. component instance method   component.local('sub.js') => http://vcm.demo/path/js/vcm/sub.js 
    2. Vcm.local                   Vcm.local('sub.js')       => http://vcm.demo/path/sub.js

`5` style

    only support css, scoped style not support yet
    each component's css be created and append to HEAD
    <style type="text/css" data-uri="component absolute uri for debug">  

`6` loading & loading order

    Single Js Component load asynchronously by ajax
    Global Component & Local Component use Vue async load mode
    Vcm make Singleton Component only one instance
    Vcm make sure Singleton Component loaded before Global Component & Local Component  

### More ###
