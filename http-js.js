"use strict";
var HttpJS = /** @class */ (function () {
    function HttpJS() {
        /**
         * All completion handlers for the urls are initially saved here
         * and removed once the completion handler has been executed
         *
         * @type {{ [url: string]: HttpRequestCompletionHandler }}
         * @memberof HttpJS
         */
        this.completionHandlers = {};
        /**
         * All xml http requests are saved in this queue and are executed on a FIFO basis
         * Once the request has completed and the completion handler have been called then
         * the request will be removed from the queue
         *
         * @type {HttpJSRequest[]}
         * @memberof HttpJS
         */
        this.queue = [];
        /**
         * Once the send method is called on the xml http request this property is set to true
         * so that no other requests can be initiated until this current once has completed
         *
         * @type {boolean}
         * @memberof HttpJS
         */
        this.isRunning = false;
        this.xmlHtpRequest = new XMLHttpRequest();
        this.xmlHtpRequest.onreadystatechange = this.onReadyStateChangeHandler;
        this.xmlHtpRequest.onloadend = function () {
            console.log('on load end called');
        };
        this.xmlHtpRequest.onprogress = function () {
            console.log('progress');
        };
    }
    /**
     * Executes a GET XMLHttpRequest to the provided url and will return JSON as the response data
     * The options.isJson will be set to true for you therefore there is no need to set it in the options
     * The method property is also set to 'GET' so this to can be omitted
     *
     * @param {HttpJSRequestOptions} options
     * @param {HttpRequestCompletionHandler} completionHandler
     * @memberof HttpJS
     */
    HttpJS.prototype.json = function (options, completionHandler) {
        options.method = "GET";
        options.isJson = true;
        this.get(options, completionHandler);
    };
    /**
     * Executes a GET XMLHttpRequest to the provided url
     * The method property is also set to 'GET' so this to can be omitted
     *
     * @param {HttpJSRequestOptions} options
     * @param {HttpRequestCompletionHandler} completionHandler
     * @memberof HttpJS
     */
    HttpJS.prototype.get = function (options, completionHandler) {
        options.method = "GET";
        options.isJson = options.isJson;
        this.queue.push({
            options: options,
            handler: completionHandler
        });
        this.execute();
    };
    /**
     * Should be called when the next task in the queue should be executed
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.executeNextTask = function () {
        this.isRunning = false;
        this.execute();
    };
    /**
     * Executes the next task in the queue if once is present and if isRunning property is false
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.execute = function () {
        if (this.isRunning)
            return;
        var request = this.queue.shift();
        if (request === undefined) {
            this.isRunning = false;
            return;
        }
        var e = request;
        this.isRunning = true;
        this.options = request.options;
        this.completionHandlers[this.options.url] = request.handler;
        this.xmlHtpRequest.open(this.options.method, this.options.url, true);
        this.setJsonHeaders();
        this.xmlHtpRequest.send();
        this.queue = this.queue.filter(function (h) { h.options.url !== e.options.url; });
    };
    /**
     * This method will be called by all xml http requests
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.onReadyStateChangeHandler = function () {
        var xhr = window.http;
        if (!xhr.isStateReady() || xhr.options === undefined)
            return;
        var handler = xhr.completionHandlers[xhr.options.url];
        if (handler === undefined)
            return;
        var result = undefined;
        var isJson = xhr.options === undefined ? undefined : xhr.options.isJson === undefined ? false : xhr.options.isJson;
        switch (isJson !== undefined && isJson === true && xhr.xmlHtpRequest.status !== 0) {
            case true:
                console.log("response ", xhr.xmlHtpRequest.responseText);
                result = JSON.parse(xhr.xmlHtpRequest.responseText);
                break;
            case false:
                result = xhr.xmlHtpRequest.responseText;
                break;
        }
        handler(result, xhr.xmlHtpRequest.status, this);
        delete xhr.completionHandlers[xhr.options.url];
        xhr.executeNextTask();
    };
    /**
     * Indicated that the state of this xml http request is at 4 and can be processed
     * meaning that the completion handler can be called with the response text and statusCode
     * returns true if completed and false otherwise
     *
     * @returns {boolean}
     * @memberof HttpJS
     */
    HttpJS.prototype.isStateReady = function () {
        var xhr = window.http;
        var state = xhr.xmlHtpRequest.readyState;
        return !(state !== undefined && xhr.xmlHtpRequest.readyState !== 4);
    };
    /**
     * Will abort the xml http request
     * This method uses the windows http directly to know that this is being globally executed
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.close = function () {
        window.http.xmlHtpRequest.abort();
    };
    /**
     * Should be called to stop any tasks from being carried
     * This will also abort the active request being carried out
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.stop = function () {
        this.isRunning = true;
        window.http.xmlHtpRequest.abort();
    };
    /**
     *Should be called when tasks should start to be executed
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.start = function () {
        this.executeNextTask();
    };
    /**
     * Adds application/json to the Accept header
     *
     * @memberof HttpJS
     */
    HttpJS.prototype.setJsonHeaders = function () {
        if (this.options === undefined || this.options.isJson === undefined)
            return;
        if (this.options.isJson === false)
            return;
        this.xmlHtpRequest.setRequestHeader('Accept', 'application/json');
    };
    return HttpJS;
}());
(function () {
    window.http = new HttpJS();
})();
