mod utils;

use kmeans_colors::{CentroidData, Kmeans, Sort};
use palette::cast::from_component_slice;
use palette::rgb::Rgb;
use palette::{IntoColor, Lab, Srgb, Srgba, WithAlpha};
use std::cmp::Ordering;
use std::cmp::Ordering::{Equal, Greater, Less};
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, ImageData};
use crate::utils::set_panic_hook;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn get_kmeans(options: GetKmeansOptions) -> Result<Vec<JsCentroidData>, JsValue> {
    set_panic_hook();

    match options.color_space {
        None | Some(ColorSpace::RGB) => {
            let colors = options.rgb_vec()?;
            let result = kmeans_colors::get_kmeans(
                options.k,
                options.max_iter,
                options.converge,
                false,
                &colors,
                options.seed()
            );
            let centroids = Srgb::sort_indexed_colors(&result.centroids, &result.indices)
                .into_iter().map(|centroid| JsCentroidData::from(centroid)).collect();
            Ok(centroids)
        }
        Some(ColorSpace::LAB) => {
            let colors = options.lab_vec()?;
            let result = kmeans_colors::get_kmeans(
                options.k,
                options.max_iter,
                options.converge,
                false,
                &colors,
                options.seed()
            );

            let result = Kmeans {
                score: result.score,
                centroids: result.centroids.iter().map(|lab| (*lab).into_color()).collect(),
                indices: result.indices
            };

            let centroids = Srgb::sort_indexed_colors(&result.centroids, &result.indices)
                .into_iter().map(|centroid| JsCentroidData::from(centroid)).collect();
            Ok(centroids)
        }
        Some(ColorSpace::__Invalid) => Err(JsValue::from_str("Invalid color space. Please use RGB or LAB"))
    }
}

#[wasm_bindgen]
pub enum ColorSpace {
    RGB = "RGB",
    LAB = "LAB",
}

#[wasm_bindgen]
pub struct GetKmeansOptions {
    k: usize,
    max_iter: usize,
    converge: f32,
    image: JsValue, // Can be HTMLImageElement, HTMLCanvasElement, or ImageData
    seed: Option<u64>,
    color_space: Option<ColorSpace>,
}

impl GetKmeansOptions {
    fn rgb_vec(&self) -> Result<Vec<Rgb>, JsValue> {
        let rgba: Vec<Rgb> = from_component_slice::<Srgba<u8>>(&self.rgb_bytes()?)
            .iter()
            .map(|x| x.without_alpha().into_format())
            .collect();

        Ok(rgba)
    }

    fn lab_vec(&self) -> Result<Vec<Lab>, JsValue> {
        let lab : Vec<Lab> = self.rgb_vec()?.into_iter()
            .map(|rgb| rgb.into_color())
            .collect();

        Ok(lab)
    }

    fn rgb_bytes(&self) -> Result<Vec<u8>, JsValue> {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document
            .create_element("canvas")?
            .dyn_into::<HtmlCanvasElement>()?;
        canvas.set_width(100);
        canvas.set_height(100);
        let context = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        if let Ok(image) = self.image.clone().dyn_into::<HtmlImageElement>() {
           context.draw_image_with_html_image_element_and_dw_and_dh(&image, 0f64, 0f64, 100f64, 100f64)?;
        }
        else if let Ok(image) = self.image.clone().dyn_into::<HtmlCanvasElement>() {
            context.draw_image_with_html_canvas_element_and_dw_and_dh(&image, 0f64, 0f64, 100f64, 100f64)?;
        }
        else if let Ok(image) = self.image.clone().dyn_into::<ImageData>() {
            // first draw to the canvas at the original width:
            canvas.set_width(image.width());
            canvas.set_height(image.height());
            context.put_image_data(&image, 0f64, 0f64)?;
            // then we can scale it:
            context.draw_image_with_html_canvas_element_and_dw_and_dh(&canvas, 0f64, 0f64, 100f64, 100f64)?;
        }
        else {
            return Err(JsValue::from_str("image should be an img element, a canvas element, or an ImageData"));
        }

        Ok(context.get_image_data(0f64, 0f64, 100f64, 100f64)?.data().to_vec())
    }

    fn seed(&self) -> u64 {
        self.seed.unwrap_or(0)
    }
}


#[wasm_bindgen]
pub struct JsCentroidData {
    centroid_data: CentroidData<Rgb>,
}

impl JsCentroidData {
    fn from(centroid_data: CentroidData<Srgb>) -> Self {
        Self { centroid_data }
    }

    pub fn hex_rgb(&self) -> String {
        rgb_to_hex(self.centroid_data.centroid)
    }

    pub fn percentage(&self) -> f64 {
        self.centroid_data.percentage as f64
    }
}

pub fn rgb_to_hex(rgb: Rgb) -> String {
    let (r,g,b) = rgb.into_format::<u8>().into_components();
    format!("#{r:02x}{g:02x}{b:02x}")
}

impl Eq for JsCentroidData {}

impl PartialEq<Self> for JsCentroidData {
    fn eq(&self, other: &Self) -> bool {
        self.percentage() == other.percentage()
    }
}

impl PartialOrd<Self> for JsCentroidData {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        if self.percentage() > other.percentage() {
            Some(Greater)
        } else if self.percentage() < other.percentage() {
            Some(Less)
        } else {
            Some(Equal)
        }
    }
}

impl Ord for JsCentroidData {
    fn cmp(&self, other: &Self) -> Ordering {
        self.partial_cmp(other).unwrap_or(Equal)
    }
}
