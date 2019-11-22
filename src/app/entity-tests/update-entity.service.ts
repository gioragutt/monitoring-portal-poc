import { Injectable } from '@angular/core';
import { TestDefinition, TestsOrchestrationService } from '../tests-orchestration';
import { StepIds } from '../tests-orchestration/models';
import { randomlySucceedOrFail, CREATE_ENTITY_TEST, CreateEntityService } from './create-entity.service';

export const UPDATE_ENTITY_TEST: TestDefinition = {
  id: 'UPDATE_ENTITY',
  name: 'Update Entity',
  steps: [
    {
      id: 'ENTITIES_REST_API_UPDATE',
      description: 'HTTP - Update entity via entities-rest-api',
    },
    {
      id: 'FEEDBACK_WRITER',
      description: 'DS - Expect feedback from feedback-writer',
    },
    {
      id: 'DEEPSTREAM',
      description: 'DS - Expect update entity to be received in a record update'
    },
    {
      id: 'ENTITIES_REST_API_FETCH',
      description: 'HTTP - Expect /entities/uuid to return the updated entity',
    }
  ]
};

type UpdateEntityTestSteps = StepIds<
  | 'ENTITIES_REST_API_UPDATE'
  | 'FEEDBACK_WRITER'
  | 'DEEPSTREAM'
  | 'ENTITIES_REST_API_FETCH'>;

@Injectable({
  providedIn: 'root'
})
export class UpdateEntityService {
  constructor(
    private createEntity: CreateEntityService,
    private tests: TestsOrchestrationService
  ) { }

  init() {
    this.tests.registerDependentAndSetup<UpdateEntityTestSteps>(
      CREATE_ENTITY_TEST.id,
      UPDATE_ENTITY_TEST,
      setup => {
        setup.standalone('ENTITIES_REST_API_UPDATE', () => {
          console.log('Awaiting feedback for', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_UPDATE', 'FEEDBACK_WRITER', () => {
          console.log('Awaiting feedback for', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_UPDATE', 'DEEPSTREAM', () => {
          console.log('Awaiting update for deepstream record', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_UPDATE', 'ENTITIES_REST_API_FETCH', () => {
          console.log('Awaiting rest api to return', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });
      });
  }
}
