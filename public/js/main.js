var pluginName = "dropify";

/**
 * Dropify plugin
 *
 * @param {Object} element
 * @param {Array} options
 */
function Dropify(element, options) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        return;
    }

    var defaults = {
        defaultFile: '',
        maxFileSize: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        showRemove: true,
        showLoader: true,
        showErrors: true,
        errorTimeout: 3000,
        errorsPosition: 'overlay',
        imgFileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
        maxFileSizePreview: "5M",
        allowedFormats: ['portrait', 'square', 'landscape'],
        allowedFileExtensions: ['*'],
        messages: {
            'default': 'Drag and drop a file here or click',
            'replace': 'Drag and drop or click to replace',
            'remove':  'Remove',
            'error':   'Ooops, something wrong happended.'
        },
        error: {
            'fileSize': 'The file size is too big ({{ value }} max).',
            'minWidth': 'The image width is too small ({{ value }}}px min).',
            'maxWidth': 'The image width is too big ({{ value }}}px max).',
            'minHeight': 'The image height is too small ({{ value }}}px min).',
            'maxHeight': 'The image height is too big ({{ value }}px max).',
            'imageFormat': 'The image format is not allowed ({{ value }} only).',
            'fileExtension': 'The file is not allowed ({{ value }} only).'
        },
        tpl: {
            wrap:            '<div class="dropify-wrapper"></div>',
            loader:          '<div class="dropify-loader"></div>',
            message:         '<div class="dropify-message"><span class="file-icon" /> <p>{{ default }}</p></div>',
            preview:         '<div class="dropify-preview"><span class="dropify-render"></span><div class="dropify-infos"><div class="dropify-infos-inner"><p class="dropify-infos-message">{{ replace }}</p></div></div></div>',
            filename:        '<p class="dropify-filename"><span class="dropify-filename-inner"></span></p>',
            clearButton:     '<button type="button" class="dropify-clear">{{ remove }}</button>',
            errorLine:       '<p class="dropify-error">{{ error }}</p>',
            errorsContainer: '<div class="dropify-errors-container"><ul></ul></div>'
        }
    };

    this.element            = element;
    this.input              = $(this.element);
    this.wrapper            = null;
    this.preview            = null;
    this.filenameWrapper    = null;
    this.settings           = $.extend(true, defaults, options, this.input.data());
    this.errorsEvent        = $.Event('dropify.errors');
    this.isDisabled         = false;
    this.isInit             = false;
    this.file               = {
        object: null,
        name: null,
        size: null,
        width: null,
        height: null,
        type: null
    };

    if (!Array.isArray(this.settings.allowedFormats)) {
        this.settings.allowedFormats = this.settings.allowedFormats.split(' ');
    }

    if (!Array.isArray(this.settings.allowedFileExtensions)) {
        this.settings.allowedFileExtensions = this.settings.allowedFileExtensions.split(' ');
    }

    this.onChange     = this.onChange.bind(this);
    this.clearElement = this.clearElement.bind(this);
    this.onFileReady  = this.onFileReady.bind(this);

    this.translateMessages();
    this.createElements();
    this.setContainerSize();

    this.errorsEvent.errors = [];

    this.input.on('change', this.onChange);
}

/**
 * On change event
 */
Dropify.prototype.onChange = function()
{
    this.resetPreview();
    this.readFile(this.element);
};

/**
 * Create dom elements
 */
Dropify.prototype.createElements = function()
{
    this.isInit = true;
    this.input.wrap($(this.settings.tpl.wrap));
    this.wrapper = this.input.parent();

    var messageWrapper = $(this.settings.tpl.message).insertBefore(this.input);
    $(this.settings.tpl.errorLine).appendTo(messageWrapper);

    if (this.isTouchDevice() === true) {
        this.wrapper.addClass('touch-fallback');
    }

    if (this.input.attr('disabled')) {
        this.isDisabled = true;
        this.wrapper.addClass('disabled');
    }

    if (this.settings.showLoader === true) {
        this.loader = $(this.settings.tpl.loader);
        this.loader.insertBefore(this.input);
    }

    this.preview = $(this.settings.tpl.preview);
    this.preview.insertAfter(this.input);

    if (this.isDisabled === false && this.settings.showRemove === true) {
        this.clearButton = $(this.settings.tpl.clearButton);
        this.clearButton.insertAfter(this.input);
        this.clearButton.on('click', this.clearElement);
    }

    this.filenameWrapper = $(this.settings.tpl.filename);
    this.filenameWrapper.prependTo(this.preview.find('.dropify-infos-inner'));

    if (this.settings.showErrors === true) {
        this.errorsContainer = $(this.settings.tpl.errorsContainer);

        if (this.settings.errorsPosition === 'outside') {
            this.errorsContainer.insertAfter(this.wrapper);
        } else {
            this.errorsContainer.insertBefore(this.input);
        }
    }

    var defaultFile = this.settings.defaultFile || '';

    if (defaultFile.trim() !== '') {
        this.file.name = this.cleanFilename(defaultFile);
        this.setPreview(this.isImage(), defaultFile);
    }
};

/**
 * Read the file using FileReader
 *
 * @param  {Object} input
 */
Dropify.prototype.readFile = function(input)
{
    if (input.files && input.files[0]) {
        var reader         = new FileReader();
        var image          = new Image();
        var file           = input.files[0];
        var srcBase64      = null;
        var _this          = this;
        var eventFileReady = $.Event("dropify.fileReady");

        this.clearErrors();
        this.showLoader();
        this.setFileInformations(file);
        this.errorsEvent.errors = [];
        this.checkFileSize();
		this.isFileExtensionAllowed();

        if (this.isImage() && this.file.size < this.sizeToByte(this.settings.maxFileSizePreview)) {
            this.input.on('dropify.fileReady', this.onFileReady);
            reader.readAsDataURL(file);
            reader.onload = function(_file) {
                srcBase64 = _file.target.result;
                image.src = _file.target.result;
                image.onload = function() {
                    _this.setFileDimensions(this.width, this.height);
                    _this.validateImage();
                    _this.input.trigger(eventFileReady, [true, srcBase64]);
                };

            }.bind(this);
        } else {
            this.onFileReady(false);
        }
    }
};

/**
 * On file ready to show
 *
 * @param  {Event} event
 * @param  {Bool} previewable
 * @param  {String} src
 */
Dropify.prototype.onFileReady = function(event, previewable, src)
{
    this.input.off('dropify.fileReady', this.onFileReady);

    if (this.errorsEvent.errors.length === 0) {
        this.setPreview(previewable, src);
    } else {
        this.input.trigger(this.errorsEvent, [this]);
        for (var i = this.errorsEvent.errors.length - 1; i >= 0; i--) {
            var errorNamespace = this.errorsEvent.errors[i].namespace;
            var errorKey = errorNamespace.split('.').pop();
            this.showError(errorKey);
        }

        if (typeof this.errorsContainer !== "undefined") {
            this.errorsContainer.addClass('visible');

            var errorsContainer = this.errorsContainer;
            setTimeout(function(){ errorsContainer.removeClass('visible'); }, this.settings.errorTimeout);
        }

        this.wrapper.addClass('has-error');
        this.resetPreview();
        this.clearElement();
    }
};

/**
 * Set file informations
 *
 * @param {File} file
 */
Dropify.prototype.setFileInformations = function(file)
{
    this.file.object = file;
    this.file.name   = file.name;
    this.file.size   = file.size;
    this.file.type   = file.type;
    this.file.width  = null;
    this.file.height = null;
};

/**
 * Set file dimensions
 *
 * @param {Int} width
 * @param {Int} height
 */
Dropify.prototype.setFileDimensions = function(width, height)
{
    this.file.width  = width;
    this.file.height = height;
};

/**
 * Set the preview and animate it
 *
 * @param {String} src
 */
Dropify.prototype.setPreview = function(previewable, src)
{
    this.wrapper.removeClass('has-error').addClass('has-preview');
    this.filenameWrapper.children('.dropify-filename-inner').html(this.file.name);
    var render = this.preview.children('.dropify-render');

    this.hideLoader();

    if (previewable === true) {
        var imgTag = $('<img />').attr('src', src);

        if (this.settings.height) {
            imgTag.css("max-height", this.settings.height);
        }

        imgTag.appendTo(render);
    } else {
        $('<i />').attr('class', 'dropify-font-file').appendTo(render);
        $('<span class="dropify-extension" />').html(this.getFileType()).appendTo(render);
    }
    this.preview.fadeIn();
};

/**
 * Reset the preview
 */
Dropify.prototype.resetPreview = function()
{
    this.wrapper.removeClass('has-preview');
    var render = this.preview.children('.dropify-render');
    render.find('.dropify-extension').remove();
    render.find('i').remove();
    render.find('img').remove();
    this.preview.hide();
    this.hideLoader();
};

/**
 * Clean the src and get the filename
 *
 * @param  {String} src
 *
 * @return {String} filename
 */
Dropify.prototype.cleanFilename = function(src)
{
    var filename = src.split('\\').pop();
    if (filename == src) {
        filename = src.split('/').pop();
    }

    return src !== "" ? filename : '';
};

/**
 * Clear the element, events are available
 */
Dropify.prototype.clearElement = function()
{
    if (this.errorsEvent.errors.length === 0) {
        var eventBefore = $.Event("dropify.beforeClear");
        this.input.trigger(eventBefore, [this]);

        if (eventBefore.result !== false) {
            this.resetFile();
            this.input.val('');
            this.resetPreview();

            this.input.trigger($.Event("dropify.afterClear"), [this]);
        }
    } else {
        this.resetFile();
        this.input.val('');
        this.resetPreview();
    }
};

/**
 * Reset file informations
 */
Dropify.prototype.resetFile = function()
{
    this.file.object = null;
    this.file.name   = null;
    this.file.size   = null;
    this.file.type   = null;
    this.file.width  = null;
    this.file.height = null;
};

/**
 * Set the container height
 */
Dropify.prototype.setContainerSize = function()
{
    if (this.settings.height) {
        this.wrapper.height(this.settings.height);
    }
};

/**
 * Test if it's touch screen
 *
 * @return {Boolean}
 */
Dropify.prototype.isTouchDevice = function()
{
    return (('ontouchstart' in window) ||
            (navigator.MaxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
};

/**
 * Get the file type.
 *
 * @return {String}
 */
Dropify.prototype.getFileType = function()
{
    return this.file.name.split('.').pop().toLowerCase();
};

/**
 * Test if the file is an image
 *
 * @return {Boolean}
 */
Dropify.prototype.isImage = function()
{
    if (this.settings.imgFileExtensions.indexOf(this.getFileType()) != "-1") {
        return true;
    }

    return false;
};

/**
* Test if the file extension is allowed
*
* @return {Boolean}
*/
Dropify.prototype.isFileExtensionAllowed = function () {

	if (this.settings.allowedFileExtensions.indexOf('*') != "-1" || 
        this.settings.allowedFileExtensions.indexOf(this.getFileType()) != "-1") {
		return true;
	}
	this.pushError("fileExtension");

	return false;
};

/**
 * Translate messages if needed.
 */
Dropify.prototype.translateMessages = function()
{
    for (var name in this.settings.tpl) {
        for (var key in this.settings.messages) {
            this.settings.tpl[name] = this.settings.tpl[name].replace('{{ ' + key + ' }}', this.settings.messages[key]);
        }
    }
};

/**
 * Check the limit filesize.
 */
Dropify.prototype.checkFileSize = function()
{
    if (this.sizeToByte(this.settings.maxFileSize) !== 0 && this.file.size > this.sizeToByte(this.settings.maxFileSize)) {
        this.pushError("fileSize");
    }
};

/**
 * Convert filesize to byte.
 *
 * @return {Int} value
 */
Dropify.prototype.sizeToByte = function(size)
{
    var value = 0;

    if (size !== 0) {
        var unit  = size.slice(-1).toUpperCase(),
            kb    = 1024,
            mb    = kb * 1024,
            gb    = mb * 1024;

        if (unit === 'K') {
            value = parseFloat(size) * kb;
        } else if (unit === 'M') {
            value = parseFloat(size) * mb;
        } else if (unit === 'G') {
            value = parseFloat(size) * gb;
        }
    }

    return value;
};

/**
 * Validate image dimensions and format
 */
Dropify.prototype.validateImage = function()
{
    if (this.settings.minWidth !== 0 && this.settings.minWidth >= this.file.width) {
        this.pushError("minWidth");
    }

    if (this.settings.maxWidth !== 0 && this.settings.maxWidth <= this.file.width) {
        this.pushError("maxWidth");
    }

    if (this.settings.minHeight !== 0 && this.settings.minHeight >= this.file.height) {
        this.pushError("minHeight");
    }

    if (this.settings.maxHeight !== 0 && this.settings.maxHeight <= this.file.height) {
        this.pushError("maxHeight");
    }

    if (this.settings.allowedFormats.indexOf(this.getImageFormat()) == "-1") {
        this.pushError("imageFormat");
    }
};

/**
 * Get image format.
 *
 * @return {String}
 */
Dropify.prototype.getImageFormat = function()
{
    if (this.file.width == this.file.height) {
        return "square";
    }

    if (this.file.width < this.file.height) {
        return "portrait";
    }

    if (this.file.width > this.file.height) {
        return "landscape";
    }
};

/**
* Push error
*
* @param {String} errorKey
*/
Dropify.prototype.pushError = function(errorKey) {
    var e = $.Event("dropify.error." + errorKey);
    this.errorsEvent.errors.push(e);
    this.input.trigger(e, [this]);
};

/**
 * Clear errors
 */
Dropify.prototype.clearErrors = function()
{
    if (typeof this.errorsContainer !== "undefined") {
        this.errorsContainer.children('ul').html('');
    }
};

/**
 * Show error in DOM
 *
 * @param  {String} errorKey
 */
Dropify.prototype.showError = function(errorKey)
{
    if (typeof this.errorsContainer !== "undefined") {
        this.errorsContainer.children('ul').append('<li>' + this.getError(errorKey) + '</li>');
    }
};

/**
 * Get error message
 *
 * @return  {String} message
 */
Dropify.prototype.getError = function(errorKey)
{
    var error = this.settings.error[errorKey],
        value = '';

    if (errorKey === 'fileSize') {
        value = this.settings.maxFileSize;
    } else if (errorKey === 'minWidth') {
        value = this.settings.minWidth;
    } else if (errorKey === 'maxWidth') {
        value = this.settings.maxWidth;
    } else if (errorKey === 'minHeight') {
        value = this.settings.minHeight;
    } else if (errorKey === 'maxHeight') {
        value = this.settings.maxHeight;
    } else if (errorKey === 'imageFormat') {
        value = this.settings.allowedFormats.join(', ');
    } else if (errorKey === 'fileExtension') {
		value = this.settings.allowedFileExtensions.join(', ');
	}

    if (value !== '') {
        return error.replace('{{ value }}', value);
    }

    return error;
};

/**
 * Show the loader
 */
Dropify.prototype.showLoader = function()
{
    if (typeof this.loader !== "undefined") {
        this.loader.show();
    }
};

/**
 * Hide the loader
 */
Dropify.prototype.hideLoader = function()
{
    if (typeof this.loader !== "undefined") {
        this.loader.hide();
    }
};

/**
 * Destroy dropify
 */
Dropify.prototype.destroy = function()
{
    this.input.siblings().remove();
    this.input.unwrap();
    this.isInit = false;
};

/**
 * Init dropify
 */
Dropify.prototype.init = function()
{
    this.createElements();
};

/**
 * Test if element is init
 */
Dropify.prototype.isDropified = function()
{
    return this.isInit;
};

$.fn[pluginName] = function(options) {
    this.each(function() {
        if (!$.data(this, pluginName)) {
            $.data(this, pluginName, new Dropify(this, options));
        }
    });

    return this;
};


!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Sweetalert2=e()}(this,function(){"use strict";function r(t){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function s(t,e,n){return e&&o(t.prototype,e),n&&o(t,n),t}function u(){return(u=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n,o=arguments[e];for(n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}return t}).apply(this,arguments)}function c(t){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function l(t,e){return(l=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function d(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}function i(t,e,n){return(i=d()?Reflect.construct:function(t,e,n){var o=[null];o.push.apply(o,e);o=new(Function.bind.apply(t,o));return n&&l(o,n.prototype),o}).apply(null,arguments)}function p(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function f(t,e,n){return(f="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){t=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=c(t)););return t}(t,e);if(t){e=Object.getOwnPropertyDescriptor(t,e);return e.get?e.get.call(n):e.value}})(t,e,n||t)}function m(t){return t.charAt(0).toUpperCase()+t.slice(1)}function h(e){return Object.keys(e).map(function(t){return e[t]})}function g(t){return Array.prototype.slice.call(t)}function v(t,e){e='"'.concat(t,'" is deprecated and will be removed in the next major release. Please use "').concat(e,'" instead.'),-1===Y.indexOf(e)&&(Y.push(e),W(e))}function b(t){return t&&"function"==typeof t.toPromise}function y(t){return b(t)?t.toPromise():Promise.resolve(t)}function w(t){return t&&Promise.resolve(t)===t}function C(t){return t instanceof Element||"object"===r(t=t)&&t.jquery}function k(){return document.body.querySelector(".".concat($.container))}function e(t){var e=k();return e?e.querySelector(t):null}function t(t){return e(".".concat(t))}function A(){return t($.popup)}function x(){return t($.icon)}function B(){return t($.title)}function P(){return t($.content)}function O(){return t($["html-container"])}function E(){return t($.image)}function n(){return t($["progress-steps"])}function S(){return t($["validation-message"])}function T(){return e(".".concat($.actions," .").concat($.confirm))}function L(){return e(".".concat($.actions," .").concat($.deny))}function q(){return e(".".concat($.loader))}function D(){return e(".".concat($.actions," .").concat($.cancel))}function j(){return t($.actions)}function M(){return t($.header)}function I(){return t($.footer)}function H(){return t($["timer-progress-bar"])}function V(){return t($.close)}function R(){var t=g(A().querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).sort(function(t,e){return t=parseInt(t.getAttribute("tabindex")),(e=parseInt(e.getAttribute("tabindex")))<t?1:t<e?-1:0}),e=g(A().querySelectorAll('\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex="0"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n')).filter(function(t){return"-1"!==t.getAttribute("tabindex")});return function(t){for(var e=[],n=0;n<t.length;n++)-1===e.indexOf(t[n])&&e.push(t[n]);return e}(t.concat(e)).filter(function(t){return wt(t)})}function N(){return!G()&&!document.body.classList.contains($["no-backdrop"])}function U(e,t){e.textContent="",t&&(t=(new DOMParser).parseFromString(t,"text/html"),g(t.querySelector("head").childNodes).forEach(function(t){e.appendChild(t)}),g(t.querySelector("body").childNodes).forEach(function(t){e.appendChild(t)}))}function F(t,e){if(e){for(var n=e.split(/\s+/),o=0;o<n.length;o++)if(!t.classList.contains(n[o]))return;return 1}}function _(t,e,n){var o,i;if(i=e,g((o=t).classList).forEach(function(t){-1===h($).indexOf(t)&&-1===h(X).indexOf(t)&&-1===h(i.showClass).indexOf(t)&&o.classList.remove(t)}),e.customClass&&e.customClass[n]){if("string"!=typeof e.customClass[n]&&!e.customClass[n].forEach)return W("Invalid type of customClass.".concat(n,'! Expected string or iterable object, got "').concat(r(e.customClass[n]),'"'));vt(t,e.customClass[n])}}var z="SweetAlert2:",W=function(t){console.warn("".concat(z," ").concat("object"===r(t)?t.join(" "):t))},K=function(t){console.error("".concat(z," ").concat(t))},Y=[],Z=function(t){return"function"==typeof t?t():t},Q=Object.freeze({cancel:"cancel",backdrop:"backdrop",close:"close",esc:"esc",timer:"timer"}),J=function(t){var e,n={};for(e in t)n[t[e]]="swal2-"+t[e];return n},$=J(["container","shown","height-auto","iosfix","popup","modal","no-backdrop","no-transition","toast","toast-shown","show","hide","close","title","header","content","html-container","actions","confirm","deny","cancel","footer","icon","icon-content","image","input","file","range","select","radio","checkbox","label","textarea","inputerror","input-label","validation-message","progress-steps","active-progress-step","progress-step","progress-step-line","loader","loading","styled","top","top-start","top-end","top-left","top-right","center","center-start","center-end","center-left","center-right","bottom","bottom-start","bottom-end","bottom-left","bottom-right","grow-row","grow-column","grow-fullscreen","rtl","timer-progress-bar","timer-progress-bar-container","scrollbar-measure","icon-success","icon-warning","icon-info","icon-question","icon-error"]),X=J(["success","warning","info","question","error"]),G=function(){return document.body.classList.contains($["toast-shown"])},tt={previousBodyPadding:null};function et(t,e){if(!e)return null;switch(e){case"select":case"textarea":case"file":return yt(t,$[e]);case"checkbox":return t.querySelector(".".concat($.checkbox," input"));case"radio":return t.querySelector(".".concat($.radio," input:checked"))||t.querySelector(".".concat($.radio," input:first-child"));case"range":return t.querySelector(".".concat($.range," input"));default:return yt(t,$.input)}}function nt(t){var e;t.focus(),"file"!==t.type&&(e=t.value,t.value="",t.value=e)}function ot(t,e,n){t&&e&&(e="string"==typeof e?e.split(/\s+/).filter(Boolean):e).forEach(function(e){t.forEach?t.forEach(function(t){n?t.classList.add(e):t.classList.remove(e)}):n?t.classList.add(e):t.classList.remove(e)})}function it(t,e,n){(n=n==="".concat(parseInt(n))?parseInt(n):n)||0===parseInt(n)?t.style[e]="number"==typeof n?"".concat(n,"px"):n:t.style.removeProperty(e)}function rt(t){t.style.display=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"flex"}function at(t){t.style.display="none"}function st(t,e,n,o){(e=t.querySelector(e))&&(e.style[n]=o)}function ut(t,e,n){e?rt(t,n):at(t)}function ct(t){return!!(t.scrollHeight>t.clientHeight)}function lt(t){var e=window.getComputedStyle(t),t=parseFloat(e.getPropertyValue("animation-duration")||"0"),e=parseFloat(e.getPropertyValue("transition-duration")||"0");return 0<t||0<e}function dt(t){var e=1<arguments.length&&void 0!==arguments[1]&&arguments[1],n=H();wt(n)&&(e&&(n.style.transition="none",n.style.width="100%"),setTimeout(function(){n.style.transition="width ".concat(t/1e3,"s linear"),n.style.width="0%"},10))}function pt(){return"undefined"==typeof window||"undefined"==typeof document}function ft(t){Mn.isVisible()&&gt!==t.target.value&&Mn.resetValidationMessage(),gt=t.target.value}function mt(t,e){t instanceof HTMLElement?e.appendChild(t):"object"===r(t)?At(t,e):t&&U(e,t)}function ht(t,e){var n=j(),o=q(),i=T(),r=L(),a=D();e.showConfirmButton||e.showDenyButton||e.showCancelButton||at(n),_(n,e,"actions"),Pt(i,"confirm",e),Pt(r,"deny",e),Pt(a,"cancel",e),function(t,e,n,o){if(!o.buttonsStyling)return bt([t,e,n],$.styled);vt([t,e,n],$.styled),o.confirmButtonColor&&(t.style.backgroundColor=o.confirmButtonColor);o.denyButtonColor&&(e.style.backgroundColor=o.denyButtonColor);o.cancelButtonColor&&(n.style.backgroundColor=o.cancelButtonColor)}(i,r,a,e),e.reverseButtons&&(n.insertBefore(a,o),n.insertBefore(r,o),n.insertBefore(i,o)),U(o,e.loaderHtml),_(o,e,"loader")}var gt,vt=function(t,e){ot(t,e,!0)},bt=function(t,e){ot(t,e,!1)},yt=function(t,e){for(var n=0;n<t.childNodes.length;n++)if(F(t.childNodes[n],e))return t.childNodes[n]},wt=function(t){return!(!t||!(t.offsetWidth||t.offsetHeight||t.getClientRects().length))},Ct='\n <div aria-labelledby="'.concat($.title,'" aria-describedby="').concat($.content,'" class="').concat($.popup,'" tabindex="-1">\n   <div class="').concat($.header,'">\n     <ul class="').concat($["progress-steps"],'"></ul>\n     <div class="').concat($.icon,'"></div>\n     <img class="').concat($.image,'" />\n     <h2 class="').concat($.title,'" id="').concat($.title,'"></h2>\n     <button type="button" class="').concat($.close,'"></button>\n   </div>\n   <div class="').concat($.content,'">\n     <div id="').concat($.content,'" class="').concat($["html-container"],'"></div>\n     <input class="').concat($.input,'" />\n     <input type="file" class="').concat($.file,'" />\n     <div class="').concat($.range,'">\n       <input type="range" />\n       <output></output>\n     </div>\n     <select class="').concat($.select,'"></select>\n     <div class="').concat($.radio,'"></div>\n     <label for="').concat($.checkbox,'" class="').concat($.checkbox,'">\n       <input type="checkbox" />\n       <span class="').concat($.label,'"></span>\n     </label>\n     <textarea class="').concat($.textarea,'"></textarea>\n     <div class="').concat($["validation-message"],'" id="').concat($["validation-message"],'"></div>\n   </div>\n   <div class="').concat($.actions,'">\n     <div class="').concat($.loader,'"></div>\n     <button type="button" class="').concat($.confirm,'"></button>\n     <button type="button" class="').concat($.deny,'"></button>\n     <button type="button" class="').concat($.cancel,'"></button>\n   </div>\n   <div class="').concat($.footer,'"></div>\n   <div class="').concat($["timer-progress-bar-container"],'">\n     <div class="').concat($["timer-progress-bar"],'"></div>\n   </div>\n </div>\n').replace(/(^|\n)\s*/g,""),kt=function(t){var e,n,o,i,r,a=!!(i=k())&&(i.parentNode.removeChild(i),bt([document.documentElement,document.body],[$["no-backdrop"],$["toast-shown"],$["has-column"]]),!0);pt()?K("SweetAlert2 requires document to initialize"):((r=document.createElement("div")).className=$.container,a&&vt(r,$["no-transition"]),U(r,Ct),(i="string"==typeof(e=t.target)?document.querySelector(e):e).appendChild(r),a=t,(e=A()).setAttribute("role",a.toast?"alert":"dialog"),e.setAttribute("aria-live",a.toast?"polite":"assertive"),a.toast||e.setAttribute("aria-modal","true"),r=i,"rtl"===window.getComputedStyle(r).direction&&vt(k(),$.rtl),t=P(),a=yt(t,$.input),e=yt(t,$.file),n=t.querySelector(".".concat($.range," input")),o=t.querySelector(".".concat($.range," output")),i=yt(t,$.select),r=t.querySelector(".".concat($.checkbox," input")),t=yt(t,$.textarea),a.oninput=ft,e.onchange=ft,i.onchange=ft,r.onchange=ft,t.oninput=ft,n.oninput=function(t){ft(t),o.value=n.value},n.onchange=function(t){ft(t),n.nextSibling.value=n.value})},At=function(t,e){t.jquery?xt(e,t):U(e,t.toString())},xt=function(t,e){if(t.textContent="",0 in e)for(var n=0;n in e;n++)t.appendChild(e[n].cloneNode(!0));else t.appendChild(e.cloneNode(!0))},Bt=function(){if(pt())return!1;var t,e=document.createElement("div"),n={WebkitAnimation:"webkitAnimationEnd",OAnimation:"oAnimationEnd oanimationend",animation:"animationend"};for(t in n)if(Object.prototype.hasOwnProperty.call(n,t)&&void 0!==e.style[t])return n[t];return!1}();function Pt(t,e,n){ut(t,n["show".concat(m(e),"Button")],"inline-block"),U(t,n["".concat(e,"ButtonText")]),t.setAttribute("aria-label",n["".concat(e,"ButtonAriaLabel")]),t.className=$[e],_(t,n,"".concat(e,"Button")),vt(t,n["".concat(e,"ButtonClass")])}function Ot(t,e){var n,o,i=k();i&&(o=i,"string"==typeof(n=e.backdrop)?o.style.background=n:n||vt([document.documentElement,document.body],$["no-backdrop"]),!e.backdrop&&e.allowOutsideClick&&W('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`'),o=i,(n=e.position)in $?vt(o,$[n]):(W('The "position" parameter is not valid, defaulting to "center"'),vt(o,$.center)),n=i,!(o=e.grow)||"string"!=typeof o||(o="grow-".concat(o))in $&&vt(n,$[o]),_(i,e,"container"),(e=document.body.getAttribute("data-swal2-queue-step"))&&(i.setAttribute("data-queue-step",e),document.body.removeAttribute("data-swal2-queue-step")))}function Et(t,e){t.placeholder&&!e.inputPlaceholder||(t.placeholder=e.inputPlaceholder)}function St(t,e,n){var o,i;n.inputLabel&&(t.id=$.input,o=document.createElement("label"),i=$["input-label"],o.setAttribute("for",t.id),o.className=i,vt(o,n.customClass.inputLabel),o.innerText=n.inputLabel,e.insertAdjacentElement("beforebegin",o))}var Tt={promise:new WeakMap,innerParams:new WeakMap,domCache:new WeakMap},Lt=["input","file","range","select","radio","checkbox","textarea"],qt=function(t){if(!It[t.input])return K('Unexpected type of input! Expected "text", "email", "password", "number", "tel", "select", "radio", "checkbox", "textarea", "file" or "url", got "'.concat(t.input,'"'));var e=Mt(t.input),n=It[t.input](e,t);rt(n),setTimeout(function(){nt(n)})},Dt=function(t,e){var n=et(P(),t);if(n)for(var o in!function(t){for(var e=0;e<t.attributes.length;e++){var n=t.attributes[e].name;-1===["type","value","style"].indexOf(n)&&t.removeAttribute(n)}}(n),e)"range"===t&&"placeholder"===o||n.setAttribute(o,e[o])},jt=function(t){var e=Mt(t.input);t.customClass&&vt(e,t.customClass.input)},Mt=function(t){t=$[t]||$.input;return yt(P(),t)},It={};It.text=It.email=It.password=It.number=It.tel=It.url=function(t,e){return"string"==typeof e.inputValue||"number"==typeof e.inputValue?t.value=e.inputValue:w(e.inputValue)||W('Unexpected type of inputValue! Expected "string", "number" or "Promise", got "'.concat(r(e.inputValue),'"')),St(t,t,e),Et(t,e),t.type=e.input,t},It.file=function(t,e){return St(t,t,e),Et(t,e),t},It.range=function(t,e){var n=t.querySelector("input"),o=t.querySelector("output");return n.value=e.inputValue,n.type=e.input,o.value=e.inputValue,St(n,t,e),t},It.select=function(t,e){var n;return t.textContent="",e.inputPlaceholder&&(n=document.createElement("option"),U(n,e.inputPlaceholder),n.value="",n.disabled=!0,n.selected=!0,t.appendChild(n)),St(t,t,e),t},It.radio=function(t){return t.textContent="",t},It.checkbox=function(t,e){var n=et(P(),"checkbox");n.value=1,n.id=$.checkbox,n.checked=Boolean(e.inputValue);n=t.querySelector("span");return U(n,e.inputPlaceholder),t},It.textarea=function(e,t){e.value=t.inputValue,Et(e,t),St(e,e,t);function n(t){return parseInt(window.getComputedStyle(t).paddingLeft)+parseInt(window.getComputedStyle(t).paddingRight)}var o;return"MutationObserver"in window&&(o=parseInt(window.getComputedStyle(A()).width),new MutationObserver(function(){var t=e.offsetWidth+n(A())+n(P());A().style.width=o<t?"".concat(t,"px"):null}).observe(e,{attributes:!0,attributeFilter:["style"]})),e};function Ht(t,e){var o,i,r,n=O();_(n,e,"htmlContainer"),e.html?(mt(e.html,n),rt(n,"block")):e.text?(n.textContent=e.text,rt(n,"block")):at(n),t=t,o=e,i=P(),t=Tt.innerParams.get(t),r=!t||o.input!==t.input,Lt.forEach(function(t){var e=$[t],n=yt(i,e);Dt(t,o.inputAttributes),n.className=e,r&&at(n)}),o.input&&(r&&qt(o),jt(o)),_(P(),e,"content")}function Vt(){return k()&&k().getAttribute("data-queue-step")}function Rt(t,o){var i=n();if(!o.progressSteps||0===o.progressSteps.length)return at(i),0;rt(i),i.textContent="";var r=parseInt(void 0===o.currentProgressStep?Vt():o.currentProgressStep);r>=o.progressSteps.length&&W("Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"),o.progressSteps.forEach(function(t,e){var n,t=(n=t,t=document.createElement("li"),vt(t,$["progress-step"]),U(t,n),t);i.appendChild(t),e===r&&vt(t,$["active-progress-step"]),e!==o.progressSteps.length-1&&(t=o,e=document.createElement("li"),vt(e,$["progress-step-line"]),t.progressStepsDistance&&(e.style.width=t.progressStepsDistance),i.appendChild(e))})}function Nt(t,e){var n,o=M();_(o,e,"header"),Rt(0,e),n=t,o=e,t=Tt.innerParams.get(n),n=x(),t&&o.icon===t.icon?(Wt(n,o),_t(n,o)):o.icon||o.iconHtml?o.icon&&-1===Object.keys(X).indexOf(o.icon)?(K('Unknown icon! Expected "success", "error", "warning", "info" or "question", got "'.concat(o.icon,'"')),at(n)):(rt(n),Wt(n,o),_t(n,o),vt(n,o.showClass.icon)):at(n),function(t){var e=E();if(!t.imageUrl)return at(e);rt(e,""),e.setAttribute("src",t.imageUrl),e.setAttribute("alt",t.imageAlt),it(e,"width",t.imageWidth),it(e,"height",t.imageHeight),e.className=$.image,_(e,t,"image")}(e),o=e,n=B(),ut(n,o.title||o.titleText,"block"),o.title&&mt(o.title,n),o.titleText&&(n.innerText=o.titleText),_(n,o,"title"),o=e,e=V(),U(e,o.closeButtonHtml),_(e,o,"closeButton"),ut(e,o.showCloseButton),e.setAttribute("aria-label",o.closeButtonAriaLabel)}function Ut(t,e){var n,o,i;i=e,n=k(),o=A(),i.toast?(it(n,"width",i.width),o.style.width="100%"):it(o,"width",i.width),it(o,"padding",i.padding),i.background&&(o.style.background=i.background),at(S()),Qt(o,i),Ot(0,e),Nt(t,e),Ht(t,e),ht(0,e),i=e,t=I(),ut(t,i.footer),i.footer&&mt(i.footer,t),_(t,i,"footer"),"function"==typeof e.didRender?e.didRender(A()):"function"==typeof e.onRender&&e.onRender(A())}function Ft(){return T()&&T().click()}var _t=function(t,e){for(var n in X)e.icon!==n&&bt(t,X[n]);vt(t,X[e.icon]),Kt(t,e),zt(),_(t,e,"icon")},zt=function(){for(var t=A(),e=window.getComputedStyle(t).getPropertyValue("background-color"),n=t.querySelectorAll("[class^=swal2-success-circular-line], .swal2-success-fix"),o=0;o<n.length;o++)n[o].style.backgroundColor=e},Wt=function(t,e){t.textContent="",e.iconHtml?U(t,Yt(e.iconHtml)):"success"===e.icon?U(t,'\n      <div class="swal2-success-circular-line-left"></div>\n      <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n      <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n      <div class="swal2-success-circular-line-right"></div>\n    '):"error"===e.icon?U(t,'\n      <span class="swal2-x-mark">\n        <span class="swal2-x-mark-line-left"></span>\n        <span class="swal2-x-mark-line-right"></span>\n      </span>\n    '):U(t,Yt({question:"?",warning:"!",info:"i"}[e.icon]))},Kt=function(t,e){if(e.iconColor){t.style.color=e.iconColor,t.style.borderColor=e.iconColor;for(var n=0,o=[".swal2-success-line-tip",".swal2-success-line-long",".swal2-x-mark-line-left",".swal2-x-mark-line-right"];n<o.length;n++)st(t,o[n],"backgroundColor",e.iconColor);st(t,".swal2-success-ring","borderColor",e.iconColor)}},Yt=function(t){return'<div class="'.concat($["icon-content"],'">').concat(t,"</div>")},Zt=[],Qt=function(t,e){t.className="".concat($.popup," ").concat(wt(t)?e.showClass.popup:""),e.toast?(vt([document.documentElement,document.body],$["toast-shown"]),vt(t,$.toast)):vt(t,$.modal),_(t,e,"popup"),"string"==typeof e.customClass&&vt(t,e.customClass),e.icon&&vt(t,$["icon-".concat(e.icon)])};function Jt(t){(e=A())||Mn.fire();var e=A(),n=j(),o=q();!t&&wt(T())&&(t=T()),rt(n),t&&(at(t),o.setAttribute("data-button-to-replace",t.className)),o.parentNode.insertBefore(o,t),vt([e,n],$.loading),rt(o),e.setAttribute("data-loading",!0),e.setAttribute("aria-busy",!0),e.focus()}function $t(o){return new Promise(function(t){if(!o)return t();var e=window.scrollX,n=window.scrollY;te.restoreFocusTimeout=setTimeout(function(){te.previousActiveElement&&te.previousActiveElement.focus?(te.previousActiveElement.focus(),te.previousActiveElement=null):document.body&&document.body.focus(),t()},100),void 0!==e&&void 0!==n&&window.scrollTo(e,n)})}function Xt(){if(te.timeout)return function(){var t=H(),e=parseInt(window.getComputedStyle(t).width);t.style.removeProperty("transition"),t.style.width="100%";var n=parseInt(window.getComputedStyle(t).width),n=parseInt(e/n*100);t.style.removeProperty("transition"),t.style.width="".concat(n,"%")}(),te.timeout.stop()}function Gt(){if(te.timeout){var t=te.timeout.start();return dt(t),t}}var te={},ee=!1,ne={};function oe(t){for(var e=t.target;e&&e!==document;e=e.parentNode)for(var n in ne){var o=e.getAttribute(n);if(o)return void ne[n].fire({template:o})}}function ie(t){return Object.prototype.hasOwnProperty.call(se,t)}function re(t){return ce[t]}function ae(t){for(var e in t)ie(n=e)||W('Unknown parameter "'.concat(n,'"')),t.toast&&(n=e,-1!==le.indexOf(n)&&W('The parameter "'.concat(n,'" is incompatible with toasts'))),re(e=e)&&v(e,re(e));var n}var se={title:"",titleText:"",text:"",html:"",footer:"",icon:void 0,iconColor:void 0,iconHtml:void 0,template:void 0,toast:!1,animation:!0,showClass:{popup:"swal2-show",backdrop:"swal2-backdrop-show",icon:"swal2-icon-show"},hideClass:{popup:"swal2-hide",backdrop:"swal2-backdrop-hide",icon:"swal2-icon-hide"},customClass:{},target:"body",backdrop:!0,heightAuto:!0,allowOutsideClick:!0,allowEscapeKey:!0,allowEnterKey:!0,stopKeydownPropagation:!0,keydownListenerCapture:!1,showConfirmButton:!0,showDenyButton:!1,showCancelButton:!1,preConfirm:void 0,preDeny:void 0,confirmButtonText:"OK",confirmButtonAriaLabel:"",confirmButtonColor:void 0,denyButtonText:"No",denyButtonAriaLabel:"",denyButtonColor:void 0,cancelButtonText:"Cancel",cancelButtonAriaLabel:"",cancelButtonColor:void 0,buttonsStyling:!0,reverseButtons:!1,focusConfirm:!0,focusDeny:!1,focusCancel:!1,returnFocus:!0,showCloseButton:!1,closeButtonHtml:"&times;",closeButtonAriaLabel:"Close this dialog",loaderHtml:"",showLoaderOnConfirm:!1,showLoaderOnDeny:!1,imageUrl:void 0,imageWidth:void 0,imageHeight:void 0,imageAlt:"",timer:void 0,timerProgressBar:!1,width:void 0,padding:void 0,background:void 0,input:void 0,inputPlaceholder:"",inputLabel:"",inputValue:"",inputOptions:{},inputAutoTrim:!0,inputAttributes:{},inputValidator:void 0,returnInputValueOnDeny:!1,validationMessage:void 0,grow:!1,position:"center",progressSteps:[],currentProgressStep:void 0,progressStepsDistance:void 0,onBeforeOpen:void 0,onOpen:void 0,willOpen:void 0,didOpen:void 0,onRender:void 0,didRender:void 0,onClose:void 0,onAfterClose:void 0,willClose:void 0,didClose:void 0,onDestroy:void 0,didDestroy:void 0,scrollbarPadding:!0},ue=["allowEscapeKey","allowOutsideClick","background","buttonsStyling","cancelButtonAriaLabel","cancelButtonColor","cancelButtonText","closeButtonAriaLabel","closeButtonHtml","confirmButtonAriaLabel","confirmButtonColor","confirmButtonText","currentProgressStep","customClass","denyButtonAriaLabel","denyButtonColor","denyButtonText","didClose","didDestroy","footer","hideClass","html","icon","iconColor","iconHtml","imageAlt","imageHeight","imageUrl","imageWidth","onAfterClose","onClose","onDestroy","progressSteps","returnFocus","reverseButtons","showCancelButton","showCloseButton","showConfirmButton","showDenyButton","text","title","titleText","willClose"],ce={animation:'showClass" and "hideClass',onBeforeOpen:"willOpen",onOpen:"didOpen",onRender:"didRender",onClose:"willClose",onAfterClose:"didClose",onDestroy:"didDestroy"},le=["allowOutsideClick","allowEnterKey","backdrop","focusConfirm","focusDeny","focusCancel","returnFocus","heightAuto","keydownListenerCapture"],de=Object.freeze({isValidParameter:ie,isUpdatableParameter:function(t){return-1!==ue.indexOf(t)},isDeprecatedParameter:re,argsToParams:function(n){var o={};return"object"!==r(n[0])||C(n[0])?["title","html","icon"].forEach(function(t,e){e=n[e];"string"==typeof e||C(e)?o[t]=e:void 0!==e&&K("Unexpected type of ".concat(t,'! Expected "string" or "Element", got ').concat(r(e)))}):u(o,n[0]),o},isVisible:function(){return wt(A())},clickConfirm:Ft,clickDeny:function(){return L()&&L().click()},clickCancel:function(){return D()&&D().click()},getContainer:k,getPopup:A,getTitle:B,getContent:P,getHtmlContainer:O,getImage:E,getIcon:x,getInputLabel:function(){return t($["input-label"])},getCloseButton:V,getActions:j,getConfirmButton:T,getDenyButton:L,getCancelButton:D,getLoader:q,getHeader:M,getFooter:I,getTimerProgressBar:H,getFocusableElements:R,getValidationMessage:S,isLoading:function(){return A().hasAttribute("data-loading")},fire:function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return i(this,e)},mixin:function(r){return function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&l(t,e)}(i,t);var n,o,e=(n=i,o=d(),function(){var t,e=c(n);return p(this,o?(t=c(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments))});function i(){return a(this,i),e.apply(this,arguments)}return s(i,[{key:"_main",value:function(t,e){return f(c(i.prototype),"_main",this).call(this,t,u({},r,e))}}]),i}(this)},queue:function(t){v("Swal.queue()","async/await");var r=this;Zt=t;function a(t,e){Zt=[],t(e)}var s=[];return new Promise(function(i){!function e(n,o){n<Zt.length?(document.body.setAttribute("data-swal2-queue-step",n),r.fire(Zt[n]).then(function(t){void 0!==t.value?(s.push(t.value),e(n+1,o)):a(i,{dismiss:t.dismiss})})):a(i,{value:s})}(0)})},getQueueStep:Vt,insertQueueStep:function(t,e){return e&&e<Zt.length?Zt.splice(e,0,t):Zt.push(t)},deleteQueueStep:function(t){void 0!==Zt[t]&&Zt.splice(t,1)},showLoading:Jt,enableLoading:Jt,getTimerLeft:function(){return te.timeout&&te.timeout.getTimerLeft()},stopTimer:Xt,resumeTimer:Gt,toggleTimer:function(){var t=te.timeout;return t&&(t.running?Xt:Gt)()},increaseTimer:function(t){if(te.timeout){t=te.timeout.increase(t);return dt(t,!0),t}},isTimerRunning:function(){return te.timeout&&te.timeout.isRunning()},bindClickHandler:function(){ne[0<arguments.length&&void 0!==arguments[0]?arguments[0]:"data-swal-template"]=this,ee||(document.body.addEventListener("click",oe),ee=!0)}});function pe(){var t,e;Tt.innerParams.get(this)&&(t=Tt.domCache.get(this),at(t.loader),(e=t.popup.getElementsByClassName(t.loader.getAttribute("data-button-to-replace"))).length?rt(e[0],"inline-block"):wt(T())||wt(L())||wt(D())||at(t.actions),bt([t.popup,t.actions],$.loading),t.popup.removeAttribute("aria-busy"),t.popup.removeAttribute("data-loading"),t.confirmButton.disabled=!1,t.denyButton.disabled=!1,t.cancelButton.disabled=!1)}function fe(){null===tt.previousBodyPadding&&document.body.scrollHeight>window.innerHeight&&(tt.previousBodyPadding=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-right")),document.body.style.paddingRight="".concat(tt.previousBodyPadding+function(){var t=document.createElement("div");t.className=$["scrollbar-measure"],document.body.appendChild(t);var e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e}(),"px"))}function me(){return!!window.MSInputMethodContext&&!!document.documentMode}function he(){var t=k(),e=A();t.style.removeProperty("align-items"),e.offsetTop<0&&(t.style.alignItems="flex-start")}var ge=function(){navigator.userAgent.match(/(CriOS|FxiOS|EdgiOS|YaBrowser|UCBrowser)/i)||A().scrollHeight>window.innerHeight-44&&(k().style.paddingBottom="".concat(44,"px"))},ve=function(){var e,t=k();t.ontouchstart=function(t){e=be(t)},t.ontouchmove=function(t){e&&(t.preventDefault(),t.stopPropagation())}},be=function(t){var e=t.target,n=k();return!ye(t)&&!we(t)&&(e===n||!(ct(n)||"INPUT"===e.tagName||ct(P())&&P().contains(e)))},ye=function(t){return t.touches&&t.touches.length&&"stylus"===t.touches[0].touchType},we=function(t){return t.touches&&1<t.touches.length},Ce={swalPromiseResolve:new WeakMap};function ke(t,e,n,o){G()?Ee(t,o):($t(n).then(function(){return Ee(t,o)}),te.keydownTarget.removeEventListener("keydown",te.keydownHandler,{capture:te.keydownListenerCapture}),te.keydownHandlerAdded=!1),e.parentNode&&!document.body.getAttribute("data-swal2-queue-step")&&e.parentNode.removeChild(e),N()&&(null!==tt.previousBodyPadding&&(document.body.style.paddingRight="".concat(tt.previousBodyPadding,"px"),tt.previousBodyPadding=null),F(document.body,$.iosfix)&&(e=parseInt(document.body.style.top,10),bt(document.body,$.iosfix),document.body.style.top="",document.body.scrollTop=-1*e),"undefined"!=typeof window&&me()&&window.removeEventListener("resize",he),g(document.body.children).forEach(function(t){t.hasAttribute("data-previous-aria-hidden")?(t.setAttribute("aria-hidden",t.getAttribute("data-previous-aria-hidden")),t.removeAttribute("data-previous-aria-hidden")):t.removeAttribute("aria-hidden")})),bt([document.documentElement,document.body],[$.shown,$["height-auto"],$["no-backdrop"],$["toast-shown"]])}function Ae(t){var e,n,o,i=A();i&&(t=xe(t),(e=Tt.innerParams.get(this))&&!F(i,e.hideClass.popup)&&(n=Ce.swalPromiseResolve.get(this),bt(i,e.showClass.popup),vt(i,e.hideClass.popup),o=k(),bt(o,e.showClass.backdrop),vt(o,e.hideClass.backdrop),Be(this,i,e),n(t)))}function xe(t){return void 0===t?{isConfirmed:!1,isDenied:!1,isDismissed:!0}:u({isConfirmed:!1,isDenied:!1,isDismissed:!1},t)}function Be(t,e,n){var o=k(),i=Bt&&lt(e),r=n.onClose,a=n.onAfterClose,s=n.willClose,u=n.didClose;Pe(e,s,r),i?Oe(t,e,o,n.returnFocus,u||a):ke(t,o,n.returnFocus,u||a)}var Pe=function(t,e,n){null!==e&&"function"==typeof e?e(t):null!==n&&"function"==typeof n&&n(t)},Oe=function(t,e,n,o,i){te.swalCloseEventFinishedCallback=ke.bind(null,t,n,o,i),e.addEventListener(Bt,function(t){t.target===e&&(te.swalCloseEventFinishedCallback(),delete te.swalCloseEventFinishedCallback)})},Ee=function(t,e){setTimeout(function(){"function"==typeof e&&e(),t._destroy()})};function Se(t,e,n){var o=Tt.domCache.get(t);e.forEach(function(t){o[t].disabled=n})}function Te(t,e){if(!t)return!1;if("radio"===t.type)for(var n=t.parentNode.parentNode.querySelectorAll("input"),o=0;o<n.length;o++)n[o].disabled=e;else t.disabled=e}var Le=function(){function n(t,e){a(this,n),this.callback=t,this.remaining=e,this.running=!1,this.start()}return s(n,[{key:"start",value:function(){return this.running||(this.running=!0,this.started=new Date,this.id=setTimeout(this.callback,this.remaining)),this.remaining}},{key:"stop",value:function(){return this.running&&(this.running=!1,clearTimeout(this.id),this.remaining-=new Date-this.started),this.remaining}},{key:"increase",value:function(t){var e=this.running;return e&&this.stop(),this.remaining+=t,e&&this.start(),this.remaining}},{key:"getTimerLeft",value:function(){return this.running&&(this.stop(),this.start()),this.remaining}},{key:"isRunning",value:function(){return this.running}}]),n}(),qe={email:function(t,e){return/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(t)?Promise.resolve():Promise.resolve(e||"Invalid email address")},url:function(t,e){return/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(t)?Promise.resolve():Promise.resolve(e||"Invalid URL")}};function De(t){var e,n;(e=t).inputValidator||Object.keys(qe).forEach(function(t){e.input===t&&(e.inputValidator=qe[t])}),t.showLoaderOnConfirm&&!t.preConfirm&&W("showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://sweetalert2.github.io/#ajax-request"),t.animation=Z(t.animation),(n=t).target&&("string"!=typeof n.target||document.querySelector(n.target))&&("string"==typeof n.target||n.target.appendChild)||(W('Target parameter is not valid, defaulting to "body"'),n.target="body"),"string"==typeof t.title&&(t.title=t.title.split("\n").join("<br />")),kt(t)}function je(t){var e=k(),n=A();"function"==typeof t.willOpen?t.willOpen(n):"function"==typeof t.onBeforeOpen&&t.onBeforeOpen(n);var o=window.getComputedStyle(document.body).overflowY;Je(e,n,t),setTimeout(function(){Ze(e,n)},10),N()&&(Qe(e,t.scrollbarPadding,o),g(document.body.children).forEach(function(t){t===k()||function(t,e){if("function"==typeof t.contains)return t.contains(e)}(t,k())||(t.hasAttribute("aria-hidden")&&t.setAttribute("data-previous-aria-hidden",t.getAttribute("aria-hidden")),t.setAttribute("aria-hidden","true"))})),G()||te.previousActiveElement||(te.previousActiveElement=document.activeElement),Ye(n,t),bt(e,$["no-transition"])}function Me(t){var e=A();t.target===e&&(t=k(),e.removeEventListener(Bt,Me),t.style.overflowY="auto")}function Ie(t,e){t.closePopup({isConfirmed:!0,value:e})}function He(t,e,n){var o=R();if(o.length)return(e+=n)===o.length?e=0:-1===e&&(e=o.length-1),o[e].focus();A().focus()}var Ve=["swal-title","swal-html","swal-footer"],Re=function(t){var n={};return g(t.querySelectorAll("swal-param")).forEach(function(t){Ke(t,["name","value"]);var e=t.getAttribute("name"),t=t.getAttribute("value");"boolean"==typeof se[e]&&"false"===t&&(t=!1),"object"===r(se[e])&&(t=JSON.parse(t)),n[e]=t}),n},Ne=function(t){var n={};return g(t.querySelectorAll("swal-button")).forEach(function(t){Ke(t,["type","color","aria-label"]);var e=t.getAttribute("type");n["".concat(e,"ButtonText")]=t.innerHTML,n["show".concat(m(e),"Button")]=!0,t.hasAttribute("color")&&(n["".concat(e,"ButtonColor")]=t.getAttribute("color")),t.hasAttribute("aria-label")&&(n["".concat(e,"ButtonAriaLabel")]=t.getAttribute("aria-label"))}),n},Ue=function(t){var e={},t=t.querySelector("swal-image");return t&&(Ke(t,["src","width","height","alt"]),t.hasAttribute("src")&&(e.imageUrl=t.getAttribute("src")),t.hasAttribute("width")&&(e.imageWidth=t.getAttribute("width")),t.hasAttribute("height")&&(e.imageHeight=t.getAttribute("height")),t.hasAttribute("alt")&&(e.imageAlt=t.getAttribute("alt"))),e},Fe=function(t){var e={},t=t.querySelector("swal-icon");return t&&(Ke(t,["type","color"]),t.hasAttribute("type")&&(e.icon=t.getAttribute("type")),t.hasAttribute("color")&&(e.iconColor=t.getAttribute("color")),e.iconHtml=t.innerHTML),e},_e=function(t){var n={},e=t.querySelector("swal-input");e&&(Ke(e,["type","label","placeholder","value"]),n.input=e.getAttribute("type")||"text",e.hasAttribute("label")&&(n.inputLabel=e.getAttribute("label")),e.hasAttribute("placeholder")&&(n.inputPlaceholder=e.getAttribute("placeholder")),e.hasAttribute("value")&&(n.inputValue=e.getAttribute("value")));t=t.querySelectorAll("swal-input-option");return t.length&&(n.inputOptions={},g(t).forEach(function(t){Ke(t,["value"]);var e=t.getAttribute("value"),t=t.innerHTML;n.inputOptions[e]=t})),n},ze=function(t,e){var n,o={};for(n in e){var i=e[n],r=t.querySelector(i);r&&(Ke(r,[]),o[i.replace(/^swal-/,"")]=r.innerHTML.trim())}return o},We=function(e){var n=Ve.concat(["swal-param","swal-button","swal-image","swal-icon","swal-input","swal-input-option"]);g(e.querySelectorAll("*")).forEach(function(t){t.parentNode===e&&(t=t.tagName.toLowerCase(),-1===n.indexOf(t)&&W("Unrecognized element <".concat(t,">")))})},Ke=function(e,n){g(e.attributes).forEach(function(t){-1===n.indexOf(t.name)&&W(['Unrecognized attribute "'.concat(t.name,'" on <').concat(e.tagName.toLowerCase(),">."),"".concat(n.length?"Allowed attributes are: ".concat(n.join(", ")):"To set the value, use HTML within the element.")])})},Ye=function(t,e){"function"==typeof e.didOpen?setTimeout(function(){return e.didOpen(t)}):"function"==typeof e.onOpen&&setTimeout(function(){return e.onOpen(t)})},Ze=function(t,e){Bt&&lt(e)?(t.style.overflowY="hidden",e.addEventListener(Bt,Me)):t.style.overflowY="auto"},Qe=function(t,e,n){var o;(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream||"MacIntel"===navigator.platform&&1<navigator.maxTouchPoints)&&!F(document.body,$.iosfix)&&(o=document.body.scrollTop,document.body.style.top="".concat(-1*o,"px"),vt(document.body,$.iosfix),ve(),ge()),"undefined"!=typeof window&&me()&&(he(),window.addEventListener("resize",he)),e&&"hidden"!==n&&fe(),setTimeout(function(){t.scrollTop=0})},Je=function(t,e,n){vt(t,n.showClass.backdrop),e.style.setProperty("opacity","0","important"),rt(e),setTimeout(function(){vt(e,n.showClass.popup),e.style.removeProperty("opacity")},10),vt([document.documentElement,document.body],$.shown),n.heightAuto&&n.backdrop&&!n.toast&&vt([document.documentElement,document.body],$["height-auto"])},$e=function(t){return t.checked?1:0},Xe=function(t){return t.checked?t.value:null},Ge=function(t){return t.files.length?null!==t.getAttribute("multiple")?t.files:t.files[0]:null},tn=function(e,n){function o(t){return nn[n.input](i,on(t),n)}var i=P();b(n.inputOptions)||w(n.inputOptions)?(Jt(T()),y(n.inputOptions).then(function(t){e.hideLoading(),o(t)})):"object"===r(n.inputOptions)?o(n.inputOptions):K("Unexpected type of inputOptions! Expected object, Map or Promise, got ".concat(r(n.inputOptions)))},en=function(e,n){var o=e.getInput();at(o),y(n.inputValue).then(function(t){o.value="number"===n.input?parseFloat(t)||0:"".concat(t),rt(o),o.focus(),e.hideLoading()}).catch(function(t){K("Error in inputValue promise: ".concat(t)),o.value="",rt(o),o.focus(),e.hideLoading()})},nn={select:function(t,e,i){function o(t,e,n){var o=document.createElement("option");o.value=n,U(o,e),o.selected=rn(n,i.inputValue),t.appendChild(o)}var r=yt(t,$.select);e.forEach(function(t){var e,n=t[0],t=t[1];Array.isArray(t)?((e=document.createElement("optgroup")).label=n,e.disabled=!1,r.appendChild(e),t.forEach(function(t){return o(e,t[1],t[0])})):o(r,t,n)}),r.focus()},radio:function(t,e,i){var r=yt(t,$.radio);e.forEach(function(t){var e=t[0],n=t[1],o=document.createElement("input"),t=document.createElement("label");o.type="radio",o.name=$.radio,o.value=e,rn(e,i.inputValue)&&(o.checked=!0);e=document.createElement("span");U(e,n),e.className=$.label,t.appendChild(o),t.appendChild(e),r.appendChild(t)});e=r.querySelectorAll("input");e.length&&e[0].focus()}},on=function n(o){var i=[];return"undefined"!=typeof Map&&o instanceof Map?o.forEach(function(t,e){"object"===r(t)&&(t=n(t)),i.push([e,t])}):Object.keys(o).forEach(function(t){var e=o[t];"object"===r(e)&&(e=n(e)),i.push([t,e])}),i},rn=function(t,e){return e&&e.toString()===t.toString()},an=function(t,e,n){var o=function(t,e){var n=t.getInput();if(!n)return null;switch(e.input){case"checkbox":return $e(n);case"radio":return Xe(n);case"file":return Ge(n);default:return e.inputAutoTrim?n.value.trim():n.value}}(t,e);e.inputValidator?sn(t,e,o):t.getInput().checkValidity()?("deny"===n?un:cn)(t,e,o):(t.enableButtons(),t.showValidationMessage(e.validationMessage))},sn=function(e,n,o){e.disableInput(),Promise.resolve().then(function(){return y(n.inputValidator(o,n.validationMessage))}).then(function(t){e.enableButtons(),e.enableInput(),t?e.showValidationMessage(t):cn(e,n,o)})},un=function(e,t,n){t.showLoaderOnDeny&&Jt(L()),t.preDeny?Promise.resolve().then(function(){return y(t.preDeny(n,t.validationMessage))}).then(function(t){!1===t?e.hideLoading():e.closePopup({isDenied:!0,value:void 0===t?n:t})}):e.closePopup({isDenied:!0,value:n})},cn=function(e,t,n){t.showLoaderOnConfirm&&Jt(),t.preConfirm?(e.resetValidationMessage(),Promise.resolve().then(function(){return y(t.preConfirm(n,t.validationMessage))}).then(function(t){wt(S())||!1===t?e.hideLoading():Ie(e,void 0===t?n:t)})):Ie(e,n)},ln=["ArrowRight","ArrowDown","Right","Down"],dn=["ArrowLeft","ArrowUp","Left","Up"],pn=["Escape","Esc"],fn=function(t,e,n){var o=Tt.innerParams.get(t);o&&(o.stopKeydownPropagation&&e.stopPropagation(),"Enter"===e.key?mn(t,e,o):"Tab"===e.key?hn(e,o):-1!==[].concat(ln,dn).indexOf(e.key)?gn(e.key):-1!==pn.indexOf(e.key)&&vn(e,o,n))},mn=function(t,e,n){e.isComposing||e.target&&t.getInput()&&e.target.outerHTML===t.getInput().outerHTML&&-1===["textarea","file"].indexOf(n.input)&&(Ft(),e.preventDefault())},hn=function(t,e){for(var n=t.target,o=R(),i=-1,r=0;r<o.length;r++)if(n===o[r]){i=r;break}t.shiftKey?He(0,i,-1):He(0,i,1),t.stopPropagation(),t.preventDefault()},gn=function(t){-1!==[T(),L(),D()].indexOf(document.activeElement)&&(t=-1!==ln.indexOf(t)?"nextElementSibling":"previousElementSibling",(t=document.activeElement[t])&&t.focus())},vn=function(t,e,n){Z(e.allowEscapeKey)&&(t.preventDefault(),n(Q.esc))},bn=function(e,t,n){t.popup.onclick=function(){var t=Tt.innerParams.get(e);t.showConfirmButton||t.showDenyButton||t.showCancelButton||t.showCloseButton||t.timer||t.input||n(Q.close)}},yn=!1,wn=function(e){e.popup.onmousedown=function(){e.container.onmouseup=function(t){e.container.onmouseup=void 0,t.target===e.container&&(yn=!0)}}},Cn=function(e){e.container.onmousedown=function(){e.popup.onmouseup=function(t){e.popup.onmouseup=void 0,t.target!==e.popup&&!e.popup.contains(t.target)||(yn=!0)}}},kn=function(n,o,i){o.container.onclick=function(t){var e=Tt.innerParams.get(n);yn?yn=!1:t.target===o.container&&Z(e.allowOutsideClick)&&i(Q.backdrop)}};function An(t,e){var n=function(t){t="string"==typeof t.template?document.querySelector(t.template):t.template;if(!t)return{};t=t.content||t;return We(t),u(Re(t),Ne(t),Ue(t),Fe(t),_e(t),ze(t,Ve))}(t);return(n=u({},se,e,n,t)).showClass=u({},se.showClass,n.showClass),n.hideClass=u({},se.hideClass,n.hideClass),!1===t.animation&&(n.showClass={popup:"swal2-noanimation",backdrop:"swal2-noanimation"},n.hideClass={}),n}function xn(a,s,u){return new Promise(function(t){function e(t){a.closePopup({isDismissed:!0,dismiss:t})}var n,o,i,r;Ce.swalPromiseResolve.set(a,t),s.confirmButton.onclick=function(){return e=u,(t=a).disableButtons(),void(e.input?an(t,e,"confirm"):cn(t,e,!0));var t,e},s.denyButton.onclick=function(){return e=u,(t=a).disableButtons(),void(e.returnInputValueOnDeny?an(t,e,"deny"):un(t,e,!1));var t,e},s.cancelButton.onclick=function(){return t=e,a.disableButtons(),void t(Q.cancel);var t},s.closeButton.onclick=function(){return e(Q.close)},n=a,r=s,t=e,Tt.innerParams.get(n).toast?bn(n,r,t):(wn(r),Cn(r),kn(n,r,t)),o=a,r=u,i=e,(t=te).keydownTarget&&t.keydownHandlerAdded&&(t.keydownTarget.removeEventListener("keydown",t.keydownHandler,{capture:t.keydownListenerCapture}),t.keydownHandlerAdded=!1),r.toast||(t.keydownHandler=function(t){return fn(o,t,i)},t.keydownTarget=r.keydownListenerCapture?window:A(),t.keydownListenerCapture=r.keydownListenerCapture,t.keydownTarget.addEventListener("keydown",t.keydownHandler,{capture:t.keydownListenerCapture}),t.keydownHandlerAdded=!0),r=a,"select"===(t=u).input||"radio"===t.input?tn(r,t):-1!==["text","email","number","tel","textarea"].indexOf(t.input)&&(b(t.inputValue)||w(t.inputValue))&&en(r,t),je(u),Pn(te,u,e),On(s,u),setTimeout(function(){s.container.scrollTop=0})})}function Bn(t){var e={popup:A(),container:k(),content:P(),actions:j(),confirmButton:T(),denyButton:L(),cancelButton:D(),loader:q(),closeButton:V(),validationMessage:S(),progressSteps:n()};return Tt.domCache.set(t,e),e}var Pn=function(t,e,n){var o=H();at(o),e.timer&&(t.timeout=new Le(function(){n("timer"),delete t.timeout},e.timer),e.timerProgressBar&&(rt(o),setTimeout(function(){t.timeout&&t.timeout.running&&dt(e.timer)})))},On=function(t,e){if(!e.toast)return Z(e.allowEnterKey)?void(En(t,e)||He(0,-1,1)):Sn()},En=function(t,e){return e.focusDeny&&wt(t.denyButton)?(t.denyButton.focus(),!0):e.focusCancel&&wt(t.cancelButton)?(t.cancelButton.focus(),!0):!(!e.focusConfirm||!wt(t.confirmButton))&&(t.confirmButton.focus(),!0)},Sn=function(){document.activeElement&&"function"==typeof document.activeElement.blur&&document.activeElement.blur()};function Tn(t){"function"==typeof t.didDestroy?t.didDestroy():"function"==typeof t.onDestroy&&t.onDestroy()}function Ln(t){delete t.params,delete te.keydownHandler,delete te.keydownTarget,Dn(Tt),Dn(Ce)}var qn,Dn=function(t){for(var e in t)t[e]=new WeakMap},J=Object.freeze({hideLoading:pe,disableLoading:pe,getInput:function(t){var e=Tt.innerParams.get(t||this);return(t=Tt.domCache.get(t||this))?et(t.content,e.input):null},close:Ae,closePopup:Ae,closeModal:Ae,closeToast:Ae,enableButtons:function(){Se(this,["confirmButton","denyButton","cancelButton"],!1)},disableButtons:function(){Se(this,["confirmButton","denyButton","cancelButton"],!0)},enableInput:function(){return Te(this.getInput(),!1)},disableInput:function(){return Te(this.getInput(),!0)},showValidationMessage:function(t){var e=Tt.domCache.get(this),n=Tt.innerParams.get(this);U(e.validationMessage,t),e.validationMessage.className=$["validation-message"],n.customClass&&n.customClass.validationMessage&&vt(e.validationMessage,n.customClass.validationMessage),rt(e.validationMessage),(e=this.getInput())&&(e.setAttribute("aria-invalid",!0),e.setAttribute("aria-describedBy",$["validation-message"]),nt(e),vt(e,$.inputerror))},resetValidationMessage:function(){var t=Tt.domCache.get(this);t.validationMessage&&at(t.validationMessage),(t=this.getInput())&&(t.removeAttribute("aria-invalid"),t.removeAttribute("aria-describedBy"),bt(t,$.inputerror))},getProgressSteps:function(){return Tt.domCache.get(this).progressSteps},_main:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return ae(u({},e,t)),te.currentInstance&&te.currentInstance._destroy(),te.currentInstance=this,De(t=An(t,e)),Object.freeze(t),te.timeout&&(te.timeout.stop(),delete te.timeout),clearTimeout(te.restoreFocusTimeout),e=Bn(this),Ut(this,t),Tt.innerParams.set(this,t),xn(this,e,t)},update:function(e){var t=A(),n=Tt.innerParams.get(this);if(!t||F(t,n.hideClass.popup))return W("You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup.");var o={};Object.keys(e).forEach(function(t){Mn.isUpdatableParameter(t)?o[t]=e[t]:W('Invalid parameter to update: "'.concat(t,'". Updatable params are listed here: https://github.com/sweetalert2/sweetalert2/blob/master/src/utils/params.js\n\nIf you think this parameter should be updatable, request it here: https://github.com/sweetalert2/sweetalert2/issues/new?template=02_feature_request.md'))}),n=u({},n,o),Ut(this,n),Tt.innerParams.set(this,n),Object.defineProperties(this,{params:{value:u({},this.params,e),writable:!1,enumerable:!0}})},_destroy:function(){var t=Tt.domCache.get(this),e=Tt.innerParams.get(this);e&&(t.popup&&te.swalCloseEventFinishedCallback&&(te.swalCloseEventFinishedCallback(),delete te.swalCloseEventFinishedCallback),te.deferDisposalTimer&&(clearTimeout(te.deferDisposalTimer),delete te.deferDisposalTimer),Tn(e),Ln(this))}}),jn=function(){function i(){if(a(this,i),"undefined"!=typeof window){"undefined"==typeof Promise&&K("This package requires a Promise library, please include a shim to enable it in this browser (See: https://github.com/sweetalert2/sweetalert2/wiki/Migration-from-SweetAlert-to-SweetAlert2#1-ie-support)"),qn=this;for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];var o=Object.freeze(this.constructor.argsToParams(e));Object.defineProperties(this,{params:{value:o,writable:!1,enumerable:!0,configurable:!0}});o=this._main(this.params);Tt.promise.set(this,o)}}return s(i,[{key:"then",value:function(t){return Tt.promise.get(this).then(t)}},{key:"finally",value:function(t){return Tt.promise.get(this).finally(t)}}]),i}();u(jn.prototype,J),u(jn,de),Object.keys(J).forEach(function(t){jn[t]=function(){if(qn)return qn[t].apply(qn,arguments)}}),jn.DismissReason=Q,jn.version="10.16.9";var Mn=jn;return Mn.default=Mn}),void 0!==this&&this.Sweetalert2&&(this.swal=this.sweetAlert=this.Swal=this.SweetAlert=this.Sweetalert2);
"undefined"!=typeof document&&function(e,t){var n=e.createElement("style");if(e.getElementsByTagName("head")[0].appendChild(n),n.styleSheet)n.styleSheet.disabled||(n.styleSheet.cssText=t);else try{n.innerHTML=t}catch(e){n.innerText=t}}(document,".swal2-popup.swal2-toast{flex-direction:column;align-items:stretch;width:auto;padding:1.25em;overflow-y:hidden;background:#fff;box-shadow:0 0 .625em #d9d9d9}.swal2-popup.swal2-toast .swal2-header{flex-direction:row;padding:0}.swal2-popup.swal2-toast .swal2-title{flex-grow:1;justify-content:flex-start;margin:0 .625em;font-size:1em}.swal2-popup.swal2-toast .swal2-loading{justify-content:center}.swal2-popup.swal2-toast .swal2-input{height:2em;margin:.3125em auto;font-size:1em}.swal2-popup.swal2-toast .swal2-validation-message{font-size:1em}.swal2-popup.swal2-toast .swal2-footer{margin:.5em 0 0;padding:.5em 0 0;font-size:.8em}.swal2-popup.swal2-toast .swal2-close{position:static;width:.8em;height:.8em;line-height:.8}.swal2-popup.swal2-toast .swal2-content{justify-content:flex-start;margin:0 .625em;padding:0;font-size:1em;text-align:initial}.swal2-popup.swal2-toast .swal2-html-container{padding:.625em 0 0}.swal2-popup.swal2-toast .swal2-html-container:empty{padding:0}.swal2-popup.swal2-toast .swal2-icon{width:2em;min-width:2em;height:2em;margin:0 .5em 0 0}.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:1.8em;font-weight:700}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{font-size:.25em}}.swal2-popup.swal2-toast .swal2-icon.swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line]{top:.875em;width:1.375em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:.3125em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:.3125em}.swal2-popup.swal2-toast .swal2-actions{flex:1;flex-basis:auto!important;align-self:stretch;width:auto;height:2.2em;height:auto;margin:0 .3125em;margin-top:.3125em;padding:0}.swal2-popup.swal2-toast .swal2-styled{margin:.125em .3125em;padding:.3125em .625em;font-size:1em}.swal2-popup.swal2-toast .swal2-styled:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(100,150,200,.5)}.swal2-popup.swal2-toast .swal2-success{border-color:#a5dc86}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line]{position:absolute;width:1.6em;height:3em;transform:rotate(45deg);border-radius:50%}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.8em;left:-.5em;transform:rotate(-45deg);transform-origin:2em 2em;border-radius:4em 0 0 4em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.25em;left:.9375em;transform-origin:0 1.5em;border-radius:0 4em 4em 0}.swal2-popup.swal2-toast .swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-success .swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line]{height:.3125em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-toast-animate-success-line-tip .75s;animation:swal2-toast-animate-success-line-tip .75s}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-toast-animate-success-line-long .75s;animation:swal2-toast-animate-success-line-long .75s}.swal2-popup.swal2-toast.swal2-show{-webkit-animation:swal2-toast-show .5s;animation:swal2-toast-show .5s}.swal2-popup.swal2-toast.swal2-hide{-webkit-animation:swal2-toast-hide .1s forwards;animation:swal2-toast-hide .1s forwards}.swal2-container{display:flex;position:fixed;z-index:1060;top:0;right:0;bottom:0;left:0;flex-direction:row;align-items:center;justify-content:center;padding:.625em;overflow-x:hidden;transition:background-color .1s;-webkit-overflow-scrolling:touch}.swal2-container.swal2-backdrop-show,.swal2-container.swal2-noanimation{background:rgba(0,0,0,.4)}.swal2-container.swal2-backdrop-hide{background:0 0!important}.swal2-container.swal2-top{align-items:flex-start}.swal2-container.swal2-top-left,.swal2-container.swal2-top-start{align-items:flex-start;justify-content:flex-start}.swal2-container.swal2-top-end,.swal2-container.swal2-top-right{align-items:flex-start;justify-content:flex-end}.swal2-container.swal2-center{align-items:center}.swal2-container.swal2-center-left,.swal2-container.swal2-center-start{align-items:center;justify-content:flex-start}.swal2-container.swal2-center-end,.swal2-container.swal2-center-right{align-items:center;justify-content:flex-end}.swal2-container.swal2-bottom{align-items:flex-end}.swal2-container.swal2-bottom-left,.swal2-container.swal2-bottom-start{align-items:flex-end;justify-content:flex-start}.swal2-container.swal2-bottom-end,.swal2-container.swal2-bottom-right{align-items:flex-end;justify-content:flex-end}.swal2-container.swal2-bottom-end>:first-child,.swal2-container.swal2-bottom-left>:first-child,.swal2-container.swal2-bottom-right>:first-child,.swal2-container.swal2-bottom-start>:first-child,.swal2-container.swal2-bottom>:first-child{margin-top:auto}.swal2-container.swal2-grow-fullscreen>.swal2-modal{display:flex!important;flex:1;align-self:stretch;justify-content:center}.swal2-container.swal2-grow-row>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-grow-column{flex:1;flex-direction:column}.swal2-container.swal2-grow-column.swal2-bottom,.swal2-container.swal2-grow-column.swal2-center,.swal2-container.swal2-grow-column.swal2-top{align-items:center}.swal2-container.swal2-grow-column.swal2-bottom-left,.swal2-container.swal2-grow-column.swal2-bottom-start,.swal2-container.swal2-grow-column.swal2-center-left,.swal2-container.swal2-grow-column.swal2-center-start,.swal2-container.swal2-grow-column.swal2-top-left,.swal2-container.swal2-grow-column.swal2-top-start{align-items:flex-start}.swal2-container.swal2-grow-column.swal2-bottom-end,.swal2-container.swal2-grow-column.swal2-bottom-right,.swal2-container.swal2-grow-column.swal2-center-end,.swal2-container.swal2-grow-column.swal2-center-right,.swal2-container.swal2-grow-column.swal2-top-end,.swal2-container.swal2-grow-column.swal2-top-right{align-items:flex-end}.swal2-container.swal2-grow-column>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-no-transition{transition:none!important}.swal2-container:not(.swal2-top):not(.swal2-top-start):not(.swal2-top-end):not(.swal2-top-left):not(.swal2-top-right):not(.swal2-center-start):not(.swal2-center-end):not(.swal2-center-left):not(.swal2-center-right):not(.swal2-bottom):not(.swal2-bottom-start):not(.swal2-bottom-end):not(.swal2-bottom-left):not(.swal2-bottom-right):not(.swal2-grow-fullscreen)>.swal2-modal{margin:auto}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-container .swal2-modal{margin:0!important}}.swal2-popup{display:none;position:relative;box-sizing:border-box;flex-direction:column;justify-content:center;width:32em;max-width:100%;padding:1.25em;border:none;border-radius:5px;background:#fff;font-family:inherit;font-size:1rem}.swal2-popup:focus{outline:0}.swal2-popup.swal2-loading{overflow-y:hidden}.swal2-header{display:flex;flex-direction:column;align-items:center;padding:0 1.8em}.swal2-title{position:relative;max-width:100%;margin:0 0 .4em;padding:0;color:#595959;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}.swal2-actions{display:flex;z-index:1;box-sizing:border-box;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;margin:1.25em auto 0;padding:0}.swal2-actions:not(.swal2-loading) .swal2-styled[disabled]{opacity:.4}.swal2-actions:not(.swal2-loading) .swal2-styled:hover{background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1))}.swal2-actions:not(.swal2-loading) .swal2-styled:active{background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2))}.swal2-loader{display:none;align-items:center;justify-content:center;width:2.2em;height:2.2em;margin:0 1.875em;-webkit-animation:swal2-rotate-loading 1.5s linear 0s infinite normal;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border-width:.25em;border-style:solid;border-radius:100%;border-color:#2778c4 transparent #2778c4 transparent}.swal2-styled{margin:.3125em;padding:.625em 1.1em;box-shadow:none;font-weight:500}.swal2-styled:not([disabled]){cursor:pointer}.swal2-styled.swal2-confirm{border:0;border-radius:.25em;background:initial;background-color:#2778c4;color:#fff;font-size:1em}.swal2-styled.swal2-deny{border:0;border-radius:.25em;background:initial;background-color:#d14529;color:#fff;font-size:1em}.swal2-styled.swal2-cancel{border:0;border-radius:.25em;background:initial;background-color:#757575;color:#fff;font-size:1em}.swal2-styled:focus{outline:0;box-shadow:0 0 0 3px rgba(100,150,200,.5)}.swal2-styled::-moz-focus-inner{border:0}.swal2-footer{justify-content:center;margin:1.25em 0 0;padding:1em 0 0;border-top:1px solid #eee;color:#545454;font-size:1em}.swal2-timer-progress-bar-container{position:absolute;right:0;bottom:0;left:0;height:.25em;overflow:hidden;border-bottom-right-radius:5px;border-bottom-left-radius:5px}.swal2-timer-progress-bar{width:100%;height:.25em;background:rgba(0,0,0,.2)}.swal2-image{max-width:100%;margin:1.25em auto}.swal2-close{position:absolute;z-index:2;top:0;right:0;align-items:center;justify-content:center;width:1.2em;height:1.2em;padding:0;overflow:hidden;transition:color .1s ease-out;border:none;border-radius:5px;background:0 0;color:#ccc;font-family:serif;font-size:2.5em;line-height:1.2;cursor:pointer}.swal2-close:hover{transform:none;background:0 0;color:#f27474}.swal2-close:focus{outline:0;box-shadow:inset 0 0 0 3px rgba(100,150,200,.5)}.swal2-close::-moz-focus-inner{border:0}.swal2-content{z-index:1;justify-content:center;margin:0;padding:0 1.6em;color:#545454;font-size:1.125em;font-weight:400;line-height:normal;text-align:center;word-wrap:break-word}.swal2-checkbox,.swal2-file,.swal2-input,.swal2-radio,.swal2-select,.swal2-textarea{margin:1em auto}.swal2-file,.swal2-input,.swal2-textarea{box-sizing:border-box;width:100%;transition:border-color .3s,box-shadow .3s;border:1px solid #d9d9d9;border-radius:.1875em;background:inherit;box-shadow:inset 0 1px 1px rgba(0,0,0,.06);color:inherit;font-size:1.125em}.swal2-file.swal2-inputerror,.swal2-input.swal2-inputerror,.swal2-textarea.swal2-inputerror{border-color:#f27474!important;box-shadow:0 0 2px #f27474!important}.swal2-file:focus,.swal2-input:focus,.swal2-textarea:focus{border:1px solid #b4dbed;outline:0;box-shadow:0 0 0 3px rgba(100,150,200,.5)}.swal2-file::-moz-placeholder,.swal2-input::-moz-placeholder,.swal2-textarea::-moz-placeholder{color:#ccc}.swal2-file:-ms-input-placeholder,.swal2-input:-ms-input-placeholder,.swal2-textarea:-ms-input-placeholder{color:#ccc}.swal2-file::placeholder,.swal2-input::placeholder,.swal2-textarea::placeholder{color:#ccc}.swal2-range{margin:1em auto;background:#fff}.swal2-range input{width:80%}.swal2-range output{width:20%;color:inherit;font-weight:600;text-align:center}.swal2-range input,.swal2-range output{height:2.625em;padding:0;font-size:1.125em;line-height:2.625em}.swal2-input{height:2.625em;padding:0 .75em}.swal2-input[type=number]{max-width:10em}.swal2-file{background:inherit;font-size:1.125em}.swal2-textarea{height:6.75em;padding:.75em}.swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;background:inherit;color:inherit;font-size:1.125em}.swal2-checkbox,.swal2-radio{align-items:center;justify-content:center;background:#fff;color:inherit}.swal2-checkbox label,.swal2-radio label{margin:0 .6em;font-size:1.125em}.swal2-checkbox input,.swal2-radio input{flex-shrink:0;margin:0 .4em}.swal2-input-label{display:flex;justify-content:center;margin:1em auto}.swal2-validation-message{align-items:center;justify-content:center;margin:0 -2.7em;padding:.625em;overflow:hidden;background:#f0f0f0;color:#666;font-size:1em;font-weight:300}.swal2-validation-message::before{content:\"!\";display:inline-block;width:1.5em;min-width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center}.swal2-icon{position:relative;box-sizing:content-box;justify-content:center;width:5em;height:5em;margin:1.25em auto 1.875em;border:.25em solid transparent;border-radius:50%;border-color:#000;font-family:inherit;line-height:5em;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:3.75em}.swal2-icon.swal2-error{border-color:#f27474;color:#f27474}.swal2-icon.swal2-error .swal2-x-mark{position:relative;flex-grow:1}.swal2-icon.swal2-error [class^=swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:1.0625em;transform:rotate(45deg)}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:1em;transform:rotate(-45deg)}.swal2-icon.swal2-error.swal2-icon-show{-webkit-animation:swal2-animate-error-icon .5s;animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-error.swal2-icon-show .swal2-x-mark{-webkit-animation:swal2-animate-error-x-mark .5s;animation:swal2-animate-error-x-mark .5s}.swal2-icon.swal2-warning{border-color:#facea8;color:#f8bb86}.swal2-icon.swal2-info{border-color:#9de0f6;color:#3fc3ee}.swal2-icon.swal2-question{border-color:#c9dae1;color:#87adbd}.swal2-icon.swal2-success{border-color:#a5dc86;color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;transform:rotate(45deg);border-radius:50%}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.4375em;left:-2.0635em;transform:rotate(-45deg);transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.6875em;left:1.875em;transform:rotate(-45deg);transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}.swal2-icon.swal2-success .swal2-success-ring{position:absolute;z-index:2;top:-.25em;left:-.25em;box-sizing:content-box;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%}.swal2-icon.swal2-success .swal2-success-fix{position:absolute;z-index:1;top:.5em;left:1.625em;width:.4375em;height:5.625em;transform:rotate(-45deg)}.swal2-icon.swal2-success [class^=swal2-success-line]{display:block;position:absolute;z-index:2;height:.3125em;border-radius:.125em;background-color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-line][class$=tip]{top:2.875em;left:.8125em;width:1.5625em;transform:rotate(45deg)}.swal2-icon.swal2-success [class^=swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;transform:rotate(-45deg)}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-animate-success-line-tip .75s;animation:swal2-animate-success-line-tip .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-animate-success-line-long .75s;animation:swal2-animate-success-line-long .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-circular-line-right{-webkit-animation:swal2-rotate-success-circular-line 4.25s ease-in;animation:swal2-rotate-success-circular-line 4.25s ease-in}.swal2-progress-steps{flex-wrap:wrap;align-items:center;max-width:100%;margin:0 0 1.25em;padding:0;background:inherit;font-weight:600}.swal2-progress-steps li{display:inline-block;position:relative}.swal2-progress-steps .swal2-progress-step{z-index:20;flex-shrink:0;width:2em;height:2em;border-radius:2em;background:#2778c4;color:#fff;line-height:2em;text-align:center}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step{background:#2778c4}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step{background:#add8e6;color:#fff}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step-line{background:#add8e6}.swal2-progress-steps .swal2-progress-step-line{z-index:10;flex-shrink:0;width:2.5em;height:.4em;margin:0 -1px;background:#2778c4}[class^=swal2]{-webkit-tap-highlight-color:transparent}.swal2-show{-webkit-animation:swal2-show .3s;animation:swal2-show .3s}.swal2-hide{-webkit-animation:swal2-hide .15s forwards;animation:swal2-hide .15s forwards}.swal2-noanimation{transition:none}.swal2-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}.swal2-rtl .swal2-close{right:auto;left:0}.swal2-rtl .swal2-timer-progress-bar{right:0;left:auto}@supports (-ms-accelerator:true){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@-webkit-keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@-webkit-keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@-webkit-keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@-webkit-keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@-webkit-keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@-webkit-keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@-webkit-keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@-webkit-keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@-webkit-keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@-webkit-keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@-webkit-keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@-webkit-keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow:hidden}body.swal2-height-auto{height:auto!important}body.swal2-no-backdrop .swal2-container{top:auto;right:auto;bottom:auto;left:auto;max-width:calc(100% - .625em * 2);background-color:transparent!important}body.swal2-no-backdrop .swal2-container>.swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}body.swal2-no-backdrop .swal2-container.swal2-top{top:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-top-left,body.swal2-no-backdrop .swal2-container.swal2-top-start{top:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-top-end,body.swal2-no-backdrop .swal2-container.swal2-top-right{top:0;right:0}body.swal2-no-backdrop .swal2-container.swal2-center{top:50%;left:50%;transform:translate(-50%,-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-left,body.swal2-no-backdrop .swal2-container.swal2-center-start{top:50%;left:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-end,body.swal2-no-backdrop .swal2-container.swal2-center-right{top:50%;right:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom{bottom:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom-left,body.swal2-no-backdrop .swal2-container.swal2-bottom-start{bottom:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-bottom-end,body.swal2-no-backdrop .swal2-container.swal2-bottom-right{right:0;bottom:0}@media print{body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow-y:scroll!important}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown)>[aria-hidden=true]{display:none}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown) .swal2-container{position:static!important}}body.swal2-toast-shown .swal2-container{background-color:transparent}body.swal2-toast-shown .swal2-container.swal2-top{top:0;right:auto;bottom:auto;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-top-end,body.swal2-toast-shown .swal2-container.swal2-top-right{top:0;right:0;bottom:auto;left:auto}body.swal2-toast-shown .swal2-container.swal2-top-left,body.swal2-toast-shown .swal2-container.swal2-top-start{top:0;right:auto;bottom:auto;left:0}body.swal2-toast-shown .swal2-container.swal2-center-left,body.swal2-toast-shown .swal2-container.swal2-center-start{top:50%;right:auto;bottom:auto;left:0;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-center{top:50%;right:auto;bottom:auto;left:50%;transform:translate(-50%,-50%)}body.swal2-toast-shown .swal2-container.swal2-center-end,body.swal2-toast-shown .swal2-container.swal2-center-right{top:50%;right:0;bottom:auto;left:auto;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-left,body.swal2-toast-shown .swal2-container.swal2-bottom-start{top:auto;right:auto;bottom:0;left:0}body.swal2-toast-shown .swal2-container.swal2-bottom{top:auto;right:auto;bottom:0;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-end,body.swal2-toast-shown .swal2-container.swal2-bottom-right{top:auto;right:0;bottom:0;left:auto}");
/*!
 * Cropper.js v1.5.12
 * https://fengyuanchen.github.io/cropperjs
 *
 * Copyright 2015-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2021-06-12T08:00:17.411Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Cropper = factory());
}(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  var WINDOW = IS_BROWSER ? window : {};
  var IS_TOUCH_DEVICE = IS_BROWSER && WINDOW.document.documentElement ? 'ontouchstart' in WINDOW.document.documentElement : false;
  var HAS_POINTER_EVENT = IS_BROWSER ? 'PointerEvent' in WINDOW : false;
  var NAMESPACE = 'cropper'; // Actions

  var ACTION_ALL = 'all';
  var ACTION_CROP = 'crop';
  var ACTION_MOVE = 'move';
  var ACTION_ZOOM = 'zoom';
  var ACTION_EAST = 'e';
  var ACTION_WEST = 'w';
  var ACTION_SOUTH = 's';
  var ACTION_NORTH = 'n';
  var ACTION_NORTH_EAST = 'ne';
  var ACTION_NORTH_WEST = 'nw';
  var ACTION_SOUTH_EAST = 'se';
  var ACTION_SOUTH_WEST = 'sw'; // Classes

  var CLASS_CROP = "".concat(NAMESPACE, "-crop");
  var CLASS_DISABLED = "".concat(NAMESPACE, "-disabled");
  var CLASS_HIDDEN = "".concat(NAMESPACE, "-hidden");
  var CLASS_HIDE = "".concat(NAMESPACE, "-hide");
  var CLASS_INVISIBLE = "".concat(NAMESPACE, "-invisible");
  var CLASS_MODAL = "".concat(NAMESPACE, "-modal");
  var CLASS_MOVE = "".concat(NAMESPACE, "-move"); // Data keys

  var DATA_ACTION = "".concat(NAMESPACE, "Action");
  var DATA_PREVIEW = "".concat(NAMESPACE, "Preview"); // Drag modes

  var DRAG_MODE_CROP = 'crop';
  var DRAG_MODE_MOVE = 'move';
  var DRAG_MODE_NONE = 'none'; // Events

  var EVENT_CROP = 'crop';
  var EVENT_CROP_END = 'cropend';
  var EVENT_CROP_MOVE = 'cropmove';
  var EVENT_CROP_START = 'cropstart';
  var EVENT_DBLCLICK = 'dblclick';
  var EVENT_TOUCH_START = IS_TOUCH_DEVICE ? 'touchstart' : 'mousedown';
  var EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? 'touchmove' : 'mousemove';
  var EVENT_TOUCH_END = IS_TOUCH_DEVICE ? 'touchend touchcancel' : 'mouseup';
  var EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? 'pointerdown' : EVENT_TOUCH_START;
  var EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? 'pointermove' : EVENT_TOUCH_MOVE;
  var EVENT_POINTER_UP = HAS_POINTER_EVENT ? 'pointerup pointercancel' : EVENT_TOUCH_END;
  var EVENT_READY = 'ready';
  var EVENT_RESIZE = 'resize';
  var EVENT_WHEEL = 'wheel';
  var EVENT_ZOOM = 'zoom'; // Mime types

  var MIME_TYPE_JPEG = 'image/jpeg'; // RegExps

  var REGEXP_ACTIONS = /^e|w|s|n|se|sw|ne|nw|all|crop|move|zoom$/;
  var REGEXP_DATA_URL = /^data:/;
  var REGEXP_DATA_URL_JPEG = /^data:image\/jpeg;base64,/;
  var REGEXP_TAG_NAME = /^img|canvas$/i; // Misc
  // Inspired by the default width and height of a canvas element.

  var MIN_CONTAINER_WIDTH = 200;
  var MIN_CONTAINER_HEIGHT = 100;

  var DEFAULTS = {
    // Define the view mode of the cropper
    viewMode: 0,
    // 0, 1, 2, 3
    // Define the dragging mode of the cropper
    dragMode: DRAG_MODE_CROP,
    // 'crop', 'move' or 'none'
    // Define the initial aspect ratio of the crop box
    initialAspectRatio: NaN,
    // Define the aspect ratio of the crop box
    aspectRatio: NaN,
    // An object with the previous cropping result data
    data: null,
    // A selector for adding extra containers to preview
    preview: '',
    // Re-render the cropper when resize the window
    responsive: true,
    // Restore the cropped area after resize the window
    restore: true,
    // Check if the current image is a cross-origin image
    checkCrossOrigin: true,
    // Check the current image's Exif Orientation information
    checkOrientation: true,
    // Show the black modal
    modal: true,
    // Show the dashed lines for guiding
    guides: true,
    // Show the center indicator for guiding
    center: true,
    // Show the white modal to highlight the crop box
    highlight: true,
    // Show the grid background
    background: true,
    // Enable to crop the image automatically when initialize
    autoCrop: true,
    // Define the percentage of automatic cropping area when initializes
    autoCropArea: 0.8,
    // Enable to move the image
    movable: true,
    // Enable to rotate the image
    rotatable: true,
    // Enable to scale the image
    scalable: true,
    // Enable to zoom the image
    zoomable: true,
    // Enable to zoom the image by dragging touch
    zoomOnTouch: true,
    // Enable to zoom the image by wheeling mouse
    zoomOnWheel: true,
    // Define zoom ratio when zoom the image by wheeling mouse
    wheelZoomRatio: 0.1,
    // Enable to move the crop box
    cropBoxMovable: true,
    // Enable to resize the crop box
    cropBoxResizable: true,
    // Toggle drag mode between "crop" and "move" when click twice on the cropper
    toggleDragModeOnDblclick: true,
    // Size limitation
    minCanvasWidth: 0,
    minCanvasHeight: 0,
    minCropBoxWidth: 0,
    minCropBoxHeight: 0,
    minContainerWidth: MIN_CONTAINER_WIDTH,
    minContainerHeight: MIN_CONTAINER_HEIGHT,
    // Shortcuts of events
    ready: null,
    cropstart: null,
    cropmove: null,
    cropend: null,
    crop: null,
    zoom: null
  };

  var TEMPLATE = '<div class="cropper-container" touch-action="none">' + '<div class="cropper-wrap-box">' + '<div class="cropper-canvas"></div>' + '</div>' + '<div class="cropper-drag-box"></div>' + '<div class="cropper-crop-box">' + '<span class="cropper-view-box"></span>' + '<span class="cropper-dashed dashed-h"></span>' + '<span class="cropper-dashed dashed-v"></span>' + '<span class="cropper-center"></span>' + '<span class="cropper-face"></span>' + '<span class="cropper-line line-e" data-cropper-action="e"></span>' + '<span class="cropper-line line-n" data-cropper-action="n"></span>' + '<span class="cropper-line line-w" data-cropper-action="w"></span>' + '<span class="cropper-line line-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-e" data-cropper-action="e"></span>' + '<span class="cropper-point point-n" data-cropper-action="n"></span>' + '<span class="cropper-point point-w" data-cropper-action="w"></span>' + '<span class="cropper-point point-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-ne" data-cropper-action="ne"></span>' + '<span class="cropper-point point-nw" data-cropper-action="nw"></span>' + '<span class="cropper-point point-sw" data-cropper-action="sw"></span>' + '<span class="cropper-point point-se" data-cropper-action="se"></span>' + '</div>' + '</div>';

  /**
   * Check if the given value is not a number.
   */

  var isNaN = Number.isNaN || WINDOW.isNaN;
  /**
   * Check if the given value is a number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a number, else `false`.
   */

  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }
  /**
   * Check if the given value is a positive number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a positive number, else `false`.
   */

  var isPositiveNumber = function isPositiveNumber(value) {
    return value > 0 && value < Infinity;
  };
  /**
   * Check if the given value is undefined.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
   */

  function isUndefined(value) {
    return typeof value === 'undefined';
  }
  /**
   * Check if the given value is an object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is an object, else `false`.
   */

  function isObject(value) {
    return _typeof(value) === 'object' && value !== null;
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  /**
   * Check if the given value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
   */

  function isPlainObject(value) {
    if (!isObject(value)) {
      return false;
    }

    try {
      var _constructor = value.constructor;
      var prototype = _constructor.prototype;
      return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (error) {
      return false;
    }
  }
  /**
   * Check if the given value is a function.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a function, else `false`.
   */

  function isFunction(value) {
    return typeof value === 'function';
  }
  var slice = Array.prototype.slice;
  /**
   * Convert array-like or iterable object to an array.
   * @param {*} value - The value to convert.
   * @returns {Array} Returns a new array.
   */

  function toArray(value) {
    return Array.from ? Array.from(value) : slice.call(value);
  }
  /**
   * Iterate the given data.
   * @param {*} data - The data to iterate.
   * @param {Function} callback - The process function for each element.
   * @returns {*} The original data.
   */

  function forEach(data, callback) {
    if (data && isFunction(callback)) {
      if (Array.isArray(data) || isNumber(data.length)
      /* array-like */
      ) {
          toArray(data).forEach(function (value, key) {
            callback.call(data, value, key, data);
          });
        } else if (isObject(data)) {
        Object.keys(data).forEach(function (key) {
          callback.call(data, data[key], key, data);
        });
      }
    }

    return data;
  }
  /**
   * Extend the given object.
   * @param {*} target - The target object to extend.
   * @param {*} args - The rest objects for merging to the target object.
   * @returns {Object} The extended object.
   */

  var assign = Object.assign || function assign(target) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isObject(target) && args.length > 0) {
      args.forEach(function (arg) {
        if (isObject(arg)) {
          Object.keys(arg).forEach(function (key) {
            target[key] = arg[key];
          });
        }
      });
    }

    return target;
  };
  var REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;
  /**
   * Normalize decimal number.
   * Check out {@link https://0.30000000000000004.com/}
   * @param {number} value - The value to normalize.
   * @param {number} [times=100000000000] - The times for normalizing.
   * @returns {number} Returns the normalized number.
   */

  function normalizeDecimalNumber(value) {
    var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100000000000;
    return REGEXP_DECIMALS.test(value) ? Math.round(value * times) / times : value;
  }
  var REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop$/;
  /**
   * Apply styles to the given element.
   * @param {Element} element - The target element.
   * @param {Object} styles - The styles for applying.
   */

  function setStyle(element, styles) {
    var style = element.style;
    forEach(styles, function (value, property) {
      if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
        value = "".concat(value, "px");
      }

      style[property] = value;
    });
  }
  /**
   * Check if the given element has a special class.
   * @param {Element} element - The element to check.
   * @param {string} value - The class to search.
   * @returns {boolean} Returns `true` if the special class was found.
   */

  function hasClass(element, value) {
    return element.classList ? element.classList.contains(value) : element.className.indexOf(value) > -1;
  }
  /**
   * Add classes to the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be added.
   */

  function addClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        addClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.add(value);
      return;
    }

    var className = element.className.trim();

    if (!className) {
      element.className = value;
    } else if (className.indexOf(value) < 0) {
      element.className = "".concat(className, " ").concat(value);
    }
  }
  /**
   * Remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be removed.
   */

  function removeClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        removeClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.remove(value);
      return;
    }

    if (element.className.indexOf(value) >= 0) {
      element.className = element.className.replace(value, '');
    }
  }
  /**
   * Add or remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be toggled.
   * @param {boolean} added - Add only.
   */

  function toggleClass(element, value, added) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        toggleClass(elem, value, added);
      });
      return;
    } // IE10-11 doesn't support the second parameter of `classList.toggle`


    if (added) {
      addClass(element, value);
    } else {
      removeClass(element, value);
    }
  }
  var REGEXP_CAMEL_CASE = /([a-z\d])([A-Z])/g;
  /**
   * Transform the given string from camelCase to kebab-case
   * @param {string} value - The value to transform.
   * @returns {string} The transformed value.
   */

  function toParamCase(value) {
    return value.replace(REGEXP_CAMEL_CASE, '$1-$2').toLowerCase();
  }
  /**
   * Get data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to get.
   * @returns {string} The data value.
   */

  function getData(element, name) {
    if (isObject(element[name])) {
      return element[name];
    }

    if (element.dataset) {
      return element.dataset[name];
    }

    return element.getAttribute("data-".concat(toParamCase(name)));
  }
  /**
   * Set data to the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to set.
   * @param {string} data - The data value.
   */

  function setData(element, name, data) {
    if (isObject(data)) {
      element[name] = data;
    } else if (element.dataset) {
      element.dataset[name] = data;
    } else {
      element.setAttribute("data-".concat(toParamCase(name)), data);
    }
  }
  /**
   * Remove data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to remove.
   */

  function removeData(element, name) {
    if (isObject(element[name])) {
      try {
        delete element[name];
      } catch (error) {
        element[name] = undefined;
      }
    } else if (element.dataset) {
      // #128 Safari not allows to delete dataset property
      try {
        delete element.dataset[name];
      } catch (error) {
        element.dataset[name] = undefined;
      }
    } else {
      element.removeAttribute("data-".concat(toParamCase(name)));
    }
  }
  var REGEXP_SPACES = /\s\s*/;

  var onceSupported = function () {
    var supported = false;

    if (IS_BROWSER) {
      var once = false;

      var listener = function listener() {};

      var options = Object.defineProperty({}, 'once', {
        get: function get() {
          supported = true;
          return once;
        },

        /**
         * This setter can fix a `TypeError` in strict mode
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
         * @param {boolean} value - The value to set
         */
        set: function set(value) {
          once = value;
        }
      });
      WINDOW.addEventListener('test', listener, options);
      WINDOW.removeEventListener('test', listener, options);
    }

    return supported;
  }();
  /**
   * Remove event listener from the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */


  function removeListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var handler = listener;
    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (!onceSupported) {
        var listeners = element.listeners;

        if (listeners && listeners[event] && listeners[event][listener]) {
          handler = listeners[event][listener];
          delete listeners[event][listener];

          if (Object.keys(listeners[event]).length === 0) {
            delete listeners[event];
          }

          if (Object.keys(listeners).length === 0) {
            delete element.listeners;
          }
        }
      }

      element.removeEventListener(event, handler, options);
    });
  }
  /**
   * Add event listener to the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */

  function addListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var _handler = listener;
    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (options.once && !onceSupported) {
        var _element$listeners = element.listeners,
            listeners = _element$listeners === void 0 ? {} : _element$listeners;

        _handler = function handler() {
          delete listeners[event][listener];
          element.removeEventListener(event, _handler, options);

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(event, listeners[event][listener], options);
        }

        listeners[event][listener] = _handler;
        element.listeners = listeners;
      }

      element.addEventListener(event, _handler, options);
    });
  }
  /**
   * Dispatch event on the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Object} data - The additional event data.
   * @returns {boolean} Indicate if the event is default prevented or not.
   */

  function dispatchEvent(element, type, data) {
    var event; // Event and CustomEvent on IE9-11 are global objects, not constructors

    if (isFunction(Event) && isFunction(CustomEvent)) {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, data);
    }

    return element.dispatchEvent(event);
  }
  /**
   * Get the offset base on the document.
   * @param {Element} element - The target element.
   * @returns {Object} The offset data.
   */

  function getOffset(element) {
    var box = element.getBoundingClientRect();
    return {
      left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
      top: box.top + (window.pageYOffset - document.documentElement.clientTop)
    };
  }
  var location = WINDOW.location;
  var REGEXP_ORIGINS = /^(\w+:)\/\/([^:/?#]*):?(\d*)/i;
  /**
   * Check if the given URL is a cross origin URL.
   * @param {string} url - The target URL.
   * @returns {boolean} Returns `true` if the given URL is a cross origin URL, else `false`.
   */

  function isCrossOriginURL(url) {
    var parts = url.match(REGEXP_ORIGINS);
    return parts !== null && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
  }
  /**
   * Add timestamp to the given URL.
   * @param {string} url - The target URL.
   * @returns {string} The result URL.
   */

  function addTimestamp(url) {
    var timestamp = "timestamp=".concat(new Date().getTime());
    return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
  }
  /**
   * Get transforms base on the given object.
   * @param {Object} obj - The target object.
   * @returns {string} A string contains transform values.
   */

  function getTransforms(_ref) {
    var rotate = _ref.rotate,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        translateX = _ref.translateX,
        translateY = _ref.translateY;
    var values = [];

    if (isNumber(translateX) && translateX !== 0) {
      values.push("translateX(".concat(translateX, "px)"));
    }

    if (isNumber(translateY) && translateY !== 0) {
      values.push("translateY(".concat(translateY, "px)"));
    } // Rotate should come first before scale to match orientation transform


    if (isNumber(rotate) && rotate !== 0) {
      values.push("rotate(".concat(rotate, "deg)"));
    }

    if (isNumber(scaleX) && scaleX !== 1) {
      values.push("scaleX(".concat(scaleX, ")"));
    }

    if (isNumber(scaleY) && scaleY !== 1) {
      values.push("scaleY(".concat(scaleY, ")"));
    }

    var transform = values.length ? values.join(' ') : 'none';
    return {
      WebkitTransform: transform,
      msTransform: transform,
      transform: transform
    };
  }
  /**
   * Get the max ratio of a group of pointers.
   * @param {string} pointers - The target pointers.
   * @returns {number} The result ratio.
   */

  function getMaxZoomRatio(pointers) {
    var pointers2 = _objectSpread2({}, pointers);

    var maxRatio = 0;
    forEach(pointers, function (pointer, pointerId) {
      delete pointers2[pointerId];
      forEach(pointers2, function (pointer2) {
        var x1 = Math.abs(pointer.startX - pointer2.startX);
        var y1 = Math.abs(pointer.startY - pointer2.startY);
        var x2 = Math.abs(pointer.endX - pointer2.endX);
        var y2 = Math.abs(pointer.endY - pointer2.endY);
        var z1 = Math.sqrt(x1 * x1 + y1 * y1);
        var z2 = Math.sqrt(x2 * x2 + y2 * y2);
        var ratio = (z2 - z1) / z1;

        if (Math.abs(ratio) > Math.abs(maxRatio)) {
          maxRatio = ratio;
        }
      });
    });
    return maxRatio;
  }
  /**
   * Get a pointer from an event object.
   * @param {Object} event - The target event object.
   * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
   * @returns {Object} The result pointer contains start and/or end point coordinates.
   */

  function getPointer(_ref2, endOnly) {
    var pageX = _ref2.pageX,
        pageY = _ref2.pageY;
    var end = {
      endX: pageX,
      endY: pageY
    };
    return endOnly ? end : _objectSpread2({
      startX: pageX,
      startY: pageY
    }, end);
  }
  /**
   * Get the center point coordinate of a group of pointers.
   * @param {Object} pointers - The target pointers.
   * @returns {Object} The center point coordinate.
   */

  function getPointersCenter(pointers) {
    var pageX = 0;
    var pageY = 0;
    var count = 0;
    forEach(pointers, function (_ref3) {
      var startX = _ref3.startX,
          startY = _ref3.startY;
      pageX += startX;
      pageY += startY;
      count += 1;
    });
    pageX /= count;
    pageY /= count;
    return {
      pageX: pageX,
      pageY: pageY
    };
  }
  /**
   * Get the max sizes in a rectangle under the given aspect ratio.
   * @param {Object} data - The original sizes.
   * @param {string} [type='contain'] - The adjust type.
   * @returns {Object} The result sizes.
   */

  function getAdjustedSizes(_ref4) // or 'cover'
  {
    var aspectRatio = _ref4.aspectRatio,
        height = _ref4.height,
        width = _ref4.width;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'contain';
    var isValidWidth = isPositiveNumber(width);
    var isValidHeight = isPositiveNumber(height);

    if (isValidWidth && isValidHeight) {
      var adjustedWidth = height * aspectRatio;

      if (type === 'contain' && adjustedWidth > width || type === 'cover' && adjustedWidth < width) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    } else if (isValidWidth) {
      height = width / aspectRatio;
    } else if (isValidHeight) {
      width = height * aspectRatio;
    }

    return {
      width: width,
      height: height
    };
  }
  /**
   * Get the new sizes of a rectangle after rotated.
   * @param {Object} data - The original sizes.
   * @returns {Object} The result sizes.
   */

  function getRotatedSizes(_ref5) {
    var width = _ref5.width,
        height = _ref5.height,
        degree = _ref5.degree;
    degree = Math.abs(degree) % 180;

    if (degree === 90) {
      return {
        width: height,
        height: width
      };
    }

    var arc = degree % 90 * Math.PI / 180;
    var sinArc = Math.sin(arc);
    var cosArc = Math.cos(arc);
    var newWidth = width * cosArc + height * sinArc;
    var newHeight = width * sinArc + height * cosArc;
    return degree > 90 ? {
      width: newHeight,
      height: newWidth
    } : {
      width: newWidth,
      height: newHeight
    };
  }
  /**
   * Get a canvas which drew the given image.
   * @param {HTMLImageElement} image - The image for drawing.
   * @param {Object} imageData - The image data.
   * @param {Object} canvasData - The canvas data.
   * @param {Object} options - The options.
   * @returns {HTMLCanvasElement} The result canvas.
   */

  function getSourceCanvas(image, _ref6, _ref7, _ref8) {
    var imageAspectRatio = _ref6.aspectRatio,
        imageNaturalWidth = _ref6.naturalWidth,
        imageNaturalHeight = _ref6.naturalHeight,
        _ref6$rotate = _ref6.rotate,
        rotate = _ref6$rotate === void 0 ? 0 : _ref6$rotate,
        _ref6$scaleX = _ref6.scaleX,
        scaleX = _ref6$scaleX === void 0 ? 1 : _ref6$scaleX,
        _ref6$scaleY = _ref6.scaleY,
        scaleY = _ref6$scaleY === void 0 ? 1 : _ref6$scaleY;
    var aspectRatio = _ref7.aspectRatio,
        naturalWidth = _ref7.naturalWidth,
        naturalHeight = _ref7.naturalHeight;
    var _ref8$fillColor = _ref8.fillColor,
        fillColor = _ref8$fillColor === void 0 ? 'transparent' : _ref8$fillColor,
        _ref8$imageSmoothingE = _ref8.imageSmoothingEnabled,
        imageSmoothingEnabled = _ref8$imageSmoothingE === void 0 ? true : _ref8$imageSmoothingE,
        _ref8$imageSmoothingQ = _ref8.imageSmoothingQuality,
        imageSmoothingQuality = _ref8$imageSmoothingQ === void 0 ? 'low' : _ref8$imageSmoothingQ,
        _ref8$maxWidth = _ref8.maxWidth,
        maxWidth = _ref8$maxWidth === void 0 ? Infinity : _ref8$maxWidth,
        _ref8$maxHeight = _ref8.maxHeight,
        maxHeight = _ref8$maxHeight === void 0 ? Infinity : _ref8$maxHeight,
        _ref8$minWidth = _ref8.minWidth,
        minWidth = _ref8$minWidth === void 0 ? 0 : _ref8$minWidth,
        _ref8$minHeight = _ref8.minHeight,
        minHeight = _ref8$minHeight === void 0 ? 0 : _ref8$minHeight;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var maxSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var minSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
    var height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight)); // Note: should always use image's natural sizes for drawing as
    // imageData.naturalWidth === canvasData.naturalHeight when rotate % 180 === 90

    var destMaxSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var destMinSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var destWidth = Math.min(destMaxSizes.width, Math.max(destMinSizes.width, imageNaturalWidth));
    var destHeight = Math.min(destMaxSizes.height, Math.max(destMinSizes.height, imageNaturalHeight));
    var params = [-destWidth / 2, -destHeight / 2, destWidth, destHeight];
    canvas.width = normalizeDecimalNumber(width);
    canvas.height = normalizeDecimalNumber(height);
    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(rotate * Math.PI / 180);
    context.scale(scaleX, scaleY);
    context.imageSmoothingEnabled = imageSmoothingEnabled;
    context.imageSmoothingQuality = imageSmoothingQuality;
    context.drawImage.apply(context, [image].concat(_toConsumableArray(params.map(function (param) {
      return Math.floor(normalizeDecimalNumber(param));
    }))));
    context.restore();
    return canvas;
  }
  var fromCharCode = String.fromCharCode;
  /**
   * Get string from char code in data view.
   * @param {DataView} dataView - The data view for read.
   * @param {number} start - The start index.
   * @param {number} length - The read length.
   * @returns {string} The read result.
   */

  function getStringFromCharCode(dataView, start, length) {
    var str = '';
    length += start;

    for (var i = start; i < length; i += 1) {
      str += fromCharCode(dataView.getUint8(i));
    }

    return str;
  }
  var REGEXP_DATA_URL_HEAD = /^data:.*,/;
  /**
   * Transform Data URL to array buffer.
   * @param {string} dataURL - The Data URL to transform.
   * @returns {ArrayBuffer} The result array buffer.
   */

  function dataURLToArrayBuffer(dataURL) {
    var base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
    var binary = atob(base64);
    var arrayBuffer = new ArrayBuffer(binary.length);
    var uint8 = new Uint8Array(arrayBuffer);
    forEach(uint8, function (value, i) {
      uint8[i] = binary.charCodeAt(i);
    });
    return arrayBuffer;
  }
  /**
   * Transform array buffer to Data URL.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
   * @param {string} mimeType - The mime type of the Data URL.
   * @returns {string} The result Data URL.
   */

  function arrayBufferToDataURL(arrayBuffer, mimeType) {
    var chunks = []; // Chunk Typed Array for better performance (#435)

    var chunkSize = 8192;
    var uint8 = new Uint8Array(arrayBuffer);

    while (uint8.length > 0) {
      // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
      // eslint-disable-next-line prefer-spread
      chunks.push(fromCharCode.apply(null, toArray(uint8.subarray(0, chunkSize))));
      uint8 = uint8.subarray(chunkSize);
    }

    return "data:".concat(mimeType, ";base64,").concat(btoa(chunks.join('')));
  }
  /**
   * Get orientation value from given array buffer.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
   * @returns {number} The read orientation value.
   */

  function resetAndGetOrientation(arrayBuffer) {
    var dataView = new DataView(arrayBuffer);
    var orientation; // Ignores range error when the image does not have correct Exif information

    try {
      var littleEndian;
      var app1Start;
      var ifdStart; // Only handle JPEG image (start by 0xFFD8)

      if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
        var length = dataView.byteLength;
        var offset = 2;

        while (offset + 1 < length) {
          if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
            app1Start = offset;
            break;
          }

          offset += 1;
        }
      }

      if (app1Start) {
        var exifIDCode = app1Start + 4;
        var tiffOffset = app1Start + 10;

        if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
          var endianness = dataView.getUint16(tiffOffset);
          littleEndian = endianness === 0x4949;

          if (littleEndian || endianness === 0x4D4D
          /* bigEndian */
          ) {
              if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
                var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

                if (firstIFDOffset >= 0x00000008) {
                  ifdStart = tiffOffset + firstIFDOffset;
                }
              }
            }
        }
      }

      if (ifdStart) {
        var _length = dataView.getUint16(ifdStart, littleEndian);

        var _offset;

        var i;

        for (i = 0; i < _length; i += 1) {
          _offset = ifdStart + i * 12 + 2;

          if (dataView.getUint16(_offset, littleEndian) === 0x0112
          /* Orientation */
          ) {
              // 8 is the offset of the current tag's value
              _offset += 8; // Get the original orientation value

              orientation = dataView.getUint16(_offset, littleEndian); // Override the orientation with its default value

              dataView.setUint16(_offset, 1, littleEndian);
              break;
            }
        }
      }
    } catch (error) {
      orientation = 1;
    }

    return orientation;
  }
  /**
   * Parse Exif Orientation value.
   * @param {number} orientation - The orientation to parse.
   * @returns {Object} The parsed result.
   */

  function parseOrientation(orientation) {
    var rotate = 0;
    var scaleX = 1;
    var scaleY = 1;

    switch (orientation) {
      // Flip horizontal
      case 2:
        scaleX = -1;
        break;
      // Rotate left 180°

      case 3:
        rotate = -180;
        break;
      // Flip vertical

      case 4:
        scaleY = -1;
        break;
      // Flip vertical and rotate right 90°

      case 5:
        rotate = 90;
        scaleY = -1;
        break;
      // Rotate right 90°

      case 6:
        rotate = 90;
        break;
      // Flip horizontal and rotate right 90°

      case 7:
        rotate = 90;
        scaleX = -1;
        break;
      // Rotate left 90°

      case 8:
        rotate = -90;
        break;
    }

    return {
      rotate: rotate,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var render = {
    render: function render() {
      this.initContainer();
      this.initCanvas();
      this.initCropBox();
      this.renderCanvas();

      if (this.cropped) {
        this.renderCropBox();
      }
    },
    initContainer: function initContainer() {
      var element = this.element,
          options = this.options,
          container = this.container,
          cropper = this.cropper;
      var minWidth = Number(options.minContainerWidth);
      var minHeight = Number(options.minContainerHeight);
      addClass(cropper, CLASS_HIDDEN);
      removeClass(element, CLASS_HIDDEN);
      var containerData = {
        width: Math.max(container.offsetWidth, minWidth >= 0 ? minWidth : MIN_CONTAINER_WIDTH),
        height: Math.max(container.offsetHeight, minHeight >= 0 ? minHeight : MIN_CONTAINER_HEIGHT)
      };
      this.containerData = containerData;
      setStyle(cropper, {
        width: containerData.width,
        height: containerData.height
      });
      addClass(element, CLASS_HIDDEN);
      removeClass(cropper, CLASS_HIDDEN);
    },
    // Canvas (image wrapper)
    initCanvas: function initCanvas() {
      var containerData = this.containerData,
          imageData = this.imageData;
      var viewMode = this.options.viewMode;
      var rotated = Math.abs(imageData.rotate) % 180 === 90;
      var naturalWidth = rotated ? imageData.naturalHeight : imageData.naturalWidth;
      var naturalHeight = rotated ? imageData.naturalWidth : imageData.naturalHeight;
      var aspectRatio = naturalWidth / naturalHeight;
      var canvasWidth = containerData.width;
      var canvasHeight = containerData.height;

      if (containerData.height * aspectRatio > containerData.width) {
        if (viewMode === 3) {
          canvasWidth = containerData.height * aspectRatio;
        } else {
          canvasHeight = containerData.width / aspectRatio;
        }
      } else if (viewMode === 3) {
        canvasHeight = containerData.width / aspectRatio;
      } else {
        canvasWidth = containerData.height * aspectRatio;
      }

      var canvasData = {
        aspectRatio: aspectRatio,
        naturalWidth: naturalWidth,
        naturalHeight: naturalHeight,
        width: canvasWidth,
        height: canvasHeight
      };
      this.canvasData = canvasData;
      this.limited = viewMode === 1 || viewMode === 2;
      this.limitCanvas(true, true);
      canvasData.width = Math.min(Math.max(canvasData.width, canvasData.minWidth), canvasData.maxWidth);
      canvasData.height = Math.min(Math.max(canvasData.height, canvasData.minHeight), canvasData.maxHeight);
      canvasData.left = (containerData.width - canvasData.width) / 2;
      canvasData.top = (containerData.height - canvasData.height) / 2;
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;
      this.initialCanvasData = assign({}, canvasData);
    },
    limitCanvas: function limitCanvas(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var viewMode = options.viewMode;
      var aspectRatio = canvasData.aspectRatio;
      var cropped = this.cropped && cropBoxData;

      if (sizeLimited) {
        var minCanvasWidth = Number(options.minCanvasWidth) || 0;
        var minCanvasHeight = Number(options.minCanvasHeight) || 0;

        if (viewMode > 1) {
          minCanvasWidth = Math.max(minCanvasWidth, containerData.width);
          minCanvasHeight = Math.max(minCanvasHeight, containerData.height);

          if (viewMode === 3) {
            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        } else if (viewMode > 0) {
          if (minCanvasWidth) {
            minCanvasWidth = Math.max(minCanvasWidth, cropped ? cropBoxData.width : 0);
          } else if (minCanvasHeight) {
            minCanvasHeight = Math.max(minCanvasHeight, cropped ? cropBoxData.height : 0);
          } else if (cropped) {
            minCanvasWidth = cropBoxData.width;
            minCanvasHeight = cropBoxData.height;

            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        }

        var _getAdjustedSizes = getAdjustedSizes({
          aspectRatio: aspectRatio,
          width: minCanvasWidth,
          height: minCanvasHeight
        });

        minCanvasWidth = _getAdjustedSizes.width;
        minCanvasHeight = _getAdjustedSizes.height;
        canvasData.minWidth = minCanvasWidth;
        canvasData.minHeight = minCanvasHeight;
        canvasData.maxWidth = Infinity;
        canvasData.maxHeight = Infinity;
      }

      if (positionLimited) {
        if (viewMode > (cropped ? 0 : 1)) {
          var newCanvasLeft = containerData.width - canvasData.width;
          var newCanvasTop = containerData.height - canvasData.height;
          canvasData.minLeft = Math.min(0, newCanvasLeft);
          canvasData.minTop = Math.min(0, newCanvasTop);
          canvasData.maxLeft = Math.max(0, newCanvasLeft);
          canvasData.maxTop = Math.max(0, newCanvasTop);

          if (cropped && this.limited) {
            canvasData.minLeft = Math.min(cropBoxData.left, cropBoxData.left + (cropBoxData.width - canvasData.width));
            canvasData.minTop = Math.min(cropBoxData.top, cropBoxData.top + (cropBoxData.height - canvasData.height));
            canvasData.maxLeft = cropBoxData.left;
            canvasData.maxTop = cropBoxData.top;

            if (viewMode === 2) {
              if (canvasData.width >= containerData.width) {
                canvasData.minLeft = Math.min(0, newCanvasLeft);
                canvasData.maxLeft = Math.max(0, newCanvasLeft);
              }

              if (canvasData.height >= containerData.height) {
                canvasData.minTop = Math.min(0, newCanvasTop);
                canvasData.maxTop = Math.max(0, newCanvasTop);
              }
            }
          }
        } else {
          canvasData.minLeft = -canvasData.width;
          canvasData.minTop = -canvasData.height;
          canvasData.maxLeft = containerData.width;
          canvasData.maxTop = containerData.height;
        }
      }
    },
    renderCanvas: function renderCanvas(changed, transformed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;

      if (transformed) {
        var _getRotatedSizes = getRotatedSizes({
          width: imageData.naturalWidth * Math.abs(imageData.scaleX || 1),
          height: imageData.naturalHeight * Math.abs(imageData.scaleY || 1),
          degree: imageData.rotate || 0
        }),
            naturalWidth = _getRotatedSizes.width,
            naturalHeight = _getRotatedSizes.height;

        var width = canvasData.width * (naturalWidth / canvasData.naturalWidth);
        var height = canvasData.height * (naturalHeight / canvasData.naturalHeight);
        canvasData.left -= (width - canvasData.width) / 2;
        canvasData.top -= (height - canvasData.height) / 2;
        canvasData.width = width;
        canvasData.height = height;
        canvasData.aspectRatio = naturalWidth / naturalHeight;
        canvasData.naturalWidth = naturalWidth;
        canvasData.naturalHeight = naturalHeight;
        this.limitCanvas(true, false);
      }

      if (canvasData.width > canvasData.maxWidth || canvasData.width < canvasData.minWidth) {
        canvasData.left = canvasData.oldLeft;
      }

      if (canvasData.height > canvasData.maxHeight || canvasData.height < canvasData.minHeight) {
        canvasData.top = canvasData.oldTop;
      }

      canvasData.width = Math.min(Math.max(canvasData.width, canvasData.minWidth), canvasData.maxWidth);
      canvasData.height = Math.min(Math.max(canvasData.height, canvasData.minHeight), canvasData.maxHeight);
      this.limitCanvas(false, true);
      canvasData.left = Math.min(Math.max(canvasData.left, canvasData.minLeft), canvasData.maxLeft);
      canvasData.top = Math.min(Math.max(canvasData.top, canvasData.minTop), canvasData.maxTop);
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;
      setStyle(this.canvas, assign({
        width: canvasData.width,
        height: canvasData.height
      }, getTransforms({
        translateX: canvasData.left,
        translateY: canvasData.top
      })));
      this.renderImage(changed);

      if (this.cropped && this.limited) {
        this.limitCropBox(true, true);
      }
    },
    renderImage: function renderImage(changed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;
      var width = imageData.naturalWidth * (canvasData.width / canvasData.naturalWidth);
      var height = imageData.naturalHeight * (canvasData.height / canvasData.naturalHeight);
      assign(imageData, {
        width: width,
        height: height,
        left: (canvasData.width - width) / 2,
        top: (canvasData.height - height) / 2
      });
      setStyle(this.image, assign({
        width: imageData.width,
        height: imageData.height
      }, getTransforms(assign({
        translateX: imageData.left,
        translateY: imageData.top
      }, imageData))));

      if (changed) {
        this.output();
      }
    },
    initCropBox: function initCropBox() {
      var options = this.options,
          canvasData = this.canvasData;
      var aspectRatio = options.aspectRatio || options.initialAspectRatio;
      var autoCropArea = Number(options.autoCropArea) || 0.8;
      var cropBoxData = {
        width: canvasData.width,
        height: canvasData.height
      };

      if (aspectRatio) {
        if (canvasData.height * aspectRatio > canvasData.width) {
          cropBoxData.height = cropBoxData.width / aspectRatio;
        } else {
          cropBoxData.width = cropBoxData.height * aspectRatio;
        }
      }

      this.cropBoxData = cropBoxData;
      this.limitCropBox(true, true); // Initialize auto crop area

      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight); // The width/height of auto crop area must large than "minWidth/Height"

      cropBoxData.width = Math.max(cropBoxData.minWidth, cropBoxData.width * autoCropArea);
      cropBoxData.height = Math.max(cropBoxData.minHeight, cropBoxData.height * autoCropArea);
      cropBoxData.left = canvasData.left + (canvasData.width - cropBoxData.width) / 2;
      cropBoxData.top = canvasData.top + (canvasData.height - cropBoxData.height) / 2;
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;
      this.initialCropBoxData = assign({}, cropBoxData);
    },
    limitCropBox: function limitCropBox(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData,
          limited = this.limited;
      var aspectRatio = options.aspectRatio;

      if (sizeLimited) {
        var minCropBoxWidth = Number(options.minCropBoxWidth) || 0;
        var minCropBoxHeight = Number(options.minCropBoxHeight) || 0;
        var maxCropBoxWidth = limited ? Math.min(containerData.width, canvasData.width, canvasData.width + canvasData.left, containerData.width - canvasData.left) : containerData.width;
        var maxCropBoxHeight = limited ? Math.min(containerData.height, canvasData.height, canvasData.height + canvasData.top, containerData.height - canvasData.top) : containerData.height; // The min/maxCropBoxWidth/Height must be less than container's width/height

        minCropBoxWidth = Math.min(minCropBoxWidth, containerData.width);
        minCropBoxHeight = Math.min(minCropBoxHeight, containerData.height);

        if (aspectRatio) {
          if (minCropBoxWidth && minCropBoxHeight) {
            if (minCropBoxHeight * aspectRatio > minCropBoxWidth) {
              minCropBoxHeight = minCropBoxWidth / aspectRatio;
            } else {
              minCropBoxWidth = minCropBoxHeight * aspectRatio;
            }
          } else if (minCropBoxWidth) {
            minCropBoxHeight = minCropBoxWidth / aspectRatio;
          } else if (minCropBoxHeight) {
            minCropBoxWidth = minCropBoxHeight * aspectRatio;
          }

          if (maxCropBoxHeight * aspectRatio > maxCropBoxWidth) {
            maxCropBoxHeight = maxCropBoxWidth / aspectRatio;
          } else {
            maxCropBoxWidth = maxCropBoxHeight * aspectRatio;
          }
        } // The minWidth/Height must be less than maxWidth/Height


        cropBoxData.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
        cropBoxData.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
        cropBoxData.maxWidth = maxCropBoxWidth;
        cropBoxData.maxHeight = maxCropBoxHeight;
      }

      if (positionLimited) {
        if (limited) {
          cropBoxData.minLeft = Math.max(0, canvasData.left);
          cropBoxData.minTop = Math.max(0, canvasData.top);
          cropBoxData.maxLeft = Math.min(containerData.width, canvasData.left + canvasData.width) - cropBoxData.width;
          cropBoxData.maxTop = Math.min(containerData.height, canvasData.top + canvasData.height) - cropBoxData.height;
        } else {
          cropBoxData.minLeft = 0;
          cropBoxData.minTop = 0;
          cropBoxData.maxLeft = containerData.width - cropBoxData.width;
          cropBoxData.maxTop = containerData.height - cropBoxData.height;
        }
      }
    },
    renderCropBox: function renderCropBox() {
      var options = this.options,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData;

      if (cropBoxData.width > cropBoxData.maxWidth || cropBoxData.width < cropBoxData.minWidth) {
        cropBoxData.left = cropBoxData.oldLeft;
      }

      if (cropBoxData.height > cropBoxData.maxHeight || cropBoxData.height < cropBoxData.minHeight) {
        cropBoxData.top = cropBoxData.oldTop;
      }

      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);
      this.limitCropBox(false, true);
      cropBoxData.left = Math.min(Math.max(cropBoxData.left, cropBoxData.minLeft), cropBoxData.maxLeft);
      cropBoxData.top = Math.min(Math.max(cropBoxData.top, cropBoxData.minTop), cropBoxData.maxTop);
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;

      if (options.movable && options.cropBoxMovable) {
        // Turn to move the canvas when the crop box is equal to the container
        setData(this.face, DATA_ACTION, cropBoxData.width >= containerData.width && cropBoxData.height >= containerData.height ? ACTION_MOVE : ACTION_ALL);
      }

      setStyle(this.cropBox, assign({
        width: cropBoxData.width,
        height: cropBoxData.height
      }, getTransforms({
        translateX: cropBoxData.left,
        translateY: cropBoxData.top
      })));

      if (this.cropped && this.limited) {
        this.limitCanvas(true, true);
      }

      if (!this.disabled) {
        this.output();
      }
    },
    output: function output() {
      this.preview();
      dispatchEvent(this.element, EVENT_CROP, this.getData());
    }
  };

  var preview = {
    initPreview: function initPreview() {
      var element = this.element,
          crossOrigin = this.crossOrigin;
      var preview = this.options.preview;
      var url = crossOrigin ? this.crossOriginUrl : this.url;
      var alt = element.alt || 'The image to preview';
      var image = document.createElement('img');

      if (crossOrigin) {
        image.crossOrigin = crossOrigin;
      }

      image.src = url;
      image.alt = alt;
      this.viewBox.appendChild(image);
      this.viewBoxImage = image;

      if (!preview) {
        return;
      }

      var previews = preview;

      if (typeof preview === 'string') {
        previews = element.ownerDocument.querySelectorAll(preview);
      } else if (preview.querySelector) {
        previews = [preview];
      }

      this.previews = previews;
      forEach(previews, function (el) {
        var img = document.createElement('img'); // Save the original size for recover

        setData(el, DATA_PREVIEW, {
          width: el.offsetWidth,
          height: el.offsetHeight,
          html: el.innerHTML
        });

        if (crossOrigin) {
          img.crossOrigin = crossOrigin;
        }

        img.src = url;
        img.alt = alt;
        /**
         * Override img element styles
         * Add `display:block` to avoid margin top issue
         * Add `height:auto` to override `height` attribute on IE8
         * (Occur only when margin-top <= -height)
         */

        img.style.cssText = 'display:block;' + 'width:100%;' + 'height:auto;' + 'min-width:0!important;' + 'min-height:0!important;' + 'max-width:none!important;' + 'max-height:none!important;' + 'image-orientation:0deg!important;"';
        el.innerHTML = '';
        el.appendChild(img);
      });
    },
    resetPreview: function resetPreview() {
      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);
        setStyle(element, {
          width: data.width,
          height: data.height
        });
        element.innerHTML = data.html;
        removeData(element, DATA_PREVIEW);
      });
    },
    preview: function preview() {
      var imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var cropBoxWidth = cropBoxData.width,
          cropBoxHeight = cropBoxData.height;
      var width = imageData.width,
          height = imageData.height;
      var left = cropBoxData.left - canvasData.left - imageData.left;
      var top = cropBoxData.top - canvasData.top - imageData.top;

      if (!this.cropped || this.disabled) {
        return;
      }

      setStyle(this.viewBoxImage, assign({
        width: width,
        height: height
      }, getTransforms(assign({
        translateX: -left,
        translateY: -top
      }, imageData))));
      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);
        var originalWidth = data.width;
        var originalHeight = data.height;
        var newWidth = originalWidth;
        var newHeight = originalHeight;
        var ratio = 1;

        if (cropBoxWidth) {
          ratio = originalWidth / cropBoxWidth;
          newHeight = cropBoxHeight * ratio;
        }

        if (cropBoxHeight && newHeight > originalHeight) {
          ratio = originalHeight / cropBoxHeight;
          newWidth = cropBoxWidth * ratio;
          newHeight = originalHeight;
        }

        setStyle(element, {
          width: newWidth,
          height: newHeight
        });
        setStyle(element.getElementsByTagName('img')[0], assign({
          width: width * ratio,
          height: height * ratio
        }, getTransforms(assign({
          translateX: -left * ratio,
          translateY: -top * ratio
        }, imageData))));
      });
    }
  };

  var events = {
    bind: function bind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;

      if (isFunction(options.cropstart)) {
        addListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        addListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        addListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        addListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        addListener(element, EVENT_ZOOM, options.zoom);
      }

      addListener(cropper, EVENT_POINTER_DOWN, this.onCropStart = this.cropStart.bind(this));

      if (options.zoomable && options.zoomOnWheel) {
        addListener(cropper, EVENT_WHEEL, this.onWheel = this.wheel.bind(this), {
          passive: false,
          capture: true
        });
      }

      if (options.toggleDragModeOnDblclick) {
        addListener(cropper, EVENT_DBLCLICK, this.onDblclick = this.dblclick.bind(this));
      }

      addListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove = this.cropMove.bind(this));
      addListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd = this.cropEnd.bind(this));

      if (options.responsive) {
        addListener(window, EVENT_RESIZE, this.onResize = this.resize.bind(this));
      }
    },
    unbind: function unbind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;

      if (isFunction(options.cropstart)) {
        removeListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        removeListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        removeListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        removeListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        removeListener(element, EVENT_ZOOM, options.zoom);
      }

      removeListener(cropper, EVENT_POINTER_DOWN, this.onCropStart);

      if (options.zoomable && options.zoomOnWheel) {
        removeListener(cropper, EVENT_WHEEL, this.onWheel, {
          passive: false,
          capture: true
        });
      }

      if (options.toggleDragModeOnDblclick) {
        removeListener(cropper, EVENT_DBLCLICK, this.onDblclick);
      }

      removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove);
      removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd);

      if (options.responsive) {
        removeListener(window, EVENT_RESIZE, this.onResize);
      }
    }
  };

  var handlers = {
    resize: function resize() {
      if (this.disabled) {
        return;
      }

      var options = this.options,
          container = this.container,
          containerData = this.containerData;
      var ratioX = container.offsetWidth / containerData.width;
      var ratioY = container.offsetHeight / containerData.height;
      var ratio = Math.abs(ratioX - 1) > Math.abs(ratioY - 1) ? ratioX : ratioY; // Resize when width changed or height changed

      if (ratio !== 1) {
        var canvasData;
        var cropBoxData;

        if (options.restore) {
          canvasData = this.getCanvasData();
          cropBoxData = this.getCropBoxData();
        }

        this.render();

        if (options.restore) {
          this.setCanvasData(forEach(canvasData, function (n, i) {
            canvasData[i] = n * ratio;
          }));
          this.setCropBoxData(forEach(cropBoxData, function (n, i) {
            cropBoxData[i] = n * ratio;
          }));
        }
      }
    },
    dblclick: function dblclick() {
      if (this.disabled || this.options.dragMode === DRAG_MODE_NONE) {
        return;
      }

      this.setDragMode(hasClass(this.dragBox, CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP);
    },
    wheel: function wheel(event) {
      var _this = this;

      var ratio = Number(this.options.wheelZoomRatio) || 0.1;
      var delta = 1;

      if (this.disabled) {
        return;
      }

      event.preventDefault(); // Limit wheel speed to prevent zoom too fast (#21)

      if (this.wheeling) {
        return;
      }

      this.wheeling = true;
      setTimeout(function () {
        _this.wheeling = false;
      }, 50);

      if (event.deltaY) {
        delta = event.deltaY > 0 ? 1 : -1;
      } else if (event.wheelDelta) {
        delta = -event.wheelDelta / 120;
      } else if (event.detail) {
        delta = event.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, event);
    },
    cropStart: function cropStart(event) {
      var buttons = event.buttons,
          button = event.button;

      if (this.disabled // Handle mouse event and pointer event and ignore touch event
      || (event.type === 'mousedown' || event.type === 'pointerdown' && event.pointerType === 'mouse') && ( // No primary button (Usually the left button)
      isNumber(buttons) && buttons !== 1 || isNumber(button) && button !== 0 // Open context menu
      || event.ctrlKey)) {
        return;
      }

      var options = this.options,
          pointers = this.pointers;
      var action;

      if (event.changedTouches) {
        // Handle touch event
        forEach(event.changedTouches, function (touch) {
          pointers[touch.identifier] = getPointer(touch);
        });
      } else {
        // Handle mouse event and pointer event
        pointers[event.pointerId || 0] = getPointer(event);
      }

      if (Object.keys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
        action = ACTION_ZOOM;
      } else {
        action = getData(event.target, DATA_ACTION);
      }

      if (!REGEXP_ACTIONS.test(action)) {
        return;
      }

      if (dispatchEvent(this.element, EVENT_CROP_START, {
        originalEvent: event,
        action: action
      }) === false) {
        return;
      } // This line is required for preventing page zooming in iOS browsers


      event.preventDefault();
      this.action = action;
      this.cropping = false;

      if (action === ACTION_CROP) {
        this.cropping = true;
        addClass(this.dragBox, CLASS_MODAL);
      }
    },
    cropMove: function cropMove(event) {
      var action = this.action;

      if (this.disabled || !action) {
        return;
      }

      var pointers = this.pointers;
      event.preventDefault();

      if (dispatchEvent(this.element, EVENT_CROP_MOVE, {
        originalEvent: event,
        action: action
      }) === false) {
        return;
      }

      if (event.changedTouches) {
        forEach(event.changedTouches, function (touch) {
          // The first parameter should not be undefined (#432)
          assign(pointers[touch.identifier] || {}, getPointer(touch, true));
        });
      } else {
        assign(pointers[event.pointerId || 0] || {}, getPointer(event, true));
      }

      this.change(event);
    },
    cropEnd: function cropEnd(event) {
      if (this.disabled) {
        return;
      }

      var action = this.action,
          pointers = this.pointers;

      if (event.changedTouches) {
        forEach(event.changedTouches, function (touch) {
          delete pointers[touch.identifier];
        });
      } else {
        delete pointers[event.pointerId || 0];
      }

      if (!action) {
        return;
      }

      event.preventDefault();

      if (!Object.keys(pointers).length) {
        this.action = '';
      }

      if (this.cropping) {
        this.cropping = false;
        toggleClass(this.dragBox, CLASS_MODAL, this.cropped && this.options.modal);
      }

      dispatchEvent(this.element, EVENT_CROP_END, {
        originalEvent: event,
        action: action
      });
    }
  };

  var change = {
    change: function change(event) {
      var options = this.options,
          canvasData = this.canvasData,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData,
          pointers = this.pointers;
      var action = this.action;
      var aspectRatio = options.aspectRatio;
      var left = cropBoxData.left,
          top = cropBoxData.top,
          width = cropBoxData.width,
          height = cropBoxData.height;
      var right = left + width;
      var bottom = top + height;
      var minLeft = 0;
      var minTop = 0;
      var maxWidth = containerData.width;
      var maxHeight = containerData.height;
      var renderable = true;
      var offset; // Locking aspect ratio in "free mode" by holding shift key

      if (!aspectRatio && event.shiftKey) {
        aspectRatio = width && height ? width / height : 1;
      }

      if (this.limited) {
        minLeft = cropBoxData.minLeft;
        minTop = cropBoxData.minTop;
        maxWidth = minLeft + Math.min(containerData.width, canvasData.width, canvasData.left + canvasData.width);
        maxHeight = minTop + Math.min(containerData.height, canvasData.height, canvasData.top + canvasData.height);
      }

      var pointer = pointers[Object.keys(pointers)[0]];
      var range = {
        x: pointer.endX - pointer.startX,
        y: pointer.endY - pointer.startY
      };

      var check = function check(side) {
        switch (side) {
          case ACTION_EAST:
            if (right + range.x > maxWidth) {
              range.x = maxWidth - right;
            }

            break;

          case ACTION_WEST:
            if (left + range.x < minLeft) {
              range.x = minLeft - left;
            }

            break;

          case ACTION_NORTH:
            if (top + range.y < minTop) {
              range.y = minTop - top;
            }

            break;

          case ACTION_SOUTH:
            if (bottom + range.y > maxHeight) {
              range.y = maxHeight - bottom;
            }

            break;
        }
      };

      switch (action) {
        // Move crop box
        case ACTION_ALL:
          left += range.x;
          top += range.y;
          break;
        // Resize crop box

        case ACTION_EAST:
          if (range.x >= 0 && (right >= maxWidth || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_EAST);
          width += range.x;

          if (width < 0) {
            action = ACTION_WEST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_NORTH:
          if (range.y <= 0 && (top <= minTop || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_NORTH);
          height -= range.y;
          top += range.y;

          if (height < 0) {
            action = ACTION_SOUTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_WEST:
          if (range.x <= 0 && (left <= minLeft || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_WEST);
          width -= range.x;
          left += range.x;

          if (width < 0) {
            action = ACTION_EAST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_SOUTH:
          if (range.y >= 0 && (bottom >= maxHeight || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_SOUTH);
          height += range.y;

          if (height < 0) {
            action = ACTION_NORTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_NORTH_EAST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || right >= maxWidth)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
          } else {
            check(ACTION_NORTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_NORTH_WEST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || left <= minLeft)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
            left += cropBoxData.width - width;
          } else {
            check(ACTION_NORTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_WEST:
          if (aspectRatio) {
            if (range.x <= 0 && (left <= minLeft || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_WEST);
            width -= range.x;
            left += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_EAST:
          if (aspectRatio) {
            if (range.x >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_EAST);
            width += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            top -= height;
          }

          break;
        // Move canvas

        case ACTION_MOVE:
          this.move(range.x, range.y);
          renderable = false;
          break;
        // Zoom canvas

        case ACTION_ZOOM:
          this.zoom(getMaxZoomRatio(pointers), event);
          renderable = false;
          break;
        // Create crop box

        case ACTION_CROP:
          if (!range.x || !range.y) {
            renderable = false;
            break;
          }

          offset = getOffset(this.cropper);
          left = pointer.startX - offset.left;
          top = pointer.startY - offset.top;
          width = cropBoxData.minWidth;
          height = cropBoxData.minHeight;

          if (range.x > 0) {
            action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
          } else if (range.x < 0) {
            left -= width;
            action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
          }

          if (range.y < 0) {
            top -= height;
          } // Show the crop box if is hidden


          if (!this.cropped) {
            removeClass(this.cropBox, CLASS_HIDDEN);
            this.cropped = true;

            if (this.limited) {
              this.limitCropBox(true, true);
            }
          }

          break;
      }

      if (renderable) {
        cropBoxData.width = width;
        cropBoxData.height = height;
        cropBoxData.left = left;
        cropBoxData.top = top;
        this.action = action;
        this.renderCropBox();
      } // Override


      forEach(pointers, function (p) {
        p.startX = p.endX;
        p.startY = p.endY;
      });
    }
  };

  var methods = {
    // Show the crop box manually
    crop: function crop() {
      if (this.ready && !this.cropped && !this.disabled) {
        this.cropped = true;
        this.limitCropBox(true, true);

        if (this.options.modal) {
          addClass(this.dragBox, CLASS_MODAL);
        }

        removeClass(this.cropBox, CLASS_HIDDEN);
        this.setCropBoxData(this.initialCropBoxData);
      }

      return this;
    },
    // Reset the image and crop box to their initial states
    reset: function reset() {
      if (this.ready && !this.disabled) {
        this.imageData = assign({}, this.initialImageData);
        this.canvasData = assign({}, this.initialCanvasData);
        this.cropBoxData = assign({}, this.initialCropBoxData);
        this.renderCanvas();

        if (this.cropped) {
          this.renderCropBox();
        }
      }

      return this;
    },
    // Clear the crop box
    clear: function clear() {
      if (this.cropped && !this.disabled) {
        assign(this.cropBoxData, {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        });
        this.cropped = false;
        this.renderCropBox();
        this.limitCanvas(true, true); // Render canvas after crop box rendered

        this.renderCanvas();
        removeClass(this.dragBox, CLASS_MODAL);
        addClass(this.cropBox, CLASS_HIDDEN);
      }

      return this;
    },

    /**
     * Replace the image's src and rebuild the cropper
     * @param {string} url - The new URL.
     * @param {boolean} [hasSameSize] - Indicate if the new image has the same size as the old one.
     * @returns {Cropper} this
     */
    replace: function replace(url) {
      var hasSameSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!this.disabled && url) {
        if (this.isImg) {
          this.element.src = url;
        }

        if (hasSameSize) {
          this.url = url;
          this.image.src = url;

          if (this.ready) {
            this.viewBoxImage.src = url;
            forEach(this.previews, function (element) {
              element.getElementsByTagName('img')[0].src = url;
            });
          }
        } else {
          if (this.isImg) {
            this.replaced = true;
          }

          this.options.data = null;
          this.uncreate();
          this.load(url);
        }
      }

      return this;
    },
    // Enable (unfreeze) the cropper
    enable: function enable() {
      if (this.ready && this.disabled) {
        this.disabled = false;
        removeClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },
    // Disable (freeze) the cropper
    disable: function disable() {
      if (this.ready && !this.disabled) {
        this.disabled = true;
        addClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },

    /**
     * Destroy the cropper and remove the instance from the image
     * @returns {Cropper} this
     */
    destroy: function destroy() {
      var element = this.element;

      if (!element[NAMESPACE]) {
        return this;
      }

      element[NAMESPACE] = undefined;

      if (this.isImg && this.replaced) {
        element.src = this.originalUrl;
      }

      this.uncreate();
      return this;
    },

    /**
     * Move the canvas with relative offsets
     * @param {number} offsetX - The relative offset distance on the x-axis.
     * @param {number} [offsetY=offsetX] - The relative offset distance on the y-axis.
     * @returns {Cropper} this
     */
    move: function move(offsetX) {
      var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : offsetX;
      var _this$canvasData = this.canvasData,
          left = _this$canvasData.left,
          top = _this$canvasData.top;
      return this.moveTo(isUndefined(offsetX) ? offsetX : left + Number(offsetX), isUndefined(offsetY) ? offsetY : top + Number(offsetY));
    },

    /**
     * Move the canvas to an absolute point
     * @param {number} x - The x-axis coordinate.
     * @param {number} [y=x] - The y-axis coordinate.
     * @returns {Cropper} this
     */
    moveTo: function moveTo(x) {
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
      var canvasData = this.canvasData;
      var changed = false;
      x = Number(x);
      y = Number(y);

      if (this.ready && !this.disabled && this.options.movable) {
        if (isNumber(x)) {
          canvasData.left = x;
          changed = true;
        }

        if (isNumber(y)) {
          canvasData.top = y;
          changed = true;
        }

        if (changed) {
          this.renderCanvas(true);
        }
      }

      return this;
    },

    /**
     * Zoom the canvas with a relative ratio
     * @param {number} ratio - The target ratio.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoom: function zoom(ratio, _originalEvent) {
      var canvasData = this.canvasData;
      ratio = Number(ratio);

      if (ratio < 0) {
        ratio = 1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      return this.zoomTo(canvasData.width * ratio / canvasData.naturalWidth, null, _originalEvent);
    },

    /**
     * Zoom the canvas to an absolute ratio
     * @param {number} ratio - The target ratio.
     * @param {Object} pivot - The zoom pivot point coordinate.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoomTo: function zoomTo(ratio, pivot, _originalEvent) {
      var options = this.options,
          canvasData = this.canvasData;
      var width = canvasData.width,
          height = canvasData.height,
          naturalWidth = canvasData.naturalWidth,
          naturalHeight = canvasData.naturalHeight;
      ratio = Number(ratio);

      if (ratio >= 0 && this.ready && !this.disabled && options.zoomable) {
        var newWidth = naturalWidth * ratio;
        var newHeight = naturalHeight * ratio;

        if (dispatchEvent(this.element, EVENT_ZOOM, {
          ratio: ratio,
          oldRatio: width / naturalWidth,
          originalEvent: _originalEvent
        }) === false) {
          return this;
        }

        if (_originalEvent) {
          var pointers = this.pointers;
          var offset = getOffset(this.cropper);
          var center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
            pageX: _originalEvent.pageX,
            pageY: _originalEvent.pageY
          }; // Zoom from the triggering point of the event

          canvasData.left -= (newWidth - width) * ((center.pageX - offset.left - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((center.pageY - offset.top - canvasData.top) / height);
        } else if (isPlainObject(pivot) && isNumber(pivot.x) && isNumber(pivot.y)) {
          canvasData.left -= (newWidth - width) * ((pivot.x - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((pivot.y - canvasData.top) / height);
        } else {
          // Zoom from the center of the canvas
          canvasData.left -= (newWidth - width) / 2;
          canvasData.top -= (newHeight - height) / 2;
        }

        canvasData.width = newWidth;
        canvasData.height = newHeight;
        this.renderCanvas(true);
      }

      return this;
    },

    /**
     * Rotate the canvas with a relative degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotate: function rotate(degree) {
      return this.rotateTo((this.imageData.rotate || 0) + Number(degree));
    },

    /**
     * Rotate the canvas to an absolute degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotateTo: function rotateTo(degree) {
      degree = Number(degree);

      if (isNumber(degree) && this.ready && !this.disabled && this.options.rotatable) {
        this.imageData.rotate = degree % 360;
        this.renderCanvas(true, true);
      }

      return this;
    },

    /**
     * Scale the image on the x-axis.
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @returns {Cropper} this
     */
    scaleX: function scaleX(_scaleX) {
      var scaleY = this.imageData.scaleY;
      return this.scale(_scaleX, isNumber(scaleY) ? scaleY : 1);
    },

    /**
     * Scale the image on the y-axis.
     * @param {number} scaleY - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scaleY: function scaleY(_scaleY) {
      var scaleX = this.imageData.scaleX;
      return this.scale(isNumber(scaleX) ? scaleX : 1, _scaleY);
    },

    /**
     * Scale the image
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scale: function scale(scaleX) {
      var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;
      var imageData = this.imageData;
      var transformed = false;
      scaleX = Number(scaleX);
      scaleY = Number(scaleY);

      if (this.ready && !this.disabled && this.options.scalable) {
        if (isNumber(scaleX)) {
          imageData.scaleX = scaleX;
          transformed = true;
        }

        if (isNumber(scaleY)) {
          imageData.scaleY = scaleY;
          transformed = true;
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }
      }

      return this;
    },

    /**
     * Get the cropped area position and size data (base on the original image)
     * @param {boolean} [rounded=false] - Indicate if round the data values or not.
     * @returns {Object} The result cropped data.
     */
    getData: function getData() {
      var rounded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var data;

      if (this.ready && this.cropped) {
        data = {
          x: cropBoxData.left - canvasData.left,
          y: cropBoxData.top - canvasData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };
        var ratio = imageData.width / imageData.naturalWidth;
        forEach(data, function (n, i) {
          data[i] = n / ratio;
        });

        if (rounded) {
          // In case rounding off leads to extra 1px in right or bottom border
          // we should round the top-left corner and the dimension (#343).
          var bottom = Math.round(data.y + data.height);
          var right = Math.round(data.x + data.width);
          data.x = Math.round(data.x);
          data.y = Math.round(data.y);
          data.width = right - data.x;
          data.height = bottom - data.y;
        }
      } else {
        data = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }

      if (options.rotatable) {
        data.rotate = imageData.rotate || 0;
      }

      if (options.scalable) {
        data.scaleX = imageData.scaleX || 1;
        data.scaleY = imageData.scaleY || 1;
      }

      return data;
    },

    /**
     * Set the cropped area position and size with new data
     * @param {Object} data - The new data.
     * @returns {Cropper} this
     */
    setData: function setData(data) {
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData;
      var cropBoxData = {};

      if (this.ready && !this.disabled && isPlainObject(data)) {
        var transformed = false;

        if (options.rotatable) {
          if (isNumber(data.rotate) && data.rotate !== imageData.rotate) {
            imageData.rotate = data.rotate;
            transformed = true;
          }
        }

        if (options.scalable) {
          if (isNumber(data.scaleX) && data.scaleX !== imageData.scaleX) {
            imageData.scaleX = data.scaleX;
            transformed = true;
          }

          if (isNumber(data.scaleY) && data.scaleY !== imageData.scaleY) {
            imageData.scaleY = data.scaleY;
            transformed = true;
          }
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }

        var ratio = imageData.width / imageData.naturalWidth;

        if (isNumber(data.x)) {
          cropBoxData.left = data.x * ratio + canvasData.left;
        }

        if (isNumber(data.y)) {
          cropBoxData.top = data.y * ratio + canvasData.top;
        }

        if (isNumber(data.width)) {
          cropBoxData.width = data.width * ratio;
        }

        if (isNumber(data.height)) {
          cropBoxData.height = data.height * ratio;
        }

        this.setCropBoxData(cropBoxData);
      }

      return this;
    },

    /**
     * Get the container size data.
     * @returns {Object} The result container data.
     */
    getContainerData: function getContainerData() {
      return this.ready ? assign({}, this.containerData) : {};
    },

    /**
     * Get the image position and size data.
     * @returns {Object} The result image data.
     */
    getImageData: function getImageData() {
      return this.sized ? assign({}, this.imageData) : {};
    },

    /**
     * Get the canvas position and size data.
     * @returns {Object} The result canvas data.
     */
    getCanvasData: function getCanvasData() {
      var canvasData = this.canvasData;
      var data = {};

      if (this.ready) {
        forEach(['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'], function (n) {
          data[n] = canvasData[n];
        });
      }

      return data;
    },

    /**
     * Set the canvas position and size with new data.
     * @param {Object} data - The new canvas data.
     * @returns {Cropper} this
     */
    setCanvasData: function setCanvasData(data) {
      var canvasData = this.canvasData;
      var aspectRatio = canvasData.aspectRatio;

      if (this.ready && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          canvasData.left = data.left;
        }

        if (isNumber(data.top)) {
          canvasData.top = data.top;
        }

        if (isNumber(data.width)) {
          canvasData.width = data.width;
          canvasData.height = data.width / aspectRatio;
        } else if (isNumber(data.height)) {
          canvasData.height = data.height;
          canvasData.width = data.height * aspectRatio;
        }

        this.renderCanvas(true);
      }

      return this;
    },

    /**
     * Get the crop box position and size data.
     * @returns {Object} The result crop box data.
     */
    getCropBoxData: function getCropBoxData() {
      var cropBoxData = this.cropBoxData;
      var data;

      if (this.ready && this.cropped) {
        data = {
          left: cropBoxData.left,
          top: cropBoxData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };
      }

      return data || {};
    },

    /**
     * Set the crop box position and size with new data.
     * @param {Object} data - The new crop box data.
     * @returns {Cropper} this
     */
    setCropBoxData: function setCropBoxData(data) {
      var cropBoxData = this.cropBoxData;
      var aspectRatio = this.options.aspectRatio;
      var widthChanged;
      var heightChanged;

      if (this.ready && this.cropped && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          cropBoxData.left = data.left;
        }

        if (isNumber(data.top)) {
          cropBoxData.top = data.top;
        }

        if (isNumber(data.width) && data.width !== cropBoxData.width) {
          widthChanged = true;
          cropBoxData.width = data.width;
        }

        if (isNumber(data.height) && data.height !== cropBoxData.height) {
          heightChanged = true;
          cropBoxData.height = data.height;
        }

        if (aspectRatio) {
          if (widthChanged) {
            cropBoxData.height = cropBoxData.width / aspectRatio;
          } else if (heightChanged) {
            cropBoxData.width = cropBoxData.height * aspectRatio;
          }
        }

        this.renderCropBox();
      }

      return this;
    },

    /**
     * Get a canvas drawn the cropped image.
     * @param {Object} [options={}] - The config options.
     * @returns {HTMLCanvasElement} - The result canvas.
     */
    getCroppedCanvas: function getCroppedCanvas() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.ready || !window.HTMLCanvasElement) {
        return null;
      }

      var canvasData = this.canvasData;
      var source = getSourceCanvas(this.image, this.imageData, canvasData, options); // Returns the source canvas if it is not cropped.

      if (!this.cropped) {
        return source;
      }

      var _this$getData = this.getData(),
          initialX = _this$getData.x,
          initialY = _this$getData.y,
          initialWidth = _this$getData.width,
          initialHeight = _this$getData.height;

      var ratio = source.width / Math.floor(canvasData.naturalWidth);

      if (ratio !== 1) {
        initialX *= ratio;
        initialY *= ratio;
        initialWidth *= ratio;
        initialHeight *= ratio;
      }

      var aspectRatio = initialWidth / initialHeight;
      var maxSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.maxWidth || Infinity,
        height: options.maxHeight || Infinity
      });
      var minSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.minWidth || 0,
        height: options.minHeight || 0
      }, 'cover');

      var _getAdjustedSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.width || (ratio !== 1 ? source.width : initialWidth),
        height: options.height || (ratio !== 1 ? source.height : initialHeight)
      }),
          width = _getAdjustedSizes.width,
          height = _getAdjustedSizes.height;

      width = Math.min(maxSizes.width, Math.max(minSizes.width, width));
      height = Math.min(maxSizes.height, Math.max(minSizes.height, height));
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = normalizeDecimalNumber(width);
      canvas.height = normalizeDecimalNumber(height);
      context.fillStyle = options.fillColor || 'transparent';
      context.fillRect(0, 0, width, height);
      var _options$imageSmoothi = options.imageSmoothingEnabled,
          imageSmoothingEnabled = _options$imageSmoothi === void 0 ? true : _options$imageSmoothi,
          imageSmoothingQuality = options.imageSmoothingQuality;
      context.imageSmoothingEnabled = imageSmoothingEnabled;

      if (imageSmoothingQuality) {
        context.imageSmoothingQuality = imageSmoothingQuality;
      } // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage


      var sourceWidth = source.width;
      var sourceHeight = source.height; // Source canvas parameters

      var srcX = initialX;
      var srcY = initialY;
      var srcWidth;
      var srcHeight; // Destination canvas parameters

      var dstX;
      var dstY;
      var dstWidth;
      var dstHeight;

      if (srcX <= -initialWidth || srcX > sourceWidth) {
        srcX = 0;
        srcWidth = 0;
        dstX = 0;
        dstWidth = 0;
      } else if (srcX <= 0) {
        dstX = -srcX;
        srcX = 0;
        srcWidth = Math.min(sourceWidth, initialWidth + srcX);
        dstWidth = srcWidth;
      } else if (srcX <= sourceWidth) {
        dstX = 0;
        srcWidth = Math.min(initialWidth, sourceWidth - srcX);
        dstWidth = srcWidth;
      }

      if (srcWidth <= 0 || srcY <= -initialHeight || srcY > sourceHeight) {
        srcY = 0;
        srcHeight = 0;
        dstY = 0;
        dstHeight = 0;
      } else if (srcY <= 0) {
        dstY = -srcY;
        srcY = 0;
        srcHeight = Math.min(sourceHeight, initialHeight + srcY);
        dstHeight = srcHeight;
      } else if (srcY <= sourceHeight) {
        dstY = 0;
        srcHeight = Math.min(initialHeight, sourceHeight - srcY);
        dstHeight = srcHeight;
      }

      var params = [srcX, srcY, srcWidth, srcHeight]; // Avoid "IndexSizeError"

      if (dstWidth > 0 && dstHeight > 0) {
        var scale = width / initialWidth;
        params.push(dstX * scale, dstY * scale, dstWidth * scale, dstHeight * scale);
      } // All the numerical parameters should be integer for `drawImage`
      // https://github.com/fengyuanchen/cropper/issues/476


      context.drawImage.apply(context, [source].concat(_toConsumableArray(params.map(function (param) {
        return Math.floor(normalizeDecimalNumber(param));
      }))));
      return canvas;
    },

    /**
     * Change the aspect ratio of the crop box.
     * @param {number} aspectRatio - The new aspect ratio.
     * @returns {Cropper} this
     */
    setAspectRatio: function setAspectRatio(aspectRatio) {
      var options = this.options;

      if (!this.disabled && !isUndefined(aspectRatio)) {
        // 0 -> NaN
        options.aspectRatio = Math.max(0, aspectRatio) || NaN;

        if (this.ready) {
          this.initCropBox();

          if (this.cropped) {
            this.renderCropBox();
          }
        }
      }

      return this;
    },

    /**
     * Change the drag mode.
     * @param {string} mode - The new drag mode.
     * @returns {Cropper} this
     */
    setDragMode: function setDragMode(mode) {
      var options = this.options,
          dragBox = this.dragBox,
          face = this.face;

      if (this.ready && !this.disabled) {
        var croppable = mode === DRAG_MODE_CROP;
        var movable = options.movable && mode === DRAG_MODE_MOVE;
        mode = croppable || movable ? mode : DRAG_MODE_NONE;
        options.dragMode = mode;
        setData(dragBox, DATA_ACTION, mode);
        toggleClass(dragBox, CLASS_CROP, croppable);
        toggleClass(dragBox, CLASS_MOVE, movable);

        if (!options.cropBoxMovable) {
          // Sync drag mode to crop box when it is not movable
          setData(face, DATA_ACTION, mode);
          toggleClass(face, CLASS_CROP, croppable);
          toggleClass(face, CLASS_MOVE, movable);
        }
      }

      return this;
    }
  };

  var AnotherCropper = WINDOW.Cropper;

  var Cropper = /*#__PURE__*/function () {
    /**
     * Create a new Cropper.
     * @param {Element} element - The target element for cropping.
     * @param {Object} [options={}] - The configuration options.
     */
    function Cropper(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Cropper);

      if (!element || !REGEXP_TAG_NAME.test(element.tagName)) {
        throw new Error('The first argument is required and must be an <img> or <canvas> element.');
      }

      this.element = element;
      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.cropped = false;
      this.disabled = false;
      this.pointers = {};
      this.ready = false;
      this.reloading = false;
      this.replaced = false;
      this.sized = false;
      this.sizing = false;
      this.init();
    }

    _createClass(Cropper, [{
      key: "init",
      value: function init() {
        var element = this.element;
        var tagName = element.tagName.toLowerCase();
        var url;

        if (element[NAMESPACE]) {
          return;
        }

        element[NAMESPACE] = this;

        if (tagName === 'img') {
          this.isImg = true; // e.g.: "img/picture.jpg"

          url = element.getAttribute('src') || '';
          this.originalUrl = url; // Stop when it's a blank image

          if (!url) {
            return;
          } // e.g.: "https://example.com/img/picture.jpg"


          url = element.src;
        } else if (tagName === 'canvas' && window.HTMLCanvasElement) {
          url = element.toDataURL();
        }

        this.load(url);
      }
    }, {
      key: "load",
      value: function load(url) {
        var _this = this;

        if (!url) {
          return;
        }

        this.url = url;
        this.imageData = {};
        var element = this.element,
            options = this.options;

        if (!options.rotatable && !options.scalable) {
          options.checkOrientation = false;
        } // Only IE10+ supports Typed Arrays


        if (!options.checkOrientation || !window.ArrayBuffer) {
          this.clone();
          return;
        } // Detect the mime type of the image directly if it is a Data URL


        if (REGEXP_DATA_URL.test(url)) {
          // Read ArrayBuffer from Data URL of JPEG images directly for better performance
          if (REGEXP_DATA_URL_JPEG.test(url)) {
            this.read(dataURLToArrayBuffer(url));
          } else {
            // Only a JPEG image may contains Exif Orientation information,
            // the rest types of Data URLs are not necessary to check orientation at all.
            this.clone();
          }

          return;
        } // 1. Detect the mime type of the image by a XMLHttpRequest.
        // 2. Load the image as ArrayBuffer for reading orientation if its a JPEG image.


        var xhr = new XMLHttpRequest();
        var clone = this.clone.bind(this);
        this.reloading = true;
        this.xhr = xhr; // 1. Cross origin requests are only supported for protocol schemes:
        // http, https, data, chrome, chrome-extension.
        // 2. Access to XMLHttpRequest from a Data URL will be blocked by CORS policy
        // in some browsers as IE11 and Safari.

        xhr.onabort = clone;
        xhr.onerror = clone;
        xhr.ontimeout = clone;

        xhr.onprogress = function () {
          // Abort the request directly if it not a JPEG image for better performance
          if (xhr.getResponseHeader('content-type') !== MIME_TYPE_JPEG) {
            xhr.abort();
          }
        };

        xhr.onload = function () {
          _this.read(xhr.response);
        };

        xhr.onloadend = function () {
          _this.reloading = false;
          _this.xhr = null;
        }; // Bust cache when there is a "crossOrigin" property to avoid browser cache error


        if (options.checkCrossOrigin && isCrossOriginURL(url) && element.crossOrigin) {
          url = addTimestamp(url);
        } // The third parameter is required for avoiding side-effect (#682)


        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = element.crossOrigin === 'use-credentials';
        xhr.send();
      }
    }, {
      key: "read",
      value: function read(arrayBuffer) {
        var options = this.options,
            imageData = this.imageData; // Reset the orientation value to its default value 1
        // as some iOS browsers will render image with its orientation

        var orientation = resetAndGetOrientation(arrayBuffer);
        var rotate = 0;
        var scaleX = 1;
        var scaleY = 1;

        if (orientation > 1) {
          // Generate a new URL which has the default orientation value
          this.url = arrayBufferToDataURL(arrayBuffer, MIME_TYPE_JPEG);

          var _parseOrientation = parseOrientation(orientation);

          rotate = _parseOrientation.rotate;
          scaleX = _parseOrientation.scaleX;
          scaleY = _parseOrientation.scaleY;
        }

        if (options.rotatable) {
          imageData.rotate = rotate;
        }

        if (options.scalable) {
          imageData.scaleX = scaleX;
          imageData.scaleY = scaleY;
        }

        this.clone();
      }
    }, {
      key: "clone",
      value: function clone() {
        var element = this.element,
            url = this.url;
        var crossOrigin = element.crossOrigin;
        var crossOriginUrl = url;

        if (this.options.checkCrossOrigin && isCrossOriginURL(url)) {
          if (!crossOrigin) {
            crossOrigin = 'anonymous';
          } // Bust cache when there is not a "crossOrigin" property (#519)


          crossOriginUrl = addTimestamp(url);
        }

        this.crossOrigin = crossOrigin;
        this.crossOriginUrl = crossOriginUrl;
        var image = document.createElement('img');

        if (crossOrigin) {
          image.crossOrigin = crossOrigin;
        }

        image.src = crossOriginUrl || url;
        image.alt = element.alt || 'The image to crop';
        this.image = image;
        image.onload = this.start.bind(this);
        image.onerror = this.stop.bind(this);
        addClass(image, CLASS_HIDE);
        element.parentNode.insertBefore(image, element.nextSibling);
      }
    }, {
      key: "start",
      value: function start() {
        var _this2 = this;

        var image = this.image;
        image.onload = null;
        image.onerror = null;
        this.sizing = true; // Match all browsers that use WebKit as the layout engine in iOS devices,
        // such as Safari for iOS, Chrome for iOS, and in-app browsers.

        var isIOSWebKit = WINDOW.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(WINDOW.navigator.userAgent);

        var done = function done(naturalWidth, naturalHeight) {
          assign(_this2.imageData, {
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            aspectRatio: naturalWidth / naturalHeight
          });
          _this2.initialImageData = assign({}, _this2.imageData);
          _this2.sizing = false;
          _this2.sized = true;

          _this2.build();
        }; // Most modern browsers (excepts iOS WebKit)


        if (image.naturalWidth && !isIOSWebKit) {
          done(image.naturalWidth, image.naturalHeight);
          return;
        }

        var sizingImage = document.createElement('img');
        var body = document.body || document.documentElement;
        this.sizingImage = sizingImage;

        sizingImage.onload = function () {
          done(sizingImage.width, sizingImage.height);

          if (!isIOSWebKit) {
            body.removeChild(sizingImage);
          }
        };

        sizingImage.src = image.src; // iOS WebKit will convert the image automatically
        // with its orientation once append it into DOM (#279)

        if (!isIOSWebKit) {
          sizingImage.style.cssText = 'left:0;' + 'max-height:none!important;' + 'max-width:none!important;' + 'min-height:0!important;' + 'min-width:0!important;' + 'opacity:0;' + 'position:absolute;' + 'top:0;' + 'z-index:-1;';
          body.appendChild(sizingImage);
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        var image = this.image;
        image.onload = null;
        image.onerror = null;
        image.parentNode.removeChild(image);
        this.image = null;
      }
    }, {
      key: "build",
      value: function build() {
        if (!this.sized || this.ready) {
          return;
        }

        var element = this.element,
            options = this.options,
            image = this.image; // Create cropper elements

        var container = element.parentNode;
        var template = document.createElement('div');
        template.innerHTML = TEMPLATE;
        var cropper = template.querySelector(".".concat(NAMESPACE, "-container"));
        var canvas = cropper.querySelector(".".concat(NAMESPACE, "-canvas"));
        var dragBox = cropper.querySelector(".".concat(NAMESPACE, "-drag-box"));
        var cropBox = cropper.querySelector(".".concat(NAMESPACE, "-crop-box"));
        var face = cropBox.querySelector(".".concat(NAMESPACE, "-face"));
        this.container = container;
        this.cropper = cropper;
        this.canvas = canvas;
        this.dragBox = dragBox;
        this.cropBox = cropBox;
        this.viewBox = cropper.querySelector(".".concat(NAMESPACE, "-view-box"));
        this.face = face;
        canvas.appendChild(image); // Hide the original image

        addClass(element, CLASS_HIDDEN); // Inserts the cropper after to the current image

        container.insertBefore(cropper, element.nextSibling); // Show the image if is hidden

        if (!this.isImg) {
          removeClass(image, CLASS_HIDE);
        }

        this.initPreview();
        this.bind();
        options.initialAspectRatio = Math.max(0, options.initialAspectRatio) || NaN;
        options.aspectRatio = Math.max(0, options.aspectRatio) || NaN;
        options.viewMode = Math.max(0, Math.min(3, Math.round(options.viewMode))) || 0;
        addClass(cropBox, CLASS_HIDDEN);

        if (!options.guides) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-dashed")), CLASS_HIDDEN);
        }

        if (!options.center) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-center")), CLASS_HIDDEN);
        }

        if (options.background) {
          addClass(cropper, "".concat(NAMESPACE, "-bg"));
        }

        if (!options.highlight) {
          addClass(face, CLASS_INVISIBLE);
        }

        if (options.cropBoxMovable) {
          addClass(face, CLASS_MOVE);
          setData(face, DATA_ACTION, ACTION_ALL);
        }

        if (!options.cropBoxResizable) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-line")), CLASS_HIDDEN);
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-point")), CLASS_HIDDEN);
        }

        this.render();
        this.ready = true;
        this.setDragMode(options.dragMode);

        if (options.autoCrop) {
          this.crop();
        }

        this.setData(options.data);

        if (isFunction(options.ready)) {
          addListener(element, EVENT_READY, options.ready, {
            once: true
          });
        }

        dispatchEvent(element, EVENT_READY);
      }
    }, {
      key: "unbuild",
      value: function unbuild() {
        if (!this.ready) {
          return;
        }

        this.ready = false;
        this.unbind();
        this.resetPreview();
        this.cropper.parentNode.removeChild(this.cropper);
        removeClass(this.element, CLASS_HIDDEN);
      }
    }, {
      key: "uncreate",
      value: function uncreate() {
        if (this.ready) {
          this.unbuild();
          this.ready = false;
          this.cropped = false;
        } else if (this.sizing) {
          this.sizingImage.onload = null;
          this.sizing = false;
          this.sized = false;
        } else if (this.reloading) {
          this.xhr.onabort = null;
          this.xhr.abort();
        } else if (this.image) {
          this.stop();
        }
      }
      /**
       * Get the no conflict cropper class.
       * @returns {Cropper} The cropper class.
       */

    }], [{
      key: "noConflict",
      value: function noConflict() {
        window.Cropper = AnotherCropper;
        return Cropper;
      }
      /**
       * Change the default options.
       * @param {Object} options - The new default options.
       */

    }, {
      key: "setDefaults",
      value: function setDefaults(options) {
        assign(DEFAULTS, isPlainObject(options) && options);
      }
    }]);

    return Cropper;
  }();

  assign(Cropper.prototype, render, preview, events, handlers, change, methods);

  return Cropper;

})));

(function ($) {
  'use strict';

  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];

  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href'
  ];

  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;

  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', 'tabindex', 'style', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  }

  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;

  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  function allowedAttribute (attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase()

    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
      }

      return true
    }

    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp
    })

    // Check if a regular expression validates the attribute.
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true
      }
    }

    return false
  }

  function sanitizeHtml (unsafeElements, whiteList, sanitizeFn) {
    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeElements);
    }

    var whitelistKeys = Object.keys(whiteList);

    for (var i = 0, len = unsafeElements.length; i < len; i++) {
      var elements = unsafeElements[i].querySelectorAll('*');

      for (var j = 0, len2 = elements.length; j < len2; j++) {
        var el = elements[j];
        var elName = el.nodeName.toLowerCase();

        if (whitelistKeys.indexOf(elName) === -1) {
          el.parentNode.removeChild(el);

          continue;
        }

        var attributeList = [].slice.call(el.attributes);
        var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []);

        for (var k = 0, len3 = attributeList.length; k < len3; k++) {
          var attr = attributeList[k];

          if (!allowedAttribute(attr, whitelistedAttributes)) {
            el.removeAttribute(attr.nodeName);
          }
        }
      }
    }
  }

  // Polyfill for browsers with no classList support
  // Remove in v2
  if (!('classList' in document.createElement('_'))) {
    (function (view) {
      if (!('Element' in view)) return;

      var classListProp = 'classList',
          protoProp = 'prototype',
          elemCtrProto = view.Element[protoProp],
          objCtr = Object,
          classListGetter = function () {
            var $elem = $(this);

            return {
              add: function (classes) {
                classes = Array.prototype.slice.call(arguments).join(' ');
                return $elem.addClass(classes);
              },
              remove: function (classes) {
                classes = Array.prototype.slice.call(arguments).join(' ');
                return $elem.removeClass(classes);
              },
              toggle: function (classes, force) {
                return $elem.toggleClass(classes, force);
              },
              contains: function (classes) {
                return $elem.hasClass(classes);
              }
            }
          };

      if (objCtr.defineProperty) {
        var classListPropDesc = {
          get: classListGetter,
          enumerable: true,
          configurable: true
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
          // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
          // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
          if (ex.number === undefined || ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }
    }(window));
  }

  var testElement = document.createElement('_');

  testElement.classList.add('c1', 'c2');

  if (!testElement.classList.contains('c2')) {
    var _add = DOMTokenList.prototype.add,
        _remove = DOMTokenList.prototype.remove;

    DOMTokenList.prototype.add = function () {
      Array.prototype.forEach.call(arguments, _add.bind(this));
    }

    DOMTokenList.prototype.remove = function () {
      Array.prototype.forEach.call(arguments, _remove.bind(this));
    }
  }

  testElement.classList.toggle('c3', false);

  // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
  // support the second argument.
  if (testElement.classList.contains('c3')) {
    var _toggle = DOMTokenList.prototype.toggle;

    DOMTokenList.prototype.toggle = function (token, force) {
      if (1 in arguments && !this.contains(token) === !force) {
        return force;
      } else {
        return _toggle.call(this, token);
      }
    };
  }

  testElement = null;

  // shallow array comparison
  function isEqual (array1, array2) {
    return array1.length === array2.length && array1.every(function (element, index) {
      return element === array2[index];
    });
  };

  // <editor-fold desc="Shims">
  if (!String.prototype.startsWith) {
    (function () {
      'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
      var defineProperty = (function () {
        // IE 8 only supports `Object.defineProperty` on DOM elements
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {
        }
        return result;
      }());
      var toString = {}.toString;
      var startsWith = function (search) {
        if (this == null) {
          throw new TypeError();
        }
        var string = String(this);
        if (search && toString.call(search) == '[object RegExp]') {
          throw new TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        // `ToInteger`
        var pos = position ? Number(position) : 0;
        if (pos != pos) { // better `isNaN`
          pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        // Avoid the `indexOf` call if no match is possible
        if (searchLength + start > stringLength) {
          return false;
        }
        var index = -1;
        while (++index < searchLength) {
          if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
            return false;
          }
        }
        return true;
      };
      if (defineProperty) {
        defineProperty(String.prototype, 'startsWith', {
          'value': startsWith,
          'configurable': true,
          'writable': true
        });
      } else {
        String.prototype.startsWith = startsWith;
      }
    }());
  }

  if (!Object.keys) {
    Object.keys = function (
      o, // object
      k, // key
      r  // result array
    ) {
      // initialize object and result
      r = [];
      // iterate over object keys
      for (k in o) {
        // fill result array with non-prototypical keys
        r.hasOwnProperty.call(o, k) && r.push(k);
      }
      // return result
      return r;
    };
  }

  if (HTMLSelectElement && !HTMLSelectElement.prototype.hasOwnProperty('selectedOptions')) {
    Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
      get: function () {
        return this.querySelectorAll(':checked');
      }
    });
  }

  function getSelectedOptions (select, ignoreDisabled) {
    var selectedOptions = select.selectedOptions,
        options = [],
        opt;

    if (ignoreDisabled) {
      for (var i = 0, len = selectedOptions.length; i < len; i++) {
        opt = selectedOptions[i];

        if (!(opt.disabled || opt.parentNode.tagName === 'OPTGROUP' && opt.parentNode.disabled)) {
          options.push(opt);
        }
      }

      return options;
    }

    return selectedOptions;
  }

  // much faster than $.val()
  function getSelectValues (select, selectedOptions) {
    var value = [],
        options = selectedOptions || select.selectedOptions,
        opt;

    for (var i = 0, len = options.length; i < len; i++) {
      opt = options[i];

      if (!(opt.disabled || opt.parentNode.tagName === 'OPTGROUP' && opt.parentNode.disabled)) {
        value.push(opt.value);
      }
    }

    if (!select.multiple) {
      return !value.length ? null : value[0];
    }

    return value;
  }

  // set data-selected on select element if the value has been programmatically selected
  // prior to initialization of bootstrap-select
  // * consider removing or replacing an alternative method *
  var valHooks = {
    useDefault: false,
    _set: $.valHooks.select.set
  };

  $.valHooks.select.set = function (elem, value) {
    if (value && !valHooks.useDefault) $(elem).data('selected', true);

    return valHooks._set.apply(this, arguments);
  };

  var changedArguments = null;

  var EventIsSupported = (function () {
    try {
      new Event('change');
      return true;
    } catch (e) {
      return false;
    }
  })();

  $.fn.triggerNative = function (eventName) {
    var el = this[0],
        event;

    if (el.dispatchEvent) { // for modern browsers & IE9+
      if (EventIsSupported) {
        // For modern browsers
        event = new Event(eventName, {
          bubbles: true
        });
      } else {
        // For IE since it doesn't support Event constructor
        event = document.createEvent('Event');
        event.initEvent(eventName, true, false);
      }

      el.dispatchEvent(event);
    } else if (el.fireEvent) { // for IE8
      event = document.createEventObject();
      event.eventType = eventName;
      el.fireEvent('on' + eventName, event);
    } else {
      // fall back to jQuery.trigger
      this.trigger(eventName);
    }
  };
  // </editor-fold>

  function stringSearch (li, searchString, method, normalize) {
    var stringTypes = [
          'display',
          'subtext',
          'tokens'
        ],
        searchSuccess = false;

    for (var i = 0; i < stringTypes.length; i++) {
      var stringType = stringTypes[i],
          string = li[stringType];

      if (string) {
        string = string.toString();

        // Strip HTML tags. This isn't perfect, but it's much faster than any other method
        if (stringType === 'display') {
          string = string.replace(/<[^>]+>/g, '');
        }

        if (normalize) string = normalizeToBase(string);
        string = string.toUpperCase();

        if (method === 'contains') {
          searchSuccess = string.indexOf(searchString) >= 0;
        } else {
          searchSuccess = string.startsWith(searchString);
        }

        if (searchSuccess) break;
      }
    }

    return searchSuccess;
  }

  function toInteger (value) {
    return parseInt(value, 10) || 0;
  }

  // Borrowed from Lodash (_.deburr)
  /** Used to map Latin Unicode letters to basic Latin letters. */
  var deburredLetters = {
    // Latin-1 Supplement block.
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    // Latin Extended-A block.
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };

  /** Used to match Latin Unicode letters (excluding mathematical operators). */
  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

  /** Used to compose unicode character classes. */
  var rsComboMarksRange = '\\u0300-\\u036f',
      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange = '\\u20d0-\\u20ff',
      rsComboMarksExtendedRange = '\\u1ab0-\\u1aff',
      rsComboMarksSupplementRange = '\\u1dc0-\\u1dff',
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange;

  /** Used to compose unicode capture groups. */
  var rsCombo = '[' + rsComboRange + ']';

  /**
   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
   * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
   */
  var reComboMark = RegExp(rsCombo, 'g');

  function deburrLetter (key) {
    return deburredLetters[key];
  };

  function normalizeToBase (string) {
    string = string.toString();
    return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
  }

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function (map) {
    var escaper = function (match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + Object.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };

  var htmlEscape = createEscaper(escapeMap);

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var keyCodeMap = {
    32: ' ',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    59: ';',
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    71: 'G',
    72: 'H',
    73: 'I',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    96: '0',
    97: '1',
    98: '2',
    99: '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: '9'
  };

  var keyCodes = {
    ESCAPE: 27, // KeyboardEvent.which value for Escape (Esc) key
    ENTER: 13, // KeyboardEvent.which value for Enter key
    SPACE: 32, // KeyboardEvent.which value for space key
    TAB: 9, // KeyboardEvent.which value for tab key
    ARROW_UP: 38, // KeyboardEvent.which value for up arrow key
    ARROW_DOWN: 40 // KeyboardEvent.which value for down arrow key
  }

  var version = {
    success: false,
    major: '3'
  };

  try {
    version.full = ($.fn.dropdown.Constructor.VERSION || '').split(' ')[0].split('.');
    version.major = version.full[0];
    version.success = true;
  } catch (err) {
    // do nothing
  }

  var selectId = 0;

  var EVENT_KEY = '.bs.select';

  var classNames = {
    DISABLED: 'disabled',
    DIVIDER: 'divider',
    SHOW: 'open',
    DROPUP: 'dropup',
    MENU: 'dropdown-menu',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    // to-do: replace with more advanced template/customization options
    BUTTONCLASS: 'btn-default',
    POPOVERHEADER: 'popover-title',
    ICONBASE: 'glyphicon',
    TICKICON: 'glyphicon-ok'
  }

  var Selector = {
    MENU: '.' + classNames.MENU
  }

  var elementTemplates = {
    div: document.createElement('div'),
    span: document.createElement('span'),
    i: document.createElement('i'),
    subtext: document.createElement('small'),
    a: document.createElement('a'),
    li: document.createElement('li'),
    whitespace: document.createTextNode('\u00A0'),
    fragment: document.createDocumentFragment()
  }

  elementTemplates.noResults = elementTemplates.li.cloneNode(false);
  elementTemplates.noResults.className = 'no-results';

  elementTemplates.a.setAttribute('role', 'option');
  elementTemplates.a.className = 'dropdown-item';

  elementTemplates.subtext.className = 'text-muted';

  elementTemplates.text = elementTemplates.span.cloneNode(false);
  elementTemplates.text.className = 'text';

  elementTemplates.checkMark = elementTemplates.span.cloneNode(false);

  var REGEXP_ARROW = new RegExp(keyCodes.ARROW_UP + '|' + keyCodes.ARROW_DOWN);
  var REGEXP_TAB_OR_ESCAPE = new RegExp('^' + keyCodes.TAB + '$|' + keyCodes.ESCAPE);

  var generateOption = {
    li: function (content, classes, optgroup) {
      var li = elementTemplates.li.cloneNode(false);

      if (content) {
        if (content.nodeType === 1 || content.nodeType === 11) {
          li.appendChild(content);
        } else {
          li.innerHTML = content;
        }
      }

      if (typeof classes !== 'undefined' && classes !== '') li.className = classes;
      if (typeof optgroup !== 'undefined' && optgroup !== null) li.classList.add('optgroup-' + optgroup);

      return li;
    },

    a: function (text, classes, inline) {
      var a = elementTemplates.a.cloneNode(true);

      if (text) {
        if (text.nodeType === 11) {
          a.appendChild(text);
        } else {
          a.insertAdjacentHTML('beforeend', text);
        }
      }

      if (typeof classes !== 'undefined' && classes !== '') a.classList.add.apply(a.classList, classes.split(/\s+/));
      if (inline) a.setAttribute('style', inline);

      return a;
    },

    text: function (options, useFragment) {
      var textElement = elementTemplates.text.cloneNode(false),
          subtextElement,
          iconElement;

      if (options.content) {
        textElement.innerHTML = options.content;
      } else {
        textElement.textContent = options.text;

        if (options.icon) {
          var whitespace = elementTemplates.whitespace.cloneNode(false);

          // need to use <i> for icons in the button to prevent a breaking change
          // note: switch to span in next major release
          iconElement = (useFragment === true ? elementTemplates.i : elementTemplates.span).cloneNode(false);
          iconElement.className = this.options.iconBase + ' ' + options.icon;

          elementTemplates.fragment.appendChild(iconElement);
          elementTemplates.fragment.appendChild(whitespace);
        }

        if (options.subtext) {
          subtextElement = elementTemplates.subtext.cloneNode(false);
          subtextElement.textContent = options.subtext;
          textElement.appendChild(subtextElement);
        }
      }

      if (useFragment === true) {
        while (textElement.childNodes.length > 0) {
          elementTemplates.fragment.appendChild(textElement.childNodes[0]);
        }
      } else {
        elementTemplates.fragment.appendChild(textElement);
      }

      return elementTemplates.fragment;
    },

    label: function (options) {
      var textElement = elementTemplates.text.cloneNode(false),
          subtextElement,
          iconElement;

      textElement.innerHTML = options.display;

      if (options.icon) {
        var whitespace = elementTemplates.whitespace.cloneNode(false);

        iconElement = elementTemplates.span.cloneNode(false);
        iconElement.className = this.options.iconBase + ' ' + options.icon;

        elementTemplates.fragment.appendChild(iconElement);
        elementTemplates.fragment.appendChild(whitespace);
      }

      if (options.subtext) {
        subtextElement = elementTemplates.subtext.cloneNode(false);
        subtextElement.textContent = options.subtext;
        textElement.appendChild(subtextElement);
      }

      elementTemplates.fragment.appendChild(textElement);

      return elementTemplates.fragment;
    }
  }

  function showNoResults (searchMatch, searchValue) {
    if (!searchMatch.length) {
      elementTemplates.noResults.innerHTML = this.options.noneResultsText.replace('{0}', '"' + htmlEscape(searchValue) + '"');
      this.$menuInner[0].firstChild.appendChild(elementTemplates.noResults);
    }
  }

  var Selectpicker = function (element, options) {
    var that = this;

    // bootstrap-select has been initialized - revert valHooks.select.set back to its original function
    if (!valHooks.useDefault) {
      $.valHooks.select.set = valHooks._set;
      valHooks.useDefault = true;
    }

    this.$element = $(element);
    this.$newElement = null;
    this.$button = null;
    this.$menu = null;
    this.options = options;
    this.selectpicker = {
      main: {},
      search: {},
      current: {}, // current changes if a search is in progress
      view: {},
      isSearching: false,
      keydown: {
        keyHistory: '',
        resetKeyHistory: {
          start: function () {
            return setTimeout(function () {
              that.selectpicker.keydown.keyHistory = '';
            }, 800);
          }
        }
      }
    };

    this.sizeInfo = {};

    // If we have no title yet, try to pull it from the html title attribute (jQuery doesnt' pick it up as it's not a
    // data-attribute)
    if (this.options.title === null) {
      this.options.title = this.$element.attr('title');
    }

    // Format window padding
    var winPad = this.options.windowPadding;
    if (typeof winPad === 'number') {
      this.options.windowPadding = [winPad, winPad, winPad, winPad];
    }

    // Expose public methods
    this.val = Selectpicker.prototype.val;
    this.render = Selectpicker.prototype.render;
    this.refresh = Selectpicker.prototype.refresh;
    this.setStyle = Selectpicker.prototype.setStyle;
    this.selectAll = Selectpicker.prototype.selectAll;
    this.deselectAll = Selectpicker.prototype.deselectAll;
    this.destroy = Selectpicker.prototype.destroy;
    this.remove = Selectpicker.prototype.remove;
    this.show = Selectpicker.prototype.show;
    this.hide = Selectpicker.prototype.hide;

    this.init();
  };

  Selectpicker.VERSION = '1.13.18';

  // part of this is duplicated in i18n/defaults-en_US.js. Make sure to update both.
  Selectpicker.DEFAULTS = {
    noneSelectedText: 'Nothing selected',
    noneResultsText: 'No results matched {0}',
    countSelectedText: function (numSelected, numTotal) {
      return (numSelected == 1) ? '{0} item selected' : '{0} items selected';
    },
    maxOptionsText: function (numAll, numGroup) {
      return [
        (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
        (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
      ];
    },
    selectAllText: 'Select All',
    deselectAllText: 'Deselect All',
    doneButton: false,
    doneButtonText: 'Close',
    multipleSeparator: ', ',
    styleBase: 'btn',
    style: classNames.BUTTONCLASS,
    size: 'auto',
    title: null,
    selectedTextFormat: 'values',
    width: false,
    container: false,
    hideDisabled: false,
    showSubtext: false,
    showIcon: true,
    showContent: true,
    dropupAuto: true,
    header: false,
    liveSearch: false,
    liveSearchPlaceholder: null,
    liveSearchNormalize: false,
    liveSearchStyle: 'contains',
    actionsBox: false,
    iconBase: classNames.ICONBASE,
    tickIcon: classNames.TICKICON,
    showTick: false,
    template: {
      caret: '<span class="caret"></span>'
    },
    maxOptions: false,
    mobile: false,
    selectOnTab: false,
    dropdownAlignRight: false,
    windowPadding: 0,
    virtualScroll: 600,
    display: false,
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist
  };

  Selectpicker.prototype = {

    constructor: Selectpicker,

    init: function () {
      var that = this,
          id = this.$element.attr('id'),
          element = this.$element[0],
          form = element.form;

      selectId++;
      this.selectId = 'bs-select-' + selectId;

      element.classList.add('bs-select-hidden');

      this.multiple = this.$element.prop('multiple');
      this.autofocus = this.$element.prop('autofocus');

      if (element.classList.contains('show-tick')) {
        this.options.showTick = true;
      }

      this.$newElement = this.createDropdown();
      this.buildData();
      this.$element
        .after(this.$newElement)
        .prependTo(this.$newElement);

      // ensure select is associated with form element if it got unlinked after moving it inside newElement
      if (form && element.form === null) {
        if (!form.id) form.id = 'form-' + this.selectId;
        element.setAttribute('form', form.id);
      }

      this.$button = this.$newElement.children('button');
      this.$menu = this.$newElement.children(Selector.MENU);
      this.$menuInner = this.$menu.children('.inner');
      this.$searchbox = this.$menu.find('input');

      element.classList.remove('bs-select-hidden');

      if (this.options.dropdownAlignRight === true) this.$menu[0].classList.add(classNames.MENURIGHT);

      if (typeof id !== 'undefined') {
        this.$button.attr('data-id', id);
      }

      this.checkDisabled();
      this.clickListener();

      if (this.options.liveSearch) {
        this.liveSearchListener();
        this.focusedParent = this.$searchbox[0];
      } else {
        this.focusedParent = this.$menuInner[0];
      }

      this.setStyle();
      this.render();
      this.setWidth();
      if (this.options.container) {
        this.selectPosition();
      } else {
        this.$element.on('hide' + EVENT_KEY, function () {
          if (that.isVirtual()) {
            // empty menu on close
            var menuInner = that.$menuInner[0],
                emptyMenu = menuInner.firstChild.cloneNode(false);

            // replace the existing UL with an empty one - this is faster than $.empty() or innerHTML = ''
            menuInner.replaceChild(emptyMenu, menuInner.firstChild);
            menuInner.scrollTop = 0;
          }
        });
      }
      this.$menu.data('this', this);
      this.$newElement.data('this', this);
      if (this.options.mobile) this.mobile();

      this.$newElement.on({
        'hide.bs.dropdown': function (e) {
          that.$element.trigger('hide' + EVENT_KEY, e);
        },
        'hidden.bs.dropdown': function (e) {
          that.$element.trigger('hidden' + EVENT_KEY, e);
        },
        'show.bs.dropdown': function (e) {
          that.$element.trigger('show' + EVENT_KEY, e);
        },
        'shown.bs.dropdown': function (e) {
          that.$element.trigger('shown' + EVENT_KEY, e);
        }
      });

      if (element.hasAttribute('required')) {
        this.$element.on('invalid' + EVENT_KEY, function () {
          that.$button[0].classList.add('bs-invalid');

          that.$element
            .on('shown' + EVENT_KEY + '.invalid', function () {
              that.$element
                .val(that.$element.val()) // set the value to hide the validation message in Chrome when menu is opened
                .off('shown' + EVENT_KEY + '.invalid');
            })
            .on('rendered' + EVENT_KEY, function () {
              // if select is no longer invalid, remove the bs-invalid class
              if (this.validity.valid) that.$button[0].classList.remove('bs-invalid');
              that.$element.off('rendered' + EVENT_KEY);
            });

          that.$button.on('blur' + EVENT_KEY, function () {
            that.$element.trigger('focus').trigger('blur');
            that.$button.off('blur' + EVENT_KEY);
          });
        });
      }

      setTimeout(function () {
        that.buildList();
        that.$element.trigger('loaded' + EVENT_KEY);
      });
    },

    createDropdown: function () {
      // Options
      // If we are multiple or showTick option is set, then add the show-tick class
      var showTick = (this.multiple || this.options.showTick) ? ' show-tick' : '',
          multiselectable = this.multiple ? ' aria-multiselectable="true"' : '',
          inputGroup = '',
          autofocus = this.autofocus ? ' autofocus' : '';

      if (version.major < 4 && this.$element.parent().hasClass('input-group')) {
        inputGroup = ' input-group-btn';
      }

      // Elements
      var drop,
          header = '',
          searchbox = '',
          actionsbox = '',
          donebutton = '';

      if (this.options.header) {
        header =
          '<div class="' + classNames.POPOVERHEADER + '">' +
            '<button type="button" class="close" aria-hidden="true">&times;</button>' +
              this.options.header +
          '</div>';
      }

      if (this.options.liveSearch) {
        searchbox =
          '<div class="bs-searchbox">' +
            '<input type="search" class="form-control" autocomplete="off"' +
              (
                this.options.liveSearchPlaceholder === null ? ''
                :
                ' placeholder="' + htmlEscape(this.options.liveSearchPlaceholder) + '"'
              ) +
              ' role="combobox" aria-label="Search" aria-controls="' + this.selectId + '" aria-autocomplete="list">' +
          '</div>';
      }

      if (this.multiple && this.options.actionsBox) {
        actionsbox =
          '<div class="bs-actionsbox">' +
            '<div class="btn-group btn-group-sm btn-block">' +
              '<button type="button" class="actions-btn bs-select-all btn ' + classNames.BUTTONCLASS + '">' +
                this.options.selectAllText +
              '</button>' +
              '<button type="button" class="actions-btn bs-deselect-all btn ' + classNames.BUTTONCLASS + '">' +
                this.options.deselectAllText +
              '</button>' +
            '</div>' +
          '</div>';
      }

      if (this.multiple && this.options.doneButton) {
        donebutton =
          '<div class="bs-donebutton">' +
            '<div class="btn-group btn-block">' +
              '<button type="button" class="btn btn-sm ' + classNames.BUTTONCLASS + '">' +
                this.options.doneButtonText +
              '</button>' +
            '</div>' +
          '</div>';
      }

      drop =
        '<div class="dropdown bootstrap-select' + showTick + inputGroup + '">' +
          '<button type="button" tabindex="-1" class="' + this.options.styleBase + ' dropdown-toggle" ' + (this.options.display === 'static' ? 'data-display="static"' : '') + 'data-toggle="dropdown"' + autofocus + ' role="combobox" aria-owns="' + this.selectId + '" aria-haspopup="listbox" aria-expanded="false">' +
            '<div class="filter-option">' +
              '<div class="filter-option-inner">' +
                '<div class="filter-option-inner-inner"></div>' +
              '</div> ' +
            '</div>' +
            (
              version.major === '4' ? ''
              :
              '<span class="bs-caret">' +
                this.options.template.caret +
              '</span>'
            ) +
          '</button>' +
          '<div class="' + classNames.MENU + ' ' + (version.major === '4' ? '' : classNames.SHOW) + '">' +
            header +
            searchbox +
            actionsbox +
            '<div class="inner ' + classNames.SHOW + '" role="listbox" id="' + this.selectId + '" tabindex="-1" ' + multiselectable + '>' +
                '<ul class="' + classNames.MENU + ' inner ' + (version.major === '4' ? classNames.SHOW : '') + '" role="presentation">' +
                '</ul>' +
            '</div>' +
            donebutton +
          '</div>' +
        '</div>';

      return $(drop);
    },

    setPositionData: function () {
      this.selectpicker.view.canHighlight = [];
      this.selectpicker.view.size = 0;
      this.selectpicker.view.firstHighlightIndex = false;

      for (var i = 0; i < this.selectpicker.current.data.length; i++) {
        var li = this.selectpicker.current.data[i],
            canHighlight = true;

        if (li.type === 'divider') {
          canHighlight = false;
          li.height = this.sizeInfo.dividerHeight;
        } else if (li.type === 'optgroup-label') {
          canHighlight = false;
          li.height = this.sizeInfo.dropdownHeaderHeight;
        } else {
          li.height = this.sizeInfo.liHeight;
        }

        if (li.disabled) canHighlight = false;

        this.selectpicker.view.canHighlight.push(canHighlight);

        if (canHighlight) {
          this.selectpicker.view.size++;
          li.posinset = this.selectpicker.view.size;
          if (this.selectpicker.view.firstHighlightIndex === false) this.selectpicker.view.firstHighlightIndex = i;
        }

        li.position = (i === 0 ? 0 : this.selectpicker.current.data[i - 1].position) + li.height;
      }
    },

    isVirtual: function () {
      return (this.options.virtualScroll !== false) && (this.selectpicker.main.elements.length >= this.options.virtualScroll) || this.options.virtualScroll === true;
    },

    createView: function (isSearching, setSize, refresh) {
      var that = this,
          scrollTop = 0,
          active = [],
          selected,
          prevActive;

      this.selectpicker.isSearching = isSearching;
      this.selectpicker.current = isSearching ? this.selectpicker.search : this.selectpicker.main;

      this.setPositionData();

      if (setSize) {
        if (refresh) {
          scrollTop = this.$menuInner[0].scrollTop;
        } else if (!that.multiple) {
          var element = that.$element[0],
              selectedIndex = (element.options[element.selectedIndex] || {}).liIndex;

          if (typeof selectedIndex === 'number' && that.options.size !== false) {
            var selectedData = that.selectpicker.main.data[selectedIndex],
                position = selectedData && selectedData.position;

            if (position) {
              scrollTop = position - ((that.sizeInfo.menuInnerHeight + that.sizeInfo.liHeight) / 2);
            }
          }
        }
      }

      scroll(scrollTop, true);

      this.$menuInner.off('scroll.createView').on('scroll.createView', function (e, updateValue) {
        if (!that.noScroll) scroll(this.scrollTop, updateValue);
        that.noScroll = false;
      });

      function scroll (scrollTop, init) {
        var size = that.selectpicker.current.elements.length,
            chunks = [],
            chunkSize,
            chunkCount,
            firstChunk,
            lastChunk,
            currentChunk,
            prevPositions,
            positionIsDifferent,
            previousElements,
            menuIsDifferent = true,
            isVirtual = that.isVirtual();

        that.selectpicker.view.scrollTop = scrollTop;

        chunkSize = Math.ceil(that.sizeInfo.menuInnerHeight / that.sizeInfo.liHeight * 1.5); // number of options in a chunk
        chunkCount = Math.round(size / chunkSize) || 1; // number of chunks

        for (var i = 0; i < chunkCount; i++) {
          var endOfChunk = (i + 1) * chunkSize;

          if (i === chunkCount - 1) {
            endOfChunk = size;
          }

          chunks[i] = [
            (i) * chunkSize + (!i ? 0 : 1),
            endOfChunk
          ];

          if (!size) break;

          if (currentChunk === undefined && scrollTop - 1 <= that.selectpicker.current.data[endOfChunk - 1].position - that.sizeInfo.menuInnerHeight) {
            currentChunk = i;
          }
        }

        if (currentChunk === undefined) currentChunk = 0;

        prevPositions = [that.selectpicker.view.position0, that.selectpicker.view.position1];

        // always display previous, current, and next chunks
        firstChunk = Math.max(0, currentChunk - 1);
        lastChunk = Math.min(chunkCount - 1, currentChunk + 1);

        that.selectpicker.view.position0 = isVirtual === false ? 0 : (Math.max(0, chunks[firstChunk][0]) || 0);
        that.selectpicker.view.position1 = isVirtual === false ? size : (Math.min(size, chunks[lastChunk][1]) || 0);

        positionIsDifferent = prevPositions[0] !== that.selectpicker.view.position0 || prevPositions[1] !== that.selectpicker.view.position1;

        if (that.activeIndex !== undefined) {
          prevActive = that.selectpicker.main.elements[that.prevActiveIndex];
          active = that.selectpicker.main.elements[that.activeIndex];
          selected = that.selectpicker.main.elements[that.selectedIndex];

          if (init) {
            if (that.activeIndex !== that.selectedIndex) {
              that.defocusItem(active);
            }
            that.activeIndex = undefined;
          }

          if (that.activeIndex && that.activeIndex !== that.selectedIndex) {
            that.defocusItem(selected);
          }
        }

        if (that.prevActiveIndex !== undefined && that.prevActiveIndex !== that.activeIndex && that.prevActiveIndex !== that.selectedIndex) {
          that.defocusItem(prevActive);
        }

        if (init || positionIsDifferent) {
          previousElements = that.selectpicker.view.visibleElements ? that.selectpicker.view.visibleElements.slice() : [];

          if (isVirtual === false) {
            that.selectpicker.view.visibleElements = that.selectpicker.current.elements;
          } else {
            that.selectpicker.view.visibleElements = that.selectpicker.current.elements.slice(that.selectpicker.view.position0, that.selectpicker.view.position1);
          }

          that.setOptionStatus();

          // if searching, check to make sure the list has actually been updated before updating DOM
          // this prevents unnecessary repaints
          if (isSearching || (isVirtual === false && init)) menuIsDifferent = !isEqual(previousElements, that.selectpicker.view.visibleElements);

          // if virtual scroll is disabled and not searching,
          // menu should never need to be updated more than once
          if ((init || isVirtual === true) && menuIsDifferent) {
            var menuInner = that.$menuInner[0],
                menuFragment = document.createDocumentFragment(),
                emptyMenu = menuInner.firstChild.cloneNode(false),
                marginTop,
                marginBottom,
                elements = that.selectpicker.view.visibleElements,
                toSanitize = [];

            // replace the existing UL with an empty one - this is faster than $.empty()
            menuInner.replaceChild(emptyMenu, menuInner.firstChild);

            for (var i = 0, visibleElementsLen = elements.length; i < visibleElementsLen; i++) {
              var element = elements[i],
                  elText,
                  elementData;

              if (that.options.sanitize) {
                elText = element.lastChild;

                if (elText) {
                  elementData = that.selectpicker.current.data[i + that.selectpicker.view.position0];

                  if (elementData && elementData.content && !elementData.sanitized) {
                    toSanitize.push(elText);
                    elementData.sanitized = true;
                  }
                }
              }

              menuFragment.appendChild(element);
            }

            if (that.options.sanitize && toSanitize.length) {
              sanitizeHtml(toSanitize, that.options.whiteList, that.options.sanitizeFn);
            }

            if (isVirtual === true) {
              marginTop = (that.selectpicker.view.position0 === 0 ? 0 : that.selectpicker.current.data[that.selectpicker.view.position0 - 1].position);
              marginBottom = (that.selectpicker.view.position1 > size - 1 ? 0 : that.selectpicker.current.data[size - 1].position - that.selectpicker.current.data[that.selectpicker.view.position1 - 1].position);

              menuInner.firstChild.style.marginTop = marginTop + 'px';
              menuInner.firstChild.style.marginBottom = marginBottom + 'px';
            } else {
              menuInner.firstChild.style.marginTop = 0;
              menuInner.firstChild.style.marginBottom = 0;
            }

            menuInner.firstChild.appendChild(menuFragment);

            // if an option is encountered that is wider than the current menu width, update the menu width accordingly
            // switch to ResizeObserver with increased browser support
            if (isVirtual === true && that.sizeInfo.hasScrollBar) {
              var menuInnerInnerWidth = menuInner.firstChild.offsetWidth;

              if (init && menuInnerInnerWidth < that.sizeInfo.menuInnerInnerWidth && that.sizeInfo.totalMenuWidth > that.sizeInfo.selectWidth) {
                menuInner.firstChild.style.minWidth = that.sizeInfo.menuInnerInnerWidth + 'px';
              } else if (menuInnerInnerWidth > that.sizeInfo.menuInnerInnerWidth) {
                // set to 0 to get actual width of menu
                that.$menu[0].style.minWidth = 0;

                var actualMenuWidth = menuInner.firstChild.offsetWidth;

                if (actualMenuWidth > that.sizeInfo.menuInnerInnerWidth) {
                  that.sizeInfo.menuInnerInnerWidth = actualMenuWidth;
                  menuInner.firstChild.style.minWidth = that.sizeInfo.menuInnerInnerWidth + 'px';
                }

                // reset to default CSS styling
                that.$menu[0].style.minWidth = '';
              }
            }
          }
        }

        that.prevActiveIndex = that.activeIndex;

        if (!that.options.liveSearch) {
          that.$menuInner.trigger('focus');
        } else if (isSearching && init) {
          var index = 0,
              newActive;

          if (!that.selectpicker.view.canHighlight[index]) {
            index = 1 + that.selectpicker.view.canHighlight.slice(1).indexOf(true);
          }

          newActive = that.selectpicker.view.visibleElements[index];

          that.defocusItem(that.selectpicker.view.currentActive);

          that.activeIndex = (that.selectpicker.current.data[index] || {}).index;

          that.focusItem(newActive);
        }
      }

      $(window)
        .off('resize' + EVENT_KEY + '.' + this.selectId + '.createView')
        .on('resize' + EVENT_KEY + '.' + this.selectId + '.createView', function () {
          var isActive = that.$newElement.hasClass(classNames.SHOW);

          if (isActive) scroll(that.$menuInner[0].scrollTop);
        });
    },

    focusItem: function (li, liData, noStyle) {
      if (li) {
        liData = liData || this.selectpicker.main.data[this.activeIndex];
        var a = li.firstChild;

        if (a) {
          a.setAttribute('aria-setsize', this.selectpicker.view.size);
          a.setAttribute('aria-posinset', liData.posinset);

          if (noStyle !== true) {
            this.focusedParent.setAttribute('aria-activedescendant', a.id);
            li.classList.add('active');
            a.classList.add('active');
          }
        }
      }
    },

    defocusItem: function (li) {
      if (li) {
        li.classList.remove('active');
        if (li.firstChild) li.firstChild.classList.remove('active');
      }
    },

    setPlaceholder: function () {
      var that = this,
          updateIndex = false;

      if (this.options.title && !this.multiple) {
        if (!this.selectpicker.view.titleOption) this.selectpicker.view.titleOption = document.createElement('option');

        // this option doesn't create a new <li> element, but does add a new option at the start,
        // so startIndex should increase to prevent having to check every option for the bs-title-option class
        updateIndex = true;

        var element = this.$element[0],
            selectTitleOption = false,
            titleNotAppended = !this.selectpicker.view.titleOption.parentNode,
            selectedIndex = element.selectedIndex,
            selectedOption = element.options[selectedIndex],
            navigation = window.performance && window.performance.getEntriesByType('navigation'),
            // Safari doesn't support getEntriesByType('navigation') - fall back to performance.navigation
            isNotBackForward = (navigation && navigation.length) ? navigation[0].type !== 'back_forward' : window.performance.navigation.type !== 2;

        if (titleNotAppended) {
          // Use native JS to prepend option (faster)
          this.selectpicker.view.titleOption.className = 'bs-title-option';
          this.selectpicker.view.titleOption.value = '';

          // Check if selected or data-selected attribute is already set on an option. If not, select the titleOption option.
          // the selected item may have been changed by user or programmatically before the bootstrap select plugin runs,
          // if so, the select will have the data-selected attribute
          selectTitleOption = !selectedOption || (selectedIndex === 0 && selectedOption.defaultSelected === false && this.$element.data('selected') === undefined);
        }

        if (titleNotAppended || this.selectpicker.view.titleOption.index !== 0) {
          element.insertBefore(this.selectpicker.view.titleOption, element.firstChild);
        }

        // Set selected *after* appending to select,
        // otherwise the option doesn't get selected in IE
        // set using selectedIndex, as setting the selected attr to true here doesn't work in IE11
        if (selectTitleOption && isNotBackForward) {
          element.selectedIndex = 0;
        } else if (document.readyState !== 'complete') {
          // if navigation type is back_forward, there's a chance the select will have its value set by BFCache
          // wait for that value to be set, then run render again
          window.addEventListener('pageshow', function () {
            if (that.selectpicker.view.displayedValue !== element.value) that.render();
          });
        }
      }

      return updateIndex;
    },

    buildData: function () {
      var optionSelector = ':not([hidden]):not([data-hidden="true"])',
          mainData = [],
          optID = 0,
          startIndex = this.setPlaceholder() ? 1 : 0; // append the titleOption if necessary and skip the first option in the loop

      if (this.options.hideDisabled) optionSelector += ':not(:disabled)';

      var selectOptions = this.$element[0].querySelectorAll('select > *' + optionSelector);

      function addDivider (config) {
        var previousData = mainData[mainData.length - 1];

        // ensure optgroup doesn't create back-to-back dividers
        if (
          previousData &&
          previousData.type === 'divider' &&
          (previousData.optID || config.optID)
        ) {
          return;
        }

        config = config || {};
        config.type = 'divider';

        mainData.push(config);
      }

      function addOption (option, config) {
        config = config || {};

        config.divider = option.getAttribute('data-divider') === 'true';

        if (config.divider) {
          addDivider({
            optID: config.optID
          });
        } else {
          var liIndex = mainData.length,
              cssText = option.style.cssText,
              inlineStyle = cssText ? htmlEscape(cssText) : '',
              optionClass = (option.className || '') + (config.optgroupClass || '');

          if (config.optID) optionClass = 'opt ' + optionClass;

          config.optionClass = optionClass.trim();
          config.inlineStyle = inlineStyle;
          config.text = option.textContent;

          config.content = option.getAttribute('data-content');
          config.tokens = option.getAttribute('data-tokens');
          config.subtext = option.getAttribute('data-subtext');
          config.icon = option.getAttribute('data-icon');

          option.liIndex = liIndex;

          config.display = config.content || config.text;
          config.type = 'option';
          config.index = liIndex;
          config.option = option;
          config.selected = !!option.selected;
          config.disabled = config.disabled || !!option.disabled;

          mainData.push(config);
        }
      }

      function addOptgroup (index, selectOptions) {
        var optgroup = selectOptions[index],
            // skip placeholder option
            previous = index - 1 < startIndex ? false : selectOptions[index - 1],
            next = selectOptions[index + 1],
            options = optgroup.querySelectorAll('option' + optionSelector);

        if (!options.length) return;

        var config = {
              display: htmlEscape(optgroup.label),
              subtext: optgroup.getAttribute('data-subtext'),
              icon: optgroup.getAttribute('data-icon'),
              type: 'optgroup-label',
              optgroupClass: ' ' + (optgroup.className || '')
            },
            headerIndex,
            lastIndex;

        optID++;

        if (previous) {
          addDivider({ optID: optID });
        }

        config.optID = optID;

        mainData.push(config);

        for (var j = 0, len = options.length; j < len; j++) {
          var option = options[j];

          if (j === 0) {
            headerIndex = mainData.length - 1;
            lastIndex = headerIndex + len;
          }

          addOption(option, {
            headerIndex: headerIndex,
            lastIndex: lastIndex,
            optID: config.optID,
            optgroupClass: config.optgroupClass,
            disabled: optgroup.disabled
          });
        }

        if (next) {
          addDivider({ optID: optID });
        }
      }

      for (var len = selectOptions.length, i = startIndex; i < len; i++) {
        var item = selectOptions[i];

        if (item.tagName !== 'OPTGROUP') {
          addOption(item, {});
        } else {
          addOptgroup(i, selectOptions);
        }
      }

      this.selectpicker.main.data = this.selectpicker.current.data = mainData;
    },

    buildList: function () {
      var that = this,
          selectData = this.selectpicker.main.data,
          mainElements = [],
          widestOptionLength = 0;

      if ((that.options.showTick || that.multiple) && !elementTemplates.checkMark.parentNode) {
        elementTemplates.checkMark.className = this.options.iconBase + ' ' + that.options.tickIcon + ' check-mark';
        elementTemplates.a.appendChild(elementTemplates.checkMark);
      }

      function buildElement (item) {
        var liElement,
            combinedLength = 0;

        switch (item.type) {
          case 'divider':
            liElement = generateOption.li(
              false,
              classNames.DIVIDER,
              (item.optID ? item.optID + 'div' : undefined)
            );

            break;

          case 'option':
            liElement = generateOption.li(
              generateOption.a(
                generateOption.text.call(that, item),
                item.optionClass,
                item.inlineStyle
              ),
              '',
              item.optID
            );

            if (liElement.firstChild) {
              liElement.firstChild.id = that.selectId + '-' + item.index;
            }

            break;

          case 'optgroup-label':
            liElement = generateOption.li(
              generateOption.label.call(that, item),
              'dropdown-header' + item.optgroupClass,
              item.optID
            );

            break;
        }

        item.element = liElement;
        mainElements.push(liElement);

        // count the number of characters in the option - not perfect, but should work in most cases
        if (item.display) combinedLength += item.display.length;
        if (item.subtext) combinedLength += item.subtext.length;
        // if there is an icon, ensure this option's width is checked
        if (item.icon) combinedLength += 1;

        if (combinedLength > widestOptionLength) {
          widestOptionLength = combinedLength;

          // guess which option is the widest
          // use this when calculating menu width
          // not perfect, but it's fast, and the width will be updating accordingly when scrolling
          that.selectpicker.view.widestOption = mainElements[mainElements.length - 1];
        }
      }

      for (var len = selectData.length, i = 0; i < len; i++) {
        var item = selectData[i];

        buildElement(item);
      }

      this.selectpicker.main.elements = this.selectpicker.current.elements = mainElements;
    },

    findLis: function () {
      return this.$menuInner.find('.inner > li');
    },

    render: function () {
      var that = this,
          element = this.$element[0],
          // ensure titleOption is appended and selected (if necessary) before getting selectedOptions
          placeholderSelected = this.setPlaceholder() && element.selectedIndex === 0,
          selectedOptions = getSelectedOptions(element, this.options.hideDisabled),
          selectedCount = selectedOptions.length,
          button = this.$button[0],
          buttonInner = button.querySelector('.filter-option-inner-inner'),
          multipleSeparator = document.createTextNode(this.options.multipleSeparator),
          titleFragment = elementTemplates.fragment.cloneNode(false),
          showCount,
          countMax,
          hasContent = false;

      button.classList.toggle('bs-placeholder', that.multiple ? !selectedCount : !getSelectValues(element, selectedOptions));

      if (!that.multiple && selectedOptions.length === 1) {
        that.selectpicker.view.displayedValue = getSelectValues(element, selectedOptions);
      }

      if (this.options.selectedTextFormat === 'static') {
        titleFragment = generateOption.text.call(this, { text: this.options.title }, true);
      } else {
        showCount = this.multiple && this.options.selectedTextFormat.indexOf('count') !== -1 && selectedCount > 1;

        // determine if the number of selected options will be shown (showCount === true)
        if (showCount) {
          countMax = this.options.selectedTextFormat.split('>');
          showCount = (countMax.length > 1 && selectedCount > countMax[1]) || (countMax.length === 1 && selectedCount >= 2);
        }

        // only loop through all selected options if the count won't be shown
        if (showCount === false) {
          if (!placeholderSelected) {
            for (var selectedIndex = 0; selectedIndex < selectedCount; selectedIndex++) {
              if (selectedIndex < 50) {
                var option = selectedOptions[selectedIndex],
                    thisData = this.selectpicker.main.data[option.liIndex],
                    titleOptions = {};

                if (this.multiple && selectedIndex > 0) {
                  titleFragment.appendChild(multipleSeparator.cloneNode(false));
                }

                if (option.title) {
                  titleOptions.text = option.title;
                } else if (thisData) {
                  if (thisData.content && that.options.showContent) {
                    titleOptions.content = thisData.content.toString();
                    hasContent = true;
                  } else {
                    if (that.options.showIcon) {
                      titleOptions.icon = thisData.icon;
                    }
                    if (that.options.showSubtext && !that.multiple && thisData.subtext) titleOptions.subtext = ' ' + thisData.subtext;
                    titleOptions.text = option.textContent.trim();
                  }
                }

                titleFragment.appendChild(generateOption.text.call(this, titleOptions, true));
              } else {
                break;
              }
            }

            // add ellipsis
            if (selectedCount > 49) {
              titleFragment.appendChild(document.createTextNode('...'));
            }
          }
        } else {
          var optionSelector = ':not([hidden]):not([data-hidden="true"]):not([data-divider="true"])';
          if (this.options.hideDisabled) optionSelector += ':not(:disabled)';

          // If this is a multiselect, and selectedTextFormat is count, then show 1 of 2 selected, etc.
          var totalCount = this.$element[0].querySelectorAll('select > option' + optionSelector + ', optgroup' + optionSelector + ' option' + optionSelector).length,
              tr8nText = (typeof this.options.countSelectedText === 'function') ? this.options.countSelectedText(selectedCount, totalCount) : this.options.countSelectedText;

          titleFragment = generateOption.text.call(this, {
            text: tr8nText.replace('{0}', selectedCount.toString()).replace('{1}', totalCount.toString())
          }, true);
        }
      }

      if (this.options.title == undefined) {
        // use .attr to ensure undefined is returned if title attribute is not set
        this.options.title = this.$element.attr('title');
      }

      // If the select doesn't have a title, then use the default, or if nothing is set at all, use noneSelectedText
      if (!titleFragment.childNodes.length) {
        titleFragment = generateOption.text.call(this, {
          text: typeof this.options.title !== 'undefined' ? this.options.title : this.options.noneSelectedText
        }, true);
      }

      // strip all HTML tags and trim the result, then unescape any escaped tags
      button.title = titleFragment.textContent.replace(/<[^>]*>?/g, '').trim();

      if (this.options.sanitize && hasContent) {
        sanitizeHtml([titleFragment], that.options.whiteList, that.options.sanitizeFn);
      }

      buttonInner.innerHTML = '';
      buttonInner.appendChild(titleFragment);

      if (version.major < 4 && this.$newElement[0].classList.contains('bs3-has-addon')) {
        var filterExpand = button.querySelector('.filter-expand'),
            clone = buttonInner.cloneNode(true);

        clone.className = 'filter-expand';

        if (filterExpand) {
          button.replaceChild(clone, filterExpand);
        } else {
          button.appendChild(clone);
        }
      }

      this.$element.trigger('rendered' + EVENT_KEY);
    },

    /**
     * @param [style]
     * @param [status]
     */
    setStyle: function (newStyle, status) {
      var button = this.$button[0],
          newElement = this.$newElement[0],
          style = this.options.style.trim(),
          buttonClass;

      if (this.$element.attr('class')) {
        this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi, ''));
      }

      if (version.major < 4) {
        newElement.classList.add('bs3');

        if (newElement.parentNode.classList && newElement.parentNode.classList.contains('input-group') &&
            (newElement.previousElementSibling || newElement.nextElementSibling) &&
            (newElement.previousElementSibling || newElement.nextElementSibling).classList.contains('input-group-addon')
        ) {
          newElement.classList.add('bs3-has-addon');
        }
      }

      if (newStyle) {
        buttonClass = newStyle.trim();
      } else {
        buttonClass = style;
      }

      if (status == 'add') {
        if (buttonClass) button.classList.add.apply(button.classList, buttonClass.split(' '));
      } else if (status == 'remove') {
        if (buttonClass) button.classList.remove.apply(button.classList, buttonClass.split(' '));
      } else {
        if (style) button.classList.remove.apply(button.classList, style.split(' '));
        if (buttonClass) button.classList.add.apply(button.classList, buttonClass.split(' '));
      }
    },

    liHeight: function (refresh) {
      if (!refresh && (this.options.size === false || Object.keys(this.sizeInfo).length)) return;

      var newElement = elementTemplates.div.cloneNode(false),
          menu = elementTemplates.div.cloneNode(false),
          menuInner = elementTemplates.div.cloneNode(false),
          menuInnerInner = document.createElement('ul'),
          divider = elementTemplates.li.cloneNode(false),
          dropdownHeader = elementTemplates.li.cloneNode(false),
          li,
          a = elementTemplates.a.cloneNode(false),
          text = elementTemplates.span.cloneNode(false),
          header = this.options.header && this.$menu.find('.' + classNames.POPOVERHEADER).length > 0 ? this.$menu.find('.' + classNames.POPOVERHEADER)[0].cloneNode(true) : null,
          search = this.options.liveSearch ? elementTemplates.div.cloneNode(false) : null,
          actions = this.options.actionsBox && this.multiple && this.$menu.find('.bs-actionsbox').length > 0 ? this.$menu.find('.bs-actionsbox')[0].cloneNode(true) : null,
          doneButton = this.options.doneButton && this.multiple && this.$menu.find('.bs-donebutton').length > 0 ? this.$menu.find('.bs-donebutton')[0].cloneNode(true) : null,
          firstOption = this.$element.find('option')[0];

      this.sizeInfo.selectWidth = this.$newElement[0].offsetWidth;

      text.className = 'text';
      a.className = 'dropdown-item ' + (firstOption ? firstOption.className : '');
      newElement.className = this.$menu[0].parentNode.className + ' ' + classNames.SHOW;
      newElement.style.width = 0; // ensure button width doesn't affect natural width of menu when calculating
      if (this.options.width === 'auto') menu.style.minWidth = 0;
      menu.className = classNames.MENU + ' ' + classNames.SHOW;
      menuInner.className = 'inner ' + classNames.SHOW;
      menuInnerInner.className = classNames.MENU + ' inner ' + (version.major === '4' ? classNames.SHOW : '');
      divider.className = classNames.DIVIDER;
      dropdownHeader.className = 'dropdown-header';

      text.appendChild(document.createTextNode('\u200b'));

      if (this.selectpicker.current.data.length) {
        for (var i = 0; i < this.selectpicker.current.data.length; i++) {
          var data = this.selectpicker.current.data[i];
          if (data.type === 'option') {
            li = data.element;
            break;
          }
        }
      } else {
        li = elementTemplates.li.cloneNode(false);
        a.appendChild(text);
        li.appendChild(a);
      }

      dropdownHeader.appendChild(text.cloneNode(true));

      if (this.selectpicker.view.widestOption) {
        menuInnerInner.appendChild(this.selectpicker.view.widestOption.cloneNode(true));
      }

      menuInnerInner.appendChild(li);
      menuInnerInner.appendChild(divider);
      menuInnerInner.appendChild(dropdownHeader);
      if (header) menu.appendChild(header);
      if (search) {
        var input = document.createElement('input');
        search.className = 'bs-searchbox';
        input.className = 'form-control';
        search.appendChild(input);
        menu.appendChild(search);
      }
      if (actions) menu.appendChild(actions);
      menuInner.appendChild(menuInnerInner);
      menu.appendChild(menuInner);
      if (doneButton) menu.appendChild(doneButton);
      newElement.appendChild(menu);

      document.body.appendChild(newElement);

      var liHeight = li.offsetHeight,
          dropdownHeaderHeight = dropdownHeader ? dropdownHeader.offsetHeight : 0,
          headerHeight = header ? header.offsetHeight : 0,
          searchHeight = search ? search.offsetHeight : 0,
          actionsHeight = actions ? actions.offsetHeight : 0,
          doneButtonHeight = doneButton ? doneButton.offsetHeight : 0,
          dividerHeight = $(divider).outerHeight(true),
          // fall back to jQuery if getComputedStyle is not supported
          menuStyle = window.getComputedStyle ? window.getComputedStyle(menu) : false,
          menuWidth = menu.offsetWidth,
          $menu = menuStyle ? null : $(menu),
          menuPadding = {
            vert: toInteger(menuStyle ? menuStyle.paddingTop : $menu.css('paddingTop')) +
                  toInteger(menuStyle ? menuStyle.paddingBottom : $menu.css('paddingBottom')) +
                  toInteger(menuStyle ? menuStyle.borderTopWidth : $menu.css('borderTopWidth')) +
                  toInteger(menuStyle ? menuStyle.borderBottomWidth : $menu.css('borderBottomWidth')),
            horiz: toInteger(menuStyle ? menuStyle.paddingLeft : $menu.css('paddingLeft')) +
                  toInteger(menuStyle ? menuStyle.paddingRight : $menu.css('paddingRight')) +
                  toInteger(menuStyle ? menuStyle.borderLeftWidth : $menu.css('borderLeftWidth')) +
                  toInteger(menuStyle ? menuStyle.borderRightWidth : $menu.css('borderRightWidth'))
          },
          menuExtras = {
            vert: menuPadding.vert +
                  toInteger(menuStyle ? menuStyle.marginTop : $menu.css('marginTop')) +
                  toInteger(menuStyle ? menuStyle.marginBottom : $menu.css('marginBottom')) + 2,
            horiz: menuPadding.horiz +
                  toInteger(menuStyle ? menuStyle.marginLeft : $menu.css('marginLeft')) +
                  toInteger(menuStyle ? menuStyle.marginRight : $menu.css('marginRight')) + 2
          },
          scrollBarWidth;

      menuInner.style.overflowY = 'scroll';

      scrollBarWidth = menu.offsetWidth - menuWidth;

      document.body.removeChild(newElement);

      this.sizeInfo.liHeight = liHeight;
      this.sizeInfo.dropdownHeaderHeight = dropdownHeaderHeight;
      this.sizeInfo.headerHeight = headerHeight;
      this.sizeInfo.searchHeight = searchHeight;
      this.sizeInfo.actionsHeight = actionsHeight;
      this.sizeInfo.doneButtonHeight = doneButtonHeight;
      this.sizeInfo.dividerHeight = dividerHeight;
      this.sizeInfo.menuPadding = menuPadding;
      this.sizeInfo.menuExtras = menuExtras;
      this.sizeInfo.menuWidth = menuWidth;
      this.sizeInfo.menuInnerInnerWidth = menuWidth - menuPadding.horiz;
      this.sizeInfo.totalMenuWidth = this.sizeInfo.menuWidth;
      this.sizeInfo.scrollBarWidth = scrollBarWidth;
      this.sizeInfo.selectHeight = this.$newElement[0].offsetHeight;

      this.setPositionData();
    },

    getSelectPosition: function () {
      var that = this,
          $window = $(window),
          pos = that.$newElement.offset(),
          $container = $(that.options.container),
          containerPos;

      if (that.options.container && $container.length && !$container.is('body')) {
        containerPos = $container.offset();
        containerPos.top += parseInt($container.css('borderTopWidth'));
        containerPos.left += parseInt($container.css('borderLeftWidth'));
      } else {
        containerPos = { top: 0, left: 0 };
      }

      var winPad = that.options.windowPadding;

      this.sizeInfo.selectOffsetTop = pos.top - containerPos.top - $window.scrollTop();
      this.sizeInfo.selectOffsetBot = $window.height() - this.sizeInfo.selectOffsetTop - this.sizeInfo.selectHeight - containerPos.top - winPad[2];
      this.sizeInfo.selectOffsetLeft = pos.left - containerPos.left - $window.scrollLeft();
      this.sizeInfo.selectOffsetRight = $window.width() - this.sizeInfo.selectOffsetLeft - this.sizeInfo.selectWidth - containerPos.left - winPad[1];
      this.sizeInfo.selectOffsetTop -= winPad[0];
      this.sizeInfo.selectOffsetLeft -= winPad[3];
    },

    setMenuSize: function (isAuto) {
      this.getSelectPosition();

      var selectWidth = this.sizeInfo.selectWidth,
          liHeight = this.sizeInfo.liHeight,
          headerHeight = this.sizeInfo.headerHeight,
          searchHeight = this.sizeInfo.searchHeight,
          actionsHeight = this.sizeInfo.actionsHeight,
          doneButtonHeight = this.sizeInfo.doneButtonHeight,
          divHeight = this.sizeInfo.dividerHeight,
          menuPadding = this.sizeInfo.menuPadding,
          menuInnerHeight,
          menuHeight,
          divLength = 0,
          minHeight,
          _minHeight,
          maxHeight,
          menuInnerMinHeight,
          estimate,
          isDropup;

      if (this.options.dropupAuto) {
        // Get the estimated height of the menu without scrollbars.
        // This is useful for smaller menus, where there might be plenty of room
        // below the button without setting dropup, but we can't know
        // the exact height of the menu until createView is called later
        estimate = liHeight * this.selectpicker.current.elements.length + menuPadding.vert;

        isDropup = this.sizeInfo.selectOffsetTop - this.sizeInfo.selectOffsetBot > this.sizeInfo.menuExtras.vert && estimate + this.sizeInfo.menuExtras.vert + 50 > this.sizeInfo.selectOffsetBot;

        // ensure dropup doesn't change while searching (so menu doesn't bounce back and forth)
        if (this.selectpicker.isSearching === true) {
          isDropup = this.selectpicker.dropup;
        }

        this.$newElement.toggleClass(classNames.DROPUP, isDropup);
        this.selectpicker.dropup = isDropup;
      }

      if (this.options.size === 'auto') {
        _minHeight = this.selectpicker.current.elements.length > 3 ? this.sizeInfo.liHeight * 3 + this.sizeInfo.menuExtras.vert - 2 : 0;
        menuHeight = this.sizeInfo.selectOffsetBot - this.sizeInfo.menuExtras.vert;
        minHeight = _minHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight;
        menuInnerMinHeight = Math.max(_minHeight - menuPadding.vert, 0);

        if (this.$newElement.hasClass(classNames.DROPUP)) {
          menuHeight = this.sizeInfo.selectOffsetTop - this.sizeInfo.menuExtras.vert;
        }

        maxHeight = menuHeight;
        menuInnerHeight = menuHeight - headerHeight - searchHeight - actionsHeight - doneButtonHeight - menuPadding.vert;
      } else if (this.options.size && this.options.size != 'auto' && this.selectpicker.current.elements.length > this.options.size) {
        for (var i = 0; i < this.options.size; i++) {
          if (this.selectpicker.current.data[i].type === 'divider') divLength++;
        }

        menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding.vert;
        menuInnerHeight = menuHeight - menuPadding.vert;
        maxHeight = menuHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight;
        minHeight = menuInnerMinHeight = '';
      }

      this.$menu.css({
        'max-height': maxHeight + 'px',
        'overflow': 'hidden',
        'min-height': minHeight + 'px'
      });

      this.$menuInner.css({
        'max-height': menuInnerHeight + 'px',
        'overflow-y': 'auto',
        'min-height': menuInnerMinHeight + 'px'
      });

      // ensure menuInnerHeight is always a positive number to prevent issues calculating chunkSize in createView
      this.sizeInfo.menuInnerHeight = Math.max(menuInnerHeight, 1);

      if (this.selectpicker.current.data.length && this.selectpicker.current.data[this.selectpicker.current.data.length - 1].position > this.sizeInfo.menuInnerHeight) {
        this.sizeInfo.hasScrollBar = true;
        this.sizeInfo.totalMenuWidth = this.sizeInfo.menuWidth + this.sizeInfo.scrollBarWidth;
      }

      if (this.options.dropdownAlignRight === 'auto') {
        this.$menu.toggleClass(classNames.MENURIGHT, this.sizeInfo.selectOffsetLeft > this.sizeInfo.selectOffsetRight && this.sizeInfo.selectOffsetRight < (this.sizeInfo.totalMenuWidth - selectWidth));
      }

      if (this.dropdown && this.dropdown._popper) this.dropdown._popper.update();
    },

    setSize: function (refresh) {
      this.liHeight(refresh);

      if (this.options.header) this.$menu.css('padding-top', 0);

      if (this.options.size !== false) {
        var that = this,
            $window = $(window);

        this.setMenuSize();

        if (this.options.liveSearch) {
          this.$searchbox
            .off('input.setMenuSize propertychange.setMenuSize')
            .on('input.setMenuSize propertychange.setMenuSize', function () {
              return that.setMenuSize();
            });
        }

        if (this.options.size === 'auto') {
          $window
            .off('resize' + EVENT_KEY + '.' + this.selectId + '.setMenuSize' + ' scroll' + EVENT_KEY + '.' + this.selectId + '.setMenuSize')
            .on('resize' + EVENT_KEY + '.' + this.selectId + '.setMenuSize' + ' scroll' + EVENT_KEY + '.' + this.selectId + '.setMenuSize', function () {
              return that.setMenuSize();
            });
        } else if (this.options.size && this.options.size != 'auto' && this.selectpicker.current.elements.length > this.options.size) {
          $window.off('resize' + EVENT_KEY + '.' + this.selectId + '.setMenuSize' + ' scroll' + EVENT_KEY + '.' + this.selectId + '.setMenuSize');
        }
      }

      this.createView(false, true, refresh);
    },

    setWidth: function () {
      var that = this;

      if (this.options.width === 'auto') {
        requestAnimationFrame(function () {
          that.$menu.css('min-width', '0');

          that.$element.on('loaded' + EVENT_KEY, function () {
            that.liHeight();
            that.setMenuSize();

            // Get correct width if element is hidden
            var $selectClone = that.$newElement.clone().appendTo('body'),
                btnWidth = $selectClone.css('width', 'auto').children('button').outerWidth();

            $selectClone.remove();

            // Set width to whatever's larger, button title or longest option
            that.sizeInfo.selectWidth = Math.max(that.sizeInfo.totalMenuWidth, btnWidth);
            that.$newElement.css('width', that.sizeInfo.selectWidth + 'px');
          });
        });
      } else if (this.options.width === 'fit') {
        // Remove inline min-width so width can be changed from 'auto'
        this.$menu.css('min-width', '');
        this.$newElement.css('width', '').addClass('fit-width');
      } else if (this.options.width) {
        // Remove inline min-width so width can be changed from 'auto'
        this.$menu.css('min-width', '');
        this.$newElement.css('width', this.options.width);
      } else {
        // Remove inline min-width/width so width can be changed
        this.$menu.css('min-width', '');
        this.$newElement.css('width', '');
      }
      // Remove fit-width class if width is changed programmatically
      if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
        this.$newElement[0].classList.remove('fit-width');
      }
    },

    selectPosition: function () {
      this.$bsContainer = $('<div class="bs-container" />');

      var that = this,
          $container = $(this.options.container),
          pos,
          containerPos,
          actualHeight,
          getPlacement = function ($element) {
            var containerPosition = {},
                // fall back to dropdown's default display setting if display is not manually set
                display = that.options.display || (
                  // Bootstrap 3 doesn't have $.fn.dropdown.Constructor.Default
                  $.fn.dropdown.Constructor.Default ? $.fn.dropdown.Constructor.Default.display
                  : false
                );

            that.$bsContainer.addClass($element.attr('class').replace(/form-control|fit-width/gi, '')).toggleClass(classNames.DROPUP, $element.hasClass(classNames.DROPUP));
            pos = $element.offset();

            if (!$container.is('body')) {
              containerPos = $container.offset();
              containerPos.top += parseInt($container.css('borderTopWidth')) - $container.scrollTop();
              containerPos.left += parseInt($container.css('borderLeftWidth')) - $container.scrollLeft();
            } else {
              containerPos = { top: 0, left: 0 };
            }

            actualHeight = $element.hasClass(classNames.DROPUP) ? 0 : $element[0].offsetHeight;

            // Bootstrap 4+ uses Popper for menu positioning
            if (version.major < 4 || display === 'static') {
              containerPosition.top = pos.top - containerPos.top + actualHeight;
              containerPosition.left = pos.left - containerPos.left;
            }

            containerPosition.width = $element[0].offsetWidth;

            that.$bsContainer.css(containerPosition);
          };

      this.$button.on('click.bs.dropdown.data-api', function () {
        if (that.isDisabled()) {
          return;
        }

        getPlacement(that.$newElement);

        that.$bsContainer
          .appendTo(that.options.container)
          .toggleClass(classNames.SHOW, !that.$button.hasClass(classNames.SHOW))
          .append(that.$menu);
      });

      $(window)
        .off('resize' + EVENT_KEY + '.' + this.selectId + ' scroll' + EVENT_KEY + '.' + this.selectId)
        .on('resize' + EVENT_KEY + '.' + this.selectId + ' scroll' + EVENT_KEY + '.' + this.selectId, function () {
          var isActive = that.$newElement.hasClass(classNames.SHOW);

          if (isActive) getPlacement(that.$newElement);
        });

      this.$element.on('hide' + EVENT_KEY, function () {
        that.$menu.data('height', that.$menu.height());
        that.$bsContainer.detach();
      });
    },

    setOptionStatus: function (selectedOnly) {
      var that = this;

      that.noScroll = false;

      if (that.selectpicker.view.visibleElements && that.selectpicker.view.visibleElements.length) {
        for (var i = 0; i < that.selectpicker.view.visibleElements.length; i++) {
          var liData = that.selectpicker.current.data[i + that.selectpicker.view.position0],
              option = liData.option;

          if (option) {
            if (selectedOnly !== true) {
              that.setDisabled(
                liData.index,
                liData.disabled
              );
            }

            that.setSelected(
              liData.index,
              option.selected
            );
          }
        }
      }
    },

    /**
     * @param {number} index - the index of the option that is being changed
     * @param {boolean} selected - true if the option is being selected, false if being deselected
     */
    setSelected: function (index, selected) {
      var li = this.selectpicker.main.elements[index],
          liData = this.selectpicker.main.data[index],
          activeIndexIsSet = this.activeIndex !== undefined,
          thisIsActive = this.activeIndex === index,
          prevActive,
          a,
          // if current option is already active
          // OR
          // if the current option is being selected, it's NOT multiple, and
          // activeIndex is undefined:
          //  - when the menu is first being opened, OR
          //  - after a search has been performed, OR
          //  - when retainActive is false when selecting a new option (i.e. index of the newly selected option is not the same as the current activeIndex)
          keepActive = thisIsActive || (selected && !this.multiple && !activeIndexIsSet);

      liData.selected = selected;

      a = li.firstChild;

      if (selected) {
        this.selectedIndex = index;
      }

      li.classList.toggle('selected', selected);

      if (keepActive) {
        this.focusItem(li, liData);
        this.selectpicker.view.currentActive = li;
        this.activeIndex = index;
      } else {
        this.defocusItem(li);
      }

      if (a) {
        a.classList.toggle('selected', selected);

        if (selected) {
          a.setAttribute('aria-selected', true);
        } else {
          if (this.multiple) {
            a.setAttribute('aria-selected', false);
          } else {
            a.removeAttribute('aria-selected');
          }
        }
      }

      if (!keepActive && !activeIndexIsSet && selected && this.prevActiveIndex !== undefined) {
        prevActive = this.selectpicker.main.elements[this.prevActiveIndex];

        this.defocusItem(prevActive);
      }
    },

    /**
     * @param {number} index - the index of the option that is being disabled
     * @param {boolean} disabled - true if the option is being disabled, false if being enabled
     */
    setDisabled: function (index, disabled) {
      var li = this.selectpicker.main.elements[index],
          a;

      this.selectpicker.main.data[index].disabled = disabled;

      a = li.firstChild;

      li.classList.toggle(classNames.DISABLED, disabled);

      if (a) {
        if (version.major === '4') a.classList.toggle(classNames.DISABLED, disabled);

        if (disabled) {
          a.setAttribute('aria-disabled', disabled);
          a.setAttribute('tabindex', -1);
        } else {
          a.removeAttribute('aria-disabled');
          a.setAttribute('tabindex', 0);
        }
      }
    },

    isDisabled: function () {
      return this.$element[0].disabled;
    },

    checkDisabled: function () {
      if (this.isDisabled()) {
        this.$newElement[0].classList.add(classNames.DISABLED);
        this.$button.addClass(classNames.DISABLED).attr('aria-disabled', true);
      } else {
        if (this.$button[0].classList.contains(classNames.DISABLED)) {
          this.$newElement[0].classList.remove(classNames.DISABLED);
          this.$button.removeClass(classNames.DISABLED).attr('aria-disabled', false);
        }
      }
    },

    clickListener: function () {
      var that = this,
          $document = $(document);

      $document.data('spaceSelect', false);

      this.$button.on('keyup', function (e) {
        if (/(32)/.test(e.keyCode.toString(10)) && $document.data('spaceSelect')) {
          e.preventDefault();
          $document.data('spaceSelect', false);
        }
      });

      this.$newElement.on('show.bs.dropdown', function () {
        if (version.major > 3 && !that.dropdown) {
          that.dropdown = that.$button.data('bs.dropdown');
          that.dropdown._menu = that.$menu[0];
        }
      });

      this.$button.on('click.bs.dropdown.data-api', function () {
        if (!that.$newElement.hasClass(classNames.SHOW)) {
          that.setSize();
        }
      });

      function setFocus () {
        if (that.options.liveSearch) {
          that.$searchbox.trigger('focus');
        } else {
          that.$menuInner.trigger('focus');
        }
      }

      function checkPopperExists () {
        if (that.dropdown && that.dropdown._popper && that.dropdown._popper.state.isCreated) {
          setFocus();
        } else {
          requestAnimationFrame(checkPopperExists);
        }
      }

      this.$element.on('shown' + EVENT_KEY, function () {
        if (that.$menuInner[0].scrollTop !== that.selectpicker.view.scrollTop) {
          that.$menuInner[0].scrollTop = that.selectpicker.view.scrollTop;
        }

        if (version.major > 3) {
          requestAnimationFrame(checkPopperExists);
        } else {
          setFocus();
        }
      });

      // ensure posinset and setsize are correct before selecting an option via a click
      this.$menuInner.on('mouseenter', 'li a', function (e) {
        var hoverLi = this.parentElement,
            position0 = that.isVirtual() ? that.selectpicker.view.position0 : 0,
            index = Array.prototype.indexOf.call(hoverLi.parentElement.children, hoverLi),
            hoverData = that.selectpicker.current.data[index + position0];

        that.focusItem(hoverLi, hoverData, true);
      });

      this.$menuInner.on('click', 'li a', function (e, retainActive) {
        var $this = $(this),
            element = that.$element[0],
            position0 = that.isVirtual() ? that.selectpicker.view.position0 : 0,
            clickedData = that.selectpicker.current.data[$this.parent().index() + position0],
            clickedIndex = clickedData.index,
            prevValue = getSelectValues(element),
            prevIndex = element.selectedIndex,
            prevOption = element.options[prevIndex],
            triggerChange = true;

        // Don't close on multi choice menu
        if (that.multiple && that.options.maxOptions !== 1) {
          e.stopPropagation();
        }

        e.preventDefault();

        // Don't run if the select is disabled
        if (!that.isDisabled() && !$this.parent().hasClass(classNames.DISABLED)) {
          var option = clickedData.option,
              $option = $(option),
              state = option.selected,
              $optgroup = $option.parent('optgroup'),
              $optgroupOptions = $optgroup.find('option'),
              maxOptions = that.options.maxOptions,
              maxOptionsGrp = $optgroup.data('maxOptions') || false;

          if (clickedIndex === that.activeIndex) retainActive = true;

          if (!retainActive) {
            that.prevActiveIndex = that.activeIndex;
            that.activeIndex = undefined;
          }

          if (!that.multiple) { // Deselect all others if not multi select box
            if (prevOption) prevOption.selected = false;
            option.selected = true;
            that.setSelected(clickedIndex, true);
          } else { // Toggle the one we have chosen if we are multi select.
            option.selected = !state;

            that.setSelected(clickedIndex, !state);
            that.focusedParent.focus();

            if (maxOptions !== false || maxOptionsGrp !== false) {
              var maxReached = maxOptions < getSelectedOptions(element).length,
                  maxReachedGrp = maxOptionsGrp < $optgroup.find('option:selected').length;

              if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                if (maxOptions && maxOptions == 1) {
                  element.selectedIndex = -1;
                  option.selected = true;
                  that.setOptionStatus(true);
                } else if (maxOptionsGrp && maxOptionsGrp == 1) {
                  for (var i = 0; i < $optgroupOptions.length; i++) {
                    var _option = $optgroupOptions[i];
                    _option.selected = false;
                    that.setSelected(_option.liIndex, false);
                  }

                  option.selected = true;
                  that.setSelected(clickedIndex, true);
                } else {
                  var maxOptionsText = typeof that.options.maxOptionsText === 'string' ? [that.options.maxOptionsText, that.options.maxOptionsText] : that.options.maxOptionsText,
                      maxOptionsArr = typeof maxOptionsText === 'function' ? maxOptionsText(maxOptions, maxOptionsGrp) : maxOptionsText,
                      maxTxt = maxOptionsArr[0].replace('{n}', maxOptions),
                      maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp),
                      $notify = $('<div class="notify"></div>');
                  // If {var} is set in array, replace it
                  /** @deprecated */
                  if (maxOptionsArr[2]) {
                    maxTxt = maxTxt.replace('{var}', maxOptionsArr[2][maxOptions > 1 ? 0 : 1]);
                    maxTxtGrp = maxTxtGrp.replace('{var}', maxOptionsArr[2][maxOptionsGrp > 1 ? 0 : 1]);
                  }

                  option.selected = false;

                  that.$menu.append($notify);

                  if (maxOptions && maxReached) {
                    $notify.append($('<div>' + maxTxt + '</div>'));
                    triggerChange = false;
                    that.$element.trigger('maxReached' + EVENT_KEY);
                  }

                  if (maxOptionsGrp && maxReachedGrp) {
                    $notify.append($('<div>' + maxTxtGrp + '</div>'));
                    triggerChange = false;
                    that.$element.trigger('maxReachedGrp' + EVENT_KEY);
                  }

                  setTimeout(function () {
                    that.setSelected(clickedIndex, false);
                  }, 10);

                  $notify[0].classList.add('fadeOut');

                  setTimeout(function () {
                    $notify.remove();
                  }, 1050);
                }
              }
            }
          }

          if (!that.multiple || (that.multiple && that.options.maxOptions === 1)) {
            that.$button.trigger('focus');
          } else if (that.options.liveSearch) {
            that.$searchbox.trigger('focus');
          }

          // Trigger select 'change'
          if (triggerChange) {
            if (that.multiple || prevIndex !== element.selectedIndex) {
              // $option.prop('selected') is current option state (selected/unselected). prevValue is the value of the select prior to being changed.
              changedArguments = [option.index, $option.prop('selected'), prevValue];
              that.$element
                .triggerNative('change');
            }
          }
        }
      });

      this.$menu.on('click', 'li.' + classNames.DISABLED + ' a, .' + classNames.POPOVERHEADER + ', .' + classNames.POPOVERHEADER + ' :not(.close)', function (e) {
        if (e.currentTarget == this) {
          e.preventDefault();
          e.stopPropagation();
          if (that.options.liveSearch && !$(e.target).hasClass('close')) {
            that.$searchbox.trigger('focus');
          } else {
            that.$button.trigger('focus');
          }
        }
      });

      this.$menuInner.on('click', '.divider, .dropdown-header', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (that.options.liveSearch) {
          that.$searchbox.trigger('focus');
        } else {
          that.$button.trigger('focus');
        }
      });

      this.$menu.on('click', '.' + classNames.POPOVERHEADER + ' .close', function () {
        that.$button.trigger('click');
      });

      this.$searchbox.on('click', function (e) {
        e.stopPropagation();
      });

      this.$menu.on('click', '.actions-btn', function (e) {
        if (that.options.liveSearch) {
          that.$searchbox.trigger('focus');
        } else {
          that.$button.trigger('focus');
        }

        e.preventDefault();
        e.stopPropagation();

        if ($(this).hasClass('bs-select-all')) {
          that.selectAll();
        } else {
          that.deselectAll();
        }
      });

      this.$button
        .on('focus' + EVENT_KEY, function (e) {
          var tabindex = that.$element[0].getAttribute('tabindex');

          // only change when button is actually focused
          if (tabindex !== undefined && e.originalEvent && e.originalEvent.isTrusted) {
            // apply select element's tabindex to ensure correct order is followed when tabbing to the next element
            this.setAttribute('tabindex', tabindex);
            // set element's tabindex to -1 to allow for reverse tabbing
            that.$element[0].setAttribute('tabindex', -1);
            that.selectpicker.view.tabindex = tabindex;
          }
        })
        .on('blur' + EVENT_KEY, function (e) {
          // revert everything to original tabindex
          if (that.selectpicker.view.tabindex !== undefined && e.originalEvent && e.originalEvent.isTrusted) {
            that.$element[0].setAttribute('tabindex', that.selectpicker.view.tabindex);
            this.setAttribute('tabindex', -1);
            that.selectpicker.view.tabindex = undefined;
          }
        });

      this.$element
        .on('change' + EVENT_KEY, function () {
          that.render();
          that.$element.trigger('changed' + EVENT_KEY, changedArguments);
          changedArguments = null;
        })
        .on('focus' + EVENT_KEY, function () {
          if (!that.options.mobile) that.$button[0].focus();
        });
    },

    liveSearchListener: function () {
      var that = this;

      this.$button.on('click.bs.dropdown.data-api', function () {
        if (!!that.$searchbox.val()) {
          that.$searchbox.val('');
          that.selectpicker.search.previousValue = undefined;
        }
      });

      this.$searchbox.on('click.bs.dropdown.data-api focus.bs.dropdown.data-api touchend.bs.dropdown.data-api', function (e) {
        e.stopPropagation();
      });

      this.$searchbox.on('input propertychange', function () {
        var searchValue = that.$searchbox[0].value;

        that.selectpicker.search.elements = [];
        that.selectpicker.search.data = [];

        if (searchValue) {
          var i,
              searchMatch = [],
              q = searchValue.toUpperCase(),
              cache = {},
              cacheArr = [],
              searchStyle = that._searchStyle(),
              normalizeSearch = that.options.liveSearchNormalize;

          if (normalizeSearch) q = normalizeToBase(q);

          for (var i = 0; i < that.selectpicker.main.data.length; i++) {
            var li = that.selectpicker.main.data[i];

            if (!cache[i]) {
              cache[i] = stringSearch(li, q, searchStyle, normalizeSearch);
            }

            if (cache[i] && li.headerIndex !== undefined && cacheArr.indexOf(li.headerIndex) === -1) {
              if (li.headerIndex > 0) {
                cache[li.headerIndex - 1] = true;
                cacheArr.push(li.headerIndex - 1);
              }

              cache[li.headerIndex] = true;
              cacheArr.push(li.headerIndex);

              cache[li.lastIndex + 1] = true;
            }

            if (cache[i] && li.type !== 'optgroup-label') cacheArr.push(i);
          }

          for (var i = 0, cacheLen = cacheArr.length; i < cacheLen; i++) {
            var index = cacheArr[i],
                prevIndex = cacheArr[i - 1],
                li = that.selectpicker.main.data[index],
                liPrev = that.selectpicker.main.data[prevIndex];

            if (li.type !== 'divider' || (li.type === 'divider' && liPrev && liPrev.type !== 'divider' && cacheLen - 1 !== i)) {
              that.selectpicker.search.data.push(li);
              searchMatch.push(that.selectpicker.main.elements[index]);
            }
          }

          that.activeIndex = undefined;
          that.noScroll = true;
          that.$menuInner.scrollTop(0);
          that.selectpicker.search.elements = searchMatch;
          that.createView(true);
          showNoResults.call(that, searchMatch, searchValue);
        } else if (that.selectpicker.search.previousValue) { // for IE11 (#2402)
          that.$menuInner.scrollTop(0);
          that.createView(false);
        }

        that.selectpicker.search.previousValue =  searchValue;
      });
    },

    _searchStyle: function () {
      return this.options.liveSearchStyle || 'contains';
    },

    val: function (value) {
      var element = this.$element[0];

      if (typeof value !== 'undefined') {
        var prevValue = getSelectValues(element);

        changedArguments = [null, null, prevValue];

        this.$element
          .val(value)
          .trigger('changed' + EVENT_KEY, changedArguments);

        if (this.$newElement.hasClass(classNames.SHOW)) {
          if (this.multiple) {
            this.setOptionStatus(true);
          } else {
            var liSelectedIndex = (element.options[element.selectedIndex] || {}).liIndex;

            if (typeof liSelectedIndex === 'number') {
              this.setSelected(this.selectedIndex, false);
              this.setSelected(liSelectedIndex, true);
            }
          }
        }

        this.render();

        changedArguments = null;

        return this.$element;
      } else {
        return this.$element.val();
      }
    },

    changeAll: function (status) {
      if (!this.multiple) return;
      if (typeof status === 'undefined') status = true;

      var element = this.$element[0],
          previousSelected = 0,
          currentSelected = 0,
          prevValue = getSelectValues(element);

      element.classList.add('bs-select-hidden');

      for (var i = 0, data = this.selectpicker.current.data, len = data.length; i < len; i++) {
        var liData = data[i],
            option = liData.option;

        if (option && !liData.disabled && liData.type !== 'divider') {
          if (liData.selected) previousSelected++;
          option.selected = status;
          if (status === true) currentSelected++;
        }
      }

      element.classList.remove('bs-select-hidden');

      if (previousSelected === currentSelected) return;

      this.setOptionStatus();

      changedArguments = [null, null, prevValue];

      this.$element
        .triggerNative('change');
    },

    selectAll: function () {
      return this.changeAll(true);
    },

    deselectAll: function () {
      return this.changeAll(false);
    },

    toggle: function (e) {
      e = e || window.event;

      if (e) e.stopPropagation();

      this.$button.trigger('click.bs.dropdown.data-api');
    },

    keydown: function (e) {
      var $this = $(this),
          isToggle = $this.hasClass('dropdown-toggle'),
          $parent = isToggle ? $this.closest('.dropdown') : $this.closest(Selector.MENU),
          that = $parent.data('this'),
          $items = that.findLis(),
          index,
          isActive,
          liActive,
          activeLi,
          offset,
          updateScroll = false,
          downOnTab = e.which === keyCodes.TAB && !isToggle && !that.options.selectOnTab,
          isArrowKey = REGEXP_ARROW.test(e.which) || downOnTab,
          scrollTop = that.$menuInner[0].scrollTop,
          isVirtual = that.isVirtual(),
          position0 = isVirtual === true ? that.selectpicker.view.position0 : 0;

      // do nothing if a function key is pressed
      if (e.which >= 112 && e.which <= 123) return;

      isActive = that.$newElement.hasClass(classNames.SHOW);

      if (
        !isActive &&
        (
          isArrowKey ||
          (e.which >= 48 && e.which <= 57) ||
          (e.which >= 96 && e.which <= 105) ||
          (e.which >= 65 && e.which <= 90)
        )
      ) {
        that.$button.trigger('click.bs.dropdown.data-api');

        if (that.options.liveSearch) {
          that.$searchbox.trigger('focus');
          return;
        }
      }

      if (e.which === keyCodes.ESCAPE && isActive) {
        e.preventDefault();
        that.$button.trigger('click.bs.dropdown.data-api').trigger('focus');
      }

      if (isArrowKey) { // if up or down
        if (!$items.length) return;

        liActive = that.selectpicker.main.elements[that.activeIndex];
        index = liActive ? Array.prototype.indexOf.call(liActive.parentElement.children, liActive) : -1;

        if (index !== -1) {
          that.defocusItem(liActive);
        }

        if (e.which === keyCodes.ARROW_UP) { // up
          if (index !== -1) index--;
          if (index + position0 < 0) index += $items.length;

          if (!that.selectpicker.view.canHighlight[index + position0]) {
            index = that.selectpicker.view.canHighlight.slice(0, index + position0).lastIndexOf(true) - position0;
            if (index === -1) index = $items.length - 1;
          }
        } else if (e.which === keyCodes.ARROW_DOWN || downOnTab) { // down
          index++;
          if (index + position0 >= that.selectpicker.view.canHighlight.length) index = that.selectpicker.view.firstHighlightIndex;

          if (!that.selectpicker.view.canHighlight[index + position0]) {
            index = index + 1 + that.selectpicker.view.canHighlight.slice(index + position0 + 1).indexOf(true);
          }
        }

        e.preventDefault();

        var liActiveIndex = position0 + index;

        if (e.which === keyCodes.ARROW_UP) { // up
          // scroll to bottom and highlight last option
          if (position0 === 0 && index === $items.length - 1) {
            that.$menuInner[0].scrollTop = that.$menuInner[0].scrollHeight;

            liActiveIndex = that.selectpicker.current.elements.length - 1;
          } else {
            activeLi = that.selectpicker.current.data[liActiveIndex];
            offset = activeLi.position - activeLi.height;

            updateScroll = offset < scrollTop;
          }
        } else if (e.which === keyCodes.ARROW_DOWN || downOnTab) { // down
          // scroll to top and highlight first option
          if (index === that.selectpicker.view.firstHighlightIndex) {
            that.$menuInner[0].scrollTop = 0;

            liActiveIndex = that.selectpicker.view.firstHighlightIndex;
          } else {
            activeLi = that.selectpicker.current.data[liActiveIndex];
            offset = activeLi.position - that.sizeInfo.menuInnerHeight;

            updateScroll = offset > scrollTop;
          }
        }

        liActive = that.selectpicker.current.elements[liActiveIndex];

        that.activeIndex = that.selectpicker.current.data[liActiveIndex].index;

        that.focusItem(liActive);

        that.selectpicker.view.currentActive = liActive;

        if (updateScroll) that.$menuInner[0].scrollTop = offset;

        if (that.options.liveSearch) {
          that.$searchbox.trigger('focus');
        } else {
          $this.trigger('focus');
        }
      } else if (
        (!$this.is('input') && !REGEXP_TAB_OR_ESCAPE.test(e.which)) ||
        (e.which === keyCodes.SPACE && that.selectpicker.keydown.keyHistory)
      ) {
        var searchMatch,
            matches = [],
            keyHistory;

        e.preventDefault();

        that.selectpicker.keydown.keyHistory += keyCodeMap[e.which];

        if (that.selectpicker.keydown.resetKeyHistory.cancel) clearTimeout(that.selectpicker.keydown.resetKeyHistory.cancel);
        that.selectpicker.keydown.resetKeyHistory.cancel = that.selectpicker.keydown.resetKeyHistory.start();

        keyHistory = that.selectpicker.keydown.keyHistory;

        // if all letters are the same, set keyHistory to just the first character when searching
        if (/^(.)\1+$/.test(keyHistory)) {
          keyHistory = keyHistory.charAt(0);
        }

        // find matches
        for (var i = 0; i < that.selectpicker.current.data.length; i++) {
          var li = that.selectpicker.current.data[i],
              hasMatch;

          hasMatch = stringSearch(li, keyHistory, 'startsWith', true);

          if (hasMatch && that.selectpicker.view.canHighlight[i]) {
            matches.push(li.index);
          }
        }

        if (matches.length) {
          var matchIndex = 0;

          $items.removeClass('active').find('a').removeClass('active');

          // either only one key has been pressed or they are all the same key
          if (keyHistory.length === 1) {
            matchIndex = matches.indexOf(that.activeIndex);

            if (matchIndex === -1 || matchIndex === matches.length - 1) {
              matchIndex = 0;
            } else {
              matchIndex++;
            }
          }

          searchMatch = matches[matchIndex];

          activeLi = that.selectpicker.main.data[searchMatch];

          if (scrollTop - activeLi.position > 0) {
            offset = activeLi.position - activeLi.height;
            updateScroll = true;
          } else {
            offset = activeLi.position - that.sizeInfo.menuInnerHeight;
            // if the option is already visible at the current scroll position, just keep it the same
            updateScroll = activeLi.position > scrollTop + that.sizeInfo.menuInnerHeight;
          }

          liActive = that.selectpicker.main.elements[searchMatch];

          that.activeIndex = matches[matchIndex];

          that.focusItem(liActive);

          if (liActive) liActive.firstChild.focus();

          if (updateScroll) that.$menuInner[0].scrollTop = offset;

          $this.trigger('focus');
        }
      }

      // Select focused option if "Enter", "Spacebar" or "Tab" (when selectOnTab is true) are pressed inside the menu.
      if (
        isActive &&
        (
          (e.which === keyCodes.SPACE && !that.selectpicker.keydown.keyHistory) ||
          e.which === keyCodes.ENTER ||
          (e.which === keyCodes.TAB && that.options.selectOnTab)
        )
      ) {
        if (e.which !== keyCodes.SPACE) e.preventDefault();

        if (!that.options.liveSearch || e.which !== keyCodes.SPACE) {
          that.$menuInner.find('.active a').trigger('click', true); // retain active class
          $this.trigger('focus');

          if (!that.options.liveSearch) {
            // Prevent screen from scrolling if the user hits the spacebar
            e.preventDefault();
            // Fixes spacebar selection of dropdown items in FF & IE
            $(document).data('spaceSelect', true);
          }
        }
      }
    },

    mobile: function () {
      // ensure mobile is set to true if mobile function is called after init
      this.options.mobile = true;
      this.$element[0].classList.add('mobile-device');
    },

    refresh: function () {
      // update options if data attributes have been changed
      var config = $.extend({}, this.options, this.$element.data());
      this.options = config;

      this.checkDisabled();
      this.buildData();
      this.setStyle();
      this.render();
      this.buildList();
      this.setWidth();

      this.setSize(true);

      this.$element.trigger('refreshed' + EVENT_KEY);
    },

    hide: function () {
      this.$newElement.hide();
    },

    show: function () {
      this.$newElement.show();
    },

    remove: function () {
      this.$newElement.remove();
      this.$element.remove();
    },

    destroy: function () {
      this.$newElement.before(this.$element).remove();

      if (this.$bsContainer) {
        this.$bsContainer.remove();
      } else {
        this.$menu.remove();
      }

      if (this.selectpicker.view.titleOption && this.selectpicker.view.titleOption.parentNode) {
        this.selectpicker.view.titleOption.parentNode.removeChild(this.selectpicker.view.titleOption);
      }

      this.$element
        .off(EVENT_KEY)
        .removeData('selectpicker')
        .removeClass('bs-select-hidden selectpicker');

      $(window).off(EVENT_KEY + '.' + this.selectId);
    }
  };

  // SELECTPICKER PLUGIN DEFINITION
  // ==============================
  function Plugin (option) {
    // get the args of the outer function..
    var args = arguments;
    // The arguments of the function are explicitly re-defined from the argument list, because the shift causes them
    // to get lost/corrupted in android 2.3 and IE9 #715 #775
    var _option = option;

    [].shift.apply(args);

    // if the version was not set successfully
    if (!version.success) {
      // try to retreive it again
      try {
        version.full = ($.fn.dropdown.Constructor.VERSION || '').split(' ')[0].split('.');
      } catch (err) {
        // fall back to use BootstrapVersion if set
        if (Selectpicker.BootstrapVersion) {
          version.full = Selectpicker.BootstrapVersion.split(' ')[0].split('.');
        } else {
          version.full = [version.major, '0', '0'];

          console.warn(
            'There was an issue retrieving Bootstrap\'s version. ' +
            'Ensure Bootstrap is being loaded before bootstrap-select and there is no namespace collision. ' +
            'If loading Bootstrap asynchronously, the version may need to be manually specified via $.fn.selectpicker.Constructor.BootstrapVersion.',
            err
          );
        }
      }

      version.major = version.full[0];
      version.success = true;
    }

    if (version.major === '4') {
      // some defaults need to be changed if using Bootstrap 4
      // check to see if they have already been manually changed before forcing them to update
      var toUpdate = [];

      if (Selectpicker.DEFAULTS.style === classNames.BUTTONCLASS) toUpdate.push({ name: 'style', className: 'BUTTONCLASS' });
      if (Selectpicker.DEFAULTS.iconBase === classNames.ICONBASE) toUpdate.push({ name: 'iconBase', className: 'ICONBASE' });
      if (Selectpicker.DEFAULTS.tickIcon === classNames.TICKICON) toUpdate.push({ name: 'tickIcon', className: 'TICKICON' });

      classNames.DIVIDER = 'dropdown-divider';
      classNames.SHOW = 'show';
      classNames.BUTTONCLASS = 'btn-light';
      classNames.POPOVERHEADER = 'popover-header';
      classNames.ICONBASE = '';
      classNames.TICKICON = 'bs-ok-default';

      for (var i = 0; i < toUpdate.length; i++) {
        var option = toUpdate[i];
        Selectpicker.DEFAULTS[option.name] = classNames[option.className];
      }
    }

    var value;
    var chain = this.each(function () {
      var $this = $(this);
      if ($this.is('select')) {
        var data = $this.data('selectpicker'),
            options = typeof _option == 'object' && _option;

        if (!data) {
          var dataAttributes = $this.data();

          for (var dataAttr in dataAttributes) {
            if (Object.prototype.hasOwnProperty.call(dataAttributes, dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
              delete dataAttributes[dataAttr];
            }
          }

          var config = $.extend({}, Selectpicker.DEFAULTS, $.fn.selectpicker.defaults || {}, dataAttributes, options);
          config.template = $.extend({}, Selectpicker.DEFAULTS.template, ($.fn.selectpicker.defaults ? $.fn.selectpicker.defaults.template : {}), dataAttributes.template, options.template);
          $this.data('selectpicker', (data = new Selectpicker(this, config)));
        } else if (options) {
          for (var i in options) {
            if (Object.prototype.hasOwnProperty.call(options, i)) {
              data.options[i] = options[i];
            }
          }
        }

        if (typeof _option == 'string') {
          if (data[_option] instanceof Function) {
            value = data[_option].apply(data, args);
          } else {
            value = data.options[_option];
          }
        }
      }
    });

    if (typeof value !== 'undefined') {
      // noinspection JSUnusedAssignment
      return value;
    } else {
      return chain;
    }
  }

  var old = $.fn.selectpicker;
  $.fn.selectpicker = Plugin;
  $.fn.selectpicker.Constructor = Selectpicker;

  // SELECTPICKER NO CONFLICT
  // ========================
  $.fn.selectpicker.noConflict = function () {
    $.fn.selectpicker = old;
    return this;
  };

  // get Bootstrap's keydown event handler for either Bootstrap 4 or Bootstrap 3
  function keydownHandler () {
    if ($.fn.dropdown) {
      // wait to define until function is called in case Bootstrap isn't loaded yet
      var bootstrapKeydown = $.fn.dropdown.Constructor._dataApiKeydownHandler || $.fn.dropdown.Constructor.prototype.keydown;
      return bootstrapKeydown.apply(this, arguments);
    }
  }

  $(document)
    .off('keydown.bs.dropdown.data-api')
    .on('keydown.bs.dropdown.data-api', ':not(.bootstrap-select) > [data-toggle="dropdown"]', keydownHandler)
    .on('keydown.bs.dropdown.data-api', ':not(.bootstrap-select) > .dropdown-menu', keydownHandler)
    .on('keydown' + EVENT_KEY, '.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bootstrap-select .bs-searchbox input', Selectpicker.prototype.keydown)
    .on('focusin.modal', '.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bootstrap-select .bs-searchbox input', function (e) {
      e.stopPropagation();
    });

  // SELECTPICKER DATA-API
  // =====================
  $(window).on('load' + EVENT_KEY + '.data-api', function () {
    $('.selectpicker').each(function () {
      var $selectpicker = $(this);
      Plugin.call($selectpicker, $selectpicker.data());
    })
  });
})(jQuery);

/*!
 * Quill Editor v1.3.7
 * https://quilljs.com/
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Quill=e():t.Quill=e()}("undefined"!=typeof self?self:this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=45)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(17),o=n(18),i=n(19),l=n(48),a=n(49),s=n(50),u=n(51),c=n(52),f=n(11),h=n(29),p=n(30),d=n(28),y=n(1),v={Scope:y.Scope,create:y.create,find:y.find,query:y.query,register:y.register,Container:r.default,Format:o.default,Leaf:i.default,Embed:u.default,Scroll:l.default,Block:s.default,Inline:a.default,Text:c.default,Attributor:{Attribute:f.default,Class:h.default,Style:p.default,Store:d.default}};e.default=v},function(t,e,n){"use strict";function r(t,e){var n=i(t);if(null==n)throw new s("Unable to create "+t+" blot");var r=n;return new r(t instanceof Node||t.nodeType===Node.TEXT_NODE?t:r.create(e),e)}function o(t,n){return void 0===n&&(n=!1),null==t?null:null!=t[e.DATA_KEY]?t[e.DATA_KEY].blot:n?o(t.parentNode,n):null}function i(t,e){void 0===e&&(e=p.ANY);var n;if("string"==typeof t)n=h[t]||u[t];else if(t instanceof Text||t.nodeType===Node.TEXT_NODE)n=h.text;else if("number"==typeof t)t&p.LEVEL&p.BLOCK?n=h.block:t&p.LEVEL&p.INLINE&&(n=h.inline);else if(t instanceof HTMLElement){var r=(t.getAttribute("class")||"").split(/\s+/);for(var o in r)if(n=c[r[o]])break;n=n||f[t.tagName]}return null==n?null:e&p.LEVEL&n.scope&&e&p.TYPE&n.scope?n:null}function l(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if(t.length>1)return t.map(function(t){return l(t)});var n=t[0];if("string"!=typeof n.blotName&&"string"!=typeof n.attrName)throw new s("Invalid definition");if("abstract"===n.blotName)throw new s("Cannot register abstract class");if(h[n.blotName||n.attrName]=n,"string"==typeof n.keyName)u[n.keyName]=n;else if(null!=n.className&&(c[n.className]=n),null!=n.tagName){Array.isArray(n.tagName)?n.tagName=n.tagName.map(function(t){return t.toUpperCase()}):n.tagName=n.tagName.toUpperCase();var r=Array.isArray(n.tagName)?n.tagName:[n.tagName];r.forEach(function(t){null!=f[t]&&null!=n.className||(f[t]=n)})}return n}var a=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var s=function(t){function e(e){var n=this;return e="[Parchment] "+e,n=t.call(this,e)||this,n.message=e,n.name=n.constructor.name,n}return a(e,t),e}(Error);e.ParchmentError=s;var u={},c={},f={},h={};e.DATA_KEY="__blot";var p;!function(t){t[t.TYPE=3]="TYPE",t[t.LEVEL=12]="LEVEL",t[t.ATTRIBUTE=13]="ATTRIBUTE",t[t.BLOT=14]="BLOT",t[t.INLINE=7]="INLINE",t[t.BLOCK=11]="BLOCK",t[t.BLOCK_BLOT=10]="BLOCK_BLOT",t[t.INLINE_BLOT=6]="INLINE_BLOT",t[t.BLOCK_ATTRIBUTE=9]="BLOCK_ATTRIBUTE",t[t.INLINE_ATTRIBUTE=5]="INLINE_ATTRIBUTE",t[t.ANY=15]="ANY"}(p=e.Scope||(e.Scope={})),e.create=r,e.find=o,e.query=i,e.register=l},function(t,e){"use strict";var n=Object.prototype.hasOwnProperty,r=Object.prototype.toString,o=Object.defineProperty,i=Object.getOwnPropertyDescriptor,l=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===r.call(t)},a=function(t){if(!t||"[object Object]"!==r.call(t))return!1;var e=n.call(t,"constructor"),o=t.constructor&&t.constructor.prototype&&n.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!e&&!o)return!1;var i;for(i in t);return void 0===i||n.call(t,i)},s=function(t,e){o&&"__proto__"===e.name?o(t,e.name,{enumerable:!0,configurable:!0,value:e.newValue,writable:!0}):t[e.name]=e.newValue},u=function(t,e){if("__proto__"===e){if(!n.call(t,e))return;if(i)return i(t,e).value}return t[e]};t.exports=function t(){var e,n,r,o,i,c,f=arguments[0],h=1,p=arguments.length,d=!1;for("boolean"==typeof f&&(d=f,f=arguments[1]||{},h=2),(null==f||"object"!=typeof f&&"function"!=typeof f)&&(f={});h<p;++h)if(null!=(e=arguments[h]))for(n in e)r=u(f,n),o=u(e,n),f!==o&&(d&&o&&(a(o)||(i=l(o)))?(i?(i=!1,c=r&&l(r)?r:[]):c=r&&a(r)?r:{},s(f,{name:n,newValue:t(d,c,o)})):void 0!==o&&s(f,{name:n,newValue:o}));return f}},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return null==t?e:("function"==typeof t.formats&&(e=(0,f.default)(e,t.formats())),null==t.parent||"scroll"==t.parent.blotName||t.parent.statics.scope!==t.statics.scope?e:a(t.parent,e))}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BlockEmbed=e.bubbleFormats=void 0;var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(2),f=r(c),h=n(4),p=r(h),d=n(0),y=r(d),v=n(14),b=r(v),g=n(5),m=r(g),_=n(8),O=r(_),w=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),s(e,[{key:"attach",value:function(){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"attach",this).call(this),this.attributes=new y.default.Attributor.Store(this.domNode)}},{key:"delta",value:function(){return(new p.default).insert(this.value(),(0,f.default)(this.formats(),this.attributes.values()))}},{key:"format",value:function(t,e){var n=y.default.query(t,y.default.Scope.BLOCK_ATTRIBUTE);null!=n&&this.attributes.attribute(n,e)}},{key:"formatAt",value:function(t,e,n,r){this.format(n,r)}},{key:"insertAt",value:function(t,n,r){if("string"==typeof n&&n.endsWith("\n")){var o=y.default.create(x.blotName);this.parent.insertBefore(o,0===t?this:this.next),o.insertAt(0,n.slice(0,-1))}else u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r)}}]),e}(y.default.Embed);w.scope=y.default.Scope.BLOCK_BLOT;var x=function(t){function e(t){o(this,e);var n=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return n.cache={},n}return l(e,t),s(e,[{key:"delta",value:function(){return null==this.cache.delta&&(this.cache.delta=this.descendants(y.default.Leaf).reduce(function(t,e){return 0===e.length()?t:t.insert(e.value(),a(e))},new p.default).insert("\n",a(this))),this.cache.delta}},{key:"deleteAt",value:function(t,n){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"deleteAt",this).call(this,t,n),this.cache={}}},{key:"formatAt",value:function(t,n,r,o){n<=0||(y.default.query(r,y.default.Scope.BLOCK)?t+n===this.length()&&this.format(r,o):u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,Math.min(n,this.length()-t-1),r,o),this.cache={})}},{key:"insertAt",value:function(t,n,r){if(null!=r)return u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r);if(0!==n.length){var o=n.split("\n"),i=o.shift();i.length>0&&(t<this.length()-1||null==this.children.tail?u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,Math.min(t,this.length()-1),i):this.children.tail.insertAt(this.children.tail.length(),i),this.cache={});var l=this;o.reduce(function(t,e){return l=l.split(t,!0),l.insertAt(0,e),e.length},t+i.length)}}},{key:"insertBefore",value:function(t,n){var r=this.children.head;u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n),r instanceof b.default&&r.remove(),this.cache={}}},{key:"length",value:function(){return null==this.cache.length&&(this.cache.length=u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"length",this).call(this)+1),this.cache.length}},{key:"moveChildren",value:function(t,n){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"moveChildren",this).call(this,t,n),this.cache={}}},{key:"optimize",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.cache={}}},{key:"path",value:function(t){return u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"path",this).call(this,t,!0)}},{key:"removeChild",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"removeChild",this).call(this,t),this.cache={}}},{key:"split",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(n&&(0===t||t>=this.length()-1)){var r=this.clone();return 0===t?(this.parent.insertBefore(r,this),this):(this.parent.insertBefore(r,this.next),r)}var o=u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"split",this).call(this,t,n);return this.cache={},o}}]),e}(y.default.Block);x.blotName="block",x.tagName="P",x.defaultChild="break",x.allowedChildren=[m.default,y.default.Embed,O.default],e.bubbleFormats=a,e.BlockEmbed=w,e.default=x},function(t,e,n){var r=n(54),o=n(12),i=n(2),l=n(20),a=String.fromCharCode(0),s=function(t){Array.isArray(t)?this.ops=t:null!=t&&Array.isArray(t.ops)?this.ops=t.ops:this.ops=[]};s.prototype.insert=function(t,e){var n={};return 0===t.length?this:(n.insert=t,null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n))},s.prototype.delete=function(t){return t<=0?this:this.push({delete:t})},s.prototype.retain=function(t,e){if(t<=0)return this;var n={retain:t};return null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n)},s.prototype.push=function(t){var e=this.ops.length,n=this.ops[e-1];if(t=i(!0,{},t),"object"==typeof n){if("number"==typeof t.delete&&"number"==typeof n.delete)return this.ops[e-1]={delete:n.delete+t.delete},this;if("number"==typeof n.delete&&null!=t.insert&&(e-=1,"object"!=typeof(n=this.ops[e-1])))return this.ops.unshift(t),this;if(o(t.attributes,n.attributes)){if("string"==typeof t.insert&&"string"==typeof n.insert)return this.ops[e-1]={insert:n.insert+t.insert},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this;if("number"==typeof t.retain&&"number"==typeof n.retain)return this.ops[e-1]={retain:n.retain+t.retain},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this}}return e===this.ops.length?this.ops.push(t):this.ops.splice(e,0,t),this},s.prototype.chop=function(){var t=this.ops[this.ops.length-1];return t&&t.retain&&!t.attributes&&this.ops.pop(),this},s.prototype.filter=function(t){return this.ops.filter(t)},s.prototype.forEach=function(t){this.ops.forEach(t)},s.prototype.map=function(t){return this.ops.map(t)},s.prototype.partition=function(t){var e=[],n=[];return this.forEach(function(r){(t(r)?e:n).push(r)}),[e,n]},s.prototype.reduce=function(t,e){return this.ops.reduce(t,e)},s.prototype.changeLength=function(){return this.reduce(function(t,e){return e.insert?t+l.length(e):e.delete?t-e.delete:t},0)},s.prototype.length=function(){return this.reduce(function(t,e){return t+l.length(e)},0)},s.prototype.slice=function(t,e){t=t||0,"number"!=typeof e&&(e=1/0);for(var n=[],r=l.iterator(this.ops),o=0;o<e&&r.hasNext();){var i;o<t?i=r.next(t-o):(i=r.next(e-o),n.push(i)),o+=l.length(i)}return new s(n)},s.prototype.compose=function(t){var e=l.iterator(this.ops),n=l.iterator(t.ops),r=[],i=n.peek();if(null!=i&&"number"==typeof i.retain&&null==i.attributes){for(var a=i.retain;"insert"===e.peekType()&&e.peekLength()<=a;)a-=e.peekLength(),r.push(e.next());i.retain-a>0&&n.next(i.retain-a)}for(var u=new s(r);e.hasNext()||n.hasNext();)if("insert"===n.peekType())u.push(n.next());else if("delete"===e.peekType())u.push(e.next());else{var c=Math.min(e.peekLength(),n.peekLength()),f=e.next(c),h=n.next(c);if("number"==typeof h.retain){var p={};"number"==typeof f.retain?p.retain=c:p.insert=f.insert;var d=l.attributes.compose(f.attributes,h.attributes,"number"==typeof f.retain);if(d&&(p.attributes=d),u.push(p),!n.hasNext()&&o(u.ops[u.ops.length-1],p)){var y=new s(e.rest());return u.concat(y).chop()}}else"number"==typeof h.delete&&"number"==typeof f.retain&&u.push(h)}return u.chop()},s.prototype.concat=function(t){var e=new s(this.ops.slice());return t.ops.length>0&&(e.push(t.ops[0]),e.ops=e.ops.concat(t.ops.slice(1))),e},s.prototype.diff=function(t,e){if(this.ops===t.ops)return new s;var n=[this,t].map(function(e){return e.map(function(n){if(null!=n.insert)return"string"==typeof n.insert?n.insert:a;var r=e===t?"on":"with";throw new Error("diff() called "+r+" non-document")}).join("")}),i=new s,u=r(n[0],n[1],e),c=l.iterator(this.ops),f=l.iterator(t.ops);return u.forEach(function(t){for(var e=t[1].length;e>0;){var n=0;switch(t[0]){case r.INSERT:n=Math.min(f.peekLength(),e),i.push(f.next(n));break;case r.DELETE:n=Math.min(e,c.peekLength()),c.next(n),i.delete(n);break;case r.EQUAL:n=Math.min(c.peekLength(),f.peekLength(),e);var a=c.next(n),s=f.next(n);o(a.insert,s.insert)?i.retain(n,l.attributes.diff(a.attributes,s.attributes)):i.push(s).delete(n)}e-=n}}),i.chop()},s.prototype.eachLine=function(t,e){e=e||"\n";for(var n=l.iterator(this.ops),r=new s,o=0;n.hasNext();){if("insert"!==n.peekType())return;var i=n.peek(),a=l.length(i)-n.peekLength(),u="string"==typeof i.insert?i.insert.indexOf(e,a)-a:-1;if(u<0)r.push(n.next());else if(u>0)r.push(n.next(u));else{if(!1===t(r,n.next(1).attributes||{},o))return;o+=1,r=new s}}r.length()>0&&t(r,{},o)},s.prototype.transform=function(t,e){if(e=!!e,"number"==typeof t)return this.transformPosition(t,e);for(var n=l.iterator(this.ops),r=l.iterator(t.ops),o=new s;n.hasNext()||r.hasNext();)if("insert"!==n.peekType()||!e&&"insert"===r.peekType())if("insert"===r.peekType())o.push(r.next());else{var i=Math.min(n.peekLength(),r.peekLength()),a=n.next(i),u=r.next(i);if(a.delete)continue;u.delete?o.push(u):o.retain(i,l.attributes.transform(a.attributes,u.attributes,e))}else o.retain(l.length(n.next()));return o.chop()},s.prototype.transformPosition=function(t,e){e=!!e;for(var n=l.iterator(this.ops),r=0;n.hasNext()&&r<=t;){var o=n.peekLength(),i=n.peekType();n.next(),"delete"!==i?("insert"===i&&(r<t||!e)&&(t+=o),r+=o):t-=Math.min(o,t-r)}return t},t.exports=s},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(8),c=r(u),f=n(0),h=r(f),p=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,[{key:"formatAt",value:function(t,n,r,o){if(e.compare(this.statics.blotName,r)<0&&h.default.query(r,h.default.Scope.BLOT)){var i=this.isolate(t,n);o&&i.wrap(r,o)}else s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,n,r,o)}},{key:"optimize",value:function(t){if(s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.parent instanceof e&&e.compare(this.statics.blotName,this.parent.statics.blotName)>0){var n=this.parent.isolate(this.offset(),this.length());this.moveChildren(n),n.wrap(this)}}}],[{key:"compare",value:function(t,n){var r=e.order.indexOf(t),o=e.order.indexOf(n);return r>=0||o>=0?r-o:t===n?0:t<n?-1:1}}]),e}(h.default.Inline);p.allowedChildren=[p,h.default.Embed,c.default],p.order=["cursor","inline","underline","strike","italic","bold","script","link","code"],e.default=p},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(e=(0,N.default)(!0,{container:t,modules:{clipboard:!0,keyboard:!0,history:!0}},e),e.theme&&e.theme!==S.DEFAULTS.theme){if(e.theme=S.import("themes/"+e.theme),null==e.theme)throw new Error("Invalid theme "+e.theme+". Did you register it?")}else e.theme=T.default;var n=(0,N.default)(!0,{},e.theme.DEFAULTS);[n,e].forEach(function(t){t.modules=t.modules||{},Object.keys(t.modules).forEach(function(e){!0===t.modules[e]&&(t.modules[e]={})})});var r=Object.keys(n.modules).concat(Object.keys(e.modules)),o=r.reduce(function(t,e){var n=S.import("modules/"+e);return null==n?P.error("Cannot load "+e+" module. Are you sure you registered it?"):t[e]=n.DEFAULTS||{},t},{});return null!=e.modules&&e.modules.toolbar&&e.modules.toolbar.constructor!==Object&&(e.modules.toolbar={container:e.modules.toolbar}),e=(0,N.default)(!0,{},S.DEFAULTS,{modules:o},n,e),["bounds","container","scrollingContainer"].forEach(function(t){"string"==typeof e[t]&&(e[t]=document.querySelector(e[t]))}),e.modules=Object.keys(e.modules).reduce(function(t,n){return e.modules[n]&&(t[n]=e.modules[n]),t},{}),e}function a(t,e,n,r){if(this.options.strict&&!this.isEnabled()&&e===g.default.sources.USER)return new d.default;var o=null==n?null:this.getSelection(),i=this.editor.delta,l=t();if(null!=o&&(!0===n&&(n=o.index),null==r?o=u(o,l,e):0!==r&&(o=u(o,n,r,e)),this.setSelection(o,g.default.sources.SILENT)),l.length()>0){var a,s=[g.default.events.TEXT_CHANGE,l,i,e];if((a=this.emitter).emit.apply(a,[g.default.events.EDITOR_CHANGE].concat(s)),e!==g.default.sources.SILENT){var c;(c=this.emitter).emit.apply(c,s)}}return l}function s(t,e,n,r,o){var i={};return"number"==typeof t.index&&"number"==typeof t.length?"number"!=typeof e?(o=r,r=n,n=e,e=t.length,t=t.index):(e=t.length,t=t.index):"number"!=typeof e&&(o=r,r=n,n=e,e=0),"object"===(void 0===n?"undefined":c(n))?(i=n,o=r):"string"==typeof n&&(null!=r?i[n]=r:o=n),o=o||g.default.sources.API,[t,e,i,o]}function u(t,e,n,r){if(null==t)return null;var o=void 0,i=void 0;if(e instanceof d.default){var l=[t.index,t.index+t.length].map(function(t){return e.transformPosition(t,r!==g.default.sources.USER)}),a=f(l,2);o=a[0],i=a[1]}else{var s=[t.index,t.index+t.length].map(function(t){return t<e||t===e&&r===g.default.sources.USER?t:n>=0?t+n:Math.max(e,t+n)}),u=f(s,2);o=u[0],i=u[1]}return new x.Range(o,i-o)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.overload=e.expandConfig=void 0;var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},f=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}();n(53);var p=n(4),d=r(p),y=n(57),v=r(y),b=n(9),g=r(b),m=n(7),_=r(m),O=n(0),w=r(O),x=n(22),k=r(x),E=n(2),N=r(E),j=n(10),A=r(j),q=n(32),T=r(q),P=(0,A.default)("quill"),S=function(){function t(e){var n=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(i(this,t),this.options=l(e,r),this.container=this.options.container,null==this.container)return P.error("Invalid Quill container",e);this.options.debug&&t.debug(this.options.debug);var o=this.container.innerHTML.trim();this.container.classList.add("ql-container"),this.container.innerHTML="",this.container.__quill=this,this.root=this.addContainer("ql-editor"),this.root.classList.add("ql-blank"),this.root.setAttribute("data-gramm",!1),this.scrollingContainer=this.options.scrollingContainer||this.root,this.emitter=new g.default,this.scroll=w.default.create(this.root,{emitter:this.emitter,whitelist:this.options.formats}),this.editor=new v.default(this.scroll),this.selection=new k.default(this.scroll,this.emitter),this.theme=new this.options.theme(this,this.options),this.keyboard=this.theme.addModule("keyboard"),this.clipboard=this.theme.addModule("clipboard"),this.history=this.theme.addModule("history"),this.theme.init(),this.emitter.on(g.default.events.EDITOR_CHANGE,function(t){t===g.default.events.TEXT_CHANGE&&n.root.classList.toggle("ql-blank",n.editor.isBlank())}),this.emitter.on(g.default.events.SCROLL_UPDATE,function(t,e){var r=n.selection.lastRange,o=r&&0===r.length?r.index:void 0;a.call(n,function(){return n.editor.update(null,e,o)},t)});var s=this.clipboard.convert("<div class='ql-editor' style=\"white-space: normal;\">"+o+"<p><br></p></div>");this.setContents(s),this.history.clear(),this.options.placeholder&&this.root.setAttribute("data-placeholder",this.options.placeholder),this.options.readOnly&&this.disable()}return h(t,null,[{key:"debug",value:function(t){!0===t&&(t="log"),A.default.level(t)}},{key:"find",value:function(t){return t.__quill||w.default.find(t)}},{key:"import",value:function(t){return null==this.imports[t]&&P.error("Cannot import "+t+". Are you sure it was registered?"),this.imports[t]}},{key:"register",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if("string"!=typeof t){var o=t.attrName||t.blotName;"string"==typeof o?this.register("formats/"+o,t,e):Object.keys(t).forEach(function(r){n.register(r,t[r],e)})}else null==this.imports[t]||r||P.warn("Overwriting "+t+" with",e),this.imports[t]=e,(t.startsWith("blots/")||t.startsWith("formats/"))&&"abstract"!==e.blotName?w.default.register(e):t.startsWith("modules")&&"function"==typeof e.register&&e.register()}}]),h(t,[{key:"addContainer",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if("string"==typeof t){var n=t;t=document.createElement("div"),t.classList.add(n)}return this.container.insertBefore(t,e),t}},{key:"blur",value:function(){this.selection.setRange(null)}},{key:"deleteText",value:function(t,e,n){var r=this,o=s(t,e,n),i=f(o,4);return t=i[0],e=i[1],n=i[3],a.call(this,function(){return r.editor.deleteText(t,e)},n,t,-1*e)}},{key:"disable",value:function(){this.enable(!1)}},{key:"enable",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.scroll.enable(t),this.container.classList.toggle("ql-disabled",!t)}},{key:"focus",value:function(){var t=this.scrollingContainer.scrollTop;this.selection.focus(),this.scrollingContainer.scrollTop=t,this.scrollIntoView()}},{key:"format",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:g.default.sources.API;return a.call(this,function(){var r=n.getSelection(!0),i=new d.default;if(null==r)return i;if(w.default.query(t,w.default.Scope.BLOCK))i=n.editor.formatLine(r.index,r.length,o({},t,e));else{if(0===r.length)return n.selection.format(t,e),i;i=n.editor.formatText(r.index,r.length,o({},t,e))}return n.setSelection(r,g.default.sources.SILENT),i},r)}},{key:"formatLine",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,e,n,r,o),c=f(u,4);return t=c[0],e=c[1],l=c[2],o=c[3],a.call(this,function(){return i.editor.formatLine(t,e,l)},o,t,0)}},{key:"formatText",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,e,n,r,o),c=f(u,4);return t=c[0],e=c[1],l=c[2],o=c[3],a.call(this,function(){return i.editor.formatText(t,e,l)},o,t,0)}},{key:"getBounds",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=void 0;n="number"==typeof t?this.selection.getBounds(t,e):this.selection.getBounds(t.index,t.length);var r=this.container.getBoundingClientRect();return{bottom:n.bottom-r.top,height:n.height,left:n.left-r.left,right:n.right-r.left,top:n.top-r.top,width:n.width}}},{key:"getContents",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getLength()-t,n=s(t,e),r=f(n,2);return t=r[0],e=r[1],this.editor.getContents(t,e)}},{key:"getFormat",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getSelection(!0),e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return"number"==typeof t?this.editor.getFormat(t,e):this.editor.getFormat(t.index,t.length)}},{key:"getIndex",value:function(t){return t.offset(this.scroll)}},{key:"getLength",value:function(){return this.scroll.length()}},{key:"getLeaf",value:function(t){return this.scroll.leaf(t)}},{key:"getLine",value:function(t){return this.scroll.line(t)}},{key:"getLines",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;return"number"!=typeof t?this.scroll.lines(t.index,t.length):this.scroll.lines(t,e)}},{key:"getModule",value:function(t){return this.theme.modules[t]}},{key:"getSelection",value:function(){return arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&this.focus(),this.update(),this.selection.getRange()[0]}},{key:"getText",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getLength()-t,n=s(t,e),r=f(n,2);return t=r[0],e=r[1],this.editor.getText(t,e)}},{key:"hasFocus",value:function(){return this.selection.hasFocus()}},{key:"insertEmbed",value:function(e,n,r){var o=this,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:t.sources.API;return a.call(this,function(){return o.editor.insertEmbed(e,n,r)},i,e)}},{key:"insertText",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,0,n,r,o),c=f(u,4);return t=c[0],l=c[2],o=c[3],a.call(this,function(){return i.editor.insertText(t,e,l)},o,t,e.length)}},{key:"isEnabled",value:function(){return!this.container.classList.contains("ql-disabled")}},{key:"off",value:function(){return this.emitter.off.apply(this.emitter,arguments)}},{key:"on",value:function(){return this.emitter.on.apply(this.emitter,arguments)}},{key:"once",value:function(){return this.emitter.once.apply(this.emitter,arguments)}},{key:"pasteHTML",value:function(t,e,n){this.clipboard.dangerouslyPasteHTML(t,e,n)}},{key:"removeFormat",value:function(t,e,n){var r=this,o=s(t,e,n),i=f(o,4);return t=i[0],e=i[1],n=i[3],a.call(this,function(){return r.editor.removeFormat(t,e)},n,t)}},{key:"scrollIntoView",value:function(){this.selection.scrollIntoView(this.scrollingContainer)}},{key:"setContents",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API;return a.call(this,function(){t=new d.default(t);var n=e.getLength(),r=e.editor.deleteText(0,n),o=e.editor.applyDelta(t),i=o.ops[o.ops.length-1];return null!=i&&"string"==typeof i.insert&&"\n"===i.insert[i.insert.length-1]&&(e.editor.deleteText(e.getLength()-1,1),o.delete(1)),r.compose(o)},n)}},{key:"setSelection",value:function(e,n,r){if(null==e)this.selection.setRange(null,n||t.sources.API);else{var o=s(e,n,r),i=f(o,4);e=i[0],n=i[1],r=i[3],this.selection.setRange(new x.Range(e,n),r),r!==g.default.sources.SILENT&&this.selection.scrollIntoView(this.scrollingContainer)}}},{key:"setText",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API,n=(new d.default).insert(t);return this.setContents(n,e)}},{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:g.default.sources.USER,e=this.scroll.update(t);return this.selection.update(t),e}},{key:"updateContents",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API;return a.call(this,function(){return t=new d.default(t),e.editor.applyDelta(t,n)},n,!0)}}]),t}();S.DEFAULTS={bounds:null,formats:null,modules:{},placeholder:"",readOnly:!1,scrollingContainer:null,strict:!0,theme:"default"},S.events=g.default.events,S.sources=g.default.sources,S.version="1.3.7",S.imports={delta:d.default,parchment:w.default,"core/module":_.default,"core/theme":T.default},e.expandConfig=l,e.overload=s,e.default=S},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};r(this,t),this.quill=e,this.options=n};o.DEFAULTS={},e.default=o},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=n(0),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default.Text);e.default=s},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(58),c=r(u),f=n(10),h=r(f),p=(0,h.default)("quill:events");["selectionchange","mousedown","mouseup","click"].forEach(function(t){document.addEventListener(t,function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];[].slice.call(document.querySelectorAll(".ql-container")).forEach(function(t){if(t.__quill&&t.__quill.emitter){var n;(n=t.__quill.emitter).handleDOM.apply(n,e)}})})});var d=function(t){function e(){o(this,e);var t=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return t.listeners={},t.on("error",p.error),t}return l(e,t),a(e,[{key:"emit",value:function(){p.log.apply(p,arguments),s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"emit",this).apply(this,arguments)}},{key:"handleDOM",value:function(t){for(var e=arguments.length,n=Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];(this.listeners[t.type]||[]).forEach(function(e){var r=e.node,o=e.handler;(t.target===r||r.contains(t.target))&&o.apply(void 0,[t].concat(n))})}},{key:"listenDOM",value:function(t,e,n){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push({node:e,handler:n})}}]),e}(c.default);d.events={EDITOR_CHANGE:"editor-change",SCROLL_BEFORE_UPDATE:"scroll-before-update",SCROLL_OPTIMIZE:"scroll-optimize",SCROLL_UPDATE:"scroll-update",SELECTION_CHANGE:"selection-change",TEXT_CHANGE:"text-change"},d.sources={API:"api",SILENT:"silent",USER:"user"},e.default=d},function(t,e,n){"use strict";function r(t){if(i.indexOf(t)<=i.indexOf(l)){for(var e,n=arguments.length,r=Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];(e=console)[t].apply(e,r)}}function o(t){return i.reduce(function(e,n){return e[n]=r.bind(console,n,t),e},{})}Object.defineProperty(e,"__esModule",{value:!0});var i=["error","warn","log","info"],l="warn";r.level=o.level=function(t){l=t},e.default=o},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=function(){function t(t,e,n){void 0===n&&(n={}),this.attrName=t,this.keyName=e;var o=r.Scope.TYPE&r.Scope.ATTRIBUTE;null!=n.scope?this.scope=n.scope&r.Scope.LEVEL|o:this.scope=r.Scope.ATTRIBUTE,null!=n.whitelist&&(this.whitelist=n.whitelist)}return t.keys=function(t){return[].map.call(t.attributes,function(t){return t.name})},t.prototype.add=function(t,e){return!!this.canAdd(t,e)&&(t.setAttribute(this.keyName,e),!0)},t.prototype.canAdd=function(t,e){return null!=r.query(t,r.Scope.BLOT&(this.scope|r.Scope.TYPE))&&(null==this.whitelist||("string"==typeof e?this.whitelist.indexOf(e.replace(/["']/g,""))>-1:this.whitelist.indexOf(e)>-1))},t.prototype.remove=function(t){t.removeAttribute(this.keyName)},t.prototype.value=function(t){var e=t.getAttribute(this.keyName);return this.canAdd(t,e)&&e?e:""},t}();e.default=o},function(t,e,n){function r(t){return null===t||void 0===t}function o(t){return!(!t||"object"!=typeof t||"number"!=typeof t.length)&&("function"==typeof t.copy&&"function"==typeof t.slice&&!(t.length>0&&"number"!=typeof t[0]))}function i(t,e,n){var i,c;if(r(t)||r(e))return!1;if(t.prototype!==e.prototype)return!1;if(s(t))return!!s(e)&&(t=l.call(t),e=l.call(e),u(t,e,n));if(o(t)){if(!o(e))return!1;if(t.length!==e.length)return!1;for(i=0;i<t.length;i++)if(t[i]!==e[i])return!1;return!0}try{var f=a(t),h=a(e)}catch(t){return!1}if(f.length!=h.length)return!1;for(f.sort(),h.sort(),i=f.length-1;i>=0;i--)if(f[i]!=h[i])return!1;for(i=f.length-1;i>=0;i--)if(c=f[i],!u(t[c],e[c],n))return!1;return typeof t==typeof e}var l=Array.prototype.slice,a=n(55),s=n(56),u=t.exports=function(t,e,n){return n||(n={}),t===e||(t instanceof Date&&e instanceof Date?t.getTime()===e.getTime():!t||!e||"object"!=typeof t&&"object"!=typeof e?n.strict?t===e:t==e:i(t,e,n))}},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.Code=void 0;var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(4),f=r(c),h=n(0),p=r(h),d=n(3),y=r(d),v=n(5),b=r(v),g=n(8),m=r(g),_=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),e}(b.default);_.blotName="code",_.tagName="CODE";var O=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),s(e,[{key:"delta",value:function(){var t=this,e=this.domNode.textContent;return e.endsWith("\n")&&(e=e.slice(0,-1)),e.split("\n").reduce(function(e,n){return e.insert(n).insert("\n",t.formats())},new f.default)}},{key:"format",value:function(t,n){if(t!==this.statics.blotName||!n){var r=this.descendant(m.default,this.length()-1),o=a(r,1),i=o[0];null!=i&&i.deleteAt(i.length()-1,1),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n)}}},{key:"formatAt",value:function(t,n,r,o){if(0!==n&&null!=p.default.query(r,p.default.Scope.BLOCK)&&(r!==this.statics.blotName||o!==this.statics.formats(this.domNode))){var i=this.newlineIndex(t);if(!(i<0||i>=t+n)){var l=this.newlineIndex(t,!0)+1,a=i-l+1,s=this.isolate(l,a),u=s.next;s.format(r,o),u instanceof e&&u.formatAt(0,t-l+n-a,r,o)}}}},{key:"insertAt",value:function(t,e,n){if(null==n){var r=this.descendant(m.default,t),o=a(r,2),i=o[0],l=o[1];i.insertAt(l,e)}}},{key:"length",value:function(){var t=this.domNode.textContent.length;return this.domNode.textContent.endsWith("\n")?t:t+1}},{key:"newlineIndex",value:function(t){if(arguments.length>1&&void 0!==arguments[1]&&arguments[1])return this.domNode.textContent.slice(0,t).lastIndexOf("\n");var e=this.domNode.textContent.slice(t).indexOf("\n");return e>-1?t+e:-1}},{key:"optimize",value:function(t){this.domNode.textContent.endsWith("\n")||this.appendChild(p.default.create("text","\n")),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t);var n=this.next;null!=n&&n.prev===this&&n.statics.blotName===this.statics.blotName&&this.statics.formats(this.domNode)===n.statics.formats(n.domNode)&&(n.optimize(t),n.moveChildren(this),n.remove())}},{key:"replace",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replace",this).call(this,t),[].slice.call(this.domNode.querySelectorAll("*")).forEach(function(t){var e=p.default.find(t);null==e?t.parentNode.removeChild(t):e instanceof p.default.Embed?e.remove():e.unwrap()})}}],[{key:"create",value:function(t){var n=u(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return n.setAttribute("spellcheck",!1),n}},{key:"formats",value:function(){return!0}}]),e}(y.default);O.blotName="code-block",O.tagName="PRE",O.TAB="  ",e.Code=_,e.default=O},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"insertInto",value:function(t,n){0===t.children.length?a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertInto",this).call(this,t,n):this.remove()}},{key:"length",value:function(){return 0}},{key:"value",value:function(){return""}}],[{key:"value",value:function(){}}]),e}(u.default.Embed);c.blotName="break",c.tagName="BR",e.default=c},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){var n=document.createElement("a");n.href=t;var r=n.href.slice(0,n.href.indexOf(":"));return e.indexOf(r)>-1}Object.defineProperty(e,"__esModule",{value:!0}),e.sanitize=e.default=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(5),c=function(t){return t&&t.__esModule?t:{default:t}}(u),f=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),a(e,[{key:"format",value:function(t,n){if(t!==this.statics.blotName||!n)return s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);n=this.constructor.sanitize(n),this.domNode.setAttribute("href",n)}}],[{key:"create",value:function(t){var n=s(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return t=this.sanitize(t),n.setAttribute("href",t),n.setAttribute("rel","noopener noreferrer"),n.setAttribute("target","_blank"),n}},{key:"formats",value:function(t){return t.getAttribute("href")}},{key:"sanitize",value:function(t){return l(t,this.PROTOCOL_WHITELIST)?t:this.SANITIZED_URL}}]),e}(c.default);f.blotName="link",f.tagName="A",f.SANITIZED_URL="about:blank",f.PROTOCOL_WHITELIST=["http","https","mailto","tel"],e.default=f,e.sanitize=l},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){t.setAttribute(e,!("true"===t.getAttribute(e)))}Object.defineProperty(e,"__esModule",{value:!0});var l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=n(25),u=r(s),c=n(106),f=r(c),h=0,p=function(){function t(e){var n=this;o(this,t),this.select=e,this.container=document.createElement("span"),this.buildPicker(),this.select.style.display="none",this.select.parentNode.insertBefore(this.container,this.select),this.label.addEventListener("mousedown",function(){n.togglePicker()}),this.label.addEventListener("keydown",function(t){switch(t.keyCode){case u.default.keys.ENTER:n.togglePicker();break;case u.default.keys.ESCAPE:n.escape(),t.preventDefault()}}),this.select.addEventListener("change",this.update.bind(this))}return a(t,[{key:"togglePicker",value:function(){this.container.classList.toggle("ql-expanded"),i(this.label,"aria-expanded"),i(this.options,"aria-hidden")}},{key:"buildItem",value:function(t){var e=this,n=document.createElement("span");return n.tabIndex="0",n.setAttribute("role","button"),n.classList.add("ql-picker-item"),t.hasAttribute("value")&&n.setAttribute("data-value",t.getAttribute("value")),t.textContent&&n.setAttribute("data-label",t.textContent),n.addEventListener("click",function(){e.selectItem(n,!0)}),n.addEventListener("keydown",function(t){switch(t.keyCode){case u.default.keys.ENTER:e.selectItem(n,!0),t.preventDefault();break;case u.default.keys.ESCAPE:e.escape(),t.preventDefault()}}),n}},{key:"buildLabel",value:function(){var t=document.createElement("span");return t.classList.add("ql-picker-label"),t.innerHTML=f.default,t.tabIndex="0",t.setAttribute("role","button"),t.setAttribute("aria-expanded","false"),this.container.appendChild(t),t}},{key:"buildOptions",value:function(){var t=this,e=document.createElement("span");e.classList.add("ql-picker-options"),e.setAttribute("aria-hidden","true"),e.tabIndex="-1",e.id="ql-picker-options-"+h,h+=1,this.label.setAttribute("aria-controls",e.id),this.options=e,[].slice.call(this.select.options).forEach(function(n){var r=t.buildItem(n);e.appendChild(r),!0===n.selected&&t.selectItem(r)}),this.container.appendChild(e)}},{key:"buildPicker",value:function(){var t=this;[].slice.call(this.select.attributes).forEach(function(e){t.container.setAttribute(e.name,e.value)}),this.container.classList.add("ql-picker"),this.label=this.buildLabel(),this.buildOptions()}},{key:"escape",value:function(){var t=this;this.close(),setTimeout(function(){return t.label.focus()},1)}},{key:"close",value:function(){this.container.classList.remove("ql-expanded"),this.label.setAttribute("aria-expanded","false"),this.options.setAttribute("aria-hidden","true")}},{key:"selectItem",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=this.container.querySelector(".ql-selected");if(t!==n&&(null!=n&&n.classList.remove("ql-selected"),null!=t&&(t.classList.add("ql-selected"),this.select.selectedIndex=[].indexOf.call(t.parentNode.children,t),t.hasAttribute("data-value")?this.label.setAttribute("data-value",t.getAttribute("data-value")):this.label.removeAttribute("data-value"),t.hasAttribute("data-label")?this.label.setAttribute("data-label",t.getAttribute("data-label")):this.label.removeAttribute("data-label"),e))){if("function"==typeof Event)this.select.dispatchEvent(new Event("change"));else if("object"===("undefined"==typeof Event?"undefined":l(Event))){var r=document.createEvent("Event");r.initEvent("change",!0,!0),this.select.dispatchEvent(r)}this.close()}}},{key:"update",value:function(){var t=void 0;if(this.select.selectedIndex>-1){var e=this.container.querySelector(".ql-picker-options").children[this.select.selectedIndex];t=this.select.options[this.select.selectedIndex],this.selectItem(e)}else this.selectItem(null);var n=null!=t&&t!==this.select.querySelector("option[selected]");this.label.classList.toggle("ql-active",n)}}]),t}();e.default=p},function(t,e,n){"use strict";function r(t){var e=a.find(t);if(null==e)try{e=a.create(t)}catch(n){e=a.create(a.Scope.INLINE),[].slice.call(t.childNodes).forEach(function(t){e.domNode.appendChild(t)}),t.parentNode&&t.parentNode.replaceChild(e.domNode,t),e.attach()}return e}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(47),l=n(27),a=n(1),s=function(t){function e(e){var n=t.call(this,e)||this;return n.build(),n}return o(e,t),e.prototype.appendChild=function(t){this.insertBefore(t)},e.prototype.attach=function(){t.prototype.attach.call(this),this.children.forEach(function(t){t.attach()})},e.prototype.build=function(){var t=this;this.children=new i.default,[].slice.call(this.domNode.childNodes).reverse().forEach(function(e){try{var n=r(e);t.insertBefore(n,t.children.head||void 0)}catch(t){if(t instanceof a.ParchmentError)return;throw t}})},e.prototype.deleteAt=function(t,e){if(0===t&&e===this.length())return this.remove();this.children.forEachAt(t,e,function(t,e,n){t.deleteAt(e,n)})},e.prototype.descendant=function(t,n){var r=this.children.find(n),o=r[0],i=r[1];return null==t.blotName&&t(o)||null!=t.blotName&&o instanceof t?[o,i]:o instanceof e?o.descendant(t,i):[null,-1]},e.prototype.descendants=function(t,n,r){void 0===n&&(n=0),void 0===r&&(r=Number.MAX_VALUE);var o=[],i=r;return this.children.forEachAt(n,r,function(n,r,l){(null==t.blotName&&t(n)||null!=t.blotName&&n instanceof t)&&o.push(n),n instanceof e&&(o=o.concat(n.descendants(t,r,i))),i-=l}),o},e.prototype.detach=function(){this.children.forEach(function(t){t.detach()}),t.prototype.detach.call(this)},e.prototype.formatAt=function(t,e,n,r){this.children.forEachAt(t,e,function(t,e,o){t.formatAt(e,o,n,r)})},e.prototype.insertAt=function(t,e,n){var r=this.children.find(t),o=r[0],i=r[1];if(o)o.insertAt(i,e,n);else{var l=null==n?a.create("text",e):a.create(e,n);this.appendChild(l)}},e.prototype.insertBefore=function(t,e){if(null!=this.statics.allowedChildren&&!this.statics.allowedChildren.some(function(e){return t instanceof e}))throw new a.ParchmentError("Cannot insert "+t.statics.blotName+" into "+this.statics.blotName);t.insertInto(this,e)},e.prototype.length=function(){return this.children.reduce(function(t,e){return t+e.length()},0)},e.prototype.moveChildren=function(t,e){this.children.forEach(function(n){t.insertBefore(n,e)})},e.prototype.optimize=function(e){if(t.prototype.optimize.call(this,e),0===this.children.length)if(null!=this.statics.defaultChild){var n=a.create(this.statics.defaultChild);this.appendChild(n),n.optimize(e)}else this.remove()},e.prototype.path=function(t,n){void 0===n&&(n=!1);var r=this.children.find(t,n),o=r[0],i=r[1],l=[[this,t]];return o instanceof e?l.concat(o.path(i,n)):(null!=o&&l.push([o,i]),l)},e.prototype.removeChild=function(t){this.children.remove(t)},e.prototype.replace=function(n){n instanceof e&&n.moveChildren(this),t.prototype.replace.call(this,n)},e.prototype.split=function(t,e){if(void 0===e&&(e=!1),!e){if(0===t)return this;if(t===this.length())return this.next}var n=this.clone();return this.parent.insertBefore(n,this.next),this.children.forEachAt(t,this.length(),function(t,r,o){t=t.split(r,e),n.appendChild(t)}),n},e.prototype.unwrap=function(){this.moveChildren(this.parent,this.next),this.remove()},e.prototype.update=function(t,e){var n=this,o=[],i=[];t.forEach(function(t){t.target===n.domNode&&"childList"===t.type&&(o.push.apply(o,t.addedNodes),i.push.apply(i,t.removedNodes))}),i.forEach(function(t){if(!(null!=t.parentNode&&"IFRAME"!==t.tagName&&document.body.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY)){var e=a.find(t);null!=e&&(null!=e.domNode.parentNode&&e.domNode.parentNode!==n.domNode||e.detach())}}),o.filter(function(t){return t.parentNode==n.domNode}).sort(function(t,e){return t===e?0:t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING?1:-1}).forEach(function(t){var e=null;null!=t.nextSibling&&(e=a.find(t.nextSibling));var o=r(t);o.next==e&&null!=o.next||(null!=o.parent&&o.parent.removeChild(n),n.insertBefore(o,e||void 0))})},e}(l.default);e.default=s},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(11),i=n(28),l=n(17),a=n(1),s=function(t){function e(e){var n=t.call(this,e)||this;return n.attributes=new i.default(n.domNode),n}return r(e,t),e.formats=function(t){return"string"==typeof this.tagName||(Array.isArray(this.tagName)?t.tagName.toLowerCase():void 0)},e.prototype.format=function(t,e){var n=a.query(t);n instanceof o.default?this.attributes.attribute(n,e):e&&(null==n||t===this.statics.blotName&&this.formats()[t]===e||this.replaceWith(t,e))},e.prototype.formats=function(){var t=this.attributes.values(),e=this.statics.formats(this.domNode);return null!=e&&(t[this.statics.blotName]=e),t},e.prototype.replaceWith=function(e,n){var r=t.prototype.replaceWith.call(this,e,n);return this.attributes.copy(r),r},e.prototype.update=function(e,n){var r=this;t.prototype.update.call(this,e,n),e.some(function(t){return t.target===r.domNode&&"attributes"===t.type})&&this.attributes.build()},e.prototype.wrap=function(n,r){var o=t.prototype.wrap.call(this,n,r);return o instanceof e&&o.statics.scope===this.statics.scope&&this.attributes.move(o),o},e}(l.default);e.default=s},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(27),i=n(1),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.value=function(t){return!0},e.prototype.index=function(t,e){return this.domNode===t||this.domNode.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY?Math.min(e,1):-1},e.prototype.position=function(t,e){var n=[].indexOf.call(this.parent.domNode.childNodes,this.domNode);return t>0&&(n+=1),[this.parent.domNode,n]},e.prototype.value=function(){var t;return t={},t[this.statics.blotName]=this.statics.value(this.domNode)||!0,t},e.scope=i.Scope.INLINE_BLOT,e}(o.default);e.default=l},function(t,e,n){function r(t){this.ops=t,this.index=0,this.offset=0}var o=n(12),i=n(2),l={attributes:{compose:function(t,e,n){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var r=i(!0,{},e);n||(r=Object.keys(r).reduce(function(t,e){return null!=r[e]&&(t[e]=r[e]),t},{}));for(var o in t)void 0!==t[o]&&void 0===e[o]&&(r[o]=t[o]);return Object.keys(r).length>0?r:void 0},diff:function(t,e){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var n=Object.keys(t).concat(Object.keys(e)).reduce(function(n,r){return o(t[r],e[r])||(n[r]=void 0===e[r]?null:e[r]),n},{});return Object.keys(n).length>0?n:void 0},transform:function(t,e,n){if("object"!=typeof t)return e;if("object"==typeof e){if(!n)return e;var r=Object.keys(e).reduce(function(n,r){return void 0===t[r]&&(n[r]=e[r]),n},{});return Object.keys(r).length>0?r:void 0}}},iterator:function(t){return new r(t)},length:function(t){return"number"==typeof t.delete?t.delete:"number"==typeof t.retain?t.retain:"string"==typeof t.insert?t.insert.length:1}};r.prototype.hasNext=function(){return this.peekLength()<1/0},r.prototype.next=function(t){t||(t=1/0);var e=this.ops[this.index];if(e){var n=this.offset,r=l.length(e);if(t>=r-n?(t=r-n,this.index+=1,this.offset=0):this.offset+=t,"number"==typeof e.delete)return{delete:t};var o={};return e.attributes&&(o.attributes=e.attributes),"number"==typeof e.retain?o.retain=t:"string"==typeof e.insert?o.insert=e.insert.substr(n,t):o.insert=e.insert,o}return{retain:1/0}},r.prototype.peek=function(){return this.ops[this.index]},r.prototype.peekLength=function(){return this.ops[this.index]?l.length(this.ops[this.index])-this.offset:1/0},r.prototype.peekType=function(){return this.ops[this.index]?"number"==typeof this.ops[this.index].delete?"delete":"number"==typeof this.ops[this.index].retain?"retain":"insert":"retain"},r.prototype.rest=function(){if(this.hasNext()){if(0===this.offset)return this.ops.slice(this.index);var t=this.offset,e=this.index,n=this.next(),r=this.ops.slice(this.index);return this.offset=t,this.index=e,[n].concat(r)}return[]},t.exports=l},function(t,e){var n=function(){"use strict";function t(t,e){return null!=e&&t instanceof e}function e(n,r,o,i,c){function f(n,o){if(null===n)return null;if(0===o)return n;var y,v;if("object"!=typeof n)return n;if(t(n,a))y=new a;else if(t(n,s))y=new s;else if(t(n,u))y=new u(function(t,e){n.then(function(e){t(f(e,o-1))},function(t){e(f(t,o-1))})});else if(e.__isArray(n))y=[];else if(e.__isRegExp(n))y=new RegExp(n.source,l(n)),n.lastIndex&&(y.lastIndex=n.lastIndex);else if(e.__isDate(n))y=new Date(n.getTime());else{if(d&&Buffer.isBuffer(n))return y=Buffer.allocUnsafe?Buffer.allocUnsafe(n.length):new Buffer(n.length),n.copy(y),y;t(n,Error)?y=Object.create(n):void 0===i?(v=Object.getPrototypeOf(n),y=Object.create(v)):(y=Object.create(i),v=i)}if(r){var b=h.indexOf(n);if(-1!=b)return p[b];h.push(n),p.push(y)}t(n,a)&&n.forEach(function(t,e){var n=f(e,o-1),r=f(t,o-1);y.set(n,r)}),t(n,s)&&n.forEach(function(t){var e=f(t,o-1);y.add(e)});for(var g in n){var m;v&&(m=Object.getOwnPropertyDescriptor(v,g)),m&&null==m.set||(y[g]=f(n[g],o-1))}if(Object.getOwnPropertySymbols)for(var _=Object.getOwnPropertySymbols(n),g=0;g<_.length;g++){var O=_[g],w=Object.getOwnPropertyDescriptor(n,O);(!w||w.enumerable||c)&&(y[O]=f(n[O],o-1),w.enumerable||Object.defineProperty(y,O,{enumerable:!1}))}if(c)for(var x=Object.getOwnPropertyNames(n),g=0;g<x.length;g++){var k=x[g],w=Object.getOwnPropertyDescriptor(n,k);w&&w.enumerable||(y[k]=f(n[k],o-1),Object.defineProperty(y,k,{enumerable:!1}))}return y}"object"==typeof r&&(o=r.depth,i=r.prototype,c=r.includeNonEnumerable,r=r.circular);var h=[],p=[],d="undefined"!=typeof Buffer;return void 0===r&&(r=!0),void 0===o&&(o=1/0),f(n,o)}function n(t){return Object.prototype.toString.call(t)}function r(t){return"object"==typeof t&&"[object Date]"===n(t)}function o(t){return"object"==typeof t&&"[object Array]"===n(t)}function i(t){return"object"==typeof t&&"[object RegExp]"===n(t)}function l(t){var e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),e}var a;try{a=Map}catch(t){a=function(){}}var s;try{s=Set}catch(t){s=function(){}}var u;try{u=Promise}catch(t){u=function(){}}return e.clonePrototype=function(t){if(null===t)return null;var e=function(){};return e.prototype=t,new e},e.__objToStr=n,e.__isDate=r,e.__isArray=o,e.__isRegExp=i,e.__getRegExpFlags=l,e}();"object"==typeof t&&t.exports&&(t.exports=n)},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){try{e.parentNode}catch(t){return!1}return e instanceof Text&&(e=e.parentNode),t.contains(e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.Range=void 0;var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(0),c=r(u),f=n(21),h=r(f),p=n(12),d=r(p),y=n(9),v=r(y),b=n(10),g=r(b),m=(0,g.default)("quill:selection"),_=function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;i(this,t),this.index=e,this.length=n},O=function(){function t(e,n){var r=this;i(this,t),this.emitter=n,this.scroll=e,this.composing=!1,this.mouseDown=!1,this.root=this.scroll.domNode,this.cursor=c.default.create("cursor",this),this.lastRange=this.savedRange=new _(0,0),this.handleComposition(),this.handleDragging(),this.emitter.listenDOM("selectionchange",document,function(){r.mouseDown||setTimeout(r.update.bind(r,v.default.sources.USER),1)}),this.emitter.on(v.default.events.EDITOR_CHANGE,function(t,e){t===v.default.events.TEXT_CHANGE&&e.length()>0&&r.update(v.default.sources.SILENT)}),this.emitter.on(v.default.events.SCROLL_BEFORE_UPDATE,function(){if(r.hasFocus()){var t=r.getNativeRange();null!=t&&t.start.node!==r.cursor.textNode&&r.emitter.once(v.default.events.SCROLL_UPDATE,function(){try{r.setNativeRange(t.start.node,t.start.offset,t.end.node,t.end.offset)}catch(t){}})}}),this.emitter.on(v.default.events.SCROLL_OPTIMIZE,function(t,e){if(e.range){var n=e.range,o=n.startNode,i=n.startOffset,l=n.endNode,a=n.endOffset;r.setNativeRange(o,i,l,a)}}),this.update(v.default.sources.SILENT)}return s(t,[{key:"handleComposition",value:function(){var t=this;this.root.addEventListener("compositionstart",function(){t.composing=!0}),this.root.addEventListener("compositionend",function(){if(t.composing=!1,t.cursor.parent){var e=t.cursor.restore();if(!e)return;setTimeout(function(){t.setNativeRange(e.startNode,e.startOffset,e.endNode,e.endOffset)},1)}})}},{key:"handleDragging",value:function(){var t=this;this.emitter.listenDOM("mousedown",document.body,function(){t.mouseDown=!0}),this.emitter.listenDOM("mouseup",document.body,function(){t.mouseDown=!1,t.update(v.default.sources.USER)})}},{key:"focus",value:function(){this.hasFocus()||(this.root.focus(),this.setRange(this.savedRange))}},{key:"format",value:function(t,e){if(null==this.scroll.whitelist||this.scroll.whitelist[t]){this.scroll.update();var n=this.getNativeRange();if(null!=n&&n.native.collapsed&&!c.default.query(t,c.default.Scope.BLOCK)){if(n.start.node!==this.cursor.textNode){var r=c.default.find(n.start.node,!1);if(null==r)return;if(r instanceof c.default.Leaf){var o=r.split(n.start.offset);r.parent.insertBefore(this.cursor,o)}else r.insertBefore(this.cursor,n.start.node);this.cursor.attach()}this.cursor.format(t,e),this.scroll.optimize(),this.setNativeRange(this.cursor.textNode,this.cursor.textNode.data.length),this.update()}}}},{key:"getBounds",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=this.scroll.length();t=Math.min(t,n-1),e=Math.min(t+e,n-1)-t;var r=void 0,o=this.scroll.leaf(t),i=a(o,2),l=i[0],s=i[1];if(null==l)return null;var u=l.position(s,!0),c=a(u,2);r=c[0],s=c[1];var f=document.createRange();if(e>0){f.setStart(r,s);var h=this.scroll.leaf(t+e),p=a(h,2);if(l=p[0],s=p[1],null==l)return null;var d=l.position(s,!0),y=a(d,2);return r=y[0],s=y[1],f.setEnd(r,s),f.getBoundingClientRect()}var v="left",b=void 0;return r instanceof Text?(s<r.data.length?(f.setStart(r,s),f.setEnd(r,s+1)):(f.setStart(r,s-1),f.setEnd(r,s),v="right"),b=f.getBoundingClientRect()):(b=l.domNode.getBoundingClientRect(),s>0&&(v="right")),{bottom:b.top+b.height,height:b.height,left:b[v],right:b[v],top:b.top,width:0}}},{key:"getNativeRange",value:function(){var t=document.getSelection();if(null==t||t.rangeCount<=0)return null;var e=t.getRangeAt(0);if(null==e)return null;var n=this.normalizeNative(e);return m.info("getNativeRange",n),n}},{key:"getRange",value:function(){var t=this.getNativeRange();return null==t?[null,null]:[this.normalizedToRange(t),t]}},{key:"hasFocus",value:function(){return document.activeElement===this.root}},{key:"normalizedToRange",value:function(t){var e=this,n=[[t.start.node,t.start.offset]];t.native.collapsed||n.push([t.end.node,t.end.offset]);var r=n.map(function(t){var n=a(t,2),r=n[0],o=n[1],i=c.default.find(r,!0),l=i.offset(e.scroll);return 0===o?l:i instanceof c.default.Container?l+i.length():l+i.index(r,o)}),i=Math.min(Math.max.apply(Math,o(r)),this.scroll.length()-1),l=Math.min.apply(Math,[i].concat(o(r)));return new _(l,i-l)}},{key:"normalizeNative",value:function(t){if(!l(this.root,t.startContainer)||!t.collapsed&&!l(this.root,t.endContainer))return null;var e={start:{node:t.startContainer,offset:t.startOffset},end:{node:t.endContainer,offset:t.endOffset},native:t};return[e.start,e.end].forEach(function(t){for(var e=t.node,n=t.offset;!(e instanceof Text)&&e.childNodes.length>0;)if(e.childNodes.length>n)e=e.childNodes[n],n=0;else{if(e.childNodes.length!==n)break;e=e.lastChild,n=e instanceof Text?e.data.length:e.childNodes.length+1}t.node=e,t.offset=n}),e}},{key:"rangeToNative",value:function(t){var e=this,n=t.collapsed?[t.index]:[t.index,t.index+t.length],r=[],o=this.scroll.length();return n.forEach(function(t,n){t=Math.min(o-1,t);var i=void 0,l=e.scroll.leaf(t),s=a(l,2),u=s[0],c=s[1],f=u.position(c,0!==n),h=a(f,2);i=h[0],c=h[1],r.push(i,c)}),r.length<2&&(r=r.concat(r)),r}},{key:"scrollIntoView",value:function(t){var e=this.lastRange;if(null!=e){var n=this.getBounds(e.index,e.length);if(null!=n){var r=this.scroll.length()-1,o=this.scroll.line(Math.min(e.index,r)),i=a(o,1),l=i[0],s=l;if(e.length>0){var u=this.scroll.line(Math.min(e.index+e.length,r));s=a(u,1)[0]}if(null!=l&&null!=s){var c=t.getBoundingClientRect();n.top<c.top?t.scrollTop-=c.top-n.top:n.bottom>c.bottom&&(t.scrollTop+=n.bottom-c.bottom)}}}}},{key:"setNativeRange",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:t,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:e,o=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(m.info("setNativeRange",t,e,n,r),null==t||null!=this.root.parentNode&&null!=t.parentNode&&null!=n.parentNode){var i=document.getSelection();if(null!=i)if(null!=t){this.hasFocus()||this.root.focus();var l=(this.getNativeRange()||{}).native;if(null==l||o||t!==l.startContainer||e!==l.startOffset||n!==l.endContainer||r!==l.endOffset){"BR"==t.tagName&&(e=[].indexOf.call(t.parentNode.childNodes,t),t=t.parentNode),"BR"==n.tagName&&(r=[].indexOf.call(n.parentNode.childNodes,n),n=n.parentNode);var a=document.createRange();a.setStart(t,e),a.setEnd(n,r),i.removeAllRanges(),i.addRange(a)}}else i.removeAllRanges(),this.root.blur(),document.body.focus()}}},{key:"setRange",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:v.default.sources.API;if("string"==typeof e&&(n=e,e=!1),m.info("setRange",t),null!=t){var r=this.rangeToNative(t);this.setNativeRange.apply(this,o(r).concat([e]))}else this.setNativeRange(null);this.update(n)}},{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v.default.sources.USER,e=this.lastRange,n=this.getRange(),r=a(n,2),o=r[0],i=r[1];if(this.lastRange=o,null!=this.lastRange&&(this.savedRange=this.lastRange),!(0,d.default)(e,this.lastRange)){var l;!this.composing&&null!=i&&i.native.collapsed&&i.start.node!==this.cursor.textNode&&this.cursor.restore();var s=[v.default.events.SELECTION_CHANGE,(0,h.default)(this.lastRange),(0,h.default)(e),t];if((l=this.emitter).emit.apply(l,[v.default.events.EDITOR_CHANGE].concat(s)),t!==v.default.sources.SILENT){var u;(u=this.emitter).emit.apply(u,s)}}}}]),t}();e.Range=_,e.default=O},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(0),s=r(a),u=n(3),c=r(u),f=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),e}(s.default.Container);f.allowedChildren=[c.default,u.BlockEmbed,f],e.default=f},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.ColorStyle=e.ColorClass=e.ColorAttributor=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"value",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t);return n.startsWith("rgb(")?(n=n.replace(/^[^\d]+/,"").replace(/[^\d]+$/,""),"#"+n.split(",").map(function(t){return("00"+parseInt(t).toString(16)).slice(-2)}).join("")):n}}]),e}(u.default.Attributor.Style),f=new u.default.Attributor.Class("color","ql-color",{scope:u.default.Scope.INLINE}),h=new c("color","color",{scope:u.default.Scope.INLINE});e.ColorAttributor=c,e.ColorClass=f,e.ColorStyle=h},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function s(t,e){var n,r=t===D.keys.LEFT?"prefix":"suffix";return n={key:t,shiftKey:e,altKey:null},o(n,r,/^$/),o(n,"handler",function(n){var r=n.index;t===D.keys.RIGHT&&(r+=n.length+1);var o=this.quill.getLeaf(r);return!(b(o,1)[0]instanceof T.default.Embed)||(t===D.keys.LEFT?e?this.quill.setSelection(n.index-1,n.length+1,S.default.sources.USER):this.quill.setSelection(n.index-1,S.default.sources.USER):e?this.quill.setSelection(n.index,n.length+1,S.default.sources.USER):this.quill.setSelection(n.index+n.length+1,S.default.sources.USER),!1)}),n}function u(t,e){if(!(0===t.index||this.quill.getLength()<=1)){var n=this.quill.getLine(t.index),r=b(n,1),o=r[0],i={};if(0===e.offset){var l=this.quill.getLine(t.index-1),a=b(l,1),s=a[0];if(null!=s&&s.length()>1){var u=o.formats(),c=this.quill.getFormat(t.index-1,1);i=A.default.attributes.diff(u,c)||{}}}var f=/[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(e.prefix)?2:1;this.quill.deleteText(t.index-f,f,S.default.sources.USER),Object.keys(i).length>0&&this.quill.formatLine(t.index-f,f,i,S.default.sources.USER),this.quill.focus()}}function c(t,e){var n=/^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(e.suffix)?2:1;if(!(t.index>=this.quill.getLength()-n)){var r={},o=0,i=this.quill.getLine(t.index),l=b(i,1),a=l[0];if(e.offset>=a.length()-1){var s=this.quill.getLine(t.index+1),u=b(s,1),c=u[0];if(c){var f=a.formats(),h=this.quill.getFormat(t.index,1);r=A.default.attributes.diff(f,h)||{},o=c.length()}}this.quill.deleteText(t.index,n,S.default.sources.USER),Object.keys(r).length>0&&this.quill.formatLine(t.index+o-1,n,r,S.default.sources.USER)}}function f(t){var e=this.quill.getLines(t),n={};if(e.length>1){var r=e[0].formats(),o=e[e.length-1].formats();n=A.default.attributes.diff(o,r)||{}}this.quill.deleteText(t,S.default.sources.USER),Object.keys(n).length>0&&this.quill.formatLine(t.index,1,n,S.default.sources.USER),this.quill.setSelection(t.index,S.default.sources.SILENT),this.quill.focus()}function h(t,e){var n=this;t.length>0&&this.quill.scroll.deleteAt(t.index,t.length);var r=Object.keys(e.format).reduce(function(t,n){return T.default.query(n,T.default.Scope.BLOCK)&&!Array.isArray(e.format[n])&&(t[n]=e.format[n]),t},{});this.quill.insertText(t.index,"\n",r,S.default.sources.USER),this.quill.setSelection(t.index+1,S.default.sources.SILENT),this.quill.focus(),Object.keys(e.format).forEach(function(t){null==r[t]&&(Array.isArray(e.format[t])||"link"!==t&&n.quill.format(t,e.format[t],S.default.sources.USER))})}function p(t){return{key:D.keys.TAB,shiftKey:!t,format:{"code-block":!0},handler:function(e){var n=T.default.query("code-block"),r=e.index,o=e.length,i=this.quill.scroll.descendant(n,r),l=b(i,2),a=l[0],s=l[1];if(null!=a){var u=this.quill.getIndex(a),c=a.newlineIndex(s,!0)+1,f=a.newlineIndex(u+s+o),h=a.domNode.textContent.slice(c,f).split("\n");s=0,h.forEach(function(e,i){t?(a.insertAt(c+s,n.TAB),s+=n.TAB.length,0===i?r+=n.TAB.length:o+=n.TAB.length):e.startsWith(n.TAB)&&(a.deleteAt(c+s,n.TAB.length),s-=n.TAB.length,0===i?r-=n.TAB.length:o-=n.TAB.length),s+=e.length+1}),this.quill.update(S.default.sources.USER),this.quill.setSelection(r,o,S.default.sources.SILENT)}}}}function d(t){return{key:t[0].toUpperCase(),shortKey:!0,handler:function(e,n){this.quill.format(t,!n.format[t],S.default.sources.USER)}}}function y(t){if("string"==typeof t||"number"==typeof t)return y({key:t});if("object"===(void 0===t?"undefined":v(t))&&(t=(0,_.default)(t,!1)),"string"==typeof t.key)if(null!=D.keys[t.key.toUpperCase()])t.key=D.keys[t.key.toUpperCase()];else{if(1!==t.key.length)return null;t.key=t.key.toUpperCase().charCodeAt(0)}return t.shortKey&&(t[B]=t.shortKey,delete t.shortKey),t}Object.defineProperty(e,"__esModule",{value:!0}),e.SHORTKEY=e.default=void 0;var v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},b=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),g=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),m=n(21),_=r(m),O=n(12),w=r(O),x=n(2),k=r(x),E=n(4),N=r(E),j=n(20),A=r(j),q=n(0),T=r(q),P=n(6),S=r(P),C=n(10),L=r(C),M=n(7),R=r(M),I=(0,L.default)("quill:keyboard"),B=/Mac/i.test(navigator.platform)?"metaKey":"ctrlKey",D=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.bindings={},Object.keys(r.options.bindings).forEach(function(e){("list autofill"!==e||null==t.scroll.whitelist||t.scroll.whitelist.list)&&r.options.bindings[e]&&r.addBinding(r.options.bindings[e])}),r.addBinding({key:e.keys.ENTER,shiftKey:null},h),r.addBinding({key:e.keys.ENTER,metaKey:null,ctrlKey:null,altKey:null},function(){}),/Firefox/i.test(navigator.userAgent)?(r.addBinding({key:e.keys.BACKSPACE},{collapsed:!0},u),r.addBinding({key:e.keys.DELETE},{collapsed:!0},c)):(r.addBinding({key:e.keys.BACKSPACE},{collapsed:!0,prefix:/^.?$/},u),r.addBinding({key:e.keys.DELETE},{collapsed:!0,suffix:/^.?$/},c)),r.addBinding({key:e.keys.BACKSPACE},{collapsed:!1},f),r.addBinding({key:e.keys.DELETE},{collapsed:!1},f),r.addBinding({key:e.keys.BACKSPACE,altKey:null,ctrlKey:null,metaKey:null,shiftKey:null},{collapsed:!0,offset:0},u),r.listen(),r}return a(e,t),g(e,null,[{key:"match",value:function(t,e){return e=y(e),!["altKey","ctrlKey","metaKey","shiftKey"].some(function(n){return!!e[n]!==t[n]&&null!==e[n]})&&e.key===(t.which||t.keyCode)}}]),g(e,[{key:"addBinding",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=y(t);if(null==r||null==r.key)return I.warn("Attempted to add invalid keyboard binding",r);"function"==typeof e&&(e={handler:e}),"function"==typeof n&&(n={handler:n}),r=(0,k.default)(r,e,n),this.bindings[r.key]=this.bindings[r.key]||[],this.bindings[r.key].push(r)}},{key:"listen",value:function(){var t=this;this.quill.root.addEventListener("keydown",function(n){if(!n.defaultPrevented){var r=n.which||n.keyCode,o=(t.bindings[r]||[]).filter(function(t){return e.match(n,t)});if(0!==o.length){var i=t.quill.getSelection();if(null!=i&&t.quill.hasFocus()){var l=t.quill.getLine(i.index),a=b(l,2),s=a[0],u=a[1],c=t.quill.getLeaf(i.index),f=b(c,2),h=f[0],p=f[1],d=0===i.length?[h,p]:t.quill.getLeaf(i.index+i.length),y=b(d,2),g=y[0],m=y[1],_=h instanceof T.default.Text?h.value().slice(0,p):"",O=g instanceof T.default.Text?g.value().slice(m):"",x={collapsed:0===i.length,empty:0===i.length&&s.length()<=1,format:t.quill.getFormat(i),offset:u,prefix:_,suffix:O};o.some(function(e){if(null!=e.collapsed&&e.collapsed!==x.collapsed)return!1;if(null!=e.empty&&e.empty!==x.empty)return!1;if(null!=e.offset&&e.offset!==x.offset)return!1;if(Array.isArray(e.format)){if(e.format.every(function(t){return null==x.format[t]}))return!1}else if("object"===v(e.format)&&!Object.keys(e.format).every(function(t){return!0===e.format[t]?null!=x.format[t]:!1===e.format[t]?null==x.format[t]:(0,w.default)(e.format[t],x.format[t])}))return!1;return!(null!=e.prefix&&!e.prefix.test(x.prefix))&&(!(null!=e.suffix&&!e.suffix.test(x.suffix))&&!0!==e.handler.call(t,i,x))})&&n.preventDefault()}}}})}}]),e}(R.default);D.keys={BACKSPACE:8,TAB:9,ENTER:13,ESCAPE:27,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46},D.DEFAULTS={bindings:{bold:d("bold"),italic:d("italic"),underline:d("underline"),indent:{key:D.keys.TAB,format:["blockquote","indent","list"],handler:function(t,e){if(e.collapsed&&0!==e.offset)return!0;this.quill.format("indent","+1",S.default.sources.USER)}},outdent:{key:D.keys.TAB,shiftKey:!0,format:["blockquote","indent","list"],handler:function(t,e){if(e.collapsed&&0!==e.offset)return!0;this.quill.format("indent","-1",S.default.sources.USER)}},"outdent backspace":{key:D.keys.BACKSPACE,collapsed:!0,shiftKey:null,metaKey:null,ctrlKey:null,altKey:null,format:["indent","list"],offset:0,handler:function(t,e){null!=e.format.indent?this.quill.format("indent","-1",S.default.sources.USER):null!=e.format.list&&this.quill.format("list",!1,S.default.sources.USER)}},"indent code-block":p(!0),"outdent code-block":p(!1),"remove tab":{key:D.keys.TAB,shiftKey:!0,collapsed:!0,prefix:/\t$/,handler:function(t){this.quill.deleteText(t.index-1,1,S.default.sources.USER)}},tab:{key:D.keys.TAB,handler:function(t){this.quill.history.cutoff();var e=(new N.default).retain(t.index).delete(t.length).insert("\t");this.quill.updateContents(e,S.default.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index+1,S.default.sources.SILENT)}},"list empty enter":{key:D.keys.ENTER,collapsed:!0,format:["list"],empty:!0,handler:function(t,e){this.quill.format("list",!1,S.default.sources.USER),e.format.indent&&this.quill.format("indent",!1,S.default.sources.USER)}},"checklist enter":{key:D.keys.ENTER,collapsed:!0,format:{list:"checked"},handler:function(t){var e=this.quill.getLine(t.index),n=b(e,2),r=n[0],o=n[1],i=(0,k.default)({},r.formats(),{list:"checked"}),l=(new N.default).retain(t.index).insert("\n",i).retain(r.length()-o-1).retain(1,{list:"unchecked"});this.quill.updateContents(l,S.default.sources.USER),this.quill.setSelection(t.index+1,S.default.sources.SILENT),this.quill.scrollIntoView()}},"header enter":{key:D.keys.ENTER,collapsed:!0,format:["header"],suffix:/^$/,handler:function(t,e){var n=this.quill.getLine(t.index),r=b(n,2),o=r[0],i=r[1],l=(new N.default).retain(t.index).insert("\n",e.format).retain(o.length()-i-1).retain(1,{header:null});this.quill.updateContents(l,S.default.sources.USER),this.quill.setSelection(t.index+1,S.default.sources.SILENT),this.quill.scrollIntoView()}},"list autofill":{key:" ",collapsed:!0,format:{list:!1},prefix:/^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,handler:function(t,e){var n=e.prefix.length,r=this.quill.getLine(t.index),o=b(r,2),i=o[0],l=o[1];if(l>n)return!0;var a=void 0;switch(e.prefix.trim()){case"[]":case"[ ]":a="unchecked";break;case"[x]":a="checked";break;case"-":case"*":a="bullet";break;default:a="ordered"}this.quill.insertText(t.index," ",S.default.sources.USER),this.quill.history.cutoff();var s=(new N.default).retain(t.index-l).delete(n+1).retain(i.length()-2-l).retain(1,{list:a});this.quill.updateContents(s,S.default.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index-n,S.default.sources.SILENT)}},"code exit":{key:D.keys.ENTER,collapsed:!0,format:["code-block"],prefix:/\n\n$/,suffix:/^\s+$/,handler:function(t){var e=this.quill.getLine(t.index),n=b(e,2),r=n[0],o=n[1],i=(new N.default).retain(t.index+r.length()-o-2).retain(1,{"code-block":null}).delete(1);this.quill.updateContents(i,S.default.sources.USER)}},"embed left":s(D.keys.LEFT,!1),"embed left shift":s(D.keys.LEFT,!0),"embed right":s(D.keys.RIGHT,!1),"embed right shift":s(D.keys.RIGHT,!0)}},e.default=D,e.SHORTKEY=B},function(t,e,n){"use strict";t.exports={align:{"":n(75),center:n(76),right:n(77),justify:n(78)},background:n(79),blockquote:n(80),bold:n(81),clean:n(82),code:n(40),"code-block":n(40),color:n(83),direction:{"":n(84),rtl:n(85)},float:{center:n(86),full:n(87),left:n(88),right:n(89)},formula:n(90),header:{1:n(91),2:n(92)},italic:n(93),image:n(94),indent:{"+1":n(95),"-1":n(96)},link:n(97),list:{ordered:n(98),bullet:n(99),check:n(100)},script:{sub:n(101),super:n(102)},strike:n(103),underline:n(104),video:n(105)}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=function(){function t(t){this.domNode=t,this.domNode[r.DATA_KEY]={blot:this}}return Object.defineProperty(t.prototype,"statics",{get:function(){return this.constructor},enumerable:!0,configurable:!0}),t.create=function(t){if(null==this.tagName)throw new r.ParchmentError("Blot definition missing tagName");var e;return Array.isArray(this.tagName)?("string"==typeof t&&(t=t.toUpperCase(),parseInt(t).toString()===t&&(t=parseInt(t))),e="number"==typeof t?document.createElement(this.tagName[t-1]):this.tagName.indexOf(t)>-1?document.createElement(t):document.createElement(this.tagName[0])):e=document.createElement(this.tagName),this.className&&e.classList.add(this.className),e},t.prototype.attach=function(){null!=this.parent&&(this.scroll=this.parent.scroll)},t.prototype.clone=function(){var t=this.domNode.cloneNode(!1);return r.create(t)},t.prototype.detach=function(){null!=this.parent&&this.parent.removeChild(this),delete this.domNode[r.DATA_KEY]},t.prototype.deleteAt=function(t,e){this.isolate(t,e).remove()},t.prototype.formatAt=function(t,e,n,o){var i=this.isolate(t,e);if(null!=r.query(n,r.Scope.BLOT)&&o)i.wrap(n,o);else if(null!=r.query(n,r.Scope.ATTRIBUTE)){var l=r.create(this.statics.scope);i.wrap(l),l.format(n,o)}},t.prototype.insertAt=function(t,e,n){var o=null==n?r.create("text",e):r.create(e,n),i=this.split(t);this.parent.insertBefore(o,i)},t.prototype.insertInto=function(t,e){void 0===e&&(e=null),null!=this.parent&&this.parent.children.remove(this);var n=null;t.children.insertBefore(this,e),null!=e&&(n=e.domNode),this.domNode.parentNode==t.domNode&&this.domNode.nextSibling==n||t.domNode.insertBefore(this.domNode,n),this.parent=t,this.attach()},t.prototype.isolate=function(t,e){var n=this.split(t);return n.split(e),n},t.prototype.length=function(){return 1},t.prototype.offset=function(t){return void 0===t&&(t=this.parent),null==this.parent||this==t?0:this.parent.children.offset(this)+this.parent.offset(t)},t.prototype.optimize=function(t){null!=this.domNode[r.DATA_KEY]&&delete this.domNode[r.DATA_KEY].mutations},t.prototype.remove=function(){null!=this.domNode.parentNode&&this.domNode.parentNode.removeChild(this.domNode),this.detach()},t.prototype.replace=function(t){null!=t.parent&&(t.parent.insertBefore(this,t.next),t.remove())},t.prototype.replaceWith=function(t,e){var n="string"==typeof t?r.create(t,e):t;return n.replace(this),n},t.prototype.split=function(t,e){return 0===t?this:this.next},t.prototype.update=function(t,e){},t.prototype.wrap=function(t,e){var n="string"==typeof t?r.create(t,e):t;return null!=this.parent&&this.parent.insertBefore(n,this.next),n.appendChild(this),n},t.blotName="abstract",t}();e.default=o},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(11),o=n(29),i=n(30),l=n(1),a=function(){function t(t){this.attributes={},this.domNode=t,this.build()}return t.prototype.attribute=function(t,e){e?t.add(this.domNode,e)&&(null!=t.value(this.domNode)?this.attributes[t.attrName]=t:delete this.attributes[t.attrName]):(t.remove(this.domNode),delete this.attributes[t.attrName])},t.prototype.build=function(){var t=this;this.attributes={};var e=r.default.keys(this.domNode),n=o.default.keys(this.domNode),a=i.default.keys(this.domNode);e.concat(n).concat(a).forEach(function(e){var n=l.query(e,l.Scope.ATTRIBUTE);n instanceof r.default&&(t.attributes[n.attrName]=n)})},t.prototype.copy=function(t){var e=this;Object.keys(this.attributes).forEach(function(n){var r=e.attributes[n].value(e.domNode);t.format(n,r)})},t.prototype.move=function(t){var e=this;this.copy(t),Object.keys(this.attributes).forEach(function(t){e.attributes[t].remove(e.domNode)}),this.attributes={}},t.prototype.values=function(){var t=this;return Object.keys(this.attributes).reduce(function(e,n){return e[n]=t.attributes[n].value(t.domNode),e},{})},t}();e.default=a},function(t,e,n){"use strict";function r(t,e){return(t.getAttribute("class")||"").split(/\s+/).filter(function(t){return 0===t.indexOf(e+"-")})}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(11),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.keys=function(t){return(t.getAttribute("class")||"").split(/\s+/).map(function(t){return t.split("-").slice(0,-1).join("-")})},e.prototype.add=function(t,e){return!!this.canAdd(t,e)&&(this.remove(t),t.classList.add(this.keyName+"-"+e),!0)},e.prototype.remove=function(t){r(t,this.keyName).forEach(function(e){t.classList.remove(e)}),0===t.classList.length&&t.removeAttribute("class")},e.prototype.value=function(t){var e=r(t,this.keyName)[0]||"",n=e.slice(this.keyName.length+1);return this.canAdd(t,n)?n:""},e}(i.default);e.default=l},function(t,e,n){"use strict";function r(t){var e=t.split("-"),n=e.slice(1).map(function(t){return t[0].toUpperCase()+t.slice(1)}).join("");return e[0]+n}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(11),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.keys=function(t){return(t.getAttribute("style")||"").split(";").map(function(t){return t.split(":")[0].trim()})},e.prototype.add=function(t,e){return!!this.canAdd(t,e)&&(t.style[r(this.keyName)]=e,!0)},e.prototype.remove=function(t){t.style[r(this.keyName)]="",t.getAttribute("style")||t.removeAttribute("style")},e.prototype.value=function(t){var e=t.style[r(this.keyName)];return this.canAdd(t,e)?e:""},e}(i.default);e.default=l},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(0),f=r(c),h=n(8),p=r(h),d=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return r.selection=n,r.textNode=document.createTextNode(e.CONTENTS),r.domNode.appendChild(r.textNode),r._length=0,r}return l(e,t),u(e,null,[{key:"value",value:function(){}}]),u(e,[{key:"detach",value:function(){null!=this.parent&&this.parent.removeChild(this)}},{key:"format",value:function(t,n){if(0!==this._length)return s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);for(var r=this,o=0;null!=r&&r.statics.scope!==f.default.Scope.BLOCK_BLOT;)o+=r.offset(r.parent),r=r.parent;null!=r&&(this._length=e.CONTENTS.length,r.optimize(),r.formatAt(o,e.CONTENTS.length,t,n),this._length=0)}},{key:"index",value:function(t,n){return t===this.textNode?0:s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"index",this).call(this,t,n)}},{key:"length",value:function(){return this._length}},{key:"position",value:function(){return[this.textNode,this.textNode.data.length]}},{key:"remove",value:function(){s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"remove",this).call(this),this.parent=null}},{key:"restore",value:function(){if(!this.selection.composing&&null!=this.parent){var t=this.textNode,n=this.selection.getNativeRange(),r=void 0,o=void 0,i=void 0;if(null!=n&&n.start.node===t&&n.end.node===t){var l=[t,n.start.offset,n.end.offset];r=l[0],o=l[1],i=l[2]}for(;null!=this.domNode.lastChild&&this.domNode.lastChild!==this.textNode;)this.domNode.parentNode.insertBefore(this.domNode.lastChild,this.domNode);if(this.textNode.data!==e.CONTENTS){var s=this.textNode.data.split(e.CONTENTS).join("");this.next instanceof p.default?(r=this.next.domNode,this.next.insertAt(0,s),this.textNode.data=e.CONTENTS):(this.textNode.data=s,this.parent.insertBefore(f.default.create(this.textNode),this),this.textNode=document.createTextNode(e.CONTENTS),this.domNode.appendChild(this.textNode))}if(this.remove(),null!=o){var u=[o,i].map(function(t){return Math.max(0,Math.min(r.data.length,t-1))}),c=a(u,2);return o=c[0],i=c[1],{startNode:r,startOffset:o,endNode:r,endOffset:i}}}}},{key:"update",value:function(t,e){var n=this;if(t.some(function(t){return"characterData"===t.type&&t.target===n.textNode})){var r=this.restore();r&&(e.range=r)}}},{key:"value",value:function(){return""}}]),e}(f.default.Embed);d.blotName="cursor",d.className="ql-cursor",d.tagName="span",d.CONTENTS="\ufeff",e.default=d},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,n){r(this,t),this.quill=e,this.options=n,this.modules={}}return o(t,[{key:"init",value:function(){var t=this;Object.keys(this.options.modules).forEach(function(e){null==t.modules[e]&&t.addModule(e)})}},{key:"addModule",value:function(t){var e=this.quill.constructor.import("modules/"+t);return this.modules[t]=new e(this.quill,this.options.modules[t]||{}),this.modules[t]}}]),t}();i.DEFAULTS={modules:{}},i.themes={default:i},e.default=i},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(0),c=r(u),f=n(8),h=r(f),p="\ufeff",d=function(t){function e(t){o(this,e);var n=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return n.contentNode=document.createElement("span"),n.contentNode.setAttribute("contenteditable",!1),[].slice.call(n.domNode.childNodes).forEach(function(t){n.contentNode.appendChild(t)}),n.leftGuard=document.createTextNode(p),n.rightGuard=document.createTextNode(p),n.domNode.appendChild(n.leftGuard),n.domNode.appendChild(n.contentNode),n.domNode.appendChild(n.rightGuard),n}return l(e,t),a(e,[{key:"index",value:function(t,n){return t===this.leftGuard?0:t===this.rightGuard?1:s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"index",this).call(this,t,n)}},{key:"restore",value:function(t){var e=void 0,n=void 0,r=t.data.split(p).join("");if(t===this.leftGuard)if(this.prev instanceof h.default){var o=this.prev.length();this.prev.insertAt(o,r),e={startNode:this.prev.domNode,startOffset:o+r.length}}else n=document.createTextNode(r),this.parent.insertBefore(c.default.create(n),this),e={startNode:n,startOffset:r.length};else t===this.rightGuard&&(this.next instanceof h.default?(this.next.insertAt(0,r),e={startNode:this.next.domNode,startOffset:r.length}):(n=document.createTextNode(r),this.parent.insertBefore(c.default.create(n),this.next),e={startNode:n,startOffset:r.length}));return t.data=p,e}},{key:"update",value:function(t,e){var n=this;t.forEach(function(t){if("characterData"===t.type&&(t.target===n.leftGuard||t.target===n.rightGuard)){var r=n.restore(t.target);r&&(e.range=r)}})}}]),e}(c.default.Embed);e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.AlignStyle=e.AlignClass=e.AlignAttribute=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i={scope:o.default.Scope.BLOCK,whitelist:["right","center","justify"]},l=new o.default.Attributor.Attribute("align","align",i),a=new o.default.Attributor.Class("align","ql-align",i),s=new o.default.Attributor.Style("align","text-align",i);e.AlignAttribute=l,e.AlignClass=a,e.AlignStyle=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.BackgroundStyle=e.BackgroundClass=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i=n(24),l=new o.default.Attributor.Class("background","ql-bg",{scope:o.default.Scope.INLINE}),a=new i.ColorAttributor("background","background-color",{scope:o.default.Scope.INLINE});e.BackgroundClass=l,e.BackgroundStyle=a},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.DirectionStyle=e.DirectionClass=e.DirectionAttribute=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i={scope:o.default.Scope.BLOCK,whitelist:["rtl"]},l=new o.default.Attributor.Attribute("direction","dir",i),a=new o.default.Attributor.Class("direction","ql-direction",i),s=new o.default.Attributor.Style("direction","direction",i);e.DirectionAttribute=l,e.DirectionClass=a,e.DirectionStyle=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.FontClass=e.FontStyle=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c={scope:u.default.Scope.INLINE,whitelist:["serif","monospace"]},f=new u.default.Attributor.Class("font","ql-font",c),h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"value",value:function(t){return a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t).replace(/["']/g,"")}}]),e}(u.default.Attributor.Style),p=new h("font","font-family",c);e.FontStyle=p,e.FontClass=f},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.SizeStyle=e.SizeClass=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i=new o.default.Attributor.Class("size","ql-size",{scope:o.default.Scope.INLINE,whitelist:["small","large","huge"]}),l=new o.default.Attributor.Style("size","font-size",{scope:o.default.Scope.INLINE,whitelist:["10px","18px","32px"]});e.SizeClass=i,e.SizeStyle=l},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(5),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"optimize",value:function(t){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.domNode.tagName!==this.statics.tagName[0]&&this.replaceWith(this.statics.blotName)}}],[{key:"create",value:function(){return a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this)}},{key:"formats",value:function(){return!0}}]),e}(u.default);c.blotName="bold",c.tagName=["STRONG","B"],e.default=c},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polyline class="ql-even ql-stroke" points="5 7 3 9 5 11"></polyline> <polyline class="ql-even ql-stroke" points="13 7 15 9 13 11"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>'},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(16),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(t,n){r(this,e);var i=o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return i.label.innerHTML=n,i.container.classList.add("ql-color-picker"),[].slice.call(i.container.querySelectorAll(".ql-picker-item"),0,7).forEach(function(t){t.classList.add("ql-primary")}),i}return i(e,t),l(e,[{key:"buildItem",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"buildItem",this).call(this,t);return n.style.backgroundColor=t.getAttribute("value")||"",n}},{key:"selectItem",value:function(t,n){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"selectItem",this).call(this,t,n);var r=this.label.querySelector(".ql-color-label"),o=t?t.getAttribute("data-value")||"":"";r&&("line"===r.tagName?r.style.stroke=o:r.style.fill=o)}}]),e}(u.default);e.default=c},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(16),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(t,n){r(this,e);var i=o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return i.container.classList.add("ql-icon-picker"),[].forEach.call(i.container.querySelectorAll(".ql-picker-item"),function(t){t.innerHTML=n[t.getAttribute("data-value")||""]}),i.defaultItem=i.container.querySelector(".ql-selected"),i.selectItem(i.defaultItem),i}return i(e,t),l(e,[{key:"selectItem",value:function(t,n){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"selectItem",this).call(this,t,n),t=t||this.defaultItem,this.label.innerHTML=t.innerHTML}}]),e}(u.default);e.default=c},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,n){var o=this;r(this,t),this.quill=e,this.boundsContainer=n||document.body,this.root=e.addContainer("ql-tooltip"),this.root.innerHTML=this.constructor.TEMPLATE,this.quill.root===this.quill.scrollingContainer&&this.quill.root.addEventListener("scroll",function(){o.root.style.marginTop=-1*o.quill.root.scrollTop+"px"}),this.hide()}return o(t,[{key:"hide",value:function(){this.root.classList.add("ql-hidden")}},{key:"position",value:function(t){var e=t.left+t.width/2-this.root.offsetWidth/2,n=t.bottom+this.quill.root.scrollTop;this.root.style.left=e+"px",this.root.style.top=n+"px",this.root.classList.remove("ql-flip");var r=this.boundsContainer.getBoundingClientRect(),o=this.root.getBoundingClientRect(),i=0;if(o.right>r.right&&(i=r.right-o.right,this.root.style.left=e+i+"px"),o.left<r.left&&(i=r.left-o.left,this.root.style.left=e+i+"px"),o.bottom>r.bottom){var l=o.bottom-o.top,a=t.bottom-t.top+l;this.root.style.top=n-a+"px",this.root.classList.add("ql-flip")}return i}},{key:"show",value:function(){this.root.classList.remove("ql-editing"),this.root.classList.remove("ql-hidden")}}]),t}();e.default=i},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t){var e=t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/)||t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);return e?(e[1]||"https")+"://www.youtube.com/embed/"+e[2]+"?showinfo=0":(e=t.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))?(e[1]||"https")+"://player.vimeo.com/video/"+e[2]+"/":t}function s(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];e.forEach(function(e){var r=document.createElement("option");e===n?r.setAttribute("selected","selected"):r.setAttribute("value",e),t.appendChild(r)})}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BaseTooltip=void 0;var u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},f=n(2),h=r(f),p=n(4),d=r(p),y=n(9),v=r(y),b=n(25),g=r(b),m=n(32),_=r(m),O=n(41),w=r(O),x=n(42),k=r(x),E=n(16),N=r(E),j=n(43),A=r(j),q=[!1,"center","right","justify"],T=["#000000","#e60000","#ff9900","#ffff00","#008a00","#0066cc","#9933ff","#ffffff","#facccc","#ffebcc","#ffffcc","#cce8cc","#cce0f5","#ebd6ff","#bbbbbb","#f06666","#ffc266","#ffff66","#66b966","#66a3e0","#c285ff","#888888","#a10000","#b26b00","#b2b200","#006100","#0047b2","#6b24b2","#444444","#5c0000","#663d00","#666600","#003700","#002966","#3d1466"],P=[!1,"serif","monospace"],S=["1","2","3",!1],C=["small",!1,"large","huge"],L=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n)),l=function e(n){if(!document.body.contains(t.root))return document.body.removeEventListener("click",e);null==r.tooltip||r.tooltip.root.contains(n.target)||document.activeElement===r.tooltip.textbox||r.quill.hasFocus()||r.tooltip.hide(),null!=r.pickers&&r.pickers.forEach(function(t){t.container.contains(n.target)||t.close()})};return t.emitter.listenDOM("click",document.body,l),r}return l(e,t),u(e,[{key:"addModule",value:function(t){var n=c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"addModule",this).call(this,t);return"toolbar"===t&&this.extendToolbar(n),n}},{key:"buildButtons",value:function(t,e){t.forEach(function(t){(t.getAttribute("class")||"").split(/\s+/).forEach(function(n){if(n.startsWith("ql-")&&(n=n.slice("ql-".length),null!=e[n]))if("direction"===n)t.innerHTML=e[n][""]+e[n].rtl;else if("string"==typeof e[n])t.innerHTML=e[n];else{var r=t.value||"";null!=r&&e[n][r]&&(t.innerHTML=e[n][r])}})})}},{key:"buildPickers",value:function(t,e){var n=this;this.pickers=t.map(function(t){if(t.classList.contains("ql-align"))return null==t.querySelector("option")&&s(t,q),new k.default(t,e.align);if(t.classList.contains("ql-background")||t.classList.contains("ql-color")){var n=t.classList.contains("ql-background")?"background":"color";return null==t.querySelector("option")&&s(t,T,"background"===n?"#ffffff":"#000000"),new w.default(t,e[n])}return null==t.querySelector("option")&&(t.classList.contains("ql-font")?s(t,P):t.classList.contains("ql-header")?s(t,S):t.classList.contains("ql-size")&&s(t,C)),new N.default(t)});var r=function(){n.pickers.forEach(function(t){t.update()})};this.quill.on(v.default.events.EDITOR_CHANGE,r)}}]),e}(_.default);L.DEFAULTS=(0,h.default)(!0,{},_.default.DEFAULTS,{modules:{toolbar:{handlers:{formula:function(){this.quill.theme.tooltip.edit("formula")},image:function(){var t=this,e=this.container.querySelector("input.ql-image[type=file]");null==e&&(e=document.createElement("input"),e.setAttribute("type","file"),e.setAttribute("accept","image/png, image/gif, image/jpeg, image/bmp, image/x-icon"),e.classList.add("ql-image"),e.addEventListener("change",function(){if(null!=e.files&&null!=e.files[0]){var n=new FileReader;n.onload=function(n){var r=t.quill.getSelection(!0);t.quill.updateContents((new d.default).retain(r.index).delete(r.length).insert({image:n.target.result}),v.default.sources.USER),t.quill.setSelection(r.index+1,v.default.sources.SILENT),e.value=""},n.readAsDataURL(e.files[0])}}),this.container.appendChild(e)),e.click()},video:function(){this.quill.theme.tooltip.edit("video")}}}}});var M=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.textbox=r.root.querySelector('input[type="text"]'),r.listen(),r}return l(e,t),u(e,[{key:"listen",value:function(){var t=this;this.textbox.addEventListener("keydown",function(e){g.default.match(e,"enter")?(t.save(),e.preventDefault()):g.default.match(e,"escape")&&(t.cancel(),e.preventDefault())})}},{key:"cancel",value:function(){this.hide()}},{key:"edit",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"link",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.root.classList.remove("ql-hidden"),this.root.classList.add("ql-editing"),null!=e?this.textbox.value=e:t!==this.root.getAttribute("data-mode")&&(this.textbox.value=""),this.position(this.quill.getBounds(this.quill.selection.savedRange)),this.textbox.select(),this.textbox.setAttribute("placeholder",this.textbox.getAttribute("data-"+t)||""),this.root.setAttribute("data-mode",t)}},{key:"restoreFocus",value:function(){var t=this.quill.scrollingContainer.scrollTop;this.quill.focus(),this.quill.scrollingContainer.scrollTop=t}},{key:"save",value:function(){var t=this.textbox.value;switch(this.root.getAttribute("data-mode")){case"link":var e=this.quill.root.scrollTop;this.linkRange?(this.quill.formatText(this.linkRange,"link",t,v.default.sources.USER),delete this.linkRange):(this.restoreFocus(),this.quill.format("link",t,v.default.sources.USER)),this.quill.root.scrollTop=e;break;case"video":t=a(t);case"formula":if(!t)break;var n=this.quill.getSelection(!0);if(null!=n){var r=n.index+n.length;this.quill.insertEmbed(r,this.root.getAttribute("data-mode"),t,v.default.sources.USER),"formula"===this.root.getAttribute("data-mode")&&this.quill.insertText(r+1," ",v.default.sources.USER),this.quill.setSelection(r+2,v.default.sources.USER)}}this.textbox.value="",this.hide()}}]),e}(A.default);e.BaseTooltip=M,e.default=L},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(46),i=r(o),l=n(34),a=n(36),s=n(62),u=n(63),c=r(u),f=n(64),h=r(f),p=n(65),d=r(p),y=n(35),v=n(24),b=n(37),g=n(38),m=n(39),_=r(m),O=n(66),w=r(O),x=n(15),k=r(x),E=n(67),N=r(E),j=n(68),A=r(j),q=n(69),T=r(q),P=n(70),S=r(P),C=n(71),L=r(C),M=n(13),R=r(M),I=n(72),B=r(I),D=n(73),U=r(D),F=n(74),H=r(F),K=n(26),z=r(K),V=n(16),Z=r(V),W=n(41),G=r(W),Y=n(42),X=r(Y),$=n(43),Q=r($),J=n(107),tt=r(J),et=n(108),nt=r(et);i.default.register({"attributors/attribute/direction":a.DirectionAttribute,"attributors/class/align":l.AlignClass,"attributors/class/background":y.BackgroundClass,"attributors/class/color":v.ColorClass,"attributors/class/direction":a.DirectionClass,"attributors/class/font":b.FontClass,"attributors/class/size":g.SizeClass,"attributors/style/align":l.AlignStyle,"attributors/style/background":y.BackgroundStyle,"attributors/style/color":v.ColorStyle,"attributors/style/direction":a.DirectionStyle,"attributors/style/font":b.FontStyle,"attributors/style/size":g.SizeStyle},!0),i.default.register({"formats/align":l.AlignClass,"formats/direction":a.DirectionClass,"formats/indent":s.IndentClass,"formats/background":y.BackgroundStyle,"formats/color":v.ColorStyle,"formats/font":b.FontClass,"formats/size":g.SizeClass,"formats/blockquote":c.default,"formats/code-block":R.default,"formats/header":h.default,"formats/list":d.default,"formats/bold":_.default,"formats/code":M.Code,"formats/italic":w.default,"formats/link":k.default,"formats/script":N.default,"formats/strike":A.default,"formats/underline":T.default,"formats/image":S.default,"formats/video":L.default,"formats/list/item":p.ListItem,"modules/formula":B.default,"modules/syntax":U.default,"modules/toolbar":H.default,"themes/bubble":tt.default,"themes/snow":nt.default,"ui/icons":z.default,"ui/picker":Z.default,"ui/icon-picker":X.default,"ui/color-picker":G.default,"ui/tooltip":Q.default},!0),e.default=i.default},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),i=r(o),l=n(6),a=r(l),s=n(3),u=r(s),c=n(14),f=r(c),h=n(23),p=r(h),d=n(31),y=r(d),v=n(33),b=r(v),g=n(5),m=r(g),_=n(59),O=r(_),w=n(8),x=r(w),k=n(60),E=r(k),N=n(61),j=r(N),A=n(25),q=r(A);a.default.register({"blots/block":u.default,"blots/block/embed":s.BlockEmbed,"blots/break":f.default,"blots/container":p.default,"blots/cursor":y.default,"blots/embed":b.default,"blots/inline":m.default,"blots/scroll":O.default,"blots/text":x.default,"modules/clipboard":E.default,"modules/history":j.default,"modules/keyboard":q.default}),i.default.register(u.default,f.default,y.default,m.default,O.default,x.default),e.default=a.default},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(){this.head=this.tail=null,this.length=0}return t.prototype.append=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this.insertBefore(t[0],null),t.length>1&&this.append.apply(this,t.slice(1))},t.prototype.contains=function(t){for(var e,n=this.iterator();e=n();)if(e===t)return!0;return!1},t.prototype.insertBefore=function(t,e){t&&(t.next=e,null!=e?(t.prev=e.prev,null!=e.prev&&(e.prev.next=t),e.prev=t,e===this.head&&(this.head=t)):null!=this.tail?(this.tail.next=t,t.prev=this.tail,this.tail=t):(t.prev=null,this.head=this.tail=t),this.length+=1)},t.prototype.offset=function(t){for(var e=0,n=this.head;null!=n;){if(n===t)return e;e+=n.length(),n=n.next}return-1},t.prototype.remove=function(t){this.contains(t)&&(null!=t.prev&&(t.prev.next=t.next),null!=t.next&&(t.next.prev=t.prev),t===this.head&&(this.head=t.next),t===this.tail&&(this.tail=t.prev),this.length-=1)},t.prototype.iterator=function(t){return void 0===t&&(t=this.head),function(){var e=t;return null!=t&&(t=t.next),e}},t.prototype.find=function(t,e){void 0===e&&(e=!1);for(var n,r=this.iterator();n=r();){var o=n.length();if(t<o||e&&t===o&&(null==n.next||0!==n.next.length()))return[n,t];t-=o}return[null,0]},t.prototype.forEach=function(t){for(var e,n=this.iterator();e=n();)t(e)},t.prototype.forEachAt=function(t,e,n){if(!(e<=0))for(var r,o=this.find(t),i=o[0],l=o[1],a=t-l,s=this.iterator(i);(r=s())&&a<t+e;){var u=r.length();t>a?n(r,t-a,Math.min(e,a+u-t)):n(r,0,Math.min(u,t+e-a)),a+=u}},t.prototype.map=function(t){return this.reduce(function(e,n){return e.push(t(n)),e},[])},t.prototype.reduce=function(t,e){for(var n,r=this.iterator();n=r();)e=t(e,n);return e},t}();e.default=r},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(17),i=n(1),l={attributes:!0,characterData:!0,characterDataOldValue:!0,childList:!0,subtree:!0},a=function(t){function e(e){var n=t.call(this,e)||this;return n.scroll=n,n.observer=new MutationObserver(function(t){n.update(t)}),n.observer.observe(n.domNode,l),n.attach(),n}return r(e,t),e.prototype.detach=function(){t.prototype.detach.call(this),this.observer.disconnect()},e.prototype.deleteAt=function(e,n){this.update(),0===e&&n===this.length()?this.children.forEach(function(t){t.remove()}):t.prototype.deleteAt.call(this,e,n)},e.prototype.formatAt=function(e,n,r,o){this.update(),t.prototype.formatAt.call(this,e,n,r,o)},e.prototype.insertAt=function(e,n,r){this.update(),t.prototype.insertAt.call(this,e,n,r)},e.prototype.optimize=function(e,n){var r=this;void 0===e&&(e=[]),void 0===n&&(n={}),t.prototype.optimize.call(this,n);for(var l=[].slice.call(this.observer.takeRecords());l.length>0;)e.push(l.pop());for(var a=function(t,e){void 0===e&&(e=!0),null!=t&&t!==r&&null!=t.domNode.parentNode&&(null==t.domNode[i.DATA_KEY].mutations&&(t.domNode[i.DATA_KEY].mutations=[]),e&&a(t.parent))},s=function(t){null!=t.domNode[i.DATA_KEY]&&null!=t.domNode[i.DATA_KEY].mutations&&(t instanceof o.default&&t.children.forEach(s),t.optimize(n))},u=e,c=0;u.length>0;c+=1){if(c>=100)throw new Error("[Parchment] Maximum optimize iterations reached");for(u.forEach(function(t){var e=i.find(t.target,!0);null!=e&&(e.domNode===t.target&&("childList"===t.type?(a(i.find(t.previousSibling,!1)),[].forEach.call(t.addedNodes,function(t){var e=i.find(t,!1);a(e,!1),e instanceof o.default&&e.children.forEach(function(t){a(t,!1)})})):"attributes"===t.type&&a(e.prev)),a(e))}),this.children.forEach(s),u=[].slice.call(this.observer.takeRecords()),l=u.slice();l.length>0;)e.push(l.pop())}},e.prototype.update=function(e,n){var r=this;void 0===n&&(n={}),e=e||this.observer.takeRecords(),e.map(function(t){var e=i.find(t.target,!0);return null==e?null:null==e.domNode[i.DATA_KEY].mutations?(e.domNode[i.DATA_KEY].mutations=[t],e):(e.domNode[i.DATA_KEY].mutations.push(t),null)}).forEach(function(t){null!=t&&t!==r&&null!=t.domNode[i.DATA_KEY]&&t.update(t.domNode[i.DATA_KEY].mutations||[],n)}),null!=this.domNode[i.DATA_KEY].mutations&&t.prototype.update.call(this,this.domNode[i.DATA_KEY].mutations,n),this.optimize(e,n)},e.blotName="scroll",e.defaultChild="block",e.scope=i.Scope.BLOCK_BLOT,e.tagName="DIV",e}(o.default);e.default=a},function(t,e,n){"use strict";function r(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(var n in t)if(t[n]!==e[n])return!1;return!0}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(18),l=n(1),a=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.formats=function(n){if(n.tagName!==e.tagName)return t.formats.call(this,n)},e.prototype.format=function(n,r){var o=this;n!==this.statics.blotName||r?t.prototype.format.call(this,n,r):(this.children.forEach(function(t){t instanceof i.default||(t=t.wrap(e.blotName,!0)),o.attributes.copy(t)}),this.unwrap())},e.prototype.formatAt=function(e,n,r,o){if(null!=this.formats()[r]||l.query(r,l.Scope.ATTRIBUTE)){this.isolate(e,n).format(r,o)}else t.prototype.formatAt.call(this,e,n,r,o)},e.prototype.optimize=function(n){t.prototype.optimize.call(this,n);var o=this.formats();if(0===Object.keys(o).length)return this.unwrap();var i=this.next;i instanceof e&&i.prev===this&&r(o,i.formats())&&(i.moveChildren(this),i.remove())},e.blotName="inline",e.scope=l.Scope.INLINE_BLOT,e.tagName="SPAN",e}(i.default);e.default=a},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(18),i=n(1),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.formats=function(n){var r=i.query(e.blotName).tagName;if(n.tagName!==r)return t.formats.call(this,n)},e.prototype.format=function(n,r){null!=i.query(n,i.Scope.BLOCK)&&(n!==this.statics.blotName||r?t.prototype.format.call(this,n,r):this.replaceWith(e.blotName))},e.prototype.formatAt=function(e,n,r,o){null!=i.query(r,i.Scope.BLOCK)?this.format(r,o):t.prototype.formatAt.call(this,e,n,r,o)},e.prototype.insertAt=function(e,n,r){if(null==r||null!=i.query(n,i.Scope.INLINE))t.prototype.insertAt.call(this,e,n,r);else{var o=this.split(e),l=i.create(n,r);o.parent.insertBefore(l,o)}},e.prototype.update=function(e,n){navigator.userAgent.match(/Trident/)?this.build():t.prototype.update.call(this,e,n)},e.blotName="block",e.scope=i.Scope.BLOCK_BLOT,e.tagName="P",e}(o.default);e.default=l},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(19),i=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.formats=function(t){},e.prototype.format=function(e,n){t.prototype.formatAt.call(this,0,this.length(),e,n)},e.prototype.formatAt=function(e,n,r,o){0===e&&n===this.length()?this.format(r,o):t.prototype.formatAt.call(this,e,n,r,o)},e.prototype.formats=function(){return this.statics.formats(this.domNode)},e}(o.default);e.default=i},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(19),i=n(1),l=function(t){function e(e){var n=t.call(this,e)||this;return n.text=n.statics.value(n.domNode),n}return r(e,t),e.create=function(t){return document.createTextNode(t)},e.value=function(t){var e=t.data;return e.normalize&&(e=e.normalize()),e},e.prototype.deleteAt=function(t,e){this.domNode.data=this.text=this.text.slice(0,t)+this.text.slice(t+e)},e.prototype.index=function(t,e){return this.domNode===t?e:-1},e.prototype.insertAt=function(e,n,r){null==r?(this.text=this.text.slice(0,e)+n+this.text.slice(e),this.domNode.data=this.text):t.prototype.insertAt.call(this,e,n,r)},e.prototype.length=function(){return this.text.length},e.prototype.optimize=function(n){t.prototype.optimize.call(this,n),this.text=this.statics.value(this.domNode),0===this.text.length?this.remove():this.next instanceof e&&this.next.prev===this&&(this.insertAt(this.length(),this.next.value()),this.next.remove())},e.prototype.position=function(t,e){return void 0===e&&(e=!1),[this.domNode,t]},e.prototype.split=function(t,e){if(void 0===e&&(e=!1),!e){if(0===t)return this;if(t===this.length())return this.next}var n=i.create(this.domNode.splitText(t));return this.parent.insertBefore(n,this.next),this.text=this.statics.value(this.domNode),n},e.prototype.update=function(t,e){var n=this;t.some(function(t){return"characterData"===t.type&&t.target===n.domNode})&&(this.text=this.statics.value(this.domNode))},e.prototype.value=function(){return this.text},e.blotName="text",e.scope=i.Scope.INLINE_BLOT,e}(o.default);e.default=l},function(t,e,n){"use strict";var r=document.createElement("div");if(r.classList.toggle("test-class",!1),r.classList.contains("test-class")){var o=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return arguments.length>1&&!this.contains(t)==!e?e:o.call(this,t)}}String.prototype.startsWith||(String.prototype.startsWith=function(t,e){return e=e||0,this.substr(e,t.length)===t}),String.prototype.endsWith||(String.prototype.endsWith=function(t,e){var n=this.toString();("number"!=typeof e||!isFinite(e)||Math.floor(e)!==e||e>n.length)&&(e=n.length),e-=t.length;var r=n.indexOf(t,e);return-1!==r&&r===e}),Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(t){if(null===this)throw new TypeError("Array.prototype.find called on null or undefined");if("function"!=typeof t)throw new TypeError("predicate must be a function");for(var e,n=Object(this),r=n.length>>>0,o=arguments[1],i=0;i<r;i++)if(e=n[i],t.call(o,e,i,n))return e}}),document.addEventListener("DOMContentLoaded",function(){document.execCommand("enableObjectResizing",!1,!1),document.execCommand("autoUrlDetect",!1,!1)})},function(t,e){function n(t,e,n){if(t==e)return t?[[v,t]]:[];(n<0||t.length<n)&&(n=null);var o=l(t,e),i=t.substring(0,o);t=t.substring(o),e=e.substring(o),o=a(t,e);var s=t.substring(t.length-o);t=t.substring(0,t.length-o),e=e.substring(0,e.length-o);var c=r(t,e);return i&&c.unshift([v,i]),s&&c.push([v,s]),u(c),null!=n&&(c=f(c,n)),c=h(c)}function r(t,e){var r;if(!t)return[[y,e]];if(!e)return[[d,t]];var i=t.length>e.length?t:e,l=t.length>e.length?e:t,a=i.indexOf(l);if(-1!=a)return r=[[y,i.substring(0,a)],[v,l],[y,i.substring(a+l.length)]],t.length>e.length&&(r[0][0]=r[2][0]=d),r;if(1==l.length)return[[d,t],[y,e]];var u=s(t,e);if(u){var c=u[0],f=u[1],h=u[2],p=u[3],b=u[4],g=n(c,h),m=n(f,p);return g.concat([[v,b]],m)}return o(t,e)}function o(t,e){for(var n=t.length,r=e.length,o=Math.ceil((n+r)/2),l=o,a=2*o,s=new Array(a),u=new Array(a),c=0;c<a;c++)s[c]=-1,u[c]=-1;s[l+1]=0,u[l+1]=0;for(var f=n-r,h=f%2!=0,p=0,v=0,b=0,g=0,m=0;m<o;m++){for(var _=-m+p;_<=m-v;_+=2){var O,w=l+_;O=_==-m||_!=m&&s[w-1]<s[w+1]?s[w+1]:s[w-1]+1;for(var x=O-_;O<n&&x<r&&t.charAt(O)==e.charAt(x);)O++,x++;if(s[w]=O,O>n)v+=2;else if(x>r)p+=2;else if(h){var k=l+f-_;if(k>=0&&k<a&&-1!=u[k]){var E=n-u[k];if(O>=E)return i(t,e,O,x)}}}for(var N=-m+b;N<=m-g;N+=2){var E,k=l+N;E=N==-m||N!=m&&u[k-1]<u[k+1]?u[k+1]:u[k-1]+1;for(var j=E-N;E<n&&j<r&&t.charAt(n-E-1)==e.charAt(r-j-1);)E++,j++;if(u[k]=E,E>n)g+=2;else if(j>r)b+=2;else if(!h){var w=l+f-N;if(w>=0&&w<a&&-1!=s[w]){var O=s[w],x=l+O-w;if(E=n-E,O>=E)return i(t,e,O,x)}}}}return[[d,t],[y,e]]}function i(t,e,r,o){var i=t.substring(0,r),l=e.substring(0,o),a=t.substring(r),s=e.substring(o),u=n(i,l),c=n(a,s);return u.concat(c)}function l(t,e){if(!t||!e||t.charAt(0)!=e.charAt(0))return 0;for(var n=0,r=Math.min(t.length,e.length),o=r,i=0;n<o;)t.substring(i,o)==e.substring(i,o)?(n=o,i=n):r=o,o=Math.floor((r-n)/2+n);return o}function a(t,e){if(!t||!e||t.charAt(t.length-1)!=e.charAt(e.length-1))return 0;for(var n=0,r=Math.min(t.length,e.length),o=r,i=0;n<o;)t.substring(t.length-o,t.length-i)==e.substring(e.length-o,e.length-i)?(n=o,i=n):r=o,o=Math.floor((r-n)/2+n);return o}function s(t,e){function n(t,e,n){for(var r,o,i,s,u=t.substring(n,n+Math.floor(t.length/4)),c=-1,f="";-1!=(c=e.indexOf(u,c+1));){var h=l(t.substring(n),e.substring(c)),p=a(t.substring(0,n),e.substring(0,c));f.length<p+h&&(f=e.substring(c-p,c)+e.substring(c,c+h),r=t.substring(0,n-p),o=t.substring(n+h),i=e.substring(0,c-p),s=e.substring(c+h))}return 2*f.length>=t.length?[r,o,i,s,f]:null}var r=t.length>e.length?t:e,o=t.length>e.length?e:t;if(r.length<4||2*o.length<r.length)return null;var i,s=n(r,o,Math.ceil(r.length/4)),u=n(r,o,Math.ceil(r.length/2));if(!s&&!u)return null;i=u?s&&s[4].length>u[4].length?s:u:s;var c,f,h,p;return t.length>e.length?(c=i[0],f=i[1],h=i[2],p=i[3]):(h=i[0],p=i[1],c=i[2],f=i[3]),[c,f,h,p,i[4]]}function u(t){t.push([v,""]);for(var e,n=0,r=0,o=0,i="",s="";n<t.length;)switch(t[n][0]){case y:o++,s+=t[n][1],n++;break;case d:r++,i+=t[n][1],n++;break;case v:r+o>1?(0!==r&&0!==o&&(e=l(s,i),0!==e&&(n-r-o>0&&t[n-r-o-1][0]==v?t[n-r-o-1][1]+=s.substring(0,e):(t.splice(0,0,[v,s.substring(0,e)]),n++),s=s.substring(e),i=i.substring(e)),0!==(e=a(s,i))&&(t[n][1]=s.substring(s.length-e)+t[n][1],s=s.substring(0,s.length-e),i=i.substring(0,i.length-e))),0===r?t.splice(n-o,r+o,[y,s]):0===o?t.splice(n-r,r+o,[d,i]):t.splice(n-r-o,r+o,[d,i],[y,s]),n=n-r-o+(r?1:0)+(o?1:0)+1):0!==n&&t[n-1][0]==v?(t[n-1][1]+=t[n][1],t.splice(n,1)):n++,o=0,r=0,i="",s=""}""===t[t.length-1][1]&&t.pop();var c=!1;for(n=1;n<t.length-1;)t[n-1][0]==v&&t[n+1][0]==v&&(t[n][1].substring(t[n][1].length-t[n-1][1].length)==t[n-1][1]?(t[n][1]=t[n-1][1]+t[n][1].substring(0,t[n][1].length-t[n-1][1].length),t[n+1][1]=t[n-1][1]+t[n+1][1],t.splice(n-1,1),c=!0):t[n][1].substring(0,t[n+1][1].length)==t[n+1][1]&&(t[n-1][1]+=t[n+1][1],t[n][1]=t[n][1].substring(t[n+1][1].length)+t[n+1][1],t.splice(n+1,1),c=!0)),n++;c&&u(t)}function c(t,e){if(0===e)return[v,t];for(var n=0,r=0;r<t.length;r++){var o=t[r];if(o[0]===d||o[0]===v){var i=n+o[1].length;if(e===i)return[r+1,t];if(e<i){t=t.slice();var l=e-n,a=[o[0],o[1].slice(0,l)],s=[o[0],o[1].slice(l)];return t.splice(r,1,a,s),[r+1,t]}n=i}}throw new Error("cursor_pos is out of bounds!")}function f(t,e){var n=c(t,e),r=n[1],o=n[0],i=r[o],l=r[o+1];if(null==i)return t;if(i[0]!==v)return t;if(null!=l&&i[1]+l[1]===l[1]+i[1])return r.splice(o,2,l,i),p(r,o,2);if(null!=l&&0===l[1].indexOf(i[1])){r.splice(o,2,[l[0],i[1]],[0,i[1]]);var a=l[1].slice(i[1].length);return a.length>0&&r.splice(o+2,0,[l[0],a]),p(r,o,3)}return t}function h(t){for(var e=!1,n=function(t){return t.charCodeAt(0)>=56320&&t.charCodeAt(0)<=57343},r=2;r<t.length;r+=1)t[r-2][0]===v&&function(t){return t.charCodeAt(t.length-1)>=55296&&t.charCodeAt(t.length-1)<=56319}(t[r-2][1])&&t[r-1][0]===d&&n(t[r-1][1])&&t[r][0]===y&&n(t[r][1])&&(e=!0,t[r-1][1]=t[r-2][1].slice(-1)+t[r-1][1],t[r][1]=t[r-2][1].slice(-1)+t[r][1],t[r-2][1]=t[r-2][1].slice(0,-1));if(!e)return t;for(var o=[],r=0;r<t.length;r+=1)t[r][1].length>0&&o.push(t[r]);return o}function p(t,e,n){for(var r=e+n-1;r>=0&&r>=e-1;r--)if(r+1<t.length){var o=t[r],i=t[r+1];o[0]===i[1]&&t.splice(r,2,[o[0],o[1]+i[1]])}return t}var d=-1,y=1,v=0,b=n;b.INSERT=y,b.DELETE=d,b.EQUAL=v,t.exports=b},function(t,e){function n(t){var e=[];for(var n in t)e.push(n);return e}e=t.exports="function"==typeof Object.keys?Object.keys:n,e.shim=n},function(t,e){function n(t){return"[object Arguments]"==Object.prototype.toString.call(t)}function r(t){return t&&"object"==typeof t&&"number"==typeof t.length&&Object.prototype.hasOwnProperty.call(t,"callee")&&!Object.prototype.propertyIsEnumerable.call(t,"callee")||!1}var o="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();e=t.exports=o?n:r,e.supported=n,e.unsupported=r},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){return Object.keys(e).reduce(function(n,r){return null==t[r]?n:(e[r]===t[r]?n[r]=e[r]:Array.isArray(e[r])?e[r].indexOf(t[r])<0&&(n[r]=e[r].concat([t[r]])):n[r]=[e[r],t[r]],n)},{})}function a(t){return t.reduce(function(t,e){if(1===e.insert){var n=(0,N.default)(e.attributes);return delete n.image,t.insert({image:e.attributes.image},n)}if(null==e.attributes||!0!==e.attributes.list&&!0!==e.attributes.bullet||(e=(0,N.default)(e),e.attributes.list?e.attributes.list="ordered":(e.attributes.list="bullet",delete e.attributes.bullet)),"string"==typeof e.insert){var r=e.insert.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return t.insert(r,e.attributes)}return t.push(e)},new h.default)}Object.defineProperty(e,"__esModule",{value:!0});var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},u=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),c=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),f=n(4),h=r(f),p=n(20),d=r(p),y=n(0),v=r(y),b=n(13),g=r(b),m=n(31),_=r(m),O=n(3),w=r(O),x=n(14),k=r(x),E=n(21),N=r(E),j=n(12),A=r(j),q=n(2),T=r(q),P=/^[ -~]*$/,S=function(){function t(e){i(this,t),this.scroll=e,this.delta=this.getDelta()}return c(t,[{key:"applyDelta",value:function(t){var e=this,n=!1;this.scroll.update();var r=this.scroll.length();return this.scroll.batchStart(),t=a(t),t.reduce(function(t,o){var i=o.retain||o.delete||o.insert.length||1,l=o.attributes||{};if(null!=o.insert){if("string"==typeof o.insert){var a=o.insert;a.endsWith("\n")&&n&&(n=!1,a=a.slice(0,-1)),t>=r&&!a.endsWith("\n")&&(n=!0),e.scroll.insertAt(t,a);var c=e.scroll.line(t),f=u(c,2),h=f[0],p=f[1],y=(0,T.default)({},(0,O.bubbleFormats)(h));if(h instanceof w.default){var b=h.descendant(v.default.Leaf,p),g=u(b,1),m=g[0];y=(0,T.default)(y,(0,O.bubbleFormats)(m))}l=d.default.attributes.diff(y,l)||{}}else if("object"===s(o.insert)){var _=Object.keys(o.insert)[0];if(null==_)return t;e.scroll.insertAt(t,_,o.insert[_])}r+=i}return Object.keys(l).forEach(function(n){e.scroll.formatAt(t,i,n,l[n])}),t+i},0),t.reduce(function(t,n){return"number"==typeof n.delete?(e.scroll.deleteAt(t,n.delete),t):t+(n.retain||n.insert.length||1)},0),this.scroll.batchEnd(),this.update(t)}},{key:"deleteText",value:function(t,e){return this.scroll.deleteAt(t,e),this.update((new h.default).retain(t).delete(e))}},{key:"formatLine",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.scroll.update(),Object.keys(r).forEach(function(o){if(null==n.scroll.whitelist||n.scroll.whitelist[o]){var i=n.scroll.lines(t,Math.max(e,1)),l=e;i.forEach(function(e){var i=e.length();if(e instanceof g.default){var a=t-e.offset(n.scroll),s=e.newlineIndex(a+l)-a+1;e.formatAt(a,s,o,r[o])}else e.format(o,r[o]);l-=i})}}),this.scroll.optimize(),this.update((new h.default).retain(t).retain(e,(0,N.default)(r)))}},{key:"formatText",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return Object.keys(r).forEach(function(o){n.scroll.formatAt(t,e,o,r[o])}),this.update((new h.default).retain(t).retain(e,(0,N.default)(r)))}},{key:"getContents",value:function(t,e){return this.delta.slice(t,t+e)}},{key:"getDelta",value:function(){return this.scroll.lines().reduce(function(t,e){return t.concat(e.delta())},new h.default)}},{key:"getFormat",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=[],r=[];0===e?this.scroll.path(t).forEach(function(t){var e=u(t,1),o=e[0];o instanceof w.default?n.push(o):o instanceof v.default.Leaf&&r.push(o)}):(n=this.scroll.lines(t,e),r=this.scroll.descendants(v.default.Leaf,t,e));var o=[n,r].map(function(t){if(0===t.length)return{};for(var e=(0,O.bubbleFormats)(t.shift());Object.keys(e).length>0;){var n=t.shift();if(null==n)return e;e=l((0,O.bubbleFormats)(n),e)}return e});return T.default.apply(T.default,o)}},{key:"getText",value:function(t,e){return this.getContents(t,e).filter(function(t){return"string"==typeof t.insert}).map(function(t){return t.insert}).join("")}},{key:"insertEmbed",value:function(t,e,n){return this.scroll.insertAt(t,e,n),this.update((new h.default).retain(t).insert(o({},e,n)))}},{key:"insertText",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return e=e.replace(/\r\n/g,"\n").replace(/\r/g,"\n"),this.scroll.insertAt(t,e),Object.keys(r).forEach(function(o){n.scroll.formatAt(t,e.length,o,r[o])}),this.update((new h.default).retain(t).insert(e,(0,N.default)(r)))}},{key:"isBlank",value:function(){if(0==this.scroll.children.length)return!0;if(this.scroll.children.length>1)return!1;var t=this.scroll.children.head;return t.statics.blotName===w.default.blotName&&(!(t.children.length>1)&&t.children.head instanceof k.default)}},{key:"removeFormat",value:function(t,e){var n=this.getText(t,e),r=this.scroll.line(t+e),o=u(r,2),i=o[0],l=o[1],a=0,s=new h.default;null!=i&&(a=i instanceof g.default?i.newlineIndex(l)-l+1:i.length()-l,s=i.delta().slice(l,l+a-1).insert("\n"));var c=this.getContents(t,e+a),f=c.diff((new h.default).insert(n).concat(s)),p=(new h.default).retain(t).concat(f);return this.applyDelta(p)}},{key:"update",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,r=this.delta;if(1===e.length&&"characterData"===e[0].type&&e[0].target.data.match(P)&&v.default.find(e[0].target)){var o=v.default.find(e[0].target),i=(0,O.bubbleFormats)(o),l=o.offset(this.scroll),a=e[0].oldValue.replace(_.default.CONTENTS,""),s=(new h.default).insert(a),u=(new h.default).insert(o.value());t=(new h.default).retain(l).concat(s.diff(u,n)).reduce(function(t,e){return e.insert?t.insert(e.insert,i):t.push(e)},new h.default),this.delta=r.compose(t)}else this.delta=this.getDelta(),t&&(0,A.default)(r.compose(t),this.delta)||(t=r.diff(this.delta,n));return t}}]),t}();e.default=S},function(t,e){"use strict";function n(){}function r(t,e,n){this.fn=t,this.context=e,this.once=n||!1}function o(){this._events=new n,this._eventsCount=0}var i=Object.prototype.hasOwnProperty,l="~";Object.create&&(n.prototype=Object.create(null),(new n).__proto__||(l=!1)),o.prototype.eventNames=function(){var t,e,n=[];if(0===this._eventsCount)return n;for(e in t=this._events)i.call(t,e)&&n.push(l?e.slice(1):e);return Object.getOwnPropertySymbols?n.concat(Object.getOwnPropertySymbols(t)):n},o.prototype.listeners=function(t,e){var n=l?l+t:t,r=this._events[n];if(e)return!!r;if(!r)return[];if(r.fn)return[r.fn];for(var o=0,i=r.length,a=new Array(i);o<i;o++)a[o]=r[o].fn;return a},o.prototype.emit=function(t,e,n,r,o,i){var a=l?l+t:t;if(!this._events[a])return!1;var s,u,c=this._events[a],f=arguments.length;if(c.fn){switch(c.once&&this.removeListener(t,c.fn,void 0,!0),f){case 1:return c.fn.call(c.context),!0;case 2:return c.fn.call(c.context,e),!0;case 3:return c.fn.call(c.context,e,n),!0;case 4:return c.fn.call(c.context,e,n,r),!0;case 5:return c.fn.call(c.context,e,n,r,o),!0;case 6:return c.fn.call(c.context,e,n,r,o,i),!0}for(u=1,s=new Array(f-1);u<f;u++)s[u-1]=arguments[u];c.fn.apply(c.context,s)}else{var h,p=c.length;for(u=0;u<p;u++)switch(c[u].once&&this.removeListener(t,c[u].fn,void 0,!0),f){case 1:c[u].fn.call(c[u].context);break;case 2:c[u].fn.call(c[u].context,e);break;case 3:c[u].fn.call(c[u].context,e,n);break;case 4:c[u].fn.call(c[u].context,e,n,r);break;default:if(!s)for(h=1,s=new Array(f-1);h<f;h++)s[h-1]=arguments[h];c[u].fn.apply(c[u].context,s)}}return!0},o.prototype.on=function(t,e,n){var o=new r(e,n||this),i=l?l+t:t;return this._events[i]?this._events[i].fn?this._events[i]=[this._events[i],o]:this._events[i].push(o):(this._events[i]=o,this._eventsCount++),this},o.prototype.once=function(t,e,n){var o=new r(e,n||this,!0),i=l?l+t:t;return this._events[i]?this._events[i].fn?this._events[i]=[this._events[i],o]:this._events[i].push(o):(this._events[i]=o,this._eventsCount++),this},o.prototype.removeListener=function(t,e,r,o){var i=l?l+t:t;if(!this._events[i])return this;if(!e)return 0==--this._eventsCount?this._events=new n:delete this._events[i],this;var a=this._events[i];if(a.fn)a.fn!==e||o&&!a.once||r&&a.context!==r||(0==--this._eventsCount?this._events=new n:delete this._events[i]);else{for(var s=0,u=[],c=a.length;s<c;s++)(a[s].fn!==e||o&&!a[s].once||r&&a[s].context!==r)&&u.push(a[s]);u.length?this._events[i]=1===u.length?u[0]:u:0==--this._eventsCount?this._events=new n:delete this._events[i]}return this},o.prototype.removeAllListeners=function(t){var e;return t?(e=l?l+t:t,this._events[e]&&(0==--this._eventsCount?this._events=new n:delete this._events[e])):(this._events=new n,this._eventsCount=0),this},o.prototype.off=o.prototype.removeListener,o.prototype.addListener=o.prototype.on,o.prototype.setMaxListeners=function(){return this},o.prefixed=l,o.EventEmitter=o,void 0!==t&&(t.exports=o)},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t){return t instanceof v.default||t instanceof y.BlockEmbed}Object.defineProperty(e,"__esModule",{value:!0});var s=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},f=n(0),h=r(f),p=n(9),d=r(p),y=n(3),v=r(y),b=n(14),g=r(b),m=n(13),_=r(m),O=n(23),w=r(O),x=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return r.emitter=n.emitter,Array.isArray(n.whitelist)&&(r.whitelist=n.whitelist.reduce(function(t,e){return t[e]=!0,t},{})),r.domNode.addEventListener("DOMNodeInserted",function(){}),r.optimize(),r.enable(),r}return l(e,t),u(e,[{key:"batchStart",value:function(){this.batch=!0}},{key:"batchEnd",value:function(){this.batch=!1,this.optimize()}},{key:"deleteAt",value:function(t,n){var r=this.line(t),o=s(r,2),i=o[0],l=o[1],a=this.line(t+n),u=s(a,1),f=u[0];if(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"deleteAt",this).call(this,t,n),null!=f&&i!==f&&l>0){if(i instanceof y.BlockEmbed||f instanceof y.BlockEmbed)return void this.optimize();if(i instanceof _.default){var h=i.newlineIndex(i.length(),!0);if(h>-1&&(i=i.split(h+1))===f)return void this.optimize()}else if(f instanceof _.default){var p=f.newlineIndex(0);p>-1&&f.split(p+1)}var d=f.children.head instanceof g.default?null:f.children.head;i.moveChildren(f,d),i.remove()}this.optimize()}},{key:"enable",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.domNode.setAttribute("contenteditable",t)}},{key:"formatAt",value:function(t,n,r,o){(null==this.whitelist||this.whitelist[r])&&(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,n,r,o),this.optimize())}},{key:"insertAt",value:function(t,n,r){if(null==r||null==this.whitelist||this.whitelist[n]){if(t>=this.length())if(null==r||null==h.default.query(n,h.default.Scope.BLOCK)){var o=h.default.create(this.statics.defaultChild);this.appendChild(o),null==r&&n.endsWith("\n")&&(n=n.slice(0,-1)),o.insertAt(0,n,r)}else{var i=h.default.create(n,r);this.appendChild(i)}else c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r);this.optimize()}}},{key:"insertBefore",value:function(t,n){if(t.statics.scope===h.default.Scope.INLINE_BLOT){var r=h.default.create(this.statics.defaultChild);r.appendChild(t),t=r}c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n)}},{key:"leaf",value:function(t){return this.path(t).pop()||[null,-1]}},{key:"line",value:function(t){return t===this.length()?this.line(t-1):this.descendant(a,t)}},{key:"lines",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;return function t(e,n,r){var o=[],i=r;return e.children.forEachAt(n,r,function(e,n,r){a(e)?o.push(e):e instanceof h.default.Container&&(o=o.concat(t(e,n,i))),i-=r}),o}(this,t,e)}},{key:"optimize",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};!0!==this.batch&&(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t,n),t.length>0&&this.emitter.emit(d.default.events.SCROLL_OPTIMIZE,t,n))}},{key:"path",value:function(t){return c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"path",this).call(this,t).slice(1)}},{key:"update",value:function(t){if(!0!==this.batch){var n=d.default.sources.USER;"string"==typeof t&&(n=t),Array.isArray(t)||(t=this.observer.takeRecords()),t.length>0&&this.emitter.emit(d.default.events.SCROLL_BEFORE_UPDATE,n,t),c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"update",this).call(this,t.concat([])),t.length>0&&this.emitter.emit(d.default.events.SCROLL_UPDATE,n,t)}}}]),e}(h.default.Scroll);x.blotName="scroll",x.className="ql-editor",x.tagName="DIV",x.defaultChild="block",x.allowedChildren=[v.default,y.BlockEmbed,w.default],e.default=x},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function s(t,e,n){return"object"===(void 0===e?"undefined":x(e))?Object.keys(e).reduce(function(t,n){return s(t,n,e[n])},t):t.reduce(function(t,r){return r.attributes&&r.attributes[e]?t.push(r):t.insert(r.insert,(0,j.default)({},o({},e,n),r.attributes))},new q.default)}function u(t){if(t.nodeType!==Node.ELEMENT_NODE)return{};return t["__ql-computed-style"]||(t["__ql-computed-style"]=window.getComputedStyle(t))}function c(t,e){for(var n="",r=t.ops.length-1;r>=0&&n.length<e.length;--r){var o=t.ops[r];if("string"!=typeof o.insert)break;n=o.insert+n}return n.slice(-1*e.length)===e}function f(t){return 0!==t.childNodes.length&&["block","list-item"].indexOf(u(t).display)>-1}function h(t,e,n){return t.nodeType===t.TEXT_NODE?n.reduce(function(e,n){return n(t,e)},new q.default):t.nodeType===t.ELEMENT_NODE?[].reduce.call(t.childNodes||[],function(r,o){var i=h(o,e,n);return o.nodeType===t.ELEMENT_NODE&&(i=e.reduce(function(t,e){return e(o,t)},i),i=(o[W]||[]).reduce(function(t,e){return e(o,t)},i)),r.concat(i)},new q.default):new q.default}function p(t,e,n){return s(n,t,!0)}function d(t,e){var n=P.default.Attributor.Attribute.keys(t),r=P.default.Attributor.Class.keys(t),o=P.default.Attributor.Style.keys(t),i={};return n.concat(r).concat(o).forEach(function(e){var n=P.default.query(e,P.default.Scope.ATTRIBUTE);null!=n&&(i[n.attrName]=n.value(t),i[n.attrName])||(n=Y[e],null==n||n.attrName!==e&&n.keyName!==e||(i[n.attrName]=n.value(t)||void 0),null==(n=X[e])||n.attrName!==e&&n.keyName!==e||(n=X[e],i[n.attrName]=n.value(t)||void 0))}),Object.keys(i).length>0&&(e=s(e,i)),e}function y(t,e){var n=P.default.query(t);if(null==n)return e;if(n.prototype instanceof P.default.Embed){var r={},o=n.value(t);null!=o&&(r[n.blotName]=o,e=(new q.default).insert(r,n.formats(t)))}else"function"==typeof n.formats&&(e=s(e,n.blotName,n.formats(t)));return e}function v(t,e){return c(e,"\n")||e.insert("\n"),e}function b(){return new q.default}function g(t,e){var n=P.default.query(t);if(null==n||"list-item"!==n.blotName||!c(e,"\n"))return e;for(var r=-1,o=t.parentNode;!o.classList.contains("ql-clipboard");)"list"===(P.default.query(o)||{}).blotName&&(r+=1),o=o.parentNode;return r<=0?e:e.compose((new q.default).retain(e.length()-1).retain(1,{indent:r}))}function m(t,e){return c(e,"\n")||(f(t)||e.length()>0&&t.nextSibling&&f(t.nextSibling))&&e.insert("\n"),e}function _(t,e){if(f(t)&&null!=t.nextElementSibling&&!c(e,"\n\n")){var n=t.offsetHeight+parseFloat(u(t).marginTop)+parseFloat(u(t).marginBottom);t.nextElementSibling.offsetTop>t.offsetTop+1.5*n&&e.insert("\n")}return e}function O(t,e){var n={},r=t.style||{};return r.fontStyle&&"italic"===u(t).fontStyle&&(n.italic=!0),r.fontWeight&&(u(t).fontWeight.startsWith("bold")||parseInt(u(t).fontWeight)>=700)&&(n.bold=!0),Object.keys(n).length>0&&(e=s(e,n)),parseFloat(r.textIndent||0)>0&&(e=(new q.default).insert("\t").concat(e)),e}function w(t,e){var n=t.data;if("O:P"===t.parentNode.tagName)return e.insert(n.trim());if(0===n.trim().length&&t.parentNode.classList.contains("ql-clipboard"))return e;if(!u(t.parentNode).whiteSpace.startsWith("pre")){var r=function(t,e){return e=e.replace(/[^\u00a0]/g,""),e.length<1&&t?" ":e};n=n.replace(/\r\n/g," ").replace(/\n/g," "),n=n.replace(/\s\s+/g,r.bind(r,!0)),(null==t.previousSibling&&f(t.parentNode)||null!=t.previousSibling&&f(t.previousSibling))&&(n=n.replace(/^\s+/,r.bind(r,!1))),(null==t.nextSibling&&f(t.parentNode)||null!=t.nextSibling&&f(t.nextSibling))&&(n=n.replace(/\s+$/,r.bind(r,!1)))}return e.insert(n)}Object.defineProperty(e,"__esModule",{value:!0}),e.matchText=e.matchSpacing=e.matchNewline=e.matchBlot=e.matchAttributor=e.default=void 0;var x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},k=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),E=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),N=n(2),j=r(N),A=n(4),q=r(A),T=n(0),P=r(T),S=n(6),C=r(S),L=n(10),M=r(L),R=n(7),I=r(R),B=n(34),D=n(35),U=n(13),F=r(U),H=n(24),K=n(36),z=n(37),V=n(38),Z=(0,M.default)("quill:clipboard"),W="__ql-matcher",G=[[Node.TEXT_NODE,w],[Node.TEXT_NODE,m],["br",v],[Node.ELEMENT_NODE,m],[Node.ELEMENT_NODE,y],[Node.ELEMENT_NODE,_],[Node.ELEMENT_NODE,d],[Node.ELEMENT_NODE,O],["li",g],["b",p.bind(p,"bold")],["i",p.bind(p,"italic")],["style",b]],Y=[B.AlignAttribute,K.DirectionAttribute].reduce(function(t,e){return t[e.keyName]=e,t},{}),X=[B.AlignStyle,D.BackgroundStyle,H.ColorStyle,K.DirectionStyle,z.FontStyle,V.SizeStyle].reduce(function(t,e){return t[e.keyName]=e,t},{}),$=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.root.addEventListener("paste",r.onPaste.bind(r)),r.container=r.quill.addContainer("ql-clipboard"),r.container.setAttribute("contenteditable",!0),r.container.setAttribute("tabindex",-1),r.matchers=[],G.concat(r.options.matchers).forEach(function(t){var e=k(t,2),o=e[0],i=e[1];(n.matchVisual||i!==_)&&r.addMatcher(o,i)}),r}return a(e,t),E(e,[{key:"addMatcher",value:function(t,e){this.matchers.push([t,e])}},{key:"convert",value:function(t){if("string"==typeof t)return this.container.innerHTML=t.replace(/\>\r?\n +\</g,"><"),this.convert();var e=this.quill.getFormat(this.quill.selection.savedRange.index);if(e[F.default.blotName]){var n=this.container.innerText;return this.container.innerHTML="",(new q.default).insert(n,o({},F.default.blotName,e[F.default.blotName]))}var r=this.prepareMatching(),i=k(r,2),l=i[0],a=i[1],s=h(this.container,l,a);return c(s,"\n")&&null==s.ops[s.ops.length-1].attributes&&(s=s.compose((new q.default).retain(s.length()-1).delete(1))),Z.log("convert",this.container.innerHTML,s),this.container.innerHTML="",s}},{key:"dangerouslyPasteHTML",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:C.default.sources.API;if("string"==typeof t)this.quill.setContents(this.convert(t),e),this.quill.setSelection(0,C.default.sources.SILENT);else{var r=this.convert(e);this.quill.updateContents((new q.default).retain(t).concat(r),n),this.quill.setSelection(t+r.length(),C.default.sources.SILENT)}}},{key:"onPaste",value:function(t){var e=this;if(!t.defaultPrevented&&this.quill.isEnabled()){var n=this.quill.getSelection(),r=(new q.default).retain(n.index),o=this.quill.scrollingContainer.scrollTop;this.container.focus(),this.quill.selection.update(C.default.sources.SILENT),setTimeout(function(){r=r.concat(e.convert()).delete(n.length),e.quill.updateContents(r,C.default.sources.USER),e.quill.setSelection(r.length()-n.length,C.default.sources.SILENT),e.quill.scrollingContainer.scrollTop=o,e.quill.focus()},1)}}},{key:"prepareMatching",value:function(){var t=this,e=[],n=[];return this.matchers.forEach(function(r){var o=k(r,2),i=o[0],l=o[1];switch(i){case Node.TEXT_NODE:n.push(l);break;case Node.ELEMENT_NODE:e.push(l);break;default:[].forEach.call(t.container.querySelectorAll(i),function(t){t[W]=t[W]||[],t[W].push(l)})}}),[e,n]}}]),e}(I.default);$.DEFAULTS={matchers:[],matchVisual:!0},e.default=$,e.matchAttributor=d,e.matchBlot=y,e.matchNewline=m,e.matchSpacing=_,e.matchText=w},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t){var e=t.ops[t.ops.length-1];return null!=e&&(null!=e.insert?"string"==typeof e.insert&&e.insert.endsWith("\n"):null!=e.attributes&&Object.keys(e.attributes).some(function(t){return null!=f.default.query(t,f.default.Scope.BLOCK)}))}function s(t){var e=t.reduce(function(t,e){return t+=e.delete||0},0),n=t.length()-e;return a(t)&&(n-=1),n}Object.defineProperty(e,"__esModule",{value:!0}),e.getLastChangeIndex=e.default=void 0;var u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(0),f=r(c),h=n(6),p=r(h),d=n(7),y=r(d),v=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.lastRecorded=0,r.ignoreChange=!1,r.clear(),r.quill.on(p.default.events.EDITOR_CHANGE,function(t,e,n,o){t!==p.default.events.TEXT_CHANGE||r.ignoreChange||(r.options.userOnly&&o!==p.default.sources.USER?r.transform(e):r.record(e,n))}),r.quill.keyboard.addBinding({key:"Z",shortKey:!0},r.undo.bind(r)),r.quill.keyboard.addBinding({key:"Z",shortKey:!0,shiftKey:!0},r.redo.bind(r)),/Win/i.test(navigator.platform)&&r.quill.keyboard.addBinding({key:"Y",shortKey:!0},r.redo.bind(r)),r}return l(e,t),u(e,[{key:"change",value:function(t,e){if(0!==this.stack[t].length){var n=this.stack[t].pop();this.stack[e].push(n),this.lastRecorded=0,this.ignoreChange=!0,this.quill.updateContents(n[t],p.default.sources.USER),this.ignoreChange=!1;var r=s(n[t]);this.quill.setSelection(r)}}},{key:"clear",value:function(){this.stack={undo:[],redo:[]}}},{key:"cutoff",value:function(){this.lastRecorded=0}},{key:"record",value:function(t,e){if(0!==t.ops.length){this.stack.redo=[];var n=this.quill.getContents().diff(e),r=Date.now();if(this.lastRecorded+this.options.delay>r&&this.stack.undo.length>0){var o=this.stack.undo.pop();n=n.compose(o.undo),t=o.redo.compose(t)}else this.lastRecorded=r;this.stack.undo.push({redo:t,undo:n}),this.stack.undo.length>this.options.maxStack&&this.stack.undo.shift()}}},{key:"redo",value:function(){this.change("redo","undo")}},{key:"transform",value:function(t){this.stack.undo.forEach(function(e){e.undo=t.transform(e.undo,!0),e.redo=t.transform(e.redo,!0)}),this.stack.redo.forEach(function(e){e.undo=t.transform(e.undo,!0),e.redo=t.transform(e.redo,!0)})}},{key:"undo",value:function(){this.change("undo","redo")}}]),e}(y.default);v.DEFAULTS={delay:1e3,maxStack:100,userOnly:!1},e.default=v,e.getLastChangeIndex=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.IndentClass=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"add",value:function(t,n){if("+1"===n||"-1"===n){var r=this.value(t)||0;n="+1"===n?r+1:r-1}return 0===n?(this.remove(t),!0):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"add",this).call(this,t,n)}},{key:"canAdd",value:function(t,n){return a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"canAdd",this).call(this,t,n)||a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"canAdd",this).call(this,t,parseInt(n))}},{key:"value",value:function(t){return parseInt(a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t))||void 0}}]),e}(u.default.Attributor.Class),f=new c("indent","ql-indent",{scope:u.default.Scope.BLOCK,whitelist:[1,2,3,4,5,6,7,8]});e.IndentClass=f},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=n(3),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="blockquote",s.tagName="blockquote",e.default=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=n(3),s=function(t){return t&&t.__esModule?t:{default:t}}(a),u=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,null,[{key:"formats",value:function(t){return this.tagName.indexOf(t.tagName)+1}}]),e}(s.default);u.blotName="header",u.tagName=["H1","H2","H3","H4","H5","H6"],e.default=u},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.ListItem=void 0;var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(0),f=r(c),h=n(3),p=r(h),d=n(23),y=r(d),v=function(t){function e(){return i(this,e),l(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return a(e,t),s(e,[{key:"format",value:function(t,n){t!==b.blotName||n?u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n):this.replaceWith(f.default.create(this.statics.scope))}},{key:"remove",value:function(){null==this.prev&&null==this.next?this.parent.remove():u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"remove",this).call(this)}},{key:"replaceWith",value:function(t,n){return this.parent.isolate(this.offset(this.parent),this.length()),t===this.parent.statics.blotName?(this.parent.replaceWith(t,n),this):(this.parent.unwrap(),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replaceWith",this).call(this,t,n))}}],[{key:"formats",value:function(t){return t.tagName===this.tagName?void 0:u(e.__proto__||Object.getPrototypeOf(e),"formats",this).call(this,t)}}]),e}(p.default);v.blotName="list-item",v.tagName="LI";var b=function(t){function e(t){i(this,e);var n=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t)),r=function(e){if(e.target.parentNode===t){var r=n.statics.formats(t),o=f.default.find(e.target);"checked"===r?o.format("list","unchecked"):"unchecked"===r&&o.format("list","checked")}};return t.addEventListener("touchstart",r),t.addEventListener("mousedown",r),n}return a(e,t),s(e,null,[{key:"create",value:function(t){var n="ordered"===t?"OL":"UL",r=u(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,n);return"checked"!==t&&"unchecked"!==t||r.setAttribute("data-checked","checked"===t),r}},{key:"formats",value:function(t){return"OL"===t.tagName?"ordered":"UL"===t.tagName?t.hasAttribute("data-checked")?"true"===t.getAttribute("data-checked")?"checked":"unchecked":"bullet":void 0}}]),s(e,[{key:"format",value:function(t,e){this.children.length>0&&this.children.tail.format(t,e)}},{key:"formats",value:function(){return o({},this.statics.blotName,this.statics.formats(this.domNode))}},{key:"insertBefore",value:function(t,n){if(t instanceof v)u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n);else{var r=null==n?this.length():n.offset(this),o=this.split(r);o.parent.insertBefore(t,o)}}},{key:"optimize",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t);var n=this.next;null!=n&&n.prev===this&&n.statics.blotName===this.statics.blotName&&n.domNode.tagName===this.domNode.tagName&&n.domNode.getAttribute("data-checked")===this.domNode.getAttribute("data-checked")&&(n.moveChildren(this),n.remove())}},{key:"replace",value:function(t){if(t.statics.blotName!==this.statics.blotName){var n=f.default.create(this.statics.defaultChild);t.moveChildren(n),this.appendChild(n)}u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replace",this).call(this,t)}}]),e}(y.default);b.blotName="list",b.scope=f.default.Scope.BLOCK_BLOT,b.tagName=["OL","UL"],b.defaultChild="list-item",b.allowedChildren=[v],e.ListItem=v,e.default=b},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=n(39),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="italic",s.tagName=["EM","I"],e.default=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(5),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,null,[{key:"create",value:function(t){return"super"===t?document.createElement("sup"):"sub"===t?document.createElement("sub"):a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t)}},{key:"formats",value:function(t){return"SUB"===t.tagName?"sub":"SUP"===t.tagName?"super":void 0}}]),e}(u.default);c.blotName="script",c.tagName=["SUB","SUP"],e.default=c},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=n(5),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="strike",s.tagName="S",e.default=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=n(5),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="underline",s.tagName="U",e.default=s},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=n(15),f=["alt","height","width"],h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"format",value:function(t,n){f.indexOf(t)>-1?n?this.domNode.setAttribute(t,n):this.domNode.removeAttribute(t):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n)}}],[{key:"create",value:function(t){var n=a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return"string"==typeof t&&n.setAttribute("src",this.sanitize(t)),n}},{key:"formats",value:function(t){return f.reduce(function(e,n){return t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e},{})}},{key:"match",value:function(t){return/\.(jpe?g|gif|png)$/.test(t)||/^data:image\/.+;base64/.test(t)}},{key:"sanitize",value:function(t){return(0,c.sanitize)(t,["http","https","data"])?t:"//:0"}},{key:"value",value:function(t){return t.getAttribute("src")}}]),e}(u.default.Embed);h.blotName="image",h.tagName="IMG",e.default=h},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(3),u=n(15),c=function(t){return t&&t.__esModule?t:{default:t}}(u),f=["height","width"],h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"format",value:function(t,n){f.indexOf(t)>-1?n?this.domNode.setAttribute(t,n):this.domNode.removeAttribute(t):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n)}}],[{key:"create",value:function(t){var n=a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return n.setAttribute("frameborder","0"),n.setAttribute("allowfullscreen",!0),n.setAttribute("src",this.sanitize(t)),n}},{key:"formats",value:function(t){return f.reduce(function(e,n){return t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e},{})}},{key:"sanitize",value:function(t){return c.default.sanitize(t)}},{key:"value",value:function(t){return t.getAttribute("src")}}]),e}(s.BlockEmbed);h.blotName="video",h.className="ql-video",h.tagName="IFRAME",e.default=h},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.FormulaBlot=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(33),c=r(u),f=n(6),h=r(f),p=n(7),d=r(p),y=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,null,[{key:"create",value:function(t){var n=s(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return"string"==typeof t&&(window.katex.render(t,n,{throwOnError:!1,errorColor:"#f00"}),n.setAttribute("data-value",t)),n}},{key:"value",value:function(t){return t.getAttribute("data-value")}}]),e}(c.default);y.blotName="formula",y.className="ql-formula",y.tagName="SPAN";var v=function(t){function e(){o(this,e);var t=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));if(null==window.katex)throw new Error("Formula module requires KaTeX.");return t}return l(e,t),a(e,null,[{key:"register",value:function(){h.default.register(y,!0)}}]),e}(d.default);e.FormulaBlot=y,e.default=v},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.CodeToken=e.CodeBlock=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(0),c=r(u),f=n(6),h=r(f),p=n(7),d=r(p),y=n(13),v=r(y),b=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,[{key:"replaceWith",value:function(t){this.domNode.textContent=this.domNode.textContent,this.attach(),s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replaceWith",this).call(this,t)}},{key:"highlight",value:function(t){var e=this.domNode.textContent;this.cachedText!==e&&((e.trim().length>0||null==this.cachedText)&&(this.domNode.innerHTML=t(e),this.domNode.normalize(),this.attach()),this.cachedText=e)}}]),e}(v.default);b.className="ql-syntax";var g=new c.default.Attributor.Class("token","hljs",{scope:c.default.Scope.INLINE}),m=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));if("function"!=typeof r.options.highlight)throw new Error("Syntax module requires highlight.js. Please include the library on the page before Quill.");var l=null;return r.quill.on(h.default.events.SCROLL_OPTIMIZE,function(){clearTimeout(l),l=setTimeout(function(){r.highlight(),l=null},r.options.interval)}),r.highlight(),r}return l(e,t),a(e,null,[{key:"register",value:function(){h.default.register(g,!0),h.default.register(b,!0)}}]),a(e,[{key:"highlight",value:function(){var t=this;if(!this.quill.selection.composing){this.quill.update(h.default.sources.USER);var e=this.quill.getSelection();this.quill.scroll.descendants(b).forEach(function(e){e.highlight(t.options.highlight)}),this.quill.update(h.default.sources.SILENT),null!=e&&this.quill.setSelection(e,h.default.sources.SILENT)}}}]),e}(d.default);m.DEFAULTS={highlight:function(){return null==window.hljs?null:function(t){return window.hljs.highlightAuto(t).value}}(),interval:1e3},e.CodeBlock=b,e.CodeToken=g,e.default=m},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function s(t,e,n){var r=document.createElement("button");r.setAttribute("type","button"),r.classList.add("ql-"+e),null!=n&&(r.value=n),t.appendChild(r)}function u(t,e){Array.isArray(e[0])||(e=[e]),e.forEach(function(e){var n=document.createElement("span");n.classList.add("ql-formats"),e.forEach(function(t){if("string"==typeof t)s(n,t);else{var e=Object.keys(t)[0],r=t[e];Array.isArray(r)?c(n,e,r):s(n,e,r)}}),t.appendChild(n)})}function c(t,e,n){var r=document.createElement("select");r.classList.add("ql-"+e),n.forEach(function(t){var e=document.createElement("option");!1!==t?e.setAttribute("value",t):e.setAttribute("selected","selected"),r.appendChild(e)}),t.appendChild(r)}Object.defineProperty(e,"__esModule",{value:!0}),e.addControls=e.default=void 0;var f=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),p=n(4),d=r(p),y=n(0),v=r(y),b=n(6),g=r(b),m=n(10),_=r(m),O=n(7),w=r(O),x=(0,_.default)("quill:toolbar"),k=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));if(Array.isArray(r.options.container)){var o=document.createElement("div");u(o,r.options.container),t.container.parentNode.insertBefore(o,t.container),r.container=o}else"string"==typeof r.options.container?r.container=document.querySelector(r.options.container):r.container=r.options.container;if(!(r.container instanceof HTMLElement)){var a;return a=x.error("Container required for toolbar",r.options),l(r,a)}return r.container.classList.add("ql-toolbar"),r.controls=[],r.handlers={},Object.keys(r.options.handlers).forEach(function(t){r.addHandler(t,r.options.handlers[t])}),[].forEach.call(r.container.querySelectorAll("button, select"),function(t){r.attach(t)}),r.quill.on(g.default.events.EDITOR_CHANGE,function(t,e){t===g.default.events.SELECTION_CHANGE&&r.update(e)}),r.quill.on(g.default.events.SCROLL_OPTIMIZE,function(){var t=r.quill.selection.getRange(),e=f(t,1),n=e[0];r.update(n)}),r}return a(e,t),h(e,[{key:"addHandler",value:function(t,e){this.handlers[t]=e}},{key:"attach",value:function(t){var e=this,n=[].find.call(t.classList,function(t){return 0===t.indexOf("ql-")});if(n){if(n=n.slice("ql-".length),"BUTTON"===t.tagName&&t.setAttribute("type","button"),null==this.handlers[n]){if(null!=this.quill.scroll.whitelist&&null==this.quill.scroll.whitelist[n])return void x.warn("ignoring attaching to disabled format",n,t);if(null==v.default.query(n))return void x.warn("ignoring attaching to nonexistent format",n,t)}var r="SELECT"===t.tagName?"change":"click";t.addEventListener(r,function(r){var i=void 0;if("SELECT"===t.tagName){if(t.selectedIndex<0)return;var l=t.options[t.selectedIndex];i=!l.hasAttribute("selected")&&(l.value||!1)}else i=!t.classList.contains("ql-active")&&(t.value||!t.hasAttribute("value")),r.preventDefault();e.quill.focus();var a=e.quill.selection.getRange(),s=f(a,1),u=s[0];if(null!=e.handlers[n])e.handlers[n].call(e,i);else if(v.default.query(n).prototype instanceof v.default.Embed){if(!(i=prompt("Enter "+n)))return;e.quill.updateContents((new d.default).retain(u.index).delete(u.length).insert(o({},n,i)),g.default.sources.USER)}else e.quill.format(n,i,g.default.sources.USER);e.update(u)}),this.controls.push([n,t])}}},{key:"update",value:function(t){var e=null==t?{}:this.quill.getFormat(t);this.controls.forEach(function(n){var r=f(n,2),o=r[0],i=r[1];if("SELECT"===i.tagName){var l=void 0;if(null==t)l=null;else if(null==e[o])l=i.querySelector("option[selected]");else if(!Array.isArray(e[o])){var a=e[o];"string"==typeof a&&(a=a.replace(/\"/g,'\\"')),l=i.querySelector('option[value="'+a+'"]')}null==l?(i.value="",i.selectedIndex=-1):l.selected=!0}else if(null==t)i.classList.remove("ql-active");else if(i.hasAttribute("value")){var s=e[o]===i.getAttribute("value")||null!=e[o]&&e[o].toString()===i.getAttribute("value")||null==e[o]&&!i.getAttribute("value");i.classList.toggle("ql-active",s)}else i.classList.toggle("ql-active",null!=e[o])})}}]),e}(w.default);k.DEFAULTS={},k.DEFAULTS={container:null,handlers:{clean:function(){var t=this,e=this.quill.getSelection();if(null!=e)if(0==e.length){var n=this.quill.getFormat();Object.keys(n).forEach(function(e){null!=v.default.query(e,v.default.Scope.INLINE)&&t.quill.format(e,!1)})}else this.quill.removeFormat(e,g.default.sources.USER)},direction:function(t){var e=this.quill.getFormat().align;"rtl"===t&&null==e?this.quill.format("align","right",g.default.sources.USER):t||"right"!==e||this.quill.format("align",!1,g.default.sources.USER),this.quill.format("direction",t,g.default.sources.USER)},indent:function(t){var e=this.quill.getSelection(),n=this.quill.getFormat(e),r=parseInt(n.indent||0);if("+1"===t||"-1"===t){var o="+1"===t?1:-1;"rtl"===n.direction&&(o*=-1),this.quill.format("indent",r+o,g.default.sources.USER)}},link:function(t){!0===t&&(t=prompt("Enter link URL:")),this.quill.format("link",t,g.default.sources.USER)},list:function(t){var e=this.quill.getSelection(),n=this.quill.getFormat(e);"check"===t?"checked"===n.list||"unchecked"===n.list?this.quill.format("list",!1,g.default.sources.USER):this.quill.format("list","unchecked",g.default.sources.USER):this.quill.format("list",t,g.default.sources.USER)}}},e.default=k,e.addControls=u},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <g class="ql-fill ql-color-label"> <polygon points="6 6.868 6 6 5 6 5 7 5.942 7 6 6.868"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points="6.817 5 6 5 6 6 6.38 6 6.817 5"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points="4 11.439 4 11 3 11 3 12 3.755 12 4 11.439"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points="4.63 10 4 10 4 11 4.192 11 4.63 10"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points="13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points="12 6.868 12 6 11.62 6 12 6.868"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points="12.933 9 13 9 13 8 12.495 8 12.933 9"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points="5.5 13 9 5 12.5 13"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class="ql-fill ql-stroke" height=3 width=3 x=4 y=5></rect> <rect class="ql-fill ql-stroke" height=3 width=3 x=11 y=5></rect> <path class="ql-even ql-fill ql-stroke" d=M7,8c0,4.031-3,5-3,5></path> <path class="ql-even ql-fill ql-stroke" d=M14,8c0,4.031-3,5-3,5></path> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>'},function(t,e){t.exports='<svg class="" viewbox="0 0 18 18"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class="ql-color-label ql-stroke ql-transparent" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points="5.5 11 9 3 12.5 11"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class="ql-stroke ql-fill" points="3 11 5 9 3 7 3 11"></polygon> <line class="ql-stroke ql-fill" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class="ql-stroke ql-fill" points="15 12 13 10 15 8 15 12"></polygon> <line class="ql-stroke ql-fill" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform="translate(24 18) rotate(-180)"/> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>'},function(t,e){t.exports='<svg viewBox="0 0 18 18"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>'},function(t,e){t.exports='<svg viewBox="0 0 18 18"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class="ql-fill ql-stroke" points="3 7 3 11 5 9 3 7"></polyline> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points="5 7 5 11 3 9 5 7"></polyline> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class="ql-even ql-stroke" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class="ql-even ql-stroke" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class="ql-stroke ql-thin" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class="ql-stroke ql-thin" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class="ql-stroke ql-thin" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>'},function(t,e){t.exports='<svg class="" viewbox="0 0 18 18"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points="3 4 4 5 6 3"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points="3 14 4 15 6 13"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points="3 9 4 10 6 8"></polyline> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class="ql-stroke ql-thin" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>'},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class=ql-stroke points="7 11 9 13 11 11 7 11"></polygon> <polygon class=ql-stroke points="7 7 9 5 11 7 7 7"></polygon> </svg>'},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BubbleTooltip=void 0;var a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(2),c=r(u),f=n(9),h=r(f),p=n(44),d=r(p),y=n(22),v=n(26),b=r(v),g=[["bold","italic","link"],[{header:1},{header:2},"blockquote"]],m=function(t){function e(t,n){o(this,e),null!=n.modules.toolbar&&null==n.modules.toolbar.container&&(n.modules.toolbar.container=g);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.container.classList.add("ql-bubble"),r}return l(e,t),s(e,[{key:"extendToolbar",value:function(t){this.tooltip=new _(this.quill,this.options.bounds),this.tooltip.root.appendChild(t.container),this.buildButtons([].slice.call(t.container.querySelectorAll("button")),b.default),this.buildPickers([].slice.call(t.container.querySelectorAll("select")),b.default)}}]),e}(d.default);m.DEFAULTS=(0,c.default)(!0,{},d.default.DEFAULTS,{modules:{toolbar:{handlers:{link:function(t){t?this.quill.theme.tooltip.edit():this.quill.format("link",!1)}}}}});var _=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.on(h.default.events.EDITOR_CHANGE,function(t,e,n,o){if(t===h.default.events.SELECTION_CHANGE)if(null!=e&&e.length>0&&o===h.default.sources.USER){r.show(),r.root.style.left="0px",r.root.style.width="",r.root.style.width=r.root.offsetWidth+"px";var i=r.quill.getLines(e.index,e.length);if(1===i.length)r.position(r.quill.getBounds(e));else{var l=i[i.length-1],a=r.quill.getIndex(l),s=Math.min(l.length()-1,e.index+e.length-a),u=r.quill.getBounds(new y.Range(a,s));r.position(u)}}else document.activeElement!==r.textbox&&r.quill.hasFocus()&&r.hide()}),r}return l(e,t),s(e,[{key:"listen",value:function(){var t=this;a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"listen",this).call(this),this.root.querySelector(".ql-close").addEventListener("click",function(){t.root.classList.remove("ql-editing")}),this.quill.on(h.default.events.SCROLL_OPTIMIZE,function(){setTimeout(function(){if(!t.root.classList.contains("ql-hidden")){var e=t.quill.getSelection();null!=e&&t.position(t.quill.getBounds(e))}},1)})}},{key:"cancel",value:function(){this.show()}},{key:"position",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"position",this).call(this,t),r=this.root.querySelector(".ql-tooltip-arrow");if(r.style.marginLeft="",0===n)return n;r.style.marginLeft=-1*n-r.offsetWidth/2+"px"}}]),e}(p.BaseTooltip);_.TEMPLATE=['<span class="ql-tooltip-arrow"></span>','<div class="ql-tooltip-editor">','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-close"></a>',"</div>"].join(""),e.BubbleTooltip=_,e.default=m},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(2),f=r(c),h=n(9),p=r(h),d=n(44),y=r(d),v=n(15),b=r(v),g=n(22),m=n(26),_=r(m),O=[[{header:["1","2","3",!1]}],["bold","italic","underline","link"],[{list:"ordered"},{list:"bullet"}],["clean"]],w=function(t){function e(t,n){o(this,e),null!=n.modules.toolbar&&null==n.modules.toolbar.container&&(n.modules.toolbar.container=O);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.container.classList.add("ql-snow"),r}return l(e,t),u(e,[{key:"extendToolbar",value:function(t){t.container.classList.add("ql-snow"),this.buildButtons([].slice.call(t.container.querySelectorAll("button")),_.default),this.buildPickers([].slice.call(t.container.querySelectorAll("select")),_.default),this.tooltip=new x(this.quill,this.options.bounds),t.container.querySelector(".ql-link")&&this.quill.keyboard.addBinding({key:"K",shortKey:!0},function(e,n){t.handlers.link.call(t,!n.format.link)})}}]),e}(y.default);w.DEFAULTS=(0,f.default)(!0,{},y.default.DEFAULTS,{modules:{toolbar:{handlers:{link:function(t){if(t){var e=this.quill.getSelection();if(null==e||0==e.length)return;var n=this.quill.getText(e);/^\S+@\S+\.\S+$/.test(n)&&0!==n.indexOf("mailto:")&&(n="mailto:"+n);this.quill.theme.tooltip.edit("link",n)}else this.quill.format("link",!1)}}}}});var x=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.preview=r.root.querySelector("a.ql-preview"),r}return l(e,t),u(e,[{key:"listen",value:function(){var t=this;s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"listen",this).call(this),this.root.querySelector("a.ql-action").addEventListener("click",function(e){t.root.classList.contains("ql-editing")?t.save():t.edit("link",t.preview.textContent),e.preventDefault()}),this.root.querySelector("a.ql-remove").addEventListener("click",function(e){if(null!=t.linkRange){var n=t.linkRange;t.restoreFocus(),t.quill.formatText(n,"link",!1,p.default.sources.USER),delete t.linkRange}e.preventDefault(),t.hide()}),this.quill.on(p.default.events.SELECTION_CHANGE,function(e,n,r){if(null!=e){if(0===e.length&&r===p.default.sources.USER){var o=t.quill.scroll.descendant(b.default,e.index),i=a(o,2),l=i[0],s=i[1];if(null!=l){t.linkRange=new g.Range(e.index-s,l.length());var u=b.default.formats(l.domNode);return t.preview.textContent=u,t.preview.setAttribute("href",u),t.show(),void t.position(t.quill.getBounds(t.linkRange))}}else delete t.linkRange;t.hide()}})}},{key:"show",value:function(){s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"show",this).call(this),this.root.removeAttribute("data-mode")}}]),e}(d.BaseTooltip);x.TEMPLATE=['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-action"></a>','<a class="ql-remove"></a>'].join(""),e.default=w}]).default});
//# sourceMappingURL=quill.min.js.map
!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o(require("quill")):"function"==typeof define&&define.amd?define(["quill"],o):"object"==typeof exports?exports.QuillEmoji=o(require("quill")):e.QuillEmoji=o(e.Quill)}(window,function(a){return function(a){var r={};function c(e){if(r[e])return r[e].exports;var o=r[e]={i:e,l:!1,exports:{}};return a[e].call(o.exports,o,o.exports,c),o.l=!0,o.exports}return c.m=a,c.c=r,c.d=function(e,o,a){c.o(e,o)||Object.defineProperty(e,o,{enumerable:!0,get:a})},c.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(o,e){if(1&e&&(o=c(o)),8&e)return o;if(4&e&&"object"==typeof o&&o&&o.__esModule)return o;var a=Object.create(null);if(c.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:o}),2&e&&"string"!=typeof o)for(var r in o)c.d(a,r,function(e){return o[e]}.bind(null,r));return a},c.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return c.d(o,"a",o),o},c.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},c.p="",c(c.s=3)}([function(e,o){e.exports=a},function(e,o,a){var r;r=function(){return function(a){var r={};function c(e){if(r[e])return r[e].exports;var o=r[e]={i:e,l:!1,exports:{}};return a[e].call(o.exports,o,o.exports,c),o.l=!0,o.exports}return c.m=a,c.c=r,c.d=function(e,o,a){c.o(e,o)||Object.defineProperty(e,o,{enumerable:!0,get:a})},c.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(o,e){if(1&e&&(o=c(o)),8&e)return o;if(4&e&&"object"==typeof o&&o&&o.__esModule)return o;var a=Object.create(null);if(c.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:o}),2&e&&"string"!=typeof o)for(var r in o)c.d(a,r,function(e){return o[e]}.bind(null,r));return a},c.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return c.d(o,"a",o),o},c.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},c.p="",c(c.s="./src/index.js")}({"./src/bitap/bitap_matched_indices.js":function(e,o){e.exports=function(){for(var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[],o=1<arguments.length&&void 0!==arguments[1]?arguments[1]:1,a=[],r=-1,c=-1,n=0,d=e.length;n<d;n+=1){var i=e[n];i&&-1===r?r=n:i||-1===r||(o<=(c=n-1)-r+1&&a.push([r,c]),r=-1)}return e[n-1]&&o<=n-r&&a.push([r,n-1]),a}},"./src/bitap/bitap_pattern_alphabet.js":function(e,o){e.exports=function(e){for(var o={},a=e.length,r=0;r<a;r+=1)o[e.charAt(r)]=0;for(var c=0;c<a;c+=1)o[e.charAt(c)]|=1<<a-c-1;return o}},"./src/bitap/bitap_regex_search.js":function(e,o){var _=/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;e.exports=function(e,o){var a=2<arguments.length&&void 0!==arguments[2]?arguments[2]:/ +/g,r=new RegExp(o.replace(_,"\\$&").replace(a,"|")),c=e.match(r),n=!!c,d=[];if(n)for(var i=0,m=c.length;i<m;i+=1){var t=c[i];d.push([e.indexOf(t),t.length-1])}return{score:n?.5:1,isMatch:n,matchedIndices:d}}},"./src/bitap/bitap_score.js":function(e,o){e.exports=function(e,o){var a=o.errors,r=void 0===a?0:a,c=o.currentLocation,n=void 0===c?0:c,d=o.expectedLocation,i=void 0===d?0:d,m=o.distance,t=void 0===m?100:m,_=r/e.length,l=Math.abs(i-n);return t?_+l/t:l?1:_}},"./src/bitap/bitap_search.js":function(e,o,a){var I=a("./src/bitap/bitap_score.js"),B=a("./src/bitap/bitap_matched_indices.js");e.exports=function(e,o,a,r){for(var c=r.location,n=void 0===c?0:c,d=r.distance,i=void 0===d?100:d,m=r.threshold,t=void 0===m?.6:m,_=r.findAllMatches,l=void 0!==_&&_,s=r.minMatchCharLength,f=void 0===s?1:s,g=n,u=e.length,h=t,y=e.indexOf(o,g),j=o.length,p=[],b=0;b<u;b+=1)p[b]=0;if(-1!==y){var v=I(o,{errors:0,currentLocation:y,expectedLocation:g,distance:i});if(h=Math.min(v,h),-1!==(y=e.lastIndexOf(o,g+j))){var k=I(o,{errors:0,currentLocation:y,expectedLocation:g,distance:i});h=Math.min(k,h)}}y=-1;for(var w=[],x=1,S=j+u,q=1<<j-1,E=0;E<j;E+=1){for(var C=0,L=S;C<L;){I(o,{errors:E,currentLocation:g+L,expectedLocation:g,distance:i})<=h?C=L:S=L,L=Math.floor((S-C)/2+C)}S=L;var O=Math.max(1,g-L+1),M=l?u:Math.min(g+L,u)+j,z=Array(M+2);z[M+1]=(1<<E)-1;for(var T=M;O<=T;T-=1){var P=T-1,A=a[e.charAt(P)];if(A&&(p[P]=1),z[T]=(z[T+1]<<1|1)&A,0!==E&&(z[T]|=(w[T+1]|w[T])<<1|1|w[T+1]),z[T]&q&&(x=I(o,{errors:E,currentLocation:P,expectedLocation:g,distance:i}))<=h){if(h=x,(y=P)<=g)break;O=Math.max(1,2*g-y)}}if(h<I(o,{errors:E+1,currentLocation:g,expectedLocation:g,distance:i}))break;w=z}return{isMatch:0<=y,score:0===x?.001:x,matchedIndices:B(p,f)}}},"./src/bitap/index.js":function(e,o,a){function r(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var _=a("./src/bitap/bitap_regex_search.js"),l=a("./src/bitap/bitap_search.js"),p=a("./src/bitap/bitap_pattern_alphabet.js"),c=function(){function j(e,o){var a=o.location,r=void 0===a?0:a,c=o.distance,n=void 0===c?100:c,d=o.threshold,i=void 0===d?.6:d,m=o.maxPatternLength,t=void 0===m?32:m,_=o.isCaseSensitive,l=void 0!==_&&_,s=o.tokenSeparator,f=void 0===s?/ +/g:s,g=o.findAllMatches,u=void 0!==g&&g,h=o.minMatchCharLength,y=void 0===h?1:h;!function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,j),this.options={location:r,distance:n,threshold:i,maxPatternLength:t,isCaseSensitive:l,tokenSeparator:f,findAllMatches:u,minMatchCharLength:y},this.pattern=this.options.isCaseSensitive?e:e.toLowerCase(),this.pattern.length<=t&&(this.patternAlphabet=p(this.pattern))}var e,o,a;return e=j,(o=[{key:"search",value:function(e){if(this.options.isCaseSensitive||(e=e.toLowerCase()),this.pattern===e)return{isMatch:!0,score:0,matchedIndices:[[0,e.length-1]]};var o=this.options,a=o.maxPatternLength,r=o.tokenSeparator;if(this.pattern.length>a)return _(e,this.pattern,r);var c=this.options,n=c.location,d=c.distance,i=c.threshold,m=c.findAllMatches,t=c.minMatchCharLength;return l(e,this.pattern,this.patternAlphabet,{location:n,distance:d,threshold:i,findAllMatches:m,minMatchCharLength:t})}}])&&r(e.prototype,o),a&&r(e,a),j}();e.exports=c},"./src/helpers/deep_value.js":function(e,o,a){var _=a("./src/helpers/is_array.js");e.exports=function(e,o){return function e(o,a,r){if(a){var c=a.indexOf("."),n=a,d=null;-1!==c&&(n=a.slice(0,c),d=a.slice(c+1));var i=o[n];if(null!=i)if(d||"string"!=typeof i&&"number"!=typeof i)if(_(i))for(var m=0,t=i.length;m<t;m+=1)e(i[m],d,r);else d&&e(i,d,r);else r.push(i.toString())}else r.push(o);return r}(e,o,[])}},"./src/helpers/is_array.js":function(e,o){e.exports=function(e){return Array.isArray?Array.isArray(e):"[object Array]"===Object.prototype.toString.call(e)}},"./src/index.js":function(e,o,a){function _(e){return(_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var n=a("./src/bitap/index.js"),H=a("./src/helpers/deep_value.js"),I=a("./src/helpers/is_array.js"),c=function(){function R(e,o){var a=o.location,r=void 0===a?0:a,c=o.distance,n=void 0===c?100:c,d=o.threshold,i=void 0===d?.6:d,m=o.maxPatternLength,t=void 0===m?32:m,_=o.caseSensitive,l=void 0!==_&&_,s=o.tokenSeparator,f=void 0===s?/ +/g:s,g=o.findAllMatches,u=void 0!==g&&g,h=o.minMatchCharLength,y=void 0===h?1:h,j=o.id,p=void 0===j?null:j,b=o.keys,v=void 0===b?[]:b,k=o.shouldSort,w=void 0===k||k,x=o.getFn,S=void 0===x?H:x,q=o.sortFn,E=void 0===q?function(e,o){return e.score-o.score}:q,C=o.tokenize,L=void 0!==C&&C,O=o.matchAllTokens,M=void 0!==O&&O,z=o.includeMatches,T=void 0!==z&&z,P=o.includeScore,A=void 0!==P&&P,I=o.verbose,B=void 0!==I&&I;!function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,R),this.options={location:r,distance:n,threshold:i,maxPatternLength:t,isCaseSensitive:l,tokenSeparator:f,findAllMatches:u,minMatchCharLength:y,id:p,keys:v,includeMatches:T,includeScore:A,shouldSort:w,getFn:S,sortFn:E,verbose:B,tokenize:L,matchAllTokens:M},this.setCollection(e)}var e,o,a;return e=R,(o=[{key:"setCollection",value:function(e){return this.list=e}},{key:"search",value:function(e){var o=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{limit:!1};this._log('---------\nSearch pattern: "'.concat(e,'"'));var a=this._prepareSearchers(e),r=a.tokenSearchers,c=a.fullSearcher,n=this._search(r,c),d=n.weights,i=n.results;return this._computeScore(d,i),this.options.shouldSort&&this._sort(i),o.limit&&"number"==typeof o.limit&&(i=i.slice(0,o.limit)),this._format(i)}},{key:"_prepareSearchers",value:function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",o=[];if(this.options.tokenize)for(var a=e.split(this.options.tokenSeparator),r=0,c=a.length;r<c;r+=1)o.push(new n(a[r],this.options));return{tokenSearchers:o,fullSearcher:new n(e,this.options)}}},{key:"_search",value:function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[],o=1<arguments.length?arguments[1]:void 0,a=this.list,r={},c=[];if("string"==typeof a[0]){for(var n=0,d=a.length;n<d;n+=1)this._analyze({key:"",value:a[n],record:n,index:n},{resultMap:r,results:c,tokenSearchers:e,fullSearcher:o});return{weights:null,results:c}}for(var i={},m=0,t=a.length;m<t;m+=1)for(var _=a[m],l=0,s=this.options.keys.length;l<s;l+=1){var f=this.options.keys[l];if("string"!=typeof f){if(i[f.name]={weight:1-f.weight||1},f.weight<=0||1<f.weight)throw new Error("Key weight has to be > 0 and <= 1");f=f.name}else i[f]={weight:1};this._analyze({key:f,value:this.options.getFn(_,f),record:_,index:m},{resultMap:r,results:c,tokenSearchers:e,fullSearcher:o})}return{weights:i,results:c}}},{key:"_analyze",value:function(e,o){var a=e.key,r=e.arrayIndex,c=void 0===r?-1:r,n=e.value,d=e.record,i=e.index,m=o.tokenSearchers,t=void 0===m?[]:m,_=o.fullSearcher,l=void 0===_?[]:_,s=o.resultMap,f=void 0===s?{}:s,g=o.results,u=void 0===g?[]:g;if(null!=n){var h=!1,y=-1,j=0;if("string"==typeof n){this._log("\nKey: ".concat(""===a?"-":a));var p=l.search(n);if(this._log('Full text: "'.concat(n,'", score: ').concat(p.score)),this.options.tokenize){for(var b=n.split(this.options.tokenSeparator),v=[],k=0;k<t.length;k+=1){var w=t[k];this._log('\nPattern: "'.concat(w.pattern,'"'));for(var x=!1,S=0;S<b.length;S+=1){var q=b[S],E=w.search(q),C={};E.isMatch?(C[q]=E.score,x=h=!0,v.push(E.score)):(C[q]=1,this.options.matchAllTokens||v.push(1)),this._log('Token: "'.concat(q,'", score: ').concat(C[q]))}x&&(j+=1)}y=v[0];for(var L=v.length,O=1;O<L;O+=1)y+=v[O];y/=L,this._log("Token score average:",y)}var M=p.score;-1<y&&(M=(M+y)/2),this._log("Score average:",M);var z=!this.options.tokenize||!this.options.matchAllTokens||j>=t.length;if(this._log("\nCheck Matches: ".concat(z)),(h||p.isMatch)&&z){var T=f[i];T?T.output.push({key:a,arrayIndex:c,value:n,score:M,matchedIndices:p.matchedIndices}):(f[i]={item:d,output:[{key:a,arrayIndex:c,value:n,score:M,matchedIndices:p.matchedIndices}]},u.push(f[i]))}}else if(I(n))for(var P=0,A=n.length;P<A;P+=1)this._analyze({key:a,arrayIndex:P,value:n[P],record:d,index:i},{resultMap:f,results:u,tokenSearchers:t,fullSearcher:l})}}},{key:"_computeScore",value:function(e,o){this._log("\n\nComputing score:\n");for(var a=0,r=o.length;a<r;a+=1){for(var c=o[a].output,n=c.length,d=1,i=1,m=0;m<n;m+=1){var t=e?e[c[m].key].weight:1,_=(1===t?c[m].score:c[m].score||.001)*t;1!==t?i=Math.min(i,_):d*=c[m].nScore=_}o[a].score=1===i?d:i,this._log(o[a])}}},{key:"_sort",value:function(e){this._log("\n\nSorting...."),e.sort(this.options.sortFn)}},{key:"_format",value:function(e){var o=[];if(this.options.verbose){var a=[];this._log("\n\nOutput:\n\n",JSON.stringify(e,function(e,o){if("object"===_(o)&&null!==o){if(-1!==a.indexOf(o))return;a.push(o)}return o})),a=null}var r=[];this.options.includeMatches&&r.push(function(e,o){var a=e.output;o.matches=[];for(var r=0,c=a.length;r<c;r+=1){var n=a[r];if(0!==n.matchedIndices.length){var d={indices:n.matchedIndices,value:n.value};n.key&&(d.key=n.key),n.hasOwnProperty("arrayIndex")&&-1<n.arrayIndex&&(d.arrayIndex=n.arrayIndex),o.matches.push(d)}}}),this.options.includeScore&&r.push(function(e,o){o.score=e.score});for(var c=0,n=e.length;c<n;c+=1){var d=e[c];if(this.options.id&&(d.item=this.options.getFn(d.item,this.options.id)[0]),r.length){for(var i={item:d.item},m=0,t=r.length;m<t;m+=1)r[m](d,i);o.push(i)}else o.push(d.item)}return o}},{key:"_log",value:function(){var e;this.options.verbose&&(e=console).log.apply(e,arguments)}}])&&r(e.prototype,o),a&&r(e,a),R}();e.exports=c}})},e.exports=r()},function(e,o,a){},function(e,o,a){"use strict";a.r(o);var r=a(0),m=a.n(r),c=[{name:"100",unicode:"1f4af",shortname:":100:",code_decimal:"&#128175;",category:"s",emoji_order:"2119"},{name:"1234",unicode:"1f522",shortname:":1234:",code_decimal:"&#128290;",category:"s",emoji_order:"2122"},{name:"grinning",unicode:"1f600",shortname:":grinning:",code_decimal:"&#128512;",category:"p",emoji_order:"1"},{name:"grin",unicode:"1f601",shortname:":grin:",code_decimal:"&#128513;",category:"p",emoji_order:"2"},{name:"joy",unicode:"1f602",shortname:":joy:",code_decimal:"&#128514;",category:"p",emoji_order:"3"},{name:"smiley",unicode:"1f603",shortname:":smiley:",code_decimal:"&#128515;",category:"p",emoji_order:"5"},{name:"smile",unicode:"1f604",shortname:":smile:",code_decimal:"&#128516;",category:"p",emoji_order:"6"},{name:"sweat_smile",unicode:"1f605",shortname:":sweat_smile:",code_decimal:"&#128517;",category:"p",emoji_order:"7"},{name:"laughing",unicode:"1f606",shortname:":laughing:",code_decimal:"&#128518;",category:"p",emoji_order:"8"},{name:"wink",unicode:"1f609",shortname:":wink:",code_decimal:"&#128521;",category:"p",emoji_order:"9"},{name:"blush",unicode:"1f60a",shortname:":blush:",code_decimal:"&#128522;",category:"p",emoji_order:"10"},{name:"yum",unicode:"1f60b",shortname:":yum:",code_decimal:"&#128523;",category:"p",emoji_order:"11"},{name:"sunglasses",unicode:"1f60e",shortname:":sunglasses:",code_decimal:"&#128526;",category:"p",emoji_order:"12"},{name:"heart_eyes",unicode:"1f60d",shortname:":heart_eyes:",code_decimal:"&#128525;",category:"p",emoji_order:"13"},{name:"kissing_heart",unicode:"1f618",shortname:":kissing_heart:",code_decimal:"&#128536;",category:"p",emoji_order:"14"},{name:"kissing",unicode:"1f617",shortname:":kissing:",code_decimal:"&#128535;",category:"p",emoji_order:"15"},{name:"kissing_smiling_eyes",unicode:"1f619",shortname:":kissing_smiling_eyes:",code_decimal:"&#128537;",category:"p",emoji_order:"16"},{name:"kissing_closed_eyes",unicode:"1f61a",shortname:":kissing_closed_eyes:",code_decimal:"&#128538;",category:"p",emoji_order:"17"},{name:"slightly_smiling_face",unicode:"1f642",shortname:":slight_smile:",code_decimal:"&#128578;",category:"p",emoji_order:"19"},{name:"hugging_face",unicode:"1f917",shortname:":hugging:",code_decimal:"&#129303;",category:"p",emoji_order:"20"},{name:"thinking_face",unicode:"1f914",shortname:":thinking:",code_decimal:"&#129300;",category:"p",emoji_order:"21"},{name:"neutral_face",unicode:"1f610",shortname:":neutral_face:",code_decimal:"&#128528;",category:"p",emoji_order:"22"},{name:"expressionless",unicode:"1f611",shortname:":expressionless:",code_decimal:"&#128529;",category:"p",emoji_order:"23"},{name:"no_mouth",unicode:"1f636",shortname:":no_mouth:",code_decimal:"&#128566;",category:"p",emoji_order:"24"},{name:"face_with_rolling_eyes",unicode:"1f644",shortname:":rolling_eyes:",code_decimal:"&#128580;",category:"p",emoji_order:"25"},{name:"smirk",unicode:"1f60f",shortname:":smirk:",code_decimal:"&#128527;",category:"p",emoji_order:"26"},{name:"persevere",unicode:"1f623",shortname:":persevere:",code_decimal:"&#128547;",category:"p",emoji_order:"27"},{name:"disappointed_relieved",unicode:"1f625",shortname:":disappointed_relieved:",code_decimal:"&#128549;",category:"p",emoji_order:"28"},{name:"open_mouth",unicode:"1f62e",shortname:":open_mouth:",code_decimal:"&#128558;",category:"p",emoji_order:"29"},{name:"zipper_mouth_face",unicode:"1f910",shortname:":zipper_mouth:",code_decimal:"&#129296;",category:"p",emoji_order:"30"},{name:"hushed",unicode:"1f62f",shortname:":hushed:",code_decimal:"&#128559;",category:"p",emoji_order:"31"},{name:"sleepy",unicode:"1f62a",shortname:":sleepy:",code_decimal:"&#128554;",category:"p",emoji_order:"32"},{name:"tired_face",unicode:"1f62b",shortname:":tired_face:",code_decimal:"&#128555;",category:"p",emoji_order:"33"},{name:"sleeping",unicode:"1f634",shortname:":sleeping:",code_decimal:"&#128564;",category:"p",emoji_order:"34"},{name:"relieved",unicode:"1f60c",shortname:":relieved:",code_decimal:"&#128524;",category:"p",emoji_order:"35"},{name:"nerd_face",unicode:"1f913",shortname:":nerd:",code_decimal:"&#129299;",category:"p",emoji_order:"36"},{name:"stuck_out_tongue",unicode:"1f61b",shortname:":stuck_out_tongue:",code_decimal:"&#128539;",category:"p",emoji_order:"37"},{name:"stuck_out_tongue_winking_eye",unicode:"1f61c",shortname:":stuck_out_tongue_winking_eye:",code_decimal:"&#128540;",category:"p",emoji_order:"38"},{name:"stuck_out_tongue_closed_eyes",unicode:"1f61d",shortname:":stuck_out_tongue_closed_eyes:",code_decimal:"&#128541;",category:"p",emoji_order:"39"},{name:"unamused",unicode:"1f612",shortname:":unamused:",code_decimal:"&#128530;",category:"p",emoji_order:"41"},{name:"sweat",unicode:"1f613",shortname:":sweat:",code_decimal:"&#128531;",category:"p",emoji_order:"42"},{name:"pensive",unicode:"1f614",shortname:":pensive:",code_decimal:"&#128532;",category:"p",emoji_order:"43"},{name:"confused",unicode:"1f615",shortname:":confused:",code_decimal:"&#128533;",category:"p",emoji_order:"44"},{name:"upside_down_face",unicode:"1f643",shortname:":upside_down:",code_decimal:"&#128579;",category:"p",emoji_order:"45"},{name:"money_mouth_face",unicode:"1f911",shortname:":money_mouth:",code_decimal:"&#129297;",category:"p",emoji_order:"46"},{name:"astonished",unicode:"1f632",shortname:":astonished:",code_decimal:"&#128562;",category:"p",emoji_order:"47"},{name:"slightly_frowning_face",unicode:"1f641",shortname:":slight_frown:",code_decimal:"&#128577;",category:"p",emoji_order:"49"},{name:"confounded",unicode:"1f616",shortname:":confounded:",code_decimal:"&#128534;",category:"p",emoji_order:"50"},{name:"disappointed",unicode:"1f61e",shortname:":disappointed:",code_decimal:"&#128542;",category:"p",emoji_order:"51"},{name:"worried",unicode:"1f61f",shortname:":worried:",code_decimal:"&#128543;",category:"p",emoji_order:"52"},{name:"triumph",unicode:"1f624",shortname:":triumph:",code_decimal:"&#128548;",category:"p",emoji_order:"53"},{name:"cry",unicode:"1f622",shortname:":cry:",code_decimal:"&#128546;",category:"p",emoji_order:"54"},{name:"sob",unicode:"1f62d",shortname:":sob:",code_decimal:"&#128557;",category:"p",emoji_order:"55"},{name:"frowning",unicode:"1f626",shortname:":frowning:",code_decimal:"&#128550;",category:"p",emoji_order:"56"},{name:"anguished",unicode:"1f627",shortname:":anguished:",code_decimal:"&#128551;",category:"p",emoji_order:"57"},{name:"fearful",unicode:"1f628",shortname:":fearful:",code_decimal:"&#128552;",category:"p",emoji_order:"58"},{name:"weary",unicode:"1f629",shortname:":weary:",code_decimal:"&#128553;",category:"p",emoji_order:"59"},{name:"grimacing",unicode:"1f62c",shortname:":grimacing:",code_decimal:"&#128556;",category:"p",emoji_order:"60"},{name:"cold_sweat",unicode:"1f630",shortname:":cold_sweat:",code_decimal:"&#128560;",category:"p",emoji_order:"61"},{name:"scream",unicode:"1f631",shortname:":scream:",code_decimal:"&#128561;",category:"p",emoji_order:"62"},{name:"flushed",unicode:"1f633",shortname:":flushed:",code_decimal:"&#128563;",category:"p",emoji_order:"63"},{name:"dizzy_face",unicode:"1f635",shortname:":dizzy_face:",code_decimal:"&#128565;",category:"p",emoji_order:"64"},{name:"rage",unicode:"1f621",shortname:":rage:",code_decimal:"&#128545;",category:"p",emoji_order:"65"},{name:"angry",unicode:"1f620",shortname:":angry:",code_decimal:"&#128544;",category:"p",emoji_order:"66"},{name:"innocent",unicode:"1f607",shortname:":innocent:",code_decimal:"&#128519;",category:"p",emoji_order:"67"},{name:"mask",unicode:"1f637",shortname:":mask:",code_decimal:"&#128567;",category:"p",emoji_order:"71"},{name:"face_with_thermometer",unicode:"1f912",shortname:":thermometer_face:",code_decimal:"&#129298;",category:"p",emoji_order:"72"},{name:"face_with_head_bandage",unicode:"1f915",shortname:":head_bandage:",code_decimal:"&#129301;",category:"p",emoji_order:"73"},{name:"smiling_imp",unicode:"1f608",shortname:":smiling_imp:",code_decimal:"&#128520;",category:"p",emoji_order:"76"},{name:"imp",unicode:"1f47f",shortname:":imp:",code_decimal:"&#128127;",category:"p",emoji_order:"77"},{name:"japanese_ogre",unicode:"1f479",shortname:":japanese_ogre:",code_decimal:"&#128121;",category:"p",emoji_order:"78"},{name:"japanese_goblin",unicode:"1f47a",shortname:":japanese_goblin:",code_decimal:"&#128122;",category:"p",emoji_order:"79"},{name:"skull",unicode:"1f480",shortname:":skull:",code_decimal:"&#128128;",category:"p",emoji_order:"80"},{name:"skull_and_crossbones",unicode:"2620",shortname:":skull_crossbones:",code_decimal:"&#9760;",category:"o",emoji_order:"81"},{name:"ghost",unicode:"1f47b",shortname:":ghost:",code_decimal:"&#128123;",category:"p",emoji_order:"82"},{name:"alien",unicode:"1f47d",shortname:":alien:",code_decimal:"&#128125;",category:"p",emoji_order:"83"},{name:"space_invader",unicode:"1f47e",shortname:":space_invader:",code_decimal:"&#128126;",category:"a",emoji_order:"84"},{name:"robot_face",unicode:"1f916",shortname:":robot:",code_decimal:"&#129302;",category:"p",emoji_order:"85"},{name:"hankey",unicode:"1f4a9",shortname:":poop:",code_decimal:"&#128169;",category:"p",emoji_order:"86"},{name:"smiley_cat",unicode:"1f63a",shortname:":smiley_cat:",code_decimal:"&#128570;",category:"p",emoji_order:"87"},{name:"smile_cat",unicode:"1f638",shortname:":smile_cat:",code_decimal:"&#128568;",category:"p",emoji_order:"88"},{name:"joy_cat",unicode:"1f639",shortname:":joy_cat:",code_decimal:"&#128569;",category:"p",emoji_order:"89"},{name:"heart_eyes_cat",unicode:"1f63b",shortname:":heart_eyes_cat:",code_decimal:"&#128571;",category:"p",emoji_order:"90"},{name:"smirk_cat",unicode:"1f63c",shortname:":smirk_cat:",code_decimal:"&#128572;",category:"p",emoji_order:"91"},{name:"kissing_cat",unicode:"1f63d",shortname:":kissing_cat:",code_decimal:"&#128573;",category:"p",emoji_order:"92"},{name:"scream_cat",unicode:"1f640",shortname:":scream_cat:",code_decimal:"&#128576;",category:"p",emoji_order:"93"},{name:"crying_cat_face",unicode:"1f63f",shortname:":crying_cat_face:",code_decimal:"&#128575;",category:"p",emoji_order:"94"},{name:"pouting_cat",unicode:"1f63e",shortname:":pouting_cat:",code_decimal:"&#128574;",category:"p",emoji_order:"95"},{name:"see_no_evil",unicode:"1f648",shortname:":see_no_evil:",code_decimal:"&#128584;",category:"n",emoji_order:"96"},{name:"hear_no_evil",unicode:"1f649",shortname:":hear_no_evil:",code_decimal:"&#128585;",category:"n",emoji_order:"97"},{name:"speak_no_evil",unicode:"1f64a",shortname:":speak_no_evil:",code_decimal:"&#128586;",category:"n",emoji_order:"98"},{name:"boy",unicode:"1f466",shortname:":boy:",code_decimal:"&#128102;",category:"p",emoji_order:"99"},{name:"girl",unicode:"1f467",shortname:":girl:",code_decimal:"&#128103;",category:"p",emoji_order:"105"},{name:"man",unicode:"1f468",shortname:":man:",code_decimal:"&#128104;",category:"p",emoji_order:"111"},{name:"woman",unicode:"1f469",shortname:":woman:",code_decimal:"&#128105;",category:"p",emoji_order:"117"},{name:"older_man",unicode:"1f474",shortname:":older_man:",code_decimal:"&#128116;",category:"p",emoji_order:"123"},{name:"older_woman",unicode:"1f475",shortname:":older_woman:",code_decimal:"&#128117;",category:"p",emoji_order:"129"},{name:"baby",unicode:"1f476",shortname:":baby:",code_decimal:"&#128118;",category:"p",emoji_order:"135"},{name:"angel",unicode:"1f47c",shortname:":angel:",code_decimal:"&#128124;",category:"p",emoji_order:"141"},{name:"cop",unicode:"1f46e",shortname:":cop:",code_decimal:"&#128110;",category:"p",emoji_order:"339"},{name:"sleuth_or_spy",unicode:"1f575",shortname:":spy:",code_decimal:"&#128373;",category:"p",emoji_order:"357"},{name:"guardsman",unicode:"1f482",shortname:":guardsman:",code_decimal:"&#128130;",category:"p",emoji_order:"375"},{name:"construction_worker",unicode:"1f477",shortname:":construction_worker:",code_decimal:"&#128119;",category:"p",emoji_order:"393"},{name:"man_with_turban",unicode:"1f473",shortname:":man_with_turban:",code_decimal:"&#128115;",category:"p",emoji_order:"411"},{name:"person_with_blond_hair",unicode:"1f471",shortname:":person_with_blond_hair:",code_decimal:"&#128113;",category:"p",emoji_order:"429"},{name:"santa",unicode:"1f385",shortname:":santa:",code_decimal:"&#127877;",category:"p",emoji_order:"447"},{name:"princess",unicode:"1f478",shortname:":princess:",code_decimal:"&#128120;",category:"p",emoji_order:"459"},{name:"bride_with_veil",unicode:"1f470",shortname:":bride_with_veil:",code_decimal:"&#128112;",category:"p",emoji_order:"471"},{name:"man_with_gua_pi_mao",unicode:"1f472",shortname:":man_with_gua_pi_mao:",code_decimal:"&#128114;",category:"p",emoji_order:"489"},{name:"person_frowning",unicode:"1f64d",shortname:":person_frowning:",code_decimal:"&#128589;",category:"p",emoji_order:"495"},{name:"person_with_pouting_face",unicode:"1f64e",shortname:":person_with_pouting_face:",code_decimal:"&#128590;",category:"p",emoji_order:"513"},{name:"no_good",unicode:"1f645",shortname:":no_good:",code_decimal:"&#128581;",category:"p",emoji_order:"531"},{name:"ok_woman",unicode:"1f646",shortname:":ok_woman:",code_decimal:"&#128582;",category:"p",emoji_order:"549"},{name:"information_desk_person",unicode:"1f481",shortname:":information_desk_person:",code_decimal:"&#128129;",category:"p",emoji_order:"567"},{name:"raising_hand",unicode:"1f64b",shortname:":raising_hand:",code_decimal:"&#128587;",category:"p",emoji_order:"585"},{name:"bow",unicode:"1f647",shortname:":bow:",code_decimal:"&#128583;",category:"p",emoji_order:"603"},{name:"massage",unicode:"1f486",shortname:":massage:",code_decimal:"&#128134;",category:"p",emoji_order:"657"},{name:"haircut",unicode:"1f487",shortname:":haircut:",code_decimal:"&#128135;",category:"p",emoji_order:"675"},{name:"walking",unicode:"1f6b6",shortname:":walking:",code_decimal:"&#128694;",category:"p",emoji_order:"693"},{name:"runner",unicode:"1f3c3",shortname:":runner:",code_decimal:"&#127939;",category:"p",emoji_order:"711"},{name:"dancer",unicode:"1f483",shortname:":dancer:",code_decimal:"&#128131;",category:"p",emoji_order:"729"},{name:"dancers",unicode:"1f46f",shortname:":dancers:",code_decimal:"&#128111;",category:"p",emoji_order:"741"},{name:"man_in_business_suit_levitating",unicode:"1f574",shortname:":levitate:",code_decimal:"&#128372;",category:"a",emoji_order:"759"},{name:"speaking_head_in_silhouette",unicode:"1f5e3",shortname:":speaking_head:",code_decimal:"&#128483;",category:"p",emoji_order:"765"},{name:"bust_in_silhouette",unicode:"1f464",shortname:":bust_in_silhouette:",code_decimal:"&#128100;",category:"p",emoji_order:"766"},{name:"busts_in_silhouette",unicode:"1f465",shortname:":busts_in_silhouette:",code_decimal:"&#128101;",category:"p",emoji_order:"767"},{name:"horse_racing",unicode:"1f3c7",shortname:":horse_racing:",code_decimal:"&#127943;",category:"a",emoji_order:"769"},{name:"skier",unicode:"26f7",shortname:":skier:",code_decimal:"&#9975;",category:"a",emoji_order:"775"},{name:"snowboarder",unicode:"1f3c2",shortname:":snowboarder:",code_decimal:"&#127938;",category:"a",emoji_order:"776"},{name:"golfer",unicode:"1f3cc",shortname:":golfer:",code_decimal:"&#127948;",category:"a",emoji_order:"782"},{name:"surfer",unicode:"1f3c4",shortname:":surfer:",code_decimal:"&#127940;",category:"a",emoji_order:"800"},{name:"rowboat",unicode:"1f6a3",shortname:":rowboat:",code_decimal:"&#128675;",category:"a",emoji_order:"818"},{name:"swimmer",unicode:"1f3ca",shortname:":swimmer:",code_decimal:"&#127946;",category:"a",emoji_order:"836"},{name:"person_with_ball",unicode:"26f9",shortname:":basketball_player:",code_decimal:"&#9977;",category:"a",emoji_order:"854"},{name:"weight_lifter",unicode:"1f3cb",shortname:":lifter:",code_decimal:"&#127947;",category:"a",emoji_order:"872"},{name:"bicyclist",unicode:"1f6b4",shortname:":bicyclist:",code_decimal:"&#128692;",category:"a",emoji_order:"890"},{name:"mountain_bicyclist",unicode:"1f6b5",shortname:":mountain_bicyclist:",code_decimal:"&#128693;",category:"a",emoji_order:"908"},{name:"racing_car",unicode:"1f3ce",shortname:":race_car:",code_decimal:"&#127950;",category:"t",emoji_order:"926"},{name:"racing_motorcycle",unicode:"1f3cd",shortname:":motorcycle:",code_decimal:"&#127949;",category:"t",emoji_order:"927"},{name:"couple",unicode:"1f46b",shortname:":couple:",code_decimal:"&#128107;",category:"p",emoji_order:"1018"},{name:"two_men_holding_hands",unicode:"1f46c",shortname:":two_men_holding_hands:",code_decimal:"&#128108;",category:"p",emoji_order:"1024"},{name:"two_women_holding_hands",unicode:"1f46d",shortname:":two_women_holding_hands:",code_decimal:"&#128109;",category:"p",emoji_order:"1030"},{name:"couplekiss",unicode:"1f48f",shortname:":couplekiss:",code_decimal:"&#128143;",category:"p",emoji_order:"1036"},{name:"couple_with_heart",unicode:"1f491",shortname:":couple_with_heart:",code_decimal:"&#128145;",category:"p",emoji_order:"1040"},{name:"family",unicode:"1f46a",shortname:":family:",code_decimal:"&#128106;",category:"p",emoji_order:"1044"},{name:"muscle",unicode:"1f4aa",shortname:":muscle:",code_decimal:"&#128170;",category:"p",emoji_order:"1080"},{name:"point_left",unicode:"1f448",shortname:":point_left:",code_decimal:"&#128072;",category:"p",emoji_order:"1092"},{name:"point_right",unicode:"1f449",shortname:":point_right:",code_decimal:"&#128073;",category:"p",emoji_order:"1098"},{name:"point_up",unicode:"261d",shortname:":point_up:",code_decimal:"&#9757;",category:"p",emoji_order:"1104"},{name:"point_up_2",unicode:"1f446",shortname:":point_up_2:",code_decimal:"&#128070;",category:"p",emoji_order:"1110"},{name:"middle_finger",unicode:"1f595",shortname:":middle_finger:",code_decimal:"&#128405;",category:"p",emoji_order:"1116"},{name:"point_down",unicode:"1f447",shortname:":point_down:",code_decimal:"&#128071;",category:"p",emoji_order:"1122"},{name:"v",unicode:"270c",shortname:":v:",code_decimal:"&#9996;",category:"p",emoji_order:"1128"},{name:"the_horns",unicode:"1f918",shortname:":metal_tone2:",code_decimal:"&#129304;",category:"p",emoji_order:"1146"},{name:"raised_hand_with_fingers_splayed",unicode:"1f590",shortname:":hand_splayed:",code_decimal:"&#128400;",category:"p",emoji_order:"1158"},{name:"ok_hand",unicode:"1f44c",shortname:":ok_hand:",code_decimal:"&#128076;",category:"p",emoji_order:"1170"},{name:"thumbsup",unicode:"1f44d",shortname:":thumbsup:",code_decimal:"&#128077;",category:"p",emoji_order:"1176"},{name:"thumbsdown",unicode:"1f44e",shortname:":thumbsdown:",code_decimal:"&#128078;",category:"p",emoji_order:"1182"},{name:"fist",unicode:"270a",shortname:":fist:",code_decimal:"&#9994;",category:"p",emoji_order:"1188"},{name:"facepunch",unicode:"1f44a",shortname:":punch:",code_decimal:"&#128074;",category:"p",emoji_order:"1194"},{name:"wave",unicode:"1f44b",shortname:":wave:",code_decimal:"&#128075;",category:"p",emoji_order:"1218"},{name:"clap",unicode:"1f44f",shortname:":clap:",code_decimal:"&#128079;",category:"p",emoji_order:"1224"},{name:"writing_hand",unicode:"270d",shortname:":writing_hand:",code_decimal:"&#9997;",category:"p",emoji_order:"1230"},{name:"open_hands",unicode:"1f450",shortname:":open_hands:",code_decimal:"&#128080;",category:"p",emoji_order:"1236"},{name:"raised_hands",unicode:"1f64c",shortname:":raised_hands:",code_decimal:"&#128588;",category:"p",emoji_order:"1242"},{name:"pray",unicode:"1f64f",shortname:":pray:",code_decimal:"&#128591;",category:"p",emoji_order:"1248"},{name:"nail_care",unicode:"1f485",shortname:":nail_care:",code_decimal:"&#128133;",category:"p",emoji_order:"1260"},{name:"ear",unicode:"1f442",shortname:":ear:",code_decimal:"&#128066;",category:"p",emoji_order:"1266"},{name:"nose",unicode:"1f443",shortname:":nose:",code_decimal:"&#128067;",category:"p",emoji_order:"1272"},{name:"footprints",unicode:"1f463",shortname:":footprints:",code_decimal:"&#128099;",category:"p",emoji_order:"1278"},{name:"eyes",unicode:"1f440",shortname:":eyes:",code_decimal:"&#128064;",category:"p",emoji_order:"1279"},{name:"eye",unicode:"1f441",shortname:":eye:",code_decimal:"&#128065;",category:"p",emoji_order:"1280"},{name:"tongue",unicode:"1f445",shortname:":tongue:",code_decimal:"&#128069;",category:"p",emoji_order:"1282"},{name:"lips",unicode:"1f444",shortname:":lips:",code_decimal:"&#128068;",category:"p",emoji_order:"1283"},{name:"kiss",unicode:"1f48b",shortname:":kiss:",code_decimal:"&#128139;",category:"p",emoji_order:"1284"},{name:"cupid",unicode:"1f498",shortname:":cupid:",code_decimal:"&#128152;",category:"s",emoji_order:"1285"},{name:"heart",unicode:"2764",shortname:":heart:",code_decimal:"&#10084;",category:"s",emoji_order:"1286"},{name:"heartbeat",unicode:"1f493",shortname:":heartbeat:",code_decimal:"&#128147;",category:"s",emoji_order:"1287"},{name:"broken_heart",unicode:"1f494",shortname:":broken_heart:",code_decimal:"&#128148;",category:"s",emoji_order:"1288"},{name:"two_hearts",unicode:"1f495",shortname:":two_hearts:",code_decimal:"&#128149;",category:"s",emoji_order:"1289"},{name:"sparkling_heart",unicode:"1f496",shortname:":sparkling_heart:",code_decimal:"&#128150;",category:"s",emoji_order:"1290"},{name:"heartpulse",unicode:"1f497",shortname:":heartpulse:",code_decimal:"&#128151;",category:"s",emoji_order:"1291"},{name:"blue_heart",unicode:"1f499",shortname:":blue_heart:",code_decimal:"&#128153;",category:"s",emoji_order:"1292"},{name:"green_heart",unicode:"1f49a",shortname:":green_heart:",code_decimal:"&#128154;",category:"s",emoji_order:"1293"},{name:"yellow_heart",unicode:"1f49b",shortname:":yellow_heart:",code_decimal:"&#128155;",category:"s",emoji_order:"1294"},{name:"purple_heart",unicode:"1f49c",shortname:":purple_heart:",code_decimal:"&#128156;",category:"s",emoji_order:"1295"},{name:"gift_heart",unicode:"1f49d",shortname:":gift_heart:",code_decimal:"&#128157;",category:"s",emoji_order:"1297"},{name:"revolving_hearts",unicode:"1f49e",shortname:":revolving_hearts:",code_decimal:"&#128158;",category:"s",emoji_order:"1298"},{name:"heart_decoration",unicode:"1f49f",shortname:":heart_decoration:",code_decimal:"&#128159;",category:"s",emoji_order:"1299"},{name:"heart_exclamation",unicode:"2763",shortname:":heart_exclamation:",code_decimal:"&#10083;",category:"s",emoji_order:"1300"},{name:"love_letter",unicode:"1f48c",shortname:":love_letter:",code_decimal:"&#128140;",category:"o",emoji_order:"1301"},{name:"zzz",unicode:"1f4a4",shortname:":zzz:",code_decimal:"&#128164;",category:"p",emoji_order:"1302"},{name:"anger",unicode:"1f4a2",shortname:":anger:",code_decimal:"&#128162;",category:"s",emoji_order:"1303"},{name:"bomb",unicode:"1f4a3",shortname:":bomb:",code_decimal:"&#128163;",category:"o",emoji_order:"1304"},{name:"boom",unicode:"1f4a5",shortname:":boom:",code_decimal:"&#128165;",category:"s",emoji_order:"1305"},{name:"sweat_drops",unicode:"1f4a6",shortname:":sweat_drops:",code_decimal:"&#128166;",category:"n",emoji_order:"1306"},{name:"dash",unicode:"1f4a8",shortname:":dash:",code_decimal:"&#128168;",category:"n",emoji_order:"1307"},{name:"dizzy",unicode:"1f4ab",shortname:":dizzy:",code_decimal:"&#128171;",category:"s",emoji_order:"1308"},{name:"speech_balloon",unicode:"1f4ac",shortname:":speech_balloon:",code_decimal:"&#128172;",category:"s",emoji_order:"1309"},{name:"left_speech_bubble",unicode:"1f5e8",shortname:":speech_left:",code_decimal:"&#128488;",category:"s",emoji_order:"1310"},{name:"right_anger_bubble",unicode:"1f5ef",shortname:":anger_right:",code_decimal:"&#128495;",category:"s",emoji_order:"1311"},{name:"thought_balloon",unicode:"1f4ad",shortname:":thought_balloon:",code_decimal:"&#128173;",category:"s",emoji_order:"1312"},{name:"hole",unicode:"1f573",shortname:":hole:",code_decimal:"&#128371;",category:"o",emoji_order:"1313"},{name:"eyeglasses",unicode:"1f453",shortname:":eyeglasses:",code_decimal:"&#128083;",category:"p",emoji_order:"1314"},{name:"dark_sunglasses",unicode:"1f576",shortname:":dark_sunglasses:",code_decimal:"&#128374;",category:"p",emoji_order:"1315"},{name:"necktie",unicode:"1f454",shortname:":necktie:",code_decimal:"&#128084;",category:"p",emoji_order:"1316"},{name:"shirt",unicode:"1f455",shortname:":shirt:",code_decimal:"&#128085;",category:"p",emoji_order:"1317"},{name:"jeans",unicode:"1f456",shortname:":jeans:",code_decimal:"&#128086;",category:"p",emoji_order:"1318"},{name:"dress",unicode:"1f457",shortname:":dress:",code_decimal:"&#128087;",category:"p",emoji_order:"1319"},{name:"kimono",unicode:"1f458",shortname:":kimono:",code_decimal:"&#128088;",category:"p",emoji_order:"1320"},{name:"bikini",unicode:"1f459",shortname:":bikini:",code_decimal:"&#128089;",category:"p",emoji_order:"1321"},{name:"womans_clothes",unicode:"1f45a",shortname:":womans_clothes:",code_decimal:"&#128090;",category:"p",emoji_order:"1322"},{name:"purse",unicode:"1f45b",shortname:":purse:",code_decimal:"&#128091;",category:"p",emoji_order:"1323"},{name:"handbag",unicode:"1f45c",shortname:":handbag:",code_decimal:"&#128092;",category:"p",emoji_order:"1324"},{name:"pouch",unicode:"1f45d",shortname:":pouch:",code_decimal:"&#128093;",category:"p",emoji_order:"1325"},{name:"shopping_bags",unicode:"1f6cd",shortname:":shopping_bags:",code_decimal:"&#128717;",category:"o",emoji_order:"1326"},{name:"school_satchel",unicode:"1f392",shortname:":school_satchel:",code_decimal:"&#127890;",category:"p",emoji_order:"1327"},{name:"mans_shoe",unicode:"1f45e",shortname:":mans_shoe:",code_decimal:"&#128094;",category:"p",emoji_order:"1328"},{name:"athletic_shoe",unicode:"1f45f",shortname:":athletic_shoe:",code_decimal:"&#128095;",category:"p",emoji_order:"1329"},{name:"high_heel",unicode:"1f460",shortname:":high_heel:",code_decimal:"&#128096;",category:"p",emoji_order:"1330"},{name:"sandal",unicode:"1f461",shortname:":sandal:",code_decimal:"&#128097;",category:"p",emoji_order:"1331"},{name:"boot",unicode:"1f462",shortname:":boot:",code_decimal:"&#128098;",category:"p",emoji_order:"1332"},{name:"crown",unicode:"1f451",shortname:":crown:",code_decimal:"&#128081;",category:"p",emoji_order:"1333"},{name:"womans_hat",unicode:"1f452",shortname:":womans_hat:",code_decimal:"&#128082;",category:"p",emoji_order:"1334"},{name:"tophat",unicode:"1f3a9",shortname:":tophat:",code_decimal:"&#127913;",category:"p",emoji_order:"1335"},{name:"mortar_board",unicode:"1f393",shortname:":mortar_board:",code_decimal:"&#127891;",category:"p",emoji_order:"1336"},{name:"helmet_with_white_cross",unicode:"26d1",shortname:":helmet_with_cross:",code_decimal:"&#9937;",category:"p",emoji_order:"1337"},{name:"prayer_beads",unicode:"1f4ff",shortname:":prayer_beads:",code_decimal:"&#128255;",category:"o",emoji_order:"1338"},{name:"lipstick",unicode:"1f484",shortname:":lipstick:",code_decimal:"&#128132;",category:"p",emoji_order:"1339"},{name:"ring",unicode:"1f48d",shortname:":ring:",code_decimal:"&#128141;",category:"p",emoji_order:"1340"},{name:"gem",unicode:"1f48e",shortname:":gem:",code_decimal:"&#128142;",category:"o",emoji_order:"1341"},{name:"monkey_face",unicode:"1f435",shortname:":monkey_face:",code_decimal:"&#128053;",category:"n",emoji_order:"1342"},{name:"monkey",unicode:"1f412",shortname:":monkey:",code_decimal:"&#128018;",category:"n",emoji_order:"1343"},{name:"dog",unicode:"1f436",shortname:":dog:",code_decimal:"&#128054;",category:"n",emoji_order:"1345"},{name:"dog2",unicode:"1f415",shortname:":dog2:",code_decimal:"&#128021;",category:"n",emoji_order:"1346"},{name:"poodle",unicode:"1f429",shortname:":poodle:",code_decimal:"&#128041;",category:"n",emoji_order:"1347"},{name:"wolf",unicode:"1f43a",shortname:":wolf:",code_decimal:"&#128058;",category:"n",emoji_order:"1348"},{name:"cat",unicode:"1f431",shortname:":cat:",code_decimal:"&#128049;",category:"n",emoji_order:"1350"},{name:"cat2",unicode:"1f408",shortname:":cat2:",code_decimal:"&#128008;",category:"n",emoji_order:"1351"},{name:"lion_face",unicode:"1f981",shortname:":lion_face:",code_decimal:"&#129409;",category:"n",emoji_order:"1352"},{name:"tiger",unicode:"1f42f",shortname:":tiger:",code_decimal:"&#128047;",category:"n",emoji_order:"1353"},{name:"tiger2",unicode:"1f405",shortname:":tiger2:",code_decimal:"&#128005;",category:"n",emoji_order:"1354"},{name:"leopard",unicode:"1f406",shortname:":leopard:",code_decimal:"&#128006;",category:"n",emoji_order:"1355"},{name:"horse",unicode:"1f434",shortname:":horse:",code_decimal:"&#128052;",category:"n",emoji_order:"1356"},{name:"racehorse",unicode:"1f40e",shortname:":racehorse:",code_decimal:"&#128014;",category:"n",emoji_order:"1357"},{name:"unicorn_face",unicode:"1f984",shortname:":unicorn:",code_decimal:"&#129412;",category:"n",emoji_order:"1359"},{name:"cow",unicode:"1f42e",shortname:":cow:",code_decimal:"&#128046;",category:"n",emoji_order:"1360"},{name:"ox",unicode:"1f402",shortname:":ox:",code_decimal:"&#128002;",category:"n",emoji_order:"1361"},{name:"water_buffalo",unicode:"1f403",shortname:":water_buffalo:",code_decimal:"&#128003;",category:"n",emoji_order:"1362"},{name:"cow2",unicode:"1f404",shortname:":cow2:",code_decimal:"&#128004;",category:"n",emoji_order:"1363"},{name:"pig",unicode:"1f437",shortname:":pig:",code_decimal:"&#128055;",category:"n",emoji_order:"1364"},{name:"pig2",unicode:"1f416",shortname:":pig2:",code_decimal:"&#128022;",category:"n",emoji_order:"1365"},{name:"boar",unicode:"1f417",shortname:":boar:",code_decimal:"&#128023;",category:"n",emoji_order:"1366"},{name:"pig_nose",unicode:"1f43d",shortname:":pig_nose:",code_decimal:"&#128061;",category:"n",emoji_order:"1367"},{name:"ram",unicode:"1f40f",shortname:":ram:",code_decimal:"&#128015;",category:"n",emoji_order:"1368"},{name:"sheep",unicode:"1f411",shortname:":sheep:",code_decimal:"&#128017;",category:"n",emoji_order:"1369"},{name:"goat",unicode:"1f410",shortname:":goat:",code_decimal:"&#128016;",category:"n",emoji_order:"1370"},{name:"dromedary_camel",unicode:"1f42a",shortname:":dromedary_camel:",code_decimal:"&#128042;",category:"n",emoji_order:"1371"},{name:"camel",unicode:"1f42b",shortname:":camel:",code_decimal:"&#128043;",category:"n",emoji_order:"1372"},{name:"elephant",unicode:"1f418",shortname:":elephant:",code_decimal:"&#128024;",category:"n",emoji_order:"1373"},{name:"mouse",unicode:"1f42d",shortname:":mouse:",code_decimal:"&#128045;",category:"n",emoji_order:"1375"},{name:"mouse2",unicode:"1f401",shortname:":mouse2:",code_decimal:"&#128001;",category:"n",emoji_order:"1376"},{name:"rat",unicode:"1f400",shortname:":rat:",code_decimal:"&#128000;",category:"n",emoji_order:"1377"},{name:"hamster",unicode:"1f439",shortname:":hamster:",code_decimal:"&#128057;",category:"n",emoji_order:"1378"},{name:"rabbit",unicode:"1f430",shortname:":rabbit:",code_decimal:"&#128048;",category:"n",emoji_order:"1379"},{name:"rabbit2",unicode:"1f407",shortname:":rabbit2:",code_decimal:"&#128007;",category:"n",emoji_order:"1380"},{name:"chipmunk",unicode:"1f43f",shortname:":chipmunk:",code_decimal:"&#128063;",category:"n",emoji_order:"1381"},{name:"bear",unicode:"1f43b",shortname:":bear:",code_decimal:"&#128059;",category:"n",emoji_order:"1383"},{name:"koala",unicode:"1f428",shortname:":koala:",code_decimal:"&#128040;",category:"n",emoji_order:"1384"},{name:"panda_face",unicode:"1f43c",shortname:":panda_face:",code_decimal:"&#128060;",category:"n",emoji_order:"1385"},{name:"feet",unicode:"1f43e",shortname:":feet:",code_decimal:"&#128062;",category:"n",emoji_order:"1386"},{name:"turkey",unicode:"1f983",shortname:":turkey:",code_decimal:"&#129411;",category:"n",emoji_order:"1387"},{name:"chicken",unicode:"1f414",shortname:":chicken:",code_decimal:"&#128020;",category:"n",emoji_order:"1388"},{name:"rooster",unicode:"1f413",shortname:":rooster:",code_decimal:"&#128019;",category:"n",emoji_order:"1389"},{name:"hatching_chick",unicode:"1f423",shortname:":hatching_chick:",code_decimal:"&#128035;",category:"n",emoji_order:"1390"},{name:"baby_chick",unicode:"1f424",shortname:":baby_chick:",code_decimal:"&#128036;",category:"n",emoji_order:"1391"},{name:"hatched_chick",unicode:"1f425",shortname:":hatched_chick:",code_decimal:"&#128037;",category:"n",emoji_order:"1392"},{name:"bird",unicode:"1f426",shortname:":bird:",code_decimal:"&#128038;",category:"n",emoji_order:"1393"},{name:"penguin",unicode:"1f427",shortname:":penguin:",code_decimal:"&#128039;",category:"n",emoji_order:"1394"},{name:"dove_of_peace",unicode:"1f54a",shortname:":dove:",code_decimal:"&#128330;",category:"n",emoji_order:"1395"},{name:"frog",unicode:"1f438",shortname:":frog:",code_decimal:"&#128056;",category:"n",emoji_order:"1399"},{name:"crocodile",unicode:"1f40a",shortname:":crocodile:",code_decimal:"&#128010;",category:"n",emoji_order:"1400"},{name:"turtle",unicode:"1f422",shortname:":turtle:",code_decimal:"&#128034;",category:"n",emoji_order:"1401"},{name:"snake",unicode:"1f40d",shortname:":snake:",code_decimal:"&#128013;",category:"n",emoji_order:"1403"},{name:"dragon_face",unicode:"1f432",shortname:":dragon_face:",code_decimal:"&#128050;",category:"n",emoji_order:"1404"},{name:"dragon",unicode:"1f409",shortname:":dragon:",code_decimal:"&#128009;",category:"n",emoji_order:"1405"},{name:"whale",unicode:"1f433",shortname:":whale:",code_decimal:"&#128051;",category:"n",emoji_order:"1406"},{name:"whale2",unicode:"1f40b",shortname:":whale2:",code_decimal:"&#128011;",category:"n",emoji_order:"1407"},{name:"dolphin",unicode:"1f42c",shortname:":dolphin:",code_decimal:"&#128044;",category:"n",emoji_order:"1408"},{name:"fish",unicode:"1f41f",shortname:":fish:",code_decimal:"&#128031;",category:"n",emoji_order:"1409"},{name:"tropical_fish",unicode:"1f420",shortname:":tropical_fish:",code_decimal:"&#128032;",category:"n",emoji_order:"1410"},{name:"blowfish",unicode:"1f421",shortname:":blowfish:",code_decimal:"&#128033;",category:"n",emoji_order:"1411"},{name:"octopus",unicode:"1f419",shortname:":octopus:",code_decimal:"&#128025;",category:"n",emoji_order:"1413"},{name:"shell",unicode:"1f41a",shortname:":shell:",code_decimal:"&#128026;",category:"n",emoji_order:"1414"},{name:"crab",unicode:"1f980",shortname:":crab:",code_decimal:"&#129408;",category:"n",emoji_order:"1415"},{name:"snail",unicode:"1f40c",shortname:":snail:",code_decimal:"&#128012;",category:"n",emoji_order:"1419"},{name:"bug",unicode:"1f41b",shortname:":bug:",code_decimal:"&#128027;",category:"n",emoji_order:"1420"},{name:"ant",unicode:"1f41c",shortname:":ant:",code_decimal:"&#128028;",category:"n",emoji_order:"1421"},{name:"bee",unicode:"1f41d",shortname:":bee:",code_decimal:"&#128029;",category:"n",emoji_order:"1422"},{name:"beetle",unicode:"1f41e",shortname:":beetle:",code_decimal:"&#128030;",category:"n",emoji_order:"1423"},{name:"spider",unicode:"1f577",shortname:":spider:",code_decimal:"&#128375;",category:"n",emoji_order:"1424"},{name:"spider_web",unicode:"1f578",shortname:":spider_web:",code_decimal:"&#128376;",category:"n",emoji_order:"1425"},{name:"scorpion",unicode:"1f982",shortname:":scorpion:",code_decimal:"&#129410;",category:"n",emoji_order:"1426"},{name:"bouquet",unicode:"1f490",shortname:":bouquet:",code_decimal:"&#128144;",category:"n",emoji_order:"1427"},{name:"cherry_blossom",unicode:"1f338",shortname:":cherry_blossom:",code_decimal:"&#127800;",category:"n",emoji_order:"1428"},{name:"white_flower",unicode:"1f4ae",shortname:":white_flower:",code_decimal:"&#128174;",category:"s",emoji_order:"1429"},{name:"rosette",unicode:"1f3f5",shortname:":rosette:",code_decimal:"&#127989;",category:"n",emoji_order:"1430"},{name:"rose",unicode:"1f339",shortname:":rose:",code_decimal:"&#127801;",category:"n",emoji_order:"1431"},{name:"hibiscus",unicode:"1f33a",shortname:":hibiscus:",code_decimal:"&#127802;",category:"n",emoji_order:"1433"},{name:"sunflower",unicode:"1f33b",shortname:":sunflower:",code_decimal:"&#127803;",category:"n",emoji_order:"1434"},{name:"blossom",unicode:"1f33c",shortname:":blossom:",code_decimal:"&#127804;",category:"n",emoji_order:"1435"},{name:"tulip",unicode:"1f337",shortname:":tulip:",code_decimal:"&#127799;",category:"n",emoji_order:"1436"},{name:"seedling",unicode:"1f331",shortname:":seedling:",code_decimal:"&#127793;",category:"n",emoji_order:"1437"},{name:"evergreen_tree",unicode:"1f332",shortname:":evergreen_tree:",code_decimal:"&#127794;",category:"n",emoji_order:"1438"},{name:"deciduous_tree",unicode:"1f333",shortname:":deciduous_tree:",code_decimal:"&#127795;",category:"n",emoji_order:"1439"},{name:"palm_tree",unicode:"1f334",shortname:":palm_tree:",code_decimal:"&#127796;",category:"n",emoji_order:"1440"},{name:"cactus",unicode:"1f335",shortname:":cactus:",code_decimal:"&#127797;",category:"n",emoji_order:"1441"},{name:"ear_of_rice",unicode:"1f33e",shortname:":ear_of_rice:",code_decimal:"&#127806;",category:"n",emoji_order:"1442"},{name:"herb",unicode:"1f33f",shortname:":herb:",code_decimal:"&#127807;",category:"n",emoji_order:"1443"},{name:"shamrock",unicode:"2618",shortname:":shamrock:",code_decimal:"&#9752;",category:"n",emoji_order:"1444"},{name:"four_leaf_clover",unicode:"1f340",shortname:":four_leaf_clover:",code_decimal:"&#127808;",category:"n",emoji_order:"1445"},{name:"maple_leaf",unicode:"1f341",shortname:":maple_leaf:",code_decimal:"&#127809;",category:"n",emoji_order:"1446"},{name:"fallen_leaf",unicode:"1f342",shortname:":fallen_leaf:",code_decimal:"&#127810;",category:"n",emoji_order:"1447"},{name:"leaves",unicode:"1f343",shortname:":leaves:",code_decimal:"&#127811;",category:"n",emoji_order:"1448"},{name:"grapes",unicode:"1f347",shortname:":grapes:",code_decimal:"&#127815;",category:"d",emoji_order:"1449"},{name:"melon",unicode:"1f348",shortname:":melon:",code_decimal:"&#127816;",category:"d",emoji_order:"1450"},{name:"watermelon",unicode:"1f349",shortname:":watermelon:",code_decimal:"&#127817;",category:"d",emoji_order:"1451"},{name:"tangerine",unicode:"1f34a",shortname:":tangerine:",code_decimal:"&#127818;",category:"d",emoji_order:"1452"},{name:"lemon",unicode:"1f34b",shortname:":lemon:",code_decimal:"&#127819;",category:"d",emoji_order:"1453"},{name:"banana",unicode:"1f34c",shortname:":banana:",code_decimal:"&#127820;",category:"d",emoji_order:"1454"},{name:"pineapple",unicode:"1f34d",shortname:":pineapple:",code_decimal:"&#127821;",category:"d",emoji_order:"1455"},{name:"apple",unicode:"1f34e",shortname:":apple:",code_decimal:"&#127822;",category:"d",emoji_order:"1456"},{name:"green_apple",unicode:"1f34f",shortname:":green_apple:",code_decimal:"&#127823;",category:"d",emoji_order:"1457"},{name:"pear",unicode:"1f350",shortname:":pear:",code_decimal:"&#127824;",category:"d",emoji_order:"1458"},{name:"peach",unicode:"1f351",shortname:":peach:",code_decimal:"&#127825;",category:"d",emoji_order:"1459"},{name:"cherries",unicode:"1f352",shortname:":cherries:",code_decimal:"&#127826;",category:"d",emoji_order:"1460"},{name:"strawberry",unicode:"1f353",shortname:":strawberry:",code_decimal:"&#127827;",category:"d",emoji_order:"1461"},{name:"tomato",unicode:"1f345",shortname:":tomato:",code_decimal:"&#127813;",category:"d",emoji_order:"1463"},{name:"eggplant",unicode:"1f346",shortname:":eggplant:",code_decimal:"&#127814;",category:"d",emoji_order:"1465"},{name:"corn",unicode:"1f33d",shortname:":corn:",code_decimal:"&#127805;",category:"d",emoji_order:"1468"},{name:"hot_pepper",unicode:"1f336",shortname:":hot_pepper:",code_decimal:"&#127798;",category:"d",emoji_order:"1469"},{name:"mushroom",unicode:"1f344",shortname:":mushroom:",code_decimal:"&#127812;",category:"n",emoji_order:"1471"},{name:"chestnut",unicode:"1f330",shortname:":chestnut:",code_decimal:"&#127792;",category:"n",emoji_order:"1473"},{name:"bread",unicode:"1f35e",shortname:":bread:",code_decimal:"&#127838;",category:"d",emoji_order:"1474"},{name:"cheese_wedge",unicode:"1f9c0",shortname:":cheese:",code_decimal:"&#129472;",category:"d",emoji_order:"1478"},{name:"meat_on_bone",unicode:"1f356",shortname:":meat_on_bone:",code_decimal:"&#127830;",category:"d",emoji_order:"1479"},{name:"poultry_leg",unicode:"1f357",shortname:":poultry_leg:",code_decimal:"&#127831;",category:"d",emoji_order:"1480"},{name:"hamburger",unicode:"1f354",shortname:":hamburger:",code_decimal:"&#127828;",category:"d",emoji_order:"1482"},{name:"fries",unicode:"1f35f",shortname:":fries:",code_decimal:"&#127839;",category:"d",emoji_order:"1483"},{name:"pizza",unicode:"1f355",shortname:":pizza:",code_decimal:"&#127829;",category:"d",emoji_order:"1484"},{name:"hotdog",unicode:"1f32d",shortname:":hotdog:",code_decimal:"&#127789;",category:"d",emoji_order:"1485"},{name:"taco",unicode:"1f32e",shortname:":taco:",code_decimal:"&#127790;",category:"d",emoji_order:"1486"},{name:"burrito",unicode:"1f32f",shortname:":burrito:",code_decimal:"&#127791;",category:"d",emoji_order:"1487"},{name:"egg",unicode:"1f95a",shortname:":egg:",code_decimal:"&#129370;",category:"d",emoji_order:"1489"},{name:"stew",unicode:"1f372",shortname:":stew:",code_decimal:"&#127858;",category:"d",emoji_order:"1492"},{name:"popcorn",unicode:"1f37f",shortname:":popcorn:",code_decimal:"&#127871;",category:"d",emoji_order:"1494"},{name:"bento",unicode:"1f371",shortname:":bento:",code_decimal:"&#127857;",category:"d",emoji_order:"1495"},{name:"rice_cracker",unicode:"1f358",shortname:":rice_cracker:",code_decimal:"&#127832;",category:"d",emoji_order:"1496"},{name:"rice_ball",unicode:"1f359",shortname:":rice_ball:",code_decimal:"&#127833;",category:"d",emoji_order:"1497"},{name:"rice",unicode:"1f35a",shortname:":rice:",code_decimal:"&#127834;",category:"d",emoji_order:"1498"},{name:"curry",unicode:"1f35b",shortname:":curry:",code_decimal:"&#127835;",category:"d",emoji_order:"1499"},{name:"ramen",unicode:"1f35c",shortname:":ramen:",code_decimal:"&#127836;",category:"d",emoji_order:"1500"},{name:"spaghetti",unicode:"1f35d",shortname:":spaghetti:",code_decimal:"&#127837;",category:"d",emoji_order:"1501"},{name:"sweet_potato",unicode:"1f360",shortname:":sweet_potato:",code_decimal:"&#127840;",category:"d",emoji_order:"1502"},{name:"oden",unicode:"1f362",shortname:":oden:",code_decimal:"&#127842;",category:"d",emoji_order:"1503"},{name:"sushi",unicode:"1f363",shortname:":sushi:",code_decimal:"&#127843;",category:"d",emoji_order:"1504"},{name:"fried_shrimp",unicode:"1f364",shortname:":fried_shrimp:",code_decimal:"&#127844;",category:"d",emoji_order:"1505"},{name:"fish_cake",unicode:"1f365",shortname:":fish_cake:",code_decimal:"&#127845;",category:"d",emoji_order:"1506"},{name:"dango",unicode:"1f361",shortname:":dango:",code_decimal:"&#127841;",category:"d",emoji_order:"1507"},{name:"icecream",unicode:"1f366",shortname:":icecream:",code_decimal:"&#127846;",category:"d",emoji_order:"1508"},{name:"shaved_ice",unicode:"1f367",shortname:":shaved_ice:",code_decimal:"&#127847;",category:"d",emoji_order:"1509"},{name:"ice_cream",unicode:"1f368",shortname:":ice_cream:",code_decimal:"&#127848;",category:"d",emoji_order:"1510"},{name:"doughnut",unicode:"1f369",shortname:":doughnut:",code_decimal:"&#127849;",category:"d",emoji_order:"1511"},{name:"cookie",unicode:"1f36a",shortname:":cookie:",code_decimal:"&#127850;",category:"d",emoji_order:"1512"},{name:"birthday",unicode:"1f382",shortname:":birthday:",code_decimal:"&#127874;",category:"d",emoji_order:"1513"},{name:"cake",unicode:"1f370",shortname:":cake:",code_decimal:"&#127856;",category:"d",emoji_order:"1514"},{name:"chocolate_bar",unicode:"1f36b",shortname:":chocolate_bar:",code_decimal:"&#127851;",category:"d",emoji_order:"1515"},{name:"candy",unicode:"1f36c",shortname:":candy:",code_decimal:"&#127852;",category:"d",emoji_order:"1516"},{name:"lollipop",unicode:"1f36d",shortname:":lollipop:",code_decimal:"&#127853;",category:"d",emoji_order:"1517"},{name:"custard",unicode:"1f36e",shortname:":custard:",code_decimal:"&#127854;",category:"d",emoji_order:"1518"},{name:"honey_pot",unicode:"1f36f",shortname:":honey_pot:",code_decimal:"&#127855;",category:"d",emoji_order:"1519"},{name:"baby_bottle",unicode:"1f37c",shortname:":baby_bottle:",code_decimal:"&#127868;",category:"d",emoji_order:"1520"},{name:"coffee",unicode:"2615",shortname:":coffee:",code_decimal:"&#9749;",category:"d",emoji_order:"1522"},{name:"tea",unicode:"1f375",shortname:":tea:",code_decimal:"&#127861;",category:"d",emoji_order:"1523"},{name:"sake",unicode:"1f376",shortname:":sake:",code_decimal:"&#127862;",category:"d",emoji_order:"1524"},{name:"champagne",unicode:"1f37e",shortname:":champagne:",code_decimal:"&#127870;",category:"d",emoji_order:"1525"},{name:"wine_glass",unicode:"1f377",shortname:":wine_glass:",code_decimal:"&#127863;",category:"d",emoji_order:"1526"},{name:"cocktail",unicode:"1f378",shortname:":cocktail:",code_decimal:"&#127864;",category:"d",emoji_order:"1527"},{name:"tropical_drink",unicode:"1f379",shortname:":tropical_drink:",code_decimal:"&#127865;",category:"d",emoji_order:"1528"},{name:"beer",unicode:"1f37a",shortname:":beer:",code_decimal:"&#127866;",category:"d",emoji_order:"1529"},{name:"beers",unicode:"1f37b",shortname:":beers:",code_decimal:"&#127867;",category:"d",emoji_order:"1530"},{name:"knife_fork_plate",unicode:"1f37d",shortname:":fork_knife_plate:",code_decimal:"&#127869;",category:"d",emoji_order:"1533"},{name:"fork_and_knife",unicode:"1f374",shortname:":fork_and_knife:",code_decimal:"&#127860;",category:"d",emoji_order:"1534"},{name:"amphora",unicode:"1f3fa",shortname:":amphora:",code_decimal:"&#127994;",category:"o",emoji_order:"1537"},{name:"earth_africa",unicode:"1f30d",shortname:":earth_africa:",code_decimal:"&#127757;",category:"n",emoji_order:"1538"},{name:"earth_americas",unicode:"1f30e",shortname:":earth_americas:",code_decimal:"&#127758;",category:"n",emoji_order:"1539"},{name:"earth_asia",unicode:"1f30f",shortname:":earth_asia:",code_decimal:"&#127759;",category:"n",emoji_order:"1540"},{name:"globe_with_meridians",unicode:"1f310",shortname:":globe_with_meridians:",code_decimal:"&#127760;",category:"s",emoji_order:"1541"},{name:"world_map",unicode:"1f5fa",shortname:":map:",code_decimal:"&#128506;",category:"o",emoji_order:"1542"},{name:"japan",unicode:"1f5fe",shortname:":japan:",code_decimal:"&#128510;",category:"t",emoji_order:"1543"},{name:"snow_capped_mountain",unicode:"1f3d4",shortname:":mountain_snow:",code_decimal:"&#127956;",category:"t",emoji_order:"1544"},{name:"mountain",unicode:"26f0",shortname:":mountain:",code_decimal:"&#9968;",category:"t",emoji_order:"1545"},{name:"volcano",unicode:"1f30b",shortname:":volcano:",code_decimal:"&#127755;",category:"t",emoji_order:"1546"},{name:"mount_fuji",unicode:"1f5fb",shortname:":mount_fuji:",code_decimal:"&#128507;",category:"t",emoji_order:"1547"},{name:"camping",unicode:"1f3d5",shortname:":camping:",code_decimal:"&#127957;",category:"t",emoji_order:"1548"},{name:"beach_with_umbrella",unicode:"1f3d6",shortname:":beach:",code_decimal:"&#127958;",category:"t",emoji_order:"1549"},{name:"desert",unicode:"1f3dc",shortname:":desert:",code_decimal:"&#127964;",category:"t",emoji_order:"1550"},{name:"desert_island",unicode:"1f3dd",shortname:":island:",code_decimal:"&#127965;",category:"t",emoji_order:"1551"},{name:"national_park",unicode:"1f3de",shortname:":park:",code_decimal:"&#127966;",category:"t",emoji_order:"1552"},{name:"stadium",unicode:"1f3df",shortname:":stadium:",code_decimal:"&#127967;",category:"t",emoji_order:"1553"},{name:"classical_building",unicode:"1f3db",shortname:":classical_building:",code_decimal:"&#127963;",category:"t",emoji_order:"1554"},{name:"building_construction",unicode:"1f3d7",shortname:":construction_site:",code_decimal:"&#127959;",category:"t",emoji_order:"1555"},{name:"house_buildings",unicode:"1f3d8",shortname:":homes:",code_decimal:"&#127960;",category:"t",emoji_order:"1556"},{name:"cityscape",unicode:"1f3d9",shortname:":cityscape:",code_decimal:"&#127961;",category:"t",emoji_order:"1557"},{name:"derelict_house_building",unicode:"1f3da",shortname:":house_abandoned:",code_decimal:"&#127962;",category:"t",emoji_order:"1558"},{name:"house",unicode:"1f3e0",shortname:":house:",code_decimal:"&#127968;",category:"t",emoji_order:"1559"},{name:"house_with_garden",unicode:"1f3e1",shortname:":house_with_garden:",code_decimal:"&#127969;",category:"t",emoji_order:"1560"},{name:"office",unicode:"1f3e2",shortname:":office:",code_decimal:"&#127970;",category:"t",emoji_order:"1561"},{name:"post_office",unicode:"1f3e3",shortname:":post_office:",code_decimal:"&#127971;",category:"t",emoji_order:"1562"},{name:"european_post_office",unicode:"1f3e4",shortname:":european_post_office:",code_decimal:"&#127972;",category:"t",emoji_order:"1563"},{name:"hospital",unicode:"1f3e5",shortname:":hospital:",code_decimal:"&#127973;",category:"t",emoji_order:"1564"},{name:"bank",unicode:"1f3e6",shortname:":bank:",code_decimal:"&#127974;",category:"t",emoji_order:"1565"},{name:"hotel",unicode:"1f3e8",shortname:":hotel:",code_decimal:"&#127976;",category:"t",emoji_order:"1566"},{name:"love_hotel",unicode:"1f3e9",shortname:":love_hotel:",code_decimal:"&#127977;",category:"t",emoji_order:"1567"},{name:"convenience_store",unicode:"1f3ea",shortname:":convenience_store:",code_decimal:"&#127978;",category:"t",emoji_order:"1568"},{name:"school",unicode:"1f3eb",shortname:":school:",code_decimal:"&#127979;",category:"t",emoji_order:"1569"},{name:"department_store",unicode:"1f3ec",shortname:":department_store:",code_decimal:"&#127980;",category:"t",emoji_order:"1570"},{name:"factory",unicode:"1f3ed",shortname:":factory:",code_decimal:"&#127981;",category:"t",emoji_order:"1571"},{name:"japanese_castle",unicode:"1f3ef",shortname:":japanese_castle:",code_decimal:"&#127983;",category:"t",emoji_order:"1572"},{name:"european_castle",unicode:"1f3f0",shortname:":european_castle:",code_decimal:"&#127984;",category:"t",emoji_order:"1573"},{name:"wedding",unicode:"1f492",shortname:":wedding:",code_decimal:"&#128146;",category:"t",emoji_order:"1574"},{name:"tokyo_tower",unicode:"1f5fc",shortname:":tokyo_tower:",code_decimal:"&#128508;",category:"t",emoji_order:"1575"},{name:"statue_of_liberty",unicode:"1f5fd",shortname:":statue_of_liberty:",code_decimal:"&#128509;",category:"t",emoji_order:"1576"},{name:"church",unicode:"26ea",shortname:":church:",code_decimal:"&#9962;",category:"t",emoji_order:"1577"},{name:"mosque",unicode:"1f54c",shortname:":mosque:",code_decimal:"&#128332;",category:"t",emoji_order:"1578"},{name:"synagogue",unicode:"1f54d",shortname:":synagogue:",code_decimal:"&#128333;",category:"t",emoji_order:"1579"},{name:"shinto_shrine",unicode:"26e9",shortname:":shinto_shrine:",code_decimal:"&#9961;",category:"t",emoji_order:"1580"},{name:"kaaba",unicode:"1f54b",shortname:":kaaba:",code_decimal:"&#128331;",category:"t",emoji_order:"1581"},{name:"fountain",unicode:"26f2",shortname:":fountain:",code_decimal:"&#9970;",category:"t",emoji_order:"1582"},{name:"tent",unicode:"26fa",shortname:":tent:",code_decimal:"&#9978;",category:"t",emoji_order:"1583"},{name:"foggy",unicode:"1f301",shortname:":foggy:",code_decimal:"&#127745;",category:"t",emoji_order:"1584"},{name:"night_with_stars",unicode:"1f303",shortname:":night_with_stars:",code_decimal:"&#127747;",category:"t",emoji_order:"1585"},{name:"sunrise_over_mountains",unicode:"1f304",shortname:":sunrise_over_mountains:",code_decimal:"&#127748;",category:"t",emoji_order:"1586"},{name:"sunrise",unicode:"1f305",shortname:":sunrise:",code_decimal:"&#127749;",category:"t",emoji_order:"1587"},{name:"city_sunset",unicode:"1f307",shortname:":city_sunset:",code_decimal:"&#127751;",category:"t",emoji_order:"1589"},{name:"bridge_at_night",unicode:"1f309",shortname:":bridge_at_night:",code_decimal:"&#127753;",category:"t",emoji_order:"1590"},{name:"hotsprings",unicode:"2668",shortname:":hotsprings:",code_decimal:"&#9832;",category:"s",emoji_order:"1591"},{name:"milky_way",unicode:"1f30c",shortname:":milky_way:",code_decimal:"&#127756;",category:"t",emoji_order:"1592"},{name:"carousel_horse",unicode:"1f3a0",shortname:":carousel_horse:",code_decimal:"&#127904;",category:"t",emoji_order:"1593"},{name:"ferris_wheel",unicode:"1f3a1",shortname:":ferris_wheel:",code_decimal:"&#127905;",category:"t",emoji_order:"1594"},{name:"roller_coaster",unicode:"1f3a2",shortname:":roller_coaster:",code_decimal:"&#127906;",category:"t",emoji_order:"1595"},{name:"barber",unicode:"1f488",shortname:":barber:",code_decimal:"&#128136;",category:"o",emoji_order:"1596"},{name:"circus_tent",unicode:"1f3aa",shortname:":circus_tent:",code_decimal:"&#127914;",category:"a",emoji_order:"1597"},{name:"performing_arts",unicode:"1f3ad",shortname:":performing_arts:",code_decimal:"&#127917;",category:"a",emoji_order:"1598"},{name:"frame_with_picture",unicode:"1f5bc",shortname:":frame_photo:",code_decimal:"&#128444;",category:"o",emoji_order:"1599"},{name:"art",unicode:"1f3a8",shortname:":art:",code_decimal:"&#127912;",category:"a",emoji_order:"1600"},{name:"slot_machine",unicode:"1f3b0",shortname:":slot_machine:",code_decimal:"&#127920;",category:"a",emoji_order:"1601"},{name:"steam_locomotive",unicode:"1f682",shortname:":steam_locomotive:",code_decimal:"&#128642;",category:"t",emoji_order:"1602"},{name:"railway_car",unicode:"1f683",shortname:":railway_car:",code_decimal:"&#128643;",category:"t",emoji_order:"1603"},{name:"bullettrain_side",unicode:"1f684",shortname:":bullettrain_side:",code_decimal:"&#128644;",category:"t",emoji_order:"1604"},{name:"bullettrain_front",unicode:"1f685",shortname:":bullettrain_front:",code_decimal:"&#128645;",category:"t",emoji_order:"1605"},{name:"train2",unicode:"1f686",shortname:":train2:",code_decimal:"&#128646;",category:"t",emoji_order:"1606"},{name:"metro",unicode:"1f687",shortname:":metro:",code_decimal:"&#128647;",category:"t",emoji_order:"1607"},{name:"light_rail",unicode:"1f688",shortname:":light_rail:",code_decimal:"&#128648;",category:"t",emoji_order:"1608"},{name:"station",unicode:"1f689",shortname:":station:",code_decimal:"&#128649;",category:"t",emoji_order:"1609"},{name:"tram",unicode:"1f68a",shortname:":tram:",code_decimal:"&#128650;",category:"t",emoji_order:"1610"},{name:"monorail",unicode:"1f69d",shortname:":monorail:",code_decimal:"&#128669;",category:"t",emoji_order:"1611"},{name:"mountain_railway",unicode:"1f69e",shortname:":mountain_railway:",code_decimal:"&#128670;",category:"t",emoji_order:"1612"},{name:"train",unicode:"1f68b",shortname:":train:",code_decimal:"&#128651;",category:"t",emoji_order:"1613"},{name:"bus",unicode:"1f68c",shortname:":bus:",code_decimal:"&#128652;",category:"t",emoji_order:"1614"},{name:"oncoming_bus",unicode:"1f68d",shortname:":oncoming_bus:",code_decimal:"&#128653;",category:"t",emoji_order:"1615"},{name:"trolleybus",unicode:"1f68e",shortname:":trolleybus:",code_decimal:"&#128654;",category:"t",emoji_order:"1616"},{name:"minibus",unicode:"1f690",shortname:":minibus:",code_decimal:"&#128656;",category:"t",emoji_order:"1617"},{name:"ambulance",unicode:"1f691",shortname:":ambulance:",code_decimal:"&#128657;",category:"t",emoji_order:"1618"},{name:"fire_engine",unicode:"1f692",shortname:":fire_engine:",code_decimal:"&#128658;",category:"t",emoji_order:"1619"},{name:"police_car",unicode:"1f693",shortname:":police_car:",code_decimal:"&#128659;",category:"t",emoji_order:"1620"},{name:"oncoming_police_car",unicode:"1f694",shortname:":oncoming_police_car:",code_decimal:"&#128660;",category:"t",emoji_order:"1621"},{name:"taxi",unicode:"1f695",shortname:":taxi:",code_decimal:"&#128661;",category:"t",emoji_order:"1622"},{name:"oncoming_taxi",unicode:"1f696",shortname:":oncoming_taxi:",code_decimal:"&#128662;",category:"t",emoji_order:"1623"},{name:"car",unicode:"1f697",shortname:":red_car:",code_decimal:"&#128663;",category:"t",emoji_order:"1624"},{name:"oncoming_automobile",unicode:"1f698",shortname:":oncoming_automobile:",code_decimal:"&#128664;",category:"t",emoji_order:"1625"},{name:"blue_car",unicode:"1f699",shortname:":blue_car:",code_decimal:"&#128665;",category:"t",emoji_order:"1626"},{name:"truck",unicode:"1f69a",shortname:":truck:",code_decimal:"&#128666;",category:"t",emoji_order:"1627"},{name:"articulated_lorry",unicode:"1f69b",shortname:":articulated_lorry:",code_decimal:"&#128667;",category:"t",emoji_order:"1628"},{name:"tractor",unicode:"1f69c",shortname:":tractor:",code_decimal:"&#128668;",category:"t",emoji_order:"1629"},{name:"bike",unicode:"1f6b2",shortname:":bike:",code_decimal:"&#128690;",category:"t",emoji_order:"1630"},{name:"busstop",unicode:"1f68f",shortname:":busstop:",code_decimal:"&#128655;",category:"t",emoji_order:"1633"},{name:"motorway",unicode:"1f6e3",shortname:":motorway:",code_decimal:"&#128739;",category:"t",emoji_order:"1634"},{name:"railway_track",unicode:"1f6e4",shortname:":railway_track:",code_decimal:"&#128740;",category:"t",emoji_order:"1635"},{name:"fuelpump",unicode:"26fd",shortname:":fuelpump:",code_decimal:"&#9981;",category:"t",emoji_order:"1636"},{name:"rotating_light",unicode:"1f6a8",shortname:":rotating_light:",code_decimal:"&#128680;",category:"t",emoji_order:"1637"},{name:"traffic_light",unicode:"1f6a5",shortname:":traffic_light:",code_decimal:"&#128677;",category:"t",emoji_order:"1638"},{name:"vertical_traffic_light",unicode:"1f6a6",shortname:":vertical_traffic_light:",code_decimal:"&#128678;",category:"t",emoji_order:"1639"},{name:"construction",unicode:"1f6a7",shortname:":construction:",code_decimal:"&#128679;",category:"t",emoji_order:"1640"},{name:"octagonal_sign",unicode:"1f6d1",shortname:":octagonal_sign:",code_decimal:"&#128721;",category:"s",emoji_order:"1641"},{name:"anchor",unicode:"2693",shortname:":anchor:",code_decimal:"&#9875;",category:"t",emoji_order:"1642"},{name:"boat",unicode:"26f5",shortname:":sailboat:",code_decimal:"&#9973;",category:"t",emoji_order:"1643"},{name:"speedboat",unicode:"1f6a4",shortname:":speedboat:",code_decimal:"&#128676;",category:"t",emoji_order:"1645"},{name:"passenger_ship",unicode:"1f6f3",shortname:":cruise_ship:",code_decimal:"&#128755;",category:"t",emoji_order:"1646"},{name:"ferry",unicode:"26f4",shortname:":ferry:",code_decimal:"&#9972;",category:"t",emoji_order:"1647"},{name:"motor_boat",unicode:"1f6e5",shortname:":motorboat:",code_decimal:"&#128741;",category:"t",emoji_order:"1648"},{name:"ship",unicode:"1f6a2",shortname:":ship:",code_decimal:"&#128674;",category:"t",emoji_order:"1649"},{name:"airplane",unicode:"2708",shortname:":airplane:",code_decimal:"&#9992;",category:"t",emoji_order:"1650"},{name:"small_airplane",unicode:"1f6e9",shortname:":airplane_small:",code_decimal:"&#128745;",category:"t",emoji_order:"1651"},{name:"airplane_departure",unicode:"1f6eb",shortname:":airplane_departure:",code_decimal:"&#128747;",category:"t",emoji_order:"1652"},{name:"airplane_arriving",unicode:"1f6ec",shortname:":airplane_arriving:",code_decimal:"&#128748;",category:"t",emoji_order:"1653"},{name:"seat",unicode:"1f4ba",shortname:":seat:",code_decimal:"&#128186;",category:"t",emoji_order:"1654"},{name:"helicopter",unicode:"1f681",shortname:":helicopter:",code_decimal:"&#128641;",category:"t",emoji_order:"1655"},{name:"suspension_railway",unicode:"1f69f",shortname:":suspension_railway:",code_decimal:"&#128671;",category:"t",emoji_order:"1656"},{name:"mountain_cableway",unicode:"1f6a0",shortname:":mountain_cableway:",code_decimal:"&#128672;",category:"t",emoji_order:"1657"},{name:"aerial_tramway",unicode:"1f6a1",shortname:":aerial_tramway:",code_decimal:"&#128673;",category:"t",emoji_order:"1658"},{name:"rocket",unicode:"1f680",shortname:":rocket:",code_decimal:"&#128640;",category:"t",emoji_order:"1659"},{name:"satellite",unicode:"1f6f0",shortname:":satellite_orbital:",code_decimal:"&#128752;",category:"t",emoji_order:"1660"},{name:"bellhop_bell",unicode:"1f6ce",shortname:":bellhop:",code_decimal:"&#128718;",category:"o",emoji_order:"1661"},{name:"door",unicode:"1f6aa",shortname:":door:",code_decimal:"&#128682;",category:"o",emoji_order:"1662"},{name:"sleeping_accommodation",unicode:"1f6cc",shortname:":sleeping_accommodation:",code_decimal:"&#128716;",category:"o",emoji_order:"1663"},{name:"bed",unicode:"1f6cf",shortname:":bed:",code_decimal:"&#128719;",category:"o",emoji_order:"1669"},{name:"couch_and_lamp",unicode:"1f6cb",shortname:":couch:",code_decimal:"&#128715;",category:"o",emoji_order:"1670"},{name:"toilet",unicode:"1f6bd",shortname:":toilet:",code_decimal:"&#128701;",category:"o",emoji_order:"1671"},{name:"shower",unicode:"1f6bf",shortname:":shower:",code_decimal:"&#128703;",category:"o",emoji_order:"1672"},{name:"bath",unicode:"1f6c0",shortname:":bath:",code_decimal:"&#128704;",category:"a",emoji_order:"1673"},{name:"bathtub",unicode:"1f6c1",shortname:":bathtub:",code_decimal:"&#128705;",category:"o",emoji_order:"1679"},{name:"hourglass",unicode:"231b",shortname:":hourglass:",code_decimal:"&#8987;",category:"o",emoji_order:"1680"},{name:"hourglass_flowing_sand",unicode:"23f3",shortname:":hourglass_flowing_sand:",code_decimal:"&#9203;",category:"o",emoji_order:"1681"},{name:"watch",unicode:"231a",shortname:":watch:",code_decimal:"&#8986;",category:"o",emoji_order:"1682"},{name:"alarm_clock",unicode:"23f0",shortname:":alarm_clock:",code_decimal:"&#9200;",category:"o",emoji_order:"1683"},{name:"stopwatch",unicode:"23f1",shortname:":stopwatch:",code_decimal:"&#9201;",category:"o",emoji_order:"1684"},{name:"timer_clock",unicode:"23f2",shortname:":timer:",code_decimal:"&#9202;",category:"o",emoji_order:"1685"},{name:"mantelpiece_clock",unicode:"1f570",shortname:":clock:",code_decimal:"&#128368;",category:"o",emoji_order:"1686"},{name:"clock12",unicode:"1f55b",shortname:":clock12:",code_decimal:"&#128347;",category:"s",emoji_order:"1687"},{name:"clock1230",unicode:"1f567",shortname:":clock1230:",code_decimal:"&#128359;",category:"s",emoji_order:"1688"},{name:"clock1",unicode:"1f550",shortname:":clock1:",code_decimal:"&#128336;",category:"s",emoji_order:"1689"},{name:"clock130",unicode:"1f55c",shortname:":clock130:",code_decimal:"&#128348;",category:"s",emoji_order:"1690"},{name:"clock2",unicode:"1f551",shortname:":clock2:",code_decimal:"&#128337;",category:"s",emoji_order:"1691"},{name:"clock230",unicode:"1f55d",shortname:":clock230:",code_decimal:"&#128349;",category:"s",emoji_order:"1692"},{name:"clock3",unicode:"1f552",shortname:":clock3:",code_decimal:"&#128338;",category:"s",emoji_order:"1693"},{name:"clock330",unicode:"1f55e",shortname:":clock330:",code_decimal:"&#128350;",category:"s",emoji_order:"1694"},{name:"clock4",unicode:"1f553",shortname:":clock4:",code_decimal:"&#128339;",category:"s",emoji_order:"1695"},{name:"clock430",unicode:"1f55f",shortname:":clock430:",code_decimal:"&#128351;",category:"s",emoji_order:"1696"},{name:"clock5",unicode:"1f554",shortname:":clock5:",code_decimal:"&#128340;",category:"s",emoji_order:"1697"},{name:"clock530",unicode:"1f560",shortname:":clock530:",code_decimal:"&#128352;",category:"s",emoji_order:"1698"},{name:"clock6",unicode:"1f555",shortname:":clock6:",code_decimal:"&#128341;",category:"s",emoji_order:"1699"},{name:"clock630",unicode:"1f561",shortname:":clock630:",code_decimal:"&#128353;",category:"s",emoji_order:"1700"},{name:"clock7",unicode:"1f556",shortname:":clock7:",code_decimal:"&#128342;",category:"s",emoji_order:"1701"},{name:"clock730",unicode:"1f562",shortname:":clock730:",code_decimal:"&#128354;",category:"s",emoji_order:"1702"},{name:"clock8",unicode:"1f557",shortname:":clock8:",code_decimal:"&#128343;",category:"s",emoji_order:"1703"},{name:"clock830",unicode:"1f563",shortname:":clock830:",code_decimal:"&#128355;",category:"s",emoji_order:"1704"},{name:"clock9",unicode:"1f558",shortname:":clock9:",code_decimal:"&#128344;",category:"s",emoji_order:"1705"},{name:"clock930",unicode:"1f564",shortname:":clock930:",code_decimal:"&#128356;",category:"s",emoji_order:"1706"},{name:"clock10",unicode:"1f559",shortname:":clock10:",code_decimal:"&#128345;",category:"s",emoji_order:"1707"},{name:"clock1030",unicode:"1f565",shortname:":clock1030:",code_decimal:"&#128357;",category:"s",emoji_order:"1708"},{name:"clock11",unicode:"1f55a",shortname:":clock11:",code_decimal:"&#128346;",category:"s",emoji_order:"1709"},{name:"clock1130",unicode:"1f566",shortname:":clock1130:",code_decimal:"&#128358;",category:"s",emoji_order:"1710"},{name:"new_moon",unicode:"1f311",shortname:":new_moon:",code_decimal:"&#127761;",category:"n",emoji_order:"1711"},{name:"waxing_crescent_moon",unicode:"1f312",shortname:":waxing_crescent_moon:",code_decimal:"&#127762;",category:"n",emoji_order:"1712"},{name:"first_quarter_moon",unicode:"1f313",shortname:":first_quarter_moon:",code_decimal:"&#127763;",category:"n",emoji_order:"1713"},{name:"full_moon",unicode:"1f315",shortname:":full_moon:",code_decimal:"&#127765;",category:"n",emoji_order:"1715"},{name:"waning_gibbous_moon",unicode:"1f316",shortname:":waning_gibbous_moon:",code_decimal:"&#127766;",category:"n",emoji_order:"1716"},{name:"last_quarter_moon",unicode:"1f317",shortname:":last_quarter_moon:",code_decimal:"&#127767;",category:"n",emoji_order:"1717"},{name:"waning_crescent_moon",unicode:"1f318",shortname:":waning_crescent_moon:",code_decimal:"&#127768;",category:"n",emoji_order:"1718"},{name:"crescent_moon",unicode:"1f319",shortname:":crescent_moon:",code_decimal:"&#127769;",category:"n",emoji_order:"1719"},{name:"new_moon_with_face",unicode:"1f31a",shortname:":new_moon_with_face:",code_decimal:"&#127770;",category:"n",emoji_order:"1720"},{name:"first_quarter_moon_with_face",unicode:"1f31b",shortname:":first_quarter_moon_with_face:",code_decimal:"&#127771;",category:"n",emoji_order:"1721"},{name:"last_quarter_moon_with_face",unicode:"1f31c",shortname:":last_quarter_moon_with_face:",code_decimal:"&#127772;",category:"n",emoji_order:"1722"},{name:"thermometer",unicode:"1f321",shortname:":thermometer:",code_decimal:"&#127777;",category:"o",emoji_order:"1723"},{name:"sunny",unicode:"2600",shortname:":sunny:",code_decimal:"&#9728;",category:"n",emoji_order:"1724"},{name:"full_moon_with_face",unicode:"1f31d",shortname:":full_moon_with_face:",code_decimal:"&#127773;",category:"n",emoji_order:"1725"},{name:"sun_with_face",unicode:"1f31e",shortname:":sun_with_face:",code_decimal:"&#127774;",category:"n",emoji_order:"1726"},{name:"star",unicode:"2b50",shortname:":star:",code_decimal:"&#11088;",category:"n",emoji_order:"1727"},{name:"star2",unicode:"1f31f",shortname:":star2:",code_decimal:"&#127775;",category:"n",emoji_order:"1728"},{name:"stars",unicode:"1f320",shortname:":stars:",code_decimal:"&#127776;",category:"t",emoji_order:"1729"},{name:"cloud",unicode:"2601",shortname:":cloud:",code_decimal:"&#9729;",category:"n",emoji_order:"1730"},{name:"partly_sunny",unicode:"26c5",shortname:":partly_sunny:",code_decimal:"&#9925;",category:"n",emoji_order:"1731"},{name:"thunder_cloud_and_rain",unicode:"26c8",shortname:":thunder_cloud_rain:",code_decimal:"&#9928;",category:"n",emoji_order:"1732"},{name:"rain_cloud",unicode:"1f327",shortname:":cloud_rain:",code_decimal:"&#127783;",category:"n",emoji_order:"1736"},{name:"snow_cloud",unicode:"1f328",shortname:":cloud_snow:",code_decimal:"&#127784;",category:"n",emoji_order:"1737"},{name:"fog",unicode:"1f32b",shortname:":fog:",code_decimal:"&#127787;",category:"n",emoji_order:"1740"},{name:"wind_blowing_face",unicode:"1f32c",shortname:":wind_blowing_face:",code_decimal:"&#127788;",category:"n",emoji_order:"1741"},{name:"cyclone",unicode:"1f300",shortname:":cyclone:",code_decimal:"&#127744;",category:"s",emoji_order:"1742"},{name:"rainbow",unicode:"1f308",shortname:":rainbow:",code_decimal:"&#127752;",category:"t",emoji_order:"1743"},{name:"closed_umbrella",unicode:"1f302",shortname:":closed_umbrella:",code_decimal:"&#127746;",category:"p",emoji_order:"1744"},{name:"umbrella",unicode:"2602",shortname:":umbrella2:",code_decimal:"&#9730;",category:"n",emoji_order:"1745"},{name:"umbrella_with_rain_drops",unicode:"2614",shortname:":umbrella:",code_decimal:"&#9748;",category:"n",emoji_order:"1746"},{name:"beach_umbrella",unicode:"26f1",shortname:":beach_umbrella:",code_decimal:"&#9969;",category:"o",emoji_order:"1747"},{name:"zap",unicode:"26a1",shortname:":zap:",code_decimal:"&#9889;",category:"n",emoji_order:"1748"},{name:"snowflake",unicode:"2744",shortname:":snowflake:",code_decimal:"&#10052;",category:"n",emoji_order:"1749"},{name:"snowman",unicode:"2603",shortname:":snowman2:",code_decimal:"&#9731;",category:"n",emoji_order:"1750"},{name:"snowman_without_snow",unicode:"26c4",shortname:":snowman:",code_decimal:"&#9924;",category:"n",emoji_order:"1751"},{name:"comet",unicode:"2604",shortname:":comet:",code_decimal:"&#9732;",category:"n",emoji_order:"1752"},{name:"fire",unicode:"1f525",shortname:":fire:",code_decimal:"&#128293;",category:"n",emoji_order:"1753"},{name:"droplet",unicode:"1f4a7",shortname:":droplet:",code_decimal:"&#128167;",category:"n",emoji_order:"1754"},{name:"ocean",unicode:"1f30a",shortname:":ocean:",code_decimal:"&#127754;",category:"n",emoji_order:"1755"},{name:"jack_o_lantern",unicode:"1f383",shortname:":jack_o_lantern:",code_decimal:"&#127875;",category:"n",emoji_order:"1756"},{name:"christmas_tree",unicode:"1f384",shortname:":christmas_tree:",code_decimal:"&#127876;",category:"n",emoji_order:"1757"},{name:"fireworks",unicode:"1f386",shortname:":fireworks:",code_decimal:"&#127878;",category:"t",emoji_order:"1758"},{name:"sparkler",unicode:"1f387",shortname:":sparkler:",code_decimal:"&#127879;",category:"t",emoji_order:"1759"},{name:"sparkles",unicode:"2728",shortname:":sparkles:",code_decimal:"&#10024;",category:"n",emoji_order:"1760"},{name:"balloon",unicode:"1f388",shortname:":balloon:",code_decimal:"&#127880;",category:"o",emoji_order:"1761"},{name:"tada",unicode:"1f389",shortname:":tada:",code_decimal:"&#127881;",category:"o",emoji_order:"1762"},{name:"confetti_ball",unicode:"1f38a",shortname:":confetti_ball:",code_decimal:"&#127882;",category:"o",emoji_order:"1763"},{name:"tanabata_tree",unicode:"1f38b",shortname:":tanabata_tree:",code_decimal:"&#127883;",category:"n",emoji_order:"1764"},{name:"bamboo",unicode:"1f38d",shortname:":bamboo:",code_decimal:"&#127885;",category:"n",emoji_order:"1765"},{name:"dolls",unicode:"1f38e",shortname:":dolls:",code_decimal:"&#127886;",category:"o",emoji_order:"1766"},{name:"f",unicode:"1f38f",shortname:":flags:",code_decimal:"&#127887;",category:"o",emoji_order:"1767"},{name:"wind_chime",unicode:"1f390",shortname:":wind_chime:",code_decimal:"&#127888;",category:"o",emoji_order:"1768"},{name:"rice_scene",unicode:"1f391",shortname:":rice_scene:",code_decimal:"&#127889;",category:"t",emoji_order:"1769"},{name:"ribbon",unicode:"1f380",shortname:":ribbon:",code_decimal:"&#127872;",category:"o",emoji_order:"1770"},{name:"gift",unicode:"1f381",shortname:":gift:",code_decimal:"&#127873;",category:"o",emoji_order:"1771"},{name:"reminder_ribbon",unicode:"1f397",shortname:":reminder_ribbon:",code_decimal:"&#127895;",category:"a",emoji_order:"1772"},{name:"admission_tickets",unicode:"1f39f",shortname:":tickets:",code_decimal:"&#127903;",category:"a",emoji_order:"1773"},{name:"ticket",unicode:"1f3ab",shortname:":ticket:",code_decimal:"&#127915;",category:"a",emoji_order:"1774"},{name:"medal",unicode:"1f396",shortname:":military_medal:",code_decimal:"&#127894;",category:"a",emoji_order:"1775"},{name:"trophy",unicode:"1f3c6",shortname:":trophy:",code_decimal:"&#127942;",category:"a",emoji_order:"1776"},{name:"sports_medal",unicode:"1f3c5",shortname:":medal:",code_decimal:"&#127941;",category:"a",emoji_order:"1777"},{name:"soccer",unicode:"26bd",shortname:":soccer:",code_decimal:"&#9917;",category:"a",emoji_order:"1781"},{name:"baseball",unicode:"26be",shortname:":baseball:",code_decimal:"&#9918;",category:"a",emoji_order:"1782"},{name:"basketball",unicode:"1f3c0",shortname:":basketball:",code_decimal:"&#127936;",category:"a",emoji_order:"1783"},{name:"volleyball",unicode:"1f3d0",shortname:":volleyball:",code_decimal:"&#127952;",category:"a",emoji_order:"1784"},{name:"football",unicode:"1f3c8",shortname:":football:",code_decimal:"&#127944;",category:"a",emoji_order:"1785"},{name:"rugby_football",unicode:"1f3c9",shortname:":rugby_football:",code_decimal:"&#127945;",category:"a",emoji_order:"1786"},{name:"tennis",unicode:"1f3be",shortname:":tennis:",code_decimal:"&#127934;",category:"a",emoji_order:"1787"},{name:"8ball",unicode:"1f3b1",shortname:":8ball:",code_decimal:"&#127921;",category:"a",emoji_order:"1788"},{name:"bowling",unicode:"1f3b3",shortname:":bowling:",code_decimal:"&#127923;",category:"a",emoji_order:"1789"},{name:"cricket_bat_and_ball",unicode:"1f3cf",shortname:":cricket_game:",code_decimal:"&#127951;",category:"a",emoji_order:"1790"},{name:"field_hockey_stick_and_ball",unicode:"1f3d1",shortname:":field_hockey:",code_decimal:"&#127953;",category:"a",emoji_order:"1791"},{name:"ice_hockey_stick_and_puck",unicode:"1f3d2",shortname:":hockey:",code_decimal:"&#127954;",category:"a",emoji_order:"1792"},{name:"table_tennis_paddle_and_ball",unicode:"1f3d3",shortname:":ping_pong:",code_decimal:"&#127955;",category:"a",emoji_order:"1793"},{name:"badminton_racquet_and_shuttlecock",unicode:"1f3f8",shortname:":badminton:",code_decimal:"&#127992;",category:"a",emoji_order:"1794"},{name:"dart",unicode:"1f3af",shortname:":dart:",code_decimal:"&#127919;",category:"a",emoji_order:"1798"},{name:"golf",unicode:"26f3",shortname:":golf:",code_decimal:"&#9971;",category:"a",emoji_order:"1799"},{name:"ice_skate",unicode:"26f8",shortname:":ice_skate:",code_decimal:"&#9976;",category:"a",emoji_order:"1800"},{name:"fishing_pole_and_fish",unicode:"1f3a3",shortname:":fishing_pole_and_fish:",code_decimal:"&#127907;",category:"a",emoji_order:"1801"},{name:"running_shirt_with_sash",unicode:"1f3bd",shortname:":running_shirt_with_sash:",code_decimal:"&#127933;",category:"a",emoji_order:"1802"},{name:"ski",unicode:"1f3bf",shortname:":ski:",code_decimal:"&#127935;",category:"a",emoji_order:"1803"},{name:"video_game",unicode:"1f3ae",shortname:":video_game:",code_decimal:"&#127918;",category:"a",emoji_order:"1804"},{name:"joystick",unicode:"1f579",shortname:":joystick:",code_decimal:"&#128377;",category:"o",emoji_order:"1805"},{name:"game_die",unicode:"1f3b2",shortname:":game_die:",code_decimal:"&#127922;",category:"a",emoji_order:"1806"},{name:"spades",unicode:"2660",shortname:":spades:",code_decimal:"&spades;",category:"s",emoji_order:"1807"},{name:"hearts",unicode:"2665",shortname:":hearts:",code_decimal:"&hearts;",category:"s",emoji_order:"1808"},{name:"diamonds",unicode:"2666",shortname:":diamonds:",code_decimal:"&diams;",category:"s",emoji_order:"1809"},{name:"clubs",unicode:"2663",shortname:":clubs:",code_decimal:"&clubs;",category:"s",emoji_order:"1810"},{name:"black_joker",unicode:"1f0cf",shortname:":black_joker:",code_decimal:"&#127183;",category:"s",emoji_order:"1811"},{name:"mahjong",unicode:"1f004",shortname:":mahjong:",code_decimal:"&#126980;",category:"s",emoji_order:"1812"},{name:"flower_playing_cards",unicode:"1f3b4",shortname:":flower_playing_cards:",code_decimal:"&#127924;",category:"s",emoji_order:"1813"},{name:"mute",unicode:"1f507",shortname:":mute:",code_decimal:"&#128263;",category:"s",emoji_order:"1814"},{name:"speaker",unicode:"1f508",shortname:":speaker:",code_decimal:"&#128264;",category:"s",emoji_order:"1815"},{name:"sound",unicode:"1f509",shortname:":sound:",code_decimal:"&#128265;",category:"s",emoji_order:"1816"},{name:"loud_sound",unicode:"1f50a",shortname:":loud_sound:",code_decimal:"&#128266;",category:"s",emoji_order:"1817"},{name:"loudspeaker",unicode:"1f4e2",shortname:":loudspeaker:",code_decimal:"&#128226;",category:"s",emoji_order:"1818"},{name:"mega",unicode:"1f4e3",shortname:":mega:",code_decimal:"&#128227;",category:"s",emoji_order:"1819"},{name:"postal_horn",unicode:"1f4ef",shortname:":postal_horn:",code_decimal:"&#128239;",category:"o",emoji_order:"1820"},{name:"bell",unicode:"1f514",shortname:":bell:",code_decimal:"&#128276;",category:"s",emoji_order:"1821"},{name:"no_bell",unicode:"1f515",shortname:":no_bell:",code_decimal:"&#128277;",category:"s",emoji_order:"1822"},{name:"musical_score",unicode:"1f3bc",shortname:":musical_score:",code_decimal:"&#127932;",category:"a",emoji_order:"1823"},{name:"musical_note",unicode:"1f3b5",shortname:":musical_note:",code_decimal:"&#127925;",category:"s",emoji_order:"1824"},{name:"notes",unicode:"1f3b6",shortname:":notes:",code_decimal:"&#127926;",category:"s",emoji_order:"1825"},{name:"studio_microphone",unicode:"1f399",shortname:":microphone2:",code_decimal:"&#127897;",category:"o",emoji_order:"1826"},{name:"level_slider",unicode:"1f39a",shortname:":level_slider:",code_decimal:"&#127898;",category:"o",emoji_order:"1827"},{name:"control_knobs",unicode:"1f39b",shortname:":control_knobs:",code_decimal:"&#127899;",category:"o",emoji_order:"1828"},{name:"microphone",unicode:"1f3a4",shortname:":microphone:",code_decimal:"&#127908;",category:"a",emoji_order:"1829"},{name:"headphones",unicode:"1f3a7",shortname:":headphones:",code_decimal:"&#127911;",category:"a",emoji_order:"1830"},{name:"radio",unicode:"1f4fb",shortname:":radio:",code_decimal:"&#128251;",category:"o",emoji_order:"1831"},{name:"saxophone",unicode:"1f3b7",shortname:":saxophone:",code_decimal:"&#127927;",category:"a",emoji_order:"1832"},{name:"guitar",unicode:"1f3b8",shortname:":guitar:",code_decimal:"&#127928;",category:"a",emoji_order:"1833"},{name:"musical_keyboard",unicode:"1f3b9",shortname:":musical_keyboard:",code_decimal:"&#127929;",category:"a",emoji_order:"1834"},{name:"trumpet",unicode:"1f3ba",shortname:":trumpet:",code_decimal:"&#127930;",category:"a",emoji_order:"1835"},{name:"violin",unicode:"1f3bb",shortname:":violin:",code_decimal:"&#127931;",category:"a",emoji_order:"1836"},{name:"iphone",unicode:"1f4f1",shortname:":iphone:",code_decimal:"&#128241;",category:"o",emoji_order:"1838"},{name:"calling",unicode:"1f4f2",shortname:":calling:",code_decimal:"&#128242;",category:"o",emoji_order:"1839"},{name:"telephone",unicode:"260e",shortname:":telephone:",code_decimal:"&#9742;",category:"o",emoji_order:"1840"},{name:"telephone_receiver",unicode:"1f4de",shortname:":telephone_receiver:",code_decimal:"&#128222;",category:"o",emoji_order:"1841"},{name:"pager",unicode:"1f4df",shortname:":pager:",code_decimal:"&#128223;",category:"o",emoji_order:"1842"},{name:"fax",unicode:"1f4e0",shortname:":fax:",code_decimal:"&#128224;",category:"o",emoji_order:"1843"},{name:"battery",unicode:"1f50b",shortname:":battery:",code_decimal:"&#128267;",category:"o",emoji_order:"1844"},{name:"electric_plug",unicode:"1f50c",shortname:":electric_plug:",code_decimal:"&#128268;",category:"o",emoji_order:"1845"},{name:"computer",unicode:"1f4bb",shortname:":computer:",code_decimal:"&#128187;",category:"o",emoji_order:"1846"},{name:"desktop_computer",unicode:"1f5a5",shortname:":desktop:",code_decimal:"&#128421;",category:"o",emoji_order:"1847"},{name:"printer",unicode:"1f5a8",shortname:":printer:",code_decimal:"&#128424;",category:"o",emoji_order:"1848"},{name:"keyboard",unicode:"2328",shortname:":keyboard:",code_decimal:"&#9000;",category:"o",emoji_order:"1849"},{name:"three_button_mouse",unicode:"1f5b1",shortname:":mouse_three_button:",code_decimal:"&#128433;",category:"o",emoji_order:"1850"},{name:"trackball",unicode:"1f5b2",shortname:":trackball:",code_decimal:"&#128434;",category:"o",emoji_order:"1851"},{name:"minidisc",unicode:"1f4bd",shortname:":minidisc:",code_decimal:"&#128189;",category:"o",emoji_order:"1852"},{name:"floppy_disk",unicode:"1f4be",shortname:":floppy_disk:",code_decimal:"&#128190;",category:"o",emoji_order:"1853"},{name:"cd",unicode:"1f4bf",shortname:":cd:",code_decimal:"&#128191;",category:"o",emoji_order:"1854"},{name:"dvd",unicode:"1f4c0",shortname:":dvd:",code_decimal:"&#128192;",category:"o",emoji_order:"1855"},{name:"movie_camera",unicode:"1f3a5",shortname:":movie_camera:",code_decimal:"&#127909;",category:"o",emoji_order:"1856"},{name:"film_frames",unicode:"1f39e",shortname:":film_frames:",code_decimal:"&#127902;",category:"o",emoji_order:"1857"},{name:"film_projector",unicode:"1f4fd",shortname:":projector:",code_decimal:"&#128253;",category:"o",emoji_order:"1858"},{name:"clapper",unicode:"1f3ac",shortname:":clapper:",code_decimal:"&#127916;",category:"a",emoji_order:"1859"},{name:"tv",unicode:"1f4fa",shortname:":tv:",code_decimal:"&#128250;",category:"o",emoji_order:"1860"},{name:"camera",unicode:"1f4f7",shortname:":camera:",code_decimal:"&#128247;",category:"o",emoji_order:"1861"},{name:"camera_with_flash",unicode:"1f4f8",shortname:":camera_with_flash:",code_decimal:"&#128248;",category:"o",emoji_order:"1862"},{name:"video_camera",unicode:"1f4f9",shortname:":video_camera:",code_decimal:"&#128249;",category:"o",emoji_order:"1863"},{name:"vhs",unicode:"1f4fc",shortname:":vhs:",code_decimal:"&#128252;",category:"o",emoji_order:"1864"},{name:"mag",unicode:"1f50d",shortname:":mag:",code_decimal:"&#128269;",category:"o",emoji_order:"1865"},{name:"mag_right",unicode:"1f50e",shortname:":mag_right:",code_decimal:"&#128270;",category:"o",emoji_order:"1866"},{name:"microscope",unicode:"1f52c",shortname:":microscope:",code_decimal:"&#128300;",category:"o",emoji_order:"1867"},{name:"telescope",unicode:"1f52d",shortname:":telescope:",code_decimal:"&#128301;",category:"o",emoji_order:"1868"},{name:"satellite_antenna",unicode:"1f4e1",shortname:":satellite:",code_decimal:"&#128225;",category:"o",emoji_order:"1869"},{name:"candle",unicode:"1f56f",shortname:":candle:",code_decimal:"&#128367;",category:"o",emoji_order:"1870"},{name:"bulb",unicode:"1f4a1",shortname:":bulb:",code_decimal:"&#128161;",category:"o",emoji_order:"1871"},{name:"flashlight",unicode:"1f526",shortname:":flashlight:",code_decimal:"&#128294;",category:"o",emoji_order:"1872"},{name:"izakaya_lantern",unicode:"1f3ee",shortname:":izakaya_lantern:",code_decimal:"&#127982;",category:"o",emoji_order:"1873"},{name:"notebook_with_decorative_cover",unicode:"1f4d4",shortname:":notebook_with_decorative_cover:",code_decimal:"&#128212;",category:"o",emoji_order:"1874"},{name:"closed_book",unicode:"1f4d5",shortname:":closed_book:",code_decimal:"&#128213;",category:"o",emoji_order:"1875"},{name:"book",unicode:"1f4d6",shortname:":book:",code_decimal:"&#128214;",category:"o",emoji_order:"1876"},{name:"green_book",unicode:"1f4d7",shortname:":green_book:",code_decimal:"&#128215;",category:"o",emoji_order:"1877"},{name:"blue_book",unicode:"1f4d8",shortname:":blue_book:",code_decimal:"&#128216;",category:"o",emoji_order:"1878"},{name:"orange_book",unicode:"1f4d9",shortname:":orange_book:",code_decimal:"&#128217;",category:"o",emoji_order:"1879"},{name:"books",unicode:"1f4da",shortname:":books:",code_decimal:"&#128218;",category:"o",emoji_order:"1880"},{name:"notebook",unicode:"1f4d3",shortname:":notebook:",code_decimal:"&#128211;",category:"o",emoji_order:"1881"},{name:"ledger",unicode:"1f4d2",shortname:":ledger:",code_decimal:"&#128210;",category:"o",emoji_order:"1882"},{name:"page_with_curl",unicode:"1f4c3",shortname:":page_with_curl:",code_decimal:"&#128195;",category:"o",emoji_order:"1883"},{name:"scroll",unicode:"1f4dc",shortname:":scroll:",code_decimal:"&#128220;",category:"o",emoji_order:"1884"},{name:"page_facing_up",unicode:"1f4c4",shortname:":page_facing_up:",code_decimal:"&#128196;",category:"o",emoji_order:"1885"},{name:"newspaper",unicode:"1f4f0",shortname:":newspaper:",code_decimal:"&#128240;",category:"o",emoji_order:"1886"},{name:"rolled_up_newspaper",unicode:"1f5de",shortname:":newspaper2:",code_decimal:"&#128478;",category:"o",emoji_order:"1887"},{name:"bookmark_tabs",unicode:"1f4d1",shortname:":bookmark_tabs:",code_decimal:"&#128209;",category:"o",emoji_order:"1888"},{name:"bookmark",unicode:"1f516",shortname:":bookmark:",code_decimal:"&#128278;",category:"o",emoji_order:"1889"},{name:"label",unicode:"1f3f7",shortname:":label:",code_decimal:"&#127991;",category:"o",emoji_order:"1890"},{name:"moneybag",unicode:"1f4b0",shortname:":moneybag:",code_decimal:"&#128176;",category:"o",emoji_order:"1891"},{name:"yen",unicode:"1f4b4",shortname:":yen:",code_decimal:"&#128180;",category:"o",emoji_order:"1892"},{name:"dollar",unicode:"1f4b5",shortname:":dollar:",code_decimal:"&#128181;",category:"o",emoji_order:"1893"},{name:"euro",unicode:"1f4b6",shortname:":euro:",code_decimal:"&#128182;",category:"o",emoji_order:"1894"},{name:"pound",unicode:"1f4b7",shortname:":pound:",code_decimal:"&#128183;",category:"o",emoji_order:"1895"},{name:"money_with_wings",unicode:"1f4b8",shortname:":money_with_wings:",code_decimal:"&#128184;",category:"o",emoji_order:"1896"},{name:"credit_card",unicode:"1f4b3",shortname:":credit_card:",code_decimal:"&#128179;",category:"o",emoji_order:"1897"},{name:"chart",unicode:"1f4b9",shortname:":chart:",code_decimal:"&#128185;",category:"s",emoji_order:"1898"},{name:"currency_exchange",unicode:"1f4b1",shortname:":currency_exchange:",code_decimal:"&#128177;",category:"s",emoji_order:"1899"},{name:"heavy_dollar_sign",unicode:"1f4b2",shortname:":heavy_dollar_sign:",code_decimal:"&#128178;",category:"s",emoji_order:"1900"},{name:"e-mail",unicode:"1f4e7",shortname:":e-mail:",code_decimal:"&#128231;",category:"o",emoji_order:"1902"},{name:"incoming_envelope",unicode:"1f4e8",shortname:":incoming_envelope:",code_decimal:"&#128232;",category:"o",emoji_order:"1903"},{name:"envelope_with_arrow",unicode:"1f4e9",shortname:":envelope_with_arrow:",code_decimal:"&#128233;",category:"o",emoji_order:"1904"},{name:"outbox_tray",unicode:"1f4e4",shortname:":outbox_tray:",code_decimal:"&#128228;",category:"o",emoji_order:"1905"},{name:"inbox_tray",unicode:"1f4e5",shortname:":inbox_tray:",code_decimal:"&#128229;",category:"o",emoji_order:"1906"},{name:"package",unicode:"1f4e6",shortname:":package:",code_decimal:"&#128230;",category:"o",emoji_order:"1907"},{name:"mailbox",unicode:"1f4eb",shortname:":mailbox:",code_decimal:"&#128235;",category:"o",emoji_order:"1908"},{name:"mailbox_closed",unicode:"1f4ea",shortname:":mailbox_closed:",code_decimal:"&#128234;",category:"o",emoji_order:"1909"},{name:"mailbox_with_mail",unicode:"1f4ec",shortname:":mailbox_with_mail:",code_decimal:"&#128236;",category:"o",emoji_order:"1910"},{name:"mailbox_with_no_mail",unicode:"1f4ed",shortname:":mailbox_with_no_mail:",code_decimal:"&#128237;",category:"o",emoji_order:"1911"},{name:"postbox",unicode:"1f4ee",shortname:":postbox:",code_decimal:"&#128238;",category:"o",emoji_order:"1912"},{name:"ballot_box_with_ballot",unicode:"1f5f3",shortname:":ballot_box:",code_decimal:"&#128499;",category:"o",emoji_order:"1913"},{name:"pencil2",unicode:"270f",shortname:":pencil2:",code_decimal:"&#9999;",category:"o",emoji_order:"1914"},{name:"black_nib",unicode:"2712",shortname:":black_nib:",code_decimal:"&#10002;",category:"o",emoji_order:"1915"},{name:"lower_left_fountain_pen",unicode:"1f58b",shortname:":pen_fountain:",code_decimal:"&#128395;",category:"o",emoji_order:"1916"},{name:"lower_left_ballpoint_pen",unicode:"1f58a",shortname:":pen_ballpoint:",code_decimal:"&#128394;",category:"o",emoji_order:"1917"},{name:"lower_left_paintbrush",unicode:"1f58c",shortname:":paintbrush:",code_decimal:"&#128396;",category:"o",emoji_order:"1918"},{name:"lower_left_crayon",unicode:"1f58d",shortname:":crayon:",code_decimal:"&#128397;",category:"o",emoji_order:"1919"},{name:"memo",unicode:"1f4dd",shortname:":pencil:",code_decimal:"&#128221;",category:"o",emoji_order:"1920"},{name:"briefcase",unicode:"1f4bc",shortname:":briefcase:",code_decimal:"&#128188;",category:"p",emoji_order:"1921"},{name:"file_folder",unicode:"1f4c1",shortname:":file_folder:",code_decimal:"&#128193;",category:"o",emoji_order:"1922"},{name:"open_file_folder",unicode:"1f4c2",shortname:":open_file_folder:",code_decimal:"&#128194;",category:"o",emoji_order:"1923"},{name:"card_index_dividers",unicode:"1f5c2",shortname:":dividers:",code_decimal:"&#128450;",category:"o",emoji_order:"1924"},{name:"date",unicode:"1f4c5",shortname:":date:",code_decimal:"&#128197;",category:"o",emoji_order:"1925"},{name:"calendar",unicode:"1f4c6",shortname:":calendar:",code_decimal:"&#128198;",category:"o",emoji_order:"1926"},{name:"spiral_note_pad",unicode:"1f5d2",shortname:":notepad_spiral:",code_decimal:"&#128466;",category:"o",emoji_order:"1927"},{name:"spiral_calendar_pad",unicode:"1f5d3",shortname:":calendar_spiral:",code_decimal:"&#128467;",category:"o",emoji_order:"1928"},{name:"card_index",unicode:"1f4c7",shortname:":card_index:",code_decimal:"&#128199;",category:"o",emoji_order:"1929"},{name:"chart_with_upwards_trend",unicode:"1f4c8",shortname:":chart_with_upwards_trend:",code_decimal:"&#128200;",category:"o",emoji_order:"1930"},{name:"chart_with_downwards_trend",unicode:"1f4c9",shortname:":chart_with_downwards_trend:",code_decimal:"&#128201;",category:"o",emoji_order:"1931"},{name:"bar_chart",unicode:"1f4ca",shortname:":bar_chart:",code_decimal:"&#128202;",category:"o",emoji_order:"1932"},{name:"clipboard",unicode:"1f4cb",shortname:":clipboard:",code_decimal:"&#128203;",category:"o",emoji_order:"1933"},{name:"pushpin",unicode:"1f4cc",shortname:":pushpin:",code_decimal:"&#128204;",category:"o",emoji_order:"1934"},{name:"round_pushpin",unicode:"1f4cd",shortname:":round_pushpin:",code_decimal:"&#128205;",category:"o",emoji_order:"1935"},{name:"paperclip",unicode:"1f4ce",shortname:":paperclip:",code_decimal:"&#128206;",category:"o",emoji_order:"1936"},{name:"linked_paperclips",unicode:"1f587",shortname:":paperclips:",code_decimal:"&#128391;",category:"o",emoji_order:"1937"},{name:"straight_ruler",unicode:"1f4cf",shortname:":straight_ruler:",code_decimal:"&#128207;",category:"o",emoji_order:"1938"},{name:"triangular_ruler",unicode:"1f4d0",shortname:":triangular_ruler:",code_decimal:"&#128208;",category:"o",emoji_order:"1939"},{name:"scissors",unicode:"2702",shortname:":scissors:",code_decimal:"&#9986;",category:"o",emoji_order:"1940"},{name:"card_file_box",unicode:"1f5c3",shortname:":card_box:",code_decimal:"&#128451;",category:"o",emoji_order:"1941"},{name:"file_cabinet",unicode:"1f5c4",shortname:":file_cabinet:",code_decimal:"&#128452;",category:"o",emoji_order:"1942"},{name:"wastebasket",unicode:"1f5d1",shortname:":wastebasket:",code_decimal:"&#128465;",category:"o",emoji_order:"1943"},{name:"lock",unicode:"1f512",shortname:":lock:",code_decimal:"&#128274;",category:"o",emoji_order:"1944"},{name:"unlock",unicode:"1f513",shortname:":unlock:",code_decimal:"&#128275;",category:"o",emoji_order:"1945"},{name:"lock_with_ink_pen",unicode:"1f50f",shortname:":lock_with_ink_pen:",code_decimal:"&#128271;",category:"o",emoji_order:"1946"},{name:"closed_lock_with_key",unicode:"1f510",shortname:":closed_lock_with_key:",code_decimal:"&#128272;",category:"o",emoji_order:"1947"},{name:"key",unicode:"1f511",shortname:":key:",code_decimal:"&#128273;",category:"o",emoji_order:"1948"},{name:"old_key",unicode:"1f5dd",shortname:":key2:",code_decimal:"&#128477;",category:"o",emoji_order:"1949"},{name:"hammer",unicode:"1f528",shortname:":hammer:",code_decimal:"&#128296;",category:"o",emoji_order:"1950"},{name:"pick",unicode:"26cf",shortname:":pick:",code_decimal:"&#9935;",category:"o",emoji_order:"1951"},{name:"hammer_and_pick",unicode:"2692",shortname:":hammer_pick:",code_decimal:"&#9874;",category:"o",emoji_order:"1952"},{name:"hammer_and_wrench",unicode:"1f6e0",shortname:":tools:",code_decimal:"&#128736;",category:"o",emoji_order:"1953"},{name:"dagger_knife",unicode:"1f5e1",shortname:":dagger:",code_decimal:"&#128481;",category:"o",emoji_order:"1954"},{name:"crossed_swords",unicode:"2694",shortname:":crossed_swords:",code_decimal:"&#9876;",category:"o",emoji_order:"1955"},{name:"gun",unicode:"1f52b",shortname:":gun:",code_decimal:"&#128299;",category:"o",emoji_order:"1956"},{name:"bow_and_arrow",unicode:"1f3f9",shortname:":bow_and_arrow:",code_decimal:"&#127993;",category:"a",emoji_order:"1957"},{name:"shield",unicode:"1f6e1",shortname:":shield:",code_decimal:"&#128737;",category:"o",emoji_order:"1958"},{name:"wrench",unicode:"1f527",shortname:":wrench:",code_decimal:"&#128295;",category:"o",emoji_order:"1959"},{name:"nut_and_bolt",unicode:"1f529",shortname:":nut_and_bolt:",code_decimal:"&#128297;",category:"o",emoji_order:"1960"},{name:"gear",unicode:"2699",shortname:":gear:",code_decimal:"&#9881;",category:"o",emoji_order:"1961"},{name:"compression",unicode:"1f5dc",shortname:":compression:",code_decimal:"&#128476;",category:"o",emoji_order:"1962"},{name:"alembic",unicode:"2697",shortname:":alembic:",code_decimal:"&#9879;",category:"o",emoji_order:"1963"},{name:"scales",unicode:"2696",shortname:":scales:",code_decimal:"&#9878;",category:"o",emoji_order:"1964"},{name:"link",unicode:"1f517",shortname:":link:",code_decimal:"&#128279;",category:"o",emoji_order:"1965"},{name:"chains",unicode:"26d3",shortname:":chains:",code_decimal:"&#9939;",category:"o",emoji_order:"1966"},{name:"syringe",unicode:"1f489",shortname:":syringe:",code_decimal:"&#128137;",category:"o",emoji_order:"1967"},{name:"pill",unicode:"1f48a",shortname:":pill:",code_decimal:"&#128138;",category:"o",emoji_order:"1968"},{name:"smoking",unicode:"1f6ac",shortname:":smoking:",code_decimal:"&#128684;",category:"o",emoji_order:"1969"},{name:"coffin",unicode:"26b0",shortname:":coffin:",code_decimal:"&#9904;",category:"o",emoji_order:"1970"},{name:"funeral_urn",unicode:"26b1",shortname:":urn:",code_decimal:"&#9905;",category:"o",emoji_order:"1971"},{name:"moyai",unicode:"1f5ff",shortname:":moyai:",code_decimal:"&#128511;",category:"o",emoji_order:"1972"},{name:"oil_drum",unicode:"1f6e2",shortname:":oil:",code_decimal:"&#128738;",category:"o",emoji_order:"1973"},{name:"crystal_ball",unicode:"1f52e",shortname:":crystal_ball:",code_decimal:"&#128302;",category:"o",emoji_order:"1974"},{name:"atm",unicode:"1f3e7",shortname:":atm:",code_decimal:"&#127975;",category:"s",emoji_order:"1976"},{name:"put_litter_in_its_place",unicode:"1f6ae",shortname:":put_litter_in_its_place:",code_decimal:"&#128686;",category:"s",emoji_order:"1977"},{name:"potable_water",unicode:"1f6b0",shortname:":potable_water:",code_decimal:"&#128688;",category:"s",emoji_order:"1978"},{name:"wheelchair",unicode:"267f",shortname:":wheelchair:",code_decimal:"&#9855;",category:"s",emoji_order:"1979"},{name:"mens",unicode:"1f6b9",shortname:":mens:",code_decimal:"&#128697;",category:"s",emoji_order:"1980"},{name:"womens",unicode:"1f6ba",shortname:":womens:",code_decimal:"&#128698;",category:"s",emoji_order:"1981"},{name:"restroom",unicode:"1f6bb",shortname:":restroom:",code_decimal:"&#128699;",category:"s",emoji_order:"1982"},{name:"baby_symbol",unicode:"1f6bc",shortname:":baby_symbol:",code_decimal:"&#128700;",category:"s",emoji_order:"1983"},{name:"wc",unicode:"1f6be",shortname:":wc:",code_decimal:"&#128702;",category:"s",emoji_order:"1984"},{name:"passport_control",unicode:"1f6c2",shortname:":passport_control:",code_decimal:"&#128706;",category:"s",emoji_order:"1985"},{name:"customs",unicode:"1f6c3",shortname:":customs:",code_decimal:"&#128707;",category:"s",emoji_order:"1986"},{name:"baggage_claim",unicode:"1f6c4",shortname:":baggage_claim:",code_decimal:"&#128708;",category:"s",emoji_order:"1987"},{name:"left_luggage",unicode:"1f6c5",shortname:":left_luggage:",code_decimal:"&#128709;",category:"s",emoji_order:"1988"},{name:"warning",unicode:"26a0",shortname:":warning:",code_decimal:"&#9888;",category:"s",emoji_order:"1989"},{name:"children_crossing",unicode:"1f6b8",shortname:":children_crossing:",code_decimal:"&#128696;",category:"s",emoji_order:"1990"},{name:"no_entry",unicode:"26d4",shortname:":no_entry:",code_decimal:"&#9940;",category:"s",emoji_order:"1991"},{name:"no_entry_sign",unicode:"1f6ab",shortname:":no_entry_sign:",code_decimal:"&#128683;",category:"s",emoji_order:"1992"},{name:"no_bicycles",unicode:"1f6b3",shortname:":no_bicycles:",code_decimal:"&#128691;",category:"s",emoji_order:"1993"},{name:"no_smoking",unicode:"1f6ad",shortname:":no_smoking:",code_decimal:"&#128685;",category:"s",emoji_order:"1994"},{name:"do_not_litter",unicode:"1f6af",shortname:":do_not_litter:",code_decimal:"&#128687;",category:"s",emoji_order:"1995"},{name:"non-potable_water",unicode:"1f6b1",shortname:":non-potable_water:",code_decimal:"&#128689;",category:"s",emoji_order:"1996"},{name:"no_pedestrians",unicode:"1f6b7",shortname:":no_pedestrians:",code_decimal:"&#128695;",category:"s",emoji_order:"1997"},{name:"no_mobile_phones",unicode:"1f4f5",shortname:":no_mobile_phones:",code_decimal:"&#128245;",category:"s",emoji_order:"1998"},{name:"underage",unicode:"1f51e",shortname:":underage:",code_decimal:"&#128286;",category:"s",emoji_order:"1999"},{name:"radioactive",unicode:"2622",shortname:":radioactive:",code_decimal:"&#9762;",category:"s",emoji_order:"2000"},{name:"biohazard",unicode:"2623",shortname:":biohazard:",code_decimal:"&#9763;",category:"s",emoji_order:"2001"},{name:"arrow_up",unicode:"2b06",shortname:":arrow_up:",code_decimal:"&#11014;",category:"s",emoji_order:"2002"},{name:"arrow_upper_right",unicode:"2197",shortname:":arrow_upper_right:",code_decimal:"&#8599;",category:"s",emoji_order:"2003"},{name:"arrow_right",unicode:"27a1",shortname:":arrow_right:",code_decimal:"&#10145;",category:"s",emoji_order:"2004"},{name:"arrow_lower_right",unicode:"2198",shortname:":arrow_lower_right:",code_decimal:"&#8600;",category:"s",emoji_order:"2005"},{name:"arrow_down",unicode:"2b07",shortname:":arrow_down:",code_decimal:"&#11015;",category:"s",emoji_order:"2006"},{name:"arrow_lower_left",unicode:"2199",shortname:":arrow_lower_left:",code_decimal:"&#8601;",category:"s",emoji_order:"2007"},{name:"arrow_left",unicode:"2b05",shortname:":arrow_left:",code_decimal:"&#11013;",category:"s",emoji_order:"2008"},{name:"arrow_upper_left",unicode:"2196",shortname:":arrow_upper_left:",code_decimal:"&#8598;",category:"s",emoji_order:"2009"},{name:"arrow_up_down",unicode:"2195",shortname:":arrow_up_down:",code_decimal:"&#8597;",category:"s",emoji_order:"2010"},{name:"left_right_arrow",unicode:"2194",shortname:":left_right_arrow:",code_decimal:"&harr;",category:"s",emoji_order:"2011"},{name:"leftwards_arrow_with_hook",unicode:"21a9",shortname:":leftwards_arrow_with_hook:",code_decimal:"&#8617;",category:"s",emoji_order:"2012"},{name:"arrow_right_hook",unicode:"21aa",shortname:":arrow_right_hook:",code_decimal:"&#8618;",category:"s",emoji_order:"2013"},{name:"arrow_heading_up",unicode:"2934",shortname:":arrow_heading_up:",code_decimal:"&#10548;",category:"s",emoji_order:"2014"},{name:"arrow_heading_down",unicode:"2935",shortname:":arrow_heading_down:",code_decimal:"&#10549;",category:"s",emoji_order:"2015"},{name:"arrows_clockwise",unicode:"1f503",shortname:":arrows_clockwise:",code_decimal:"&#128259;",category:"s",emoji_order:"2016"},{name:"arrows_counterclockwise",unicode:"1f504",shortname:":arrows_counterclockwise:",code_decimal:"&#128260;",category:"s",emoji_order:"2017"},{name:"back",unicode:"1f519",shortname:":back:",code_decimal:"&#128281;",category:"s",emoji_order:"2018"},{name:"end",unicode:"1f51a",shortname:":end:",code_decimal:"&#128282;",category:"s",emoji_order:"2019"},{name:"on",unicode:"1f51b",shortname:":on:",code_decimal:"&#128283;",category:"s",emoji_order:"2020"},{name:"soon",unicode:"1f51c",shortname:":soon:",code_decimal:"&#128284;",category:"s",emoji_order:"2021"},{name:"top",unicode:"1f51d",shortname:":top:",code_decimal:"&#128285;",category:"s",emoji_order:"2022"},{name:"place_of_worship",unicode:"1f6d0",shortname:":place_of_worship:",code_decimal:"&#128720;",category:"s",emoji_order:"2023"},{name:"atom_symbol",unicode:"269b",shortname:":atom:",code_decimal:"&#9883;",category:"s",emoji_order:"2024"},{name:"om_symbol",unicode:"1f549",shortname:":om_symbol:",code_decimal:"&#128329;",category:"s",emoji_order:"2025"},{name:"star_of_david",unicode:"2721",shortname:":star_of_david:",code_decimal:"&#10017;",category:"s",emoji_order:"2026"},{name:"wheel_of_dharma",unicode:"2638",shortname:":wheel_of_dharma:",code_decimal:"&#9784;",category:"s",emoji_order:"2027"},{name:"yin_yang",unicode:"262f",shortname:":yin_yang:",code_decimal:"&#9775;",category:"s",emoji_order:"2028"},{name:"latin_cross",unicode:"271d",shortname:":cross:",code_decimal:"&#10013;",category:"s",emoji_order:"2029"},{name:"orthodox_cross",unicode:"2626",shortname:":orthodox_cross:",code_decimal:"&#9766;",category:"s",emoji_order:"2030"},{name:"star_and_crescent",unicode:"262a",shortname:":star_and_crescent:",code_decimal:"&#9770;",category:"s",emoji_order:"2031"},{name:"peace_symbol",unicode:"262e",shortname:":peace:",code_decimal:"&#9774;",category:"s",emoji_order:"2032"},{name:"menorah_with_nine_branches",unicode:"1f54e",shortname:":menorah:",code_decimal:"&#128334;",category:"s",emoji_order:"2033"},{name:"six_pointed_star",unicode:"1f52f",shortname:":six_pointed_star:",code_decimal:"&#128303;",category:"s",emoji_order:"2034"},{name:"aries",unicode:"2648",shortname:":aries:",code_decimal:"&#9800;",category:"s",emoji_order:"2035"},{name:"taurus",unicode:"2649",shortname:":taurus:",code_decimal:"&#9801;",category:"s",emoji_order:"2036"},{name:"gemini",unicode:"264a",shortname:":gemini:",code_decimal:"&#9802;",category:"s",emoji_order:"2037"},{name:"cancer",unicode:"264b",shortname:":cancer:",code_decimal:"&#9803;",category:"s",emoji_order:"2038"},{name:"leo",unicode:"264c",shortname:":leo:",code_decimal:"&#9804;",category:"s",emoji_order:"2039"},{name:"virgo",unicode:"264d",shortname:":virgo:",code_decimal:"&#9805;",category:"s",emoji_order:"2040"},{name:"libra",unicode:"264e",shortname:":libra:",code_decimal:"&#9806;",category:"s",emoji_order:"2041"},{name:"scorpius",unicode:"264f",shortname:":scorpius:",code_decimal:"&#9807;",category:"s",emoji_order:"2042"},{name:"sagittarius",unicode:"2650",shortname:":sagittarius:",code_decimal:"&#9808;",category:"s",emoji_order:"2043"},{name:"capricorn",unicode:"2651",shortname:":capricorn:",code_decimal:"&#9809;",category:"s",emoji_order:"2044"},{name:"aquarius",unicode:"2652",shortname:":aquarius:",code_decimal:"&#9810;",category:"s",emoji_order:"2045"},{name:"pisces",unicode:"2653",shortname:":pisces:",code_decimal:"&#9811;",category:"s",emoji_order:"2046"},{name:"ophiuchus",unicode:"26ce",shortname:":ophiuchus:",code_decimal:"&#9934;",category:"s",emoji_order:"2047"},{name:"twisted_rightwards_arrows",unicode:"1f500",shortname:":twisted_rightwards_arrows:",code_decimal:"&#128256;",category:"s",emoji_order:"2048"},{name:"repeat",unicode:"1f501",shortname:":repeat:",code_decimal:"&#128257;",category:"s",emoji_order:"2049"},{name:"repeat_one",unicode:"1f502",shortname:":repeat_one:",code_decimal:"&#128258;",category:"s",emoji_order:"2050"},{name:"arrow_forward",unicode:"25b6",shortname:":arrow_forward:",code_decimal:"&#9654;",category:"s",emoji_order:"2051"},{name:"fast_forward",unicode:"23e9",shortname:":fast_forward:",code_decimal:"&#9193;",category:"s",emoji_order:"2052"},{name:"black_right_pointing_double_triangle_with_vertical_bar",unicode:"23ed",shortname:":track_next:",code_decimal:"&#9197;",category:"s",emoji_order:"2053"},{name:"black_right_pointing_triangle_with_double_vertical_bar",unicode:"23ef",shortname:":play_pause:",code_decimal:"&#9199;",category:"s",emoji_order:"2054"},{name:"arrow_backward",unicode:"25c0",shortname:":arrow_backward:",code_decimal:"&#9664;",category:"s",emoji_order:"2055"},{name:"rewind",unicode:"23ea",shortname:":rewind:",code_decimal:"&#9194;",category:"s",emoji_order:"2056"},{name:"black_left_pointing_double_triangle_with_vertical_bar",unicode:"23ee",shortname:":track_previous:",code_decimal:"&#9198;",category:"s",emoji_order:"2057"},{name:"arrow_up_small",unicode:"1f53c",shortname:":arrow_up_small:",code_decimal:"&#128316;",category:"s",emoji_order:"2058"},{name:"arrow_double_up",unicode:"23eb",shortname:":arrow_double_up:",code_decimal:"&#9195;",category:"s",emoji_order:"2059"},{name:"arrow_down_small",unicode:"1f53d",shortname:":arrow_down_small:",code_decimal:"&#128317;",category:"s",emoji_order:"2060"},{name:"arrow_double_down",unicode:"23ec",shortname:":arrow_double_down:",code_decimal:"&#9196;",category:"s",emoji_order:"2061"},{name:"double_vertical_bar",unicode:"23f8",shortname:":pause_button:",code_decimal:"&#9208;",category:"s",emoji_order:"2062"},{name:"black_square_for_stop",unicode:"23f9",shortname:":stop_button:",code_decimal:"&#9209;",category:"s",emoji_order:"2063"},{name:"black_circle_for_record",unicode:"23fa",shortname:":record_button:",code_decimal:"&#9210;",category:"s",emoji_order:"2064"},{name:"cinema",unicode:"1f3a6",shortname:":cinema:",code_decimal:"&#127910;",category:"s",emoji_order:"2066"},{name:"low_brightness",unicode:"1f505",shortname:":low_brightness:",code_decimal:"&#128261;",category:"s",emoji_order:"2067"},{name:"high_brightness",unicode:"1f506",shortname:":high_brightness:",code_decimal:"&#128262;",category:"s",emoji_order:"2068"},{name:"signal_strength",unicode:"1f4f6",shortname:":signal_strength:",code_decimal:"&#128246;",category:"s",emoji_order:"2069"},{name:"vibration_mode",unicode:"1f4f3",shortname:":vibration_mode:",code_decimal:"&#128243;",category:"s",emoji_order:"2070"},{name:"mobile_phone_off",unicode:"1f4f4",shortname:":mobile_phone_off:",code_decimal:"&#128244;",category:"s",emoji_order:"2071"},{name:"recycle",unicode:"267b",shortname:":recycle:",code_decimal:"&#9851;",category:"s",emoji_order:"2072"},{name:"name_badge",unicode:"1f4db",shortname:":name_badge:",code_decimal:"&#128219;",category:"s",emoji_order:"2073"},{name:"fleur_de_lis",unicode:"269c",shortname:":fleur-de-lis:",code_decimal:"&#9884;",category:"s",emoji_order:"2074"},{name:"beginner",unicode:"1f530",shortname:":beginner:",code_decimal:"&#128304;",category:"s",emoji_order:"2075"},{name:"trident",unicode:"1f531",shortname:":trident:",code_decimal:"&#128305;",category:"s",emoji_order:"2076"},{name:"o",unicode:"2b55",shortname:":o:",code_decimal:"&#11093;",category:"s",emoji_order:"2077"},{name:"white_check_mark",unicode:"2705",shortname:":white_check_mark:",code_decimal:"&#9989;",category:"s",emoji_order:"2078"},{name:"ballot_box_with_check",unicode:"2611",shortname:":ballot_box_with_check:",code_decimal:"&#9745;",category:"s",emoji_order:"2079"},{name:"heavy_check_mark",unicode:"2714",shortname:":heavy_check_mark:",code_decimal:"&#10004;",category:"s",emoji_order:"2080"},{name:"heavy_multiplication_x",unicode:"2716",shortname:":heavy_multiplication_x:",code_decimal:"&#10006;",category:"s",emoji_order:"2081"},{name:"x",unicode:"274c",shortname:":x:",code_decimal:"&#10060;",category:"s",emoji_order:"2082"},{name:"negative_squared_cross_mark",unicode:"274e",shortname:":negative_squared_cross_mark:",code_decimal:"&#10062;",category:"s",emoji_order:"2083"},{name:"heavy_plus_sign",unicode:"2795",shortname:":heavy_plus_sign:",code_decimal:"&#10133;",category:"s",emoji_order:"2084"},{name:"heavy_minus_sign",unicode:"2796",shortname:":heavy_minus_sign:",code_decimal:"&#10134;",category:"s",emoji_order:"2088"},{name:"heavy_division_sign",unicode:"2797",shortname:":heavy_division_sign:",code_decimal:"&#10135;",category:"s",emoji_order:"2089"},{name:"curly_loop",unicode:"27b0",shortname:":curly_loop:",code_decimal:"&#10160;",category:"s",emoji_order:"2090"},{name:"loop",unicode:"27bf",shortname:":loop:",code_decimal:"&#10175;",category:"s",emoji_order:"2091"},{name:"part_alternation_mark",unicode:"303d",shortname:":part_alternation_mark:",code_decimal:"&#12349;",category:"s",emoji_order:"2092"},{name:"eight_spoked_asterisk",unicode:"2733",shortname:":eight_spoked_asterisk:",code_decimal:"&#10035;",category:"s",emoji_order:"2093"},{name:"eight_pointed_black_star",unicode:"2734",shortname:":eight_pointed_black_star:",code_decimal:"&#10036;",category:"s",emoji_order:"2094"},{name:"sparkle",unicode:"2747",shortname:":sparkle:",code_decimal:"&#10055;",category:"s",emoji_order:"2095"},{name:"bangbang",unicode:"203c",shortname:":bangbang:",code_decimal:"&#8252;",category:"s",emoji_order:"2096"},{name:"interrobang",unicode:"2049",shortname:":interrobang:",code_decimal:"&#8265;",category:"s",emoji_order:"2097"},{name:"question",unicode:"2753",shortname:":question:",code_decimal:"&#10067;",category:"s",emoji_order:"2098"},{name:"grey_question",unicode:"2754",shortname:":grey_question:",code_decimal:"&#10068;",category:"s",emoji_order:"2099"},{name:"grey_exclamation",unicode:"2755",shortname:":grey_exclamation:",code_decimal:"&#10069;",category:"s",emoji_order:"2100"},{name:"exclamation",unicode:"2757",shortname:":exclamation:",code_decimal:"&#10071;",category:"s",emoji_order:"2101"},{name:"wavy_dash",unicode:"3030",shortname:":wavy_dash:",code_decimal:"&#12336;",category:"s",emoji_order:"2102"},{name:"copyright",unicode:"00a9",shortname:":copyright:",code_decimal:"&copy;",category:"s",emoji_order:"2103"},{name:"registered",unicode:"00ae",shortname:":registered:",code_decimal:"&reg;",category:"s",emoji_order:"2104"},{name:"tm",unicode:"2122",shortname:":tm:",code_decimal:"&trade;",category:"s",emoji_order:"2105"},{name:"hash",unicode:"0023-20e3",shortname:":hash:",code_decimal:"#&#8419;",category:"s",emoji_order:"2106"},{name:"keycap_star",unicode:"002a-20e3",shortname:":asterisk:",code_decimal:"*&#8419;",category:"s",emoji_order:"2107"},{name:"zero",unicode:"0030-20e3",shortname:":zero:",code_decimal:"0&#8419;",category:"s",emoji_order:"2108"},{name:"one",unicode:"0031-20e3",shortname:":one:",code_decimal:"1&#8419;",category:"s",emoji_order:"2109"},{name:"two",unicode:"0032-20e3",shortname:":two:",code_decimal:"2&#8419;",category:"s",emoji_order:"2110"},{name:"three",unicode:"0033-20e3",shortname:":three:",code_decimal:"3&#8419;",category:"s",emoji_order:"2111"},{name:"four",unicode:"0034-20e3",shortname:":four:",code_decimal:"4&#8419;",category:"s",emoji_order:"2112"},{name:"five",unicode:"0035-20e3",shortname:":five:",code_decimal:"5&#8419;",category:"s",emoji_order:"2113"},{name:"six",unicode:"0036-20e3",shortname:":six:",code_decimal:"6&#8419;",category:"s",emoji_order:"2114"},{name:"seven",unicode:"0037-20e3",shortname:":seven:",code_decimal:"7&#8419;",category:"s",emoji_order:"2115"},{name:"eight",unicode:"0038-20e3",shortname:":eight:",code_decimal:"8&#8419;",category:"s",emoji_order:"2116"},{name:"nine",unicode:"0039-20e3",shortname:":nine:",code_decimal:"9&#8419;",category:"s",emoji_order:"2117"},{name:"keycap_ten",unicode:"1f51f",shortname:":keycap_ten:",code_decimal:"&#128287;",category:"s",emoji_order:"2118"},{name:"capital_abcd",unicode:"1f520",shortname:":capital_abcd:",code_decimal:"&#128288;",category:"s",emoji_order:"2120"},{name:"abcd",unicode:"1f521",shortname:":abcd:",code_decimal:"&#128289;",category:"s",emoji_order:"2121"},{name:"s",unicode:"1f523",shortname:":s:",code_decimal:"&#128291;",category:"s",emoji_order:"2123"},{name:"abc",unicode:"1f524",shortname:":abc:",code_decimal:"&#128292;",category:"s",emoji_order:"2124"},{name:"a",unicode:"1f170",shortname:":a:",code_decimal:"&#127344;",category:"s",emoji_order:"2125"},{name:"ab",unicode:"1f18e",shortname:":ab:",code_decimal:"&#127374;",category:"s",emoji_order:"2126"},{name:"b",unicode:"1f171",shortname:":b:",code_decimal:"&#127345;",category:"s",emoji_order:"2127"},{name:"cl",unicode:"1f191",shortname:":cl:",code_decimal:"&#127377;",category:"s",emoji_order:"2128"},{name:"cool",unicode:"1f192",shortname:":cool:",code_decimal:"&#127378;",category:"s",emoji_order:"2129"},{name:"free",unicode:"1f193",shortname:":free:",code_decimal:"&#127379;",category:"s",emoji_order:"2130"},{name:"information_source",unicode:"2139",shortname:":information_source:",code_decimal:"&#8505;",category:"s",emoji_order:"2131"},{name:"id",unicode:"1f194",shortname:":id:",code_decimal:"&#127380;",category:"s",emoji_order:"2132"},{name:"m",unicode:"24c2",shortname:":m:",code_decimal:"&#9410;",category:"s",emoji_order:"2133"},{name:"new",unicode:"1f195",shortname:":new:",code_decimal:"&#127381;",category:"s",emoji_order:"2134"},{name:"ng",unicode:"1f196",shortname:":ng:",code_decimal:"&#127382;",category:"s",emoji_order:"2135"},{name:"o2",unicode:"1f17e",shortname:":o2:",code_decimal:"&#127358;",category:"s",emoji_order:"2136"},{name:"ok",unicode:"1f197",shortname:":ok:",code_decimal:"&#127383;",category:"s",emoji_order:"2137"},{name:"parking",unicode:"1f17f",shortname:":parking:",code_decimal:"&#127359;",category:"s",emoji_order:"2138"},{name:"sos",unicode:"1f198",shortname:":sos:",code_decimal:"&#127384;",category:"s",emoji_order:"2139"},{name:"up",unicode:"1f199",shortname:":up:",code_decimal:"&#127385;",category:"s",emoji_order:"2140"},{name:"vs",unicode:"1f19a",shortname:":vs:",code_decimal:"&#127386;",category:"s",emoji_order:"2141"},{name:"koko",unicode:"1f201",shortname:":koko:",code_decimal:"&#127489;",category:"s",emoji_order:"2142"},{name:"sa",unicode:"1f202",shortname:":sa:",code_decimal:"&#127490;",category:"s",emoji_order:"2143"},{name:"u6708",unicode:"1f237",shortname:":u6708:",code_decimal:"&#127543;",category:"s",emoji_order:"2144"},{name:"u6709",unicode:"1f236",shortname:":u6709:",code_decimal:"&#127542;",category:"s",emoji_order:"2145"},{name:"u6307",unicode:"1f22f",shortname:":u6307:",code_decimal:"&#127535;",category:"s",emoji_order:"2146"},{name:"ideograph_advantage",unicode:"1f250",shortname:":ideograph_advantage:",code_decimal:"&#127568;",category:"s",emoji_order:"2147"},{name:"u5272",unicode:"1f239",shortname:":u5272:",code_decimal:"&#127545;",category:"s",emoji_order:"2148"},{name:"u7121",unicode:"1f21a",shortname:":u7121:",code_decimal:"&#127514;",category:"s",emoji_order:"2149"},{name:"u7981",unicode:"1f232",shortname:":u7981:",code_decimal:"&#127538;",category:"s",emoji_order:"2150"},{name:"accept",unicode:"1f251",shortname:":accept:",code_decimal:"&#127569;",category:"s",emoji_order:"2151"},{name:"u7533",unicode:"1f238",shortname:":u7533:",code_decimal:"&#127544;",category:"s",emoji_order:"2152"},{name:"u5408",unicode:"1f234",shortname:":u5408:",code_decimal:"&#127540;",category:"s",emoji_order:"2153"},{name:"u7a7a",unicode:"1f233",shortname:":u7a7a:",code_decimal:"&#127539;",category:"s",emoji_order:"2154"},{name:"congratulations",unicode:"3297",shortname:":congratulations:",code_decimal:"&#12951;",category:"s",emoji_order:"2155"},{name:"secret",unicode:"3299",shortname:":secret:",code_decimal:"&#12953;",category:"s",emoji_order:"2156"},{name:"u55b6",unicode:"1f23a",shortname:":u55b6:",code_decimal:"&#127546;",category:"s",emoji_order:"2157"},{name:"u6e80",unicode:"1f235",shortname:":u6e80:",code_decimal:"&#127541;",category:"s",emoji_order:"2158"},{name:"black_small_square",unicode:"25aa",shortname:":black_small_square:",code_decimal:"&#9642;",category:"s",emoji_order:"2159"},{name:"white_small_square",unicode:"25ab",shortname:":white_small_square:",code_decimal:"&#9643;",category:"s",emoji_order:"2160"},{name:"white_medium_square",unicode:"25fb",shortname:":white_medium_square:",code_decimal:"&#9723;",category:"s",emoji_order:"2161"},{name:"black_medium_square",unicode:"25fc",shortname:":black_medium_square:",code_decimal:"&#9724;",category:"s",emoji_order:"2162"},{name:"white_medium_small_square",unicode:"25fd",shortname:":white_medium_small_square:",code_decimal:"&#9725;",category:"s",emoji_order:"2163"},{name:"black_medium_small_square",unicode:"25fe",shortname:":black_medium_small_square:",code_decimal:"&#9726;",category:"s",emoji_order:"2164"},{name:"black_large_square",unicode:"2b1b",shortname:":black_large_square:",code_decimal:"&#11035;",category:"s",emoji_order:"2165"},{name:"white_large_square",unicode:"2b1c",shortname:":white_large_square:",code_decimal:"&#11036;",category:"s",emoji_order:"2166"},{name:"large_orange_diamond",unicode:"1f536",shortname:":large_orange_diamond:",code_decimal:"&#128310;",category:"s",emoji_order:"2167"},{name:"large_blue_diamond",unicode:"1f537",shortname:":large_blue_diamond:",code_decimal:"&#128311;",category:"s",emoji_order:"2168"},{name:"small_orange_diamond",unicode:"1f538",shortname:":small_orange_diamond:",code_decimal:"&#128312;",category:"s",emoji_order:"2169"},{name:"small_blue_diamond",unicode:"1f539",shortname:":small_blue_diamond:",code_decimal:"&#128313;",category:"s",emoji_order:"2170"},{name:"small_red_triangle",unicode:"1f53a",shortname:":small_red_triangle:",code_decimal:"&#128314;",category:"s",emoji_order:"2171"},{name:"small_red_triangle_down",unicode:"1f53b",shortname:":small_red_triangle_down:",code_decimal:"&#128315;",category:"s",emoji_order:"2172"},{name:"diamond_shape_with_a_dot_inside",unicode:"1f4a0",shortname:":diamond_shape_with_a_dot_inside:",code_decimal:"&#128160;",category:"s",emoji_order:"2173"},{name:"radio_button",unicode:"1f518",shortname:":radio_button:",code_decimal:"&#128280;",category:"s",emoji_order:"2174"},{name:"black_square_button",unicode:"1f532",shortname:":black_square_button:",code_decimal:"&#128306;",category:"s",emoji_order:"2175"},{name:"white_square_button",unicode:"1f533",shortname:":white_square_button:",code_decimal:"&#128307;",category:"s",emoji_order:"2176"},{name:"white_circle",unicode:"26aa",shortname:":white_circle:",code_decimal:"&#9898;",category:"s",emoji_order:"2177"},{name:"black_circle",unicode:"26ab",shortname:":black_circle:",code_decimal:"&#9899;",category:"s",emoji_order:"2178"},{name:"red_circle",unicode:"1f534",shortname:":red_circle:",code_decimal:"&#128308;",category:"s",emoji_order:"2179"},{name:"large_blue_circle",unicode:"1f535",shortname:":blue_circle:",code_decimal:"&#128309;",category:"s",emoji_order:"2180"},{name:"checkered_flag",unicode:"1f3c1",shortname:":checkered_flag:",code_decimal:"&#127937;",category:"t",emoji_order:"2181"},{name:"triangular_flag_on_post",unicode:"1f6a9",shortname:":triangular_flag_on_post:",code_decimal:"&#128681;",category:"o",emoji_order:"2182"},{name:"crossed_flags",unicode:"1f38c",shortname:":crossed_flags:",code_decimal:"&#127884;",category:"o",emoji_order:"2183"},{name:"waving_black_flag",unicode:"1f3f4",shortname:":flag_black:",code_decimal:"&#127988;",category:"o",emoji_order:"2184"},{name:"waving_white_flag",unicode:"1f3f3",shortname:":flag_white:",code_decimal:"&#127987;",category:"o",emoji_order:"2185"},{name:"flag-ac",unicode:"1f1e6-1f1e8",shortname:":flag_ac:",code_decimal:"&#127462;&#127464;",category:"f",emoji_order:"2187"},{name:"flag-ad",unicode:"1f1e6-1f1e9",shortname:":flag_ad:",code_decimal:"&#127462;&#127465;",category:"f",emoji_order:"2188"},{name:"flag-ae",unicode:"1f1e6-1f1ea",shortname:":flag_ae:",code_decimal:"&#127462;&#127466;",category:"f",emoji_order:"2189"},{name:"flag-af",unicode:"1f1e6-1f1eb",shortname:":flag_af:",code_decimal:"&#127462;&#127467;",category:"f",emoji_order:"2190"},{name:"flag-ag",unicode:"1f1e6-1f1ec",shortname:":flag_ag:",code_decimal:"&#127462;&#127468;",category:"f",emoji_order:"2191"},{name:"flag-ai",unicode:"1f1e6-1f1ee",shortname:":flag_ai:",code_decimal:"&#127462;&#127470;",category:"f",emoji_order:"2192"},{name:"flag-al",unicode:"1f1e6-1f1f1",shortname:":flag_al:",code_decimal:"&#127462;&#127473;",category:"f",emoji_order:"2193"},{name:"flag-am",unicode:"1f1e6-1f1f2",shortname:":flag_am:",code_decimal:"&#127462;&#127474;",category:"f",emoji_order:"2194"},{name:"flag-ao",unicode:"1f1e6-1f1f4",shortname:":flag-ao:",code_decimal:"&#127462;&#127476;",category:"f",emoji_order:"2195"},{name:"flag-aq",unicode:"1f1e6-1f1f6",shortname:":flag-aq:",code_decimal:"&#127462;&#127478;",category:"f",emoji_order:"2196"},{name:"flag-ar",unicode:"1f1e6-1f1f7",shortname:":flag-ar:",code_decimal:"&#127462;&#127479;",category:"f",emoji_order:"2197"},{name:"flag-as",unicode:"1f1e6-1f1f8",shortname:":flag-as:",code_decimal:"&#127462;&#127480;",category:"f",emoji_order:"2198"},{name:"flag-at",unicode:"1f1e6-1f1f9",shortname:":flag-at:",code_decimal:"&#127462;&#127481;",category:"f",emoji_order:"2199"},{name:"flag-au",unicode:"1f1e6-1f1fa",shortname:":flag-au:",code_decimal:"&#127462;&#127482;",category:"f",emoji_order:"2200"},{name:"flag-aw",unicode:"1f1e6-1f1fc",shortname:":flag-aw:",code_decimal:"&#127462;&#127484;",category:"f",emoji_order:"2201"},{name:"flag-ax",unicode:"1f1e6-1f1fd",shortname:":flag-ax:",code_decimal:"&#127462;&#127485;",category:"f",emoji_order:"2202"},{name:"flag-az",unicode:"1f1e6-1f1ff",shortname:":flag-az:",code_decimal:"&#127462;&#127487;",category:"f",emoji_order:"2203"},{name:"flag-ba",unicode:"1f1e7-1f1e6",shortname:":flag-ba:",code_decimal:"&#127463;&#127462;",category:"f",emoji_order:"2204"},{name:"flag-bb",unicode:"1f1e7-1f1e7",shortname:":flag-bb:",code_decimal:"&#127463;&#127463;",category:"f",emoji_order:"2205"},{name:"flag-bd",unicode:"1f1e7-1f1e9",shortname:":flag-bd:",code_decimal:"&#127463;&#127465;",category:"f",emoji_order:"2206"},{name:"flag-be",unicode:"1f1e7-1f1ea",shortname:":flag-be:",code_decimal:"&#127463;&#127466;",category:"f",emoji_order:"2207"},{name:"flag-bf",unicode:"1f1e7-1f1eb",shortname:":flag-bf:",code_decimal:"&#127463;&#127467;",category:"f",emoji_order:"2208"},{name:"flag-bg",unicode:"1f1e7-1f1ec",shortname:":flag-bg:",code_decimal:"&#127463;&#127468;",category:"f",emoji_order:"2209"},{name:"flag-bh",unicode:"1f1e7-1f1ed",shortname:":flag-bh:",code_decimal:"&#127463;&#127469;",category:"f",emoji_order:"2210"},{name:"flag-bi",unicode:"1f1e7-1f1ee",shortname:":flag-bi:",code_decimal:"&#127463;&#127470;",category:"f",emoji_order:"2211"},{name:"flag-bj",unicode:"1f1e7-1f1ef",shortname:":flag-bj:",code_decimal:"&#127463;&#127471;",category:"f",emoji_order:"2212"},{name:"flag-bl",unicode:"1f1e7-1f1f1",shortname:":flag-bl:",code_decimal:"&#127463;&#127473;",category:"f",emoji_order:"2213"},{name:"flag-bm",unicode:"1f1e7-1f1f2",shortname:":flag-bm:",code_decimal:"&#127463;&#127474;",category:"f",emoji_order:"2214"},{name:"flag-bn",unicode:"1f1e7-1f1f3",shortname:":flag-bn:",code_decimal:"&#127463;&#127475;",category:"f",emoji_order:"2215"},{name:"flag-bo",unicode:"1f1e7-1f1f4",shortname:":flag-bo:",code_decimal:"&#127463;&#127476;",category:"f",emoji_order:"2216"},{name:"flag-bq",unicode:"1f1e7-1f1f6",shortname:":flag-bq:",code_decimal:"&#127463;&#127478;",category:"f",emoji_order:"2217"},{name:"flag-br",unicode:"1f1e7-1f1f7",shortname:":flag-br:",code_decimal:"&#127463;&#127479;",category:"f",emoji_order:"2218"},{name:"flag-bs",unicode:"1f1e7-1f1f8",shortname:":flag-bs:",code_decimal:"&#127463;&#127480;",category:"f",emoji_order:"2219"},{name:"flag-bt",unicode:"1f1e7-1f1f9",shortname:":flag-bt:",code_decimal:"&#127463;&#127481;",category:"f",emoji_order:"2220"},{name:"flag-bv",unicode:"1f1e7-1f1fb",shortname:":flag-bv:",code_decimal:"&#127463;&#127483;",category:"f",emoji_order:"2221"},{name:"flag-bw",unicode:"1f1e7-1f1fc",shortname:":flag-bw:",code_decimal:"&#127463;&#127484;",category:"f",emoji_order:"2222"},{name:"flag-by",unicode:"1f1e7-1f1fe",shortname:":flag-by:",code_decimal:"&#127463;&#127486;",category:"f",emoji_order:"2223"},{name:"flag-bz",unicode:"1f1e7-1f1ff",shortname:":flag-bz:",code_decimal:"&#127463;&#127487;",category:"f",emoji_order:"2224"},{name:"flag-ca",unicode:"1f1e8-1f1e6",shortname:":flag-ca:",code_decimal:"&#127464;&#127462;",category:"f",emoji_order:"2225"},{name:"flag-cc",unicode:"1f1e8-1f1e8",shortname:":flag-cc:",code_decimal:"&#127464;&#127464;",category:"f",emoji_order:"2226"},{name:"flag-cd",unicode:"1f1e8-1f1e9",shortname:":flag-cd:",code_decimal:"&#127464;&#127465;",category:"f",emoji_order:"2227"},{name:"flag-cf",unicode:"1f1e8-1f1eb",shortname:":flag-cf:",code_decimal:"&#127464;&#127467;",category:"f",emoji_order:"2228"},{name:"flag-cg",unicode:"1f1e8-1f1ec",shortname:":flag-cg:",code_decimal:"&#127464;&#127468;",category:"f",emoji_order:"2229"},{name:"flag-ch",unicode:"1f1e8-1f1ed",shortname:":flag-ch:",code_decimal:"&#127464;&#127469;",category:"f",emoji_order:"2230"},{name:"flag-ci",unicode:"1f1e8-1f1ee",shortname:":flag-ci:",code_decimal:"&#127464;&#127470;",category:"f",emoji_order:"2231"},{name:"flag-ck",unicode:"1f1e8-1f1f0",shortname:":flag-ck:",code_decimal:"&#127464;&#127472;",category:"f",emoji_order:"2232"},{name:"flag-cl",unicode:"1f1e8-1f1f1",shortname:":flag-cl:",code_decimal:"&#127464;&#127473;",category:"f",emoji_order:"2233"},{name:"flag-cm",unicode:"1f1e8-1f1f2",shortname:":flag-cm:",code_decimal:"&#127464;&#127474;",category:"f",emoji_order:"2234"},{name:"flag-cn",unicode:"1f1e8-1f1f3",shortname:":flag-cn:",code_decimal:"&#127464;&#127475;",category:"f",emoji_order:"2235"},{name:"flag-co",unicode:"1f1e8-1f1f4",shortname:":flag-co:",code_decimal:"&#127464;&#127476;",category:"f",emoji_order:"2236"},{name:"flag-cp",unicode:"1f1e8-1f1f5",shortname:":flag-cp:",code_decimal:"&#127464;&#127477;",category:"f",emoji_order:"2237"},{name:"flag-cr",unicode:"1f1e8-1f1f7",shortname:":flag-cr:",code_decimal:"&#127464;&#127479;",category:"f",emoji_order:"2238"},{name:"flag-cu",unicode:"1f1e8-1f1fa",shortname:":flag-cu:",code_decimal:"&#127464;&#127482;",category:"f",emoji_order:"2239"},{name:"flag-cv",unicode:"1f1e8-1f1fb",shortname:":flag-cv:",code_decimal:"&#127464;&#127483;",category:"f",emoji_order:"2240"},{name:"flag-cw",unicode:"1f1e8-1f1fc",shortname:":flag-cw:",code_decimal:"&#127464;&#127484;",category:"f",emoji_order:"2241"},{name:"flag-cx",unicode:"1f1e8-1f1fd",shortname:":flag-cx:",code_decimal:"&#127464;&#127485;",category:"f",emoji_order:"2242"},{name:"flag-cy",unicode:"1f1e8-1f1fe",shortname:":flag-cy:",code_decimal:"&#127464;&#127486;",category:"f",emoji_order:"2243"},{name:"flag-cz",unicode:"1f1e8-1f1ff",shortname:":flag-cz:",code_decimal:"&#127464;&#127487;",category:"f",emoji_order:"2244"},{name:"flag-de",unicode:"1f1e9-1f1ea",shortname:":flag-de:",code_decimal:"&#127465;&#127466;",category:"f",emoji_order:"2245"},{name:"flag-dg",unicode:"1f1e9-1f1ec",shortname:":flag-dg:",code_decimal:"&#127465;&#127468;",category:"f",emoji_order:"2246"},{name:"flag-dj",unicode:"1f1e9-1f1ef",shortname:":flag-dj:",code_decimal:"&#127465;&#127471;",category:"f",emoji_order:"2247"},{name:"flag-dk",unicode:"1f1e9-1f1f0",shortname:":flag-dk:",code_decimal:"&#127465;&#127472;",category:"f",emoji_order:"2248"},{name:"flag-dm",unicode:"1f1e9-1f1f2",shortname:":flag-dm:",code_decimal:"&#127465;&#127474;",category:"f",emoji_order:"2249"},{name:"flag-do",unicode:"1f1e9-1f1f4",shortname:":flag-do:",code_decimal:"&#127465;&#127476;",category:"f",emoji_order:"2250"},{name:"flag-dz",unicode:"1f1e9-1f1ff",shortname:":flag-dz:",code_decimal:"&#127465;&#127487;",category:"f",emoji_order:"2251"},{name:"flag-ea",unicode:"1f1ea-1f1e6",shortname:":flag-ea:",code_decimal:"&#127466;&#127462;",category:"f",emoji_order:"2252"},{name:"flag-ec",unicode:"1f1ea-1f1e8",shortname:":flag-ec:",code_decimal:"&#127466;&#127464;",category:"f",emoji_order:"2253"},{name:"flag-ee",unicode:"1f1ea-1f1ea",shortname:":flag-ee:",code_decimal:"&#127466;&#127466;",category:"f",emoji_order:"2254"},{name:"flag-eg",unicode:"1f1ea-1f1ec",shortname:":flag-eg:",code_decimal:"&#127466;&#127468;",category:"f",emoji_order:"2255"},{name:"flag-eh",unicode:"1f1ea-1f1ed",shortname:":flag-eh:",code_decimal:"&#127466;&#127469;",category:"f",emoji_order:"2256"},{name:"flag-er",unicode:"1f1ea-1f1f7",shortname:":flag-er:",code_decimal:"&#127466;&#127479;",category:"f",emoji_order:"2257"},{name:"flag-es",unicode:"1f1ea-1f1f8",shortname:":flag-es:",code_decimal:"&#127466;&#127480;",category:"f",emoji_order:"2258"},{name:"flag-et",unicode:"1f1ea-1f1f9",shortname:":flag-et:",code_decimal:"&#127466;&#127481;",category:"f",emoji_order:"2259"},{name:"flag-eu",unicode:"1f1ea-1f1fa",shortname:":flag-eu:",code_decimal:"&#127466;&#127482;",category:"f",emoji_order:"2260"},{name:"flag-fi",unicode:"1f1eb-1f1ee",shortname:":flag-fi:",code_decimal:"&#127467;&#127470;",category:"f",emoji_order:"2261"},{name:"flag-fj",unicode:"1f1eb-1f1ef",shortname:":flag-fj:",code_decimal:"&#127467;&#127471;",category:"f",emoji_order:"2262"},{name:"flag-fk",unicode:"1f1eb-1f1f0",shortname:":flag-fk:",code_decimal:"&#127467;&#127472;",category:"f",emoji_order:"2263"},{name:"flag-fm",unicode:"1f1eb-1f1f2",shortname:":flag-fm:",code_decimal:"&#127467;&#127474;",category:"f",emoji_order:"2264"},{name:"flag-fo",unicode:"1f1eb-1f1f4",shortname:":flag-fo:",code_decimal:"&#127467;&#127476;",category:"f",emoji_order:"2265"},{name:"flag-fr",unicode:"1f1eb-1f1f7",shortname:":flag-fr:",code_decimal:"&#127467;&#127479;",category:"f",emoji_order:"2266"},{name:"flag-ga",unicode:"1f1ec-1f1e6",shortname:":flag-ga:",code_decimal:"&#127468;&#127462;",category:"f",emoji_order:"2267"},{name:"flag-gb",unicode:"1f1ec-1f1e7",shortname:":flag-gb:",code_decimal:"&#127468;&#127463;",category:"f",emoji_order:"2268"},{name:"flag-gd",unicode:"1f1ec-1f1e9",shortname:":flag-gd:",code_decimal:"&#127468;&#127465;",category:"f",emoji_order:"2269"},{name:"flag-ge",unicode:"1f1ec-1f1ea",shortname:":flag-ge:",code_decimal:"&#127468;&#127466;",category:"f",emoji_order:"2270"},{name:"flag-gf",unicode:"1f1ec-1f1eb",shortname:":flag-gf:",code_decimal:"&#127468;&#127467;",category:"f",emoji_order:"2271"},{name:"flag-gg",unicode:"1f1ec-1f1ec",shortname:":flag-gg:",code_decimal:"&#127468;&#127468;",category:"f",emoji_order:"2272"},{name:"flag-gh",unicode:"1f1ec-1f1ed",shortname:":flag-gh:",code_decimal:"&#127468;&#127469;",category:"f",emoji_order:"2273"},{name:"flag-gi",unicode:"1f1ec-1f1ee",shortname:":flag-gi:",code_decimal:"&#127468;&#127470;",category:"f",emoji_order:"2274"},{name:"flag-gl",unicode:"1f1ec-1f1f1",shortname:":flag-gl:",code_decimal:"&#127468;&#127473;",category:"f",emoji_order:"2275"},{name:"flag-gm",unicode:"1f1ec-1f1f2",shortname:":flag-gm:",code_decimal:"&#127468;&#127474;",category:"f",emoji_order:"2276"},{name:"flag-gn",unicode:"1f1ec-1f1f3",shortname:":flag-gn:",code_decimal:"&#127468;&#127475;",category:"f",emoji_order:"2277"},{name:"flag-gp",unicode:"1f1ec-1f1f5",shortname:":flag-gp:",code_decimal:"&#127468;&#127477;",category:"f",emoji_order:"2278"},{name:"flag-gq",unicode:"1f1ec-1f1f6",shortname:":flag-gq:",code_decimal:"&#127468;&#127478;",category:"f",emoji_order:"2279"},{name:"flag-gr",unicode:"1f1ec-1f1f7",shortname:":flag-gr:",code_decimal:"&#127468;&#127479;",category:"f",emoji_order:"2280"},{name:"flag-gs",unicode:"1f1ec-1f1f8",shortname:":flag-gs:",code_decimal:"&#127468;&#127480;",category:"f",emoji_order:"2281"},{name:"flag-gt",unicode:"1f1ec-1f1f9",shortname:":flag-gt:",code_decimal:"&#127468;&#127481;",category:"f",emoji_order:"2282"},{name:"flag-gu",unicode:"1f1ec-1f1fa",shortname:":flag-gu:",code_decimal:"&#127468;&#127482;",category:"f",emoji_order:"2283"},{name:"flag-gw",unicode:"1f1ec-1f1fc",shortname:":flag-gw:",code_decimal:"&#127468;&#127484;",category:"f",emoji_order:"2284"},{name:"flag-gy",unicode:"1f1ec-1f1fe",shortname:":flag-gy:",code_decimal:"&#127468;&#127486;",category:"f",emoji_order:"2285"},{name:"flag-hk",unicode:"1f1ed-1f1f0",shortname:":flag-hk:",code_decimal:"&#127469;&#127472;",category:"f",emoji_order:"2286"},{name:"flag-hm",unicode:"1f1ed-1f1f2",shortname:":flag-hm:",code_decimal:"&#127469;&#127474;",category:"f",emoji_order:"2287"},{name:"flag-hn",unicode:"1f1ed-1f1f3",shortname:":flag-hn:",code_decimal:"&#127469;&#127475;",category:"f",emoji_order:"2288"},{name:"flag-hr",unicode:"1f1ed-1f1f7",shortname:":flag-hr:",code_decimal:"&#127469;&#127479;",category:"f",emoji_order:"2289"},{name:"flag-ht",unicode:"1f1ed-1f1f9",shortname:":flag-ht:",code_decimal:"&#127469;&#127481;",category:"f",emoji_order:"2290"},{name:"flag-hu",unicode:"1f1ed-1f1fa",shortname:":flag-hu:",code_decimal:"&#127469;&#127482;",category:"f",emoji_order:"2291"},{name:"flag-ic",unicode:"1f1ee-1f1e8",shortname:":flag-ic:",code_decimal:"&#127470;&#127464;",category:"f",emoji_order:"2292"},{name:"flag-id",unicode:"1f1ee-1f1e9",shortname:":flag-id:",code_decimal:"&#127470;&#127465;",category:"f",emoji_order:"2293"},{name:"flag-ie",unicode:"1f1ee-1f1ea",shortname:":flag-ie:",code_decimal:"&#127470;&#127466;",category:"f",emoji_order:"2294"},{name:"flag-il",unicode:"1f1ee-1f1f1",shortname:":flag-il:",code_decimal:"&#127470;&#127473;",category:"f",emoji_order:"2295"},{name:"flag-im",unicode:"1f1ee-1f1f2",shortname:":flag-im:",code_decimal:"&#127470;&#127474;",category:"f",emoji_order:"2296"},{name:"flag-in",unicode:"1f1ee-1f1f3",shortname:":flag-in:",code_decimal:"&#127470;&#127475;",category:"f",emoji_order:"2297"},{name:"flag-io",unicode:"1f1ee-1f1f4",shortname:":flag-io:",code_decimal:"&#127470;&#127476;",category:"f",emoji_order:"2298"},{name:"flag-iq",unicode:"1f1ee-1f1f6",shortname:":flag-iq:",code_decimal:"&#127470;&#127478;",category:"f",emoji_order:"2299"},{name:"flag-ir",unicode:"1f1ee-1f1f7",shortname:":flag-ir:",code_decimal:"&#127470;&#127479;",category:"f",emoji_order:"2300"},{name:"flag-is",unicode:"1f1ee-1f1f8",shortname:":flag-is:",code_decimal:"&#127470;&#127480;",category:"f",emoji_order:"2301"},{name:"flag-it",unicode:"1f1ee-1f1f9",shortname:":flag-it:",code_decimal:"&#127470;&#127481;",category:"f",emoji_order:"2302"},{name:"flag-je",unicode:"1f1ef-1f1ea",shortname:":flag-je:",code_decimal:"&#127471;&#127466;",category:"f",emoji_order:"2303"},{name:"flag-jm",unicode:"1f1ef-1f1f2",shortname:":flag-jm:",code_decimal:"&#127471;&#127474;",category:"f",emoji_order:"2304"},{name:"flag-jo",unicode:"1f1ef-1f1f4",shortname:":flag-jo:",code_decimal:"&#127471;&#127476;",category:"f",emoji_order:"2305"},{name:"flag-jp",unicode:"1f1ef-1f1f5",shortname:":flag-jp:",code_decimal:"&#127471;&#127477;",category:"f",emoji_order:"2306"},{name:"flag-ke",unicode:"1f1f0-1f1ea",shortname:":flag-ke:",code_decimal:"&#127472;&#127466;",category:"f",emoji_order:"2307"},{name:"flag-kg",unicode:"1f1f0-1f1ec",shortname:":flag-kg:",code_decimal:"&#127472;&#127468;",category:"f",emoji_order:"2308"},{name:"flag-kh",unicode:"1f1f0-1f1ed",shortname:":flag-kh:",code_decimal:"&#127472;&#127469;",category:"f",emoji_order:"2309"},{name:"flag-ki",unicode:"1f1f0-1f1ee",shortname:":flag-ki:",code_decimal:"&#127472;&#127470;",category:"f",emoji_order:"2310"},{name:"flag-km",unicode:"1f1f0-1f1f2",shortname:":flag-km:",code_decimal:"&#127472;&#127474;",category:"f",emoji_order:"2311"},{name:"flag-kn",unicode:"1f1f0-1f1f3",shortname:":flag-kn:",code_decimal:"&#127472;&#127475;",category:"f",emoji_order:"2312"},{name:"flag-kp",unicode:"1f1f0-1f1f5",shortname:":flag-kp:",code_decimal:"&#127472;&#127477;",category:"f",emoji_order:"2313"},{name:"flag-kr",unicode:"1f1f0-1f1f7",shortname:":flag-kr:",code_decimal:"&#127472;&#127479;",category:"f",emoji_order:"2314"},{name:"flag-kw",unicode:"1f1f0-1f1fc",shortname:":flag-kw:",code_decimal:"&#127472;&#127484;",category:"f",emoji_order:"2315"},{name:"flag-ky",unicode:"1f1f0-1f1fe",shortname:":flag-ky:",code_decimal:"&#127472;&#127486;",category:"f",emoji_order:"2316"},{name:"flag-kz",unicode:"1f1f0-1f1ff",shortname:":flag-kz:",code_decimal:"&#127472;&#127487;",category:"f",emoji_order:"2317"},{name:"flag-la",unicode:"1f1f1-1f1e6",shortname:":flag-la:",code_decimal:"&#127473;&#127462;",category:"f",emoji_order:"2318"},{name:"flag-lb",unicode:"1f1f1-1f1e7",shortname:":flag-lb:",code_decimal:"&#127473;&#127463;",category:"f",emoji_order:"2319"},{name:"flag-lc",unicode:"1f1f1-1f1e8",shortname:":flag-lc:",code_decimal:"&#127473;&#127464;",category:"f",emoji_order:"2320"},{name:"flag-li",unicode:"1f1f1-1f1ee",shortname:":flag-li:",code_decimal:"&#127473;&#127470;",category:"f",emoji_order:"2321"},{name:"flag-lk",unicode:"1f1f1-1f1f0",shortname:":flag-lk:",code_decimal:"&#127473;&#127472;",category:"f",emoji_order:"2322"},{name:"flag-lr",unicode:"1f1f1-1f1f7",shortname:":flag-lr:",code_decimal:"&#127473;&#127479;",category:"f",emoji_order:"2323"},{name:"flag-ls",unicode:"1f1f1-1f1f8",shortname:":flag-ls:",code_decimal:"&#127473;&#127480;",category:"f",emoji_order:"2324"},{name:"flag-lt",unicode:"1f1f1-1f1f9",shortname:":flag-lt:",code_decimal:"&#127473;&#127481;",category:"f",emoji_order:"2325"},{name:"flag-lu",unicode:"1f1f1-1f1fa",shortname:":flag-lu:",code_decimal:"&#127473;&#127482;",category:"f",emoji_order:"2326"},{name:"flag-lv",unicode:"1f1f1-1f1fb",shortname:":flag-lv:",code_decimal:"&#127473;&#127483;",category:"f",emoji_order:"2327"},{name:"flag-ly",unicode:"1f1f1-1f1fe",shortname:":flag-ly:",code_decimal:"&#127473;&#127486;",category:"f",emoji_order:"2328"},{name:"flag-ma",unicode:"1f1f2-1f1e6",shortname:":flag-ma:",code_decimal:"&#127474;&#127462;",category:"f",emoji_order:"2329"},{name:"flag-mc",unicode:"1f1f2-1f1e8",shortname:":flag-mc:",code_decimal:"&#127474;&#127464;",category:"f",emoji_order:"2330"},{name:"flag-md",unicode:"1f1f2-1f1e9",shortname:":flag-md:",code_decimal:"&#127474;&#127465;",category:"f",emoji_order:"2331"},{name:"flag-me",unicode:"1f1f2-1f1ea",shortname:":flag-me:",code_decimal:"&#127474;&#127466;",category:"f",emoji_order:"2332"},{name:"flag-mf",unicode:"1f1f2-1f1eb",shortname:":flag-mf:",code_decimal:"&#127474;&#127467;",category:"f",emoji_order:"2333"},{name:"flag-mg",unicode:"1f1f2-1f1ec",shortname:":flag-mg:",code_decimal:"&#127474;&#127468;",category:"f",emoji_order:"2334"},{name:"flag-mh",unicode:"1f1f2-1f1ed",shortname:":flag-mh:",code_decimal:"&#127474;&#127469;",category:"f",emoji_order:"2335"},{name:"flag-mk",unicode:"1f1f2-1f1f0",shortname:":flag-mk:",code_decimal:"&#127474;&#127472;",category:"f",emoji_order:"2336"},{name:"flag-ml",unicode:"1f1f2-1f1f1",shortname:":flag-ml:",code_decimal:"&#127474;&#127473;",category:"f",emoji_order:"2337"},{name:"flag-mm",unicode:"1f1f2-1f1f2",shortname:":flag-mm:",code_decimal:"&#127474;&#127474;",category:"f",emoji_order:"2338"},{name:"flag-mn",unicode:"1f1f2-1f1f3",shortname:":flag-mn:",code_decimal:"&#127474;&#127475;",category:"f",emoji_order:"2339"},{name:"flag-mo",unicode:"1f1f2-1f1f4",shortname:":flag-mo:",code_decimal:"&#127474;&#127476;",category:"f",emoji_order:"2340"},{name:"flag-mp",unicode:"1f1f2-1f1f5",shortname:":flag-mp:",code_decimal:"&#127474;&#127477;",category:"f",emoji_order:"2341"},{name:"flag-mq",unicode:"1f1f2-1f1f6",shortname:":flag-mq:",code_decimal:"&#127474;&#127478;",category:"f",emoji_order:"2342"},{name:"flag-mr",unicode:"1f1f2-1f1f7",shortname:":flag-mr:",code_decimal:"&#127474;&#127479;",category:"f",emoji_order:"2343"},{name:"flag-ms",unicode:"1f1f2-1f1f8",shortname:":flag-ms:",code_decimal:"&#127474;&#127480;",category:"f",emoji_order:"2344"},{name:"flag-mt",unicode:"1f1f2-1f1f9",shortname:":flag-mt:",code_decimal:"&#127474;&#127481;",category:"f",emoji_order:"2345"},{name:"flag-mu",unicode:"1f1f2-1f1fa",shortname:":flag-mu:",code_decimal:"&#127474;&#127482;",category:"f",emoji_order:"2346"},{name:"flag-mv",unicode:"1f1f2-1f1fb",shortname:":flag-mv:",code_decimal:"&#127474;&#127483;",category:"f",emoji_order:"2347"},{name:"flag-mw",unicode:"1f1f2-1f1fc",shortname:":flag-mw:",code_decimal:"&#127474;&#127484;",category:"f",emoji_order:"2348"},{name:"flag-mx",unicode:"1f1f2-1f1fd",shortname:":flag-mx:",code_decimal:"&#127474;&#127485;",category:"f",emoji_order:"2349"},{name:"flag-my",unicode:"1f1f2-1f1fe",shortname:":flag-my:",code_decimal:"&#127474;&#127486;",category:"f",emoji_order:"2350"},{name:"flag-mz",unicode:"1f1f2-1f1ff",shortname:":flag-mz:",code_decimal:"&#127474;&#127487;",category:"f",emoji_order:"2351"},{name:"flag-na",unicode:"1f1f3-1f1e6",shortname:":flag-na:",code_decimal:"&#127475;&#127462;",category:"f",emoji_order:"2352"},{name:"flag-nc",unicode:"1f1f3-1f1e8",shortname:":flag-nc:",code_decimal:"&#127475;&#127464;",category:"f",emoji_order:"2353"},{name:"flag-ne",unicode:"1f1f3-1f1ea",shortname:":flag-ne:",code_decimal:"&#127475;&#127466;",category:"f",emoji_order:"2354"},{name:"flag-nf",unicode:"1f1f3-1f1eb",shortname:":flag-nf:",code_decimal:"&#127475;&#127467;",category:"f",emoji_order:"2355"},{name:"flag-ng",unicode:"1f1f3-1f1ec",shortname:":flag-ng:",code_decimal:"&#127475;&#127468;",category:"f",emoji_order:"2356"},{name:"flag-ni",unicode:"1f1f3-1f1ee",shortname:":flag-ni:",code_decimal:"&#127475;&#127470;",category:"f",emoji_order:"2357"},{name:"flag-nl",unicode:"1f1f3-1f1f1",shortname:":flag-nl:",code_decimal:"&#127475;&#127473;",category:"f",emoji_order:"2358"},{name:"flag-no",unicode:"1f1f3-1f1f4",shortname:":flag-no:",code_decimal:"&#127475;&#127476;",category:"f",emoji_order:"2359"},{name:"flag-np",unicode:"1f1f3-1f1f5",shortname:":flag-np:",code_decimal:"&#127475;&#127477;",category:"f",emoji_order:"2360"},{name:"flag-nr",unicode:"1f1f3-1f1f7",shortname:":flag-nr:",code_decimal:"&#127475;&#127479;",category:"f",emoji_order:"2361"},{name:"flag-nu",unicode:"1f1f3-1f1fa",shortname:":flag-nu:",code_decimal:"&#127475;&#127482;",category:"f",emoji_order:"2362"},{name:"flag-nz",unicode:"1f1f3-1f1ff",shortname:":flag-nz:",code_decimal:"&#127475;&#127487;",category:"f",emoji_order:"2363"},{name:"flag-om",unicode:"1f1f4-1f1f2",shortname:":flag-om:",code_decimal:"&#127476;&#127474;",category:"f",emoji_order:"2364"},{name:"flag-pa",unicode:"1f1f5-1f1e6",shortname:":flag-pa:",code_decimal:"&#127477;&#127462;",category:"f",emoji_order:"2365"},{name:"flag-pe",unicode:"1f1f5-1f1ea",shortname:":flag-pe:",code_decimal:"&#127477;&#127466;",category:"f",emoji_order:"2366"},{name:"flag-pf",unicode:"1f1f5-1f1eb",shortname:":flag-pf:",code_decimal:"&#127477;&#127467;",category:"f",emoji_order:"2367"},{name:"flag-pg",unicode:"1f1f5-1f1ec",shortname:":flag-pg:",code_decimal:"&#127477;&#127468;",category:"f",emoji_order:"2368"},{name:"flag-ph",unicode:"1f1f5-1f1ed",shortname:":flag-ph:",code_decimal:"&#127477;&#127469;",category:"f",emoji_order:"2369"},{name:"flag-pk",unicode:"1f1f5-1f1f0",shortname:":flag-pk:",code_decimal:"&#127477;&#127472;",category:"f",emoji_order:"2370"},{name:"flag-pl",unicode:"1f1f5-1f1f1",shortname:":flag-pl:",code_decimal:"&#127477;&#127473;",category:"f",emoji_order:"2371"},{name:"flag-pm",unicode:"1f1f5-1f1f2",shortname:":flag-pm:",code_decimal:"&#127477;&#127474;",category:"f",emoji_order:"2372"},{name:"flag-pn",unicode:"1f1f5-1f1f3",shortname:":flag-pn:",code_decimal:"&#127477;&#127475;",category:"f",emoji_order:"2373"},{name:"flag-pr",unicode:"1f1f5-1f1f7",shortname:":flag-pr:",code_decimal:"&#127477;&#127479;",category:"f",emoji_order:"2374"},{name:"flag-ps",unicode:"1f1f5-1f1f8",shortname:":flag-ps:",code_decimal:"&#127477;&#127480;",category:"f",emoji_order:"2375"},{name:"flag-pt",unicode:"1f1f5-1f1f9",shortname:":flag-pt:",code_decimal:"&#127477;&#127481;",category:"f",emoji_order:"2376"},{name:"flag-pw",unicode:"1f1f5-1f1fc",shortname:":flag-pw:",code_decimal:"&#127477;&#127484;",category:"f",emoji_order:"2377"},{name:"flag-py",unicode:"1f1f5-1f1fe",shortname:":flag-py:",code_decimal:"&#127477;&#127486;",category:"f",emoji_order:"2378"},{name:"flag-qa",unicode:"1f1f6-1f1e6",shortname:":flag-qa:",code_decimal:"&#127478;&#127462;",category:"f",emoji_order:"2379"},{name:"flag-re",unicode:"1f1f7-1f1ea",shortname:":flag-re:",code_decimal:"&#127479;&#127466;",category:"f",emoji_order:"2380"},{name:"flag-ro",unicode:"1f1f7-1f1f4",shortname:":flag-ro:",code_decimal:"&#127479;&#127476;",category:"f",emoji_order:"2381"},{name:"flag-rs",unicode:"1f1f7-1f1f8",shortname:":flag-rs:",code_decimal:"&#127479;&#127480;",category:"f",emoji_order:"2382"},{name:"flag-ru",unicode:"1f1f7-1f1fa",shortname:":flag-ru:",code_decimal:"&#127479;&#127482;",category:"f",emoji_order:"2383"},{name:"flag-rw",unicode:"1f1f7-1f1fc",shortname:":flag-rw:",code_decimal:"&#127479;&#127484;",category:"f",emoji_order:"2384"},{name:"flag-sa",unicode:"1f1f8-1f1e6",shortname:":flag-sa:",code_decimal:"&#127480;&#127462;",category:"f",emoji_order:"2385"},{name:"flag-sb",unicode:"1f1f8-1f1e7",shortname:":flag-sb:",code_decimal:"&#127480;&#127463;",category:"f",emoji_order:"2386"},{name:"flag-sc",unicode:"1f1f8-1f1e8",shortname:":flag-sc:",code_decimal:"&#127480;&#127464;",category:"f",emoji_order:"2387"},{name:"flag-sd",unicode:"1f1f8-1f1e9",shortname:":flag-sd:",code_decimal:"&#127480;&#127465;",category:"f",emoji_order:"2388"},{name:"flag-se",unicode:"1f1f8-1f1ea",shortname:":flag-se:",code_decimal:"&#127480;&#127466;",category:"f",emoji_order:"2389"},{name:"flag-sg",unicode:"1f1f8-1f1ec",shortname:":flag-sg:",code_decimal:"&#127480;&#127468;",category:"f",emoji_order:"2390"},{name:"flag-sh",unicode:"1f1f8-1f1ed",shortname:":flag-sh:",code_decimal:"&#127480;&#127469;",category:"f",emoji_order:"2391"},{name:"flag-si",unicode:"1f1f8-1f1ee",shortname:":flag-si:",code_decimal:"&#127480;&#127470;",category:"f",emoji_order:"2392"},{name:"flag-sj",unicode:"1f1f8-1f1ef",shortname:":flag-sj:",code_decimal:"&#127480;&#127471;",category:"f",emoji_order:"2393"},{name:"flag-sk",unicode:"1f1f8-1f1f0",shortname:":flag-sk:",code_decimal:"&#127480;&#127472;",category:"f",emoji_order:"2394"},{name:"flag-sl",unicode:"1f1f8-1f1f1",shortname:":flag-sl:",code_decimal:"&#127480;&#127473;",category:"f",emoji_order:"2395"},{name:"flag-sm",unicode:"1f1f8-1f1f2",shortname:":flag-sm:",code_decimal:"&#127480;&#127474;",category:"f",emoji_order:"2396"},{name:"flag-sn",unicode:"1f1f8-1f1f3",shortname:":flag-sn:",code_decimal:"&#127480;&#127475;",category:"f",emoji_order:"2397"},{name:"flag-so",unicode:"1f1f8-1f1f4",shortname:":flag-so:",code_decimal:"&#127480;&#127476;",category:"f",emoji_order:"2398"},{name:"flag-sr",unicode:"1f1f8-1f1f7",shortname:":flag-sr:",code_decimal:"&#127480;&#127479;",category:"f",emoji_order:"2399"},{name:"flag-ss",unicode:"1f1f8-1f1f8",shortname:":flag-ss:",code_decimal:"&#127480;&#127480;",category:"f",emoji_order:"2400"},{name:"flag-st",unicode:"1f1f8-1f1f9",shortname:":flag-st:",code_decimal:"&#127480;&#127481;",category:"f",emoji_order:"2401"},{name:"flag-sv",unicode:"1f1f8-1f1fb",shortname:":flag-sv:",code_decimal:"&#127480;&#127483;",category:"f",emoji_order:"2402"},{name:"flag-sx",unicode:"1f1f8-1f1fd",shortname:":flag-sx:",code_decimal:"&#127480;&#127485;",category:"f",emoji_order:"2403"},{name:"flag-sy",unicode:"1f1f8-1f1fe",shortname:":flag-sy:",code_decimal:"&#127480;&#127486;",category:"f",emoji_order:"2404"},{name:"flag-sz",unicode:"1f1f8-1f1ff",shortname:":flag-sz:",code_decimal:"&#127480;&#127487;",category:"f",emoji_order:"2405"},{name:"flag-ta",unicode:"1f1f9-1f1e6",shortname:":flag-ta:",code_decimal:"&#127481;&#127462;",category:"f",emoji_order:"2406"},{name:"flag-tc",unicode:"1f1f9-1f1e8",shortname:":flag-tc:",code_decimal:"&#127481;&#127464;",category:"f",emoji_order:"2407"},{name:"flag-td",unicode:"1f1f9-1f1e9",shortname:":flag-td:",code_decimal:"&#127481;&#127465;",category:"f",emoji_order:"2408"},{name:"flag-tf",unicode:"1f1f9-1f1eb",shortname:":flag-tf:",code_decimal:"&#127481;&#127467;",category:"f",emoji_order:"2409"},{name:"flag-tg",unicode:"1f1f9-1f1ec",shortname:":flag-tg:",code_decimal:"&#127481;&#127468;",category:"f",emoji_order:"2410"},{name:"flag-th",unicode:"1f1f9-1f1ed",shortname:":flag-th:",code_decimal:"&#127481;&#127469;",category:"f",emoji_order:"2411"},{name:"flag-tj",unicode:"1f1f9-1f1ef",shortname:":flag-tj:",code_decimal:"&#127481;&#127471;",category:"f",emoji_order:"2412"},{name:"flag-tk",unicode:"1f1f9-1f1f0",shortname:":flag-tk:",code_decimal:"&#127481;&#127472;",category:"f",emoji_order:"2413"},{name:"flag-tl",unicode:"1f1f9-1f1f1",shortname:":flag-tl:",code_decimal:"&#127481;&#127473;",category:"f",emoji_order:"2414"},{name:"flag-tm",unicode:"1f1f9-1f1f2",shortname:":flag-tm:",code_decimal:"&#127481;&#127474;",category:"f",emoji_order:"2415"},{name:"flag-tn",unicode:"1f1f9-1f1f3",shortname:":flag-tn:",code_decimal:"&#127481;&#127475;",category:"f",emoji_order:"2416"},{name:"flag-to",unicode:"1f1f9-1f1f4",shortname:":flag-to:",code_decimal:"&#127481;&#127476;",category:"f",emoji_order:"2417"},{name:"flag-tr",unicode:"1f1f9-1f1f7",shortname:":flag-tr:",code_decimal:"&#127481;&#127479;",category:"f",emoji_order:"2418"},{name:"flag-tt",unicode:"1f1f9-1f1f9",shortname:":flag-tt:",code_decimal:"&#127481;&#127481;",category:"f",emoji_order:"2419"},{name:"flag-tv",unicode:"1f1f9-1f1fb",shortname:":flag-tv:",code_decimal:"&#127481;&#127483;",category:"f",emoji_order:"2420"},{name:"flag-tw",unicode:"1f1f9-1f1fc",shortname:":flag-tw:",code_decimal:"&#127481;&#127484;",category:"f",emoji_order:"2421"},{name:"flag-tz",unicode:"1f1f9-1f1ff",shortname:":flag-tz:",code_decimal:"&#127481;&#127487;",category:"f",emoji_order:"2422"},{name:"flag-ua",unicode:"1f1fa-1f1e6",shortname:":flag-ua:",code_decimal:"&#127482;&#127462;",category:"f",emoji_order:"2423"},{name:"flag-ug",unicode:"1f1fa-1f1ec",shortname:":flag-ug:",code_decimal:"&#127482;&#127468;",category:"f",emoji_order:"2424"},{name:"flag-um",unicode:"1f1fa-1f1f2",shortname:":flag-um:",code_decimal:"&#127482;&#127474;",category:"f",emoji_order:"2425"},{name:"flag-us",unicode:"1f1fa-1f1f8",shortname:":flag-us:",code_decimal:"&#127482;&#127480;",category:"f",emoji_order:"2427"},{name:"flag-uy",unicode:"1f1fa-1f1fe",shortname:":flag-uy:",code_decimal:"&#127482;&#127486;",category:"f",emoji_order:"2428"},{name:"flag-uz",unicode:"1f1fa-1f1ff",shortname:":flag-uz:",code_decimal:"&#127482;&#127487;",category:"f",emoji_order:"2429"},{name:"flag-va",unicode:"1f1fb-1f1e6",shortname:":flag-va:",code_decimal:"&#127483;&#127462;",category:"f",emoji_order:"2430"},{name:"flag-vc",unicode:"1f1fb-1f1e8",shortname:":flag-vc:",code_decimal:"&#127483;&#127464;",category:"f",emoji_order:"2431"},{name:"flag-ve",unicode:"1f1fb-1f1ea",shortname:":flag-ve:",code_decimal:"&#127483;&#127466;",category:"f",emoji_order:"2432"},{name:"flag-vg",unicode:"1f1fb-1f1ec",shortname:":flag-vg:",code_decimal:"&#127483;&#127468;",category:"f",emoji_order:"2433"},{name:"flag-vi",unicode:"1f1fb-1f1ee",shortname:":flag-vi:",code_decimal:"&#127483;&#127470;",category:"f",emoji_order:"2434"},{name:"flag-vn",unicode:"1f1fb-1f1f3",shortname:":flag-vn:",code_decimal:"&#127483;&#127475;",category:"f",emoji_order:"2435"},{name:"flag-vu",unicode:"1f1fb-1f1fa",shortname:":flag_vu:",code_decimal:"&#127483;&#127482;",category:"f",emoji_order:"2436"},{name:"flag-wf",unicode:"1f1fc-1f1eb",shortname:":flag_wf:",code_decimal:"&#127484;&#127467;",category:"f",emoji_order:"2437"},{name:"flag-ws",unicode:"1f1fc-1f1f8",shortname:":flag_ws:",code_decimal:"&#127484;&#127480;",category:"f",emoji_order:"2438"},{name:"flag-xk",unicode:"1f1fd-1f1f0",shortname:":flag_xk:",code_decimal:"&#127485;&#127472;",category:"f",emoji_order:"2439"},{name:"flag-ye",unicode:"1f1fe-1f1ea",shortname:":flag_ye:",code_decimal:"&#127486;&#127466;",category:"f",emoji_order:"2440"},{name:"flag-yt",unicode:"1f1fe-1f1f9",shortname:":flag_yt:",code_decimal:"&#127486;&#127481;",category:"f",emoji_order:"2441"},{name:"flag-za",unicode:"1f1ff-1f1e6",shortname:":flag_za:",code_decimal:"&#127487;&#127462;",category:"f",emoji_order:"2442"},{name:"flag-zm",unicode:"1f1ff-1f1f2",shortname:":flag_zm:",code_decimal:"&#127487;&#127474;",category:"f",emoji_order:"2443"},{name:"flag-zw",unicode:"1f1ff-1f1fc",shortname:":flag_zw:",code_decimal:"&#127487;&#127484;",category:"f",emoji_order:"2444"}],n={};c.forEach(function(e){n[e.name]=e});var d=n;function i(e){return function(e){if(Array.isArray(e)){for(var o=0,a=new Array(e.length);o<e.length;o++)a[o]=e[o];return a}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function l(e,o){return!o||"object"!==t(o)&&"function"!=typeof o?function(e){if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}(e):o}function s(e,o,a){return(s="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,o,a){var r=function(e,o){for(;!Object.prototype.hasOwnProperty.call(e,o)&&null!==(e=f(e)););return e}(e,o);if(r){var c=Object.getOwnPropertyDescriptor(r,o);return c.get?c.get.call(a):c.value}})(e,o,a||e)}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e,o){return(g=Object.setPrototypeOf||function(e,o){return e.__proto__=o,e})(e,o)}var u=m.a.import("blots/embed"),h=function(e){function r(){return function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,r),l(this,f(r).apply(this,arguments))}var o,a,c;return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(o&&o.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),o&&g(e,o)}(r,u),o=r,c=[{key:"create",value:function(e){var o=s(f(r),"create",this).call(this);if("object"===t(e))r.buildSpan(e,o);else if("string"==typeof e){var a=d[e];a&&r.buildSpan(a,o)}return o}},{key:"value",value:function(e){return e.dataset.name}},{key:"buildSpan",value:function(e,o){o.setAttribute("data-name",e.name);var a=document.createElement("span");a.classList.add(this.emojiClass),a.classList.add(this.emojiPrefix+e.name),a.innerText=String.fromCodePoint.apply(String,i(r.parseUnicode(e.unicode))),o.appendChild(a)}},{key:"parseUnicode",value:function(e){return e.split("-").map(function(e){return parseInt(e,16)})}}],(a=null)&&_(o.prototype,a),c&&_(o,c),r}();h.blotName="emoji",h.className="ql-emojiblot",h.tagName="span",h.emojiClass="ap",h.emojiPrefix="ap-";var y=h,j=a(1),p=a.n(j);function b(e){return(b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function v(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function k(e){return(k=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function w(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function x(e,o){return(x=Object.setPrototypeOf||function(e,o){return e.__proto__=o,e})(e,o)}var S=m.a.import("core/module"),q=function(e){function n(e,o){var a,r,c;return function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,n),r=this,(a=!(c=k(n).call(this,e,o))||"object"!==b(c)&&"function"!=typeof c?w(r):c).emojiList=o.emojiList,a.fuse=new p.a(o.emojiList,o.fuse),a.quill=e,a.onClose=o.onClose,a.onOpen=o.onOpen,a.container=document.createElement("ul"),a.container.classList.add("emoji_completions"),a.quill.container.appendChild(a.container),a.container.style.position="absolute",a.container.style.display="none",a.onSelectionChange=a.maybeUnfocus.bind(w(a)),a.onTextChange=a.update.bind(w(a)),a.open=!1,a.atIndex=null,a.focusedButton=null,a.isWhiteSpace=function(e){var o=!1;return/\s/.test(e)&&(o=!0),o},e.keyboard.addBinding({key:186,shiftKey:!0},a.triggerPicker.bind(w(a))),e.keyboard.addBinding({key:59,shiftKey:!0},a.triggerPicker.bind(w(a))),e.keyboard.addBinding({key:39,collapsed:!0},a.handleArrow.bind(w(a))),e.keyboard.addBinding({key:40,collapsed:!0},a.handleArrow.bind(w(a))),a}var o,a,r;return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(o&&o.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),o&&x(e,o)}(n,S),o=n,(a=[{key:"triggerPicker",value:function(e,o){if(this.open)return!0;0<e.length&&this.quill.deleteText(e.index,e.length,m.a.sources.USER),this.quill.insertText(e.index,":","emoji-shortname",m.a.sources.USER);var a=this.quill.getBounds(e.index);this.quill.setSelection(e.index+1,m.a.sources.SILENT),this.atIndex=e.index,a.left+250>this.quill.container.offsetWidth?this.container.style.left=a.left-250+"px":this.container.style.left=a.left+"px",this.container.style.top=a.top+a.height+"px",this.open=!0,this.quill.on("text-change",this.onTextChange),this.quill.once("selection-change",this.onSelectionChange),this.onOpen&&this.onOpen()}},{key:"handleArrow",value:function(){if(!this.open)return!0;this.buttons[0].classList.remove("emoji-active"),this.buttons[0].focus(),1<this.buttons.length&&this.buttons[1].focus()}},{key:"update",value:function(){var e=this.quill.getSelection().index;if(this.atIndex>=e)return this.close(null);this.query=this.quill.getText(this.atIndex+1,e-this.atIndex-1);try{if(event&&this.isWhiteSpace(this.query))return void this.close(null)}catch(e){console.warn(e)}this.query=this.query.trim();var o=this.fuse.search(this.query);o.sort(function(e,o){return e.emoji_order-o.emoji_order}),this.query.length<this.options.fuse.minMatchCharLength||0===o.length?this.container.style.display="none":(15<o.length&&(o=o.slice(0,15)),this.renderCompletions(o))}},{key:"maybeUnfocus",value:function(){this.container.querySelector("*:focus")||this.close(null)}},{key:"renderCompletions",value:function(e){var n=this;try{if(event){if("Enter"===event.key||13===event.keyCode)return this.close(e[0],1),void(this.container.style.display="none");if("Tab"===event.key||9===event.keyCode)return this.quill.disable(),this.buttons[0].classList.remove("emoji-active"),void this.buttons[1].focus()}if(event)return}catch(e){console.warn(e)}for(;this.container.firstChild;)this.container.removeChild(this.container.firstChild);var d=Array(e.length);this.buttons=d;if(e.forEach(function(e,o){var a,r,c=E("li",{},E("button",{type:"button"},E("span",{className:"button-emoji ap ap-"+e.name,innerHTML:e.code_decimal}),E("span",{className:"unmatched"},e.shortname)));n.container.appendChild(c),d[o]=c.firstChild,d[o].addEventListener("keydown",(a=o,r=e,function(e){if("ArrowRight"===e.key||39===e.keyCode)e.preventDefault(),d[Math.min(d.length-1,a+1)].focus();else if("Tab"===e.key||9===e.keyCode){if(e.preventDefault(),a+1===d.length)return void d[0].focus();d[Math.min(d.length-1,a+1)].focus()}else"ArrowLeft"===e.key||37===e.keyCode?(e.preventDefault(),d[Math.max(0,a-1)].focus()):"ArrowDown"===e.key||40===e.keyCode?(e.preventDefault(),d[Math.min(d.length-1,a+1)].focus()):"ArrowUp"===e.key||38===e.keyCode?(e.preventDefault(),d[Math.max(0,a-1)].focus()):"Enter"!==e.key&&13!==e.keyCode&&" "!==e.key&&32!==e.keyCode&&"Tab"!==e.key&&9!==e.keyCode||(e.preventDefault(),n.quill.enable(),n.close(r))})),d[o].addEventListener("mousedown",function(){return n.close(e)}),d[o].addEventListener("focus",function(){return n.focusedButton=o}),d[o].addEventListener("unfocus",function(){return n.focusedButton=null})}),this.container.style.display="block",this.quill.container.classList.contains("top-emoji")){var o,a=this.container.querySelectorAll("li");for(o=0;o<a.length;o++)a[o].style.display="block";window.innerHeight/2<this.quill.container.getBoundingClientRect().top&&0<this.container.offsetHeight&&(this.container.style.top="-"+this.container.offsetHeight+"px")}d[0].classList.add("emoji-active")}},{key:"close",value:function(e){var o=this,a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:0;for(this.quill.enable(),this.container.style.display="none";this.container.firstChild;)this.container.removeChild(this.container.firstChild);this.quill.off("selection-change",this.onSelectionChange),this.quill.off("text-change",this.onTextChange),e&&(this.quill.deleteText(this.atIndex,this.query.length+1+a,m.a.sources.USER),this.quill.insertEmbed(this.atIndex,"emoji",e,m.a.sources.USER),setTimeout(function(){return o.quill.setSelection(o.atIndex+1)},0)),this.quill.focus(),this.open=!1,this.onClose&&this.onClose(e)}}])&&v(o.prototype,a),r&&v(o,r),n}();function E(e,o){var a=document.createElement(e);Object.keys(o).forEach(function(e){return a[e]=o[e]});for(var r=arguments.length,c=new Array(2<r?r-2:0),n=2;n<r;n++)c[n-2]=arguments[n];return c.forEach(function(e){"string"==typeof e&&(e=document.createTextNode(e)),a.appendChild(e)}),a}q.DEFAULTS={emojiList:c,fuse:{shouldSort:!0,threshold:.1,location:0,distance:100,maxPatternLength:32,minMatchCharLength:1,keys:["shortname"]}};var C=q;function L(e){return(L="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function O(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function M(e,o){return!o||"object"!==L(o)&&"function"!=typeof o?function(e){if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}(e):o}function z(e){return(z=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function T(e,o){return(T=Object.setPrototypeOf||function(e,o){return e.__proto__=o,e})(e,o)}m.a.import("delta");var P=m.a.import("core/module"),A=function(e){function c(e,o){var a;!function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,c),(a=M(this,z(c).call(this,e,o))).quill=e,a.toolbar=e.getModule("toolbar"),void 0!==a.toolbar&&a.toolbar.addHandler("emoji",a.checkPalatteExist);var r=document.getElementsByClassName("ql-emoji");return r&&[].slice.call(r).forEach(function(e){e.innerHTML=o.buttonIcon}),a}var o,a,r;return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(o&&o.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),o&&T(e,o)}(c,P),o=c,(a=[{key:"checkPalatteExist",value:function(){var e,o,r=this.quill;e=r,(o=document.getElementById("emoji-palette"))?o.remove():function(c){var e=document.createElement("div"),o=(document.querySelector(".ql-toolbar"),c.getSelection()),a=c.getBounds(o.index);c.container.appendChild(e);var r=a.left+250;e.id="emoji-palette",e.style.top=10+a.top+a.height+"px",r>c.container.offsetWidth?e.style.left=a.left-250+"px":e.style.left=a.left+"px";var n=document.createElement("div");n.id="tab-toolbar",e.appendChild(n);var d=document.createElement("div");d.id="tab-panel",e.appendChild(d);var i=document.createElement("ul");if(n.appendChild(i),null===document.getElementById("emoji-close-div")){var m=document.createElement("div");m.id="emoji-close-div",m.addEventListener("click",I,!1),document.getElementsByTagName("body")[0].appendChild(m)}else document.getElementById("emoji-close-div").style.display="block";[{type:"p",name:"people",content:'<div class="i-people"></div>'},{type:"n",name:"nature",content:'<div class="i-nature"></div>'},{type:"d",name:"food",content:'<div class="i-food"></div>'},{type:"s",name:"symbols",content:'<div class="i-symbols"></div>'},{type:"a",name:"activity",content:'<div class="i-activity"></div>'},{type:"t",name:"travel",content:'<div class="i-travel"></div>'},{type:"o",name:"objects",content:'<div class="i-objects"></div>'},{type:"f",name:"flags",content:'<div class="i-flags"></div>'}].map(function(e){var o=document.createElement("li");o.classList.add("emoji-tab"),o.classList.add("filter-"+e.name);var a=e.content;o.innerHTML=a,o.dataset.filter=e.type,i.appendChild(o);var r=document.querySelector(".filter-"+e.name);r.addEventListener("click",function(){var e=document.querySelector(".active");e&&e.classList.remove("active"),r.classList.toggle("active"),function(e,o,a){for(;o.firstChild;)o.removeChild(o.firstChild);R(e.dataset.filter,o,a)}(r,d,c)})}),R("p",d,c),document.querySelector(".filter-people").classList.add("active")}(e),this.quill.on("text-change",function(e,o,a){"user"===a&&(I(),B(r))})}}])&&O(o.prototype,a),r&&O(o,r),c}();function I(){var e=document.getElementById("emoji-palette");document.getElementById("emoji-close-div").style.display="none",e&&e.remove()}function B(e){return e.getSelection()}function R(e,n,d){var o=new p.a(c,{shouldSort:!0,matchAllTokens:!0,threshold:.3,location:0,distance:100,maxPatternLength:32,minMatchCharLength:3,keys:["category"]}).search(e);o.sort(function(e,o){return e.emoji_order-o.emoji_order}),d.focus();var i=B(d);o.map(function(e){var o=document.createElement("span"),a=document.createTextNode(e.shortname);o.appendChild(a),o.classList.add("bem"),o.classList.add("bem-"+e.name),o.classList.add("ap"),o.classList.add("ap-"+e.name);var r=""+e.code_decimal;o.innerHTML=r+" ",n.appendChild(o);var c=document.querySelector(".bem-"+e.name);c&&c.addEventListener("click",function(){(function(e,o){var a=document.createElement(e);Object.keys(o).forEach(function(e){return a[e]=o[e]});for(var r=arguments.length,c=new Array(2<r?r-2:0),n=2;n<r;n++)c[n-2]=arguments[n];return c.forEach(function(e){"string"==typeof e&&(e=document.createTextNode(e)),a.appendChild(e)}),a})("span",{className:"ico",innerHTML:e.code_decimal+" "}).innerHTML;d.insertEmbed(i.index,"emoji",e,m.a.sources.USER),setTimeout(function(){return d.setSelection(i.index+1)},0),I()})})}A.DEFAULTS={buttonIcon:'<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'};var H=A;function N(e){return(N="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function U(e,o){for(var a=0;a<o.length;a++){var r=o[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function D(e){return(D=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function F(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function K(e,o){return(K=Object.setPrototypeOf||function(e,o){return e.__proto__=o,e})(e,o)}m.a.import("delta");var W=m.a.import("core/module"),Q=function(e){function n(e,o){var a,r,c;return function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,n),r=this,(a=!(c=D(n).call(this,e,o))||"object"!==N(c)&&"function"!=typeof c?F(r):c).quill=e,a.container=document.createElement("div"),a.container.classList.add("textarea-emoji-control"),a.container.style.position="absolute",a.container.innerHTML=o.buttonIcon,a.quill.container.appendChild(a.container),a.container.addEventListener("click",a.checkEmojiBoxExist.bind(F(a)),!1),a}var o,a,r;return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(o&&o.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),o&&K(e,o)}(n,W),o=n,(a=[{key:"checkEmojiBoxExist",value:function(){var e,o,a=document.getElementById("textarea-emoji");if(a)a.remove();else{var r=document.createElement("div");r.id="textarea-emoji",this.quill.container.appendChild(r);var c=document.createElement("div");c.id="tab-toolbar",r.appendChild(c);var n=document.createElement("ul");if(c.appendChild(n),null===document.getElementById("emoji-close-div")){var d=document.createElement("div");d.id="emoji-close-div",d.addEventListener("click",Z,!1),document.getElementsByTagName("body")[0].appendChild(d)}else document.getElementById("emoji-close-div").style.display="block";var i=document.createElement("div");i.id="tab-panel",r.appendChild(i);var m=this.quill;[{type:"p",name:"people",content:'<div class="i-people"></div>'},{type:"n",name:"nature",content:'<div class="i-nature"></div>'},{type:"d",name:"food",content:'<div class="i-food"></div>'},{type:"s",name:"symbols",content:'<div class="i-symbols"></div>'},{type:"a",name:"activity",content:'<div class="i-activity"></div>'},{type:"t",name:"travel",content:'<div class="i-travel"></div>'},{type:"o",name:"objects",content:'<div class="i-objects"></div>'},{type:"f",name:"flags",content:'<div class="i-flags"></div>'}].map(function(e){var o=document.createElement("li");o.classList.add("emoji-tab"),o.classList.add("filter-"+e.name);var a=e.content;o.innerHTML=a,o.dataset.filter=e.type,n.appendChild(o);var r=document.querySelector(".filter-"+e.name);r.addEventListener("click",function(){var e=document.getElementById("textarea-emoji"),o=e&&e.querySelector(".active");for(o&&o.classList.remove("active"),r.classList.toggle("active");i.firstChild;)i.removeChild(i.firstChild);$(r.dataset.filter,i,m)})}),window.innerHeight/2<this.quill.container.getBoundingClientRect().top&&(r.style.top="-250px"),e=i,o=this.quill,$("p",e,o),document.querySelector(".filter-people").classList.add("active")}}}])&&U(o.prototype,a),r&&U(o,r),n}();function Z(){var e=document.getElementById("textarea-emoji");document.getElementById("emoji-close-div").style.display="none",e&&e.remove()}function $(e,n,d){var o=new p.a(c,{shouldSort:!0,matchAllTokens:!0,threshold:.3,location:0,distance:100,maxPatternLength:32,minMatchCharLength:3,keys:["category"]}).search(e);o.sort(function(e,o){return e.emoji_order-o.emoji_order}),d.focus();var i=d.getSelection();o.map(function(e){var o=document.createElement("span"),a=document.createTextNode(e.shortname);o.appendChild(a),o.classList.add("bem"),o.classList.add("bem-"+e.name),o.classList.add("ap"),o.classList.add("ap-"+e.name);var r=""+e.code_decimal;o.innerHTML=r+" ",n.appendChild(o);var c=document.querySelector(".bem-"+e.name);c&&c.addEventListener("click",function(){d.insertEmbed(i.index,"emoji",e,m.a.sources.USER),setTimeout(function(){return d.setSelection(i.index+1)},0),Z()})})}Q.DEFAULTS={buttonIcon:'<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'};var J=Q;a(2);m.a.register({"formats/emoji":y,"modules/emoji-shortname":C,"modules/emoji-toolbar":H,"modules/emoji-textarea":J},!0);o.default={EmojiBlot:y,ShortNameEmoji:C,ToolbarEmoji:H,TextAreaEmoji:J}}])});
var quillMention=function(t){"use strict";function e(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var n=e(t);function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function s(t,e,n){return e&&o(t.prototype,e),n&&o(t,n),t}function r(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function a(){return a=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t},a.apply(this,arguments)}function l(t){return l=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},l(t)}function h(t,e){return h=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},h(t,e)}function u(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function c(t,e){if(e&&("object"==typeof e||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return u(t)}function d(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,i=l(t);if(e){var o=l(this).constructor;n=Reflect.construct(i,arguments,o)}else n=i.apply(this,arguments);return c(this,n)}}function f(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=l(t)););return t}function m(){return m="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var i=f(t,e);if(i){var o=Object.getOwnPropertyDescriptor(i,e);return o.get?o.get.call(arguments.length<3?t:n):o.value}},m.apply(this,arguments)}function p(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,i=new Array(e);n<e;n++)i[n]=t[n];return i}function v(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return p(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?p(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var i=0,o=function(){};return{s:o,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var s,r=!0,a=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return r=t.done,t},e:function(t){a=!0,s=t},f:function(){try{r||null==n.return||n.return()}finally{if(a)throw s}}}}var g=9,C=13,y=27,b=38,x=40;function k(t,e,n){var i=t;return Object.keys(e).forEach((function(t){n.indexOf(t)>-1?i.dataset[t]=e[t]:delete i.dataset[t]})),i}var I=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&h(t,e)}(n,t);var e=d(n);function n(t,o){var s;return i(this,n),r(u(s=e.call(this,t,o)),"hoverHandler",void 0),r(u(s),"hoverHandler",void 0),s.clickHandler=null,s.hoverHandler=null,s.mounted=!1,s}return s(n,[{key:"attach",value:function(){m(l(n.prototype),"attach",this).call(this),this.mounted||(this.mounted=!0,this.clickHandler=this.getClickHandler(),this.hoverHandler=this.getHoverHandler(),this.domNode.addEventListener("click",this.clickHandler,!1),this.domNode.addEventListener("mouseenter",this.hoverHandler,!1))}},{key:"detach",value:function(){m(l(n.prototype),"detach",this).call(this),this.mounted=!1,this.clickHandler&&(this.domNode.removeEventListener("click",this.clickHandler),this.clickHandler=null)}},{key:"getClickHandler",value:function(){var t=this;return function(e){var n=t.buildEvent("mention-clicked",e);window.dispatchEvent(n),e.preventDefault()}}},{key:"getHoverHandler",value:function(){var t=this;return function(e){var n=t.buildEvent("mention-hovered",e);window.dispatchEvent(n),e.preventDefault()}}},{key:"buildEvent",value:function(t,e){var n=new Event(t,{bubbles:!0,cancelable:!0});return n.value=a({},this.domNode.dataset),n.event=e,n}}],[{key:"create",value:function(t){var e=m(l(n),"create",this).call(this),i=document.createElement("span");return i.className="ql-mention-denotation-char",i.innerHTML=t.denotationChar,e.appendChild(i),e.innerHTML+=t.value,n.setDataValues(e,t)}},{key:"setDataValues",value:function(t,e){var n=t;return Object.keys(e).forEach((function(t){n.dataset[t]=e[t]})),n}},{key:"value",value:function(t){return t.dataset}}]),n}(n.default.import("blots/embed"));I.blotName="mention",I.tagName="span",I.className="mention",n.default.register(I);var L=function(){function t(e,n){var o=this;i(this,t),this.isOpen=!1,this.itemIndex=0,this.mentionCharPos=null,this.cursorPos=null,this.values=[],this.suspendMouseEnter=!1,this.existingSourceExecutionToken=null,this.quill=e,this.options={source:null,renderItem:function(t){return"".concat(t.value)},renderLoading:function(){return null},onSelect:function(t,e){e(t)},mentionDenotationChars:["@"],showDenotationChar:!0,allowedChars:/^[a-zA-Z0-9_]*$/,minChars:0,maxChars:31,offsetTop:2,offsetLeft:0,isolateCharacter:!1,fixMentionsToQuill:!1,positioningStrategy:"normal",defaultMenuOrientation:"bottom",blotName:"mention",dataAttributes:["id","value","denotationChar","link","target","disabled"],linkTarget:"_blank",onOpen:function(){return!0},onBeforeClose:function(){return!0},onClose:function(){return!0},listItemClass:"ql-mention-list-item",mentionContainerClass:"ql-mention-list-container",mentionListClass:"ql-mention-list",spaceAfterInsert:!0,selectKeys:[C]},a(this.options,n,{dataAttributes:Array.isArray(n.dataAttributes)?this.options.dataAttributes.concat(n.dataAttributes):this.options.dataAttributes}),this.mentionContainer=document.createElement("div"),this.mentionContainer.className=this.options.mentionContainerClass?this.options.mentionContainerClass:"",this.mentionContainer.style.cssText="display: none; position: absolute;",this.mentionContainer.onmousemove=this.onContainerMouseMove.bind(this),this.options.fixMentionsToQuill&&(this.mentionContainer.style.width="auto"),this.mentionList=document.createElement("ul"),this.mentionList.id="quill-mention-list",e.root.setAttribute("aria-owns","quill-mention-list"),this.mentionList.className=this.options.mentionListClass?this.options.mentionListClass:"",this.mentionContainer.appendChild(this.mentionList),e.on("text-change",this.onTextChange.bind(this)),e.on("selection-change",this.onSelectionChange.bind(this)),e.container.addEventListener("paste",(function(){setTimeout((function(){var t=e.getSelection();o.onSelectionChange(t)}))})),e.keyboard.addBinding({key:g},this.selectHandler.bind(this)),e.keyboard.bindings[g].unshift(e.keyboard.bindings[g].pop());var s,r=v(this.options.selectKeys);try{for(r.s();!(s=r.n()).done;){var l=s.value;e.keyboard.addBinding({key:l},this.selectHandler.bind(this))}}catch(t){r.e(t)}finally{r.f()}e.keyboard.bindings[C].unshift(e.keyboard.bindings[C].pop()),e.keyboard.addBinding({key:y},this.escapeHandler.bind(this)),e.keyboard.addBinding({key:b},this.upHandler.bind(this)),e.keyboard.addBinding({key:x},this.downHandler.bind(this))}return s(t,[{key:"selectHandler",value:function(){return!(this.isOpen&&!this.existingSourceExecutionToken)||(this.selectItem(),!1)}},{key:"escapeHandler",value:function(){return!this.isOpen||(this.existingSourceExecutionToken&&(this.existingSourceExecutionToken.abandoned=!0),this.hideMentionList(),!1)}},{key:"upHandler",value:function(){return!(this.isOpen&&!this.existingSourceExecutionToken)||(this.prevItem(),!1)}},{key:"downHandler",value:function(){return!(this.isOpen&&!this.existingSourceExecutionToken)||(this.nextItem(),!1)}},{key:"showMentionList",value:function(){"fixed"===this.options.positioningStrategy?document.body.appendChild(this.mentionContainer):this.quill.container.appendChild(this.mentionContainer),this.mentionContainer.style.visibility="hidden",this.mentionContainer.style.display="",this.mentionContainer.scrollTop=0,this.setMentionContainerPosition(),this.setIsOpen(!0)}},{key:"hideMentionList",value:function(){this.options.onBeforeClose(),this.mentionContainer.style.display="none",this.mentionContainer.remove(),this.setIsOpen(!1),this.quill.root.removeAttribute("aria-activedescendant")}},{key:"highlightItem",value:function(){for(var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],e=0;e<this.mentionList.childNodes.length;e+=1)this.mentionList.childNodes[e].classList.remove("selected");if(-1!==this.itemIndex&&"true"!==this.mentionList.childNodes[this.itemIndex].dataset.disabled&&(this.mentionList.childNodes[this.itemIndex].classList.add("selected"),this.quill.root.setAttribute("aria-activedescendant",this.mentionList.childNodes[this.itemIndex].id),t)){var n=this.mentionList.childNodes[this.itemIndex].offsetHeight,i=this.mentionList.childNodes[this.itemIndex].offsetTop,o=this.mentionContainer.scrollTop,s=o+this.mentionContainer.offsetHeight;i<o?this.mentionContainer.scrollTop=i:i>s-n&&(this.mentionContainer.scrollTop+=i-s+n)}}},{key:"getItemData",value:function(){var t=this.mentionList.childNodes[this.itemIndex].dataset.link,e=void 0!==t,n=this.mentionList.childNodes[this.itemIndex].dataset.target;return e&&(this.mentionList.childNodes[this.itemIndex].dataset.value='<a href="'.concat(t,'" target=').concat(n||this.options.linkTarget,">").concat(this.mentionList.childNodes[this.itemIndex].dataset.value)),this.mentionList.childNodes[this.itemIndex].dataset}},{key:"onContainerMouseMove",value:function(){this.suspendMouseEnter=!1}},{key:"selectItem",value:function(){var t=this;if(-1!==this.itemIndex){var e=this.getItemData();e.disabled||(this.options.onSelect(e,(function(e){t.insertItem(e)})),this.hideMentionList())}}},{key:"insertItem",value:function(t,e){var i,o=t;null!==o&&(this.options.showDenotationChar||(o.denotationChar=""),e?i=this.cursorPos:(i=this.mentionCharPos,this.quill.deleteText(this.mentionCharPos,this.cursorPos-this.mentionCharPos,n.default.sources.USER)),this.quill.insertEmbed(i,this.options.blotName,o,n.default.sources.USER),this.options.spaceAfterInsert?(this.quill.insertText(i+1," ",n.default.sources.USER),this.quill.setSelection(i+2,n.default.sources.USER)):this.quill.setSelection(i+1,n.default.sources.USER),this.hideMentionList())}},{key:"onItemMouseEnter",value:function(t){if(!this.suspendMouseEnter){var e=Number(t.target.dataset.index);Number.isNaN(e)||e===this.itemIndex||(this.itemIndex=e,this.highlightItem(!1))}}},{key:"onDisabledItemMouseEnter",value:function(t){this.suspendMouseEnter||(this.itemIndex=-1,this.highlightItem(!1))}},{key:"onItemClick",value:function(t){0===t.button&&(t.preventDefault(),t.stopImmediatePropagation(),this.itemIndex=t.currentTarget.dataset.index,this.highlightItem(),this.selectItem())}},{key:"onItemMouseDown",value:function(t){t.preventDefault(),t.stopImmediatePropagation()}},{key:"renderLoading",value:function(){if(this.options.renderLoading())if(this.mentionContainer.getElementsByClassName("ql-mention-loading").length>0)this.showMentionList();else{this.mentionList.innerHTML="";var t=document.createElement("div");t.className="ql-mention-loading",t.innerHTML=this.options.renderLoading(),this.mentionContainer.append(t),this.showMentionList()}}},{key:"removeLoading",value:function(){var t=this.mentionContainer.getElementsByClassName("ql-mention-loading");t.length>0&&t[0].remove()}},{key:"renderList",value:function(t,e,n){if(e&&e.length>0){this.removeLoading(),this.values=e,this.mentionList.innerHTML="";for(var i=-1,o=0;o<e.length;o+=1){var s=document.createElement("li");s.id="quill-mention-item-"+o,s.className=this.options.listItemClass?this.options.listItemClass:"",e[o].disabled?(s.className+=" disabled",s.setAttribute("aria-hidden","true")):-1===i&&(i=o),s.dataset.index=o,s.innerHTML=this.options.renderItem(e[o],n),e[o].disabled?s.onmouseenter=this.onDisabledItemMouseEnter.bind(this):(s.onmouseenter=this.onItemMouseEnter.bind(this),s.onmouseup=this.onItemClick.bind(this),s.onmousedown=this.onItemMouseDown.bind(this)),s.dataset.denotationChar=t,this.mentionList.appendChild(k(s,e[o],this.options.dataAttributes))}this.itemIndex=i,this.highlightItem(),this.showMentionList()}else this.hideMentionList()}},{key:"nextItem",value:function(){var t,e=0;do{e++,t=(this.itemIndex+e)%this.values.length;var n="true"===this.mentionList.childNodes[t].dataset.disabled;if(e===this.values.length+1){t=-1;break}}while(n);this.itemIndex=t,this.suspendMouseEnter=!0,this.highlightItem()}},{key:"prevItem",value:function(){var t,e=0;do{e++,t=(this.itemIndex+this.values.length-e)%this.values.length;var n="true"===this.mentionList.childNodes[t].dataset.disabled;if(e===this.values.length+1){t=-1;break}}while(n);this.itemIndex=t,this.suspendMouseEnter=!0,this.highlightItem()}},{key:"containerBottomIsNotVisible",value:function(t,e){return t+this.mentionContainer.offsetHeight+e.top>window.pageYOffset+window.innerHeight}},{key:"containerRightIsNotVisible",value:function(t,e){return!this.options.fixMentionsToQuill&&t+this.mentionContainer.offsetWidth+e.left>window.pageXOffset+document.documentElement.clientWidth}},{key:"setIsOpen",value:function(t){this.isOpen!==t&&(t?this.options.onOpen():this.options.onClose(),this.isOpen=t)}},{key:"setMentionContainerPosition",value:function(){"fixed"===this.options.positioningStrategy?this.setMentionContainerPosition_Fixed():this.setMentionContainerPosition_Normal()}},{key:"setMentionContainerPosition_Normal",value:function(){var t=this,e=this.quill.container.getBoundingClientRect(),n=this.quill.getBounds(this.mentionCharPos),i=this.mentionContainer.offsetHeight,o=this.options.offsetTop,s=this.options.offsetLeft;if(this.options.fixMentionsToQuill){this.mentionContainer.style.right="".concat(0,"px")}else s+=n.left;if(this.containerRightIsNotVisible(s,e)){var r=this.mentionContainer.offsetWidth+this.options.offsetLeft;s=e.width-r}if("top"===this.options.defaultMenuOrientation){if((o=this.options.fixMentionsToQuill?-1*(i+this.options.offsetTop):n.top-(i+this.options.offsetTop))+e.top<=0){var a=this.options.offsetTop;this.options.fixMentionsToQuill?a+=e.height:a+=n.bottom,o=a}}else if(this.options.fixMentionsToQuill?o+=e.height:o+=n.bottom,this.containerBottomIsNotVisible(o,e)){var l=-1*this.options.offsetTop;this.options.fixMentionsToQuill||(l+=n.top),o=l-i}o>=0?this.options.mentionContainerClass.split(" ").forEach((function(e){t.mentionContainer.classList.add("".concat(e,"-bottom")),t.mentionContainer.classList.remove("".concat(e,"-top"))})):this.options.mentionContainerClass.split(" ").forEach((function(e){t.mentionContainer.classList.add("".concat(e,"-top")),t.mentionContainer.classList.remove("".concat(e,"-bottom"))})),this.mentionContainer.style.top="".concat(o,"px"),this.mentionContainer.style.left="".concat(s,"px"),this.mentionContainer.style.visibility="visible"}},{key:"setMentionContainerPosition_Fixed",value:function(){var t=this;this.mentionContainer.style.position="fixed",this.mentionContainer.style.height=null;var e=this.quill.container.getBoundingClientRect(),n=this.quill.getBounds(this.mentionCharPos),i={left:e.left+n.left,top:e.top+n.top,width:0,height:n.height},o=this.options.fixMentionsToQuill?e:i,s=this.options.offsetTop,r=this.options.offsetLeft;if(this.options.fixMentionsToQuill){var a=o.right;this.mentionContainer.style.right="".concat(a,"px")}else(r+=o.left)+this.mentionContainer.offsetWidth>document.documentElement.clientWidth&&(r-=r+this.mentionContainer.offsetWidth-document.documentElement.clientWidth);var l=o.top,h=document.documentElement.clientHeight-(o.top+o.height),u=this.mentionContainer.offsetHeight<=h,c=this.mentionContainer.offsetHeight<=l;"bottom"===("top"===this.options.defaultMenuOrientation&&c?"top":"bottom"===this.options.defaultMenuOrientation&&u||h>l?"bottom":"top")?(s=o.top+o.height,u||(this.mentionContainer.style.height=h-3+"px"),this.options.mentionContainerClass.split(" ").forEach((function(e){t.mentionContainer.classList.add("".concat(e,"-bottom")),t.mentionContainer.classList.remove("".concat(e,"-top"))}))):(s=o.top-this.mentionContainer.offsetHeight,c||(this.mentionContainer.style.height=l-3+"px",s=3),this.options.mentionContainerClass.split(" ").forEach((function(e){t.mentionContainer.classList.add("".concat(e,"-top")),t.mentionContainer.classList.remove("".concat(e,"-bottom"))}))),this.mentionContainer.style.top="".concat(s,"px"),this.mentionContainer.style.left="".concat(r,"px"),this.mentionContainer.style.visibility="visible"}},{key:"getTextBeforeCursor",value:function(){var t=Math.max(0,this.cursorPos-this.options.maxChars);return this.quill.getText(t,this.cursorPos-t)}},{key:"onSomethingChange",value:function(){var t=this,e=this.quill.getSelection();if(null!=e){this.cursorPos=e.index;var n,i=this.getTextBeforeCursor(),o=(n=i,this.options.mentionDenotationChars.reduce((function(t,e){var i=n.lastIndexOf(e);return i>t.mentionCharIndex?{mentionChar:e,mentionCharIndex:i}:{mentionChar:t.mentionChar,mentionCharIndex:t.mentionCharIndex}}),{mentionChar:null,mentionCharIndex:-1})),s=o.mentionChar,r=o.mentionCharIndex;if(function(t,e,n){return t>-1&&!(n&&0!==t&&!e[t-1].match(/\s/g))}(r,i,this.options.isolateCharacter)){var a=this.cursorPos-(i.length-r);this.mentionCharPos=a;var l=i.substring(r+s.length);if(l.length>=this.options.minChars&&function(t,e){return e.test(t)}(l,this.getAllowedCharsRegex(s))){this.existingSourceExecutionToken&&(this.existingSourceExecutionToken.abandoned=!0),this.renderLoading();var h={abandoned:!1};this.existingSourceExecutionToken=h,this.options.source(l,(function(e,n){h.abandoned||(t.existingSourceExecutionToken=null,t.renderList(s,e,n))}),s)}else this.existingSourceExecutionToken&&(this.existingSourceExecutionToken.abandoned=!0),this.hideMentionList()}else this.existingSourceExecutionToken&&(this.existingSourceExecutionToken.abandoned=!0),this.hideMentionList()}}},{key:"getAllowedCharsRegex",value:function(t){return this.options.allowedChars instanceof RegExp?this.options.allowedChars:this.options.allowedChars(t)}},{key:"onTextChange",value:function(t,e,n){"user"===n&&this.onSomethingChange()}},{key:"onSelectionChange",value:function(t){t&&0===t.length?this.onSomethingChange():this.hideMentionList()}},{key:"openMenu",value:function(t){var e=this.quill.getSelection(!0);this.quill.insertText(e.index,t),this.quill.blur(),this.quill.focus()}}]),t}();return n.default.register("modules/mention",L),L}(Quill);

!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var r=e();for(var n in r)("object"==typeof exports?exports:t)[n]=r[n]}}(window,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=17)}([function(t,e,r){"use strict";var n=r(7),o="function"==typeof Symbol&&"symbol"==typeof Symbol("foo"),i=Object.prototype.toString,s=Array.prototype.concat,a=Object.defineProperty,u=r(25)(),p=a&&u,c=function(t,e,r,n){var o;(!(e in t)||"function"==typeof(o=n)&&"[object Function]"===i.call(o)&&n())&&(p?a(t,e,{configurable:!0,enumerable:!1,value:r,writable:!0}):t[e]=r)},l=function(t,e){var r=arguments.length>2?arguments[2]:{},i=n(e);o&&(i=s.call(i,Object.getOwnPropertySymbols(e)));for(var a=0;a<i.length;a+=1)c(t,i[a],e[i[a]],r[i[a]])};l.supportsDescriptors=!!p,t.exports=l},function(t,e,r){"use strict";var n=r(9);t.exports=function(){return n()&&!!Symbol.toStringTag}},function(t,e,r){"use strict";var n=SyntaxError,o=Function,i=TypeError,s=function(t){try{return o('"use strict"; return ('+t+").constructor;")()}catch(t){}},a=Object.getOwnPropertyDescriptor;if(a)try{a({},"")}catch(t){a=null}var u=function(){throw new i},p=a?function(){try{return u}catch(t){try{return a(arguments,"callee").get}catch(t){return u}}}():u,c=r(21)(),l=Object.getPrototypeOf||function(t){return t.__proto__},f={},h="undefined"==typeof Uint8Array?void 0:l(Uint8Array),y={"%AggregateError%":"undefined"==typeof AggregateError?void 0:AggregateError,"%Array%":Array,"%ArrayBuffer%":"undefined"==typeof ArrayBuffer?void 0:ArrayBuffer,"%ArrayIteratorPrototype%":c?l([][Symbol.iterator]()):void 0,"%AsyncFromSyncIteratorPrototype%":void 0,"%AsyncFunction%":f,"%AsyncGenerator%":f,"%AsyncGeneratorFunction%":f,"%AsyncIteratorPrototype%":f,"%Atomics%":"undefined"==typeof Atomics?void 0:Atomics,"%BigInt%":"undefined"==typeof BigInt?void 0:BigInt,"%Boolean%":Boolean,"%DataView%":"undefined"==typeof DataView?void 0:DataView,"%Date%":Date,"%decodeURI%":decodeURI,"%decodeURIComponent%":decodeURIComponent,"%encodeURI%":encodeURI,"%encodeURIComponent%":encodeURIComponent,"%Error%":Error,"%eval%":eval,"%EvalError%":EvalError,"%Float32Array%":"undefined"==typeof Float32Array?void 0:Float32Array,"%Float64Array%":"undefined"==typeof Float64Array?void 0:Float64Array,"%FinalizationRegistry%":"undefined"==typeof FinalizationRegistry?void 0:FinalizationRegistry,"%Function%":o,"%GeneratorFunction%":f,"%Int8Array%":"undefined"==typeof Int8Array?void 0:Int8Array,"%Int16Array%":"undefined"==typeof Int16Array?void 0:Int16Array,"%Int32Array%":"undefined"==typeof Int32Array?void 0:Int32Array,"%isFinite%":isFinite,"%isNaN%":isNaN,"%IteratorPrototype%":c?l(l([][Symbol.iterator]())):void 0,"%JSON%":"object"==typeof JSON?JSON:void 0,"%Map%":"undefined"==typeof Map?void 0:Map,"%MapIteratorPrototype%":"undefined"!=typeof Map&&c?l((new Map)[Symbol.iterator]()):void 0,"%Math%":Math,"%Number%":Number,"%Object%":Object,"%parseFloat%":parseFloat,"%parseInt%":parseInt,"%Promise%":"undefined"==typeof Promise?void 0:Promise,"%Proxy%":"undefined"==typeof Proxy?void 0:Proxy,"%RangeError%":RangeError,"%ReferenceError%":ReferenceError,"%Reflect%":"undefined"==typeof Reflect?void 0:Reflect,"%RegExp%":RegExp,"%Set%":"undefined"==typeof Set?void 0:Set,"%SetIteratorPrototype%":"undefined"!=typeof Set&&c?l((new Set)[Symbol.iterator]()):void 0,"%SharedArrayBuffer%":"undefined"==typeof SharedArrayBuffer?void 0:SharedArrayBuffer,"%String%":String,"%StringIteratorPrototype%":c?l(""[Symbol.iterator]()):void 0,"%Symbol%":c?Symbol:void 0,"%SyntaxError%":n,"%ThrowTypeError%":p,"%TypedArray%":h,"%TypeError%":i,"%Uint8Array%":"undefined"==typeof Uint8Array?void 0:Uint8Array,"%Uint8ClampedArray%":"undefined"==typeof Uint8ClampedArray?void 0:Uint8ClampedArray,"%Uint16Array%":"undefined"==typeof Uint16Array?void 0:Uint16Array,"%Uint32Array%":"undefined"==typeof Uint32Array?void 0:Uint32Array,"%URIError%":URIError,"%WeakMap%":"undefined"==typeof WeakMap?void 0:WeakMap,"%WeakRef%":"undefined"==typeof WeakRef?void 0:WeakRef,"%WeakSet%":"undefined"==typeof WeakSet?void 0:WeakSet},g={"%ArrayBufferPrototype%":["ArrayBuffer","prototype"],"%ArrayPrototype%":["Array","prototype"],"%ArrayProto_entries%":["Array","prototype","entries"],"%ArrayProto_forEach%":["Array","prototype","forEach"],"%ArrayProto_keys%":["Array","prototype","keys"],"%ArrayProto_values%":["Array","prototype","values"],"%AsyncFunctionPrototype%":["AsyncFunction","prototype"],"%AsyncGenerator%":["AsyncGeneratorFunction","prototype"],"%AsyncGeneratorPrototype%":["AsyncGeneratorFunction","prototype","prototype"],"%BooleanPrototype%":["Boolean","prototype"],"%DataViewPrototype%":["DataView","prototype"],"%DatePrototype%":["Date","prototype"],"%ErrorPrototype%":["Error","prototype"],"%EvalErrorPrototype%":["EvalError","prototype"],"%Float32ArrayPrototype%":["Float32Array","prototype"],"%Float64ArrayPrototype%":["Float64Array","prototype"],"%FunctionPrototype%":["Function","prototype"],"%Generator%":["GeneratorFunction","prototype"],"%GeneratorPrototype%":["GeneratorFunction","prototype","prototype"],"%Int8ArrayPrototype%":["Int8Array","prototype"],"%Int16ArrayPrototype%":["Int16Array","prototype"],"%Int32ArrayPrototype%":["Int32Array","prototype"],"%JSONParse%":["JSON","parse"],"%JSONStringify%":["JSON","stringify"],"%MapPrototype%":["Map","prototype"],"%NumberPrototype%":["Number","prototype"],"%ObjectPrototype%":["Object","prototype"],"%ObjProto_toString%":["Object","prototype","toString"],"%ObjProto_valueOf%":["Object","prototype","valueOf"],"%PromisePrototype%":["Promise","prototype"],"%PromiseProto_then%":["Promise","prototype","then"],"%Promise_all%":["Promise","all"],"%Promise_reject%":["Promise","reject"],"%Promise_resolve%":["Promise","resolve"],"%RangeErrorPrototype%":["RangeError","prototype"],"%ReferenceErrorPrototype%":["ReferenceError","prototype"],"%RegExpPrototype%":["RegExp","prototype"],"%SetPrototype%":["Set","prototype"],"%SharedArrayBufferPrototype%":["SharedArrayBuffer","prototype"],"%StringPrototype%":["String","prototype"],"%SymbolPrototype%":["Symbol","prototype"],"%SyntaxErrorPrototype%":["SyntaxError","prototype"],"%TypedArrayPrototype%":["TypedArray","prototype"],"%TypeErrorPrototype%":["TypeError","prototype"],"%Uint8ArrayPrototype%":["Uint8Array","prototype"],"%Uint8ClampedArrayPrototype%":["Uint8ClampedArray","prototype"],"%Uint16ArrayPrototype%":["Uint16Array","prototype"],"%Uint32ArrayPrototype%":["Uint32Array","prototype"],"%URIErrorPrototype%":["URIError","prototype"],"%WeakMapPrototype%":["WeakMap","prototype"],"%WeakSetPrototype%":["WeakSet","prototype"]},d=r(3),b=r(23),m=d.call(Function.call,Array.prototype.concat),v=d.call(Function.apply,Array.prototype.splice),x=d.call(Function.call,String.prototype.replace),w=d.call(Function.call,String.prototype.slice),j=d.call(Function.call,RegExp.prototype.exec),O=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,A=/\\(\\)?/g,P=function(t){var e=w(t,0,1),r=w(t,-1);if("%"===e&&"%"!==r)throw new n("invalid intrinsic syntax, expected closing `%`");if("%"===r&&"%"!==e)throw new n("invalid intrinsic syntax, expected opening `%`");var o=[];return x(t,O,(function(t,e,r,n){o[o.length]=r?x(n,A,"$1"):e||t})),o},S=function(t,e){var r,o=t;if(b(g,o)&&(o="%"+(r=g[o])[0]+"%"),b(y,o)){var a=y[o];if(a===f&&(a=function t(e){var r;if("%AsyncFunction%"===e)r=s("async function () {}");else if("%GeneratorFunction%"===e)r=s("function* () {}");else if("%AsyncGeneratorFunction%"===e)r=s("async function* () {}");else if("%AsyncGenerator%"===e){var n=t("%AsyncGeneratorFunction%");n&&(r=n.prototype)}else if("%AsyncIteratorPrototype%"===e){var o=t("%AsyncGenerator%");o&&(r=l(o.prototype))}return y[e]=r,r}(o)),void 0===a&&!e)throw new i("intrinsic "+t+" exists, but is not available. Please file an issue!");return{alias:r,name:o,value:a}}throw new n("intrinsic "+t+" does not exist!")};t.exports=function(t,e){if("string"!=typeof t||0===t.length)throw new i("intrinsic name must be a non-empty string");if(arguments.length>1&&"boolean"!=typeof e)throw new i('"allowMissing" argument must be a boolean');if(null===j(/^%?[^%]*%?$/g,t))throw new n("`%` may not be present anywhere but at the beginning and end of the intrinsic name");var r=P(t),o=r.length>0?r[0]:"",s=S("%"+o+"%",e),u=s.name,p=s.value,c=!1,l=s.alias;l&&(o=l[0],v(r,m([0,1],l)));for(var f=1,h=!0;f<r.length;f+=1){var g=r[f],d=w(g,0,1),x=w(g,-1);if(('"'===d||"'"===d||"`"===d||'"'===x||"'"===x||"`"===x)&&d!==x)throw new n("property names with quotes must have matching quotes");if("constructor"!==g&&h||(c=!0),b(y,u="%"+(o+="."+g)+"%"))p=y[u];else if(null!=p){if(!(g in p)){if(!e)throw new i("base intrinsic for "+t+" exists, but the property is not available.");return}if(a&&f+1>=r.length){var O=a(p,g);p=(h=!!O)&&"get"in O&&!("originalValue"in O.get)?O.get:p[g]}else h=b(p,g),p=p[g];h&&!c&&(y[u]=p)}}return p}},function(t,e,r){"use strict";var n=r(22);t.exports=Function.prototype.bind||n},function(t,e,r){"use strict";var n=r(3),o=r(2),i=o("%Function.prototype.apply%"),s=o("%Function.prototype.call%"),a=o("%Reflect.apply%",!0)||n.call(s,i),u=o("%Object.getOwnPropertyDescriptor%",!0),p=o("%Object.defineProperty%",!0),c=o("%Math.max%");if(p)try{p({},"a",{value:1})}catch(t){p=null}t.exports=function(t){var e=a(n,s,arguments);if(u&&p){var r=u(e,"length");r.configurable&&p(e,"length",{value:1+c(0,t.length-(arguments.length-1))})}return e};var l=function(){return a(n,i,arguments)};p?p(t.exports,"apply",{value:l}):t.exports.apply=l},function(t,e,r){var n=r(18),o=r(6),i=r(15),s=r(32),a=String.fromCharCode(0),u=function(t){Array.isArray(t)?this.ops=t:null!=t&&Array.isArray(t.ops)?this.ops=t.ops:this.ops=[]};u.prototype.insert=function(t,e){var r={};return 0===t.length?this:(r.insert=t,null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(r.attributes=e),this.push(r))},u.prototype.delete=function(t){return t<=0?this:this.push({delete:t})},u.prototype.retain=function(t,e){if(t<=0)return this;var r={retain:t};return null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(r.attributes=e),this.push(r)},u.prototype.push=function(t){var e=this.ops.length,r=this.ops[e-1];if(t=i(!0,{},t),"object"==typeof r){if("number"==typeof t.delete&&"number"==typeof r.delete)return this.ops[e-1]={delete:r.delete+t.delete},this;if("number"==typeof r.delete&&null!=t.insert&&(e-=1,"object"!=typeof(r=this.ops[e-1])))return this.ops.unshift(t),this;if(o(t.attributes,r.attributes)){if("string"==typeof t.insert&&"string"==typeof r.insert)return this.ops[e-1]={insert:r.insert+t.insert},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this;if("number"==typeof t.retain&&"number"==typeof r.retain)return this.ops[e-1]={retain:r.retain+t.retain},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this}}return e===this.ops.length?this.ops.push(t):this.ops.splice(e,0,t),this},u.prototype.chop=function(){var t=this.ops[this.ops.length-1];return t&&t.retain&&!t.attributes&&this.ops.pop(),this},u.prototype.filter=function(t){return this.ops.filter(t)},u.prototype.forEach=function(t){this.ops.forEach(t)},u.prototype.map=function(t){return this.ops.map(t)},u.prototype.partition=function(t){var e=[],r=[];return this.forEach((function(n){(t(n)?e:r).push(n)})),[e,r]},u.prototype.reduce=function(t,e){return this.ops.reduce(t,e)},u.prototype.changeLength=function(){return this.reduce((function(t,e){return e.insert?t+s.length(e):e.delete?t-e.delete:t}),0)},u.prototype.length=function(){return this.reduce((function(t,e){return t+s.length(e)}),0)},u.prototype.slice=function(t,e){t=t||0,"number"!=typeof e&&(e=1/0);for(var r=[],n=s.iterator(this.ops),o=0;o<e&&n.hasNext();){var i;o<t?i=n.next(t-o):(i=n.next(e-o),r.push(i)),o+=s.length(i)}return new u(r)},u.prototype.compose=function(t){var e=s.iterator(this.ops),r=s.iterator(t.ops),n=[],i=r.peek();if(null!=i&&"number"==typeof i.retain&&null==i.attributes){for(var a=i.retain;"insert"===e.peekType()&&e.peekLength()<=a;)a-=e.peekLength(),n.push(e.next());i.retain-a>0&&r.next(i.retain-a)}for(var p=new u(n);e.hasNext()||r.hasNext();)if("insert"===r.peekType())p.push(r.next());else if("delete"===e.peekType())p.push(e.next());else{var c=Math.min(e.peekLength(),r.peekLength()),l=e.next(c),f=r.next(c);if("number"==typeof f.retain){var h={};"number"==typeof l.retain?h.retain=c:h.insert=l.insert;var y=s.attributes.compose(l.attributes,f.attributes,"number"==typeof l.retain);if(y&&(h.attributes=y),p.push(h),!r.hasNext()&&o(p.ops[p.ops.length-1],h)){var g=new u(e.rest());return p.concat(g).chop()}}else"number"==typeof f.delete&&"number"==typeof l.retain&&p.push(f)}return p.chop()},u.prototype.concat=function(t){var e=new u(this.ops.slice());return t.ops.length>0&&(e.push(t.ops[0]),e.ops=e.ops.concat(t.ops.slice(1))),e},u.prototype.diff=function(t,e){if(this.ops===t.ops)return new u;var r=[this,t].map((function(e){return e.map((function(r){if(null!=r.insert)return"string"==typeof r.insert?r.insert:a;throw new Error("diff() called "+(e===t?"on":"with")+" non-document")})).join("")})),i=new u,p=n(r[0],r[1],e),c=s.iterator(this.ops),l=s.iterator(t.ops);return p.forEach((function(t){for(var e=t[1].length;e>0;){var r=0;switch(t[0]){case n.INSERT:r=Math.min(l.peekLength(),e),i.push(l.next(r));break;case n.DELETE:r=Math.min(e,c.peekLength()),c.next(r),i.delete(r);break;case n.EQUAL:r=Math.min(c.peekLength(),l.peekLength(),e);var a=c.next(r),u=l.next(r);o(a.insert,u.insert)?i.retain(r,s.attributes.diff(a.attributes,u.attributes)):i.push(u).delete(r)}e-=r}})),i.chop()},u.prototype.eachLine=function(t,e){e=e||"\n";for(var r=s.iterator(this.ops),n=new u,o=0;r.hasNext();){if("insert"!==r.peekType())return;var i=r.peek(),a=s.length(i)-r.peekLength(),p="string"==typeof i.insert?i.insert.indexOf(e,a)-a:-1;if(p<0)n.push(r.next());else if(p>0)n.push(r.next(p));else{if(!1===t(n,r.next(1).attributes||{},o))return;o+=1,n=new u}}n.length()>0&&t(n,{},o)},u.prototype.transform=function(t,e){if(e=!!e,"number"==typeof t)return this.transformPosition(t,e);for(var r=s.iterator(this.ops),n=s.iterator(t.ops),o=new u;r.hasNext()||n.hasNext();)if("insert"!==r.peekType()||!e&&"insert"===n.peekType())if("insert"===n.peekType())o.push(n.next());else{var i=Math.min(r.peekLength(),n.peekLength()),a=r.next(i),p=n.next(i);if(a.delete)continue;p.delete?o.push(p):o.retain(i,s.attributes.transform(a.attributes,p.attributes,e))}else o.retain(s.length(r.next()));return o.chop()},u.prototype.transformPosition=function(t,e){e=!!e;for(var r=s.iterator(this.ops),n=0;r.hasNext()&&n<=t;){var o=r.peekLength(),i=r.peekType();r.next(),"delete"!==i?("insert"===i&&(n<t||!e)&&(t+=o),n+=o):t-=Math.min(o,t-n)}return t},t.exports=u},function(t,e,r){var n=r(7),o=r(20),i=r(24),s=r(27),a=r(28),u=r(31),p=Date.prototype.getTime;function c(t,e,r){var h=r||{};return!!(h.strict?i(t,e):t===e)||(!t||!e||"object"!=typeof t&&"object"!=typeof e?h.strict?i(t,e):t==e:function(t,e,r){var i,h;if(typeof t!=typeof e)return!1;if(l(t)||l(e))return!1;if(t.prototype!==e.prototype)return!1;if(o(t)!==o(e))return!1;var y=s(t),g=s(e);if(y!==g)return!1;if(y||g)return t.source===e.source&&a(t)===a(e);if(u(t)&&u(e))return p.call(t)===p.call(e);var d=f(t),b=f(e);if(d!==b)return!1;if(d||b){if(t.length!==e.length)return!1;for(i=0;i<t.length;i++)if(t[i]!==e[i])return!1;return!0}if(typeof t!=typeof e)return!1;try{var m=n(t),v=n(e)}catch(t){return!1}if(m.length!==v.length)return!1;for(m.sort(),v.sort(),i=m.length-1;i>=0;i--)if(m[i]!=v[i])return!1;for(i=m.length-1;i>=0;i--)if(h=m[i],!c(t[h],e[h],r))return!1;return!0}(t,e,h))}function l(t){return null==t}function f(t){return!(!t||"object"!=typeof t||"number"!=typeof t.length)&&("function"==typeof t.copy&&"function"==typeof t.slice&&!(t.length>0&&"number"!=typeof t[0]))}t.exports=c},function(t,e,r){"use strict";var n=Array.prototype.slice,o=r(8),i=Object.keys,s=i?function(t){return i(t)}:r(19),a=Object.keys;s.shim=function(){Object.keys?function(){var t=Object.keys(arguments);return t&&t.length===arguments.length}(1,2)||(Object.keys=function(t){return o(t)?a(n.call(t)):a(t)}):Object.keys=s;return Object.keys||s},t.exports=s},function(t,e,r){"use strict";var n=Object.prototype.toString;t.exports=function(t){var e=n.call(t),r="[object Arguments]"===e;return r||(r="[object Array]"!==e&&null!==t&&"object"==typeof t&&"number"==typeof t.length&&t.length>=0&&"[object Function]"===n.call(t.callee)),r}},function(t,e,r){"use strict";t.exports=function(){if("function"!=typeof Symbol||"function"!=typeof Object.getOwnPropertySymbols)return!1;if("symbol"==typeof Symbol.iterator)return!0;var t={},e=Symbol("test"),r=Object(e);if("string"==typeof e)return!1;if("[object Symbol]"!==Object.prototype.toString.call(e))return!1;if("[object Symbol]"!==Object.prototype.toString.call(r))return!1;for(e in t[e]=42,t)return!1;if("function"==typeof Object.keys&&0!==Object.keys(t).length)return!1;if("function"==typeof Object.getOwnPropertyNames&&0!==Object.getOwnPropertyNames(t).length)return!1;var n=Object.getOwnPropertySymbols(t);if(1!==n.length||n[0]!==e)return!1;if(!Object.prototype.propertyIsEnumerable.call(t,e))return!1;if("function"==typeof Object.getOwnPropertyDescriptor){var o=Object.getOwnPropertyDescriptor(t,e);if(42!==o.value||!0!==o.enumerable)return!1}return!0}},function(t,e,r){"use strict";var n=r(2),o=r(4),i=o(n("String.prototype.indexOf"));t.exports=function(t,e){var r=n(t,!!e);return"function"==typeof r&&i(t,".prototype.")>-1?o(r):r}},function(t,e,r){"use strict";var n=function(t){return t!=t};t.exports=function(t,e){return 0===t&&0===e?1/t==1/e:t===e||!(!n(t)||!n(e))}},function(t,e,r){"use strict";var n=r(11);t.exports=function(){return"function"==typeof Object.is?Object.is:n}},function(t,e,r){"use strict";var n=r(29).functionsHaveConfigurableNames(),o=Object,i=TypeError;t.exports=function(){if(null!=this&&this!==o(this))throw new i("RegExp.prototype.flags getter called on non-object");var t="";return this.hasIndices&&(t+="d"),this.global&&(t+="g"),this.ignoreCase&&(t+="i"),this.multiline&&(t+="m"),this.dotAll&&(t+="s"),this.unicode&&(t+="u"),this.sticky&&(t+="y"),t},n&&Object.defineProperty&&Object.defineProperty(t.exports,"name",{value:"get flags"})},function(t,e,r){"use strict";var n=r(13),o=r(0).supportsDescriptors,i=Object.getOwnPropertyDescriptor;t.exports=function(){if(o&&"gim"===/a/gim.flags){var t=i(RegExp.prototype,"flags");if(t&&"function"==typeof t.get&&"boolean"==typeof RegExp.prototype.dotAll&&"boolean"==typeof RegExp.prototype.hasIndices){var e="",r={};if(Object.defineProperty(r,"hasIndices",{get:function(){e+="d"}}),Object.defineProperty(r,"sticky",{get:function(){e+="y"}}),"dy"===e)return t.get}}return n}},function(t,e,r){"use strict";var n=Object.prototype.hasOwnProperty,o=Object.prototype.toString,i=Object.defineProperty,s=Object.getOwnPropertyDescriptor,a=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===o.call(t)},u=function(t){if(!t||"[object Object]"!==o.call(t))return!1;var e,r=n.call(t,"constructor"),i=t.constructor&&t.constructor.prototype&&n.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!r&&!i)return!1;for(e in t);return void 0===e||n.call(t,e)},p=function(t,e){i&&"__proto__"===e.name?i(t,e.name,{enumerable:!0,configurable:!0,value:e.newValue,writable:!0}):t[e.name]=e.newValue},c=function(t,e){if("__proto__"===e){if(!n.call(t,e))return;if(s)return s(t,e).value}return t[e]};t.exports=function t(){var e,r,n,o,i,s,l=arguments[0],f=1,h=arguments.length,y=!1;for("boolean"==typeof l&&(y=l,l=arguments[1]||{},f=2),(null==l||"object"!=typeof l&&"function"!=typeof l)&&(l={});f<h;++f)if(null!=(e=arguments[f]))for(r in e)n=c(l,r),l!==(o=c(e,r))&&(y&&o&&(u(o)||(i=a(o)))?(i?(i=!1,s=n&&a(n)?n:[]):s=n&&u(n)?n:{},p(l,{name:r,newValue:t(y,s,o)})):void 0!==o&&p(l,{name:r,newValue:o}));return l}},function(t,e,r){"use strict";const n="undefined"==typeof URL?r(33).URL:URL,o=(t,e)=>e.some(e=>e instanceof RegExp?e.test(t):e===t),i=(t,e)=>{if(e={defaultProtocol:"http:",normalizeProtocol:!0,forceHttp:!1,forceHttps:!1,stripAuthentication:!0,stripHash:!1,stripWWW:!0,removeQueryParameters:[/^utm_\w+/i],removeTrailingSlash:!0,removeDirectoryIndex:!1,sortQueryParameters:!0,...e},Reflect.has(e,"normalizeHttps"))throw new Error("options.normalizeHttps is renamed to options.forceHttp");if(Reflect.has(e,"normalizeHttp"))throw new Error("options.normalizeHttp is renamed to options.forceHttps");if(Reflect.has(e,"stripFragment"))throw new Error("options.stripFragment is renamed to options.stripHash");if(t=t.trim(),/^data:/i.test(t))return((t,{stripHash:e})=>{const r=t.match(/^data:([^,]*?),([^#]*?)(?:#(.*))?$/);if(!r)throw new Error("Invalid URL: "+t);const n=r[1].split(";"),o=r[2],i=e?"":r[3];let s=!1;"base64"===n[n.length-1]&&(n.pop(),s=!0);const a=(n.shift()||"").toLowerCase(),u=[...n.map(t=>{let[e,r=""]=t.split("=").map(t=>t.trim());return"charset"===e&&(r=r.toLowerCase(),"us-ascii"===r)?"":`${e}${r?"="+r:""}`}).filter(Boolean)];return s&&u.push("base64"),(0!==u.length||a&&"text/plain"!==a)&&u.unshift(a),`data:${u.join(";")},${s?o.trim():o}${i?"#"+i:""}`})(t,e);const r=t.startsWith("//");!r&&/^\.*\//.test(t)||(t=t.replace(/^(?!(?:\w+:)?\/\/)|^\/\//,e.defaultProtocol));const i=new n(t);if(e.forceHttp&&e.forceHttps)throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");if(e.forceHttp&&"https:"===i.protocol&&(i.protocol="http:"),e.forceHttps&&"http:"===i.protocol&&(i.protocol="https:"),e.stripAuthentication&&(i.username="",i.password=""),e.stripHash&&(i.hash=""),i.pathname&&(i.pathname=i.pathname.replace(/((?!:).|^)\/{2,}/g,(t,e)=>/^(?!\/)/g.test(e)?e+"/":"/")),i.pathname&&(i.pathname=decodeURI(i.pathname)),!0===e.removeDirectoryIndex&&(e.removeDirectoryIndex=[/^index\.[a-z]+$/]),Array.isArray(e.removeDirectoryIndex)&&e.removeDirectoryIndex.length>0){let t=i.pathname.split("/");const r=t[t.length-1];o(r,e.removeDirectoryIndex)&&(t=t.slice(0,t.length-1),i.pathname=t.slice(1).join("/")+"/")}if(i.hostname&&(i.hostname=i.hostname.replace(/\.$/,""),e.stripWWW&&/^www\.([a-z\-\d]{2,63})\.([a-z.]{2,5})$/.test(i.hostname)&&(i.hostname=i.hostname.replace(/^www\./,""))),Array.isArray(e.removeQueryParameters))for(const t of[...i.searchParams.keys()])o(t,e.removeQueryParameters)&&i.searchParams.delete(t);return e.sortQueryParameters&&i.searchParams.sort(),e.removeTrailingSlash&&(i.pathname=i.pathname.replace(/\/$/,"")),t=i.toString(),!e.removeTrailingSlash&&"/"!==i.pathname||""!==i.hash||(t=t.replace(/\/$/,"")),r&&!e.normalizeProtocol&&(t=t.replace(/^http:\/\//,"//")),e.stripProtocol&&(t=t.replace(/^(?:https?:)?\/\//,"")),t};t.exports=i,t.exports.default=i},function(t,e,r){"use strict";r.r(e),r.d(e,"default",(function(){return y}));var n=r(5),o=r.n(n),i=r(16),s=r.n(i);function a(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null==r)return;var n,o,i=[],s=!0,a=!1;try{for(r=r.call(t);!(s=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);s=!0);}catch(t){a=!0,o=t}finally{try{s||null==r.return||r.return()}finally{if(a)throw o}}return i}(t,e)||function(t,e){if(!t)return;if("string"==typeof t)return u(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return u(t,e)}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function p(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function c(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?p(Object(r),!0).forEach((function(e){l(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function l(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function f(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var h={globalRegularExpression:/(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,urlRegularExpression:/(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,globalMailRegularExpression:/([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,mailRegularExpression:/([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,normalizeRegularExpression:/(https?:\/\/|www\.)[\S]+/i,normalizeUrlOptions:{stripWWW:!1}},y=function(){function t(e,r){var n=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.quill=e,r=r||{},this.options=c(c({},h),r),this.urlNormalizer=function(t){return n.normalize(t)},this.mailNormalizer=function(t){return"mailto:".concat(t)},this.registerTypeListener(),this.registerPasteListener(),this.registerBlurListener()}var e,r,n;return e=t,(r=[{key:"registerPasteListener",value:function(){var t=this;this.quill.clipboard.addMatcher("A",(function(t,e){var r,n=t.getAttribute("href"),o=null===(r=e.ops[0])||void 0===r?void 0:r.attributes;return null!=(null==o?void 0:o.link)&&(o.link=n),e})),this.quill.clipboard.addMatcher(Node.TEXT_NODE,(function(e,r){if("string"==typeof e.data){var n=t.options.globalRegularExpression,i=t.options.globalMailRegularExpression;n.lastIndex=0,i.lastIndex=0;for(var s=new o.a,a=0,u=n.exec(e.data),p=i.exec(e.data),c=function(t,r,n){var o=e.data.substring(a,t.index);s.insert(o);var i=t[0];return s.insert(i,{link:n(i)}),a=r.lastIndex,r.exec(e.data)};null!==u||null!==p;)if(null===u)p=c(p,i,t.mailNormalizer);else if(null===p)u=c(u,n,t.urlNormalizer);else if(p.index<=u.index){for(;null!==u&&u.index<i.lastIndex;)u=n.exec(e.data);p=c(p,i,t.mailNormalizer)}else{for(;null!==p&&p.index<n.lastIndex;)p=i.exec(e.data);u=c(u,n,t.urlNormalizer)}if(a>0){var l=e.data.substring(a);s.insert(l),r.ops=s.ops}return r}}))}},{key:"registerTypeListener",value:function(){var t=this;this.quill.on("text-change",(function(e){var r=e.ops;if(!(!r||r.length<1||r.length>2)){var n=r[r.length-1];n.insert&&"string"==typeof n.insert&&n.insert.match(/\s/)&&t.checkTextForUrl(!!n.insert.match(/ |\t/))}}))}},{key:"registerBlurListener",value:function(){var t=this;this.quill.root.addEventListener("blur",(function(){t.checkTextForUrl()}))}},{key:"checkTextForUrl",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0],e=this.quill.getSelection();if(e){var r=this.quill.getLeaf(e.index),n=a(r,1),o=n[0],i=this.quill.getIndex(o);if(o.text){var s=e.index-i,u=o.text.slice(0,s);if(u&&"a"!==o.parent.domNode.localName){var p=o.text[s];if(null==p||!p.match(/\S/)){var c=t?/\s\s$/:/\s$/;if(!u.match(c)){var l=u.match(this.options.urlRegularExpression),f=u.match(this.options.mailRegularExpression);l?this.handleMatches(i,u,l,this.urlNormalizer):f&&this.handleMatches(i,u,f,this.mailNormalizer)}}}}}}},{key:"handleMatches",value:function(t,e,r,n){var o=r.pop(),i=e.lastIndexOf(o);e.split(o).pop().match(/\S/)||this.updateText(t+i,o.trim(),n)}},{key:"updateText",value:function(t,e,r){var n=(new o.a).retain(t).retain(e.length,{link:r(e)});this.quill.updateContents(n)}},{key:"normalize",value:function(t){if(this.options.normalizeRegularExpression.test(t))try{return s()(t,this.options.normalizeUrlOptions)}catch(t){console.error(t)}return t}}])&&f(e.prototype,r),n&&f(e,n),Object.defineProperty(e,"prototype",{writable:!1}),t}();null!=window&&window.Quill&&window.Quill.register("modules/magicUrl",y)},function(t,e){function r(t,e,s){if(t==e)return t?[[0,t]]:[];(s<0||t.length<s)&&(s=null);var u=o(t,e),p=t.substring(0,u);u=i(t=t.substring(u),e=e.substring(u));var c=t.substring(t.length-u),l=function(t,e){var s;if(!t)return[[1,e]];if(!e)return[[-1,t]];var a=t.length>e.length?t:e,u=t.length>e.length?e:t,p=a.indexOf(u);if(-1!=p)return s=[[1,a.substring(0,p)],[0,u],[1,a.substring(p+u.length)]],t.length>e.length&&(s[0][0]=s[2][0]=-1),s;if(1==u.length)return[[-1,t],[1,e]];var c=function(t,e){var r=t.length>e.length?t:e,n=t.length>e.length?e:t;if(r.length<4||2*n.length<r.length)return null;function s(t,e,r){for(var n,s,a,u,p=t.substring(r,r+Math.floor(t.length/4)),c=-1,l="";-1!=(c=e.indexOf(p,c+1));){var f=o(t.substring(r),e.substring(c)),h=i(t.substring(0,r),e.substring(0,c));l.length<h+f&&(l=e.substring(c-h,c)+e.substring(c,c+f),n=t.substring(0,r-h),s=t.substring(r+f),a=e.substring(0,c-h),u=e.substring(c+f))}return 2*l.length>=t.length?[n,s,a,u,l]:null}var a,u,p,c,l,f=s(r,n,Math.ceil(r.length/4)),h=s(r,n,Math.ceil(r.length/2));if(!f&&!h)return null;a=h?f&&f[4].length>h[4].length?f:h:f;t.length>e.length?(u=a[0],p=a[1],c=a[2],l=a[3]):(c=a[0],l=a[1],u=a[2],p=a[3]);var y=a[4];return[u,p,c,l,y]}(t,e);if(c){var l=c[0],f=c[1],h=c[2],y=c[3],g=c[4],d=r(l,h),b=r(f,y);return d.concat([[0,g]],b)}return function(t,e){for(var r=t.length,o=e.length,i=Math.ceil((r+o)/2),s=i,a=2*i,u=new Array(a),p=new Array(a),c=0;c<a;c++)u[c]=-1,p[c]=-1;u[s+1]=0,p[s+1]=0;for(var l=r-o,f=l%2!=0,h=0,y=0,g=0,d=0,b=0;b<i;b++){for(var m=-b+h;m<=b-y;m+=2){for(var v=s+m,x=(P=m==-b||m!=b&&u[v-1]<u[v+1]?u[v+1]:u[v-1]+1)-m;P<r&&x<o&&t.charAt(P)==e.charAt(x);)P++,x++;if(u[v]=P,P>r)y+=2;else if(x>o)h+=2;else if(f){if((O=s+l-m)>=0&&O<a&&-1!=p[O]){var w=r-p[O];if(P>=w)return n(t,e,P,x)}}}for(var j=-b+g;j<=b-d;j+=2){for(var O=s+j,A=(w=j==-b||j!=b&&p[O-1]<p[O+1]?p[O+1]:p[O-1]+1)-j;w<r&&A<o&&t.charAt(r-w-1)==e.charAt(o-A-1);)w++,A++;if(p[O]=w,w>r)d+=2;else if(A>o)g+=2;else if(!f){if((v=s+l-j)>=0&&v<a&&-1!=u[v]){var P=u[v];x=s+P-v;if(P>=(w=r-w))return n(t,e,P,x)}}}}return[[-1,t],[1,e]]}(t,e)}(t=t.substring(0,t.length-u),e=e.substring(0,e.length-u));return p&&l.unshift([0,p]),c&&l.push([0,c]),function t(e){e.push([0,""]);var r,n=0,s=0,a=0,u="",p="";for(;n<e.length;)switch(e[n][0]){case 1:a++,p+=e[n][1],n++;break;case-1:s++,u+=e[n][1],n++;break;case 0:s+a>1?(0!==s&&0!==a&&(0!==(r=o(p,u))&&(n-s-a>0&&0==e[n-s-a-1][0]?e[n-s-a-1][1]+=p.substring(0,r):(e.splice(0,0,[0,p.substring(0,r)]),n++),p=p.substring(r),u=u.substring(r)),0!==(r=i(p,u))&&(e[n][1]=p.substring(p.length-r)+e[n][1],p=p.substring(0,p.length-r),u=u.substring(0,u.length-r))),0===s?e.splice(n-a,s+a,[1,p]):0===a?e.splice(n-s,s+a,[-1,u]):e.splice(n-s-a,s+a,[-1,u],[1,p]),n=n-s-a+(s?1:0)+(a?1:0)+1):0!==n&&0==e[n-1][0]?(e[n-1][1]+=e[n][1],e.splice(n,1)):n++,a=0,s=0,u="",p=""}""===e[e.length-1][1]&&e.pop();var c=!1;n=1;for(;n<e.length-1;)0==e[n-1][0]&&0==e[n+1][0]&&(e[n][1].substring(e[n][1].length-e[n-1][1].length)==e[n-1][1]?(e[n][1]=e[n-1][1]+e[n][1].substring(0,e[n][1].length-e[n-1][1].length),e[n+1][1]=e[n-1][1]+e[n+1][1],e.splice(n-1,1),c=!0):e[n][1].substring(0,e[n+1][1].length)==e[n+1][1]&&(e[n-1][1]+=e[n+1][1],e[n][1]=e[n][1].substring(e[n+1][1].length)+e[n+1][1],e.splice(n+1,1),c=!0)),n++;c&&t(e)}(l),null!=s&&(l=function(t,e){var r=function(t,e){if(0===e)return[0,t];for(var r=0,n=0;n<t.length;n++){var o=t[n];if(-1===o[0]||0===o[0]){var i=r+o[1].length;if(e===i)return[n+1,t];if(e<i){t=t.slice();var s=e-r,a=[o[0],o[1].slice(0,s)],u=[o[0],o[1].slice(s)];return t.splice(n,1,a,u),[n+1,t]}r=i}}throw new Error("cursor_pos is out of bounds!")}(t,e),n=r[1],o=r[0],i=n[o],s=n[o+1];if(null==i)return t;if(0!==i[0])return t;if(null!=s&&i[1]+s[1]===s[1]+i[1])return n.splice(o,2,s,i),a(n,o,2);if(null!=s&&0===s[1].indexOf(i[1])){n.splice(o,2,[s[0],i[1]],[0,i[1]]);var u=s[1].slice(i[1].length);return u.length>0&&n.splice(o+2,0,[s[0],u]),a(n,o,3)}return t}(l,s)),l=function(t){for(var e=!1,r=function(t){return t.charCodeAt(0)>=56320&&t.charCodeAt(0)<=57343},n=2;n<t.length;n+=1)0===t[n-2][0]&&((o=t[n-2][1]).charCodeAt(o.length-1)>=55296&&o.charCodeAt(o.length-1)<=56319)&&-1===t[n-1][0]&&r(t[n-1][1])&&1===t[n][0]&&r(t[n][1])&&(e=!0,t[n-1][1]=t[n-2][1].slice(-1)+t[n-1][1],t[n][1]=t[n-2][1].slice(-1)+t[n][1],t[n-2][1]=t[n-2][1].slice(0,-1));var o;if(!e)return t;var i=[];for(n=0;n<t.length;n+=1)t[n][1].length>0&&i.push(t[n]);return i}(l)}function n(t,e,n,o){var i=t.substring(0,n),s=e.substring(0,o),a=t.substring(n),u=e.substring(o),p=r(i,s),c=r(a,u);return p.concat(c)}function o(t,e){if(!t||!e||t.charAt(0)!=e.charAt(0))return 0;for(var r=0,n=Math.min(t.length,e.length),o=n,i=0;r<o;)t.substring(i,o)==e.substring(i,o)?i=r=o:n=o,o=Math.floor((n-r)/2+r);return o}function i(t,e){if(!t||!e||t.charAt(t.length-1)!=e.charAt(e.length-1))return 0;for(var r=0,n=Math.min(t.length,e.length),o=n,i=0;r<o;)t.substring(t.length-o,t.length-i)==e.substring(e.length-o,e.length-i)?i=r=o:n=o,o=Math.floor((n-r)/2+r);return o}var s=r;function a(t,e,r){for(var n=e+r-1;n>=0&&n>=e-1;n--)if(n+1<t.length){var o=t[n],i=t[n+1];o[0]===i[1]&&t.splice(n,2,[o[0],o[1]+i[1]])}return t}s.INSERT=1,s.DELETE=-1,s.EQUAL=0,t.exports=s},function(t,e,r){"use strict";var n;if(!Object.keys){var o=Object.prototype.hasOwnProperty,i=Object.prototype.toString,s=r(8),a=Object.prototype.propertyIsEnumerable,u=!a.call({toString:null},"toString"),p=a.call((function(){}),"prototype"),c=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],l=function(t){var e=t.constructor;return e&&e.prototype===t},f={$applicationCache:!0,$console:!0,$external:!0,$frame:!0,$frameElement:!0,$frames:!0,$innerHeight:!0,$innerWidth:!0,$onmozfullscreenchange:!0,$onmozfullscreenerror:!0,$outerHeight:!0,$outerWidth:!0,$pageXOffset:!0,$pageYOffset:!0,$parent:!0,$scrollLeft:!0,$scrollTop:!0,$scrollX:!0,$scrollY:!0,$self:!0,$webkitIndexedDB:!0,$webkitStorageInfo:!0,$window:!0},h=function(){if("undefined"==typeof window)return!1;for(var t in window)try{if(!f["$"+t]&&o.call(window,t)&&null!==window[t]&&"object"==typeof window[t])try{l(window[t])}catch(t){return!0}}catch(t){return!0}return!1}();n=function(t){var e=null!==t&&"object"==typeof t,r="[object Function]"===i.call(t),n=s(t),a=e&&"[object String]"===i.call(t),f=[];if(!e&&!r&&!n)throw new TypeError("Object.keys called on a non-object");var y=p&&r;if(a&&t.length>0&&!o.call(t,0))for(var g=0;g<t.length;++g)f.push(String(g));if(n&&t.length>0)for(var d=0;d<t.length;++d)f.push(String(d));else for(var b in t)y&&"prototype"===b||!o.call(t,b)||f.push(String(b));if(u)for(var m=function(t){if("undefined"==typeof window||!h)return l(t);try{return l(t)}catch(t){return!1}}(t),v=0;v<c.length;++v)m&&"constructor"===c[v]||!o.call(t,c[v])||f.push(c[v]);return f}}t.exports=n},function(t,e,r){"use strict";var n=r(1)(),o=r(10)("Object.prototype.toString"),i=function(t){return!(n&&t&&"object"==typeof t&&Symbol.toStringTag in t)&&"[object Arguments]"===o(t)},s=function(t){return!!i(t)||null!==t&&"object"==typeof t&&"number"==typeof t.length&&t.length>=0&&"[object Array]"!==o(t)&&"[object Function]"===o(t.callee)},a=function(){return i(arguments)}();i.isLegacyArguments=s,t.exports=a?i:s},function(t,e,r){"use strict";var n="undefined"!=typeof Symbol&&Symbol,o=r(9);t.exports=function(){return"function"==typeof n&&("function"==typeof Symbol&&("symbol"==typeof n("foo")&&("symbol"==typeof Symbol("bar")&&o())))}},function(t,e,r){"use strict";var n="Function.prototype.bind called on incompatible ",o=Array.prototype.slice,i=Object.prototype.toString;t.exports=function(t){var e=this;if("function"!=typeof e||"[object Function]"!==i.call(e))throw new TypeError(n+e);for(var r,s=o.call(arguments,1),a=function(){if(this instanceof r){var n=e.apply(this,s.concat(o.call(arguments)));return Object(n)===n?n:this}return e.apply(t,s.concat(o.call(arguments)))},u=Math.max(0,e.length-s.length),p=[],c=0;c<u;c++)p.push("$"+c);if(r=Function("binder","return function ("+p.join(",")+"){ return binder.apply(this,arguments); }")(a),e.prototype){var l=function(){};l.prototype=e.prototype,r.prototype=new l,l.prototype=null}return r}},function(t,e,r){"use strict";var n=r(3);t.exports=n.call(Function.call,Object.prototype.hasOwnProperty)},function(t,e,r){"use strict";var n=r(0),o=r(4),i=r(11),s=r(12),a=r(26),u=o(s(),Object);n(u,{getPolyfill:s,implementation:i,shim:a}),t.exports=u},function(t,e,r){"use strict";var n=r(2)("%Object.defineProperty%",!0),o=function(){if(n)try{return n({},"a",{value:1}),!0}catch(t){return!1}return!1};o.hasArrayLengthDefineBug=function(){if(!o())return null;try{return 1!==n([],"length",{value:1}).length}catch(t){return!0}},t.exports=o},function(t,e,r){"use strict";var n=r(12),o=r(0);t.exports=function(){var t=n();return o(Object,{is:t},{is:function(){return Object.is!==t}}),t}},function(t,e,r){"use strict";var n,o,i,s,a=r(10),u=r(1)();if(u){n=a("Object.prototype.hasOwnProperty"),o=a("RegExp.prototype.exec"),i={};var p=function(){throw i};s={toString:p,valueOf:p},"symbol"==typeof Symbol.toPrimitive&&(s[Symbol.toPrimitive]=p)}var c=a("Object.prototype.toString"),l=Object.getOwnPropertyDescriptor;t.exports=u?function(t){if(!t||"object"!=typeof t)return!1;var e=l(t,"lastIndex");if(!(e&&n(e,"value")))return!1;try{o(t,s)}catch(t){return t===i}}:function(t){return!(!t||"object"!=typeof t&&"function"!=typeof t)&&"[object RegExp]"===c(t)}},function(t,e,r){"use strict";var n=r(0),o=r(4),i=r(13),s=r(14),a=r(30),u=o(s());n(u,{getPolyfill:s,implementation:i,shim:a}),t.exports=u},function(t,e,r){"use strict";var n=function(){return"string"==typeof function(){}.name},o=Object.getOwnPropertyDescriptor;if(o)try{o([],"length")}catch(t){o=null}n.functionsHaveConfigurableNames=function(){if(!n()||!o)return!1;var t=o((function(){}),"name");return!!t&&!!t.configurable};var i=Function.prototype.bind;n.boundFunctionsHaveNames=function(){return n()&&"function"==typeof i&&""!==function(){}.bind().name},t.exports=n},function(t,e,r){"use strict";var n=r(0).supportsDescriptors,o=r(14),i=Object.getOwnPropertyDescriptor,s=Object.defineProperty,a=TypeError,u=Object.getPrototypeOf,p=/a/;t.exports=function(){if(!n||!u)throw new a("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");var t=o(),e=u(p),r=i(e,"flags");return r&&r.get===t||s(e,"flags",{configurable:!0,enumerable:!1,get:t}),t}},function(t,e,r){"use strict";var n=Date.prototype.getDay,o=Object.prototype.toString,i=r(1)();t.exports=function(t){return"object"==typeof t&&null!==t&&(i?function(t){try{return n.call(t),!0}catch(t){return!1}}(t):"[object Date]"===o.call(t))}},function(t,e,r){var n=r(6),o=r(15),i={attributes:{compose:function(t,e,r){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var n=o(!0,{},e);for(var i in r||(n=Object.keys(n).reduce((function(t,e){return null!=n[e]&&(t[e]=n[e]),t}),{})),t)void 0!==t[i]&&void 0===e[i]&&(n[i]=t[i]);return Object.keys(n).length>0?n:void 0},diff:function(t,e){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var r=Object.keys(t).concat(Object.keys(e)).reduce((function(r,o){return n(t[o],e[o])||(r[o]=void 0===e[o]?null:e[o]),r}),{});return Object.keys(r).length>0?r:void 0},transform:function(t,e,r){if("object"!=typeof t)return e;if("object"==typeof e){if(!r)return e;var n=Object.keys(e).reduce((function(r,n){return void 0===t[n]&&(r[n]=e[n]),r}),{});return Object.keys(n).length>0?n:void 0}}},iterator:function(t){return new s(t)},length:function(t){return"number"==typeof t.delete?t.delete:"number"==typeof t.retain?t.retain:"string"==typeof t.insert?t.insert.length:1}};function s(t){this.ops=t,this.index=0,this.offset=0}s.prototype.hasNext=function(){return this.peekLength()<1/0},s.prototype.next=function(t){t||(t=1/0);var e=this.ops[this.index];if(e){var r=this.offset,n=i.length(e);if(t>=n-r?(t=n-r,this.index+=1,this.offset=0):this.offset+=t,"number"==typeof e.delete)return{delete:t};var o={};return e.attributes&&(o.attributes=e.attributes),"number"==typeof e.retain?o.retain=t:"string"==typeof e.insert?o.insert=e.insert.substr(r,t):o.insert=e.insert,o}return{retain:1/0}},s.prototype.peek=function(){return this.ops[this.index]},s.prototype.peekLength=function(){return this.ops[this.index]?i.length(this.ops[this.index])-this.offset:1/0},s.prototype.peekType=function(){return this.ops[this.index]?"number"==typeof this.ops[this.index].delete?"delete":"number"==typeof this.ops[this.index].retain?"retain":"insert":"retain"},s.prototype.rest=function(){if(this.hasNext()){if(0===this.offset)return this.ops.slice(this.index);var t=this.offset,e=this.index,r=this.next(),n=this.ops.slice(this.index);return this.offset=t,this.index=e,[r].concat(n)}return[]},t.exports=i},function(t,e,r){"use strict";var n=r(34),o=r(37);function i(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}e.parse=v,e.resolve=function(t,e){return v(t,!1,!0).resolve(e)},e.resolveObject=function(t,e){return t?v(t,!1,!0).resolveObject(e):e},e.format=function(t){o.isString(t)&&(t=v(t));return t instanceof i?t.format():i.prototype.format.call(t)},e.Url=i;var s=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,u=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,p=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),c=["'"].concat(p),l=["%","/","?",";","#"].concat(c),f=["/","?","#"],h=/^[+a-z0-9A-Z_-]{0,63}$/,y=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:!0,"javascript:":!0},d={javascript:!0,"javascript:":!0},b={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},m=r(38);function v(t,e,r){if(t&&o.isObject(t)&&t instanceof i)return t;var n=new i;return n.parse(t,e,r),n}i.prototype.parse=function(t,e,r){if(!o.isString(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var i=t.indexOf("?"),a=-1!==i&&i<t.indexOf("#")?"?":"#",p=t.split(a);p[0]=p[0].replace(/\\/g,"/");var v=t=p.join(a);if(v=v.trim(),!r&&1===t.split("#").length){var x=u.exec(v);if(x)return this.path=v,this.href=v,this.pathname=x[1],x[2]?(this.search=x[2],this.query=e?m.parse(this.search.substr(1)):this.search.substr(1)):e&&(this.search="",this.query={}),this}var w=s.exec(v);if(w){var j=(w=w[0]).toLowerCase();this.protocol=j,v=v.substr(w.length)}if(r||w||v.match(/^\/\/[^@\/]+@[^@\/]+/)){var O="//"===v.substr(0,2);!O||w&&d[w]||(v=v.substr(2),this.slashes=!0)}if(!d[w]&&(O||w&&!b[w])){for(var A,P,S=-1,E=0;E<f.length;E++){-1!==(k=v.indexOf(f[E]))&&(-1===S||k<S)&&(S=k)}-1!==(P=-1===S?v.lastIndexOf("@"):v.lastIndexOf("@",S))&&(A=v.slice(0,P),v=v.slice(P+1),this.auth=decodeURIComponent(A)),S=-1;for(E=0;E<l.length;E++){var k;-1!==(k=v.indexOf(l[E]))&&(-1===S||k<S)&&(S=k)}-1===S&&(S=v.length),this.host=v.slice(0,S),v=v.slice(S),this.parseHost(),this.hostname=this.hostname||"";var I="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!I)for(var R=this.hostname.split(/\./),F=(E=0,R.length);E<F;E++){var U=R[E];if(U&&!U.match(h)){for(var N="",T=0,C=U.length;T<C;T++)U.charCodeAt(T)>127?N+="x":N+=U[T];if(!N.match(h)){var $=R.slice(0,E),M=R.slice(E+1),L=U.match(y);L&&($.push(L[1]),M.unshift(L[2])),M.length&&(v="/"+M.join(".")+v),this.hostname=$.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),I||(this.hostname=n.toASCII(this.hostname));var D=this.port?":"+this.port:"",_=this.hostname||"";this.host=_+D,this.href+=this.host,I&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==v[0]&&(v="/"+v))}if(!g[j])for(E=0,F=c.length;E<F;E++){var q=c[E];if(-1!==v.indexOf(q)){var z=encodeURIComponent(q);z===q&&(z=escape(q)),v=v.split(q).join(z)}}var H=v.indexOf("#");-1!==H&&(this.hash=v.substr(H),v=v.slice(0,H));var W=v.indexOf("?");if(-1!==W?(this.search=v.substr(W),this.query=v.substr(W+1),e&&(this.query=m.parse(this.query)),v=v.slice(0,W)):e&&(this.search="",this.query={}),v&&(this.pathname=v),b[j]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){D=this.pathname||"";var B=this.search||"";this.path=D+B}return this.href=this.format(),this},i.prototype.format=function(){var t=this.auth||"";t&&(t=(t=encodeURIComponent(t)).replace(/%3A/i,":"),t+="@");var e=this.protocol||"",r=this.pathname||"",n=this.hash||"",i=!1,s="";this.host?i=t+this.host:this.hostname&&(i=t+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(i+=":"+this.port)),this.query&&o.isObject(this.query)&&Object.keys(this.query).length&&(s=m.stringify(this.query));var a=this.search||s&&"?"+s||"";return e&&":"!==e.substr(-1)&&(e+=":"),this.slashes||(!e||b[e])&&!1!==i?(i="//"+(i||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):i||(i=""),n&&"#"!==n.charAt(0)&&(n="#"+n),a&&"?"!==a.charAt(0)&&(a="?"+a),e+i+(r=r.replace(/[?#]/g,(function(t){return encodeURIComponent(t)})))+(a=a.replace("#","%23"))+n},i.prototype.resolve=function(t){return this.resolveObject(v(t,!1,!0)).format()},i.prototype.resolveObject=function(t){if(o.isString(t)){var e=new i;e.parse(t,!1,!0),t=e}for(var r=new i,n=Object.keys(this),s=0;s<n.length;s++){var a=n[s];r[a]=this[a]}if(r.hash=t.hash,""===t.href)return r.href=r.format(),r;if(t.slashes&&!t.protocol){for(var u=Object.keys(t),p=0;p<u.length;p++){var c=u[p];"protocol"!==c&&(r[c]=t[c])}return b[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(t.protocol&&t.protocol!==r.protocol){if(!b[t.protocol]){for(var l=Object.keys(t),f=0;f<l.length;f++){var h=l[f];r[h]=t[h]}return r.href=r.format(),r}if(r.protocol=t.protocol,t.host||d[t.protocol])r.pathname=t.pathname;else{for(var y=(t.pathname||"").split("/");y.length&&!(t.host=y.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==y[0]&&y.unshift(""),y.length<2&&y.unshift(""),r.pathname=y.join("/")}if(r.search=t.search,r.query=t.query,r.host=t.host||"",r.auth=t.auth,r.hostname=t.hostname||t.host,r.port=t.port,r.pathname||r.search){var g=r.pathname||"",m=r.search||"";r.path=g+m}return r.slashes=r.slashes||t.slashes,r.href=r.format(),r}var v=r.pathname&&"/"===r.pathname.charAt(0),x=t.host||t.pathname&&"/"===t.pathname.charAt(0),w=x||v||r.host&&t.pathname,j=w,O=r.pathname&&r.pathname.split("/")||[],A=(y=t.pathname&&t.pathname.split("/")||[],r.protocol&&!b[r.protocol]);if(A&&(r.hostname="",r.port=null,r.host&&(""===O[0]?O[0]=r.host:O.unshift(r.host)),r.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===y[0]?y[0]=t.host:y.unshift(t.host)),t.host=null),w=w&&(""===y[0]||""===O[0])),x)r.host=t.host||""===t.host?t.host:r.host,r.hostname=t.hostname||""===t.hostname?t.hostname:r.hostname,r.search=t.search,r.query=t.query,O=y;else if(y.length)O||(O=[]),O.pop(),O=O.concat(y),r.search=t.search,r.query=t.query;else if(!o.isNullOrUndefined(t.search)){if(A)r.hostname=r.host=O.shift(),(I=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=I.shift(),r.host=r.hostname=I.shift());return r.search=t.search,r.query=t.query,o.isNull(r.pathname)&&o.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!O.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var P=O.slice(-1)[0],S=(r.host||t.host||O.length>1)&&("."===P||".."===P)||""===P,E=0,k=O.length;k>=0;k--)"."===(P=O[k])?O.splice(k,1):".."===P?(O.splice(k,1),E++):E&&(O.splice(k,1),E--);if(!w&&!j)for(;E--;E)O.unshift("..");!w||""===O[0]||O[0]&&"/"===O[0].charAt(0)||O.unshift(""),S&&"/"!==O.join("/").substr(-1)&&O.push("");var I,R=""===O[0]||O[0]&&"/"===O[0].charAt(0);A&&(r.hostname=r.host=R?"":O.length?O.shift():"",(I=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=I.shift(),r.host=r.hostname=I.shift()));return(w=w||r.host&&O.length)&&!R&&O.unshift(""),O.length?r.pathname=O.join("/"):(r.pathname=null,r.path=null),o.isNull(r.pathname)&&o.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=t.auth||r.auth,r.slashes=r.slashes||t.slashes,r.href=r.format(),r},i.prototype.parseHost=function(){var t=this.host,e=a.exec(t);e&&(":"!==(e=e[0])&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},function(t,e,r){(function(t,n){var o;/*! https://mths.be/punycode v1.4.1 by @mathias */!function(i){e&&e.nodeType,t&&t.nodeType;var s="object"==typeof n&&n;s.global!==s&&s.window!==s&&s.self;var a,u=2147483647,p=/^xn--/,c=/[^\x20-\x7E]/,l=/[\x2E\u3002\uFF0E\uFF61]/g,f={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},h=Math.floor,y=String.fromCharCode;function g(t){throw new RangeError(f[t])}function d(t,e){for(var r=t.length,n=[];r--;)n[r]=e(t[r]);return n}function b(t,e){var r=t.split("@"),n="";return r.length>1&&(n=r[0]+"@",t=r[1]),n+d((t=t.replace(l,".")).split("."),e).join(".")}function m(t){for(var e,r,n=[],o=0,i=t.length;o<i;)(e=t.charCodeAt(o++))>=55296&&e<=56319&&o<i?56320==(64512&(r=t.charCodeAt(o++)))?n.push(((1023&e)<<10)+(1023&r)+65536):(n.push(e),o--):n.push(e);return n}function v(t){return d(t,(function(t){var e="";return t>65535&&(e+=y((t-=65536)>>>10&1023|55296),t=56320|1023&t),e+=y(t)})).join("")}function x(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function w(t,e,r){var n=0;for(t=r?h(t/700):t>>1,t+=h(t/e);t>455;n+=36)t=h(t/35);return h(n+36*t/(t+38))}function j(t){var e,r,n,o,i,s,a,p,c,l,f,y=[],d=t.length,b=0,m=128,x=72;for((r=t.lastIndexOf("-"))<0&&(r=0),n=0;n<r;++n)t.charCodeAt(n)>=128&&g("not-basic"),y.push(t.charCodeAt(n));for(o=r>0?r+1:0;o<d;){for(i=b,s=1,a=36;o>=d&&g("invalid-input"),((p=(f=t.charCodeAt(o++))-48<10?f-22:f-65<26?f-65:f-97<26?f-97:36)>=36||p>h((u-b)/s))&&g("overflow"),b+=p*s,!(p<(c=a<=x?1:a>=x+26?26:a-x));a+=36)s>h(u/(l=36-c))&&g("overflow"),s*=l;x=w(b-i,e=y.length+1,0==i),h(b/e)>u-m&&g("overflow"),m+=h(b/e),b%=e,y.splice(b++,0,m)}return v(y)}function O(t){var e,r,n,o,i,s,a,p,c,l,f,d,b,v,j,O=[];for(d=(t=m(t)).length,e=128,r=0,i=72,s=0;s<d;++s)(f=t[s])<128&&O.push(y(f));for(n=o=O.length,o&&O.push("-");n<d;){for(a=u,s=0;s<d;++s)(f=t[s])>=e&&f<a&&(a=f);for(a-e>h((u-r)/(b=n+1))&&g("overflow"),r+=(a-e)*b,e=a,s=0;s<d;++s)if((f=t[s])<e&&++r>u&&g("overflow"),f==e){for(p=r,c=36;!(p<(l=c<=i?1:c>=i+26?26:c-i));c+=36)j=p-l,v=36-l,O.push(y(x(l+j%v,0))),p=h(j/v);O.push(y(x(p,0))),i=w(r,b,n==o),r=0,++n}++r,++e}return O.join("")}a={version:"1.4.1",ucs2:{decode:m,encode:v},decode:j,encode:O,toASCII:function(t){return b(t,(function(t){return c.test(t)?"xn--"+O(t):t}))},toUnicode:function(t){return b(t,(function(t){return p.test(t)?j(t.slice(4).toLowerCase()):t}))}},void 0===(o=function(){return a}.call(e,r,e,t))||(t.exports=o)}()}).call(this,r(35)(t),r(36))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e,r){"use strict";t.exports={isString:function(t){return"string"==typeof t},isObject:function(t){return"object"==typeof t&&null!==t},isNull:function(t){return null===t},isNullOrUndefined:function(t){return null==t}}},function(t,e,r){"use strict";e.decode=e.parse=r(39),e.encode=e.stringify=r(40)},function(t,e,r){"use strict";function n(t,e){return Object.prototype.hasOwnProperty.call(t,e)}t.exports=function(t,e,r,i){e=e||"&",r=r||"=";var s={};if("string"!=typeof t||0===t.length)return s;var a=/\+/g;t=t.split(e);var u=1e3;i&&"number"==typeof i.maxKeys&&(u=i.maxKeys);var p=t.length;u>0&&p>u&&(p=u);for(var c=0;c<p;++c){var l,f,h,y,g=t[c].replace(a,"%20"),d=g.indexOf(r);d>=0?(l=g.substr(0,d),f=g.substr(d+1)):(l=g,f=""),h=decodeURIComponent(l),y=decodeURIComponent(f),n(s,h)?o(s[h])?s[h].push(y):s[h]=[s[h],y]:s[h]=y}return s};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},function(t,e,r){"use strict";var n=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};t.exports=function(t,e,r,a){return e=e||"&",r=r||"=",null===t&&(t=void 0),"object"==typeof t?i(s(t),(function(s){var a=encodeURIComponent(n(s))+r;return o(t[s])?i(t[s],(function(t){return a+encodeURIComponent(n(t))})).join(e):a+encodeURIComponent(n(t[s]))})).join(e):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(t)):""};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function i(t,e){if(t.map)return t.map(e);for(var r=[],n=0;n<t.length;n++)r.push(e(t[n],n));return r}var s=Object.keys||function(t){var e=[];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.push(r);return e}}])}));
/*******************************************************
                Accordion Sidebar Menu Start
*******************************************************/
var accItem = document.getElementsByClassName('accordionItem');
var accHD = document.getElementsByClassName('accordionItemHeading');
for (i = 0; i < accHD.length; i++) {
    accHD[i].addEventListener('click', toggleItem, false);
}

function toggleItem() {
    var itemClass = this.parentNode.className;

    for (i = 0; i < accItem.length; i++) {
        accItem[i].className = 'accordionItem closeIt';
    }
    if (itemClass == 'accordionItem closeIt') {
        this.parentNode.className = 'accordionItem openIt';
    }
}
/*******************************************************
                Accordion Sidebar Menu End
*******************************************************/

/*******************************************************
            Toggle The Side Navigation Start
*******************************************************/
// document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);

var ts = document.getElementById('sidebarToggle');
if (ts) {
    ts.addEventListener("click", toggleSidebar);
}

function toggleSidebar() {
    let toggle = document.querySelector('body');
    toggle.classList.toggle('sidebar-toggled');
}

window.addEventListener("resize", resiz);
function resiz() {
    if (screen.width < 769) {
        var element = document.querySelector("body");
        element.classList.remove("sidebar-toggled");
    }
}
/*******************************************************
            Toggle The Side Navigation End
*******************************************************/

/*******************************************************
               Header More Filter Start
*******************************************************/
function openMoreFilter() {
    var omf = document.getElementById("more_filter");
    omf.classList.add("in");
}

function closeMoreFilter() {
    var cls = document.getElementById("more_filter");
    cls.classList.remove("in");
}

if ($('#more_filter').length > 0) {
    $(document).on('mouseup', function(e)
    {
        var container = $("#more_filter");
        var searchField = $(".bs-searchbox");
        var select2Field = $("#bs-select-2");
        var selectField = $(".bs-container");

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0 && !searchField.is(e.target) && searchField.has(e.target).length === 0 && !select2Field.is(e.target) && select2Field.has(e.target).length === 0 && selectField.has(e.target).length === 0)
        {
            closeMoreFilter()
        }
    });
}


/*******************************************************
                Header More Filter End
*******************************************************/

/*******************************************************
                    Mobile Menu Start
*******************************************************/
function openMobileMenu() {
    var omm = document.getElementById("mobile_menu_collapse");
    omm.classList.add("toggled");

    var omm1 = document.getElementById("mobile_close_panel");
    omm1.classList.add("toggled");
}

function closeMobileMenu() {
    var cmm = document.getElementById("mobile_menu_collapse");
    cmm.classList.remove("toggled");

    var cmm1 = document.getElementById("mobile_close_panel");
    cmm1.classList.remove("toggled");
}
/*******************************************************
                    Mobile Menu End
*******************************************************/

/*******************************************************
              Mobile Admin Dashboard Open
*******************************************************/
function openAdminDashboard() {
    var oad1 = document.getElementById("mob-admin-dash");
    oad1.classList.add("in");

    var oad2 = document.getElementById("close-admin-overlay");
    oad2.classList.add("in");
}

var el = document.getElementById('close-admin-overlay');
if (el) {
    el.addEventListener("click", closeAdminDashboard);
}

var el = document.getElementById('close-admin');
if (el) {
    el.addEventListener("click", closeAdminDashboard);
}

function closeAdminDashboard() {
    var cad1 = document.getElementById("mob-admin-dash");
    cad1.classList.remove("in");

    var cad2 = document.getElementById("close-admin-overlay");
    cad2.classList.remove("in");
}
/*******************************************************
                    Mobile Settings End
*******************************************************/

/*******************************************************
                    Mobile Settings Open
*******************************************************/
function openSettingsSidebar() {
    var oss1 = document.getElementById("mob-settings-sidebar");
    oss1.classList.add("in");

    var oss2 = document.getElementById("close-settings-overlay");
    oss2.classList.add("in");
}

var el = document.getElementById('close-settings');
if (el) {
    el.addEventListener("click", closeSettingsSidebar);
}

var el = document.getElementById('close-settings-overlay');
if (el) {
    el.addEventListener("click", closeSettingsSidebar);
}

function closeSettingsSidebar() {
    var cls1 = document.getElementById("mob-settings-sidebar");
    cls1.classList.remove("in");

    var cls2 = document.getElementById("close-settings-overlay");
    cls2.classList.remove("in");
}
/*******************************************************
                    Mobile Settings End
*******************************************************/

/*******************************************************
                    Mobile Ticket Open
*******************************************************/
function openTicketsSidebar() {
    var ots1 = document.getElementById("ticket-detail-contact");
    ots1.classList.add("in");

    var oss2 = document.getElementById("close-tickets-overlay");
    oss2.classList.add("in");
}

var el = document.getElementById('close-tickets');
if (el) {
    el.addEventListener("click", closeTicketsSidebar);
}

var el = document.getElementById('close-tickets-overlay');
if (el) {
    el.addEventListener("click", closeTicketsSidebar);
}

function closeTicketsSidebar(){
    var cts1 = document.getElementById("ticket-detail-contact");
    cts1.classList.remove("in");

    var cts2 = document.getElementById("close-tickets-overlay");
    cts2.classList.remove("in");
}
/*******************************************************
                    Mobile Ticket End
*******************************************************/

/*******************************************************
                    Client Detail Open
*******************************************************/
function openClientDetailSidebar() {
    var ocds1 = document.getElementById("mob-client-detail");
    ocds1.classList.add("in");

    var ocds2 = document.getElementById("close-client-overlay");
    ocds2.classList.add("in");

    // var ocds4 = document.getElementById("close-client-detail");
    // ocds4.classList.remove("d-none");

    var ocds3 = document.getElementById("hide-project-menues");
    ocds3.classList.add("in");
}

var el = document.getElementById('close-client-overlay');
if (el) {
    el.addEventListener("click", closeClientDetail);
}

var el = document.getElementById('close-client-detail');
if (el) {
    el.addEventListener("click", closeClientDetail);
}

function closeClientDetail() {
    // var ocds4 = document.getElementById("close-client-detail");
    // ocds4.classList.add("d-none");

    var ccd1 = document.getElementById("mob-client-detail");
    ccd1.classList.remove("in");

    var ccd2 = document.getElementById("close-client-overlay");
    ccd2.classList.remove("in");

    var ccd3 = document.getElementById("hide-project-menues");
    ccd3.classList.remove("in");
}
/*******************************************************
                    Client Detail End
*******************************************************/

/*******************************************************
                    Project Menu Open
*******************************************************/
function openProjectSidebar() {
    var ops1 = document.getElementById("mob-project-menu");
    ops1.classList.add("in");

    var ops2 = document.getElementById("close-project-overlay");
    ops2.classList.add("in");
}

var el = document.getElementById('close-project-overlay');
if (el) {
    el.addEventListener("click", closeProjectSidebar);
}

var el = document.getElementById('close-projects');
if (el) {
    el.addEventListener("click", closeProjectSidebar);
}

function closeProjectSidebar() {
    var cps1 = document.getElementById("mob-project-menu");
    cps1.classList.remove("in");

    var cps2 = document.getElementById("close-project-overlay");
    cps2.classList.remove("in");
}
/*******************************************************
                    Project Menu End
*******************************************************/

/*******************************************************
                   Message Tabs Start
*******************************************************/
function msgTabs(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    document.getElementById('msgContentRight').className += ' d-block';
}

function closeMessageTab() {
    var cmt = document.getElementById("msgContentRight");
    cmt.classList.remove("d-block");
}
/*******************************************************
                   Message Tabs End
*******************************************************/

/*******************************************************
                   RTL Start
*******************************************************/
function rtl() {
    var rtl = document.querySelector("body");
    rtl.classList.toggle("rtl");
}
/*******************************************************
                   RTL End
*******************************************************/

/*******************************************************
                 Task Detail Start
*******************************************************/
function openTaskDetail() {
    var otd1 = document.getElementById("task-detail-1");
    otd1.classList.add("in");

    var ops2 = document.getElementById("close-task-detail-overlay");
    ops2.classList.add("in");

    var otd4 = document.getElementById("close-task-detail");
    otd4.classList.add("in");
}

var el = document.getElementById('close-task-detail-overlay');
if (el) {
    el.addEventListener("click", closeTaskDetail);
}

var el = document.getElementById('close-task-detail');
if (el) {
    el.addEventListener("click", closeTaskDetail);
}

function closeTaskDetail() {
    var ctd1 = document.getElementById("task-detail-1");
    ctd1.classList.remove("in");

    var ctd2 = document.getElementById("close-task-detail-overlay");
    ctd2.classList.remove("in");

	sessionStorage.setItem('RIGHT_MODAL', 'opened');

    window.history.back();

    var ctd3 = document.getElementById("close-task-detail");
    ctd3.classList.remove("in");
}
/*******************************************************
                 Task Detail End
*******************************************************/




// $(document).ready(function () {

//     //Datatables
//     $('#example').DataTable({
//         "language": {
//             "paginate": {
//                 "next": '<i class="icon-arrow-right icons"></i>',
//                 "previous": '<i class="icon-arrow-left icons"></i>'
//             }
//         },
//         "paging": true,
//         "ordering": false,
//         "info": false
//     });

// })



const init = function (parent = "") {
    if (parent != "") {
        parent = parent + " ";
    }
    /*******************************************************
                   SELECT Start
*******************************************************/
    if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    ) {
        $(parent + ".select-picker").selectpicker("mobile");
    } else {
        $(parent + ".select-picker").selectpicker();
    }
    // $(parent + ".select2").select2();
    /*******************************************************
                   SELECT End
*******************************************************/
    //turn off autocomplete for all inputs
    $(parent + "input").attr("autocomplete", "off");

    //initialise tooltip
    $("body").tooltip({
        selector: '[data-toggle="tooltip"]',
        trigger: 'hover'
    });

    //initialise popover
    $(function () {
        $('[data-toggle="popover"]').popover();
    });

    //initialise dropify
    var drEvent = $(".dropify").dropify({
        messages: dropifyMessages,
        imgFileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'],
    });

    drEvent.on("dropify.afterClear", function (event, element) {
        var elementID = element.element.id;
        var elementName = element.element.name;
        if ($("#" + elementID + "_delete").length == 0) {
            $("#" + elementID).after(
                '<input type="hidden" name="' +
                    elementName +
                    '_delete" id="' +
                    elementID +
                    '_delete" value="yes">'
            );
        }
    });
};

//select row in datatable
const dataTableRowCheck = (id) => {
    if ($(".select-table-row:checked").length > 0) {
        $("#quick-action-form").fadeIn();
        //if at-least one row is selected
        document.getElementById("select-all-table").indeterminate = true;
        $("#quick-actions")
            .find("input, textarea, button, select")
            .removeAttr("disabled");
        if ($("#quick-action-type").val() == "") {
            $("#quick-action-apply").attr("disabled", true);
        }
        $(".select-picker").selectpicker("refresh");
    } else {
        $("#quick-action-form").fadeOut();
        //if no row is selected
        document.getElementById("select-all-table").indeterminate = false;
        $("#select-all-table").attr("checked", false);
        resetActionButtons();
    }

    if ($("#datatable-row-" + id).is(":checked")) {
        $("#row-" + id).addClass("table-active");
    } else {
        $("#row-" + id).removeClass("table-active");
    }
};

//select all rows in datatable
const selectAllTable = (source) => {
    checkboxes = document.getElementsByName("datatable_ids[]");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        // if disabled property is given to checkbox, it won't select particular checkbox.
        if (!$("#" + checkboxes[i].id).prop('disabled')){
            checkboxes[i].checked = source.checked;
        }
        if ($("#" + checkboxes[i].id).is(":checked")) {
            $("#" + checkboxes[i].id)
                .closest("tr")
                .addClass("table-active");
            $("#quick-actions")
                .find("input, textarea, button, select")
                .removeAttr("disabled");
            if ($("#quick-action-type").val() == "") {
                $("#quick-action-apply").attr("disabled", true);
            }
            $(".select-picker").selectpicker("refresh");
        } else {
            $("#" + checkboxes[i].id)
                .closest("tr")
                .removeClass("table-active");
            resetActionButtons();
        }
    }

    if ($(".select-table-row:checked").length > 0) {
        $("#quick-action-form").fadeIn();
    } else {
        $("#quick-action-form").fadeOut();
    }
};

//reset table action form elements
const resetActionButtons = () => {
    $("#quick-action-form")[0].reset();
    $("#quick-actions")
        .find("input, textarea, button, select")
        .attr("disabled", "disabled");
    $(".select-picker").selectpicker("refresh");
};

var el = document.getElementById("close-task-detail");

$("body").on("click", ".openRightModal", openTaskDetail);

var el = document.querySelector(".closeRightModal");
if (el) {
    el.addEventListener("click", closeTaskDetail);
}

//show hide secret values
$("body").on("click", ".toggle-password", function () {
    var $selector = $(this).closest(".input-group").find("input.form-control");
    $(this).find(".svg-inline--fa").toggleClass("fa-eye fa-eye-slash");
    var $type = $selector.attr("type") === "password" ? "text" : "password";
    $selector.attr("type", $type);
});

$("body").on("click", ".openRightModal", function (event) {
    event.preventDefault();

    const requestUrl = this.href;
    const inModal = $(this).hasClass("inModal");

    let redirectUrl = "";
    if (typeof $(this).data("redirect-url") !== "undefined") {
        redirectUrl = encodeURIComponent($(this).data("redirect-url"));
    }

    $.easyAjax({
        url: requestUrl,
        blockUI: true,
        container: RIGHT_MODAL,
        historyPush: !inModal,
        data: { redirectUrl: redirectUrl },
        success: function (response) {
            if (response.status == "success") {
                $(RIGHT_MODAL_CONTENT).html(response.html);
                $(RIGHT_MODAL_TITLE).html(response.title);
            }
        },
        error: function (request, status, error) {
            //console.log(request.responseText);
            if (request.status == 403) {
                $(RIGHT_MODAL_CONTENT).html(
                    '<div class="align-content-between d-flex justify-content-center mt-105 f-21">403 | Permission Denied</div>'
                );
            } else if (request.status == 404) {
                $(RIGHT_MODAL_CONTENT).html(
                    '<div class="align-content-between d-flex justify-content-center mt-105 f-21">404 | Not Found</div>'
                );
            } else if (request.status == 500) {
                $(RIGHT_MODAL_CONTENT).html(
                    '<div class="align-content-between d-flex justify-content-center mt-105 f-21">500 | Something Went Wrong</div>'
                );
            }
        },
    });
});

// Sidebar open close
$("#sidebarToggle").on("click", function () {
    if ($("body").hasClass("sidebar-toggled")) {
        localStorage.setItem("mini-sidebar", "yes");
    } else {
        localStorage.setItem("mini-sidebar", "no");
    }
});

// active left sub menu item
var currentUrl = window.location;
var pathArray = window.location.pathname.split("account/");
if (typeof pathArray[1] !== "undefined") {
    var currentRoute = pathArray[1].split("/");
    currentRoute = currentRoute[0];
    var element = $("#sideMenuScroll li a")
        .filter(function () {
            return this.href == currentUrl.href;
        })
        .addClass("active")
        .closest("li")
        .removeClass("closeIt")
        .addClass("openIt");

    // active left main menu item
    var element2 = $("#sideMenuScroll li a").filter(function () {
        var pathArray = this.href.split("account/");
        if (currentRoute == pathArray[1]) {
            return true;
        }
        // console.log(this.href, currentUrl.href, currentUrl.href.indexOf(this.href));
    });
    element2.addClass("active");
    element2
        .closest("li")
        .removeClass("closeIt")
        .addClass("openIt")
        .children("a")
        .addClass("active");
}

//nl2br
function nl2br(str, is_xhtml) {
    if (typeof str === "undefined" || str === null) {
        return "";
    }
    var breakTag =
        is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
    return (str + "").replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        "$1" + breakTag + "$2"
    );
}
//decimal format
function decimalupto2(num) {
    var amt = Math.round(num * 100) / 100;
    return parseFloat(amt.toFixed(2));
}

//calculate total of invoices
function calculateTotal() {
    var subtotal = 0;
    var discount = 0;
    var tax = "";
    var taxList = new Object();
    var taxTotal = 0;
    var discountAmount = 0;
    var discountType = $("#discount_type").val();
    var discountValue = $(".discount_value").val();
    var calculateTax = $("#calculate_tax").val();
    var adjustmentAmount = $("#adjustment_amount").val();

    $(".quantity").each(function (index, element) {
        var discountedAmount = 0;
        var amount = parseFloat(
            $(this).closest(".item-row").find(".amount").val()
        );

        if (isNaN(amount)) {
            amount = 0;
        }

        subtotal = (parseFloat(subtotal) + parseFloat(amount)).toFixed(2);
    });

    if (discountType == "percent" && discountValue != "") {
        discountAmount =
            (parseFloat(subtotal) / 100) * parseFloat(discountValue);
        discountedAmount = parseFloat(subtotal - discountAmount);
    } else {
        discountAmount = parseFloat(discountValue);
        discountedAmount = parseFloat(subtotal - parseFloat(discountValue));
    }

    $(".quantity").each(function (index, element) {
        var itemTax = [];
        var itemTaxName = [];
        subtotal = parseFloat(subtotal);

        $(this)
            .closest(".item-row")
            .find("select.type option:selected")
            .each(function (index) {
                itemTax[index] = $(this).data("rate");
                itemTaxName[index] = $(this).data('tax-text');
            });
        var itemTaxId = $(this).closest(".item-row").find("select.type").val();

        var amount = parseFloat(
            $(this).closest(".item-row").find(".amount").val()
        );

        if (isNaN(amount)) {
            amount = 0;
        }

        if (itemTaxId != "") {
            for (var i = 0; i <= itemTaxName.length; i++) {
                if (typeof taxList[itemTaxName[i]] === "undefined") {
                    if (
                        calculateTax == "after_discount" &&
                        discountAmount > 0
                    ) {
                        var taxValue =
                            (amount - (amount / subtotal) * discountAmount) *
                            (parseFloat(itemTax[i]) / 100);

                        if (!isNaN(taxValue)) {
                            taxList[itemTaxName[i]] = parseFloat(taxValue);
                        }
                    } else {
                        var taxValue = amount * (parseFloat(itemTax[i]) / 100);

                        if (!isNaN(taxValue)) {
                            taxList[itemTaxName[i]] = parseFloat(taxValue);
                        }
                    }
                } else {
                    if (
                        calculateTax == "after_discount" &&
                        discountAmount > 0
                    ) {
                        var taxValue =
                            parseFloat(taxList[itemTaxName[i]]) +
                            (amount - (amount / subtotal) * discountAmount) *
                                (parseFloat(itemTax[i]) / 100);

                        if (!isNaN(taxValue)) {
                            taxList[itemTaxName[i]] = parseFloat(taxValue);
                        }
                    } else {
                        var taxValue =
                            parseFloat(taxList[itemTaxName[i]]) +
                            amount * (parseFloat(itemTax[i]) / 100);

                        if (!isNaN(taxValue)) {
                            taxList[itemTaxName[i]] = parseFloat(taxValue);
                        }
                    }
                }
            }
        }
    });

    $.each(taxList, function (key, value) {
        if (!isNaN(value)) {
            tax =
                tax +
                '<tr><td class="text-dark-grey">' +
                key +
                '</td><td><span class="tax-percent">' +
                decimalupto2(value).toFixed(2) +
                "</span></td></tr>";
            taxTotal = taxTotal + decimalupto2(value);
        }
    });

    if (isNaN(subtotal)) {
        subtotal = 0;
    }

    $(".sub-total").html(decimalupto2(subtotal).toFixed(2));
    $(".sub-total-field").val(decimalupto2(subtotal));

    if (discountValue != "") {
        if (discountType == "percent") {
            discount = (parseFloat(subtotal) / 100) * parseFloat(discountValue);
        } else {
            discount = parseFloat(discountValue);
        }
    }

    if (tax != "") {
        $("#invoice-taxes").html(tax);
    } else {
        $("#invoice-taxes").html(
            '<tr><td colspan="2"><span class="tax-percent">0.00</span></td></tr>'
        );
    }

    if (adjustmentAmount && adjustmentAmount != 0 && adjustmentAmount != '') {
        subtotal = subtotal + parseFloat(adjustmentAmount);
    }

    $("#discount_amount").html(decimalupto2(discount).toFixed(2));

    var totalAfterDiscount = decimalupto2(subtotal - discount);

    totalAfterDiscount = totalAfterDiscount < 0 ? 0 : totalAfterDiscount;

    var total = decimalupto2(totalAfterDiscount + taxTotal);

    $(".total").html(total.toFixed(2));
    $(".total-field").val(total.toFixed(2));
}

function deSelectAll() {
    $("#select-all-table").prop("checked", false);
}

$("table th:first-child").removeAttr("title");

//Prevent sidebar dropdown close
$(document).on("click", ".main-sidebar .dropdown-menu", function (e) {
    e.stopPropagation();
});

//submit form on press enter
$(document).on("keypress", "input.form-control", function(e) {
    var inModalLg = $(MODAL_LG).hasClass("show");
    var inModalXl = $(MODAL_XL).hasClass("show");

    if (e.key === "Enter") {
        if (inModalLg || inModalXl) {
            $(this)
                .closest(".modal-content")
                .find(".btn-primary")
                .trigger("click");
        } else {
            $(this).closest("form").find(".btn-primary").trigger("click");
        }
        return false; //<---- Add this line
    }
});

$("body").on("click", "#right-modal-content .btn-cancel", function (e) {
    e.preventDefault();
    closeTaskDetail();
});

//hide tooltip after click on element
$(document).on('mousedown', "[aria-describedby]", function() {
    $("[aria-describedby]").tooltip('hide');
});

// Snippet to reload the page on browser back and forward button click
$(document).ready(function () {
    sessionStorage.setItem("RIGHT_MODAL", "closed");
    if (window.history && window.history.pushState) {
        $(window).on("popstate", function () {
            if (sessionStorage.getItem("RIGHT_MODAL") != "opened") {
                window.location.reload();
            }
        });
    }
});

$('#mobile_menu_collapse').on('click', '.dropdown-item', function() {
    $("#dropdownMenuLink").dropdown("toggle");
});
