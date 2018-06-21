'use strict';

/**
 * Passed in by parent:
 * - hide
 */
Encompass.ModalFolderNewComponent = Ember.Component.extend({
  classNameBindings: ['hide'],
  newFolderName: '',

  actions: {
    close: function close() {
      console.log("Closed new folder");
      this.set('newFolderName', '');
      this.set('hide', true);
    },

    cancel: function cancel() {
      console.log("Cancelled new folder");
      this.set('newFolderName', '');
      this.set('hide', true);
    },

    save: function save() {
      console.log("Saved new folder");
      var newName = this.get('newFolderName');
      this.sendAction("newFolder", newName);

      this.set('hide', true);
    }
  }
});
//# sourceMappingURL=modal-folder-new.js.map
