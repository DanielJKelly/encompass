const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;

const helpers = require('../../../server/utils/mongoose');

let { isValidMongoId, areObjectIdsEqual, isObjectIdInArrayOfObjectIds, compareArraysOfObjectIds } = helpers;

describe('isValidMongoId', function() {
  it('should return false if passed no arguments', function() {
    expect(isValidMongoId()).to.eql(false);
  });

  it('should return false if passed undefined value', function() {
    expect(isValidMongoId(undefined)).to.eql(false);
  });

  it('should return false if passed null', function() {
    expect(isValidMongoId(null)).to.eql(false);
  });

  it('should return false if passed empty string', function() {
    expect(isValidMongoId('')).to.eql(false);
  });

  it('should return false if passed a number', function() {
    expect(isValidMongoId(543495154192672663942128)).to.eql(false);
  });

  it('should return false if passed an invalid 24 digit string', function() {
    expect(isValidMongoId('524*470803459a0b3018243c')).to.eql(false);
  });

  it('should return true if passed a string with valid format', function() {
    let id = mongoose.Types.ObjectId().toHexString();
    expect(isValidMongoId(id)).to.eql(true);
  });

  it('should return true if passed a valid ObjectId', function() {
    let id = mongoose.Types.ObjectId();
    expect(isValidMongoId(id)).to.eql(true);
  });
});

describe('areObjectIdsEqual', function() {
  describe('passing invalid arguments', function() {
    it('should return false if passed 0 arguments', function() {
      expect(areObjectIdsEqual()).to.eql(false);
    });

    it('should return false if passed equal strings that are not objectIds', function() {
      expect(areObjectIdsEqual('cat', 'cat')).to.eql(false);
    });

    it('should return false if passed 2 different valid ObjectIds', function() {
      let id1 = mongoose.Types.ObjectId();
      let id2 = mongoose.Types.ObjectId();
      expect(areObjectIdsEqual(id1, id2)).to.be.false;
    });

    it('should return false if passed 2 different valid ObjectIds in string format', function() {
      let id1 = mongoose.Types.ObjectId().toHexString();
      let id2 = mongoose.Types.ObjectId().toHexString();
      expect(areObjectIdsEqual(id1, id2)).to.be.false;
    });

    it('should return false if passed 1 object id and another different string (valid format)', function() {
      let oId = mongoose.Types.ObjectId();
      let stringId = mongoose.Types.ObjectId().toHexString();

      expect(areObjectIdsEqual(oId, stringId)).to.be.false;
    });

    it('should return true if passed 2 equivalent object ids', function() {
      let id = mongoose.Types.ObjectId();
      expect(areObjectIdsEqual(id, id)).to.be.true;
    });

    it('should return true if passed 2 equivalent hex strings', function() {
      let id = mongoose.Types.ObjectId().toHexString();
      expect(areObjectIdsEqual(id, id)).to.be.true;
    });

    it('should return true if passed 1 object id and its string equivalent', function() {
      let oId = mongoose.Types.ObjectId();
      let string = oId.toHexString();

      expect(areObjectIdsEqual(oId, string)).to.be.true;
    });


  });
});

describe('isObjectIdInArrayOfObjectIds', function() {
  let validId = mongoose.Types.ObjectId().toHexString();

  it('should return false if 2nd argument is not array', function() {
    expect(isObjectIdInArrayOfObjectIds(validId, null)).to.eql(false);
  });
});

