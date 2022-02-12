import * as child_process from 'child_process';
import {Configuration} from './Configuration';
import { platform } from 'os';
import { rubySpawn } from 'ruby-spawn';

var commonOptions = function(configuration) {
	var opts = {};
	if (configuration.workspace) {
        opts['cwd'] = configuration.workspace;
    }
    if (configuration.shell) {
        opts['shell'] = configuration.shell;
    }
	return opts;
}

export function solargraphCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = commonOptions(configuration);
	return rubySpawn(cmd.shift(), cmd.concat(args), env, true);
}

export function gemCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec');
	}
	cmd.push('gem');
	var env = commonOptions(configuration);
	return rubySpawn(cmd.shift(), cmd.concat(args), env, true);
}

export function yardCommand(args: string[], configuration: Configuration): child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push(configuration.bundlerPath, 'exec');
	}
	cmd.push('yard');
	var env = commonOptions(configuration);
	return rubySpawn(cmd.shift(), cmd.concat(args), env, true);
}
