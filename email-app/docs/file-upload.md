---
title: File upload
date: 2020-04-13 17:28:17
---

## Pre-knowledge

The principle is very simple. According to the specification and definition of the `http` protocol, the request message body is encapsulated and the message body is parsed, and then the binary content is saved to a file.

We all know that if you want to upload a file, you need to set the `enctype` of the `form` tag to `multipart/form-data`, and the `method` must be the `post` method.

```html
<form action="" enctype="multipart/form-data" method="post">...</form>
```

### What is multipart/form-data?

> Since file-upload is a feature that will benefit many applications, this proposes an extension to HTML to allow information providers to express file upload requests uniformly, and a MIME compatible representation for file upload responses.

Since the file upload function will benefit many applications, it is recommended to extend `HTML` to allow information providers to express file upload requests in a unified manner and provide a `MIME` compatible representation of the file upload response.

The summary is that the original specifications are not met, I want to expand the specifications.

### Why use multipart/form-data for file upload?

> The encoding type application/x-www-form-urlencoded is inefficient for sending large quantities of binary data or text containing non-ASCII characters. Thus, a new media type,multipart/form-data, is proposed as a way of efficiently sending the values associated with a filled-out form from client to server.

The 1867 document also writes why a new type should be added instead of the old `application/x-www-form-urlencoded`: because this type is not suitable for transmitting large binary data or contains non-`ASCII` characters data. Usually we use this type to send form data using `url` encoding and send it to the backend. Of course, binary files cannot be encoded together. So `multipart/form-data` was born, which is specially used to transfer files efficiently.

#### Maybe you have questions? Can I use `application/json`?

We know that the file exists in binary form and `application/json` is transmitted in text form, so in a sense we can indeed convert the file into `Base64` form, for example in text form. However, if you change to this form, the back end also needs to do special analysis according to the form you transmit. And the text is less efficient than binary in the process of transmission, so it is slower for the files of dozens of Ms and hundreds of Ms.

### What is the multipart/form-data specification?

First look at the `http` request for a file upload to understand

![](../../../assets/javascript/file-upload/upload.png)

#### The first is the request body, the request type is

`` `ya
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryHTefVDvk5B48iJT5
```

The request type, then a `boundary` (splitter), what is this thing for?

In fact, we can see from the name that the delimiter was divided at that time, because there may be multiple files and multiple fields. Between each field file, we cannot accurately judge where the file is to the cut-off state. Therefore, a separator is needed to divide.

Each form item starts with `————XXX` and ends with `————XXX`.

#### Message body-`Form Data` section

Each form item is composed of `Content-Type` and `Content-Disposition`.

-`Content-Disposition`: `form-data` is a fixed value, which means a form element, `name` means the name of the form element, the value after the carriage return and line feed is `name`, if it is an uploaded file, it is the binary content of the file .
-`Content-Type`: indicates the `MIME` type of the current content, whether it is a picture or text or binary data.

### Browser file upload summary

For file upload on the browser side, it can be summed up as a routine, the core idea of ​​everything is to construct a `File` object. Then observe the request `Content-Type`, and then see if there is any missing information in the request body. The conversion of these binary data types can be seen in the following table.

![](../../../assets/javascript/file-upload/upload-chart.png)

## form upload file

```html
<form method="post" action="http://localhost:8100/upload" enctype="multipart/form-data">
  <input type="file" name="file" />
  <!-- input must set the name attribute, otherwise the data cannot be sent -->

  <button type="submit" id="btn-submit">上 传</button>
</form>
```

![](../../../assets/javascript/file-upload/upload-form.gif)

