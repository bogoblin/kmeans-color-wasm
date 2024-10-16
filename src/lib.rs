mod utils;

use std::cmp::Ordering;
use js_sys::Math::random;
use kmeans_colors::{CentroidData, Kmeans, Sort};
use palette::cast::from_component_slice;
use palette::rgb::Rgb;
use palette::{IntoColor, Lab, Srgb, Srgba, WithAlpha};
use tsify::Tsify;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, ImageData};
use serde::{Deserialize, Serialize};
use crate::utils::set_panic_hook;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn get_kmeans(image: JsValue, options: GetKmeansOptions) -> Result<Vec<Centroid>, JsValue> {
    set_panic_hook();

    let result = match options.color_space {
        None | Some(ColorSpace::RGB) => {
            let colors = options.rgb_vec(image)?;
            kmeans_colors::get_kmeans(
                options.k(),
                options.max_iterations(),
                options.converge(),
                false,
                &colors,
                options.seed()
            )
        }
        Some(ColorSpace::LAB) => {
            let colors = options.lab_vec(image)?;
            let result = kmeans_colors::get_kmeans(
                options.k(),
                options.max_iterations(),
                options.converge(),
                false,
                &colors,
                options.seed()
            );

            Kmeans {
                score: result.score,
                centroids: result.centroids.iter().map(|lab| (*lab).into_color()).collect(),
                indices: result.indices
            }
        }
    };
    let mut centroids: Vec<_> = Srgb::sort_indexed_colors(&result.centroids, &result.indices)
        .into_iter().map(Centroid::from).collect();
    match options.sorting() {
        CentroidSort::Percentage => centroids.sort_by(|a, b| a.percentage.partial_cmp(&b.percentage).unwrap_or(Ordering::Equal)),
        CentroidSort::Luminosity => centroids.sort_by(|a, b| a.lab[0].partial_cmp(&b.lab[0]).unwrap_or(Ordering::Equal))
    }
    Ok(centroids)
}

#[derive(Tsify, Serialize, Deserialize)]
pub enum ColorSpace {
    RGB,
    LAB,
}

#[derive(Tsify, Serialize, Deserialize)]
pub enum CentroidSort {
    #[tsify(name = "percentage")]
    Percentage,
    #[tsify(name = "luminosity")]
    Luminosity,
}

#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct GetKmeansOptions {
    #[tsify(optional)]
    k: Option<usize>,
    #[tsify(optional)]
    max_iter: Option<usize>,
    #[tsify(optional)]
    converge: Option<f32>,
    #[tsify(optional)]
    seed: Option<u64>,
    #[tsify(optional)]
    color_space: Option<ColorSpace>,
    #[tsify(optional)]
    sort: Option<CentroidSort>,
}

impl GetKmeansOptions {
    fn rgb_vec(&self, image: JsValue) -> Result<Vec<Rgb>, JsValue> {
        let rgba: Vec<Rgb> = from_component_slice::<Srgba<u8>>(&self.rgb_bytes(image)?)
            .iter()
            .map(|x| x.without_alpha().into_format())
            .collect();

        Ok(rgba)
    }

    fn lab_vec(&self, image: JsValue) -> Result<Vec<Lab>, JsValue> {
        let lab : Vec<Lab> = self.rgb_vec(image)?.into_iter()
            .map(|rgb| rgb.into_color())
            .collect();

        Ok(lab)
    }

    fn rgb_bytes(&self, image: JsValue) -> Result<Vec<u8>, JsValue> {
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

        if let Ok(image) = image.clone().dyn_into::<HtmlImageElement>() {
           context.draw_image_with_html_image_element_and_dw_and_dh(&image, 0f64, 0f64, 100f64, 100f64)?;
        }
        else if let Ok(image) = image.clone().dyn_into::<HtmlCanvasElement>() {
            context.draw_image_with_html_canvas_element_and_dw_and_dh(&image, 0f64, 0f64, 100f64, 100f64)?;
        }
        else if let Ok(image) = image.clone().dyn_into::<ImageData>() {
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
        self.seed.unwrap_or(( random() * (2^32) as f64 ) as u64)
    }

    fn k(&self) -> usize {
        self.k.unwrap_or(8)
    }

    fn max_iterations(&self) -> usize {
        self.max_iter.unwrap_or(20)
    }

    fn converge(&self) -> f32 {
        match self.converge {
            Some(converge) => converge,
            None => {
                match self.color_space() {
                    ColorSpace::RGB => 0.0025,
                    ColorSpace::LAB => 5.0
                }
            }
        }
    }

    fn color_space(&self) -> ColorSpace {
        match self.color_space {
            None | Some(ColorSpace::RGB) => ColorSpace::RGB,
            Some(ColorSpace::LAB) => ColorSpace::LAB
        }
    }

    fn sorting(&self) -> CentroidSort {
        match self.sort {
            None | Some(CentroidSort::Percentage) => CentroidSort::Percentage,
            Some(CentroidSort::Luminosity) => CentroidSort::Luminosity
        }
    }
}


#[wasm_bindgen(getter_with_clone)]
pub struct Centroid {
    pub rgb_hex: String,
    pub rgb: Vec<f64>,
    pub lab: Vec<f64>,
    pub percentage: f64,
}

impl Centroid {
    fn from(centroid_data: CentroidData<Srgb>) -> Self {
        let percentage = centroid_data.percentage as f64;
        let rgb = centroid_data.centroid.into_format::<u8>();
        let (r,g,b) = rgb.into_components();
        let lab: Lab = centroid_data.centroid.into_color();
        let (l,a,bl) = lab.into_components();
        Self {
            rgb_hex: rgb_to_hex(r,g,b),
            rgb: vec!(r as f64,g as f64,b as f64),
            lab: vec!(l as f64,a as f64,bl as f64),
            percentage
        }
    }
}

pub fn rgb_to_hex(r: u8, g: u8, b: u8) -> String {
    format!("#{r:02x}{g:02x}{b:02x}")
}
