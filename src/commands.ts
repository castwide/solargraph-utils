import * as child_process from 'child_process';
import {Configuration} from './Configuration';

const COMMAND_ENV = {
	shell: true
}

export function solargraphCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		// TODO: pathToBundler configuration
		cmd.push('bundle', 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = COMMAND_ENV;
	if (configuration.workspace) env['cwd'] = configuration.workspace;
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}

export function gemCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('gem');
	var env = COMMAND_ENV;
	if (configuration.workspace) env['cwd'] = configuration.workspace;
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}

export function yardCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		cmd.push('bundle', 'exec');
	}
	cmd.push('yard');
	var env = COMMAND_ENV;
	if (configuration.workspace) env['cwd'] = configuration.workspace;
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}