See the backend code for details: [Server Receive File Code] (#Server Receive File Code)

Uploading files in this way does not require `js`, and there is no compatibility issue. All browsers support it, but the experience is very poor, resulting in page refresh and other data loss on the page.

ps multi-file upload only needs a tag and an attribute to get it, the file tag opens `multiple`.

```html
<input type="file" name="file" multiple />
```

## Using iframe to achieve upload without refresh

Put a hidden iframe in the page, or create it dynamically using js, and specify the value of the `target` attribute of the `form` form as the value of the `name` attribute of the iframe tag, so that the `shubmit` behavior of the `form` form The jump will be completed within the `iframe`, and the overall page will not be refreshed.

```html
<form target="upload-iframe" action="http://localhost:8100/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="file" />
  <button type="submit" id="btn-submit">上 传</button>
</form>

<iframe id="upload-iframe" name="upload-iframe" style="display: none;"></iframe>

<script>
  const iframe = document.getElementById('upload-iframe')
  iframe.addEventListener('load', function() {
    const result = iframe.contentWindow.document.body.innerText
    alert(result)
  })
</script>
```

## ajax to achieve upload without refresh

`XMLHttpRequest` can read and upload binary data, use `FormData` object to manage form data

```html
<input type="file" multiple id="input-upload" />
<button id="btn-submit">上传</button>

<script>
  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')

  button.onclick = function() {
    const fileList = input.files
    const formData = new FormData ()
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      formData.append('file', file)
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8100/upload', true)
    xhr.send(formData)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const result = JSON.parse(xhr.responseText) //Return value
        alert(result)
      }
    }
  }
</script>
```

## Implement upload progress monitoring

With the help of `XMLHttpRequest2`, it can display the progress bar of uploading multiple files or one file.

In the `console` of `developer tools` of `chrome`, `new` an `XHR` object, you can see the smart prompt comes out of an `onprogress` event listener by calling the point operator, is that we just bind it? What about the `progress` event of the XHR` object?

Very close, but the `progress` event directly under the `XHR` object is not used to monitor the progress of the uploaded resource. The `XHR` object also has an attribute `upload`, which returns an [XMLHttpRequestUpload](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/upload) object, which has the following method:

| Event | Information type of corresponding attribute |
| ----------- | -------------------------------- |
| onloadstart | Get started |
| onprogress | Data transfer in progress |
| onabort | Get operation terminated |
| onerror | Get failed |
| onload | Get success |
| ontimeout | Get operation is not completed within the time specified by the user |
| onloadend | Get completed (regardless of success) |

Among them, the `onprogress` event callback method can be used to track the progress of resource upload. Its `event` parameter object contains two important properties `loaded` and `total`. Represent the number of bytes currently uploaded (`number of bytes`) and the total number of bytes in the file. For example, we can calculate the progress percentage like this:

```js
xhr.upload.onprogress = function(event) {
  if (event.lengthComputable) {
    var percentComplete = (event.loaded / event.total) * 100
    // Process progress
  }
}
```

The "lengthComputable" attribute of the event represents whether the total file size is known. If the value of the `lengthComputable` attribute is `false`, it means that the total number of bytes is unknown and the value of `total` is zero.

```html
<input type="file" multiple id="input-upload" />
<button id="btn-submit">上传</button>
<br />

<progress id="progress" value="0" max="100"></progress>

<script>
  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')
  const progress = document.getElementById('progress')

  button.onclick = function() {
    const fileList = input.files
    const formData = new FormData ()
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      formData.append('file', file)
    }

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = function(event) {
      if (event.lengthComputable) {
        const completedPercent = ((event.loaded / event.total) * 100).toFixed(2)
        progress.value = completedPercent
      }
    }

    xhr.open('POST', 'http://localhost:8100/upload', true)
    xhr.send(formData)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const result = JSON.parse(xhr.responseText) //Return value
        alert(result)
      }
    }
  }
</script>
```

![](../../../assets/javascript/file-upload/upload-progress.gif)

## Multi-file upload + progress + cancel upload

>-Use `xhr.abort` to cancel the upload request and stop uploading.
>-Use `xhr.upload.onprogress` `(event.loaded / event.total) * 100` to get the upload progress
>-Use `window.URL.createObjectURL` to get the preview address

:::details code

```html {68,75}
<style>
  #img-box {
    display: flex;
    flex-wrap: wrap;
  }
  #img-box > div {
    width: 200px;
    margin: 10px;
    border: 1px solid #ccc;
  }
  #img-box div img {
    width: 100%;
    height: 160px;
  }
</style>

<input type="file" multiple id="input-upload" />
<button id="btn-submit">上传</button>
<br />

<div id="img-box"></div>

