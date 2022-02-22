import React from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

let interval = null;

export default function WebcamHook() {
    const webcamRef = React.useRef(null);

    const [img, setImg] = React.useState("")
    const [capturing, setCapturing] = React.useState(false);
    const [faces, setFaces] = React.useState([]);


    const handleCanvas = React.useCallback(async (canvas) => {
        console.log(canvas);
        try {
            const detections = await faceapi.detectAllFaces(
                canvas,
                new faceapi.TinyFaceDetectorOptions()
              );
        } catch(e) {
            console.log(e)
        }
        
        setFaces(detections.map((d) => Object.values(d.box)));
    }, []);

    const capture = React.useCallback(
        () => {
            interval = setInterval(() => {
                handleCanvas(webcamRef.current.getCanvas());
            }, 50);
            setCapturing(true);
        },
        [webcamRef, setCapturing, handleCanvas]
    );

    const stop = React.useCallback(
        () => {
            clearInterval(interval);
            setCapturing(false);
        },
        [setCapturing]
    );

    React.useEffect(() => {
        const loadModels = () => {
          Promise.all([
            faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          ])
        };
    
        webcamRef.current && loadModels();
      }, []);

    return (
        <>
            <Webcam
                audio={false}
                ref={webcamRef}
            />
            {capturing ? (
                <button onClick={stop}>Stop Capture</button>
            ) : (
                <button onClick={capture}>Start Capture</button>
            )}
        </>
    )
}