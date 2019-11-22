import { Component } from '@angular/core';
import { TestDefinition, TestsOrchestrationService } from 'src/app/tests-orchestration';
import { TestAndStepsPhases } from 'src/app/tests-orchestration/models';
import { CreateEntityService, CREATE_ENTITY_TEST } from '../create-entity.service';
import { UPDATE_ENTITY_TEST } from '../update-entity.service';
import { DELETE_ENTITY_TEST } from '../delete-entity.service';

interface TestDefinitionAndPhases {
  definition: TestDefinition;
  phases: TestAndStepsPhases;
}

@Component({
  selector: 'app-entity-tests',
  templateUrl: './entity-tests.component.html',
  styleUrls: ['./entity-tests.component.scss'],
})
export class EntityTestsComponent {
  tests: TestDefinitionAndPhases[] = [
    CREATE_ENTITY_TEST,
    UPDATE_ENTITY_TEST,
    DELETE_ENTITY_TEST,
  ].map(definition => {
    return {
      definition,
      phases: this.testsOrchestration.testAndStepsPhases(definition.id),
    };
  });

  constructor(
    public createEntity: CreateEntityService,
    public testsOrchestration: TestsOrchestrationService,
  ) { }
}
