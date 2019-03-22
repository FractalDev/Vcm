
(function(){

    'use strict';

    let component = Vcm.create();

    component.options = {
        template : '<div class="sub" @click="on_click">Local Sub : {{content}}</div>',
        data : function(){
            return {
                content : '',
            };
        },
        created : function(){
            console.log('sub created');
        },
        mounted : function(){
            console.log('sub mounted');
        },
        methods : {
            on_click : function(){
                this.content = 'click local sub';
                this.$singleton.log('click local sub');
            },
        },
    };

    component.style = [
        '.sub {background-color:#FEF;}'
    ];

    return component;

})();
