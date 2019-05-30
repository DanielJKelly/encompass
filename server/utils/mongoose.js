const _ = require('underscore');
const mongoose = require('mongoose');

const { isNonEmptyArray } = require('../utils/objects');
/**
 * Returns true if passed in value matches format for mongoose objectId else false
 * @param {any} val
 * @returns {boolean}
 */
const isValidMongoId = (val) => {
  let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(val);
};

// used in cases where we are only interested in read-only comparisons
/**
 * Returns true if a and b are equivalent representations of Mongoose ObjectIds
 * (either as ObjectId or HexString) else false
 * @param {any} a - 1st value to compare
 * @param {any} b - 2nd value to compare
 * @returns {boolean}
 */
const areObjectIdsEqual = (a, b) => {
  if (!isValidMongoId(a) || !isValidMongoId(b)) {
    return false;
  }

  let type1 = typeof a;
  let type2 = typeof b;

  if (type1 === 'string' && type2 === 'string') {
    return a === b;
  }

  if (type1 === 'object' && type2 === 'object') {
    return _.isEqual(a, b);
  }
  let a2;
  let b2;

  // one must be type string, one must be type object

  if (type1 === 'string') {
    a2 = a;
  } else {
    a2 = a.toString();
  }

  if (type2 === 'string') {
    b2 = b;
  } else {
    b2 = b.toString();
  }

  return a2 === b2;
};

/**
 * Takes an array and filters out any values that do not match the proper format for a mongoose
 objectId (hex string or objectId instance). If 2nd argument is passed in as true, will convert  each value to an ObjectId instance.
 * @param {array} arr- array to clean
 * @param {boolean} [doConvert=false] - whether or not to convert to ObjectIds
 * @returns {array}
 */
function cleanObjectIdArray(arr, doConvert=false) {
  if (!isNonEmptyArray(arr)) {
    return [];
  }

  const filtered = _.filter(arr, isValidMongoId);

  if (!doConvert) {
    return filtered;
  }

  return _.map(filtered, val => mongoose.Types.ObjectId(val));
}

function isObjectIdInArrayOfObjectIds(objectId, objectIds) {
  if (!Array.isArray(objectIds)) {
    return false;
  }

  let foundId = _.find(objectIds, (id) => {
    return areObjectIdsEqual(id, objectId);
  });

  return foundId !== undefined;

}

function compareArraysOfObjectIds(originalIds, newIds) {
  let missingIds = []; // ids in original but new
  let addedIds = [];

  if (!Array.isArray(originalIds) || !Array.isArray(newIds)) {
    return [missingIds, addedIds];
  }

  missingIds = originalIds.filter((id) => {
    return !isObjectIdInArrayOfObjectIds(id, newIds);
  });

  addedIds = newIds.filter((id) => {
    return !isObjectIdInArrayOfObjectIds(id, originalIds);
  });

  return [missingIds, addedIds];
}

  module.exports.isValidMongoId = isValidMongoId;
  module.exports.areObjectIdsEqual = areObjectIdsEqual;
  module.exports.cleanObjectIdArray = cleanObjectIdArray;
  module.exports.isObjectIdInArrayOfObjectIds = isObjectIdInArrayOfObjectIds;
  module.exports.compareArraysOfObjectIds = compareArraysOfObjectIds;