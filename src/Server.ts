"use strict";

import * as child_process from 'child_process';
import * as cmd from './commands';
import axios from 'axios';
import { Configuration } from './Configuration';
import { clearInterval } from 'timers';

export class Server {
	private child: child_process.ChildProcess = null;
	private _port: number = null;
	private pid: number = null;

	private configuration: Configuration;

	public constructor(config: Configuration) {
		this.configure(config);
	}

	public isRunning(): Boolean {
		return this.child != null && this.port != null && this.pid != null;
	}

	get port(): number {
		return this._port;
	}

	get url(): string {
		return 'http://localhost:' + this.port;
	}

	public configure(config: Configuration) {
		this.configuration = config;
	}

	public start(): Promise<Object> {
		return new Promise((resolve, reject) => {
			var started = false;
			if (this.child) {
				console.warn('There is already a process running for the Solargraph server.');
			} else {
				console.log('Starting the server');
				var args = ['server', '--port', '0'];
				if (this.configuration.viewsPath) {
					args.push('--views', this.configuration.viewsPath);
				}
				this.child = cmd.solargraphCommand(args, this.configuration);
				this.child.stderr.on('data', (data) => {
					var out = data.toString();
					console.log(out);
					if (!this.port) {
						var match = out.match(/port=([0-9]*)/);
						if (match) {
							this._port = parseInt(match[1]);
						}
						match = out.match(/pid=([0-9]*)/);
						if (match) {
							this.pid = parseInt(match[1]);
						}
					}
					if (this.isRunning() && !started) {
						started = true;
						resolve(true);
					}
				});
				this.child.on('exit', () => {
					this._port = null;
					if (!started) {
						reject(false);
					}
				});
			}
		});
	}

	public update(filename: string, workspace?: string): Promise<Object> {
		return axios.post(this.url + '/update', {
			filename: filename,
			workspace: workspace,
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
			this._port = null;
			this.child = null;
		}
	}

	public restart(): Promise<Object> {
		this.stop();
		return this.start();
	}

	public wait(): Promise<Boolean> {
		return new Promise((resolve) => {
			if (this.isRunning()) {
				resolve(true);
			} else {
				var interval = setInterval(() => {
					if (this.isRunning()) {
						clearInterval(interval);
						resolve(true);
					}
				}, 100);
			}
		});
	}

	public post(path: string, params: any): Promise<any> {
		return axios.post(this.url + path, params);
	}

	public prepare(workspace: string): Promise<Object> {
		return axios.post(this.url + '/prepare', {
			workspace: workspace,
		});
	}

	public suggest(
		text: string,
		line: number,
		column: number,
		filename?: string,
		workspace?: string,
		withSnippets?: boolean
	): Promise<Object> {
		return new Promise((resolve, reject) => {
			if (this.isRunning()) {
				axios
					.post(this.url + '/suggest', {
						text: text,
						line: line,
						column: column,
						filename: filename || null,
						workspace: workspace || null,
						with_snippets: withSnippets || false,
					})
					.then((response) => resolve(response.data))
					.catch((error) => reject({ status: 'err', message: error.message }));
			} else {
				reject({ status: 'err', message: 'The server is not running' });
			}
		});
	}

	public define(
		text: string,
		line: number,
		column: number,
		filename?: string,
		workspace?: string
	): Promise<Object> {
		return new Promise((resolve, reject) => {
			if (this.isRunning()) {
				axios
					.post(this.url + '/hover', {
						text: text,
						line: line,
						column: column,
						filename: filename || null,
						workspace: workspace || null,
					})
					.then((response) => resolve(response.data))
					.catch((error) => reject(error));
			} else {
				reject({ status: 'err', message: 'The server is not running' });
			}
		});
	}

	public hover(
		text: string,
		line: number,
		column: number,
		filename?: string,
		workspace?: string
	): Promise<Object> {
		return this.define(text, line, column, filename, workspace);
	}

	public resolve(path: string, workspace?: string): Promise<Object> {
		return new Promise((resolve, reject) => {
			if (this.isRunning()) {
				axios
					.post(this.url + '/resolve', {
						path: path,
						workspace: workspace || null,
					})
					.then((response) => resolve(response.data))
					.catch((error) => reject(error));
			} else {
				reject({ status: 'err', message: 'The server is not running' });
			}
		});
	}

	public signify(
		text: string,
		line: number,
		column: number,
		filename?: string,
		workspace?: string
	): Promise<Object> {
		return new Promise<Object>((resolve, reject) => {
			if (this.isRunning()) {
				axios
					.post(this.url + '/signify', {
						text: text,
						filename: filename || null,
						line: line,
						column: column,
						workspace: workspace || null,
					})
					.then((response) => resolve(response.data))
					.catch((error) => reject(error));
			} else {
				reject({ status: 'err', message: 'The server is not running' });
			}
		});
	}
}
