# solargraph-utils

A Node package for interacting with the Solargraph rubygem.

## Example

    import * as solargraph from 'solargraph-utils';
    let configuration = new Solargraph.Configuration();
    let provider = new Solargraph.SocketProvider(configuration);
    provider.start().then(() => {
        console.log('Socket server is listening on port ' + provider.port);
    });
