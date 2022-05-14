use wasm_bindgen::prelude::*;

extern crate console_error_panic_hook;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Leaf {
    raw: Vec<u8>,
    metadata: Option<exif::Exif>,
}

#[wasm_bindgen]
impl Leaf {
    pub fn new(blob: Vec<u8>) -> Self {
        console_error_panic_hook::set_once();

        let mut metadata: Option<exif::Exif> = None;
        let mut c = std::io::Cursor::new(&blob);
        let exifreader = exif::Reader::new();

        match exifreader.read_from_container(&mut c) {
            Ok(m) => metadata = Some(m),
            Err(m) => log(&format!("Error: {:?}", m)),
        }

        if let Some(m) = &metadata {
            for f in m.fields() {
                log(&format!(
                    "{} {} {}",
                    &f.tag,
                    &f.ifd_num,
                    &f.display_value().with_unit(m)
                ));
            }
        }
        Self {
            raw: blob.clone(),
            metadata: metadata,
        }
    }

    pub fn get_qr(data: String) -> Vec<u8> {
        qrcode_generator::to_png_to_vec(data, qrcode_generator::QrCodeEcc::Low, 1024).unwrap()
    }

    pub fn get_edge(&self, low_threshold: f32, high_threshold: f32) -> Vec<u8> {
        let img = image::io::Reader::new(std::io::Cursor::new(&self.raw))
            .with_guessed_format()
            .unwrap()
            .decode()
            .unwrap()
            .to_luma8();
        let ret = imageproc::edges::canny(
            &img,
            low_threshold,  // low threshold
            high_threshold, // high threshold
        );
        let mut bytes: Vec<u8> = Vec::new();
        ret.write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageOutputFormat::Png,
        )
        .unwrap();
        bytes
    }
}