<script>
  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')
  const imgBox = document.getElementById('img-box')

  let uploadList = []

  input.onchange = function(e) {
    const fileList = e.target.files
    imgBox.innerHTML = ''
    uploadList = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const div = document.createElement('div')
      const img = document.createElement('img')
      img.src = window.URL.createObjectURL(file)
      img.onload = function() {
        window.URL.revokeObjectURL(this.src)
      }
      const subDiv = document.createElement('div')
      subDiv.innerHTML = '<progress value="0" max="100"></progress><button>停止</button>'

      div.appendChild(img)
      div.appendChild(subDiv)
      imgBox.appendChild(div)

      uploadList.push({
        file,
        subDiv
      })
    }
  }

  function uploadFile({ file, subDiv }) {
    const progress = subDiv.querySelector('progress')
    const aborttButton = subDiv.querySelector('button')

    const formData = new FormData ()
    formData.append('file', file)
    const xhr = new XMLHttpRequest()

    aborttButton.onclick = function (e) {
      if (xhr && xhr.readyState !== 4) {
        if (aborttButton.innerText ==='Upload succeeded') return false
        //cancel upload
        xhr.abort()
        e.target.innerText ='Manually stopped'
      }
    }

    xhr.upload.onprogress = function(event) {
      if (event.lengthComputable) {
        progress.value = ((event.loaded / event.total) * 100).toFixed(2)
      }
    }
    xhr.open('POST', 'http://localhost:8100/upload', true)
    xhr.send(formData)
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const result = JSON.parse(xhr.responseText) //Return value
        aborttButton.innerText ='Upload succeeded'
      }
    }
  }

  button.onclick = function() {
    uploadList.forEach(uploadFile)
  }
</script>
```

:::

## Drag and drop upload

The advent of `html5` makes drag-and-drop upload interaction possible, and such experiences are now commonplace.

```html
<style>
  .drop-box {
    width: 300px;
    height: 300px;
    font-size: 20px;
    line-height: 300px;
    background-color: green;
    text-align: center;
  }
</style>
<div class="drop-box" id="drop-box">
  Drag the file here to start uploading
</div>

<button type="button" id="btn-submit">上 传</button>

<script>
  const box = document.getElementById('drop-box')
  const button = document.getElementById('btn-submit')

  //Disable the default behavior of browser drag and drop
  document.addEventListener('drop', function(e) {
    console.log('document drog')
    e.preventDefault()
  })

  box.ondragover = function(e) {
    console.log('Drag the picture to move in the box')
    e.preventDefault()
  }

  box.ondragleave = function(e) {
    console.log('The dragged picture leaves the box')
    e.preventDefault()
  }

  box.ondrop = function(e) {
    e.preventDefault() // Disable the browser's drag and drop default behavior
    const files = e.dataTransfer.files // Get the file object in drag
    console.log('The picture has been placed, you can upload....', files)
  }
</script>
```

## Large file segment upload and breakpoint resume

See [large file fragment upload and breakpoint resume] (./large-file-upload.md)

## The server receives the file code

```js
const Koa = require ('too')
const koaBody = require('koa-body')
const Router = require('koa-router')
const koaStatic = require('koa-static')

const fs = require('fs')
const path = require('path')

const PORT = 8100
const uploadDir = path.resolve(__dirname, './static/uploads')

const app = new Koa ()
const router = new Router()

app.use(
  koaBody ({
    multipart: true, // Turn on file upload, the default is off
    formidable: {
      keepExtensions: true, //Keep the original file suffix
      maxFileSize: 2000 * 1024 * 1024 // Set the maximum limit of the uploaded file size, the default is 20M
    }
  })
)

app.use(router.routes()).use(router.allowedMethods())

//Enable static file access
app.use(koaStatic(path.resolve(__dirname, './static')))

router.post('/upload', async ctx => {
  !fs.existsSync(uploadDir) && fs.mkdirSync(uploadDir)
  const file = ctx.request.files.file // Get the uploaded file

  const saveFile = file => {
    return new Promise((resolve, reject) => {
      try {
        const reader = fs.createReadStream(file.path) // Create a readable stream
        const fileName = file.name
        const filePath = `${uploadDir}/${fileName}`
        const upStream = fs.createWriteStream(filePath)
        reader.pipe(upStream)
        reader.on('end', () => {
          resolve(fileName) // Successful upload
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  const fileList = Array.isArray(file) ? file : [file]
  const uploadList = await Promise.all(fileList.map(saveFile))
  ctx.body = uploadList
})

app.listen(PORT, () => {
  console.log(`server listen on: http://localhost:${PORT}`)
})
```

## Reference Article

-[One article to understand the whole process of file upload] (https://juejin.im/post/5e80511f51882573793e6428)
-[Guide to uploading various files to the front end of novices, from small pictures to large file breakpoint resumes] (https://juejin.im/post/5da14778f265da5bb628e590)
-[Upload of large front-end files] (https://juejin.im/post/5cf765275188257c6b51775f)
-[Byte Beat Interviewer, I also implemented large file upload and breakpoint resume] (https://juejin.im/post/5e367f6951882520ea398ef6)
