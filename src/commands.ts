import * as child_process from 'child_process';
import {Configuration} from './Configuration';

export function solargraphCommand(args:Array<String>, configuration:Configuration):child_process.ChildProcess {
	let cmd = [];
	if (configuration.useBundler && configuration.workspace) {
		// TODO: pathToBundler configuration
		cmd.push('bundle', 'exec', 'solargraph');
	} else {
		cmd.push(configuration.commandPath);
	}
	var env = { shell: true };
	if (configuration.workspace) env['cwd'] = configuration.workspace;
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}
