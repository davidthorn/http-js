declare type HttpRequestCompletionHandler = (data: any, statusCode: number, request: Http) => void;
declare type HttpJSRequestOptions = {
    method: "GET" | "POST";
    url: string;
    params?: any;
    isJson?: boolean;
};
declare type HttpJSRequest = {
    options: HttpJSRequestOptions;
    handler: HttpRequestCompletionHandler;
};
interface Http {
    completionHandlers: {
        [url: string]: HttpRequestCompletionHandler;
    };
    xmlHtpRequest: XMLHttpRequest;
    options?: HttpJSRequestOptions;
    get(options: HttpJSRequestOptions, completionHandler: HttpRequestCompletionHandler): void;
    close(): void;
    executeNextTask(): void;
    isStateReady(): boolean;
}
interface Window {
    http: Http;
}
declare class HttpJS implements Http {
    /**
     * All completion handlers for the urls are initially saved here
     * and removed once the completion handler has been executed
     *
     * @type {{ [url: string]: HttpRequestCompletionHandler }}
     * @memberof HttpJS
     */
    completionHandlers: {
        [url: string]: HttpRequestCompletionHandler;
    };
    /**
     * The main xml http request object which is used for every request
     * Because javascript is single threaded the requests are placed in a queue system
     * and the next task if called once the other has finished until there are no further
     * requests remaining
     *
     * @type {XMLHttpRequest}
     * @memberof HttpJS
     */
    xmlHtpRequest: XMLHttpRequest;
    /**
     *  These are the options which are provided with each request and are used
     *  when the ready state property is at 4 so as to call the correct completion
     *  handler for this url
     *
     * @type {HttpJSRequestOptions}
     * @memberof HttpJS
     */
    options?: HttpJSRequestOptions;
    /**
     * All xml http requests are saved in this queue and are executed on a FIFO basis
     * Once the request has completed and the completion handler have been called then
     * the request will be removed from the queue
     *
     * @type {HttpJSRequest[]}
     * @memberof HttpJS
     */
    queue: HttpJSRequest[];
    /**
     * Once the send method is called on the xml http request this property is set to true
     * so that no other requests can be initiated until this current once has completed
     *
     * @type {boolean}
     * @memberof HttpJS
     */
    isRunning: boolean;
    constructor();
    /**
     * Executes a GET XMLHttpRequest to the provided url and will return JSON as the response data
     * The options.isJson will be set to true for you therefore there is no need to set it in the options
     * The method property is also set to 'GET' so this to can be omitted
     *
     * @param {HttpJSRequestOptions} options
     * @param {HttpRequestCompletionHandler} completionHandler
     * @memberof HttpJS
     */
    json(options: HttpJSRequestOptions, completionHandler: HttpRequestCompletionHandler): void;
    /**
     * Executes a GET XMLHttpRequest to the provided url
     * The method property is also set to 'GET' so this to can be omitted
     *
     * @param {HttpJSRequestOptions} options
     * @param {HttpRequestCompletionHandler} completionHandler
     * @memberof HttpJS
     */
    get(options: HttpJSRequestOptions, completionHandler: HttpRequestCompletionHandler): void;
    /**
     * Should be called when the next task in the queue should be executed
     *
     * @memberof HttpJS
     */
    executeNextTask(): void;
    /**
     * Executes the next task in the queue if once is present and if isRunning property is false
     *
     * @memberof HttpJS
     */
    execute(): void;
    /**
     * This method will be called by all xml http requests
     *
     * @memberof HttpJS
     */
    onReadyStateChangeHandler(): void;
    /**
     * Indicated that the state of this xml http request is at 4 and can be processed
     * meaning that the completion handler can be called with the response text and statusCode
     * returns true if completed and false otherwise
     *
     * @returns {boolean}
     * @memberof HttpJS
     */
    isStateReady(): boolean;
    /**
     * Will abort the xml http request
     * This method uses the windows http directly to know that this is being globally executed
     *
     * @memberof HttpJS
     */
    close(): void;
    /**
     * Should be called to stop any tasks from being carried
     * This will also abort the active request being carried out
     *
     * @memberof HttpJS
     */
    stop(): void;
    /**
     *Should be called when tasks should start to be executed
     *
     * @memberof HttpJS
     */
    start(): void;
    /**
     * Adds application/json to the Accept header
     *
     * @memberof HttpJS
     */
    setJsonHeaders(): void;
}
