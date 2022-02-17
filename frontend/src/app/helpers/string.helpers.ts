export default class StringHelper {
  /**
   * ajouterZerosAGauche(123, 5) = "00123"
   */
  static ajouterZerosAGauche(nb: number, nbTotalDeChiffres: number): string {
    let str = nb + ''; // Conversion de str en String (afin que cela fonctionne aussi avec des number)
    return str.padStart(nbTotalDeChiffres, '0');
  }
}
