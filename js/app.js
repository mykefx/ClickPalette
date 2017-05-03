import * as $ from 'jquery';
import { remote } from 'electron';

const mainWin = remote.getCurrentWindow();

$( document ).ready(function() {

    $('body').click(function(){
        console.log('click');
        mainWin.close();
    });

});
