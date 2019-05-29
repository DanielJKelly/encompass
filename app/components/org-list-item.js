Encompass.OrgListItemComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
  classNames: ['org-list-item', 'side-list-item'],
  classNameBindings: ['isActive:is-active'],

  isActive: Ember.computed.equal('activeOrg.id', this.getComputedStyle('org.id')),
});