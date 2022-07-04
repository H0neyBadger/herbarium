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

    pub fn get_edge(
        blob: &[u8],
        low_threshold: f32,
        high_threshold: f32,
        orientation: u8,
    ) -> Vec<u8> {
        console_error_panic_hook::set_once();
        let mut img = image::io::Reader::new(std::io::Cursor::new(blob))
            .with_guessed_format()
            .unwrap()
            .decode()
            .unwrap()
            .to_luma8();
        let w: f32 = img.width() as f32;
        let h: f32 = img.height() as f32;
        let ratio: f32 = w / 1080.0;
        if ratio > 1.0 {
            // perf; resize image before edge
            img = image::imageops::resize(
                &img,
                (w / ratio) as u32,
                (h / ratio) as u32,
                image::imageops::FilterType::Nearest,
            );
        }
        let mut ret = imageproc::edges::canny(
            &img,
            low_threshold,  // low threshold
            high_threshold, // high threshold
        );
        // invert black and white
        image::imageops::colorops::invert(&mut ret);
        match orientation {
            2 => image::imageops::flip_horizontal_in_place(&mut ret),
            3 => image::imageops::rotate180_in_place(&mut ret),
            4 => {
                image::imageops::flip_horizontal_in_place(&mut ret);
                image::imageops::rotate180_in_place(&mut ret);
            }
            5 => {
                let tmp = image::imageops::flip_horizontal(&ret);
                image::imageops::rotate90_in(&tmp, &mut ret).unwrap();
            }
            6 => {
                ret = image::imageops::rotate90(&ret);
            }
            7 => {
                let tmp = image::imageops::flip_horizontal(&ret);
                image::imageops::rotate270_in(&tmp, &mut ret).unwrap();
            }
            8 => {
                ret = image::imageops::rotate270(&ret);
            }
            _ => {}
        }
        let mut bytes: Vec<u8> = Vec::new();
        ret.write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageOutputFormat::Png,
        )
        .unwrap();
        bytes
    }
}
