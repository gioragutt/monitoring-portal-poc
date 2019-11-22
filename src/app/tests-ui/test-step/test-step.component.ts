import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ExecutionPhase } from '../../tests-orchestration';

@Component({
  selector: 'app-test-step',
  templateUrl: './test-step.component.html',
  styleUrls: ['./test-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestStepComponent {
  @Input() phase: ExecutionPhase = ExecutionPhase.NOT_STARTED;
}
