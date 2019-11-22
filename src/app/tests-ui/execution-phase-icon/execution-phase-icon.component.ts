import { Component, Input, HostBinding } from '@angular/core';
import { ExecutionPhase } from 'src/app/tests-orchestration/models';

@Component({
  selector: 'app-execution-phase-icon',
  templateUrl: './execution-phase-icon.component.html',
  styleUrls: ['./execution-phase-icon.component.scss'],
})
export class ExecutionPhaseIconComponent {
  @Input() phase: ExecutionPhase = ExecutionPhase.NOT_STARTED;

  @HostBinding('class.vertical-center')
  verticalCenter = true;

  readonly PHASE_TO_ICON = {
    [ExecutionPhase.NOT_STARTED]: 'schedule',
    [ExecutionPhase.IN_PROGRESS]: 'gps_fixed',
    [ExecutionPhase.SUCCESS]: 'thumb_up',
    [ExecutionPhase.FAILURE]: 'thumb_down',
    [ExecutionPhase.CANCELLED]: 'cancel',
  };
}
