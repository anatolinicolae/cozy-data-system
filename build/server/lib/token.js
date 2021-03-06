// Generated by CoffeeScript 1.10.0
var _, addAccess, checkToken, db, fs, initAccess, initHomeProxy, log, permissions, productionOrTest, ref, sharingPermissions, sharingTokens, tokens, updatePermissions;

db = require('../helpers/db_connect_helper').db_connect();

_ = require('lodash');

fs = require('fs');

log = require('printit')({
  prefix: 'token'
});

permissions = {};

tokens = {};

sharingTokens = {};

sharingPermissions = {};

productionOrTest = (ref = process.env.NODE_ENV) === 'production' || ref === 'test';

checkToken = module.exports.checkToken = function(auth, tokensTab) {
  var password, username;
  if (auth !== "undefined" && (auth != null)) {
    if (tokensTab == null) {
      tokensTab = tokens;
    }
    auth = auth.substr(5, auth.length - 1);
    auth = new Buffer(auth, 'base64').toString('ascii');
    username = auth.split(':')[0];
    password = auth.split(':')[1];
    if (productionOrTest) {
      if (password !== void 0 && tokensTab[username] === password) {
        return [null, true, username];
      } else {
        return [null, false, username];
      }
    } else {
      return [null, true, username];
    }
  } else {
    return [null, false, null];
  }
};

module.exports.checkDocType = function(auth, docType, callback) {
  var err, isAuthenticated, name, ref1;
  ref1 = checkToken(auth, tokens), err = ref1[0], isAuthenticated = ref1[1], name = ref1[2];
  if (productionOrTest) {
    if (isAuthenticated) {
      if (docType != null) {
        docType = docType.toLowerCase();
        if (permissions[name][docType] != null) {
          return callback(null, name, true);
        } else if (permissions[name]["all"] != null) {
          return callback(null, name, true);
        } else {
          return callback(null, name, false);
        }
      } else {
        return callback(null, name, true);
      }
    } else {
      return callback(null, false, false);
    }
  } else {
    if (name == null) {
      name = 'unknown';
    }
    return callback(null, name, true);
  }
};

module.exports.checkDocTypeSync = function(auth, docType) {
  var err, isAuthenticated, name, ref1, ref2;
  if (productionOrTest) {
    ref1 = checkToken(auth, tokens), err = ref1[0], isAuthenticated = ref1[1], name = ref1[2];
    if (isAuthenticated) {
      if (docType != null) {
        docType = docType.toLowerCase();
        if (permissions[name][docType] != null) {
          return [null, name, true];
        } else if (permissions[name]["all"] != null) {
          return [null, name, true];
        } else {
          return [null, name, false];
        }
      } else {
        return [null, name, true];
      }
    } else {
      return [null, false, false];
    }
  } else {
    ref2 = checkToken(auth, tokens), err = ref2[0], isAuthenticated = ref2[1], name = ref2[2];
    if (name == null) {
      name = 'unknown';
    }
    return [null, name, true];
  }
};

module.exports.checkSharingRule = function(auth, doc, callback) {
  var err, isAuthenticated, name, ref1, ref2, rule;
  if (productionOrTest) {
    ref1 = checkToken(auth, sharingTokens), err = ref1[0], isAuthenticated = ref1[1], name = ref1[2];
    if (isAuthenticated) {
      if (((doc != null ? doc.id : void 0) != null) && ((doc != null ? doc.docType : void 0) != null)) {
        doc.docType = doc.docType.toLowerCase();
        rule = _.find(sharingPermissions[name], {
          id: doc.id,
          docType: doc.docType
        });
        return callback(null, name, rule != null);
      } else {
        return callback(null, name, true);
      }
    } else {
      return callback(null, false, false);
    }
  } else {
    ref2 = checkToken(auth, sharingTokens), err = ref2[0], isAuthenticated = ref2[1], name = ref2[2];
    if (name == null) {
      name = 'unknown sharing';
    }
    return callback(null, name, true);
  }
};

module.exports.checkSharingRuleSync = function(auth, doc) {
  var err, isAuthenticated, name, ref1, ref2, rule;
  if (productionOrTest) {
    ref1 = checkToken(auth, sharingTokens), err = ref1[0], isAuthenticated = ref1[1], name = ref1[2];
    if (isAuthenticated) {
      if (((doc != null ? doc.id : void 0) != null) && ((doc != null ? doc.docType : void 0) != null)) {
        doc.docType = doc.docType.toLowerCase();
        rule = _.find(sharingPermissions[name], {
          id: doc.id,
          docType: doc.docType
        });
        return [null, name, rule != null];
      } else {
        return [null, name, true];
      }
    } else {
      return [null, false, false];
    }
  } else {
    ref2 = checkToken(auth, sharingTokens), err = ref2[0], isAuthenticated = ref2[1], name = ref2[2];
    if (name == null) {
      name = 'unknown sharing';
    }
    return [null, name, true];
  }
};

module.exports.checkProxyHome = function(auth, callback) {
  var password, username;
  if (productionOrTest) {
    if (auth !== "undefined" && (auth != null)) {
      auth = auth.substr(5, auth.length - 1);
      auth = new Buffer(auth, 'base64').toString('ascii');
      username = auth.split(':')[0];
      password = auth.split(':')[1];
      if (password !== void 0 && tokens[username] === password) {
        if (username === "proxy" || username === "home") {
          return callback(null, true);
        } else {
          return callback(null, false);
        }
      } else {
        return callback(null, false);
      }
    } else {
      return callback(null, false);
    }
  } else {
    return callback(null, true);
  }
};

