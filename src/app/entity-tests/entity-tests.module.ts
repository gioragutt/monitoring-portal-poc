import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TestsUiModule } from '../tests-ui/tests-ui.module';
import { EntityTestsComponent } from './entity-tests/entity-tests.component';
import { CreateEntityService } from './create-entity.service';
import { UpdateEntityService } from './update-entity.service';
import { DeleteEntityService } from './delete-entity.service';

@NgModule({
  declarations: [
    EntityTestsComponent
  ],
  exports: [
    EntityTestsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TestsUiModule,
  ]
})
export class EntityTestsModule {
  constructor(
    create: CreateEntityService,
    update: UpdateEntityService,
    del: DeleteEntityService,
  ) {
    create.init();
    update.init();
    del.init();
  }
}
