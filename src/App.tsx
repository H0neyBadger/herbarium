import { ChangeEvent, useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Tabs, Tab } from '@mui/material'

import init, { Leaf } from 'leaf'
import HerbariumAppBar from './Header'
import { Image, StandardImageList, ImageTab } from './Images'

function App() {
  // const classes = useStyles();
  const [tab, setTab] = useState(0)
  const [imageData, setImageData] = useState<Image[]>([])

  useEffect(() => {
    init() // FIXME handle wasm init
  }, [])

  function handleChangeTab(event: ChangeEvent<{}>, newValue: number) {
    setTab(newValue)
  }

  function convertPngImage(data: Uint8Array) {
    let blob = new Blob([data.buffer], { type: 'image/png' })
    return URL.createObjectURL(blob)
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
    let instance = imageData[idx].leaf
    imageData[idx].edgeData = {
      low_threshold: low_threshold,
      high_threshold: high_threshold,
    }
    imageData[idx].edgeSrc = convertPngImage(
      instance.get_edge(low_threshold, high_threshold)
    )
    setImageData([...imageData])
  }

  async function readFile(event: any): Promise<void> {
    let files = Array.from(event.target.files).map((file: any) => {
      const fileReader = new FileReader()
      return new Promise((resolve) => {
        fileReader.onload = (e: any) =>
          resolve({ data: e.target.result, file: file })
        fileReader.readAsDataURL(file)
      })
    })
    // read all
    let ret: Image[] = []
    let res = await Promise.all(files)
    res.forEach((e: any) => {
      let data = e.data as string
      let b = data.split(',')[1]
      let obj = atob(b) // read base64

      var len = obj.length
      var bytes = new Uint8Array(len)
      for (var i = 0; i < len; i++) {
        bytes[i] = obj.charCodeAt(i)
      }

      let instance = Leaf.new(bytes)

      let image = {
        src: e.data as string,
        file: e.file,
        name: e.file.name as string,
        leaf: instance,
      }
      ret.push(image)
    })
    setImageData([...imageData, ...ret])
  }

  const theme = createTheme({})
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HerbariumAppBar onImport={readFile} />
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
