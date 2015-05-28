<?php
/**
 * DokuWiki Plugin ajax (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  i-net software <tools@inetsoftware.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

class action_plugin_sectionedit extends DokuWiki_Action_Plugin {

    private $inited = null;

    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     * @return void
     */
    public function register(Doku_Event_Handler $controller) {
       $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handle_ajax_call');
       $controller->register_hook('ACTION_ACT_PREPROCESS', 'AFTER', $this, 'handle_suppress_default_after');
    }

    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event  event object by reference
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     * @return void
     */
    public function handle_ajax_call(Doku_Event &$event, $param) {
    
        global $INPUT, $ID, $INFO, $ACT, $RANGE, $REV;
        
        if ( $event->data != 'sectionedit' ) return false;
        $event->preventDefault();

        $ACT = act_validate($INPUT->str('do'));
        if ( !in_array($ACT, array('show', 'edit', 'save')) ) return;
        $this->inited = true;

        // This seems super evil.
        // if we catch all our variables, include the doku.php to do its normal magic.
        // EXCEPT: we will catch the ACT_PREPROCESS in AFTER, outpout the current content and be done with it.
        // This will either: show the current page ('show' or 'save') or the edit form.
        return include_once(DOKU_INC . '/doku.php');
    }
    
    function handle_suppress_default_after(Doku_Event &$event, $param) {
        
        // If this plugin already ran into the sectionedit action, we will be inited and we can just output the template
        // hint: super evil. handle with care. experimental.
        if ( !$this->inited ) return;
        tpl_content();
        exit;
    }
}

// vim:ts=4:sw=4:et:
