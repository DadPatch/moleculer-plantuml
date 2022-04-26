const fieldsHandler = require('./fields');
const actionsHandler = require('./actions');

module.exports = function(service) {
  return {
    getStereotype() { return service?.settings?.rest; },
    getName() { return service?.fullName },
    getFieldsHandler() { return fieldsHandler(service?.settings?.fields); },
    getActionsHandler() { return actionsHandler(service?.actions); },
    shouldInclude() { return !!(this.getFieldsHandler().getKeys().length || service?.settings?.plantuml); },
    getPackage() { return false; },
    getUniqueNameWithPackage(index) { return this.getPackage() ? `${this.getPackage()}.service${index}` : `service${index}`; },
    getSchema(serviceNameMap, settings = {}) {
      const schema = [];
      const uniqueName = serviceNameMap.get(service.fullName);

      const stereotype = this.getStereotype() ? ` <<${this.getStereotype()}>>` : '';
      schema.push(`${settings.type} "${this.getName()}" as ${uniqueName}${stereotype} {`);

      const fieldsSchemas = this.getFieldsHandler().getSchema();
      if (fieldsSchemas && fieldsSchemas.length) {
        schema.push(fieldsSchemas.join('\n'));
      }

      const actionsSchemas = this.getActionsHandler().getSchema(settings.actionParams);
      if (actionsSchemas && actionsSchemas.length) {
        schema.push(actionsSchemas.join(`${settings.actionParams ? '\\n' : ''}\n`));
      }

      schema.push(`}`);

      return schema.join('\n');
    },
  }
}