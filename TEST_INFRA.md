```typescript
interface TestStep {
  id: string;
  description: string;
}

interface Test {
  id: string;
  name: string;
  description?: string;
  steps: TestStep[];
}
```

When we run a test, we want:

1. To be able to know what the phase of each step is
2. To be able to know when each step is ran and finished
3. To be able to run steps after a certain test step finished successfully
4. We want to be able to manually cancel an ongoing test, and all the unfinished ones as well

# Behavior:

1. When a test runs, it can be in one of 5 phases:
   1. NOT_STARTED
   1. IN_PROGRESS
   1. SUCCESS
   1. FAILURE
   1. CANCELLED
1. When a test is ran due to a step succeeding, and it fails, it should not fail the source step
1. Steps should be able to get context from tests before them
1. If possible, test contextes should be typed
