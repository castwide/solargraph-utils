import * as child_process from 'child_process';
import {Configuration} from './Configuration';
import { platform } from 'os';
const spawn = require('cross-spawn');
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
		return child_process.spawn('/bin/bash', ['-l', '-c', shellEscape(cmd)], opts);
	} else {
		return spawn(cmd.shift(), cmd, opts);
	}
}

export function solargraphCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		// TODO: pathToBundler configuration
		cmd.push('bundle', 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}

export function gemCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('gem');
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}

export function yardCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('yard');
	var env = commonOptions(configuration.workspace);
	return spawnWithBash(cmd.concat(args), env);
}
