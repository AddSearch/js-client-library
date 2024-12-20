import axios from 'axios';
import { AxiosResponse } from 'axios';
import { base64 } from './util';

interface ApiResponse {
  status: number;
  text: string;
}

export interface Document {
  id: string;
  score: number;
  url: string;
  title: string;
  ts: string;
  images: {
    main: string;
    mainB64: string;
    capture: string;
  };
  categories: string[];
  type: string;
  custom_fields: Record<string, string>;
  document_type: string;
  meta_description: string;
  highlight: string;
}

const getHeaders = (sitekey: string, privatekey: string): Record<string, string> => {
  return {
    'Authorization': 'Basic ' + base64(sitekey + ':' + privatekey),
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch document
 */
const getDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  id: string
): Promise<Document> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://${apiHostname}/v2/indices/${sitekey}/documents/${id}`, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          resolve(response.data as Document);
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Add document
 */
const saveDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  document: Document
): Promise<ApiResponse> => {
  const isPut = Boolean(document.id || document.url);

  return new Promise((resolve, reject) => {
    axios({
      url: `https://${apiHostname}/v2/indices/${sitekey}/documents/`,
      method: isPut ? 'put' : 'post',
      headers: getHeaders(sitekey, privatekey),
      data: document
    })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Batch add documents
 */
const saveDocumentsBatch = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  documents: { documents: Document[] }
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'put',
      url: `https://${apiHostname}/v2/indices/${sitekey}/documents:batch`,
      headers: getHeaders(sitekey, privatekey),
      data: documents
    })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Delete document
 */
const deleteDocument = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  id: string
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`https://${apiHostname}/v2/indices/${sitekey}/documents/${id}`, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

/**
 * Batch delete documents
 */
const deleteDocumentsBatch = (
  apiHostname: string,
  sitekey: string,
  privatekey: string,
  batch: { documents: Document[] }
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`https://${apiHostname}/v2/indices/${sitekey}/documents:batch`, {
        headers: getHeaders(sitekey, privatekey),
        data: batch
      })
      .then((response: AxiosResponse) => {
        if (response.status === 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject(new Error(JSON.stringify({ status: response.status, text: response.statusText })));
        }
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 400, text: error as string })));
      });
  });
};

export { getDocument, saveDocument, saveDocumentsBatch, deleteDocument, deleteDocumentsBatch };
