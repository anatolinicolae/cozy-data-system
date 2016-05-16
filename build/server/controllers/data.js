// Generated by CoffeeScript 1.10.0
var account, db, dbHelper, encryption, git;

git = require('git-rev');

db = require('../helpers/db_connect_helper').db_connect();

dbHelper = require('../lib/db_remove_helper');

encryption = require('../lib/encryption');

account = require('./accounts');

module.exports.encryptFields = function(req, res, next) {
  var error, error1, error2, password;
  try {
    password = encryption.encrypt(req.body.password);
  } catch (error1) {
    error = error1;
    return next(error);
  }
  if (password != null) {
    req.body.password = password;
  }
  try {
    req.body = encryption.encryptNeededFields(req.body);
  } catch (error2) {
    error = error2;
    return next(error);
  }
  return next();
};

module.exports.decryptFields = function(req, res, next) {
  var error, error1, error2, password;
  try {
    password = encryption.decrypt(req.doc.password);
  } catch (error1) {
    error = error1;
    if (req.doc.password != null) {
      req.doc._passwordStillEncrypted = true;
    }
    account.addApp(req.appName);
  }
  if (password != null) {
    req.doc.password = password;
  }
  try {
    req.doc = encryption.decryptNeededFields(req.doc);
  } catch (error2) {

  }
  return next();
};

module.exports.index = function(req, res) {
  return git.long(function(commit) {
    return git.branch(function(branch) {
      return git.tag(function(tag) {
        return res.status(200).send("<strong>Cozy Data System</strong><br />\nrevision: " + commit + "  <br />\ntag: " + tag + " <br />\nbranch: " + branch + " <br />");
      });
    });
  });
};

module.exports.exist = function(req, res, next) {
  return db.head(req.params.id, function(err, response, status) {
    if (status === 200) {
      return res.status(200).send({
        exist: true
      });
    } else if (status === 404) {
      return res.status(200).send({
        exist: false
      });
    } else {
      return next(err);
    }
  });
};

module.exports.find = function(req, res) {
  delete req.doc._rev;
  return res.status(200).send(req.doc);
};

module.exports.create = function(req, res, next) {
  delete req.body._attachments;
  if (req.params.id != null) {
    return db.get(req.params.id, function(err, doc) {
      if (doc != null) {
        err = new Error("The document already exists.");
        err.status = 409;
        return next(err);
      } else {
        return db.save(req.params.id, req.body, function(err, doc) {
          if (err) {
            err = new Error("The document already exists.");
            err.status = 409;
            return next(err);
          } else {
            return res.status(201).send({
              _id: doc.id
            });
          }
        });
      }
    });
  } else {
    return db.save(req.body, function(err, doc) {
      if (err) {
        return next(err);
      } else {
        return res.status(201).send({
          _id: doc.id
        });
      }
    });
  }
};

module.exports.update = function(req, res, next) {
  delete req.body._attachments;
  return db.save(req.params.id, req.body, function(err, response) {
    if (err) {
      return next(err);
    } else {
      res.status(200).send({
        success: true
      });
      return next();
    }
  });
};

module.exports.upsert = function(req, res, next) {
  delete req.body._attachments;
  return db.get(req.params.id, function(err, doc) {
    return db.save(req.params.id, req.body, function(err, savedDoc) {
      if (err) {
        return next(err);
      } else if (doc != null) {
        res.status(200).send({
          success: true
        });
        return next();
      } else {
        res.status(201).send({
          _id: savedDoc.id
        });
        return next();
      }
    });
  });
};

module.exports.softdelete = function(req, res, next) {
  return dbHelper.remove(req.doc, function(err) {
    if (err) {
      return next(err);
    } else {
      res.status(204).send({
        success: true
      });
      return next();
    }
  });
};

module.exports["delete"] = function(req, res, next) {
  return db.remove(req.doc.id, function(err, doc) {
    if (err) {
      return next(err);
    } else {
      return res.status(200).send({
        success: true
      });
    }
  });
};

module.exports.merge = function(req, res, next) {
  delete req.body._attachments;
  return db.merge(req.params.id, req.body, function(err, doc) {
    if (err) {
      return next(err);
    } else {
      res.status(200).send({
        success: true
      });
      return next();
    }
  });
};
