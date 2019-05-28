Encompass.OrgInfoComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
elementId: 'org-info',
utils: Ember.inject.service('utility-methods'),
alert: Ember.inject.service('sweet-alert'),

didReceiveAttrs() {
  this.set('allUsers', this.get('store').peekAll('user')).rejectBy('isTrashed');

  this.set('isEditing', false);

  this.set('cachedUsers', this.get('store').peekAll('user'));

  this._super(...arguments);
},

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

  let userOrgId = this.get('utils').getBelongsToId(this.get('currentUser'), 'organization');

  return userOrgId === this.get('model.id');

}.property('currentUser.accountType', 'currentUser.organization', 'model'),

existingMemberIdHash: function() {
  let members = this.get('model.members') || [];
  let hash = {};

  members.forEach((member) => {
    hash[member.get('id')] = true;
  });
  return hash;

}.property('model.members.[]'),

initialMemberOptions: function() {
  let cached = this.get('cachedUsers') || [];
  let nonMemberCachedUsers = cached.reject((user) => {
    return this.get('existingMemberIdHash.' + user.get('id'));
  });
  return nonMemberCachedUsers.map((user) => {
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

    let didNameChange = trimmedName.length > 0 && trimmedName !== this.get('model.name');

    if (!didNameChange) {
      this.set('isEditing', false);
      return this.get('alert').showToast('info', 'No changes to save', 'bottom-end', 3000, false, null);
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

  },
}
});