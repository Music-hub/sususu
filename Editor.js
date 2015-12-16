$('.accordion').accordion({
    //exclusive: false,
    //duration: 2000
});


$("button[data-role='duration']").on('click', function(){
    
    $("button[data-role='duration']").removeClass('active');
    $(this).addClass('active'); 
});



$('#add_chord,#phone_add_chord').on('click', function(){
    
    $('.ui.modal').modal('show');
                 
});

/*$('.ui.modal').modal({

    onVisible: function(){
      window.alert('Edit your chord!');
    }

});*/

$('#root .item').on('click',function(){

    
    $('#root .item').removeClass('active');
    $(this).addClass('active');
    
    setvalue();

});

$('#sharp_drop .item').on('click',function(){

    
    $('#sharp_drop .item').removeClass('active');
    $(this).addClass('active');
    
    setvalue();
});

$('#guide .item').on('click',function(){
    
    
    $('#guide .item').removeClass('active');
    $(this).addClass('active'); 
    
    setvalue();
});

$('#tension .item').on('click',function(){

    $('#tension .item').removeClass('active');
    $(this).addClass('active'); 
    
    setvalue();
});

function setvalue(){

    var root,sharp_drop,guide,temp,temp1,tension;
    root = $('#root .active.item').text().trim();
    temp1 = $('#sharp_drop .active.item').text().trim();
    guide =$('#guide .active.item').text().trim();
    temp = $('#tension .active.item').text().trim();
    
    if(temp == "none")
        tension = "";
    else
        tension = temp;
    
    if(temp1 == "none")
        sharp_drop = "";
    else
        sharp_drop = temp1;
    
    $('#chord_show').text(root+sharp_drop+guide+tension);

    return root+sharp_drop+guide+tension;
}

$('#modal_button_add').on('click',function(){

    //var but_num = $("button[data-role='chord']").size(); //chord button 數量
    
    result = setvalue();
    
    $('#chord_pool').prepend('<div class="chord_container">'+
                             '<button class="circular ui icon button" id="remove">'+
                             '<i class="small remove circle icon"></i>'+
                             '</button>'+
                             '<button class="ui button" data-role="chord">'+
                             result+
                             '</button>'+
                             '</div>');
    
    $('#phone_chord_pool').prepend('<div class="chord_container">'+
                             '<button class="circular ui icon button" id="remove">'+
                             '<i class="small remove circle icon"></i>'+
                             '</button>'+
                             '<button class="ui button" data-role="chord">'+
                             result+
                             '</button>'+
                             '</div>'); 
});

$('#modal_button_cancel').on('click',function(){

    $('.ui.modal').modal('hide');

});


$('#chord_pool').on('click','.chord_container #remove',function(){
    
    //$(this).parent().remove(); // not this
    var chord = $(this).next().text(); //the element after clicked element
    
    $("button:contains('"+chord+"')").parent().remove();
});

$('#phone_chord_pool').on('click','.chord_container #remove',function(){
    
    //$(this).parent().remove();
    var chord = $(this).next().text();
    $("button:contains('"+chord+"')").parent().remove();
});

$('.tabular.menu .item').tab();

//$('.ui.sidebar').sidebar('toggle');
