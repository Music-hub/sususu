$('.menu .item').tab();

//$('.ui.toggle.button').state();

$('.accordion').accordion({
    //exclusive: false,
    //duration: 2000
});


$("button[data-role='duration']").on('click', function(){
    
    $("button[data-role='duration']").removeClass('active');
    $(this).addClass('active'); 
});



$('#add_chord').on('click', function(){
    
    $('.ui.modal').modal('show');
                 
});

/*$('.ui.modal').modal({

    onVisible: function(){
      window.alert('Edit your chord!');
    }

});*/