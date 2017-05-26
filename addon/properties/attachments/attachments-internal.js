import Ember from 'ember';
import { isObject_, isString_, assert } from '../../util/assert';
import AttachmentInternal from './attachment-internal';
import {
  internalModelDidChangeInternalWillDestroy,
  internalModelDidChangeModelWillDestroy
} from '../../internal-model';

const {
  getOwner,
  copy,
  A
} = Ember;

export default class AttachmentsInternal {

  constructor(internalModel, property) {
    this.internalModel = internalModel;
    this.internalModel.addObserver(this);
    this.attachmentsModel = null;
    this.property = property;
    this.content = A();
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
    return getOwner(this.property.store).factoryFor('sofa:attachments').create({ _internal, content });
  }

  get attachmentsModelObserverOptions() {
    return {
      willChange: this.attachmentModelsWillChange,
      didChange: this.attachmentModelsDidChange
    };
  }

  getAttachmentsModel() {
    let model = this.attachmentsModel;
    if(!model) {
      model = this.createAttachmentsModel();
      model.addEnumerableObserver(this, this.attachmentsModelObserverOptions);
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
    let attachments = A(hashes).map(hash => this.createAttachmentInternalFromHash(hash));
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

  serialize(type) {
    let hash = {};
    this.content.forEach(attachment => {
      let { name, value } = attachment.serialize(type);
      hash[name] = value;
    });
    return hash;
  }

  deserialize(hash={}) {
    let content = this.content;

    let add = A();
    let remove = A(copy(content));

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

  //

  // add({ name: 'original', data: file, contentType: 'text/plain' })
  // add('original', file)
  // add('original', file, 'text/plain')
  addAttachmentWithVariableArguments() {
    let hash = {};
    if(typeof arguments[0] === 'object') {
      hash = arguments[0];
    } else if(typeof arguments[0] === 'string') {
      hash = {
        name: arguments[0],
        data: arguments[1],
        type: arguments[2]
      };
    }

    let existing = this.getAttachmentInternalByName(hash.name);
    if(existing) {
      this.removeAttachments([ existing ]);
    }

    let added = this.addAttachmentHashes([ hash ]);
    let internal = added[0];
    return internal.getAttachmentModel();
  }

  removeAttachmentWithName(name) {
    let internal = this.getAttachmentInternalWithName(name);
    if(!internal) {
      return;
    }
    this.removeAttachments([ internal ]);
  }

  destroyAttachmentsModel() {
    let attachmentsModel = this.attachmentsModel;
    if(!attachmentsModel) {
      return;
    }
    attachmentsModel.removeEnumerableObserver(this, this.attachmentsModelObserverOptions);
    this.attachmentsModel = null;
  }

  onInternalDestroyed() {
    let content = this.content;
    content.forEach(attachment => attachment.destroy());
    this.content = null;

    this.destroyAttachmentsModel();

    this.internalModel.removeObserver(this);
    this.internalModel = null;
    this.destroyed = true;
  }

  onModelDestroyed() {
    this.content.forEach(attachment => attachment.onModelDestroyed());
    this.destroyAttachmentsModel();
    this.property.notifyPropertyChange(this.internalModel);
  }

  internalModelDidChange(internal, props) {
    Ember.assert(`internal model should be this.internalModel`, internal === this.internalModel);
    if(internalModelDidChangeInternalWillDestroy(internal, props)) {
      this.onInternalDestroyed();
    } else if(internalModelDidChangeModelWillDestroy(internal, props)) {
      this.onModelDestroyed();
    }
  }

}
