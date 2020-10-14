import React, { useState, useContext } from 'react'
import {
  withStyles, Accordion, AccordionSummary, AccordionDetails, Avatar, Typography,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import UserContext from 'context/user'
import useGmailAPI from 'utils/hooks/gmail_api'

import parsePayload from 'utils/mails/parsePayload'
import { threadSharedStyles } from './styles'

const styles = (theme) => ({
  ...threadSharedStyles(theme),
})

const Draft = ({
  classes, snippet, payload, threadId, id,
}) => {
  const { user } = useContext(UserContext)
  const { trashDraft } = useGmailAPI()
  const [expanded, setExpanded] = useState(false)

  const parsed = parsePayload({ id, payload })
  const sender = user.names[0].displayName

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded((exp) => !exp)}>
      <AccordionSummary classes={{ root: classes.summary, content: classes.summaryContent }}>
        <>
          <div className={classes.sender}>
            <Avatar alt='' className={classes.avatar}>
              {sender[0]}
            </Avatar>
            <Typography className={classes.name}>{sender}</Typography>
          </div>
          {expanded || (
            <Typography className={classes.brief}>
              {parsed.subject}
              <span className={classes.snippet}>{parsed.subject ? `- ${snippet}` : snippet}</span>
            </Typography>
          )}
          <div className={classes.actions}>
            <DeleteIcon
              className={classes.actionIcon}
              onClick={(e) => {
                trashDraft(threadId)
                e.stopPropagation()
              }}
            />
          </div>
        </>
      </AccordionSummary>
      <AccordionDetails className={classes.mails}>
        {/* eslint-disable-next-line */}
        <div dangerouslySetInnerHTML={{__html: parsed.content}} />
      </AccordionDetails>
    </Accordion>
  )
}

export default withStyles(styles)(Draft)
