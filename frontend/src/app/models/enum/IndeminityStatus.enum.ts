export enum IndeminityStatus {
  InProgress = 'InProgress', // En cours
  Agreement = 'Agreement', // Accord
  Processed = 'Processed', // Traité Enedis
  WaitingInvoice = 'WaitingInvoice', // Traité RTE en attente retour producteur
  InvoiceSent = 'InvoiceSent', // Traité RTE et retour producteur effectué
  Abandoned = 'Abandoned', // Abandonné
}
