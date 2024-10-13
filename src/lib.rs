mod utils;

use std::cmp::Ordering;
use std::cmp::Ordering::{Equal, Greater, Less};
use js_sys::Uint8ClampedArray;
use kmeans_colors::{Calculate, CentroidData, Sort};
use palette::rgb::Rgb;
use palette::{encoding, Srgb};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct JsCentroidData {
    pub r: f64,
    pub g: f64,
    pub b: f64,
    pub percentage: f64,
}

impl JsCentroidData {
    fn from(centroid: &CentroidData<Rgb>) -> Self {
        let (r,g,b) = centroid.centroid.into_components();
        Self {
            r: r as f64,
            g: g as f64,
            b: b as f64,
            percentage: centroid.percentage as f64
        }
    }
}

impl Eq for JsCentroidData {}

impl PartialEq<Self> for JsCentroidData {
    fn eq(&self, other: &Self) -> bool {
        self.percentage == other.percentage
    }
}

impl PartialOrd<Self> for JsCentroidData {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        if self.percentage > other.percentage {
            Some(Greater)
        } else if self.percentage < other.percentage {
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

#[wasm_bindgen]
pub fn get_kmeans(
    k: usize,
    max_iter: usize,
    converge: f32,
    buf: Uint8ClampedArray,
) -> Vec<JsCentroidData> {
    let colors: Vec<Rgb<encoding::Srgb, f32>> = buf.to_vec().chunks(4).map(|rgba| {
        return Srgb::new(rgba[0], rgba[1], rgba[2]).into_format()
    }).collect();
    let result = kmeans_colors::get_kmeans(k, max_iter, converge, false, colors.as_slice(), 451);
    let mut centroids = Srgb::sort_indexed_colors(&result.centroids, &result.indices)
        .iter().map(|centroid| {
        JsCentroidData::from(centroid)
    }).collect::<Vec<JsCentroidData>>();
    centroids.sort();
    centroids
}
