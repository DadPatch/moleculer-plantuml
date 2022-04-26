const fieldHandler = require('./fields');

const relationMap = {
  zeroOrOne: 'zero-or-one',
  one: 'one',
  zeroOrMany: 'zero-or-many',
  oneOrMany: 'one-or-many'
}
const leftMap = {
  [relationMap.zeroOrOne]: '|o',
  [relationMap.one]: '||',
  [relationMap.zeroOrMany]: '}o',
  [relationMap.oneOrMany]: '}|',
};

const rightMap = {
  [relationMap.zeroOrOne]: 'o|',
  [relationMap.one]: '||',
  [relationMap.zeroOrMany]: 'o{',
  [relationMap.oneOrMany]: '|{',
};

const nameMap = {
  [relationMap.zeroOrOne]: '0..1',
  [relationMap.one]: '1',
  [relationMap.zeroOrMany]: '0..*',
  [relationMap.oneOrMany]: '1..*',
};

const getRelation = (left, right, relation) => {
  const relationType = relation.includes('zero') ? '..' : '--';
  return `${leftMap[left]}${relationType}${rightMap[right]}`;
  // return `"${nameMap[left]}" ${leftMap[left]}${relationType}${rightMap[right]} "${nameMap[right]}"`;
}

module.exports = function(service) {

  const plantuml = service.settings?.plantuml || {};

  const hasRelations = !!(plantuml.relations);

  const parseShortHand = (relation, key = "type") => {
    if (typeof relation === "string" && key === "type") return relation;
    else if (typeof relation === "string") return false;
    return relation[key];
  }

  return {
    getSchema(serviceNameMap) {
      const schema = [];
      const sourceName = serviceNameMap.get(service.fullName);
      const relationFields = fieldHandler(service?.settings?.fields).getPopulateFields();

      const getSource = (target) => {
        if (!Object.keys(relationFields).length) return false;
        console.log(relationFields)
        const [source] = Object.entries(relationFields).find(([_, value]) => value === target) || [];
        return source || false;
      }

      if (!hasRelations) return '';
      
      const relations = plantuml.relations || {};
      for (const targetService in relations) {
        const relation = parseShortHand(relations[targetService]);
        const source = false //parseShortHand(relations[targetService], "field") || getSource(targetService) || false;
        getSource(targetService);
        if (serviceNameMap.has(targetService)) {
          const targetName = serviceNameMap.get(targetService);

          const [left, right] = relation.split('-to-');

          schema.push(`${sourceName} ${getRelation(left, right, relation)} ${targetName}`);
        }
      }

      return schema.join('\n');
    },
  }
}