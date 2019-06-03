/**
  * # Organization API
  * @description This is the API for organization based requests
  * @author Daniel Kelly
*/
const models = require('../schemas');
const userAuth = require('../../middleware/userAuth');
const utils = require('../../middleware/requestHandler');
const apiUtils = require('./utils');

const { isNonEmptyObject } = require('../../utils/objects');
const { compareArraysOfObjectIds } = require('../../utils/mongoose');

module.exports.get = {};
module.exports.post = {};
module.exports.put = {};

/**
  * @public
  * @method getOrganizations
  * @description __URL__: /api/organizations
  * @returns {Object} An array of organization objects
  * @throws {NotAuthorizedError} User has inadequate permissions
  * @throws {InternalError} Data retrieval failed
  * @throws {RestError} Something? went wrong
*/

const excludedFields = {isNewlyTrashed: 0, isNewlyRestored: 0};

function processFilterBy(user, defaultFilter, requestFilter) {
  // allowed
  if (!isNonEmptyObject(requestFilter)) {
    return defaultFilter;
  }

  let results = {...defaultFilter};

  let { includeTrashed } = requestFilter;

  if (user.accountType === 'A') {
    // only admins can see trashed orgs
    if (parseInt(includeTrashed, 10) === 1) {
      delete results.isTrashed;
    }
  }

  return results;
}

function processSortBy(user, defaultParams, requestParams) {
  if (!isNonEmptyObject(requestParams)) {
    return defaultParams;
  }
  let allowedKeys = {members: 1, name: 1, createDate: 1};

  let results = {...defaultParams};

  let field = Object.keys(requestParams)[0];

  if (!allowedKeys[field]) {
    return results;
  }


  let direction = parseInt(requestParams[field], 10);
  if (direction !== 1 && direction !== -1) {
    direction = 1;
  }

  results = {[field]: direction};

  return results;
}

function processQuery(user, query) {
  let defaultCriteria = { isTrashed: false };
  let defaultSortParam = { members: -1 };

  let results = [defaultCriteria, defaultSortParam];

  if (!isNonEmptyObject(query)) {
    return results;
  }

  let { filterBy, sortBy, sortDirection } = query;

  results[0] = processFilterBy(user, defaultCriteria, filterBy);
  results[1] = processSortBy(user, defaultSortParam, sortBy, sortDirection);

  return results;
}

const getOrganizations = async function(req, res, next) {
  //const criteria = utils.buildCriteria(req);
  //const user = userAuth.requireUser(req);
  try {
    let user = req.user;

    let { limit, skip } = req.query;

    let [ criteria, sortParam] = processQuery(user, req.query);

    let results, itemCount;

    let doCollate = Object.keys(sortParam)[0] === 'name';
    let doAggregate = Object.keys(sortParam)[0] === 'members';

    if (doCollate) {
      let collationOptions = {
        locale: 'en',
        strength: 1
      };

      [results, itemCount] = await Promise.all([
        models.Organization.find(criteria).collation(collationOptions).sort(sortParam).limit(limit).skip(skip).lean().exec(),
        models.Organization.count(criteria)
      ]);
    } else if (doAggregate) {
      [results, itemCount] = await Promise.all([
        apiUtils.sortWorkspaces('Organization', sortParam, req, criteria, excludedFields),
        models.Organization.count(criteria)
      ]);
    } else {
      [results, itemCount] = await Promise.all([
        models.Organization.find(criteria).sort(sortParam).limit(limit).skip(skip).lean().exec(),
        models.Organization.count(criteria)]);
    }


    const pageCount = Math.ceil(itemCount / req.query.limit);

    let currentPage = req.query.page ? req.query.page : 1;

    const data = {
      organizations: results,
      meta: {
        total: itemCount,
        pageCount,
        currentPage
      }
    };
    return utils.sendResponse(res, data);
  }catch(err) {
      console.error(`Error getOrgMembers: ${err}`);
      console.trace();
      return utils.sendError.InternalError(err, res);
  }


};

/**
  * @public
  * @method getOrganization
  * @description __URL__: /api/organization/:id
  * @returns {Object} An organization object
  * @throws {NotAuthorizedError} User has inadequate permissions
  * @throws {InternalError} Data retrieval failed
  * @throws {RestError} Something? went wrong
*/

