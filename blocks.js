/**

@module Puffscoin:blocks
*/

/**
The PuffsBlocks collection, with some puffscoin additions.

@class PuffsBlocks
@constructor
*/

PuffsBlocks = new Mongo.Collection("puffscoin_blocks", { connection: null });

// if(typeof PersistentMinimongo !== 'undefined')
//     new PersistentMinimongo(PuffsBlocks);

/**
Gives you reactively the lates block.

@property latest
*/
Object.defineProperty(PuffsBlocks, "latest", {
  get: function() {
    return PuffsBlocks.findOne({}, { sort: { number: -1 } }) || {};
  },
  set: function(values) {
    var block = PuffsBlocks.findOne({}, { sort: { number: -1 } }) || {};
    values = values || {};
    PuffsBlocks.update(block._id, { $set: values });
  }
});

/**
Stores all the callbacks

@property _forkCallbacks
*/
PuffsBlocks._forkCallbacks = [];

/**
Start looking for new blocks

@method init
*/
PuffsBlocks.init = function() {
  if (typeof web3 === "undefined") {
    console.warn(
      "PuffsBlocks couldn't find web3, please make sure to instantiate a web3 object before calling PuffsBlocks.init()"
    );
    return;
  }

  // clear current block list
  PuffsBlocks.clear();

  Tracker.nonreactive(function() {
    observeLatestBlocks();
  });
};

/**
Add callbacks to detect forks

@method detectFork
*/
PuffsBlocks.detectFork = function(cb) {
  PuffsBlocks._forkCallbacks.push(cb);
};

/**
Clear all blocks

@method clear
*/
PuffsBlocks.clear = function() {
  _.each(PuffsBlocks.find({}).fetch(), function(block) {
    PuffsBlocks.remove(block._id);
  });
};

/**
The global block subscription instance.

@property subscription
*/
var subscription = null;

/**
Update the block info and adds additional properties.

@method updateBlock
@param {Object} block
*/
function updateBlock(block) {
  // reset the chain, if the current blocknumber is 100 blocks less
  if (block.number + 10 < PuffsBlocks.latest.number) PuffsBlocks.clear();

  block.difficulty = block.difficulty.toString(10);
  block.totalDifficulty = block.totalDifficulty.toString(10);

  web3.eth.getGasPrice(function(e, gasPrice) {
    if (!e) {
      block.gasPrice = gasPrice.toString(10);
      PuffsBlocks.upsert(
        "bl_" + block.hash.replace("0x", "").substr(0, 20),
        block
      );
    }
  });
}

/**
Observe the latest blocks and store them in the Blocks collection.
Additionally cap the collection to 50 blocks

@method observeLatestBlocks
*/
function observeLatestBlocks() {
  // get the latest block immediately
  web3.eth.getBlock("latest", function(e, block) {
    if (!e) {
      updateBlock(block);
    }
  });

  // GET the latest blockchain information
  subscription = web3.eth.subscribe("newBlockHeaders", function(error, result) {
    checkLatestBlocks(error, result ? result.hash : null);
  });
}

/**
The observeLatestBlocks callback used in the block subscription.

@method checkLatestBlocks
*/
var checkLatestBlocks = function(e, hash) {
  if (!e) {
    web3.eth.getBlock(hash, function(e, block) {
      if (!e) {
        var oldBlock = EthBlocks.latest;

        // console.log('BLOCK', block.number);

        // if(!oldBlock)
        //     console.log('No previous block found: '+ --block.number);

        // CHECK for FORK
        if (oldBlock && oldBlock.hash !== block.parentHash) {
          // console.log('FORK detected from Block #'+ oldBlock.number + ' -> #'+ block.number +'!');

          _.each(PuffsBlocks._forkCallbacks, function(cb) {
            if (_.isFunction(cb)) cb(oldBlock, block);
          });
        }

        updateBlock(block);

        // drop the 50th block
        var blocks = PuffsBlocks.find({}, { sort: { number: -1 } }).fetch();
        if (blocks.length >= 5) {
          var count = 0;
          _.each(blocks, function(bl) {
            count++;
            if (count >= 5) PuffsBlocks.remove({ _id: bl._id });
          });
        }
      }
    });
  }
};
