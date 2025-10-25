const ETAT_DE_CAISSE_INITIAL = {
  'Pièce(s) de 1€': 23, // piece
  'Pièce(s) de 2€': 12, // piece
  'Billet(s) de 5€': 10, // billet
  'Billet(s) de 10€': 2, // billet
  'Billet(s) de 20€': 3,  // billet
};

const achatDeBase = {
  montantAchat: 12,
  montantDonneParClient: 50,
};
const achatParfait = {
  montantAchat: 50,
  montantDonneParClient: 50,
};
const achatClientMauvaisEnMaths = {
  montantAchat: 170,
  montantDonneParClient: 50,
};
const achatQuiVideLaTréso = {
  montantAchat: 1,
  montantDonneParClient: 178,
};
const achatPasAssezDeTréso = {
  montantAchat: 1,
  montantDonneParClient: 200,
};

async function getAPIData() {
  const url = "https://v6.exchangerate-api.com/v6/8203847ca3e1e1f87e7c31e9/latest/EUR";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    const allRates = Object.entries(result.conversion_rates);
    const deviseVoulues = ['EUR', 'CHF', 'GBP', 'JPY', 'USD']
    const rates = allRates.filter((currencyCode) => deviseVoulues.includes(currencyCode[0]));
    return Object.fromEntries(rates);
  } catch (error) {
    console.error(error.message);
  }
}

// pour pouvoir faire apparaître mes logs avec du délai
const delay = ms => new Promise(res => setTimeout(res, ms));

