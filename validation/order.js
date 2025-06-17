const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateOrder(data) {
  let errors = {};

  // Normalisation des données (remplacer null/undefined par des chaînes vides)
  data.nom = !isEmpty(data.nom) ? data.nom : "";
  data.prenom = !isEmpty(data.prenom) ? data.prenom : "";
  data.telephone = !isEmpty(data.telephone) ? data.telephone : "";
  data.rue = !isEmpty(data.rue) ? data.rue : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.codePostal = !isEmpty(data.codePostal) ? data.codePostal : "";
  data.country = !isEmpty(data.country) ? data.country : "";
  data.total = !isEmpty(data.total) ? data.total.toString() : "";
 

  // Validation des champs obligatoires
  if (validator.isEmpty(data.nom)) {
    errors.nom = "Le nom est obligatoire";
  }

  if (validator.isEmpty(data.prenom)) {
    errors.prenom = "Le prénom est obligatoire";
  }

  if (validator.isEmpty(data.telephone)) {
    errors.telephone = "Le téléphone est obligatoire";
  } else if (!validator.isMobilePhone(data.telephone, 'any')) {
    errors.telephone = "Numéro de téléphone invalide";
  }

  if (validator.isEmpty(data.rue)) {
    errors.rue = "L'adresse est obligatoire";
  }

  if (validator.isEmpty(data.city)) {
    errors.city = "La ville est obligatoire";
  }

  if (validator.isEmpty(data.codePostal)) {
    errors.codePostal = "Le code postal est obligatoire";
  } else if (!validator.isPostalCode(data.codePostal, 'any')) {
    errors.codePostal = "Code postal invalide";
  }

  if (validator.isEmpty(data.country)) {
    errors.country = "Le pays est obligatoire";
  }

  // Validation du total
  if (!validator.isFloat(data.total, { min: 0 })) {
    errors.total = "Le total doit être un nombre valide supérieur ou égal à 0";
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};