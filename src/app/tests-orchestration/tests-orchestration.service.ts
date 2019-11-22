import { Injectable } from '@angular/core';
import { combineLatest, defer, EMPTY, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, first, map, takeUntil, tap } from 'rxjs/operators';
import {
  ExecutionPhase,
  RegisteredTest,
  StepIds,
  TestDefinition,
  TestStep,
  visitSteps,
  finishedExecutionPhase,
  visitTests,
  updateStepTo,
  TestAndStepsPhases
} from './models';
import { TestSetup } from './test-setup';

@Injectable({
  providedIn: 'root'
})
export class TestsOrchestrationService {
  private registeredTests: Record<string, RegisteredTest> = {};

  registerAndSetup<T extends StepIds<any>>(
    test: TestDefinition,
    setupFunc: (setup: TestSetup<T>) => void,
  ): void {
    if (this.registeredTests[test.id]) {
      console.log(`${test.id} already registered`);
      return;
    }

    this.registerAndSetupImpl(
      { id: test.id, steps: {}, dependents: [] },
      test,
      setupFunc,
    );
  }

  registerDependentAndSetup<T extends StepIds<any>>(
    dependsOn: string,
    test: TestDefinition,
    setupFunc: (setup: TestSetup<T>) => void,
  ): void {
    const parentTest = this.registeredTests[dependsOn];
    if (!parentTest) {
      throw new Error(`Test ${test.id} was not registered yet`);
    }
    if (parentTest.dependents.map(t => t.id).includes(test.id)) {
      console.log(`${test.id} already registered`);
      return;
    }

    const registeredTest: RegisteredTest = { dependsOn, id: test.id, steps: {}, dependents: [] };
    this.registerAndSetupImpl(registeredTest, test, setupFunc);
    parentTest.dependents.push(registeredTest);
  }

  private registerAndSetupImpl<T extends StepIds<any>>(
    registeredTest: RegisteredTest,
    { id, steps }: TestDefinition,
    setupFunc: (setup: TestSetup<T>) => void,
  ): void {
    const initializedSteps: string[] = [];
    setupFunc(new TestSetup<T>(registeredTest, initializedSteps));

    const allSteps = new Set<string>(steps.map(s => s.id));
    initializedSteps.forEach(s => allSteps.delete(s));
    if (allSteps.size > 0) {
      throw new Error(`Some steps have not been set up: ${[...allSteps]}`);
    }

    this.registeredTests[id] = registeredTest;
  }

  runTest(testId: string): void {
    const test = this.registeredTests[testId];
    if (!test) {
      return;
    }

    this.resetTestAndDependents(testId);
    this.runStepsOfTest(Object.values(test.steps));

    this.testExecutionPhase(testId).pipe(
      filter(finishedExecutionPhase),
      first(),
    ).subscribe(result => this.handleFinishedTest(test, result));
  }

  resetTestAndDependents(testId: string) {
    this.resetTest(testId);
    visitTests(this.registeredTests[testId].dependents, t => this.resetTest(t.id));
  }

  runTestWithoutDependents(testId: string): void {
    const test = this.registeredTests[testId];
    if (!test) {
      return;
    }

    this.resetTest(testId);
    this.runStepsOfTest(Object.values(test.steps));
  }

  handleFinishedTest(test: RegisteredTest, result: ExecutionPhase): void {
    console.log(`Test ${test.id} finished with ${result}`);
    switch (result) {
      case ExecutionPhase.CANCELLED:
      case ExecutionPhase.FAILURE:
        this.cancelDependentTests(test);
        break;
      case ExecutionPhase.SUCCESS:
        this.runDependentTests(test);
        break;
    }
  }

  runDependentTests(test: RegisteredTest) {
    test.dependents.forEach(t => {
      this.runTest(t.id);
    });
  }

  cancelDependentTests(test: RegisteredTest) {
    visitTests(test.dependents, t => {
      this.foreachStepIn(t.id, updateStepTo.cancelled);
    });
  }

  private testExecutionPhase(testId: string): Observable<ExecutionPhase> {
    if (!this.registeredTests[testId]) {
      return of(ExecutionPhase.NOT_STARTED);
    }

    const stepPhases$ = this.mapSteps(testId, ({ phase }) => phase.asObservable());
    return combineLatest(stepPhases$).pipe(
      map((phases: ExecutionPhase[]) => {
        const count = phases.reduce((acc, p) => {
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {});

        if (count[ExecutionPhase.NOT_STARTED] === phases.length) {
          return ExecutionPhase.NOT_STARTED;
        }

        if (count[ExecutionPhase.SUCCESS] === phases.length) {
          return ExecutionPhase.SUCCESS;
        }

        if (count[ExecutionPhase.CANCELLED] === phases.length) {
          return ExecutionPhase.CANCELLED;
        }

        if (count[ExecutionPhase.FAILURE] > 0) {
          return ExecutionPhase.FAILURE;
        }

        return ExecutionPhase.IN_PROGRESS;
      })
    ).pipe(distinctUntilChanged());
  }

  private runStepsOfTest(steps: TestStep[]): void {
    for (const step of steps) {
      this.testStep(step, step.stepImpl)
        .subscribe(() => this.runStepsOfTest(step.dependents));
    }
  }

  private resetTest(testId: string) {
    this.foreachStepIn(testId, step => {
      updateStepTo.cancelled(step);
      updateStepTo.notStarted(step);
    });
  }

  private testStep(step: TestStep, stepImpl: () => Observable<any>): Observable<any> {
    return defer(() => {
      updateStepTo.inProgress(step);
      return stepImpl().pipe(
        first(),
        catchError(err => {
          console.error(err);
          updateStepTo.failure(step);
          step.dependents.forEach(updateStepTo.cancelled);
          return EMPTY;
        }),
        // Stop skipped tests
        takeUntil(step.phase.pipe(
          filter(phase => phase === ExecutionPhase.CANCELLED),
          first(),
        )),
        tap(() => updateStepTo.success(step)),
      );
    });
  }

  testPhase$(testId: string): Observable<ExecutionPhase> {
    return this.testExecutionPhase(testId);
  }

  stepPhase$(testId: string, stepId: string): Observable<ExecutionPhase> {
    return this.findStep(testId, stepId).phase.asObservable();
  }

  private findStep(testId: string, stepId: string) {
    return this.filterSteps(testId, step => step.id === stepId)[0];
  }

  private mapSteps<T>(testId: string, mapper: (step: TestStep) => T): T[] {
    const mapped: T[] = [];
    this.foreachStepIn(testId, step => {
      mapped.push(mapper(step));
    });
    return mapped;
  }

  private filterSteps(testId: string, predicate: (step: TestStep) => boolean): TestStep[] {
    const filtered: TestStep[] = [];
    this.foreachStepIn(testId, step => {
      if (predicate(step)) {
        filtered.push(step);
      }
    });
    return filtered;
  }

  private foreachStepIn(testId: string, visit: (step: TestStep) => void) {
    visitSteps(Object.values(this.registeredTests[testId].steps), visit);
  }

  testAndStepsPhases(testId: string): TestAndStepsPhases {
    const testPhase = this.testPhase$(testId);
    const stepPhases: TestAndStepsPhases['steps$'] = {};
    this.foreachStepIn(testId, ({ id }) => {
      stepPhases[id] = this.stepPhase$(testId, id);
    });

    return {
      test$: testPhase,
      steps$: stepPhases,
    };
  }

  isIndependentTest(testId: string) {
    return !this.registeredTests[testId].dependsOn;
  }
}
