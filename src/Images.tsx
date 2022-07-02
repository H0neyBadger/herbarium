import { useState, useEffect } from 'react'
import {
  Box,
  Modal,
  IconButton,
  ImageListItemBar,
  ImageList,
  ImageListItem,
  Skeleton,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import GlobalPositioningSystemDetail, {
  getBrowserLocation,
} from './Details/GlobalPositioningSystem'
import QuickResponseDetail from './Details/QuickResponse'
import EdgeDetail from './Details/Edge'

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

export interface GlobalPositions {
  latitude: number
  longitude: number
}

export interface Image {
  name: string
  file: Blob
  src?: string
  gpsLink?: string
  gpsData?: GlobalPositions
  gpsSrc?: string
  qrData?: string
  qrSrc?: string
  edgeData?: EdgeThresholds
  edgeSrc?: string
}

interface ImageModal {
  open: boolean
  children: JSX.Element
}

export interface QuickResponseModal extends Image {
  setData: (data: string) => void
  onClose: () => void
}

export interface GlobalPositioningSystemModal extends Image {
  setData: (latitude: number, longitude: number, link: string) => void
  onClose: () => void
}

export interface EdgeModal extends Image {
  setData: (low_threshold: number, high_treshlod: number) => void
  onClose: () => void
}

export interface ImageData {
  data: Image[]
  show: ImageTab
  handleGpsChange: (
    idx: number,
    latitude: number,
    longitude: number,
    link: string
  ) => void
  handleQrChange: (idx: number, data: string) => void
  handleEdgeChange: (
    idx: number,
    low_threshold: number,
    high_threshold: number
  ) => void
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
      <Box sx={style}>{props.children}</Box>
    </Modal>
  )
}

export function StandardImageList(props: ImageData) {
  const [showDetail, setShowDetail] = useState<number | undefined>()
  const [defaultGps, setDefaultGps] = useState<GlobalPositions | undefined>()
  // const [defaultGpsSrc, setDefaultGpsSrc] = useState<string | undefined>()

  useEffect(() => {
    getBrowserLocation((latitude: number, longitude: number) => {
      setDefaultGps({ latitude: latitude, longitude: longitude })
    })
  }, [])
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
            <ImageDetail open={showDetail === idx}>
              <div>
                {(props.show === ImageTab.GPS ||
                  props.show === ImageTab.Image) && (
                  <GlobalPositioningSystemDetail
                    setData={(
                      latitude: number,
                      longitude: number,
                      link: string
                    ) => props.handleGpsChange(idx, latitude, longitude, link)}
                    onClose={() => setShowDetail(undefined)}
                    gpsData={item.gpsData || defaultGps}
                    {...item}
                  />
                )}
                {props.show === ImageTab.QR && (
                  <QuickResponseDetail
                    setData={(data: string) => props.handleQrChange(idx, data)}
                    onClose={() => setShowDetail(undefined)}
                    {...item}
                  />
                )}
                {props.show === ImageTab.Edge && (
                  <EdgeDetail
                    setData={(low_threshold: number, high_threshold: number) =>
                      props.handleEdgeChange(idx, low_threshold, high_threshold)
                    }
                    onClose={() => setShowDetail(undefined)}
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
