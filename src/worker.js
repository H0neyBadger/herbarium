import init, { Leaf } from 'leaf'

// init wasm
const ini = init()

function convertToPngImage(data) {
  let blob = new Blob([data.buffer], { type: 'image/png' })
  return URL.createObjectURL(blob)
}

function convertFromPngImage(data) {
  const b = data.split(',')[1]
  const obj = atob(b) // read base64
  const len = obj.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = obj.charCodeAt(i)
  }
  return bytes
}

onmessage = async (event) => {
  await ini
  let data = event.data
  let ret = { action: data.action, idx: data.idx }
  switch (data.action) {
    case 'EDGE':
      const bytes = convertFromPngImage(data.data)
      let instance = Leaf.new(bytes)
      ret.data = convertToPngImage(
        instance.get_edge(data.low_threshold, data.high_threshold)
      )
      break
    case 'GPS':
      ret.data = convertToPngImage(Leaf.get_qr(data.data))
      break
    case 'DATA':
      ret.data = convertToPngImage(Leaf.get_qr(data.data))
      break
    default:
      // do nothing
      return
  }
  postMessage(ret)
}