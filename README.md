# PUFFScoin blocks

Provides you with an `PuffsBlocks` collection, which stores the last 50 PUFFScoin blocks.

You can query blocks like any other Meteor collection.

## Installation

    $ meteor add puffscoin:blocks

## Usage

Initialize Blocks on the start of your application, as soon as you have a PUFFScoin connection:

```js
PuffsBlocks.init();
```

### Last block

To get the latest block use:

```js
PuffsBlocks.latest;
```

Note this property is reactive, so it will re-run your reactive functions, e.g. when used in template helpers.

In case you want to update the latest block you can change properties as follows:

```js
PuffsBlocks.latest = { hash: "12345" };
```

This would only change the hash property of the latest block, but leave all other properties as is.

### Current gas price

Additionally all blocks get the current gasprice add:

```js
PuffsBlocks.latest.gasPrice; // '1136672632018' (wei)
```

### Detecting forks

You can call `Blocks.detectFork(callback)` to detect chain re-organisation (forks), while your applications is running.
This detection, is checking the new incoming blocks `parentHash`, with the last known block you have.

**Note** The fork detection can currently be wrong, when you're importing blocks, as they can come in different orders.

```js
PuffsBlocks.detectFork(function(oldBlock, newBlock) {
  // this callback will be fired with the old block we knew and the new block.
});
```

Note you can call `PuffsBlocks.detectFork(cb)` mutliple times, to add multiple callbacks.

### Clear all stored blocks

If you switch to a chain, which has a lower block number PuffsBlocks will reset your interally cache of the last 50 blocks.
If you want to do that manually call:

```js
PuffsBlocks.clear();
```
