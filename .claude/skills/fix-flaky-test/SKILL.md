# fix-flaky-test

Diagnose and fix flaky tests in the FluidFramework repository.

## Input

A test name, file path, or GitHub issue describing a flaky test.

## Workflow

### Step 1: Identify the Test

If given an issue, extract the test name and file path. Otherwise, locate the test:
```bash
# Search for test by name
grep -r "it(\"<test_name>" packages/ --include="*.spec.ts" --include="*.test.ts" -l
grep -r "it(\"<test_name>" packages/ --include="*.spec.ts" --include="*.test.ts" -l
```

### Step 2: Read the Test

Read the full test file and understand:
- Test setup (`before`, `beforeEach`, `afterEach`, `after`)
- What the test asserts
- What external resources it uses (timers, network, file system)
- Whether it uses shared state between tests

### Step 3: Analyze for Common Flaky Patterns

**Race Conditions**
- Missing `await` on async operations
- Not waiting for event handlers to fire
- Assuming synchronous execution of async code
- Reading state before a callback has been invoked

**Timer Dependencies**
- Using real `setTimeout`/`setInterval` instead of fake timers
- Hardcoded timeouts that are too short on slow CI
- Timer leaks between tests (missing cleanup)

**Shared State**
- Mutable state shared between `it()` blocks
- Missing cleanup in `afterEach`/`after`
- Singleton patterns that persist across tests
- DDS state not properly reset between tests

**Non-Deterministic Ordering**
- Tests that depend on execution order
- Set/Map iteration order assumptions
- Promise.all with order-dependent assertions

**Resource Cleanup**
- Containers not disposed after test
- Event listeners not removed
- WebSocket connections not closed
- Pending ops not flushed before assertions

**Fluid-Specific Patterns**
- Not waiting for op acknowledgment before asserting
- Missing `container.connect()` or not waiting for connected state
- Asserting before summary has completed
- Not accounting for eventual consistency (remote changes take time)

### Step 4: Propose Fix

For each identified issue, propose a specific fix:

```typescript
// Example: Race condition fix
// Before (flaky):
container.on("connected", () => { /* assert */ });
container.connect();

// After (stable):
await new Promise<void>((resolve) => {
    container.on("connected", () => {
        // assert
        resolve();
    });
    container.connect();
});
```

### Step 5: Verify Fix

Run the test multiple times to confirm stability:
```bash
cd <package_dir>

# Run 5 times to check for flakiness
for i in {1..5}; do echo "Run $i"; npm run test:mocha:esm -- --grep "<test_name>"; done

# Or with CJS
for i in {1..5}; do echo "Run $i"; npm run test:mocha:cjs -- --grep "<test_name>"; done
```

### Step 6: Build Verification

```bash
cd <package_dir>
npm run build
npm run test
npm run eslint
npm run format
```

## Common Fixes Reference

| Pattern | Fix |
|---------|-----|
| Missing await | Add `await` before async call |
| Timer-dependent | Use `sinon.useFakeTimers()` or increase timeout |
| Shared state | Move to `beforeEach`, add cleanup in `afterEach` |
| Event race | Use promise-based event waiting pattern |
| Op timing | Flush ops with `provider.ensureSynchronized()` or wait for ack |
| Container state | Wait for `"connected"` event before operating |
| Disposal leak | Add `container.dispose()` in `afterEach` |
