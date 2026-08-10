# Debug Session: review-edit-workflow

- Status: OPEN
- Target: `app/admin/career-builder/ai-generator/page.tsx`
- Symptom: Generated template preview appears, but Review & Edit does not reliably open/work.

## Hypotheses

1. The UI has no working action from Preview into Review & Edit, so `currentStep` never changes to `5`.
2. `editingTemplate` is not populated or is reset after generation/navigation, so the editor condition never renders.
3. A button or workflow step exists visually, but its click handler is missing, disabled, or points to the wrong step.
4. The editor updates state, but preview continues reading from a different source (`selectedTemplate` vs `editingTemplate`), making editing appear broken.
5. Local storage hydration restores partial template state that prevents the editor from opening correctly after refresh/navigation.

## Plan

1. Inspect workflow code and identify the intended Preview -> Review & Edit transition.
2. Add temporary runtime instrumentation only.
3. Reproduce in browser and collect evidence.
4. Confirm the root cause and apply a minimal fix.
5. Verify with `npm run typecheck` and `npm run lint`.
