Encompass.UserNewAdminComponent = Ember.Component.extend(Encompass.CurrentUserMixin, Encompass.ErrorHandlingMixin, {
  elementId: 'user-new-admin',
  usernameExists: null,
  emailExistsError: null,
  errorMessage: null,
  username: '',
  password: '',
  name: '',
  email: '',
  org: null,
  location: '',
  accountTypes: ['Teacher', 'Student', 'Pd Admin', 'Admin'],
  isAuthorized: null,
  authorizedBy: '',
  newUserData: {},
  actingRole: null,
  orgReq: null,
  createOrgErrors: [],
  createUserErrors: [],

  createNewUser: function (data) {
    return new Promise((resolve, reject) => {
      if (!data) {
        return reject('Invalid data');
      }
      Ember.$.post({
          url: '/auth/signup',
          data: data
        })
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  handleOrg: function (org) {
    var that = this;
    return new Promise((resolve, reject) => {
     if (!org) {
        return reject('Invalid Data');
     }

     let orgReq;
      // make sure user did not type in existing org
      if (typeof org === 'string') {
        let orgs = this.get('organizations');
        let matchingOrg = orgs.findBy('name', org);
        if (matchingOrg) {
          this.set('org', matchingOrg);
          org = matchingOrg;
        } else {
          orgReq = org;
        }
      }

      if (orgReq) {
        let rec = that.store.createRecord('organization', {
          name: orgReq,
          createdBy: that.get('currentUser')
        });

        rec.save()
          .then((res) => {
            return resolve(res.get('organizationId'));
          })
          .catch((err) => {
            this.handleErrors(err, 'createOrgErrors', rec);
            return reject(err);
          });
      } else {
        return resolve(org.get('organizationId'));
      }

    });
  },

//warn admin they are creating new org
// When user hits save button we need to check if the org is a string, if it is then do a modal, else continue

  actions: {
    // checkNewOrg: function () {
    //   if (this.get('orgReq')) {
    //     this.set('confirmNewOrg', true);
    //   } else {
    //     this.send('newUser');
    //   }
    // },

    newUser: function () {
      var username = this.get('username');
      var password = this.get('password');
      var name = this.get('name');
      var email = this.get('email');
      var organization = this.get('org');
      var location = this.get('location');
      var accountType = this.get('selectedType');
      var accountTypeLetter = accountType.charAt(0).toUpperCase();
      var isAuthorized = this.get('isAuthorized');
      var currentUserId = this.get('currentUser').get('id');

      if (!username || !password || !accountType) {
        this.set('errorMessage', true);
        return;
      }

      if (accountTypeLetter !== "S") {
        this.set('actingRole', 'teacher');
        if (!email) {
          this.set('errorMessage', true);
          return;
        }
      } else {
        email = null;
      }

      if (isAuthorized) {
        let userData = {
          username: username,
          password: password,
          name: name,
          email: email,
          location: location,
          accountType: accountTypeLetter,
          isAuthorized: true,
          authorizedBy: currentUserId,
          createdBy: currentUserId,
          createDate: new Date(),
          actingRole: this.get('actingRole'),
        };
        this.set('authorizedBy', currentUserId);
        this.set('newUserData', userData);
      } else {
        let userData = {
          username: username,
          password: password,
          name: name,
          email: email,
          location: location,
          accountType: accountTypeLetter,
          isAuthorized: false,
          createdBy: currentUserId,
          createDate: new Date(),
          actingRole: this.get('actingRole'),
        };
        this.set('newUserData', userData);
      }

      if (!username) {
        return;
      }

      return this.handleOrg(organization)
        .then((org) => {
          let newUserData = this.get('newUserData');
          newUserData.organization = org;
          return this.createNewUser(newUserData)
            .then((res) => {
              if (res.message === 'Can add existing user') {
                this.set('usernameExists', true);
                return;
              } else if (res.message === 'There already exists a user with that email address.') {
                this.set('emailExistsError', res.message);
                return;
              } else {
                console.log('success new user username', res.username);
                this.sendAction('toUserInfo', res.username);
              }
            })
            .catch((err) => {
              this.handleErrors(err, 'createUserErrors', newUserData);
            });
        })
        .catch((err) => {
          // err should be handled within handleOrg function
          console.log('err', err);
        });
    },

    usernameValidate(username) {
      if (username) {
        var usernamePattern = new RegExp(/^[a-z0-9.\-_@]{3,64}$/);
        var usernameTest = usernamePattern.test(username);

        if (usernameTest === false) {
          this.set('incorrectUsername', true);
          return;
        }

        if (usernameTest === true) {
          this.set('incorrectUsername', false);
          this.set('username', username);
          return;
        }
      }
    },

    emailValidate: function (email) {
      if (!email) {
        return false;
      }
      var emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
      var emailTest = emailPattern.test(email);

      if (emailTest === false) {
        this.set('incorrectEmail', true);
        return false;
      }

      if (emailTest === true) {
        this.set('incorrectEmail', false);
        this.set('email', email);
        return true;
      }
    },

    passwordValidate: function (password) {
      function hasWhiteSpace(string) {
        return /\s/g.test(string);
      }

      if (password.length < 3) {
        this.set('invalidPassword', true);
      } else {
        this.set('invalidPassword', false);
        this.set('password', password);
      }

      if (hasWhiteSpace(password)) {
        this.set('noSpacesError', true);
      } else {
        this.set('noSpacesError', false);
        this.set('password', password);
      }
    },

    cancelNew: function () {
      this.sendAction('toUserHome');
    },

     setOrg(org) {
      //  if (typeof org === 'string') {
      //    this.set('orgReq', org);
      //  } else {
         this.set('org', org);
      //  }
     },

    resetErrors(e) {
      const errors = ['usernameExists', 'emailExistsError', 'errorMessage'];

      for (let error of errors) {
        if (this.get(error)) {
          this.set(error, false);
        }
      }
    },
  }
});
