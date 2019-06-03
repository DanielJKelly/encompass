// REQUIRE MODULES
const chai = require('chai');
const chaiHttp = require('chai-http');

// REQUIRE FILES
const fixtures = require('./fixtures.js');
const helpers = require('./helpers');
const userFixtures = require('./userFixtures');

const expect = chai.expect;
const host = helpers.host;
const baseUrl = "/api/organizations/";

chai.use(chaiHttp);

describe('Organization CRUD operations by account type', async function() {
  const testUsers = userFixtures.users;
  const accessibleOrgCount = 5;

  async function runTests(user) {
    await describe(`Organization CRUD operations as ${user.details.testDescriptionTitle}` , function() {
      this.timeout('10s');
      const agent = chai.request.agent(host);
      const { username, password, accountType } = user.details;

      before(async function(){
        try {
          await helpers.setup(agent, username, password);
        }catch(err) {
          console.log(err);
        }
      });

      after(() => {
        agent.close();
      });

      describe('/GET organizations', () => {
        it('should get all organizations', done => {
          agent
          .get(baseUrl)
          .end((err, res) => {
            if (err) {
              console.error(err);
            }
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys('organizations', 'meta');
            expect(res.body.organizations).to.be.a('array');
            expect(res.body.organizations.length).to.eql(accessibleOrgCount);
            done();
          });
        });
      });

      describe('/GET organizations by ids', () => {
        let ids = ['5b4a64a028e4b75919c28512','5b4e4d5f808c7eebc9f9e82c', '5c6f4032b1ccdf96abab26fc'];

        it('should get orgs based on ids query', done => {
          agent
          .get(baseUrl)
          .query({ids})
          .end((err, res) => {
            if (err) {
              console.error(err);
            }
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys('organizations', 'meta');
            expect(res.body.organizations).to.be.a('array');
            expect(res.body.organizations.length).to.eql(ids.length);
            done();
          });
        });
      });

      describe('/POST valid organization', () => {
        let description;
          if (accountType !== 'A') {
            description = 'should return 403 error';
          } else {
            description = 'should post a new organization';
          }
          let name = fixtures.organization.validOrg.name;

        it(description, done => {
          agent
          .post(baseUrl)
          .send({organization: {
            name: name,
            createdBy: user.details._id
          }})
          .end((err, res) => {
            if (err) {
              console.error('ERR', err);
              done();
            }
            if (accountType !== 'A') {
              expect(res).to.have.status(403);
              done();
            } else {
              expect(res).to.have.status(200);
              expect(res.body.organization).to.have.any.keys('name');
              expect(res.body.organization.name).to.eql(name);
              done();
            }
          });
        });
      });
      describe('/POST organization with duplicate name', () => {
        let description;
          if (accountType !== 'A') {
            description = 'should return 403 error';
          } else {
            description = 'should return 422 Validation error';
          }
          let name = fixtures.organization.duplicateName.name;

        it(description, done => {
          agent
          .post(baseUrl)
          .send({organization: {
            name: name,
            createdBy: user.details._id
          }})
          .end((err, res) => {
            if (err) {
              console.error(err);
              done();
            }
            if (accountType !== 'A') {
              expect(res).to.have.status(403);
              done();
            } else {
              expect(res).to.have.status(422);
              done();
            }
          });
        });
      });
      describe('Updating org with existing name', function() {
        let description;
        let { _id, createdBy } = fixtures.organization.existingOrg;
        if (accountType !== 'A') {
          description = 'should return 403 error';
        } else {
          description = 'should return 422 Validation error';
        }
        let name = fixtures.organization.duplicateName.name;

      it(description, done => {
        agent
        .put(baseUrl + _id)
        .send({organization: {
          name,
          createdBy,
        }})
        .end((err, res) => {
          if (err) {
            console.error(err);
            done();
          }
          if (accountType !== 'A') {
            expect(res).to.have.status(403);
            done();
          } else {
            expect(res).to.have.status(422);
            done();
          }
        });
      });
      });
    });
  }

  for (let user of Object.keys(testUsers)) {
    let testUser = testUsers[user];
    // eslint-disable-next-line no-await-in-loop
    await runTests(testUser);
  }
});