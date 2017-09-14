angular
    .module("Module.emailpro.services")
    .service("EmailProExternalContacts", class EmailProExternalContacts {
        constructor (EmailPro, OvhHttp) {
            this.EmailPro = EmailPro;
            this.OvhHttp = OvhHttp;
        }

        isAccountValid (account) {
            if (!account || !this.EmailPro.isEmailValid(account.externalEmailAddress)) {
                return false;
            } else if (account.firstName &&
                account.firstName.length > 64) {
                return false;
            } else if (account.lastName &&
                account.lastName.length > 64) {
                return false;
            } else if (!account.displayName ||
                account.displayName.length === 0) {
                return false;
            } else if (account.displayName &&
                account.displayName.length > 255) {
                return false;
            }
            return true;
        }

        removeContact (organization, serviceName, contactId) {
            return this.OvhHttp
                .delete("/email/pro/{exchange}/externalContact/{externalEmailAddress}", {
                    rootPath: "apiv6",
                    urlParams: {
                        organization,
                        exchange: serviceName,
                        externalEmailAddress: contactId
                    }
                })
                .then((data) => {
                    this.EmailPro.resetTabExternalContacts();
                    return data;
                });
        }

        modifyContact (organization, serviceName, externalEmailAddress, modifiedContact) {
            modifiedContact.state = _.camelCase(modifiedContact.state);

            return this.OvhHttp
                .put("/email/pro/{serviceName}/externalContact/{externalEmailAddress}", {
                    rootPath: "apiv6",
                    urlParams: {
                        organization,
                        serviceName,
                        externalEmailAddress
                    },
                    data: modifiedContact
                })
                .then((data) => {
                    this.EmailPro.resetTabExternalContacts();
                    return data;
                });
        }

        addingContact (organization, serviceName, newContact) {
            return this.OvhHttp
                .post("/email/pro/{serviceName}/externalContact", {
                    rootPath: "apiv6",
                    urlParams: {
                        organization,
                        serviceName
                    },
                    data: newContact
                })
                .then((data) => {
                    this.EmailPro.resetTabExternalContacts();
                    return data;
                });
        }

        retrievingContacts (organization, serviceName, count, offset, search) {
            return this.OvhHttp
                .get("/sws/emailpro/{serviceName}/externalContacts", {
                    rootPath: "2api",
                    urlParams: {
                        organization,
                        serviceName
                    },
                    params: {
                        count,
                        offset,
                        search
                    }
                });
        }

        getContactOptions (organization, serviceName) {
            return this.OvhHttp
                .get("/email/pro/{serviceName}/domain", {
                    rootPath: "apiv6",
                    urlParams: {
                        organization,
                        serviceName
                    },
                    params: {
                        main: true,
                        state: "ok"
                    }
                })
                .then((data) =>
                    data.map((d) => ({
                        name: d,
                        displayName: punycode.toUnicode(d),
                        formattedName: punycode.toUnicode(d)
                    }))
                );
        }
    });
