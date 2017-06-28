import Ember from 'ember';

const {
  A
} = Ember;

export default Ember.Mixin.create({

  _createShoebox() {
    let databases = this.get('_databases');
    let result = [];
    for(let identifier in databases) {
      let database = databases[identifier];
      result.push({ identifier, shoebox: database._createShoebox() });
    }
    return result;
  },

  _pushShoebox(shoebox) {
    if(!shoebox) {
      return;
    }
    return A(shoebox).map(({ identifier, shoebox }) => {
      let database = this.database(identifier);
      return {
        identifier,
        status: database._pushShoebox(shoebox)
      };
    });
  }

});
