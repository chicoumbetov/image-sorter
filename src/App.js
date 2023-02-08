import { useState, useEffect, useRef } from 'react';
import { ObjectDetector } from './ObjectDetection';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import * as mobilenet from "@tensorflow-models/mobilenet";
const mobilenet = require('@tensorflow-models/mobilenet');


function App() {
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [model, setModel] = useState(null)
    const [imageURL, setImageURL] = useState(null);
    const [results, setResults] = useState([])
    const [history, setHistory] = useState([])

    const [imgData, setImgData] = useState(null);

    const imageRef = useRef()
    const textInputRef = useRef()
    const fileInputRef = useRef()

    const normalizePredictions = (predictions, imgSize) => {
      if (!predictions || !imgSize || !imageRef) return predictions || [];
      return predictions.map((prediction) => {
        const { bbox } = prediction;
        const oldX = bbox[0];
        const oldY = bbox[1];
        const oldWidth = bbox[2];
        const oldHeight = bbox[3];
  
        const imgWidth = imageRef.current.width;
        const imgHeight = imageRef.current.height;
  
        const x = (oldX * imgWidth) / imgSize.width;
        const y = (oldY * imgHeight) / imgSize.height;
        const width = (oldWidth * imgWidth) / imgSize.width;
        const height = (oldHeight * imgHeight) / imgSize.height;
  
        return { ...prediction, bbox: [x, y, width, height] };
      });
    };

    const loadModel = async () => {
        setIsModelLoading(true)
        try {
            console.log('mobilenet :', mobilenet);
            const model = mobilenet.load();
            console.log('model loadModel :', model);
            setModel(model)
            setIsModelLoading(false)
        } catch (error) {
            console.log('loadModel error :', error);
            setIsModelLoading(false)
        }
    }

    const readImage = (file) => {
      return new Promise((rs, rj) => {
        const fileReader = new FileReader();
        fileReader.onload = () => rs(fileReader.result);
        fileReader.onerror = () => rj(fileReader.error);
        fileReader.readAsDataURL(file);
      });
    };

    const identify = async () => {
      textInputRef.current.value = ''
      // console.log('identify imageRef :', imageRef, model);

      // const results = await model?.classify(imageRef.current)
      // console.log('identify results', results);

      const imgSize = {
        width: "450px",
        height: "300px",
      };

      const model = await cocoSsd.load({});
      console.log('model :', model);
      const predictions = await model.detect(imageRef.current, 6);
      console.log('predictions detect :', predictions);
      const normalizedPredictions = normalizePredictions(predictions, imgSize);
      console.log('normalizedPredictions 2 :', normalizedPredictions);
      const arrayTest = [];
      arrayTest.push(normalizedPredictions);
      setResults(arrayTest)
  }

    const uploadImage = async (e) => {
        const { files } = e.target
        if (files?.length > 0) {
            const url = URL.createObjectURL(files[0])
            setImageURL(url)
        } else {
            setImageURL(null)
        }

        const file = e.target.files[0];
        const imgData = await readImage(file);
        setImgData(imgData);

        const imageElement = document.createElement("img");
        imageElement.src = imgData;

        imageElement.onload = async () => {
          const imgSize = {
            width: imageElement.width,
            height: imageElement.height,
          };
          await identify(imageElement, imgSize);
        };
    }

    

    const handleOnChange = (e) => {
        setImageURL(e.target.value)
        setResults([])
    }

    const triggerUpload = () => {
        fileInputRef.current.click()
    }

    useEffect(() => {
        // loadModel()
    }, [])

    useEffect(() => {
        if (imageURL) {
            setHistory([imageURL, ...history])
        }
    }, [imageURL])

    if (isModelLoading) {
        return <h2>Model Loading...</h2>
    }

    return (
        <div className="App">
            <ObjectDetector/>
            <h1 className='header'>Image Identification</h1>
            <div className='inputHolder'>
                <input type='file' accept='image/*' capture='camera' className='uploadInput' onChange={uploadImage} ref={fileInputRef} />
                <button className='uploadImage' onClick={triggerUpload}>Upload Image</button>
                <span className='or'>OR</span>
                <input type="text" placeholder='Paste image URL' ref={textInputRef} onChange={handleOnChange} />
            </div>
            <div className="mainWrapper">
                <div className="mainContent">
                    <div className="imageHolder">
                        {imageURL && <img src={imageURL} alt="Upload Preview" crossOrigin="anonymous" ref={imageRef} />}
                    </div>
                    {results?.length > 0 ? <div className='resultsHolder'>
                        {results.map((result, index) => {
                          console.log('result : ', result );
                            return (
                                <div className='result' key={result[0]?.score}>
                                    <span className='name'>{result[0]?.class}</span>
                                    <span className='confidence'>Confidence level: {(result[0]?.score * 100).toFixed(2)}% {index === 0 && <span className='bestGuess'>Best Guess</span>}</span>
                                </div>
                            )
                        })}
                    </div> : <h2>Loading</h2>}
                </div>
                {imageURL && <button className='button' onClick={identify}>Identify Image</button>}
            </div>
            {history?.length > 0 && <div className="recentPredictions">
                <h2>Recent Images</h2>
                <div className="recentImages">
                    {history?.map((image, index) => {
                        return (
                            <div className="recentPrediction" key={`${image}${index}`}>
                                <img src={image} alt='Recent Prediction' onClick={() => setImageURL(image)} />
                            </div>
                        )
                    })}
                </div>
            </div>}
        </div>
    );
}

export default App;
