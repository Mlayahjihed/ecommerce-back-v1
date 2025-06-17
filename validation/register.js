const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateRegister(data) {
  let errors = {};
  data.user_name = !isEmpty(data.user_name) ? data.user_name: "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirm = !isEmpty(data.confirm) ? data.confirm : "";

  if (validator.isEmpty(data.user_name)) {
    errors.user_name= "Nom et prenom Obligatoire";
  }
  if (!validator.isEmail(data.email)) {
    errors.email = "Verifier E-mail";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email Obligatoire";
  }
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