const retourMonnaie = async (etatDeCaisse, achat, conversionRates) => {
  // refacto, j'utilisaisle code de cette méthode à deux endroits
  const calculateChange = async (combien, e, prochainResteADonner, billetsOuPiecesàRetirer, pieceOuBilletDe) => {
    console.log(`➡️ 🤔 Je dois rendre en tout ${deltaAchat}€,
                          ou ${(billetsOuPiecesàRetirer * conversionRates.CHF).toFixed(2)} francs suisses,
                          ou ${(billetsOuPiecesàRetirer * conversionRates.USD).toFixed(2)}$,
                          ou ${(billetsOuPiecesàRetirer * conversionRates.GBP).toFixed(2)}£,
                          ou ${(billetsOuPiecesàRetirer * conversionRates.JPY).toFixed(2)} yens.`);
    console.log('>');
    console.log(`➡️ Je ne dois que donner ${combien} ${e[0].toLowerCase()},
                                     ou ${(deltaAchat * conversionRates.CHF).toFixed(2)} francs suisses,
                                     ou ${(deltaAchat * conversionRates.USD).toFixed(2)}$,
                                     ou ${(deltaAchat * conversionRates.GBP).toFixed(2)}£,
                                     ou ${(deltaAchat * conversionRates.JPY).toFixed(2)} yens.`);
    console.log('>');
    console.log(`➡️ Prochain reste à donner : ${prochainResteADonner}€,
                          ou ${(prochainResteADonner * conversionRates.CHF).toFixed(2)} francs suisses,
                          ou ${(prochainResteADonner * conversionRates.USD).toFixed(2)}$,
                          ou ${(prochainResteADonner * conversionRates.GBP).toFixed(2)}£,
                          ou ${(prochainResteADonner * conversionRates.JPY).toFixed(2)} yens.`);
    console.log('>');
    await delay(1000);

    deltaAchat -= billetsOuPiecesàRetirer;
    etatDeCaisse[e[0]] = (etatDeCaisse[e[0]] - combien);
    console.log(`➡️ 📉 Caisse mise à jour pour le(s) ${e[0].toLowerCase()}.`);
    console.log('>');
    await delay(1000);
  };

  // pour que l'ordre me convienne dans le console.table()
  const reversedEdc = Object.fromEntries(Object.entries(etatDeCaisse).reverse());
  console.log("➡️ 💰 État initial de la caisse :");
  console.table(reversedEdc);
  console.log('>');

  // j'ai une base qui est l'état de chaque valeur de chaque clé mais additionnée = tréso
  const edcArray = Object.entries(etatDeCaisse).reverse();
  let tréso = 0;
  edcArray.forEach(e => {
    const pieceOuBilletDe = e[0].split(" ").at(-1).slice(0, -1);
    const totalIntermédiaire = pieceOuBilletDe * e[1];
    tréso += totalIntermédiaire;
    // console.log('par ici le test relou !!!', e[0].split(' ').at(-1).slice(0, -1));
  });
  // je viens faire le delta entre montant donné et montant achat = deltaAchat
  let deltaAchat = achat.montantDonneParClient - achat.montantAchat;
  console.log(`➡️ 🛒 Un client a acheté pour ${achat.montantAchat}€ et a payé avec ${achat.montantDonneParClient}€. Trésorerie actuelle : ${tréso}€.`);
  console.log('>');
  await delay(1000);

  // je vois si je peux rendre la monnaie, si oui je le fais
  if (deltaAchat > 0 && deltaAchat <= tréso) {
    for (const e of edcArray) {
      const pieceOuBilletDe = e[0].split(" ").at(-1).slice(0, -1);
      let prochainResteADonner = deltaAchat % pieceOuBilletDe;
      let billetsOuPiecesàRetirer = deltaAchat - prochainResteADonner;
      let combien = billetsOuPiecesàRetirer / pieceOuBilletDe;

      // si jamais le combien de billet(s)/pièce(s) j'ai besoin est supérieur à ce que j'ai --> je donne ce que j'ai
      const test = combien > e[1];
      if (test) {
        combien = e[1];
        billetsOuPiecesàRetirer = e[1] * pieceOuBilletDe;
        prochainResteADonner = deltaAchat - billetsOuPiecesàRetirer;
        await calculateChange(combien, e, prochainResteADonner, billetsOuPiecesàRetirer, pieceOuBilletDe);

      } else {
        await calculateChange(combien, e, prochainResteADonner, billetsOuPiecesàRetirer, pieceOuBilletDe);
      }
    }
    /** retourne le nombre de pièces et billets de monnaie
     * {'5': 1}
     * {'1': 5}
     */
    console.log("➡️ ✅ Opération terminée ! État final de la caisse :");
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat === 0) {
    // si le client est génial
    console.log("➡️ 😎 Merci, l'appoint est parfait ! Bonne journée !");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat <= 0) {
    // si le client est pas bon en maths
    const montantManquant = achat.montantAchat - achat.montantDonneParClient;
    console.log(`➡️ 🤦‍♂️ Oups, il manque ${montantManquant}€,
                   ou ${(montantManquant * conversionRates.CHF).toFixed(2)} francs suisses,
                   ou ${(montantManquant * conversionRates.USD).toFixed(2)}$,
                   ou ${(montantManquant * conversionRates.GBP).toFixed(2)}£,
                   ou ${(montantManquant * conversionRates.JPY).toFixed(2)} yens... !`)
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else {
    // si non je sors un message d'erreur qui dit que j'ai pas la monnaie
    console.log("➡️ 😥 Désolé, je n'ai pas assez de monnaie pour vous rendre l'appoint.");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  }
}

/**
 * Changement de l'extension du fichier .js en .mjs pour qu'il devienne un mo-
 * dule. Ce qui permet d'utiliser await au premier niveau du fichier
 */
console.log("--- 🎬 SCÉNARIO 1 : ACHAT DE BASE ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatDeBase, await getAPIData());
console.log("\n");

console.log("--- 🎬 SCÉNARIO 2 : ACHAT PARFAIT ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatParfait, await getAPIData());
console.log("\n");

console.log("--- 🎬 SCÉNARIO 3 : CLIENT MAUVAIS EN MATHS ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatClientMauvaisEnMaths, await getAPIData());
console.log("\n");

console.log("--- 🎬 SCÉNARIO 4 : PLUS DE TRÉSORERIE ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatQuiVideLaTréso, await getAPIData());
console.log("\n");

console.log("--- 🎬 SCÉNARIO 5 : PAS ASSEZ DE TRÉSORERIE ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatPasAssezDeTréso, await getAPIData());
