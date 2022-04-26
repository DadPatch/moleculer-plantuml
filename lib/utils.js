const Validator = require("fastest-validator");
const validator = new Validator({
	useNewCustomCheckerFunction: true
});

module.exports = {
  itemsToObjects: (items) => {
    if (Array.isArray(items)) {
      return items.reduce((acc, item) => {
        if (typeof item === "string") acc[item] = {}
        else acc[item.name] = item;
        return acc;
      }, {})
    } else if (typeof items === "object") return items
    
    return {}
  },

  parseShortHand: (value) => {
    if (value === false) return {};
    else if (value === true) return { type: "any" };
    else if (typeof value === "string") return validator.parseShortHand(value);
    return value;
  }
}