/**
 * Order data for a alphabetized list.
 * @param {Array} data The data to order
 * @param {String} key The key to order the data by
 */
function organizeListData(data, key) {
  if (!key) key = 'name';
  data = data.sort((a, b) => compare(a, b, key));
  var orderedData = {};
  for (var i of data) {
    if (!i[key]) continue;
    var c = i[key][0].toUpperCase();
    if (!orderedData[c]) orderedData[c] = [];
    orderedData[c].push(i);
  }
  return orderedData;
}

function compare(a, b, key) {
  const keyA = a[key].toUpperCase();
  const keyB = b[key].toUpperCase();

  let comparison = 0;
  if (keyA > keyB) {
    comparison = 1;
  } else if (keyA < keyB) {
    comparison = -1;
  }

  return comparison;
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validateField(rule, val) {
  if (rule.type == 'empty') {
    if (typeof val === 'undefined' || val === null || val.length == 0)
      return false;
  } else if (rule.type == 'minLength') {
    if (
      typeof val === 'undefined' ||
      val === null ||
      val.length < (rule.value || 1)
    )
      return false;
  } else if (rule.type == 'maxLength') {
    if (rule.value && val && val.length > rule.value) return false;
  } else if (rule.type == 'email') {
    if (typeof val === 'undefined' || !validateEmail(val)) return false;
  } else if (rule.type == 'equals') {
    if (val != rule.value) return false;
  }
  return true;
}

function validateForm(obj, rules) {
  for (var i in rules) {
    var val = obj[i];
    if (Array.isArray(rules[i])) {
      for (var rule of rules[i]) {
        var valid = validateField(rule, val);
        if (!valid) return { valid: false, prompt: rule.prompt };
      }
    } else {
      var valid = validateField(rules[i], val);
      if (!valid) return { valid: false, prompt: rules[i].prompt };
    }
  }
  return { valid: true };
}

export default {
  organizeListData,
  validateForm,
};
