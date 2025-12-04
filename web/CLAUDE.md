# Project Overview

CourseCast is a Next.js web application that runs Monte Carlo simulations in the browser to simulate possible schedule outcomes from the Course Match system of the Wharton School of the University of Pennsylvania. The simulation runs are backed by a model that predicts the closing price for all of the courses in a given semester. Each simulation run is essentially a randomly seeded linear programming solver whose output determines which classes have been selected for that run.

After several simulation runs, the probabilities of obtaining a particular course and a particular schedule configuration are aggregated, computed, and displayed to the user. This allows the user to iteratively tweak and play around with their course utilities and see how their provided utilities affect their chances to obtain courses and schedules.

## Architecture

- `public/<term>-courses.parquet`: precomputed tabulation of all course metadata, random seeds, and price prediction weights (e.g., `2025C-courses.parquet` for Fall 2025)
- `src/app`: main Next.js router code and serves as the entry points of the web application
- `src/components/ui`: styled shadcn components for React
- `src/convex/schema.ts`: primary data model of the app powered by Convex
- `src/convex/_generated`: auto-generated files by Convex derived from `src/convex/schema.ts`
- `src/data/fixed-core/index.ts`: script that processes the raw fixed core data from the curriculum
- `src/data/regular-courses/index.ts`: script that processes the regular courses and their metadata
- `src/data/index.ts`: script that combines the `src/data/fixed-core/index.ts` and `src/data/regular-courses/index.ts` outputs to produce the precomputed conflict groups for the `public/<term>-courses.parquet` file
- `src/features`: imported by the routes that implement a feature end-to-end from interface to back-end business logic
- `src/lib`: common utilities shared by many feature modules
- `src/test/setup.ts`: initialization script for all Vitest invocations

# Code Style

This section discusses the strongly preferred coding practices in the Next.js + React project.

## Avoid state variables as much as possible

Wherever possible, prefer derived values and props when writing components. State variables should only be necessary for components that need to maintain a view over a certain piece of data. And even then, these state variables must be as locally scoped as possible to keep the rest of the component tree stateless.

Avoid declaring state at the top level or too high up the component tree. Keep stateful components as low as possible in the component tree. The ideal world is having the UI be purely a function of its props with some state sprinkled in to maintain views.

## Mindful component boundaries are the key to containing state

Expounding on the importance of stateless components, be extra mindful about component boundaries and where state variables are declared.

If a subtree of component contains a stateful component that will only be conditionally rendered, scope the state variables to within that subtree only. Do **NOT** hoist the state variables to the main component and instead refactor the component so that the stateful subtree is its own subtree. In doing so, the `useState` and other hooks will be conditionally rendered as well.

```tsx
function ShowDialogButton() {
  // This state is too far up the component tree.
  // Observe that this will only be used within `<DialogContent>`,
  // a component that is conditionally rendered by the `<Dialog>`.
  const [state, _] = useState(...);
  return (
    <Dialog>
      <DialogTrigger />
      <DialogContent>
        {state}
      </DialogContent>
    </Dialog>
  );
}
```

```tsx
function ShowDialogButton() {
  // The correct way to implement this is to move the state lower
  // down the component tree.
  return (
    <Dialog>
      <DialogTrigger />
      <DialogContent>
        <InnerContent />
      </DialogContent>
    </Dialog>
  );
}

function InnerContent() {
  // Now this is where the state belongs.
  const [state, _] = useState(...);
  return state;
}
```

```tsx
// This technique also comes up in conditional rendering with ternaries.
function Conditional({ maybeNumber }: { maybeNumber: number | null }) {
  return maybeNumber === null ? null : <Inner value={maybeNumber} />; // maybeNumber: number
}

function Inner({ value }: { value: number }) {
  // Locally scoped state is the right way to go!
  const [state, _] = useState(value);
  return state;
}
```

The only exception to this rule is when the state is intentionally hoisted outside of the conditional block so that it persists between mounts. Consider this use case as the only valid exception to the rule.

Of course, it is worth reiterating that no state at all is better than having state. Stateless components are easier to debug and maintain, but if state is necessary, we should at least keep them locally scoped and contained in the smallest possible subtree.

## Try the Context API for simple sibling state sharing

For simple state sharing where `useState` is sufficient, use the Context API if prop-drilling causes parent components to be dumb prop forwarders. Prop-drilling is fine if the parent components themselves use/render the prop, but if it's only required by the parent component as a means of forwarding to a child component, then the Context API is a more appropriate mechanism.

