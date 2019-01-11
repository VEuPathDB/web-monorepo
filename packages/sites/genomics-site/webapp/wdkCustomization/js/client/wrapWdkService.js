export default WdkService => class ApiService extends WdkService {
  async getStepAnswer(stepId, formatting, userId = 'current') {
    const step = await this.findStep(stepId, userId);
    const formatConfig = await this._updateFormatConfigIfTranscript(step.recordClassName, formatting.formatConfig);
    return super.getStepAnswer(stepId, { ...formatting, formatConfig }, userId);
  }

  // async getStepAnswerJson(stepId, formatConfig, userId = 'current') {
  //   const step = await this.findStep(stepId, userId);
  //   formatConfig = await this._updateFormatConfigIfTranscript(step.recordClassName, formatConfig);
  //   return super.getStepAnswerJson(stepId, formatConfig, userId);
  // }

  // async getAnswer(answerSpec, formatting) {
  //   const formatConfig = await this._updateFormatConfigIfTranscript(answerSpec.recordClassName, formatting.formatConfig);
  //   return super.getAnswer(answerSpec, { ...formatting, formatConfig });
  // }

  // async getAnswerJson(answerSpec, formatConfig) {
  //   formatConfig = await this._updateFormatConfigIfTranscript(answerSpec.recordClassName, formatConfig);
  //   return super.getAnswerJson(answerSpec, formatConfig);
  // }

  async _updateFormatConfigIfTranscript(recordClassName, formatConfig) {
    if (recordClassName !== 'TranscriptRecordClasses.TranscriptRecordClass')
      return formatConfig;

    const prefs = await this.getCurrentUserPreferences();
    const representativeTranscriptOnly = prefs.project.representativeTranscriptOnly === 'true';
    return { ...formatConfig, representativeTranscriptOnly };
  }
}
