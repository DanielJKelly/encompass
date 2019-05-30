Encompass.Organization = DS.Model.extend(Encompass.Auditable, {
  organizationId: Ember.computed.alias('id'),
  name: DS.attr('string'),
  recommendedProblems: DS.hasMany('problem', { async: true, inverse: null }),
  members: DS.hasMany('user', {inverse: null}),
  location: DS.attr(),
  pdAdmins: DS.attr({defaultValue: []}), // array of objectIds,

  memberCount: function() {
    return this.hasMany('members').ids().get('length');
  }.property('members.[]'),


});