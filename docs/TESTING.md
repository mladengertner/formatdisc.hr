# Testing Guide - SlavkoKernel v12

## Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── slavko-kernel-v12.test.ts   # Core kernel tests
└── integration/                # Integration tests (future)
```

## Coverage Targets

| Component | Coverage | Status |
|-----------|----------|--------|
| SlavkoKernel | 90%+ | ✅ |
| Heuristics Engine | 85%+ | ✅ |
| Routing Logic | 95%+ | ✅ |
| Fallback | 100% | ✅ |

## CI/CD Integration

Tests run automatically on:
- Push to `main`
- Pull requests
- Pre-deployment checks

See `.github/workflows/ci-cd.yml` for pipeline details.
