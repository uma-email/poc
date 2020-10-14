---
title: Large file upload and resumable download
date: 2020-04-13 15:57:04
---

## the whole idea

If the file is too large, such as a video 1g 2g or larger, the direct upload method may cause **link timeout**, and it will **exceed the server's allowed file upload limit**, so solve it For this problem, we can upload files in pieces, uploading only a small part such as `2M` at a time.

<Badge text="前端" type="success"/>

---

The core of uploading large files in slices is to use [Blob.prototype.slice](./blob.md#blob-prototype-slice), which is similar to the array `slice` method. The called `slice` method can return the original file A slice of

In this way, we can divide the file into slices according to the preset maximum number of slices, and then upload multiple slices at the same time with the help of `http` concurrency, so that transferring a large file from the original has become a simultaneous transmission. Multiple small file slices can greatly reduce upload time

In addition, because it is concurrent, the order of transmission to the server may change, so we also need to record the order for each slice

<Badge text="服务端" type="warning"/>

---

The server needs to be responsible for accepting these slices, and after receiving all the slices, `merge slices`

Two questions arise here

1. When to merge slices, ie when the slices are transferred
2. How to merge slices

The first problem requires the front-end to cooperate. The front-end carries the maximum number of slices in each slice. When the server receives this number of slices, it automatically merges. You can also send an additional request to actively notify the server to merge slices.

The second question, specifically how to merge slices? Here you can use the read and write stream of `nodejs` (`readStream/writeStream`) to transfer all the sliced ​​streams to the stream of the final file

## Large file upload-front end

Because the demo here still uses native html instead of framework.

First create a control to select the file, click the upload button to trigger the upload request.

```html
<input type="file" id="input-upload" />
<button id="btn-submit">上传</button>

<script>
  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')
  button.onclick = function() {
    const file = input.files[0]
    const chunkList = createFileChunk(file) // Create slice array
    uploadChunks(file, chunkList) // upload shard data
  }
</script>
```

:::details file structure
![](../../../assets/javascript/large-file-upload/upload-project.png)
:::

### Package request

Instead of using a third-party request library, the native `XMLHttpRequest` is used as a simple package to send requests

```js
function ajax({ url, data, method = 'POST', headers = {} }) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
    xhr.send(data)

    // Monitor the request success event and execute the event function after triggering
    xhr.onload = function(e) {
      resolve(e.target.response)
    }
  })
}
```

### Upload slice

Then implement the more important upload function, uploading needs to do two things

1. Slice the file
2. Transfer the slice to the server

```js
const SIZE = 10 * 1024 * 1024 // slice 10M

function createFileChunk(file, piece = SIZE) {
  const chunkList = []
  let cur = 0
  while (cur < file.size) {
    const blob = file.slice(cur, cur + piece)
    chunkList.push(blob)
    cur += piece
  }
  return chunkList
}

function uploadChunks(file, chunkList) {
  Promise.all(
    chunkList.map((chunk, index) => {
      const formData = new FormData ()
      formData.append('chunk', chunk)
      formData.append('filename', file.name)
      formData.append('hash', index)
      return ajax({ url: '/uploadChunk', data: formData })
    })
  )
}
```

When the upload button is clicked, `createFileChunk` is called to slice the file, and the number of slices is controlled by the file size. Here, 10MB is set, which means that a 100 MB file will be divided into 10 slices.

When generating file slices, you need to give each slice an identifier as a `hash`, here temporarily use `file name + subscript`, so that the backend can know the current slice is the number of slices, used for subsequent merged slices

Then call `uploadChunks` to upload all file slices, put the file slice, slice `hash`, and file name into `FormData`, then call the `ajax` function from the previous step to return a `proimise`, and finally call `Promise.` all` upload all slices concurrently

### Send merge request

The second method of merging slices mentioned in the overall idea is used here, that is, the front end actively informs the server to merge, so the front end also needs to send an additional request, and the server actively merges the slices when it receives this request.

`` `jsx
function uploadChunks(file, chunkList) {
  Promise.all(
    chunkList.map((chunk, index) => {
      //...
    })
  ).then(res => {
    ajax({
      url: '/ merge',
      headers: { 'content-type': 'application/json' },
      data: JSON.stringify({ filename: file.name, size: SIZE })
    })
  })
}
```

:::details at this time the entire html code

```html
<input type="file" id="input-upload" />
<button id="btn-submit">上传</button>

<script>
  const SIZE = 2 * 1024 * 1024 // slice 2M

  /**
   * ajax request
   */
  function ajax({ url, data, method = 'POST', headers = {} }) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
      xhr.send(data)

      // Monitor the request success event and execute the event function after triggering
      xhr.onload = function(e) {
        resolve(e.target.response)
      }
    })
  }

  /**
   * Generate file slices
   */
  function createFileChunk(file, piece = SIZE) {
    const chunkList = []
    let cur = 0
    while (cur < file.size) {
      const blob = file.slice(cur, cur + piece)
      chunkList.push(blob)
      cur += piece
    }
    return chunkList
  }

  /**
   * Upload slice
   */
  function uploadChunks(file, chunkList) {
    Promise.all(
      chunkList.map((chunk, index) => {
        const formData = new FormData ()
        formData.append('chunk', chunk)
        formData.append('filename', file.name)
        formData.append('hash', index)

        return ajax({ url: '/uploadChunk', data: formData })
      })
    ).then(res => {
      ajax({
        url: '/ merge',
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({ filename: file.name, size: SIZE })
      })
    })
  }

  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')

  button.onclick = function() {
    const file = input.files[0]
    const chunkList = createFileChunk(file)
    uploadChunks(file, chunkList)
  }
