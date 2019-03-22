
(function(){

    'use strict';

    let component = Vcm.create();

    component.options = {
        template : '<div class="local" @click="on_click">Local : {{content}}<local-sub></local-sub></div>',
        data : function(){
            return {
                content : '',
            };
        },
        created : function(){
            console.log('local created');
        },
        mounted : function(){
            console.log('local mounted');
        },
        components : {
            'local-sub' : component.local('sub.js'),
        },
        methods : {
            on_click : function(){
                this.content = 'click local';
                this.$singleton.log('click local');
            },
        },
    };

    component.style = [
        '.local {background-color:#EEF;}'
    ];

    return component;

})();
