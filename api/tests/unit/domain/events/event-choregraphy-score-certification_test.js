const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Event Choregraphy | Score Certification', function() {
  it('Should trigger Certification Scoring handler on Assessment Completed event', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new AssessmentCompleted();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(domainTransaction, event);

    // then
    expect(handlerStubs.handleCertificationScoring).to.have.been.calledWith({ domainTransaction, event });
  });
});