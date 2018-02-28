import {Configuration} from './Configuration';
import {Server} from './Server';
import {SocketProvider} from './SocketProvider';
import * as commands from './commands';
import * as path from 'path';
import * as fs from 'fs';

export {
    Configuration,
	Server,
	SocketProvider,
	commands
}

export function nearestWorkspace(file:string, parent?:string):string {
	var result:string = null;
	var cursor = path.dirname(file);
	if (parent == cursor) {
		result = cursor;
	} else {
		var root = parent || cursor;
		while (cursor.startsWith(root)) {
			var sy = path.join(cursor, '.solargraph.yml');
			if (fs.existsSync(sy) && fs.lstatSync(sy).isFile()) {
				result = cursor;
				break;
			}
			cursor = path.dirname(cursor);
		}
		if (!result) result = parent;
	}
	return result;
}

export function verifyGemIsInstalled(configuration:Configuration):Promise<Boolean> {
    return new Promise((resolve, reject) => {
        var solargraphTest = commands.solargraphCommand(['help'], configuration);
        solargraphTest.on('exit', (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export function verifyGemIsCurrent(configuration:Configuration):Promise<Boolean> {
    return new Promise((resolve, reject) => {
		let child = commands.gemCommand(['outdated'], configuration);
		let result = "\n";
		child.stdout.on('data', (data:Buffer) => {
			result += data.toString();
		});
		child.on('exit', (code) => {
			if (code == 0) {
				if (result.match(/[\s]solargraph[\s]/)) {
					resolve(false);
				} else {
					resolve(true);
				}
			} else {
				reject();
			}
		});
	});
}

export function writeConfigFile(configuration:Configuration):Promise<Boolean> {
	return new Promise((resolve, reject) => {
		var child = commands.solargraphCommand(['config', '.'], configuration);
		child.on('exit', (code) => {
			if (code == 0) {
				resolve(true);
			} else {
				reject(false);
			}
		});
	});
}

export function updateGemDocumentation(configuration:Configuration) {
	console.log('Updating gem yardocs');
	commands.yardCommand(['gems'], configuration);
}

export function installGem(configuration:Configuration):Promise<Boolean> {
	return new Promise((resolve, reject) => {
		var child = commands.gemCommand(['install', 'solargraph'], configuration);
		child.on('exit', (code) => {
			if (code == 0) {
				resolve(true);
			} else {
				reject(false);
			}
		});
	});
}

export function updateGem(configuration:Configuration):Promise<Boolean> {
	return new Promise((resolve, reject) => {
		var child = commands.gemCommand(['update', 'solargraph'], configuration);
		child.on('exit', (code) => {
			if (code == 0) {
				resolve(true);
			} else {
				reject(false);
			}
		});
	});
}
