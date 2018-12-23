"use strict";

import 'mocha';
import { expect } from 'chai';
import assert = require('assert');
import * as solargraph from '../index';

// suite('Server', () => {
//     let configuration:solargraph.Configuration = new solargraph.Configuration();
//     let server:solargraph.Server = new solargraph.Server(configuration);

//     it('starts', (done) => {
//         expect(server.isRunning()).to.equal(false);
//         server.start().then(() => {
//             expect(server.isRunning()).to.equal(true);
//         }).then(done, done);
//     });

//     /*it('restarts', (done) => {
//         server.restart().then(() => {
//             expect(server.isRunning()).to.equal(true);
//         }).then(done, done);
//     });*/

//     it('returns suggestions', (done) => {
//         server.suggest('String.n', 0, 7, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     it('returns hover info', (done) => {
//         server.hover('String', 0, 1, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     it('returns signature info', (done) => {
//         server.signify('String.new()', 0, 11, 'file.rb').then((response) => {
//             expect(response['suggestions'].length).to.be.above(0);
//         }).then(done, done);
//     });

//     it('stops', () => {
//         server.stop();
//         expect(server.isRunning()).to.equal(false);
//     });
// });

suite('SocketProvider', () => {
    let configuration: solargraph.Configuration = new solargraph.Configuration();
    let provider: solargraph.SocketProvider = new solargraph.SocketProvider(configuration);

    it('starts', (done) => {
        expect(provider.isListening()).to.equal(false);
        provider.start().then(() => {
            expect(provider.isListening()).to.equal(true);
        }).then(done, done);
    });

    it('opens a port', () => {
        expect(provider.port).to.be.above(0);
    });

    it('stops', () => {
        provider.stop();
        expect(provider.isListening()).to.equal(false);
    });

});
