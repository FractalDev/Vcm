
(function(){

    'use strict';

    if(this.Vcm)
        return;

    if(!this.Vue)
        return;

    let $ = {
        Vue : this.Vue
    };

    (function(/* $.uri */){

        $.uri = {};

        let domUri = document.createElement('A');
        function getAbsoluteUri($uri, $trimEndSlash)
        {
            domUri.href = $uri;

            $uri = domUri.href;

            if($trimEndSlash !== true)
                return $uri;

            let match = /^(.*?)(\/+)?$/.exec($uri);

            return match[1];
        }

        $.uri.root = getAbsoluteUri('/', true);
        $.uri.base = getAbsoluteUri('.', true);
        $.uri.load = '';

    })();

    (function(/* $.Component */){

        $.Component = function($uriFull){
            let match = /^(.*)\/(.*?)$/.exec($uriFull);

            this.uriFull = $uriFull;
            this.uriBase = match[1];
        };

        $.Component.prototype.uriFull = null;
        $.Component.prototype.uriBase = null;
        $.Component.prototype.options = null;
        $.Component.prototype.style   = null;
        $.Component.prototype.export  = null;

        $.Component.prototype.local = function($uri){
            let uriBase = this.uriBase;
            return function($resolve, $reject){
                $.vcm.promise_load($uri, uriBase).then(function($component){
                    $resolve($component.options);
                }).catch(function($error){
                    $reject($error);
                });
            };
        };

    })();

    (function(/* $.Cache */){

        $.Cache = Object.create(null);

        $.Cache.SINGLETON = 'singleton';
        $.Cache.GLOBAL    = 'global';
        $.Cache.URI       = 'uri';

        let mapCache = Object.create(null);
        mapCache[$.Cache.SINGLETON] = Object.create(null);
        mapCache[$.Cache.GLOBAL]    = Object.create(null);
        mapCache[$.Cache.URI]       = Object.create(null);

        $.Cache.exist = function($type, $name){
            return (mapCache[$type][$name] instanceof $.Component);
        };

        $.Cache.get = function($type, $name){
            if($.Cache.exist($type, $name) === false)
                return null;

            return mapCache[$type][$name];
        };

        $.Cache.cache = function($type, $name, $component){
            if($.Cache.exist($type, $name) === true)
                return false;

            mapCache[$type][$name] = $component;

            return true;
        };
    })();

    (function(/* $.vcm */){

        let mapSingleton = {};

        $.vcm = Object.create(null);

        $.vcm.uri_resolve = function($uri, $base){
            let match = /^(\w+:)?(\/*)(.*)$/.exec($uri);
            if(typeof(match[1]) === 'string' && match[1].length > 0)
            {
                return $uri;
            }

            switch(match[2].length)
            {
                case 0:
                    return $base + '/' + match[3];
                case 1:
                    return $.uri.base + '/' + match[3];
            }

            return $.uri.root + '/' + match[3];
        };

        $.vcm.create_style = function($component){
            let content = $component.style;
            if(Array.isArray(content) === true)
                content = content.join('\n');
            else if(typeof(content) !== 'string')
                content = content.toString();

            let domStyle = document.createElement('STYLE');
            domStyle.type = 'text/css';
            domStyle.setAttribute('data-uri', $component.uriFull);
            domStyle.appendChild(document.createTextNode(content));
            document.querySelector('HEAD').appendChild(domStyle);
        };

        $.vcm.create = function(){
            return new $.Component($.uri.load);
        };

        $.vcm.promise_load = function($uri, $uriBase){
            return new Promise(function($resolve, $reject){
                let uriFull = $.vcm.uri_resolve($uri, $uriBase);
                let component = $.Cache.get($.Cache.URI, uriFull);
                if(component === true)
                {
                    $resolve(component);
                    return;
                }

                axios({
                    method : 'GET',
                    url : uriFull,
                }).then(function($axios){
                    try
                    {
                        let component = $.Cache.get($.Cache.URI, uriFull);
                        if(component !== null)
                        {
                            $resolve(component);
                            return;
                        }

                        $.uri.load = uriFull;
                        component = eval($axios.data);
                        if(component instanceof $.Component === true)
                        {
                            $.Cache.cache($.Cache.URI, uriFull, component);

                            $.vcm.create_style(component);

                            $resolve(component);
                            return;
                        }

                        $reject('invalid component');
                    }
                    catch($ex)
                    {
                        $reject($ex.message);
                    }
                }).catch(function($axios){
                    $reject($axios.message);
                });
            });
        };

        $.vcm.promise_singleton = function(){

            function check_singleton($resolve, $reject)
            {
                let key;
                for(key in mapSingleton)
                {
                    if(mapSingleton.hasOwnProperty(key) === false)
                        continue;

                    if(mapSingleton[key] === false)
                    {
                        setTimeout(function(){
                            check_singleton($resolve, $reject);
                        }, 50);
                        return;
                    }
                }

                $resolve(true);
            }

            return new Promise(check_singleton);
        };

        $.vcm.singleton = function($name, $uri, $dom){
            if($.Cache.exist($.Cache.SINGLETON, $name) === true)
                return;

            mapSingleton[$name] = false;
            $.vcm.promise_load($uri, $.uri.base).then(function($component){
                if($.Cache.cache($.Cache.SINGLETON, $name, $component) === false)
                    return;

                let ctor     = $.Vue.extend($component.options);
                let instance = new ctor().$mount();

                if($dom instanceof Node === false)
                    $dom = document.body;

                $dom.appendChild(instance.$el);

                let map = Object.create(null);
                if(typeof($component.export) === 'object' && $component.export !== null)
                {
                    let key, method;
                    for(key in $component.export)
                    {
                        if($component.export.hasOwnProperty(key) === false)
                            continue;

                        method = $component.export[key];
                        if(typeof(method) !== 'function')
                            continue;

                        map[key] = (function($this, $method){
                            return function(){
                                $method.apply($this, Array.prototype.slice.call(arguments));
                            };
                        })(instance, method);
                    }
                }
                $.Vue.prototype[$name] = map;

                mapSingleton[$name] = true;

            }).catch(function($error){
                console.log($error);
            });
        };

        $.vcm.global = function($tag, $uri){
            $.Vue.component($tag, function($resolve, $reject){
                Promise.all([
                    $.vcm.promise_singleton(),
                    $.vcm.promise_load($uri, $.uri.base)
                ]).then(function($arr){
                    let component = $arr[1];
                    $resolve(component.options);
                }).catch(function($error){
                    $reject($error);
                });
            });
        };

        $.vcm.local = function($uri){
            return function($resolve, $reject){
                Promise.all([
                    $.vcm.promise_singleton(),
                    $.vcm.promise_load($uri, $.uri.base)
                ]).then(function($arr){
                    let component = $arr[1];
                    $resolve(component.options);
                }).catch(function($error){
                    $reject($error);
                });
            };
        };

    })();

    (function(/* Vcm */){
        /**
         * @global {Object} Vcm
         */
        this.Vcm = Object.create(null);
        /**
         * @name Vcm.create
         * @method
         */
        Object.defineProperty(this.Vcm, 'create', {
            enumerable : true,
            configurable : false,
            value : $.vcm.create,
        });
        /**
         * @name Vcm.singleton
         * @method
         */
        Object.defineProperty(this.Vcm, 'singleton', {
            enumerable : true,
            configurable : false,
            value : $.vcm.singleton,
        });
        /**
         * @name Vcm.global
         * @method
         */
        Object.defineProperty(this.Vcm, 'global', {
            enumerable : true,
            configurable : false,
            value : $.vcm.global,
        });
        /**
         * @name Vcm.local
         * @method
         */
        Object.defineProperty(this.Vcm, 'local', {
            enumerable : true,
            configurable : false,
            value : $.vcm.local,
        });
    }).call(this);

}).call((0, eval)('this'));
