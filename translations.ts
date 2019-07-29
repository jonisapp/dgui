var translations = {
  titles: {
    information: {en: "Information", fr: "Information"},
    entry: {en: "Entry", fr: "Saisie"},
    choice: {en: "Choice", fr: "Choix"},
    confirm: {en: "Confirm", fr: "Confirmation"},
    serverError: {en: "Server error", fr: "Erreur sur le serveur"},
    new: {en: "New", fr: "Ajouter"},
    edit: {en: "Edit", fr: "Modifier"},
    remove: {en: "Remove", fr: "Supprimer"}
  },
  buttons: {
    ok: {en: "Ok", fr: "D'accord"},
    cancel: {en: "Cancel", fr: "Annuler"},
    submit: {en: "Submit", fr: "Soumettre"},
    valid: {en: "Valid", fr: "Valider"},
    confirm: {en: "Confirm", fr: "Confirmer"},
    yes: {en: "Yes", fr: "Oui"},
    no: {en: "No", fr: "Non"}
  },
  messages: {
    serverError: {
      en: "An error has occured on the server. Please try to submit your request again. If the error persists, please contact the administrator, giving him the details of the error thereafter :",
      fr: "Une erreur est survenue sur le serveur. Veuillez soumettre votre requête à nouveau. Si l'erreur persiste, prière de contacter l'administrateur, en lui communiquant les détails de l'erreur ci-après :"
    }
  },
  labels: {
    year: {en: "Year", fr: "Année"},
    month: {en: "Month", fr: "Mois"},
    day: {en: "Day", fr: "Jour"}
  },
  placeholders: {
    YYYY: {en: "YYYY", fr: "AAAA"},
    YY: {en: "YY", fr: "AA"},
    MM: {en: "MM", fr: "MM"},
    DD: {en: "DD", fr: "JJ"},
    selectMany: {en: "Select many...", fr: "Sélectionner plusieurs..."}
  }
};

var language = "fr";

export const tr = {
  title: (value: string) => {
    return translations.titles[value][language];
  },
  btn: (value: string) => {
    return translations.buttons[value][language];
  },
  msg: (value: string) => {
    return translations.messages[value][language];
  },
  lbl: (value: string) => {
    return translations.labels[value][language];
  },
  plcldr: (value: string) => {
    return translations.placeholders[value][language];
  }
}