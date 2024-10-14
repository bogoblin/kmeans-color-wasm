//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn rgb_to_hex_test() {
    use kmeans_color_wasm::rgb_to_hex;
    assert_eq!(rgb_to_hex(0x40, 0x80, 0xc0), "#4080c0");
}
