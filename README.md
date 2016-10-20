# ember-cli-sofa

> This documentation is also available at http://sofa.amateurinmotion.com

`Sofa` is full featured and easy to use CouchDB model persistence library for Ember.js.

It makes it easy to map CouchDB documents to application models, query and persist them, manage queriable to-one, to-many relationships and relationship inverses, create and load document attachments. Also create, drop databases, authenticate users by using CouchDB sessions, create and update design documents (javascript and mango views).

This is is one of the easiest ways to start coding your Ember.js app which persists data in the cloud. All you need is CouchDB running somewhere. You can also deploy Ember.js app itself as an CouchApp in the same CouchDB database and, with simple CouchDB and optionally nginx configuration, serve it to your users.

Both CouchDB 1.6 and 2.0 are supported.

While Sofa has already most of commonly required features implemented, there is quite a few things in the roadmap like:

* FastBoot support
* collection and relationship pagination, search, filtering support
* local PouchDB support
* document changes listener for local PouchDB and remote CouchDB instances
* per-database model name to document type mapping, embedded models and so on

## Example applications

* [https://github.com/ampatspell/portfolio](https://github.com/ampatspell/portfolio) – Photography portfolio app which showcases model inheritance, attachments, relationships, queries, collections.

## Install

```bash
ember install ember-cli-sofa
```

## Quickstart

```
> remove ember data
> add service
> configure databases
> add playing.js instance initializer
> play with database
> create database
> add Message model with text attr
> create message, save it
> load message by id
> create mango index
> query using mango
> create ddoc
> query using view
> delete message
> add author
> add user model
> login and create author-user relationship
> add sofa validator
```
