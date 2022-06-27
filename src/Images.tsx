import { useState, useEffect, useRef, ChangeEvent } from 'react'
import {
  Box,
  Grid,
  Typography,
  Modal,
  Button,
  IconButton,
  TextField,
  ImageListItemBar,
  ImageList,
  ImageListItem,
  Skeleton,
  Slider,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { Leaf } from 'leaf'

export enum ImageTab {
  Image,
  GPS,
  QR,
  Edge,
}

export interface EdgeThresholds {
  low_threshold: number
  high_threshold: number
}

export interface Image {
  name: string
  file: Blob
  src?: string
  leaf?: Leaf // wasm instance
  gpsLink?: string
  gpsData?: string
  gpsSrc?: string
  qrData?: string
  qrSrc?: string
  edgeData?: EdgeThresholds
  edgeSrc?: string
}

export interface ImageData {
  data: Image[]
  show: ImageTab
  handleGpsChange: (idx: number, data: string) => void
  handleQrChange: (idx: number, data: string) => void
  handleEdgeChange: (
    idx: number,
    low_threshold: number,
    high_threshold: number
  ) => void
}

interface ImageModal {
  open: boolean
  onClose: () => void
  children: JSX.Element
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'background.paper',
  borderRadius: 1,
  mx: 'auto',
  p: 2,
}

function ImageDetail(props: ImageModal) {
  return (
    <Modal
      open={props.open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {props.children}
        <div>
          <Button onClick={props.onClose} sx={{ float: 'right' }}>
            Ok
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

interface QuickResponseModal extends Image {
  setData: (data: string) => void
}

interface EdgeModal extends Image {
  setData: (low_threshold: number, high_treshlod: number) => void
}

function QuickResponseDetail(props: QuickResponseModal) {
  function setText(event: ChangeEvent<HTMLTextAreaElement>) {
    props.setData(event.target.value)
  }

  return (
    <div>
      <Typography sx={{ p: 1 }}>Data</Typography>
      <TextField
        label="QR code"
        value={props.qrData}
        placeholder="https://www.wikipedia.org/"
        onChange={setText}
        multiline
      />
    </div>
  )
}

function GlobalPositioningSystemDetail(props: QuickResponseModal) {
  function setText(event: ChangeEvent<HTMLTextAreaElement>) {
    props.setData(event.target.value)
  }

  return (
    <div>
      <Typography sx={{ p: 1 }}>Data</Typography>
      <TextField
        label="GPS data"
        value={props.gpsData}
        placeholder="TBD"
        onChange={setText}
        multiline
      />
    </div>
  )
}

function EdgeDetail(props: EdgeModal) {
  const [values, setValues] = useState<(number | undefined)[]>([
    props.edgeData?.low_threshold || 0.25,
    props.edgeData?.high_threshold || 0.75,
  ])
  const [error, setError] = useState<boolean>()

  function setThresholds(values: (number | undefined)[]) {
    let valid = validateThresholds(values)
    setError(!valid)
    setValues(values)
    if (valid) {
      let low = values[0] as number
      let high = values[1] as number
      props.setData(low, high)
    }
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
    </Box>
  )
}

export function StandardImageList(props: ImageData) {
  const [showDetail, setShowDetail] = useState<number | undefined>()

  function getSrc(item: Image) {
    switch (props.show) {
      case ImageTab.Image:
        return item.src
      case ImageTab.GPS:
        return item.gpsSrc
      case ImageTab.QR:
        return item.qrSrc
      case ImageTab.Edge:
        return item.edgeSrc
      default:
        return undefined
    }
  }

  // <WasmImage {...item} />
  return (
    <Box sx={{ m: 1 }}>
      <ImageList cols={4} variant="standard">
        {props.data.map((item: Image, idx: number) => (
          <ImageListItem key={idx}>
            {getSrc(item) ? (
              <img src={getSrc(item)} alt={item.name} />
            ) : (
              <Skeleton variant="rectangular" width="100%" height="20vh" />
            )}
            <ImageListItemBar
              title={item.name}
              subtitle={item.name}
              actionIcon={
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                  aria-label={`info about ${item.name}`}
                  onClick={() => setShowDetail(idx)}
                >
                  <InfoIcon />
                </IconButton>
              }
            />
            <ImageDetail
              open={showDetail === idx}
              onClose={() => setShowDetail(undefined)}
            >
              <div>
                {props.show === ImageTab.Image && (
                  <QuickResponseDetail
                    setData={(data: string) => props.handleGpsChange(idx, data)}
                    {...item}
                  />
                )}
                {props.show === ImageTab.GPS && (
                  <GlobalPositioningSystemDetail
                    setData={(data: string) => props.handleGpsChange(idx, data)}
                    {...item}
                  />
                )}
                {props.show === ImageTab.QR && (
                  <QuickResponseDetail
                    setData={(data: string) => props.handleQrChange(idx, data)}
                    {...item}
                  />
                )}
                {props.show === ImageTab.Edge && (
                  <EdgeDetail
                    setData={(low_threshold: number, high_threshold: number) =>
                      props.handleEdgeChange(idx, low_threshold, high_threshold)
                    }
                    {...item}
                  />
                )}
              </div>
            </ImageDetail>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  )
}
