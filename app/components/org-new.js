Encompass.OrgNewComponent = Ember.Component.extend(Encompass.CurrentUserMixin, Encompass.ErrorHandlingMixin, {
  elementId: 'org-new',

  actions: {
    cancelCreation() {
      // confirm leaving?
      // transition to orgs home
      this.sendAction('toHome');
    },

    create() {
      let name = this.get('newOrgName');

      let trimmed = typeof name === 'string' ? name.trim() : '';

      if (trimmed.length === 0) {
        return this.set('invalidNameError', 'Please enter a valid organization name');
      }

      let newOrg = this.get('store').createRecord('organization', {
        name,
        createdBy: this.get('currentUser'),
      });

      newOrg.save()
      .then((org) => {
        this.sendAction('toOrg', org.get('id'));

        this.get('alert').showToast('success', 'Org created', 'bottom-end', 3000, false, null);
      })
      .catch((err) => {
        this.handleErrors(err, 'creationErrors', newOrg);
      });
    },
    removeErrorFromArray(propName, errorMessage) {
      if (!this.get(propName)) {
        return;
      }
      this.get(propName).removeObject(errorMessage);
    }

  }
});