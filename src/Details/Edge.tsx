import { useState, ChangeEvent } from 'react'
import { Box, Grid, Typography, Button, TextField, Slider } from '@mui/material'

import { EdgeModal } from '../Images'

export default function EdgeDetail(props: EdgeModal) {
  const [values, setValues] = useState<(number | undefined)[]>([
    props.edgeData?.low_threshold,
    props.edgeData?.high_threshold,
  ])
  const [error, setError] = useState<boolean>(false)
  const [lowThreshold, setLowThreshold] = useState<string>(
    props.edgeData ? props.edgeData.low_threshold.toString() : ''
  )
  const [highThreshold, setHighThreshold] = useState<string>(
    props.edgeData ? props.edgeData.high_threshold.toString() : ''
  )

  function onClose() {
    // commit results
    if (validateThresholds(values)) {
      const low = values[0]
      const high = values[1]
      if (
        !error &&
        low !== undefined &&
        high !== undefined &&
        (high !== props.edgeData?.high_threshold ||
          low !== props.edgeData?.low_threshold)
      ) {
        props.setData(low, high)
      }
    }
    props.onClose()
  }

  function setLow(event: ChangeEvent<HTMLInputElement>) {
    setLowThreshold(event.target.value)
    const nval = [parseFloat(event.target.value), values[1]]
    setError(!validateThresholds(nval))
    setValues(nval)
  }

  function setHigh(event: ChangeEvent<HTMLInputElement>) {
    setHighThreshold(event.target.value)
    const nval = [values[0], parseFloat(event.target.value)]
    setError(!validateThresholds(nval))
    setValues(nval)
  }

  function setThresholds(values: (number | undefined)[]) {
    setError(!validateThresholds(values))
    setValues(values)
  }

  function validateThresholds(values: (number | undefined)[]) {
    if (!values[0] || !values[1]) {
      return false
    }
    if (values[0] <= 0 || values[0] >= 255) {
      return false
    }
    if (values[1] <= 0 || values[1] > 255) {
      return false
    }
    if (values[0] >= values[1]) {
      return false
    }
    return true
  }

  return (
    <Box>
      <Typography sx={{ p: 1 }}>Edge detection</Typography>
      <Grid container columns={2} wrap="nowrap">
        <Grid item>
          <Slider
            getAriaLabel={() => 'Threshold range'}
            value={values as number[]}
            onChange={(event: Event, value: number | number[]) =>
              setThresholds(value as number[])
            }
            valueLabelDisplay="auto"
            size="small"
            orientation="vertical"
            disableSwap
            sx={{ p: 1 }}
            min={0.1}
            max={255}
          />
        </Grid>
        <Grid item>
          <TextField
            id="outlined-number"
            label="Low threshold"
            type="number"
            error={error}
            value={lowThreshold}
            onChange={setLow}
            sx={{ p: 1, width: '15ch' }}
            size="small"
          />
        </Grid>
        <TextField
          id="outlined-number"
          label="High threshold"
          type="number"
          error={error}
          value={highThreshold}
          onChange={setHigh}
          sx={{ p: 1, width: '15ch' }}
          size="small"
        />
      </Grid>
      <Button onClick={onClose} sx={{ float: 'right' }}>
        Ok
      </Button>
    </Box>
  )
}
