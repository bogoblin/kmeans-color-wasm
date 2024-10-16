import {useRef, useState} from 'react'
import {Centroid, GetKmeansOptions, get_kmeans} from "kmeans-color-wasm";

function App() {
    const [imageUrl, setImageUrl] = useState<string | null>("https://cat-milk.github.io/Anime-Girls-Holding-Programming-Books/static/2718956f4a96f79022611b89d4e65687/47126/Chito_Saving_Burning_Mastering_Typescript.png");
    const imageElement = useRef<HTMLImageElement>(null);
    const [loading, setLoading] = useState<"loading" | "loaded">("loading");
    const [kMeansOptions, setKMeansOptions] = useState<GetKmeansOptions>({
        k: 5,
        max_iter: 50,
        converge: 0.0025,
        color_space: "RGB",
        sort: "Percentage"
    });

    const palette = loading === "loaded"
        ? get_kmeans(imageElement.current, kMeansOptions).reverse()
        : null;

    return (
        <form className={"h-screen dark:bg-gray-900 dark:text-gray-200 flex flex-col"}
              style={{gridTemplateRows: "1fr auto auto"}}
        >
            <div className={"min-h-0 relative"}>
                <input className={"absolute opacity-0 w-full h-full"}
                       id={"imageUpload"}
                       type={"file"} onChange={event => {
                    const file = event.target.files?.item(0) || null;
                    if (file) {
                        setLoading("loading");
                        setImageUrl(URL.createObjectURL(file));
                    }
                }}/>
                <label className={"h-full flex flex-row justify-evenly"}
                    htmlFor={"imageUpload"}>
                {imageUrl ?
                    <img className={"min-h-0 h-full w-auto"}
                         crossOrigin={"anonymous"}
                         src={imageUrl}
                         ref={imageElement}
                         onLoad={() => setLoading("loaded")}
                    /> : ''}
                </label>
            </div>
            {palette ? <Palette palette={palette}/> : ''}
            <input className={"bg-gray-700 p-1 rounded m-1"}
                   type={"number"} name={"k"} value={kMeansOptions.k} onChange={event => {
                const options = {...kMeansOptions};
                options.k = parseInt(event.target.value);
                setKMeansOptions(options);
            }}/>
        </form>
    )
}

function Palette({palette}: { palette: Centroid[] }) {
    return <div className={"flex w-full h-20 flex-shrink-0"}>
        {palette.map((centroid, i) => {
            return <div key={i}
                        className={"h-full"}
                        style={{backgroundColor: centroid.rgb_hex, flexGrow: centroid.percentage}}></div>
        })}
    </div>
}


export default App
