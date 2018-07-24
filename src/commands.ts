import * as child_process from 'child_process';
import {Configuration} from './Configuration';
import { platform } from 'os';
const crossSpawn = require('cross-spawn');
const shellEscape = require('shell-escape');

var commonOptions = function(workspace) {
	var opts = {};
	if (workspace) {
		opts['cwd'] = workspace;
	}
	return opts;
}

var mayNeedLoginShell = function(): Boolean {
	// OSX and Linux may need to use an explicit login shell in order to find
	// the correct Ruby environment through installation managers like rvm and
	// rbenv.
	return platform().match(/darwin|linux/)
		&& !process.env.rvm_version
		&& !process.env.RBENV_SHELL
		&& !process.env.RUBY_VERSION;
}

var spawnWithBash = function(cmd, opts): child_process.ChildProcess {
	if (mayNeedLoginShell()) {
		var shell = process.env.SHELL;
		if (!shell) {
			shell = '/bin/bash';
		}
		if (shell.endsWith('bash') || shell.endsWith('zsh')) {
			var shellArgs = ['-l', '-c', shellEscape(cmd)];
			return child_process.spawn(shell, shellArgs, opts);
		} else {
			return crossSpawn(cmd.shift(), cmd, opts);
		}
	} else {
		return crossSpawn(cmd.shift(), cmd, opts);
	}
}

export function solargraphCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}

export function gemCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec');
	}
	cmd.push('gem');
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}

export function yardCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec');
	}
	cmd.push('yard');
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}
