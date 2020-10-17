// Dodgy dodgy hax - fixme when we add authorization.
let gmail
const accountId = 'izboran@gmail.com'

function evaluatePointer (value, pointer) {
  if (!pointer) {
    return value
  }
  if (pointer.charAt(0) !== '/') {
    throw new Error('Invalid pointer')
  }
  let token
  const next = pointer.indexOf('/', 1)
  if (next !== -1) {
    token = pointer.slice(1, next)
    pointer = pointer.slice(next)
  } else {
    token = pointer.slice(1)
    pointer = ''
  }
  token = token.replace(/~1/g, '/').replace(/~0/g, '~')
  if (Array.isArray(value)) {
    if (/^(?:0|[1-9][0-9]*)$/.test(token)) {
      return evaluatePointer(value[parseInt(token, 10)], pointer)
    }
    /* start: the only bit that differs from RFC6901 */
    if (token === '*') {
      /* Map values to pointer */
      value = value.map(item => evaluatePointer(item, pointer))
      /* Flatten output */
      return value.reduce((output, item) => {
        if (!Array.isArray(item)) {
          item = [item]
        }
        return output.concat(item)
      }, [])
    }
    /* end */
  } else if (value !== null && typeof value === 'object') {
    return evaluatePointer(value[token], pointer)
  }
  throw new Error('Evaluation failed')
}

var resolveBackRefs = function (args, responses) {
  for (var property in args) {
    if (property.charAt(0) === '#') {
      const { resultOf, name, path } = args[property]
      var result = responses.find(([resName, args, tag]) => (name === resName && tag === resultOf))
      args[property.slice(1)] = result
        ? evaluatePointer(result[1], path)
        : null // TODO: Maybe throw?
    }
  }
  return args
}

