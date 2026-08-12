---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: Scanner
description:
---

# My Agent

Scan all pull requests and merge that branch if it is working properly and has no error in deployment, if not, do not merge that branch and cancel that pull request.
