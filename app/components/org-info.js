Encompass.OrgInfoComponent = Ember.Component.extend(
  Encompass.CurrentUserMixin,
  {
    elementId: 'org-info',
    utils: Ember.inject.service('utility-methods'),
    alert: Ember.inject.service('sweet-alert'),

    didReceiveAttrs() {
      this.set('allUsers', this.get('store').peekAll('user')).rejectBy(
        'isTrashed'
      );

        this.parentView.send('setActiveOrg', this.get('model'));
      this.set('isEditing', false);

      this.set('cachedUsers', this.get('store').peekAll('user'));

      this._super(...arguments);
    },

    areMembersToAdd: Ember.computed.gt('membersToAdd.length', 0),

    pdAdmins: function() {
      return this.get('model.members').filterBy('accountType', 'P');
    }.property('model.members.@each.accountType'),

    canEdit: function() {
      if (this.get('currentUser.accountType') === 'A') {
        return true;
      }

      // if non admin can edit org info if pdadmin
      if (this.get('currentUser.accountType') !== 'P') {
        return false;
      }

      let userOrgId = this.get('utils').getBelongsToId(
        this.get('currentUser'),
        'organization'
      );

      return userOrgId === this.get('model.id');
    }.property('currentUser.accountType', 'currentUser.organization', 'model'),

    existingMemberIdHash: function() {
      let members = this.get('model.members') || [];
      let hash = {};

      members.forEach(member => {
        hash[member.get('id')] = true;
      });
      return hash;
    }.property('model.members.[]'),

    initialMemberOptions: function() {
      let cached = this.get('cachedUsers') || [];
      let nonMemberCachedUsers = cached.reject(user => {
        return this.get('existingMemberIdHash.' + user.get('id'));
      });
      return nonMemberCachedUsers.map(user => {
        return {
          id: user.get('id'),
          username: user.get('username')
        };
      });
    }.property('cachedUsers.[]', 'model.members.[]'),

    actions: {
      beginEditing() {
        this.set('updatedOrgName', this.get('model.name'));
        this.set('membersToAdd', []);
        this.set('pdAdminsToAdd', []);

        this.set('isEditing', true);
      },

      stopEditing() {
        // TODO: confirm cancel if changes made?
        this.set('isEditing', false);
      },

      saveEdits() {
        let newName = this.get('updatedOrgName');

        let trimmedName = typeof newName === 'string' ? newName.trim() : '';

        let didNameChange =
          trimmedName.length > 0 && trimmedName !== this.get('model.name');

        if (!didNameChange) {
          this.set('isEditing', false);
          return this.get('alert').showToast(
            'info',
            'No changes to save',
            'bottom-end',
            3000,
            false,
            null
          );
        }
      },
      updateMembersToAdd(userId, $item) {
        if (!userId) {
          return;
        }

        let user = this.get('store').peekRecord('user', userId);

        if (!user) {
          return;
        }

        if ($item === null) {
          // removal
          return this.get('membersToAdd').removeObject(user);
        }

        return this.get('membersToAdd').addObject(user);
      },

      removeMember(member) {
        if (!member) {
          return;
        }
        let org = this.get('model');

        if (!org) {
          return;
        }

        let username = member.get('username');
        let orgName = org.get('name');

        let warningText = `Are you sure you want to remove ${username} from ${orgName}?`;

        let confirmText = 'Yes, remove.';

        let successText = 'Member removed';

        let undoBtnText = 'Undo';
        let undoSuccessText = 'Member re-added';

        let willMemberBeOrgless = member.get('organizations.length') === 1;

        if (willMemberBeOrgless) {
          warningText += `${username} will not belong to any organizations after removal.`;
        }

        let memberPrimaryOrgId = this.get('utils').getBelongsToId(member, 'organization');

        let wasPrimaryOrg = memberPrimaryOrgId === org.get('id');

        return this.get('alert').showModal('warning', warningText, null, confirmText)
          .then((result) => {
            if (result.value) {
              // remove user from org members
              org.get('members').removeObject(member);
              member.get('organizations').removeObject(org);

              if (wasPrimaryOrg) {
                member.set('organization', null);
              }
              return Ember.RSVP.hash({
                org: org.save(),
                member: member.save(),
              })
              .then((updatedRecords) => {
                return this.get('alert').showToast('success', successText, 'bottom-end', 3000, true, undoBtnText)
                .then((result) => {
                  if (result.value) {
                    // user clicked undo, re-add member to org
                    org.get('members').addObject(member);
                    member.get('organizations').addObject(org);

                    if (wasPrimaryOrg) {
                      member.set('organization', org);
                    }
                    return Ember.RSVP.hash({
                      org: org.save(),
                      member: member.save()
                    })
                    .then((updatedRecords) => {
                      return this.get('alert').showToast('success', undoSuccessText, 'bottom-end', 3000, false, null);
                    });
                  }
                });
              });
            }
          })
          .catch((err) => {
            this.handleErrors(err, 'modelUpdateErrors', this.get('model'));
          });

      }
    }
  }
);
