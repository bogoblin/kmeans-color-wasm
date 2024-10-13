//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn rgb_to_hex_test() {
    use palette::rgb::Rgb;
    use kmeans_color_wasm::rgb_to_hex;
    let rgb = Rgb::new(0.25, 0.5, 0.753);
    assert_eq!(rgb_to_hex(rgb), "#4080c0");
}
