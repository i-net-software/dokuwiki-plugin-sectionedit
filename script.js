/**
 * DokuWiki Plugin TagSections (JavaScript Component) 
 *
 * @license GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author gamma
 */

(function(jQuery) {
    
    // Use the internal reference of jQuery.
    // this is due to jQuery reloading in initJQuery() so that we keep the correct reference    
    var currentNamespace = JSINFO['namespace'];
    var $currentButton = null;
    var init = function() {
        
        jQuery('.editbutton_section form.btn_secedit').submit(function(event){
            
            $currentButton = jQuery(this);
            console.log($currentButton);
            request({'do':'edit'}, showEditDialog);
            return false;
        });
    };
    
    var showEditDialog = function(data) {
        var $dialog = getDialog('open').html(data);
        initJQuery();
        $dialog.find('.editButtons').detach();
    };
    
    var request = function(data, success) {
        data['id']     = $currentButton.find('input[name=id]').val();
        data['rev']    = $currentButton.find('input[name=rev]').val();
        data['call']   = 'sectionedit';
        data['target'] = $currentButton.find('input[name=target]').val();
        data['range']  = $currentButton.find('input[name=range]').val();
        return jQuery.post(DOKU_BASE + 'lib/exe/ajax.php', data, success);
    };
    
    var saveSection = function() {

        var $form = jQuery(this);
        var objects = {
            'do': 'save'
        };
        
        $form.find('input[name][value], textarea[name]').each(function(){
            
            var $element = jQuery(this);
            if ( this.tagName.toLowerCase() == 'input' && $element.is(':checkbox') && !$element.is(':checked') ) {
                return;
            }
            
            objects[this.name] = $element.val();
        });

        request(objects, function(data){

            var $toRemove = $currentButton.parent().parent().children(),
            $tmpWrap = jQuery('<div style="display:none"></div>').html(data);  // temporary wrapper
            
            // insert the section highlight wrapper before the last element added to $tmpStore
            $toRemove.filter(':last').before($tmpWrap);
            // and remove the elements
            $toRemove.detach();
            
            // Now remove the content again
            $tmpWrap.before($tmpWrap.children().detach());
            // ...and remove the section highlight wrapper
            $tmpWrap.detach();

            getDialog('close').dialog('destroy').detach();
            
            // This is being set by the edit.js - needs reset before unloading
            window.onbeforeunload = '';
            textChanged = false;
            dw_locktimer.clear();

            initJQuery();
        });
    };
    
    var initJQuery = function() {
        
        jQuery('script[src]').each(function(){
            var $xchange = jQuery(this);
            var $new = jQuery('<script/>').attr('type', $xchange.attr('type')).attr('defer', 'true');
            $xchange.before($new).detach();
            $new.attr('src', $xchange.attr('src'));
        });
    };
    
    var getDialog = function(action) {
        
        if(!jQuery('#sectionedit__dilaog').length){
            jQuery('body').append('<div id="sectionedit__dilaog" position="absolute" border=1 height="800px" class="dokuwiki page"><div id="sectionedit__dialog_div"></div></div>');
            jQuery( "#sectionedit__dilaog" ).dialog({title:LANG.plugins.sectionedit['edit'],
                height: Math.min(700,jQuery(window).height()-50),
                width: Math.min(700,jQuery(window).width()-50),
                autoOpen:true,
                closeOnEscape:false,
                modal:true,
                buttons:[
                    {text:LANG.plugins.sectionedit['closeDialog'],click: function() { getDialog('close') }},
                    {text:LANG.plugins.sectionedit['save'],click: saveSection},
                    ],
                });
        }
        
        if ( action ) {
            return jQuery('#sectionedit__dilaog').dialog(action);
        }
        
        return jQuery('#sectionedit__dilaog');
    };    
   
    jQuery(document).ready(init);
})(jQuery);
