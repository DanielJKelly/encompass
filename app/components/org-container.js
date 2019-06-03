Encompass.OrgContainerComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
elementId: 'org-container',

activeOrg: null,
doIncludeTrashedOrgs: false,
sortParam: null,
sortDirection: null,
queriedOrgs: null,
orgSearchText: '',

modelOrgs: Ember.computed.alias('model.orgs'),
modelMeta: Ember.computed.alias('model.meta'),

filterOptions: {
  doIncludeTrashedOrgs: {
    label: 'Include Trashed Orgs',
    relatedProp: 'doIncludeTrashedOrgs',
    isChecked: false,
  },
},

sortOptions: [
  {
    index: 0,
    label: 'Name',
    value: 'name',
    collate: 1,
    defaultDirection: 1,
    isChecked: true ,
  },
  {
    index: 1,
    label: 'Member Count',
    value: 'members',
    collate: 0,
    defaultDirection: -1,
    isChecked: false,
  },
  {
    index: 2,
    label: 'Creation Date',
    value: 'createDate',
    collate: 0,
    defaultDirection: -1,
    isChecked: false,
  },
],

searchConstraints: {
  query: {
    length: {
      minimum: 0,
      maximum: 500
    }
  }
},

didReceiveAttrs() {
  this._super(...arguments);
  this.set('queriedOrgs', this.get('modelOrgs'));
  this.set('orgsMeta', this.get('modelMeta'));
  this.set('sortParam', this.get('sortOptions.firstObject'));
  this.set('sortDirection', this.get('sortOptions.firstObject.defaultDirection'));
},

displayOrgs: function() {
  return this.get('queriedOrgs') || [];
}.property('queriedOrgs.[]'),


buildFilterBy() {
  let includeTrashed = this.get('doIncludeTrashedOrgs') ? 1 : 0;

  return {
    includeTrashed
  };
},

buildSortBy() {
  let value = this.get('sortParam.value');
  let direction = this.get('sortDirection');
  return {[value]: direction};

},

buildSearchBy() {
  return this.get('orgSearchText');
},

queryOrgs(requestedPage) {
  let filterBy = this.buildFilterBy();
  let sortBy = this.buildSortBy();
  let searchBy = this.buildSearchBy();

  let page = requestedPage || 1;

  return this.get('store').query('organization', {
    filterBy,
    sortBy,
    searchBy,
    page
  })
  .then((results) => {
    this.set('queriedOrgs', results.toArray());
    this.set('orgsMeta', results.get('meta'));
  })
  .catch((err) => {
    this.handleErrors(err, 'fetchErrors');
  });
},

sortDirectionIcon: function() {
  let direction = this.get('sortDirection');

  if (direction === 1) {
    return 'fas fa-arrow-up sort-icon';
  }
  if (direction === -1) {
    return 'fas fa-arrow-down sort-icon';
  }
  return '';
}.property('sortDirection'),

actions: {
  setActiveOrg(org) {
    this.set('activeOrg', org);
  },
  updateFilter(prop) {
    this.toggleProperty(prop);
    this.queryOrgs();
  },
  updateSortParam(index) {
    console.log('param', index);
    this.set('sortParam',this.get('sortOptions.' + index));
    this.queryOrgs();
  },
  toggleSortDirection() {
    let currentDirection = this.get('sortDirection');
    if (currentDirection !== 1 && currentDirection !== -1) {
      this.set('sortDirection', this.get('sortParam.defaultDirection'));
    } else {
      this.set('sortDirection', currentDirection * -1);
    }

    this.queryOrgs();
  },
  searchOrgs() {
    this.queryOrgs();
  }

}
});