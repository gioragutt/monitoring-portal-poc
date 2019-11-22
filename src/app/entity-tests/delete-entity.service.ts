import { Injectable } from '@angular/core';
import { TestDefinition, TestsOrchestrationService } from '../tests-orchestration';
import { StepIds } from '../tests-orchestration/models';
import { CreateEntityService, randomlySucceedOrFail } from './create-entity.service';
import { UPDATE_ENTITY_TEST } from './update-entity.service';

export const DELETE_ENTITY_TEST: TestDefinition = {
  id: 'DELETE_ENTITY',
  name: 'Delete Entity',
  steps: [
    {
      id: 'ENTITIES_REST_API_DELETE',
      description: 'HTTP - Delete entity via entities-rest-api',
    },
    {
      id: 'CLIENTS_NOTIFIER',
      description: 'DS - Expect entityId to be in outOfZoomList from clients-notifier',
    },
    {
      id: 'DEEPSTREAM',
      description: 'DS - Expect record to be deleted',
    },
    {
      id: 'ENTITIES_REST_API_FETCH',
      description: 'HTTP - Expect /entities/uuid to return "Target not found"',
    },
  ]
};

type DeleteEntityTestSteps = StepIds<
  | 'ENTITIES_REST_API_DELETE'
  | 'CLIENTS_NOTIFIER'
  | 'DEEPSTREAM'
  | 'ENTITIES_REST_API_FETCH'>;

@Injectable({
  providedIn: 'root'
})
export class DeleteEntityService {
  constructor(
    private createEntity: CreateEntityService,
    private tests: TestsOrchestrationService
  ) { }

  init() {
    this.tests.registerDependentAndSetup<DeleteEntityTestSteps>(
      UPDATE_ENTITY_TEST.id,
      DELETE_ENTITY_TEST,
      setup => {
        setup.standalone('ENTITIES_REST_API_DELETE', () => {
          console.log('Awaiting feedback for', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_DELETE', 'CLIENTS_NOTIFIER', () => {
          console.log('Awaiting outOfZoomList to contain', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_DELETE', 'DEEPSTREAM', () => {
          console.log('Awaiting delete for deepstream record', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });

        setup.runAfter('ENTITIES_REST_API_DELETE', 'ENTITIES_REST_API_FETCH', () => {
          console.log('Awaiting rest api to not return', this.createEntity.entityId);
          return randomlySucceedOrFail();
        });
      });
  }
}
