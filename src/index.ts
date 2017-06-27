import {Server} from './Server';
import * as path from 'path';
import * as fs from 'fs';

export {
    Server
}

export function nearestWorkspace(file:string, parent?:string):string {
    var result:string = null;
    var cursor = path.dirname(file);
    if (parent == cursor) {
        result = cursor;
    } else {
        var root = parent || cursor;
        while (root.startsWith(cursor)) {
            if (fs.existsSync(cursor + '/.solargraph.yml') && fs.lstatSync(cursor + '/.solargraph.yml').isFile()) {
                result = cursor;
                break;
            }
            cursor = path.dirname(cursor);
        }
        if (!result) result = parent;
    }
    return result;
}