```tsx
// Not good because the `Parent` is just plainly forwarding the props.
// Pedantically speaking, the `Parent` doesn't actually care about this value.
function Parent(props) {
  return <Child {...props} />;
}

// It's actually the `Child` that needs the `value` prop rather than the `Parent`.
function Child({ value }) {
  return <span>{value}</span>;
}
```

```tsx
// The better approach is to initialize a context at the top level so that the
// prop-drilling can "skip" levels in the component tree. This results in better
// app performance because re-renders will be more fine-grained and surgical.
const Value = createContext(...);
function useValue() {
  return useContext(Value);
}

function Grandparent() {
  const [value, _] = useState(...);
  return (
    <Value.Provider value={value}>
      <Parent />
    </Value.Provider>
  );
}

// No more prop-drilling! Good!
function Parent() {
  return <Child />;
}

// Value is only subscribed to where it's needed. This lets the subscription "skip" a level.
function Child() {
  const value = useValue();
  return <span>{value}</span>;
}
```

As far as context design goes, enforce that only a single `useState` should be wrapped by the context to ensure state atomicity. You may then have as many simple actions as needed for modifying the state variable.

```tsx
const AtomicState = createContext(null);
function AtomicStateProvider({ init, children }) {
  const [state, setState] = useState(init); // no other `useState` allowed!
  const derived = useMemo(..., [state]); // cached computed values here
  const someAction = useCallback(() => setState(old => ...), []); // mutating actions
  const otherAction = useCallback(() => setState(old => ...), []);

  // Memoized so that the `value` does not create a new object instance every run
  const value = useMemo(
    () => ({ state, derived, someAction, otherAction }),
    [state, derived, someAction, otherAction],
  );

  return (
    <AtomicState.Provider value={value}>
      {children}
    </AtomicState.Provider>
  );
}

/** Destructure the state for better prop stability. */
function useAtomicState() {
  const state = useContext(AtomicState);
  assert(state !== null, "no state provider found");
  return state;
}
```

```jsx
// The `useAtomicState` is meant to be destructured to ensure
// the identity stability of the values.
function Consumer() {
  // Other props are ignored.
  const { state, someAction } = useAtomicState();
}
```

## Use Jotai or Zustand for complex state sharing

If the Context API is too unwieldly for a use case that requires complex state sharing with coordinated state variables, use Jotai or Zustand as the state management library. Default to Jotai if Zustand is not already being used in the project. Jotai is preferred because it is more fine-grained.

Instead of the Context API patterns from the previous section, use Jotai atoms or Zustand stores to support the same behavior, but with a more streamlined, ergonomic, and composable API for coordinating related state variables via actions.

- For Jotai: use the idiomatic write-only atom pattern for actions.
- For Zustand: use the regular stores to define the related variables alongside the actions.

## Aggressively memoize non-constant-time operations wherever necessary

All operations that perform beyond O(1) time complexity **MUST** be aggressively memoized with `useMemo`. There are no exceptions.

Prefer atomically memoizing variables as much as possible to keep dependency arrays small and fine-grained. Keep the memoization tightly scoped to avoid pulling in outside variables into the closure. The fewer the dependencies, the better it is for the performance of the app.

```tsx
// This is an example of poor memoization. If any of the dependencies change,
// the entire closure is re-executed even though the change is unrelated.
const { httpClient, apiClient, total } = useMemo(() => {
  const httpClient = createHttpClient(httpUrl);
  const apiClient = new ApiClient(apiBaseUrl);
  const total = items.reduce((total, curr) => total + curr, 0);
  return { httpClient, apiClient, total };
}, [httpUrl, apiBaseUrl, items]);
```

```tsx
// This is the correct way to memoize the operation above. The memoization is
// fine-grained and surgical. Compute is only rerun when absolutely necessary.
const httpClient = useMemo(() => createHttpClient(httpUrl), [httpUrl]);
const apiClient = useMemo(() => new ApiClient(apiBaseUrl), [apiBaseUrl]);
const total = useMemo(() => items.reduce((total, curr) => total + curr, 0), [items]);
```

On the other hand, simple constant-time derived values must be recomputed to eliminate code noise and memoization boilerplate. However, if such a derived value will be used to another non-constant-time operation, use the derived value as the dependency key instead of its components.

