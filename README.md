# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Run## How to convert PDF to XLS from uploaded file (node for PDF to excel API in JavaScript and PDF.co Web API PDF.co Web API is the Web API with a set of tools for documents manipulation, data conversion, data extraction, splitting and merging of documents. Includes image recognition, built-in OCR, barcode generation and barcode decoders to decode bar codes from scans, pictures and pdf.

[Get Your 60 Day Free Trial](https://bytescout.com/download/web-installer?utm_source=github-readme)
[Explore Documentation](https://bytescout.com/documentation/index.html?utm_source=github-readme)
[Explore Source Code Samples](https://github.com/bytescout/ByteScout-SDK-SourceCode/)
[Sign Up For Online Training](https://academy.bytescout.com/)

## ON-DEMAND REST WEB API

[Get your API key](https://app.pdf.co/signup?utm_source=github-readme)
[Security](https://pdf.co/security)
[Explore Web API Documentation](https://apidocs.pdf.co?utm_source=github-readme)
[Explore Web API Samples](https://github.com/bytescout/ByteScout-SDK-SourceCode/tree/master/PDF.co%20Web%20API)

## VIDEO REVIEW

[https://www.youtube.com/watch?v=NEwNs2b9YN8](https://www.youtube.com/watch?v=NEwNs2b9YN8)

<!-- code block begin -->

##### **app.js:**

```
/*jshint esversion: 6 */

var https = require("https");
var path = require("path");
var fs = require("fs");

// `request` module is required for file upload.
// Use "npm install request" command to install.
var request = require("request");

// The authentication key (API Key).
// Get your own by registering at https://app.pdf.co
const API_KEY = "***********************************";


// Source PDF file
const SourceFile = "./sample.pdf";
// Comma-separated list of page indices (or ranges) to process. Leave empty for all pages. Example: '0,2-5,7-'.
const Pages = "";
// PDF document password. Leave empty for unprotected documents.
const Password = "";
// Destination XLS file name
const DestinationFile = "./result.xls";


// 1. RETRIEVE PRESIGNED URL TO UPLOAD FILE.
getPresignedUrl(API_KEY, SourceFile)
    .then(([uploadUrl, uploadedFileUrl]) => {
        // 2. UPLOAD THE FILE TO CLOUD.
        uploadFile(API_KEY, SourceFile, uploadUrl)
            .then(() => {
                // 3. CONVERT UPLOADED PDF FILE TO XLS
                convertPdfToXls(API_KEY, uploadedFileUrl, Password, Pages, DestinationFile);
            })
            .catch(e => {
                console.log(e);
            });
    })
    .catch(e => {
        console.log(e);
    });


function getPresignedUrl(apiKey, localFile) {
    return new Promise(resolve => {
        // Prepare request to `Get Presigned URL` API endpoint
        let queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(SourceFile)}`;
        let reqOptions = {
            host: "api.pdf.co",
            path: encodeURI(queryPath),
            headers: { "x-api-key": API_KEY }
        };
        // Send request
        https.get(reqOptions, (response) => {
            response.on("data", (d) => {
                let data = JSON.parse(d);
                if (data.error == false) {
                    // Return presigned url we received
                    resolve([data.presignedUrl, data.url]);
                }
                else {
                    // Service reported error
                    console.log("getPresignedUrl(): " + data.message);
                }
            });
        })
            .on("error", (e) => {
                // Request error
                console.log("getPresignedUrl(): " + e);
            });
    });
}

function uploadFile(apiKey, localFile, uploadUrl) {
    return new Promise(resolve => {
        fs.readFile(SourceFile, (err, data) => {
            request({
                method: "PUT",
                url: uploadUrl,
                body: data,
                headers: {
                    "Content-Type": "application/octet-stream"
                }
            }, (err, res, body) => {
                if (!err) {
                    resolve();
                }
                else {
                    console.log("uploadFile() request error: " + e);
                }
            });
        });
    });
}

function convertPdfToXls(apiKey, uploadedFileUrl, password, pages, destinationFile) {
    // Prepare request to `PDF To XLS` API endpoint
    var queryPath = `/v1/pdf/convert/to/xls`;

    // JSON payload for api request
    var jsonPayload = JSON.stringify({
        name: path.basename(destinationFile), password: password, pages: pages, url: uploadedFileUrl
    });

    var reqOptions = {
        host: "api.pdf.co",
        method: "POST",
        path: queryPath,
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(jsonPayload, 'utf8')
        }
    };
    // Send request
    var postRequest = https.request(reqOptions, (response) => {
        response.on("data", (d) => {
            response.setEncoding("utf8");
            // Parse JSON response
            let data = JSON.parse(d);
            if (data.error == false) {
                // Download XLS file
                var file = fs.createWriteStream(destinationFile);
                https.get(data.url, (response2) => {
                    response2.pipe(file)
                        .on("close", () => {
                            console.log(`Generated XLS file saved as "${destinationFile}" file.`);
                        });
                });
            }
            else {
                // Service reported error
                console.log("readBarcodes(): " + data.message);
            }
        });
    })
        .on("error", (e) => {
            // Request error
            console.log("readBarcodes(): " + e);
        });
}

// Write request data
postRequest.write(jsonPayload);
postRequest.end();
```

<!-- code block end -->

<!-- code block begin -->

##### **package.json:**

```
{
  "name": "test",
  "version": "1.0.0",
  "description": "PDF.co",
  "main": "app.js",
  "scripts": {
  },
  "keywords": [
    "pdf.co",
    "web",
    "api",
    "bytescout",
    "api"
  ],
  "author": "ByteScout & PDF.co",
  "license": "ISC",
  "dependencies": {
    "request": "^2.88.2"
  }
}

```

<!-- code block end -->
