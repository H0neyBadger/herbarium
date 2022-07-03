import { useState, ChangeEvent } from 'react'
import { Typography, Button, TextField } from '@mui/material'

import { QuickResponseModal } from '../Images'

export default function QuickResponseDetail(props: QuickResponseModal) {
  const [text, setText] = useState<string>(props.qrData || '')
  const [error, setError] = useState<boolean>(false)

  function readData(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value)
    setError(!validateData(event.target.value))
  }

  function onClose() {
    const data = text.trim()
    if (validateData(data) && data !== props.qrData) {
      props.setData(data)
    }
    props.onClose()
  }

  function validateData(data: string) {
    if (!data.trim()) {
      return false
    }
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
          error={error}
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
