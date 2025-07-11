---
title: "API documentation"
date: 2025-07-11T01:35:05+00:00
draft: false
---
# On the importance of API docs 

__Not toucing Developer Experience and Documentation. IDK if it's that necessary.__

Swagger/OpenAPI 3.0 is deployed at https://blog-backend-psi-rosy.vercel.app/api-docs.

It's very basic, QA-wise, but features can be added there.

_Took a while to deploy Swagger's CSS on Vercel, and the solution is a hackjob._

Swagger is a great manual testing tool on it's own. The point is to get it running first.

Since the BE is not working yet, I'll add some integration tests with a reports server.
And then do some fast TDD debug.
And once api stabilizes, I'd add contract tests. It doesn't take much time, but helps preventing errors.
And then we can look into the security holes in the app. ;)

## Things missing

- API versioning strategy (well, we don't a version bump, too.)
- Documentation for multiple API versions
- Swagger validation

## On the code smell

The code is bad, but the fun is fixing it with tests.
