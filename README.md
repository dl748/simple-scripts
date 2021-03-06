# @dl748/simple-scripts

Multitier Scripting System

## Installation

Should be run as a local developer dependency of the project, but you can install globally if you want.
```
npm install --save-dev @dl748/simple-scripts
```
Utilizes [interpret](https://www.npmjs.com/package/interpret)'s database to determine which script files to load and what loader to use to execute it. This allows the system to support many different javascript superset languages including TypeScript.

Note: formats that do not allow for function definitions are not supported.

For example to add support for TypeScript, just install the loaders needed to support it.
```
npm install --save-dev ts-node typescript
```

## Running

Basic
```
npx simplescripts
```

You can also use alias's or doskey's when running to make the commands smaller

*nix bash/csh
```
alias ss="npx simplescripts"
```

windows cmd.exe
```
doskey ss=npx simplescripts $*
```

## Configuration

System utilizes one or more script files, with the base in whatever directory is being executed, scripts.js (scripts.ts/etc)

```javascript
module.exports = async(scripts) => {
  await scripts.register('action', async() => {
    // do action here
  });
}
```

## Samples

script.ts Sample
```typescript
import type { ISimpleScripts } from '@dl748/simple-scripts';

export default async(scripts: ISimpleScripts): Promise<void> => {

};
```

### Multitiered example

Say you have several 'projects', a frontend, backend, mobile, and then you have a common base project

```javascript
// common/script.js
module.exports = async(scripts) => {
  await scripts.register('build', async(args) => {
    console.log('Building Common');
  });
  await scripts.register('build', async(args) => {
    console.log('Testing Common');
  });
}
```

```javascript
// backend/script.js
module.exports = async(scripts) => {
  await scripts.register('build', async(args) => {
    console.log('Building Backend');
  });
  await scripts.register('test', async(args) => {
    console.log('Testing Backend');
  });
}
```

```javascript
// frontend/script.js
module.exports = async(scripts) => {
  await scripts.register('build', async(args) => {
    console.log('Building Frontend');
  });
  await scripts.register('test', async(args) => {
    console.log('Testing Frontend');
  });
}
```

```javascript
// mobile/script.js
module.exports = async(scripts) => {
  await scripts.register('build', async(args) => {
    console.log('Building Mobile');
  });
  await scripts.register('test', async(args) => {
    console.log('Testing Mobile');
  });
}
```

```javascript
// scripts.js
module.exports = async(scripts) => {
  await scripts.importSubdirectories();
  await scripts.register('build', async(args) => {
    const buildScripts = await getScripts('build', {
      minDepth: 1,
      maxDepth: 1,
    });
    await scripts.run(buildScripts.filter((v) => v==='build:common'));
    await scripts.run(buildScripts.filter((v) => v!=='build:common'));
  });
  await scripts.addPassthroughScripts();
}
```

In the root script.js, we import all scripts from any subdirectory that has a script.js file, (common/frontend/mobile/backend).
This creates the following scripts
```
build:backend
test:backend
build:common
test:common
build:frontend
test:backend
build:mobile
test:mobile
```

This does not create build or test in the context of the main script.

Next we register a new build script. The reason for this, is that common, is a dependency for all the other projects (common library). So it needs to be built first. So we do a run on build:common, then async everyone else. Note: Only asking for scripts exactly one level deep, or one directory. Do not want any past that, nor the ones being defined.

Next is adding the addPassthroughScripts. Because we preregistered build, it does not create a passthrough script for it, however it does create a 'test' script that passthroughs all the test onto the other. Now this could be the same as the build if tests require the common library to be built as well.

* build -> build:common, [ build:frontend, build:backend, build:mobile ]
* test -> [ test:common, test:frontend, test:backend, test:mobile ]

The simplescripts command utilizes the context directory it is run in.

Running `npx simplescripts build:common` is the same as `cd common; npx simplescripts build`. This allows developers that may be working on a single project to change to that directory and only run commands for that project.

If you have a subproject that is a part of the npm install, e.g. common/shared for utilities shared by all projects `"common/shared": "file:common/shared"`, in your root projects directory. This will have a package.json in the common/shared directory and will confuse the `npx` command.  If you wish to run commands from a subdirectory with a package.json, you should add the original node_modules executable to your PATH variable.

From the root projects directory
* *nix
```
export PATH="$PATH:$(pwd)/node_modules/.bin"
```

* windows
```
set PATH=%PATH%;%CD%\node_modules\.bin
```

## API Reference

Scripts object that is passed into script files contain the following functions. All functions return a Promise that must be resolved, and will not return a value unless specified, mostly used to pass on or handle errors

### addPassthroughScripts(scriptDefinitions?, options?)
This function is normally called AFTER importSubdirections, it creates action scripts for anything one level deep that hasn't been defined as and runs them for this level. For example, if you have a frontend and backend that have a build action, it'll will create a script at this level that will run both of those scripts when run.

* scriptDefinitions - optional - Contains a list of defintions to apply to the script if created, its an object with a key of action, and value of description/arguments similar to the register function

```javascript
{
  build: {
    description: 'this is the main build script',
    arguments: {
      mode: 'this is the mode to use for all subscripts'
    }
  }
}
```

* options
    * synchronous? - boolean default false, by default all scripts will run asynchronous

### getScripts(action, options?) -> string[]
This function will get a list of all the scripts at the current level and up. All functions are returned in the context of the script file running them. Returns a promised string array.

* action - required - The action to search for
* options - optional
    * maxDepth? - number - default is undefined - how far deep you want to get scripts for
    * minDepth? - number - default is 0
    * path? - string - override path to search from

### import(directory)
Imports a single directory (looks for script.* files and attempts to load them using interpret's loader db)

* directory - required

### importSubdirectory(path?)
Attempts to import all subdirectories from the context of the scripts files location, that contains a script.* file

* path - optional - Override the path used to search for subdirectories

### register(action, callback, options?)
Registers a new action and the callback to run when action is called

* action - required - Name of action to perform (e.g. build, lint, test)
* callback - required - Asynchronous function to perform, can return a promise (typescript Promise<void>) if needed.
* options - optional
    * arguments? - object of string/string, contains descriptions of options for the script
    * description? - string, description to display for the action
    * path? - string, context path override for the registration

### removeFiles(path)
Recursively removes files and directories - this is useful for scripts that do "cleaning" or allow the system to remove generated files into a clean state. The files are deleted from the context of the script file.

* path - required - string or array of string - list of files or directories to remove

### run(scripts, options?)
Will run one or multiple scripts

* scripts - required - string or array of string - List of scripts to run (e.g. 'clean' or [ 'build:frontend', 'build:backend' ])
* options - optional
    * synchronous? - boolean - scripts are executed synchronously or not, default is false
    * path?: string - context path override for function

### runShell(cmd, args, options?)
Runs a script using the shell (specifically child_process.spawn). Output is redirected to the current stdout, throws an exception if the process exits with a non zero error code.

* cmd - required - string
Command to run

* args - required - array of string
Arguments to pass to the command. The reason for the array instead of a single string is so that its easier to double quote parameters and make them safe to pass through to the shell. Double quotes are used because they are supported by both *nix and windows, where single quotes are only supported by *nix.

* options - optional
    * cwd? - string - set the current working directory of the command, default is the same directory as the script file
    * enviroment?: Record<string, string | null> - Allows you to set Environment variables to calling program, call will pass in all process environments as well, and anything you specify will override these. So if you want to NOT send a environment variable, use a value of null.
    * asNPX - boolean - default false - runs command as npx, all it does is translated cmd, args into 'npx', [ cmd, ...args ]

### runShellOutput(cmd, args, options?)
See runShell for argument definitions, the only difference is that this function returns a string from the promise, that way you can get the output, useful for pulling in generated data, (e.g. 'npx', [ 'serverless', 'print', '--json' ], allows you to dynamically pull in the translated serverless json file to use or write out somewhere.). Currently does not pull in stderr, stderr is passed through.

## Documentation for running in internal tools

Example

```javascript
import { SimpleScripts } from '@dl748/simple-scripts';

(async() => {
  await SimpleScripts({
    cli: true,
    cliArguments: [ 'build', '--mode=development' ]),
  });
})();

// Or

SimpleScripts({
  cli: true,
  cliArguments: [ 'build', '--mode=development' ]),
}).then(() => {
  // completed
}).catch((e) => {
  // errored
})

```

Note: if you have scripts that do watching, or as a webserver, it may never returned from this function.

### Options

* cli - boolean - run as a cli - this processes arguments from the command line or override, default is false
* cliArguments - Array of string - represents the command line arguments to process, default is process.argv.slice(2)
* color - string - auto/always/never - default is auto, but an invalid value is never
    * auto - determines if stdout is a tty/terminal, and will send colors if determined so
    * always - always send colors even if not using a terminal (e.g. piping to less or more)
    * never - never use colors
* cwd - string - set the current working directory when calling the script (location it looks for initial script.* file), default is process.cwd()
* quiet - boolean - send output to stdout - default is false
* script - script to run, required if cli is false, it is the script to run
* scriptArguments - object of string/booleans - these are the arguments sent to the script and every subscript
* scriptBaseName - string - overrides the base name of the script file (e.g. 'myUberScript' will look for  myUberScript.* files instead of scripts.* files) default is 'scripts'
* synchronous - boolean - provides the default to utilized when running multiple subscripts, default is false so it will execute asynchronously
