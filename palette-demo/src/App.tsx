import {useCallback, useState} from 'react'
import {Centroid, get_kmeans} from "kmeans-color-wasm";

function App() {
    const [imageUrl, setImageUrl] = useState<string | null>("https://cat-milk.github.io/Anime-Girls-Holding-Programming-Books/static/2718956f4a96f79022611b89d4e65687/47126/Chito_Saving_Burning_Mastering_Typescript.png");
    const [palette, setPalette] = useState<Centroid[] | null>(null);

    const updatePalette = useCallback((imageElement: HTMLImageElement) => {
        console.log("Updating palette.")
        setPalette(get_kmeans(imageElement, {
            k: 5,
            max_iter: 10000,
        }).reverse());
    }, [])
    return (
        <div className={"h-screen dark:bg-gray-900 dark:text-gray-200"}>
            <form className={"h-full"}>
                <input className={"hidden"}
                       id={"imageUpload"}
                       type={"file"} name={"imageUpload"} onChange={event => {
                    const file = event.target.files?.item(0) || null;
                    if (file) {
                        setImageUrl(URL.createObjectURL(file));
                    }
                }}/>
                <label htmlFor={"imageUpload"} className={"flex flex-col items-center max-h-full"}>
                    {imageUrl ?
                        <img className={"min-h-0"}
                             crossOrigin={"anonymous"}
                             src={imageUrl}
                             onLoad={event => updatePalette(event.currentTarget)}
                        /> : ''}
                    {palette ? <Palette palette={palette}/> : ''}
                </label>
            </form>
        </div>
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
