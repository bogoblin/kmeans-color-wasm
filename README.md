# kmeans-color-wasm

k-means clustering for color images. Uses the kmeans_colors crate from
https://crates.io/crates/kmeans_colors

## Usage

```typescript
import {get_kmeans} from "kmeans_color_wasm";

const image = document.getElementsByTagName('img')[0];

const result = get_kmeans(image);
const result_with_options = get_kmeans(image, {
    color_space: "LAB", // Can use LAB or RGB, RGB is default
    converge: 5.0, // 0.0025 is default for RGB, 5.0 is default for LAB
    k: 8, // Number of clusters
    max_iter: 50, // Number of iterations - increasing gives more accurate results but takes longer
    seed: 451, // Random seed - chosen randomly if not provided
    sort: "percentage" // How to sort the resulting centroids
});

const [r,g,b] = result[0].rgb;
```

## About

todo

## Building

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```

### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```
