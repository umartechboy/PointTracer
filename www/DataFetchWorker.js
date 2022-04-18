function UInt32ToArray(value) {
    return [(value >> 0) & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
};
function ArrayToFloat(bytes, offset) {  // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = bytes[3 + offset] << 24 | bytes[2 + offset] << 16 | bytes[1 + offset] << 8 | bytes[0 + offset];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
function sleep(milliseconds) {
}


function setupOnMessage() {
    onmessage = function (req) {
        DataSetRequest = req.data;
    }
}
function DataFetchWorkerFunc() {
    var delayInMilliseconds = 100; //1 second
    setTimeout(function () {
        try {
            //log("DataFetchWorkerFunc");
            var errorCalled = false;
            var xhttp = new XMLHttpRequest();
            "withCredentials" in xhttp;
            xhttp.onload = () => {
                var arrayBuffer = xhttp.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    var byteArray = new Uint8Array(arrayBuffer);

                    for (var pi = 0; pi < (byteArray.byteLength - 1) / (4 * 20); pi++) {
                        var qs = new Array(20);
                        for (var vi = 0; vi < 20; vi++) {
                            qs[vi] = ArrayToFloat(byteArray, vi * 4 + pi * (4 * 20));
//                            console.log("q" + vi + " = " + qs[vi]);
                        }
                        postMessage([0, qs]);
                        console.log("Data packet received");
                    }
                    var requestToRefresh = byteArray[byteArray.byteLength] == 1;
                    if (requestToRefresh)
                        postMessage([requestToRefresh, []]);
                    DataSetRequest = null; // we are now sure that the request was served
                    DataFetchWorkerFunc();
                }
            }
            xhttp.onerror = () => {
                if (!errorCalled) {
                    errorCalled = true;
                    console.log("Data Fetch error!");
                    DataFetchWorkerFunc();
                }
            }
            //if (DataSetRequest != null)
                //console.log("Sending: " + DataSetRequest);
            xhttp.open("POST", "http://localhost:8083/getdata?cid=abcd", true);
            xhttp.responseType = "arraybuffer";
            var data = null;
            if (DataSetRequest == null) {

                data = [0, 0, 0, 0];
                //console.log("Sending empty");
            }
            else {
                data = new Array(4 + DataSetRequest.length);
                var lbs = UInt32ToArray(DataSetRequest.length)
                for (var i = 0; i < 4; i++) 
                    data[i] = lbs[i];
                for (var i = 0; i < DataSetRequest.length; i++)
                    data[i + 4] = DataSetRequest[i];
                

                //console.log("data: " + data);
            }
            var myArray = new ArrayBuffer(data.length);
            var longInt8View = new Uint8Array(myArray);
            // generate some data
            for (var i = 0; i < data.length; i++) {
                longInt8View[i] = data[i];
            }

            xhttp.send(myArray);
        }
        catch (error) {
            console.log("Error: " + error);
            setTimeout(function () { DataFetchWorkerFunc(); }, 100); }
        //your code to be executed after 1 second
    }, delayInMilliseconds);
}

const DataWorkerResource = ArrayToFloat.toString() + UInt32ToArray.toString() + setupOnMessage.toString() + DataFetchWorkerFunc.toString() + log.toString() + "var DataSetRequest = null;setupOnMessage(); DataFetchWorkerFunc(); ";
    const DataWorkerResourceURL = URL.createObjectURL(new Blob([DataWorkerResource], { type: "application/javascript" }));