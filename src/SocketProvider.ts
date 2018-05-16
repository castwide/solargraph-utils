'use strict';

import { Configuration } from './Configuration';
import { solargraphCommand } from './commands';
import { ChildProcess } from 'child_process';

export class SocketProvider {
	private configuration: Configuration;
	private child: ChildProcess;
	private listening: Boolean;
	private _port: number;
	private _pid: number;

	constructor(configuration: Configuration) {
		this.configuration = configuration;
		this.listening = false;
	}

	start(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.child = solargraphCommand(['socket', '--port', '0'], this.configuration);
			let buffer = '';
			let that = this;
			this.child.stderr.on('data', (data: Buffer) => {
				console.log(data.toString());
				if (!that.isListening()) {
					buffer += data.toString();
					var match = buffer.match(/PORT=([0-9]*)[\s]+PID=([0-9]*)/);
					if (match) {
						that.listening = true;
						that._port = parseInt(match[1]);
						that._pid = parseInt(match[2]);
						resolve();
					}
				}
			});
			this.child.on('error', (err) => {
				if (!that.isListening()) {
					reject(err);
				}
			});
			this.child.on('exit', (code) => {
				if (!that.isListening()) {
					reject(buffer);
				}
			});
		});
	}

	stop() {
		if (!this.child) {
			console.warn('The server is not running.');
		} else {
			this.child.kill();
			if (this._pid) {
				process.kill(this._pid);
			}
			this._pid = null;
			this._port = null;
			this.child = null;
			this.listening = false;
		}
	}

	restart() {
		this.stop();
		return this.start();
	}

	isListening(): Boolean {
		return this.listening;
	}

	get port(): number {
		return this._port;
	}

	get process(): ChildProcess {
		return this.child;
	}
}