</script>
```

:::

## Large file upload-server part

I used `koa` to build the server

:::details basic code

```js
const Koa = require ('too')
const koaBody = require('koa-body')
const Router = require('koa-router')
const koaStatic = require('koa-static')

const fs = require('fs')
const path = require('path')

const PORT = 8100
const uploadDir = path.resolve(__dirname, './static/uploads')
!fs.existsSync(uploadDir) && fs.mkdirSync(uploadDir)

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

router.post('/uploadChunk', async ctx => {
  // ...
})

router.post('/merge', async ctx => {
  // ...
})

app.listen(PORT, () => {
  console.log(`server listen on: http://localhost:${PORT}`)
})
```

:::

The main process is

-The server saves each segment file
-After uploading all the fragments on the browser side, send a request to the server to merge files
-The server merges files according to the file ID, type, and sequence of each fragment
-Delete shard files

### Accept slice

1. Create a directory `chunkDir` to save the block
2. Write the block file to the directory

```js
router.post('/uploadChunk', async ctx => {
  const { filename, hash } = ctx.request.body
  const chunk = ctx.request.files.chunk
  const fileExtName = path.extname(filename) // file extension

  const chunkDir = `${uploadDir}/${filename.replace(fileExtName, '')}`

  !fs.existsSync(chunkDir) && fs.mkdirSync(chunkDir)

  const saveChunk = (chunk, filename, hash) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = fs.createReadStream(chunk.path) // Create a readable stream
        const chunkName = `${filename}-hash-${hash}`
        const chunkPath = `${chunkDir}/${chunkName}`
        const writeStream = fs.createWriteStream(chunkPath)
        reader.pipe(writeStream)
        reader.on('end', () => {
          resolve(chunkName) // Successful upload
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  const chunkName = await saveChunk(chunk, filename, hash)
  ctx.body = `received file chunk: ${chunkName}`
})
```

![](../../../assets/javascript/large-file-upload/upload-chunk.png)

### Merge slices

After receiving the merge request sent by the front end, the server merges all the slices under the folder

```js
router.post('/merge', async ctx => {
  const { filename, size } = ctx.request.body
  const fileExtName = path.extname(filename) // file extension
  const filePath = `${uploadDir}/${filename}` // file path to write

  const chunkDir = `${uploadDir}/${filename.replace(fileExtName,'')}` // chunk storage path

  const chunkPahtList = fs.readdirSync(chunkDir)
  chunkPahtList.sort((x, y) => x.split('-hash-')[1] - y.split('-hash-')[1])

  await Promise.all(
    chunkPahtList.map((chunkName, index) => {
      return new Promise(resolve => {
        const chunkPath = `${chunkDir}/${chunkName}` // path of chunk block
        const reader = fs.createReadStream(chunkPath) // Create a readable stream
        const writeStream = fs.createWriteStream(filePath, { start: index * size, end: (index + 1) * size })
        reader.pipe(writeStream)
        reader.on('end', () => {
          // Successfully deleted the slice
          fs.unlinkSync(chunkPath)
          resolve() // resolve successfully deleted asynchronously
        })
      })
    })
  )

  fs.rmdirSync(chunkDir) // Delete the chunk directory
  ctx.body ='Merge successfully'
})
```

Since the front end will carry the file name when sending the merge request, the server can find the slice folder created in the previous step according to the file name

Then use `fs.createWriteStream` to create a writable stream, the file name of the writable stream is the combination of **slice folder name + suffix name**

Then traverse the entire slice folder, create a readable stream through `fs.createReadStream`, transfer and merge it into the target file

It is worth noting that each readable stream will be transferred to the specified position of the writable stream, which is controlled by the second parameter `start/end` of `createWriteStream`, the purpose is to be able to merge multiple readable streams into the Write the stream, so that even if the order of the stream is different, it can be transmitted to the correct location, so here we also need to let the front end provide an additional `size` parameter when requesting

In fact, you can also wait for the last slice to be merged before merging the next slice, so that you do not need to specify the location, but the transmission speed will be reduced, so the method of concurrent merge is used, and then only need to ensure that this slice is deleted after each merge is completed, etc. After all the slices are merged, the slice folder can be deleted.

![](../../../assets/javascript/large-file-upload/upload-result.png)

## Show upload progress bar

`XMLHttpRequest` natively supports upload progress monitoring, you only need to listen to `upload.onprogress`, we pass the `onProgress` parameter on the basis of the original `ajax`, and register the monitoring event for `XMLHttpRequest`

```js
/**
 * ajax request
 */
function ajax({ url, data, method = 'POST', headers = {}, onProgress = e => e }) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
    xhr.upload.onprogress = onProgress
    xhr.send(data)
    // Monitor the request success event and execute the event function after triggering
    xhr.onload = function(e) {
      resolve(e.target.response)
    }
  })
}
```

Through the upload.onprogress of each slice, we can clearly know the progress of the slice upload. Add progress monitoring in `uploadChunks`

```html
<input type="file" id="input-upload" />
<button id="btn-submit">上传</button>
<progress id="progress" value="0" max="100"></progress>

