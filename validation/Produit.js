const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateProduit(data) {
  let errors = {};

  // Remplacer les valeurs null ou undefined par des chaînes vides
  data.title = !isEmpty(data.title) ? data.title : "";
  data.stock = !isEmpty(data.stock) ? data.stock.toString() : "";
  data.price = !isEmpty(data.price) ? data.price.toString() : "";
  data.newprice = !isEmpty(data.newprice) ? data.newprice.toString() : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.categorieId = !isEmpty(data.categorieId) ? data.categorieId : "";
  data.sousCategorieId = !isEmpty(data.sousCategorieId) ? data.sousCategorieId : "";
  data.nameCategorie = !isEmpty(data.nameCategorie) ? data.nameCategorie : "";
  data.nameSousCategorie = !isEmpty(data.nameSousCategorie) ? data.nameSousCategorie : "";
  data.marqueId = !isEmpty(data.marqueId) ? data.marqueId : "";
  // Vérification que le titre est obligatoire
  if (validator.isEmpty(data.title)) {
    errors.title = "Le titre est obligatoire";
  }

  // Vérification que la description est obligatoire
  if (validator.isEmpty(data.description)) {
    errors.description = "La description est obligatoire";
  }

  // Vérification que stock est un nombre valide et ≥ 0
  if (!validator.isNumeric(data.stock, { no_symbols: true }) || parseInt(data.stock) < 0) {
    errors.stock = "Le stock doit être un nombre valide supérieur ou égal à 0";
  }

  // Vérification que price est un nombre valide et ≥ 0
  if (!validator.isNumeric(data.price, { no_symbols: true }) || parseFloat(data.price) < 0) {
    errors.price = "Le prix doit être un nombre valide supérieur ou égal à 0";
  }
  // Vérification que price est un nombre valide et ≥ 0
  if (!validator.isNumeric(data.newprice, { no_symbols: true }) || parseFloat(data.newprice) < 0) {
    errors.newprice = "Le prix doit être un nombre valide supérieur ou égal à 0";
  }

  // Vérification que la catégorie est obligatoire
  if (validator.isEmpty(data.categorieId) && validator.isEmpty(data.nameCategorie)) {
    errors.categorie = "La catégorie est obligatoire";
  }

  // Vérification que la sous-catégorie est obligatoire
  if (validator.isEmpty(data.sousCategorieId) && validator.isEmpty(data.nameSousCategorie)) {
    errors.sousCategorie = "La sous-catégorie est obligatoire";
  }
  if (validator.isEmpty(data.marqueId)) {
    errors.marqueId = "La marque est obligatoire";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