```tsx
// This is an example of poor memoization. The memoization unnecessarily recomputes
// the tree if any one of `query.isPending` or `mutation.isPending` changes.
const nodes = useMemo(
  () => render(query.isPending || mutation.isPending),
  [query.isPending, mutation.isPending],
);
```

```tsx
// In reality, what we actually want is to memoize based on the derived value, not its components.
const isPending = query.isPending || mutation.isPending;
const nodes = useMemo(() => render(isPending), [isPending]);
```

The overarching theme is that we should minimize the length of the dependency array as much as possible so that state updates are fine-grained and surgical.

## Aggressively memoize callback functions

Analogously, all callback functions must be memoized unless React Compiler is turned on in the codebase. For Next.js projects, this can be checked in the `next.config.js` file. For Vite projects, this can be checked in the `vite.config.js` file.

Otherwise, default to aggressively memoizing callback functions.

## Event handlers must strongly prefer extracting parameters from the callback argument versus extracting from the closure

Instead of registering memoized closures with dependencies as an event listener, prefer to embed the arguments and metadata in the `data-*` attributes of an HTML element. That way, one can obtain the arguments via the `event.currentTarget.dataset` map—zero dependencies required.

```tsx
// This should be avoided as much as possible to because
// a state change can invalidate the memoized callback.
function Button({ state, children }) {
  const action = useCallback(..., [state]);
  return (
    <button type="button" onClick={action}>
      {children}
    </button>
  );
}
```

```tsx
// Instead, prefer hoisting the event to the top level
// and receiving its arguments via the `event.currentTarget`.

function handleClick(event) {
  const state = event.currentTarget.dataset["state"];
  // TODO
}

function Button({ state, children }) {
  return (
    <button type="button" onClick={handleClick} data-state={state}>
      {children}
    </button>
  );
}
```

## Use affirmative conditional logic

In conditional logic, it's easy to accidentally introduce double negatives in the code.

```ts
// Here is an example of a poorly formulated conditional branch.
if (!condition) {
  // Double negative: if "not condition", then "do not resolve".
  reject();
} else {
  // The `else` block is already an implicit negation of the condition.
  resolve();
}
```

```ts
// For better readability, strongly prefer affirmative logic.
if (condition) {
  // Flipping the logic makes it much more readable!
  resolve();
} else {
  // No double negation here!
  reject();
}
```

```ts
// Ternary conditions are also prone to this.
const bad = !condition ? b : a;
const good = condition ? a : b;
```

