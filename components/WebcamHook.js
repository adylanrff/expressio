import React from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

let interval = null;
const webcamWidth = 500;
const webcamHeight = 500;


export default function WebcamHook() {
    const webcamRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const [img, setImg] = React.useState("")
    const [capturing, setCapturing] = React.useState(false);
    const [faces, setFaces] = React.useState([]);
    const [expressions, setExpressions] = React.useState([]);

    const handleCanvas = React.useCallback(async (webcamCanvas) => {
        try {
            const detections = await faceapi.detectAllFaces(
                webcamCanvas,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();
            const detectionsForSize = faceapi.resizeResults(detections, { width: webcamCanvas.width, height: webcamCanvas.height })
            setFaces(detectionsForSize.map((d) => d.detection.box));
            setExpressions(detectionsForSize.map((d) => d.expressions));

            } catch (e) {
            console.log(e)
        }

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
            const canvas = canvasRef.current;
            const canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
            canvasContext.beginPath();
        },
        [setCapturing]
    );

    React.useEffect(() => {
        const loadModels = () => {
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
                faceapi.nets.faceExpressionNet.loadFromUri("/models"),
            ])
        };

        webcamRef.current && loadModels();
    }, []);

    React.useEffect(() => {
        if (canvasRef !== null) {
            const canvas = canvasRef.current;
            const canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
            canvasContext.beginPath();

            faces.forEach((face) => {
                canvasContext.strokeStyle = '#000000'
                var x = face.x
                var y = face.y
                canvasContext.rect(x, y+50, face.width, face.height)
                canvasContext.stroke();
            })
        }
        console.log(expressions)
    }, [faces, expressions])

    return (
        <>
            <div>
                <div style={styles.webcam}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        width={webcamWidth}
                        height={webcamHeight}
                        style={{
                            width: "100%",
                            objectFit: "fill",
                            position: "absolute"
                        }}
                    />
                    <canvas 
                        ref={canvasRef} 
                        width={webcamWidth}
                        height={webcamHeight}
                        style={styles.canvas} />
                </div>
                <div>
                    {expressions.map((expression, idx) => (
                        <p key={idx}>{getProbableExpresssions(expression)}</p>
                    ))}
                </div>
            </div>

            {capturing ? (
                <button onClick={stop}>Stop Capture</button>
            ) : (
                <button onClick={capture}>Start Capture</button>
            )}
        </>
    )
}

const getProbableExpresssions = (obj) => {
    var result = Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b }, "");
    console.log(result)
    return result;
}

var styles = {
    container: {
        height: "calc(100vh - 50px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around"
    },
    webcam: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    canvas: {
        zIndex: 9999
    }
}