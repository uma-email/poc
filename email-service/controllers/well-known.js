exports.get = (req, res, next) => {
// res.setHeader('access-control-allow-origin', '*')
  res.json({
    state: 'cyrus-0;p-3;vfs-0',
    username: 'izboran@gmail.com',
    primaryAccounts: {
      // 'urn:ietf:params:jmap:vacationresponse': 'u77a04153',
      'urn:ietf:params:jmap:submission': 'izboran@gmail.com',
      'urn:ietf:params:jmap:mail': 'izboran@gmail.com'
    },
    downloadUrl: 'http://localhost:3000/download/{accountId}/{blobId}/{name}',
    uploadUrl: 'http://localhost:3000/upload/{accountId}/',
    eventSourceUrl: 'http://localhost:3000/event/',
    apiUrl: 'http://localhost:3000/api/',
    accounts: {
      'izboran@gmail.com': {
        isArchiveUser: false,
        isReadOnly: false,
        name: 'me@izboran.com',
        isPersonal: true,
        accountCapabilities: {
          'urn:ietf:params:jmap:submission': { maxDelayedSend: 44236800, submissionExtensions: [] },
          'urn:ietf:params:jmap:mail': {
            maxMailboxesPerEmail: 1000,
            emailQuerySortOptions: [
              'receivedAt'
            ],
            maxMailboxDepth: null,
            mayCreateTopLevelMailbox: true,
            maxSizeMailboxName: 490,
            maxSizeAttachmentsPerEmail: 50000000
          }
        }
      }
    },
    capabilities: {
      'urn:ietf:params:jmap:submission': {},
      'urn:ietf:params:jmap:mail': {},
      'urn:ietf:params:jmap:core': {
        maxSizeRequest: 10000000,
        maxObjectsInGet: 1000,
        maxConcurrentUpload: 10,
        maxConcurrentRequests: 10,
        maxSizeUpload: 50000000,
        maxObjectsInSet: 1000,
        collationAlgorithms: ['i;ascii-numeric', 'i;ascii-casemap', 'i;octet'],
        maxCallsInRequest: 64
      }
    }
  })
}
