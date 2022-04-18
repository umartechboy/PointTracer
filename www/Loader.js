function Load(script) {
    var xhttp = new XMLHttpRequest();
    "withCredentials" in xhttp;
    xhttp.onload = () => {
        var arrayBuffer = xhttp.responseText; // Note: not oReq.responseText
        console.log("Downloaded: " + xhttp.responseText)
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
    xhttp.open("Get", script, true);
    xhttp.responseType = "arraybuffer";
}