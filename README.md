# react-ipfs-url

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/react-ipfs-url
[downloads-image]:http://img.shields.io/npm/dm/react-ipfs-url.svg
[npm-image]:http://img.shields.io/npm/v/react-ipfs-url.svg
[travis-url]:https://travis-ci.org/ipfs-shipyard/react-ipfs-url
[travis-image]:http://img.shields.io/travis/ipfs-shipyard/react-ipfs-url/master.svg
[codecov-url]:https://codecov.io/gh/ipfs-shipyard/react-ipfs-url
[codecov-image]:https://img.shields.io/codecov/c/github/ipfs-shipyard/react-ipfs-url/master.svg
[david-dm-url]:https://david-dm.org/ipfs-shipyard/react-ipfs-url
[david-dm-image]:https://img.shields.io/david/ipfs-shipyard/react-ipfs-url.svg
[david-dm-dev-url]:https://david-dm.org/ipfs-shipyard/react-ipfs-url?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/ipfs-shipyard/react-ipfs-url.svg

Grab a URL from a IPFS path by using [`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).


## Installation

```sh
$ npm install react-ipfs-url
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.


## Usage

**With `<IpfsFileUrl>` component**:

```js
import React from 'react';
import { IpfsFileUrl } from 'react-ipfs-url';

const ipfs = /* your ipfs node, perhaps provide it via context */;

const SomeComponent = () => (
    <IpfsFileUrl ipfs={ ipfs } path="/ipfs/QmQuMzeovz...">
        { ({ status, value }) => (
            <>
                { status === 'pending' && 'Loading...' }
                { status === 'rejected' && 'Oops, failed to load' }
                { status === 'fulfilled' && <img src={ value } alt="" /> }
            <>
        ) }
    </IpfsFileUrl>
);
```

**With `useIpfsFileUrl()` hook**:

```js
import React from 'react';
import { useIpfsFileUrl } from 'react-ipfs-url';

const ipfs = /* your ipfs node, perhaps provide it via context */;

const SomeComponent = () => {
    const [urlStatus, urlValue] = useIpfsFileUrl(ipfs, '/ipfs/QmQuMzeovz..');

    return (
        <>
            { status === 'pending' && 'Loading...' }
            { status === 'rejected' && 'Oops, failed to load' }
            { status === 'fulfilled' && <img src={ value } alt="" /> }
        <>
    );
};
```

## API

- [`<IpfsFileUrl>`](#ipfsfileurl)
- [`useIpfsFileUrl(ipfs, path, [options])`](#useiofsurlipfspath-options)

### IpfsFileUrl

The `<IpfsFileUrl>` component allows you to conditionally render children based on the url status and fulfillment/rejection value. It leverages the [render props](https://reactjs.org/docs/render-props.html) technique to know what to render.

#### Props

All properties from[react-promiseful](https://github.com/moxystudio/react-promiseful) are also valid.

##### ipfs

Type: `object`

The [ipfs](https://github.com/ipfs/js-ipfs) node to be used.

##### path

Type: `string`

The IPFS path to fetch and generate a URL from.

Also accepts [infura](https://infura.io) URLs. If the file doesn't seem to exist in infura, fallbacks to fetching the file from your local `ipfs` node.

##### timeout

Type: `number`   
Default: 180000

The max time to wait for `ipfs.get()`.

##### infuraTimeout

Type: `number`   
Default: 15000

The max time to spend checking if the file is available in infura, in case `path` is an [infura](https://infura.io) URL.

##### disposeDelayMs

Type: `number`   
Default: 60000

The delay in which object urls created with `URL.createObjectURL` are revoked when they are no longer used. 

##### children

Type: `Function`

A render prop function with the following signature:

```js
(state) => {}
```

The `state` argument is an object that contains the following properties:

- `status` is one of `none` (when there's no promise), `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value (url) or the rejection value
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](#thresholdms)

See [react-promiseful](https://github.com/moxystudio/react-promiseful) for more info.


### useIpfsFileUrl(ipfs, path, [options])

The hook version of the `<IpfsFileUrl>` component. The `options` available to both are exactly the same.

```js
const promiseState = useIpfsFileUrl(somePromise);
```

The returned value from the hook is the promise state, an object that contains the following properties:

- `status` is one of `none` (when there's no promise), `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value (url) or the rejection value
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](#thresholdms)

See [react-promiseful](https://github.com/moxystudio/react-promiseful) for more info.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
