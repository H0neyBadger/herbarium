import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react'
import { Grid, Typography, Button, TextField } from '@mui/material'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLng } from 'leaflet'

import { GlobalPositioningSystemModal } from '../Images'

interface Location {
  position?: LatLng
  setPosition: (data: LatLng) => void
}

export function getBrowserLocation(
  callback: (lat: number, lng: number) => void
) {
  navigator.geolocation.getCurrentPosition(
    (position: GeolocationPosition) => {
      callback(position.coords.latitude, position.coords.longitude)
    },
    (error) => {
      console.log('Failed to get GeolocationPostition', error)
    }
  )
}

function LocationMarker(props: Location) {
  const map = useMap()
  const markerRef = useRef<any>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          props.setPosition(marker.getLatLng())
        }
      },
    }),
    [markerRef, props]
  )

  useEffect(() => {
    // https://github.com/PaulLeCam/react-leaflet/issues/453
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    })
  }, [])

  useEffect(() => {
    if (props.position !== undefined) {
      // center map view position
      map.panTo(props.position)
    }
  }, [props, map])

  return props.position === undefined ? null : (
    <Marker
      eventHandlers={eventHandlers}
      ref={markerRef}
      position={props.position}
      draggable
    >
      <Popup>QR code position</Popup>
    </Marker>
  )
}

export default function GlobalPositioningSystemDetail(
  props: GlobalPositioningSystemModal
) {
  const [text, setText] = useState<string>(props.gpsLink || '')
  const [position, setPosition] = useState<LatLng>(
    new LatLng(props.gpsData?.latitude || 0, props.gpsData?.longitude || 0)
  )
  const [longitude, setLongitude] = useState<string>(
    props.gpsData?.longitude.toString() || ''
  )
  const [latitude, setLatitude] = useState<string>(
    props.gpsData?.latitude.toString() || ''
  )
  const [errorLat, setLatError] = useState<boolean>(false)
  const [errorLng, setLngError] = useState<boolean>(false)

  useEffect(() => {
    if (position !== undefined) {
      setText(
        `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`
      )
    }
  }, [position])

  function readPosition(loc: LatLng) {
    setLongitude(loc.lng.toString())
    setLatitude(loc.lat.toString())
    setPosition(loc)
  }

  function readData(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value)
  }

  function readLongitude(event: ChangeEvent<HTMLTextAreaElement>) {
    setLongitude(event.target.value)
    const lng = parseFloat(event.target.value)
    const valid = validateValue(lng)
    setLngError(!valid)
    if (valid) {
      const pos = new LatLng(position.lat, lng)
      setPosition(pos)
    }
  }

  function readLatitude(event: ChangeEvent<HTMLTextAreaElement>) {
    setLatitude(event.target.value)
    const lat = parseFloat(event.target.value)
    const valid = validateValue(lat)
    setLatError(!valid)
    if (valid) {
      const pos = new LatLng(lat, position.lng)
      setPosition(pos)
    }
  }

  function onClose() {
    // commit
    if (text !== props.gpsLink) {
      props.setData(position.lat, position.lng, text)
    }
    props.onClose()
  }

  function validateValue(value: number) {
    if (isNaN(value)) {
      return false
    }
    if (value > 90 || value < -90) {
      return false
    }
    return true
  }

  return (
    <div style={{ width: '75vw' }}>
      <div>
        <Typography sx={{ m: 1 }}>Global Positioning System</Typography>
        <Grid container columns={2} spacing={1}>
          <Grid item xs p={1}>
            <TextField
              id="outlined-number"
              label="Longitude"
              type="number"
              error={errorLng}
              value={longitude}
              onChange={readLongitude}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs p={1}>
            <TextField
              id="outlined-number"
              label="Latitude"
              type="number"
              error={errorLat}
              value={latitude}
              onChange={readLatitude}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item p={1} width="100%">
            <TextField
              id="outlined-basic"
              label="GPS data"
              value={text}
              onChange={readData}
              fullWidth
            />
          </Grid>
          <Grid item p={1} width="100%" height="40vh">
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={readPosition} />
            </MapContainer>
          </Grid>
        </Grid>
      </div>
      <div>
        <Button onClick={onClose} sx={{ float: 'right' }}>
          Ok
        </Button>
      </div>
    </div>
  )
}
