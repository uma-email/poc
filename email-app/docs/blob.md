---
title: Blob 与 FileReader
date: 2020-04-09 22:38:19
---

## Blob basic syntax

In general web development, `Blob` is rarely used, but `Blob` can meet the special needs in some scenarios. `Blob`, an abbreviation of `Binary Large Object`, represents a large object of binary type.

> In the Web, an object of type "Blob" represents immutable raw data like a file object. In layman's terms, a "Blob" object is binary data, but it is binary data like a file object, so it can be operated like The File` object operates the same as the `Blob` object, **In fact, `File` inherits from `Blob`. **

### Create a Blob instance

```js
Blob(blobParts[, options])
// example
let blob = new Blob(['hello world'], { type: 'text/plain' })
```

-`blobParts`: The first parameter, required, is an array. Each item in the array is connected to form the data of the `Blob` object. Each element in the array can be `ArrayBuffer`, `ArrayBufferView`, `Blob`, `DOMString`.
-`options`: The second parameter, options, dictionary format type, you can specify the following two attributes
  -`type`, the default value is "", which represents the `MIME` type of the contents of the array that will be put into `blob`.
  -`endings`, the default value is "`transparent`", used to specify how the string containing the line endings `\n` is written. It is one of the following two values: "`native`", which means that the line ending will be changed to a line break suitable for the file system of the host operating system; "`transparent`", which means that the end saved in `blob` will be maintained The characters remain unchanged.

:::details Demo

```js
const b1 = new Blob(['a'], { type: 'text/html' }) // Blob {size: 1, type: "text/html"}
const b2 = new Blob(['b']) // Blob {size: 2, type: ""}
const b3 = new Blob([`<div style='color:red;'>This is a blob</div>`]) // Blob {size: 44, type: ""}

const b4 = new Blob([JSON.stringify({ name: 'abc' })]) // Blob {size: 14, type: ""}
const b5 = new Blob([{ name: 'abc' }]) // Blob {size: 15, type: ""}

const b6 = new Blob(['a', 'b']) // Blob {size: 2, type: ""}
```

-`size` represents the number of bytes of data contained in the `Blob` object.
-It should be noted here that the difference between using strings and ordinary objects to create `Blob`
  -`b4` uses `JSON.stringify` to convert the object into a json string, `b5` is directly created using the object, the `size` of the two objects are `14` and `15` respectively
  -How was the size of `b5` equal to 15 calculated? In fact, when creating a `Blob` object using a normal object, it is equivalent to calling the `toString()` method of the normal object to get the string data, and then creating the `Blob` object. Therefore, the data stored in `b5` is `"[object Object]"`, which is 15 bytes (excluding the outermost quotation marks).

:::

### Blob.prototype.slice <Badge text="Big file upload" type="success"/>

> `Blob.prototype.slice` is mostly used for uploading large files in slices.

The `Blob` object has a `slice` method, which returns a new `Blob` object that contains the data in the specified range of the source `Blob` object.

```js
slice([start[, end[, contentType]]])
```

-`start`: Optional, represents the subscript in `Blob`, which means the first byte that will be copied into the new `Blob`. If a negative number is passed in, the offset will be calculated from the end of the data from back to front.
-`end`: optional, represents a subscript of `Blob`, the corresponding byte of this subscript -1 will be the last byte copied into the new `Blob`. If you pass in a negative number, the offset will be calculated from the end of the data from back to front.
-`contentType`: Optional, assign a new document type to the new `Blob`. This will set its `type` attribute to the value passed in. Its default value is an empty string.

```js
var data = 'abcdef'
var blob1 = new Blob([data])
var blob2 = blob1.slice(0, 3)

console.log(blob1) //输出：Blob {size: 6, type: ""}
console.log(blob2) //输出：Blob {size: 3, type: ""}
```

## Blob application scenarios

### Download Document

**Code**

```html {5,10,13}
<script>
  window.onload = function() {
    function download(blobContent, filename) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blobContent)
      link.download = filename || Date.now()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
    }

    let blob = new Blob(['hello world'], { type: 'text/plain' })
    download(blob, '1.txt')
  }
</script>
```

#### window.URL.createObjectURL

[URL.createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL) The static method will create a `DOMString` that contains an object representing the object given in the parameter `URL`. The life cycle of this `URL` is bound to the `document` in the window that created it. This new `URL` object represents the specified `File` object or `Blob` object. This method is equivalent to creating a memory reference address of the incoming object

```js
/**
 * Parameter description: object is the File object, Blob object or MediaSource object used to create the URL
 * @return A DOMString that can refer to the specified object such as blob: null/e3d559c7-xxx...
 */
const objectURL = URL.createObjectURL(object)
```

:::tip
If the html file is opened with a file protocol (that is, the url starts with `file://`), then the address http://localhost:1234` will become `null`, and this time the `Blob URL` is Not directly accessible.
:::

#### window.URL.revokeObjectURL

```js
/**
 * Parameter description: objectURL is a DOMString, which represents the URL object generated by calling the URL.createObjectURL() method.
 */
window.URL.revokeObjectURL(objectURL)
```