updatePermissions = function(access, callback) {
  var description, docType, i, len, login, ref1, ref2, rule;
  login = access.login;
  if (productionOrTest) {
    if (access.rules != null) {
      if (access.token != null) {
        sharingTokens[login] = access.token;
      }
      ref1 = access.rules;
      for (i = 0, len = ref1.length; i < len; i++) {
        rule = ref1[i];
        rule.docType = rule.docType.toLowerCase();
      }
      sharingPermissions[login] = access.rules;
    } else if (access.permissions != null) {
      if (access.token != null) {
        tokens[login] = access.token;
      }
      permissions[login] = {};
      ref2 = access.permissions;
      for (docType in ref2) {
        description = ref2[docType];
        permissions[login][docType.toLowerCase()] = description;
      }
    }
    if (callback != null) {
      return callback();
    }
  } else {
    if (callback != null) {
      return callback();
    }
  }
};

addAccess = module.exports.addAccess = function(doc, callback) {
  var access;
  access = {
    docType: "Access",
    login: doc.slug || doc.login,
    token: doc.password,
    app: doc.id || doc._id
  };
  if (doc.rules != null) {
    access.rules = doc.rules;
  } else {
    access.permissions = doc.permissions;
  }
  return db.save(access, function(err, doc) {
    if (err != null) {
      log.error(err);
      if (callback != null) {
        return callback(err);
      }
    } else {
      return updatePermissions(access, function() {
        if (callback != null) {
          return callback(null, access);
        }
      });
    }
  });
};

module.exports.updateAccess = function(id, doc, callback) {
  return db.view('access/byApp', {
    key: id
  }, function(err, accesses) {
    var access;
    if (accesses.length > 0) {
      access = accesses[0].value;
      delete permissions[access.login];
      delete tokens[access.login];
      delete sharingPermissions[access.login];
      delete sharingTokens[access.login];
      access.login = doc.slug || access.login;
      access.token = doc.password || access.token;
      if (doc.rules != null) {
        access.rules = doc.rules;
      } else {
        access.permissions = doc.permissions || access.permissions;
      }
      return db.save(access._id, access, function(err, body) {
        if (err != null) {
          log.error(err);
        }
        return updatePermissions(access, function() {
          if (callback != null) {
            return callback(null, access);
          }
        });
      });
    } else {
      return addAccess(doc, callback);
    }
  });
};

module.exports.removeAccess = function(doc, callback) {
  return db.view('access/byApp', {
    key: doc._id
  }, function(err, accesses) {
    var access;
    if ((err != null) && (callback != null)) {
      return callback(err);
    }
    if (accesses.length > 0) {
      access = accesses[0].value;
      delete permissions[access.login];
      delete tokens[access.login];
      delete sharingPermissions[access.login];
      delete sharingTokens[access.login];
      return db.remove(access._id, access._rev, function(err) {
        if (callback != null) {
          return callback(err);
        }
      });
    } else {
      if (callback != null) {
        return callback();
      }
    }
  });
};

initHomeProxy = function(callback) {
  var token;
  token = process.env.TOKEN;
  if (!token) {
    throw new Error('you need to define process.env.TOKEN');
  }
  token = token.split('\n')[0];
  tokens['home'] = token;
  permissions.home = {
    "application": "authorized",
    "access": "authorized",
    "notification": "authorized",
    "photo": "authorized",
    "file": "authorized",
    "background": "authorized",
    "folder": "authorized",
    "contact": "authorized",
    "album": "authorized",
    "message": "authorized",
    "binary": "authorized",
    "user": "authorized",
    "device": "authorized",
    "alarm": "authorized",
    "event": "authorized",
    "userpreference": "authorized",
    "usetracker": "authorized",
    "cozyinstance": "authorized",
    "encryptedkeys": "authorized",
    "stackapplication": "authorized",
    "send mail to user": "authorized",
    "send mail from user": "authorized",
    "sharing": "authorized"
  };
  tokens['proxy'] = token;
  permissions.proxy = {
    "access": "authorized",
    "application": "authorized",
    "user": "authorized",
    "cozyinstance": "authorized",
    "device": "authorized",
    "usetracker": "authorized",
    "send mail to user": "authorized",
    "sharing": "authorized"
  };
  return callback(null);
};

initAccess = function(access, callback) {
  var description, docType, i, len, name, ref1, ref2, rule;
  name = access.login;
  if (access.rules != null) {
    sharingTokens[name] = access.token;
    ref1 = access.rules;
    for (i = 0, len = ref1.length; i < len; i++) {
      rule = ref1[i];
      rule.docType = rule.docType.toLowerCase();
    }
    sharingPermissions[name] = access.rules;
  } else {
    tokens[name] = access.token;
    if ((access.permissions != null) && access.permissions !== null) {
      permissions[name] = {};
      ref2 = access.permissions;
      for (docType in ref2) {
        description = ref2[docType];
        docType = docType.toLowerCase();
        permissions[name][docType] = description;
      }
    }
  }
  return callback(null);
};

module.exports.init = function(callback) {
  if (productionOrTest) {
    return initHomeProxy(function() {
      return db.view('access/all', function(err, accesses) {
        if (err != null) {
          return callback(new Error("Error in view"));
        }
        accesses.forEach(function(access) {
          return initAccess(access, function() {});
        });
        return callback(tokens, permissions);
      });
    });
  } else {
    return callback(tokens, permissions);
  }
};
