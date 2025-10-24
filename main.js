const etatDeCaisse = {
    'Pièce(s) de 1': 23, // piece
    'Pièce(s) de 2': 12, // piece
    'Billet(s) de 5': 10, // billet
    'Billet(s) de 10': 2, // billet
    'Billet(s) de 20': 3,  // billet
}

const achat = {
    montantAchat: 60,
    montantDonneParClient: 400,
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const retourMonnaie = async (etatDeCaisse, achat) => {
  const reversedEdc = Object.fromEntries(Object.entries(etatDeCaisse).reverse());
  console.table(reversedEdc);
  console.log('>');
  // j'ai une base qui est l'état de chaque valeur de chaque clé mais additionnée = tréso
  const edcArray = Object.entries(etatDeCaisse).reverse();
  let tréso = 0;
  edcArray.forEach(e => {
    const pieceOuBilletDe = e[0].split(" ").at(-1);
    const total = pieceOuBilletDe * e[1];
    tréso += total;
  });
  // je viens faire le delta entre montant donné et montant achat = deltaAchat
  let deltaAchat = achat.montantDonneParClient - achat.montantAchat;
  console.log(`Monsier/Madame Tartanpion a acheté pour ${achat.montantAchat} de fruits et légumes, j'ai actuellement ${tréso} dans la caisse. Iel me donne ${achat.montantDonneParClient} pour payer`);
  console.log('>');
  await delay(1000);
  // je vois si je peux le faire, si oui je le fais
  if (deltaAchat > 0) {
    for (const e of edcArray) {
      const pieceOuBilletDe = e[0].split(" ").at(-1);
      const prochainResteADonner = deltaAchat % pieceOuBilletDe;
      const BilletsOuPiecesàRetirer = deltaAchat - prochainResteADonner;
      const combien = BilletsOuPiecesàRetirer / pieceOuBilletDe;
      console.log(`Je dois rendre ${deltaAchat}, et après avoir donné ${combien} ${e[0].toLowerCase()}, mon prochain reste à donner sera de ${prochainResteADonner}`);
      console.log('>');
      await delay(1000);
      deltaAchat -= BilletsOuPiecesàRetirer;
      etatDeCaisse[e[0]] = (etatDeCaisse[e[0]] - combien);
      console.log(`J'avais ${e[1] * pieceOuBilletDe} en ${e[0].toLowerCase()}, je retire donc ${(combien * pieceOuBilletDe)}, et je n'ai plus que ${(e[1] * pieceOuBilletDe) - (combien * pieceOuBilletDe)} en ${e[0].toLowerCase()}`);
      console.log('>');
      await delay(1000);
    }
    // retourne le nombre de pièces et billets de monnaie
    // {'5': 1}
    // {'1': 5}
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat === 0) {
    // si le client est génial
    console.log("Thank u, have a good day Monsieur/Madame Tartapion, je n'ai pas à faire la monnaie");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else if (deltaAchat <= 0) {
    console.log(`Bah vous voyez bien qu'il n'y a pas assez Monsieur/Madame Tartanpion! Il vous manque ${achat.montantAchat - achat.montantDonneParClient}`)
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  } else {
    // si non je sors un message d'erreur qui dit que j'ai pas la monnaie
    console.log("I don't have the moneyyyy");
    console.log('>');
    console.table(Object.fromEntries(Object.entries(etatDeCaisse).reverse()));
  }

}

retourMonnaie(etatDeCaisse, achat);
