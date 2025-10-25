const ETAT_DE_CAISSE_INITIAL = {
  'Pièce(s) de 1': 23, // piece
  'Pièce(s) de 2': 12, // piece
  'Billet(s) de 5': 10, // billet
  'Billet(s) de 10': 2, // billet
  'Billet(s) de 20': 3,  // billet
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

// pour pouvoir faire apparaître mes logs avec du délai
const delay = ms => new Promise(res => setTimeout(res, ms));

const retourMonnaie = async (etatDeCaisse, achat) => {

  // refacto, j'utilisaisle code de cette méthode à deux endroits
  const calculateChange = async (combien, e, prochainResteADonner, billetsOuPiecesàRetirer, pieceOuBilletDe) => {
    console.log(`🤔 Je dois rendre ${deltaAchat}€... Je donne ${combien} ${e[0].toLowerCase()}€.`);
    console.log(`➡️  Prochain reste à donner : ${prochainResteADonner}€`);
    console.log('>');
    await delay(1000);

    deltaAchat -= billetsOuPiecesàRetirer;
    etatDeCaisse[e[0]] = (etatDeCaisse[e[0]] - combien);
    console.log(`📉 Caisse mise à jour pour le(s) ${e[0].toLowerCase()}€.`);
    console.log('>');
    await delay(1000);
  };

  // pour que l'ordre me convienne dans le console.table()
  const reversedEdc = Object.fromEntries(Object.entries(etatDeCaisse).reverse());
  console.log("💰 État initial de la caisse :");
  console.table(reversedEdc);
  console.log('>');

  // j'ai une base qui est l'état de chaque valeur de chaque clé mais additionnée = tréso
  const edcArray = Object.entries(etatDeCaisse).reverse();
  let tréso = 0;
  edcArray.forEach(e => {
    const pieceOuBilletDe = e[0].split(" ").at(-1);
    const totalIntermédiaire = pieceOuBilletDe * e[1];
    tréso += totalIntermédiaire;
  });

  // je viens faire le delta entre montant donné et montant achat = deltaAchat
  let deltaAchat = achat.montantDonneParClient - achat.montantAchat;
  console.log(`🛒 Un client a acheté pour ${achat.montantAchat}€ et a payé avec ${achat.montantDonneParClient}€. Trésorerie actuelle : ${tréso}€.`);
  console.log('>');
  await delay(1000);

  // je vois si je peux rendre la monnaie, si oui je le fais
  if (deltaAchat > 0 && deltaAchat <= tréso) {
    for (const e of edcArray) {
      const pieceOuBilletDe = e[0].split(" ").at(-1);
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
    console.log("✅ Opération terminée ! État final de la caisse :");
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat === 0) {
    // si le client est génial
    console.log("😎 Merci, l'appoint est parfait ! Bonne journée !");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat <= 0) {
    // si le client est pas bon en maths
    console.log(`🤦‍♂️ Oups, il manque ${achat.montantAchat - achat.montantDonneParClient}€ !`)
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else {
    // si non je sors un message d'erreur qui dit que j'ai pas la monnaie
    console.log("😥 Désolé, je n'ai pas assez de monnaie pour vous rendre.");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  }
}

/**
 * Changement de l'extension du fichier .js en .mjs pour qu'il devienne un mo-
 * dule. Ce qui permet d'utiliser await au premier niveau du fichier
 */
console.log("--- 🎬 SCÉNARIO 1 : ACHAT DE BASE ---");
// On passe une copie de l'état de caisse pour que les scénarios soient indépendants
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatDeBase);
console.log("\n");

console.log("--- 🎬 SCÉNARIO 2 : ACHAT PARFAIT ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatParfait);
console.log("\n");

console.log("--- 🎬 SCÉNARIO 3 : CLIENT MAUVAIS EN MATHS ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatClientMauvaisEnMaths);
console.log("\n");

console.log("--- 🎬 SCÉNARIO 4 : PLUS DE TRÉSORERIE ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatQuiVideLaTréso);
console.log("\n");

console.log("--- 🎬 SCÉNARIO 5 : PAS ASSEZ DE TRÉSORERIE ---");
await retourMonnaie({ ...ETAT_DE_CAISSE_INITIAL }, achatPasAssezDeTréso);
