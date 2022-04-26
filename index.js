'use strict';

var plantumlEncoder = require('plantuml-encoder');
const relationsHandler = require('./lib/relations');
const servicesHandler = require('./lib/services');

module.exports = {
  settings: {
    plantumlServer: '//www.plantuml.com/',
    onlyLocal: false, // build schema from only local services
    type: 'class', // class, entity
    actionParams: false
  },

  methods: {
    fetchServicesWithActions() {
      return this.broker.call('$node.services', {
        withActions: true,
        onlyLocal: this.settings.onlyLocal,
      });
    },

    getServiceNameMap(services) {
      const serviceNameMap = new Map();
      services.forEach((service, index) => serviceNameMap.set(servicesHandler(service).getName(), servicesHandler(service).getUniqueNameWithPackage(index)));

      return serviceNameMap;
    },

    async generateSchema() {
      const schema = [];
      schema.push('@startuml')

      // avoid problems with angled crows feet
      // schema.push('skinparam linetype ortho');

      const services = await this.fetchServicesWithActions();
      const servicesFiltered = services.filter(service => servicesHandler(service).shouldInclude())

      const serviceNameMap = this.getServiceNameMap(servicesFiltered);

      const serviceSchemas = servicesFiltered
            .map(service => servicesHandler(service).getSchema(serviceNameMap, this.settings))
      schema.push(serviceSchemas.join('\n\n'))

      const serviceRelationsSchemas = servicesFiltered
            .map(service => relationsHandler(service).getSchema(serviceNameMap))
      schema.push(serviceRelationsSchemas.join('\n\n'))

      schema.push('@enduml')

      return schema.join('\n');
    },
  },

  actions: {
    generate: {
      params: {
        output: {
          type: 'enum',
          values: ['png', 'svg', 'txt', 'source'],
          default: 'png',
        },
      },

      async handler(ctx) {
        const schema = await this.generateSchema();

        if (ctx.params.output === 'source') {
          ctx.meta.$responseType = 'text';
          return schema;
        }

        ctx.meta.$responseType = 'text/html';
        const encoded = plantumlEncoder.encode(schema);
        const url = this.settings.plantumlServer + 'plantuml/svg/' + encoded;
        return `<img src="${url}" />`;
      },
    },
  },
};
