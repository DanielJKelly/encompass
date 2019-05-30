Encompass.OrgListItemComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
  classNames: ['org-list-item', 'side-list-item'],
  classNameBindings: ['isActive:is-active', 'org.isTrashed:strikethrough'],

  isActive: function() {
    return this.get('activeOrg.id') === this.get('org.id');
  }.property('activeOrg', 'org'),
});