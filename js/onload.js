/* ========================== SETUP ========================= =*/
//Load config and set vars
const Configstore = require('configstore');
const pkg = require(__dirname + '/init.json');
const conf = new Configstore(pkg.name);
const {clipboard} = require('electron');
var remote = require('electron').remote;

//Globals
var palettes;
var total_palettes = 0;
var version = '0.1.1';

console.log('loaded');

/* ========================== READY ========================= =*/
$(document).ready(function(){

    //Check version
    checkForUpdates(version);

    $('body').click(function(e){
        console.log('click', e);
    });

    //conf.set({'palettes' : ''});
    if (conf.get('palettes')){
        palettes = conf.get('palettes');
        console.log(palettes);
        for (var palette in palettes){
            if (palettes[palette].current_palette == true){
                set_palette(palette);
                break;
            }
        }
    } else {
        conf.set({'palettes' : {}});
        palettes = conf.get('palettes');
    }

    //Calculate and set palette sample sizes
    set_sample_size();

    if ($('.palette .palette_sample').length < 1){
        add_sample_input();
    }

    //JQueryUI to allow the samples to be dragged around
    $('.palette').sortable({
        axis: "x",
        containment: "parent",
        update: function(){
            save_current();
        }
    });

    //Copy colour to clipboard
    $('.palette').on('click', '.palette_sample', function(){
        var color_code = $(this).attr('data_color_val');
        clipboard.writeText(color_code);
        $(this).find('.copy_icon').show().fadeOut(500);
    });

    //Add color
    $('.add_sample').click(function(){
        add_sample_input()
    });

    //Rename current palette
    $('.nav_bar .palette_name').change(function(){
        save_current();
    });

    //Delete sample view
    $('.edit_samples').click(function() {
        if ($(this).hasClass('on')){
            $(this).removeClass('on').html('delete');
            $('.palette').removeClass('delete_view');
        } else {
            $(this).addClass('on').html('delete_forever');
            $('.palette').addClass('delete_view');
        }

        $('.palette').on('click', '.delete_sample', function(){
            $(this).parent().remove();
            set_sample_size();
            save_current();
        })
    });

    //Show / hide the menu
    $('.toggle_menu').click(function() {
        var win = remote.getCurrentWindow();
        if ($(this).hasClass('active')){
            win.setSize(400, 129);
            $(this).removeClass('active');
        } else {
            build_palette_list();
            win.setSize(400,370);
            $(this).addClass('active');
        }
    });

    //Minify
    $('.resize').click(function() {
        $('.toggle_menu').removeClass('active');
        var win = remote.getCurrentWindow();
        if ($(this).hasClass('active')){
            win.setSize(400, 129);
            $(this).html('remove_circle_outline').removeClass('active').parent().parent().parent().removeClass('active');
        } else {
            build_palette_list();
            win.setSize(300, 87);
            $(this).html('remove_circle').addClass('active').parent().parent().parent().addClass('active');
        }
    });

    //Create new palette
    $('.create_new_palette').click(function(){
        reset_current();
        add_sample_input();
    });

    //Click and load palette from menu
    $('.menu').on('click', '.palette_items', function(){
        if (!$(this).hasClass('create_new_palette')){
            for (var palette in palettes){
                if (palettes[palette].current_palette == true){
                    palettes[palette].current_palette = false;
                }
            }
            set_palette($(this).attr('data-paletteid'));
        }
    });

    //Delete the palette
    $('.menu').on('click', '.delete_palette', function(e){
        e.preventDefault();
        e.stopPropagation();

        var del_palette_id = $(this).parent().attr('data-paletteid');
        delete palettes[del_palette_id];

        if ($('.palette_container .palette').attr('data-paletteid') == del_palette_id){
            reset_current();
        }

        save_palettes();
        build_palette_list();
    });

});

//Save palettes to configstore
function save_palettes(){
    conf.set({'palettes' : palettes});
}

//Save current palette
function save_current(){
    if ($('.palette .palette_sample').length >= 1){
        if ($('.palette').attr('data-paletteid') == ''){
            var paletteid = new Date().getTime();
            $('.palette').attr('data-paletteid', paletteid);
        } else {
            var paletteid = $('.palette').attr('data-paletteid');
        }

        var new_palette = {
            'palette_id' : paletteid,
            'palette_name' : $('.nav_bar .palette_name').val(),
            'current_palette' : true
        };

        var sample_array = new Array();
        $('.palette .palette_sample').each(function(){
            sample_array.push($(this).attr('data_color_val'));
        });

        new_palette.color_samples = sample_array;
        palettes[paletteid] = new_palette;

        console.log(palettes);
        conf.set({'palettes' : palettes});

        if ($('.toggle_menu').hasClass('active')){
            build_palette_list();
        }
    }
}