Read more about how to detect and avoid confusing conditionals from [this article](https://dev.to/somedood/please-dont-write-confusing-conditionals-2n32).

## Be explicit with conditional clauses

Avoid relying on JavaScript's implicit coercion. To make the intent of the code clearer, use the `typeof` operator or an explicit equality check instead of implicitly coercing the value to a boolean.

```ts
let input: number | null;

if (input) {
  // This is bad because it's not apparent that the programmer
  // intended to exclude `0` as a valid input.
}

if (input !== null) {
  // This is much better because the condition explicitly checks the null case.
}

if (input !== null && input !== 0) {
  // We can restore the original behavior by explicitly checking for zero.
  // This is more verbose, but the intent is much clearer.
}
```

This principle also holds true for conditional rendering in React. Avoid using the `&&` operator as a means to conditionally render a component because the implicit coercion might not be what we want.

```tsx
function BadConditionalRendering({ condition }) {
  // Avoid doing this
  return condition && <Inner />;
}
```

```tsx
function GoodConditionalRendering({ condition }) {
  // Prefer being explicit
  return condition === null ? null : <Inner />;
}
```

## Strongly prefer type inference wherever possible

Explicitly having to annotate the types of a variable is not bad, but it is often an indication of poor interface design. Strive to write interfaces and module boundaries that are easily inferrable.

Note that sometimes type annotations are unavoidable to satisfy the type safety guarantees of TypeScript. Treat these as exceptions to the rule. Examples include but are not limited to:

- Casting `never[]` to `T[]` for some particular type `T`
- Annotating the collected value of a `Array#reduce` operation
- Annotating initially empty state such as `useState<number>()` (but do prefer an inferrable reasonable default argument whenever possible)
- Class field annotations

## Never use the non-null assertion operator

Always validate unknown types at runtime. Use libraries like Valibot or Zod to assert that certain values are in the shape that they claim to be. If you are sure that a value cannot be `null` or `undefined`, do not hesitate to assert it. It is much better to crash early in development versus proceeding with unexpected state in production.

Use whichever schema validation library is available in the project. Default to Valibot if none are available yet.

# Libraries

This section focuses on opinionated usage of certain libraries.

## TanStack Query

The loader logic, which includes the pending and error states, should be decoupled from the presentation logic of the data. This makes the component more testable because we can easily mock the payload as a prop without needing to mock the entire async infrastructure.

```tsx
function fetchExample({ queryKey: [_, arg] }) {
  // TODO: use the `arg` from the `queryKey` to fetch data.
}

function useFetchExampleQuery(arg: string) {
  // Wrap the query in a custom hook.
  return useQuery({
    // Note that we pass in arguments via the `queryKey`.
    queryKey: ["example", arg],
    queryFn: fetchExample,
  });
}

function TestablePresentationLayer({ data }) {
  // TODO: Render the data here somehow.
}

function DataLoader({ arg }) {
  const query = useFetchExampleQuery(arg);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} />;
  return <TestablePresentationLayer data={query.data}>;
}
```

Observe that this architecture is consistent with the previous guideline on conditional rendering. By enforcing a testable presentation component devoid of loading logic, we also gain the ability to invoke and initialize hooks only at that conditional subtree.

## TanStack Table

A core part of the TanStack Table API is the column definition. The `useReactTable` hook requires a `columns` prop, which is an array of `ColumnDef` objects. Ideally, the `columns` should be hoisted at the top level so that they aren't redefined for every re-render. In the simple case, it _is_ possible to hoist it as a top-level `const`. However, as soon as we need to parameterize the `columns` with some props, that's when we need to resort to `useMemo`.

This is fine, but as we would like to avoid dependency arrays, we should instead rely on the `TableMeta` to pass meta arguments to each column definition.

```tsx
// This is how we tell TanStack Table that the `table.options.meta`
// contains an optional `arg` that we can pass to the columns.
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onClick?: string;
  }
}

function DataTable({ data, onClick }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onClick }, // use `table.options.meta` as the means to pass props to columns
  });

  // Memoize the rows just in case they haven't changed.
  const { rows } = table.getRowModel();
  const nodes = useMemo(() => rows.map(...), [rows]);

  return (
    <Table>
      <TableBody>
        {nodes}
      </TableBody>
    </Table>
  )
}

const helper = createColumnHelper<T>();
const columns = [
  helper.accessor("example", {
    // We can receive the prop here even though the `columns` were
    // defined at the top level. Just make sure to properly handle
    // the `undefined` case. Alternatively, an assertion is possible.
    cell: cell => (
      <Button type="button" onClick={cell.table.options.meta?.onClick}>
        {cell.getValue()}
      </Button>
    ),
  }),
]
```

Note that the `declare module` will cause interface merging at the global namespace. That's why it has to be optional so that other users of `useReactTable` will not be required to pass in irrelevant props.

# Architecture

The project must be structured in accordance with the principles of vertically sliced architectures. Instead of partitioning the project structure by language, technology, or architecture layer, it should instead be partitioned by end-to-end feature modules with some shared modules between them.

The following is an example of a horizontally sliced architecture, which is discouraged. Observe that editing a single feature (e.g., login) requires jumping and context-switching between multiple folders. It is also difficult to track which modules depend on which modules based on the folder structure alone.

```
.
├── components/
│   └── ui/
├── hooks/
├── models/
│   └── login-model.ts
├── views/
│   └── login-view.tsx
└── controllers/
    └── login-controller.ts
```

Prefer a vertically sliced architecture such as the following example, where a single feature module is implemented end-to-end from the database to the server actions to the user interface. Keeping everything self-contained at the feature boundary collocates related logic and makes it easier to maintain the codebase.

```
.
├── components/
│   └── ui/
├── hooks/
├── database/
└── features/
    ├── login/
    │   ├── index.tsx
    │   ├── form.tsx
    │   ├── schema.ts
    │   └── actions.ts
    └── logout/
        └── index.tsx
```

Here are some common file names:

- `index.tsx`: the entry point component that represents the feature (usually a button)
- `form.tsx`: form-related logic (which may contain stateful components) and usually contains the `<form>` element
- `actions.ts`: server actions related to the form submission
- `schema.ts`: common Valibot or Zod schemas to be shared between the client and server

Read more about vertically sliced architectures from [this article](https://dev.to/somedood/youre-slicing-your-architecture-wrong-4ob9).
