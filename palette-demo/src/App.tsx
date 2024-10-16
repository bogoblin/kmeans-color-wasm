import {useRef, useState} from 'react'
import {Centroid, GetKmeansOptions, get_kmeans} from "kmeans-color-wasm";

function App() {
    const [imageUrl, setImageUrl] = useState<string | null>("https://cat-milk.github.io/Anime-Girls-Holding-Programming-Books/static/2718956f4a96f79022611b89d4e65687/47126/Chito_Saving_Burning_Mastering_Typescript.png");
    const imageElement = useRef<HTMLImageElement>(null);
    const [loading, setLoading] = useState<"loading" | "loaded">("loading");
    const [kMeansOptions, setKMeansOptions] = useState<GetKmeansOptions>({
        k: 5,
        max_iter: 50,
        converge: undefined,
        color_space: "RGB",
        sort: "Percentage"
    });

    const benchmarkStart = performance.now();
    const palette = loading === "loaded"
        ? get_kmeans(imageElement.current, kMeansOptions).reverse()
        : [];
    const timeTaken = performance.now() - benchmarkStart;

    return (
        <form className={"h-screen dark:bg-gray-900 dark:text-gray-200 flex flex-col"}>
            <h1 className={"text-4xl font-bold m-3 text-center flex-grow-0" +
                ""}>Create Palette from Image</h1>
            <div className={"min-h-0 relative max-h-full flex-grow"}>
                <input className={"absolute opacity-0 w-full h-full z-20 cursor-pointer"}
                       id={"imageUpload"}
                       type={"file"} onChange={event => {
                    const file = event.target.files?.item(0) || null;
                    if (file) {
                        setLoading("loading");
                        setImageUrl(URL.createObjectURL(file));
                    }
                }}/>
                <div className={"absolute w-full h-full bg-gray-700 flex"}
                >
                    <div className={"text-center flex-grow " +
                        " m-10 p-10 border-8 border-dashed rounded-3xl border-opacity-60 " +
                        " flex flex-col justify-around"}>
                        <p className={"text-2xl font-bold"}>Drag an image here to upload</p>
                        <p className={"text-base"}>or click to select a file</p>
                    </div>
                </div>
                <label className={"h-full"}
                       htmlFor={"imageUpload"}>
                    {imageUrl ?
                        <img className={"min-h-0 w-full h-full object-contain"}
                             crossOrigin={"anonymous"}
                             src={imageUrl}
                             ref={imageElement}
                             onLoad={() => setLoading("loaded")}
                        /> : ''}
                </label>
            </div>
            <Palette palette={palette}/>
            <p className={"p-2 text-right italic flex-grow-0"}>done in {timeTaken.toFixed(2)}ms</p>
            <Controls kMeansOptions={kMeansOptions} setKMeansOptions={setKMeansOptions}/>
        </form>
    )
}

function Controls({kMeansOptions, setKMeansOptions}: {
    kMeansOptions: GetKmeansOptions,
    setKMeansOptions: (o: GetKmeansOptions) => void
}) {
    return <div className={" text-xl text-right flex flex-row justify-evenly"}
    >
        <label htmlFor={"k"} className={""}>Clusters:
        <input className={"bg-gray-700 p-1 rounded m-1 w-20"}
               id={"k"}
               type={"number"} value={kMeansOptions.k}
               min={1}
               onChange={event => {
                   const options = {...kMeansOptions};
                   options.k = parseInt(event.target.value);
                   setKMeansOptions(options);
               }}/>
        </label>
        <label htmlFor={"max_iterations"} className={""}>Iterations:
        <input className={"bg-gray-700 p-1 rounded m-1 w-20"}
               id={"max_iterations"}
               type={"number"} value={kMeansOptions.max_iter}
               min={0} max={10000}
               step={10}
               onChange={event => {
                   const options = {...kMeansOptions};
                   options.max_iter = parseInt(event.target.value);
                   setKMeansOptions(options);
               }}/>
        </label>
        <div className={""}>
            <label className={"inline-block"}>Color space:</label>
            <div className={"inline-block"}>
                <label className={"p-1"}>
                    <input type={"radio"} name={"color_space"} value={"RGB"}
                           checked={kMeansOptions.color_space === "RGB"}
                           onChange={() => {
                               const options = {...kMeansOptions};
                               options.color_space = "RGB";
                               setKMeansOptions(options);
                           }}
                    /> RGB
                </label>
                <label className={"p-1"}>
                    <input type={"radio"} name={"color_space"} value={"LAB"}
                           checked={kMeansOptions.color_space === "LAB"}
                           onChange={() => {
                               const options = {...kMeansOptions};
                               options.color_space = "LAB";
                               setKMeansOptions(options);
                           }}
                    /> LAB
                </label>
            </div>
        </div>
    </div>
}

function Palette({palette}: { palette: Centroid[] }) {
    return <div id={"palette"} className={"flex w-full min-h-20 flex-shrink-0 flex-grow"}>
        {palette.map((centroid, i) => {
            return <div key={i}
                        className={"h-full flex flex-row justify-evenly"}
                        style={{backgroundColor: centroid.rgb_hex, flexGrow: centroid.percentage}}>
                <div className={"w-0 overflow-hidden color-info font-mono text-nowrap text-sm flex flex-col justify-center"}>
                    <Copiable text={( centroid.percentage * 100 ).toPrecision(2)+"%"}/>
                    <Copiable text={`rgb(${[...centroid.rgb].map(v => v.toFixed(0)).join(', ')})`}/>
                    <Copiable text={`lab(${[...centroid.lab].map(v => v.toFixed(2)).join(', ')})`}/>
                </div>
            </div>
        })}
    </div>
}

function Copiable({text}: {text: string}) {
    return <div className={"p-0.5"}>
        <a className={"cursor-pointer w-full bg-gray-900 p-0.5 m-1 rounded"} onClick={() => navigator.clipboard.writeText(text)}>
            {text}
        </a>
    </div>;
}

export default App
