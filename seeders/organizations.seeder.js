var Seeder = require('mongoose-data-seed').Seeder;
var Organization = require('../server/datasource/schemas').Organization;

var data = [
  /* 1 */
{
  "_id" : "5b4e4b48808c7eebc9f9e828",
  "name" : "Temple University",
  "createdBy" : "5b245760ac75842be3189525",
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [
      "5ba7bedd2b7ba22c38a554fc"
  ],
  "members" : [
      "5ba7bedd2b7ba22c38a554fc"
  ],
  "recommendedProblems" : [
      "5b4e2e6cbe1e18425515308f",
      "53a4479432f2863240000339"
  ],
  "lastModifiedDate" : "2019-06-03T22:14:26.177Z",
  "isTrashed" : false,
  "createDate" : "2019-06-03T22:14:26.177Z"
},

/* 2 */
{
  "_id" : "5b4a64a028e4b75919c28512",
  "name" : "Drexel University",
  "createdBy" : "5b245760ac75842be3189525",
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [
      "5b7321ee59a672806ec903d5"
  ],
  "members" : [
      "52a88ae2729e9ef59ba7eb4b",
      "5b1e7bf9a5d2157ef4c911a6",
      "5b245760ac75842be3189525",
      "5b3688218610e3bfecca403c",
      "5b368afdca1375a94fabde39",
      "5b72273c5b50ea3fe3d01a0b",
      "5b72278b5b50ea3fe3d01a34",
      "5b72e05ba459749f7d9c1709",
      "5b72e6465b50ea3fe3d1623c",
      "5b7321ee59a672806ec903d5",
      "52964653e4bad7087700014b",
      "5b245841ac75842be3189526",
      "5b4e5180a2eed65e2434d475",
      "5b913ebe3add43b868ae9807",
      "5b913eaf3add43b868ae9806",
      "5b913ea33add43b868ae9805"
  ],
  "recommendedProblems" : [
      "53a4479432f2863240000339",
      "53a447b432f286324000033d",
      "5bac07fdea4c0a230b2c7cda"
  ],
  "lastModifiedDate" : "2019-06-03T22:14:26.177Z",
  "isTrashed" : false,
  "createDate" : "2019-06-03T22:14:26.177Z"
},

/* 3 */
{
  "_id" : "5bbe00a2ecd6e597fd8e397b",
  "name" : "trashed org",
  "createdBy" : "5b245760ac75842be3189525",
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [],
  "members" : [],
  "recommendedProblems" : [],
  "lastModifiedDate" : "2019-06-03T22:14:26.177Z",
  "isTrashed" : true,
  "createDate" : "2019-06-03T22:14:26.177Z"
},

/* 4 */
{
  "_id" : "5b4e4d5f808c7eebc9f9e82c",
  "name" : "Mathematical Thinking",
  "createdBy" : "5b245760ac75842be3189525",
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [],
  "members" : [
      "529518daba1cd3d8c4013344",
      "5b1e758ba5d2157ef4c90b2d",
      "5b1e7ca6a5d2157ef4c91210",
      "5b9149f52ecaf7c30dd47491",
      "5b9149c22ecaf7c30dd47490",
      "5b914a102ecaf7c30dd47492",
      "5b914a802ecaf7c30dd47493",
      "5b4e4b48808c7eebc9f9e827",
      "5b99146e25b620610ceead75"
  ],
  "recommendedProblems" : [
      "5b4e2e6cbe1e18425515304e",
      "5ba7c3cb1359dc2f6699f2b3"
  ],
  "lastModifiedDate" : "2019-06-03T22:14:26.177Z",
  "isTrashed" : false,
  "createDate" : "2019-06-03T22:14:26.177Z"
},

/* 5 */
{
  "_id" : "5c6df20a9466896b1c5d84af",
  "name" : "Montgomery Elementary",
  "createdBy" : "5b245760ac75842be3189525",
  "lastModifiedBy" : null,
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [],
  "members" : [
      "5c6eb45d9852e5710311d633",
      "5c6eb49c9852e5710311d634",
      "5c6eb4ac9852e5710311d635",
      "5c6eb4c19852e5710311d636"
  ],
  "recommendedProblems" : [],
  "lastModifiedDate" : null,
  "isTrashed" : false,
  "createDate" : "2019-02-21T00:34:18.678Z"
},

/* 6 */
{
  "_id" : "5c6f4032b1ccdf96abab26fc",
  "name" : "Mentors University",
  "createdBy" : "5b245760ac75842be3189525",
  "lastModifiedBy" : null,
  "addedMembers" : [],
  "removedMembers" : [],
  "isNewlyRestored" : false,
  "isNewlyTrashed" : false,
  "pdAdmins" : [
      "5c6f4032b1ccdf96abab26fd"
  ],
  "members" : [
      "5c6f4032b1ccdf96abab26fd",
      "5c6f4075b1ccdf96abab26fe",
      "5c6f40deb1ccdf96abab26ff"
  ],
  "recommendedProblems" : [],
  "lastModifiedDate" : null,
  "isTrashed" : false,
  "createDate" : "2019-02-22T00:20:02.678Z"
},

];

var OrganizationsSeeder = Seeder.extend({
  shouldRun: function () {
    return Organization.count().exec().then(count => count === 0);
  },
  run: function () {
    return Organization.create(data);
  }
});

module.exports = OrganizationsSeeder;
