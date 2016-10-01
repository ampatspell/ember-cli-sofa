import Ember from 'ember';

export default Ember.Mixin.create({

  model(modelName, props) {
    return this.get('store')._createModelForName(modelName, this, props);
  }

});
