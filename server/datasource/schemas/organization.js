
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const User = require('../schemas/user').User;


/**
  * @public
  * @class Organization
  * @description Organizations are used to categorize problems
  * @todo Create or use external organizations for problem?
  */
const OrganizationSchema = new Schema({
  //== Shared properties (Because Mongoose doesn't support schema inheritance)
  createdBy: { type: ObjectId, ref: 'User', required: true },
  createDate: { type: Date, 'default': Date.now() },
  isTrashed: { type: Boolean, 'default': false },
  lastModifiedBy: { type: ObjectId, ref: 'User' },
  lastModifiedDate: { type: Date, 'default': Date.now() },
  //====
  name: { type: String, required: true },
  recommendedProblems: [{type: ObjectId, ref: 'Problem'}],
  members: [{type: ObjectId, ref: 'User'}]
}, { versionKey: false });



module.exports.Organization = mongoose.model('Organization', OrganizationSchema);
