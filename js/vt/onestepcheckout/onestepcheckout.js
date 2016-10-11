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

var Checkout = Class.create();
Checkout.prototype = {
	initialize: function(urls){
		this.reviewUrl = urls.review;
		this.saveMethodUrl = urls.saveMethod;
		this.failureUrl = urls.failure;
		this.billingForm = false;
		this.shippingForm= false;
		this.syncBillingShipping = false;
		this.method = '';
		this.payment = '';
		this.loadWaiting = false;
		this.steps = ['login', 'billing', 'shipping', 'shipping_method', 'payment', 'review'];

		labels = document.getElementsByTagName("button"); 
		for( var i = 0; i < labels.length; i++ ) 
		{
			if( labels[i].className == 'button btn-proceed-checkout btn-checkout' ) 
			labels[i].onclick = showCheckoutInCart;
			labels[i].observe('click', function() {
				return function(){
					showCheckoutInCart();
				}
			});
		} 
		
		function showCheckoutInCart() {
			$('onestepcheckout-content').scrollTo();
		}

	},

	processFailure: function(){
		location.href = this.failureUrl;
	},
	loadingProcess: function ()
	{
		$("checkout-review-load").update('<div class="loading-ajax">&nbsp;</div>')
	}, 

	loadReview: function(){      
	 var request = new Ajax.Request(
				this.reviewUrl,
			{
				method:'post',
				parameters: Form.serialize('co-form'),
				onLoading:this.loadingProcess.bind(this),
				onComplete: this.onComplete,
				onSuccess: function(transport)    {
					if(transport.status == 200)    {
					 $("checkout-review-load").update(transport.responseText)
					}
				},
			onFailure: checkout.processFailure.bind(checkout)
		}
		);

   }

}

var Billing = Class.create();
Billing.prototype = {
	initialize: function(form, addressUrl, saveUrl){
		this.form = form;
		if ($(this.form)) {
			$(this.form).observe('submit', function(event){
				this.save();
				Event.stop(event);
			}.bind(this));
		}
		this.addressUrl = addressUrl;
		this.saveUrl = saveUrl;
		this.onAddressLoad = this.fillForm.bindAsEventListener(this);

	},
	setAddress: function(addressId){
		if (addressId) {
			request = new Ajax.Request(
				this.addressUrl+addressId,
				{
					method:'get',
					onSuccess: this.onAddressLoad,
					onFailure: checkout.processFailure.bind(checkout)
					}
				);
		}
		else {
			this.fillForm(false);
		}
	},
	newAddress: function(isNew){
		if (isNew) {
			this.resetSelectedAddress();
			Element.show('billing-new-address-form');
		} else {
			Element.hide('billing-new-address-form');
		}
	},
	resetSelectedAddress: function(){
		var selectElement = $('billing-address-select')
		if (selectElement) {
			selectElement.value='';
		}
	},

	fillForm: function(transport){
		var elementValues = {};
		if (transport && transport.responseText){
			try{
				elementValues = eval('(' + transport.responseText + ')');
			}
			catch (e) {
				elementValues = {};
			}
		}
		else{
			this.resetSelectedAddress();
		}
		arrElements = Form.getElements(this.form);
		for (var elemIndex in arrElements) {
			if (arrElements[elemIndex].id) {
				var fieldName = arrElements[elemIndex].id.replace(/^billing:/, '');
				arrElements[elemIndex].value = elementValues[fieldName] ? elementValues[fieldName] : '';
				if (fieldName == 'country_id' && billingForm){
					billingForm.elementChildLoad(arrElements[elemIndex]);
				}
			}
		}
	},

	setUseForShipping: function(flag) {
		$('shipping:same_as_billing').checked = flag;
	}
}

var Shipping = Class.create();
Shipping.prototype = {
	initialize: function(form, addressUrl,methodsUrl,reloadUrl){
		this.form = form;
		this.addressUrl = addressUrl;
		this.reloadUrl = reloadUrl;
		this.methodsUrl = methodsUrl;
		this.onAddressLoad = this.fillForm.bindAsEventListener(this);

	},

	setAddress: function(addressId){
		if (addressId) {
			request = new Ajax.Request(
				this.addressUrl+addressId,
				{
					method:'get',
					onSuccess: this.onAddressLoad,
					onFailure: checkout.processFailure.bind(checkout)
					}
				);
		}
		else {
			this.fillForm(false);
		}
	},
	newAddress: function(isNew){
		if (isNew) {
			this.resetSelectedAddress();
			Element.show('shipping-new-address-form');
		} else {
			Element.hide('shipping-new-address-form');
		}

	},
	resetSelectedAddress: function(){
		var selectElement = $('shipping-address-select')
		if (selectElement) {
			selectElement.value='';
		}
	},

	fillForm: function(transport){
		var elementValues = {};
		if (transport && transport.responseText){
			try{
				elementValues = eval('(' + transport.responseText + ')');
			}
			catch (e) {
				elementValues = {};
			}
		}
		else{
			this.resetSelectedAddress();
		}
		arrElements = Form.getElements(this.form);
		for (var elemIndex in arrElements) {
			if (arrElements[elemIndex].id) {
				var fieldName = arrElements[elemIndex].id.replace(/^shipping:/, '');
				arrElements[elemIndex].value = elementValues[fieldName] ? elementValues[fieldName] : '';
				if (fieldName == 'country_id' && shippingForm){
					shippingForm.elementChildLoad(arrElements[elemIndex]);
				}
			}
		}
	},

	setSameAsBilling: function(flag) {
		var value;
		var address;
		$('shipping:same_as_billing').checked = flag;
		value = $('shipping:address_id').value
		address = $('shipping:has_addresss').value
		if (flag)
		{
			if((value)&&(address!=0))
			{
				Element.hide('shipping-new-address-form');
				Element.hide('shipping-old-address-form');
			}
			else if(value)
			{
				Element.hide('shipping-new-address-form');
			}
			else
			{
				Element.hide('shipping-new-address-form');
			}
		}
		else
		{
			if((value)&&(address!=0))
			{
				Element.show('shipping-old-address-form');
			}
			else if(value)
			{

				Element.show('shipping-new-address-form');
			}
			else
			{
				Element.show('shipping-new-address-form');
			}
		}
	},
	syncWithBilling: function () {

	},
	loadingProcess: function () {
		$("checkout-review-load").update('<div class="loading-ajax">&nbsp;</div>')
	},
	
	loadReview: function(){
		var updater = new Ajax.Updater('checkout-review-load', this.reloadUrl, {
			method: 'post',
			onLoading:this.loadingProcess.bind(this),
			parameters:Form.serialize(this.form)
			});
	},
	
	setRegionValue: function(){
		$('shipping:region').value = $('billing:region').value;
	}

}

