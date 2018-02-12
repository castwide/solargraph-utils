'use strict';

import { IConnection, createConnection, IPCMessageReader, IPCMessageWriter, TextDocuments, InitializeResult, TextDocumentPositionParams, CompletionItem, CompletionItemKind, MarkupContent, MarkedString, Hover, TextEdit, Range, TextDocument, Position, Location, SignatureHelp, SignatureInformation } from 'vscode-languageserver';
import { Configuration } from './Configuration';
import { Server } from './Server';
import { uriToFilePath } from 'vscode-languageserver/lib/files';
import * as format from './format';
import { solargraphCommand } from './commands';
var fileUrl = require('file-url');
//import * as helper from './helper';

let solargraphConfiguration = new Configuration();
let solargraphServer = new Server(solargraphConfiguration);

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

let workspaceRoot: string;

connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	solargraphConfiguration.workspace = workspaceRoot;
	if (params.initializationOptions) {
		if (params.initializationOptions.viewsPath) {
			solargraphConfiguration.viewsPath = params.initializationOptions.viewsPath;
		}
	}
	solargraphServer.start().then(() => {
		solargraphServer.prepare(workspaceRoot);
	});
	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['.', ':', '@']
			},
			hoverProvider: true,
			definitionProvider: true,
			signatureHelpProvider: {
				triggerCharacters: ['(', ',']
			}
		}
	}
});

documents.onDidChangeContent((change) => {
	// TODO: This might not be necessary given that completion requests send
	// the document text, and this update function only reloads the version on
	// disk.
	//solargraphServer.update(uriToFilePath(change.document.uri), workspaceRoot);
});

connection.onDidChangeConfiguration((change) => {
	// TODO: Handle a configuration change
});

var getDocumentPageLink = function(path: string): string {
	var uri = "solargraph:" + solargraphServer.port + "/document?workspace=" + encodeURI(workspaceRoot) + "&query=" + encodeURI(path).replace('#', '%23');
	var link = "[" + path + '](' + uri + ')';
	return link;
}

var formatDocumentation = function(doc: string): MarkupContent {
	return { kind: 'markdown', value: doc };
}

var setDocumentation = function(item: CompletionItem, cd: any) {
	var docLink = '';
	if (cd['path']) {
		docLink = "\n\n" + getDocumentPageLink(cd.path) + "\n\n";
	}
	var doc = docLink + format.htmlToPlainText(cd['documentation']);
	if (cd['params'] && cd['params'].length > 0) {
		doc += "\nParams:\n";
		for (var j = 0; j < cd['params'].length; j++) {
			doc += "- " + cd['params'][j] + "\n";
		}
	}
	var md = formatDocumentation(doc);
	item.documentation = md;
}

var getBeginningPositionOfWord = function(doc: TextDocument, end: Position): Position {
	var newChar = end.character;
	var cursor = newChar - 1;
	while (cursor >= 0) {
		var offset = doc.offsetAt({line: end.line, character: cursor});
		var char = doc.getText().substr(offset, 1);
		if (char.match(/[a-z0-9_@\$]/i)) {
			newChar = cursor;
			cursor--;
		} else {
			break;
		}
	}
	return {
		line: end.line,
		character: newChar
	}
}

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
	let doc = documents.get(textDocumentPosition.textDocument.uri);
	let begin = getBeginningPositionOfWord(doc, textDocumentPosition.position)
	let filename = uriToFilePath(doc.uri);
	return new Promise((resolve) => {
		solargraphServer.suggest(doc.getText(), textDocumentPosition.position.line, textDocumentPosition.position.character, filename, workspaceRoot).then((results) => {
			var items = [];
			results['suggestions'].forEach((sugg) => {
				var item = CompletionItem.create(sugg.label);
				item.kind = CompletionItemKind[sugg.kind];
				item.textEdit = {
					range: {
						start: begin,
						end: textDocumentPosition.position
					},
					newText: sugg.insert
				}
				if (sugg.documentation) {
					item.documentation = formatDocumentation(sugg.documentation);
				} else if (sugg.has_doc) {
					item.documentation = 'Loading...';
				} else {
					item.documentation = "\n" + sugg.path;
				}
				if (sugg['kind'] == 'Method' && sugg['arguments'].length > 0) {
					item.detail = '(' + sugg['arguments'].join(', ') + ') ' + (sugg['return_type'] ? '=> ' + sugg['return_type'] : '');
				} else {
					item.detail = (sugg['return_type'] ? '=> ' + sugg['return_type'] : '');
				}
				item.data = {};
				item.data.path = sugg['path'];
				item.data.textDocument = doc;
				items.push(item);
			});
			resolve(items);
		}).catch((err) => {
			console.log('Error: ' + JSON.stringify(err));
		});
	});
});

