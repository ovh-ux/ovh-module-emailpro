angular
  .module('emailproServices')
  .service('emailproService', class {
    constructor(
      $cacheFactory,
      $q,
      $stateParams,

      OvhHttp,

      EMAILPRO_SERVICE,
    ) {
      this.$cacheFactory = $cacheFactory;
      this.$q = $q;
      this.$stateParams = $stateParams;

      this.OvhHttp = OvhHttp;

      this.EMAILPRO_SERVICE = EMAILPRO_SERVICE;

      this.cache = $cacheFactory(EMAILPRO_SERVICE.CACHE_FACTORY_NAME);
    }

    resetCache() {
      this.cache.removeAll();
    }

    async fetchingIsServiceMXPlan() {
      const serviceIsMXPlanCurrentValue = this.cache
        .get(this.EMAILPRO_SERVICE.CACHE_SERVICE_IS_MX_PLAN_NAME);

      if (_.isBoolean(serviceIsMXPlanCurrentValue)) {
        return serviceIsMXPlanCurrentValue;
      }

      try {
        await this.OvhHttp
          .get(
            `/email/pro/${this.$stateParams.productId}/billingMigrated`,
            {
              rootPath: 'apiv6',
            },
          );

        this.cache.put(
          this.EMAILPRO_SERVICE.CACHE_SERVICE_IS_MX_PLAN_NAME,
          false,
        );
        return false;
      } catch (err) {
        this.cache.put(
          this.EMAILPRO_SERVICE.CACHE_SERVICE_IS_MX_PLAN_NAME,
          true,
        );
        return true;
      }
    }
  });
