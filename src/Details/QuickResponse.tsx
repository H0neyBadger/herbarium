import { useState, ChangeEvent } from 'react'
import { Typography, Button, TextField } from '@mui/material'

import { QuickResponseModal } from '../Images'

export default function QuickResponseDetail(props: QuickResponseModal) {
  const [text, setText] = useState<string | undefined>(props.qrData)
  const [error, setError] = useState<boolean>(false)

  function readData(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value)
    setError(!validateData(text))
  }

  function onClose() {
    // commit
    if (text !== undefined && validateData(text) && text !== props.qrData) {
      props.setData(text)
    }
    props.onClose()
  }

  function validateData(data: string | undefined) {
    return true
  }

  return (
    <div>
      <div>
        <Typography sx={{ p: 1 }}>Data</Typography>
        <TextField
          label="QR code"
          value={text}
          placeholder="https://www.wikipedia.org/"
          onChange={readData}
          multiline
        />
      </div>
      <div>
        <Button onClick={onClose} sx={{ float: 'right' }}>
          Ok
        </Button>
      </div>
    </div>
  )
}
