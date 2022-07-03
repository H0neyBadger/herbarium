use wasm_bindgen::prelude::*;

extern crate console_error_panic_hook;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}


#[wasm_bindgen]
pub struct Leaf {}

#[wasm_bindgen]
impl Leaf {
    pub fn get_qr(data: String) -> Vec<u8> {
        console_error_panic_hook::set_once();
        qrcode_generator::to_png_to_vec(data, qrcode_generator::QrCodeEcc::Low, 1024).unwrap()
    }

    pub fn get_edge(blob: &[u8], low_threshold: f32, high_threshold: f32) -> Vec<u8> {
        console_error_panic_hook::set_once();
        let img = image::io::Reader::new(std::io::Cursor::new(blob))
            .with_guessed_format()
            .unwrap()
            .decode()
            .unwrap()
            .to_luma8();
        let mut ret = imageproc::edges::canny(
            &img,
            low_threshold,  // low threshold
            high_threshold, // high threshold
        );
        // invert black and white
        image::imageops::colorops::invert(&mut ret);

        let mut bytes: Vec<u8> = Vec::new();
        ret.write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageOutputFormat::Png,
        )
        .unwrap();
        bytes
    }
}
