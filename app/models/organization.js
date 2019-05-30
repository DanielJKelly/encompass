Encompass.Organization = DS.Model.extend(Encompass.Auditable, {
  organizationId: Ember.computed.alias('id'),
  name: DS.attr('string'),
  recommendedProblems: DS.hasMany('problem', { async: true, inverse: null }),
  members: DS.hasMany('user', {inverse: null}),
  location: DS.attr(),
  pdAdmins: DS.attr({defaultValue: []}), // array of objectIds

  regularMembers: function() {
    return this.get('members').reject((user) => {
      return this.get('pdAdmins').includes(user.get('id'));
    });
  }.property('members.[]', 'pdAdmins.[]'),

  pdMembers: function() {
    return this.get('members').filter((user) => {
      return this.get('pdAdmins').includes(user.get('id'));
    });
  }.property('members.[]', 'pdAdmins.[]'),
});