var ShippingMethod = Class.create();
ShippingMethod.prototype = {
	initialize: function(form){
		this.form = form;
	}
}

var Payment = Class.create();
Payment.prototype = {
	initialize: function(reviewUrl,paymentUrl){
		this.reviewUrl = reviewUrl;
		this.paymentUrl = paymentUrl;
	},
	processFailure: function(){
	},	  
	loadingProcess: function () {
		$("checkout-review-load").update('<div class="loading-ajax">&nbsp;</div>')
	},	
	processSucess: function(){
		Element.hide('payment-please-wait');
	},	
	loadReview: function(){	  
		var updater = new Ajax.Updater('checkout-review-load', this.reviewUrl, {
			method: 'get',
			onLoading:this.loadingProcess.bind(this),
			onFailure: this.processFailure.bind(this),
			onComplete: this.processSucess.bind(this)
			});
	},
	loadPayment: function(){		
		var updater = new Ajax.Updater('ajax-payment-methods', this.paymentUrl, {
			method: 'get',
			onLoading:this.loadingProcess.bind(this),
			onFailure: this.processFailure.bind(this),
			onSuccess: function()    { 
				
			},
			onComplete: function() {
				payment.switchMethod(paymentMethod);
			}			
		});
	},

	switchMethod: function(method){
		if (this.currentMethod && $('payment_form_'+this.currentMethod)) {
			this.toggleForm(this.currentMethod, true);
		}
		if ($('payment_form_'+method)){
			this.toggleForm(method, false);
			$('payment_form_'+method).fire('payment-method:switched', {
				method_code : method
			});
		} else {

		}
		this.currentMethod = method;
		this.loadReview();		
		
	},

	toggleForm: function(method, mode) {
		var block = 'payment_form_' + method;
		[block + '_before', block, block + '_after'].each(function(el) {
			element = $(el);
			if (element) {
				element.style.display = (mode) ? 'none' : '';
				element.select('input', 'select', 'textarea').each(function(field) {
					field.disabled = mode;
				});
			}
		});
	}
}
var Review = Class.create();
Review.prototype = {
	initialize: function(form,saveUrl,successUrl,agreementsForm){
		this.form = form;
		this.saveUrl = saveUrl;
		this.successUrl = successUrl;
		this.agreementsForm = agreementsForm;
		this.onSave = this.nextStep.bindAsEventListener(this);
	},
	loadingProcess: function () {
		Element.show('processing-msg');
		Element.hide('place-order');
	},

	save: function(){
		var validator = new Validation(this.form);
		if (validator.validate()) {
			var request = new Ajax.Request(
				this.saveUrl,
				{
					method:'post',
					parameters: Form.serialize(this.form),
					onLoading:this.loadingProcess.bind(this),
					onSuccess: function(transport)    {
						if(transport.status == 200)    {
							var data = transport.responseText.evalJSON();
							if(!data.success)
							{
								alert(data.error_messages);
								Element.hide('processing-msg');
								Element.show('place-order');

							}
							if (data.redirect) {
								location.href = data.redirect;
								return;
							}
							if(data.success){
								this.isSuccess = true;
								window.location = data.success;
							}
						}
					},
				onFailure: checkout.processFailure.bind(checkout)
			}
			);
		}
	},

	nextStep: function(transport){
		if (transport && transport.responseText) {
			try{
				response = eval('(' + transport.responseText + ')');
			}
			catch (e) {
				response = {};
			}
			if (response.redirect) {
				location.href = response.redirect;
				return;
			}
			if (response.success) {
				this.isSuccess = true;
				window.location=this.successUrl;
			}
			else{
				var msg = response.error_messages;
				if (typeof(msg)=='object') {
					msg = msg.join("\n");
				}
				if (msg) {
					alert(msg);
				}
			}

			if (response.update_section) {
				$('checkout-'+response.update_section.name+'-load').update(response.update_section.html);
			}

			if (response.goto_section) {
				checkout.gotoSection(response.goto_section);
				checkout.reloadProgressBlock();
			}
		}
	},

	isSuccess: false
}
