
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { states } = require('../constants');

const statesEnum = Object.keys(states);

const models = require('../schemas');
/**
  * @public
  * @class Organization
  * @description Organizations are made up of encompass users
  */
const OrganizationSchema = new Schema({
  //== Shared properties (Because Mongoose doesn't support schema inheritance)
  createdBy: { type: ObjectId, ref: 'User', required: true },
  createDate: { type: Date, 'default': Date.now() },
  isTrashed: { type: Boolean, 'default': false },
  lastModifiedBy: { type: ObjectId, ref: 'User' },
  lastModifiedDate: { type: Date, 'default': Date.now() },
  //====
  name: { type: String, required: true, trim: true },
  recommendedProblems: [{type: ObjectId, ref: 'Problem'}],
  members: [{type: ObjectId, ref: 'User'}],
  pdAdmins: [{type: ObjectId, ref: 'User'}],
  location: {
    city: {type: String, trim: true},
    state: {type: String, enum: statesEnum}
  },
  isNewlyTrashed: {type: Boolean, default: false},
  isNewlyRestored: { type: Boolean, default: false}
}, { versionKey: false });

OrganizationSchema.pre('save', function(next) {
  let isNew = this.isNew;

  let modifiedPaths = this.modifiedPaths();
  if (this.modifiedPaths.length > 0) {
    this.lastModifiedDate = Date.now();
  }

  let didIsTrashedChange = !isNew && modifiedPaths.includes('isTrashed');

  this.isNewlyTrashed = didIsTrashedChange && this.isTrashed;
  this.isNewlyRestored = didIsTrashedChange && !this.isTrashed;

  next();

});

function updateUserOrgs(users, orgId, operationType) {
  if (operationType !== '$pull' && operationType !== '$addToSet') {
    return;
  }
  let match = {_id: {$in: users} };
  let update = {[operationType]: {organizations: orgId}};
  models.User.updateMany(match, update).exec();

}


OrganizationSchema.post('save', function(org) {
  let areMembers = Array.isArray(org.members) && org.members.length > 0;
  let orgId = org._id;

  if (areMembers) {
    if (this.isNewlyTrashed) {
      updateUserOrgs(org.members, orgId, '$pull');

      // set primary org to null if trashed org was their primary org
      let primaryOrgMatch = {_id: {$in: org.members}, organization: orgId};
      let update = {$set: {organization: null}};

      models.User.updateMany(primaryOrgMatch, update).exec();
    } else if (this.isNewlyRestored) {
      updateUserOrgs(org.members, orgId, '$addToSet');

      // if user did not belong to any orgs, set as primary org
      let primaryOrgMatch = {_id: {$in: org.members}, organization: null};
      let update = {$set: {organization: orgId}};

      models.User.updateMany(primaryOrgMatch, update).exec();

    }
  }

});


module.exports.Organization = mongoose.model('Organization', OrganizationSchema);
