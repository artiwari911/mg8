 /**
 * Onestepcheckout Extension
 *
 *
 * PHP versions 4 and 5
 *
 * LICENSE: This source file is subject to version 3.0 of the PHP license
 * that is available through the world-wide-web at the following URI:
 * http://www.store.vt.com/license.txt.  If you did not receive a copy of
 * the PHP License and are unable to obtain it through the web, please
 * send a note to admin@vt.com so we can mail you a copy immediately.
 *
 * @category   Magento Extensions
 * @package    Vt_Onestepcheckout
 * @author     Vt <sales@vt.com>
 * @copyright  2007-2011 Vt
 * @license    http://www.store.vt.com/license.txt
 * @version    1.0.1
 * @link       http://www.store.vt.com
 */

/**
* Lightbox
*
* This libary is used to create a lightbox in a web application.  This library
* requires the Prototype 1.6 library and Script.aculo.us core, effects, and dragdrop
* libraries.  To use, add a div containing the content to be displayed anywhere on 
* the page.  To create the lightbox, add the following code:
*
*/

var Lightbox = Class.create({
	open : function () {
		this._centerWindow(this.container);
		this._fade('open', this.container);
	},
	
	close : function () {
		this._fade('close', this.container);
	},
	
	_fade : function fadeBg(userAction,whichDiv){
		if(userAction=='close'){
			new Effect.Opacity('oscheckout-tranparent-bg',
					   {duration:.5,
					    from:0.5,
					    to:0,
					    afterFinish:this._makeInvisible,
					    afterUpdate:this._hideLayer(whichDiv)});
		}else{
			new Effect.Opacity('oscheckout-tranparent-bg',
					   {duration:.5,
					    from:0,
					    to:0.5,
					    beforeUpdate:this._makeVisible,
					    afterFinish:this._showLayer(whichDiv)});
		}
	},
	
	_makeVisible : function makeVisible(){
		$("oscheckout-tranparent-bg").style.visibility="visible";
	},

	_makeInvisible : function makeInvisible(){
		$("oscheckout-tranparent-bg").style.visibility="hidden";
	},

	_showLayer : function showLayer(userAction){
		$(userAction).style.display="block";
	},
	
	_hideLayer : function hideLayer(userAction){
		$(userAction).style.display="none";
	},
	
	_centerWindow : function centerWindow(element) {
		var windowHeight = parseFloat($(element).getHeight())/2; 
		var windowWidth = parseFloat($(element).getWidth())/2;

		if(typeof window.innerHeight != 'undefined') {
			$(element).style.top = Math.round(document.body.offsetTop + ((window.innerHeight - $(element).getHeight()))/2)+'px';
			$(element).style.left = Math.round(document.body.offsetLeft + ((window.innerWidth - $(element).getWidth()))/2)+'px';
		} else {
			$(element).style.top = Math.round(document.body.offsetTop + ((document.documentElement.offsetHeight - $(element).getHeight()))/2)+'px';
			$(element).style.left = Math.round(document.body.offsetLeft + ((document.documentElement.offsetWidth - $(element).getWidth()))/2)+'px';
		}
	},
	
	initialize : function(containerDiv) {
		this.container = containerDiv;
		if($('oscheckout-tranparent-bg') == null) {
			var screen = new Element('div', {'id': 'oscheckout-tranparent-bg'});
			document.body.appendChild(screen);
		}
		
                 
		this._hideLayer(this.container);
	}
});