const getOrganization = async (req, res, next) => {

  try {
    let user = req.user;
    let isAdmin = user.accountType === 'A';
    let organization = await models.Organization.findById(req.params.id, excludedFields).lean().exec();

    if (!organization || (organization.isTrashed && !isAdmin)) {
      return utils.sendResponse(res, null);
    }

    let data = {
      organization,
    };

    utils.sendResponse(res, data);

  }catch(err) {
    console.error(`Error getOrg: ${err}`);
    console.trace();
    return utils.sendError.InternalError(null, res);
  }

};

function canPostOrg(user) {
  if (!user) {
    return false;
  }
  const accountType = user.accountType;
  return accountType === 'A';
}

function canModifyOrg(user, orgId) {
  if (!user) {
    return false;
  }
  const accountType = user.accountType;
  const userOrg = user.organization;

  if (accountType === 'A') {
    return true;
  } else if (accountType === 'P' && JSON.stringify(userOrg) === JSON.stringify(orgId)) {
    return true;
  }
}
/**
  * @public
  * @method postOrganization
  * @description __URL__: /api/organizations
  * @throws {NotAuthorizedError} User has inadequate permissions
  * @throws {InternalError} Data saving failed
  * @throws {RestError} Something? went wrong
*/

const postOrganization = (req, res, next) => {
  const user = userAuth.requireUser(req);
  const canPost = canPostOrg(user);

  if (!canPost) {
    return utils.sendError.NotAuthorizedError('You are not authorizd to create a new organization.', res);
  }

  return apiUtils.isRecordUniqueByStringProp('Organization', req.body.organization.name, 'name', null)
    .then((isUnique) => {
      if (!isUnique) {
        throw(new Error('duplicateName'));
      }
      const organization = new models.Organization(req.body.organization);
      if (!organization.createdBy) {
        organization.createdBy = user;
      }
      organization.createDate = Date.now();
      return organization.save();
    })
    .then((org) => {
      Object.keys(excludedFields).forEach((field) => {
        delete org[field];
      });
      return utils.sendResponse(res, {organization: org });
    })
    .catch((err) => {
      if (err.message === 'duplicateName') {
        return utils.sendError.ValidationError(`There is already an existing organization named "${req.body.organization.name}."`, 'name', res);
      }
      console.error(`Error postOrg: ${err}`);
      return utils.sendError.InternalError(null, res);
    });
};

/**
  * @public
  * @method putOrganization
  * @description __URL__: /api/organizations/:id
  * @throws {NotAuthorizedError} User has inadequate permissions
  * @throws {InternalError} Data update failed
  * @throws {RestError} Something? went wrong
*/

const putOrganization = (req, res, next) => {
  const user = userAuth.requireUser(req);

  if (!user) {
    return utils.sendError.InvalidCredentialsError('No user logged in!', res);
  }

  if (!canModifyOrg(user, req.params.id)) {
    return utils.sendError.NotAuthorizedError('You are not authorized to modify this organization', res);
  }

  let originalMemberIds;
  let newMemberIds = req.body.organization.members;

  return apiUtils.isRecordUniqueByStringProp('Organization', req.body.organization.name, 'name', {_id: {$ne: req.params.id}})
  .then((isUnique) => {
    if (!isUnique) {
      throw new Error('duplicateName');
    }
    return models.Organization.findById(req.params.id).exec();

  })
  .then((doc) => {
    originalMemberIds = doc.members;
    //org to update
    for(let field in req.body.organization) {
      if((field !== '_id') && (field !== undefined)) {
        doc[field] = req.body.organization[field];
      }
    }
    let [removedMembers, addedMembers ] = compareArraysOfObjectIds(originalMemberIds, newMemberIds);

    doc.removedMembers = removedMembers;
    doc.addedMembers = addedMembers;
    doc.lastModifiedBy = user._id;

    return doc.save();
  })
  .then((updatedOrg) => {
    Object.keys(excludedFields).forEach((field) => {
      delete updatedOrg[field];
    });
    return utils.sendResponse(res, {organization: updatedOrg});
  })
  .catch((err) => {
    if (err.message === 'duplicateName') {
      return utils.sendError.ValidationError(`There is already an existing organization named "${req.body.organization.name}."`, 'name', res);
    }
    console.error(`Error putOrg: ${err}`);
    return utils.sendError.InternalError(null, res);
  });

};

module.exports.get.organizations = getOrganizations;
module.exports.get.organization = getOrganization;
module.exports.post.organization = postOrganization;
module.exports.put.organization = putOrganization;
