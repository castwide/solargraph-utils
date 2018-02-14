'use strict';

import { Configuration } from './Configuration';
import { solargraphCommand } from './commands';
import { ChildProcess } from 'child_process';

export class SocketAdapter {
	private configuration: Configuration;
	private child: ChildProcess;
	private listening: Boolean;
	private _port: number;

	constructor(configuration: Configuration) {
		this.configuration = configuration;
		this.listening = false;
	}

	start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log("Trying to start the server. Use bundler: " + this.configuration.useBundler);
			this.child = solargraphCommand(['socket', '--port', '0'], this.configuration);
			let buffer = '';
			let that = this;
			this.child.stderr.on('data', (data: Buffer) => {
				if (that.isListening()) {
					console.log(data.toString());
				} else {
					buffer += data.toString();
					var match = buffer.match(/listening on port ([0-9]*)/);
					if (match) {
						that.listening = true;
						that._port = parseInt(match[1]);
						resolve();
					}
				}
			});
			this.child.on('exit', (code) => {
				if (!that.isListening()) {
					reject(buffer);
				}
			});
		});
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
