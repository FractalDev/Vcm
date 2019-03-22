
(function(){

    'use strict';

    let component = Vcm.create();

    component.options = {
        template : '<div class="global" @click="on_click">Global : {{content}}</div>',
        data : function(){
            return {
                content : '',
            };
        },
        created : function(){
            console.log('global created');
        },
        mounted : function(){
            console.log('global mounted');
        },
        methods : {
            on_click : function(){
                this.content = 'click global';
                this.$singleton.log('click global');
            },
        },
    };

    component.style = [
        '.global {background-color:#EFE;}'
    ];

    return component;

})();
