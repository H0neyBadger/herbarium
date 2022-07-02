import 'leaflet/dist/leaflet.css'
import { useState, useEffect, ChangeEvent } from 'react'
import { Grid, Typography, Button, TextField } from '@mui/material'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import { LatLng } from 'leaflet'

import { QuickResponseModal } from '../Images'

interface Location {
  position?: LatLng
  setPosition: (data: LatLng) => void
}
function LocationMarker(props: Location) {
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

  const map = useMapEvents({
    click() {
      map.locate()
    },
    locationfound(e) {
      props.setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return props.position === undefined ? null : (
    <Marker position={props.position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

export default function GlobalPositioningSystemDetail(
  props: QuickResponseModal
) {
  const [text, setText] = useState<string>(props.gpsData || '')
  const [position, setPosition] = useState<LatLng | undefined>()
  const [longitude, setLongitude] = useState<string>('')
  const [latitude, setLatitude] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (latitude && longitude) {
      setText(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      )
    }
  }, [longitude, latitude])

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
    const loc: LatLng =
      position === undefined
        ? new LatLng(0, 0)
        : new LatLng(position.lat, position.lng)
    const lng = parseFloat(event.target.value)
    if (!isNaN(lng)) {
      loc.lng = lng
    }
    setError(!validateData(loc))
    setPosition(loc)
  }

  function readLatitude(event: ChangeEvent<HTMLTextAreaElement>) {
    setLatitude(event.target.value)
    const loc: LatLng =
      position === undefined
        ? new LatLng(0, 0)
        : new LatLng(position.lat, position.lng)
    const lat = parseFloat(latitude)
    if (!isNaN(lat)) {
      loc.lat = lat
    }
    setError(!validateData(loc))
    setPosition(loc)
  }

  function onClose() {
    // commit
    if (text !== undefined && text !== props.gpsData) {
      props.setData(text)
    }
    props.onClose()
  }

  function validateData(data: LatLng | undefined) {
    if (data === undefined) {
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
              error={error}
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
              error={error}
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
              center={{ lat: 51.505, lng: -0.09 }}
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
