const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateRegister(data) {
  let errors = {};
 
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirm = !isEmpty(data.confirm) ? data.confirm : "";

 
  if (validator.isEmpty(data.password)) {
    errors.password = "Mot de  passe Obligatoire";
  }
  
  if(!validator.equals(data.password, data.confirm)){
    errors.confirm = "Mot de passe incompatible";
  }
  
  return {
      errors,
      isValid: isEmpty(errors)
  }
};