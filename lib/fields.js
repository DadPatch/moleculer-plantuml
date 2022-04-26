const utils = require('./utils');

const visibilityValuesByKey = {
  true: '-',
  byDefault: '#',
  default: '+'
}

module.exports = function(fields = []) {
  return {
    getKeys() { return Object.keys(utils.itemsToObjects(fields)); },

    setField(field) {
      const getValue = () => utils.itemsToObjects(fields)[field] || {};

      const value = utils.parseShortHand(getValue());
      const isExists = Object.keys(value).length > 0;
      const isStatic = () => !!(value.primaryKey);
      const getName = () => field;
      const getType = () => value.type || false;
      const isRequired = () => value.required || false;
      const getVisibilitySign = () => isExists ? (visibilityValuesByKey[value.hidden] || visibilityValuesByKey.default) : false;

      return {
        getPopulate() {
          if (!value.populate) return false;
          if (typeof value.populate === "string") return { action: value.populate };
          return value.populate;
        },
        shouldInclude() { return !isExists || !value.virtual; },
        getSchema() {
          const fieldType = getType();
          const fieldVisibilitySign = getVisibilitySign();

          let displayName = getName();

          if (isRequired()) {
            displayName += '*';
          }

          if (fieldVisibilitySign) {
            displayName = `${fieldVisibilitySign} ${displayName}`;
          }

          if (fieldType) {
            displayName = `${displayName} : ${fieldType}`;
          }

          const staticSchema = isStatic() ? ' {static}' : '';
          return `{field}${staticSchema} ${displayName}`;
        }
      }
    },

    getSchema() {
      const fieldsKeys = this.getKeys();
      if (!Array.isArray(fieldsKeys) || !fieldsKeys.length) return [];
      return fieldsKeys.filter(field => this.setField(field).shouldInclude()).map(field => this.setField(field).getSchema());
    },

    getPopulateFields() { 
      const fieldsKeys = this.getKeys();
      if (!Array.isArray(fieldsKeys) || !fieldsKeys.length) return {};

      return fieldsKeys.filter(field => this.setField(field).getPopulate()).reduce((acc, field) => {
        acc[field] = (this.setField(field).getPopulate().action || '').split('.').slice(0, -1).join('.');
        return acc;
      }, {});
    },

  }
}