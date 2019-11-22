import { Observable, BehaviorSubject } from 'rxjs';

export type StepImpl = () => Observable<void>;

export interface TestStepDefinition {
  id: string;
  description: string;
}

export interface TestDefinition {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
  steps: TestStepDefinition[];
}

export interface TestAndStepsPhases {
  test$: Observable<ExecutionPhase>;
  steps$: Record<string, Observable<ExecutionPhase>>;
}

export enum ExecutionPhase {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CANCELLED = 'CANCELLED',
}

export const finishedExecutionPhase = (phase: ExecutionPhase) =>
  phase !== ExecutionPhase.IN_PROGRESS &&
  phase !== ExecutionPhase.NOT_STARTED;

export type StepIds<T extends string> = {
  [P in T]: null;
};

export type TestContext<S> = {
  [P in keyof S]: () => any;
};

export interface StepContext<T> {
  dependsOn?: keyof T;
  stepImpl: StepImpl;
}

export interface TestStep {
  id: string;
  stepImpl: StepImpl;
  dependents: TestStep[];
  phase: BehaviorSubject<ExecutionPhase>;
}

export interface RegisteredTest {
  dependsOn?: string;
  id: string;
  steps: Record<string, TestStep>;
  dependents: RegisteredTest[];
}

export function visitSteps(steps: TestStep[], visit: (step: TestStep) => void) {
  for (const step of steps) {
    visit(step);
    visitSteps(step.dependents, visit);
  }
}

export function visitTests(steps: RegisteredTest[], visit: (step: RegisteredTest) => void) {
  for (const test of steps) {
    visit(test);
    visitTests(test.dependents, visit);
  }
}

export const updateStepTo = (() => {
  const updateStep = (phase: ExecutionPhase) => (step: TestStep) => step.phase.next(phase);
  return {
    notStarted: updateStep(ExecutionPhase.NOT_STARTED),
    inProgress: updateStep(ExecutionPhase.IN_PROGRESS),
    success: updateStep(ExecutionPhase.SUCCESS),
    failure: updateStep(ExecutionPhase.FAILURE),
    cancelled: updateStep(ExecutionPhase.CANCELLED),
  };
})();
