angular.module('Module.emailpro.services').service('EmailProExternalContacts', function (EmailPro, OvhHttp) {
  this.isAccountValid = function (account) {
    if (!account || !EmailPro.isEmailValid(account.externalEmailAddress)) {
      return false;
    } if (account.firstName && account.firstName.length > 64) {
      return false;
    } if (account.lastName && account.lastName.length > 64) {
      return false;
    } if (!account.displayName || account.displayName.length === 0) {
      return false;
    } if (account.displayName && account.displayName.length > 255) {
      return false;
    }
    return true;
  };

  this.removeContact = function (organization, serviceName, contactId) {
    return OvhHttp.delete('/email/pro/{exchange}/externalContact/{externalEmailAddress}', {
      rootPath: 'apiv6',
      urlParams: {
        organization,
        exchange: serviceName,
        externalEmailAddress: contactId,
      },
    }).then((data) => {
      EmailPro.resetTabExternalContacts();
      return data;
    });
  };

  this.modifyContact = function (organization, serviceName, contactId, modifiedContact) {
    _.set(modifiedContact, 'state', _.camelCase(modifiedContact.state));
    return OvhHttp.put('/email/pro/{exchange}/externalContact/{externalEmailAddress}', {
      rootPath: 'apiv6',
      urlParams: {
        organization,
        exchange: serviceName,
        externalEmailAddress: contactId,
      },
      data: modifiedContact,
    }).then((data) => {
      EmailPro.resetTabExternalContacts();
      return data;
    });
  };

  this.addContact = function (organization, serviceName, newContact) {
    return OvhHttp.post('/email/pro/{exchange}/externalContact', {
      rootPath: 'apiv6',
      urlParams: {
        organization,
        exchange: serviceName,
      },
      data: newContact,
    }).then((data) => {
      EmailPro.resetTabExternalContacts();
      return data;
    });
  };

  this.getContacts = function (organization, serviceName, count, offset, filter) {
    const params = {
      count,
      offset,
    };

    if (filter) {
      params.search = filter;
    }

    return OvhHttp.get('/sws/emailpro/{exchange}/externalContacts', {
      rootPath: '2api',
      urlParams: {
        organization,
        exchange: serviceName,
      },
      params,
    });
  };

  this.getContactOptions = function (organization, serviceName) {
    return OvhHttp.get('/email/pro/{exchange}/domain', {
      rootPath: 'apiv6',
      urlParams: {
        organization,
        exchange: serviceName,
      },
      params: {
        main: true,
        state: 'ok',
      },
    }).then(data => data.map(d => ({
      name: d,
      displayName: punycode.toUnicode(d),
      formattedName: punycode.toUnicode(d),
    })));
  };
});
