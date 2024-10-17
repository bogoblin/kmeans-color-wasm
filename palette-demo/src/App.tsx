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
        sort: "Luminosity"
    });

    const benchmarkStart = performance.now();
    const palette = loading === "loaded"
        ? get_kmeans(imageElement.current, kMeansOptions).reverse()
        : [];
    const timeTaken = performance.now() - benchmarkStart;

    return (
        <form className={"flex flex-col"}>
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
                <div className={"absolute w-full h-full bg-black flex"}
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
    const exampleCode = `const centroids = get_kmeans(image, ${JSON.stringify(kMeansOptions, null, 4)});`;
    return <div className={"card bg-secondary shadow-xl flex-row m-4 justify-between"}
    >
        <div className={"card-body flex-row w-full justify-between"}>
            <div>
                <label htmlFor={"k"} className={"label"}>
                    <span className={"label-text text-secondary-content"}>Clusters:</span>
                    <input className={"input max-w-24"}
                           id={"k"}
                           type={"number"} value={kMeansOptions.k}
                           min={1}
                           onChange={event => {
                               const options = {...kMeansOptions};
                               options.k = parseInt(event.target.value);
                               setKMeansOptions(options);
                           }}/>
                </label>
                <label htmlFor={"max_iterations"} className={"label gap-4"}>
                    <span className={"label-text text-secondary-content"}>Iterations:</span>
                    <input className={"input max-w-24"}
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
                    <label className={"label justify-center gap-2"}>
                        <span className={"label-text text-secondary-content"}>RGB</span>
                        <input type={"checkbox"} className={"toggle"}
                               onChange={e => {
                                   const setToLab = e.target.checked;
                                   const options = {...kMeansOptions};
                                   if (setToLab) {
                                       options.color_space = "LAB";
                                   } else {
                                       options.color_space = "RGB";
                                   }
                                   setKMeansOptions(options);
                               }}
                        />
                        <span className={"label-text text-secondary-content"}>LAB</span>
                    </label>
                </div>
            </div>
            <div className={"rounded p-4 bg-black bg-opacity-50 text-accent-content"}>
                {exampleCode.split('\n').map(line => <pre key={line}><code data-prefix={""}>{line}</code></pre>)}
            </div>
        </div>
    </div>;
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