<script>
  let loaded = 0
  let progress = 0
  const progressDom = document.getElementById('progress')

  function handleChunkProgress(event, file) {
    if (event.lengthComputable) {
      loaded += event.loaded
      progress = ((loaded / file.size) * 100).toFixed(2)
      if (progress > 100) progress = 100
      progressDom.value = progress
    }
  }

  function uploadChunks(file, chunkList) {
    Promise.all(
      chunkList.map((chunk, index) => {
        const formData = new FormData ()
        formData.append('chunk', chunk)
        formData.append('filename', file.name)
        formData.append('hash', index)

        return ajax({
          url: '/uploadChunk',
          data: formData,
          onProgress: e => handleChunkProgress(e, file)
        })
      })
    ).then(res => {
      // ...
    })
  }
</script>
```

final effect

![](../../../assets/javascript/large-file-upload/upload-progress2.gif)

## http

### Generate hash

Both the front end and the server must generate a file and a sliced ​​`hash`. Previously, we used the file name + slice subscript as the slice `hash`. In this way, once the file name is modified, it will lose its effect. In fact, as long as the file The content remains unchanged, `hash` should not change, so the correct approach is to generate `hash` based on the file content, so we modify the `hash` generation rules

Another library `spark-md5` is used here, which can calculate the `hash` value of the file based on the content of the file, and also consider that if you upload a very large file, reading the file content to calculate the `hash` is very time-consuming, and It will block the UI and cause the page to die, so we use `web-worker` to calculate the hash in the `worker` thread, so that users can still interact normally on the main interface

See [web-worker](./web-worker.md) for details

New `static/work.js`

```js
self.importScripts('https://cdn.bootcss.com/spark-md5/3.0.0/spark-md5.min.js')

