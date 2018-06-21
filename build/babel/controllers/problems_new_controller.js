'use strict';

Encompass.ProblemsNewController = Ember.Controller.extend(Encompass.CurrentUserMixin, {
  actions: {
    // This action just sets whatever the value of the selected radio button is to the value for is Public
    radioSelect: function radioSelect(value) {
      this.set('isPublic', value);
    },

    createProblem: function createProblem() {
      var createdBy = this.get('currentUser');
      var title = this.get('title');
      var text = this.get('text');
      var categories = [];
      var additionalInfo = this.get('additionalInfo');
      var isPublic = this.get('isPublic');
      var createProblemData = this.store.createRecord('problem', {
        createdBy: createdBy,
        createDate: new Date(),
        title: title,
        text: text,
        // categories: categories,
        additionalInfo: additionalInfo,
        isPublic: isPublic
      });
      createProblemData.save();
    }
  }
});
//# sourceMappingURL=problems_new_controller.js.map
