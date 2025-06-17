const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateProfil(data) {
  let errors = {};
  data.user_name = !isEmpty(data.user_name) ? data.user_name: "";
  data.email = !isEmpty(data.email) ? data.email : "";
  

  if (validator.isEmpty(data.user_name)) {
    errors.user_name= "Nom et prenom Obligatoire";
  }
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