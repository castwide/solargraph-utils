import * as child_process from 'child_process';
import * as request from 'request';

export default class SolargraphServer {
	private child:child_process.ChildProcess = null;
	private port:string = null;
	private pid:number = null;

    private useBundler:boolean = false;
    private commandPath:string = null;
    private views:string = null;
    private workspace:string = null;

	public constructor() {
		this.configure();
	}

	public isRunning():Boolean {
		return (this.child != null && this.port != null && this.pid != null);
	}

	public getPort():string {
		return this.port;
	}

    public configure(options = {}) {
        this.commandPath = options['commandPath'] || 'solargraph';
        this.useBundler = options['useBundler'] || false;
        this.views = options['views'] || null;
        this.workspace = options['workspace'] || null;
    }

	public start():Promise<Object> {
		return new Promise((resolve, reject) => {
			var started = false;
			if (this.child) {
				console.warn('There is already a process running for the Solargraph server.');
			} else {
				console.log('Starting the server');
				var args = ['server', '--port', '0'];
				if (this.views) {
					args.push('--views', this.views);
				}
				this.child = this.solargraphCommand(args);
				this.child.stderr.on('data', (data) => {
					var out = data.toString();
					if (!this.port) {
						var match = out.match(/port=([0-9]*)/);
						if (match) {
							this.port = match[1];
						}
						match = out.match(/pid=([0-9]*)/);
						if (match) {
							this.pid = parseInt(match[1]);
						}
					}
					if (this.isRunning() && !started) {
						started = true;
						return resolve();
					}
				});
				this.child.on('exit', () => {
					this.port = null;
					if (!started) {
						return reject();
					}
				});
			}
		});
	}

	public stop() {
		if (!this.child) {
			console.warn('The server is not running.');
		} else {
			this.child.kill();
			if (this.pid) {
				process.kill(this.pid);
			}
			this.pid = null;
			this.port = null;
			this.child = null;
		}
	}

	public restart():Promise<Object> {
		this.stop();
		return this.start();
	}

	public prepare(workspace:string):Promise<Object> {
		return new Promise((resolve, reject) => {
			//let prepareStatus = vscode.window.setStatusBarMessage('Analyzing Ruby code in workspace ' + workspace);
			request.post({url:'http://localhost:' + this.port + '/prepare', form: {
				workspace: workspace
			}}, function(err, response, body) {
				if (err) {
					reject();
				} else {
					resolve();
				}
			});
		});
	}

	public suggest(text:string, line:number, column:number, filename?:string, workspace?:string, withSnippets?:boolean):Promise<Object> {
		return new Promise((resolve, reject) => {
			request.post({url: 'http://localhost:' + this.port + '/suggest', form: {
				text: text,
				line: line,
				column: column,
				filename: filename || null,
				workspace: workspace || null,
				with_snippets: withSnippets || false}
			}, function(err, response, body) {
				if (err) {
					reject(err);
				} else {
					resolve(JSON.parse(body));
				}
			});
		});
    }

    private solargraphCommand(args) {
        let cmd = [];
        if (this.useBundler && this.workspace) {
            // TODO: pathToBundler configuration
            cmd.push('bundle', 'exec', 'solargraph');
        } else {
            cmd.push(this.commandPath);
        }
        var env = { shell: true };
        if (this.workspace) env['cwd'] = this.workspace;
        return child_process.spawn(cmd.shift(), cmd.concat(args), env);
    }
}
