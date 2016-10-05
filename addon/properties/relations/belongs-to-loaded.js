import BelongsToRelation from './belongs-to';

export default class BelongsToLoadedRelation extends BelongsToRelation {

  inverseWillChange() {
  }

  inverseDidChange() {
  }

  inverseDeleted() {
  }

  // getValue() {
  //   let value = this.value;
  //   if(!value) {
  //     let content = this.content;
  //   }
  // }

  // setValue(value, changed) {
  // }

}