Each time the `createObjectURL()` method is called, a new `URL` object is created, even if you have already created it with the same object as the parameter. When these URL objects are no longer needed, each object must be released by calling the `URL.revokeObjectURL()` method. The browser will automatically release the documents when they exit, but in order to get the best performance and memory usage, you should actively release them at a safe time.

### Upload pictures, video preview

Sometimes we want to preview the picture before uploading the picture file through `input`. At this time, it can be achieved by what we have learned before, and it is very simple.

```html
<input id="upload" type="file" />
<img id="preview" src="" alt="预览" />

<script>
  const input = document.querySelector('#upload')
  const img = document.querySelector('#preview')

  input.onchange = function() {
    const file = upload.files[0] //File对象
    const src = URL.createObjectURL(file)
    preview.src = src
  }
</script>
```

Such a picture upload preview is realized, and this method is also applicable to the preview of the uploaded video.

### Large file upload and resumable download

For details, see [Large File Upload and Breakpoint Resume] (./large-file-upload.md)

## FileReader

> The `FileReader` object allows web applications to asynchronously read the contents of files or raw data buffers stored on the user’s computer, using the `File` or `Blob` object to specify the file or data to be read.

The `File` object can be a `FileList` object returned by the user after selecting a file on an `input` element, or a `DataTransfer` object generated by a drag and drop operation, or it can be executed on an `HTMLCanvasElement` After the `mozGetAsFile()` method returns the result.

```js
let reader = new FileReader()
```

The `FileReader` interface has 4 methods, 3 of which are used to read files and the other is used to interrupt reading. Regardless of whether the reading succeeds or fails, the method does not return the reading result, which is stored in the `result` attribute.

**method**

| Method name | Parameter | Description |
| :----------------: | :-------------: | :--------------------: |
| readAsBinaryString | file | Read file as binary encoding |
| readAsText | file,[encoding] | Read file as text |
| readAsDataURL | file | Read file as DataURL |
| abort | (none) | Terminal read operation |

**Event handler**

| Event | Call timing |
| ----------- | --------------------------------------------------------------------------------- |
| onabort | Called when the read operation is aborted |
| onerror | Called when an error occurs in the read operation |
| onload | Called when the read operation completes successfully |
| onloadend | Called when the read operation is complete, regardless of success or failure. This handler is called after onload or onerror |
| onloadstart | Called when the read operation is about to start |
| onprogress | Called periodically during data reading |

### Reading text

For the `input` element of `type="file"`, after the user selects the file to upload, a `FileList` object will be generated, with the following structure:

```json
{
  0: {
    lastModified: 1482289489971
    lastModifiedDate: Wed Dec 21 2016 11:04:49 GMT+0800，
    name: "index.html"，
    size: 1325，
    type: "text/html"，
  },
  1: {
    ...
  },
  length: 2
}
```

We can get the file name, modification time, size, file type and other information from it. The content of the file is also included, but it needs the file reading method of FileReader to get it. For plain text, we use the `readAsText` method, as follows:

```js
//FileReader reads the file content
const reader = new FileReader()
reader.readAsText(files[0], 'UTF-8')
reader.onload = function(e) {
  const urlData = this.result // urlData is the corresponding file content
}
```

**Code**

```html
<input id="upload" type="file" accept="text/javascript, text/plain, application/json" />

<script>
  const input = document.querySelector('#upload')
  input.onchange = e => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = function() {
      console.log(reader.result)
    }
  }
</script>
```

### Picture Preview

Another file reading method of `FileReader`, `readAsDataURL`, can convert image files to `base64` encoding. Can realize the local picture preview.

```html
<input id="upload" type="file" />
<img id="preview" src="" alt="预览" />
<script>
  const input = document.querySelector('#upload')
  const img = document.querySelector('#preview')
  input.onchange = e => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function() {
      img.src = reader.result
    }
  }
</script>
```

## Comparison of URL.createObjectURL and FileReader to realize picture preview

`readAsDataURL` converts the image file to `base64` encoding. When the file is too large, the generated 64-bit encoding may be too long and may cause the browser to crash. In general, `URL.createObjectURL` is more recommended.

## Reference

- [blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
-[Details about Blob in Web API] (https://juejin.im/post/59e35d0e6fb9a045030f1f35)
-[Why is the video link address of the video site a blob? ](https://juejin.im/post/5d1ea7a8e51d454fd8057bea)
-[Byte Beat Interviewer: Please implement a large file upload and breakpoint resume] (https://juejin.im/post/5dff8a26e51d4558105420ed)
- [createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)
- [revokeObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/revokeObjectURL)
- [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader)
-[Use files in web applications] (https://developer.mozilla.org/zh-CN/docs/Web/API/File/Using_files_from_web_applications)
-[FileReader for file reading] (https://dumengjie.github.io/2017/07/13/%E4%BD%BF%E7%94%A8FileReader%E8%BF%9B%E8%A1%8C %E6%96%87%E4%BB%B6%E8%AF%BB%E5%8F%96)
