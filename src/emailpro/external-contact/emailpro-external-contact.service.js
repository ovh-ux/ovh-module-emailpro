angular
    .module("Module.emailpro.services")
    .service("EmailProExternalContacts", class EmailProExternalContacts {
        constructor (EmailPro, OvhHttp) {
            this.EmailPro = EmailPro;
            this.OvhHttp = OvhHttp;
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

        updatingContact (serviceName, externalEmailAddress, updatedContact) {
            updatedContact.state = _.camelCase(updatedContact.state);

            return this.OvhHttp
                .put("/email/pro/{serviceName}/externalContact/{externalEmailAddress}", {
                    rootPath: "apiv6",
                    urlParams: {
                        serviceName,
                        externalEmailAddress
                    },
                    data: updatedContact
                })
                .then((data) => {
                    this.EmailPro.resetTabExternalContacts();
                    return data;
                });
        }

        addingContact (serviceName, newContact) {
            return this.OvhHttp
                .post("/email/pro/{serviceName}/externalContact", {
                    rootPath: "apiv6",
                    urlParams: {
                        serviceName
                    },
                    data: newContact
                })
                .then((data) => {
                    this.EmailPro.resetTabExternalContacts();
                    return data;
                });
        }

        retrievingContacts (serviceName, count, offset, search) {
            return this.OvhHttp
                .get("/sws/emailpro/{serviceName}/externalContacts", {
                    rootPath: "2api",
                    urlParams: {
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