//Calculate and set palette sample sizes
function set_sample_size(){
    var palette_samples = 0;
    $('.palette .palette_sample').each(function(){
        palette_samples++;
    });
    var palette_sample_width = 100 / palette_samples;
    $('.palette .palette_sample').each(function(){
        $(this).css('width', palette_sample_width + '%');
    });
}

//Set current palette
function set_palette(palette){
    $('.palette').attr('data-paletteid', palettes[palette].palette_id);
    $('.nav_bar .palette_name').val(palettes[palette].palette_name);
    palettes[palette].current_palette = true;
    $('.palette .palette_sample').remove();
    for (var sample in palettes[palette].color_samples){
        $('.palette').append('<li class="palette_sample" data_color_val="'+ palettes[palette].color_samples[sample] +'" style="background-color: '+ palettes[palette].color_samples[sample] +'"><i class="material-icons delete_sample">close</i><i class="material-icons copy_icon">content_copy</i></li>');
    }
    save_palettes();
    set_sample_size();
}

//Set palette list (menu)
function build_palette_list(){
    $('.menu .palette_items').not('.create_new_palette').remove();
    total_palettes = 0;
    for (var palette in palettes){
        total_palettes++;
        var preview_sample_colors = '';
        for (var sample in palettes[palette].color_samples){
            preview_sample_colors += '<li style="background-color: '+ palettes[palette].color_samples[sample] +';"></li>';
        }
        $('.menu').prepend('<li class="palette_items" data-paletteid="'+ palettes[palette].palette_id +'"><h3 class="palette_name">'+ palettes[palette].palette_name +'</h3><ul class="preview_samples">'+ preview_sample_colors +'</ul><i class="material-icons delete_palette">close</i></li>');
    }
}

//Reset current palette
function reset_current(){
    $('.palette_container .palette .palette_sample').remove();
    $('.palette_container .palette').attr('data-paletteid', '').html('');
    $('.nav_bar .palette_name').val('Untitled');
    for (var palette in palettes){
        if (palettes[palette].current_palette == true){
            palettes[palette].current_palette = false;
        }
    }
}

//Add sample UI
function add_sample_input(){
    $('.new_sample input').removeClass('active');
    if ($('.add_sample').hasClass('on')){
        $('.add_sample').removeClass('on').html('add');
        $('.new_sample').fadeOut('150');
    } else {
        $('.add_sample').addClass('on').html('close');
        $('.new_sample').fadeIn('150');
        $('.new_sample input').focus();
        $('.new_sample input').keyup(function(e) {
            if (e.keyCode == 13 && !$(this).hasClass('active')){
                $(this).addClass('active');
                var new_color = $(this).val();

                if (new_color.substring(0,1) != '#' && new_color.substring(0,3) != 'rgb'){
                    new_color = '#' + new_color;
                }

                $(this).val('');
                $('.palette').append('<li class="palette_sample" data_color_val="'+ new_color +'" style="background-color: '+ new_color +'"><i class="material-icons delete_sample">close</i><i class="material-icons copy_icon">content_copy</i></li>');
                set_sample_size();
                $('.add_sample').removeClass('on').html('add');
                $('.new_sample').fadeOut('150', function(){
                    $(this).val('').removeClass('active');
                });
                save_current();
            } else if (e.keyCode == 27 && !$(this).hasClass('active')){
                $('.add_sample').removeClass('on').html('add');
                $('.new_sample').fadeOut('150');
            }
        });
    }
}

//Check for updates
function checkForUpdates(version){
	$.ajax({
		url: 'http://clickpalette.com/api?current_version=true',
		method: 'GET',
		success: function(data){
			if (data > version) {
				dialog.showMessageBox({'title':'An update is avalible!', 'message':'Version '+data+' is avalible to download.'});
			} else {
				dialog.showMessageBox({'title':'No Updates', 'message':'You\'re already running the latest version!'});
			}
		}
	});
}
