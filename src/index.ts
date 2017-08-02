import {Configuration} from './Configuration';
import {Server} from './Server';
import * as cmd from './commands';
import * as path from 'path';
import * as fs from 'fs';

console.log('yeah, yer here');

export {
    Configuration,
    Server
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
        var solargraphTest = cmd.solargraphCommand(['help'], configuration);
        solargraphTest.on('exit', (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    });
}

export function verifyGemIsCurrent(configuration:Configuration):Promise<Boolean> {
    return new Promise((resolve, reject) => {
		let child = cmd.gemCommand(['outdated'], configuration);
		let result = "\n";
		child.stdout.on('data', (data:Buffer) => {
			result += data.toString();
		});
		child.on('exit', () => {
			if (result.match(/[\s]solargraph[\s]/)) {
				reject(false);
			} else {
				resolve(true);
			}
		});
	});
}
