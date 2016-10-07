import Ember from 'ember';
import { isObject_, isString_, assert } from '../../util/assert';
import AttachmentInternal from './attachment-internal';

const {
  getOwner,
  copy
} = Ember;

export default class AttachmentsInternal {

  constructor(internalModel, property) {
    this.internalModel = internalModel;
    this.attachmentsModel = null;
    this.property = property;
    this.content = Ember.A();
  }

  dirty() {
    let internal = this.internalModel;
    internal.withPropertyChanges(changed => {
      internal.onDirty(changed);
    }, true);
  }

  createAttachmentsModel() {
    let _internal = this;
    let content = this.content;
    return getOwner(this.property.store).lookup('sofa:attachments').create({ _internal, content });
  }

  getAttachmentsModel() {
    let model = this.attachmentsModel;
    if(!model) {
      model = this.createAttachmentsModel();
      model.addEnumerableObserver(this, {
        willChange: this.attachmentModelsWillChange,
        didChange: this.attachmentModelsDidChange
      });
      this.attachmentsModel = model;
    }
    return model;
  }

  createAttachmentInternal(name, data) {
    return new AttachmentInternal(this, name, data);
  }

  createAttachmentInternalFromHash(hash) {
    isObject_(`attachment must be object { name, type, data } not ${hash}`, hash);
    isString_(`attachment.name must be string not ${hash.name}`, hash.name);
    let name = hash.name;
    return this.createAttachmentInternal(name, hash);
  }

  getAttachmentInternalByName(name) {
    return this.content.find(internal => internal.name === name);
  }

  //

  willRemoveAttachments(attachments) {
    attachments.forEach(attachment => {
      attachment.destroy();
    });
    this.dirty();
  }

  didAddAttachments(attachments) {
    attachments.forEach(attachment => {
      assert(`attachment '${attachment.name}' is already assigned to ${attachment.attachments.internalModel.modelName} with id '${attachment.attachments.internalModel.docId}'`, attachment.attachments === this);
    });
    this.dirty();
  }

  addAttachments(attachments) {
    this.ignoreProxyChangeNotifications = true;
    this.content.addObjects(attachments);
    this.didAddAttachments(attachments);
    this.ignoreProxyChangeNotifications = false;
    return attachments;
  }

  addAttachmentHashes(hashes) {
    let attachments = Ember.A(hashes).map(hash => this.createAttachmentInternalFromHash(hash));
    return this.addAttachments(attachments);
  }

  removeAttachments(attachments) {
    this.ignoreProxyChangeNotifications = true;
    this.willRemoveAttachments(attachments);
    this.content.removeObjects(attachments);
    this.ignoreProxyChangeNotifications = false;
  }

  //

  attachmentModelsWillChange(proxy, removing) {
    if(this.ignoreProxyChangeNotifications) {
      return;
    }
    this.willRemoveAttachments(removing.map(model => model._internal));
  }

  attachmentModelsDidChange(proxy, removeCount, adding) {
    if(this.ignoreProxyChangeNotifications) {
      return;
    }
    this.didAddAttachments(adding.map(model => model._internal));
  }

  //

  serialize(preview) {
    let hash = {};
    this.content.forEach(attachment => {
      let { name, value } = attachment.serialize(preview);
      hash[name] = value;
    });
    return hash;
  }

  deserialize(hash={}) {

    let content = this.content;

    let add = Ember.A();
    let remove = Ember.A(copy(content));

    const named = (name) => (attachment) => attachment.name === name;

    for(let name in hash) {
      let value = hash[name];
      let current = content.find(named(name));
      if(current) {
        current.deserialize(value);
        remove.removeObject(current);
      } else {
        add.push(this.createAttachmentInternal(name, value));
      }
    }

    if(add.length > 0) {
      this.addAttachments(add);
    }

    if(remove.length > 0) {
      this.removeAttachments(remove);
    }

  }

}