connection.onHover((textDocumentPosition: TextDocumentPositionParams): Promise<Hover> => {
	return new Promise((resolve, reject) => {
		let document = documents.get(textDocumentPosition.textDocument.uri);
		let filename = uriToFilePath(document.uri);
		solargraphServer.define(document.getText(), textDocumentPosition.position.line, textDocumentPosition.position.character, filename, workspaceRoot).then(function(data) {
			if (data['suggestions'].length > 0) {
				var c:string = '';
				var usedPaths: string[] = []
				for (var i = 0; i < data['suggestions'].length; i++) {
					var s = data['suggestions'][i];
					if (usedPaths.indexOf(s.path) == -1) {
						usedPaths.push(s.path);
						c = c + "\n\n" + getDocumentPageLink(s.path);
						if (s.return_type && s.kind != 'Class' && s.kind != 'Module') {
							c = c + " => " + getDocumentPageLink(s.return_type);
						}
					}
					c = c + "\n\n";
					var doc = s.documentation;
					if (doc) {
						c = c + format.htmlToPlainText(doc) + "\n\n";
					}
				}
				resolve({ contents: { kind: 'markdown', value: c } });
			} else {
				reject();
			}
		});
	});
});

connection.onDefinition((textDocumentPosition: TextDocumentPositionParams): Promise<Location[]> => {
	return new Promise((resolve) => {
		let document = documents.get(textDocumentPosition.textDocument.uri);
		let filename = uriToFilePath(document.uri);
		solargraphServer.define(document.getText(), textDocumentPosition.position.line, textDocumentPosition.position.character, filename, workspaceRoot).then((data) => {
			var locations: Location[] = [];
			data['suggestions'].forEach((s) => {
				if (s.location) {
					var match = s['location'].match(/^(.*?):([0-9]*?):([0-9]*)$/);
					if (match) {
						var url = fileUrl(match[1]);
						var line = parseInt(match[2]);
						var char = parseInt(match[3]);
						var location = Location.create(fileUrl(match[1]), Range.create({line: line, character: char}, {line: line, character: char}));
						locations.push(location);
					}
				}
			});
			resolve(locations);
		});
	});
});

connection.onSignatureHelp((textDocumentPosition: TextDocumentPositionParams): Promise<SignatureHelp> => {
	return new Promise((resolve) => {
		let document = documents.get(textDocumentPosition.textDocument.uri);
		let filename = uriToFilePath(document.uri);
		solargraphServer.signify(document.getText(), textDocumentPosition.position.line, textDocumentPosition.position.character, filename, workspaceRoot).then((data) => {
			var signatures: SignatureInformation[] = [];
			data['suggestions'].forEach((s) => {
				var doc = s.documentation;
				if (s.params && s.params.length > 0) {
					doc += "<p>Params:<br/>";
					for (var j = 0; j < s.params.length; j++) {
						doc += "- " + s.params[j] + "<br/>";
					}
					doc += "</p>";
				}
				var info = SignatureInformation.create(s.label + '(' + s.arguments.join(', ') + ')', format.htmlToPlainText(doc));
				signatures.push(info);
			});
			var activeSignature;
			var activeParameter;
			if (signatures.length > 0) {
				activeSignature = 0
				activeParameter = (signatures[0].parameters.length > 0 ? 0 : null);
			}
			var help: SignatureHelp = {
				signatures: signatures,
				activeSignature: 0,
				activeParameter: null
			}
			resolve(help);
		});
	});
});

var formatMultipleSuggestions = function(cds: any[]): MarkupContent {
	var doc = '';
	var docLink = '';
	cds.forEach((cd) => {
		if (!docLink && cd.path) {
			docLink = "\n\n" + getDocumentPageLink(cd.path) + "\n\n";
		}
		doc += "\n" + format.htmlToPlainText(cd.documentation);
	});
	return formatDocumentation(docLink + doc);
}

connection.onCompletionResolve((item: CompletionItem): Promise<CompletionItem> => {
	return new Promise((resolve, reject) => {
		if (item.documentation && item.documentation != 'Loading...') {
			resolve(item);
		} else if (item.documentation == 'Loading...') {
			console.log('Getting stuff from ' + workspaceRoot + ' for ' + item.data['path']);
			solargraphServer.resolve(item.data.path, workspaceRoot).then((result:any) => {
				if (result.suggestions.length > 0) {
					var tmp = formatMultipleSuggestions(result.suggestions);
					item.documentation = tmp;
				} else {
					item.documentation = '';
				}
				resolve(item);
			}).catch((result) => {
				reject(result);
			});
		} else {
			resolve(item);
		}
	});
});

connection.onExit(() => {
	solargraphServer.stop();
});

connection.listen();
