const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function Validateforget(data) {
  let errors = {};
  
  data.email = !isEmpty(data.email) ? data.email : "";
  
  if (!validator.isEmail(data.email)) {
    errors.email = "Verifier E-mail";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email Obligatoire";
  }
  
  
  
  
  return {
      errors,
      isValid: isEmpty(errors)
  }
};