import * as child_process from 'child_process';

export function solargraphCommand(args:Array<String>, workspace:String, useBundler:Boolean) {
    let cmd = [];
    if (useBundler && workspace) {
        // TODO: pathToBundler configuration
        cmd.push('bundle', 'exec', 'solargraph');
    } else {
        cmd.push('solargraph');
    }
    var env = { shell: true };
    if (workspace) env['cwd'] = workspace;
    return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}
