# Copilot Instructions: Angular 22 Project

## Stack
- Angular 22 with standalone APIs only. Do not create NgModules.
- TypeScript with `strict` mode. Avoid `any`. Use `unknown` and narrow it.
- Tailwind CSS for styling. Match the Tailwind setup already in the project.
- Docker and Docker Compose for local development and deployment.
- Before using any API, check that it exists in the installed Angular version.

## Project Structure
- `src/app/core/`: singleton services, interceptors, guards, app-wide config.
- `src/app/shared/`: reusable presentational components, pipes, and directives with no feature logic.
- `src/app/features/<feature>/`: feature components, services, models, and routes.
- Lazy-load every feature route.
- Keep one concern per file. Name files in kebab-case with a type suffix: `user-card.component.ts`, `user.service.ts`, `user.model.ts`.

## Angular Conventions
- Use `inject()` for dependency injection, not constructor parameters.
- Use signals for component state. Use `computed()` for derived state. Use `effect()` only when no simpler option works.
- Use `input()`, `output()`, and `model()` instead of `@Input`, `@Output`, and `@ViewChild`-style decorators where a signal equivalent exists.
- Use `host` metadata instead of `@HostBinding` and `@HostListener`.
- Use the new control flow: `@if`, `@for` (always with `track`), `@switch`.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Do not set `standalone: true` explicitly. It is the default.
- Keep components thin. Put data access and business logic in services. Components only handle presentation and user interaction.
- Components depend on services, not on `HttpClient` directly.
- Use typed reactive forms for forms with validation.
- Type all HTTP responses with interfaces or types in a `*.model.ts` file.
- Handle loading, empty, and error states in every data-driven view.

## SOLID and Clean Code
- **Single Responsibility:** each class, component, or function does one thing. Split files that grow past that.
- **Open/Closed:** extend behavior through inputs, composition, or injection tokens, not by editing stable code.
- **Liskov Substitution:** implementations of an interface must honor its contract.
- **Interface Segregation:** keep interfaces small and focused. Do not create wide interfaces.
- **Dependency Inversion:** depend on abstractions. Use `InjectionToken` when a dependency has multiple implementations or needs to be swapped for tests.
- Do not over-engineer. Do not add an abstraction, generic, or layer until it has a real, current use. Prefer the simplest code that works.
- Use early returns, `readonly` where possible, and immutable updates.
- Name booleans as `is`, `has`, or `can` prefixes. Name constants in UPPER_SNAKE_CASE. Do not leave magic numbers or strings inline.
- Remove dead code. Do not leave commented-out code.

## Styling (Tailwind)
- Use utility classes in templates.
- Build mobile-first. Use responsive prefixes such as `md:` and `lg:`.
- When the same set of classes repeats, extract a component. Use `@apply` only when a component abstraction is not practical.
- Avoid component CSS files unless Tailwind cannot express the style.

## Accessibility and Security
- Use semantic HTML. Give form controls labels. Support keyboard navigation.
- Never bind untrusted content with `innerHTML` or `bypassSecurityTrust*`.
- Never hardcode secrets, tokens, or URLs that differ by environment. Read them from environment configuration.

## Testing
- Use the test runner already configured in the project.
- Write unit tests for services and pure logic.
- Write component tests for user-visible behavior.
- Name tests `should ...` and keep each test focused on one behavior.
- Mock HTTP with the testing utilities in the project, not real network calls.

## Docker
- Use a multi-stage `Dockerfile`: build the Angular app in a Node stage, then serve the static output from a minimal runtime image.
- Run the container as a non-root user.
- Pin base image versions. Do not use `latest`.
- Include a `.dockerignore` that excludes `node_modules`, `dist`, `.git`, and env files.
- Do not copy secrets into the image. Pass them at runtime through environment variables or Compose secrets.
- Keep `docker-compose.yml` for local development with a bind mount and polling for file changes. Add a separate production Compose file or profile if needed.
- Add health checks to services.

## Workflow
1. Before writing code, give a short plan: files to create or change, and the reason for each.
2. If a requirement is ambiguous, ask before coding.
3. Make minimal, focused changes. Do not rewrite unrelated code.
4. After code changes, provide the commands to verify them: `ng build`, the test command, and `docker compose up --build`.
5. Briefly explain any non-obvious design decision.