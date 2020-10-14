---
title: ArrayBuffer object
date: 2020-04-08 21:24:27
---

## Foreword

The `ArrayBuffer` object, the `TypedArray` view and the `DataView` view are an interface for `JavaScript` to manipulate binary data. They all process binary data in an array syntax, so they are collectively called binary arrays.

The original design purpose of this interface is related to the WebGL project. The so-called WebGL refers to the communication interface between the browser and the graphics card. In order to meet the large-scale, real-time data exchange between JavaScript and the graphics card, the data communication between them must be binary, not the traditional text format. The text format passes a 32-bit integer, and the JavaScript scripts and graphics cards on both ends must be formatted, which will be very time-consuming. At this time, if there is a mechanism that can directly manipulate bytes like C language, and send 4 bytes of 32-bit integers to the graphics card intact in binary form, the performance of the script will be greatly improved.

The binary array was born in this context. It is much like a C language array, allowing developers to directly manipulate memory in the form of array subscripts, greatly enhancing the ability of JavaScript to process binary data, making it possible for developers to communicate binaryly with the native interface of the operating system through JavaScript.

The binary array consists of three types of objects.

1. `ArrayBuffer` object: Represents a piece of binary data in memory, which can be operated by "View". The "view" deploys an array interface, which means that you can use the array method to manipulate memory.
2. `TypedArray` view: includes 9 types of views, such as Uint8Array (unsigned 8-bit integer) array view, Int16Array (16-bit integer) array view, Float32Array (32-bit floating point) array view, etc.
3. `DataView` view: You can customize the view of the composite format, for example, the first byte is Uint8 (unsigned 8-bit integer), the second and third bytes are Int16 (16-bit integer), the fourth word The beginning of the section is Float32 (32-bit floating point number), etc. In addition, you can also customize the byte order.

> To put it simply, the `ArrayBuffer` object represents the original binary data, the `TypedArray` view is used to read and write simple types of binary data, and the `DataView` view is used to read and write complex types of binary data.

Note that binary arrays are not real arrays, but array-like objects.

Many browser operation APIs use binary arrays to manipulate binary data. Here are a few of them.

`Canvas` `Fetch API` `File API` `WebSockets`

## ArrayBuffer object

The `ArrayBuffer` object represents a section of memory that stores binary data. It cannot be read and written directly, but can only be read and written through views (`TypedArray` view and `DataView` view). The role of a view is to interpret binary data in a specified format.

`ArrayBuffer` is also a constructor, which can allocate a continuous memory area where data can be stored.

```js
const buf = new ArrayBuffer(32)
```

![](../../../assets/javascript/arraybuffer.png)

The above code generates a 32-byte memory area, and the value of each byte is 0 by default. As you can see, the parameter of the `ArrayBuffer` constructor is the required memory size (in bytes).

In order to read and write this content, you need to specify a view for it. To create a `DataView` view, you need to provide an instance of the `ArrayBuffer` object as a parameter.

```js
const buf = new ArrayBuffer(32)
const dataView = new DataView(buf)
dataView.getUint8(0) // 0
```

The above code creates a `DataView` view of a 32-byte memory, and then reads the 8-bit binary data from the beginning in an unsigned 8-bit integer format. The result is 0, because the original memory's ArrayBuffer` object defaults to all Bits are all 0.

Another kind of `TypedArray` view, one difference from the `DataView` view is that it is not a constructor, but a set of constructors, representing different data formats.

```js
const buffer = new ArrayBuffer(12)

const x1 = new Int32Array(buffer)
x1[0] = 1
const x2 = new Uint8Array(buffer)
x2[0] = 2

x1[0] // 2
```

The above code creates two views of the same segment of memory: 32-bit signed integer (`Int32Array` constructor) and 8-bit unsigned integer (`Uint8Array` constructor). Since two views correspond to the same memory, one view modifies the underlying memory, which will affect the other view.

The constructor of the `TypedArray` view, in addition to accepting the `ArrayBuffer` instance as a parameter, can also accept an ordinary array as a parameter, directly allocate memory to generate the underlying `ArrayBuffer` instance, and at the same time complete the assignment of this memory.

```js
const typedArray = new Uint8Array([0, 1, 2])
typedArray.length // 3

typedArray[0] = 5
typedArray // [5, 1, 2]
```

The above code uses the `Uint8Array` constructor of the `TypedArray` view to create an unsigned 8-bit integer view. As you can see, `Uint8Array` directly uses the ordinary array as a parameter, and the assignment to the underlying memory is completed at the same time.

- **`ArrayBuffer.prototype.byteLength`**

The `byteLength` property of the `ArrayBuffer` instance returns the byte length of the allocated memory area.

```js
const buffer = new ArrayBuffer(32)
buffer.byteLength // 32
```

If the memory area to be allocated is large, there may be a failure to allocate (because there is not so much continuous free memory), so it is necessary to check whether the allocation is successful.

```js
if (buffer.byteLength === n) {
  // success
} else {
  // failed
}
```

- **`ArrayBuffer.prototype.slice()`**

The `ArrayBuffer` instance has a `slice` method that allows copying a part of the memory area to generate a new `ArrayBuffer` object.

```js
const buffer = new ArrayBuffer(8)
const newBuffer = buffer.slice(0, 3)
```

The above code copies the first 3 bytes of the `buffer` object (starting from 0 and ending before the third byte) to generate a new `ArrayBuffer` object. The slice method actually contains two steps. The first step is to allocate a new piece of memory, and the second step is to copy the original ArrayBuffer object.

The `slice` method accepts two parameters. The first parameter indicates the byte number of the copy start (including the byte), and the second parameter indicates the byte number of the copy end (excluding the byte). If the second parameter is omitted, it defaults to the end of the original ArrayBuffer object.

Except for the `slice` method, the `ArrayBuffer` object does not provide any method for directly reading and writing to memory. It only allows to create a view above it, and then read and write through the view.

- **`ArrayBuffer.isView()`**

`ArrayBuffer` has a static method `isView` which returns a Boolean value indicating whether the argument is a view instance of `ArrayBuffer`. This method is roughly equivalent to determining whether the parameter is a `TypedArray` instance or a `DataView` instance.

```js
const buffer = new ArrayBuffer(8)
ArrayBuffer.isView(buffer) // false

const v = new Int32Array(buffer)
ArrayBuffer.isView(v) // true
```

## TypedArray view

As an area of ​​memory, the `ArrayBuffer` object can store various types of data. In the same memory, different data have different interpretation methods, this is called "view" (view).

There are two views of `ArrayBuffer`, one is the `TypedArray` view and the other is the `DataView` view. The array members of the former are all of the same data type, and the array members of the latter can be of different data types.

For more details, see [Ruan Yifeng es6 ArrayBuffer] (https://es6.ruanyifeng.com/#docs/arraybuffer)

## DataView view

If a piece of data includes multiple types (such as HTTP data from the server), in addition to creating a composite view of the ArrayBuffer object, you can also operate through the DataView view.

The `DataView` view provides more operation options and supports setting the byte order. Originally, for design purposes, the various TypedArray views of the `ArrayBuffer` object are used to transmit data to local devices such as network cards and sound cards, so it is sufficient to use the byte order of the local machine; and the `DataView` view Is designed to process data from network devices, so big-endian or little-endian byte order can be set by yourself.

The `DataView` view itself is also a constructor, which accepts an `ArrayBuffer` object as a parameter to generate the view.

```js
new DataView(ArrayBuffer buffer [, byte start position [, length]]);
```

For more details, see [Ruan Yifeng es6 ArrayBuffer] (https://es6.ruanyifeng.com/#docs/arraybuffer)
