export interface FeedbackProducer {
  feedbackProducerMrid: string;
  activationDocumentMrid: string;

  messageType?: string;
  processType?: string;
  revisionNumber?: string;

  senderMarketParticipantMrid?: string;
  receiverMarketParticipantMrid?: string;

  createdDateTime?: string;
  validityPeriodStartDateTime: string;
  validityPeriodEndDateTime: string;

  feedback?: string;
  feedbackAnswer?: string;
  feedbackElements?: string;
}
