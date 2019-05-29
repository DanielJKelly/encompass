
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { states } = require('../constants');

const statesEnum = Object.keys(states);
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
  }
}, { versionKey: false });



module.exports.Organization = mongoose.model('Organization', OrganizationSchema);
