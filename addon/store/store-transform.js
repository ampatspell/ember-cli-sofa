import Ember from 'ember';
import { object } from '../util/computed';
import { isFunction_ } from '../util/assert';

const {
  getOwner
} = Ember;

export default Ember.Mixin.create({

  _transforms: object(),

  _transformForName(name) {
    name = name || 'noop';
    let cache = this.get('_transforms');
    let transform = cache[name];
    if(!transform) {
      let key = `sofa:transform/${name}`;
      let Transform = getOwner(this).lookup(key);
      isFunction_(`Transform '${key}' is not registered`, Transform);
      transform = new Transform();
      cache[name] = transform;
    }
    return transform;
  }

});
