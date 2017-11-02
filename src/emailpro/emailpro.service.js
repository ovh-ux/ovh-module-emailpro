/* eslint-disable consistent-this */
angular.module("Module.emailpro.services").service("EmailPro", [
    "$rootScope",
    "Products",
    "$http",
    "$q",
    "constants",
    "$cacheFactory",
    "OvhHttp",
    function ($rootScope, Products, $http, $q, constants, cache, OvhHttp) {
        "use strict";

        const tasksCache = cache("UNIVERS_WEB_EMAIL_PRO_TASKS");
        const delegationRightsCache = cache("UNIVERS_WEB_EMAIL_PRO_DELEGATION_RIGHTS");
        const disclaimersCache = cache("UNIVERS_WEB_EMAIL_PRO_DISCLAIMERS");
        const requests = {
            exchangeDetails: null
        };
        const that = this;

        this.exchangeCache = cache("UNIVERS_WEB_EMAIL_PRO");
        this.domainsCache = cache("UNIVERS_WEB_EMAIL_PRO_DOMAINS");
        this.accountsCache = cache("UNIVERS_WEB_EMAIL_PRO_ACCOUNTS");
        this.sharedAccountsCache = cache("UNIVERS_WEB_EMAIL_PRO_SHARED_ACCOUNTS");
        this.resourcesCache = cache("UNIVERS_WEB_EMAIL_PRO_RESOURCES");
        this.groupsCache = cache("UNIVERS_WEB_EMAIL_PRO_GROUPS");
        this.publicFolderCache = cache("UNIVERS_WEB_EMAIL_PRO_PUBLIC_FOLDERS");

        this.updateAccountAction = "UPDATE_ACCOUNT";
        this.changePasswordAction = "CHANGE_PASSWORD";

        this.noSecurityOption = "NONE";

        this.accountTypeDedicated = "DEDICATED";
        this.accountTypeHosted = "HOSTED";
        this.accountTypeProvider = "PROVIDER";
        this.nicBill = "BILLING";
        this.nicAdmin = "ADMIN";
        this.nicTech = "TECH";
        this.EmailPro2010Code = 14;
        this.EmailPro2013Code = 15;

        this.stateCreating = "CREATING";
        this.stateDeleting = "DELETING";
        this.stateReopening = "REOPENING";
        this.stateSuspended = "SUSPENDED";
        this.stateSuspending = "SUSPENDING";
        this.stateOk = "OK";
        this.stateTaskDoing = "TASK_ON_DOING";

        this.aliasMaxLimit = 1000;

        /*
         * Private function to reset the cache
         */
        function resetCache (key) {
            if (key !== undefined) {
                if (requests[key] !== undefined) {
                    requests[key] = null;
                }
                that.exchangeCache.remove(key);
            } else {
                that.exchangeCache.removeAll();
                that.domainsCache.removeAll();
                that.accountsCache.removeAll();
                that.sharedAccountsCache.removeAll();
                tasksCache.removeAll();
                delegationRightsCache.removeAll();
                that.groupsCache.removeAll();
                that.resourcesCache.removeAll();
                that.publicFolderCache.removeAll();
                disclaimersCache.removeAll();
                for (const request in requests) {
                    if (requests.hasOwnProperty(request)) {
                        requests[request] = null;
                    }
                }
            }
        }

        this.resetDomains = function () {
            that.domainsCache.removeAll();
            $rootScope.$broadcast(that.events.domainsChanged);
        };

        this.resetAccounts = function () {
            that.accountsCache.removeAll();
            $rootScope.$broadcast(that.events.accountsChanged);
        };

        this.resetSharedAccounts = function () {
            that.sharedAccountsCache.removeAll();
            $rootScope.$broadcast(that.events.sharedAccountsChanged);
        };

        this.resetTasks = function () {
            tasksCache.removeAll();
            $rootScope.$broadcast(that.events.tasksChanged);
        };

        function resetDelegationRights () {
            delegationRightsCache.removeAll();
            $rootScope.$broadcast(that.events.delegationRightsChanged);
        }

        this.resetResources = function () {
            that.resourcesCache.removeAll();
            $rootScope.$broadcast(that.events.resourcesChanged);
        };

        this.resetGroups = function () {
            that.groupsCache.removeAll();
            $rootScope.$broadcast(that.events.groupsChanged);
        };

        function resetDisclaimers () {
            disclaimersCache.removeAll();
            $rootScope.$broadcast(that.events.disclaimersChanged);
        }

        this.resetPublicFolder = function () {
            that.publicFolderCache.removeAll();
            $rootScope.$broadcast(that.events.publicFoldersChanged);
        };

        this.resetTabExternalContacts = function () {
            $rootScope.$broadcast(that.events.externalcontactsChanged);
        };

        this.getSuccessDataOrReject = function (response) {
            return response.status < 300 ? response.data : $q.reject(response);
        };

        /* eslint-disable prefer-rest-params */
        this.url = function (parts) {
            return (angular.isArray(parts) ? parts : Array.prototype.slice.call(arguments)).join("/");
        };
        /* eslint-enable prefer-rest-params */

        this.basePath = function () {
            return `${constants.swsRootPath}emailpro`;
        };

        this.isEmailValid = function (email) {
            return email && email.match(/^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2}(?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/);
        };

        this.events = {
            domainsChanged: "emailpro.domains.changed",
            accountsChanged: "emailpro.accounts.changed",
            tasksChanged: "emailpro.tasks.changed",
            delegationRightsChanged: "emailpro.delegationRights.changed",
            groupsChanged: "emailpro.groups.changed",
            disclaimersChanged: "emailpro.disclaimers.changed",
            externalcontactsChanged: "emailpro.tabs.externalcontacts.changed"
        };

        /**
         * Get Selected EmailPro
         */
        this.getSelected = function (forceRefresh) {
            if (forceRefresh === true) {
                resetCache();
            }
            return Products.getSelectedProduct(true).then((product) => {
                if (product) {
                    const selectedEmailPro = that.exchangeCache.get("exchange");
                    if (!selectedEmailPro) {
                        if (requests.exchangeDetails === null) {
                            requests.exchangeDetails = OvhHttp.get("/sws/emailpro/{exchange}", {
                                rootPath: "2api",
                                urlParams: {
                                    exchange: product.name
                                }
                            }).then((result) => {
                                that.exchangeCache.put("exchange", result);
                            });
                        }
                        return requests.exchangeDetails;
                    }
                    return selectedEmailPro;

                }
                return $q.reject(product);

            }).then(() => that.exchangeCache.get("exchange"), (reason) => $q.reject(reason));
        };

        this.getModels = function () {
            return OvhHttp.get("/email/pro.json", {
                rootPath: "apiv6"
            }).then((data) => data.models);
        };

        this.getEmailProServer = function (organization, name) {
            return OvhHttp.get("/email/pro/{exchangeService}/server", {
                rootPath: "apiv6",
                urlParams: {
                    exchangeService: name
                }
            }).then(that.getSuccessDataOrReject);
        };

        /**
         * Return the last 2 days task list for the selected exchange
         */
        this.getTasks = function (serviceName, pageSize, offset) {
            return OvhHttp.get("/sws/emailpro/{exchange}/tasks", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    count: pageSize || 10,
                    offset: offset || 0
                }
            });
        };

        /**
         * Return paginated exchange accounts list
         * @param pageSize - the size of page([10, 20, 40])
         * @param offset - page index
         * @param search - filter over primaryEmail value
         * @param configurableOnly - Integer value: "0" to get all, "1" to filter out dummy accounts and creating/deleting ones
         */
        this.getAccounts = function (pageSize, offset, search, configurableOnly, type, timeout) {
            return this.getSelected()
                .then((exchange) => that.getAccountsForEmailPro(exchange, that.accountsCache, pageSize, offset, search, configurableOnly, type, timeout));
        };

        /**
         * Return paginated accounts list for the specified exchange.
         * @param exchange - an object describing exchange service we want the accounts of. Use this.getSelected() for the currently selected exchange service
         * @param cache - the cache to use. If getting for the selected exchange, use this.accountsCache.
         * @param pageSizeParam - the size of page([10, 20, 40])
         * @param offsetParam - page index
         * @param searchParam - filter over primaryEmail value
         * @param configurableOnlyParam - Integer value: "0" to get all, "1" to filter out dummy accounts and creating/deleting ones
         */
        this.getAccountsForEmailPro = function (exchange, cache, pageSizeParam, offsetParam, searchParam, configurableOnlyParam, typeParam, timeout) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            const configurableOnly = configurableOnlyParam || 0;
            const type = typeParam || "";

            return OvhHttp.get("/sws/emailpro/{exchange}/accounts", {
                rootPath: "2api",
                urlParams: {
                    exchange: exchange.domain
                },
                params: {
                    count: pageSize,
                    offset,
                    search,
                    configurableOnly,
                    typeLicence: type
                },
                timeout
            });
        };

        /**
         * Return paginated exchange accounts list
         * @param serviceName - Name of the service
         * @param pageSizeParam - the size of page([10, 20, 40])
         * @param offsetParam - page index
         * @param searchParam - filter over primaryEmail value
         * @param configurableOnlyParam - Integer value: "0" to get all, "1" to filter out dummy accounts and creating/deleting ones
         */
        this.getAccountsAndContacts = function (serviceName, pageSizeParam, offsetParam, searchParam, configurableOnlyParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            const configurableOnly = configurableOnlyParam || 0;
            return OvhHttp.get("/sws/emailpro/{exchange}/accounts/contacts", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    count: pageSize,
                    offset,
                    search,
                    configurableOnly
                }
            });
        };

        /**
         * Data necessary for new account creation
         */
        this.getNewAccountOptions = function (serviceName) {
            return OvhHttp.get("/sws/emailpro/{exchange}/accounts/options", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                }
            });
        };

        /**
         * Add a new EmailPro account
         */
        this.addEmailProAccount = function (serviceName, accountToAdd) {
            // Format from play to api
            const data = angular.copy(accountToAdd);
            data.license = _.camelCase(data.accountLicense);
            delete data.accountLicense;
            data.outlookLicense = _.camelCase(data.outlook);
            delete data.outlook;
            data.SAMAccountName = _.camelCase(data.samaccountName);
            delete data.samaccountName;
            delete data.passwordConfirmation;
            data.displayName = data.displayName ? data.displayName.trim() : "";
            return OvhHttp.post("/email/pro/{exchange}/account", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName
                },
                data
            }).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Get order list
         */
        this.getOrderList = function (serviceName) {
            return OvhHttp.get("/sws/emailpro/{exchange}/accounts/orders", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                }
            });
        };

        /**
         * Order new EmailPro accounts
         */
        this.orderAccounts = function (serviceName, accountsToAdd) {
            // From play to apiv6
            const data = angular.copy(accountsToAdd);
            data.number = data.accountsNumber;
            delete data.accountsNumber;
            const duration = data.duration;
            delete data.duration;
            delete data.accountLicense;
            return OvhHttp.post("/order/email/pro/{exchange}/account/{duration}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    duration
                },
                data
            }).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return data;
            });
        };

        this.updateAccount = function (serviceName, account) {
            const accountToUpdate = angular.copy(account);
            accountToUpdate.outlookLicense = accountToUpdate.outlook;
            delete accountToUpdate.outlook;
            accountToUpdate.deleteOutlookAtExpiration = accountToUpdate.deleteOutlook;
            delete accountToUpdate.deleteOutlook;

            accountToUpdate.displayName = account.displayName ? account.displayName.trim() : undefined;
            const password = accountToUpdate.password;
            delete accountToUpdate.password;
            if (accountToUpdate.accountLicense) {
                accountToUpdate.accountLicense = _.camelCase(accountToUpdate.accountLicense);
            }
            const promises = [
                OvhHttp.put("/email/pro/{exchange}/account/{primaryEmailAddress}", {
                    rootPath: "apiv6",
                    urlParams: {
                        exchange: serviceName,
                        primaryEmailAddress: account.primaryEmailAddress
                    },
                    data: accountToUpdate
                }).then(() => ({
                    code: null,
                    id: account.primaryEmailAddress,
                    message: "UPDATE_ACCOUNT",
                    type: "INFO"
                }))
            ];

            if (password) {
                promises.push(OvhHttp.post("/email/pro/{exchange}/account/{primaryEmailAddress}/changePassword", {
                    rootPath: "apiv6",
                    urlParams: {
                        exchange: serviceName,
                        primaryEmailAddress: account.primaryEmailAddress
                    },
                    data: {
                        password
                    }
                }).then(() => ({
                    code: null,
                    id: account.primaryEmailAddress,
                    message: "CHANGE_PASSWORD",
                    type: "INFO"
                })));
            }
            return $q.all(promises).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return {
                    messages: data,
                    state: data.filter((message) => message.type === "ERROR").length > 0 ? "ERROR" : "OK"
                };
            });
        };

        this.updateRenew = function (serviceName, accounts) {
            return OvhHttp.put("/sws/emailpro/{exchange}/accounts/renew", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                data: {
                    modelList: accounts
                }
            });
        };

        /**
         * Delete account
         */
        this.removeAccount = function (serviceName, primaryEmail) {
            return OvhHttp.delete("/email/pro/{exchange}/account/{primaryEmailAddress}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    primaryEmailAddress: primaryEmail
                }
            }).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Get EmailPro accounts delegation rights
         */
        this.getAccountDelegationRight = function (serviceName, account, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            return OvhHttp.get("/sws/emailpro/{exchange}/accounts/{account}/rights", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName,
                    account
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Set EmailPro accounts delegation rights
         */
        this.updateAccountDelegationRights = function (serviceName, model) {
            return OvhHttp.post("/sws/emailpro/{exchange}/accounts/{account}/rights-update", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName,
                    account: model.account
                },
                data: {
                    sendRights: model.sendRights,
                    fullAccessRights: model.fullAccessRights,
                    sendOnBehalfRights: model.sendOnBehalfToRights
                }
            }).then((response) => {
                resetDelegationRights();
                that.resetTasks();
                return response;
            });
        };

        /**
         * Get EmailPro accounts aliases
         */
        this.getAliases = function (serviceName, account, pageSizeParam, offsetParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            return OvhHttp.get("/sws/emailpro/{exchange}/accounts/{account}/alias", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName,
                    account
                },
                params: {
                    count: pageSize,
                    offset
                }
            });
        };

        /**
         * Data necessary for new alias creation
         */
        this.getNewAliasOptions = function (serviceName, emailParam, type) {
            const email = emailParam || null;
            return OvhHttp.get("/sws/emailpro/{exchange}/aliasOptions", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    emailAddress: email,
                    subType: type
                }
            }).then((data) => {
                resetCache();
                return data;
            });
        };

        /**
         * Add an account alias
         */
        this.addAlias = function (serviceName, account, aliasModel) {
            const completeAlias = `${aliasModel.alias}@${aliasModel.domain.name}`;
            return OvhHttp.post("/email/pro/{exchange}/account/{primaryEmailAddress}/alias", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    primaryEmailAddress: account
                },
                data: {
                    alias: completeAlias
                }
            }).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Delete an account alias
         */
        this.deleteAlias = function (serviceName, account, alias) {
            return OvhHttp.delete("/email/pro/{exchange}/account/{primaryEmailAddress}/alias/{alias}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    primaryEmailAddress: account,
                    alias
                }
            }).then((data) => {
                that.resetAccounts();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Get groups this EmailPro account belongs to
         */
        this.getGroups = function (serviceName, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            return OvhHttp.get("/sws/emailpro/{exchange}/groups", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Get EmailPro mailing list delegation rights
         */
        this.getMailingListDelegationRights = function (serviceName, mailinglist, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;

            return OvhHttp.get("/sws/emailpro/{exchange}/groups/{mailinglist}/rights", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName,
                    mailinglist
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Set EmailPro mailing list delegation rights
         */
        this.updateMailingListDelegationRights = function (serviceName, model) {
            return OvhHttp.put("/sws/emailpro/{exchange}/groups/{mailinglist}/rights-update", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName,
                    mailinglist: model.account
                },
                data: {
                    sendRights: model.sendRights,
                    sendOnBehalfRights: model.sendOnBehalfToRights
                }
            }).then((response) => {
                resetDelegationRights();
                that.resetTasks();
                return response;
            });
        };

        /**
         * Delete an EmailPro mailing list (group)
         */
        this.deleteGroup = function (serviceName, groupName) {
            return OvhHttp.delete("/email/pro/{exchange}/mailingList/{mailingListAddress}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName
                }
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Data options for new group creation
         */
        this.getNewGroupOptions = function (serviceName) {
            return $q.all({
                models: this.getModels(),
                options: OvhHttp.get("/email/pro/{exchange}/domain", {
                    rootPath: "apiv6",
                    urlParams: {
                        exchange: serviceName
                    },
                    params: {
                        state: "ok"
                    }
                })
            }).then((data) => ({
                availableDepartRestrictions: data.models["email.exchange.MailingListDepartRestrictionEnum"].enum.map((m) => _.snakeCase(m).toUpperCase()),
                availableDomains: data.options.map((domain) => ({
                    name: domain,
                    displayName: punycode.toUnicode(domain),
                    formattedName: punycode.toUnicode(domain)
                })),
                availableJoinRestrictions: data.models["email.exchange.MailingListJoinRestrictionEnum"].enum.map((m) => _.snakeCase(m).toUpperCase())
            }));
        };

        /**
         * Get accounts by group
         */
        this.getAccountsByGroup = function (serviceName, groupName, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            return OvhHttp.get("/sws/emailpro/{exchange}/groups/{mailinglist}/accounts", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName,
                    mailinglist: groupName
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Get managers by group
         */
        this.getManagersByGroup = function (serviceName, groupName, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            return OvhHttp.get("/sws/emailpro/{exchange}/groups/{mailinglist}/managers", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName,
                    mailinglist: groupName
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Get managers by group
         */
        this.getMembersByGroup = function (serviceName, groupName, pageSizeParam, offsetParam, searchParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;
            const search = searchParam || undefined;
            return OvhHttp.get("/sws/emailpro/{exchange}/groups/{mailinglist}/members", {
                rootPath: "2api",
                clearCache: true,
                urlParams: {
                    exchange: serviceName,
                    mailinglist: groupName
                },
                params: {
                    count: pageSize,
                    offset,
                    search
                }
            });
        };

        /**
         * Add a new EmailPro group (mailing list)
         */
        this.addEmailProGroup = function (serviceName, groupToAdd) {
            return OvhHttp.post("/sws/emailpro/{exchange}/groups-add", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                data: groupToAdd
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Remove an EmailPro group manager
         */
        this.removeManager = function (serviceName, groupName, accountId) {
            return OvhHttp.delete("/email/pro/{exchange}/mailingList/{mailingListAddress}/manager/account/{managerAccountId}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName,
                    managerAccountId: accountId
                }
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Remove an EmailPro group member
         */
        this.removeMember = function (serviceName, groupName, accountId, type) {
            let url = "/email/pro/{exchange}/mailingList/{mailingListAddress}/member";
            switch (type) {
            case "ACCOUNT":
                url += "/account/{accountId}";
                break;
            case "CONTACT":
                url += "/contact/{accountId}";
                break;
            default:
            }
            return OvhHttp.delete(url, {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName,
                    accountId
                }
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        this.updateGroup = function (serviceName, groupName, groupModel) {
            return OvhHttp.put("/sws/emailpro/{exchange}/groups/{group}/update", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName,
                    group: groupName
                },
                data: groupModel
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Get group aliases
         */
        this.getGroupAliasList = function (serviceName, groupName, pageSizeParam, offsetParam) {
            const pageSize = pageSizeParam !== undefined ? pageSizeParam : 10;
            const offset = offsetParam || 0;

            return OvhHttp.get("/sws/emailpro/{exchange}/group/{group}/alias", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName,
                    group: groupName
                },
                params: {
                    count: pageSize,
                    offset
                }
            });
        };

        /**
         * Add a group alias
         */
        this.addGroupAlias = function (serviceName, groupName, aliasModel) {
            const completeAlias = `${aliasModel.alias}@${aliasModel.domain.name}`;
            return OvhHttp.post("/email/pro/{exchange}/mailingList/{mailingListAddress}/alias", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName
                },
                data: {
                    alias: completeAlias
                }
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Delete a group alias
         */
        this.deleteGroupAlias = function (serviceName, groupName, alias) {
            return OvhHttp.delete("/email/pro/{exchange}/mailingList/{mailingListAddress}/alias/{alias}", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    mailingListAddress: groupName,
                    alias
                }
            }).then((data) => {
                that.resetGroups();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Return disclaimers list for a given EmailPro service
         */
        this.getDisclaimers = function (serviceName, pageSizeParam, offsetParam) {
            const pageSize = pageSizeParam || 10;
            const offset = offsetParam || 0;
            return OvhHttp.get("/sws/emailpro/{exchange}/disclaimers", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    count: pageSize,
                    offset
                }
            });
        };

        /**
         * Return new disclaimer options
         */
        this.getNewDisclaimerOptions = function (serviceName) {
            return OvhHttp.get("/sws/emailpro/{exchange}/disclaimers/new/options", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                }
            });
        };

        /**
         * Return update disclaimer options
         */
        this.getUpdateDisclaimerOptions = function () {
            return $q.when({
                availableDomains: [],
                availableAttributes: [
                    "City",
                    "Country",
                    "Department",
                    "DisplayName",
                    "Email",
                    "FaxNumber",
                    "FirstName",
                    "HomePhoneNumber",
                    "Initials",
                    "LastName",
                    "MobileNumber",
                    "Office",
                    "PhoneNumber",
                    "Street",
                    "ZipCode"
                ]
            });
        };

        /**
         * Save an EmailPro disclaimer
         */
        this.saveDisclaimer = function (serviceName, model) {
            return OvhHttp.post("/email/pro/{exchange}/domain/{domainName}/disclaimer", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    domainName: model.domain
                },
                data: {
                    content: model.content,
                    outsideOnly: model.externalEmailsOnly
                }
            }).then((data) => {
                resetDisclaimers();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Save an EmailPro disclaimer
         */
        this.updateDisclaimer = function (serviceName, model) {
            return OvhHttp.put("/email/pro/{exchange}/domain/{domainName}/disclaimer", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    domainName: model.domain
                },
                data: {
                    content: model.content,
                    outsideOnly: model.externalEmailsOnly
                }
            }).then((data) => {
                resetDisclaimers();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Delete an EmailPro mailing list (group)
         */
        this.deleteDisclaimer = function (serviceName, domain) {
            return OvhHttp.delete("/email/pro/{exchange}/domain/{domainName}/disclaimer", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName,
                    domainName: domain
                }
            }).then((data) => {
                resetDisclaimers();
                that.resetTasks();
                return data;
            });
        };

        /**
         * Get exchange license history
         */
        this.getEmailProLicenseHistory = function (serviceName, period) {
            let fromDate = moment();
            switch (period) {
            case "LASTWEEK":
                fromDate = moment().subtract(1, "weeks");
                break;
            case "LASTMONTH":
                fromDate = moment().subtract(1, "months");
                break;
            case "LAST3MONTHS":
                fromDate = moment().subtract(3, "months");
                break;
            case "LASTYEAR":
                fromDate = moment().subtract(1, "year");
                break;
            default:
            }

            return OvhHttp.get("/email/pro/{exchange}/license", {
                rootPath: "apiv6",
                urlParams: {
                    exchange: serviceName
                },
                params: {
                    fromDate: fromDate.toDate(),
                    toDate: new Date()
                }
            }).then((data) => {
                const series = [];
                const outlookSerie = {
                    name: "outlook",
                    data: []
                };

                data.forEach((d) => {
                    outlookSerie.data.push({
                        value: d.outlookQuantity,
                        time: moment(d.date)
                    });
                });

                outlookSerie.max = _.max(_.map(outlookSerie.data, "value"));
                series.push(outlookSerie);

                ["basic", "entreprise", "standard"].forEach((currentLicense) => {
                    data.forEach((d) => {
                        const time = moment(d.date);
                        let license = _.find(series, { name: currentLicense });
                        let exists = true;
                        if (!license) {
                            license = {
                                name: currentLicense,
                                typeee: currentLicense,
                                max: 0,
                                data: []
                            };
                            exists = false;
                        }

                        d.accountLicense.forEach((accountLicense) => {
                            if (accountLicense.license === currentLicense) {
                                license.data.push({
                                    value: accountLicense.licenseQuantity,
                                    time
                                });
                            }
                        });

                        license.max = _.max(_.map(license.data, "value"));

                        if (license.max > 0 && !exists) {
                            series.push(license);
                        }
                    });
                });

                const stats = {
                    periods: ["LASTWEEK", "LASTMONTH", "LAST3MONTHS", "LASTYEAR"],
                    series
                };

                return stats;
            });
        };

        /**
         * Update EmailPro resiliation conditions
         */
        this.updateDeleteAtExpiration = function (serviceName, renewType) {
            return OvhHttp.put("/sws/emailpro/{exchange}/deleteAtExpiration", {
                rootPath: "2api",
                urlParams: {
                    exchange: serviceName
                },
                data: renewType
            }).then((response) => {
                that.exchangeCache.removeAll();
                $rootScope.$broadcast("emailpro.dashboard.refresh");
                that.resetAccounts();
                that.resetTasks();
                return response;

                // return that.getSuccessDataOrReject(response);
            });
        };

        this.prepareForCsv = function (serviceName, opts, offset, timeout) {
            const queue = [];
            const self = this;
            return this.getAccounts(serviceName, opts.count, offset, opts.search, false, opts.filter, timeout).then((accounts) => {
                angular.forEach(accounts.list.results, (account) => {
                    if (account.aliases > 0) {
                        account.aliases = [];
                        queue.push(self.getAliases(serviceName, account.primaryEmailAddress, self.aliasMaxLimit).then((aliases) => {
                            angular.forEach(aliases.list.results, (alias) => {
                                account.aliases.push(alias.displayName);
                            });
                        }));
                    } else {
                        account.aliases = [];
                    }
                });
                return $q.all(queue).then(() => ({
                    accounts: accounts.list.results,
                    headers: _.keys(accounts.list.results[0])
                }), () => null);

            }, () => null);
        };

        this.getAccountIds = function (opts) {
            return OvhHttp.get("/email/pro/{exchangeService}/account", {
                rootPath: "apiv6",
                urlParams: {
                    exchangeService: opts.exchangeService
                },
                params: opts.params
            });
        };

        this.getAccount = function (opts) {
            return OvhHttp.get("/email/pro/{exchangeService}/account/{primaryEmailAddress}", {
                rootPath: "apiv6",
                urlParams: {
                    exchangeService: opts.exchangeService,
                    primaryEmailAddress: opts.primaryEmailAddress
                }
            });
        };

        this.getAliasIds = function (opts) {
            return OvhHttp.get("/email/pro/{exchangeService}/account/{primaryEmailAddress}/alias", {
                rootPath: "apiv6",
                urlParams: {
                    exchangeService: opts.exchangeService,
                    primaryEmailAddress: opts.primaryEmailAddress
                },
                params: opts.params
            });
        };

    }
]);
/* eslint-enable consistent-this */
