Encompass.OrgInfoComponent = Ember.Component.extend(
  Encompass.CurrentUserMixin, Encompass.ErrorHandlingMixin,
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
    arePdAdminsToAdd: Ember.computed.gt('pdAdminsToAdd.length', 0),

    regularMembers: function() {
      return this.get('model.members').reject((user) => {
        return this.get('model.pdAdmins').includes(user.get('id'));
      });
    }.property('model.members.[]', 'model.pdAdmins.[]'),

    pdMembers: function() {
      return this.get('model.members').filter((user) => {
        return this.get('model.pdAdmins').includes(user.get('id'));
      });
    }.property('model.members.[]', 'model.pdAdmins.[]'),

    canEdit: function() {
      if (this.get('currentUser.accountType') === 'A') {
        return true;
      }
      // if non admin can edit org info if pdadmin for org
      return this.get('existingPdAdminIdHash.' + this.get('currentUser.id'));

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

    clearSelectizeInput(id) {
      if (!id) {
        return;
      }
      let selectize = this.$(`#${id}`)[0].selectize;
      if (!selectize) {
        return;
      }
      selectize.clear();
    },

    addMembersBtnText: function() {
      let count = this.get('membersToAdd.length');

      let noun = count > 1 ? 'Members' : 'Member';

      return `Add ${count} ${noun}`;
    }.property('membersToAdd.[]'),

    existingPdAdminIdHash: function() {
      let pdAdminIds = this.get('model.pdAdmins') || [];
      let hash = {};

      pdAdminIds.forEach(id => {
       hash[id] = true;
      });
      return hash;
    }.property('model.pdAdmins.[]'),

    initialPdAdminOptions: function() {
      let cached = this.get('cachedUsers') || [];
      let nonMemberCachedUsers = cached.reject(user => {
        // students cannot be pd admins for now
        return user.get('accountType') !== 'S' ||
        this.get('existingPdAdminIdHash.' + user.get('id'));
      });
      return nonMemberCachedUsers.map(user => {
        return {
          id: user.get('id'),
          username: user.get('username')
        };
      });
    }.property('cachedUsers.[]', 'model.pdAdmins.[]'),

    addPdAdminsBtnText: function() {
      let count = this.get('pdAdminsToAdd.length');

      let noun = count > 1 ? 'Pd Admins' : 'Pd Admin';

      return `Add ${count} ${noun}`;
    }.property('pdAdminsToAdd.[]'),

    removeSelectizeItem: function(selectizeId, itemValue) {
      if (!selectizeId) {
        return;
      }
      let selectize = this.$(`#${selectizeId}`)[0].selectize;
      if (!selectize) {
        return;
      }
      selectize.removeItem(itemValue, true);
    },

    getPrimaryOrgId(user) {
      return this.get('utils').getBelongsToId(user, 'organization');
    },

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


        return this.get('alert').showModal('warning', warningText, null, confirmText)
          .then((result) => {
            if (result.value) {
              // remove user from org members
              org.get('members').removeObject(member);
              return org.save()
              .then((updatedOrg) => {
                return this.get('alert').showToast('success', successText, 'bottom-end', 5000, true, undoBtnText)
                .then((result) => {
                  if (result.value) {
                    // user clicked undo, re-add member to org
                    org.get('members').addObject(member);
                    return org.save()
                    .then((updatedOrg) => {
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

      },
      addMembers() {
        if (!this.get('membersToAdd.length') > 0) {
          return;
        }

        let membersToAdd = this.get('membersToAdd');

        let org = this.get('model');

        org.get('members').addObjects(membersToAdd);

        return org.save()
        .then((updatedOrg) => {
          this.clearSelectizeInput('select-add-member');
          this.set('membersToAdd', []);
          return this.get('alert').showToast('success', 'Members Added', 'bottom-end', 3000, false, null);
        })
        .catch((err) => {
          this.handleErrors(err, 'modelUpdateErrors', org);
        });
      },
      updatePdAdminsToAdd(userId, $item) {
        if (!userId) {
          return;
        }

        let user = this.get('store').peekRecord('user', userId);

        if (!user) {
          return;
        }

        if ($item === null) {
          // removal
          return this.get('pdAdminsToAdd').removeObject(user);
        }

        let isExistingMember = this.get('existingMemberIdHash.' + userId);

        if (isExistingMember) {
          // confirm that user wants to 'upgrade' user from regular member to pdadmin
          let username = user.get('username');
          let orgName = this.get('model.name');
          let msg = `${username} is an existing member of ${orgName}. Are you sure you want to give ${username} Pd Admin privileges?`;
          return this.get('alert').showModal('confirm', msg, null, 'Yes')
            .then((results) => {
              if (results.value) {
                return this.get('pdAdminsToAdd').addObject(user);
              }
              // remove item from selectize input
              return this.removeSelectizeItem('select-add-pdadmin', userId);
            });
        }

        return this.get('pdAdminsToAdd').addObject(user);
      },
      addPdAdmins() {
        if (!this.get('arePdAdminsToAdd') > 0) {
          return;
        }

        let pdAdminsToAdd = this.get('pdAdminsToAdd');

        let org = this.get('model');

        org.get('pdAdmins').addObjects(pdAdminsToAdd.mapBy('id'));
        org.get('members').addObjects(pdAdminsToAdd);

        return org.save()
        .then((updatedRecords) => {
          this.clearSelectizeInput('select-add-pdadmin');
          this.set('pdAdminsToAdd', []);
          return this.get('alert').showToast('success', 'Pd Admins Added', 'bottom-end', 3000, false, null);
        })
        .catch((err) => {
          this.handleErrors(err, 'modelUpdateErrors', org);
        });
      },
      removePdAdmin(pdAdmin) {
        if (!pdAdmin) {
          return;
        }
        let org = this.get('model');

        if (!org) {
          return;
        }

        let username = pdAdmin.get('username');
        let orgName = org.get('name');

        let warningText = `Are you sure you want to remove ${username} from ${orgName}?`;

        let confirmText = 'Yes, remove.';

        let successText = 'PdAdmin removed';

        let undoBtnText = 'Undo';
        let undoSuccessText = 'PdAdmin re-added';

        let willMemberBeOrgless = pdAdmin.get('organizations.length') === 1;

        if (willMemberBeOrgless) {
          warningText += `${username} will not belong to any organizations after removal.`;
        }


        return this.get('alert').showModal('warning', warningText, null, confirmText)
          .then((result) => {
            if (result.value) {
              // remove user from org members
              org.get('pdAdmins').removeObject(pdAdmin.get('id'));
              org.get('members').removeObject(pdAdmin);

              return org.save()
              .then((updatedOrg) => {
                return this.get('alert').showToast('success', successText, 'bottom-end', 5000, true, undoBtnText)
                .then((result) => {
                  if (result.value) {
                    // user clicked undo, re-add pdAdmin to org
                    org.get('pdAdmins').addObject(pdAdmin.get('id'));
                    org.get('members').addObject(pdAdmin);

                    return org.save()
                    .then((updatedOrg) => {
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

      },
      trashOrg() {
        let org = this.get('model');
        if (!org) {
          return;
        }
        let orgName = org.get('name');

        let members = org.get('members');

        let membersWhoWillBeOrgless = members.filter((user) => {
          return user.get('organizations.length') === 1;
        });

        let title = `Are you sure you want to delete ${orgName}?`;

        let text = null;
        let confirm = 'Yes, delete it';

        if (membersWhoWillBeOrgless.get('length') > 0) {
          text = `The following members will not belong to any organization after removal: ${membersWhoWillBeOrgless.mapBy('username')}`;
        }

        return this.get('alert').showModal('warning', title, text, confirm)
        .then((result) => {
          if (result.value) {
            org.set('isTrashed', true);

            return org.save()
            .then((updatedRecords) => {
              // transition to org home page
              this.sendAction('toHome');
              return this.get('alert').showToast('success', 'Org Deleted', 'bottom-end', 5000, true, 'Undo');
            })
            .then((result) => {
              if (result.value) {
                org.set('isTrashed', false);

                return org.save()
                .then((restoredRecords) => {
                  // transition back to org page
                  this.sendAction('toOrg', org.get('id'));
                  return this.get('alert').showToast('success', 'Org Restored', 'bottom-end', 3000);
                });
              }
            });
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'modelUpdateErrors', org);
        });
      },
      restoreOrg(org) {
        if (!org) {
          return;
        }
        let orgName = org.get('name');

        let title = `Are you sure you want to restore ${orgName}?`;

        let text = null;
        let confirm = 'Yes, restore it';

        return this.get('alert').showModal('warning', title, text, confirm)
        .then((result) => {
          if (result.value) {
            org.set('isTrashed', false);

            return org.save()
            .then((updatedRecords) => {
              return this.get('alert').showToast('success', 'Org Restored', 'bottom-end', 5000, true, 'Undo');
            })
            .then((result) => {
              if (result.value) {

                org.set('isTrashed', true);

                return org.save()
                .then((restoredRecords) => {
                  // transition back to org page
                  return this.get('alert').showToast('success', 'Org Trashed', 'bottom-end', 3000);
                });
              }
            });
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'modelUpdateErrors', org);
        });
      }
    }
  }
);
