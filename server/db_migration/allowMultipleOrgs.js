const mongoose = require('mongoose');

const models = require('../datasource/schemas');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/encompass');

const updateUserOrgs = async () => {
  try {
    let allUsers = await models.User.find({}).exec();

    let updatedUsers = allUsers.map((user) => {
      let org = user.organization;

      if (org) {
        user.organizations = [org];
      } else {
      // if user does not have org, set organizations to empty array
        user.organizations = [];
      }

      // for old users
      if (!user.actingRole) {
        if (user.accountType === 'S') {
          user.actingRole = 'student';
        } else {
          user.actingRole = 'teacher';
        }
      }
      return user.save();
    });
    await Promise.all(updatedUsers);
  }catch(err) {
    console.log(`Error updating user organizations: ${err}`);
  }

};

const updateOrgPdAdmins = async () => {
  try {
    let allOrgs = await models.Organization.find({}).populate({path: 'members', select: 'accountType'}).exec();

    let updatedOrgs = allOrgs.map((org) => {
      let members = org.members;
      if (Array.isArray(members)) {
        let pdAdmins = members.filter(m => m.accountType === 'P');
        org.pdAdmins = pdAdmins.map(p => p._id);
      } else {
      // if org does not have any pdAdmins, set to empty array
      org.pdAdmins = [];
      }
      org.depopulate('members');
      return org.save();
    });
    await Promise.all(updatedOrgs);
  }catch(err) {
    console.log(`Error updating org pdAdmins: ${err}`);
  }
};

async function migrate() {
  await updateUserOrgs();
  await updateOrgPdAdmins();
  console.log('done!');
  mongoose.connection.close();
}
// migrate();