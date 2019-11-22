import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TestInfoDirective } from './test-info.directive';
import { TestStepComponent } from './test-step/test-step.component';
import { TestComponent } from './test/test.component';
import { TestsComponent } from './tests/tests.component';
import { ExecutionPhaseIconComponent } from './execution-phase-icon/execution-phase-icon.component';
import { TestDescriptionDirective } from './test-description.directive';

@NgModule({
  declarations: [
    TestComponent,
    TestStepComponent,
    TestInfoDirective,
    TestDescriptionDirective,
    TestsComponent,
    ExecutionPhaseIconComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    TestComponent,
    TestStepComponent,
    TestInfoDirective,
    TestDescriptionDirective,
    TestsComponent,
    ExecutionPhaseIconComponent,
  ]
})
export class TestsUiModule { }
