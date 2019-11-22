import { Component, ContentChildren, Input, QueryList, ChangeDetectionStrategy } from '@angular/core';
import { TestStepComponent } from '../test-step/test-step.component';
import { ExecutionPhase } from 'src/app/tests-orchestration';
import { transition, trigger, state, style, animate } from '@angular/animations';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('testBackground', [
      state(ExecutionPhase.SUCCESS, style({
        backgroundColor: 'limegreen',
      })),
      state(ExecutionPhase.FAILURE, style({
        backgroundColor: 'red',
      })),
      state(ExecutionPhase.CANCELLED, style({
        backgroundColor: 'lightsalmon',
      })),
      transition('* => *', [
        animate('0.5s')
      ]),
    ])
  ]
})
export class TestComponent {
  @ContentChildren(TestStepComponent)
  testSteps: QueryList<TestStepComponent>;

  @Input() name: string;
  @Input() disabled?: boolean;
  @Input() phase: ExecutionPhase = ExecutionPhase.NOT_STARTED;
}
