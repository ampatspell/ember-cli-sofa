import Ember from 'ember';

const {
  setOwner,
  getOwner
} = Ember;

export default function create(modelClass, props) {
  let model = modelClass._create(props);
  setOwner(model, getOwner(modelClass));
  return model;
}
