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

var spawnWithBash = function(cmd, opts): child_process.ChildProcess {
	if (platform().match(/darwin|linux/)) {
		// OSX and Linux need to use an explicit login shell in order to find
		// the correct Ruby environment through installation managers like rvm
		// and rbenv.
		var shell = process.env.SHELL;
		if (!shell) {
			shell = '/bin/bash';
		}
		if (shell.endsWith('bash') || shell.endsWith('zsh')) {
			var shellArgs = [shellEscape(cmd)];
			shellArgs.unshift('-c');
			if (shell.endsWith('zsh')) {
				shellArgs.unshift('-l');
			} else {
				shellArgs.unshift('-l');
			}
			console.log('Expanded command for shell', shell, shellArgs);
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
	if (configuration.useBundler || configuration.commandPath == 'solargraph') {
		// When using a bare `bundle` or `solargraph` command, apply shell
		// magic to make sure Ruby installation managers work
		return spawnWithBash(cmd.concat(args), env);
	} else {
		// When using a specified command path, assume shell magic is not
		// necessary
		cmd = cmd.concat(args);
		return crossSpawn(cmd.shift(), cmd, env);
	}
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