describe('compareArraysOfObjectIds', function() {
  let allStringIds = [ '5cf01c1eceb27200afbf840b',
  '5cf01c1eceb27200afbf840c',
  '5cf01c1eceb27200afbf840d' ];

  let allStringIds2 = [ '5cf0211b52071600c011ad1f',
  '5cf0211b52071600c011ad20',
  '5cf0211b52071600c011ad21',
  '5cf01c1eceb27200afbf840c' ];

  let allObjectIds = allStringIds.map(s => mongoose.Types.ObjectId(s));

  let mixedIds1 = [allStringIds[0], mongoose.Types.ObjectId(allStringIds[1]), allStringIds[2]];

  let mixedIds2 = [allStringIds[1], mongoose.Types.ObjectId(allStringIds[2]), mongoose.Types.ObjectId(allStringIds[0])];

  it('should return [[][]] if both arguments are not arrays', function() {
    let results = compareArraysOfObjectIds(7, undefined);
    expect(results).to.be.instanceOf(Array);
    expect(results).to.have.lengthOf(2);

    let [missing, added] = results;
    expect(missing).to.be.instanceOf(Array);
    expect(missing).to.have.lengthOf(0);

    expect(added).to.be.instanceOf(Array);
    expect(added).to.have.lengthOf(0);
  });

  it('should return [[][]] if 2 identical arrays of string ids ', function() {
    let results = compareArraysOfObjectIds(allStringIds, allStringIds);
    expect(results).to.be.instanceOf(Array);
    expect(results).to.have.lengthOf(2);

    let [missing, added] = results;
    expect(missing).to.be.instanceOf(Array);
    expect(missing).to.have.lengthOf(0);

    expect(added).to.be.instanceOf(Array);
    expect(added).to.have.lengthOf(0);
  });

  it('should return [[][]] if 2 identical arrays of object ids ', function() {
    let results = compareArraysOfObjectIds(allObjectIds, allObjectIds);
    expect(results).to.be.instanceOf(Array);
    expect(results).to.have.lengthOf(2);

    let [missing, added] = results;
    expect(missing).to.be.instanceOf(Array);
    expect(missing).to.have.lengthOf(0);

    expect(added).to.be.instanceOf(Array);
    expect(added).to.have.lengthOf(0);
  });

  it('should return [[][]] if 2 identical arrays of mixed string & objectIds ', function() {
    let results = compareArraysOfObjectIds(mixedIds1, mixedIds2);
    expect(results).to.be.instanceOf(Array);
    expect(results).to.have.lengthOf(2);

    let [missing, added] = results;
    expect(missing).to.be.instanceOf(Array);
    expect(missing).to.have.lengthOf(0);

    expect(added).to.be.instanceOf(Array);
    expect(added).to.have.lengthOf(0);
  });

  describe('New ids when original was empty', function() {
    let originalIds = [];
    let newIds = allStringIds;

    let results = compareArraysOfObjectIds(originalIds, newIds);

    let [missing, added] = results;

    it('missing should be []', function() {
      expect(missing).to.have.lengthOf(0);
    });

    it('added should have all newIds', function() {
      expect(added).to.have.lengthOf(newIds.length);
      expect(added).to.have.members(newIds);

    });

  });

  describe('New ids as [] when original was non empty', function() {
    let originalIds = allStringIds;
    let newIds = [];

    let results = compareArraysOfObjectIds(originalIds, newIds);

    let [missing, added] = results;

    it('missing should have all originalIds', function() {
      expect(missing).to.have.lengthOf(originalIds.length);
    });

    it('added should be []', function() {
      expect(added).to.have.lengthOf(0);
    });

  });

  describe('newIds and missingIds', function() {
  let originalIds = allStringIds;
  let newIds = allStringIds2;

  let missingIds = ['5cf01c1eceb27200afbf840b',
  '5cf01c1eceb27200afbf840d'];
  let addedIds = ['5cf0211b52071600c011ad1f',
  '5cf0211b52071600c011ad20',
  '5cf0211b52071600c011ad21'];

  let results = compareArraysOfObjectIds(originalIds, newIds);

  let [missing, added] = results;


  it('should return correct missing ids', function() {
    expect(missing).to.have.members(missingIds);
  });
  it('should return correct added members', function() {
    expect(added).to.have.members(addedIds);
  });

  });


});