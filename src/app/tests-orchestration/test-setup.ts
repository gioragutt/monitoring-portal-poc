import { BehaviorSubject } from 'rxjs';
import { RegisteredTest, StepImpl, TestStep, ExecutionPhase, StepIds } from './models';

export class TestSetup<T extends StepIds<any>> {

  constructor(
    private test: RegisteredTest,
    private initializedSteps: (keyof T)[],
  ) { }

  standalone<K extends keyof T>(stepId: K, stepImpl: StepImpl): void {
    this.test.steps[stepId as string] =
      this.newTestStep(stepId, stepImpl);
  }

  runAfter<K extends keyof T, A extends keyof T>(
    runAfterId: A,
    stepId: K,
    stepImpl: StepImpl,
  ): void {
    this.test.steps[runAfterId as string].dependents.push(
      this.newTestStep(stepId, stepImpl));
  }

  private newTestStep<K extends keyof T>(
    stepId: K,
    stepImpl: StepImpl,
  ): TestStep {
    this.initializedSteps.push(stepId);
    return {
      id: stepId as string,
      dependents: [],
      stepImpl,
      phase: new BehaviorSubject<ExecutionPhase>(ExecutionPhase.NOT_STARTED),
    };
  }
}
