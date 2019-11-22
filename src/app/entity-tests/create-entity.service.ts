import { Injectable } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TestDefinition, TestsOrchestrationService } from '../tests-orchestration';
import { StepIds } from '../tests-orchestration/models';

export const randomlySucceedOrFail = () => timer(Math.random() * 5000).pipe(switchMap(() => {
  const result = Math.random() > 0.1;
  if (result) {
    return of(null);
  }
  return throwError('Boy you fucked up');
}));

export const CREATE_ENTITY_TEST: TestDefinition = {
  id: 'CREATE_ENTITY',
  name: 'Create Entity',
  steps: [
    {
      id: 'ENTITIES_REST_API_CREATE',
      description: 'HTTP - Create entity via entities-rest-api',
    },
    {
      id: 'FEEDBACK_WRITER',
      description: 'DS - Expect feedback from feedback-writer',
    },
    {
      id: 'CLIENTS_NOTIFIER',
      description: 'DS - Expect entityId to be in updatedList from clients-notifier',
    },
    {
      id: 'ENTITIES_REST_API_FETCH',
      description: 'HTTP - Expect /entities/uuid to return the entity',
    }
  ]
};

type CreateEntityTestSteps = StepIds<
  | 'ENTITIES_REST_API_CREATE'
  | 'FEEDBACK_WRITER'
  | 'CLIENTS_NOTIFIER'
  | 'ENTITIES_REST_API_FETCH'>;

@Injectable({
  providedIn: 'root'
})
export class CreateEntityService {
  private createdEntityId: string = null;

  get entityId(): string {
    return this.createdEntityId;
  }

  constructor(private tests: TestsOrchestrationService) { }

  init() {
    this.tests.registerAndSetup<CreateEntityTestSteps>(CREATE_ENTITY_TEST, setup => {
      setup.standalone('ENTITIES_REST_API_CREATE', () => {
        this.createdEntityId = 'ai karamba';
        return randomlySucceedOrFail();
      });

      setup.runAfter('ENTITIES_REST_API_CREATE', 'FEEDBACK_WRITER', () => {
        console.log('Awaiting feedback for', this.createdEntityId);
        return randomlySucceedOrFail();
      });

      setup.runAfter('ENTITIES_REST_API_CREATE', 'CLIENTS_NOTIFIER', () => {
        console.log('Awaiting updatedList to contain', this.createdEntityId);
        return randomlySucceedOrFail();
      });

      setup.runAfter('ENTITIES_REST_API_CREATE', 'ENTITIES_REST_API_FETCH', () => {
        console.log('Awaiting rest api to return', this.createdEntityId);
        return randomlySucceedOrFail();
      });
    });
  }

  startTest() {
    this.tests.runTest(CREATE_ENTITY_TEST.id);
  }
}
