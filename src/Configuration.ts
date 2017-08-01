export class Configuration {
    private _useBundler:Boolean;
    private _commandPath:String;
    private _withSnippets:Boolean;

    public constructor(useBundler:Boolean = false, commandPath:String = 'solargraph', withSnippets:Boolean = false) {
        this._useBundler = useBundler;
        this._commandPath = commandPath;
        this._withSnippets = withSnippets;
    }

    get useBundler():Boolean {
        return this._useBundler;
    }

    set useBundler(bool:Boolean) {
        this._useBundler = bool;
    }

    get commandPath():String {
        return this._commandPath;
    }

    set commandPath(path:String) {
        this._commandPath = path;
    }

    get withSnippets():Boolean {
        return this._withSnippets;
    }

    set withSnippets(bool:Boolean) {
        this._withSnippets = bool;
    }
}
