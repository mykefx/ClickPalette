/* ========================== SETUP ========================= =*/
//Electon modules
const {clipboard}   = require('electron');
const {shell}       = require('electron');
const dialog        = require('electron').remote.dialog
const remote        = require('electron').remote;

//Configstore
const Configstore   = require('configstore');
const pkg           = require(__dirname + '/init.json');
const conf          = new Configstore(pkg.name);

//Globals
var palettes;
var total_palettes = 0;
var version = parseFloat('1.1.0');

clog('loaded');

/* ========================== READY ========================= =*/
$(document).ready(function(){

    //Check version
    checkForUpdates(version);

    //conf.set({'palettes' : ''});
    if (conf.get('palettes')){
        palettes = conf.get('palettes');
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
