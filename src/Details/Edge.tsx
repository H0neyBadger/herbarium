import { useState, ChangeEvent } from 'react'
import { Box, Grid, Typography, Button, TextField, Slider } from '@mui/material'

import { EdgeModal } from '../Images'

export default function EdgeDetail(props: EdgeModal) {
  const [values, setValues] = useState<(number | undefined)[]>([
    props.edgeData?.low_threshold,
    props.edgeData?.high_threshold,
  ])
  const [error, setError] = useState<boolean>(false)

  function onClose() {
    // commit results
    if (validateThresholds(values)) {
      const low = values[0] as number
      const high = values[1] as number
      if (
        high !== props.edgeData?.high_threshold ||
        low !== props.edgeData?.low_threshold
      ) {
        props.setData(low, high)
      }
    }
    props.onClose()
  }

  function setThresholds(values: (number | undefined)[]) {
    let valid = validateThresholds(values)
    setError(!valid)
    setValues(values)
  }

  function validateThresholds(values: (number | undefined)[]) {
    if (!values[0] || !values[1]) {
      return false
    }
    if (values[0] <= 0 || values[0] >= 1) {
      return false
    }
    if (values[1] <= 0 || values[1] > 1) {
      return false
    }
    if (values[0] >= values[1]) {
      return false
    }
    return true
  }

  return (
    <Box>
      <Typography sx={{ p: 1 }}>Data</Typography>
      <Grid container columns={2} wrap="nowrap">
        <Grid item>
          <Slider
            getAriaLabel={() => 'Threshold range'}
            value={values as number[]}
            onChange={(event: Event, value: number | number[]) =>
              setThresholds(value as number[])
            }
            disabled={error}
            valueLabelDisplay="auto"
            size="small"
            orientation="vertical"
            disableSwap
            sx={{ p: 1 }}
            min={0.1}
            max={1}
          />
        </Grid>
        <Grid item>
          <TextField
            id="outlined-number"
            label="High threshold"
            type="number"
            error={error}
            value={values[1]}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setThresholds([values[0], +event.target.value])
            }
            sx={{ p: 1, width: '15ch' }}
            size="small"
          />
          <TextField
            id="outlined-number"
            label="Low threshold"
            type="number"
            error={error}
            value={values[0]}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setThresholds([+event.target.value, values[1]])
            }
            sx={{ p: 1, width: '15ch' }}
            size="small"
          />
        </Grid>
      </Grid>
      <Button onClick={onClose} sx={{ float: 'right' }}>
        Ok
      </Button>
    </Box>
  )
}
