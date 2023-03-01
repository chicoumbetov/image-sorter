import { saveAs } from "file-saver";
import * as pdfjs from "pdfjs-dist";
import React, { useState } from "react";

// pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js";

const PdfToXlsConverter = () => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e: any) => {
    setPdfFile(e.target.files[0]);
  };

  const convertToXls = async () => {
    console.log("pdfFile :", pdfFile);
    const pdfData = await readFile(pdfFile);
    console.log("pdf data: ", pdfData);
    const pdfContent = await extractPdfContent(pdfData);
    console.log("pdfContent: ", pdfContent);
    const xlsContent = await createXlsContent(pdfContent);
    saveAs(new Blob([xlsContent]), "converted.xlsx");
  };

  const readFile = (file: any): Promise<ArrayBuffer> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e?.target?.result);
      reader.readAsArrayBuffer(file);
    });

  const extractPdfContent = async (
    pdfData: ArrayBuffer | Uint8Array
  ): Promise<string> => {
    const pdf = await pdfjs?.getDocument({ data: new Uint8Array(pdfData) })
      .promise;
    let content = "";
    const pages = Array.from({ length: pdf?.numPages }, (_, i) => i + 1);
    const textContentPromises = pages?.map((page) =>
      pdf?.getPage(page).then((p) => p?.getTextContent())
    );
    const textContents = await Promise.all(textContentPromises);
    if (textContents) {
      content =
        textContents.reduce(
          (prev, current) =>
            (prev ?? 0) +
            (current?.items?.map((item: any) => item?.str).join("") ?? ""),
          ""
        ) ?? "";
    }
    return content;
  };

  const createXlsContent = async (pdfContent: any) => {
    // returns the XLS content as a string. The PDF content is split into lines using the split method,
    // and each line is split into cells using the comma delimiter.
    const lines = pdfContent.split("\n");
    console.log("lines :", lines);
    // The header row is added to the beginning of the rows array using the spread operator.
    const header = ["Column 1", "Column 2", "Column 3"];
    const rows: any[] = lines?.map((line: any) => line.split(","));
    const data = [header, ...rows];
    // The XLS content is created by iterating over each row and cell in the data array
    // and concatenating the cells with a tab character and the rows with a newline character.
    let xlsContent = "";
    xlsContent = data.map((row) => row.join("\t")).join("\n");
    console.log("xlsContent :", xlsContent);

    return xlsContent;
  };

  return (
    <div>
      <input
        aria-label="Choose pdf file"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />
      <button onClick={convertToXls}>Convert to XLS</button>
    </div>
  );
};

export default PdfToXlsConverter;
