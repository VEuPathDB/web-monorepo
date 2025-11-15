# TypeScript Conversion & Type Safety Guide

This guide documents best practices, lessons learned, and guidelines for converting JavaScript to TypeScript and improving type safety in the VEuPathDB web monorepo.

## Table of Contents

1. [JavaScript to TypeScript Conversion](#javascript-to-typescript-conversion)
2. [Reducing Unsafe Type Assertions](#reducing-unsafe-type-assertions)
3. [Common Patterns in This Codebase](#common-patterns-in-this-codebase)
4. [Specific Component Guidelines](#specific-component-guidelines)
5. [Testing and Verification](#testing-and-verification)

---

## JavaScript to TypeScript Conversion

### General Principles

**Goal:** Convert JavaScript files to TypeScript while maintaining 100% functional compatibility and zero runtime behavior changes.

**Key Rules:**

- Keep class-based components as class-based (don't convert to functional)
- Keep functional components as functional (don't convert to class-based)
- Look for existing TypeScript types in the codebase before creating new ones
- Remove PropTypes in favor of TypeScript interfaces
- Commit and push regularly to avoid losing work

### Conversion Process

#### 1. Preparation

```bash
# Find all JavaScript files to convert
find packages/libs/PACKAGE/src -name "*.js" -o -name "*.jsx"

# Check for existing types
grep -r "interface\|type" packages/libs/PACKAGE/src --include="*.ts" --include="*.d.ts"
```

#### 2. File-by-File Conversion

**For each JavaScript file:**

1. **Read the file** to understand its structure
2. **Identify dependencies** and their types
3. **Create TypeScript version** with proper types:
   - Add `.tsx` extension for JSX files, `.ts` for plain JavaScript
   - Import types from existing TypeScript files where available
   - Create interfaces for component props and state
   - Add type annotations to function parameters and return values
   - Remove PropTypes imports and definitions
4. **Write the converted file**
5. **Delete the old JavaScript file**
6. **Verify compilation** (see Testing and Verification section below)

#### 3. Handling Common Patterns

**React Components:**

```typescript
// Class component
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

interface MyComponentState {
  isExpanded: boolean;
}

class MyComponent extends React.Component<MyComponentProps, MyComponentState> {
  constructor(props: MyComponentProps) {
    super(props);
    this.state = { isExpanded: false };
  }
}
```

**Functional Components:**

```typescript
interface MyFunctionProps {
  value: string;
  onChange: (value: string) => void;
}

const MyFunction: React.FC<MyFunctionProps> = ({ value, onChange }) => {
  // implementation
};
```

**Generic Components:**

```typescript
// For components that work with different data types
interface TableProps<Row> {
  rows: Row[];
  columns: Column<Row>[];
}

class Table<Row> extends React.Component<TableProps<Row>> {
  // implementation
}
```

#### 4. PropTypes Migration

**Before (JavaScript):**

```javascript
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  optional: PropTypes.number,
};
```

**After (TypeScript):**

```typescript
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
  optional?: number;
}
```

### Common Type Imports

**WDK Model Types:**

```typescript
import {
  RecordClass,
  RecordInstance,
  Question,
  AttributeField,
  AttributeValue,
  LinkAttributeValue,
  TableField,
} from '../Utils/WdkModel';
```

**Mesa Types:**

```typescript
import type {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
```

**Category/Ontology Types:**

```typescript
import {
  CategoryTreeNode,
  IndividualNode,
  CategoryNode,
  isIndividual,
} from '../Utils/CategoryUtils';
```

---

## Reducing Unsafe Type Assertions

### Philosophy

Treat `as` as a last resort. The goal is to have TypeScript infer correct types through proper type annotations, not to force types through assertions.

### Decision Tree for Each `as Something`

```
1. Can I fix types at the source?
   ├─ Yes → Add/improve type annotations, generics, discriminated unions
   └─ No → Continue to 2

2. Is this from untyped/poorly typed code (3rd-party, JSON, DOM)?
   ├─ Yes → Use runtime checks + type guards
   └─ No → Continue to 3

3. Is this an allowed case?
   ├─ Yes (unknown/any boundary, DOM, 3rd-party) → Keep but minimize scope
   └─ No → Must refactor to remove
```

### Fix Types at the Source

**❌ Bad: Using `as` to work around poor types**

```typescript
const result = myFunc() as MyType;
```

**✅ Good: Add proper return type to function**

```typescript
function myFunc(): MyType {
  // implementation
}
const result = myFunc(); // Type inferred correctly
```

**❌ Bad: Casting array initialization**

```typescript
const items = [] as MyType[];
```

**✅ Good: Use generic type parameter**

```typescript
// Option 1: Type annotation
const items: MyType[] = [];

// Option 2: Generic reduce
array.reduce<MyType[]>((acc, item) => {
  // ...
}, []);
```

**❌ Bad: Asserting object literals**

```typescript
const config = {
  name: 'test',
  value: 42,
} as Config;
```

**✅ Good: Use `satisfies` for validation**

```typescript
const config = {
  name: 'test',
  value: 42,
} satisfies Config;
```

### Use Runtime Checks and Type Guards

**❌ Bad: Blind assertion**

```typescript
const value = data.value as string;
```

**✅ Good: Runtime check first**

```typescript
const value = typeof data.value === 'string' ? data.value : '';
```

**❌ Bad: Assuming property exists**

```typescript
const text = (obj as any).displayText;
```

**✅ Good: Type guard with proper checks**

```typescript
const text =
  typeof obj === 'object' && obj !== null && 'displayText' in obj
    ? (obj as { displayText: string }).displayText
    : '';
```

**✅ Better: Use proper type from WdkModel**

```typescript
import { LinkAttributeValue } from '../Utils/WdkModel';

const text =
  typeof obj === 'object' && obj !== null && 'displayText' in obj
    ? (obj as LinkAttributeValue).displayText
    : '';
```

### Allowed `as` Cases

**1. Casting from `unknown` or `any` at boundaries (after runtime checks)**

```typescript
function parseData(json: unknown): MyData {
  // Runtime validation
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid data');
  }
  // Now safe to assert
  return json as MyData;
}
```

**2. DOM interactions with specific element types**

```typescript
const button = document.getElementById('myButton') as HTMLButtonElement;
// Acceptable if you know the element exists and is a button
```

**3. Third-party libraries without accurate typings**

```typescript
// Wrap in a small helper rather than scattering assertions
function safeLibCall(input: string): MyType {
  return poorlyTypedLib.method(input) as MyType;
}
```

**4. Non-null assertions after explicit checks**

```typescript
if (!map.has(key)) {
  map.set(key, []);
}
const array = map.get(key)!; // Safe - we just set it
```

### Common Patterns to Improve

**Pattern: Discriminated Unions**

❌ Bad:

```typescript
type Filter = MemberFilter | RangeFilter | MultiFilter;

function process(filter: Filter) {
  if ((filter.value as MultiFilterValue).filters) {
    // use as MultiFilter
  }
}
```

✅ Good:

```typescript
type Filter =
  | { type: 'member'; value: MemberValue }
  | { type: 'range'; value: RangeValue }
  | { type: 'multi'; value: MultiFilterValue };

function process(filter: Filter) {
  if (filter.type === 'multi') {
    // TypeScript knows filter.value is MultiFilterValue
    filter.value.filters.forEach(/* ... */);
  }
}
```

**Pattern: Generic Reduce**

❌ Bad:

```typescript
const result = items.reduce((acc, item) => {
  return { ...acc, [item.id]: item };
}, {} as Record<string, Item>);
```

✅ Good:

```typescript
const result = items.reduce<Record<string, Item>>((acc, item) => {
  return { ...acc, [item.id]: item };
}, {});
```

---

## Common Patterns in This Codebase

### Mesa Component Pattern

Mesa is now fully TypeScript with generic types. Use them!

**✅ Correct Mesa Usage:**

```typescript
import { Mesa } from '@veupathdb/coreui/lib/components/Mesa';
import type {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';

// Define your row type
type MyRow = {
  id: string;
  name: string;
  value: number;
};

// Create properly typed state
const tableState: MesaStateProps<MyRow, string> = {
  rows: myRows,
  columns: myColumns as MesaColumn<MyRow, string>[],
  eventHandlers: {
    onSort: (column: MesaColumn<MyRow>, direction: string) => {
      // TypeScript knows column.key is string
    },
  },
  uiState: {
    sort: {
      columnKey: sortColumn,
      direction: 'asc' as 'asc' | 'desc',
    },
  },
  options: {
    toolbar: true,
  },
};

// Use without assertion
<Mesa state={tableState} />;
```

### WDK Model Pattern

**Attribute Values:**

```typescript
import { AttributeValue, LinkAttributeValue } from '../Utils/WdkModel';

// AttributeValue is: string | LinkAttributeValue | null

function renderValue(value: AttributeValue) {
  if (typeof value === 'object' && value !== null && 'displayText' in value) {
    // TypeScript knows this is LinkAttributeValue
    return <a href={value.url}>{value.displayText}</a>;
  }
  // TypeScript knows this is string | null
  return value;
}
```

### Category Tree Pattern

**Use type guards:**

```typescript
import {
  CategoryTreeNode,
  IndividualNode,
  isIndividual,
} from '../Utils/CategoryUtils';

function processNode(node: CategoryTreeNode) {
  if (isIndividual(node)) {
    // TypeScript knows node is IndividualNode
    const ref = node.wdkReference;
    // ...
  }
}
```

### HOC Wrapping Pattern

Higher-order components often need assertions. This is acceptable:

```typescript
import { wrappable, pure } from '../Utils/ComponentUtils';

export default wrappable(pure(MyComponent as any));
// Acceptable - HOC typing is complex and architectural
```

### Props Spreading Pattern

When spreading props to components with different interfaces:

```typescript
// If the interfaces genuinely differ, assertion may be needed
<ChildComponent {...(props as ChildComponentProps)} />

// But prefer explicit prop passing when possible
<ChildComponent
  prop1={props.prop1}
  prop2={props.prop2}
/>
```

---

## Specific Component Guidelines

### Converting Mesa Components

Mesa components use generics extensively. When converting:

1. **Identify the Row type** - what data is being displayed?
2. **Identify the Key type** - usually `string` for column keys
3. **Use generic parameters** everywhere:

   ```typescript
   interface MyComponentProps<Row> extends MesaStateProps<Row> {
     extraProp: string;
   }

   class MyComponent<Row> extends Component<MyComponentProps<Row>> {
     // ...
   }
   ```

### Converting Record Components

Record components work with WDK model types:

```typescript
import {
  RecordClass,
  RecordInstance,
  AttributeField,
  TableField,
} from '../Utils/WdkModel';

interface RecordComponentProps {
  record: RecordInstance;
  recordClass: RecordClass;
  attributes: AttributeField[];
  tables: TableField[];
}
```

### Converting Form Components

Form components often have complex event handlers:

```typescript
interface FormProps {
  value: FormData;
  onChange: (value: FormData) => void;
  onSubmit: (value: FormData) => Promise<void>;
}

class Form extends Component<FormProps> {
  handleChange = (field: string) => (value: string) => {
    this.props.onChange({
      ...this.props.value,
      [field]: value,
    });
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await this.props.onSubmit(this.props.value);
  };
}
```

---

## Testing and Verification

### Before Committing

**1. Install Dependencies (first time only):**

```bash
# Download and install all dependencies (can take a few minutes)
yarn
```

**2. Build and Verify TypeScript Compilation:**

```bash
# Build wdk-client and its dependencies (cached if no changes)
yarn nx build-npm-modules @veupathdb/wdk-client

# Or, if dependencies are already built, build just wdk-client:
yarn workspace @veupathdb/wdk-client build-npm-modules
```

Must complete successfully with no errors.

**3. Check for Remaining Issues:**

```bash
# Count 'as any' assertions
grep -r "as any" packages/libs/PACKAGE/src --include="*.ts" --include="*.tsx" | wc -l

# Find files with most assertions
grep -r " as " packages/libs/PACKAGE/src --include="*.ts" --include="*.tsx" | \
  grep -v "as const" | cut -d: -f1 | sort | uniq -c | sort -rn | head -20
```

**3. Runtime Testing:**

- If possible, run the application and test affected features
- Check browser console for errors
- Verify no new warnings

### Commit Strategy

**Commit frequently with clear messages:**

```bash
# Good commit messages
git commit -m "Convert Mesa Utils to TypeScript (6 files)"
git commit -m "Fix TypeScript errors in RecordTable (batch 1/3)"
git commit -m "Reduce 'as any' assertions in Answer components"
git commit -m "Improve type safety in Operations.tsx using generics"
```

**Batch related changes:**

- Group by component/feature area
- Keep commits focused and atomic
- Push regularly to avoid losing work

---

## Quick Reference

### Type Import Locations

| Type                                        | Import Path                                   |
| ------------------------------------------- | --------------------------------------------- |
| `RecordClass`, `Question`, `AttributeField` | `../Utils/WdkModel`                           |
| `MesaColumn`, `MesaStateProps`              | `@veupathdb/coreui/lib/components/Mesa/types` |
| `CategoryTreeNode`, `isIndividual`          | `../Utils/CategoryUtils`                      |
| `Step`, `StrategyDetails`                   | `../Utils/WdkUser`                            |

### Common TypeScript Patterns

```typescript
// Generic reduce
array.reduce<ResultType>((acc, item) => { ... }, initialValue)

// Type guard
function isType(obj: unknown): obj is MyType {
  return typeof obj === 'object' && obj !== null && 'property' in obj;
}

// Discriminated union
type Result =
  | { success: true; data: Data }
  | { success: false; error: Error };

// Non-null assertion (after check)
if (map.has(key)) {
  const value = map.get(key)!;
}

// Satisfies (validation without widening)
const config = { ... } satisfies Config;

// Optional chaining + nullish coalescing
const value = obj?.property?.nested ?? defaultValue;
```

---

## Lessons Learned from This Session

### What Worked Well

1. **Parallel agent execution** for converting multiple files simultaneously
2. **Systematic batching** of error fixes (10-15 errors per batch)
3. **Using generic type parameters** instead of `as` assertions
4. **Starting with utilities** before components (bottom-up approach)
5. **Regular commits and pushes** to preserve progress

### Common Pitfalls to Avoid

1. **Don't skip reading existing type definitions** - they often already exist
2. **Don't use `as any` as a first resort** - understand why the type doesn't match
3. **Don't change class/functional component style** during conversion
4. **Don't batch too many changes** - keep commits focused
5. **Don't forget to delete old JavaScript files** after conversion

### Key Insights

- **Mesa's type system** is comprehensive - use it rather than fighting it
- **WDK Model types** are well-defined - import and use them
- **Runtime checks before assertions** make code safer and more maintainable
- **Generic type parameters** are almost always better than type assertions
- **HOC and component spreading** are the main remaining assertion challenges

---

## Future Work Opportunities

### High Priority

- Convert remaining JavaScript in `web-common` packages
- Improve discriminated union patterns in filter components
- Add type guards for complex WDK model interactions

### Medium Priority

- Refactor HOC patterns for better typing
- Create utility type guards for common patterns
- Document component-specific type patterns

### Low Priority

- Review and improve remaining `as` assertions at boundaries
- Consider adding runtime validation libraries (e.g., zod, io-ts)
- Explore stricter TypeScript compiler options

---

## Getting Help

**When stuck on a type issue:**

1. Check this guide for similar patterns
2. Search the codebase for existing solutions: `grep -r "similar pattern"`
3. Look at recently converted files for examples
4. Check TypeScript docs for the specific feature
5. Consider if the type issue reveals a real bug

**Resources:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- VEuPathDB web-monorepo existing TypeScript files (best examples)

---

_Last updated: 2025-11-15_
_Session: JavaScript to TypeScript conversion and type safety improvements_
