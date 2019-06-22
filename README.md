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

**With `<IpfsUrl>` component**:

```js
import React from 'react';
import { IpfsUrl } from 'react-ipfs-url';

const ipfs = /* your ipfs node, perhaps provide it via context */;

const SomeComponent = () => (
    <IpfsUrl ipfs={ ipfs } path="/ipfs/QmQuMzeovz...">
        { ({ status, value }) => (
            <>
                { status === 'pending' && 'Loading...' }
                { status === 'rejected' && 'Oops, failed to load' }
                { status === 'fulfilled' && <img src={ value } alt="" /> }
            <>
        ) }
    </IpfsUrl>
);
```

**With `useIpfsUrl()` hook**:

```js
import React from 'react';
import { useIpfsUrl } from 'react-ipfs-url';

const ipfs = /* your ipfs node, perhaps provide it via context */;

const SomeComponent = () => {
    const [urlStatus, urlValue] = useIpfsUrl(ipfs, '/ipfs/QmQuMzeovz..');

    return (
        <>
            { status === 'pending' && 'Loading...' }
            { status === 'rejected' && 'Oops, failed to load' }
            { status === 'fulfilled' && <img src={ value } alt="" /> }
        </>
    );
};
```

## API

- [`<IpfsUrl>`](#ipfsurl)
- [`useIpfsUrl(ipfs, path, [options])`](#useipfsurlipfs-path-options)

### IpfsUrl

The `<IpfsUrl>` component allows you to conditionally render children based on the url status and fulfillment/rejection value. It leverages the [render props](https://reactjs.org/docs/render-props.html) technique to know what to render.

#### Props

All properties from [react-promiseful](https://github.com/moxystudio/react-promiseful) are also valid.

##### ipfs

Type: `object`

The [ipfs](https://github.com/ipfs/js-ipfs) node to be used.

##### input

Type: `string`

A valid IPFS path, hash or a provider URL, such as a gateway URL or an Infura URL.

> ⚠️ At the moment, IPNS paths are not supported for the `ipfs` and `ipfsOffline` providers: https://github.com/ipfs-shipyard/react-ipfs-url/issues/2

> ⚠️ There's no support for fully qualified domains URLs yet: https://github.com/ipfs-shipyard/react-ipfs-url/issues/4

##### stategy

Type: `string`   
Default: `input-first`

The strategy to use when resolving a valid URL.

- `input-first`: Use the provider associated with the `input` first and fallback to resolving with IPFS.
- `ipfs-first`: Use IPFS to resolve the URL first and fallback to resolving with the provider associated with the `input`
- `ipfs-offline-first`: Use offline IPFS first and fallback to resolving with the provider, followed by the online IPFS.
- `ipfs-only`: Only use IPFS to resolve the URL, even if `input` comes from another provider
- `ipfs-offline-only`: Only use IPFS (offline) to resolve the URL, even if `input` comes from another provider

##### checkTimeout

Type: `object`   
Default: `{ gateway: 12500, infura: 12500, ipfsOffline: 5000, ipfs: 180000 }`

The max time to spend checking for the existence of the content on providers.

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
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](https://github.com/moxystudio/react-promiseful#thresholdms)

See [react-promiseful](https://github.com/moxystudio/react-promiseful) for more info.


### useIpfsUrl(ipfs, path, [options])

The hook version of the `<IpfsUrl>` component. The `options` available to both are exactly the same.

```js
const urlState = useIpfsUrl(ipfs, '/ipfs/QmQuMzeovz..');
```

The returned value from the hook is the url promise state, an object that contains the following properties:

- `status` is one of `none` (when there's no promise), `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value (url) or the rejection value
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](https://github.com/moxystudio/react-promiseful#thresholdms)

See [react-promiseful](https://github.com/moxystudio/react-promiseful) for more info.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
