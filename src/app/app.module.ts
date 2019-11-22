import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { TestsUiModule } from './tests-ui/tests-ui.module';
import { EntityTestsModule } from './entity-tests/entity-tests.module';
import { TestsOrchestrationModule } from './tests-orchestration';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    TestsOrchestrationModule,
    TestsUiModule,
    EntityTestsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
