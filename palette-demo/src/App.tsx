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
        <form className={"flex flex-col bg-base-100"}>
            <div className={"navbar"}>
                <div className={"flex-1"}>
                    <span className={"btn btn-ghost text-xl"}>
                         k-means palette generator
                    </span>
                </div>
                <div className={"flex-none"}>
                    <ul className={"menu menu-horizontal"}>
                        <li><a className={"btn btn-ghost btn-circle"}
                               href={"https://www.npmjs.com/package/kmeans-color-wasm"}><img className={"w-1/2"}
                                                                                             src={"https://raw.githubusercontent.com/npm/logos/refs/heads/master/npm%20square/n.svg"}/></a>
                        </li>
                        <li><a className={"btn btn-ghost btn-circle"}
                               href={"https://github.com/bogoblin/kmeans-color-wasm"}><img
                            className={"w-1/2 bg-neutral-content mask mask-circle"}
                            src={"https://raw.githubusercontent.com/gilbarbara/logos/refs/heads/main/logos/github-icon.svg"}/></a>
                        </li>
                    </ul>
                </div>
                <label className="swap swap-rotate">
                    {/* this hidden checkbox controls the state */}
                    <input type="checkbox" className="theme-controller" value="light"/>

                    {/* sun icon */}
                    <svg
                        className="swap-off h-10 w-10 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
                    </svg>

                    {/* moon icon */}
                    <svg
                        className="swap-on h-10 w-10 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
                    </svg>
                </label>
            </div>
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
                <div className={"absolute w-full h-full bg-base-100 flex"}
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
            <Controls kMeansOptions={kMeansOptions} setKMeansOptions={setKMeansOptions}/>
            <p className={"p-2 text-right italic flex-grow-0"}>done in {timeTaken.toFixed(2)}ms</p>
        </form>
    )
}

function Controls({kMeansOptions, setKMeansOptions}: {
    kMeansOptions: GetKmeansOptions,
    setKMeansOptions: (o: GetKmeansOptions) => void
}) {
    const exampleCode = `const centroids = get_kmeans(image, ${JSON.stringify(kMeansOptions, null, 4)});`;
    return <div className={"card bg-base-300 shadow-xl flex-row m-4 justify-between"}
    >
        <div className={"card-body flex-row w-full justify-between"}>
            <div>
                <label htmlFor={"k"} className={"label"}>
                    <span className={"label-text"}>Clusters:</span>
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
                    <span className={"label-text"}>Iterations:</span>
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
                        <span className={"label-text"}>RGB</span>
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
                        <span className={"label-text"}>LAB</span>
                    </label>
                </div>
            </div>
            <div className={"overflow-x-scroll rounded-lg p-4 bg-base-100 bg-opacity-50"}>
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
        <a className={"cursor-pointer bg-gray-900 text-white text-opacity-80 p-0.5 m-1 rounded"} onClick={() => navigator.clipboard.writeText(text)}>
            {text}
        </a>
    </div>;
}

export default App
