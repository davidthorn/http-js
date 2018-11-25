# Http JS

I wrote this library because I do not want to use jQuery or Angular for some simple tasks.

## Usage

Its usage is very simple and a lot like jQuery's http api.

## GET Request

```javascript
http.get({
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'GET',  // optional and implicit,
    isJson: false, // only required if you want the response to be parse into JSON,
    params: {} // Not required because I have not implemented the post api yet
}, (res, statusCode) => {
    console.log('completed')
})

```

## JSON GET Request

```javascript
http.json({
    url: 'https://jsonplaceholder.typicode.com/posts'
}, (json, statusCode) => {
    console.log('completed json response' , json)
})
```