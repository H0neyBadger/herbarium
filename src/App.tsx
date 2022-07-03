import { ChangeEvent, useEffect, useState, useReducer } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Tabs, Tab } from '@mui/material'
import exifr from 'exifr'

import HerbariumAppBar from './Header'
import { Image, StandardImageList, ImageTab } from './Images'
import { formatGpsLink } from './Details/GlobalPositioningSystem'

enum CountActionKind {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}

enum WasmActionKind {
  EDGE = 'EDGE',
  GPS = 'GPS',
  DATA = 'DATA',
}

interface CountAction {
  type: CountActionKind
  payload: number
}

interface CountState {
  count: number
}

function loaderReducer(state: CountState, action: CountAction) {
  console.log(action, state)
  const { type, payload } = action
  switch (type) {
    case CountActionKind.INCREASE:
      return {
        ...state,
        count: state.count + payload,
      }
    case CountActionKind.DECREASE:
      return {
        ...state,
        count: state.count - payload,
      }
    default:
      return state
  }
}

const wasm_worker: Worker = new Worker(new URL('./worker.js', import.meta.url))
const theme = createTheme({})

function App() {
  // const classes = useStyles();
  const [state, dispatch] = useReducer(loaderReducer, { count: 0 })
  const [tab, setTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageData, setImageData] = useState<Image[]>([])

  function wasmEvent(event: MessageEvent) {
    const data = event.data
    console.log(`recived worker data ${data}`)

    const idx = data.idx
    let image = imageData[idx]
    switch (data.action) {
      case WasmActionKind.EDGE:
        image.edgeSrc = data.src
        image.edgeData = {
          low_threshold: data.data.low_threshold,
          high_threshold: data.data.high_threshold,
        }
        break
      case WasmActionKind.GPS:
        image.gpsSrc = data.src
        image.gpsLink = data.link
        image.gpsData = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        }
        break
      case WasmActionKind.DATA:
        image.qrSrc = data.src
        image.qrData = data.data
        break
      default:
        return
    }
    setImageData([...imageData])
    dispatch({ type: CountActionKind.DECREASE, payload: 1 })
  }
  wasm_worker.onmessage = wasmEvent

  useEffect(() => {
    if (state.count > 0) {
      console.log('is loading')
      setIsLoading(true)
    } else {
      console.log('stop loading')
      setIsLoading(false)
    }
  }, [state.count])

  function handleChangeTab(event: ChangeEvent<{}>, newValue: number) {
    setTab(newValue)
  }

  function setQrData(idx: number, data: string) {
    dispatch({ type: CountActionKind.INCREASE, payload: 1 })
    wasm_worker.postMessage({
      data: data,
      idx: idx,
      action: WasmActionKind.DATA,
    })
  }

  function setGpsData(
    idx: number,
    latitude: number,
    longitude: number,
    link: string
  ) {
    dispatch({ type: CountActionKind.INCREASE, payload: 1 })
    wasm_worker.postMessage({
      data: link,
      idx: idx,
      action: WasmActionKind.GPS,
      latitude: latitude,
      longitude: longitude,
    })
  }

  function setEdgeData(
    idx: number,
    low_threshold: number,
    high_threshold: number,
    orientation: number | undefined
  ) {
    const src = imageData[idx]?.src
    if (src !== undefined) {
      dispatch({ type: CountActionKind.INCREASE, payload: 1 })
      wasm_worker.postMessage({
        data: src,
        idx: idx,
        action: WasmActionKind.EDGE,
        low_threshold: low_threshold,
        high_threshold: high_threshold,
        orientation: orientation || 1,
      })
    }
  }

  function dispatchImage(idx: number, image: Image, metadata: any) {
    console.log('Metadata:', metadata)
    const lat = metadata?.latitude
    const lng = metadata?.longitude
    image.orientation = metadata?.Orientation || 1

    dispatch({ type: CountActionKind.INCREASE, payload: 1 })
    wasm_worker.postMessage({
      data: image.src,
      idx: idx,
      action: WasmActionKind.EDGE,
      low_threshold: image.edgeData?.low_threshold,
      high_threshold: image.edgeData?.high_threshold,
      orientation: image.orientation,
    })
    if (lat !== undefined && lng !== undefined) {
      dispatch({ type: CountActionKind.INCREASE, payload: 1 })
      wasm_worker.postMessage({
        data: formatGpsLink(lat, lng),
        idx: idx,
        action: WasmActionKind.GPS,
        latitude: lat,
        longitude: lng,
      })
    }
  }
  async function readFile(event: any): Promise<void> {
    let files = Array.from(event.target.files)
    let offset = imageData.length
    dispatch({ type: CountActionKind.INCREASE, payload: files.length })
    let images: Image[] = files.map((file: any, idx: number) => {
      let image = {
        name: file.name as string,
        file: file,
        edgeData: {
          low_threshold: 1,
          high_threshold: 40,
        },
      } as Image

      const fileReader = new FileReader()
      fileReader.onload = async (e: any) => {
        image.src = e.target.result as string
        const options = {
          translateValues: false,
          // pick: ['Orientation', 'latitude', 'longitude'],
        }
        exifr
          .parse(e.target.result, options)
          .then((metadata) => dispatchImage(idx + offset, image, metadata))
        dispatch({ type: CountActionKind.DECREASE, payload: 1 })
      }
      fileReader.readAsDataURL(file)
      return image
    })
    setImageData([...imageData, ...images])
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HerbariumAppBar onImport={readFile} isLoading={isLoading} />
      <Tabs value={tab} onChange={handleChangeTab} centered>
        {Object.values(ImageTab)
          .filter((key) => isNaN(Number(key)))
          .map((value) => (
            <Tab label={value} key={value} />
          ))}
      </Tabs>
      <StandardImageList
        data={imageData}
        show={tab}
        handleGpsChange={setGpsData}
        handleQrChange={setQrData}
        handleEdgeChange={setEdgeData}
      />
    </ThemeProvider>
  )
}

export default App
