import * as child_process from 'child_process';
import {Configuration} from './Configuration';
import { platform } from 'os';

var commonEnvironment = function(workspace) {
	var env = {};
	if (platform().match(/darwin|linux/)) {
		env['shell'] = '/bin/bash';
	} else {
		env['shell'] = true;
	}
	if (workspace) {
		env['cwd'] = workspace;
	}
	return env;
}

export function solargraphCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		// TODO: pathToBundler configuration
		cmd.push('bundle', 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = commonEnvironment(configuration.workspace);
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}

export function gemCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('gem');
	var env = commonEnvironment(configuration.workspace);
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}

export function yardCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('yard');
	var env = commonEnvironment(configuration.workspace);
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}
