# Olympus CLI [![Build Status](https://travis-ci.org/olympus-packages/olympus-tools.svg?branch=master)](https://travis-ci.org/olympus-packages/olympus-tools) [![Coverage Status](https://img.shields.io/coveralls/olympus-packages/olympus-tools.svg?branch=master&style=flat)](https://coveralls.io/r/olympus-packages/olympus-tools) [![Node Version](https://img.shields.io/node/v/olympus-tools.svg)](https://www.npmjs.com/package/olympus-tools) [![NPM version](https://badge.fury.io/js/olympus-tools.svg)](http://badge.fury.io/js/firebase-tools)

These are the Olympus Command Line Interface (CLI) Tools. They can be used to:

* Deploy code and assets to your Olympus Modules

## Installation

To install the Olympus CLI, you first need to [sign up for a Olympus account](https://olympus-1bd1a.firebaseapp.com/).

Then you need to install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/). Note that installing Node.js should install npm as well.

```bash
npm install -g olympus-tools
```

This will provide you with the globally accessible `olympus` command.


## Commands

**The command `olympus --help` lists the available commands and `olympus <command> --help` shows more details for an individual command.**

If a command is project-specific, you must either be inside a project directory with an
active project alias or specify the Olympus project id with the `-P <project_id>` flag.

Below is a brief list of the available commands and their function:

### Administrative Commands

Command | Description
------- | -----------
**login** | Authenticate to your Olympus account. Requires access to a web browser.
**logout** | Sign out of the Olympus CLI.
**help** | Display help information about the CLI or specific commands.

Append `--no-localhost` to login (i.e., `olympus login --no-localhost`) to copy and paste code instead of starting a local server for authentication. A use case might be if you SSH into an instance somewhere and you need to authenticate to Olympus on that machine.