self.addEventListener(
  'message',
  function(e) {
    const {chunkList} = e.data
    const spark = new self.SparkMD5.ArrayBuffer()
    let percentage = 0
    let count = 0

    function calcFileHash(chunkList) {
      let progress = 0
      let count = 0

      const loadNext = index => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(chunkList[index])
        reader.onload = e => {
          count++
          spark.append(e.target.result)

          if (count === chunkList.length) {
            self.postMessage({ chunkList, progress: 100, hash: spark.end() })
            self.close()
          } else {
            progress += 100 / chunkList.length
            self.postMessage({ progress })
            // Recursively calculate the next slice
            loadNext(count)
          }
        }
      }

      loadNext(0)
    }

    calcFileHash(chunkList)
  },
  false
)
```

In the `worker` thread, accept the file slice `fileChunkList`, use `FileReader` to read the `ArrayBuffer` of each slice, and continuously pass it into `spark-md5`. After each slice is calculated, send it to the main thread through `postMessage` Send a progress event and send the final `hash` to the main thread after all are completed

> `spark-md5` needs to calculate a `hash` value based on all the slices, you cannot directly put the entire file into the calculation, otherwise even different files will have the same `hash`, see the official documentation for details

### Pause upload

The breakpoint resume is just what the name implies: breakpoint + resume, so our first step is to achieve a "breakpoint", which is to pause uploading

The principle is to use the abort method of XMLHttpRequest, which can cancel the sending of an xhr request. For this, we need to save the xhr object that uploads each slice. Let’s transform the request method

In this way, when uploading the slice, the requestList array is passed as a parameter, and the request method will save all the xhr in the array.

Whenever a slice is uploaded successfully, the corresponding xhr is deleted from the requestList, so only the xhr of the slice being uploaded is saved in the requestList

```html
<input type="file" id="input-upload" />
<button id="btn-submit">上传</button>
<button id="btn-abort" disabled>Pause upload</button>

<h3>Calculate hash progress</h3>
<progress id="hash-progress" value="0" max="100"></progress>
<span id="hash-progress-text">0%</span>

<h3>Upload progress</h3>
<progress id="progress" value="0" max="100"></progress>
<span id="progress-text">0%</span>

<script>
  const SIZE = 10 * 1024 * 1024 // slice 10M
  let loaded = 0
  let progress = 0
  let requestList = []
  const progressDom = document.getElementById('progress')
  const progressDomText = document.getElementById('progress-text')
  const hashProgressDom = document.getElementById('hash-progress')
  const hashProgressDomText = document.getElementById('hash-progress-text')
  const input = document.getElementById('input-upload')
  const button = document.getElementById('btn-submit')
  const abortButton = document.getElementById('btn-abort')
  /**
   * ajax request
   */
  function ajax({ url, data, method = 'POST', headers = {}, onProgress = e => e }) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
      xhr.upload.onprogress = onProgress
      xhr.send(data)
      // Monitor the request success event and execute the event function after triggering
      xhr.onload = function(e) {
        resolve(e.target.response)
        const index = requestList.findIndex(item => item === xhr)
        requestList.splice(index, 1)
      }
      requestList.push(xhr)
    })
  }

  function createFileChunk(file, piece = SIZE) {
    const chunkList = []
    let cur = 0
    while (cur < file.size) {
      const blob = file.slice(cur, cur + piece)
      chunkList.push(blob)
      cur += piece
    }
    return chunkList
  }

  function uploadChunks(file, chunkList, hash) {
    Promise.all(
      chunkList.map((chunk, index) => {
        const formData = new FormData ()
        formData.append('chunk', chunk)
        formData.append('filename', file.name)
        formData.append('hash', hash)
        formData.append('index', index)

        return ajax({
          url: '/uploadChunk',
          data: formData,
          onProgress: e => handleChunkProgress(e, file)
        })
      })
    ).then(res => {
      ajax({
        url: '/ merge',
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({ filename: file.name, size: SIZE })
      })
    })
  }

  function handleChunkProgress(event, file) {
    if (event.lengthComputable) {
      loaded += event.loaded
      progress = ((loaded / file.size) * 100).toFixed(2)
      if (progress > 100) progress = 100
      progressDom.value = progress
      progressDomText.innerText = `$ {progress}%`
    }
  }

  button.onclick = function() {
    const file = input.files[0]
    const chunkList = createFileChunk(file) // Create slice array

    const worker = new Worker('work.js')
    worker.postMessage({ chunkList })
    worker.onmessage = function(event) {
      const { progress, hash } = event.data
      hashProgressDom.value = progress
      hashProgressDomText.innerText = `$ {progress}%`
      if (progress === 100) {
        console.log('work hash', hash)
        abortButton.removeAttribute('disabled')
        uploadChunks(file, chunkList, hash)
      }
    }
  }

  abortButton.onclick = {}
</script>
```

## Reference Article

-[Byte Beat Interviewer: Please implement a large file upload and breakpoint resume] (https://juejin.im/post/5dff8a26e51d4558105420ed)
-[Guide to uploading various files to the front end of novices, from small pictures to large file breakpoint resumes] (https://juejin.im/post/5da14778f265da5bb628e590)
-[Byte Beat Interviewer, I also implemented large file upload and breakpoint resume] (https://juejin.im/post/5e367f6951882520ea398ef6)
