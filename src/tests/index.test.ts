"use strict";

import 'mocha';
import { expect } from 'chai';
import assert = require('assert');
import * as solargraph from '../index';
import * as path from 'path';
import { platform } from 'os';

// suite('Server', () => {
//     let configuration:solargraph.Configuration = new solargraph.Configuration();
//     let server:solargraph.Server = new solargraph.Server(configuration);

//     test('starts', (done) => {
//         expect(server.isRunning()).to.equal(false);
//         server.start().then(() => {
//             expect(server.isRunning()).to.equal(true);
//         }).then(done, done);
//     });

//     /*test('restarts', (done) => {
//         server.restart().then(() => {
//             expect(server.isRunning()).to.equal(true);
//         }).then(done, done);
//     });*/

//     test('returns suggestions', (done) => {
//         server.suggest('String.n', 0, 7, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     test('returns hover info', (done) => {
//         server.hover('String', 0, 1, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     test('returns signature info', (done) => {
//         server.signify('String.new()', 0, 11, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     test('stops', () => {
//         server.stop();
//         expect(server.isRunning()).to.equal(false);
//     });
// });

suite('solargraphCommand', () => {
	let configuration: solargraph.Configuration = new solargraph.Configuration();

	test('works with the default command path', (done) => {
		let child = solargraph.commands.solargraphCommand(['-v'], configuration);
		let output = '';
		child.stdout.on('data', (buffer) => {
			output += buffer.toString();
		});
		child.on('exit', () => {
			expect(output).not.to.equal('');
			done();
		});
	});

	test('works with a custom command path', (done) => {
		let cmd = 'solargraph';
		if ((platform().match(/darwin|linux/))) {
			cmd += '.rb';
		} else {
			cmd += '.bat';
		}
		configuration.commandPath = path.resolve('.', 'src', 'tests', 'bin', cmd);
		let child = solargraph.commands.solargraphCommand(['-v'], configuration);
		let output = '';
		child.stdout.on('data', (buffer) => {
			output += buffer.toString();
		});
		child.on('exit', () => {
			expect(output).not.to.equal('');
			done();
		});
	});
});

suite('SocketProvider', () => {
	let configuration: solargraph.Configuration = new solargraph.Configuration();
	let provider: solargraph.SocketProvider = new solargraph.SocketProvider(configuration);

	test('starts', (done) => {
		expect(provider.isListening()).to.equal(false);
		provider.start().then(() => {
			expect(provider.isListening()).to.equal(true);
		}).catch(() => {
			throw new Error('SocketProvider failed to start');
		}).then(done, done);
	});

	test('opens a port', () => {
		expect(provider.port).to.be.above(0);
	});

	test('restarts', (done) => {
		provider.restart().then(() => {
			expect(provider.isListening()).to.equal(true);
		}).then(done, done);
	});

	test('opens another port', () => {
		expect(provider.port).to.be.above(0);
	});

	test('stops', () => {
		provider.stop();
		expect(provider.isListening()).to.equal(false);
	});
});
