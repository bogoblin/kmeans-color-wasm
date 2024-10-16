import {useCallback, useState} from 'react'
import {Centroid, get_kmeans} from "kmeans-color-wasm";

function App() {
    const [imageUrl, setImageUrl] = useState<string | null>("https://cat-milk.github.io/Anime-Girls-Holding-Programming-Books/static/2718956f4a96f79022611b89d4e65687/47126/Chito_Saving_Burning_Mastering_Typescript.png");
    const [palette, setPalette] = useState<Centroid[] | null>(null);

    const updatePalette = useCallback((imageElement: HTMLImageElement) => {
        console.log("Updating palette.")
        setPalette(get_kmeans(imageElement, {
            k: 5,
        }).reverse());
    }, [])
    return (
        <div className={"h-screen dark:bg-gray-900 dark:text-gray-200"}>
            <form >
                <input type={"file"} name={"imageUpload"} onChange={event => {
                    const file = event.target.files?.item(0) || null;
                    if (file) {
                        setImageUrl(URL.createObjectURL(file));
                    }
                }}/>
            </form>
            {imageUrl ?
            <img crossOrigin={"anonymous"}
                 src={imageUrl}
                 onLoad={event => updatePalette(event.currentTarget)}
            /> : ''}
            {palette ? <Palette palette={palette}/> : ''}
        </div>
    )
}

function Palette({palette}: { palette: Centroid[] }) {
    return <div className={"flex"}>
        {palette.map(( centroid, i ) => {
            return <div key={i} className={"h-24"} style={{backgroundColor: centroid.rgb_hex, flexGrow: centroid.percentage}}></div>
        })}
    </div>
}


export default App
