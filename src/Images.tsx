import { useState, ChangeEvent } from 'react'
import {
  Box,
  Typography,
  Modal,
  Button,
  IconButton,
  TextField,
  ImageListItemBar,
  ImageList,
  ImageListItem,
  Skeleton,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { Leaf } from 'leaf'

export enum ImageTab {
  Image,
  GPS,
  QR,
  Edge,
}

export interface Image {
  name: string
  src: string
  gpsLink?: string
  gpsSrc?: string
  qrData?: string
  qrSrc?: string
  edgeSrc?: string
  file: Blob
  leaf: Leaf
}

export interface ImageData {
  data: Image[]
  show: ImageTab
  handleQrChange: (idx: number, data: string) => void
}

interface ImageModal extends Image {
  open: boolean
  setQrData: (data: string) => void
  onClose: () => void
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
  function setQrText(event: ChangeEvent<HTMLTextAreaElement>) {
    props.setQrData(event.target.value)
  }

  return (
    <Modal
      open={props.open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography sx={{ p: 1 }}>Data</Typography>
        <TextField
          label="QR code"
          value={props.qrData}
          placeholder="https://www.wikipedia.org/"
          onChange={setQrText}
          multiline
        />
        <div>
          <Button onClick={props.onClose} sx={{ float: 'right' }}>
            Ok
          </Button>
        </div>
      </Box>
    </Modal>
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
              setQrData={(data: string) => props.handleQrChange(idx, data)}
              onClose={() => setShowDetail(undefined)}
              {...item}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  )
}
