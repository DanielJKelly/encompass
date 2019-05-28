const mongoose = require('mongoose');

const models = require('../datasource/schemas');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/encompass');

const addMembersToOrgs = async () => {
  try {
    let orgs = await models.Organization.find({isTrashed: false});

    let updatedOrgs = orgs.map(async (org) => {
      let orgUsers = await models.User.find({isTrashed: false, organization: org._id});
      let orgUserIds = orgUsers.map(user => user._id);
      console.log(`There are ${orgUsers.length} users in ${org.name}`);

      org.members = orgUserIds;
      return org.save();
    });

    await Promise.all(updatedOrgs);
    mongoose.connection.close();
  }catch(err) {
    console.log(`Error adding members to orgs: ${err}`);
  }


};

addMembersToOrgs();