const parseNameAndEmail = function (nameAndEmail) {
  var name = ''
  var email = nameAndEmail
  var match = /\b([\w.%+-]+@(?:[a-z0-9-]+\.)+[a-z]{2,})\b/i.exec(nameAndEmail)
  if (match) {
    email = match[1]
    name = nameAndEmail
      .replace(email, '')
      .replace(/['"<>\\]/g, '')
      .trim()
  }
  return { name: name, email: email }
}

// Simple email parser, goes for good enough accuracy rather than full spec
// compliance
const parseEmails = function (string) {
  if (string == null) { return null }
  var emails = []
  var inQuote = false
  var start = 0
  var end = 0
  var length = string.length
  var codepoint
  while (end < length) {
    codepoint = string.charAt(end)
    if (inQuote) {
      // Skip next character if escaped
      if (codepoint === '\\') {
        end += 1
      }
      if (codepoint === '"') {
        inQuote = false
      }
    } else {
      if (codepoint === '"') {
        inQuote = true
      }
      if (codepoint === ',' || codepoint === ';') {
        emails.push(parseNameAndEmail(string.slice(start, end)))
        start = end + 1
      }
    }
    end += 1
  }
  if (start < end) {
    emails.push(parseNameAndEmail(string.slice(start, end)))
  }
  return emails
}

const parseMessageIds = function (value) {
  if (value == null) { return null }
  return value.replace(/[<>]/g, '').split(',')
}

const getHeader = (payload, name) => {
  const h = payload.headers.find(h => h.name.toLowerCase() === name)
  return h ? h.value : null
}

const extractBodyStructure = function (payload) {
  return {
    partId: payload.mimeType.startsWith('multipart/')
      ? null
      : payload.partId,
    blobId: payload.body.attachmentId,
    size: payload.body.size,
    headers: payload.headers,
    name: payload.filename || null,
    type: payload.mimeType || 'text/plain',
    charset: 'utf-8',
    disposition: getHeader(payload, 'content-disposition'),
    cid: getHeader(payload, 'content-id'),
    language: null,
    location: getHeader(payload, 'content-location'),
    subParts: payload.mimeType.startsWith('multipart/')
      ? payload.parts.map(extractBodyStructure)
      : null
  }
}

const extractBodyValues = function (payload, bodyValues) {
  var partId = payload.partId
  var data = payload.body.data
  if (data) {
    bodyValues[partId] = {
      value: Buffer.from(data, 'base64').toString('utf8'),
      isEncodingProblem: false,
      isTruncated: false
    }
  } else if (payload.parts) {
    payload.parts.forEach(part => extractBodyValues(part, bodyValues))
  }
  return bodyValues
}

const onlyTrue = (obj) => (Object.fromEntries(Object.entries(obj).filter(([k, v]) => v)))
const keywordLabels = {
  UNREAD: true,
  STARRED: true,
  IMPORTANT: true
}

const resolvers = {
  'Mailbox/get': async (msg) => {
    const labelsRes = await gmail.users.labels.list({
      userId: 'me'
    })
    const mailboxProperties = {
      INBOX: {
        name: 'Inbox',
        role: 'inbox',
        sortOrder: 1
      },
      DRAFT: {
        name: 'Drafts',
        role: 'drafts',
        sortOrder: 2
      },
      SENT: {
        name: 'Sent',
        role: 'sent',
        sortOrder: 3
      },
      SPAM: {
        name: 'Spam',
        role: 'junk',
        sortOrder: 4
      },
      TRASH: {
        name: 'Trash',
        role: 'trash',
        sortOrder: 5
      },
      CATEGORY_PERSONAL: {
        name: 'Personal',
        parentId: 'INBOX',
        sortOrder: 1
      },
      CATEGORY_SOCIAL: {
        name: 'Social',
        parentId: 'INBOX',
        sortOrder: 2
      },
      CATEGORY_PROMOTIONS: {
        name: 'Promotions',
        parentId: 'INBOX',
        sortOrder: 3
      },
      CATEGORY_UPDATES: {
        name: 'Updates',
        parentId: 'INBOX',
        sortOrder: 4
      },
      CATEGORY_FORUMS: {
        name: 'Forums',
        parentId: 'INBOX',
        sortOrder: 5
      },
      CHAT: {
        name: 'Chat'
      }
    }

    const labels = labelsRes.data.labels.filter(({ id }) => !keywordLabels[id])

    const mailboxes = await Promise.all(labels.map(async ({ id }) => {
      const info = (await gmail.users.labels.get({ userId: 'me', id: id })).data
      // console.log('info for', id, info)
      return Object.assign({
        id: info.id,
        name: info.name,
        parentId: null,
        role: null,
        sortOrder: 10,
        totalEmails: info.messagesTotal,
        unreadEmails: info.messagesUnread,
        totalThreads: info.threadsTotal,
        unreadThreads: info.threadsUnread,
        myRights: {
          mayReadItems: true,
          mayAddItems: true,
          mayRemoveItems: true,
          maySetSeen: true,
          maySetKeywords: true,
          mayCreateChild: false,
          mayRename: true,
          mayDelete: info.type !== 'system',
          maySubmit: false
        },
        isSubscribed: true
      }, mailboxProperties[info.id])
    }))

    // console.dir(mailboxes, {depth:null})
    return [{
      name: 'Mailbox/get',
      args: {
        accountId,
        state: 'blah',
        list: mailboxes,
        notFound: []
      }
    }]
  },
  'Email/query': async (msg, cache) => {
    if (!msg.collapseThreads) {
      throw new Error('Not implemented!')
    }
    const position = msg.position || 0
    const limit = msg.limit || 50
    let offset = 0
    let pageToken = ''
    const threadsAll = []
    while (true) {
      const q = {
        userId: 'me',
        labelIds: [],
        q: '',
        maxResults: position + limit - offset
      }
      for (const f in msg.filter) {
        const value = msg.filter[f]
        switch (f) {
          case 'inMailbox':
            q.labelIds.push(value)
            break
          default:
            console.warn('Unknown / unsupported filter type', f)
        }
        // if (f === 'inMailbox')
      }
      const { threads, nextPageToken, resultSizeEstimate } = (await gmail.users.threads.list(q)).data
      threadsAll.push(...threads.map(({ id }) => id))
      if (threadsAll.length >= position + limit || nextPageToken == null) {
        // We have enough / we've run out of input
        const threadsOut = threadsAll.slice(position, position + limit)
        // Fetch the thread objects from the ids
        const threadObjs = await Promise.all(threadsOut.map(async (id) => ((await gmail.users.threads.get({
          userId: 'me',
          id,
          format: 'full'
        })).data)))
        for (const thread of threadObjs) {
          cache.threadCache.set(thread.id, thread)
          for (const message of thread.messages) {
            cache.messageCache.set(message.id, message)
          }
        }
        return [{
          name: 'Email/query',
          args: {
            accountId,
            queryState: 'asdfasdf',
            canCalculateChanges: false,
            position,
            total: resultSizeEstimate,
            ids: threadObjs.map(t => t.messages[0].id)
          }
        }]
        break
      } else {
        offset += threads.length
        pageToken = nextPageToken
      }
    }
    // return []
  },
  'Email/get': async (msg, cache) => {
    const { ids, properties } = msg
    const notFound = []
    if (ids == null) { return [] }
    // console.log('msg', msg, ids)
    properties.push('id')
    const props = ids.map(id => {
      const cacheValue = cache.messageCache.get(id)
      if (cacheValue) {
        // We've got it
        const getProperty = {
          id: m => m.id,
          threadId: m => m.threadId,
          mailboxIds: m => Object.fromEntries(m.labelIds
            .filter(id => !keywordLabels[id])
            .map(id => [id, true])),
          keywords: m => onlyTrue({
            $seen: !m.labelIds.includes('UNREAD'),
            $flagged: m.labelIds.includes('STARRED'),
            $important: m.labelIds.includes('IMPORTANT')
          }),
          hasAttachment: m => false,
          subject: m => getHeader(m.payload, 'subject'),
          from: m => parseEmails(getHeader(m.payload, 'from')),
          to: m => parseEmails(getHeader(m.payload, 'to')),
          receivedAt: m => new Date(+m.internalDate).toJSON(),
          size: m => m.sizeEstimate,
          preview: m => m.snippet,
          blobId: m => 'Users.message:' + m.id,
          messageId: m => parseMessageIds(getHeader(m.payload, 'message-id')),
          inReplyTo: m => parseMessageIds(getHeader(m.payload, 'in-reply-to')),
          'header:list-id:asText': m => null,
          'header:list-post:asURLs': m => null,
          references: m => parseMessageIds(getHeader(m.payload, 'references')),
          sender: m => parseEmails(getHeader(m.payload, 'sender')),
          cc: m => parseEmails(getHeader(m.payload, 'cc')),
          bcc: m => parseEmails(getHeader(m.payload, 'bcc')),
          replyTo: m => parseEmails(getHeader(m.payload, 'replyTo')),
          sentAt: m => new Date(getHeader(m.payload, 'date')).toJSON(),
          bodyStructure: m => extractBodyStructure(m.payload),
          bodyValues: m => extractBodyValues(m.payload, {})
        }
        return Object.fromEntries(properties.map(prop => ([prop, getProperty[prop](cacheValue)])))
        // console.log('xxxx', cacheValue, properties.map(prop => ([prop, cacheValue[prop]])))
        // return Object.fromEntries(properties.map(prop => ([prop, cacheValue[prop]])))
      } else {
        throw Error('Data not found in cache - NYI')
      }
    })

    // console.log('props', props)
    return [{
      name: 'Email/get',
      args: {
        accountId,
        state: 'asdf',
        list: props.filter(p => p !== null),
        notFound
      }
    }]
  },
  'Thread/get': async (msg, cache) => {
    const { ids, properties } = msg
    const list = ids.map(id => {
      const thread = cache.threadCache.get(id)
      if (thread == null) { throw Error('Missing thread in cache') }
      return {
        id,
        emailIds: thread.messages.map(m => m.id)
      }
    })
    return [{
      name: 'Thread/get',
      args: {
        accountId,
        state: 'asdfsfd',
        list,
        notFound: []
      }
    }]
    // const threads = await Promise.all(ids!.map(async ({id}) => {
    //   // const info = (await gmail.users.threads.get({userId: 'me', id: id!})).data;
    //   return {
    //     id: info.id,
    //     emailIds: info.messages,
    //   };
    // }
  }
}

module.exports = {
  async create (req, res) {
    res.setHeader('access-control-allow-origin', '*')
    const request = req.body
    console.log('got request', request)
    const methodResponses = []
    for (const method of request.methodCalls) {
      const [name, args, tag] = method
      resolveBackRefs(args, methodResponses)
      if (!resolvers[name]) {
        console.error('Missing resolver for', name, args)
        continue
      }
      console.time(name)
      const responses = await resolvers[name](args, cache)
      console.timeEnd(name)
      for (const { name, args } of responses) {
        methodResponses.push([name, args, tag])
        console.log('added response', methodResponses[methodResponses.length - 1])
      }
    }
    // const methodResponses = await Promise.all(request.methodCalls.map(m => resolvers[m[0]](m))
    res.json({
      methodResponses,
      sessionState: 'todo'
    })
    res.end()
  }
}
