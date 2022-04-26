const utils = require('./utils');

const visibilityValuesByKey = {
  private: '-',
  protected: '#',
  // published: '~',
  default: '+'
}


module.exports = function(actions) {
  return {
    getKeys() { return Object.keys(utils.itemsToObjects(actions)); },

    setAction(action) {
      const getValue = () => utils.itemsToObjects(actions)[action] || {};

      const value = getValue();
      const isExists = Object.keys(value).length > 0;
      const getStereotype = () => value.rest || false;
      const getName = () => value.rawName || action;
      const getVisibilitySign = () => isExists ? (visibilityValuesByKey[value.visibility] || visibilityValuesByKey.default) : false;
      const getParams = () => value.params;

      function getParamsSchema(params) {
        console.log(params);
        const schema = [];
        schema.push('{');
  
        const fields = [];

        const getParamFieldType = (field) => field.type;
  
        Object.keys(params).forEach(fieldKey => {
          if (fieldKey.indexOf('$$') === 0) {
            return;
          }
  
          const fieldType = getParamFieldType(params[fieldKey]);
          fields.push(`  ${fieldKey}${fieldType ? ' : ' + fieldType : ''},`);
        });
  
        schema.push(fields.join('\\n'));
  
        schema.push('}');
        return schema.join('\\n');
      }

      return {
        getSchema(appendActionParams = false) {
          const actionVisibility = getVisibilitySign();
          const actionStereotype = getStereotype();
          const actionParams = getParams();
          
          let displayName = getName();

          if (actionVisibility) {
            displayName = `${actionVisibility} ${displayName}`
          }

          displayName = `{method} ${displayName}(`;
          if (appendActionParams && actionParams) {
            displayName += `params: `;
            displayName += getParamsSchema(actionParams);
          }
          displayName += ')';

          if (actionStereotype) {
            displayName = `${displayName} ${appendActionParams ? '\\n' : ''}<<${actionStereotype}>>`
          }

          return displayName;
        },
      }
    },

    getSchema(appendActionParams = false) {
      const actionsKeys = this.getKeys();
      if (!Array.isArray(actionsKeys) || !actionsKeys.length) return [];

      return actionsKeys.map(action => this.setAction(action).getSchema(appendActionParams));
    },
  }
}