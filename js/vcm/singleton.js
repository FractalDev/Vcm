
(function(){

    'use strict';

    let component = Vcm.create();

    component.options = {
        template : '<div class="singleton" @click="on_click">Singleton : {{content}}</div>',
        data : function(){
            return {
                content : '',
            };
        },
        created : function(){
            console.log('singleton created');
        },
        mounted : function(){
            console.log('singleton mounted');
        },
        methods : {
            on_click : function(){
                this.$singleton.log('click singleton');
            },
        },
    };

    component.style = [
        '.singleton {background-color:#FEE;}'
    ];

    component.export = {
        log : function($content){
            this.content = $content;
            console.log.apply(null, Array.prototype.slice.apply(arguments));
        },
    };

    return component;

})();
