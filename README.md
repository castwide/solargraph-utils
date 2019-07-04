# solargraph-utils

A Node package for interacting with the Solargraph rubygem.

## Example

    import * as solargraph from 'solargraph-utils';
    let configuration = new solargraph.Configuration();
    let provider = new solargraph.SocketProvider(configuration);
    provider.start().then(() => {
        console.log('Socket server is listening on port ' + provider.port);
    });
