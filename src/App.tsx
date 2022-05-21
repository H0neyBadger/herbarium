import { ChangeEvent, useEffect, useState, useReducer } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Tabs, Tab } from '@mui/material'

import init, { Leaf } from 'leaf'
import HerbariumAppBar from './Header'
import { Image, StandardImageList, ImageTab } from './Images'

enum CountActionKind {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
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

function App() {
  // const classes = useStyles();
  const [state, dispatch] = useReducer(loaderReducer, { count: 0 })
  const [tab, setTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageData, setImageData] = useState<Image[]>([])

  useEffect(() => {
    init() // FIXME handle wasm init
  }, [])

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

  function convertPngImage(data: Uint8Array) {
    let blob = new Blob([data.buffer], { type: 'image/png' })
    return URL.createObjectURL(blob)
  }

  function setImage(image: Image, data: string, file: any) {
    let b = data.split(',')[1]
    let obj = atob(b) // read base64

    var len = obj.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
      bytes[i] = obj.charCodeAt(i)
    }

    image.leaf = Leaf.new(bytes)
    image.src = data
    image.edgeSrc = convertPngImage(image.leaf.get_edge(0.2, 0.7))

    dispatch({ type: CountActionKind.DECREASE, payload: 1 })
  }

  function setQrData(idx: number, data: string) {
    imageData[idx].qrData = data
    imageData[idx].qrSrc = convertPngImage(Leaf.get_qr(data))
    setImageData([...imageData])
  }

  function setGpsData(idx: number, data: string) {
    imageData[idx].gpsData = data
    imageData[idx].gpsSrc = convertPngImage(Leaf.get_qr(data))
    setImageData([...imageData])
  }

  function setEdgeData(
    idx: number,
    low_threshold: number,
    high_threshold: number
  ) {
    let instance = imageData[idx]?.leaf
    if (instance !== undefined) {
      imageData[idx].edgeData = {
        low_threshold: low_threshold,
        high_threshold: high_threshold,
      }
      imageData[idx].edgeSrc = convertPngImage(
        instance.get_edge(low_threshold, high_threshold)
      )
      setImageData([...imageData])
    }
  }

  async function readFile(event: any): Promise<void> {
    let files = Array.from(event.target.files)
    // let offset = imageData.length
    let images: Image[] = files.map((file: any, idx: number) => {
      let image = {
        name: file.name as string,
        file: file,
      } as Image

      const fileReader = new FileReader()
      fileReader.onload = (e: any) => {
        setImage(image, e.target.result as string, file)
      }
      fileReader.readAsDataURL(file)
      return image
    })
    dispatch({ type: CountActionKind.INCREASE, payload: images.length })
    setImageData([...imageData, ...images])
  }

  const theme = createTheme({})
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
